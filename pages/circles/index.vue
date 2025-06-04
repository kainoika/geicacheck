<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- ヘッダー -->
    <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; position: sticky; top: 0; z-index: 40;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- 検索バー -->
          <div style="display: flex; gap: 1rem; align-items: center;">
            <div style="flex: 1; position: relative;">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="サークル名、タグで検索..."
                style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;"
                @keyup.enter="handleSearch"
              >
              <div style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af;">
                🔍
              </div>
            </div>
            
            <button 
              @click="toggleFilters"
              style="padding: 0.75rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;"
              :style="{ 
                backgroundColor: showFilters ? '#fef3f2' : 'white',
                borderColor: showFilters ? '#ff69b4' : '#d1d5db',
                color: showFilters ? '#ff69b4' : '#374151'
              }"
            >
              🔧 フィルター
              <span v-if="activeFiltersCount > 0" style="background: #ff69b4; color: white; border-radius: 50%; width: 1.25rem; height: 1.25rem; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">
                {{ activeFiltersCount }}
              </span>
            </button>
            
            <button 
              @click="toggleSort"
              style="padding: 0.75rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;"
              :style="{ 
                backgroundColor: showSort ? '#fef3f2' : 'white',
                borderColor: showSort ? '#ff69b4' : '#d1d5db',
                color: showSort ? '#ff69b4' : '#374151'
              }"
            >
              📊 並び替え
            </button>
          </div>

          <!-- フィルターパネル -->
          <div v-if="showFilters" style="animation: slideDown 0.2s ease-out;">
            <FilterPanel
              v-model="filters"
              @apply="applyFilters"
              @reset="resetFilters"
            />
          </div>

          <!-- ソートパネル -->
          <div v-if="showSort" style="animation: slideDown 0.2s ease-out;">
            <SortPanel
              v-model="sortOptions"
              @apply="applySorting"
            />
          </div>

          <!-- 表示モード切り替え -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #6b7280;">
              {{ loading ? '読み込み中...' : `${circles.length}件のサークル` }}
            </div>
            
            <div style="display: flex; border: 1px solid #d1d5db; border-radius: 0.375rem; overflow: hidden;">
              <button 
                @click="viewMode = 'grid'"
                style="padding: 0.5rem 1rem; border: none; cursor: pointer; transition: all 0.2s;"
                :style="{ 
                  backgroundColor: viewMode === 'grid' ? '#ff69b4' : 'white',
                  color: viewMode === 'grid' ? 'white' : '#374151'
                }"
              >
                🔲 グリッド
              </button>
              <button 
                @click="viewMode = 'list'"
                style="padding: 0.5rem 1rem; border: none; border-left: 1px solid #d1d5db; cursor: pointer; transition: all 0.2s;"
                :style="{ 
                  backgroundColor: viewMode === 'list' ? '#ff69b4' : 'white',
                  color: viewMode === 'list' ? 'white' : '#374151'
                }"
              >
                📋 リスト
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
      <!-- エラー表示 -->
      <div v-if="error" style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
        {{ error }}
      </div>

      <!-- ローディング -->
      <div v-if="loading" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
        <div style="animation: spin 1s linear infinite; width: 2rem; height: 2rem; border: 2px solid #ff69b4; border-top: 2px solid transparent; border-radius: 50%;"></div>
      </div>

      <!-- サークル一覧 -->
      <div v-else-if="paginatedCircles.length > 0">
        <!-- グリッド表示 -->
        <div v-if="viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
          <CircleCard
            v-for="circle in paginatedCircles"
            :key="circle.id"
            :circle="circle"
            @bookmark="handleBookmark"
          />
        </div>

        <!-- リスト表示 -->
        <div v-else style="display: flex; flex-direction: column; gap: 1rem;">
          <CircleListItem
            v-for="circle in paginatedCircles"
            :key="circle.id"
            :circle="circle"
            @bookmark="handleBookmark"
          />
        </div>

        <!-- ページネーション -->
        <div v-if="totalPages > 1" style="display: flex; justify-content: center; margin-top: 2rem;">
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button 
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 0.375rem; cursor: pointer;"
              :style="{ opacity: currentPage === 1 ? 0.5 : 1 }"
            >
              ← 前
            </button>
            
            <span style="padding: 0.5rem 1rem; color: #374151;">
              {{ currentPage }} / {{ totalPages }}
            </span>
            
            <button 
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 0.375rem; cursor: pointer;"
              :style="{ opacity: currentPage === totalPages ? 0.5 : 1 }"
            >
              次 →
            </button>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-else style="text-align: center; padding: 4rem;">
        <div style="color: #9ca3af; font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
          {{ searchQuery ? '検索結果が見つかりません' : 'サークルが見つかりません' }}
        </h3>
        <p style="color: #6b7280; margin: 0 0 1.5rem 0;">
          {{ searchQuery ? '検索条件を変更してお試しください' : 'サークル情報が登録されていません' }}
        </p>
        <button 
          v-if="searchQuery"
          @click="clearSearch"
          style="background: #ff69b4; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
          onmouseover="this.style.backgroundColor='#e91e63'"
          onmouseout="this.style.backgroundColor='#ff69b4'"
        >
          検索をクリア
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Circle, BookmarkCategory, SearchParams } from '~/types'

