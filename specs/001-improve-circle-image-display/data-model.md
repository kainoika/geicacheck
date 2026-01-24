# Data Model: サークル詳細ページ画像表示改善

**Date**: 2026-01-24
**Feature**: 001-improve-circle-image-display

## エンティティ概要

この機能では、既存の`Circle`エンティティを拡張し、新しい`MenuImage`エンティティを導入します。

## 1. MenuImage (お品書き画像)

**説明**: サークルが提供する頒布物のお品書き画像。1サークルあたり最大4枚まで登録可能。

### TypeScript型定義

```typescript
export interface MenuImage {
  id: string;                // 一意識別子（例: "menu_1706000000000"）
  url: string;               // Firebase Storage URL
  order: number;             // 表示順序（0-3）
  uploadedAt: Date;          // アップロード日時
  fileSize?: number;         // ファイルサイズ（バイト単位）
  fileName?: string;         // 元のファイル名
}
```

### フィールド詳細

| フィールド | 型 | 必須 | 説明 | 制約 |
|-----------|-----|------|------|------|
| `id` | string | ✅ | 一意識別子 | `menu_` + タイムスタンプ形式 |
| `url` | string | ✅ | Firebase Storage URL | HTTPS、Firebase Storageドメインのみ |
| `order` | number | ✅ | 表示順序 | 0〜3の整数 |
| `uploadedAt` | Date | ✅ | アップロード日時 | Firestoreサーバータイムスタンプ |
| `fileSize` | number | ❌ | ファイルサイズ（バイト） | 0〜10,485,760（10MB） |
| `fileName` | string | ❌ | 元のファイル名 | 最大255文字 |

### バリデーションルール

```typescript
function validateMenuImage(image: MenuImage): boolean {
  // ID形式チェック
  if (!image.id.startsWith('menu_')) return false;

  // URL形式チェック
  const storageUrl = /^https:\/\/firebasestorage\.googleapis\.com\/.+/;
  if (!storageUrl.test(image.url)) return false;

  // 順序チェック
  if (image.order < 0 || image.order > 3) return false;

  // ファイルサイズチェック（存在する場合）
  if (image.fileSize !== undefined && image.fileSize > 10 * 1024 * 1024) {
    return false;
  }

  return true;
}
```

### 状態遷移

```
[未作成]
   ↓ (ユーザーが画像をアップロード)
[アップロード中]
   ↓ (Firebase Storageへの保存完了)
[保存済み]
   ↓ (ユーザーが順序変更)
[順序更新]
   ↓ (ユーザーが削除)
[削除済み] → FirestoreとStorageから削除
```

## 2. Circle (サークル) - 拡張

**変更内容**: `menuImageUrl`フィールドを削除し、`menuImages`配列を追加

### 変更前

```typescript
export interface Circle {
  // ... 他のフィールド
  circleCutImageUrl?: string;
  menuImageUrl?: string;  // 削除
  // ... 他のフィールド
}
```

### 変更後

```typescript
export interface Circle {
  // ... 他のフィールド
  circleCutImageUrl?: string;
  menuImages?: MenuImage[];  // 新規追加（最大4枚）
  // ... 他のフィールド
}
```

### menuImagesフィールド詳細

| 属性 | 値 |
|------|-----|
| 型 | `MenuImage[]` |
| 必須 | ❌ (オプショナル) |
| デフォルト | `undefined` または `[]` |
| 最小要素数 | 0 |
| 最大要素数 | 4 |
| 順序 | `order`フィールドでソート済み |

### バリデーションルール

```typescript
function validateCircleMenuImages(menuImages: MenuImage[] | undefined): boolean {
  // 未定義またはからの配列はOK
  if (!menuImages || menuImages.length === 0) return true;

  // 最大4枚チェック
  if (menuImages.length > 4) return false;

  // 各画像のバリデーション
  for (const image of menuImages) {
    if (!validateMenuImage(image)) return false;
  }

  // 順序の重複チェック
  const orders = menuImages.map(img => img.order);
  const uniqueOrders = new Set(orders);
  if (orders.length !== uniqueOrders.size) return false;

  // 順序が0から連続しているかチェック
  const sortedOrders = [...orders].sort((a, b) => a - b);
  for (let i = 0; i < sortedOrders.length; i++) {
    if (sortedOrders[i] !== i) return false;
  }

  return true;
}
```

