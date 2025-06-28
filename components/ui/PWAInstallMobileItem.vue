<template>
  <div v-if="canInstall">
    <!-- モバイル用メニュー項目 -->
    <button
      @click="handleInstall"
      :disabled="isInstalling"
      class="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition-colors"
    >
      <PhoneIcon class="h-5 w-5 mr-2" />
      <span>
        {{ isInstalling ? 'インストール中...' : 'アプリをインストール' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PhoneIcon } from '@heroicons/vue/24/outline'

// PWA機能とインストールプロンプトを利用
const logger = useLogger('PWAInstallMobileItem')

// インストール状態管理
const isInstallable = useState('pwa.installable', () => false)
const isInstalled = useState('pwa.installed', () => false)
const showInstallPrompt = useState('pwa.showInstallPrompt', () => () => {})

const canInstall = computed(() => isInstallable.value && !isInstalled.value)

// インストール状態
const isInstalling = ref(false)

// Emits
const emit = defineEmits<{
  install: []
}>()

/**
 * インストールボタンのクリック処理
 */
const handleInstall = async () => {
  try {
    isInstalling.value = true
    logger.info('PWA install mobile item clicked')
    
    // インストールプロンプトを表示
    showInstallPrompt.value()
    
    // 親コンポーネントに通知（メニューを閉じるため）
    emit('install')
    
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
  logger.debug('PWAInstallMobileItem mounted', { canInstall: canInstall.value })
})
</script>