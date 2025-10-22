# Issue #30: 頒布物の表示・登録機能の見直し修正計画書

## 問題の概要

### 現在発生している問題

#### 1. 表示の問題
- **スマートフォン表示での文字見切れ**: 説明文が約200文字程度入力されると、スマホ上で見切れが発生する
- **具体的な問題事例**: 以下のような長めの説明文が適切に表示されない
```
アイカツ！シリーズオンリーイベント 『芸能人はカードが命！32』で頒布した漫画本となります。

【内容】
　モノクロ/A5/20P(本文16P)
　ユウちゃんとアカジェネ(あかりちゃん、スミレちゃん、まつりちゃん)がパンケーキを作って食べるお話
```

#### 2. 登録機能の不足
- **カテゴリ機能がない**: 漫画、イラスト本、グッズなどの分類ができない
- **カテゴリ入力方式の要件**: プルダウンではなく自由記入形式が必要
- **例示の必要性**: プレースホルダで入力例を表示する必要がある

## 現在の実装状況分析

### 頒布物データ構造（`types/index.ts`）

#### 現在の`CircleItem`インターフェース
```typescript
export interface CircleItem {
  id: string;
  name: string; // 頒布物名
  price: number; // 価格
  description?: string; // 頒布物の説明
  isAvailable: boolean; // 在庫有無
  onlineShopLinks?: OnlineShopLinks; // オンライン通販リンク
  createdAt: Date;
  updatedAt: Date;
}
```

#### 現在の`CircleItemFormData`インターフェース
```typescript
export interface CircleItemFormData {
  name: string;
  price: number;
  description?: string;
  isAvailable: boolean;
  onlineShopLinks?: OnlineShopLinks;
}
```

**問題点**: `category`フィールドが存在しない

### UI表示部分（`components/circle/CircleItemManager.vue`）

#### 現在の説明文表示
```vue
<p v-if="item.description" class="text-sm text-gray-500 mt-2 line-clamp-2">
  {{ item.description }}
</p>
```

#### 現在の`line-clamp-2`スタイル（`components/circle/CircleCard.vue`）
```css
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

**問題点**:
1. `line-clamp-2`で2行に制限されているため、長文が切り捨てられる
2. スマートフォンでの表示を考慮した適切な行数設定がされていない
3. 「続きを読む」機能がない

### 登録フォーム部分

#### 現在のフォーム構造
```vue
<div>
  <label class="block text-sm font-medium text-gray-700">
    頒布物名 <span class="text-red-500">*</span>
  </label>
  <input v-model="formData.name" type="text" required
    placeholder="例: イラスト集、アクリルキーホルダー" />
</div>

<div>
  <label class="block text-sm font-medium text-gray-700">説明</label>
  <textarea v-model="formData.description" rows="3"
    placeholder="頒布物の詳細説明"></textarea>
</div>
```

**問題点**: カテゴリ入力フィールドがない

## 根本原因分析

### 1. データモデルの不完全性
- `CircleItem`および`CircleItemFormData`にカテゴリフィールドが存在しない
- カテゴリによる分類・フィルタリング機能が実装されていない

### 2. UI設計の制約
- 固定の`line-clamp-2`により長文表示が制限される
- モバイル表示での可読性が考慮されていない
- 展開・折りたたみ機能が未実装

### 3. UX設計の不備
- ユーザーが頒布物の全体像を把握しづらい
- カテゴリ情報がないため検索・絞り込みができない

## 解決策

### Phase 1: データ構造の拡張

#### 1. 型定義の更新
```typescript
// types/index.ts
export interface CircleItem {
  id: string;
  name: string; // 頒布物名
  category?: string; // 🆕 新規追加: カテゴリ（例: 漫画、イラスト本、グッズ）
  price: number; // 価格
  description?: string; // 頒布物の説明
  isAvailable: boolean; // 在庫有無
  onlineShopLinks?: OnlineShopLinks; // オンライン通販リンク
  createdAt: Date;
  updatedAt: Date;
}

export interface CircleItemFormData {
  name: string;
  category?: string; // 🆕 新規追加: カテゴリフィールド
  price: number;
  description?: string;
  isAvailable: boolean;
  onlineShopLinks?: OnlineShopLinks;
}
```

#### 2. 推奨カテゴリ定数の定義
```typescript
// utils/circleItemCategories.ts（新規作成）
export const RECOMMENDED_CATEGORIES = [
  '漫画',
  'イラスト本',
  'グッズ',
  'アクリルキーホルダー',
  'アクリルスタンド',
  'ポストカード',
  'ステッカー',
  'バッジ',
  'クリアファイル',
  '缶バッジ',
  'その他'
] as const;

