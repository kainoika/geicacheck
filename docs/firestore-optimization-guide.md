# Firestore Read回数最適化ガイド

## 現在の問題と対策

### 問題点
1. **重複読み込み**: 同じイベントのサークルデータを複数回取得
2. **個別取得の多用**: サークル詳細ページで毎回read
3. **検索・フィルター時の全件取得**: 検索のたびに全データを読み直し
4. **メタデータ取得の重複**: ジャンル一覧等で重複read

### 最適化案

#### 1. 統合キャッシュシステム（実装済み）
- **リアルタイム同期**: onSnapshotで初回読み込み後は自動更新
- **メモリ内検索**: 検索用インデックスを事前構築
- **長期キャッシュ**: 10分間のキャッシュで重複アクセスを削減

#### 2. 段階的読み込み戦略
```typescript
// 軽量データ（一覧表示用）
interface CircleListItem {
  id: string;
  circleName: string;
  genre: string[];
  placement: PlacementInfo;
  isAdult: boolean;
}

// 詳細データ（詳細ページ用）
interface CircleDetail extends CircleListItem {
  description: string;
  contact: ContactInfo;
  items: CircleItem[];
  // 重いデータ
}
```

#### 3. バッチ読み込み
```typescript
// 複数サークルを一度に取得
const fetchCirclesBatch = async (circleIds: string[]) => {
  // whereIn クエリで最大10件ずつ取得
  const batches = chunk(circleIds, 10);
  const results = await Promise.all(
    batches.map(batch => 
      getDocs(query(circlesRef, where('__name__', 'in', batch)))
    )
  );
  return results.flatMap(snapshot => snapshot.docs);
};
```

#### 4. 集約データの活用
```typescript
// events/{eventId}/stats ドキュメントで統計情報を事前計算
interface EventStats {
  totalCircles: number;
  genreDistribution: Record<string, number>;
  areaDistribution: Record<string, number>;
  lastUpdated: Date;
}
```

#### 5. Progressive Web App化
```typescript
// Service Workerでオフラインキャッシュ
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/circles')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

## 実装の優先順位

### Phase 1: 即効性の高い最適化 ✅ 完了
1. **統合キャッシュシステム**: useCircles.ts (旧useCirclesOptimized.ts)
2. **リアルタイム同期**: onSnapshotの活用
3. **メモリ内検索**: 検索インデックスの構築
4. **メトリクス統合**: FirestoreメトリクスでRead回数追跡

### Phase 2: 構造的最適化 (検討中)
1. **段階的読み込み**: 軽量データと詳細データの分離
2. **バッチ処理**: 複数サークルの一括取得
3. **集約データ**: 統計情報の事前計算

### Phase 3: 高度な最適化 (将来的)
1. **CDN活用**: 画像とメタデータのキャッシュ
2. **PWA対応**: オフラインサポート
3. **データベース最適化**: Firestoreルール改善

## 期待される効果

### Before (現在)
- ページ表示: 5-10 reads
- 検索実行: 全件read (100+ reads)
- サークル詳細: 1 read + α
- ジャンル取得: 全件read (100+ reads)

### After (最適化後)
- 初回表示: 1回の全件read → リアルタイム同期
- 検索実行: 0 reads (キャッシュ使用)
- サークル詳細: 0 reads (キャッシュヒット時)
- ジャンル取得: 0 reads (インデックス使用)

**読み込み回数削減率: 約80-90%**

## 注意点

1. **メモリ使用量**: キャッシュによりメモリ使用量が増加
2. **リアルタイム性**: 一部データで最大30秒の遅延
3. **複雑性**: エラーハンドリングとキャッシュ無効化の管理が複雑

## 移行完了状況 ✅

### 実装済み:
1. **useCircles** 最適化版に完全移行 ✅
2. **メトリクス測定システム** FirestoreMetricsPanel統合 ✅
3. **全ページ対応** サークル一覧、詳細、マップページ等 ✅

### パフォーマンス改善の仕組み:
- **初回読み込み**: 通常通りFirestoreから取得
- **2回目以降**: 10分間キャッシュから取得 (Read回数 = 0)
- **リアルタイム更新**: onSnapshotで自動同期
- **高速検索**: メモリ内インデックスでFirestore不要

### 測定方法:
- 右下のFirestoreメトリクスパネルでリアルタイム監視
- Read/Write/Delete回数とコストを可視化
- 操作履歴でどのページでRead発生かを追跡