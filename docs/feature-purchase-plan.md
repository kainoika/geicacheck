# 頒布物購入予定・予算管理機能 設計書

## 📋 機能概要

ユーザーが各サークルの頒布物に「購入予定」チェックを付けて、プロフィールページでイベント全体の予算（購入予定品の価格合計）を確認できる機能です。

## 🎯 目的

- **予算管理**: イベントでの支出予定を事前に把握
- **計画的な購入**: 限られた予算での効率的な買い物計画
- **当日の効率化**: 購入リストで効率的な会場巡回

## 🔍 現状分析

### 既存の資産
- `CircleItem`型が既に定義済み（価格情報含む）
- ユーザー認証・プロフィール機能が完備
- イベント別データ管理が構築済み
- Firestore設計が整備済み

### 不足している要素
- 購入予定データ構造
- 購入予定管理UI
- 予算計算・表示機能

## 📐 設計詳細

### 1. 型定義の拡張

```typescript
// types/index.ts に追加

// 購入予定アイテム
export interface PurchasePlan {
  id: string;
  userId: string;
  circleId: string;
  itemId: string;  // CircleItem.id
  eventId: string;
  quantity: number;
  priceAtTime: number;  // 追加時点の価格（価格変動対応）
  addedAt: Date;
  updatedAt: Date;
}

// 予算サマリー
export interface BudgetSummary {
  eventId: string;
  totalItems: number;
  totalPrice: number;
  byCircle: Array<{
    circleId: string;
    circleName: string;
    items: number;
    totalPrice: number;
  }>;
  byCategory: Array<{
    category: string;
    items: number;
    totalPrice: number;
  }>;
  updatedAt: Date;
}

// 拡張された頒布物情報（購入予定状態含む）
export interface CircleItemWithPurchaseStatus extends CircleItem {
  purchasePlan?: PurchasePlan;
  isPurchasePlanned: boolean;
}

// エクスポートオプション
export interface BudgetExportOptions {
  format: 'csv' | 'pdf';
  includeDetails: boolean;
  groupBy: 'circle' | 'category' | 'none';
}
```

### 2. Firestore構造

```
users/{userId}/
  └── purchase_plans/
      └── {planId}
          ├── userId: string
          ├── circleId: string
          ├── itemId: string
          ├── eventId: string
          ├── quantity: number
          ├── priceAtTime: number
          ├── addedAt: timestamp
          └── updatedAt: timestamp
  
  └── budget_summaries/
      └── {eventId}
          ├── totalItems: number
          ├── totalPrice: number
          ├── byCircle: array
          ├── byCategory: array
          └── updatedAt: timestamp

events/{eventId}/
  └── circles/{circleId}/
      └── items/
          └── {itemId}  # 既存のCircleItem
```

### 3. コンポーネント設計

```
components/purchase/
├── PurchasePlanButton.vue      # 購入予定チェックボタン
├── PurchaseQuantitySelector.vue # 数量選択
├── BudgetSummary.vue           # 予算サマリー表示
├── PurchasePlanList.vue        # 購入予定リスト
├── BudgetCalculator.vue        # 予算計算機
├── BudgetChart.vue             # 予算グラフ表示
└── PurchaseCheckList.vue       # 当日用チェックリスト
```

### 4. Composables設計

#### composables/usePurchasePlans.ts
```typescript
export const usePurchasePlans = () => {
  const { user } = useAuth()
  const { $firestore } = useNuxtApp()
  
  // 購入予定の追加
  const addToPurchasePlan = async (
    circleId: string, 
    itemId: string, 
    quantity: number = 1
  ): Promise<void>
  
  // 購入予定の削除
  const removeFromPurchasePlan = async (planId: string): Promise<void>
  
  // 数量の更新
  const updatePurchaseQuantity = async (
    planId: string, 
    quantity: number
  ): Promise<void>
  
  // ユーザーの購入予定一覧取得
  const getUserPurchasePlans = async (
    eventId: string
  ): Promise<PurchasePlan[]>
  
  // 購入予定の存在確認
  const isPurchasePlanned = async (
    circleId: string, 
    itemId: string
  ): Promise<boolean>
  
  // リアルタイム更新の監視
  const watchPurchasePlans = (
    eventId: string, 
    callback: (plans: PurchasePlan[]) => void
  ): () => void
}
```

