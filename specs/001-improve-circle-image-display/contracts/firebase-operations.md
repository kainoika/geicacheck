# Firebase Operations Contract: サークル画像管理

**Feature**: 001-improve-circle-image-display
**Date**: 2026-01-24

## 概要

このドキュメントは、サークル詳細ページの画像表示改善機能で使用するFirebase操作の契約を定義します。Firebase Firestore と Firebase Storage の操作インターフェースを明確化します。

## 1. お品書き画像のアップロード

### 操作概要

複数のお品書き画像（最大4枚）をFirebase Storageにアップロードし、Firestoreのサークルドキュメントを更新します。

### Input

```typescript
interface UploadMenuImagesInput {
  circleId: string;          // サークルID
  eventId: string;           // イベントID
  files: File[];             // アップロードする画像ファイル（最大4枚）
  existingImages: MenuImage[]; // 既存の画像配列
}
```

### 制約

- `files.length + existingImages.length <= 4` (合計4枚まで)
- 各ファイルサイズ: `<= 10MB`
- ファイルタイプ: `image/*` (JPEG, PNG, GIF, WebP)
- ユーザーは認証済みで、サークルの編集権限を保持している必要がある

### Process

1. **バリデーション**
   ```typescript
   // 枚数チェック
   if (files.length + existingImages.length > 4) {
     throw new Error('お品書きは最大4枚までです');
   }

   // ファイルサイズチェック
   for (const file of files) {
     if (file.size > 10 * 1024 * 1024) {
       throw new Error(`${file.name}のサイズが10MBを超えています`);
     }
   }

   // ファイルタイプチェック
   for (const file of files) {
     if (!file.type.startsWith('image/')) {
       throw new Error(`${file.name}は画像ファイルではありません`);
     }
   }
   ```

2. **Firebase Storageへのアップロード**
   ```typescript
   const uploadedImages: MenuImage[] = [];

   for (let i = 0; i < files.length; i++) {
     const file = files[i];
     const imageId = `menu_${Date.now()}_${i}`;
     const fileName = `${imageId}_${file.name}`;
     const storagePath = `circle-images/${eventId}/${circleId}/menu/${fileName}`;

     // Storage参照を取得
     const storageRef = ref(storage, storagePath);

     // アップロード（プログレス監視付き）
     const uploadTask = uploadBytesResumable(storageRef, file);

     await new Promise((resolve, reject) => {
       uploadTask.on('state_changed',
         (snapshot) => {
           const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
           onProgress?.(i, progress);
         },
         (error) => reject(error),
         async () => {
           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

           uploadedImages.push({
             id: imageId,
             url: downloadURL,
             order: existingImages.length + i,
             uploadedAt: new Date(),
             fileSize: file.size,
             fileName: file.name
           });

           resolve(null);
         }
       );
     });
   }
   ```

3. **Firestoreの更新**
   ```typescript
   const updatedMenuImages = [...existingImages, ...uploadedImages];

   await updateDoc(doc(firestore, `events/${eventId}/circles/${circleId}`), {
     menuImages: updatedMenuImages,
     updatedAt: serverTimestamp()
   });
   ```

4. **エラーハンドリング（ロールバック）**
   ```typescript
   // アップロード途中でエラーが発生した場合、既にアップロードした画像を削除
   if (error) {
     for (const image of uploadedImages) {
       const storageRef = ref(storage, image.url);
       await deleteObject(storageRef).catch(console.error);
     }
     throw error;
   }
   ```

### Output

```typescript
interface UploadMenuImagesOutput {
  success: boolean;
  menuImages: MenuImage[];   // 更新後の全お品書き画像配列
  uploadedCount: number;     // 今回アップロードした枚数
}
```

### Error Cases

| エラーコード | 説明 | HTTPステータス相当 |
|-------------|------|-------------------|
| `PERMISSION_DENIED` | 編集権限なし | 403 |
| `MAX_IMAGES_EXCEEDED` | 4枚を超える | 400 |
| `FILE_TOO_LARGE` | ファイルサイズが10MB超過 | 413 |
| `INVALID_FILE_TYPE` | 画像形式以外 | 400 |
| `STORAGE_ERROR` | Storageアップロード失敗 | 500 |
| `FIRESTORE_ERROR` | Firestore更新失敗 | 500 |

## 2. お品書き画像の削除

### 操作概要

指定したお品書き画像をFirebase Storageから削除し、Firestoreのサークルドキュメントから削除します。

### Input

```typescript
interface DeleteMenuImageInput {
  circleId: string;    // サークルID
  eventId: string;     // イベントID
  imageId: string;     // 削除する画像のID
  menuImages: MenuImage[]; // 現在のお品書き画像配列
}
```

### 制約

- ユーザーは認証済みで、サークルの編集権限を保持している必要がある
- `imageId`は`menuImages`配列内に存在する必要がある

### Process

1. **バリデーション**
   ```typescript
   const imageToDelete = menuImages.find(img => img.id === imageId);
   if (!imageToDelete) {
     throw new Error('指定された画像が見つかりません');
   }
   ```

