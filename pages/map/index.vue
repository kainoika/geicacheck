<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- ヘッダー -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
              会場マップ
            </h1>
            <p class="text-sm text-gray-600 hidden sm:block">
              ブックマークしたサークルの配置を確認
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="flex flex-1 relative">
      <!-- サイドバー -->
      <div :class="[
        'fixed sm:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 overflow-y-auto transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      ]" style="top: 64px; height: calc(100vh - 64px);">
        <!-- モバイル用ヘッダー -->
        <div class="sm:hidden flex justify-between items-center p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">ブックマーク</h2>
          <button @click="closeSidebar" class="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-4">
          <!-- ブックマーク統計 -->
          <div class="mb-6">
            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              ブックマーク統計
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="text-center p-3 bg-pink-50 rounded-lg">
                <div class="text-xl font-bold text-pink-500">
                  {{ eventBookmarks.length }}
                </div>
                <div class="text-xs text-gray-600">合計</div>
              </div>
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-xl font-bold text-blue-500">
                  {{ getBookmarkCount('check') }}
                </div>
                <div class="text-xs text-gray-600">チェック</div>
              </div>
              <div class="text-center p-3 bg-amber-50 rounded-lg">
                <div class="text-xl font-bold text-amber-600">
                  {{ getBookmarkCount('interested') }}
                </div>
                <div class="text-xs text-gray-600">気になる</div>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-lg">
                <div class="text-xl font-bold text-red-500">
                  {{ getBookmarkCount('priority') }}
                </div>
                <div class="text-xs text-gray-600">優先</div>
              </div>
            </div>
          </div>

          <!-- フィルター -->
          <div class="mb-6">
            <h3 class="text-base font-semibold text-gray-900 mb-3">🔧 表示フィルター</h3>
            <div class="space-y-2">
              <label v-for="category in bookmarkCategories" :key="category.key"
                class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                <input type="checkbox" :value="category.key" v-model="visibleCategories" class="accent-pink-500">
                <span class="text-sm font-medium text-gray-700 flex-1">{{ category.label }}</span>
                <span class="text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold"
                  :style="{ backgroundColor: getCategoryColor(category.key) }">
                  {{ getBookmarkCount(category.key) }}
                </span>
              </label>
            </div>
          </div>

          <!-- ブックマークリスト -->
          <div>
            <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              ブックマークサークル
            </h3>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div v-for="bookmark in filteredBookmarks" :key="bookmark.id" @click="focusOnCircle(bookmark)"
                class="p-3 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-pink-500 hover:bg-pink-50">
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getCategoryColor(bookmark.category) }">
                  </div>
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
                <p class="text-sm">表示するブックマークがありません</p>
                <p v-if="eventBookmarks.length === 0" class="text-xs mt-2">現在のイベントにブックマークがありません</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- サイドバーオーバーレイ（モバイル） -->
      <div v-if="sidebarOpen" @click="closeSidebar" class="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <!-- メインマップエリア -->
      <div class="flex-1 flex flex-col">
        <!-- 操作説明（モバイル用） -->
        <div class="sm:hidden bg-gray-50 border-b border-gray-200 p-3">
          <div class="text-xs text-gray-600 text-center">
            <span class="flex items-center justify-center gap-3">
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                ピンチでズーム
              </span>
              <span class="text-gray-400">|</span>
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                ドラッグで移動
              </span>
              <span class="text-gray-400">|</span>
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ピンをタップで詳細
              </span>
            </span>
          </div>
        </div>

        <!-- SVG表示エリア -->
        <div class="flex-1 bg-white border border-gray-200 rounded-lg m-4 flex flex-col"
          style="max-height: calc(100vh - 200px);">
          <!-- ヘッダー -->
          <div class="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">会場マップ</h2>

            <!-- モバイル用サイドバートグル -->
            <button @click="toggleSidebar" class="sm:hidden px-3 py-2 bg-pink-500 text-white rounded-lg text-sm">
              <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>ブックマーク</span>
            </button>
          </div>

          <!-- ローディング表示 -->
          <div v-if="!svgLoaded && !error" class="flex items-center justify-center h-96">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p class="text-gray-600">SVGマップを読み込み中...</p>
            </div>
          </div>

          <!-- エラー表示 -->
          <div v-else-if="error" class="flex items-center justify-center h-96">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-red-600 font-semibold">マップの読み込みに失敗しました</p>
              <p class="text-gray-600 mt-2">{{ error }}</p>
              <button @click="loadSvg" class="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                再試行
              </button>
            </div>
          </div>

          <!-- SVG表示 -->
          <div v-else class="flex flex-col flex-1 overflow-hidden">
            <!-- ズームコントロール -->
            <div class="flex gap-2 p-4 border-b border-gray-200">
              <button @click="zoomIn"
                class="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                title="ズームイン">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button @click="zoomOut"
                class="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                title="ズームアウト">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <button @click="resetZoom"
                class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                title="リセット">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                {{ Math.round(zoomLevel * 100) }}%
              </div>
            </div>

            <!-- インタラクティブSVGコンテナ -->
            <div ref="mapContainer" class="flex-1 relative overflow-hidden bg-gray-50 select-none"
              style="touch-action: none; min-height: 400px;" @mousedown="startPan" @mousemove="handlePan"
              @mouseup="endPan" @mouseleave="endPan" @wheel="handleZoom" @touchstart="handleTouchStart"
              @touchmove="handleTouchMove" @touchend="handleTouchEnd">
              <!-- 変形可能なSVGコンテナ -->
              <div class="relative" :style="{
                transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
                transformOrigin: '0 0',
                transition: (isPanning || touchActive) ? 'none' : 'transform 0.2s ease',
                cursor: isPanning ? 'grabbing' : 'grab'
              }">
                <!-- ベースSVGマップ（ピンはここに直接埋め込まれる） -->
                <div ref="svgMapContainer" v-html="svgContent"></div>
              </div>

              <!-- 操作説明 -->
              <div class="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1">
                <div class="hidden sm:flex items-center gap-2">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  ドラッグ: 移動 | ホイール: ズーム
                </div>
                <div class="sm:hidden flex items-center gap-2">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  ドラッグ: 移動 | ピンチ: ズーム
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- サークル詳細ポップアップ -->
    <div v-if="selectedCircle"
      class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 z-50 mx-4">
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h4 class="text-xl font-bold text-gray-900 pr-4">
            {{ selectedCircle.circleName }}
          </h4>
          <button @click="selectedCircle = null" class="p-2 hover:bg-gray-100 rounded-full text-gray-500 flex-shrink-0">
            ✕
          </button>
        </div>

        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="font-medium text-gray-700">
              {{ formatPlacement(selectedCircle.placement) }}
            </p>
          </div>
          <p v-if="selectedCircle.circleKana" class="text-sm text-gray-600">
            {{ selectedCircle.circleKana }}
          </p>
        </div>

        <div v-if="selectedCircle.genre && selectedCircle.genre.length" class="mb-4">
          <div class="flex flex-wrap gap-2">
            <span v-for="genre in selectedCircle.genre" :key="genre"
              class="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {{ genre }}
            </span>
          </div>
        </div>

        <div v-if="selectedCircle.description" class="mb-4">
          <p class="text-sm text-gray-600 leading-relaxed">
            {{ selectedCircle.description }}
          </p>
        </div>

        <div class="flex gap-3">
          <!-- 巡回ボタン -->
          <button
            @click="handleQuickToggleVisited(selectedCircle.id)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
              getBookmarkByCircleId(selectedCircle.id)?.visited
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ getBookmarkByCircleId(selectedCircle.id)?.visited ? '巡回済み' : '巡回した？' }}
          </button>

          <NuxtLink :to="`/circles/${selectedCircle.id}`"
            class="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg text-center font-medium hover:bg-pink-600 transition-colors"
            @click="selectedCircle = null">
            詳細を見る
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ポップアップオーバーレイ -->
    <div v-if="selectedCircle" @click="selectedCircle = null" class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

  </div>