export type RecommendedCategory = typeof RECOMMENDED_CATEGORIES[number];
```

### Phase 2: UI表示の改善

#### 1. 長文説明の展開・折りたたみ機能
```vue
<!-- components/circle/CircleItemManager.vue の修正 -->
<template>
  <div v-if="item.description" class="text-sm text-gray-500 mt-2">
    <!-- 短縮表示 -->
    <p v-if="!expandedDescriptions[item.id]" class="line-clamp-3">
      {{ item.description }}
      <!-- 長文の場合のみ展開ボタンを表示 -->
      <button
        v-if="item.description.length > 120"
        @click="toggleDescription(item.id)"
        class="text-blue-600 hover:text-blue-800 ml-1 font-medium"
      >
        続きを読む
      </button>
    </p>

    <!-- 展開表示 -->
    <div v-else>
      <p class="whitespace-pre-wrap">{{ item.description }}</p>
      <button
        @click="toggleDescription(item.id)"
        class="text-blue-600 hover:text-blue-800 mt-2 font-medium"
      >
        折りたたむ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 説明文の展開状態管理
const expandedDescriptions = ref<Record<string, boolean>>({});

const toggleDescription = (itemId: string) => {
  expandedDescriptions.value[itemId] = !expandedDescriptions.value[itemId];
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 2行 → 3行に変更 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5; /* 行間を調整 */
}
</style>
```

#### 2. カテゴリ表示の追加
```vue
<!-- 頒布物一覧での表示 -->
<div class="flex items-start">
  <div class="flex-1 min-w-0">
    <!-- カテゴリバッジ -->
    <div v-if="item.category" class="mb-2">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {{ item.category }}
      </span>
    </div>

    <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
    <!-- ... 既存の表示内容 ... -->
  </div>
</div>
```

### Phase 3: 登録フォームの改善

#### 1. カテゴリ入力フィールドの追加
```vue
<!-- components/circle/CircleItemManager.vue のフォーム部分 -->
<div>
  <label class="block text-sm font-medium text-gray-700">
    カテゴリ
  </label>
  <input
    v-model="formData.category"
    type="text"
    list="category-suggestions"
    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    placeholder="例: 漫画、イラスト本、グッズ、アクリルキーホルダー"
  />

  <!-- データリストで入力候補を提供 -->
  <datalist id="category-suggestions">
    <option v-for="category in RECOMMENDED_CATEGORIES" :key="category" :value="category" />
  </datalist>

  <p class="mt-1 text-xs text-gray-500">
    よく使われる例: {{ RECOMMENDED_CATEGORIES.slice(0, 5).join('、') }}など
  </p>
</div>
```

#### 2. フォームデータの更新
```typescript
// CircleItemManager.vue のスクリプト部分
import { RECOMMENDED_CATEGORIES } from '~/utils/circleItemCategories'

const formData = reactive<CircleItemFormData>({
  name: '',
  category: '', // 🆕 新規追加
  price: 0,
  description: '',
  isAvailable: true,
  onlineShopLinks: {
    booth: '',
    melonbooks: '',
    toranoana: '',
    other: ''
  }
})

const resetForm = () => {
  formData.name = ''
  formData.category = '' // 🆕 新規追加
  formData.price = 0
  formData.description = ''
  formData.isAvailable = true
  formData.onlineShopLinks = {
    booth: '',
    melonbooks: '',
    toranoana: '',
    other: ''
  }
  editingItem.value = null
}

