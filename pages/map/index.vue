<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
              会場マップ
            </h1>
            <p class="text-sm text-gray-600 hidden sm:block">
              ブックマークしたサークルの配置を確認
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <!-- モバイル：ブックマーク表示ボタン -->
            <button 
              @click="toggleSidebar"
              class="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg font-medium"
            >
              <MapPinIcon class="h-4 w-4" />
              ブックマーク ({{ bookmarkedCircles.length }})
            </button>
            
            <!-- 表示設定 -->
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  v-model="showAllCircles"
                  class="accent-pink-500"
                >
                <span class="hidden sm:inline">全サークル表示</span>
                <span class="sm:hidden">全表示</span>
              </label>
            </div>
            
            <!-- ズームコントロール -->
            <div class="flex gap-1 bg-white border border-gray-300 rounded-lg p-1">
              <button 
                @click="zoomIn"
                class="p-2 hover:bg-gray-100 rounded border-none cursor-pointer text-gray-700"
                title="ズームイン"
              >
                <PlusIcon class="h-4 w-4" />
              </button>
              <button 
                @click="zoomOut"
                class="p-2 hover:bg-gray-100 rounded border-none cursor-pointer text-gray-700"
                title="ズームアウト"
              >
                <MinusIcon class="h-4 w-4" />
              </button>
              <button 
                @click="resetZoom"
                class="p-2 hover:bg-gray-100 rounded border-none cursor-pointer text-gray-700"
                title="リセット"
              >
                <ArrowsPointingOutIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="relative">
      <!-- モバイル用サイドバーオーバーレイ -->
      <div 
        v-if="sidebarOpen" 
        @click="closeSidebar"
        class="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
      ></div>
      
      <!-- サイドバー -->
      <div 
        :class="[
          'fixed sm:static inset-y-0 left-0 z-50 w-80 sm:w-72 lg:w-80 bg-white border-r border-gray-200 overflow-y-auto transform transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        ]"
        style="top: 0; height: 100vh; padding-top: 120px;"
      >
        <!-- モバイル用クローズボタン -->
        <div class="sm:hidden flex justify-between items-center p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">ブックマーク</h2>
          <button 
            @click="closeSidebar"
            class="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon class="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div class="p-4 sm:p-6">
          <!-- ブックマーク統計 -->
          <div class="mb-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📊 ブックマーク統計
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="text-center p-3 bg-pink-50 rounded-lg">
                <div class="text-xl font-bold text-pink-500">
                  {{ bookmarkedCircles.length }}
                </div>
                <div class="text-xs text-gray-600">
                  ブックマーク
                </div>
              </div>
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-xl font-bold text-blue-600">
                  {{ getBookmarkCount('check') }}
                </div>
                <div class="text-xs text-gray-600">
                  チェック予定
                </div>
              </div>
            </div>
          </div>

          <!-- フィルター -->
          <div class="mb-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🔧 表示フィルター
            </h3>
            <div class="space-y-2">
              <label 
                v-for="category in bookmarkCategories" 
                :key="category.key"
                :class="[
                  'flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200',
                  visibleCategories.includes(category.key) ? 'bg-pink-50' : 'hover:bg-gray-50'
                ]"
              >
                <input
                  type="checkbox"
                  :value="category.key"
                  v-model="visibleCategories"
                  class="accent-pink-500"
                >
                <component :is="getCategoryIcon(category.key)" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-medium text-gray-700 flex-1">{{ category.label }}</span>
                <span class="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                  {{ getBookmarkCount(category.key) }}
                </span>
              </label>
            </div>
          </div>

          <!-- ブックマークリスト -->
          <div>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon class="h-4 w-4" /> ブックマークサークル
            </h3>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div 
                v-for="bookmark in filteredBookmarks" 
                :key="bookmark.id"
                @click="focusOnCircle(bookmark.circle)"
                class="p-3 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-pink-500 hover:bg-pink-50 active:scale-95"
              >
                <div class="flex items-center gap-2 mb-1">
                  <component :is="getCategoryIcon(bookmark.category)" class="h-4 w-4 text-gray-600" />
                  <span class="font-semibold text-sm text-gray-900 truncate">
                    {{ bookmark.circle.circleName }}
                  </span>
                </div>
                <div class="text-xs text-gray-600">
                  {{ formatPlacement(bookmark.circle.placement) }}
                </div>
              </div>
              
              <div v-if="filteredBookmarks.length === 0" class="text-center py-8 text-gray-500">
                <div class="text-2xl mb-2">📭</div>
                <p class="text-sm">
                  表示するブックマークがありません
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- マップエリア -->
      <div class="sm:ml-72 lg:ml-80 min-h-screen relative overflow-hidden" style="padding-top: 120px;">
        <!-- エラー表示 -->
        <div v-if="initError" class="flex items-center justify-center h-full bg-red-50 p-4">
          <div class="text-center max-w-md">
            <div class="text-4xl sm:text-5xl mb-4 text-red-600">⚠️</div>
            <div class="text-lg sm:text-xl text-red-600 mb-4 font-semibold">マップの初期化に失敗しました</div>
            <div class="text-sm text-gray-600 mb-6">{{ initError }}</div>
            <button 
              @click="initError = null; $router.go(0)" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
        
        <!-- 正常時のマップ表示 -->
        <div v-else-if="currentEvent" class="h-full">
          <EventMap 
            :visible-bookmarks="visibleBookmarks"
            :event-id="currentEvent.id"
            @circle-select="handleCircleSelect"
            ref="eventMapRef"
            class="w-full h-full"
          />
        </div>
        
        <!-- ローディング表示 -->
        <div v-else class="flex items-center justify-center h-full bg-gray-50 p-4">
          <div class="text-center">
            <ClockIcon class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <div class="text-lg text-gray-600">イベント情報を読み込み中...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  MapPinIcon,
  ClockIcon,
  BookmarkIcon,
  StarIcon,
  FireIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import type { Circle, BookmarkCategory, BookmarkWithCircle } from '~/types'
