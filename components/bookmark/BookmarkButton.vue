<template>
  <div class="relative">
    <!-- メインボタン -->
    <button
      @click="toggleDropdown"
      :class="[
        'relative p-2 rounded-md transition-all duration-200',
        isBookmarked 
          ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
          : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
      ]"
      :title="getButtonTitle()"
    >
      <component 
        :is="getBookmarkIcon()" 
        :class="[
          'h-5 w-5 transition-transform duration-200',
          showDropdown ? 'scale-110' : 'scale-100'
        ]"
      />
      
      <!-- アニメーション用のスパークル -->
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 scale-0"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-0"
      >
        <div 
          v-if="showSparkle"
          class="absolute -top-1 -right-1 text-yellow-400 pointer-events-none"
        >
          ✨
        </div>
      </Transition>
    </button>

    <!-- ドロップダウンメニュー -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div 
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        @click.stop
      >
        <div class="py-1">
          <!-- チェック予定 -->
          <button
            @click="handleBookmark('check')"
            :class="[
              'flex items-center w-full px-4 py-2 text-sm transition-colors',
              currentCategory === 'check'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            <BookmarkIcon 
              :class="[
                'h-4 w-4 mr-3',
                currentCategory === 'check' ? 'text-blue-500' : 'text-gray-400'
              ]"
            />
            <div class="flex-1 text-left">
              <div class="font-medium">📖 チェック予定</div>
              <div class="text-xs text-gray-500">見に行く予定</div>
            </div>
            <CheckIcon 
              v-if="currentCategory === 'check'"
              class="h-4 w-4 text-blue-500"
            />
          </button>

          <!-- 気になる -->
          <button
            @click="handleBookmark('interested')"
            :class="[
              'flex items-center w-full px-4 py-2 text-sm transition-colors',
              currentCategory === 'interested'
                ? 'bg-yellow-50 text-yellow-700'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            <StarIcon 
              :class="[
                'h-4 w-4 mr-3',
                currentCategory === 'interested' ? 'text-yellow-500' : 'text-gray-400'
              ]"
            />
            <div class="flex-1 text-left">
              <div class="font-medium">⭐ 気になる</div>
              <div class="text-xs text-gray-500">興味がある</div>
            </div>
            <CheckIcon 
              v-if="currentCategory === 'interested'"
              class="h-4 w-4 text-yellow-500"
            />
          </button>

          <!-- 優先 -->
          <button
            @click="handleBookmark('priority')"
            :class="[
              'flex items-center w-full px-4 py-2 text-sm transition-colors',
              currentCategory === 'priority'
                ? 'bg-red-50 text-red-700'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            <FireIcon 
              :class="[
                'h-4 w-4 mr-3',
                currentCategory === 'priority' ? 'text-red-500' : 'text-gray-400'
              ]"
            />
            <div class="flex-1 text-left">
              <div class="font-medium">🔥 優先</div>
              <div class="text-xs text-gray-500">絶対に行く</div>
            </div>
            <CheckIcon 
              v-if="currentCategory === 'priority'"
              class="h-4 w-4 text-red-500"
            />
          </button>

          <!-- 削除 -->
          <div v-if="isBookmarked" class="border-t border-gray-100">
            <button
              @click="handleRemove"
              class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <TrashIcon class="h-4 w-4 mr-3" />
              ブックマークを削除
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- オーバーレイ -->
    <div 
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { 
  BookmarkIcon,
  StarIcon,
  FireIcon,
  CheckIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import {
  BookmarkIcon as BookmarkSolidIcon,
  StarIcon as StarSolidIcon,
  FireIcon as FireSolidIcon
} from '@heroicons/vue/24/solid'
import type { BookmarkCategory } from '~/types'

interface Props {
  circleId: string
  initialCategory?: BookmarkCategory
}

interface Emits {
  (e: 'bookmark', category: BookmarkCategory): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables (実際の実装では useAuth, useBookmarks を使用)
const isAuthenticated = ref(true) // サンプル
const checkIsBookmarked = (id) => Math.random() > 0.5 // サンプル
const getBookmarkByCircleId = (id) => ({ category: 'check' }) // サンプル

// State
const showDropdown = ref(false)
const showSparkle = ref(false)

// Computed
const currentCategory = computed(() => {
  const bookmark = getBookmarkByCircleId(props.circleId)
  return bookmark?.category || props.initialCategory
})

const isBookmarked = computed(() => {
  return checkIsBookmarked(props.circleId)
})

// Methods
const toggleDropdown = () => {
  if (!isAuthenticated.value) {
    // ログインが必要な旨を通知
    alert('ログインが必要です。ブックマーク機能を使用するにはTwitterでログインしてください')
    return
  }
  
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const handleBookmark = async (category: BookmarkCategory) => {
  try {
    emit('bookmark', category)
    closeDropdown()
    
    // スパークルアニメーション
    showSparkle.value = true
    setTimeout(() => {
      showSparkle.value = false
    }, 600)
    
  } catch (error) {
    console.error('Bookmark error:', error)
  }
}

const handleRemove = async () => {
  try {
    const bookmark = getBookmarkByCircleId(props.circleId)
    if (bookmark) {
      // 実際の実装では useBookmarks().removeBookmark を使用
      console.log('Remove bookmark:', props.circleId)
      closeDropdown()
    }
  } catch (error) {
    console.error('Remove bookmark error:', error)
  }
}

const getBookmarkIcon = () => {
  if (!isBookmarked.value) {
    return BookmarkIcon
  }
  
  switch (currentCategory.value) {
    case 'check':
      return BookmarkSolidIcon
    case 'interested':
      return StarSolidIcon
    case 'priority':
      return FireSolidIcon
    default:
      return BookmarkIcon
  }
}

const getButtonTitle = (): string => {
  if (!isAuthenticated.value) {
    return 'ログインしてブックマーク'
  }
  
  if (!isBookmarked.value) {
    return 'ブックマークに追加'
  }
  
  switch (currentCategory.value) {
    case 'check':
      return 'チェック予定'
    case 'interested':
      return '気になる'
    case 'priority':
      return '優先'
    default:
      return 'ブックマーク済み'
  }
}

// 外部クリックでドロップダウンを閉じる
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as Element
    if (!target.closest('.relative')) {
      showDropdown.value = false
    }
  })
})
</script>