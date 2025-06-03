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
        <div style="color: #9ca3af; font-size: 3rem; margin-bottom: 1rem;">🔒</div>
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
      <div v-else style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
        <!-- プロフィール情報 -->
        <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            👤 基本情報
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
                {{ user.displayName ? user.displayName.charAt(0) : '👤' }}
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
                <span>🐦</span>
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
          </div>

          <!-- アカウント設定 -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              アカウント設定
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
              <button 
                @click="exportBookmarks"
                style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
              >
                📊 ブックマークをCSVエクスポート
              </button>
              
              <button 
                @click="showDeleteConfirm = true"
                style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
              >
                🗑️ アカウント削除
              </button>
              
              <button 
                @click="handleSignOut"
                style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
              >
                🚪 ログアウト
              </button>
            </div>
          </div>
        </div>

        <!-- 編集権限情報 -->
        <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            ✏️ 編集権限
          </h2>
          
          <div v-if="editPermission.hasPermission" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #16a34a; margin-bottom: 0.5rem;">
              <span>✅</span>
              <span style="font-weight: 600;">編集権限が承認されています</span>
            </div>
            <p style="color: #15803d; font-size: 0.875rem; margin: 0;">
              サークル情報の編集・追加が可能です。
            </p>
          </div>
          
          <div v-else-if="editPermission.isPending" style="background: #fefce8; border: 1px solid #fde047; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #ca8a04; margin-bottom: 0.5rem;">
              <span>⏳</span>
              <span style="font-weight: 600;">編集権限申請中</span>
            </div>
            <p style="color: #a16207; font-size: 0.875rem; margin: 0;">
              申請を審査中です。しばらくお待ちください。
            </p>
          </div>
          
          <div v-else style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #64748b; margin-bottom: 0.5rem;">
              <span>📝</span>
              <span style="font-weight: 600;">編集権限なし</span>
            </div>
            <p style="color: #475569; font-size: 0.875rem; margin: 0 0 1rem 0;">
              サークル情報の編集・追加を行うには編集権限が必要です。
            </p>
            <button 
              @click="applyForEditPermission"
              style="padding: 0.5rem 1rem; background: #ff69b4; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
            >
              編集権限を申請する
            </button>
          </div>

          <!-- 編集権限の説明 -->
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.5rem; padding: 1rem;">
            <h4 style="font-size: 0.875rem; font-weight: 600; color: #0c4a6e; margin: 0 0 0.5rem 0;">
              編集権限について
            </h4>
            <ul style="font-size: 0.875rem; color: #075985; margin: 0; padding-left: 1rem; line-height: 1.5;">
              <li>サークル情報の追加・編集が可能になります</li>
              <li>申請には一定の条件があります（アカウント作成から7日経過など）</li>
              <li>不適切な編集を行った場合、権限が取り消される場合があります</li>
            </ul>
          </div>
        </div>

        <!-- 最近のアクティビティ -->
        <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            📈 最近のアクティビティ
          </h2>
          
          <div v-if="recentActivities.length > 0" style="display: flex; flex-direction: column; gap: 1rem;">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;"
            >
              <div style="font-size: 1.25rem;">{{ activity.icon }}</div>
              <div style="flex: 1;">
                <p style="margin: 0 0 0.25rem 0; font-weight: 500; color: #111827;">
                  {{ activity.description }}
                </p>
                <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">
                  {{ formatDate(activity.createdAt) }}
                </p>
              </div>
            </div>
          </div>
          
          <div v-else style="text-align: center; padding: 2rem; color: #9ca3af;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📭</div>
            <p style="margin: 0;">まだアクティビティがありません</p>
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
        <p style="color: #6b7280; margin: 0 0 1.5rem 0; line-height: 1.5;">
          アカウントを削除すると、すべてのブックマークデータが失われます。この操作は取り消せません。
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
  </div>
</template>

<script setup>
// Composables
const { user, isAuthenticated } = useAuth()
const { bookmarks } = useBookmarks()

const showDeleteConfirm = ref(false)

// 統計情報の計算
const userStats = computed(() => {
  if (!bookmarks.value) {
    return {
      totalBookmarks: 0,
      checkCount: 0,
      interestedCount: 0,
      priorityCount: 0
    }
  }
  
  return {
    totalBookmarks: bookmarks.value.length,
    checkCount: bookmarks.value.filter(b => b.category === 'check').length,
    interestedCount: bookmarks.value.filter(b => b.category === 'interested').length,
    priorityCount: bookmarks.value.filter(b => b.category === 'priority').length
  }
})

// 編集権限の状態（実装は後で必要に応じて追加）
const editPermission = ref({
  hasPermission: false,
  isPending: false
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
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分前`
  } else if (hours < 24) {
    return `${hours}時間前`
  } else {
    return `${days}日前`
  }
}

const exportBookmarks = () => {
  // 実際の実装では useBookmarks().exportToCSV() を使用
  console.log('Exporting bookmarks to CSV...')
  alert('ブックマークをCSVファイルとしてダウンロードしました')
}

const applyForEditPermission = () => {
  // 実際の実装では API を呼び出し
  editPermission.value.isPending = true
  console.log('Applying for edit permission...')
  alert('編集権限の申請を送信しました')
}

const handleSignOut = async () => {
  // 実際の実装では useAuth().signOut() を使用
  await navigateTo('/auth/login')
}

const deleteAccount = async () => {
  // 実際の実装では useAuth().deleteAccount() を使用
  console.log('Deleting account...')
  alert('アカウントを削除しました')
  await navigateTo('/')
}

// 初期化
onMounted(() => {
  // 実際の実装では認証状態をチェック
  if (!user.value) {
    navigateTo('/auth/login')
  }
})

// SEO
useHead({
  title: 'プロフィール - geika check!',
  meta: [
    { name: 'description', content: 'ユーザープロフィール、ブックマーク統計、編集権限の管理ページです。' }
  ]
})
</script>