const editItem = (item: CircleItem) => {
  editingItem.value = item
  formData.name = item.name
  formData.category = item.category || '' // 🆕 新規追加
  formData.price = item.price
  formData.description = item.description || ''
  formData.isAvailable = item.isAvailable
  formData.onlineShopLinks = {
    booth: item.onlineShopLinks?.booth || '',
    melonbooks: item.onlineShopLinks?.melonbooks || '',
    toranoana: item.onlineShopLinks?.toranoana || '',
    other: item.onlineShopLinks?.other || ''
  }
  showAddForm.value = true
}
```

### Phase 4: バックエンド連携の更新

#### 1. データベース更新処理の修正
```typescript
// pages/circles/[id].vue の関数更新
const addItem = async (itemData: CircleItemFormData) => {
  if (!circle.value) return

  try {
    saving.value = true

    const newItem: CircleItem = {
      id: generateId(), // ID生成ユーティリティ
      name: itemData.name,
      category: itemData.category, // 🆕 新規追加
      price: itemData.price,
      description: itemData.description,
      isAvailable: itemData.isAvailable,
      onlineShopLinks: itemData.onlineShopLinks,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedItems = [...(circle.value.items || []), newItem]

    await updateCircle(circle.value.id, circle.value.eventId, {
      items: updatedItems
    })

    circle.value.items = updatedItems

  } catch (err) {
    console.error('Add item error:', err)
    // エラーハンドリング
  } finally {
    saving.value = false
  }
}
```

### Phase 5: 付加機能の実装

#### 1. カテゴリ別フィルタリング機能
```vue
<!-- カテゴリフィルター -->
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    カテゴリで絞り込み
  </label>
  <select
    v-model="selectedCategory"
    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  >
    <option value="">すべて表示</option>
    <option v-for="category in availableCategories" :key="category" :value="category">
      {{ category }}
    </option>
  </select>
</div>
```

#### 2. 検索・ソート機能
```typescript
// カテゴリ別の統計情報
const categoryStats = computed(() => {
  const stats: Record<string, number> = {}
  props.items.forEach(item => {
    if (item.category) {
      stats[item.category] = (stats[item.category] || 0) + 1
    }
  })
  return stats
})

// 利用可能なカテゴリ一覧
const availableCategories = computed(() => {
  const categories = [...new Set(props.items.map(item => item.category).filter(Boolean))]
  return categories.sort()
})

// フィルタリング済みアイテム
const filteredItems = computed(() => {
  let filtered = props.items

  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value)
  }

  return filtered
})
```

## 実装ロードマップ

### Step 1: 型定義とユーティリティの追加（優先度: High）
- [x] `CircleItem`および`CircleItemFormData`にcategoryフィールド追加
- [x] `utils/circleItemCategories.ts`でカテゴリ定数定義
- [x] 型チェックの実行

### Step 2: UI表示の改善（優先度: High）
- [ ] `line-clamp-2` → `line-clamp-3`への変更
- [ ] 説明文の展開・折りたたみ機能実装
- [ ] カテゴリバッジ表示の追加

### Step 3: 登録フォームの拡張（優先度: High）
- [ ] カテゴリ入力フィールドの追加
- [ ] datalist による入力候補機能
- [ ] フォームデータ処理の更新

### Step 4: データ処理の更新（優先度: Medium）
- [ ] 頒布物追加・更新処理のcategory対応
- [ ] バリデーション機能の追加

### Step 5: 付加機能の実装（優先度: Low）
- [ ] カテゴリフィルタリング機能
- [ ] カテゴリ別統計表示
- [ ] 検索・ソート機能

## 期待される効果

### 表示改善の効果
1. **可読性向上**: 長文説明が適切に表示される
2. **UX向上**: 「続きを読む」で詳細情報をコントロール可能
3. **モバイル対応**: スマートフォンでの見切れ問題解決

### カテゴリ機能の効果
1. **分類整理**: 頒布物の種類が明確になり、ユーザーが把握しやすい
2. **検索効率**: カテゴリでの絞り込みにより目的のアイテムを見つけやすい
3. **データ価値**: カテゴリ統計により運営側で傾向分析が可能

### 全体的な効果
1. **サークル運営者**: より詳細で整理された頒布物情報の登録が可能
2. **来場者**: 欲しいアイテムを効率的に見つけられる
3. **イベント運営**: 頒布物カテゴリの傾向把握が可能

## リスク評価

### データ構造変更のリスク
- **中**: 既存データの`category`フィールドは`undefined`になるが、オプショナルフィールドなので問題なし
- **対策**: 段階的ロールアウトと十分なテスト実施

### UI変更のリスク
- **低**: 表示改善のみで既存機能に影響なし
- **対策**: レスポンシブデザインでの十分な確認

## テスト計画

### 表示テスト
1. **長文表示**: 200文字程度の説明文での表示確認
2. **展開・折りたたみ**: 機能の正常動作確認
3. **レスポンシブ**: スマートフォンでの表示確認

### カテゴリ機能テスト
1. **入力機能**: datalistの動作確認
2. **表示機能**: カテゴリバッジの表示確認
3. **フィルタリング**: カテゴリ別絞り込みの動作確認

### データ処理テスト
1. **CRUD操作**: カテゴリ付きアイテムの追加・更新・削除
2. **後方互換性**: 既存データ（category未設定）の正常動作
3. **バリデーション**: 不正データの適切な処理

## 関連ファイル

### 修正対象ファイル
- `types/index.ts` - 型定義の更新
- `components/circle/CircleItemManager.vue` - UI改善とフォーム拡張
- `pages/circles/[id].vue` - データ処理の更新

### 新規作成ファイル
- `utils/circleItemCategories.ts` - カテゴリ定数定義

### テストファイル
- `test/components/CircleItemManager.test.ts` - コンポーネントテスト
- `test/utils/circleItemCategories.test.ts` - ユーティリティテスト

---

**作成日**: 2025-01-22
**対応Issue**: [#30](https://github.com/kainoika/geika-check/issues/30)
**優先度**: High
**予想工数**: Step 1-3 (1.5日) + Step 4-5 (1日)
**期待効果**: 表示品質向上 + 頒布物管理効率化 + ユーザビリティ改善