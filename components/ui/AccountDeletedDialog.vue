<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <CheckCircleIcon class="h-6 w-6 text-green-600" />
          アカウント削除完了
        </h2>
      </div>

      <div class="modal-body">
        <div class="success-message">
          <div class="success-icon">
            <CheckCircleIcon class="h-12 w-12 text-green-500" />
          </div>
          <div class="success-content">
            <h3 class="success-title">アカウントを削除しました</h3>
            <p class="success-description">
              ご利用ありがとうございました。<br>
              アカウントとすべての関連データが削除されました。
            </p>
          </div>
        </div>

        <div class="info-section">
          <div class="info-icon">
            <InformationCircleIcon class="h-5 w-5 text-blue-500" />
          </div>
          <div class="info-content">
            <h4 class="info-title">削除されたデータ</h4>
            <ul class="info-list">
              <li>ユーザープロフィール情報</li>
              <li>ブックマークデータ</li>
              <li>編集権限申請履歴</li>
              <li>その他の関連データ</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          @click="handleClose"
          class="btn-primary"
        >
          <HomeIcon class="h-5 w-5" />
          トップページに戻る
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  InformationCircleIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const handleClose = () => {
  emit('close')
}

// ESCキーでモーダルを閉じる
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose()
    }
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 pb-4;
}

.modal-title {
  @apply flex items-center gap-3 text-lg font-semibold text-gray-900;
}

.modal-body {
  @apply px-6 pb-4 space-y-6;
}

.success-message {
  @apply text-center space-y-4;
}

.success-icon {
  @apply flex justify-center;
}

.success-content {
  @apply space-y-2;
}

.success-title {
  @apply text-xl font-semibold text-gray-900;
}

.success-description {
  @apply text-gray-600 leading-relaxed;
}

.info-section {
  @apply flex gap-3 p-4 bg-blue-50 rounded-lg;
}

.info-icon {
  @apply flex-shrink-0 mt-0.5;
}

.info-content {
  @apply flex-1;
}

.info-title {
  @apply text-sm font-medium text-gray-900 mb-2;
}

.info-list {
  @apply text-sm text-gray-700 space-y-1;
}

.info-list li {
  @apply flex items-start;
}

.info-list li::before {
  @apply content-['•'] text-blue-500 font-bold mr-2 mt-0.5;
}

.modal-footer {
  @apply flex justify-center gap-3 p-6 pt-4 bg-gray-50 rounded-b-lg;
}

.btn-primary {
  @apply flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700
         focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
         transition-colors duration-200 font-medium;
}

.btn-primary:hover {
  @apply bg-green-700;
}

.btn-primary:focus {
  @apply ring-2 ring-green-500 ring-offset-2;
}
</style>