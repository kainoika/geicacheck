<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-if="needRefresh && !dismissed"
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-pink-200 rounded-lg shadow-lg z-50 p-4"
    >
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <ArrowPathIcon class="w-6 h-6 text-pink-500" />
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900">
            アップデートが利用可能です
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            新しい機能と改善が含まれています。今すぐ更新しますか？
          </p>
        </div>
        
        <div class="flex-shrink-0">
          <button
            @click="dismiss"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div class="mt-4 flex space-x-3">
        <button
          @click="handleUpdate"
          :disabled="isUpdating"
          class="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {{ isUpdating ? '更新中...' : '今すぐ更新' }}
        </button>
        
        <button
          @click="dismiss"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          後で
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ArrowPathIcon, XMarkIcon } from '@heroicons/vue/24/outline'

// @vite-pwa/nuxtのPWA機能を利用
const { needRefresh, updateServiceWorker } = usePWA()
const logger = useLogger('PWAUpdateNotification')

// 通知状態
const dismissed = ref(false)
const isUpdating = ref(false)

/**
 * 更新ボタンのクリック処理
 */
const handleUpdate = async () => {
  try {
    isUpdating.value = true
    logger.info('PWA update initiated by user')
    
    // @vite-pwa/nuxtの更新関数を使用
    await updateServiceWorker()
    
  } catch (error) {
    logger.error('PWA update failed:', error)
    isUpdating.value = false
  }
}

/**
 * 通知を閉じる
 */
const dismiss = () => {
  dismissed.value = true
  logger.debug('PWA update notification dismissed')
}

// needRefreshが変更されたら通知を再表示
watch(needRefresh, (newValue) => {
  if (newValue) {
    dismissed.value = false
    logger.info('PWA update notification shown')
  }
})

// コンポーネント初期化時にログ出力
onMounted(() => {
  logger.debug('PWAUpdateNotification mounted', { needRefresh: needRefresh.value })
})
</script>

<style scoped>
/* モバイル対応 */
@media (max-width: 768px) {
  .fixed {
    left: 1rem;
    right: 1rem;
  }
}
</style>