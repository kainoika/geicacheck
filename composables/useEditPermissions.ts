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

export const useEditPermissions = () => {
  const { $firestore } = useNuxtApp()
  const { user } = useAuth()

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
      adminNote: data.reason,
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
    if (isAutoApproved) {
      await grantCirclePermission(user.value.uid, data.circleId, 'editor')
    }

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
  }

  // ユーザーの編集権限申請一覧を取得
  const getUserEditPermissionRequests = async (userId?: string) => {
    if (!$firestore) return []
    
    const targetUserId = userId || user.value?.uid
    if (!targetUserId) return []

    const requestsRef = collection($firestore, 'edit_permission_requests')
    const q = query(
      requestsRef,
      where('userId', '==', targetUserId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      approvedAt: doc.data().approvedAt?.toDate()
    })) as EditPermissionRequest[]
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

  // ユーザーがサークルの編集権限を持っているかチェック
  const hasCircleEditPermission = async (userId: string, circleId: string) => {
    if (!$firestore) return false

    const permissionsRef = collection($firestore, 'circle_permissions')
    const q = query(
      permissionsRef,
      where('userId', '==', userId),
      where('circleId', '==', circleId),
      where('isActive', '==', true)
    )

    const snapshot = await getDocs(q)
    return !snapshot.empty
  }

  // ユーザーの編集権限一覧を取得
  const getUserCirclePermissions = async (userId?: string) => {
    if (!$firestore) return []
    
    const targetUserId = userId || user.value?.uid
    if (!targetUserId) return []

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
  }

  // 特定サークルに対する申請が既に存在するかチェック（申請中のみ）
  const hasExistingRequest = async (userId: string, circleId: string) => {
    if (!$firestore) return false

    const requestsRef = collection($firestore, 'edit_permission_requests')
    const q = query(
      requestsRef,
      where('userId', '==', userId),
      where('circleId', '==', circleId),
      where('status', '==', 'pending')
    )

    const snapshot = await getDocs(q)
    return !snapshot.empty
  }

  return {
    submitEditPermissionRequest,
    grantCirclePermission,
    getUserEditPermissionRequests,
    getAllEditPermissionRequests,
    approveEditPermissionRequest,
    rejectEditPermissionRequest,
    hasCircleEditPermission,
    getUserCirclePermissions,
    hasExistingRequest
  }
}