</template>

<script setup lang="ts">
// Type imports
import type { Circle, BookmarkCategory, BookmarkWithCircle } from '~/types'
import { useCircleMapping } from '~/composables/useEventMap'
import { useSvgPins } from '~/composables/useSvgPins'

// State
const svgContent = ref<string>('')
const svgLoaded = ref<boolean>(false)
const error = ref<string | null>(null)

// ズーム・パン関連のstate
const mapContainer = ref<HTMLElement | null>(null)
const svgMapContainer = ref<HTMLElement | null>(null)
const zoomLevel = ref<number>(1)
const panX = ref<number>(0)
const panY = ref<number>(0)
const isPanning = ref<boolean>(false)
const lastPanPoint = ref<{ x: number; y: number }>({ x: 0, y: 0 })

// タッチ操作関連
const touchActive = ref<boolean>(false)
const touches = ref<Touch[]>([])
const lastTouchDistance = ref<number>(0)
const lastTouchCenter = ref<{ x: number; y: number }>({ x: 0, y: 0 })

// サイドバー関連
const sidebarOpen = ref<boolean>(false)
const visibleCategories = ref<BookmarkCategory[]>(['check', 'interested', 'priority'])

// 現在のイベントIDを取得（currentEventが利用可能になるまで待機）
const selectedEventId = computed(() => {
  const eventId = currentEvent.value?.id || 'geica-32'
  logger.debug('🎯 selectedEventId computed:', eventId, currentEvent.value)
  return eventId
})

