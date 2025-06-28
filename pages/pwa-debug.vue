<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">PWAデバッグ情報</h1>
    
    <!-- PWA状態 -->
    <div class="bg-gray-100 p-4 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-3">PWA状態</h2>
      <ul class="space-y-2">
        <li>isInstallable: <code class="bg-gray-200 px-2 py-1 rounded">{{ isInstallable }}</code></li>
        <li>isInstalled: <code class="bg-gray-200 px-2 py-1 rounded">{{ isInstalled }}</code></li>
        <li>canInstall: <code class="bg-gray-200 px-2 py-1 rounded">{{ canInstall }}</code></li>
        <li>beforeinstallpromptイベント: <code class="bg-gray-200 px-2 py-1 rounded">{{ hasPromptEvent }}</code></li>
      </ul>
    </div>

    <!-- ブラウザ情報 -->
    <div class="bg-gray-100 p-4 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-3">ブラウザ情報</h2>
      <ul class="space-y-2">
        <li>UA: <code class="bg-gray-200 px-2 py-1 rounded text-xs">{{ userAgent }}</code></li>
        <li>スタンドアロン: <code class="bg-gray-200 px-2 py-1 rounded">{{ isStandalone }}</code></li>
        <li>HTTPS: <code class="bg-gray-200 px-2 py-1 rounded">{{ isHttps }}</code></li>
      </ul>
    </div>

    <!-- Manifest確認 -->
    <div class="bg-gray-100 p-4 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-3">Manifest確認</h2>
      <div v-if="manifestLink">
        <p class="mb-2">リンク検出: <code class="bg-green-200 px-2 py-1 rounded">{{ manifestLink }}</code></p>
        <button @click="checkManifest" class="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
          Manifestを確認
        </button>
        <pre v-if="manifestData" class="mt-3 bg-gray-200 p-3 rounded overflow-auto text-xs">{{ manifestData }}</pre>
      </div>
      <p v-else class="text-red-600">❌ manifest linkが見つかりません</p>
    </div>

    <!-- Service Worker確認 -->
    <div class="bg-gray-100 p-4 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-3">Service Worker状態</h2>
      <ul class="space-y-2">
        <li>サポート: <code class="bg-gray-200 px-2 py-1 rounded">{{ swSupported }}</code></li>
        <li>登録済み: <code class="bg-gray-200 px-2 py-1 rounded">{{ swRegistered }}</code></li>
        <li v-if="swRegistration">Scope: <code class="bg-gray-200 px-2 py-1 rounded">{{ swRegistration.scope }}</code></li>
      </ul>
    </div>

    <!-- テストボタン -->
    <div class="bg-gray-100 p-4 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-3">テスト機能</h2>
      <button @click="testInstallPrompt" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-3">
        インストールプロンプトをテスト
      </button>
      <button @click="clearSiteData" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        サイトデータをクリア
      </button>
    </div>

    <!-- イベントログ -->
    <div class="bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-3">イベントログ</h2>
      <div class="bg-gray-200 p-3 rounded h-48 overflow-auto">
        <pre class="text-xs">{{ eventLog }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const logger = useLogger('PWADebug')

// PWA状態
const isInstallable = useState('pwa.installable', () => false)
const isInstalled = useState('pwa.installed', () => false)
const showInstallPrompt = useState('pwa.showInstallPrompt', () => () => {})
const canInstall = computed(() => isInstallable.value && !isInstalled.value)

// デバッグ情報
const hasPromptEvent = ref(false)
const userAgent = ref('')
const isStandalone = ref(false)
const isHttps = ref(false)
const manifestLink = ref('')
const manifestData = ref('')
const swSupported = ref(false)
const swRegistered = ref(false)
const swRegistration = ref<ServiceWorkerRegistration | null>(null)
const eventLog = ref('')

// イベントログ追加
const addLog = (message: string) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  eventLog.value += `[${timestamp}] ${message}\n`
}

// 初期化
onMounted(async () => {
  if (process.client) {
    // ブラウザ情報
    userAgent.value = navigator.userAgent
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    isHttps.value = location.protocol === 'https:'
    
    // Manifestリンク確認
    const manifestEl = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
    if (manifestEl) {
      manifestLink.value = manifestEl.href
      addLog(`Manifest link found: ${manifestEl.href}`)
    } else {
      addLog('No manifest link found in document')
    }
    
    // Service Worker確認
    if ('serviceWorker' in navigator) {
      swSupported.value = true
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        swRegistered.value = true
        swRegistration.value = registration
        addLog(`Service Worker registered: ${registration.scope}`)
      } else {
        addLog('No Service Worker registration found')
      }
    }
    
    // beforeinstallpromptイベントリスナー
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      hasPromptEvent.value = true
      addLog('beforeinstallprompt event fired!')
      logger.info('beforeinstallprompt received in debug page')
    })
    
    // appinstalledイベントリスナー
    window.addEventListener('appinstalled', () => {
      addLog('appinstalled event fired!')
    })
  }
})

// Manifest確認
const checkManifest = async () => {
  try {
    const response = await fetch(manifestLink.value)
    const data = await response.json()
    manifestData.value = JSON.stringify(data, null, 2)
    addLog('Manifest loaded successfully')
  } catch (error) {
    manifestData.value = `Error: ${error}`
    addLog(`Manifest load error: ${error}`)
  }
}

// インストールプロンプトテスト
const testInstallPrompt = () => {
  addLog('Testing install prompt...')
  showInstallPrompt.value()
}

// サイトデータクリア
const clearSiteData = async () => {
  if (confirm('Service WorkerとキャッシュをクリアしますがOKですか？')) {
    try {
      // Service Worker登録解除
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }
      }
      
      // キャッシュクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      
      addLog('Site data cleared. Reloading...')
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      addLog(`Clear error: ${error}`)
    }
  }
}
</script>