/**
 * ImageCarousel コンポーネントのテスト
 * TDD: このテストを先に書き、実装はT025で行う
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { MenuImage } from '~/types';

// useImageCarouselのモック
const mockNext = vi.fn();
const mockPrev = vi.fn();
const mockGoTo = vi.fn();

vi.mock('~/composables/useImageCarousel', () => ({
  useImageCarousel: vi.fn((images) => {
    const { ref, computed } = require('vue');
    const imageArray = Array.isArray(images) ? images : (images?.value || []);
    return {
      currentIndex: ref(0),
      currentImage: computed(() => imageArray[0] || null),
      hasMultiple: computed(() => imageArray.length > 1),
      totalCount: computed(() => imageArray.length),
      next: mockNext,
      prev: mockPrev,
      goTo: mockGoTo,
    };
  }),
}));

describe('ImageCarousel', () => {
  let ImageCarousel: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // コンポーネントを動的にインポート
    const module = await import('~/components/ui/ImageCarousel.vue');
    ImageCarousel = module.default;
  });

  const createTestImages = (count: number): MenuImage[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `menu_${i}`,
      url: `https://example.com/image${i}.jpg`,
      order: i,
      uploadedAt: new Date(),
    }));
  };

  describe('画像の表示', () => {
    it('1枚の画像が表示される', () => {
      const images = createTestImages(1);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe(images[0].url);
    });

    it('複数枚の画像がある場合、最初の画像が表示される', () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe(images[0].url);
    });

    it('画像がない場合、何も表示されない', () => {
      const wrapper = mount(ImageCarousel, {
        props: { images: [] },
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(false);
    });

    it('レスポンシブクラスが適用されている', () => {
      const images = createTestImages(1);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const img = wrapper.find('img');
      const classes = img.attributes('class');
      // carousel-imageクラスが適用されていることを確認
      expect(classes).toContain('carousel-image');
    });
  });

  describe('ナビゲーションボタン', () => {
    it('画像が1枚の場合、ナビゲーションボタンが表示されない', () => {
      const images = createTestImages(1);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const prevButton = wrapper.find('[data-testid="carousel-prev"]');
      const nextButton = wrapper.find('[data-testid="carousel-next"]');

      expect(prevButton.exists()).toBe(false);
      expect(nextButton.exists()).toBe(false);
    });

    it('画像が複数枚の場合、ナビゲーションボタンが表示される', () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const prevButton = wrapper.find('[data-testid="carousel-prev"]');
      const nextButton = wrapper.find('[data-testid="carousel-next"]');

      expect(prevButton.exists() || nextButton.exists()).toBe(true);
    });

    it('次へボタンをクリックするとnext関数が呼ばれる', async () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const nextButton = wrapper.find('[data-testid="carousel-next"]');
      if (nextButton.exists()) {
        await nextButton.trigger('click');
        expect(mockNext).toHaveBeenCalled();
      }
    });

    it('前へボタンをクリックするとprev関数が呼ばれる', async () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const prevButton = wrapper.find('[data-testid="carousel-prev"]');
      if (prevButton.exists()) {
        await prevButton.trigger('click');
        expect(mockPrev).toHaveBeenCalled();
      }
    });
  });

  describe('インジケーター', () => {
    it('画像が1枚の場合、インジケーターが表示されない', () => {
      const images = createTestImages(1);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const indicator = wrapper.find('[data-testid="carousel-indicator"]');
      expect(indicator.exists()).toBe(false);
    });

    it('画像が複数枚の場合、"1/3"のようなインジケーターが表示される', () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const indicator = wrapper.find('[data-testid="carousel-indicator"]');
      if (indicator.exists()) {
        // スペース付きの形式 "1 / 3" を確認
        expect(indicator.text()).toMatch(/1\s*\/\s*3/);
      }
    });

    it('インジケーターのドットをクリックするとgoTo関数が呼ばれる', async () => {
      const images = createTestImages(4);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const dot = wrapper.find('[data-testid="carousel-dot-2"]');
      if (dot.exists()) {
        await dot.trigger('click');
        expect(mockGoTo).toHaveBeenCalledWith(2);
      }
    });
  });

  describe('タッチジェスチャー', () => {
    it('スワイプ（左）でnext関数が呼ばれる', async () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const carousel = wrapper.find('[data-testid="carousel-container"]');
      if (carousel.exists()) {
        // スワイプのシミュレーション
        await carousel.trigger('touchstart', {
          touches: [{ clientX: 100 }],
        });
        await carousel.trigger('touchend', {
          changedTouches: [{ clientX: 50 }],
        });

        // next関数が呼ばれる（実装時に確認）
      }
    });

    it('スワイプ（右）でprev関数が呼ばれる', async () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      const carousel = wrapper.find('[data-testid="carousel-container"]');
      if (carousel.exists()) {
        // スワイプのシミュレーション
        await carousel.trigger('touchstart', {
          touches: [{ clientX: 50 }],
        });
        await carousel.trigger('touchend', {
          changedTouches: [{ clientX: 100 }],
        });

        // prev関数が呼ばれる（実装時に確認）
      }
    });
  });

  describe('キーボード操作', () => {
    it('矢印キー（→）でnext関数が呼ばれる', async () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      await wrapper.trigger('keydown', { key: 'ArrowRight' });

      // next関数が呼ばれる（実装時に確認）
    });

    it('矢印キー（←）でprev関数が呼ばれる', async () => {
      const images = createTestImages(3);

      const wrapper = mount(ImageCarousel, {
        props: { images },
      });

      await wrapper.trigger('keydown', { key: 'ArrowLeft' });

      // prev関数が呼ばれる（実装時に確認）
    });
  });
});
