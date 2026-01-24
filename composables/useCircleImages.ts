/**
 * サークル画像管理composable
 * お品書き画像の複数枚アップロード・削除・順序変更機能
 */

import { ref } from 'vue';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { MenuImage } from '~/types';
import { validateImageFile, generateImageId, reorderMenuImages as reorderUtil } from '~/utils/imageUtils';

/**
 * サークル画像管理composable
 *
 * @returns お品書き画像の管理関数
 *
 * @example
 * ```typescript
 * const { uploadMenuImages, deleteMenuImage, reorderMenuImages, uploading, uploadProgress } = useCircleImages();
 *
 * // 画像アップロード
 * const newImages = await uploadMenuImages(circleId, eventId, files, existingImages);
 *
 * // 画像削除
 * const updatedImages = await deleteMenuImage(circleId, eventId, imageId, menuImages);
 *
 * // 順序変更
 * const reorderedImages = await reorderMenuImages(circleId, eventId, imageId, newOrder, menuImages);
 * ```
 */
export function useCircleImages() {
  const { $storage, $firestore } = useNuxtApp();
  const logger = useLogger('useCircleImages');

  const uploading = ref(false);
  const uploadProgress = ref<number[]>([]);

  /**
   * お品書き画像を複数アップロード
   *
   * @param circleId - サークルID
   * @param eventId - イベントID
   * @param files - アップロードする画像ファイルの配列
   * @param existingImages - 既存の画像配列
   * @returns 更新後のMenuImage配列（既存 + 新規）
   * @throws {Error} 画像が4枚を超える場合、またはファイルバリデーションに失敗した場合
   */
  const uploadMenuImages = async (
    circleId: string,
    eventId: string,
    files: File[],
    existingImages: MenuImage[]
  ): Promise<MenuImage[]> => {
    // バリデーション: 最大4枚チェック
    if (files.length + existingImages.length > 4) {
      throw new Error('お品書きは最大4枚までです');
    }

    // ファイルごとのバリデーション
    for (const file of files) {
      const result = validateImageFile(file, 10);
      if (!result.valid) {
        throw new Error(result.error);
      }
    }

    uploading.value = true;
    uploadProgress.value = new Array(files.length).fill(0);

    const uploadedImages: MenuImage[] = [];

    try {
      // 並列アップロード
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageId = generateImageId();
        const fileName = `${imageId}_${file.name}`;
        const storagePath = `circle-images/${eventId}/${circleId}/menu/${fileName}`;

        logger.info('画像アップロード開始', { imageId, fileName, size: file.size });

        const imageRef = storageRef($storage, storagePath);
        const uploadTask = uploadBytesResumable(imageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              uploadProgress.value[i] = progress;
            },
            (error) => {
              logger.error('アップロードエラー', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              uploadedImages.push({
                id: imageId,
                url: downloadURL,
                order: existingImages.length + i,
                uploadedAt: new Date(),
                fileSize: file.size,
                fileName: file.name,
              });

              logger.info('画像アップロード完了', { imageId, url: downloadURL });
              resolve();
            }
          );
        });
      }

      // Firestoreを更新
      const updatedMenuImages = [...existingImages, ...uploadedImages];

      await updateDoc(doc($firestore, `events/${eventId}/circles/${circleId}`), {
        menuImages: updatedMenuImages,
        updatedAt: serverTimestamp(),
      });

      logger.info('Firestore更新完了', { totalImages: updatedMenuImages.length });

      return updatedMenuImages;
    } catch (error) {
      // ロールバック: アップロード済み画像を削除
      logger.error('アップロード失敗、ロールバック開始', error);

      for (const image of uploadedImages) {
        try {
          const imageRef = storageRef($storage, image.url);
          await deleteObject(imageRef);
          logger.info('ロールバック: 画像削除', { imageId: image.id });
        } catch (rollbackError) {
          logger.warn('ロールバック失敗', rollbackError);
        }
      }

      throw error;
    } finally {
      uploading.value = false;
      uploadProgress.value = [];
    }
  };

  /**
   * お品書き画像を削除
   *
   * Firebase Storageから画像を削除し、Firestoreの配列を更新します。
   * 削除後、残りの画像の順序を自動的に詰め直します。
   *
   * @param circleId - サークルID
   * @param eventId - イベントID
   * @param imageId - 削除する画像のID
   * @param menuImages - 現在の画像配列
   * @returns 更新後のMenuImage配列（削除済み、順序再計算済み）
   * @throws {Error} 指定されたimageIdが見つからない場合
   */
  const deleteMenuImage = async (
    circleId: string,
    eventId: string,
    imageId: string,
    menuImages: MenuImage[]
  ): Promise<MenuImage[]> => {
    const imageToDelete = menuImages.find((img) => img.id === imageId);
    if (!imageToDelete) {
      throw new Error('指定された画像が見つかりません');
    }

    logger.info('画像削除開始', { imageId });

    // Storageから削除
    const imageRef = storageRef($storage, imageToDelete.url);
    await deleteObject(imageRef);

    logger.info('Storage削除完了', { imageId });

    // 削除後の配列を作成し、順序を詰め直す
    const updatedMenuImages = menuImages
      .filter((img) => img.id !== imageId)
      .map((img, index) => ({
        ...img,
        order: index,
      }));

    // Firestoreを更新
    await updateDoc(doc($firestore, `events/${eventId}/circles/${circleId}`), {
      menuImages: updatedMenuImages,
      updatedAt: serverTimestamp(),
    });

    logger.info('Firestore更新完了（削除）', { remainingImages: updatedMenuImages.length });

    return updatedMenuImages;
  };

  /**
   * お品書き画像の順序を変更
   *
   * 指定した画像を新しい位置に移動し、他の画像の順序を自動調整します。
   *
   * @param circleId - サークルID
   * @param eventId - イベントID
   * @param imageId - 移動する画像のID
   * @param newOrder - 新しい順序（0から始まるインデックス）
   * @param menuImages - 現在の画像配列
   * @returns 更新後のMenuImage配列（順序再計算済み）
   * @throws {Error} 指定されたimageIdが見つからない場合、または順序が範囲外の場合
   */
  const reorderMenuImages = async (
    circleId: string,
    eventId: string,
    imageId: string,
    newOrder: number,
    menuImages: MenuImage[]
  ): Promise<MenuImage[]> => {
    const imageToMove = menuImages.find((img) => img.id === imageId);
    if (!imageToMove) {
      throw new Error('指定された画像が見つかりません');
    }

    if (newOrder < 0 || newOrder >= menuImages.length) {
      throw new Error('順序が範囲外です');
    }

    logger.info('順序変更開始', { imageId, newOrder });

    // 現在の順序から画像を取り出し
    const currentOrder = imageToMove.order;
    const reordered = [...menuImages];

    // 配列から削除
    reordered.splice(currentOrder, 1);
    // 新しい位置に挿入
    reordered.splice(newOrder, 0, imageToMove);

    // 順序を再計算
    const updatedMenuImages = reordered.map((img, index) => ({
      ...img,
      order: index,
    }));

    // Firestoreを更新
    await updateDoc(doc($firestore, `events/${eventId}/circles/${circleId}`), {
      menuImages: updatedMenuImages,
      updatedAt: serverTimestamp(),
    });

    logger.info('Firestore更新完了（順序変更）');

    return updatedMenuImages;
  };

  return {
    uploading,
    uploadProgress,
    uploadMenuImages,
    deleteMenuImage,
    reorderMenuImages,
  };
}
