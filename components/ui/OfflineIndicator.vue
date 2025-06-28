<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform -translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-full opacity-0"
  >
    <div
      v-if="isOffline"
      class="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium z-50"
    >
      <div class="flex items-center justify-center space-x-2">
        <WifiIcon class="w-4 h-4" />
        <span>オフラインモード - 一部機能が制限されています</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { WifiIcon } from '@heroicons/vue/24/outline'

// PWA機能を利用
const { isOffline } = usePWA()
const logger = useLogger('OfflineIndicator')

// オフライン状態の変更を監視
watch(isOffline, (newValue) => {
  if (newValue) {
    logger.warn('Application is now offline')
  } else {
    logger.info('Application is back online')
  }
})

// コンポーネント初期化時にログ出力
onMounted(() => {
  logger.debug('OfflineIndicator mounted', { isOffline: isOffline.value })
})
</script>

<style scoped>
/* オフライン表示のアニメーション */
.fixed {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>