## 3. Firestoreスキーマ

### コレクション構造

```
events/{eventId}/circles/{circleId}
  └── menuImages: MenuImage[]
```

### スキーマ例

```json
{
  "id": "circle_abc123",
  "circleName": "スターライトスタジオ",
  "penName": "星宮いちご",
  "circleCutImageUrl": "https://firebasestorage.googleapis.com/.../circle_cut.jpg",
  "menuImages": [
    {
      "id": "menu_1706000000001",
      "url": "https://firebasestorage.googleapis.com/.../menu_1.jpg",
      "order": 0,
      "uploadedAt": { "_seconds": 1706000000, "_nanoseconds": 0 },
      "fileSize": 2048576,
      "fileName": "oshina_page1.jpg"
    },
    {
      "id": "menu_1706000000002",
      "url": "https://firebasestorage.googleapis.com/.../menu_2.jpg",
      "order": 1,
      "uploadedAt": { "_seconds": 1706000100, "_nanoseconds": 0 },
      "fileSize": 1536000,
      "fileName": "oshina_page2.jpg"
    }
  ],
  "genre": ["星宮いちご", "グッズ"],
  "placement": {
    "block": "A",
    "number1": "01",
    "number2": "02"
  },
  "eventId": "geica-34",
  "isAdult": false,
  "isPublic": true,
  "createdAt": { "_seconds": 1705000000, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 1706000200, "_nanoseconds": 0 }
}
```

### インデックス

既存のインデックスで対応可能（新規インデックス不要）:
- `eventId` (既存)
- `circleName` (既存)
- `genre` (既存)

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId}/circles/{circleId} {
      // 読み取り: 全員可能
      allow read: if true;

      // 書き込み: 認証済み + 編集権限保持者のみ
      allow write: if request.auth != null
                   && hasEditPermission(request.auth.uid, circleId)
                   && validateMenuImages(request.resource.data.menuImages);
    }

    // 編集権限チェック関数
    function hasEditPermission(userId, circleId) {
      // 実装は既存のuseCirclePermissionsに準拠
      return exists(/databases/$(database)/documents/circle_permissions/$(userId + '_' + circleId));
    }

    // お品書き画像バリデーション関数
    function validateMenuImages(menuImages) {
      return menuImages == null
          || (menuImages.size() <= 4
             && menuImages.hasAll(['id', 'url', 'order', 'uploadedAt'])
             && menuImages.order >= 0
             && menuImages.order <= 3);
    }
  }
}
```

## 4. Firebase Storageパス構造

### パス規則

```
circle-images/{eventId}/{circleId}/menu/{imageId}_{timestamp}_{filename}
```

### 例

```
circle-images/geica-34/circle_abc123/menu/menu_1706000000001_1706000000_oshina_page1.jpg
circle-images/geica-34/circle_abc123/menu/menu_1706000000002_1706000100_oshina_page2.jpg
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /circle-images/{eventId}/{circleId}/menu/{fileName} {
      // 読み取り: 全員可能
      allow read: if true;

      // 書き込み: 認証済み + 編集権限 + サイズ制限 + 画像形式のみ
      allow write: if request.auth != null
                   && hasEditPermission(request.auth.uid, circleId)
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');

      // 削除: 認証済み + 編集権限
      allow delete: if request.auth != null
                    && hasEditPermission(request.auth.uid, circleId);
    }
  }
}
```

## 5. データ移行

### 既存データの移行戦略

**目的**: 既存の`menuImageUrl: string`を`menuImages: MenuImage[]`に変換

**実装**: `scripts/migrateMenuImages.ts`

```typescript
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

