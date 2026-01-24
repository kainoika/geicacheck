/**
 * 画像カルーセルcomposable
 * 複数画像のスライド表示機能
 */

import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { MenuImage } from '~/types';

/**
 * 画像カルーセルcomposable
 *
 * @param images - 表示する画像配列
 * @returns カルーセル操作関数
 *
 * @example
 * ```typescript
 * const { currentIndex, currentImage, next, prev, goTo, hasMultiple, totalCount } = useImageCarousel(menuImages);
 *
 * // 次の画像へ
 * next();
 *
 * // 前の画像へ
 * prev();
 *
 * // 特定の画像へ
 * goTo(2);
 * ```
 */
export function useImageCarousel(images: Ref<MenuImage[]> | MenuImage[]) {
  const imageList = ref(Array.isArray(images) ? images : images.value) as Ref<MenuImage[]>;

  const currentIndex = ref(0);

  /**
   * 現在表示している画像
   *
   * @returns 現在のインデックスの画像オブジェクト、または画像がない場合null
   */
  const currentImage = computed(() => {
    if (imageList.value.length === 0) {
      return null;
    }
    return imageList.value[currentIndex.value] || null;
  });

  /**
   * 複数枚あるかどうか
   *
   * @returns 画像が2枚以上ある場合true、1枚以下の場合false
   */
  const hasMultiple = computed(() => {
    return imageList.value.length > 1;
  });

  /**
   * 総画像数
   *
   * @returns 画像配列の総数
   */
  const totalCount = computed(() => {
    return imageList.value.length;
  });

  /**
   * 次の画像へ移動
   *
   * 最後の画像の場合、最初の画像に戻ります（循環）。
   * 画像が1枚以下の場合は何もしません。
   */
  const next = () => {
    if (imageList.value.length <= 1) {
      return;
    }

    currentIndex.value = (currentIndex.value + 1) % imageList.value.length;
  };

  /**
   * 前の画像へ移動
   *
   * 最初の画像の場合、最後の画像に移動します（循環）。
   * 画像が1枚以下の場合は何もしません。
   */
  const prev = () => {
    if (imageList.value.length <= 1) {
      return;
    }

    currentIndex.value =
      currentIndex.value === 0 ? imageList.value.length - 1 : currentIndex.value - 1;
  };

  /**
   * 指定したインデックスへ移動
   *
   * インデックスが範囲外の場合、自動的に最小値（0）または最大値（length-1）に調整されます。
   *
   * @param index - 移動先のインデックス（0から始まる）
   */
  const goTo = (index: number) => {
    if (imageList.value.length === 0) {
      currentIndex.value = 0;
      return;
    }

    // 範囲チェック
    if (index < 0) {
      currentIndex.value = 0;
    } else if (index >= imageList.value.length) {
      currentIndex.value = imageList.value.length - 1;
    } else {
      currentIndex.value = index;
    }
  };

  return {
    currentIndex,
    currentImage,
    hasMultiple,
    totalCount,
    next,
    prev,
    goTo,
  };
}
