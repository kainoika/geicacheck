/**
 * Firestore読み込み回数監視システム
 * 開発環境での読み込み回数可視化とパフォーマンス監視を提供
 */

interface ReadOperation {
  operation: string;
  path: string;
  timestamp: number;
  eventId?: string;
  metadata?: Record<string, any>;
}

class FirestoreMonitor {
  private static instance: FirestoreMonitor;
  private readCount = 0;
  private operations: ReadOperation[] = [];
  private sessionStartTime = Date.now();

  private constructor() {}

  static getInstance(): FirestoreMonitor {
    if (!FirestoreMonitor.instance) {
      FirestoreMonitor.instance = new FirestoreMonitor();
    }
    return FirestoreMonitor.instance;
  }

  /**
   * Firestore読み込み操作を記録
   */
  static incrementRead(
    operation: string,
    path: string,
    eventId?: string,
    metadata?: Record<string, any>
  ): void {
    const monitor = FirestoreMonitor.getInstance();
    monitor.readCount++;

    const readOperation: ReadOperation = {
      operation,
      path,
      timestamp: Date.now(),
      eventId,
      metadata
    };

    monitor.operations.push(readOperation);

    // 開発環境でのログ出力
    if (process.dev) {
      console.log(`📊 Firestore Read #${monitor.readCount}: ${operation} ${path}`, {
        eventId,
        metadata
      });
    }

    // アラート閾値チェック
    monitor.checkAlerts();
  }

  /**
   * 現在の読み込み回数を取得
   */
  static getReadCount(): number {
    return FirestoreMonitor.getInstance().readCount;
  }

  /**
   * セッション統計を取得
   */
  static getSessionStats(): {
    totalReads: number;
    sessionDuration: number;
    readsPerMinute: number;
    operationBreakdown: Record<string, number>;
    eventBreakdown: Record<string, number>;
  } {
    const monitor = FirestoreMonitor.getInstance();
    const sessionDuration = Date.now() - monitor.sessionStartTime;
    const readsPerMinute = (monitor.readCount / sessionDuration) * 60000;

    // 操作タイプ別の集計
    const operationBreakdown: Record<string, number> = {};
    const eventBreakdown: Record<string, number> = {};

    monitor.operations.forEach(op => {
      operationBreakdown[op.operation] = (operationBreakdown[op.operation] || 0) + 1;
      if (op.eventId) {
        eventBreakdown[op.eventId] = (eventBreakdown[op.eventId] || 0) + 1;
      }
    });

    return {
      totalReads: monitor.readCount,
      sessionDuration,
      readsPerMinute,
      operationBreakdown,
      eventBreakdown
    };
  }

  /**
   * 操作履歴を取得（デバッグ用）
   */
  static getOperationHistory(): ReadOperation[] {
    return [...FirestoreMonitor.getInstance().operations];
  }

  /**
   * カウンターをリセット
   */
  static reset(): void {
    const monitor = FirestoreMonitor.getInstance();
    monitor.readCount = 0;
    monitor.operations = [];
    monitor.sessionStartTime = Date.now();

    if (process.dev) {
      console.log('🔄 Firestore monitor reset');
    }
  }

  /**
   * アラート閾値チェック
   */
  private checkAlerts(): void {
    const warningThreshold = 50;
    const errorThreshold = 100;

    if (this.readCount === warningThreshold) {
      console.warn(
        `⚠️ Firestore read count warning: ${this.readCount} reads detected`,
        this.getRecentOperations(10)
      );
    }

    if (this.readCount === errorThreshold) {
      console.error(
        `🚨 High Firestore read count alert: ${this.readCount} reads!`,
        this.getRecentOperations(20)
      );

      // 統計情報も出力
      console.table(this.getOperationSummary());
    }
  }

  /**
   * 最近の操作履歴を取得
   */
  private getRecentOperations(count: number): ReadOperation[] {
    return this.operations.slice(-count);
  }

  /**
   * 操作サマリーを取得
   */
  private getOperationSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    this.operations.forEach(op => {
      const key = `${op.operation} (${op.eventId || 'unknown'})`;
      summary[key] = (summary[key] || 0) + 1;
    });
    return summary;
  }

  /**
   * パフォーマンスレポートを生成
   */
  static generateReport(): void {
    const stats = FirestoreMonitor.getSessionStats();

    console.group('📈 Firestore Performance Report');
    console.log(`Total Reads: ${stats.totalReads}`);
    console.log(`Session Duration: ${Math.round(stats.sessionDuration / 1000)}s`);
    console.log(`Reads per Minute: ${stats.readsPerMinute.toFixed(2)}`);

    console.log('\n📊 Operation Breakdown:');
    console.table(stats.operationBreakdown);

    if (Object.keys(stats.eventBreakdown).length > 0) {
      console.log('\n📅 Event Breakdown:');
      console.table(stats.eventBreakdown);
    }

    console.groupEnd();
  }
}

/**
 * 開発環境でのFirestore操作監視用ヘルパー関数
 */
export const monitorFirestoreRead = (
  operation: string,
  path: string,
  eventId?: string,
  metadata?: Record<string, any>
): void => {
  FirestoreMonitor.incrementRead(operation, path, eventId, metadata);
};

/**
 * 統計情報取得用のエクスポート
 */
export const getFirestoreStats = () => ({
  getReadCount: FirestoreMonitor.getReadCount,
  getSessionStats: FirestoreMonitor.getSessionStats,
  getOperationHistory: FirestoreMonitor.getOperationHistory,
  generateReport: FirestoreMonitor.generateReport,
  reset: FirestoreMonitor.reset
});

// 開発環境での自動レポート生成（ページ離脱時）
if (process.client && process.dev) {
  window.addEventListener('beforeunload', () => {
    FirestoreMonitor.generateReport();
  });

  // コンソールでアクセス可能にする
  (window as any).__firestoreMonitor = {
    getStats: FirestoreMonitor.getSessionStats,
    getHistory: FirestoreMonitor.getOperationHistory,
    generateReport: FirestoreMonitor.generateReport,
    reset: FirestoreMonitor.reset
  };
}

export default FirestoreMonitor;