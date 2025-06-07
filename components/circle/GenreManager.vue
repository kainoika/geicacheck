<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
        <TagIcon class="h-5 w-5" />
        ジャンル
      </h2>
      <button
        v-if="canEdit"
        @click="showAddForm = true"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon class="h-4 w-4 mr-1" />
        ジャンルを追加
      </button>
    </div>

    <!-- ジャンル一覧 -->
    <div v-if="genres.length > 0" class="flex flex-wrap gap-2">
      <div
        v-for="genre in genres"
        :key="genre"
        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
      >
        <TagIcon class="h-4 w-4 mr-1" />
        {{ genre }}
        <button
          v-if="canEdit"
          @click="removeGenre(genre)"
          class="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none"
          :title="`${genre}を削除`"
        >
          <XMarkIcon class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- ジャンルなしの表示 -->
    <div v-else class="text-center py-6 text-gray-500">
      <TagIcon class="mx-auto h-8 w-8 text-gray-300" />
      <p class="mt-2 text-sm">ジャンルが登録されていません</p>
      <p v-if="canEdit" class="mt-1 text-xs">「ジャンルを追加」ボタンから登録してください</p>
    </div>

    <!-- ジャンル追加フォーム -->
    <div
      v-if="showAddForm"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeForm"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            ジャンルを追加
          </h3>
          
          <form @submit.prevent="addGenre" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                ジャンル名 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newGenre"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="例: グッズ、イラスト、漫画"
                @input="validateGenre"
              />
              <p v-if="genreError" class="mt-1 text-sm text-red-600">
                {{ genreError }}
              </p>
            </div>
            
            <!-- 人気ジャンルの候補表示 -->
            <div v-if="popularGenres.length > 0" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                人気ジャンルから選択
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="popular in popularGenres"
                  :key="popular"
                  type="button"
                  @click="selectPopularGenre(popular)"
                  class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {{ popular }}
                </button>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                キャンセル
              </button>
              <button
                type="submit"
                :disabled="!newGenre.trim() || !!genreError"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                追加
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  PlusIcon,
  XMarkIcon,
  TagIcon
} from '@heroicons/vue/24/outline'

interface Props {
  genres: string[]
  canEdit: boolean
  popularGenres?: string[]
}

interface Emits {
  (e: 'update:genres', genres: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  popularGenres: () => []
})

const emit = defineEmits<Emits>()

const showAddForm = ref(false)
const newGenre = ref('')
const genreError = ref('')

// 既存のジャンルと重複しない人気ジャンルのフィルタ
const popularGenres = computed(() => {
  return props.popularGenres.filter(genre => !props.genres.includes(genre))
})

const validateGenre = () => {
  genreError.value = ''
  const trimmed = newGenre.value.trim()
  
  if (trimmed && props.genres.includes(trimmed)) {
    genreError.value = 'このジャンルは既に追加されています'
  }
}

const closeForm = () => {
  showAddForm.value = false
  newGenre.value = ''
  genreError.value = ''
}

const selectPopularGenre = (genre: string) => {
  newGenre.value = genre
  validateGenre()
}

const addGenre = () => {
  const trimmed = newGenre.value.trim()
  if (!trimmed || genreError.value) return
  
  const updatedGenres = [...props.genres, trimmed]
  emit('update:genres', updatedGenres)
  closeForm()
}

const removeGenre = (genreToRemove: string) => {
  if (confirm(`ジャンル「${genreToRemove}」を削除しますか？`)) {
    const updatedGenres = props.genres.filter(genre => genre !== genreToRemove)
    emit('update:genres', updatedGenres)
  }
}
</script>