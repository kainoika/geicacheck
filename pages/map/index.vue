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
                🔍+
              </button>
              <button 
                @click="zoomOut"
                style="padding: 0.5rem; border: none; background: none; cursor: pointer; border-radius: 0.25rem; color: #374151;"
                title="ズームアウト"
              >
                🔍-
              </button>
              <button 
                @click="resetZoom"
                style="padding: 0.5rem; border: none; background: none; cursor: pointer; border-radius: 0.25rem; color: #374151;"
                title="リセット"
              >
                🎯
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
                <span>{{ category.icon }}</span>
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
              📍 ブックマークサークル
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
        <div 
          ref="mapContainer"
          style="width: 100%; height: 100%; position: relative; cursor: grab;"
          @mousedown="startPan"
          @mousemove="handlePan"
          @mouseup="endPan"
          @mouseleave="endPan"
          @wheel="handleZoom"
        >
          <!-- SVGマップ -->
          <svg 
            :width="mapWidth" 
            :height="mapHeight"
            :style="{
              transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.3s ease'
            }"
            style="position: absolute; top: 50%; left: 50%; transform-origin: center center;"
          >
            <!-- 背景グリッド -->
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <!-- エリア区分 -->
            <g v-for="area in mapAreas" :key="area.id">
              <!-- エリア背景 -->
              <rect 
                :x="area.x" 
                :y="area.y" 
                :width="area.width" 
                :height="area.height"
                :fill="area.color"
                fill-opacity="0.1"
                :stroke="area.color"
                stroke-width="2"
                rx="8"
              />
              
              <!-- エリアラベル -->
              <text 
                :x="area.x + area.width / 2" 
                :y="area.y + 20"
                text-anchor="middle"
                font-size="16"
                font-weight="bold"
                :fill="area.color"
              >
                {{ area.name }}
              </text>

              <!-- サークルスペース -->
              <g v-for="space in area.spaces" :key="space.id">
                <rect 
                  :x="space.x" 
                  :y="space.y" 
                  :width="space.width" 
                  :height="space.height"
                  fill="white"
                  stroke="#d1d5db"
                  stroke-width="1"
                  rx="2"
                />
                
                <!-- サークル情報 -->
                <text 
                  :x="space.x + space.width / 2" 
                  :y="space.y + space.height / 2"
                  text-anchor="middle"
                  font-size="8"
                  fill="#6b7280"
                  dominant-baseline="middle"
                >
                  {{ space.placement }}
                </text>
              </g>
            </g>

            <!-- ブックマークピン -->
            <g v-for="bookmark in visibleBookmarks" :key="bookmark.id">
              <circle 
                :cx="getCirclePosition(bookmark.circle).x" 
                :cy="getCirclePosition(bookmark.circle).y"
                :r="8"
                :fill="getCategoryColor(bookmark.category)"
                stroke="white"
                stroke-width="2"
                style="cursor: pointer;"
                @click="showCircleInfo(bookmark.circle)"
              />
              
              <!-- ピンアイコン -->
              <text 
                :x="getCirclePosition(bookmark.circle).x" 
                :y="getCirclePosition(bookmark.circle).y + 2"
                text-anchor="middle"
                font-size="8"
                fill="white"
                font-weight="bold"
                style="pointer-events: none;"
              >
                {{ getCategoryIcon(bookmark.category) }}
              </text>
            </g>
          </svg>

          <!-- ズーム・パン説明 -->
          <div style="position: absolute; bottom: 1rem; left: 1rem; background: rgba(0,0,0,0.7); color: white; padding: 0.5rem; border-radius: 0.375rem; font-size: 0.75rem;">
            マウスホイール: ズーム | ドラッグ: パン
          </div>
        </div>

        <!-- サークル情報ポップアップ -->
        <div 
          v-if="selectedCircle"
          style="position: absolute; top: 1rem; right: 1rem; width: 300px; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; z-index: 10;"
        >
          <div style="padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <h4 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0;">
                {{ selectedCircle.circleName }}
              </h4>
              <button 
                @click="selectedCircle = null"
                style="padding: 0.25rem; border: none; background: none; cursor: pointer; color: #6b7280;"
              >
                ✕
              </button>
            </div>
            
            <div style="margin-bottom: 0.75rem;">
              <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">
                {{ formatPlacement(selectedCircle.placement) }}
              </p>
            </div>
            
            <div style="margin-bottom: 0.75rem;">
              <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                <span 
                  v-for="genre in selectedCircle.genre" 
                  :key="genre"
                  style="background: #e0f2fe; color: #0277bd; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.75rem;"
                >
                  {{ genre }}
                </span>
              </div>
            </div>
            
            <div v-if="selectedCircle.description" style="margin-bottom: 1rem;">
              <p style="font-size: 0.875rem; color: #4b5563; margin: 0; line-height: 1.4;">
                {{ selectedCircle.description }}
              </p>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
              <NuxtLink 
                :to="`/circles/${selectedCircle.id}`"
                style="flex: 1; padding: 0.5rem; background: #ff69b4; color: white; border-radius: 0.375rem; text-decoration: none; text-align: center; font-size: 0.875rem; font-weight: 500;"
              >
                詳細を見る
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// State
const mapContainer = ref(null)
const showAllCircles = ref(false)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })
const selectedCircle = ref(null)

