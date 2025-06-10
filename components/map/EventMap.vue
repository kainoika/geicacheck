<template>
  <div style="width: 100%; height: 100%; position: relative;">
    <!-- マップコンテナ -->
    <div 
      ref="mapContainer"
      style="width: 100%; height: 100%; position: relative; cursor: grab; overflow: hidden; touch-action: none;"
      @mousedown="startPan"
      @mousemove="handlePan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @wheel="handleZoom"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @gesturestart.prevent
      @gesturechange.prevent
      @gestureend.prevent
    >
      <!-- SVGマップ -->
      <div 
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.3s ease',
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-300px',
          marginLeft: '-400px'
        }"
      >
        <!-- 実際のマップSVGを読み込み -->
        <div v-if="isMapLoaded && mapSvgContent" v-html="mapSvgContent" style="position: relative;"></div>
        
        <!-- ローディング状態 -->
        <div v-else style="width: 800px; height: 600px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px;">
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem; animation: pulse 2s infinite;">🗺️</div>
            <div style="font-size: 1.25rem; color: #6c757d; margin-bottom: 0.5rem;">マップを読み込み中...</div>
            <div style="font-size: 0.875rem; color: #adb5bd;">SVGデータの取得中</div>
          </div>
        </div>
        
        <!-- ブックマークピン表示 -->
        <svg 
          style="position: absolute; top: 0; left: 0; width: 800px; height: 600px; pointer-events: none;"
          viewBox="0 0 800 600"
        >
          <!-- ブックマークピン -->
          <g v-for="bookmark in visibleBookmarks" :key="bookmark.id">
            <circle 
              :cx="getCirclePositionForMap(bookmark.circle).x" 
              :cy="getCirclePositionForMap(bookmark.circle).y"
              :r="10"
              :fill="getCategoryColor(bookmark.category)"
              stroke="white"
              stroke-width="3"
              style="cursor: pointer; pointer-events: all; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"
              @click="showCircleInfo(bookmark.circle)"
            />
            
            <!-- ピンアイコン -->
            <text 
              :x="getCirclePositionForMap(bookmark.circle).x" 
              :y="getCirclePositionForMap(bookmark.circle).y + 3"
              text-anchor="middle"
              font-size="10"
              fill="white"
              font-weight="bold"
              style="pointer-events: none;"
            >
              {{ getCategoryIcon(bookmark.category) }}
            </text>
          </g>
        </svg>
      </div>

      <!-- ズーム・パン説明 -->
      <div style="position: absolute; bottom: 1rem; left: 1rem; background: rgba(0,0,0,0.8); color: white; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; backdrop-filter: blur(4px);">
        <!-- デスクトップ用説明 -->
        <div class="hidden sm:block">
          <div>🖱️ マウスホイール: ズーム</div>
          <div>✋ ドラッグ: パン移動</div>
          <div>📍 ピンクリック: 詳細表示</div>
        </div>
        <!-- モバイル用説明 -->
        <div class="sm:hidden">
          <div>🤏 ピンチ: ズーム</div>
          <div>👆 ドラッグ: 移動</div>
          <div>📍 ピンタップ: 詳細</div>
        </div>
      </div>
    </div>

    <!-- サークル情報ポップアップ -->
    <div 
      v-if="selectedCircle"
      style="position: absolute; top: 1rem; right: 1rem; width: 320px; background: white; border-radius: 0.75rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #e5e7eb; z-index: 10; backdrop-filter: blur(8px);"
    >
      <div style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <h4 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0; line-height: 1.4;">
            {{ selectedCircle.circleName }}
          </h4>
          <button 
            @click="selectedCircle = null"
            style="padding: 0.5rem; border: none; background: #f3f4f6; border-radius: 50%; cursor: pointer; color: #6b7280; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
            onmouseover="this.style.backgroundColor='#e5e7eb'"
            onmouseout="this.style.backgroundColor='#f3f4f6'"
          >
            ✕
          </button>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="color: #ff69b4;">📍</span>
            <p style="font-size: 0.875rem; font-weight: 500; color: #374151; margin: 0;">
              {{ formatPlacement(selectedCircle.placement) }}
            </p>
          </div>
          <p v-if="selectedCircle.circleKana" style="font-size: 0.875rem; color: #6b7280; margin: 0;">
            {{ selectedCircle.circleKana }}
          </p>
        </div>
        
        <div v-if="selectedCircle.genre && selectedCircle.genre.length" style="margin-bottom: 1rem;">
          <div style="display: flex; flex-wrap: wrap; gap: 0.375rem;">
            <span 
              v-for="genre in selectedCircle.genre" 
              :key="genre"
              style="background: #e0f2fe; color: #0277bd; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;"
            >
              {{ genre }}
            </span>
          </div>
        </div>
        
        <div v-if="selectedCircle.description" style="margin-bottom: 1rem;">
          <p style="font-size: 0.875rem; color: #4b5563; margin: 0; line-height: 1.5;">
            {{ selectedCircle.description }}
          </p>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; gap: 0.5rem;">
            <!-- Twitter -->
            <a v-if="selectedCircle.contact?.twitter" :href="selectedCircle.contact.twitter" target="_blank"
              rel="noopener noreferrer"
              style="padding: 0.5rem; background: #f0f9ff; color: #0284c7; border-radius: 0.375rem; text-decoration: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
              onmouseover="this.style.backgroundColor='#e0f2fe'"
              onmouseout="this.style.backgroundColor='#f0f9ff'"
              title="Twitter">
              🐦
            </a>

            <!-- Pixiv -->
            <a v-if="selectedCircle.contact?.pixiv" :href="selectedCircle.contact.pixiv" target="_blank"
              rel="noopener noreferrer"
              style="padding: 0.5rem; background: #f0f9ff; color: #0284c7; border-radius: 0.375rem; text-decoration: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
              onmouseover="this.style.backgroundColor='#e0f2fe'"
              onmouseout="this.style.backgroundColor='#f0f9ff'"
              title="Pixiv">
              🎨
            </a>

            <!-- お品書き -->
            <a v-if="selectedCircle.contact?.oshinaUrl" :href="selectedCircle.contact.oshinaUrl" target="_blank"
              rel="noopener noreferrer"
              style="padding: 0.5rem; background: #fff7ed; color: #ea580c; border-radius: 0.375rem; text-decoration: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
              onmouseover="this.style.backgroundColor='#fed7aa'"
              onmouseout="this.style.backgroundColor='#fff7ed'"
              title="お品書き">
              📋
            </a>
          </div>
        </div>
        
        <div style="display: flex; gap: 0.75rem;">
          <NuxtLink 
            :to="`/circles/${selectedCircle.id}`"
            style="flex: 1; padding: 0.75rem; background: #ff69b4; color: white; border-radius: 0.5rem; text-decoration: none; text-align: center; font-size: 0.875rem; font-weight: 600; transition: all 0.2s;"
            onmouseover="this.style.backgroundColor='#e91e63'"
            onmouseout="this.style.backgroundColor='#ff69b4'"
          >
            詳細を見る
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Circle, BookmarkCategory } from '~/types'
import { useTouch, MomentumScroll } from '~/composables/useTouch'
import { useEventMap, useCircleMapping } from '~/composables/useEventMap'

