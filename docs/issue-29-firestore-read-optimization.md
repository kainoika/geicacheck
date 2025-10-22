# Issue #29: Firestoreドキュメント読み込み回数の最適化計画書

## 問題の概要

### 現在発生している問題
現在のアプリケーションでは、**サークル数 × イベント数**の分だけFirestoreドキュメントの読み込みが発生している。
その結果、500～600程度の読み込みが発生しており、不特定多数のユーザーが利用した場合、Firestoreの無料枠である5万回/月がすぐに枯渇する計算である。

### コスト問題の深刻度
- **現状**: サークル数（例：200）× イベント数（例：3） = 600 reads/ユーザー
- **月間想定**: 100ユーザー × 600 reads = 60,000 reads/月 = **無料枠超過**
- **費用影響**: 無料枠5万回を超えると従量課金 ($0.36/100K reads)

## 現在の実装状況分析

### 問題となっているFirestore読み込みパターン

#### 1. サークル詳細画面の個別読み込み（`pages/circles/[id].vue`）
```typescript
// 🔥 問題: 各サークルを個別にgetDocで取得
const circleData = await fetchCircleById(circleId, currentEvent.value.id)

// composables/useCircles.ts の fetchCircleById
const circleRef = doc($firestore, "events", targetEventId, "circles", circleId);
const circleDoc = await getDoc(circleRef); // ⚠️ 1 read/サークル
```

#### 2. ブックマーク機能での複数個別読み込み（`composables/useBookmarks.ts`）
```typescript
// 🔥 問題: ブックマークされたサークルを1件ずつ取得
const { fetchCirclesByIds } = useCircles();
const circles = await fetchCirclesByIds(circleIds, currentEvent.value?.id);

// fetchCirclesByIds の実装（composables/useCircles.ts）
for (const circleId of missingIds) {
  const circleRef = doc($firestore, "events", targetEventId, "circles", circleId);
  const circleDoc = await getDoc(circleRef); // ⚠️ 1 read/サークル
}
```

#### 3. プロフィール画面でのサークル取得（`pages/profile/index.vue`）
```typescript
// 個別サークル取得により読み込み回数増加
const { fetchCircleById } = useCircles()
```

### 効率的な実装パターン（既に実装済み）

#### ✅ サークル一覧の効率的読み込み
```typescript
// 良い例: 1回のクエリで全サークルを取得
const circlesRef = collection($firestore, "events", targetEventId, "circles");
const q = query(circlesRef, where("isPublic", "==", true));
const snapshot = await getDocs(q); // ⚠️ 1 read のみ（全サークル分）
```

## 根本原因分析

### 1. キャッシュ戦略の不完全性
- `useCircles`には強力なキャッシュシステムが実装されている
- しかし、個別読み込み系の関数（`fetchCircleById`, `fetchCirclesByIds`）がキャッシュミス時に個別読み込みにフォールバックしている

### 2. データアクセスパターンの問題
```typescript
// 現在の問題パターン
1. サークル一覧表示 → 全データをキャッシュ（1 read）✅
2. サークル詳細表示 → キャッシュヒット（0 read）✅
3. 別イベント切り替え → キャッシュクリア → 再度全データ取得（1 read）✅
4. ブックマーク表示 → 部分的にキャッシュミス → 個別読み込み（N reads）❌
5. 直接URL アクセス → キャッシュなし → 個別読み込み（1 read）❌
```

### 3. 初期読み込み戦略の課題
```typescript
// サークル詳細に直接アクセスした場合
// currentEventが設定される前にfetchCircleByIdが呼ばれると
// キャッシュが空の状態で個別読み込みが発生
```

## 解決策

### Phase 1: キャッシュ戦略の強化（推奨アプローチ）

#### 1. 予防的全件取得戦略
```typescript
// composables/useCircles.ts の修正
const fetchCircleById = async (circleId: string, eventId?: string): Promise<Circle | null> => {
  const targetEventId = eventId || currentEvent.value?.id;
  if (!targetEventId) {
    throw new Error("イベントIDが指定されていません");
  }

  // 🆕 キャッシュがない場合、個別取得ではなく全件取得を実行
  if (!isCacheValid(targetEventId)) {
    logger.debug('Cache miss, fetching all circles for efficient reading');
    await fetchCircles({}, targetEventId); // 全件取得（1 read）
  }

  // キャッシュから取得
  const cached = circlesCache.value[targetEventId];
  if (cached) {
    const cachedCircle = cached.data.find(c => c.id === circleId);
    if (cachedCircle) {
      logger.debug('Using cached circle data', { circleId });
      return cachedCircle;
    }
  }

  // ここまで来ることは通常ない（全件取得でキャッシュされているはず）
  logger.warn('Circle not found in cache after full fetch', { circleId });
  return null;
};
```