const visibleCategories = ref(['check', 'interested', 'priority'])

// マップ設定
const mapWidth = ref(1200)
const mapHeight = ref(800)

// サンプルデータ
const bookmarkedCircles = ref([
  {
    id: '1',
    circleId: '1',
    category: 'check',
    circle: {
      id: '1',
      circleName: '星宮製作所',
      placement: { day: '1', area: '東1', block: 'あ', number: '01', position: 'a' },
      genre: ['アイカツ！', 'いちご'],
      description: '星宮いちごちゃんのイラスト本とグッズを頒布予定です。'
    }
  },
  {
    id: '2',
    circleId: '2',
    category: 'interested',
    circle: {
      id: '2',
      circleName: 'あおい工房',
      placement: { day: '1', area: '東1', block: 'あ', number: '02', position: 'b' },
      genre: ['アイカツ！', 'あおい'],
      description: '霧矢あおいちゃんのアクセサリーとステッカーを作りました。'
    }
  },
  {
    id: '3',
    circleId: '3',
    category: 'priority',
    circle: {
      id: '3',
      circleName: 'らんらん堂',
      placement: { day: '1', area: '東1', block: 'い', number: '15', position: 'a' },
      genre: ['アイカツ！', 'らん'],
      description: '紫吹蘭ちゃんの同人誌とポストカードセットを頒布します。'
    }
  }
])

const bookmarkCategories = ref([
  { key: 'check', label: 'チェック予定', icon: '📖' },
  { key: 'interested', label: '気になる', icon: '⭐' },
  { key: 'priority', label: '優先', icon: '🔥' }
])

// マップエリア定義
const mapAreas = ref([
  {
    id: 'east1',
    name: '東1',
    x: 100,
    y: 100,
    width: 400,
    height: 200,
    color: '#ff69b4',
    spaces: [
      { id: 'e1-a01a', placement: 'あ01a', x: 120, y: 130, width: 30, height: 20 },
      { id: 'e1-a01b', placement: 'あ01b', x: 120, y: 155, width: 30, height: 20 },
      { id: 'e1-a02a', placement: 'あ02a', x: 155, y: 130, width: 30, height: 20 },
      { id: 'e1-a02b', placement: 'あ02b', x: 155, y: 155, width: 30, height: 20 },
      { id: 'e1-i15a', placement: 'い15a', x: 300, y: 130, width: 30, height: 20 }
    ]
  },
  {
    id: 'east2',
    name: '東2',
    x: 550,
    y: 100,
    width: 400,
    height: 200,
    color: '#87ceeb',
    spaces: []
  }
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
const getBookmarkCount = (category) => {
  return bookmarkedCircles.value.filter(bookmark => bookmark.category === category).length
}

const getCategoryIcon = (category) => {
  const categoryData = bookmarkCategories.value.find(cat => cat.key === category)
  return categoryData?.icon || '📍'
}

const getCategoryColor = (category) => {
  switch (category) {
    case 'check': return '#0284c7'
    case 'interested': return '#ca8a04'
    case 'priority': return '#dc2626'
    default: return '#6b7280'
  }
}

const formatPlacement = (placement) => {
  return `${placement.area}-${placement.block}-${placement.number}${placement.position}`
}

const getCirclePosition = (circle) => {
  // 実際の配置に基づいて座標を計算
  const placement = formatPlacement(circle.placement)
  
  // サンプル座標計算
  if (placement === '東1-あ-01a') return { x: 135, y: 140 }
  if (placement === '東1-あ-02b') return { x: 170, y: 165 }
  if (placement === '東1-い-15a') return { x: 315, y: 140 }
  
  // デフォルト位置
  return { x: 200, y: 200 }
}

const focusOnCircle = (circle) => {
  const position = getCirclePosition(circle)
  panX.value = -position.x * zoomLevel.value + mapContainer.value.clientWidth / 2
  panY.value = -position.y * zoomLevel.value + mapContainer.value.clientHeight / 2
  selectedCircle.value = circle
}

const showCircleInfo = (circle) => {
  selectedCircle.value = circle
}

// ズーム・パン機能
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
}

const resetZoom = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

const handleZoom = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value = Math.max(0.5, Math.min(3, zoomLevel.value * delta))
}

const startPan = (event) => {
  isPanning.value = true
  lastPanPoint.value = { x: event.clientX, y: event.clientY }
  mapContainer.value.style.cursor = 'grabbing'
}

const handlePan = (event) => {
  if (!isPanning.value) return
  
  const deltaX = event.clientX - lastPanPoint.value.x
  const deltaY = event.clientY - lastPanPoint.value.y
  
  panX.value += deltaX
  panY.value += deltaY
  
  lastPanPoint.value = { x: event.clientX, y: event.clientY }
}

const endPan = () => {
  isPanning.value = false
  mapContainer.value.style.cursor = 'grab'
}

// SEO
useHead({
  title: '会場マップ - geika check!',
  meta: [
    { name: 'description', content: 'ブックマークしたサークルの配置を会場マップで確認できます。' }
  ]
})
</script>