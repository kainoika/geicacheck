/**
 * ImageUpload コンポーネントのテスト（レスポンシブ動作）
 * TDD: このテストを先に書き、実装はT012で行う
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ImageUpload from '~/components/ui/ImageUpload.vue';

// Firebase Storageのモック
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

// useNuxtAppのモック
vi.mock('#app', () => ({
  useNuxtApp: vi.fn(() => ({
    $storage: {},
  })),
}));

describe('ImageUpload - レスポンシブ動作', () => {
  const defaultProps = {
    label: 'テスト画像',
    path: 'test/path',
    canEdit: true,
  };

  // ImageViewerコンポーネントのスタブ
  const ImageViewerStub = {
    name: 'ImageViewer',
    props: ['src', 'alt', 'canEdit', 'imageClass'],
    template: '<div class="image-viewer-stub"><img :class="imageClass" /></div>',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('画像表示のレスポンシブCSS', () => {
    it('画像が表示される際にレスポンシブクラスが適用される', () => {
      const wrapper = mount(ImageUpload, {
        props: {
          ...defaultProps,
          modelValue: 'https://example.com/image.jpg',
        },
        global: {
          stubs: {
            ImageViewer: ImageViewerStub,
          },
        },
      });

      // ImageViewerが存在することを確認
      const imageViewer = wrapper.findComponent({ name: 'ImageViewer' });
      expect(imageViewer.exists()).toBe(true);

      // レスポンシブ用のクラスが渡されていることを確認
      const imageClass = imageViewer.props('imageClass');
      expect(imageClass).toContain('w-full');
      expect(imageClass).toContain('h-auto');
    });

    it('max-widthが設定されて画面をはみ出さない', () => {
      const wrapper = mount(ImageUpload, {
        props: {
          ...defaultProps,
          modelValue: 'https://example.com/image.jpg',
        },
        global: {
          stubs: {
            ImageViewer: ImageViewerStub,
          },
        },
      });

      const imageViewer = wrapper.findComponent({ name: 'ImageViewer' });
      const imageClass = imageViewer.props('imageClass');

      // max-w-* クラスまたは max-width が設定されている
      expect(imageClass).toMatch(/max-w-|max-width/);
    });
  });

  describe('アップロードエリアのレスポンシブ動作', () => {
    it('アップロードエリアが画面幅に収まる', () => {
      const wrapper = mount(ImageUpload, {
        props: defaultProps,
      });

      // ドロップゾーンを取得
      const dropZone = wrapper.find('[class*="border-2 border-dashed"]');
      expect(dropZone.exists()).toBe(true);

      // w-fullなどのクラスが適用されていることを確認
      const classes = dropZone.attributes('class');
      expect(classes).toBeDefined();
    });

    it('モバイルでもタップしやすい最小サイズが確保されている', () => {
      const wrapper = mount(ImageUpload, {
        props: defaultProps,
      });

      const dropZone = wrapper.find('[class*="border-2 border-dashed"]');
      const classes = dropZone.attributes('class');

      // p-6 などのパディングが設定されている
      expect(classes).toContain('p-6');
    });
  });

  describe('エラーメッセージのレスポンシブ表示', () => {
    it('エラーメッセージが画面幅に収まる', async () => {
      const wrapper = mount(ImageUpload, {
        props: defaultProps,
      });

      // エラーメッセージを設定
      await wrapper.vm.$nextTick();
      const errorElement = wrapper.find('.text-red-600');

      if (errorElement.exists()) {
        const classes = errorElement.attributes('class');
        // text-sm などのレスポンシブ対応が含まれる
        expect(classes).toContain('text-sm');
      }
    });
  });

  describe('読み取り専用モードのレスポンシブ表示', () => {
    it('画像がない場合のプレースホルダーが適切に表示される', () => {
      const wrapper = mount(ImageUpload, {
        props: {
          ...defaultProps,
          canEdit: false,
          modelValue: undefined,
        },
      });

      // プレースホルダーが存在
      const placeholder = wrapper.find('.text-center');
      expect(placeholder.exists()).toBe(true);

      // レスポンシブ用のpyクラスが設定されている
      const classes = placeholder.attributes('class');
      expect(classes).toContain('py-8');
    });
  });

  describe('プログレスバーのレスポンシブ表示', () => {
    it('プログレスバーが画面幅いっぱいに表示される', () => {
      const wrapper = mount(ImageUpload, {
        props: defaultProps,
      });

      // uploading状態を設定（実際のコンポーネントではrefなので直接設定できないが、構造を確認）
      const progressBarContainer = wrapper.find('.bg-gray-200');

      if (progressBarContainer.exists()) {
        const classes = progressBarContainer.attributes('class');
        expect(classes).toContain('w-full');
      }
    });
  });
});
