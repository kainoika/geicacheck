# Issue #33 修正計画書: 巡回済みブックマークステータス機能

## 概要

**Issue**: [#33] ブックマークしたサークルについて、巡回済みのチェックが付けられるようにする

**目的**: イベント当日にユーザーがブックマークしたサークルを実際に巡回した後、「巡回済み」ステータスに変更できる機能を追加する

## 現状分析

### 既存のブックマーク機能
- **ブックマークカテゴリ**: `"check" | "interested" | "priority"`の3段階
- **実装場所**:
  - `types/index.ts:88` - BookmarkCategory型定義
  - `composables/useBookmarks.ts` - ブックマーク管理ロジック
  - `pages/bookmarks/index.vue` - ブックマーク一覧ページ
  - `pages/map/index.vue` - マップページ

### 問題点
1. **巡回状態の管理不足**: 既存の3カテゴリは「事前計画」の段階のもので、「巡回完了」の状態を表現できない
2. **UI操作の制限**: マップページやブックマークページでの状態変更機能が限定的
3. **データモデルの拡張性**: 新しいステータス概念に対応する必要がある

## 解決方針

### アプローチ選択

**選択肢1**: BookmarkCategoryに`"visited"`を追加
- **メリット**: 実装が簡単、既存ロジックとの整合性
- **デメリット**: 事前計画と実行結果を混同、UI設計が複雑化

**選択肢2**: 独立した`visited`フラグを追加 ⭐️**推奨**
- **メリット**: 概念の分離、柔軟なUI設計、拡張性
- **デメリット**: データ構造とロジックの変更が必要

**採用方針**: **選択肢2**を採用し、`visited`フラグを独立して管理

## 修正計画

### Phase 1: データ構造拡張（必須）

#### 1.1 型定義の拡張
**ファイル**: `types/index.ts`

```typescript
// 既存
export interface Bookmark {
  id: string;
  userId: string;
  circleId: string;
  eventId: string;
  category: BookmarkCategory;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 修正後
export interface Bookmark {
  id: string;
  userId: string;
  circleId: string;
  eventId: string;
  category: BookmarkCategory;
  visited: boolean; // 🆕 巡回済みフラグ
  visitedAt?: Date; // 🆕 巡回日時（オプション）
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 1.2 フォームデータ型の拡張
```typescript
export interface BookmarkFormData {
  category: BookmarkCategory;
  visited?: boolean; // 🆕
  memo?: string;
}
```

### Phase 2: ビジネスロジック拡張（必須）

#### 2.1 useBookmarks.tsの拡張
**ファイル**: `composables/useBookmarks.ts`

**新機能**:
- `toggleVisited(circleId: string)` - 巡回済み状態のトグル
- `markAsVisited(circleId: string)` - 巡回済みに設定
- `markAsNotVisited(circleId: string)` - 巡回済み解除
- `getVisitedBookmarks()` - 巡回済みブックマーク一覧取得

**修正箇所**:
- `addBookmark` - visited初期値設定
- `updateBookmark` - visited更新対応
- `fetchBookmarks` - visited情報の読み込み
- `generateExportData` - CSV出力に巡回状態を追加

#### 2.2 統計情報の拡張
```typescript
const bookmarksByStatus = computed(() => {
  const stats = {
    total: bookmarks.value.length,
    visited: bookmarks.value.filter(b => b.visited).length,
    notVisited: bookmarks.value.filter(b => !b.visited).length,
    byCategory: {
      check: { total: 0, visited: 0 },
      interested: { total: 0, visited: 0 },
      priority: { total: 0, visited: 0 }
    }
  };
  // 統計計算ロジック...
  return stats;
});
```

### Phase 3: UIコンポーネント拡張（必須）

#### 3.1 ブックマーク一覧ページの拡張
**ファイル**: `pages/bookmarks/index.vue`

**新機能**:
- 巡回済み/未巡回のフィルター機能
- 巡回済みマーク表示（チェックアイコン等）
- ワンクリック巡回完了ボタン
- 巡回統計の表示（例：「12/20件巡回済み」）

**UI改善**:
```vue
<template>
  <!-- フィルターオプション -->
  <div class="filter-section">
    <label>
      <input type="checkbox" v-model="showVisited" />
      巡回済み表示 ({{ visitedCount }}件)
    </label>
  </div>

  <!-- ブックマークアイテム -->
  <div v-for="bookmark in filteredBookmarks" class="bookmark-item">
    <!-- 既存の表示 -->
    <div class="bookmark-status">
      <button
        @click="toggleVisited(bookmark.circleId)"
        :class="['visited-button', { 'visited': bookmark.visited }]">
        <CheckIcon v-if="bookmark.visited" />
        巡回{{ bookmark.visited ? '済' : '予定' }}
      </button>
    </div>
  </div>
</template>
```

#### 3.2 マップページの拡張
**ファイル**: `pages/map/index.vue`

**新機能**:
- ピンの視覚的区別（巡回済み：薄色表示、チェックマーク等）
- 巡回済みクイック操作（ピンクリックで即座に状態変更）
- 巡回進捗表示（「5/12サークル巡回完了」等）

**実装例**:
```vue
<template>
  <!-- 進捗表示 -->
  <div class="visit-progress">
    {{ visitedCount }}/{{ totalBookmarks }} サークル巡回済み
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: visitProgressPercent + '%' }"></div>
    </div>
  </div>

  <!-- SVGピンにvisited状態を反映 -->
  <circle
    v-for="pin in pins"
    :class="['map-pin', pin.visited ? 'visited' : 'not-visited']"
    @click="handlePinClick(pin)"
  />