interface Props {
  visibleBookmarks: any[]
  eventId?: string
}

interface Emits {
  (e: 'circleSelect', circle: Circle): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const mapContainer = ref<HTMLElement | null>(null)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })
const selectedCircle = ref<Circle | null>(null)
const currentMomentumScroll = ref<MomentumScroll | null>(null)

// Composables
const { formatPlacement } = useCircles()
const { 
  currentMapContent,
  isLoading: isMapLoading,
  error: mapError,
  loadEventMap
} = useEventMap()
const { getCirclePosition } = useCircleMapping()
const {
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  stopTouch
} = useTouch()

// Computed
const isMapLoaded = computed(() => currentMapContent.value !== '')
const mapSvgContent = computed(() => currentMapContent.value)

// タッチイベントハンドラー
const onTouchStart = (event: TouchEvent) => {
  stopCurrentMomentum()
  
  handleTouchStart(
    event,
    // ピンチ開始
    (distance, midpoint) => {
      console.log('🤏 Pinch start:', { distance, midpoint })
    },
    // パン開始 
    (point) => {
      console.log('👆 Pan start:', point)
      isPanning.value = true
      lastPanPoint.value = point
      if (mapContainer.value) {
        mapContainer.value.style.cursor = 'grabbing'
      }
    }
  )
}

const onTouchMove = (event: TouchEvent) => {
  handleTouchMove(
    event,
    // ピンチ + パン処理
    (scale, center, deltaX, deltaY) => {
      // ズーム処理
      const newZoom = Math.max(0.5, Math.min(3, zoomLevel.value * scale))
      zoomLevel.value = newZoom
      
      // パン処理（ピンチ中心を基準）
      panX.value += deltaX
      panY.value += deltaY
    },
    // パン処理
    (deltaX, deltaY, velocity) => {
      panX.value += deltaX
      panY.value += deltaY
    }
  )
}