2. **Firebase Storageから削除**
   ```typescript
   const storageRef = ref(storage, imageToDelete.url);
   await deleteObject(storageRef);
   ```

3. **Firestoreの更新（順序の詰め直し）**
   ```typescript
   // 削除後の配列を作成し、順序を詰め直す
   const updatedMenuImages = menuImages
     .filter(img => img.id !== imageId)
     .map((img, index) => ({
       ...img,
       order: index  // 順序を0から振り直し
     }));

   await updateDoc(doc(firestore, `events/${eventId}/circles/${circleId}`), {
     menuImages: updatedMenuImages,
     updatedAt: serverTimestamp()
   });
   ```

### Output

```typescript
interface DeleteMenuImageOutput {
  success: boolean;
  menuImages: MenuImage[];  // 更新後のお品書き画像配列
  deletedImageId: string;   // 削除した画像のID
}
```

### Error Cases

| エラーコード | 説明 | HTTPステータス相当 |
|-------------|------|-------------------|
| `PERMISSION_DENIED` | 編集権限なし | 403 |
| `IMAGE_NOT_FOUND` | 指定されたimageIdが存在しない | 404 |
| `STORAGE_ERROR` | Storage削除失敗 | 500 |
| `FIRESTORE_ERROR` | Firestore更新失敗 | 500 |

## 3. お品書き画像の順序変更

### 操作概要

お品書き画像の表示順序を変更します。Firestore のみを更新します（Storageは変更不要）。

### Input

```typescript
interface ReorderMenuImagesInput {
  circleId: string;         // サークルID
  eventId: string;          // イベントID
  imageId: string;          // 移動する画像のID
  newOrder: number;         // 新しい順序（0-3）
  menuImages: MenuImage[];  // 現在のお品書き画像配列
}
```

### 制約

- ユーザーは認証済みで、サークルの編集権限を保持している必要がある
- `newOrder`は`0 <= newOrder < menuImages.length`
- `imageId`は`menuImages`配列内に存在する必要がある

### Process

1. **バリデーション**
   ```typescript
   const imageToMove = menuImages.find(img => img.id === imageId);
   if (!imageToMove) {
     throw new Error('指定された画像が見つかりません');
   }

   if (newOrder < 0 || newOrder >= menuImages.length) {
     throw new Error('無効な順序が指定されました');
   }
   ```

2. **順序の再計算**
   ```typescript
   const currentOrder = imageToMove.order;

   // 配列から対象画像を削除
   const withoutTarget = menuImages.filter(img => img.id !== imageId);

   // 新しい位置に挿入
   withoutTarget.splice(newOrder, 0, imageToMove);

   // 順序を振り直し
   const reorderedImages = withoutTarget.map((img, index) => ({
     ...img,
     order: index
   }));
   ```

3. **Firestoreの更新**
   ```typescript
   await updateDoc(doc(firestore, `events/${eventId}/circles/${circleId}`), {
     menuImages: reorderedImages,
     updatedAt: serverTimestamp()
   });
   ```

### Output

```typescript
interface ReorderMenuImagesOutput {
  success: boolean;
  menuImages: MenuImage[];  // 更新後のお品書き画像配列
}
```

### Error Cases

| エラーコード | 説明 | HTTPステータス相当 |
|-------------|------|-------------------|
| `PERMISSION_DENIED` | 編集権限なし | 403 |
| `IMAGE_NOT_FOUND` | 指定されたimageIdが存在しない | 404 |
| `INVALID_ORDER` | 無効な順序が指定された | 400 |
| `FIRESTORE_ERROR` | Firestore更新失敗 | 500 |

## 4. サークル画像の取得（既存機能の確認）

### 操作概要

サークル詳細情報を取得します。`menuImages`配列も含まれます。

### Input

```typescript
interface GetCircleInput {
  circleId: string;  // サークルID
  eventId: string;   // イベントID
}
```

### Process

```typescript
const circleDoc = await getDoc(doc(firestore, `events/${eventId}/circles/${circleId}`));

if (!circleDoc.exists()) {
  throw new Error('サークルが見つかりません');
}

const circleData = circleDoc.data() as Circle;

// menuImages配列を順序でソート
if (circleData.menuImages) {
  circleData.menuImages.sort((a, b) => a.order - b.order);
}
```

### Output

```typescript
interface GetCircleOutput {
  success: boolean;
  circle: Circle;  // menuImages含む
}
```

## 5. Composable実装例

### `useCircleImages.ts`

