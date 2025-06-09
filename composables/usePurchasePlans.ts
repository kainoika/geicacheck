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

    console.log('⏳ Firebase認証状態を待機中...')
    let waited = 0
    const interval = 100

    while (waited < maxWait) {
      if (isAuthenticated.value && user.value) {
        console.log('✅ Firebase認証完了')
        return true
      }
      
      await new Promise(resolve => setTimeout(resolve, interval))
      waited += interval
    }

    console.warn('⚠️ Firebase認証タイムアウト')
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

    console.log('🔐 認証状態確認:', {
      isAuthenticated: isAuthenticated.value,
      userId: user.value!.uid,
      hasFirestore: !!$firestore,
      firebaseApp: $firestore.app?.name,
      projectId: $firestore._delegate?._settings?.projectId || 'unknown'
    })

    // Firebase Auth tokenの確認
    try {
      const { $auth } = useNuxtApp()
      if ($auth?.currentUser) {
        const token = await $auth.currentUser.getIdToken(true)
        console.log('🎫 Firebase Auth Token取得成功:', token ? 'あり' : 'なし')
        
        const tokenClaims = await $auth.currentUser.getIdTokenResult()
        console.log('🎫 Token Claims:', {
          uid: tokenClaims.claims.sub,
          email: tokenClaims.claims.email,
          authTime: new Date(tokenClaims.claims.auth_time * 1000),
          issuedAt: new Date(tokenClaims.claims.iat * 1000),
          expiration: new Date(tokenClaims.claims.exp * 1000)
        })
      } else {
        console.warn('⚠️ Firebase Auth currentUser is null')
      }
    } catch (tokenError) {
      console.error('🚨 Token取得エラー:', tokenError)
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

      console.log('📝 購入予定データ準備完了:', planData)
      console.log('🔗 Firestoreパス:', `users/${user.value.uid}/purchase_plans`)

      const plansRef = collection($firestore, 'users', user.value.uid, 'purchase_plans')
      console.log('📋 コレクション参照作成完了')
      
      console.log('💾 Firestoreに保存開始...')
      
      // 現在のFirestoreの認証コンテキストを確認
      console.log('🎫 Firestore認証コンテキスト:', {
        appName: $firestore.app.name,
        currentUser: $firestore._delegate?._authCredentials?.currentUser?.uid,
        settings: $firestore._settings
      })
      
      const docRef = await addDoc(plansRef, planData)
      console.log('✅ Firestore保存成功:', docRef.id)

      return docRef.id
    } catch (err: any) {
      console.error('🚨 購入予定追加エラー:', err)
      console.error('🚨 エラー詳細:', {
        code: err.code,
        message: err.message,
        userId: user.value?.uid,
        circleId,
        itemId,
        eventId,
        price,
        quantity
      })
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
      console.error('購入予定削除エラー:', err)
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
      console.error('購入数量更新エラー:', err)
      throw err
    }
  }

  /**
   * ユーザーの購入予定一覧を取得
   */
  const getUserPurchasePlans = async (eventId?: string): Promise<PurchasePlan[]> => {
    if (!user.value) {
      console.warn('ユーザーが認証されていません')
      return []
    }
    
    if (!$firestore) {
      console.warn('Firestoreが初期化されていません')
      return []
    }

    try {
      loading.value = true
      error.value = null

      console.log('🔍 購入予定取得開始:', { userId: user.value.uid, eventId })
      
      const plansRef = collection($firestore, 'users', user.value.uid, 'purchase_plans')
      let q = query(plansRef)
      
      if (eventId) {
        q = query(plansRef, where('eventId', '==', eventId))
      }

      console.log('📊 Firestoreクエリ実行中...')
      const snapshot = await getDocs(q)
      console.log('📊 クエリ結果:', snapshot.size, '件のドキュメント')
      const plans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PurchasePlan[]

      purchasePlans.value = plans
      return plans
    } catch (err: any) {
      console.error('🚨 購入予定取得エラー:', err)
      console.error('🚨 エラー詳細:', {
        code: err.code,
        message: err.message,
        userId: user.value?.uid,
        eventId
      })
      
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
      console.warn('ユーザーが認証されていません')
      return null
    }
    
    if (!$firestore) {
      console.warn('Firestoreが初期化されていません')
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
      console.error('購入予定取得エラー:', err)
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
      console.warn('ユーザーが認証されていません')
      return () => {}
    }
    
    if (!$firestore) {
      console.warn('Firestoreが初期化されていません')
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
      console.error('リアルタイム更新エラー:', err)
      error.value = 'リアルタイム更新に失敗しました'
    })

    return unsubscribe
  }

  /**
   * 購入予定のクリア（イベント単位）
   */
  const clearPurchasePlans = async (eventId: string): Promise<void> => {
    if (!user.value) {
      console.warn('ユーザーが認証されていません')
      return
    }
    
    if (!$firestore) {
      console.warn('Firestoreが初期化されていません')
      return
    }

    try {
      const plans = await getUserPurchasePlans(eventId)
      await Promise.all(plans.map(plan => removeFromPurchasePlan(plan.id)))
    } catch (err) {
      console.error('購入予定クリアエラー:', err)
      throw err
    }
  }

  /**
   * Firestoreテスト用関数
   */
  const testFirestoreConnection = async (): Promise<boolean> => {
    const authReady = await waitForAuth()
    if (!authReady) {
      console.error('🚨 認証が完了していません')
      return false
    }

    try {
      console.log('🧪 Firestore接続テスト開始')
      const testData = {
        test: true,
        timestamp: new Date(),
        userId: user.value!.uid
      }

      const testRef = collection($firestore, 'users', user.value!.uid, 'purchase_plans')
      console.log('📝 テストデータ準備:', testData)
      
      const docRef = await addDoc(testRef, testData)
      console.log('✅ テストデータ追加成功:', docRef.id)
      
      // テストデータを削除
      await deleteDoc(doc($firestore, 'users', user.value!.uid, 'purchase_plans', docRef.id))
      console.log('🗑️ テストデータ削除完了')
      
      return true
    } catch (err: any) {
      console.error('🚨 Firestore接続テスト失敗:', err)
      console.error('🚨 エラー詳細:', {
        code: err.code,
        message: err.message
      })
      return false
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
    testFirestoreConnection
  }
}