#### composables/useBudget.ts
```typescript
export const useBudget = () => {
  const { user } = useAuth()
  const { $firestore } = useNuxtApp()
  
  // 予算サマリーの取得
  const getBudgetSummary = async (
    eventId: string
  ): Promise<BudgetSummary>
  
  // 予算のエクスポート
  const exportBudget = async (
    eventId: string, 
    options: BudgetExportOptions
  ): Promise<Blob>
  
  // サークル別予算の計算
  const getBudgetByCircle = (
    plans: PurchasePlan[]
  ): BudgetSummary['byCircle']
  
  // カテゴリ別予算の計算
  const getBudgetByCategory = (
    plans: PurchasePlan[]
  ): BudgetSummary['byCategory']
  
  // 予算統計の取得
  const getBudgetStatistics = (
    plans: PurchasePlan[]
  ): BudgetStatistics
  
  // 予算サマリーの更新
  const updateBudgetSummary = async (
    eventId: string
  ): Promise<void>
}
```

## 🚀 段階的実装計画

### Phase 1: 基盤機能（1-2週間）

#### 1.1 型定義とデータ構造
- [ ] `types/index.ts`に新規型定義を追加
- [ ] Firestoreセキュリティルールの更新
- [ ] Firestoreインデックスの設定

#### 1.2 基本Composables実装
- [ ] `usePurchasePlans.ts`の実装
- [ ] `useBudget.ts`の実装
- [ ] 単体テストの作成

#### 1.3 Firebase設定
- [ ] セキュリティルールの追加
```javascript
// firestore.rules に追加
match /users/{userId}/purchase_plans/{planId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

match /users/{userId}/budget_summaries/{eventId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Phase 2: UI実装（1-2週間）

#### 2.1 購入予定ボタンコンポーネント
```vue
<!-- components/purchase/PurchasePlanButton.vue -->
<template>
  <button
    @click="togglePurchasePlan"
    :class="[
      'purchase-plan-btn',
      { 'active': isPurchasePlanned }
    ]"
  >
    <ShoppingCartIcon class="h-4 w-4" />
    <span v-if="isPurchasePlanned">購入予定</span>
    <span v-else>カートに追加</span>
  </button>
</template>
```

#### 2.2 予算サマリーコンポーネント
```vue
<!-- components/purchase/BudgetSummary.vue -->
<template>
  <div class="budget-summary">
    <h3>
      <CurrencyYenIcon class="h-5 w-5" />
      イベント予算
    </h3>
    
    <div class="total-budget">
      <span class="label">合計予算</span>
      <span class="amount">¥{{ totalBudget.toLocaleString() }}</span>
    </div>
    
    <div class="budget-breakdown">
      <div class="item-count">
        <span>{{ totalItems }}点</span>
      </div>
      <button @click="showDetails = !showDetails">
        詳細を見る
      </button>
    </div>
  </div>
</template>
```

#### 2.3 プロフィールページ統合
- [ ] 予算セクションの追加
- [ ] 購入予定リストの表示
- [ ] エクスポート機能の実装

### Phase 3: 高度な機能（2-3週間）

#### 3.1 予算分析機能
- [ ] カテゴリ別集計グラフ
- [ ] サークル別集計表
- [ ] 過去イベントとの比較

#### 3.2 データエクスポート
- [ ] CSV形式でのエクスポート
- [ ] PDF形式でのエクスポート
- [ ] 印刷用レイアウト

#### 3.3 当日チェックリスト
- [ ] QRコード生成
- [ ] オフライン対応
- [ ] 購入済みチェック機能

### Phase 4: UX向上（1-2週間）

#### 4.1 高度なUI機能
- [ ] ドラッグ&ドロップでの並び替え
- [ ] 一括選択・操作機能
- [ ] 予算上限アラート

#### 4.2 パフォーマンス最適化
- [ ] データキャッシング
- [ ] 仮想スクロール実装
- [ ] 画像遅延読み込み

## 🎨 UI/UXデザイン仕様

### サークル詳細ページの拡張

```vue
<template>
  <div class="circle-items-section">
    <h3>頒布物一覧</h3>
    
    <div class="items-grid">
      <div v-for="item in circleItems" :key="item.id" class="item-card">
        <div class="item-header">
          <h4>{{ item.name }}</h4>
          <span class="price">¥{{ item.price }}</span>
        </div>
        
        <p class="description">{{ item.description }}</p>
        
        <!-- 新規: 購入予定機能 -->
        <div class="purchase-controls">
          <PurchasePlanButton 
            :item-id="item.id"
            :circle-id="circle.id"
            :price="item.price"
            @updated="refreshPurchasePlans"
          />
          
          <PurchaseQuantitySelector
            v-if="item.purchasePlan"
            :plan-id="item.purchasePlan.id"
            :initial-quantity="item.purchasePlan.quantity"
            @change="updateQuantity"
          />
        </div>
      </div>
    </div>
  </div>
