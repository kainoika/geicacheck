<template>
  <div class="filter-panel">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
      <!-- ジャンルフィルター -->
      <div class="filter-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-weight: 600; color: #374151; margin: 0;">ジャンル</h4>
          <div style="display: flex; gap: 0.5rem;">
            <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.75rem;">
              <input
                type="radio"
                value="OR"
                v-model="genreFilterMode"
                style="margin-right: 0.25rem;"
              >
              <span>OR</span>
            </label>
            <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.75rem;">
              <input
                type="radio"
                value="AND"
                v-model="genreFilterMode"
                style="margin-right: 0.25rem;"
              >
              <span>AND</span>
            </label>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <label 
            v-for="genre in availableGenres" 
            :key="genre"
            style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; transition: all 0.2s;"
            :style="{ 
              backgroundColor: selectedGenres.includes(genre) ? '#fef3f2' : 'white',
              borderColor: selectedGenres.includes(genre) ? '#ff69b4' : '#d1d5db'
            }"
          >
            <input
              type="checkbox"
              :value="genre"
              v-model="selectedGenres"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">{{ genre }}</span>
          </label>
        </div>
      </div>

      <!-- 配置フィルター（ブロック） -->
      <div class="filter-group">
        <h4 style="font-weight: 600; margin-bottom: 0.75rem; color: #374151;">配置（ブロック）</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <label 
            v-for="block in availableBlocks" 
            :key="block"
            style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; transition: all 0.2s;"
            :style="{ 
              backgroundColor: selectedBlocks.includes(block) ? '#fef3f2' : 'white',
              borderColor: selectedBlocks.includes(block) ? '#ff69b4' : '#d1d5db'
            }"
          >
            <input
              type="checkbox"
              :value="block"
              v-model="selectedBlocks"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">{{ block }}ブロック</span>
          </label>
        </div>
      </div>

      <!-- 成人向けフィルター -->
      <div class="filter-group">
        <h4 style="font-weight: 600; margin-bottom: 0.75rem; color: #374151;">成人向けフィルター</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input
              type="radio"
              :value="false"
              v-model="adultFilter"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">全年齢のみ</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input
              type="radio"
              :value="true"
              v-model="adultFilter"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">成人向けを含む</span>
          </label>
        </div>
      </div>
    </div>

    <!-- アクションボタン -->
    <div style="display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
      <button 
        @click="resetFilters"
        style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s;"
        onmouseover="this.style.backgroundColor='#f9fafb'"
        onmouseout="this.style.backgroundColor='white'"
      >
        リセット
      </button>
      <button 
        @click="applyFilters"
        style="padding: 0.5rem 1.5rem; background: #ff69b4; color: white; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; font-weight: 500;"
        onmouseover="this.style.backgroundColor='#e91e63'"
        onmouseout="this.style.backgroundColor='#ff69b4'"
      >
        フィルターを適用
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchParams } from '~/types'

// Props
interface Props {
  modelValue: SearchParams
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: SearchParams): void
  (e: 'apply', value: SearchParams): void
  (e: 'reset', value: SearchParams): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

const emit = defineEmits<Emits>()

// Composables
const { getAvailableGenres } = useCircles()
const { currentEvent } = useEvents()

// State
const selectedGenres = ref(props.modelValue.genres || [])
const selectedBlocks = ref(props.modelValue.blocks || [])
const adultFilter = ref(props.modelValue.isAdult !== undefined ? props.modelValue.isAdult : false)
const genreFilterMode = ref(props.modelValue.genreFilterMode || 'OR')

// Available options
const availableGenres = ref<string[]>([])
const availableBlocks = ref([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'
])

// Methods
const applyFilters = () => {
  const filters = {
    genres: selectedGenres.value,
    blocks: selectedBlocks.value,
    isAdult: adultFilter.value,
    genreFilterMode: genreFilterMode.value
  }
  
  emit('update:modelValue', filters)
  emit('apply', filters)
}

const resetFilters = () => {
  selectedGenres.value = []
  selectedBlocks.value = []
  adultFilter.value = false
  genreFilterMode.value = 'OR'
  
  const filters = {
    genres: [],
    blocks: [],
    isAdult: false,
    genreFilterMode: 'OR' as const
  }
  
  emit('update:modelValue', filters)
  emit('reset', filters)
}

// Initialize available genres
const initializeGenres = async () => {
  try {
    if (currentEvent.value) {
      const genres = await getAvailableGenres(currentEvent.value.id)
      availableGenres.value = genres
    }
  } catch (error) {
    console.error('Failed to fetch available genres:', error)
  }
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  selectedGenres.value = newValue.genres || []
  selectedBlocks.value = newValue.blocks || []
  adultFilter.value = newValue.isAdult !== undefined ? newValue.isAdult : false
  genreFilterMode.value = newValue.genreFilterMode || 'OR'
}, { deep: true })

// Watch for event changes
watch(currentEvent, () => {
  if (currentEvent.value) {
    initializeGenres()
  }
})

// Initialize on mount
onMounted(() => {
  if (currentEvent.value) {
    initializeGenres()
  }
})
</script>

<style scoped>
.filter-panel {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.filter-group {
  min-width: 0;
}

input[type="checkbox"] {
  accent-color: #ff69b4;
}
</style>