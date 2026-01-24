# Research: サークル詳細ページ画像表示改善

**Date**: 2026-01-24
**Feature**: 001-improve-circle-image-display

## 技術スタック調査結果

### 現在の技術環境

**フレームワーク & 言語:**
- Nuxt 3 (SPAモード、SSR無効)
- Vue 3 Composition API
- TypeScript (strict mode無効)
- Node.js 18+

**UI & スタイリング:**
- Tailwind CSS 3
- Heroicons (アイコンライブラリ)
- カスタムCSS (`assets/css/main.css`)

**バックエンド & インフラ:**
- Firebase Authentication (Twitter OAuth)
- Firebase Firestore (NoSQLデータベース)
- Firebase Storage (画像ストレージ)
- Firebase Hosting (デプロイ)

**PWA & パフォーマンス:**
- @vite-pwa/nuxt (PWA対応)
- Workbox (Service Worker、キャッシング戦略)
- レスポンシブ画像は未実装

**テスト:**
- Vitest (ユニットテスト)
- Vue Test Utils (コンポーネントテスト)

## 現在の実装調査

### 1. サークル詳細ページ (`pages/circles/[id].vue`)

**画像表示の現状:**

```typescript
// 行78-88: サークルカット画像
<ImageUpload
  v-model="circle.circleCutImageUrl"
  label="サークルカット画像"
  :path="`circle-images/${currentEvent?.id}/${circle.id}/circle-cut`"
  :can-edit="permissions.canUploadImages"
  @update:modelValue="updateCircleCut"
  @deleted:image="onImageDeletedCircleCut"
  @error="uploadError = $event"
/>

// 行92-102: お品書き画像（現在は1枚のみ）
<ImageUpload
  v-model="circle.menuImageUrl"
  label="お品書き画像"
  :path="`circle-images/${currentEvent?.id}/${circle.id}/menu`"
  :can-edit="permissions.canUploadImages"
  @update:modelValue="updateMenuImage"
  @error="uploadError = $event"
  @deleted:image="onImageDeletedMenuImage"
/>
```

**問題点:**
1. **お品書きが1枚のみ**: `menuImageUrl: string` で単一画像のみ対応
2. **レスポンシブ未対応**: 画像サイズに関係なく元サイズで表示、モバイルで横スクロール発生
3. **画像最適化なし**: Firebase Storageから直接元サイズの画像を配信

### 2. ImageUploadコンポーネント (`components/ui/ImageUpload.vue`)

**現在の実装:**

```typescript
interface Props {
  modelValue?: string  // 単一の画像URL
  label: string
  path: string        // Storage内のパス
  canEdit: boolean
  maxSize?: number    // MB (デフォルト: 5MB)
}
```

