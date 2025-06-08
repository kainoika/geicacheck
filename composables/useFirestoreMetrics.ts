export const useFirestoreMetrics = () => {
  // メトリクス保存用
  const metrics = useState<{
    reads: number;
    writes: number;
    deletes: number;
    operations: Array<{
      type: 'read' | 'write' | 'delete';
      collection: string;
      count: number;
      timestamp: Date;
      details?: string;
    }>;
  }>('firestore.metrics', () => ({
    reads: 0,
    writes: 0,
    deletes: 0,
    operations: []
  }));

  // 操作をトラッキング
  const trackOperation = (type: 'read' | 'write' | 'delete', collection: string, count: number = 1, details?: string) => {
    metrics.value[`${type}s`] += count;
    metrics.value.operations.push({
      type,
      collection,
      count,
      timestamp: new Date(),
      details
    });
    
    // コンソールに出力
    console.log(`📊 Firestore ${type.toUpperCase()}: ${collection} (${count} docs) ${details || ''}`);
    console.log(`📈 Total ${type}s: ${metrics.value[`${type}s`]}`);
  };

  // リセット
  const resetMetrics = () => {
    metrics.value = {
      reads: 0,
      writes: 0,
      deletes: 0,
      operations: []
    };
    console.log('🔄 Firestore metrics reset');
  };

  // サマリー表示
  const showSummary = () => {
    console.log('📊 === Firestore Usage Summary ===');
    console.log(`📖 Total Reads: ${metrics.value.reads}`);
    console.log(`✏️ Total Writes: ${metrics.value.writes}`);
    console.log(`🗑️ Total Deletes: ${metrics.value.deletes}`);
    
    // コレクション別の集計
    const collectionStats = new Map<string, { reads: number; writes: number; deletes: number }>();
    
    metrics.value.operations.forEach(op => {
      if (!collectionStats.has(op.collection)) {
        collectionStats.set(op.collection, { reads: 0, writes: 0, deletes: 0 });
      }
      const stats = collectionStats.get(op.collection)!;
      stats[`${op.type}s`] += op.count;
    });
    
    console.log('\n📁 By Collection:');
    collectionStats.forEach((stats, collection) => {
      console.log(`  ${collection}:`);
      if (stats.reads > 0) console.log(`    - Reads: ${stats.reads}`);
      if (stats.writes > 0) console.log(`    - Writes: ${stats.writes}`);
      if (stats.deletes > 0) console.log(`    - Deletes: ${stats.deletes}`);
    });
    
    // タイムライン表示（最新10件）
    console.log('\n⏱️ Recent Operations:');
    metrics.value.operations.slice(-10).forEach(op => {
      const time = op.timestamp.toLocaleTimeString();
      console.log(`  ${time} - ${op.type} ${op.collection} (${op.count}) ${op.details || ''}`);
    });
  };

  // デバッグパネル用のデータ
  const getMetricsForUI = () => {
    const collectionStats = new Map<string, { reads: number; writes: number; deletes: number }>();
    
    metrics.value.operations.forEach(op => {
      if (!collectionStats.has(op.collection)) {
        collectionStats.set(op.collection, { reads: 0, writes: 0, deletes: 0 });
      }
      const stats = collectionStats.get(op.collection)!;
      stats[`${op.type}s`] += op.count;
    });
    
    return {
      totals: {
        reads: metrics.value.reads,
        writes: metrics.value.writes,
        deletes: metrics.value.deletes
      },
      byCollection: Array.from(collectionStats.entries()).map(([collection, stats]) => ({
        collection,
        ...stats
      })),
      recentOperations: metrics.value.operations.slice(-20).reverse()
    };
  };

  return {
    trackOperation,
    resetMetrics,
    showSummary,
    getMetricsForUI,
    metrics: readonly(metrics)
  };
};