// Composables
const { bookmarksWithCircles, fetchBookmarksWithCircles, toggleVisited, getBookmarkByCircleId } = useBookmarks()
const logger = useLogger('MapPage')
const { currentEvent, fetchEvents } = useEvents()
const { formatPlacement } = useCircles()
const { getCirclePosition } = useCircleMapping()
const { initializePins, renderPins, highlightPin, resetPinHighlight, clearPins, pinStyles } = useSvgPins({
  radius: 12,
  strokeWidth: 3,
  dropShadow: true,
  animated: true
})

// ズーム設定
const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.2

// カテゴリ設定
const bookmarkCategories = ref([
  { key: 'check' as BookmarkCategory, label: 'チェック予定' },
  { key: 'interested' as BookmarkCategory, label: '気になる' },
  { key: 'priority' as BookmarkCategory, label: '優先' }
])

// SVG読み込み関数
const loadSvg = async () => {
  // 現在のイベントに基づいてマップを読み込む
  await loadMapForCurrentEvent()
}

// ズーム機能
const zoomIn = () => {
  const newZoom = Math.min(zoomLevel.value + ZOOM_STEP, MAX_ZOOM)
  zoomLevel.value = newZoom
  logger.debug('🔍 ズームイン:', newZoom)
}

const zoomOut = () => {
  const newZoom = Math.max(zoomLevel.value - ZOOM_STEP, MIN_ZOOM)
  zoomLevel.value = newZoom
  logger.debug('🔍 ズームアウト:', newZoom)
}

const resetZoom = () => {
  zoomLevel.value = 1
  centerMap()
  logger.debug('🔄 ズームリセット')
}

// マップ中央配置
const centerMap = () => {
  if (mapContainer.value) {
    const containerRect = mapContainer.value.getBoundingClientRect()
    panX.value = 0
    panY.value = 0
    logger.info('📍 マップを中央配置:', { containerRect })
  }
}

// マウスホイールズーム
const handleZoom = (event: WheelEvent) => {
  event.preventDefault()

  const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
  const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel.value + delta))

  // マウス位置を基準にズーム（将来的な拡張用）
  zoomLevel.value = newZoom

  logger.debug('🖱️ ホイールズーム:', newZoom)
}