**機能:**
- 単一画像のアップロード/削除
- ドラッグ&ドロップ対応
- プログレスバー表示
- ファイルサイズ検証 (最大5MB)
- ファイルタイプ検証 (image/*のみ)

**制限:**
- 複数画像アップロード非対応
- 画像プレビューのみ（拡大、スワイプ機能なし）

### 3. データモデル (`types/index.ts`)

**Circle型の現状:**

```typescript
export interface Circle {
  id: string;
  circleName: string;
  circleKana?: string;
  penName?: string;
  penNameKana?: string;
  circleCutImageUrl?: string;  // サークルカット（1枚）
  menuImageUrl?: string;       // お品書き（1枚）★変更が必要
  genre: string[];
  placement: PlacementInfo;
  description?: string;
  contact: ContactInfo;
  items?: CircleItem[];
  isAdult: boolean;
  ownerId?: string;
  isPublic: boolean;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**必要な変更:**
```typescript
// Before
menuImageUrl?: string;

// After
menuImages?: MenuImage[];  // 最大4枚、順序管理

interface MenuImage {
  id: string;
  url: string;
  order: number;           // 表示順序
  uploadedAt: Date;
  fileSize?: number;       // バイト単位
  fileName?: string;
}
```

## 技術選択と決定

### 1. 複数画像対応の実装方針

**Decision**: 新しいコンポーネント `MultipleImageUpload.vue` を作成

**Rationale:**
- 既存の`ImageUpload.vue`は単一画像用として多くの箇所で使用されている
- 複数画像用に拡張すると既存の実装に影響が大きい
- 別コンポーネントとすることで、責任分離と保守性向上

**Alternatives Considered:**
- **Option A**: 既存`ImageUpload`を拡張してmultiple属性を追加
  - ❌ 既存の利用箇所（サークルカット等）への影響が大きい
  - ❌ 単一責任の原則に反する
- **Option B**: 新規コンポーネント作成
  - ✅ 既存コードに影響なし
  - ✅ 複数画像専用の最適化が可能
  - ✅ 順序管理、最大枚数制限など独自機能を実装しやすい

### 2. 画像表示UI（カルーセル/スワイプ）

**Decision**: Swiper.jsを使用せず、ネイティブCSSとVue Composableで実装

**Rationale:**
- プロジェクト憲章「Composables-First Architecture」に準拠
- PWAバンドルサイズの最小化
- 既存の`useTouch()`コンポーザブルを活用可能

**Implementation Approach:**
```typescript
// composables/useImageCarousel.ts を新規作成
- タッチスワイプ処理
- 画像インジケーター（1/4、2/4等）
- 次へ/前へボタン
- キーボードナビゲーション（デスクトップ）
```

**Alternatives Considered:**
- **Swiper.js / Embla Carousel等の外部ライブラリ**
  - ❌ バンドルサイズ増加（~50-100KB）
  - ❌ 憲章「Composables-First」に反する
  - ✅ 機能豊富、クロスブラウザ対応
- **ネイティブ実装**
  - ✅ バンドルサイズ最小
  - ✅ 憲章準拠
  - ✅ プロジェクト独自のタッチ処理と統合可能
  - ⚠️ クロスブラウザテストが必要

### 3. レスポンシブ画像最適化

**Decision**: Firebase Storage + CSS `max-width: 100%` + `object-fit: contain`

**Rationale:**
- Firebase Storageは画像リサイズAPIを提供しないため、クライアント側でCSSで対応
- 将来的にFirebase Extensions（Resize Images）導入を検討
- 現時点ではシンプルなCSS対応で十分

**Implementation:**
```css
.circle-image {
  max-width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

/* モバイル最適化 */
@media (max-width: 768px) {
  .circle-image {
    max-width: 100vw;
    max-height: 80vh;
  }
}
```

**Alternatives Considered:**
- **Firebase Extensions: Resize Images**
  - ✅ サーバー側で複数サイズ生成（thumb, small, medium）
  - ❌ 追加コスト（Cloud Functions実行料金）
  - ❌ ストレージ容量増加（各画像が3-4バリアント）
  - 💡 将来的な最適化として検討可能
- **Cloudinary / Imgix等の画像CDN**
  - ✅ 高度な画像最適化・変換
  - ❌ 月額課金が必要
  - ❌ Firebase Storageからの移行コスト
- **CSS対応のみ（採用案）**
  - ✅ 追加コストゼロ
  - ✅ 実装が簡単
  - ⚠️ 大きな画像はデータ転送量が多い
  - 💡 後からFirebase Extensionsへ段階的移行可能

### 4. Firestoreデータ構造

**Decision**: menuImagesを配列フィールドとして保存

**Rationale:**
- Firestoreはネストされたオブジェクト配列をサポート
- クエリ不要（サークル取得時に一緒に取得）
- トランザクション処理が簡単

**Schema:**
```typescript
// Firestore: events/{eventId}/circles/{circleId}
{
  ...
  menuImages: [
    {
      id: "menu_1",
      url: "https://storage.googleapis.com/.../menu_1_image.jpg",
      order: 0,
      uploadedAt: Timestamp,
      fileSize: 2048576,  // 2MB
      fileName: "oshina_page1.jpg"
    },
    {
      id: "menu_2",
      url: "https://storage.googleapis.com/.../menu_2_image.jpg",
      order: 1,
      uploadedAt: Timestamp,
      fileSize: 1536000,
      fileName: "oshina_page2.jpg"
    }
  ]
}
```

**Alternatives Considered:**
- **サブコレクション (`menuImages/{imageId}`)**
  - ❌ 追加クエリが必要（コスト増、パフォーマンス低下）
  - ❌ トランザクション処理が複雑
  - ✅ 大量の画像に対応可能（今回は最大4枚なので不要）

### 5. 画像順序変更UI

**Decision**: ドラッグ&ドロップとup/downボタンの両方を提供

**Rationale:**
- デスクトップ: ドラッグ&ドロップで直感的
- モバイル: ボタンでの移動が操作しやすい
- アクセシビリティ向上

**Implementation Library**: なし（ネイティブVue実装）

**Alternatives Considered:**
- **Vue Draggable Next**
  - ✅ 実装が簡単
  - ❌ 外部依存追加（~20KB）
  - ❌ モバイルタッチ操作が複雑
- **ネイティブ実装（採用案）**
  - ✅ バンドルサイズ最小
  - ✅ モバイルとデスクトップで異なるUIを提供可能
  - ✅ 憲章「Composables-First」に準拠
  - ⚠️ テストが必要

### 6. 画像ファイルサイズ制限

**Decision**: 現行の5MBから10MBに変更

**Rationale:**
- 仕様書で定義した10MB上限に準拠
- 高解像度お品書き（A4スキャン等）に対応
- Firebase Storage無料枠（5GB）内で十分

**Validation:**
```typescript
// クライアント側（MultipleImageUpload.vue）
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Firebase Storage Rules（追加検証）
match /circle-images/{eventId}/{circleId}/{allPaths=**} {
  allow write: if request.resource.size < 10 * 1024 * 1024;
}
```

### 7. パフォーマンス最適化戦略

**Decision**: 段階的読み込み + CSS最適化

**Phase 1 (MVP):**
- CSS `max-width: 100%` でレスポンシブ対応
- 遅延読み込み（2枚目以降は`loading="lazy"`）
- 1枚目のみ優先読み込み

**Phase 2 (Future Enhancement):**
- Firebase Extensions: Resize Images導入
- WebP形式への変換
- ネットワーク状態に応じた品質調整

## 憲章コンプライアンスチェック

### ✅ I. Composables-First Architecture
- `useImageCarousel()`を新規作成
- 既存の`useTouch()`を再利用
- 外部ライブラリ（Swiper等）を使用せず

### ✅ II. Performance-First
- 遅延読み込み実装
- 1枚目優先読み込み
- CSS最適化でレンダリングパフォーマンス確保

### ✅ III. Mobile-First
- タッチスワイプ対応
- レスポンシブ画像（画面幅に自動調整）
- モバイル専用の順序変更UI（ボタン）

### ✅ IV. Progressive Enhancement (PWA)
- オフライン対応（Service Workerでキャッシュ）
- 画像読み込み失敗時のフォールバック

### ✅ V. Real-time Sync
- Firestore `onSnapshot`で画像追加/削除をリアルタイム反映
- サーバータイムスタンプ使用（uploadedAt）

### ✅ VI. Test-Driven Development
- `useImageCarousel.test.ts` (ユニットテスト)
- `MultipleImageUpload.test.ts` (コンポーネントテスト)
- パフォーマンステスト（4枚画像読み込み時間）

### ✅ VII. Logging & Observability
- `useLogger('MultipleImageUpload')`で画像アップロード処理をログ
- エラー時の詳細ログ記録

### ✅ VIII. Documentation-First
- コンポーネントの使用例をJSDocに記載
- 複雑なカルーセルロジックにコメント

## セキュリティ考慮事項

### 1. Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // サークル画像アップロード
    match /circle-images/{eventId}/{circleId}/{imageType}/{fileName} {
      // 読み取り: 全員可能
      allow read: if true;

      // 書き込み: 認証済み + 編集権限保持者のみ
      allow write: if request.auth != null
                   && hasEditPermission(request.auth.uid, circleId)
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 2. XSS対策

- 画像URLは信頼済みFirebase Storageドメインのみ許可
- ユーザー入力（ファイル名）はサニタイズ

### 3. CORS設定

Firebase Storageのデフォルト設定で問題なし（同一オリジン）

## 未解決の技術的課題

### 1. 既存データの移行

**課題**: 既存のサークルで`menuImageUrl: string`を持つデータの移行

**Solution:**
```typescript
// migration script: scripts/migrateMenuImages.ts
// 既存のmenuImageUrlをmenuImages配列に変換
async function migrateCircles() {
  const circles = await firestore
    .collectionGroup('circles')
    .where('menuImageUrl', '!=', null)
    .get();

  for (const doc of circles.docs) {
    const menuImageUrl = doc.data().menuImageUrl;
    await doc.ref.update({
      menuImages: [{
        id: `menu_${Date.now()}`,
        url: menuImageUrl,
        order: 0,
        uploadedAt: FieldValue.serverTimestamp(),
        fileSize: null, // 既存画像はサイズ不明
        fileName: null
      }],
      menuImageUrl: FieldValue.delete() // 古いフィールドを削除
    });
  }
}
```

### 2. 画像削除時のStorage同期

**課題**: Firestoreから画像を削除した際、Firebase Storageのファイルも削除する必要がある

**Solution:**
- クライアント側で削除時に両方削除
- または、Cloud Functions（onDelete trigger）でStorage削除を自動化

### 3. 画像アップロード失敗時のロールバック

**課題**: 4枚中2枚目のアップロードが失敗した場合の処理

**Solution:**
```typescript
// 全画像アップロード成功後にFirestoreを更新
async function uploadAllImages(files: File[]) {
  const uploadedUrls = [];

  try {
    for (const file of files) {
      const url = await uploadImage(file);
      uploadedUrls.push(url);
    }

    // 全て成功後にFirestore更新
    await updateCircleMenuImages(uploadedUrls);
  } catch (error) {
    // 失敗時、アップロード済み画像を削除
    for (const url of uploadedUrls) {
      await deleteImage(url);
    }
    throw error;
  }
}
```

## 次のステップ

✅ Phase 0 完了: 技術調査とアーキテクチャ決定

**Phase 1へ進む準備完了:**
- データモデル設計（data-model.md）
- API契約定義（contracts/）
- クイックスタート（quickstart.md）
