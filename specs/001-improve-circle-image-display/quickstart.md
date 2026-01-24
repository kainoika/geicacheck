# Quickstart: サークル詳細ページ画像表示改善

**Feature**: 001-improve-circle-image-display
**Date**: 2026-01-24

## 概要

このガイドでは、サークル詳細ページの画像表示改善機能を開発・テスト・デプロイする手順を説明します。

## 前提条件

- Node.js 18+ がインストールされている
- Firebase CLIがインストールされている (`npm install -g firebase-tools`)
- プロジェクトのリポジトリをクローン済み
- Firebase プロジェクトへのアクセス権限を持っている

## 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
cd /path/to/geicacheck
npm install
```

### 2. 環境変数の設定

`.env`ファイルを確認し、Firebase設定が正しいことを確認：

```bash
# .env
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NUXT_PUBLIC_LOG_LEVEL=debug
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションが http://localhost:3000 で起動します。

## 実装手順

### Phase 1: 型定義の更新

**ファイル**: `types/index.ts`

```typescript
// 1. MenuImage型を追加
export interface MenuImage {
  id: string;
  url: string;
  order: number;
  uploadedAt: Date;
  fileSize?: number;
  fileName?: string;
}

// 2. Circle型を更新
export interface Circle {
  // ... 既存のフィールド
  circleCutImageUrl?: string;
  menuImages?: MenuImage[];  // 追加: menuImageUrlを置き換え
  // ... 既存のフィールド
}
```

### Phase 2: Composableの作成

**ファイル**: `composables/useCircleImages.ts`

```bash
# 新規ファイル作成
touch composables/useCircleImages.ts
touch composables/useImageCarousel.ts
```

`useCircleImages.ts`の実装例は `contracts/firebase-operations.md` を参照。

### Phase 3: コンポーネントの作成

**ファイル**: `components/ui/MultipleImageUpload.vue`

```bash
# 新規コンポーネント作成
touch components/ui/MultipleImageUpload.vue
touch components/ui/ImageCarousel.vue
```

**MultipleImageUpload.vue の役割:**
- 複数画像（最大4枚）のアップロード
- ドラッグ&ドロップ対応
- プログレスバー表示（各画像ごと）
- 画像の順序変更（ドラッグ&ドロップ + up/downボタン）
- 画像の削除

**ImageCarousel.vue の役割:**
- 複数画像のスワイプ/スライド表示
- インジケーター（1/4、2/4等）
- 次へ/前へボタン
- タッチジェスチャー対応

### Phase 4: サークル詳細ページの更新

**ファイル**: `pages/circles/[id].vue`

**変更箇所:**

```vue
<template>
  <!-- ... -->

  <!-- 変更前: 単一画像アップロード -->
  <ImageUpload
    v-model="circle.menuImageUrl"
    label="お品書き画像"
    :path="`circle-images/${currentEvent?.id}/${circle.id}/menu`"
    :can-edit="permissions.canUploadImages"
    @update:modelValue="updateMenuImage"
    @error="uploadError = $event"
    @deleted:image="onImageDeletedMenuImage"
  />

  <!-- 変更後: 複数画像アップロード -->
  <MultipleImageUpload
    v-model="circle.menuImages"
    label="お品書き"
    :circle-id="circle.id"
    :event-id="currentEvent?.id"
    :can-edit="permissions.canUploadImages"
    :max-images="4"
    @update:modelValue="updateMenuImages"
    @error="uploadError = $event"
  />

  <!-- 画像表示（編集権限がない場合） -->
  <ImageCarousel
    v-if="!permissions.canUploadImages && circle.menuImages?.length > 0"
    :images="circle.menuImages"
  />

  <!-- ... -->
</template>

<script setup lang="ts">
// 既存のimport
import { useCircleImages } from '~/composables/useCircleImages';

// composable追加
const { uploadMenuImages, deleteMenuImage, reorderMenuImages } = useCircleImages();

// メソッド追加
const updateMenuImages = async (menuImages: MenuImage[]) => {
  if (!circle.value) return;
  circle.value.menuImages = menuImages;
};
</script>
```

