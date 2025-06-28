<template>
  <div v-if="canInstall" class="fixed bottom-4 right-4 z-50">
    <button
      @click="handleInstall"
      class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
      :disabled="isInstalling"
    >
      <PhoneIcon class="w-5 h-5" />
      <span class="font-medium">
        {{ isInstalling ? 'インストール中...' : 'アプリをインストール' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PhoneIcon } from '@heroicons/vue/24/outline'

// PWA機能とインストールプロンプトを利用
const logger = useLogger('PWAInstallButton')

// インストール状態管理
const isInstallable = useState('pwa.installable', () => false)
const isInstalled = useState('pwa.installed', () => false)
const showInstallPrompt = useState('pwa.showInstallPrompt', () => () => {})

const canInstall = computed(() => isInstallable.value && !isInstalled.value)

// インストール状態
const isInstalling = ref(false)

/**
 * インストールボタンのクリック処理
 */
const handleInstall = async () => {
  try {
    isInstalling.value = true
    logger.info('PWA install button clicked')
    
    // インストールプロンプトを表示
    showInstallPrompt.value()
    
    // インストール完了の待機
    setTimeout(() => {
      isInstalling.value = false
    }, 2000)
    
  } catch (error) {
    logger.error('PWA install failed:', error)
    isInstalling.value = false
  }
}

// コンポーネント初期化時にログ出力
onMounted(() => {
  logger.debug('PWAInstallButton mounted', { canInstall: canInstall.value })
})
</script>

<style scoped>
/* アニメーション効果 */
.transform {
  transition: transform 0.2s ease-in-out;
}

/* モバイル対応 */
@media (max-width: 640px) {
  .fixed {
    bottom: 1rem;
    right: 1rem;
  }
}</style>