#### 2. バッチ読み込み戦略の強化
```typescript
const fetchCirclesByIds = async (circleIds: string[], eventId?: string): Promise<Circle[]> => {
  if (circleIds.length === 0) return [];

  const targetEventId = eventId || currentEvent.value?.id;
  if (!targetEventId) {
    throw new Error("イベントIDが指定されていません");
  }

  // 🆕 キャッシュが無効な場合は全件取得
  if (!isCacheValid(targetEventId)) {
    logger.debug('Cache miss, fetching all circles for efficient batch reading');
    await fetchCircles({}, targetEventId); // 全件取得（1 read）
  }

  // キャッシュから一括取得
  const cached = circlesCache.value[targetEventId];
  if (cached) {
    const cachedCircles = cached.data.filter(c => circleIds.includes(c.id));
    logger.debug('Using cached circles data for batch', {
      requested: circleIds.length,
      found: cachedCircles.length
    });
    return cachedCircles;
  }

  logger.warn('No cache available after full fetch attempt');
  return [];
};
```

#### 3. アプリケーション初期化時の予防的読み込み
```typescript
// app.vue または layouts/default.vue に追加
export default {
  async mounted() {
    const { currentEvent } = useEvents();
    const { fetchCircles } = useCircles();

    // 🆕 アプリ起動時に現在イベントのサークル一覧を予防的に読み込み
    if (currentEvent.value?.id) {
      try {
        logger.debug('Preloading circles for current event');
        await fetchCircles({}, currentEvent.value.id);
        logger.debug('Successfully preloaded circles');
      } catch (error) {
        logger.warn('Failed to preload circles', error);
      }
    }
  }
}
```

### Phase 2: データ構造の見直し（長期対応）

#### Option A: サマリードキュメント戦略
```typescript
// 新しいFirestoreコレクション構造
events/{eventId}/circle_summary  // 1ドキュメント
{
  circles: {
    "circle1": { circleName, penName, placement, isAdult, /* 基本情報のみ */ },
    "circle2": { circleName, penName, placement, isAdult },
    // ...
  },
  lastUpdated: timestamp
}

events/{eventId}/circles/{circleId}  // 詳細情報（既存）
{
  // 画像URL、詳細説明、アイテム情報など
}
```

利点：
- サマリー取得で1 read（vs 従来のN reads）
- 一覧表示に必要な情報は即座に取得可能
- 詳細情報は必要時のみ取得

欠点：
- データの二重管理が必要
- 更新時の整合性保持が複雑

#### Option B: Firestore Bundle戦略
```typescript
// Firebase Admin SDKでバンドル作成（サーバー側）
import { getFirestore } from 'firebase-admin/firestore';

const createCircleBundle = async (eventId: string) => {
  const db = getFirestore();
  const query = db.collection('events').doc(eventId).collection('circles');

  const bundle = db.bundle('event-circles-' + eventId)
    .add('event-circles', query);

  // Static hostingにバンドルを配置
  return bundle.build();
};

// クライアント側でバンドル読み込み
import { loadBundle, namedQuery } from 'firebase/firestore';

const loadCirclesFromBundle = async (eventId: string) => {
  const bundleUrl = `/bundles/event-circles-${eventId}.bundle`;
  const response = await fetch(bundleUrl);
  const bundle = await response.arrayBuffer();

  await loadBundle(db, bundle);
  const query = await namedQuery(db, 'event-circles');
  const snapshot = await getDocs(query); // キャッシュから取得（0 read）
};
```

### Phase 3: パフォーマンス監視とアラート

#### 1. 読み込み回数の監視
```typescript
// utils/firestoreMonitor.ts
class FirestoreMonitor {
  private static readCount = 0;

  static incrementRead(operation: string, path: string) {
    this.readCount++;
    console.log(`📊 Firestore Read #${this.readCount}: ${operation} ${path}`);

    // アラート閾値
    if (this.readCount > 100) {
      console.warn('⚠️ High Firestore read count detected!', this.readCount);
    }
  }

  static getReadCount() {
    return this.readCount;
  }

  static reset() {
    this.readCount = 0;
  }
}