// パン操作開始
const startPan = (event: MouseEvent) => {
  isPanning.value = true
  lastPanPoint.value = { x: event.clientX, y: event.clientY }
  logger.info('👆 パン開始:', lastPanPoint.value)
}

// パン操作中
const handlePan = (event: MouseEvent) => {
  if (!isPanning.value) return

  const deltaX = event.clientX - lastPanPoint.value.x
  const deltaY = event.clientY - lastPanPoint.value.y

  panX.value += deltaX
  panY.value += deltaY

  lastPanPoint.value = { x: event.clientX, y: event.clientY }
}

// パン操作終了
const endPan = () => {
  if (isPanning.value) {
    isPanning.value = false
    logger.info('👆 パン終了:', { panX: panX.value, panY: panY.value })
  }
}

// タッチ操作関数
const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const getTouchCenter = (touch1: Touch, touch2: Touch): { x: number; y: number } => {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }
}

const handleTouchStart = (event: TouchEvent) => {
  // ピンがタッチされた場合は処理しない
  const target = event.target as Element
  if (target.closest('.bookmark-pin')) {
    return
  }

  event.preventDefault()
  touchActive.value = true
  touches.value = Array.from(event.touches)

  if (touches.value.length === 2) {
    // ピンチズーム開始
    lastTouchDistance.value = getTouchDistance(touches.value[0], touches.value[1])
    lastTouchCenter.value = getTouchCenter(touches.value[0], touches.value[1])
    logger.info('🤏 ピンチズーム開始')
  } else if (touches.value.length === 1) {
    // パン開始
    lastPanPoint.value = {
      x: touches.value[0].clientX,
      y: touches.value[0].clientY
    }
    isPanning.value = true
    logger.info('👆 タッチパン開始')
  }
}

const handleTouchMove = (event: TouchEvent) => {
  // ピンがタッチされた場合は処理しない
  const target = event.target as Element
  if (target.closest('.bookmark-pin')) {
    return
  }

  event.preventDefault()

  if (!touchActive.value) return

  const currentTouches = Array.from(event.touches)

  if (currentTouches.length === 2 && touches.value.length === 2) {
    // ピンチズーム
    const currentDistance = getTouchDistance(currentTouches[0], currentTouches[1])
    const currentCenter = getTouchCenter(currentTouches[0], currentTouches[1])

    if (lastTouchDistance.value > 0) {
      const scale = currentDistance / lastTouchDistance.value
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel.value * scale))

      // 中心点の移動も考慮
      const centerDeltaX = currentCenter.x - lastTouchCenter.value.x
      const centerDeltaY = currentCenter.y - lastTouchCenter.value.y

      zoomLevel.value = newZoom
      panX.value += centerDeltaX
      panY.value += centerDeltaY
    }

    lastTouchDistance.value = currentDistance
    lastTouchCenter.value = currentCenter

  } else if (currentTouches.length === 1 && isPanning.value) {
    // パン
    const deltaX = currentTouches[0].clientX - lastPanPoint.value.x
    const deltaY = currentTouches[0].clientY - lastPanPoint.value.y

    panX.value += deltaX
    panY.value += deltaY

    lastPanPoint.value = {
      x: currentTouches[0].clientX,
      y: currentTouches[0].clientY
    }
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  logger.info('🖐️ タッチ終了')

  if (event.touches.length === 0) {
    touchActive.value = false
    isPanning.value = false
    lastTouchDistance.value = 0
  } else {
    touches.value = Array.from(event.touches)
    if (touches.value.length === 1) {
      // 2本指から1本指に変わった場合、パンモードに切り替え
      isPanning.value = true
      lastPanPoint.value = {
        x: touches.value[0].clientX,
        y: touches.value[0].clientY
      }
    }
  }
}