const onTouchEnd = (event: TouchEvent) => {
  handleTouchEnd(
    event,
    // 慣性スクロール開始
    (velocity) => {
      startMomentumScroll(velocity)
    },
    // タッチ終了
    () => {
      isPanning.value = false
      if (mapContainer.value) {
        mapContainer.value.style.cursor = 'grab'
      }
    }
  )
}

const startMomentumScroll = (velocity: { x: number, y: number }) => {
  currentMomentumScroll.value = new MomentumScroll(
    velocity,
    {
      friction: 0.95,
      threshold: 0.01,
      onUpdate: (deltaX, deltaY) => {
        panX.value += deltaX
        panY.value += deltaY
      },
      onComplete: () => {
        currentMomentumScroll.value = null
      }
    }
  )
  
  currentMomentumScroll.value.start()
}

const stopCurrentMomentum = () => {
  if (currentMomentumScroll.value) {
    currentMomentumScroll.value.stop()
    currentMomentumScroll.value = null
  }
}

// Methods
const getCategoryIcon = (category: BookmarkCategory) => {
  switch (category) {
    case 'check': return '📖'
    case 'interested': return '⭐'
    case 'priority': return '🔥'
    default: return '📍'
  }
}

const getCategoryColor = (category: BookmarkCategory) => {
  switch (category) {
    case 'check': return '#0284c7'
    case 'interested': return '#ca8a04'
    case 'priority': return '#dc2626'
    default: return '#6b7280'
  }
}

// サークル位置取得（useCircleMapping を使用）
const getCirclePositionForMap = (circle: Circle) => {
  const eventId = props.eventId || 'geika-32'
  return getCirclePosition(circle, eventId)
}

const focusOnCircle = (circle: Circle) => {
  const position = getCirclePositionForMap(circle)
  panX.value = -position.x * zoomLevel.value + (mapContainer.value?.clientWidth || 800) / 2
  panY.value = -position.y * zoomLevel.value + (mapContainer.value?.clientHeight || 600) / 2
  selectedCircle.value = circle
  emit('circleSelect', circle)
}

const showCircleInfo = (circle: Circle) => {
  selectedCircle.value = circle
  emit('circleSelect', circle)
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

const handleZoom = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value = Math.max(0.5, Math.min(3, zoomLevel.value * delta))
}

const startPan = (event: MouseEvent) => {
  isPanning.value = true
  lastPanPoint.value = { x: event.clientX, y: event.clientY }
  if (mapContainer.value) {
    mapContainer.value.style.cursor = 'grabbing'
  }
}

const handlePan = (event: MouseEvent) => {
  if (!isPanning.value) return
  
  const deltaX = event.clientX - lastPanPoint.value.x
  const deltaY = event.clientY - lastPanPoint.value.y
  
  panX.value += deltaX
  panY.value += deltaY
  
  lastPanPoint.value = { x: event.clientX, y: event.clientY }
}

const endPan = () => {
  isPanning.value = false
  if (mapContainer.value) {
    mapContainer.value.style.cursor = 'grab'
  }
}

// 外部から制御可能な関数をexpose
defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  focusOnCircle
})

// プロパティの変更を監視してマップを再読み込み
watch(() => props.eventId, async (newEventId) => {
  if (newEventId) {
    console.log('🔄 Event ID changed, reloading map...', newEventId)
    try {
      await loadEventMap(newEventId)
    } catch (error) {
      console.error('Failed to load map for event:', newEventId, error)
    }
  }
}, { immediate: true })

// 初期化
onMounted(async () => {
  const eventId = props.eventId || 'geika-32'
  console.log('🗺️ Loading initial map for event:', eventId)
  try {
    await loadEventMap(eventId)
  } catch (error) {
    console.error('Failed to load initial map:', error)
  }
})

// クリーンアップ
onUnmounted(() => {
  stopCurrentMomentum()
  stopTouch()
})
</script>

<style scoped>
/* アニメーション */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* SVGマップ内の要素スタイル調整 */
:deep(.card) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

:deep(.card-hover:hover) {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #ff69b4;
}

:deep(.badge) {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

:deep(.badge-secondary) {
  background-color: #e0f2fe;
  color: #0277bd;
}

:deep(.badge-warning) {
  background-color: #fef3c7;
  color: #d97706;
}
</style>