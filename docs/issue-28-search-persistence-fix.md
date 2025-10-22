# Issue #28: 検索バーの内容が画面遷移時に保持されない問題の修正計画書

## 問題の概要

### 現在発生している問題
サークル一覧画面で検索を行った後、サークル詳細に移動して戻ってくると検索バーの内容がクリアされ、ユーザーエクスペリエンスが損なわれている。

### 不具合が発生する操作フロー
1. サークル一覧画面（`/circles`）で検索ワードを入力
2. 検索結果が表示される
3. サークル詳細画面（`/circles/[id]`）に遷移
4. 詳細画面で「戻る」ボタン（`$router.back()`）をクリック
5. **検索バーの内容がクリアされ、全件表示に戻る**（⚠️ 問題箇所）

## 現在の実装状況分析

### サークル一覧画面（`pages/circles/index.vue`）

#### 検索状態の管理
```typescript
// State（リアクティブな状態管理）
const searchQuery = ref('')  // ⚠️ 問題: ローカル状態のためページ遷移で失われる
const currentPage = ref(1)
const itemsPerPage = ref(12)
```

#### 検索処理
```typescript
const handleRealtimeSearch = () => {
  if (searchTimeoutId.value) {
    clearTimeout(searchTimeoutId.value)
  }

  searchTimeoutId.value = setTimeout(async () => {
    currentPage.value = 1
    await performSearch(searchQuery.value, {
      page: currentPage.value,
      limit: itemsPerPage.value
    }, currentEvent.value?.id)
  }, 300)
}
```

#### 戻る処理の問題点
```vue
<button @click="$router.back()" class="back-button">
  ← 戻る
</button>
```
`$router.back()`により前のページに戻るが、Vue 3のリアクティブな状態は再初期化される。

### useCircles composableの状態管理

#### 現在の実装
```typescript
const circles = useState<Circle[]>("circles.list", () => []);
const loading = useState<boolean>("circles.loading", () => false);
const error = useState<string | null>("circles.error", () => null);
```

#### 分析結果
- `circles`、`loading`、`error`は`useState`で管理されており、ページ遷移をまたいで保持される
- しかし、**検索クエリやページネーション情報は保持されていない**

## 根本原因

1. **検索状態がローカル状態**：`pages/circles/index.vue`の`searchQuery`がrefで管理されており、ページ遷移で失われる
2. **ページネーション状態がローカル状態**：`currentPage`、`itemsPerPage`も同様に失われる
3. **検索結果の復元ロジックがない**：戻ってきた時に前回の検索状態を復元する仕組みがない

## 解決策

### Phase 1: 検索状態の永続化（推奨アプローチ）

#### 1. useCircles composableに検索状態を追加

```typescript
// composables/useCircles.ts
export const useCircles = () => {
  // 既存の状態
  const circles = useState<Circle[]>("circles.list", () => []);
  const loading = useState<boolean>("circles.loading", () => false);
  const error = useState<string | null>("circles.error", () => null);

  // 🆕 新規追加：検索状態の永続化
  const searchState = useState<{
    query: string;
    currentPage: number;
    itemsPerPage: number;
  }>("circles.searchState", () => ({
    query: '',
    currentPage: 1,
    itemsPerPage: 12
  }));

  // 検索状態の更新関数
  const updateSearchState = (updates: Partial<typeof searchState.value>) => {
    searchState.value = { ...searchState.value, ...updates };
  };

  // 検索状態をリセット
  const resetSearchState = () => {
    searchState.value = {
      query: '',
      currentPage: 1,
      itemsPerPage: 12
    };
  };

  return {
    // 既存
    circles: readonly(circles),
    loading: readonly(loading),
    error: readonly(error),

    // 🆕 新規追加
    searchState: readonly(searchState),
    updateSearchState,
    resetSearchState,

    // 既存の関数...
  };
};
```

#### 2. pages/circles/index.vueの修正

```vue
<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- 検索バー -->
    <div style="display: flex; gap: 1rem; align-items: center;">
      <div style="flex: 1; position: relative;">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          @input="handleRealtimeSearch"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>
    <!-- 以下既存のテンプレート -->
  </div>
</template>

<script setup lang="ts">
// Composables
const {
  circles,
  loading,
  error,
  searchState, // 🆕 新規追加
  updateSearchState, // 🆕 新規追加
  fetchCircles,
  performSearch
} = useCircles()

// 🔄 変更: ローカル状態を永続化された状態に置き換え
const searchQuery = computed({
  get: () => searchState.value.query,
  set: (value: string) => updateSearchState({ query: value })
});

const currentPage = computed({
  get: () => searchState.value.currentPage,
  set: (value: number) => updateSearchState({ currentPage: value })
});

const itemsPerPage = computed({
  get: () => searchState.value.itemsPerPage,
  set: (value: number) => updateSearchState({ itemsPerPage: value })
});

// 🆕 ページ復帰時の検索状態復元
const restoreSearchState = async () => {
  if (searchState.value.query) {
    // 前回の検索クエリがある場合、検索を実行
    await performSearch(searchState.value.query, {
      page: searchState.value.currentPage,
      limit: searchState.value.itemsPerPage
    }, currentEvent.value?.id);
  } else {
    // 検索クエリがない場合、全件取得
    await fetchData();
  }
};

// 🔄 変更: onMounted処理の更新
onMounted(async () => {
  logger.info('🚀 Circles page mounted')

  checkMobileSize()

  if (process.client) {
    window.addEventListener('resize', checkMobileSize)
  }

  try {
    await fetchEvents()
    const hasCurrentEvent = await waitForCurrentEvent()

    if (!hasCurrentEvent) {
      console.error('❌ currentEventが利用できません')
      return
    }

    // 🆕 検索状態を復元
    await restoreSearchState()
    await fetchPopularGenres()

    logger.info('✅ Circlesページ初期化完了')
  } catch (error) {
    console.error('❌ 初期化エラー:', error)
  }
})

// 既存のメソッド（変更なし）
const handleSearch = async () => {
  currentPage.value = 1
  await performSearch(searchQuery.value, {
    page: currentPage.value,
    limit: itemsPerPage.value
  }, currentEvent.value?.id)
}

const handleRealtimeSearch = () => {
  if (searchTimeoutId.value) {
    clearTimeout(searchTimeoutId.value)
  }

  searchTimeoutId.value = setTimeout(async () => {
    currentPage.value = 1
    await performSearch(searchQuery.value, {
      page: currentPage.value,
      limit: itemsPerPage.value
    }, currentEvent.value?.id)
  }, 300)
}
</script>
```

