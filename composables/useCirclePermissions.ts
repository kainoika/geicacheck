import { computed, ref } from 'vue'
import { useAuth } from './useAuth'

export const useCirclePermissions = () => {
  const { user, isAuthenticated, isAdmin } = useAuth()
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * ユーザーが特定のサークルを編集する権限があるかチェック
   */
  const canEditCircle = (circle: any): boolean => {
    if (!isAuthenticated.value || !user.value) {
      return false
    }

    // 管理者は全てのサークルを編集可能
    if (isAdmin.value) {
      return true
    }

    // サークルの所有者かチェック
    if (circle.ownerId === user.value.uid) {
      return true
    }

    // TODO: サークル権限テーブルをチェック
    // 現在は簡易実装として所有者と管理者のみ許可
    return false
  }

  /**
   * ユーザーが画像をアップロードする権限があるかチェック
   */
  const canUploadImages = (circle: any): boolean => {
    return canEditCircle(circle)
  }

  /**
   * ユーザーが頒布物を管理する権限があるかチェック
   */
  const canManageItems = (circle: any): boolean => {
    return canEditCircle(circle)
  }

  /**
   * ユーザーがジャンルを編集する権限があるかチェック
   */
  const canEditGenres = (circle: any): boolean => {
    return canEditCircle(circle)
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

  return {
    // リアクティブな状態
    loading: readonly(loading),
    error: readonly(error),
    
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