```typescript
import { ref, computed } from 'vue';
import { useNuxtApp } from '#app';
import { useLogger } from './useLogger';
import type { MenuImage } from '~/types';

export function useCircleImages() {
  const { $storage, $firestore } = useNuxtApp();
  const logger = useLogger('useCircleImages');

  const uploading = ref(false);
  const uploadProgress = ref<number[]>([]);
  const error = ref<string | null>(null);

  /**
   * 複数のお品書き画像をアップロード
   */
  const uploadMenuImages = async (
    circleId: string,
    eventId: string,
    files: File[],
    existingImages: MenuImage[]
  ): Promise<MenuImage[]> => {
    logger.info('アップロード開始', { circleId, fileCount: files.length });

    // バリデーション
    if (files.length + existingImages.length > 4) {
      const message = 'お品書きは最大4枚までです';
      logger.warn(message);
      throw new Error(message);
    }

    uploading.value = true;
    uploadProgress.value = new Array(files.length).fill(0);
    error.value = null;

    const uploadedImages: MenuImage[] = [];

    try {
      // 並列アップロード
      await Promise.all(files.map(async (file, index) => {
        // ファイルバリデーション
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name}のサイズが10MBを超えています`);
        }
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name}は画像ファイルではありません`);
        }

        // アップロード処理
        const imageId = `menu_${Date.now()}_${index}`;
        const fileName = `${imageId}_${file.name}`;
        const storagePath = `circle-images/${eventId}/${circleId}/menu/${fileName}`;

        const storageRef = ref($storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              uploadProgress.value[index] = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            (err) => reject(err),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              uploadedImages.push({
                id: imageId,
                url: downloadURL,
                order: existingImages.length + index,
                uploadedAt: new Date(),
                fileSize: file.size,
                fileName: file.name
              });

              resolve();
            }
          );
        });
      }));

      // Firestore更新
      const updatedMenuImages = [...existingImages, ...uploadedImages];
      await updateDoc(doc($firestore, `events/${eventId}/circles/${circleId}`), {
        menuImages: updatedMenuImages,
        updatedAt: serverTimestamp()
      });

      logger.info('アップロード成功', { uploadedCount: uploadedImages.length });
      return updatedMenuImages;

    } catch (err) {
      logger.error('アップロード失敗', err);
      error.value = err.message || 'アップロードに失敗しました';

      // ロールバック: アップロードした画像を削除
      for (const image of uploadedImages) {
        const storageRef = ref($storage, image.url);
        await deleteObject(storageRef).catch((e) => logger.warn('ロールバック失敗', e));
      }

      throw err;

    } finally {
      uploading.value = false;
    }
  };

  /**
   * お品書き画像を削除
   */
  const deleteMenuImage = async (
    circleId: string,
    eventId: string,
    imageId: string,
    menuImages: MenuImage[]
  ): Promise<MenuImage[]> => {
    logger.info('画像削除開始', { circleId, imageId });

    const imageToDelete = menuImages.find(img => img.id === imageId);
    if (!imageToDelete) {
      throw new Error('指定された画像が見つかりません');
    }

    try {
      // Storage削除
      const storageRef = ref($storage, imageToDelete.url);
      await deleteObject(storageRef);

      // Firestore更新（順序詰め直し）
      const updatedMenuImages = menuImages
        .filter(img => img.id !== imageId)
        .map((img, index) => ({ ...img, order: index }));

      await updateDoc(doc($firestore, `events/${eventId}/circles/${circleId}`), {
        menuImages: updatedMenuImages,
        updatedAt: serverTimestamp()
      });

      logger.info('画像削除成功', { imageId });
      return updatedMenuImages;

    } catch (err) {
      logger.error('画像削除失敗', err);
      throw err;
    }
  };

  /**
   * お品書き画像の順序を変更
   */
  const reorderMenuImages = async (
    circleId: string,
    eventId: string,
    imageId: string,
    newOrder: number,
    menuImages: MenuImage[]
  ): Promise<MenuImage[]> => {
    logger.info('画像順序変更開始', { circleId, imageId, newOrder });

    const imageToMove = menuImages.find(img => img.id === imageId);
    if (!imageToMove) {
      throw new Error('指定された画像が見つかりません');
    }

    if (newOrder < 0 || newOrder >= menuImages.length) {
      throw new Error('無効な順序が指定されました');
    }

    try {
      // 順序再計算
      const withoutTarget = menuImages.filter(img => img.id !== imageId);
      withoutTarget.splice(newOrder, 0, imageToMove);
      const reorderedImages = withoutTarget.map((img, index) => ({
        ...img,
        order: index
      }));

      // Firestore更新
      await updateDoc(doc($firestore, `events/${eventId}/circles/${circleId}`), {
        menuImages: reorderedImages,
        updatedAt: serverTimestamp()
      });

      logger.info('画像順序変更成功');
      return reorderedImages;

    } catch (err) {
      logger.error('画像順序変更失敗', err);
      throw err;
    }
  };

  return {
    uploading: computed(() => uploading.value),
    uploadProgress: computed(() => uploadProgress.value),
    error: computed(() => error.value),
    uploadMenuImages,
    deleteMenuImage,
    reorderMenuImages
  };
}
```

## まとめ

このドキュメントでは、以下のFirebase操作契約を定義しました：

1. **お品書き画像のアップロード**: 複数画像の並列アップロードとロールバック処理
2. **お品書き画像の削除**: Storage削除とFirestore更新、順序の詰め直し
3. **お品書き画像の順序変更**: Firestore のみの更新、順序再計算
4. **サークル画像の取得**: 既存機能の確認
5. **Composable実装例**: `useCircleImages()`の実装サンプル

これらの契約に基づいて、実装フェーズで具体的なコードを作成します。
