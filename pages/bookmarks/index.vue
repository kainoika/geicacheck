<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- ヘッダー -->
    <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 2rem 0;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
              ブックマーク
            </h1>
            <p style="color: #6b7280; margin: 0;">
              お気に入りのサークルをカテゴリ別に管理
            </p>
          </div>
          
          <div style="display: flex; gap: 1rem;">
            <button 
              @click="exportBookmarks"
              style="padding: 0.75rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;"
            >
              📊 CSVエクスポート
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
      <!-- 未ログイン状態 -->
      <div v-if="!isAuthenticated" style="text-align: center; padding: 4rem;">
        <div style="color: #9ca3af; font-size: 3rem; margin-bottom: 1rem;">🔒</div>
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          ログインが必要です
        </h2>
        <p style="color: #6b7280; margin: 0 0 2rem 0;">
          ブックマーク機能を利用するにはログインしてください
        </p>
        <NuxtLink 
          to="/auth/login"
          style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 500;"
        >
          ログインページへ
        </NuxtLink>
      </div>

      <!-- ログイン済み状態 -->
      <div v-else>
        <!-- カテゴリタブ -->
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; gap: 0.5rem; background: white; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
            <button
              v-for="category in categories"
              :key="category.key"
              @click="activeCategory = category.key"
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
                backgroundColor: activeCategory === category.key ? '#ff69b4' : 'transparent',
                color: activeCategory === category.key ? 'white' : '#6b7280'
              }"
            >
              <span>{{ category.icon }}</span>
              <span>{{ category.label }}</span>
              <span 
                v-if="getBookmarkCount(category.key) > 0"
                :style="{
                  backgroundColor: activeCategory === category.key ? 'rgba(255,255,255,0.2)' : '#ff69b4',
                  color: activeCategory === category.key ? 'white' : 'white',
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
                {{ getBookmarkCount(category.key) }}
              </span>
            </button>
          </div>
        </div>

        <!-- ブックマーク一覧 -->
        <div v-if="filteredBookmarks.length > 0">
          <!-- 表示切り替え -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0;">
                {{ getCurrentCategoryLabel() }}
              </h2>
              <p style="color: #6b7280; margin: 0; font-size: 0.875rem;">
                {{ filteredBookmarks.length }}件のサークル
              </p>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.25rem;">
              <button
                @click="viewMode = 'grid'"
                :style="{
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: viewMode === 'grid' ? '#ff69b4' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : '#6b7280'
                }"
                title="グリッド表示"
              >
                ⊞
              </button>
              <button
                @click="viewMode = 'list'"
                :style="{
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: viewMode === 'list' ? '#ff69b4' : 'transparent',
                  color: viewMode === 'list' ? 'white' : '#6b7280'
                }"
                title="リスト表示"
              >
                ☰
              </button>
            </div>
          </div>

          <!-- グリッド表示 -->
          <div 
            v-if="viewMode === 'grid'"
            style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;"
          >
            <CircleCard
              v-for="bookmark in filteredBookmarks"
              :key="bookmark.id"
              :circle="bookmark.circle"
              @bookmark="handleBookmark"
            />
          </div>

          <!-- リスト表示 -->
          <div v-else style="display: flex; flex-direction: column; gap: 1rem;">
            <CircleListItem
              v-for="bookmark in filteredBookmarks"
              :key="bookmark.id"
              :circle="bookmark.circle"
              @bookmark="handleBookmark"
            />
          </div>
        </div>

        <!-- 空の状態 -->
        <div v-else style="text-align: center; padding: 4rem;">
          <div style="color: #9ca3af; font-size: 3rem; margin-bottom: 1rem;">
            {{ getCurrentCategoryIcon() }}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
            {{ getCurrentCategoryLabel() }}がありません
          </h3>
          <p style="color: #6b7280; margin: 0 0 2rem 0;">
            サークル一覧からお気に入りのサークルをブックマークしてみましょう
          </p>
          <NuxtLink 
            to="/circles"
            style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 500;"
          >
            サークル一覧へ
          </NuxtLink>
        </div>

        <!-- 統計情報 -->
        <div v-if="bookmarks.length > 0" style="margin-top: 3rem; background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0;">
            📊 ブックマーク統計
          </h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="text-align: center; padding: 1rem; background: #fef3f2; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #ff69b4; margin-bottom: 0.25rem;">
                {{ bookmarks.length }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                総ブックマーク数
              </div>
            </div>
            
            <div style="text-align: center; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #0284c7; margin-bottom: 0.25rem;">
                {{ getBookmarkCount('check') }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                チェック予定
              </div>
            </div>
            
            <div style="text-align: center; padding: 1rem; background: #fefce8; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #ca8a04; margin-bottom: 0.25rem;">
                {{ getBookmarkCount('interested') }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                気になる
              </div>
            </div>
            
            <div style="text-align: center; padding: 1rem; background: #fef2f2; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #dc2626; margin-bottom: 0.25rem;">
                {{ getBookmarkCount('priority') }}
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">
                優先
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Composables
const { user, isAuthenticated } = useAuth()
const { bookmarks, removeBookmark, exportToCSV } = useBookmarks()

// State
const activeCategory = ref('all')
const viewMode = ref('grid')


// カテゴリ定義
const categories = ref([
  { key: 'all', label: 'すべて', icon: '📚' },
  { key: 'check', label: 'チェック予定', icon: '📖' },
  { key: 'interested', label: '気になる', icon: '⭐' },
  { key: 'priority', label: '優先', icon: '🔥' }
])

// Computed
const filteredBookmarks = computed(() => {
  if (activeCategory.value === 'all') {
    return bookmarks.value
  }
  return bookmarks.value.filter(bookmark => bookmark.category === activeCategory.value)
})

// Methods
const getBookmarkCount = (category) => {
  if (category === 'all') {
    return bookmarks.value.length
  }
  return bookmarks.value.filter(bookmark => bookmark.category === category).length
}

const getCurrentCategoryLabel = () => {
  const category = categories.value.find(cat => cat.key === activeCategory.value)
  return category?.label || 'ブックマーク'
}

const getCurrentCategoryIcon = () => {
  const category = categories.value.find(cat => cat.key === activeCategory.value)
  return category?.icon || '📚'
}

const handleBookmark = (circleId, category) => {
  // 実際の実装では useBookmarks().toggleBookmark を使用
  console.log('Toggle bookmark:', circleId, category)
}

const exportBookmarks = () => {
  // 実際の実装では useBookmarks().exportToCSV を使用
  console.log('Exporting bookmarks...')
  alert('ブックマークをCSVファイルとしてダウンロードしました')
}

// 初期化
onMounted(() => {
  // 実際の実装では認証状態をチェック
  if (!isAuthenticated.value) {
    navigateTo('/auth/login')
  }
})

// SEO
useHead({
  title: 'ブックマーク - geika check!',
  meta: [
    { name: 'description', content: 'お気に入りのサークルをカテゴリ別に管理できるブックマーク機能です。' }
  ]
})
</script>