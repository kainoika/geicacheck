/**
 * useCircleImages composable のテスト
 * TDD: このテストを先に書き、実装はT022で行う
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MenuImage } from '~/types';

// Firebase Storageのモック
const mockUploadBytesResumable = vi.fn();
const mockGetDownloadURL = vi.fn();
const mockDeleteObject = vi.fn();
const mockRef = vi.fn();

vi.mock('firebase/storage', () => ({
  ref: mockRef,
  uploadBytesResumable: mockUploadBytesResumable,
  getDownloadURL: mockGetDownloadURL,
  deleteObject: mockDeleteObject,
}));

// Firestoreのモック
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ _seconds: Date.now() / 1000 }));

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  updateDoc: mockUpdateDoc,
  serverTimestamp: mockServerTimestamp,
}));

// useNuxtAppのモック
vi.mock('#app', () => ({
  useNuxtApp: vi.fn(() => ({
    $storage: {},
    $firestore: {},
  })),
}));

describe('useCircleImages', () => {
  let useCircleImages: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // composableを動的にインポート
    const module = await import('~/composables/useCircleImages');
    useCircleImages = module.useCircleImages;
  });

  describe('uploadMenuImages', () => {
    it('新しい画像を1枚アップロードできる', async () => {
      const { uploadMenuImages } = useCircleImages();

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const existingImages: MenuImage[] = [];

      // Storageアップロードのモック
      mockUploadBytesResumable.mockReturnValue({
        on: vi.fn((event, progress, error, complete) => {
          // 即座に完了を呼ぶ
          complete();
        }),
        snapshot: { ref: {} },
      });

      mockGetDownloadURL.mockResolvedValue('https://firebasestorage.googleapis.com/test.jpg');

      const result = await uploadMenuImages('circle123', 'geica-34', [file], existingImages);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        url: 'https://firebasestorage.googleapis.com/test.jpg',
        order: 0,
        fileName: 'test.jpg',
      });
    });

    it('既存画像がある場合、正しいorder値でアップロードできる', async () => {
      const { uploadMenuImages } = useCircleImages();

      const file = new File(['test'], 'test2.jpg', { type: 'image/jpeg' });
      const existingImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://firebasestorage.googleapis.com/existing.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
      ];

      mockUploadBytesResumable.mockReturnValue({
        on: vi.fn((event, progress, error, complete) => complete()),
        snapshot: { ref: {} },
      });

      mockGetDownloadURL.mockResolvedValue('https://firebasestorage.googleapis.com/test2.jpg');

      const result = await uploadMenuImages('circle123', 'geica-34', [file], existingImages);

      expect(result).toHaveLength(2);
      expect(result[1].order).toBe(1);
    });

    it('最大4枚を超える場合エラーを投げる', async () => {
      const { uploadMenuImages } = useCircleImages();

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      const existingImages: MenuImage[] = [
        { id: 'menu_1', url: 'url1', order: 0, uploadedAt: new Date() },
        { id: 'menu_2', url: 'url2', order: 1, uploadedAt: new Date() },
        { id: 'menu_3', url: 'url3', order: 2, uploadedAt: new Date() },
      ];

      await expect(
        uploadMenuImages('circle123', 'geica-34', files, existingImages)
      ).rejects.toThrow('4枚');
    });

    it('10MBを超えるファイルでエラーを投げる', async () => {
      const { uploadMenuImages } = useCircleImages();

      // 11MB相当のファイル
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

      await expect(
        uploadMenuImages('circle123', 'geica-34', [file], [])
      ).rejects.toThrow('10MB');
    });

    it('画像ファイル以外でエラーを投げる', async () => {
      const { uploadMenuImages } = useCircleImages();

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(
        uploadMenuImages('circle123', 'geica-34', [file], [])
      ).rejects.toThrow('画像ファイル');
    });

    it('複数ファイルを並列アップロードできる', async () => {
      const { uploadMenuImages } = useCircleImages();

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      mockUploadBytesResumable.mockReturnValue({
        on: vi.fn((event, progress, error, complete) => complete()),
        snapshot: { ref: {} },
      });

      mockGetDownloadURL
        .mockResolvedValueOnce('https://firebasestorage.googleapis.com/test1.jpg')
        .mockResolvedValueOnce('https://firebasestorage.googleapis.com/test2.jpg');

      const result = await uploadMenuImages('circle123', 'geica-34', files, []);

      expect(result).toHaveLength(2);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
    });
  });

  describe('deleteMenuImage', () => {
    it('指定した画像を削除できる', async () => {
      const { deleteMenuImage } = useCircleImages();

      const menuImages: MenuImage[] = [
        { id: 'menu_1', url: 'url1', order: 0, uploadedAt: new Date() },
        { id: 'menu_2', url: 'url2', order: 1, uploadedAt: new Date() },
      ];

      mockDeleteObject.mockResolvedValue(undefined);

      const result = await deleteMenuImage('circle123', 'geica-34', 'menu_1', menuImages);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('menu_2');
      expect(result[0].order).toBe(0); // 順序が詰められる
    });

    it('削除後に順序を正しく詰め直す', async () => {
      const { deleteMenuImage } = useCircleImages();

      const menuImages: MenuImage[] = [
        { id: 'menu_1', url: 'url1', order: 0, uploadedAt: new Date() },
        { id: 'menu_2', url: 'url2', order: 1, uploadedAt: new Date() },
        { id: 'menu_3', url: 'url3', order: 2, uploadedAt: new Date() },
      ];

      mockDeleteObject.mockResolvedValue(undefined);

      // 中央の画像を削除
      const result = await deleteMenuImage('circle123', 'geica-34', 'menu_2', menuImages);

      expect(result).toHaveLength(2);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
    });

    it('存在しないimageIdでエラーを投げる', async () => {
      const { deleteMenuImage } = useCircleImages();

      const menuImages: MenuImage[] = [
        { id: 'menu_1', url: 'url1', order: 0, uploadedAt: new Date() },
      ];

      await expect(
        deleteMenuImage('circle123', 'geica-34', 'invalid_id', menuImages)
      ).rejects.toThrow('見つかりません');
    });
  });

  describe('reorderMenuImages', () => {
    it('画像の順序を変更できる', async () => {
      const { reorderMenuImages } = useCircleImages();

      const menuImages: MenuImage[] = [
        { id: 'menu_1', url: 'url1', order: 0, uploadedAt: new Date() },
        { id: 'menu_2', url: 'url2', order: 1, uploadedAt: new Date() },
        { id: 'menu_3', url: 'url3', order: 2, uploadedAt: new Date() },
      ];

      // menu_3を0番目に移動
      const result = await reorderMenuImages('circle123', 'geica-34', 'menu_3', 0, menuImages);

      expect(result[0].id).toBe('menu_3');
      expect(result[1].id).toBe('menu_1');
      expect(result[2].id).toBe('menu_2');

      // 順序が正しく設定される
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(result[2].order).toBe(2);
    });

    it('範囲外のnewOrderでエラーを投げる', async () => {
      const { reorderMenuImages } = useCircleImages();

      const menuImages: MenuImage[] = [
        { id: 'menu_1', url: 'url1', order: 0, uploadedAt: new Date() },
      ];

      await expect(
        reorderMenuImages('circle123', 'geica-34', 'menu_1', 5, menuImages)
      ).rejects.toThrow('範囲外');
    });

    it('存在しないimageIdでエラーを投げる', async () => {
      const { reorderMenuImages } = useCircleImages();

      const menuImages: MenuImage[] = [
        { id: 'menu_1', url: 'url1', order: 0, uploadedAt: new Date() },
      ];

      await expect(
        reorderMenuImages('circle123', 'geica-34', 'invalid_id', 0, menuImages)
      ).rejects.toThrow('見つかりません');
    });
  });
});
