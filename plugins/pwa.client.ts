/**
 * PWA機能拡張プラグイン
 * @vite-pwa/nuxtと連携してPWA機能を拡張
 */

import { useLogger } from '~/composables/useLogger'

export default defineNuxtPlugin(() => {
  const logger = useLogger('PWA')
  
  // ブラウザ環境でのみ実行
  if (process.client) {
    // 重要：イベントリスナーは即座に設定する必要がある
    // beforeinstallpromptイベントは早期に発火する可能性があるため
    setupInstallPrompt()
    
    // ネットワーク状態の初期化
    initializeNetworkStatus()
    
    logger.info('PWA plugin initialized with @vite-pwa/nuxt')
  }
})

/**
 * PWAインストール促進の設定
 */
function setupInstallPrompt() {
  const logger = useLogger('PWA-Install')
  let deferredPrompt: any = null

  // beforeinstallpromptイベントをキャッチ
  window.addEventListener('beforeinstallprompt', (event) => {
    logger.info('PWA install prompt available')
    
    // デフォルトのプロンプトを防ぐ
    event.preventDefault()
    deferredPrompt = event

    // インストール可能状態をグローバルステートに保存
    useState('pwa.installable', () => true)
  })

  // PWAインストール状態確認（即座に実行）
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true
  
  if (isStandalone) {
    logger.info('PWA is already installed')
    useState('pwa.installed', () => true)
  } else {
    logger.debug('PWA not installed, waiting for installability check')
  }

  // PWAがインストールされた時の処理
  window.addEventListener('appinstalled', () => {
    logger.info('PWA installed successfully')
    deferredPrompt = null
    useState('pwa.installable', () => false)
    useState('pwa.installed', () => true)
  })

  // インストールプロンプトを表示する関数をグローバルに提供
  useState('pwa.showInstallPrompt', () => {
    return () => {
      if (deferredPrompt) {
        logger.info('Showing PWA install prompt')
        deferredPrompt.prompt()
        
        deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
          logger.info('PWA install prompt result:', choiceResult.outcome)
          deferredPrompt = null
          if (choiceResult.outcome !== 'accepted') {
            useState('pwa.installable', () => false)
          }
        })
      }
    }
  })
}

/**
 * ネットワーク状態の初期化
 */
function initializeNetworkStatus() {
  const logger = useLogger('PWA-Network')
  
  // 初期状態を設定
  useState('pwa.online', () => navigator.onLine)
  
  // ネットワーク状態の変更を監視
  const handleOnline = () => {
    logger.info('Network status: online')
    useState('pwa.online', () => true)
  }

  const handleOffline = () => {
    logger.warn('Network status: offline')
    useState('pwa.online', () => false)
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
}