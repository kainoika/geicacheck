<template>
  <div style="min-height: 100vh; background: #f9fafb;">
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
            <!-- 統計情報 -->
            <div style="display: flex; gap: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem;">
              <div style="text-align: center;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #f59e0b;">{{ pendingCount }}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">申請中</div>
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
            <span>{{ status.icon }}</span>
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
                v-if="request.user.photoURL"
                style="width: 3rem; height: 3rem; border-radius: 50%; background-size: cover; background-position: center;"
                :style="{ backgroundImage: `url(${request.user.photoURL})` }"
              ></div>
              <div 
                v-else
                style="width: 3rem; height: 3rem; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #6b7280;"
              >
                {{ request.user.displayName?.charAt(0) || 'U' }}
              </div>
              
              <div>
                <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.25rem 0;">
                  {{ request.user.displayName || 'ユーザー' }}
                </h3>
                <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.875rem; color: #6b7280;">
                  <span>{{ request.user.email }}</span>
                  <span v-if="request.user.twitterHandle">@{{ request.user.twitterHandle }}</span>
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
              {{ request.reason }}
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
                <span :style="{ color: check.passed ? '#16a34a' : '#dc2626' }">
                  {{ check.passed ? '✅' : '❌' }}
                </span>
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
          <div v-if="request.status === 'pending'" style="display: flex; gap: 1rem; justify-content: end;">
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
          <div v-else-if="request.processedAt" style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #6b7280;">
            <div style="font-size: 0.875rem; color: #6b7280;">
              {{ formatDate(request.processedAt) }} に{{ getStatusLabel(request.status) }}
            </div>
            <div v-if="request.processedBy" style="font-size: 0.875rem; color: #6b7280;">
              処理者: {{ request.processedBy.displayName }}
            </div>
            <div v-if="request.note" style="font-size: 0.875rem; color: #4b5563; margin-top: 0.5rem;">
              備考: {{ request.note }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-else style="text-align: center; padding: 4rem;">
        <div style="color: #9ca3af; font-size: 3rem; margin-bottom: 1rem;">📋</div>
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
          この申請を却下します。却下理由を入力してください（任意）。
        </p>
        <textarea 
          v-model="rejectNote"
          placeholder="却下理由（任意）"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; resize: vertical; min-height: 80px; margin-bottom: 1.5rem;"
        ></textarea>
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
</template>

<script setup>
// State
const activeStatus = ref('pending')
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedRequestId = ref(null)
const rejectNote = ref('')

// サンプルデータ
const editRequests = ref([
  {
    id: '1',
    user: {
      uid: 'user1',
      displayName: 'アイカツファン',
      email: 'aikatsu@example.com',
      photoURL: null,
      twitterHandle: 'aikatsu_fan'
    },
    reason: 'アイカツ！の同人活動を5年以上続けており、多くのサークル情報に詳しいです。正確な情報提供でコミュニティに貢献したいと思います。',
    status: 'pending',
    autoChecks: [
      { name: 'アカウント作成日', description: '7日以上経過', passed: true },
      { name: 'Twitter連携', description: 'アカウント連携済み', passed: true },
      { name: 'ブックマーク数', description: '5件以上', passed: true },
      { name: 'アクティビティ', description: '最近の活動あり', passed: false }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
    processedAt: null,
    processedBy: null,
    note: null
  },
  {
    id: '2',
    user: {
      uid: 'user2',
      displayName: 'いちごちゃん推し',
      email: 'ichigo@example.com',
      photoURL: null,
      twitterHandle: 'ichigo_oshi'
    },
    reason: 'いちごちゃんの情報を正確に管理したいです。',
    status: 'approved',
    autoChecks: [
      { name: 'アカウント作成日', description: '7日以上経過', passed: true },
      { name: 'Twitter連携', description: 'アカウント連携済み', passed: true },
      { name: 'ブックマーク数', description: '5件以上', passed: true },
      { name: 'アクティビティ', description: '最近の活動あり', passed: true }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12時間前
    processedBy: { displayName: '管理者' },
    note: null
  },
  {
    id: '3',
    user: {
      uid: 'user3',
      displayName: '新規ユーザー',
      email: 'newuser@example.com',
      photoURL: null,
      twitterHandle: null
    },
    reason: '編集したいです。',
    status: 'rejected',
    autoChecks: [
      { name: 'アカウント作成日', description: '7日以上経過', passed: false },
      { name: 'Twitter連携', description: 'アカウント連携済み', passed: false },
      { name: 'ブックマーク数', description: '5件以上', passed: false },
      { name: 'アクティビティ', description: '最近の活動あり', passed: false }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6時間前
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4時間前
    processedBy: { displayName: '管理者' },
    note: 'アカウント作成から日が浅く、活動実績が不足しています。'
  }
])

const statusFilters = ref([
  { key: 'all', label: 'すべて', icon: '📋', color: '#6b7280' },
  { key: 'pending', label: '申請中', icon: '⏳', color: '#f59e0b' },
  { key: 'approved', label: '承認済み', icon: '✅', color: '#10b981' },
  { key: 'rejected', label: '却下', icon: '❌', color: '#ef4444' }
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

const approvedCount = computed(() => 
  editRequests.value.filter(r => r.status === 'approved').length
)

const rejectedCount = computed(() => 
  editRequests.value.filter(r => r.status === 'rejected').length
)

// Methods
const getRequestCount = (status) => {
  if (status === 'all') return editRequests.value.length
  return editRequests.value.filter(request => request.status === status).length
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#f59e0b'
    case 'approved': return '#10b981'
    case 'rejected': return '#ef4444'
    default: return '#6b7280'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return '申請中'
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
    case 'approved': return '承認済みの項目はありません'
    case 'rejected': return '却下された項目はありません'
    default: return '申請はありません'
  }
}

const getEmptyStateDescription = () => {
  switch (activeStatus.value) {
    case 'pending': return '新しい編集権限申請があると、ここに表示されます'
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
  showRejectModal.value = true
}

const confirmApprove = () => {
  const request = editRequests.value.find(r => r.id === selectedRequestId.value)
  if (request) {
    request.status = 'approved'
    request.processedAt = new Date()
    request.processedBy = { displayName: '管理者' }
  }
  showApproveModal.value = false
  selectedRequestId.value = null
}

const confirmReject = () => {
  const request = editRequests.value.find(r => r.id === selectedRequestId.value)
  if (request) {
    request.status = 'rejected'
    request.processedAt = new Date()
    request.processedBy = { displayName: '管理者' }
    request.note = rejectNote.value || null
  }
  showRejectModal.value = false
  selectedRequestId.value = null
  rejectNote.value = ''
}

// 認証チェック（管理者のみアクセス可能）
onMounted(() => {
  // 実際の実装では管理者権限をチェック
  const isAdmin = true // サンプル
  if (!isAdmin) {
    navigateTo('/')
  }
})

// SEO
useHead({
  title: '編集権限申請管理 - geika check!',
  meta: [
    { name: 'description', content: 'サークル情報編集権限の申請を審査・管理する管理者ページです。' }
  ]
})
</script>