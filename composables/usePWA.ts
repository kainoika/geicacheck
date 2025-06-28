/**
 * PWA機能管理用のComposable
 * PWAのインストール、更新、オフライン状態などを管理
 */

import { useLogger } from './useLogger'

export const usePWA = () => {
  const logger = useLogger('usePWA')

  // PWA関連のリアクティブステート
  const isInstallable = useState('pwa.installable', () => false)
  const isInstalled = useState('pwa.installed', () => false)
  const isUpdateAvailable = useState('pwa.updateAvailable', () => false)
  const isOnline = useState('pwa.online', () => true)

  // インストールプロンプト表示関数
  const showInstallPrompt = useState('pwa.showInstallPrompt', () => () => {})
  
  // 更新適用関数
  const applyUpdate = useState('pwa.applyUpdate', () => () => {})

  /**
   * オンライン/オフライン状態の監視を開始
   */
  const startNetworkMonitoring = () => {
    if (process.client) {
      // 初期状態を設定
      isOnline.value = navigator.onLine

      // ネットワーク状態の変更を監視
      const handleOnline = () => {
        logger.info('Network status: online')
        isOnline.value = true
      }

      const handleOffline = () => {
        logger.warn('Network status: offline')
        isOnline.value = false
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // クリーンアップ
      onUnmounted(() => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      })
    }
  }

  /**
   * PWAがインストール済みかどうかをチェック
   */
  const checkInstallStatus = () => {
    if (process.client) {
      // スタンドアロンモードで実行されているかチェック
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true

      isInstalled.value = isStandalone
      logger.debug('PWA install status:', { isStandalone, isInstalled: isInstalled.value })
    }
  }

  /**
   * Service Workerにメッセージを送信
   */
  const sendMessageToSW = (message: any) => {
    if (process.client && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message)
      logger.debug('Message sent to Service Worker:', message)
    }
  }

  /**
   * キャッシュクリア
   */
  const clearCache = async () => {
    if (process.client && 'caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        logger.info('All caches cleared')
      } catch (error) {
        logger.error('Failed to clear caches:', error)
      }
    }
  }

  /**
   * PWAインストールを促進
   */
  const promptInstall = () => {
    if (isInstallable.value) {
      showInstallPrompt.value()
    } else {
      logger.warn('PWA install prompt not available')
    }
  }

  /**
   * PWA機能の初期化
   */
  const initialize = () => {
    if (process.client) {
      startNetworkMonitoring()
      checkInstallStatus()
      logger.info('PWA composable initialized')
    }
  }

  // computed プロパティ
  const canInstall = computed(() => isInstallable.value && !isInstalled.value)
  const needsUpdate = computed(() => isUpdateAvailable.value)
  const isOffline = computed(() => !isOnline.value)

  return {
    // ステート
    isInstallable: readonly(isInstallable),
    isInstalled: readonly(isInstalled),
    isUpdateAvailable: readonly(isUpdateAvailable),
    isOnline: readonly(isOnline),
    
    // computed
    canInstall,
    needsUpdate,
    isOffline,
    
    // メソッド
    promptInstall,
    applyUpdate,
    sendMessageToSW,
    clearCache,
    initialize,
    startNetworkMonitoring,
    checkInstallStatus
  }
}