</template>
```

### Phase 4: データベース対応（必須）

#### 4.1 Firestore互換性確保
- 既存データの`visited`フィールドがない問題への対応
- デフォルト値の設定（`visited: false`）
- マイグレーション不要の実装

#### 4.2 セキュリティルールの確認
**ファイル**: `firestore.rules`

既存のルールでvisitedフィールドの更新が許可されているか確認

### Phase 5: エクスポート機能拡張（推奨）

#### 5.1 CSV出力の拡張
巡回状態をCSVに含める：
- 「巡回済み」列の追加
- 巡回日時の出力
- フィルター条件に巡回状態を追加

## 実装優先順位

### 🔥 Phase 1-2（必須・最優先）
- データ構造とビジネスロジックの基盤整備
- 既存機能に影響を与えないよう慎重に実装

### ⭐️ Phase 3（必須・高優先）
- ユーザーが直接操作するUI部分
- 使いやすさを重視した設計

### 💡 Phase 4-5（推奨・中優先）
- システム全体の整合性とデータ整備
- 付加価値機能の追加

## 技術的考慮事項

### データ移行
- 既存ブックマークには`visited: false`をデフォルト設定
- 実際のデータ移行は不要（コード内でデフォルト値処理）

### パフォーマンス
- 新しいフィールド追加による読み取りコスト増加は軽微
- インデックス追加は現時点では不要

### ユーザビリティ
- 直感的な操作（ワンクリックで状態変更）
- 視覚的フィードバック（色、アイコンによる状態表示）
- 進捗感のあるUI（統計情報表示）

## 期待される効果

1. **イベント当日の利便性向上**
   - 巡回計画と実行状況の可視化
   - 効率的な会場回り

2. **事後分析の有効化**
   - 巡回実績の記録
   - 次回イベントでの参考データ

3. **ユーザーエクスペリエンス向上**
   - 達成感のある UI
   - 計画性のあるイベント参加体験

## リスクと対策

### リスク
- 既存機能への影響
- UI複雑化によるユーザビリティ低下

### 対策
- 段階的な実装とテスト
- 既存機能を壊さない後方互換性の確保
- シンプルで直感的なUI設計

---

**作成日**: 2025年10月25日
**更新履歴**: 初版作成