// composables/useCircles.ts に適用
const snapshot = await getDocs(q);
FirestoreMonitor.incrementRead('getDocs', `events/${targetEventId}/circles`);
```

#### 2. 開発環境での読み込み可視化
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      firestoreMonitoring: process.env.NODE_ENV === 'development'
    }
  }
})

// Firestoreラッパーの作成
const monitoredGetDoc = async (ref: DocumentReference) => {
  if (useRuntimeConfig().public.firestoreMonitoring) {
    console.log(`🔍 Firestore getDoc: ${ref.path}`);
  }
  return await getDoc(ref);
};
```

## 実装ロードマップ

### Step 1: 緊急対応（優先度: Critical）
- [x] `fetchCircleById`でキャッシュミス時に全件取得を実行
- [x] `fetchCirclesByIds`でキャッシュミス時に全件取得を実行
- [x] 読み込み回数監視システムの導入

### Step 2: 予防的最適化（優先度: High）
- [ ] アプリケーション初期化時の予防的読み込み
- [ ] ページネーション時のキャッシュ活用強化
- [ ] エラーハンドリング・フォールバック戦略の改善

### Step 3: 長期最適化（優先度: Medium）
- [ ] サマリードキュメント戦略の検討・実装
- [ ] Firestore Bundle戦略の検討・実装
- [ ] 読み込み回数の詳細分析・ダッシュボード構築

### Step 4: 監視・運用（優先度: Low）
- [ ] 本番環境での読み込み回数監視
- [ ] アラート機能の実装
- [ ] パフォーマンス最適化のA/Bテスト

## 期待される効果

### Phase 1実装後
1. **読み込み回数**: 500-600 reads → 3-10 reads（90%以上削減）
2. **コスト削減**: 月間費用を無料枠内に収める
3. **パフォーマンス向上**: キャッシュヒット率の向上により応答速度改善

### Phase 2実装後（長期）
1. **さらなる読み込み削減**: 1-3 reads/ユーザー
2. **スケーラビリティ**: 数千ユーザーでも無料枠内運用可能
3. **運用負荷軽減**: 自動的な最適化により手動調整不要

## リスク評価

### Phase 1のリスク
- **極低**: 既存のキャッシュシステムの拡張のみ
- **後方互換性**: 既存APIに変更なし

### Phase 2のリスク
- **中**: データ構造変更による影響範囲拡大
- **対策**: 段階的移行とロールバック戦略の準備

## テスト計画

### 読み込み回数計測テスト
```typescript
describe('Firestore Read Optimization', () => {
  beforeEach(() => {
    FirestoreMonitor.reset();
  });

  it('should use minimal reads for circle detail access', async () => {
    // サークル詳細直接アクセス
    await fetchCircleById('circle1', 'event1');

    expect(FirestoreMonitor.getReadCount()).toBeLessThanOrEqual(1);
  });

  it('should use minimal reads for bookmark display', async () => {
    const circleIds = ['circle1', 'circle2', 'circle3'];
    await fetchCirclesByIds(circleIds, 'event1');

    expect(FirestoreMonitor.getReadCount()).toBeLessThanOrEqual(1);
  });
});
```

### 確認項目
- [ ] サークル詳細直接アクセスで読み込み回数1回以下
- [ ] ブックマーク表示で読み込み回数1回以下
- [ ] イベント切り替え時の適切なキャッシュ管理
- [ ] エラー時のフォールバック動作

## 関連ファイル

- `composables/useCircles.ts` - メインの最適化対象
- `composables/useBookmarks.ts` - バッチ読み込み利用箇所
- `pages/circles/[id].vue` - 個別読み込み利用箇所
- `pages/profile/index.vue` - 個別読み込み利用箇所
- `utils/firestoreMonitor.ts` - 監視システム（新規作成）

---

**作成日**: 2025-01-22
**対応Issue**: [#29](https://github.com/kainoika/geika-check/issues/29)
**優先度**: Critical
**予想工数**: Phase 1 (0.5日) + Phase 2 (2-3日) + Phase 3 (1日)
**期待ROI**: 月間コスト削減 + パフォーマンス向上 + スケーラビリティ確保