### Phase 5: データ移行スクリプトの作成

**ファイル**: `scripts/migrateMenuImages.ts`

```bash
# 新規スクリプト作成
touch scripts/migrateMenuImages.ts
```

実装内容は `data-model.md` の「データ移行」セクションを参照。

### Phase 6: Firestore Rules の更新

**ファイル**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId}/circles/{circleId} {
      // 読み取り: 全員可能
      allow read: if true;

      // 書き込み: 認証済み + 編集権限 + menuImagesバリデーション
      allow write: if request.auth != null
                   && hasEditPermission(request.auth.uid, circleId)
                   && validateMenuImages(request.resource.data.get('menuImages', null));
    }

    // バリデーション関数
    function validateMenuImages(menuImages) {
      return menuImages == null
          || (menuImages.size() <= 4
             && menuImages.size() > 0
             && menuImages[0].keys().hasAll(['id', 'url', 'order', 'uploadedAt']));
    }
  }
}
```

デプロイ:

```bash
firebase deploy --only firestore:rules
```

### Phase 7: Storage Rules の更新

**ファイル**: `storage.rules`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /circle-images/{eventId}/{circleId}/menu/{fileName} {
      // 読み取り: 全員可能
      allow read: if true;

      // 書き込み: 認証済み + 編集権限 + サイズ/形式チェック
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');

      // 削除: 認証済み + 編集権限
      allow delete: if request.auth != null;
    }
  }
}
```

デプロイ:

```bash
firebase deploy --only storage
```

## テスト手順

### 1. ユニットテスト

```bash
# useCircleImagesのテスト
npm run test composables/useCircleImages.test.ts

# useImageCarouselのテスト
npm run test composables/useImageCarousel.test.ts
```

### 2. コンポーネントテスト

```bash
# MultipleImageUploadのテスト
npm run test components/ui/MultipleImageUpload.test.ts

# ImageCarouselのテスト
npm run test components/ui/ImageCarousel.test.ts
```

### 3. E2Eテスト（手動）

#### 3-1. 画像アップロードのテスト

1. ローカル開発サーバーを起動: `npm run dev`
2. Twitter認証でログイン
3. 編集権限を持つサークルの詳細ページを開く
4. 「お品書き」セクションで「画像を選択」をクリック
5. 4枚の画像を選択してアップロード
6. プログレスバーが表示され、アップロードが完了することを確認
7. 画像が順番に表示されることを確認

#### 3-2. 画像削除のテスト

1. アップロードした画像の「削除」ボタンをクリック
2. 確認ダイアログで「削除」を選択
3. 画像が削除され、残りの画像の順序が詰められることを確認

#### 3-3. 画像順序変更のテスト

1. 複数の画像をアップロード
2. ドラッグ&ドロップで画像の順序を変更（デスクトップ）
3. または、up/downボタンで順序を変更（モバイル）
4. 順序が変更されることを確認

#### 3-4. モバイル表示のテスト

1. Chrome DevToolsでモバイルデバイスをエミュレート（iPhone SE, iPhone 12 Pro, iPad）
2. サークル詳細ページを開く
3. お品書き画像が画面幅に収まることを確認
4. スワイプで次の画像に移動できることを確認
5. インジケーター（1/4、2/4等）が表示されることを確認

#### 3-5. 大きな画像のテスト

1. 10MB近い高解像度画像をアップロード
2. 画像がレスポンシブに表示されることを確認（横スクロールなし）
3. モバイルデバイスで表示速度を確認（3秒以内の表示開始）

## データ移行

### 本番環境での移行手順

**⚠️ 警告**: 本番データを変更する前に、必ずバックアップを取得してください。

#### 1. Firestoreデータのバックアップ

```bash
# Firebase コンソールからエクスポート
# または、gcloud CLI を使用
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
```

#### 2. 移行スクリプトの実行（dry-run）

```bash
# dry-runモードで実行（実際の変更なし）
npm run migrate:menu-images -- --dry-run
```

