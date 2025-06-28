/**
 * PWA Service Worker登録プラグイン
 * ブラウザでのみ実行されるクライアントサイドプラグイン
 */

import { useLogger } from '~/composables/useLogger'

export default defineNuxtPlugin(async () => {
  const logger = useLogger('PWA')
  
  // Service Workerサポートの確認
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Worker is not supported')
    return
  }

  try {
    // Service Worker登録
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    
    logger.info('Service Worker registered successfully', {
      scope: registration.scope,
      state: registration.installing?.state || registration.waiting?.state || registration.active?.state
    })

    // 更新チェック
    registration.addEventListener('updatefound', () => {
      logger.info('Service Worker update found')
      const newWorker = registration.installing
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            logger.info('New Service Worker installed, ready to activate')
            // ここで更新通知UIを表示することができます
            showUpdateNotification()
          }
        })
      }
    })

    // Service Workerからのメッセージ処理
    navigator.serviceWorker.addEventListener('message', (event) => {
      logger.debug('Message from Service Worker:', event.data)
      
      switch (event.data.type) {
        case 'CACHE_UPDATED':
          logger.info('Cache updated')
          break
        case 'OFFLINE_READY':
          logger.info('App ready for offline use')
          break
      }
    })

    // PWAインストール促進
    setupInstallPrompt()

  } catch (error) {
    logger.error('Service Worker registration failed:', error)
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
 * Service Worker更新通知の表示
 */
function showUpdateNotification() {
  const logger = useLogger('PWA-Update')
  
  // 更新通知状態をグローバルに設定
  useState('pwa.updateAvailable', () => true)
  
  logger.info('Update notification shown')
  
  // 更新を適用する関数をグローバルに提供
  useState('pwa.applyUpdate', () => {
    return () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // 新しいService Workerに制御を移譲
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
        
        // ページリロード
        window.location.reload()
      }
    }
  })
}