</template>
```

### プロフィールページの予算セクション

```vue
<template>
  <div class="profile-budget-section">
    <div class="section-header">
      <h2>
        <CurrencyYenIcon class="h-6 w-6" />
        イベント予算管理
      </h2>
      <select v-model="selectedEventId" class="event-selector">
        <option v-for="event in events" :value="event.id">
          {{ event.name }}
        </option>
      </select>
    </div>
    
    <!-- 予算サマリーカード -->
    <div class="budget-cards">
      <div class="budget-card total">
        <h3>合計予算</h3>
        <p class="amount">¥{{ summary.totalPrice.toLocaleString() }}</p>
        <p class="items">{{ summary.totalItems }}点</p>
      </div>
      
      <div class="budget-card average">
        <h3>平均単価</h3>
        <p class="amount">¥{{ averagePrice.toLocaleString() }}</p>
      </div>
      
      <div class="budget-card circles">
        <h3>サークル数</h3>
        <p class="amount">{{ uniqueCircles }}</p>
      </div>
    </div>
    
    <!-- 購入予定リスト -->
    <PurchasePlanList 
      :event-id="selectedEventId"
      :group-by="groupBy"
      @item-removed="refreshBudget"
      @quantity-changed="refreshBudget"
    />
    
    <!-- エクスポートボタン -->
    <div class="export-controls">
      <button @click="exportAsCSV" class="export-btn">
        <DocumentArrowDownIcon class="h-4 w-4" />
        CSVエクスポート
      </button>
      <button @click="exportAsPDF" class="export-btn">
        <PrinterIcon class="h-4 w-4" />
        印刷用PDF
      </button>
    </div>
  </div>
</template>
```

## 🔧 技術的考慮事項

### パフォーマンス最適化

1. **キャッシング戦略**
   - Vuexまたは`useState`での購入予定データキャッシュ
   - 5分間のTTLでFirestoreデータをキャッシュ
   - オプティミスティックUI更新

2. **リアルタイム更新**
   - Firestore `onSnapshot`での効率的な監視
   - デバウンス処理で過度な更新を防止

3. **大量データ対応**
   - 仮想スクロールで100件以上の表示対応
   - ページネーション（20件/ページ）

### データ整合性

1. **価格変更対応**
   - `priceAtTime`で追加時点の価格を保存
   - 価格変更通知機能（オプション）

2. **削除対応**
   - ソフトデリート実装
   - 削除されたアイテムの表示制御

### セキュリティ

1. **アクセス制御**
   - ユーザーは自分の購入予定のみ閲覧・編集可能
   - Firestoreルールで厳密に制御

2. **プライバシー保護**
   - 他ユーザーの購入予定は非公開
   - 集計データは匿名化

## 💡 追加価値機能（将来実装）

### 1. 予算分析機能
- 過去イベントとの比較グラフ
- ジャンル別支出傾向分析
- 予算達成率の追跡

### 2. スマート機能
- 人気商品ランキング（プライバシー考慮）
- 類似ユーザーのおすすめ（オプトイン）
- 在庫切れアラート

### 3. 連携機能
- カレンダーアプリ連携
- 決済アプリ連携（予算管理）
- SNSシェア機能（集計のみ）

## 📊 実装優先度マトリックス

| 機能 | 開発工数 | ユーザー価値 | 技術的複雑度 | 優先度 |
|------|----------|--------------|--------------|--------|
| 基本購入予定機能 | 中 | 高 | 低 | 🔴 最高 |
| プロフィール予算表示 | 低 | 高 | 低 | 🔴 最高 |
| 数量選択機能 | 低 | 中 | 低 | 🟡 高 |
| データエクスポート | 中 | 中 | 中 | 🟡 高 |
| 予算分析機能 | 高 | 中 | 高 | 🔵 中 |
| スマート機能 | 高 | 低 | 高 | ⚪ 低 |

## 🚦 成功指標

### 定量的指標
- 機能利用率: アクティブユーザーの50%以上
- 平均登録アイテム数: 10件以上/ユーザー
- エクスポート利用率: 月間100回以上

### 定性的指標
- ユーザーフィードバック満足度: 4.0以上/5.0
- 「予算管理が楽になった」という声
- 「当日の買い物が効率的になった」という評価

## 📅 開発スケジュール

```
Week 1-2: Phase 1 (基盤機能)
Week 3-4: Phase 2 (UI実装)
Week 5-7: Phase 3 (高度な機能)
Week 8-9: Phase 4 (UX向上)
Week 10: テスト・リリース準備
```

合計開発期間: 約10週間（2.5ヶ月）

---

最終更新日: 2024年1月