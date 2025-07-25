import { computed, ref } from 'vue'
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { useAuth } from './useAuth'
import type { Circle } from '~/types'

export const useCirclePermissions = () => {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const { $firestore } = useNuxtApp()
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // ユーザーの編集権限をキャッシュ
  const userPermissions = useState<string[]>('userPermissions', () => [])

  // ユーザーの編集権限を取得
  const loadUserPermissions = async () => {
    if (!user.value || !$firestore) {
      userPermissions.value = []
      return
    }

    try {
      const permissionsRef = collection($firestore, 'circle_permissions')
      const q = query(
        permissionsRef,
        where('userId', '==', user.value.uid),
        where('isActive', '==', true)
      )

      const snapshot = await getDocs(q)
      userPermissions.value = snapshot.docs.map(doc => doc.data().circleId)
    } catch (error) {
      console.error('編集権限取得エラー:', error)
      userPermissions.value = []
    }
  }

  /**
   * ユーザーが特定のサークルを編集する権限があるかチェック
   */
  const canEditCircle = (circle: Circle): boolean => {
    // 認証状態チェック
    if (!isAuthenticated.value || !user.value) {
      return false
    }

    // 管理者は全てのサークルを編集可能
    if (user.value.userType === 'admin') {
      return true
    }

    // サークルの所有者かチェック
    if (circle.ownerId && circle.ownerId === user.value.uid) {
      return true
    }

    // 編集権限を持っているかチェック
    return userPermissions.value.includes(circle.id)
  }

  /**
   * ユーザーが画像をアップロードする権限があるかチェック
   */
  const canUploadImages = (circle: Circle): boolean => {
    return canEditCircle(circle)
  }

  /**
   * ユーザーが頒布物を管理する権限があるかチェック
   */
  const canManageItems = (circle: Circle): boolean => {
    return canEditCircle(circle)
  }

  /**
   * ユーザーがジャンルを編集する権限があるかチェック
   */
  const canEditGenres = (circle: Circle): boolean => {
    return canEditCircle(circle)
  }

  /**
   * 権限の再読み込み
   */
  const refreshPermissions = async () => {
    await loadUserPermissions()
  }

  /**
   * 権限エラーメッセージを取得
   */
  const getPermissionErrorMessage = (): string => {
    if (!isAuthenticated.value) {
      return 'この機能を使用するにはログインが必要です'
    }
    return 'この操作を行う権限がありません'
  }

  /**
   * 権限チェック結果を返す
   */
  const checkPermissions = (circle: any) => {
    return {
      canEdit: canEditCircle(circle),
      canUploadImages: canUploadImages(circle),
      canManageItems: canManageItems(circle),
      canEditGenres: canEditGenres(circle),
      errorMessage: canEditCircle(circle) ? null : getPermissionErrorMessage()
    }
  }

  /**
   * サークル権限を詳細チェック（Firebase から取得）
   * TODO: 実際のFirebase実装
   */
  const checkDetailedPermissions = async (circleId: string, eventId: string) => {
    if (!isAuthenticated.value || !user.value) {
      return {
        hasPermission: false,
        permission: null,
        isOwner: false
      }
    }

    loading.value = true
    error.value = null

    try {
      // 管理者は常に権限あり
      if (isAdmin.value) {
        return {
          hasPermission: true,
          permission: 'admin',
          isOwner: false
        }
      }

      // TODO: Firestore から circle_permissions コレクションを確認
      // const { $firestore } = useNuxtApp()
      // const permissionDoc = await getDoc(doc($firestore, 'circle_permissions', `${user.value.uid}_${eventId}_${circleId}`))
      
      return {
        hasPermission: false,
        permission: null,
        isOwner: false
      }

    } catch (err) {
      console.error('権限チェックエラー:', err)
      error.value = '権限の確認中にエラーが発生しました'
      return {
        hasPermission: false,
        permission: null,
        isOwner: false
      }
    } finally {
      loading.value = false
    }
  }

  // ユーザーがログインした時に権限を読み込み
  watch(() => user.value, async (newUser) => {
    if (newUser) {
      await loadUserPermissions()
    } else {
      userPermissions.value = []
    }
  }, { immediate: true })

  return {
    // リアクティブな状態
    loading: readonly(loading),
    error: readonly(error),
    userPermissions: readonly(userPermissions),
    
    // 権限管理
    loadUserPermissions,
    refreshPermissions,
    
    // 権限チェック関数
    canEditCircle,
    canUploadImages,
    canManageItems,
    canEditGenres,
    checkPermissions,
    checkDetailedPermissions,
    
    // ヘルパー
    getPermissionErrorMessage
  }
}