// サイドバー関数
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  logger.info('📱 サイドバートグル:', sidebarOpen.value)
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// ブックマーク関連
const eventBookmarks = computed(() => {
  if (!currentEvent.value || !bookmarksWithCircles.value) {
    logger.info('📊 eventBookmarks: empty', { currentEvent: currentEvent.value?.id, bookmarks: bookmarksWithCircles.value?.length })
    return []
  }
  const filtered = bookmarksWithCircles.value.filter(bookmark => bookmark.eventId === currentEvent.value.id)
  logger.info('📊 eventBookmarks computed:', {
    eventId: currentEvent.value.id,
    totalBookmarks: bookmarksWithCircles.value.length,
    eventBookmarks: filtered.length
  })
  return filtered
})

const filteredBookmarks = computed(() => {
  return eventBookmarks.value.filter(bookmark =>
    visibleCategories.value.includes(bookmark.category)
  )
})

// 有効なブックマーク（bookmarksWithCirclesなので既にサークル情報が含まれている）
const validBookmarks = computed(() => {
  return filteredBookmarks.value
})

const getBookmarkCount = (category: BookmarkCategory): number => {
  const count = eventBookmarks.value.filter(bookmark => bookmark.category === category).length
  logger.info('📊 getBookmarkCount:', { category, count, eventBookmarks: eventBookmarks.value.length })
  return count
}

const getCategoryColor = (category: BookmarkCategory): string => {
  return pinStyles.value[category]?.fill || '#6b7280'
}


const focusOnCircle = (bookmark: BookmarkWithCircle) => {
  logger.info('📍 サークルにフォーカス:', bookmark.circle.circleName)
  const position = getCirclePositionForMap(bookmark.circle)

  // マップを該当サークルの位置に移動
  if (mapContainer.value) {
    const containerWidth = mapContainer.value.clientWidth
    const containerHeight = mapContainer.value.clientHeight

    panX.value = containerWidth / 2 - position.x * zoomLevel.value
    panY.value = containerHeight / 2 - position.y * zoomLevel.value
  }

  // ピンを強調表示
  highlightPin(bookmark.id)

  // 3秒後に強調表示をリセット
  setTimeout(() => {
    resetPinHighlight()
  }, 3000)

  // モバイルでフォーカス時はサイドバーを閉じる
  if (window.innerWidth < 640) {
    closeSidebar()
  }
}

// SVGピン関連の新しい関数
const initializeSvgPins = async () => {
  if (!svgMapContainer.value) return

  const svgElement = svgMapContainer.value.querySelector('svg')
  if (svgElement) {
    await initializePins(svgElement)
    logger.info('✅ SVGピンが初期化されました')
  } else {
    console.warn('⚠️ SVG要素が見つかりません')
  }
}

const renderBookmarkPins = async () => {
  if (validBookmarks.value.length === 0) {
    clearPins()
    return
  }

  renderPins(
    validBookmarks.value,
    getCirclePositionForMap,
    showCircleInfo
  )

  logger.info('✅ ブックマークピンを描画しました:', validBookmarks.value.length)
}

// サークル位置取得
const getCirclePositionForMap = (circle: Circle): { x: number; y: number } => {
  if (!circle) {
    console.warn('無効なサークルデータ')
    return { x: 400, y: 300 } // デフォルト位置
  }
  return getCirclePosition(circle, selectedEventId.value)
}


// サークル詳細表示
const selectedCircle = ref<Circle | null>(null)

const showCircleInfo = (circle: Circle) => {
  selectedCircle.value = circle
  logger.info('📋 サークル詳細表示:', circle.circleName)
}

