/**
 * 画像処理ユーティリティ
 * サークル詳細ページの画像表示改善機能で使用
 */

import type { MenuImage } from '~/types';

/**
 * 画像ファイルのバリデーション
 *
 * @param file - バリデーション対象のファイル
 * @param maxSizeInMB - 最大ファイルサイズ（MB単位）デフォルト: 10MB
 * @returns バリデーション結果オブジェクト
 *
 * @example
 * ```typescript
 * const result = validateImageFile(file, 10);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateImageFile(
  file: File,
  maxSizeInMB: number = 10
): { valid: boolean; error?: string } {
  // ファイルタイプチェック
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: '画像ファイルを選択してください',
    };
  }

  // ファイルサイズチェック
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `ファイルサイズは${maxSizeInMB}MB以下にしてください`,
    };
  }

  return { valid: true };
}

/**
 * 画像URLの形式チェック
 * Firebase Storage URLであることを確認
 *
 * @param url - チェック対象のURL
 * @returns URLが有効な場合true
 *
 * @example
 * ```typescript
 * const isValid = isValidImageUrl('https://firebasestorage.googleapis.com/...');
 * ```
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || url.length === 0) {
    return false;
  }

  // HTTPSチェック
  if (!url.startsWith('https://')) {
    return false;
  }

  // Firebase Storage URLチェック
  const firebaseStoragePattern = /^https:\/\/firebasestorage\.googleapis\.com\/.+/;
  return firebaseStoragePattern.test(url);
}

/**
 * MenuImage配列のバリデーション
 *
 * @param menuImages - バリデーション対象のMenuImage配列
 * @returns バリデーション結果オブジェクト
 *
 * @example
 * ```typescript
 * const result = validateMenuImages(circle.menuImages);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateMenuImages(
  menuImages: MenuImage[] | undefined
): { valid: boolean; error?: string } {
  // undefinedまたは空配列はOK
  if (!menuImages || menuImages.length === 0) {
    return { valid: true };
  }

  // 最大4枚チェック
  if (menuImages.length > 4) {
    return {
      valid: false,
      error: 'お品書きは最大4枚までです',
    };
  }

  // 各画像のバリデーション
  for (const image of menuImages) {
    // URLバリデーション
    if (!isValidImageUrl(image.url)) {
      return {
        valid: false,
        error: '無効なURLが含まれています',
      };
    }
  }

  // 順序の重複チェック
  const orders = menuImages.map((img) => img.order);
  const uniqueOrders = new Set(orders);
  if (orders.length !== uniqueOrders.size) {
    return {
      valid: false,
      error: '順序が重複しています',
    };
  }

  // 順序が0から連続しているかチェック
  const sortedOrders = [...orders].sort((a, b) => a - b);
  for (let i = 0; i < sortedOrders.length; i++) {
    if (sortedOrders[i] !== i) {
      return {
        valid: false,
        error: '順序は0から連続している必要があります',
      };
    }
  }

  return { valid: true };
}

/**
 * MenuImage配列の順序を再計算
 *
 * @param menuImages - 順序を再計算するMenuImage配列
 * @returns 順序が再計算されたMenuImage配列
 *
 * @example
 * ```typescript
 * const reordered = reorderMenuImages(menuImages);
 * ```
 */
export function reorderMenuImages(menuImages: MenuImage[]): MenuImage[] {
  if (menuImages.length === 0) {
    return [];
  }

  // orderフィールドでソート
  const sorted = [...menuImages].sort((a, b) => a.order - b.order);

  // order値を0から連続した値に再計算
  return sorted.map((image, index) => ({
    ...image,
    order: index,
  }));
}

/**
 * 画像IDの生成
 *
 * @returns 一意の画像ID（例: "menu_1706000000000"）
 *
 * @example
 * ```typescript
 * const imageId = generateImageId();
 * // => "menu_1706000000000"
 * ```
 */
export function generateImageId(): string {
  // タイムスタンプ + ランダム値で一意性を保証
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `menu_${timestamp}_${random}`;
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 *
 * @param bytes - バイト数
 * @returns フォーマットされた文字列（例: "2.5 MB"）
 *
 * @example
 * ```typescript
 * const size = formatFileSize(2621440);
 * // => "2.5 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const kb = 1024;
  const mb = kb * 1024;

  if (bytes < kb) {
    return `${bytes} B`;
  } else if (bytes < mb) {
    return `${(bytes / kb).toFixed(1)} KB`;
  } else {
    return `${(bytes / mb).toFixed(1)} MB`;
  }
}
