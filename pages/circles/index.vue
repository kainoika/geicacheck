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
                :placeholder="searchPlaceholder"
                style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;"
                @input="handleRealtimeSearch"
                @keyup.enter="handleSearch"
              >
              <MagnifyingGlassIcon style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af; width: 1.25rem; height: 1.25rem;" />
            </div>
            
            
          </div>

          <!-- 検索ヒントと人気ジャンルタグ -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
           
            <!-- 人気ジャンルタグ -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
              <span style="font-size: 0.875rem; color: #6b7280; font-weight: 500;">人気ジャンル:</span>
              <button
                v-for="genre in popularGenres"
                :key="genre"
                @click="addGenreToSearch(genre)"
                style="padding: 0.25rem 0.75rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 1rem; font-size: 0.75rem; color: #374151; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.backgroundColor='#e5e7eb'"
                onmouseout="this.style.backgroundColor='#f3f4f6'"
              >
                {{ genre }}
              </button>
            </div>
          </div>



          <!-- サークル数表示 -->
          <div style="color: #6b7280;">
            {{ loading ? '読み込み中...' : `${circles.length}件のサークル` }}
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
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          <CircleCard
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
        <MagnifyingGlassIcon style="color: #9ca3af; width: 3rem; height: 3rem; margin: 0 auto 1rem;" />
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
import { 
  MagnifyingGlassIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'

// Composables
const { circles, loading, error, fetchCircles, searchCircles, performSearch, getPopularGenres } = useCircles()
const { searchState, updateSearchState, resetSearchState } = useCircleSearch()
const { addBookmark, removeBookmark } = useBookmarks()
const { currentEvent, fetchEvents } = useEvents()
const logger = useLogger('CirclesPage')

// 永続化された検索状態を使用
const searchQuery = computed({
  get: () => searchState.value.query,
  set: (value: string) => updateSearchState({ query: value })
});

const currentPage = computed({
  get: () => searchState.value.currentPage,
  set: (value: number) => updateSearchState({ currentPage: value })
});

const itemsPerPage = computed({
  get: () => searchState.value.itemsPerPage,
  set: (value: number) => updateSearchState({ itemsPerPage: value })
});

// ローカル状態
const searchTimeoutId = ref<NodeJS.Timeout | null>(null)
const isMobile = ref(false)

// 人気ジャンル（動的に取得）
const popularGenres = ref<string[]>([])

// レスポンシブなプレースホルダー
const searchPlaceholder = computed(() => {
  return isMobile.value 
    ? 'いちご グッズ など複数語で検索...'
    : '「いちご グッズ」「あおい 漫画」など複数ワードで検索...'
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
const handleSearch = async () => {
  currentPage.value = 1
  await performSearch(searchQuery.value, {
    page: currentPage.value,
    limit: itemsPerPage.value
  }, currentEvent.value?.id)
}

// リアルタイム検索処理
const handleRealtimeSearch = () => {
  // 既存のタイマーをクリア
  if (searchTimeoutId.value) {
    clearTimeout(searchTimeoutId.value)
  }
  
  // 300msのデバウンスで検索実行
  searchTimeoutId.value = setTimeout(async () => {
    currentPage.value = 1
    await performSearch(searchQuery.value, {
      page: currentPage.value,
      limit: itemsPerPage.value
    }, currentEvent.value?.id)
  }, 300)
}

const clearSearch = async () => {
  resetSearchState()
  await fetchData()
}

const handleBookmark = async (circleId: string, category: BookmarkCategory) => {
  try {
    if (!currentEvent.value) return
    
    await addBookmark(circleId, category, undefined, currentEvent.value.id)
  } catch (err) {
    console.error('Bookmark error:', err)
  }
}

// 人気ジャンルタグをクリックした時の処理
const addGenreToSearch = (genre: string) => {
  // 既に検索クエリにそのジャンルが含まれていない場合のみ追加
  if (!searchQuery.value.toLowerCase().includes(genre.toLowerCase())) {
    searchQuery.value = searchQuery.value ? `${searchQuery.value} ${genre}` : genre
    handleRealtimeSearch()
  }
}

const fetchData = async () => {
  logger.info('fetchData called')
  logger.info('currentEvent.value:', currentEvent.value)

  if (!currentEvent.value) {
    logger.info('No current event, skipping fetch')
    return
  }

  try {
    logger.info('Fetching circles for event:', currentEvent.value.id)
    const result = await fetchCircles({
      page: currentPage.value,
      limit: itemsPerPage.value
    }, currentEvent.value.id)

    logger.info('Circles fetched successfully')
    logger.info('Result:', result)
    logger.info('circles.value.length:', circles.value.length)
    logger.info('circles.value:', circles.value)
  } catch (err) {
    console.error('Fetch data error:', err)
  }
}

// ページ復帰時の検索状態復元
const restoreSearchState = async () => {
  if (!currentEvent.value) {
    logger.info('No current event, skipping restore')
    return
  }

  if (searchState.value.query) {
    logger.info('Restoring search state:', searchState.value)
    // 前回の検索クエリがある場合、検索を実行
    await performSearch(searchState.value.query, {
      page: searchState.value.currentPage,
      limit: searchState.value.itemsPerPage
    }, currentEvent.value.id);
  } else {
    // 検索クエリがない場合、全件取得
    logger.info('No previous search query, fetching all data')
    await fetchData();
  }
};

// 人気ジャンルを取得
const fetchPopularGenres = async () => {
  if (!currentEvent.value) {
    return
  }
  
  try {
    logger.info('Fetching popular genres for event:', currentEvent.value.id)
    const genres = await getPopularGenres(currentEvent.value.id, 6)
    popularGenres.value = genres
    logger.info('Popular genres fetched:', genres)
  } catch (err) {
    console.error('Fetch popular genres error:', err)
  }
}

// 画面サイズチェック関数
const checkMobileSize = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 768
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

// 初期データ読み込み
onMounted(async () => {
  logger.info('🚀 Circles page mounted')
  logger.info('🔍 初期currentEvent:', currentEvent.value?.id)
  
  // 画面サイズをチェック
  checkMobileSize()
  
  // リサイズイベントリスナーを追加
  if (process.client) {
    window.addEventListener('resize', checkMobileSize)
  }
  
  try {
    // まずイベント情報を取得
    await fetchEvents()
    
    // currentEventが設定されるまで待機
    const hasCurrentEvent = await waitForCurrentEvent()
    
    if (!hasCurrentEvent) {
      console.error('❌ currentEventが利用できません')
      return
    }
    
    logger.info('✅ currentEvent確認完了:', currentEvent.value?.id)
    
    // 検索状態を復元
    await restoreSearchState()
    await fetchPopularGenres()
    
    logger.info('✅ Circlesページ初期化完了')
  } catch (error) {
    console.error('❌ 初期化エラー:', error)
  }
})

// イベント変更時にデータを再読み込み
watch(currentEvent, async (newEvent, oldEvent) => {
  if (newEvent && newEvent.id !== oldEvent?.id) {
    logger.info('🔄 Circlesページ: イベント変更検知:', oldEvent?.id, '→', newEvent.id)
    await fetchData()
    await fetchPopularGenres()
  }
}, { immediate: false })

// コンポーネントアンマウント時にタイマーをクリアとイベントリスナーを削除
onUnmounted(() => {
  if (searchTimeoutId.value) {
    clearTimeout(searchTimeoutId.value)
  }
  
  // リサイズイベントリスナーを削除
  if (process.client) {
    window.removeEventListener('resize', checkMobileSize)
  }
})

// SEO
useHead({
  title: 'サークル一覧 - geica check!',
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