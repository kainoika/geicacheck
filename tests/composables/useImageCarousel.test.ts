/**
 * useImageCarousel composable のテスト
 * TDD: このテストを先に書き、実装はT023で行う
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { MenuImage } from '~/types';

describe('useImageCarousel', () => {
  let useImageCarousel: any;

  beforeEach(async () => {
    // composableを動的にインポート
    const module = await import('~/composables/useImageCarousel');
    useImageCarousel = module.useImageCarousel;
  });

  const createTestImages = (count: number): MenuImage[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `menu_${i}`,
      url: `https://example.com/image${i}.jpg`,
      order: i,
      uploadedAt: new Date(),
    }));
  };

  describe('初期化', () => {
    it('初期インデックスが0である', () => {
      const images = createTestImages(3);
      const { currentIndex } = useImageCarousel(images);

      expect(currentIndex.value).toBe(0);
    });

    it('空配列の場合、currentIndexが0である', () => {
      const { currentIndex } = useImageCarousel([]);

      expect(currentIndex.value).toBe(0);
    });

    it('初期画像が正しく設定される', () => {
      const images = createTestImages(3);
      const { currentImage } = useImageCarousel(images);

      expect(currentImage.value).toEqual(images[0]);
    });
  });

  describe('next', () => {
    it('次の画像に移動できる', () => {
      const images = createTestImages(3);
      const { currentIndex, next } = useImageCarousel(images);

      next();
      expect(currentIndex.value).toBe(1);
    });

    it('最後の画像から次へ移動すると最初に戻る（ループ）', () => {
      const images = createTestImages(3);
      const { currentIndex, next, goTo } = useImageCarousel(images);

      goTo(2); // 最後の画像へ
      next();
      expect(currentIndex.value).toBe(0); // 最初に戻る
    });

    it('画像が1枚の場合、nextしても変化しない', () => {
      const images = createTestImages(1);
      const { currentIndex, next } = useImageCarousel(images);

      next();
      expect(currentIndex.value).toBe(0);
    });

    it('画像がない場合、nextしても変化しない', () => {
      const { currentIndex, next } = useImageCarousel([]);

      next();
      expect(currentIndex.value).toBe(0);
    });
  });

  describe('prev', () => {
    it('前の画像に移動できる', () => {
      const images = createTestImages(3);
      const { currentIndex, prev, goTo } = useImageCarousel(images);

      goTo(2);
      prev();
      expect(currentIndex.value).toBe(1);
    });

    it('最初の画像から前へ移動すると最後に戻る（ループ）', () => {
      const images = createTestImages(3);
      const { currentIndex, prev } = useImageCarousel(images);

      prev();
      expect(currentIndex.value).toBe(2); // 最後に戻る
    });

    it('画像が1枚の場合、prevしても変化しない', () => {
      const images = createTestImages(1);
      const { currentIndex, prev } = useImageCarousel(images);

      prev();
      expect(currentIndex.value).toBe(0);
    });

    it('画像がない場合、prevしても変化しない', () => {
      const { currentIndex, prev } = useImageCarousel([]);

      prev();
      expect(currentIndex.value).toBe(0);
    });
  });

  describe('goTo', () => {
    it('指定したインデックスに移動できる', () => {
      const images = createTestImages(4);
      const { currentIndex, goTo } = useImageCarousel(images);

      goTo(2);
      expect(currentIndex.value).toBe(2);
    });

    it('負のインデックスは0に丸める', () => {
      const images = createTestImages(3);
      const { currentIndex, goTo } = useImageCarousel(images);

      goTo(-1);
      expect(currentIndex.value).toBe(0);
    });

    it('範囲外のインデックスは最大値に丸める', () => {
      const images = createTestImages(3);
      const { currentIndex, goTo } = useImageCarousel(images);

      goTo(10);
      expect(currentIndex.value).toBe(2); // 最大インデックス
    });
  });

  describe('currentImage', () => {
    it('現在のインデックスの画像を返す', () => {
      const images = createTestImages(3);
      const { currentImage, goTo } = useImageCarousel(images);

      goTo(1);
      expect(currentImage.value).toEqual(images[1]);
    });

    it('画像がない場合、nullを返す', () => {
      const { currentImage } = useImageCarousel([]);

      expect(currentImage.value).toBeNull();
    });
  });

  describe('hasMultiple', () => {
    it('画像が2枚以上の場合、trueを返す', () => {
      const images = createTestImages(2);
      const { hasMultiple } = useImageCarousel(images);

      expect(hasMultiple.value).toBe(true);
    });

    it('画像が1枚の場合、falseを返す', () => {
      const images = createTestImages(1);
      const { hasMultiple } = useImageCarousel(images);

      expect(hasMultiple.value).toBe(false);
    });

    it('画像がない場合、falseを返す', () => {
      const { hasMultiple } = useImageCarousel([]);

      expect(hasMultiple.value).toBe(false);
    });
  });

  describe('totalCount', () => {
    it('総画像数を返す', () => {
      const images = createTestImages(3);
      const { totalCount } = useImageCarousel(images);

      expect(totalCount.value).toBe(3);
    });

    it('画像がない場合、0を返す', () => {
      const { totalCount } = useImageCarousel([]);

      expect(totalCount.value).toBe(0);
    });
  });

  describe('リアクティブな画像配列の変更', () => {
    it('画像配列が変更されたら、currentIndexが範囲内に収まる', () => {
      const images = createTestImages(5);
      const { currentIndex, goTo } = useImageCarousel(images);

      goTo(4); // 最後の画像へ
      expect(currentIndex.value).toBe(4);

      // 画像配列を2枚に減らしたと仮定（実際のテストではrefを監視）
      // この動作は実装時に確認
    });
  });
});
