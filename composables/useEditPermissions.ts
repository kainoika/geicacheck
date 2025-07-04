import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import type { EditPermissionRequest, PermissionStatus } from '~/types'

interface EditPermissionsDependencies {
  firestore?: any
  auth?: ReturnType<typeof useAuth>
}

export const useEditPermissions = (deps?: EditPermissionsDependencies) => {
  const { $firestore } = deps?.firestore ? { $firestore: deps.firestore } : useNuxtApp()
  const { user } = deps?.auth ?? useAuth()

  // 編集権限申請を送信
  const submitEditPermissionRequest = async (data: {
    circleId: string
    applicantTwitterId: string
    registeredTwitterId: string
    reason?: string
  }) => {
    if (!user.value || !$firestore) {
      throw new Error('ユーザーまたはFirestoreが初期化されていません')
    }

    // Twitterスクリーンネームの一致チェック
    const isAutoApproved = data.applicantTwitterId.toLowerCase() === data.registeredTwitterId.toLowerCase()

    const requestData = {
      userId: user.value.uid,
      circleId: data.circleId,
      applicantTwitterId: data.applicantTwitterId,
      registeredTwitterId: data.registeredTwitterId,
      status: (isAutoApproved ? 'auto_approved' : 'pending') as PermissionStatus,
      isAutoApproved,
      ...(data.reason && { adminNote: data.reason }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isAutoApproved && {
        approvedAt: serverTimestamp(),
        approvedBy: 'system'
      })
    }

    const requestsRef = collection($firestore, 'edit_permission_requests')
    const docRef = await addDoc(requestsRef, requestData)

    // 自動承認の場合は権限を直接付与
    // 注: circle_permissionsへの書き込みは管理者権限が必要なため、
    // 自動承認の申請は作成されるが、実際の権限付与は管理者またはシステムによって行われる
    // if (isAutoApproved) {
    //   await grantCirclePermission(user.value.uid, data.circleId, 'editor')
    // }

    return docRef.id
  }

  // 権限を付与
  const grantCirclePermission = async (
    userId: string, 
    circleId: string, 
    permission: 'owner' | 'editor'
  ) => {
    if (!$firestore) {
      throw new Error('Firestoreが初期化されていません')
    }

    const permissionData = {
      userId,
      circleId,
      permission,
      grantedAt: serverTimestamp(),
      grantedBy: user.value?.uid || 'system',
      isActive: true
    }

    const permissionsRef = collection($firestore, 'circle_permissions')
    await addDoc(permissionsRef, permissionData)

    // サークルのownerIdを更新（権限付与時）
    // circleIdからeventIdを抽出（例: "geica32-038" -> "geica-32"）
    const eventIdMatch = circleId.match(/^geica(\d+)-/)
    if (eventIdMatch) {
      const eventId = `geica-${eventIdMatch[1]}`
      const circleRef = doc($firestore, 'events', eventId, 'circles', circleId)
      
      try {
        await updateDoc(circleRef, {
          ownerId: userId,
          updatedAt: serverTimestamp()
        })
      } catch (error) {
        console.error('サークルのownerId更新エラー:', error)
        // 権限付与は成功させるため、エラーは記録のみ
      }
    }
  }

  // ユーザーの編集権限申請一覧を取得
  const getUserEditPermissionRequests = async (userId?: string) => {
    if (!$firestore) return []
    
    const targetUserId = userId || user.value?.uid
    if (!targetUserId) return []

    try {
      const requestsRef = collection($firestore, 'edit_permission_requests')
      // インデックスエラーを回避するため、orderByなしでuserIdのみでフィルタ
      const q = query(
        requestsRef,
        where('userId', '==', targetUserId)
      )

      const snapshot = await getDocs(q)
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate()
      })) as EditPermissionRequest[]

      // クライアントサイドでソートを実行
      return requests.sort((a, b) => {
        const aDate = a.createdAt || new Date(0)
        const bDate = b.createdAt || new Date(0)
        return bDate.getTime() - aDate.getTime()
      })
    } catch (error) {
      console.error('getUserEditPermissionRequests error:', error)
      // エラーの場合は空配列を返す
      return []
    }
  }

  // 全ての編集権限申請を取得（管理者用）
  const getAllEditPermissionRequests = async () => {
    if (!$firestore) return []

    const requestsRef = collection($firestore, 'edit_permission_requests')
    const q = query(requestsRef, orderBy('createdAt', 'desc'))

    const snapshot = await getDocs(q)
    const requests = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data()
        
        // ユーザー情報を取得
        let user = null
        if (data.userId) {
          try {
            const userRef = doc($firestore, 'users', data.userId)
            const userDoc = await getDoc(userRef)
            if (userDoc.exists()) {
              user = userDoc.data()
            }
          } catch (error) {
            console.error('ユーザー情報取得エラー:', error)
          }
        }

        return {
          id: docSnapshot.id,
          ...data,
          user,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          approvedAt: data.approvedAt?.toDate()
        }
      })
    )

    return requests as EditPermissionRequest[]
  }

  // 編集権限申請を承認
  const approveEditPermissionRequest = async (requestId: string) => {
    if (!user.value || !$firestore) {
      throw new Error('ユーザーまたはFirestoreが初期化されていません')
    }

    // リクエスト情報を取得
    const requestRef = doc($firestore, 'edit_permission_requests', requestId)
    const requestDoc = await getDoc(requestRef)
    
    if (!requestDoc.exists()) {
      throw new Error('申請が見つかりません')
    }

    const requestData = requestDoc.data()

    // 申請を承認状態に更新
    await updateDoc(requestRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: user.value.uid,
      updatedAt: serverTimestamp()
    })

    // サークル編集権限を付与
    await grantCirclePermission(requestData.userId, requestData.circleId, 'editor')
  }

  // 編集権限申請を却下
  const rejectEditPermissionRequest = async (requestId: string, reason?: string) => {
    if (!user.value || !$firestore) {
      throw new Error('ユーザーまたはFirestoreが初期化されていません')
    }

    const requestRef = doc($firestore, 'edit_permission_requests', requestId)
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectionReason: reason,
      approvedBy: user.value.uid,
      updatedAt: serverTimestamp()
    })
  }

  // 自動承認対象の申請を一括処理（管理者用）
  const processAutoApprovedRequests = async () => {
    if (!user.value || !$firestore) {
      throw new Error('ユーザーまたはFirestoreが初期化されていません')
    }

    // 管理者権限チェック
    const userDoc = await getDoc(doc($firestore, 'users', user.value.uid))
    if (!userDoc.exists() || userDoc.data().userType !== 'admin') {
      throw new Error('管理者権限が必要です')
    }

    // auto_approved ステータスの申請を取得
    const requestsRef = collection($firestore, 'edit_permission_requests')
    const q = query(
      requestsRef,
      where('status', '==', 'auto_approved'),
      where('isAutoApproved', '==', true)
    )

    const snapshot = await getDocs(q)
    const results = { success: 0, failed: 0 }

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data()
      
      try {
        // 権限を付与
        await grantCirclePermission(data.userId, data.circleId, 'editor')
        
        // 申請を承認済みに更新
        await updateDoc(docSnapshot.ref, {
          status: 'approved',
          approvedAt: serverTimestamp(),
          approvedBy: user.value.uid,
          updatedAt: serverTimestamp()
        })
        
        results.success++
      } catch (error) {
        console.error(`自動承認処理エラー (${docSnapshot.id}):`, error)
        results.failed++
      }
    }

    return results
  }

  // ユーザーがサークルの編集権限を持っているかチェック
  const hasCircleEditPermission = async (userId: string, circleId: string) => {
    if (!$firestore) return false

    try {
      const permissionsRef = collection($firestore, 'circle_permissions')
      // インデックスエラーを回避するため、userIdのみでフィルタしてクライアントサイドで絞り込み
      const q = query(
        permissionsRef,
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      // クライアントサイドで circleId と isActive をフィルタ
      const activePermissions = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.circleId === circleId && data.isActive === true
      })
      
      return activePermissions.length > 0
    } catch (error) {
      console.error('hasCircleEditPermission error:', error)
      return false
    }
  }

  // ユーザーの編集権限一覧を取得
  const getUserCirclePermissions = async (userId?: string) => {
    if (!$firestore) return []
    
    const targetUserId = userId || user.value?.uid
    if (!targetUserId) return []

    try {
      const permissionsRef = collection($firestore, 'circle_permissions')
      const q = query(
        permissionsRef,
        where('userId', '==', targetUserId),
        where('isActive', '==', true)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        grantedAt: doc.data().grantedAt?.toDate()
      }))
    } catch (error) {
      console.error('getUserCirclePermissions error:', error)
      // エラーの場合は空配列を返す
      return []
    }
  }

  // 特定サークルに対する申請が既に存在するかチェック（申請中のみ）
  const hasExistingRequest = async (userId: string, circleId: string) => {
    if (!$firestore) return false

    try {
      const requestsRef = collection($firestore, 'edit_permission_requests')
      // インデックスエラーを回避するため、userIdのみでフィルタしてクライアントサイドで絞り込み
      const q = query(
        requestsRef,
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      // クライアントサイドで circleId と status をフィルタ
      const pendingRequests = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.circleId === circleId && data.status === 'pending'
      })
      
      return pendingRequests.length > 0
    } catch (error) {
      console.error('hasExistingRequest error:', error)
      return false
    }
  }

  return {
    submitEditPermissionRequest,
    grantCirclePermission,
    getUserEditPermissionRequests,
    getAllEditPermissionRequests,
    approveEditPermissionRequest,
    rejectEditPermissionRequest,
    processAutoApprovedRequests,
    hasCircleEditPermission,
    getUserCirclePermissions,
    hasExistingRequest
  }
}