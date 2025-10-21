<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <PencilIcon class="h-6 w-6 text-green-600" />
          編集権限申請
        </h2>
        <button @click="$emit('close')" class="close-button">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <div class="modal-body">
        <div class="circle-info">
          <h3 class="circle-name">{{ circle.circleName }}</h3>
          <p class="circle-placement">{{ formatPlacement(circle.placement) }}</p>
          <p v-if="circle.contact.twitter" class="twitter-info">
            Twitter: {{ getTwitterUsername(circle.contact.twitter) }}
          </p>
        </div>

        <div class="info-section">
          <div class="info-icon">
            <InformationCircleIcon class="h-5 w-5 text-blue-500" />
          </div>
          <div class="info-content">
            <h4 class="info-title">編集権限について</h4>
            <ul class="info-list">
              <li>申請が承認されると、このサークルの情報を編集できるようになります</li>
              <li>承認条件：申請者のTwitterスクリーンネームとサークルのTwitter情報が一致していること</li>
              <li>※承認・却下まで最大で1日程度お時間を頂く可能性がございます</li>
            </ul>
          </div>
        </div>

        <div class="twitter-match-section">
          <div class="match-check" :class="{ 'match-success': twitterMatches, 'match-warning': !twitterMatches }">
            <div class="match-icon">
              <CheckCircleIcon v-if="twitterMatches" class="h-5 w-5 text-green-500" />
              <ExclamationTriangleIcon v-else class="h-5 w-5 text-yellow-500" />
            </div>
            <div class="match-content">
              <h4 class="match-title">Twitter情報確認</h4>
              <p v-if="twitterMatches" class="match-message success">
                あなたのTwitterスクリーンネーム（@{{ userTwitterScreenName }}）とサークルのTwitter情報が一致しています。
              </p>
              <p v-else class="match-message warning">
                {{ twitterMatchErrorMessage }}
              </p>
            </div>
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">
            申請理由
            <span v-if="!twitterMatches" class="required-badge">必須</span>
            <span v-else class="optional-badge">任意</span>
          </label>
          <textarea v-model="reason" class="form-textarea" :class="{ 'error': !twitterMatches && showReasonError }"
            rows="3"
            :placeholder="twitterMatches ? '編集を希望する理由があれば記入してください（例：サークル主、関係者など）' : '編集を希望する理由を記入してください（例：サークル主、関係者など）'" />
          <p v-if="!twitterMatches && showReasonError" class="error-message">
            Twitter情報が一致しない場合は申請理由の入力が必須です
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-button" :disabled="submitting">
          キャンセル
        </button>
        <button @click="submitRequest" class="submit-button" :disabled="submitting">
          <div v-if="submitting" class="loading-spinner"></div>
          {{ submitting ? '申請中...' : '申請を送信' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PencilIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import type { Circle } from '~/types'

// Props
interface Props {
  circle: Circle
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  success: []
}>()

// Composables
const { user } = useAuth()
const { formatPlacement } = useCircles()
const { submitEditPermissionRequest } = useEditPermissions()

// State
const reason = ref('')
const submitting = ref(false)
const showReasonError = ref(false)

// Computed
const userTwitterScreenName = computed(() => user.value?.twitterScreenName || '')
const circleTwitterUsername = computed(() => {
  if (!props.circle.contact.twitter) return ''
  return getTwitterUsername(props.circle.contact.twitter)
})

const twitterMatches = computed(() => {
  if (!userTwitterScreenName.value || !circleTwitterUsername.value) return false
  return userTwitterScreenName.value.toLowerCase() === circleTwitterUsername.value.toLowerCase()
})

const twitterMatchErrorMessage = computed(() => {
  if (!userTwitterScreenName.value) {
    return 'Twitterスクリーンネームが取得できていません。再ログインをお試しください。'
  }
  if (!circleTwitterUsername.value) {
    return 'このサークルのTwitter情報が登録されていません。'
  }
  return `あなたのTwitterスクリーンネーム（@${userTwitterScreenName.value}）とサークルのTwitter情報（@${circleTwitterUsername.value}）が一致しません。手動審査となります。`
})

// Methods
const getTwitterUsername = (twitterUrl: string) => {
  if (!twitterUrl) return ''
  return twitterUrl.replace(/\/+$/, '').split('/').pop() || ''
}

const submitRequest = async () => {
  if (!user.value) return

  // Twitter情報が一致しない場合は申請理由が必須
  if (!twitterMatches.value && !reason.value.trim()) {
    showReasonError.value = true
    return
  }

  submitting.value = true
  try {
    await submitEditPermissionRequest({
      circleId: props.circle.id,
      applicantTwitterId: userTwitterScreenName.value,
      registeredTwitterId: circleTwitterUsername.value,
      reason: reason.value.trim() || undefined
    })

    emit('success')
  } catch (error) {
    console.error('編集権限申請エラー:', error)
    alert('申請の送信に失敗しました。もう一度お試しください。')
  } finally {
    submitting.value = false
  }
}

// reasonの値が変更されたらエラー表示をリセット
watch(reason, () => {
  if (showReasonError.value && reason.value.trim()) {
    showReasonError.value = false
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.circle-info {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.circle-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.circle-placement {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.twitter-info {
  color: #1da1f2;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.info-section {
  display: flex;
  gap: 0.75rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1rem;
}

.info-icon {
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 0.5rem 0;
}

.info-list {
  font-size: 0.875rem;
  color: #075985;
  margin: 0;
  padding-left: 1rem;
  line-height: 1.5;
}

.info-list li {
  margin-bottom: 0.25rem;
}

.twitter-match-section {
  margin: 0;
}

.match-check {
  display: flex;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 1rem;
}

.match-check.match-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.match-check.match-warning {
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.match-icon {
  flex-shrink: 0;
}

.match-content {
  flex: 1;
}

.match-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.match-check.match-success .match-title {
  color: #166534;
}

.match-check.match-warning .match-title {
  color: #92400e;
}

.match-message {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.match-message.success {
  color: #15803d;
}

.match-message.warning {
  color: #a16207;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 5rem;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #ff69b4;
  box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
}

.form-textarea.error {
  border-color: #ef4444;
}

.form-textarea.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.required-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #ef4444;
  background: #fee2e2;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.optional-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.error-message {
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-button:hover:not(:disabled) {
  background: #f9fafb;
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-button {
  padding: 0.5rem 1rem;
  border: none;
  background: #ff69b4;
  color: white;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #e91e63;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-body {
    gap: 1rem;
  }

  .info-section,
  .match-check {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
    justify-content: center;
  }
}
</style>