import EventMap from '~/components/map/EventMap.vue'

// State
const showAllCircles = ref(false)
const visibleCategories = ref<BookmarkCategory[]>(['check', 'interested', 'priority'])
const eventMapRef = ref<any>(null)
const sidebarOpen = ref(false)

// Composables
const { bookmarks, getBookmarksByEventId, fetchBookmarksWithCircles } = useBookmarks()
const { currentEvent } = useEvents()
const { formatPlacement } = useCircles()

// ブックマークデータ
const bookmarkedCircles = computed(() => {
  if (!currentEvent.value) return []
  return getBookmarksByEventId(currentEvent.value.id)
})

// エラーハンドリング
const initError = ref<string | null>(null)

// 初期化
onMounted(async () => {
  try {
    console.log('Map page mounted')
    console.log('Current event:', currentEvent.value)
    
    // ブックマーク情報を取得
    await fetchBookmarksWithCircles()
    console.log('Bookmarks loaded')
  } catch (error) {
    console.error('Map initialization error:', error)
    initError.value = error instanceof Error ? error.message : 'Unknown error'
  }
})

// イベント変更時にブックマークを再取得
watch(currentEvent, async () => {
  try {
    if (currentEvent.value) {
      console.log('Event changed, reloading bookmarks')
      await fetchBookmarksWithCircles()
    }
  } catch (error) {
    console.error('Event change error:', error)
    initError.value = error instanceof Error ? error.message : 'Unknown error'
  }
})

const bookmarkCategories = ref([
  { key: 'check' as BookmarkCategory, label: 'チェック予定' },
  { key: 'interested' as BookmarkCategory, label: '気になる' },
  { key: 'priority' as BookmarkCategory, label: '優先' }
])

// Computed
const filteredBookmarks = computed(() => {
  return bookmarkedCircles.value.filter(bookmark => 
    visibleCategories.value.includes(bookmark.category)
  )
})

const visibleBookmarks = computed(() => {
  return filteredBookmarks.value
})

// Methods
const getBookmarkCount = (category: BookmarkCategory) => {
  return bookmarkedCircles.value.filter(bookmark => bookmark.category === category).length
}

const getCategoryIcon = (category: BookmarkCategory) => {
  switch (category) {
    case 'check': return BookmarkIcon
    case 'interested': return StarIcon
    case 'priority': return FireIcon
    default: return BookmarkIcon
  }
}

const focusOnCircle = (circle: Circle) => {
  if (eventMapRef.value) {
    eventMapRef.value.focusOnCircle(circle)
  }
  // モバイルでサークル選択時はサイドバーを閉じる
  if (window.innerWidth < 640) {
    sidebarOpen.value = false
  }
}

const handleCircleSelect = (circle: Circle) => {
  // サークル選択時の追加処理があればここに記述
}

// ズーム・パン機能
const zoomIn = () => {
  if (eventMapRef.value) {
    eventMapRef.value.zoomIn()
  }
}

const zoomOut = () => {
  if (eventMapRef.value) {
    eventMapRef.value.zoomOut()
  }
}

const resetZoom = () => {
  if (eventMapRef.value) {
    eventMapRef.value.resetZoom()
  }
}

// サイドバー制御
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// SEO
useHead({
  title: '会場マップ - geika check!',
  meta: [
    { name: 'description', content: 'ブックマークしたサークルの配置を会場マップで確認できます。' }
  ]
})
</script>