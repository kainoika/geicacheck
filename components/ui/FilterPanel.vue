<template>
  <div class="filter-panel">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
      <!-- ジャンルフィルター -->
      <div class="filter-group">
        <h4 style="font-weight: 600; margin-bottom: 0.75rem; color: #374151;">ジャンル</h4>
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

      <!-- 開催日フィルター -->
      <div class="filter-group">
        <h4 style="font-weight: 600; margin-bottom: 0.75rem; color: #374151;">開催日</h4>
        <div style="display: flex; gap: 0.5rem;">
          <label 
            v-for="day in availableDays" 
            :key="day"
            style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; transition: all 0.2s;"
            :style="{ 
              backgroundColor: selectedDays.includes(day) ? '#fef3f2' : 'white',
              borderColor: selectedDays.includes(day) ? '#ff69b4' : '#d1d5db'
            }"
          >
            <input
              type="checkbox"
              :value="day"
              v-model="selectedDays"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">{{ day }}日目</span>
          </label>
        </div>
      </div>

      <!-- エリアフィルター -->
      <div class="filter-group">
        <h4 style="font-weight: 600; margin-bottom: 0.75rem; color: #374151;">エリア</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <label 
            v-for="area in availableAreas" 
            :key="area"
            style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; transition: all 0.2s;"
            :style="{ 
              backgroundColor: selectedAreas.includes(area) ? '#fef3f2' : 'white',
              borderColor: selectedAreas.includes(area) ? '#ff69b4' : '#d1d5db'
            }"
          >
            <input
              type="checkbox"
              :value="area"
              v-model="selectedAreas"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">{{ area }}</span>
          </label>
        </div>
      </div>

      <!-- その他のフィルター -->
      <div class="filter-group">
        <h4 style="font-weight: 600; margin-bottom: 0.75rem; color: #374151;">その他</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input
              type="checkbox"
              v-model="hasTwitter"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">Twitterアカウントあり</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input
              type="checkbox"
              v-model="hasPixiv"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">Pixivアカウントあり</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input
              type="checkbox"
              v-model="hasOshina"
              style="margin-right: 0.5rem;"
            >
            <span style="font-size: 0.875rem;">お品書きあり</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input
              type="checkbox"
              v-model="includeAdult"
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
import type { SearchFilters } from '~/types'

// Props
interface Props {
  modelValue: SearchFilters
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: SearchFilters): void
  (e: 'apply', value: SearchFilters): void
  (e: 'reset', value: SearchFilters): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

const emit = defineEmits<Emits>()

// State
const selectedGenres = ref(props.modelValue.genres || [])
const selectedDays = ref(props.modelValue.days || [])
const selectedAreas = ref(props.modelValue.areas || [])
const hasTwitter = ref(props.modelValue.hasTwitter || false)
const hasPixiv = ref(props.modelValue.hasPixiv || false)
const hasOshina = ref(props.modelValue.hasOshina || false)
const includeAdult = ref(props.modelValue.isAdult || false)

// Available options (サンプルデータ)
const availableGenres = ref([
  'アイカツ！',
  'アイカツスターズ！',
  'アイカツフレンズ！',
  'アイカツオンパレード！',
  'アイカツプラネット！',
  'いちご',
  'あおい',
  'らん',
  'おとめ',
  'ユリカ',
  'あかり',
  'スミレ',
  'ひなき',
  'ジュリ'
])

const availableDays = ref(['1', '2'])

const availableAreas = ref([
  '東1',
  '東2',
  '東3',
  '東4',
  '東5',
  '東6',
  '西1',
  '西2'
])

// Methods
const applyFilters = () => {
  const filters = {
    genres: selectedGenres.value,
    days: selectedDays.value,
    areas: selectedAreas.value,
    hasTwitter: hasTwitter.value,
    hasPixiv: hasPixiv.value,
    hasOshina: hasOshina.value,
    isAdult: includeAdult.value
  }
  
  emit('update:modelValue', filters)
  emit('apply', filters)
}

const resetFilters = () => {
  selectedGenres.value = []
  selectedDays.value = []
  selectedAreas.value = []
  hasTwitter.value = false
  hasPixiv.value = false
  hasOshina.value = false
  includeAdult.value = false
  
  const filters = {
    genres: [],
    days: [],
    areas: [],
    hasTwitter: false,
    hasPixiv: false,
    hasOshina: false,
    isAdult: false
  }
  
  emit('update:modelValue', filters)
  emit('reset', filters)
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  selectedGenres.value = newValue.genres || []
  selectedDays.value = newValue.days || []
  selectedAreas.value = newValue.areas || []
  hasTwitter.value = newValue.hasTwitter || false
  hasPixiv.value = newValue.hasPixiv || false
  hasOshina.value = newValue.hasOshina || false
  includeAdult.value = newValue.isAdult || false
}, { deep: true })
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