// Composables
const { circles, loading, error, fetchCircles, searchCircles } = useCircles()
const { addBookmark, removeBookmark } = useBookmarks()
const { currentEvent, fetchEvents } = useEvents()

// State
const searchQuery = ref('')
const showFilters = ref(false)
const showSort = ref(false)
const viewMode = ref('grid')
const currentPage = ref(1)
const itemsPerPage = ref(12)

const filters = ref<SearchParams>({
  genres: [],
  days: [],
  areas: [],
  hasTwitter: false,
  hasPixiv: false,
  hasOshina: false,
  isAdult: false
})

const sortOptions = ref({
  sortBy: 'placement' as const,
  sortOrder: 'asc' as const
})

// Computed
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.genres?.length) count++
  if (filters.value.days?.length) count++
  if (filters.value.areas?.length) count++
  if (filters.value.hasTwitter) count++
  if (filters.value.hasPixiv) count++
  if (filters.value.hasOshina) count++
  return count
})

const totalPages = computed(() => 
  Math.ceil(circles.value.length / itemsPerPage.value)
)

const paginatedCircles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return circles.value.slice(start, end)
})

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value
  if (showFilters.value) {
    showSort.value = false
  }
}

const toggleSort = () => {
  showSort.value = !showSort.value
  if (showSort.value) {
    showFilters.value = false
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  if (searchQuery.value.trim()) {
    await searchCircles(searchQuery.value.trim(), {
      ...filters.value,
      sortBy: sortOptions.value.sortBy,
      sortOrder: sortOptions.value.sortOrder,
      page: currentPage.value,
      limit: itemsPerPage.value
    })
  } else {
    await fetchData()
  }
}

const applyFilters = async () => {
  showFilters.value = false
  currentPage.value = 1
  await fetchData()
}

const resetFilters = async () => {
  filters.value = {
    genres: [],
    days: [],
    areas: [],
    hasTwitter: false,
    hasPixiv: false,
    hasOshina: false,
    isAdult: false
  }
  currentPage.value = 1
  await fetchData()
}

const applySorting = async () => {
  showSort.value = false
  currentPage.value = 1
  await fetchData()
}

const clearSearch = async () => {
  searchQuery.value = ''
  currentPage.value = 1
  await fetchData()
}

const handleBookmark = async (circleId: string, category: BookmarkCategory) => {
  try {
    if (!currentEvent.value) return
    
    await addBookmark({
      circleId,
      category,
      eventId: currentEvent.value.id
    })
  } catch (err) {
    console.error('Bookmark error:', err)
  }
}

const fetchData = async () => {
  console.log('🔍 fetchData called')
  console.log('📅 currentEvent.value:', currentEvent.value)
  
  if (!currentEvent.value) {
    console.log('❌ No current event, skipping fetch')
    return
  }
  
  try {
    console.log('🔄 Fetching circles for event:', currentEvent.value.id)
    const result = await fetchCircles({
      ...filters.value,
      sortBy: sortOptions.value.sortBy,
      sortOrder: sortOptions.value.sortOrder,
      page: currentPage.value,
      limit: itemsPerPage.value
    }, currentEvent.value.id)
    
    console.log('✅ Circles fetched successfully')
    console.log('📊 Result:', result)
    console.log('📋 circles.value.length:', circles.value.length)
    console.log('📋 circles.value:', circles.value)
  } catch (err) {
    console.error('❌ Fetch data error:', err)
  }
}

// 初期データ読み込み
onMounted(async () => {
  console.log('🚀 Circles page mounted')
  console.log('📅 currentEvent:', currentEvent.value)
  
  // プラグインでイベントが初期化されていない場合のフォールバック
  if (!currentEvent.value) {
    console.log('⏳ Waiting for events to be initialized...')
    
    let attempts = 0
    const maxAttempts = 50 // 5秒間
    
    while (!currentEvent.value && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
      
      if (attempts === 10) {
        // 1秒後にfetchEventsを試す
        console.log('🔄 Attempting to fetch events...')
        try {
          await fetchEvents()
        } catch (error) {
          console.error('❌ Failed to fetch events:', error)
        }
      }
      
      if (attempts % 10 === 0) {
        console.log(`⏳ Still waiting... (${attempts * 100}ms)`)
      }
    }
  }
  
  if (currentEvent.value) {
    console.log('✅ currentEvent available:', currentEvent.value.id)
    await fetchData()
  } else {
    console.error('❌ No currentEvent available after waiting')
  }
})

// イベント変更時にデータを再読み込み
watch(currentEvent, async () => {
  if (currentEvent.value) {
    await fetchData()
  }
})

// SEO
useHead({
  title: 'サークル一覧 - geika check!',
  meta: [
    { name: 'description', content: 'アイカツ！同人イベント「芸能人はカードが命！（芸カ）」参加サークルの一覧です。' }
  ]
})
</script>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>