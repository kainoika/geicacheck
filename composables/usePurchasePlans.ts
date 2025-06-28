import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  getDoc
} from 'firebase/firestore'
import type { PurchasePlan } from '~/types'

export const usePurchasePlans = () => {
  const { $firestore } = useNuxtApp()
  const { user, isAuthenticated } = useAuth()
  const logger = useLogger('usePurchasePlans')
  
  // 購入予定の状態管理
  const purchasePlans = useState<PurchasePlan[]>('purchasePlans', () => [])
  const loading = useState('purchasePlansLoading', () => false)
  const error = useState<string | null>('purchasePlansError', () => null)

  /**
   * Firebase認証状態を待つ
   */
  const waitForAuth = async (maxWait = 5000): Promise<boolean> => {
    if (isAuthenticated.value && user.value) {
      return true
    }

    logger.info('⏳ Firebase認証状態を待機中...')
    let waited = 0
    const interval = 100

    while (waited < maxWait) {
      if (isAuthenticated.value && user.value) {
        logger.info('✅ Firebase認証完了')
        return true
      }
      
      await new Promise(resolve => setTimeout(resolve, interval))
      waited += interval
    }

    logger.warn('⚠️ Firebase認証タイムアウト')
    return false
  }

  /**
   * 購入予定に追加
   */
  const addToPurchasePlan = async (
    circleId: string,
    itemId: string,
    eventId: string,
    price: number,
    quantity: number = 1,
    circleName?: string,
    itemName?: string
  ): Promise<string> => {
    // Firebase認証を待つ
    const authReady = await waitForAuth()
    if (!authReady) {
      throw new Error('認証に失敗しました。ログインしてください。')
    }
    
    if (!$firestore) {
      throw new Error('Firestoreが初期化されていません')
    }


    try {
      // 既存の購入予定をチェック
      const existingPlan = await getPurchasePlanByItem(circleId, itemId, eventId)
      if (existingPlan) {
        // 既存の場合は数量を更新
        await updatePurchaseQuantity(existingPlan.id, existingPlan.quantity + quantity)
        return existingPlan.id
      }

      // 新規追加
      const planData = {
        userId: user.value.uid,
        circleId,
        itemId,
        eventId,
        quantity,
        priceAtTime: price,
        circleName,
        itemName,
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const plansRef = collection($firestore, 'users', user.value.uid, 'purchase_plans')
      const docRef = await addDoc(plansRef, planData)

      return docRef.id
    } catch (err: any) {
      logger.error('購入予定追加エラー:', err)
      throw err
    }
  }

  /**
   * 購入予定から削除
   */
  const removeFromPurchasePlan = async (planId: string): Promise<void> => {
    if (!user.value) {
      throw new Error('ユーザーが認証されていません')
    }
    
    if (!$firestore) {
      throw new Error('Firestoreが初期化されていません')
    }

    try {
      const planRef = doc($firestore, 'users', user.value.uid, 'purchase_plans', planId)
      await deleteDoc(planRef)
    } catch (err) {
      logger.error('購入予定削除エラー:', err)
      throw err
    }
  }

  /**
   * 購入数量を更新
   */
  const updatePurchaseQuantity = async (planId: string, quantity: number): Promise<void> => {
    if (!user.value) {
      throw new Error('ユーザーが認証されていません')
    }
    
    if (!$firestore) {
      throw new Error('Firestoreが初期化されていません')
    }

    if (quantity <= 0) {
      // 0以下の場合は削除
      await removeFromPurchasePlan(planId)
      return
    }

    try {
      const planRef = doc($firestore, 'users', user.value.uid, 'purchase_plans', planId)
      await updateDoc(planRef, {
        quantity,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      logger.error('購入数量更新エラー:', err)
      throw err
    }
  }

  /**
   * ユーザーの購入予定一覧を取得
   */
  const getUserPurchasePlans = async (eventId?: string): Promise<PurchasePlan[]> => {
    if (!user.value) {
      logger.warn('ユーザーが認証されていません')
      return []
    }
    
    if (!$firestore) {
      logger.warn('Firestoreが初期化されていません')
      return []
    }

    try {
      loading.value = true
      error.value = null

      const plansRef = collection($firestore, 'users', user.value.uid, 'purchase_plans')
      let q = query(plansRef)
      
      if (eventId) {
        q = query(plansRef, where('eventId', '==', eventId))
      }

      const snapshot = await getDocs(q)
      const plans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PurchasePlan[]

      purchasePlans.value = plans
      return plans
    } catch (err: any) {
      logger.error('購入予定取得エラー:', err)
      
      if (err.code === 'permission-denied') {
        error.value = 'アクセス権限がありません。ログイン状態を確認してください。'
      } else if (err.code === 'unauthenticated') {
        error.value = '認証が必要です。ログインしてください。'
      } else {
        error.value = `購入予定の取得に失敗しました: ${err.message}`
      }
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 特定のアイテムの購入予定を取得
   */
  const getPurchasePlanByItem = async (
    circleId: string,
    itemId: string,
    eventId: string
  ): Promise<PurchasePlan | null> => {
    if (!user.value) {
      logger.warn('ユーザーが認証されていません')
      return null
    }
    
    if (!$firestore) {
      logger.warn('Firestoreが初期化されていません')
      return null
    }

    try {
      const plansRef = collection($firestore, 'users', user.value.uid, 'purchase_plans')
      const q = query(
        plansRef,
        where('circleId', '==', circleId),
        where('itemId', '==', itemId),
        where('eventId', '==', eventId)
      )

      const snapshot = await getDocs(q)
      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as PurchasePlan
    } catch (err) {
      logger.error('購入予定取得エラー:', err)
      return null
    }
  }

  /**
   * 購入予定の存在確認
   */
  const isPurchasePlanned = async (
    circleId: string,
    itemId: string,
    eventId: string
  ): Promise<boolean> => {
    const plan = await getPurchasePlanByItem(circleId, itemId, eventId)
    return !!plan
  }

  /**
   * 購入予定の合計を計算
   */
  const calculateTotal = (plans: PurchasePlan[]): number => {
    return plans.reduce((sum, plan) => sum + (plan.priceAtTime * plan.quantity), 0)
  }

  /**
   * サークル別の集計
   */
  const groupByCircle = (plans: PurchasePlan[]): Map<string, PurchasePlan[]> => {
    const grouped = new Map<string, PurchasePlan[]>()
    
    plans.forEach(plan => {
      const existing = grouped.get(plan.circleId) || []
      grouped.set(plan.circleId, [...existing, plan])
    })
    
    return grouped
  }

  /**
   * リアルタイム更新の監視
   */
  const watchPurchasePlans = (
    eventId: string,
    callback: (plans: PurchasePlan[]) => void
  ): (() => void) => {
    if (!user.value) {
      logger.warn('ユーザーが認証されていません')
      return () => {}
    }
    
    if (!$firestore) {
      logger.warn('Firestoreが初期化されていません')
      return () => {}
    }

    const plansRef = collection($firestore, 'users', user.value.uid, 'purchase_plans')
    const q = query(plansRef, where('eventId', '==', eventId))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PurchasePlan[]

      purchasePlans.value = plans
      callback(plans)
    }, (err) => {
      logger.error('リアルタイム更新エラー:', err)
      error.value = 'リアルタイム更新に失敗しました'
    })

    return unsubscribe
  }

  /**
   * 購入予定のクリア（イベント単位）
   */
  const clearPurchasePlans = async (eventId: string): Promise<void> => {
    if (!user.value) {
      logger.warn('ユーザーが認証されていません')
      return
    }
    
    if (!$firestore) {
      logger.warn('Firestoreが初期化されていません')
      return
    }

    try {
      const plans = await getUserPurchasePlans(eventId)
      await Promise.all(plans.map(plan => removeFromPurchasePlan(plan.id)))
    } catch (err) {
      logger.error('購入予定クリアエラー:', err)
      throw err
    }
  }

  /**
   * 頒布物の存在確認
   */
  const checkItemExists = async (circleId: string, itemId: string, eventId: string): Promise<boolean> => {
    if (!$firestore) {
      logger.warn('Firestoreが初期化されていません')
      return false
    }

    try {
      // サークル情報を取得
      const circleRef = doc($firestore, 'events', eventId, 'circles', circleId)
      const circleDoc = await getDoc(circleRef)
      
      if (!circleDoc.exists()) {
        return false
      }
      
      const circleData = circleDoc.data()
      const items = circleData.items || []
      
      // 頒布物IDが存在するかチェック
      return items.some((item: any) => item.id === itemId)
    } catch (err) {
      logger.error('頒布物存在確認エラー:', err)
      return false
    }
  }

  /**
   * 購入予定データの整合性チェックと自動修復
   */
  const validateAndCleanupPurchasePlans = async (eventId?: string): Promise<{
    removedCount: number;
    removedPlans: PurchasePlan[];
  }> => {
    if (!user.value) {
      logger.warn('ユーザーが認証されていません')
      return { removedCount: 0, removedPlans: [] }
    }
    
    if (!$firestore) {
      logger.warn('Firestoreが初期化されていません')
      return { removedCount: 0, removedPlans: [] }
    }

    try {
      logger.info('🔍 購入予定データの整合性チェックを開始...')
      
      // 購入予定一覧を取得
      const plans = await getUserPurchasePlans(eventId)
      const invalidPlans: PurchasePlan[] = []
      
      // 各購入予定の頒布物存在確認
      for (const plan of plans) {
        const exists = await checkItemExists(plan.circleId, plan.itemId, plan.eventId)
        if (!exists) {
          logger.info(`❌ 無効な購入予定を検出: ${plan.circleName} - ${plan.itemName}`)
          invalidPlans.push(plan)
        }
      }
      
      // 無効な購入予定を削除
      if (invalidPlans.length > 0) {
        logger.info(`🗑️ ${invalidPlans.length}件の無効な購入予定を削除中...`)
        await Promise.all(invalidPlans.map(plan => removeFromPurchasePlan(plan.id)))
        
        // 購入予定リストを更新
        const updatedPlans = plans.filter(plan => 
          !invalidPlans.some(invalid => invalid.id === plan.id)
        )
        purchasePlans.value = updatedPlans
        
        logger.info(`✅ データクリーンアップ完了: ${invalidPlans.length}件削除`)
      } else {
        logger.info('✅ 購入予定データに問題はありません')
      }
      
      return { 
        removedCount: invalidPlans.length, 
        removedPlans: invalidPlans 
      }
    } catch (err) {
      logger.error('購入予定整合性チェックエラー:', err)
      throw err
    }
  }


  return {
    // State
    purchasePlans: readonly(purchasePlans),
    loading: readonly(loading),
    error: readonly(error),
    
    // Methods
    addToPurchasePlan,
    removeFromPurchasePlan,
    updatePurchaseQuantity,
    getUserPurchasePlans,
    getPurchasePlanByItem,
    isPurchasePlanned,
    calculateTotal,
    groupByCircle,
    watchPurchasePlans,
    clearPurchasePlans,
    
    // 整合性チェック機能
    checkItemExists,
    validateAndCleanupPurchasePlans
  }
}