### Phase 2: 任意機能の追加（UX向上）

#### 1. 検索履歴機能
```typescript
// composables/useCircles.ts に追加
const searchHistory = useState<string[]>("circles.searchHistory", () => []);

const addToSearchHistory = (query: string) => {
  if (query && query.trim()) {
    const trimmedQuery = query.trim();
    const history = [...searchHistory.value];

    // 重複を削除
    const index = history.indexOf(trimmedQuery);
    if (index > -1) {
      history.splice(index, 1);
    }

    // 最新を先頭に追加
    history.unshift(trimmedQuery);

    // 最大10件まで保持
    searchHistory.value = history.slice(0, 10);
  }
};
```

#### 2. 検索状態のクリアボタン追加
```vue
<!-- pages/circles/index.vue に追加 -->
<template>
  <div class="search-controls">
    <button
      v-if="searchQuery"
      @click="clearSearchState"
      class="clear-search-button"
    >
      🗑️ 検索をクリア
    </button>
  </div>
</template>

<script setup lang="ts">
const clearSearchState = async () => {
  resetSearchState();
  await fetchData();
};
</script>
```

### Phase 3: 代替アプローチ（SessionStorage使用）

Nuxt 3の`useState`以外の方法として、SessionStorageを使用する方法：

```typescript
// composables/useSearchPersistence.ts（新規作成）
export const useSearchPersistence = () => {
  const STORAGE_KEY = 'circles_search_state';

  const saveSearchState = (state: SearchState) => {
    if (process.client) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  };

  const loadSearchState = (): SearchState | null => {
    if (process.client) {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  };

  const clearSearchState = () => {
    if (process.client) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    saveSearchState,
    loadSearchState,
    clearSearchState
  };
};
```

## 実装ロードマップ

### Step 1: コアの検索状態永続化（優先度: High）
- [x] `useCircles` composableに`searchState`を追加
- [x] `pages/circles/index.vue`で永続化された状態を使用
- [x] ページ復帰時の状態復元ロジック実装

### Step 2: UX改善（優先度: Medium）
- [ ] 検索履歴機能の実装
- [ ] 検索状態クリアボタンの追加
- [ ] 検索中の視覚的フィードバック改善

### Step 3: 高度な機能（優先度: Low）
- [ ] 検索結果のキャッシュ最適化
- [ ] URL同期（クエリパラメータ）
- [ ] 検索分析・統計機能

## 期待される効果

### 即時効果
1. **UX大幅改善**: ユーザーが検索→詳細→戻るの操作で検索状態が保持される
2. **操作効率向上**: 再検索の手間が不要になる
3. **離脱率低下**: ストレスフルな操作の改善

### 長期効果
1. **ユーザー満足度向上**: 直感的な操作フローの実現
2. **アプリの使いやすさ向上**: PWAとしての完成度が高まる
3. **検索利用率向上**: 便利な検索機能により検索利用が促進される

## リスク評価

### Phase 1のリスク
- **極低**: `useState`を使った確立されたパターンの拡張のみ
- **互換性**: 既存機能への影響なし

### 考慮事項
- **メモリ使用量**: 検索状態の永続化により若干のメモリ使用量増加
- **状態管理の複雑化**: composableに状態が追加されるが、適切に抽象化されている

## テスト計画

### テストケース
1. **基本動作**: 検索→詳細→戻る→検索状態保持の確認
2. **ページネーション**: ページ移動→詳細→戻る→ページ位置保持の確認
3. **検索クリア**: クリア機能の正常動作確認
4. **イベント切り替え**: 異なるイベント間での状態独立性確認
5. **ブラウザリロード**: リロード後の状態初期化確認

### 確認項目
- [ ] 検索ワード入力→詳細画面→戻る→検索ワードが保持されている
- [ ] ページ番号→詳細画面→戻る→同じページ番号が保持されている
- [ ] 検索結果が正しく復元される
- [ ] パフォーマンスに悪影響がない

## 関連ファイル

- `composables/useCircles.ts` - 検索状態の永続化
- `pages/circles/index.vue` - 検索UI と状態管理
- `pages/circles/[id].vue` - 戻るボタン（変更不要）
- `types/index.ts` - 型定義（必要に応じて追加）

---

**作成日**: 2025-01-22
**対応Issue**: [#28](https://github.com/kainoika/geika-check/issues/28)
**優先度**: High
**予想工数**: Phase 1 (0.5日) + Phase 2 (1日) + Phase 3 (0.5日)