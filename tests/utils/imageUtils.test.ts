/**
 * 画像処理ユーティリティのテスト
 * TDD: このテストを先に書き、実装はT009で行う
 */

import { describe, it, expect } from 'vitest';
import {
  validateImageFile,
  isValidImageUrl,
  validateMenuImages,
  reorderMenuImages,
  generateImageId,
  formatFileSize,
} from '~/utils/imageUtils';
import type { MenuImage } from '~/types';

describe('imageUtils', () => {
  describe('validateImageFile', () => {
    it('有効な画像ファイル（JPEG）を受け入れる', () => {
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file, 10);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('有効な画像ファイル（PNG）を受け入れる', () => {
      const file = new File(['dummy'], 'test.png', { type: 'image/png' });
      const result = validateImageFile(file, 10);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('画像ではないファイルを拒否する', () => {
      const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
      const result = validateImageFile(file, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('画像ファイル');
    });

    it('サイズ制限を超えるファイルを拒否する（10MB超過）', () => {
      // 11MB相当のファイル（10MB = 10 * 1024 * 1024 bytes）
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10MB');
    });

    it('カスタムサイズ制限を適用する（5MB）', () => {
      // 6MB相当のファイル
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5MB');
    });
  });

  describe('isValidImageUrl', () => {
    it('有効なFirebase Storage URLを受け入れる', () => {
      const url = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg';
      expect(isValidImageUrl(url)).toBe(true);
    });

    it('HTTPSではないURLを拒否する', () => {
      const url = 'http://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg';
      expect(isValidImageUrl(url)).toBe(false);
    });

    it('Firebase Storage以外のURLを拒否する', () => {
      const url = 'https://example.com/image.jpg';
      expect(isValidImageUrl(url)).toBe(false);
    });

    it('空文字列を拒否する', () => {
      expect(isValidImageUrl('')).toBe(false);
    });
  });

  describe('validateMenuImages', () => {
    it('undefinedを受け入れる', () => {
      const result = validateMenuImages(undefined);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('空配列を受け入れる', () => {
      const result = validateMenuImages([]);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('有効なMenuImage配列（1枚）を受け入れる', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1706000000001',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
          fileSize: 2048576,
          fileName: 'image1.jpg',
        },
      ];
      const result = validateMenuImages(menuImages);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('有効なMenuImage配列（4枚）を受け入れる', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1706000000001',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_1706000000002',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image2.jpg',
          order: 1,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_1706000000003',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image3.jpg',
          order: 2,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_1706000000004',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image4.jpg',
          order: 3,
          uploadedAt: new Date(),
        },
      ];
      const result = validateMenuImages(menuImages);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('5枚以上のMenuImageを拒否する', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_2',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image2.jpg',
          order: 1,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_3',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image3.jpg',
          order: 2,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_4',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image4.jpg',
          order: 3,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_5',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image5.jpg',
          order: 4,
          uploadedAt: new Date(),
        },
      ];
      const result = validateMenuImages(menuImages);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('4枚');
    });

    it('無効なURLを持つMenuImageを拒否する', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://example.com/invalid.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
      ];
      const result = validateMenuImages(menuImages);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('URL');
    });

    it('重複したorder値を持つMenuImageを拒否する', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_2',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image2.jpg',
          order: 0, // 重複
          uploadedAt: new Date(),
        },
      ];
      const result = validateMenuImages(menuImages);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('順序');
    });

    it('不連続なorder値を拒否する', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_2',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image2.jpg',
          order: 2, // 1が欠損
          uploadedAt: new Date(),
        },
      ];
      const result = validateMenuImages(menuImages);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('連続');
    });
  });

  describe('reorderMenuImages', () => {
    it('正しく順序が付けられた配列をそのまま返す', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_2',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image2.jpg',
          order: 1,
          uploadedAt: new Date(),
        },
      ];
      const result = reorderMenuImages(menuImages);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
    });

    it('順序が入れ替わった配列を正しく並び替える', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_2',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image2.jpg',
          order: 1,
          uploadedAt: new Date(),
        },
        {
          id: 'menu_1',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image1.jpg',
          order: 0,
          uploadedAt: new Date(),
        },
      ];
      const result = reorderMenuImages(menuImages);
      expect(result[0].order).toBe(0);
      expect(result[0].id).toBe('menu_1');
      expect(result[1].order).toBe(1);
      expect(result[1].id).toBe('menu_2');
    });

    it('order値を0から連続した値に再計算する', () => {
      const menuImages: MenuImage[] = [
        {
          id: 'menu_1',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image1.jpg',
          order: 5, // 不正な値
          uploadedAt: new Date(),
        },
        {
          id: 'menu_2',
          url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image2.jpg',
          order: 10, // 不正な値
          uploadedAt: new Date(),
        },
      ];
      const result = reorderMenuImages(menuImages);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
    });

    it('空配列をそのまま返す', () => {
      const result = reorderMenuImages([]);
      expect(result).toEqual([]);
    });
  });

  describe('generateImageId', () => {
    it('"menu_"で始まるIDを生成する', () => {
      const id = generateImageId();
      expect(id).toMatch(/^menu_\d+_\d+$/);
    });

    it('一意のIDを生成する', () => {
      const id1 = generateImageId();
      const id2 = generateImageId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatFileSize', () => {
    it('1KB未満をバイト単位で表示', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('1KBをKB単位で表示', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
    });

    it('1MBをMB単位で表示', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    });

    it('2.5MBを正しくフォーマット', () => {
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });

    it('10MBを正しくフォーマット', () => {
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
    });

    it('0バイトを表示', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
  });
});
