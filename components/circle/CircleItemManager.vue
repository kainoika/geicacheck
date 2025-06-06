<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">頒布物一覧</h3>
      <button
        v-if="canEdit"
        @click="showAddForm = true"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon class="h-4 w-4 mr-1" />
        頒布物を追加
      </button>
    </div>

    <!-- 頒布物一覧 -->
    <div v-if="items.length > 0" class="space-y-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <div class="flex items-start">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
            <p class="text-sm text-gray-600 mt-1">{{ formatPrice(item.price) }}</p>
            <p v-if="item.description" class="text-sm text-gray-500 mt-2 line-clamp-2">
              {{ item.description }}
            </p>
            <div class="flex items-center mt-2 space-x-4">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  item.isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ item.isAvailable ? '頒布予定' : '完売・頒布終了' }}
              </span>
            </div>
          </div>
          
          <div v-if="canEdit" class="flex items-center space-x-2 ml-4">
            <button
              @click="editItem(item)"
              class="p-1 text-gray-400 hover:text-gray-600"
              title="編集"
            >
              <PencilIcon class="h-4 w-4" />
            </button>
            <button
              @click="deleteItem(item.id)"
              class="p-1 text-gray-400 hover:text-red-600"
              title="削除"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 頒布物なしの表示 -->
    <div v-else class="text-center py-8 text-gray-500">
      <ShoppingBagIcon class="mx-auto h-12 w-12 text-gray-300" />
      <p class="mt-2 text-sm">頒布物が登録されていません</p>
      <p v-if="canEdit" class="mt-1 text-xs">
        「頒布物を追加」ボタンから登録してください
      </p>
    </div>

    <!-- 頒布物追加/編集フォーム -->
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
            {{ editingItem ? '頒布物を編集' : '頒布物を追加' }}
          </h3>
          
          <form @submit.prevent="saveItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                頒布物名 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="例: イラスト集、アクリルキーホルダー"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                価格 <span class="text-red-500">*</span>
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input
                  v-model.number="formData.price"
                  type="number"
                  min="0"
                  required
                  class="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="500"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">円</span>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                説明
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="頒布物の詳細説明"
              ></textarea>
            </div>
            
            
            <div class="flex items-center">
              <input
                id="is-available"
                v-model="formData.isAvailable"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="is-available" class="ml-2 block text-sm text-gray-900">
                頒布予定
              </label>
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
                :disabled="saving || !formData.name.trim()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ saving ? '保存中...' : editingItem ? '更新' : '追加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'
import type { CircleItem, CircleItemFormData } from '~/types'

interface Props {
  items: CircleItem[]
  canEdit: boolean
  circleId: string
  eventId: string
}

interface Emits {
  (e: 'add-item', item: CircleItemFormData): void
  (e: 'update-item', id: string, item: CircleItemFormData): void
  (e: 'delete-item', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showAddForm = ref(false)
const editingItem = ref<CircleItem | null>(null)
const saving = ref(false)

const formData = reactive<CircleItemFormData>({
  name: '',
  price: 0,
  description: '',
  isAvailable: true
})

const formatPrice = (price: number): string => {
  return price === 0 ? '無料' : `${price.toLocaleString()}円`
}

const resetForm = () => {
  formData.name = ''
  formData.price = 0
  formData.description = ''
  formData.isAvailable = true
  editingItem.value = null
}

const closeForm = () => {
  showAddForm.value = false
  resetForm()
}

const editItem = (item: CircleItem) => {
  editingItem.value = item
  formData.name = item.name
  formData.price = item.price
  formData.description = item.description || ''
  formData.isAvailable = item.isAvailable
  showAddForm.value = true
}

const saveItem = async () => {
  saving.value = true
  
  try {
    if (editingItem.value) {
      emit('update-item', editingItem.value.id, { ...formData })
    } else {
      emit('add-item', { ...formData })
    }
    closeForm()
  } finally {
    saving.value = false
  }
}

const deleteItem = (itemId: string) => {
  if (confirm('この頒布物を削除しますか？')) {
    emit('delete-item', itemId)
  }
}
</script>