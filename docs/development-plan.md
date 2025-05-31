# geika check! 開発計画書

**バージョン**: 1.0  
**作成日**: 2025 年 6 月 1 日  
**作成者**: 開発チーム

---

## 1. プロジェクト概要

### 1.1 開発目標

アイカツ！シリーズオンリー同人イベント「芸能人はカードが命！（芸カ）」のサークルチェックを効率化する Web アプリケーション「geika check!」の開発

### 1.2 技術スタック

- **フロントエンド**: Nuxt 3 (Vue 3 Composition API)
- **スタイリング**: Tailwind CSS + Headless UI
- **バックエンド**: Firebase (Firestore, Authentication, Storage)
- **言語**: TypeScript
- **デプロイ**: Vercel
- **開発ツール**: ESLint, Prettier, Vitest

### 1.3 開発期間

**総期間**: 3 ヶ月（12 週間）

- **設計フェーズ**: 2 週間
- **開発フェーズ**: 8 週間
- **テスト・デプロイフェーズ**: 2 週間

---

## 2. 開発フェーズ詳細

### Phase 1: 環境構築・基盤整備（Week 1-2）

#### Week 1: プロジェクト初期化

- [x] Nuxt 3 プロジェクトセットアップ
- [ ] TypeScript 設定
- [ ] Tailwind CSS 導入
- [ ] ESLint/Prettier 設定
- [ ] Firebase プロジェクト作成・設定
- [ ] 基本的なディレクトリ構造作成

#### Week 2: 基盤コンポーネント開発

- [ ] レイアウトコンポーネント作成
- [ ] ナビゲーションバー実装
- [ ] 基本的な UI コンポーネント作成
- [ ] Firebase 接続設定
- [ ] 認証システム基盤実装

### Phase 2: コア機能開発（Week 3-6）

#### Week 3: サークル情報表示機能

- [ ] サークルデータモデル定義
- [ ] Firestore スキーマ設計・実装
- [ ] サークル一覧表示コンポーネント
- [ ] サークルカードコンポーネント
- [ ] ページネーション実装

#### Week 4: 検索・フィルタリング機能

- [ ] 検索バーコンポーネント
- [ ] フィルターパネル実装
- [ ] 検索ロジック実装
- [ ] ソート機能実装
- [ ] 検索結果表示

#### Week 5: 認証・ユーザー管理

- [ ] Twitter OAuth 2.0 実装
- [ ] ユーザー情報管理
- [ ] 認証状態管理（Pinia/useState）
- [ ] ログイン/ログアウト機能
- [ ] ユーザープロフィール画面

#### Week 6: ブックマーク機能

- [ ] ブックマークデータモデル
- [ ] ブックマークボタンコンポーネント
- [ ] ブックマーク一覧画面
- [ ] カテゴリ別表示機能
- [ ] ブックマーク管理機能

### Phase 3: 高度な機能開発（Week 7-8）

#### Week 7: マップ表示機能

- [ ] マップコンポーネント実装
- [ ] SVG オーバーレイ機能
- [ ] ブックマークピン表示
- [ ] ズーム・パン機能
- [ ] レスポンシブ対応

#### Week 8: 編集権限システム

- [ ] 編集権限申請システム
- [ ] 半自動承認ロジック
- [ ] 管理者ダッシュボード
- [ ] サークル情報編集機能
- [ ] 権限管理システム

### Phase 4: 追加機能・最適化（Week 9-10）

#### Week 9: サークル登録・編集

- [ ] サークル登録フォーム
- [ ] サークル編集機能
- [ ] 画像アップロード機能
- [ ] バリデーション実装
- [ ] プレビュー機能

#### Week 10: CSV エクスポート・PWA 対応

- [ ] CSV エクスポート機能
- [ ] PWA 設定（Service Worker）
- [ ] オフライン対応
- [ ] プッシュ通知基盤
- [ ] パフォーマンス最適化

### Phase 5: テスト・デプロイ（Week 11-12）

#### Week 11: テスト実装

- [ ] 単体テスト作成（Vitest）
- [ ] コンポーネントテスト
- [ ] E2E テスト（Playwright）
- [ ] パフォーマンステスト
- [ ] セキュリティテスト

#### Week 12: デプロイ・運用準備

- [ ] 本番環境デプロイ
- [ ] CI/CD パイプライン構築
- [ ] 監視・ログ設定
- [ ] ドキュメント整備
- [ ] 運用マニュアル作成

---

## 3. 技術実装詳細

### 3.1 ディレクトリ構造

```
geika-check/
├── components/           # Vueコンポーネント
│   ├── ui/              # 基本UIコンポーネント
│   ├── circle/          # サークル関連コンポーネント
│   ├── bookmark/        # ブックマーク関連コンポーネント
│   ├── map/             # マップ関連コンポーネント
│   └── layout/          # レイアウトコンポーネント
├── composables/         # Composition API関数
├── pages/               # ページコンポーネント
├── server/              # サーバーサイドAPI
├── types/               # TypeScript型定義
├── utils/               # ユーティリティ関数
├── assets/              # 静的アセット
├── public/              # 公開ファイル
└── docs/                # ドキュメント
```

### 3.2 主要コンポーネント設計

#### 3.2.1 CircleCard.vue