出力例:

```
Found 150 circles with menuImageUrl
  Event: geica-34 - 150 circles
Dry run completed. No changes were made.
```

#### 3. 本番環境での移行実行

```bash
# 本番環境で実行
npm run migrate:menu-images
```

出力例:

```
Migrating event: geica-34
  Found 150 circles with menuImageUrl
    Migrated circle: circle_abc123
    Migrated circle: circle_def456
    ...
Migration completed!
Total migrated: 150 circles
```

#### 4. 移行結果の確認

```bash
# Firebase コンソールでFirestoreを確認
# menuImages配列が作成されていることを確認
# menuImageUrlフィールドが削除されていることを確認
```

#### 5. ロールバック（必要な場合）

```bash
npm run rollback:menu-images
```

## デプロイ

### 1. ビルドとテスト

```bash
# 本番ビルド
npm run build

# ビルド成果物を確認
npm run preview
```

### 2. Firebase Hostingへのデプロイ

```bash
# Firebaseプロジェクトにログイン
firebase login

# デプロイ
firebase deploy --only hosting
```

### 3. Firestore Rules と Storage Rules のデプロイ

```bash
# Firestore Rules
firebase deploy --only firestore:rules

# Storage Rules
firebase deploy --only storage
```

### 4. デプロイ後の確認

1. 本番URLにアクセス: https://your-app.web.app
2. サークル詳細ページを開く
3. 画像表示が正しく動作することを確認
4. モバイルデバイスで実際にテスト

## トラブルシューティング

### 問題: 画像アップロードが失敗する

**原因**: Storageのパーミッションまたはファイルサイズ制限

**解決策:**
1. Firebase Consoleで Storage Rules を確認
2. ブラウザのコンソールでエラーメッセージを確認
3. ファイルサイズが10MB以下であることを確認

```bash
# Storageルールを再デプロイ
firebase deploy --only storage
```

### 問題: 画像が表示されない（モバイル）

**原因**: CSSレスポンシブ設定の問題

**解決策:**
1. Chrome DevToolsでモバイルデバイスをエミュレート
2. Elements タブで画像のCSSを確認
3. `max-width: 100%` と `height: auto` が適用されているか確認

### 問題: 既存のmenuImageUrlが消えた

**原因**: 移行スクリプトの実行エラー

**解決策:**
1. Firestoreバックアップから復元
2. ロールバックスクリプトを実行

```bash
npm run rollback:menu-images
```

### 問題: 画像の順序がおかしい

**原因**: order フィールドの重複または欠損

**解決策:**
1. Firebase Consoleでサークルドキュメントを確認
2. menuImages配列の各要素のorderフィールドを確認
3. 手動で修正、または以下のスクリプトを実行

```bash
npm run fix:menu-image-order
```

## パフォーマンス最適化

### 1. 画像の遅延読み込み

**ImageCarousel.vue**で2枚目以降の画像に`loading="lazy"`を設定:

```vue
<img
  :src="image.url"
  :alt="`お品書き${index + 1}`"
  loading="lazy"
  class="max-w-full h-auto"
/>
```

### 2. Service Workerでのキャッシュ

PWA設定で画像をキャッシュ:

```typescript
// nuxt.config.ts
pwa: {
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'firebase-storage-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7  // 1週間
          }
        }
      }
    ]
  }
}
```

### 3. 画像圧縮（将来的な最適化）

Firebase Extensions「Resize Images」を導入:

```bash
firebase ext:install firebase/storage-resize-images
```

## 次のステップ

✅ Phase 1 完了: 設計とクイックスタート

**Phase 2へ進む:**
- タスク分解（`tasks.md`の作成）
- 実装開始

**実装優先順位（仕様書に基づく）:**
1. **P1 - モバイルでサークル画像を正しく表示**: レスポンシブCSS対応
2. **P2 - 複数のお品書きを登録・閲覧**: MultipleImageUpload + ImageCarousel
3. **P3 - 大きな画像を効率的に読み込み**: 遅延読み込み + パフォーマンス最適化
