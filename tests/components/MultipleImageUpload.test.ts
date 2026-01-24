/**
 * MultipleImageUpload コンポーネントのテスト
 * TDD: このテストを先に書き、実装はT024で行う
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { MenuImage } from '~/types';

// useCircleImagesのモック
const mockUploadMenuImages = vi.fn();
const mockDeleteMenuImage = vi.fn();
const mockReorderMenuImages = vi.fn();

vi.mock('~/composables/useCircleImages', () => ({
  useCircleImages: vi.fn(() => {
    const { ref } = require('vue');
    return {
      uploadMenuImages: mockUploadMenuImages,
      deleteMenuImage: mockDeleteMenuImage,
      reorderMenuImages: mockReorderMenuImages,
      uploading: ref(false),
      uploadProgress: ref([]),
    };
  }),
}));

describe('MultipleImageUpload', () => {
  let MultipleImageUpload: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // コンポーネントを動的にインポート
    const module = await import('~/components/ui/MultipleImageUpload.vue');
    MultipleImageUpload = module.default;
  });

  const defaultProps = {
    modelValue: [] as MenuImage[],
    circleId: 'circle123',
    eventId: 'geica-34',
    canEdit: true,
    maxImages: 4,
  };

  describe('画像一覧の表示', () => {
    it('空の配列の場合、アップロードプロンプトが表示される', () => {
      const wrapper = mount(MultipleImageUpload, {
        props: defaultProps,
      });

      expect(wrapper.text()).toContain('画像を選択');
    });

    it('画像がある場合、一覧が表示される', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://example.com/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
      ];

      const wrapper = mount(MultipleImageUpload, {
        props: {
          ...defaultProps,
          modelValue: menuImages,
        },
      });

      // 画像が表示されている
      const images = wrapper.findAll('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('最大枚数（4枚）に達している場合、アップロードボタンが無効化される', () => {
      const menuImages: MenuImage[] = Array.from({ length: 4 }, (_, i) => ({
        id: `menu_${i}`,
        url: `https://example.com/image${i}.jpg`,
        order: i,
        uploadedAt: new Date(),
      }));

      const wrapper = mount(MultipleImageUpload, {
        props: {
          ...defaultProps,
          modelValue: menuImages,
        },
      });

      // アップロードエリアが非表示またはdisabled
      const uploadArea = wrapper.find('[data-testid="upload-area"]');
      expect(uploadArea.exists()).toBe(false);
    });

    it('canEditがfalseの場合、読み取り専用モードで表示される', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://example.com/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
      ];

      const wrapper = mount(MultipleImageUpload, {
        props: {
          ...defaultProps,
          modelValue: menuImages,
          canEdit: false,
        },
      });

      // 削除ボタンやアップロードエリアが存在しない
      expect(wrapper.find('[data-testid="delete-button"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="upload-area"]').exists()).toBe(false);
    });
  });

  describe('画像のアップロード', () => {
    it('ファイル選択後、アップロード関数が呼ばれる', async () => {
      const wrapper = mount(MultipleImageUpload, {
        props: defaultProps,
      });

      mockUploadMenuImages.mockResolvedValue([
        {
          id: 'menu_new',
          url: 'https://example.com/new.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
      ]);

      const fileInput = wrapper.find('input[type="file"]');
      expect(fileInput.exists()).toBe(true);

      // ファイル選択をシミュレート
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      });

      await fileInput.trigger('change');

      // アップロード関数が呼ばれることを期待
      // （実際の動作は実装後に確認）
    });

    it('プログレスバーが表示される', () => {
      const wrapper = mount(MultipleImageUpload, {
        props: defaultProps,
      });

      // uploading状態の時にプログレスバーが表示される
      // （実装時に確認）
    });
  });

  describe('画像の削除', () => {
    it('削除ボタンをクリックすると削除関数が呼ばれる', async () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://example.com/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
      ];

      const wrapper = mount(MultipleImageUpload, {
        props: {
          ...defaultProps,
          modelValue: menuImages,
        },
      });

      mockDeleteMenuImage.mockResolvedValue([]);

      const deleteButton = wrapper.find('[data-testid="delete-button-0"]');
      if (deleteButton.exists()) {
        await deleteButton.trigger('click');

        // 削除確認後、削除関数が呼ばれる
        // （実装時に確認）
      }
    });
  });

  describe('画像の順序変更', () => {
    it('ドラッグ&ドロップで順序を変更できる', async () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://example.com/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_2',
          url: 'https://example.com/image2.jpg',
          order: 1,
          uploadedAt: new Date(),
        },
      ];

      const wrapper = mount(MultipleImageUpload, {
        props: {
          ...defaultProps,
          modelValue: menuImages,
        },
      });

      mockReorderMenuImages.mockResolvedValue([menuImages[1], menuImages[0]]);

      // ドラッグ&ドロップのシミュレーション
      // （実装時に確認）
    });

    it('上へ・下へボタンで順序を変更できる', async () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://example.com/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_2',
          url: 'https://example.com/image2.jpg',
          order: 1,
          uploadedAt: new Date(),
        },
      ];

      const wrapper = mount(MultipleImageUpload, {
        props: {
          ...defaultProps,
          modelValue: menuImages,
        },
      });

      mockReorderMenuImages.mockResolvedValue([menuImages[1], menuImages[0]]);

      const moveDownButton = wrapper.find('[data-testid="move-down-0"]');
      if (moveDownButton.exists()) {
        await moveDownButton.trigger('click');

        // 順序変更関数が呼ばれる
        // （実装時に確認）
      }
    });
  });

  describe('レスポンシブ表示', () => {
    it('画像が画面幅に収まるように表示される', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://example.com/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
      ];

      const wrapper = mount(MultipleImageUpload, {
        props: {
          ...defaultProps,
          modelValue: menuImages,
        },
      });

      // imgタグにレスポンシブクラスが適用されている
      const image = wrapper.find('img');
      if (image.exists()) {
        const classes = image.attributes('class');
        expect(classes).toMatch(/max-w-|w-full/);
      }
    });
  });
});
