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
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
      <!-- 結果ヘッダー -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
            {{ searchQuery ? '検索結果' : 'サークル一覧' }}
          </h1>
          <p style="color: #6b7280; margin: 0;">
            {{ searchQuery ? `"${searchQuery}" の検索結果` : 'イベント参加サークル' }}
            <span style="font-weight: 600; color: #374151;">（{{ filteredCircles.length }}件）</span>
          </p>
        </div>

        <!-- 表示切り替え -->
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

      <!-- ローディング状態 -->
      <div v-if="loading" style="display: flex; justify-content: center; align-items: center; padding: 4rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; color: #6b7280;">
          <div style="width: 1rem; height: 1rem; border: 2px solid #ff69b4; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          読み込み中...
        </div>
      </div>

      <!-- エラー状態 -->
      <div v-else-if="error" style="text-align: center; padding: 4rem;">
        <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
          エラーが発生しました
        </h3>
        <p style="color: #6b7280; margin: 0 0 1.5rem 0;">{{ error }}</p>
        <button 
          @click="fetchData"
          style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;"
        >
          再試行
        </button>
      </div>

      <!-- サークル一覧 -->
      <div v-else-if="filteredCircles.length > 0">
        <!-- グリッド表示 -->
        <div 
          v-if="viewMode === 'grid'"
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;"
        >
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
          {{ searchQuery ? '別のキーワードで検索してみてください' : 'サークル情報が登録されていません' }}
        </p>
        <button 
          v-if="searchQuery" 
          @click="clearSearch"
          style="padding: 0.75rem 1.5rem; border: 1px solid #ff69b4; background: white; color: #ff69b4; border-radius: 0.5rem; cursor: pointer; font-weight: 500;"
        >
          検索をクリア
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// サンプルデータ
const sampleCircles = ref([
  {
    id: '1',
    circleName: '星宮製作所',
    circleKana: 'ほしみやせいさくしょ',
    genre: ['アイカツ！', 'いちご'],
    placement: { day: '1', area: '東1', block: 'あ', number: '01', position: 'a' },
    description: '星宮いちごちゃんのイラスト本とグッズを頒布予定です。キラキラ可愛いいちごちゃんをお楽しみください！',
    contact: { twitter: 'hoshimiya_circle', pixiv: 'https://pixiv.net/users/12345' },
    tags: ['いちご', 'イラスト', 'グッズ', 'キラキラ'],
    isAdult: false,
    isPublic: true,
    eventId: 'geika2025',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    circleName: 'あおい工房',
    circleKana: 'あおいこうぼう',
    genre: ['アイカツ！', 'あおい'],
    placement: { day: '1', area: '東1', block: 'あ', number: '02', position: 'b' },
    description: '霧矢あおいちゃんのアクセサリーとステッカーを作りました。クールビューティーなあおいちゃんグッズです。',
    contact: { twitter: 'aoi_koubou' },
    tags: ['あおい', 'アクセサリー', 'ステッカー', 'クール'],
    isAdult: false,
    isPublic: true,
    eventId: 'geika2025',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    circleName: 'らんらん堂',
    circleKana: 'らんらんどう',
    genre: ['アイカツ！', 'らん'],
    placement: { day: '1', area: '東1', block: 'い', number: '15', position: 'a' },
    description: '紫吹蘭ちゃんの同人誌とポストカードセットを頒布します。大人っぽい蘭ちゃんの魅力をお届け！',
    contact: { twitter: 'ranran_dou', pixiv: 'https://pixiv.net/users/67890', oshinaUrl: 'https://oshina.example.com/ranran' },
    tags: ['らん', '同人誌', 'ポストカード', '大人っぽい'],
    isAdult: false,
    isPublic: true,
    eventId: 'geika2025',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    circleName: 'おとめ屋',
    circleKana: 'おとめや',
    genre: ['アイカツ！', 'おとめ'],
    placement: { day: '2', area: '東2', block: 'か', number: '23', position: 'b' },
    description: '藤堂ユリカ様とおとめちゃんの百合本を頒布します。',
    contact: { twitter: 'otome_ya', website: 'https://otome-ya.example.com' },
    tags: ['おとめ', 'ユリカ', '百合', '同人誌'],
    isAdult: false,
    isPublic: true,
    eventId: 'geika2025',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
])

// State
const searchQuery = ref('')
const showFilters = ref(false)
const showSort = ref(false)
const viewMode = ref('grid')
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(12)

const filters = ref({
  genres: [],
  days: [],
  areas: [],
  hasTwitter: false,
  hasPixiv: false,
  hasOshina: false,
  isAdult: false
})

const sortOptions = ref({
  sortBy: 'placement',
  sortOrder: 'asc'
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

const filteredCircles = computed(() => {
  let result = [...sampleCircles.value]

  // テキスト検索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(circle => 
      circle.circleName.toLowerCase().includes(query) ||
      circle.circleKana?.toLowerCase().includes(query) ||
      circle.description?.toLowerCase().includes(query) ||
      circle.tags.some(tag => tag.toLowerCase().includes(query)) ||
      circle.genre.some(genre => genre.toLowerCase().includes(query))
    )
  }

  // フィルター適用
  if (filters.value.genres?.length) {
    result = result.filter(circle => 
      circle.genre.some(genre => filters.value.genres.includes(genre))
    )
  }

  if (filters.value.days?.length) {
    result = result.filter(circle => 
      filters.value.days.includes(circle.placement.day)
    )
  }

  if (filters.value.areas?.length) {
    result = result.filter(circle => 
      filters.value.areas.includes(circle.placement.area)
    )
  }

  if (filters.value.hasTwitter) {
    result = result.filter(circle => circle.contact?.twitter)
  }

  if (filters.value.hasPixiv) {
    result = result.filter(circle => circle.contact?.pixiv)
  }

  if (filters.value.hasOshina) {
    result = result.filter(circle => circle.contact?.oshinaUrl)
  }

  if (!filters.value.isAdult) {
    result = result.filter(circle => !circle.isAdult)
  }

  // ソート適用
  result.sort((a, b) => {
    let comparison = 0
    
    switch (sortOptions.value.sortBy) {
      case 'circleName':
        comparison = a.circleName.localeCompare(b.circleName, 'ja')
        break
      case 'updatedAt':
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt)
        break
      case 'placement':
      default:
        const aPlacement = `${a.placement.area}-${a.placement.block}-${a.placement.number}${a.placement.position}`
        const bPlacement = `${b.placement.area}-${b.placement.block}-${b.placement.number}${b.placement.position}`
        comparison = aPlacement.localeCompare(bPlacement)
        break
    }
    
    return sortOptions.value.sortOrder === 'desc' ? -comparison : comparison
  })

  return result
})

const totalPages = computed(() => 
  Math.ceil(filteredCircles.value.length / itemsPerPage.value)
)

const paginatedCircles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCircles.value.slice(start, end)
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

const handleSearch = () => {
  currentPage.value = 1
}

const applyFilters = () => {
  showFilters.value = false
  currentPage.value = 1
}

const resetFilters = () => {
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
}

const applySorting = () => {
  showSort.value = false
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const handleBookmark = (circleId, category) => {
  console.log('Bookmark:', circleId, category)
  // 実際の実装では useBookmarks().toggleBookmark を使用
}

const fetchData = () => {
  // 実際の実装では API からデータを取得
  console.log('Fetching data...')
}

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