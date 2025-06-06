<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- ヘッダー -->
    <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
              会場マップ
            </h1>
            <p style="color: #6b7280; margin: 0;">
              ブックマークしたサークルの配置を確認
            </p>
          </div>
          
          <div style="display: flex; gap: 1rem; align-items: center;">
            <!-- 表示設定 -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #374151;">
                <input 
                  type="checkbox" 
                  v-model="showAllCircles"
                  style="accent-color: #ff69b4;"
                >
                全サークル表示
              </label>
            </div>
            
            <!-- ズームコントロール -->
            <div style="display: flex; gap: 0.25rem; background: white; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.25rem;">
              <button 
                @click="zoomIn"
                style="padding: 0.5rem; border: none; background: none; cursor: pointer; border-radius: 0.25rem; color: #374151;"
                title="ズームイン"
              >
                <PlusIcon class="h-4 w-4" />
              </button>
              <button 
                @click="zoomOut"
                style="padding: 0.5rem; border: none; background: none; cursor: pointer; border-radius: 0.25rem; color: #374151;"
                title="ズームアウト"
              >
                <MinusIcon class="h-4 w-4" />
              </button>
              <button 
                @click="resetZoom"
                style="padding: 0.5rem; border: none; background: none; cursor: pointer; border-radius: 0.25rem; color: #374151;"
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
    <div style="display: flex; height: calc(100vh - 120px);">
      <!-- サイドバー -->
      <div style="width: 300px; background: white; border-right: 1px solid #e5e7eb; overflow-y: auto;">
        <div style="padding: 1.5rem;">
          <!-- ブックマーク統計 -->
          <div style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              📊 ブックマーク統計
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div style="text-align: center; padding: 0.75rem; background: #fef3f2; border-radius: 0.5rem;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #ff69b4;">
                  {{ bookmarkedCircles.length }}
                </div>
                <div style="font-size: 0.75rem; color: #6b7280;">
                  ブックマーク
                </div>
              </div>
              <div style="text-align: center; padding: 0.75rem; background: #f0f9ff; border-radius: 0.5rem;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">
                  {{ getBookmarkCount('check') }}
                </div>
                <div style="font-size: 0.75rem; color: #6b7280;">
                  チェック予定
                </div>
              </div>
            </div>
          </div>

          <!-- フィルター -->
          <div style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              🔧 表示フィルター
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label 
                v-for="category in bookmarkCategories" 
                :key="category.key"
                style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; transition: all 0.2s;"
                :style="{ backgroundColor: visibleCategories.includes(category.key) ? '#fef3f2' : 'transparent' }"
              >
                <input
                  type="checkbox"
                  :value="category.key"
                  v-model="visibleCategories"
                  style="accent-color: #ff69b4;"
                >
                <component :is="getCategoryIcon(category.key)" class="h-4 w-4" />
                <span style="font-size: 0.875rem;">{{ category.label }}</span>
                <span 
                  style="margin-left: auto; background: #ff69b4; color: white; border-radius: 50%; width: 1rem; height: 1rem; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;"
                >
                  {{ getBookmarkCount(category.key) }}
                </span>
              </label>
            </div>
          </div>

          <!-- ブックマークリスト -->
          <div>
            <h3 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              <MapPinIcon class="h-4 w-4 inline mr-1" /> ブックマークサークル
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
              <div 
                v-for="bookmark in filteredBookmarks" 
                :key="bookmark.id"
                @click="focusOnCircle(bookmark.circle)"
                style="padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.borderColor='#ff69b4'; this.style.backgroundColor='#fef3f2'"
                onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white'"
              >
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <span>{{ getCategoryIcon(bookmark.category) }}</span>
                  <span style="font-weight: 600; font-size: 0.875rem; color: #111827;">
                    {{ bookmark.circle.circleName }}
                  </span>
                </div>
                <div style="font-size: 0.75rem; color: #6b7280;">
                  {{ formatPlacement(bookmark.circle.placement) }}
                </div>
              </div>
              
              <div v-if="filteredBookmarks.length === 0" style="text-align: center; padding: 2rem; color: #9ca3af;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📭</div>
                <p style="margin: 0; font-size: 0.875rem;">
                  表示するブックマークがありません
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- マップエリア -->
      <div style="flex: 1; position: relative; overflow: hidden;">
        <!-- エラー表示 -->
        <div v-if="initError" style="display: flex; align-items: center; justify-content: center; height: 100%; background: #fef2f2;">
          <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: #dc2626;">⚠️</div>
            <div style="font-size: 1.25rem; color: #dc2626; margin-bottom: 1rem;">マップの初期化に失敗しました</div>
            <div style="font-size: 0.875rem; color: #6b7280;">{{ initError }}</div>
            <button 
              @click="initError = null; $router.go(0)" 
              style="margin-top: 1rem; padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
        
        <!-- 正常時のマップ表示 -->
        <div v-else-if="currentEvent">
          <EventMap 
            :visible-bookmarks="visibleBookmarks"
            :event-id="currentEvent.id"
            @circle-select="handleCircleSelect"
            ref="eventMapRef"
          />
        </div>
        
        <!-- ローディング表示 -->
        <div v-else style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa;">
          <div style="text-align: center;">
            <ClockIcon style="width: 3rem; height: 3rem; color: #6c757d; margin: 0 auto 1rem;" />
            <div style="font-size: 1.25rem; color: #6c757d;">イベント情報を読み込み中...</div>
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
  FireIcon
} from '@heroicons/vue/24/outline'
import type { Circle, BookmarkCategory, BookmarkWithCircle } from '~/types'
import EventMap from '~/components/map/EventMap.vue'

// State
const showAllCircles = ref(false)
const visibleCategories = ref<BookmarkCategory[]>(['check', 'interested', 'priority'])
const eventMapRef = ref<any>(null)

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
    console.log('🚀 Map page mounted')
    console.log('📅 Current event:', currentEvent.value)
    
    // ブックマーク情報を取得
    await fetchBookmarksWithCircles()
    console.log('✅ Bookmarks loaded')
  } catch (error) {
    console.error('❌ Map initialization error:', error)
    initError.value = error instanceof Error ? error.message : 'Unknown error'
  }
})

// イベント変更時にブックマークを再取得
watch(currentEvent, async () => {
  try {
    if (currentEvent.value) {
      console.log('🔄 Event changed, reloading bookmarks')
      await fetchBookmarksWithCircles()
    }
  } catch (error) {
    console.error('❌ Event change error:', error)
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

// SEO
useHead({
  title: '会場マップ - geika check!',
  meta: [
    { name: 'description', content: 'ブックマークしたサークルの配置を会場マップで確認できます。' }
  ]
})
</script>