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
              <DocumentArrowDownIcon class="h-4 w-4" /> CSVエクスポート
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
      <!-- 未ログイン状態 -->
      <div v-if="!isAuthenticated" style="text-align: center; padding: 4rem;">
        <LockClosedIcon style="color: #9ca3af; width: 3rem; height: 3rem; margin: 0 auto 1rem;" />
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
        <!-- ローディング状態 -->
        <div v-if="loading" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
          <div style="animation: spin 1s linear infinite; width: 2rem; height: 2rem; border: 2px solid #ff69b4; border-top: 2px solid transparent; border-radius: 50%;"></div>
        </div>

        <!-- データ読み込み完了後 -->
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
              <component :is="getCategoryIcon(category.key)" class="h-4 w-4" />
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
          <!-- ヘッダー -->
          <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0;">
              {{ getCurrentCategoryLabel() }}
            </h2>
            <p style="color: #6b7280; margin: 0; font-size: 0.875rem;">
              {{ filteredBookmarks.length }}件のサークル
            </p>
          </div>

          <!-- グリッド表示 -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            <CircleCard
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
            <component :is="getCurrentCategoryIconComponent()" class="h-12 w-12" />
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
        <div v-if="bookmarksWithCircles.length > 0" style="margin-top: 3rem; background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0;">
            <ChartBarIcon class="h-5 w-5 inline mr-2" /> ブックマーク統計
          </h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="text-align: center; padding: 1rem; background: #fef3f2; border-radius: 0.5rem;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #ff69b4; margin-bottom: 0.25rem;">
                {{ bookmarksWithCircles.length }}
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
  </div>
</template>

<script setup>
import {
  DocumentArrowDownIcon,
  LockClosedIcon,
  ChartBarIcon,
  BookmarkIcon,
  StarIcon,
  FireIcon,
  RectangleStackIcon
} from '@heroicons/vue/24/outline'

// Composables
const { user, isAuthenticated } = useAuth()
const { bookmarks, bookmarksWithCircles, loading, fetchBookmarksWithCircles, toggleBookmark, generateExportData } = useBookmarks()

// State
const activeCategory = ref('all')


// カテゴリ定義
const categories = ref([
  { key: 'all', label: 'すべて' },
  { key: 'check', label: 'チェック予定' },
  { key: 'interested', label: '気になる' },
  { key: 'priority', label: '優先' }
])

// Computed
const filteredBookmarks = computed(() => {
  if (activeCategory.value === 'all') {
    return bookmarksWithCircles.value
  }
  return bookmarksWithCircles.value.filter(bookmark => bookmark.category === activeCategory.value)
})

// Methods
const getCategoryIcon = (category) => {
  switch (category) {
    case 'all': return RectangleStackIcon
    case 'check': return BookmarkIcon
    case 'interested': return StarIcon
    case 'priority': return FireIcon
    default: return BookmarkIcon
  }
}

const getCurrentCategoryIconComponent = () => {
  return getCategoryIcon(activeCategory.value)
}

const getBookmarkCount = (category) => {
  if (category === 'all') {
    return bookmarksWithCircles.value.length
  }
  return bookmarksWithCircles.value.filter(bookmark => bookmark.category === category).length
}

const getCurrentCategoryLabel = () => {
  const category = categories.value.find(cat => cat.key === activeCategory.value)
  return category?.label || 'ブックマーク'
}


const handleBookmark = async (circleId, category) => {
  try {
    await toggleBookmark(circleId, category)
  } catch (error) {
    console.error('Bookmark error:', error)
  }
}

const exportBookmarks = () => {
  try {
    const data = generateExportData()
    const csv = convertToCSV(data)
    downloadCSV(csv, 'bookmarks.csv')
  } catch (error) {
    console.error('Export error:', error)
    alert('エクスポートに失敗しました')
  }
}

const convertToCSV = (data) => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n')
  
  return csvContent
}

const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 初期化
onMounted(async () => {
  if (!isAuthenticated.value) {
    await navigateTo('/auth/login')
    return
  }
  
  try {
    await fetchBookmarksWithCircles()
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error)
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

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>