// SVGマップの読み込み（現在のイベントに基づく）
const loadMapForCurrentEvent = async () => {
  logger.info('🔄 マップ読み込み:', selectedEventId.value)

  // SVGマップを現在のイベント用に読み込み
  // geica-31,32,33に対応
  // それ以外はデフォルトでgeica-32
  // map-geica31.svg, map-geica32.svg, map-geica33.svg
  const mapFileName = (() => {
    const eventId = selectedEventId.value
    if (['geica-31', 'geica-32', 'geica-33'].includes(eventId)) {
      //eventIdはgeica-31なのでgeica31に変換
      return `map-${eventId.replace('geica-', 'geica')}.svg`
    }
    return 'map-geica32.svg'
  })()

  try {
    svgLoaded.value = false
    error.value = null

    const response = await fetch(`/${mapFileName}`)
    if (!response.ok) {
      throw new Error(`SVGファイルの取得に失敗: ${response.status} ${response.statusText}`)
    }

    const svgText = await response.text()
    svgContent.value = svgText
    svgLoaded.value = true

    // マップを中央配置とピン再初期化
    nextTick(async () => {
      centerMap()
      await initializeSvgPins()
      await renderBookmarkPins()
    })

    logger.info('✅ マップ読み込み完了:', selectedEventId.value)
  } catch (err) {
    console.error('❌ マップ読み込みエラー:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

// currentEvent変更時の自動切り替え（初回も含めて反応）
watch(() => currentEvent.value, async (newEvent, oldEvent) => {
  // newEventが存在する場合は常に処理（初回表示時も含む）
  if (newEvent) {
    logger.info('🔄 マップページ: イベント変更検知:', oldEvent?.id, '→', newEvent.id)

    // ブックマークデータを再取得
    await fetchBookmarksWithCircles()
    logger.info('✅ ブックマークデータ再取得完了:', bookmarksWithCircles.value?.length || 0)

    // マップを更新
    await loadMapForCurrentEvent()
  }
}, { immediate: true })

// ブックマーク変更時の自動再描画
watch(() => validBookmarks.value, async () => {
  await renderBookmarkPins()
}, { deep: true })

// フィルター変更時の再描画
watch(() => visibleCategories.value, async () => {
  await renderBookmarkPins()
}, { deep: true })

// クイック巡回機能
const handleQuickToggleVisited = async (circleId: string) => {
  try {
    logger.info('🔄 クイック巡回トグル:', circleId)
    await toggleVisited(circleId)
    logger.info('✅ クイック巡回トグル完了')
  } catch (error) {
    console.error('❌ クイック巡回トグルエラー:', error)
  }
}

// 現在のイベントが利用可能になるまで待機
const waitForCurrentEvent = async (): Promise<boolean> => {
  let attempts = 0
  const maxAttempts = 50 // 5秒間

  while (!currentEvent.value && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++

    if (attempts === 10) {
      // 1秒後にfetchEventsを試す
      logger.info('🔄 Attempting to fetch events...')
      try {
        await fetchEvents()
      } catch (error) {
        console.error('❌ Failed to fetch events:', error)
      }
    }

    if (attempts % 10 === 0) {
      logger.info(`⏳ Still waiting for currentEvent... (${attempts * 100}ms)`)
    }
  }

  return !!currentEvent.value
}

// 初期化
onMounted(async () => {
  logger.info('🚀 マップページがマウントされました')
  logger.info('🔍 初期currentEvent:', currentEvent.value?.id)

  try {
    // イベント情報を取得（まだ取得されていない場合のみ）
    if (!currentEvent.value) {
      await fetchEvents()
    }

    // currentEventが設定されるまで待機
    const hasCurrentEvent = await waitForCurrentEvent()

    if (!hasCurrentEvent) {
      console.error('❌ currentEventが利用できません')
      return
    }

    logger.info('✅ currentEvent確認完了:', currentEvent.value?.id)

    // watcherがimmediate: trueなので、ここでは何もしない
    // watcherが自動的にブックマークとマップを読み込む

    logger.info('✅ マップページ初期化完了')
  } catch (error) {
    console.error('❌ 初期化エラー:', error)
  }
})

// SEO
useHead({
  title: '会場マップ - geica check!',
  meta: [
    { name: 'description', content: 'SVGマップの表示テストページです。' }
  ]
})
</script>