<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- ヘッダー -->
    <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 2rem 0;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button 
            @click="$router.back()"
            style="padding: 0.5rem; border: 1px solid #d1d5db; background: white; border-radius: 0.375rem; cursor: pointer; color: #6b7280;"
          >
            ← 戻る
          </button>
          <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0;">
            プロフィール
          </h1>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
      <!-- 未ログイン状態 -->
      <div v-if="!user" style="text-align: center; padding: 4rem;">
        <LockClosedIcon style="color: #9ca3af; width: 3rem; height: 3rem; margin: 0 auto 1rem;" />
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          ログインが必要です
        </h2>
        <p style="color: #6b7280; margin: 0 0 2rem 0;">
          プロフィール機能を利用するにはログインしてください
        </p>
        <NuxtLink 
          to="/auth/login"
          style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 500;"
        >
          ログインページへ
        </NuxtLink>
      </div>

      <!-- ログイン済み状態 -->
      <div v-else class="profile-grid">
        <!-- プロフィール情報 -->
        <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <UserIcon class="h-5 w-5" /> 基本情報
          </h2>
          
          <div style="display: flex; align-items: start; gap: 1.5rem; margin-bottom: 2rem;">
            <!-- プロフィール画像 -->
            <div style="flex-shrink: 0;">
              <div 
                v-if="user.photoURL"
                style="width: 5rem; height: 5rem; border-radius: 50%; background-size: cover; background-position: center;"
                :style="{ backgroundImage: `url(${user.photoURL})` }"
              ></div>
              <div 
                v-else
                style="width: 5rem; height: 5rem; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #9ca3af;"
              >
                <UserIcon v-if="!user.displayName" class="h-8 w-8 text-gray-400" />{{ user.displayName ? user.displayName.charAt(0) : '' }}
              </div>
            </div>
            
            <!-- ユーザー情報 -->
            <div style="flex: 1;">
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
                {{ user.displayName || 'ユーザー' }}
              </h3>
              <p style="color: #6b7280; margin: 0 0 0.5rem 0;">
                {{ user.email }}
              </p>
              <div v-if="user.twitterHandle" style="display: flex; align-items: center; gap: 0.5rem; color: #1da1f2;">
                <AtSymbolIcon class="h-4 w-4" />
                <a 
                  :href="`https://twitter.com/${user.twitterHandle}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="color: #1da1f2; text-decoration: none;"
                >
                  @{{ user.twitterHandle }}
                </a>
              </div>
            </div>
          </div>

          <!-- 統計情報 -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="text-align: center; padding: 1rem; background: #fef3f2; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #ff69b4; margin-bottom: 0.25rem;">
                {{ userStats.totalBookmarks }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                ブックマーク数
              </div>
            </div>
            
            <div style="text-align: center; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #0284c7; margin-bottom: 0.25rem;">
                {{ userStats.checkCount }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                チェック予定
              </div>
            </div>
            
            <div style="text-align: center; padding: 1rem; background: #fefce8; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #ca8a04; margin-bottom: 0.25rem;">
                {{ userStats.interestedCount }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                気になる
              </div>
            </div>
            
            <div style="text-align: center; padding: 1rem; background: #fef2f2; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #dc2626; margin-bottom: 0.25rem;">
                {{ userStats.priorityCount }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                優先
              </div>
            </div>
            
            <!-- 編集権限統計 -->
            <div v-if="userStats.editableCircles > 0" style="text-align: center; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #16a34a; margin-bottom: 0.25rem;">
                {{ userStats.editableCircles }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                編集可能サークル
              </div>
            </div>
            
            <div v-if="userStats.pendingRequests > 0" style="text-align: center; padding: 1rem; background: #fefce8; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b; margin-bottom: 0.25rem;">
                {{ userStats.pendingRequests }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                申請中
              </div>
            </div>
          </div>

          <!-- アカウント設定 -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              アカウント設定
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem;">                            
              <button 
                @click="showDeleteConfirm = true"
                :disabled="loading"
                style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.25rem;"
                :style="{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }"
              >
                <TrashIcon class="h-4 w-4" /> アカウント削除
              </button>
              
            </div>
          </div>
        </div>

        <!-- 予算管理 -->
        <div v-if="currentEvent" style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <BudgetSummary 
            :event-id="currentEvent.id"
            :event-name="currentEvent.name"
          />
        </div>

        <!-- 編集権限情報 -->
        <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <PencilIcon class="h-5 w-5" /> 編集権限
          </h2>
          
          <!-- ローディング状態 -->
          <div v-if="loading" style="text-align: center; padding: 2rem;">
            <div style="color: #6b7280;">権限情報を読み込み中...</div>
          </div>
          
          <!-- エラー状態 -->
          <div v-else-if="error" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #dc2626; margin-bottom: 0.5rem;">
              <ExclamationTriangleIcon class="h-5 w-5" />
              <span style="font-weight: 600;">エラー</span>
            </div>
            <p style="color: #991b1b; font-size: 0.875rem; margin: 0 0 1rem 0;">{{ error }}</p>
            <button 
              @click="refreshEditPermissions"
              style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
            >
              再試行
            </button>
          </div>
          
          <!-- 通常状態 -->
          <div v-else>
            <!-- 権限ステータス -->
            <div v-if="editPermission.hasPermission" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #16a34a; margin-bottom: 0.5rem;">
                <CheckCircleIcon class="h-5 w-5" />
                <span style="font-weight: 600;">編集権限が承認されています</span>
              </div>
              <p style="color: #15803d; font-size: 0.875rem; margin: 0 0 1rem 0;">
                {{ editPermission.permissionCount }}件のサークル情報の編集・追加が可能です。
              </p>
              
              <!-- 編集可能なサークル一覧 -->
              <div v-if="circlePermissions.length > 0" style="background: white; border-radius: 0.375rem; padding: 1rem;">
                <h4 style="font-size: 0.875rem; font-weight: 600; color: #166534; margin: 0 0 0.75rem 0;">編集可能なサークル</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <div 
                    v-for="permission in circlePermissions.slice(0, 3)" 
                    :key="permission.id"
                    style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: #f9fafb; border-radius: 0.25rem; font-size: 0.875rem;"
                  >
                    <span style="color: #374151;">サークルID: {{ permission.circleId }}</span>
                    <span style="color: #6b7280; font-size: 0.75rem;">{{ permission.permission }}</span>
                  </div>
                  <div v-if="circlePermissions.length > 3" style="text-align: center; padding: 0.5rem; color: #6b7280; font-size: 0.75rem;">
                    他 {{ circlePermissions.length - 3 }}件のサークル
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="editPermission.isPending" style="background: #fefce8; border: 1px solid #fde047; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #ca8a04; margin-bottom: 0.5rem;">
                <ClockIcon class="h-5 w-5" />
                <span style="font-weight: 600;">編集権限申請中</span>
              </div>
              <p style="color: #a16207; font-size: 0.875rem; margin: 0;">
                {{ editPermission.pendingCount }}件の申請を審査中です。しばらくお待ちください。
              </p>
            </div>
            
            <div v-else style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #64748b; margin-bottom: 0.5rem;">
                <DocumentTextIcon class="h-5 w-5" />
                <span style="font-weight: 600;">編集権限なし</span>
              </div>
              <p style="color: #475569; font-size: 0.875rem; margin: 0 0 1rem 0;">
                サークル情報の編集・追加を行うには編集権限が必要です。<br>
                各サークルの詳細ページから編集権限の申請を行ってください。
              </p>
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.375rem; padding: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #0c4a6e; margin-bottom: 0.25rem;">
                  <InformationCircleIcon class="h-4 w-4" />
                  <span style="font-size: 0.875rem; font-weight: 600;">申請方法</span>
                </div>
                <p style="color: #075985; font-size: 0.75rem; margin: 0; line-height: 1.4;">
                  1. サークル一覧やマップから編集したいサークルを見つけてください<br>
                  2. サークル詳細ページの「編集権限を申請」ボタンをクリック<br>
                  3. 審査後、編集権限が付与されます
                </p>
              </div>
            </div>

            <!-- 申請履歴 -->
            <div v-if="editPermissionRequests.length > 0" style="margin-bottom: 1rem;">
              <h4 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 0.75rem 0;">申請履歴</h4>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div 
                  v-for="request in editPermissionRequests.slice(0, 5)" 
                  :key="request.id"
                  style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 0.375rem; border-left: 3px solid;" 
                  :style="{ borderLeftColor: getRequestStatusColor(request.status) }"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div style="font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem;">
                        サークルID: {{ request.circleId }}
                      </div>
                      <div style="font-size: 0.75rem; color: #6b7280;">
                        {{ formatDate(request.createdAt) }}
                      </div>
                    </div>
                    <div 
                      style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; color: white;"
                      :style="{ backgroundColor: getRequestStatusColor(request.status) }"
                    >
                      {{ getRequestStatusLabel(request.status) }}
                    </div>
                  </div>
                  <div v-if="request.status === 'rejected' && request.rejectionReason" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.25rem; padding: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.25rem;">
                      <ExclamationTriangleIcon class="h-4 w-4 text-red-600" />
                      <span style="font-size: 0.75rem; font-weight: 600; color: #dc2626;">却下理由</span>
                    </div>
                    <p style="font-size: 0.75rem; color: #991b1b; margin: 0;">{{ request.rejectionReason }}</p>
                  </div>
                </div>
                <div v-if="editPermissionRequests.length > 5" style="text-align: center; padding: 0.5rem; color: #6b7280; font-size: 0.75rem;">
                  他 {{ editPermissionRequests.length - 5 }}件の申請
                </div>
              </div>
            </div>

            <!-- 権限統計 -->
            <div v-if="editPermission.approvedCount > 0 || editPermission.rejectedCount > 0" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
              <div v-if="editPermission.approvedCount > 0" style="text-align: center; padding: 0.75rem; background: #f0fdf4; border-radius: 0.375rem;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #16a34a; margin-bottom: 0.25rem;">{{ editPermission.approvedCount }}</div>
                <div style="font-size: 0.75rem; color: #166534;">承認済み</div>
              </div>
              <div v-if="editPermission.rejectedCount > 0" style="text-align: center; padding: 0.75rem; background: #fef2f2; border-radius: 0.375rem;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #dc2626; margin-bottom: 0.25rem;">{{ editPermission.rejectedCount }}</div>
                <div style="font-size: 0.75rem; color: #991b1b;">却下</div>
              </div>
            </div>

            <!-- 編集権限の説明 -->
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.5rem; padding: 1rem;">
              <h4 style="font-size: 0.875rem; font-weight: 600; color: #0c4a6e; margin: 0 0 0.5rem 0;">
                編集権限について
              </h4>
              <ul style="font-size: 0.875rem; color: #075985; margin: 0; padding-left: 1rem; line-height: 1.5;">
                <li>サークル情報の追加・編集が可能になります</li>
                <li>不適切な編集を行った場合、権限が取り消される場合があります</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 削除確認モーダル -->
    <div 
      v-if="showDeleteConfirm"
      style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem;"
      @click="showDeleteConfirm = false"
    >
      <div 
        style="background: white; border-radius: 0.5rem; padding: 2rem; max-width: 400px; width: 100%;"
        @click.stop
      >
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          アカウント削除の確認
        </h3>
        <p style="color: #6b7280; margin: 0 0 1rem 0; line-height: 1.5;">
          アカウントを削除すると、以下のデータがすべて失われます：
        </p>
        <ul style="color: #6b7280; margin: 0 0 1.5rem 1rem; line-height: 1.5; font-size: 0.9rem;">
          <li>すべてのブックマーク（{{ userStats.totalBookmarks }}件）</li>
          <li>編集権限申請履歴</li>
          <li>サークル編集権限</li>
          <li>ユーザープロフィール情報</li>
        </ul>
        <p style="color: #dc2626; font-weight: 600; margin: 0 0 1.5rem 0; font-size: 0.9rem;">
          ⚠️ この操作は取り消せません
        </p>
        <div style="display: flex; gap: 1rem; justify-content: end;">
          <button 
            @click="showDeleteConfirm = false"
            style="padding: 0.5rem 1rem; background: white; color: #6b7280; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer;"
          >
            キャンセル
          </button>
          <button 
            @click="deleteAccount"
            style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;"
          >
            削除する
          </button>
        </div>
      </div>
    </div>

    <!-- 編集権限申請モーダルは削除 - サークル詳細ページから申請を行うため -->

    <!-- アカウント削除完了ダイアログ -->
    <AccountDeletedDialog
      v-if="showDeletedDialog"
      @close="handleDeletedDialogClose"
    />
  </div>
</template>

<script setup>
import {
  LockClosedIcon,
  UserIcon,
  AtSymbolIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

// Composables
const { user, isAuthenticated, deleteUserAccountWithReauth } = useAuth()
const logger = useLogger('ProfilePage')
const { bookmarks } = useBookmarks()
const { 
  submitEditPermissionRequest,
  getUserEditPermissionRequests,
  getUserCirclePermissions,
  hasExistingRequest
} = useEditPermissions()
const {
  userPermissions,
  loadUserPermissions,
  refreshPermissions
} = useCirclePermissions()
const { currentEvent } = useEvents()
const { fetchCircleById } = useCircles()

const showDeleteConfirm = ref(false)
const showDeletedDialog = ref(false)
const loading = ref(false)
const error = ref(null)

// 編集権限関連の状態
const editPermissionRequests = ref([])
const circlePermissions = ref([])

// 統計情報の計算
const userStats = computed(() => {
  const bookmarkStats = {
    totalBookmarks: bookmarks.value?.length || 0,
    checkCount: bookmarks.value?.filter(b => b.category === 'check').length || 0,
    interestedCount: bookmarks.value?.filter(b => b.category === 'interested').length || 0,
    priorityCount: bookmarks.value?.filter(b => b.category === 'priority').length || 0
  }
  
  const permissionStats = {
    editableCircles: circlePermissions.value.length,
    pendingRequests: editPermissionRequests.value.filter(r => r.status === 'pending').length,
    approvedRequests: editPermissionRequests.value.filter(r => r.status === 'approved').length,
    rejectedRequests: editPermissionRequests.value.filter(r => r.status === 'rejected').length
  }
  
  return { ...bookmarkStats, ...permissionStats }
})

// 編集権限の状態（安全なアクセス）
const editPermission = computed(() => {
  // 認証状態をチェック
  if (!user.value || !isAuthenticated.value) {
    return {
      hasPermission: false,
      isPending: false,
      permissionCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0
    }
  }
  
  const permissions = circlePermissions.value || []
  const requests = editPermissionRequests.value || []
  
  const hasActivePermissions = permissions.length > 0
  const hasPendingRequests = requests.some(req => req.status === 'pending')
  
  return {
    hasPermission: hasActivePermissions,
    isPending: hasPendingRequests,
    permissionCount: permissions.length,
    pendingCount: requests.filter(req => req.status === 'pending').length,
    approvedCount: requests.filter(req => req.status === 'approved' || req.status === 'auto_approved').length,
    rejectedCount: requests.filter(req => req.status === 'rejected').length
  }
})

const recentActivities = ref([
  {
    id: '1',
    icon: '⭐',
    description: '「星宮製作所」をブックマークしました',
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30分前
  },
  {
    id: '2',
    icon: '🔍',
    description: '「アイカツ！」で検索しました',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2時間前
  },
  {
    id: '3',
    icon: '📊',
    description: 'ブックマークをCSVエクスポートしました',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1日前
  }
])

// Methods
const formatDate = (date) => {
  if (!date) return '不明'
  
  const targetDate = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(targetDate)
}

// 申請ステータス関連のヘルパー関数
const getRequestStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#f59e0b'
    case 'approved': 
    case 'auto_approved': return '#16a34a'
    case 'rejected': return '#dc2626'
    default: return '#6b7280'
  }
}

const getRequestStatusLabel = (status) => {
  switch (status) {
    case 'pending': return '審査中'
    case 'approved': return '承認済み'
    case 'auto_approved': return '自動承認'
    case 'rejected': return '却下'
    default: return '不明'
  }
}

// applyForEditPermission 関数は削除 - サークル詳細ページから申請を行うため

// handleCircleSelection 関数は削除 - サークル詳細ページから申請を行うため

// handleApplicationSuccess 関数は削除 - サークル詳細ページから申請を行うため

const deleteAccount = async () => {
  try {
    loading.value = true
    showDeleteConfirm.value = false
    
    logger.info('Starting account deletion process...')
    
    // useAuth.tsの削除機能を使用（再認証機能付き）
    await deleteUserAccountWithReauth()
    
    // 削除成功時の処理 - ダイアログを表示
    showDeletedDialog.value = true
    
  } catch (err) {
    logger.error('Account deletion error:', err)
    
    // エラーメッセージの表示
    if (err.message && err.message.includes('再ログイン')) {
      alert('セキュリティのため、再ログインしてからアカウントを削除してください。')
    } else {
      alert(`アカウントの削除に失敗しました: ${err.message || '不明なエラー'}`)
    }
    
    // 再ログインが必要な場合はログインページへ
    if (err.message && err.message.includes('再ログイン')) {
      await navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// アカウント削除完了ダイアログを閉じてトップページに遷移
const handleDeletedDialogClose = async () => {
  showDeletedDialog.value = false
  await navigateTo('/')
}

// データ取得関数
const loadUserEditPermissions = async () => {
  // 認証状態とFirebase初期化をチェック
  if (!user.value || !isAuthenticated.value) {
    logger.info('🚫 User not authenticated, skipping edit permissions load')
    // データをクリア
    circlePermissions.value = []
    editPermissionRequests.value = []
    return
  }
  
  if (!checkFirebaseInit()) {
    console.error('🚨 Firebase not initialized, cannot load permissions')
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    logger.info('📊 Loading edit permissions for authenticated user:', user.value.uid)
    
    // シーケンシャルにデータを取得（エラー追跡を改善）
    logger.info('📂 Fetching circle permissions...')
    const permissions = await getUserCirclePermissions(user.value.uid).catch(err => {
      console.error('🚨 getUserCirclePermissions error:', err)
      if (err.code === 'permission-denied') {
        console.error('🚫 Permission denied - User may not be properly authenticated')
      }
      return []
    })
    
    logger.info('📄 Fetching permission requests...')
    const requests = await getUserEditPermissionRequests(user.value.uid).catch(err => {
      console.error('🚨 getUserEditPermissionRequests error:', err)
      if (err.code === 'permission-denied') {
        console.error('🚫 Permission denied - User may not be properly authenticated')
      }
      return []
    })
    
    logger.info('✅ Loaded permissions:', permissions?.length || 0, 'items')
    logger.info('✅ Loaded requests:', requests?.length || 0, 'items')
    
    circlePermissions.value = permissions || []
    editPermissionRequests.value = requests || []
    
    // 成功時にエラーをクリア
    if (error.value && (permissions || requests)) {
      error.value = null
    }
    
  } catch (err) {
    console.error('🚨 編集権限データ取得エラー:', err)
    
    if (err.code === 'permission-denied') {
      error.value = 'アクセス権限がありません。再ログインしてください。'
    } else if (err.code === 'unauthenticated') {
      error.value = '認証が必要です。ログインしてください。'
    } else {
      error.value = `データの取得に失敗しました: ${err.message || err}`
    }
  } finally {
    loading.value = false
  }
}

// 権限データのリフレッシュ
const refreshEditPermissions = async () => {
  try {
    logger.info('🔄 Refreshing edit permissions...')
    await Promise.all([
      loadUserEditPermissions(),
      loadUserPermissions() // useCirclePermissions の関数を使用
    ])
    logger.info('✅ Edit permissions refreshed')
  } catch (err) {
    console.error('🚨 Permission refresh error:', err)
  }
}

// 初期化（認証状態を正しくチェック）
onMounted(async () => {
  logger.info('🚀 Profile page mounted')
  logger.info('👤 User:', user.value?.uid || 'Not logged in')
  logger.info('🔐 Authenticated:', isAuthenticated.value)
  
  // 認証状態をチェック
  if (!isAuthenticated.value || !user.value) {
    logger.info('🚫 User not authenticated, redirecting to login')
    await navigateTo('/auth/login')
    return
  }
  
  // Firebase初期化チェック
  if (!checkFirebaseInit()) {
    console.error('🚨 Firebase not initialized')
    return
  }
  
  // ユーザーデータを読み込み
  logger.info('📊 Starting to load user edit permissions')
  await loadUserEditPermissions()
})

// Firebase初期化チェック
const checkFirebaseInit = () => {
  const { $firestore } = useNuxtApp()
  
  if (!$firestore) {
    console.error('🚨 Firestore is not initialized')
    error.value = 'Firebaseが初期化されていません'
    return false
  }
  
  logger.info('✅ Firestore is initialized')
  return true
}

// ユーザー状態監視
watch(() => user.value, async (newUser, oldUser) => {
  logger.info('🔍 User state changed:', { old: oldUser?.uid, new: newUser?.uid })
  
  if (newUser && newUser !== oldUser) {
    logger.info('👤 User logged in, loading permissions')
    if (checkFirebaseInit()) {
      await loadUserEditPermissions()
    }
  } else if (!newUser && oldUser) {
    logger.info('🚪 User logged out, clearing state')
    // ユーザーがログアウトした場合、状態をクリア
    editPermissionRequests.value = []
    circlePermissions.value = []
    error.value = null
  }
}, { immediate: false })

// SEO
useHead({
  title: 'プロフィール - geica check!',
  meta: [
    { name: 'description', content: 'ユーザープロフィール、ブックマーク統計、編集権限の管理ページです。' }
  ]
})
</script>

<style scoped>
/* レスポンシブプロフィールグリッド */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .profile-grid {
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
}

/* ボタンのホバーエフェクト */
button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

/* カードのホバーエフェクト */
.profile-grid > div {
  transition: box-shadow 0.2s ease;
}

.profile-grid > div:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 統計カードのアニメーション */
.profile-grid div[style*="grid-template-columns"] > div {
  transition: transform 0.2s ease;
}

.profile-grid div[style*="grid-template-columns"] > div:hover {
  transform: translateY(-2px);
}

/* モーダルオーバーレイのアニメーション */
div[style*="position: fixed"][style*="inset: 0"] {
  animation: fadeIn 0.2s ease-out;
}

div[style*="position: fixed"][style*="inset: 0"] > div {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* モバイル最適化 */
@media (max-width: 640px) {
  .profile-grid {
    gap: 1rem;
  }
  
  /* ボタンを縦並びに */
  div[style*="display: flex; flex-wrap: wrap"] {
    flex-direction: column !important;
  }
  
  /* 統計カードを2列にレイアウト */
  div[style*="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))"] {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.75rem !important;
  }
  
  /* カードのパディングを調整 */
  .profile-grid > div {
    padding: 1.5rem !important;
  }
}

/* 高DPI画面での最適化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  button,
  .profile-grid > div {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* 印刷スタイル */
@media print {
  div[style*="position: fixed"] {
    display: none !important;
  }
  
  button {
    display: none !important;
  }
  
  .profile-grid {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
  }
}

/* フォーカススタイルの改善 */
button:focus {
  outline: 2px solid #ff69b4;
  outline-offset: 2px;
}

/* スクロール最適化 */
.profile-grid {
  scroll-behavior: smooth;
}

/* 読み込み状態のスタイル */
div[style*="text-align: center; padding: 2rem"] {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}
</style>