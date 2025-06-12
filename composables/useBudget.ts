import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import type { PurchasePlan, BudgetSummary, BudgetExportOptions } from '~/types'

export const useBudget = () => {
  const { $firestore } = useNuxtApp()
  const { user } = useAuth()
  const { purchasePlans, getUserPurchasePlans, validateAndCleanupPurchasePlans } = usePurchasePlans()
  
  // 予算サマリーの状態管理
  const budgetSummary = useState<BudgetSummary | null>('budgetSummary', () => null)
  const loading = useState('budgetLoading', () => false)
  const error = useState<string | null>('budgetError', () => null)
  
  // 変更検出フラグ
  const dataChanges = useState<{
    hasChanges: boolean
    removedCount: number
    lastCleanupAt: Date | null
  }>('budgetDataChanges', () => ({
    hasChanges: false,
    removedCount: 0,
    lastCleanupAt: null
  }))

  /**
   * 予算サマリーを取得（整合性チェック付き）
   */
  const getBudgetSummary = async (eventId: string): Promise<BudgetSummary | null> => {
    if (!user.value) {
      console.warn('ユーザーが認証されていません')
      return null
    }
    
    if (!$firestore) {
      console.warn('Firestoreが初期化されていません')
      return null
    }

    try {
      loading.value = true
      error.value = null

      // データ整合性チェックと自動修復
      const cleanupResult = await validateAndCleanupPurchasePlans(eventId)
      
      // 変更があった場合は記録
      if (cleanupResult.removedCount > 0) {
        dataChanges.value = {
          hasChanges: true,
          removedCount: cleanupResult.removedCount,
          lastCleanupAt: new Date()
        }
        console.log(`💰 予算に影響: ${cleanupResult.removedCount}件の頒布物が削除されました`)
      }

      // 購入予定を取得（クリーンアップ後）
      const plans = await getUserPurchasePlans(eventId)
      
      // サマリーを計算
      const summary = calculateBudgetSummary(plans, eventId)
      budgetSummary.value = summary

      // Firestoreに保存（キャッシュ用）
      await saveBudgetSummary(summary)

      return summary
    } catch (err) {
      console.error('予算サマリー取得エラー:', err)
      error.value = '予算サマリーの取得に失敗しました'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 予算サマリーを計算
   */
  const calculateBudgetSummary = (plans: PurchasePlan[], eventId: string): BudgetSummary => {
    const byCircleMap = new Map<string, {
      circleName: string
      items: number
      totalPrice: number
    }>()

    let totalItems = 0
    let totalPrice = 0

    plans.forEach(plan => {
      const itemTotal = plan.priceAtTime * plan.quantity
      totalItems += plan.quantity
      totalPrice += itemTotal

      const existing = byCircleMap.get(plan.circleId) || {
        circleName: plan.circleName || 'サークル名未設定',
        items: 0,
        totalPrice: 0
      }

      byCircleMap.set(plan.circleId, {
        circleName: existing.circleName,
        items: existing.items + plan.quantity,
        totalPrice: existing.totalPrice + itemTotal
      })
    })

    const byCircle = Array.from(byCircleMap.entries()).map(([circleId, data]) => ({
      circleId,
      ...data
    }))

    return {
      eventId,
      totalItems,
      totalPrice,
      byCircle,
      updatedAt: new Date()
    }
  }

  /**
   * 予算サマリーを保存
   */
  const saveBudgetSummary = async (summary: BudgetSummary): Promise<void> => {
    if (!user.value) {
      console.warn('ユーザーが認証されていません')
      return
    }
    
    if (!$firestore) {
      console.warn('Firestoreが初期化されていません')
      return
    }

    try {
      const summaryRef = doc(
        $firestore,
        'users',
        user.value.uid,
        'budget_summaries',
        summary.eventId
      )

      await setDoc(summaryRef, {
        ...summary,
        updatedAt: serverTimestamp()
      })
    } catch (err: any) {
      console.error('予算サマリー保存エラー:', err)
    }
  }

  /**
   * サークル別予算を取得
   */
  const getBudgetByCircle = (plans: PurchasePlan[]): BudgetSummary['byCircle'] => {
    const summary = calculateBudgetSummary(plans, '')
    return summary.byCircle
  }

  /**
   * 予算統計を取得
   */
  const getBudgetStatistics = (plans: PurchasePlan[]) => {
    const totalPrice = plans.reduce((sum, plan) => sum + (plan.priceAtTime * plan.quantity), 0)
    const totalItems = plans.reduce((sum, plan) => sum + plan.quantity, 0)
    const averagePrice = totalItems > 0 ? Math.round(totalPrice / totalItems) : 0
    const uniqueCircles = new Set(plans.map(plan => plan.circleId)).size

    return {
      totalPrice,
      totalItems,
      averagePrice,
      uniqueCircles,
      minPrice: plans.length > 0 ? Math.min(...plans.map(p => p.priceAtTime)) : 0,
      maxPrice: plans.length > 0 ? Math.max(...plans.map(p => p.priceAtTime)) : 0
    }
  }

  /**
   * 予算をCSV形式でエクスポート
   */
  const exportBudgetAsCSV = async (eventId: string): Promise<string> => {
    const plans = await getUserPurchasePlans(eventId)
    if (plans.length === 0) return ''

    // ヘッダー
    const headers = ['サークル名', '商品名', '単価', '数量', '小計']
    
    // データ行
    const rows = plans.map(plan => [
      plan.circleName || '',
      plan.itemName || '',
      plan.priceAtTime.toString(),
      plan.quantity.toString(),
      (plan.priceAtTime * plan.quantity).toString()
    ])

    // 合計行
    const total = plans.reduce((sum, plan) => sum + (plan.priceAtTime * plan.quantity), 0)
    rows.push(['', '', '', '合計', total.toString()])

    // CSV生成
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csv
  }

  /**
   * 予算をエクスポート
   */
  const exportBudget = async (
    eventId: string,
    options: BudgetExportOptions
  ): Promise<Blob> => {
    if (options.format === 'csv') {
      const csv = await exportBudgetAsCSV(eventId)
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    }

    // PDF形式は将来実装
    throw new Error('PDF形式のエクスポートは未実装です')
  }

  /**
   * 予算サマリーを更新
   */
  const updateBudgetSummary = async (eventId: string): Promise<void> => {
    await getBudgetSummary(eventId)
  }

  /**
   * キャッシュされた予算サマリーを取得
   */
  const getCachedBudgetSummary = async (eventId: string): Promise<BudgetSummary | null> => {
    if (!user.value) {
      console.warn('ユーザーが認証されていません')
      return null
    }
    
    if (!$firestore) {
      console.warn('Firestoreが初期化されていません')
      return null
    }

    try {
      const summaryRef = doc(
        $firestore,
        'users',
        user.value.uid,
        'budget_summaries',
        eventId
      )

      const summaryDoc = await getDoc(summaryRef)
      if (!summaryDoc.exists()) return null

      const data = summaryDoc.data()
      return {
        ...data,
        updatedAt: data.updatedAt?.toDate()
      } as BudgetSummary
    } catch (err) {
      console.error('キャッシュ取得エラー:', err)
      return null
    }
  }

  /**
   * 予算アラートの判定
   */
  const checkBudgetAlert = (currentTotal: number, budgetLimit: number): {
    isOver: boolean
    percentage: number
    remaining: number
  } => {
    const percentage = Math.round((currentTotal / budgetLimit) * 100)
    const remaining = budgetLimit - currentTotal

    return {
      isOver: currentTotal > budgetLimit,
      percentage,
      remaining
    }
  }

  /**
   * 変更通知をクリア
   */
  const clearDataChanges = (): void => {
    dataChanges.value = {
      hasChanges: false,
      removedCount: 0,
      lastCleanupAt: null
    }
  }

  /**
   * 変更があるかチェック
   */
  const hasDataChanges = (): boolean => {
    return dataChanges.value.hasChanges
  }

  /**
   * 予算を強制再計算（整合性チェック付き）
   */
  const recalculateBudget = async (eventId: string): Promise<BudgetSummary | null> => {
    // 既存の変更フラグをクリア
    clearDataChanges()
    
    // 予算サマリーを再取得（内部で整合性チェックが実行される）
    return await getBudgetSummary(eventId)
  }

  return {
    // State
    budgetSummary: readonly(budgetSummary),
    loading: readonly(loading),
    error: readonly(error),
    dataChanges: readonly(dataChanges),
    
    // Methods
    getBudgetSummary,
    calculateBudgetSummary,
    getBudgetByCircle,
    getBudgetStatistics,
    exportBudget,
    exportBudgetAsCSV,
    updateBudgetSummary,
    getCachedBudgetSummary,
    checkBudgetAlert,
    
    // 変更管理
    clearDataChanges,
    hasDataChanges,
    recalculateBudget
  }
}