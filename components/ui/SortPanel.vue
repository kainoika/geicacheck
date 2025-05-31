<template>
  <div class="sort-panel">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
      <!-- ソート項目 -->
      <div class="sort-group">
        <h4 style="font-weight: 600; margin-bottom: 0.75rem; color: #374151;">並び替え項目</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label 
            v-for="option in sortOptions" 
            :key="option.value"
            style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; transition: all 0.2s;"
            :style="{ 
              backgroundColor: selectedSortBy === option.value ? '#fef3f2' : 'white',
              borderColor: selectedSortBy === option.value ? '#ff69b4' : '#d1d5db'
            }"
          >
            <input
              type="radio"
              :value="option.value"
              v-model="selectedSortBy"
              style="margin-right: 0.5rem;"
            >
            <div>
              <div style="font-size: 0.875rem; font-weight: 500;">{{ option.label }}</div>
              <div style="font-size: 0.75rem; color: #6b7280;">{{ option.description }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- ソート順序 -->
      <div class="sort-group">
        <h4 style="font-weight: 600; margin-bottom: 0.75rem; color: #374151;">並び順</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label 
            style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; transition: all 0.2s;"
            :style="{ 
              backgroundColor: selectedSortOrder === 'asc' ? '#fef3f2' : 'white',
              borderColor: selectedSortOrder === 'asc' ? '#ff69b4' : '#d1d5db'
            }"
          >
            <input
              type="radio"
              value="asc"
              v-model="selectedSortOrder"
              style="margin-right: 0.5rem;"
            >
            <div>
              <div style="font-size: 0.875rem; font-weight: 500;">昇順</div>
              <div style="font-size: 0.75rem; color: #6b7280;">{{ getOrderDescription('asc') }}</div>
            </div>
          </label>
          
          <label 
            style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; transition: all 0.2s;"
            :style="{ 
              backgroundColor: selectedSortOrder === 'desc' ? '#fef3f2' : 'white',
              borderColor: selectedSortOrder === 'desc' ? '#ff69b4' : '#d1d5db'
            }"
          >
            <input
              type="radio"
              value="desc"
              v-model="selectedSortOrder"
              style="margin-right: 0.5rem;"
            >
            <div>
              <div style="font-size: 0.875rem; font-weight: 500;">降順</div>
              <div style="font-size: 0.75rem; color: #6b7280;">{{ getOrderDescription('desc') }}</div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- プレビュー -->
    <div style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.375rem; border: 1px solid #e5e7eb;">
      <div style="font-size: 0.875rem; color: #374151;">
        <strong>現在の設定:</strong> {{ getCurrentSortDescription() }}
      </div>
    </div>

    <!-- アクションボタン -->
    <div style="display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
      <button 
        @click="resetSort"
        style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s;"
        onmouseover="this.style.backgroundColor='#f9fafb'"
        onmouseout="this.style.backgroundColor='white'"
      >
        デフォルトに戻す
      </button>
      <button 
        @click="applySort"
        style="padding: 0.5rem 1.5rem; background: #ff69b4; color: white; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; font-weight: 500;"
        onmouseover="this.style.backgroundColor='#e91e63'"
        onmouseout="this.style.backgroundColor='#ff69b4'"
      >
        並び替えを適用
      </button>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      sortBy: 'placement',
      sortOrder: 'asc'
    })
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'apply'])

// State
const selectedSortBy = ref(props.modelValue.sortBy || 'placement')
const selectedSortOrder = ref(props.modelValue.sortOrder || 'asc')

// Sort options
const sortOptions = ref([
  {
    value: 'placement',
    label: '配置順',
    description: 'エリア・ブロック・番号順'
  },
  {
    value: 'circleName',
    label: 'サークル名',
    description: '50音順'
  },
  {
    value: 'updatedAt',
    label: '更新日時',
    description: '最近更新されたもの'
  },
  {
    value: 'bookmarkCount',
    label: 'ブックマーク数',
    description: '人気順'
  }
])

// Methods
const getOrderDescription = (order) => {
  const sortOption = sortOptions.value.find(opt => opt.value === selectedSortBy.value)
  if (!sortOption) return ''
  
  switch (selectedSortBy.value) {
    case 'placement':
      return order === 'asc' ? 'エリア・ブロック順' : '逆順'
    case 'circleName':
      return order === 'asc' ? 'あ→ん順' : 'ん→あ順'
    case 'updatedAt':
      return order === 'asc' ? '古い→新しい' : '新しい→古い'
    case 'bookmarkCount':
      return order === 'asc' ? '少ない→多い' : '多い→少ない'
    default:
      return order === 'asc' ? '昇順' : '降順'
  }
}

const getCurrentSortDescription = () => {
  const sortOption = sortOptions.value.find(opt => opt.value === selectedSortBy.value)
  const orderDesc = getOrderDescription(selectedSortOrder.value)
  return `${sortOption?.label}（${orderDesc}）`
}

const applySort = () => {
  const sortConfig = {
    sortBy: selectedSortBy.value,
    sortOrder: selectedSortOrder.value
  }
  
  emit('update:modelValue', sortConfig)
  emit('apply', sortConfig)
}

const resetSort = () => {
  selectedSortBy.value = 'placement'
  selectedSortOrder.value = 'asc'
  
  const sortConfig = {
    sortBy: 'placement',
    sortOrder: 'asc'
  }
  
  emit('update:modelValue', sortConfig)
  emit('apply', sortConfig)
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  selectedSortBy.value = newValue.sortBy || 'placement'
  selectedSortOrder.value = newValue.sortOrder || 'asc'
}, { deep: true })

// Auto-apply when selection changes
watch([selectedSortBy, selectedSortOrder], () => {
  // 自動適用はしない（ユーザーが明示的にボタンを押すまで待つ）
})
</script>

<style scoped>
.sort-panel {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.sort-group {
  min-width: 0;
}

input[type="radio"] {
  accent-color: #ff69b4;
}
</style>