async function migrateCirclesMenuImages() {
  const firestore = getFirestore();

  // 全イベントのサークルを取得
  const eventsSnapshot = await firestore.collection('events').get();

  for (const eventDoc of eventsSnapshot.docs) {
    const eventId = eventDoc.id;
    console.log(`Migrating event: ${eventId}`);

    // このイベントのサークルを取得
    const circlesSnapshot = await firestore
      .collection(`events/${eventId}/circles`)
      .where('menuImageUrl', '!=', null)
      .get();

    console.log(`  Found ${circlesSnapshot.size} circles with menuImageUrl`);

    for (const circleDoc of circlesSnapshot.docs) {
      const circleData = circleDoc.data();
      const menuImageUrl = circleData.menuImageUrl;

      if (!menuImageUrl) continue;

      // menuImages配列を作成
      const menuImages: MenuImage[] = [{
        id: `menu_${Date.now()}`,
        url: menuImageUrl,
        order: 0,
        uploadedAt: FieldValue.serverTimestamp() as any,
        fileSize: undefined,  // 既存画像はサイズ不明
        fileName: undefined   // 既存画像はファイル名不明
      }];

      // 更新
      await circleDoc.ref.update({
        menuImages: menuImages,
        menuImageUrl: FieldValue.delete()  // 古いフィールドを削除
      });

      console.log(`    Migrated circle: ${circleDoc.id}`);
    }
  }

  console.log('Migration completed!');
}

// 実行
migrateCirclesMenuImages().catch(console.error);
```

### ロールバック戦略

万が一問題が発生した場合のロールバック:

```typescript
async function rollbackMenuImagesMigration() {
  const firestore = getFirestore();
  const eventsSnapshot = await firestore.collection('events').get();

  for (const eventDoc of eventsSnapshot.docs) {
    const eventId = eventDoc.id;
    const circlesSnapshot = await firestore
      .collection(`events/${eventId}/circles`)
      .where('menuImages', '!=', null)
      .get();

    for (const circleDoc of circlesSnapshot.docs) {
      const circleData = circleDoc.data();
      const menuImages = circleData.menuImages as MenuImage[];

      if (!menuImages || menuImages.length === 0) continue;

      // 最初の画像をmenuImageUrlに戻す
      const firstImageUrl = menuImages[0].url;

      await circleDoc.ref.update({
        menuImageUrl: firstImageUrl,
        menuImages: FieldValue.delete()
      });
    }
  }

  console.log('Rollback completed!');
}
```

## 6. パフォーマンス考慮事項

### 読み取りパフォーマンス

- **現状**: 1回のFirestore読み取りで全データ取得
- **変更後**: 同じく1回の読み取りで全データ取得（パフォーマンス変化なし）
- **最適化**: `menuImages`配列は最大4要素なので、ドキュメントサイズへの影響は最小

### 書き込みパフォーマンス

- **画像アップロード**: Firebase Storageへの並列アップロード
- **Firestore更新**: 全画像アップロード完了後に1回のみ更新
- **トランザクション**: 不要（配列の全体更新のため）

### ストレージコスト

| 項目 | 計算 |
|------|------|
| 1サークルあたりの平均画像数 | 2枚 |
| 1画像あたりの平均サイズ | 3MB |
| 1サークルあたりのストレージ | 6MB |
| 1000サークルの総ストレージ | 6GB |
| Firebase Storage無料枠 | 5GB |
| 超過分の月額コスト (1GB) | $0.026/GB → $0.026/月 |

**結論**: 小規模イベント（〜800サークル）では無料枠内、大規模イベントでも月額コストは数十円程度

## まとめ

### 主要な変更点

1. **新規エンティティ**: `MenuImage`を追加
2. **Circle拡張**: `menuImageUrl` → `menuImages[]`に変更
3. **最大枚数**: 4枚制限
4. **データ移行**: 既存データを配列形式に変換

### 次のステップ

✅ Phase 1 - データモデル設計完了

**次のタスク:**
- API契約定義（contracts/）
- クイックスタート作成（quickstart.md）