```vue
<template>
  <div class="circle-card">
    <div class="circle-header">
      <h3>{{ circle.circleName }}</h3>
      <BookmarkButton :circle-id="circle.id" />
    </div>
    <div class="circle-info">
      <p>ジャンル: {{ circle.genre.join(", ") }}</p>
      <p>配置: {{ formatPlacement(circle.placement) }}</p>
      <div class="tags">
        <span v-for="tag in circle.tags" :key="tag" class="tag">
          #{{ tag }}
        </span>
      </div>
    </div>
    <div class="circle-links">
      <a v-if="circle.contact.twitter" :href="twitterUrl" target="_blank">
        <Icon name="twitter" />
      </a>
      <a
        v-if="circle.contact.pixiv"
        :href="circle.contact.pixiv"
        target="_blank"
      >
        <Icon name="pixiv" />
      </a>
      <a
        v-if="circle.contact.oshinaUrl"
        :href="circle.contact.oshinaUrl"
        target="_blank"
      >
        お品書き
      </a>
    </div>
  </div>
</template>
```

#### 3.2.2 SearchBar.vue

```vue
<template>
  <div class="search-container">
    <div class="search-input">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="サークル名、タグで検索..."
        @input="onSearch"
      />
      <Icon name="search" />
    </div>
    <button @click="toggleFilters" class="filter-button">
      <Icon name="filter" />
      フィルター
    </button>
    <FilterPanel v-if="showFilters" @apply="onFilterApply" />
  </div>
</template>
```

### 3.3 状態管理設計

#### 3.3.1 認証状態管理

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState<User | null>("auth.user", () => null);
  const isAuthenticated = computed(() => !!user.value);

  const signInWithTwitter = async () => {
    // Twitter OAuth実装
  };

  const signOut = async () => {
    // サインアウト実装
  };

  return {
    user: readonly(user),
    isAuthenticated,
    signInWithTwitter,
    signOut,
  };
};
```

#### 3.3.2 サークル状態管理

```typescript
// composables/useCircles.ts
export const useCircles = () => {
  const circles = ref<Circle[]>([]);
  const loading = ref(false);
  const filters = ref<SearchFilters>({});

  const fetchCircles = async (params?: SearchParams) => {
    // Firestore からサークル情報取得
  };

  const searchCircles = async (query: string) => {
    // 検索実装
  };

  return {
    circles: readonly(circles),
    loading: readonly(loading),
    fetchCircles,
    searchCircles,
  };
};
```

### 3.4 Firebase 設定

#### 3.4.1 Firestore 設定

```typescript
// plugins/firebase.client.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // 設定値
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

#### 3.4.2 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー情報
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // サークル情報
    match /circles/{circleId} {
      allow read: if resource.data.isPublic == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (request.auth.uid == resource.data.ownerId ||
         hasEditPermission(request.auth.uid, circleId));
    }

    // ブックマーク
    match /bookmarks/{bookmarkId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 4. 品質管理

### 4.1 コード品質

- **TypeScript**: 型安全性の確保
- **ESLint**: コード規約の統一
- **Prettier**: コードフォーマットの統一
- **Husky**: Git hooks による品質チェック

### 4.2 テスト戦略

- **単体テスト**: 80%以上のカバレッジ
- **コンポーネントテスト**: 主要コンポーネントの動作確認
- **E2E テスト**: 主要ユーザーフローの自動テスト
- **パフォーマンステスト**: Core Web Vitals の監視

### 4.3 セキュリティ

- **認証**: Firebase Authentication
- **認可**: Firestore Security Rules
- **XSS 対策**: 入力値サニタイゼーション
- **CSRF 対策**: SameSite Cookie 設定

---

## 5. デプロイ・運用

### 5.1 環境構成

- **開発環境**: `dev-geika-check.vercel.app`
- **ステージング環境**: `staging-geika-check.vercel.app`
- **本番環境**: `geika-check.com`

### 5.2 CI/CD パイプライン

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
```

### 5.3 監視・ログ

- **エラー監視**: Sentry
- **パフォーマンス監視**: Vercel Analytics
- **ユーザー行動分析**: Firebase Analytics
- **アップタイム監視**: UptimeRobot

---

## 6. リスク管理

### 6.1 技術リスク

| リスク             | 影響度 | 確率 | 対策                           |
| ------------------ | ------ | ---- | ------------------------------ |
| Firebase 制限      | 高     | 中   | 事前負荷テスト、キャッシュ戦略 |
| サードパーティ障害 | 高     | 低   | フォールバック機能、冗長化     |
| パフォーマンス問題 | 中     | 中   | 継続的な最適化、監視           |

### 6.2 スケジュールリスク

| リスク       | 影響度 | 確率 | 対策                           |
| ------------ | ------ | ---- | ------------------------------ |
| 機能要件変更 | 中     | 高   | スコープ管理、変更管理プロセス |
| 開発遅延     | 高     | 中   | バッファ期間確保、優先度管理   |

---

## 7. 成功指標

### 7.1 技術指標

- **パフォーマンス**: Lighthouse スコア 90 以上
- **可用性**: 99.9%以上の稼働率
- **セキュリティ**: 脆弱性ゼロ
- **テストカバレッジ**: 80%以上

### 7.2 ユーザー指標

- **ユーザー満足度**: 4.5/5.0 以上
- **ページ読み込み時間**: 3 秒以内
- **エラー率**: 1%以下
- **リピート率**: 70%以上

---

## 8. 次のステップ

1. **環境構築の完了**: Firebase 設定、Tailwind CSS 導入
2. **基盤コンポーネントの実装**: レイアウト、ナビゲーション
3. **コア機能の開発開始**: サークル表示、検索機能
4. **継続的な品質管理**: テスト実装、コードレビュー

---

**更新履歴**
| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0 | 2025-06-01 | 初版作成 |
