<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- 認証チェック中のローディング -->
    <div v-if="!isAuthenticated" style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">🔐</div>
        <div style="font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">
          認証を確認しています...
        </div>
        <div style="color: #6b7280;">
          管理者権限を確認中です
        </div>
      </div>
    </div>

    <!-- メインコンテンツ（認証済みの場合のみ表示） -->
    <div v-else>
    <!-- ヘッダー -->
    <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 2rem 0;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
              編集権限申請管理
            </h1>
            <p style="color: #6b7280; margin: 0;">
              サークル情報編集権限の申請を審査・管理
            </p>
          </div>
          
          <div style="display: flex; gap: 1rem;">
            <!-- 自動承認一括処理ボタン -->
            <button
              v-if="autoApprovedCount > 0"
              @click="processAllAutoApproved"
              style="padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;"
              onmouseover="this.style.backgroundColor='#7c3aed'"
              onmouseout="this.style.backgroundColor='#8b5cf6'"
              :disabled="processingAutoApproved"
            >
              <CheckCircleIcon class="h-5 w-5" />
              <span v-if="!processingAutoApproved">自動承認を一括処理 ({{ autoApprovedCount }}件)</span>
              <span v-else>処理中...</span>
            </button>
            
            <!-- 統計情報 -->
            <div style="display: flex; gap: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem;">
              <div style="text-align: center;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #f59e0b;">{{ pendingCount }}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">申請中</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #8b5cf6;">{{ autoApprovedCount }}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">自動承認待ち</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">{{ approvedCount }}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">承認済み</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #ef4444;">{{ rejectedCount }}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">却下</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
      <!-- フィルタータブ -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; gap: 0.5rem; background: white; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
          <button
            v-for="status in statusFilters"
            :key="status.key"
            @click="activeStatus = status.key"
            :style="{
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: activeStatus === status.key ? status.color : 'transparent',
              color: activeStatus === status.key ? 'white' : '#6b7280'
            }"
          >
            <component :is="getStatusIcon(status.key)" class="h-4 w-4" />
            <span>{{ status.label }}</span>
            <span 
              v-if="getRequestCount(status.key) > 0"
              :style="{
                backgroundColor: activeStatus === status.key ? 'rgba(255,255,255,0.2)' : status.color,
                color: 'white',
                borderRadius: '50%',
                width: '1.25rem',
                height: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '600'
              }"
            >
              {{ getRequestCount(status.key) }}
            </span>
          </button>
        </div>
      </div>

      <!-- 申請一覧 -->
      <div v-if="filteredRequests.length > 0" style="display: flex; flex-direction: column; gap: 1rem;">
        <div 
          v-for="request in filteredRequests" 
          :key="request.id"
          style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;"
        >
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <!-- 申請者情報 -->
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div 
                v-if="request.user?.photoURL"
                style="width: 3rem; height: 3rem; border-radius: 50%; background-size: cover; background-position: center;"
                :style="{ backgroundImage: `url(${request.user.photoURL})` }"
              ></div>
              <div 
                v-else
                style="width: 3rem; height: 3rem; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #6b7280;"
              >
                {{ request.user?.displayName?.charAt(0) || 'U' }}
              </div>
              
              <div>
                <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.25rem 0;">
                  {{ request.user?.displayName || 'ユーザー' }}
                </h3>
                <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.875rem; color: #6b7280;">
                  <span v-if="request.user?.twitterScreenName">@{{ request.user.twitterScreenName }}</span>
                  <span>{{ formatDate(request.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- ステータスバッジ -->
            <div 
              :style="{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                backgroundColor: getStatusColor(request.status),
                color: 'white'
              }"
            >
              {{ getStatusLabel(request.status) }}
            </div>
          </div>

          <!-- 申請理由 -->
          <div style="margin-bottom: 1rem;">
            <h4 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
              申請理由
            </h4>
            <p style="color: #4b5563; line-height: 1.5; margin: 0; background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
              {{ request.adminNote || '申請理由なし' }}
            </p>
          </div>

          <!-- 自動審査結果 -->
          <div style="margin-bottom: 1rem;">
            <h4 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
              自動審査結果
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div 
                v-for="check in request.autoChecks" 
                :key="check.name"
                style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border-radius: 0.5rem;"
                :style="{ backgroundColor: check.passed ? '#f0fdf4' : '#fef2f2' }"
              >
                <component 
                  :is="check.passed ? CheckCircleIcon : XCircleIcon" 
                  :class="['h-5 w-5', check.passed ? 'text-green-600' : 'text-red-600']"
                />
                <div>
                  <div style="font-weight: 500; font-size: 0.875rem;" :style="{ color: check.passed ? '#15803d' : '#991b1b' }">
                    {{ check.name }}
                  </div>
                  <div style="font-size: 0.75rem;" :style="{ color: check.passed ? '#166534' : '#7f1d1d' }">
                    {{ check.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- アクション -->
          <div v-if="request.status === 'pending' || request.status === 'auto_approved'" style="display: flex; gap: 1rem; justify-content: end;">
            <button 
              @click="rejectRequest(request.id)"
              style="padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
              onmouseover="this.style.backgroundColor='#dc2626'"
              onmouseout="this.style.backgroundColor='#ef4444'"
            >
              却下
            </button>
            <button 
              @click="approveRequest(request.id)"
              style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
              onmouseover="this.style.backgroundColor='#059669'"
              onmouseout="this.style.backgroundColor='#10b981'"
            >
              承認
            </button>
          </div>

          <!-- 処理済み情報 -->
          <div v-else-if="request.processedAt || request.approvedAt" 
               style="padding: 1rem; border-radius: 0.5rem; border-left: 4px solid;"
               :style="{ 
                 backgroundColor: request.status === 'rejected' ? '#fef2f2' : '#f0fdf4',
                 borderLeftColor: getStatusColor(request.status)
               }">
            <div style="font-size: 0.875rem;" 
                 :style="{ color: request.status === 'rejected' ? '#991b1b' : '#166534' }">
              {{ formatDate(request.processedAt || request.approvedAt) }} に{{ getStatusLabel(request.status) }}
            </div>
            <div v-if="request.processedBy || request.approvedBy" 
                 style="font-size: 0.875rem; margin-top: 0.25rem;"
                 :style="{ color: request.status === 'rejected' ? '#7f1d1d' : '#15803d' }">
              処理者: {{ (request.processedBy?.displayName || request.processedBy || request.approvedBy) }}
            </div>
            <div v-if="request.note" 
                 style="font-size: 0.875rem; margin-top: 0.5rem; padding: 0.5rem; border-radius: 0.25rem;"
                 :style="{ 
                   color: request.status === 'rejected' ? '#7f1d1d' : '#15803d',
                   backgroundColor: request.status === 'rejected' ? '#fecaca' : '#bbf7d0'
                 }">
              備考: {{ request.note }}
            </div>
            
            <!-- 却下理由を強調表示 -->
            <div v-if="request.rejectionReason && request.status === 'rejected'" 
                 style="margin-top: 0.75rem; padding: 0.75rem; background: #dc2626; color: white; border-radius: 0.375rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <XCircleIcon class="h-4 w-4" />
                <span style="font-size: 0.875rem; font-weight: 600;">却下理由</span>
              </div>
              <p style="font-size: 0.875rem; margin: 0; line-height: 1.4;">{{ request.rejectionReason }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-else style="text-align: center; padding: 4rem;">
        <ClipboardDocumentListIcon style="color: #9ca3af; width: 3rem; height: 3rem; margin: 0 auto 1rem;" />
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          {{ getEmptyStateTitle() }}
        </h3>
        <p style="color: #6b7280; margin: 0;">
          {{ getEmptyStateDescription() }}
        </p>
      </div>
    </div>

    <!-- 承認確認モーダル -->
    <div 
      v-if="showApproveModal"
      style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem;"
      @click="showApproveModal = false"
    >
      <div 
        style="background: white; border-radius: 0.5rem; padding: 2rem; max-width: 400px; width: 100%;"
        @click.stop
      >
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          編集権限を承認しますか？
        </h3>
        <p style="color: #6b7280; margin: 0 0 1.5rem 0; line-height: 1.5;">
          このユーザーにサークル情報の編集権限を付与します。この操作は取り消すことができます。
        </p>
        <div style="display: flex; gap: 1rem; justify-content: end;">
          <button 
            @click="showApproveModal = false"
            style="padding: 0.5rem 1rem; background: white; color: #6b7280; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer;"
          >
            キャンセル
          </button>
          <button 
            @click="confirmApprove"
            style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;"
          >
            承認する
          </button>
        </div>
      </div>
    </div>

    <!-- 却下確認モーダル -->
    <div 
      v-if="showRejectModal"
      style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem;"
      @click="showRejectModal = false"
    >
      <div 
        style="background: white; border-radius: 0.5rem; padding: 2rem; max-width: 400px; width: 100%;"
        @click.stop
      >
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          申請を却下しますか？
        </h3>
        <p style="color: #6b7280; margin: 0 0 1rem 0; line-height: 1.5;">
          この申請を却下します。却下理由を入力してください。
        </p>
        
        <!-- デフォルトメッセージ選択 -->
        <div style="margin-bottom: 1rem;">
          <h4 style="font-size: 0.875rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
            よく使用される却下理由
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
            <button
              v-for="template in rejectReasonTemplates"
              :key="template.id"
              @click="selectRejectTemplate(template.message)"
              style="padding: 0.5rem 0.75rem; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; transition: all 0.2s;"
              onmouseover="this.style.backgroundColor='#e5e7eb'"
              onmouseout="this.style.backgroundColor='#f3f4f6'"
            >
              {{ template.label }}
            </button>
          </div>
        </div>
        
        <textarea 
          v-model="rejectNote"
          placeholder="却下理由を入力してください（必須）"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; resize: vertical; min-height: 100px; margin-bottom: 1.5rem;"
          required
        ></textarea>
        <p v-if="rejectValidationError" style="color: #dc2626; font-size: 0.875rem; margin: -1rem 0 1rem 0;">
          却下理由を入力してください
        </p>
        <div style="display: flex; gap: 1rem; justify-content: end;">
          <button 
            @click="showRejectModal = false"
            style="padding: 0.5rem 1rem; background: white; color: #6b7280; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer;"
          >
            キャンセル
          </button>
          <button 
            @click="confirmReject"
            style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;"
          >
            却下する
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

// ミドルウェアで管理者権限をチェック
definePageMeta({
  middleware: 'admin'
})

// 認証と管理者権限チェック
const { user, isAdmin } = useAuth()

// State
const activeStatus = ref('pending')
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedRequestId = ref(null)
const rejectNote = ref('')
const rejectValidationError = ref(false)

// 却下理由のテンプレート
const rejectReasonTemplates = ref([
  {
    id: 'twitter_mismatch',
    label: 'Twitter不一致',
    message: '申請者のTwitterスクリーンネームとサークルの登録Twitter情報が一致しません。サークル代表者のTwitterアカウントから再度申請してください。'
  },
  {
    id: 'no_twitter_connection',
    label: 'Twitter未連携',
    message: 'Twitterアカウントとの連携が確認できません。Twitterでログインしてから再度申請してください。'
  },
  {
    id: 'insufficient_evidence',
    label: '証明不足',
    message: 'サークルとの関係を示す十分な証明が不足しています。サークル代表者であることを証明できる資料や詳細な申請理由を記載して再申請してください。'
  },
  {
    id: 'invalid_circle',
    label: '無効なサークル',
    message: '指定されたサークル情報が見つからないか、無効です。正しいサークルID・サークル名を確認して再申請してください。'
  },
  {
    id: 'duplicate_request',
    label: '重複申請',
    message: '同じサークルに対する申請が既に存在するか、既に編集権限が付与されています。重複申請はお控えください。'
  },
  {
    id: 'no_reason',
    label: '申請理由なし',
    message: '申請理由が記載されていません。なぜ編集権限が必要なのか、サークルとの関係を詳しく記載して再申請してください。'
  },
  {
    id: 'fake_circle',
    label: '偽サークル疑い',
    message: '申請内容から実在しないサークルまたは他人のサークルの可能性があります。正確な情報で再申請してください。'
  },
  {
    id: 'policy_violation',
    label: 'ポリシー違反',
    message: '申請内容がサイトの利用規約に違反しています。規約を確認の上、適切な内容で再申請してください。'
  }
])

// 認証状態の computed
const isAuthenticated = computed(() => {
  return user.value !== null && isAdmin.value
})

// Composables
const { getAllEditPermissionRequests, approveEditPermissionRequest, rejectEditPermissionRequest, processAutoApprovedRequests } = useEditPermissions()

// データ
const editRequests = ref([])
const loading = ref(true)
const error = ref(null)
const processingAutoApproved = ref(false)

const statusFilters = ref([
  { key: 'all', label: 'すべて', color: '#6b7280' },
  { key: 'pending', label: '申請中', color: '#f59e0b' },
  { key: 'auto_approved', label: '自動承認待ち', color: '#8b5cf6' },
  { key: 'approved', label: '承認済み', color: '#10b981' },
  { key: 'rejected', label: '却下', color: '#ef4444' }
])

// Computed
const filteredRequests = computed(() => {
  if (activeStatus.value === 'all') {
    return editRequests.value
  }
  return editRequests.value.filter(request => request.status === activeStatus.value)
})

const pendingCount = computed(() => 
  editRequests.value.filter(r => r.status === 'pending').length
)

const autoApprovedCount = computed(() => 
  editRequests.value.filter(r => r.status === 'auto_approved').length
)

const approvedCount = computed(() => 
  editRequests.value.filter(r => r.status === 'approved').length
)

const rejectedCount = computed(() => 
  editRequests.value.filter(r => r.status === 'rejected').length
)

// Methods
const getStatusIcon = (status) => {
  switch (status) {
    case 'all': return ClipboardDocumentListIcon
    case 'pending': return ClockIcon
    case 'auto_approved': return SparklesIcon
    case 'approved': return CheckCircleIcon
    case 'rejected': return XCircleIcon
    default: return ClipboardDocumentListIcon
  }
}

const getRequestCount = (status) => {
  if (status === 'all') return editRequests.value.length
  return editRequests.value.filter(request => request.status === status).length
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#f59e0b'
    case 'auto_approved': return '#8b5cf6'
    case 'approved': return '#10b981'
    case 'rejected': return '#ef4444'
    default: return '#6b7280'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return '申請中'
    case 'auto_approved': return '自動承認待ち'
    case 'approved': return '承認済み'
    case 'rejected': return '却下'
    default: return '不明'
  }
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getEmptyStateTitle = () => {
  switch (activeStatus.value) {
    case 'pending': return '申請中の項目はありません'
    case 'auto_approved': return '自動承認待ちの項目はありません'
    case 'approved': return '承認済みの項目はありません'
    case 'rejected': return '却下された項目はありません'
    default: return '申請はありません'
  }
}

const getEmptyStateDescription = () => {
  switch (activeStatus.value) {
    case 'pending': return '新しい編集権限申請があると、ここに表示されます'
    case 'auto_approved': return 'Twitter情報が一致して自動承認された申請があると、ここに表示されます'
    case 'approved': return '承認された申請があると、ここに表示されます'
    case 'rejected': return '却下された申請があると、ここに表示されます'
    default: return '編集権限の申請があると、ここに表示されます'
  }
}

const approveRequest = (requestId) => {
  selectedRequestId.value = requestId
  showApproveModal.value = true
}

const rejectRequest = (requestId) => {
  selectedRequestId.value = requestId
  rejectNote.value = ''
  rejectValidationError.value = false
  showRejectModal.value = true
}

const selectRejectTemplate = (message) => {
  rejectNote.value = message
  rejectValidationError.value = false
}

const confirmApprove = async () => {
  try {
    await approveEditPermissionRequest(selectedRequestId.value)
    await loadEditRequests() // データを再読み込み
    showApproveModal.value = false
    selectedRequestId.value = null
  } catch (error) {
    console.error('承認エラー:', error)
    alert('承認処理に失敗しました')
  }
}

const confirmReject = async () => {
  // バリデーション
  if (!rejectNote.value || rejectNote.value.trim() === '') {
    rejectValidationError.value = true
    return
  }
  
  try {
    await rejectEditPermissionRequest(selectedRequestId.value, rejectNote.value.trim())
    await loadEditRequests() // データを再読み込み
    showRejectModal.value = false
    selectedRequestId.value = null
    rejectNote.value = ''
    rejectValidationError.value = false
  } catch (error) {
    console.error('却下エラー:', error)
    alert('却下処理に失敗しました')
  }
}

// 自動承認待ちを一括処理
const processAllAutoApproved = async () => {
  if (!confirm(`${autoApprovedCount.value}件の自動承認待ち申請を一括処理しますか？`)) {
    return
  }
  
  processingAutoApproved.value = true
  try {
    const results = await processAutoApprovedRequests()
    await loadEditRequests() // データを再読み込み
    alert(`処理完了: ${results.success}件成功, ${results.failed}件失敗`)
  } catch (error) {
    console.error('自動承認一括処理エラー:', error)
    alert('自動承認の一括処理に失敗しました')
  } finally {
    processingAutoApproved.value = false
  }
}

// データ取得
const loadEditRequests = async () => {
  loading.value = true
  error.value = null
  
  try {
    const requests = await getAllEditPermissionRequests()
    editRequests.value = requests.map(request => ({
      ...request,
      autoChecks: generateAutoChecks(request)
    }))
  } catch (err) {
    console.error('編集権限申請取得エラー:', err)
    error.value = '申請データの取得に失敗しました'
  } finally {
    loading.value = false
  }
}

// 自動チェック項目生成
const generateAutoChecks = (request) => {
  const twitterMatch = request.applicantTwitterId && request.registeredTwitterId && 
    request.applicantTwitterId.toLowerCase() === request.registeredTwitterId.toLowerCase()
  
  return [
    {
      name: 'Twitter連携',
      description: request.applicantTwitterId ? `@${request.applicantTwitterId}` : 'Twitter未連携',
      passed: !!request.applicantTwitterId
    },
    {
      name: 'スクリーンネーム一致',
      description: twitterMatch ? 
        `申請者(@${request.applicantTwitterId})とサークル(@${request.registeredTwitterId})が一致` :
        `申請者(@${request.applicantTwitterId || '未設定'})とサークル(@${request.registeredTwitterId || '未設定'})が不一致`,
      passed: twitterMatch
    },
    {
      name: '申請理由',
      description: request.adminNote ? '申請理由記入済み' : '申請理由なし',
      passed: !!request.adminNote
    },
    {
      name: '自動承認',
      description: request.isAutoApproved ? '自動承認済み' : '手動審査が必要',
      passed: request.isAutoApproved
    }
  ]
}

// 管理者権限チェック
const checkAdminAccess = () => {
  if (!user.value) {
    console.log('🚫 User not authenticated, redirecting to login')
    navigateTo('/auth/login')
    return false
  }
  
  if (!isAdmin.value) {
    console.log('🚫 User is not admin, redirecting to home')
    navigateTo('/')
    return false
  }
  
  console.log('✅ Admin access granted')
  return true
}

// 初期認証チェック
onMounted(async () => {
  nextTick(async () => {
    if (user.value !== undefined) {
      if (checkAdminAccess()) {
        await loadEditRequests()
      }
    }
  })
})

// ユーザー状態が変更された時の監視
watch(() => user.value, (newUser) => {
  if (newUser === null) {
    // ログアウトされた場合
    navigateTo('/auth/login')
  } else if (newUser !== undefined) {
    // ログインされた場合、管理者権限を再チェック
    checkAdminAccess()
  }
})

watch(() => isAdmin.value, (newIsAdmin) => {
  if (newIsAdmin === false) {
    // 管理者権限が失われた場合
    navigateTo('/')
  }
})

// SEO
useHead({
  title: '編集権限申請管理 - geica check!',
  meta: [
    { name: 'description', content: 'サークル情報編集権限の申請を審査・管理する管理者ページです。' }
  ]
})
</script>