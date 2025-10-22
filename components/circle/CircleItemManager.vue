<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2
        style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
        <ShoppingBagIcon class="h-5 w-5" />
        頒布物一覧
      </h2>
      <button v-if="canEdit" @click="showAddForm = true"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <PlusIcon class="h-4 w-4 mr-1" />
        頒布物を追加
      </button>
    </div>

    <!-- 頒布物一覧 -->
    <div v-if="items.length > 0" class="space-y-4">
      <div v-for="item in items" :key="item.id" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div class="flex items-start">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
              <!-- カテゴリバッジ -->
              <span v-if="item.category" :class="getCategoryBadgeClass(item.category)"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                {{ item.category }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ formatPrice(item.price) }}</p>
            <!-- 説明文表示（展開可能） -->
            <div v-if="item.description" class="mt-2">
              <p class="text-sm text-gray-500 whitespace-pre-wrap" :class="{
                'line-clamp-4': !expandedDescriptions.has(item.id),
                '': expandedDescriptions.has(item.id)
              }">
                {{ item.description }}
              </p>
              <!-- 100文字以上の場合のみ展開ボタンを表示 -->
              <button v-if="item.description.length > 60" @click="toggleDescriptionExpansion(item.id)"
                class="text-blue-600 hover:text-blue-800 text-xs mt-1 transition-colors">
                {{ expandedDescriptions.has(item.id) ? '閉じる' : 'もっと見る' }}
              </button>
            </div>
            <!-- オンライン通販リンク -->
            <div v-if="item.onlineShopLinks && Object.values(item.onlineShopLinks).some(link => link)"
              class="flex items-center gap-2 mt-3">
              <a v-if="item.onlineShopLinks.booth" :href="item.onlineShopLinks.booth" target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors">
                <ShoppingCartIcon class="h-3 w-3 mr-1" />
                BOOTH
              </a>
              <a v-if="item.onlineShopLinks.melonbooks" :href="item.onlineShopLinks.melonbooks" target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium hover:bg-green-100 transition-colors">
                <ShoppingCartIcon class="h-3 w-3 mr-1" />
                メロンブックス
              </a>
              <a v-if="item.onlineShopLinks.toranoana" :href="item.onlineShopLinks.toranoana" target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium hover:bg-purple-100 transition-colors">
                <ShoppingCartIcon class="h-3 w-3 mr-1" />
                とらのあな
              </a>
              <a v-if="item.onlineShopLinks.other" :href="item.onlineShopLinks.other" target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors">
                <ShoppingCartIcon class="h-3 w-3 mr-1" />
                その他
              </a>
            </div>

            <!-- 購入予定ボタン -->
            <div class="mt-3">
              <PurchasePlanButton :circle-id="circleId" :item-id="item.id" :price="item.price" :circle-name="circleName"
                :item-name="item.name" @updated="handlePurchasePlanUpdate" />
            </div>
          </div>

          <div v-if="canEdit" class="flex items-center space-x-2 ml-4">
            <button @click="editItem(item)" class="p-1 text-gray-400 hover:text-gray-600" title="編集">
              <PencilIcon class="h-4 w-4" />
            </button>
            <button @click="deleteItem(item.id)" class="p-1 text-gray-400 hover:text-red-600" title="削除">
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
    <div v-if="showAddForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeForm">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto"
        @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingItem ? '頒布物を編集' : '頒布物を追加' }}
          </h3>

          <form @submit.prevent="saveItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                頒布物名 <span class="text-red-500">*</span>
              </label>
              <input v-model="formData.name" type="text" required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="例: イラスト集、アクリルキーホルダー" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                価格 <span class="text-red-500">*</span>
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input v-model.number="formData.price" type="number" min="0" required
                  class="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="500" />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">円</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                カテゴリ
              </label>
              <input v-model="formData.category" type="text" list="category-suggestions"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="例: 漫画、イラスト本、グッズ" />
              <!-- カテゴリ候補リスト -->
              <datalist id="category-suggestions">
                <option value="漫画" />
                <option value="イラスト本" />
                <option value="グッズ" />
                <option value="アクリルキーホルダー" />
                <option value="ステッカー" />
                <option value="ポストカード" />
                <option value="クリアファイル" />
                <option value="缶バッジ" />
                <option value="その他" />
              </datalist>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                説明
              </label>
              <textarea v-model="formData.description" rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="頒布物の詳細説明"></textarea>
            </div>

            <!-- オンライン通販リンク -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                オンライン通販リンク
              </label>

              <div>
                <label class="block text-xs text-gray-600 mb-1">BOOTH</label>
                <input v-model="formData.onlineShopLinks.booth" type="url"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://..." />
              </div>

              <div>
                <label class="block text-xs text-gray-600 mb-1">メロンブックス</label>
                <input v-model="formData.onlineShopLinks.melonbooks" type="url"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://..." />
              </div>

              <div>
                <label class="block text-xs text-gray-600 mb-1">とらのあな</label>
                <input v-model="formData.onlineShopLinks.toranoana" type="url"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://..." />
              </div>

              <div>
                <label class="block text-xs text-gray-600 mb-1">その他</label>
                <input v-model="formData.onlineShopLinks.other" type="url"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://..." />
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="closeForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                キャンセル
              </button>
              <button type="submit" :disabled="saving || !formData.name.trim()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
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
  ShoppingBagIcon,
  ShoppingCartIcon
} from '@heroicons/vue/24/outline'
import type { CircleItem, CircleItemFormData, OnlineShopLinks } from '~/types'

interface Props {
  items: CircleItem[]
  canEdit: boolean
  circleId: string
  eventId: string
  circleName?: string
}

interface Emits {
  (e: 'add-item', item: CircleItemFormData): void
  (e: 'update-item', id: string, item: CircleItemFormData): void
  (e: 'delete-item', id: string): void
  (e: 'purchase-plan-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showAddForm = ref(false)
const editingItem = ref<CircleItem | null>(null)
const saving = ref(false)

// 説明文展開状態管理
const expandedDescriptions = ref<Set<string>>(new Set())

const formData = reactive<CircleItemFormData>({
  name: '',
  price: 0,
  description: '',
  category: '',
  isAvailable: true,
  onlineShopLinks: {
    booth: '',
    melonbooks: '',
    toranoana: '',
    other: ''
  }
})

const formatPrice = (price: number): string => {
  return price === 0 ? '無料' : `${price.toLocaleString()}円`
}

const resetForm = () => {
  formData.name = ''
  formData.price = 0
  formData.description = ''
  formData.category = ''
  formData.isAvailable = true
  formData.onlineShopLinks = {
    booth: '',
    melonbooks: '',
    toranoana: '',
    other: ''
  }
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
  formData.category = item.category || ''
  formData.isAvailable = item.isAvailable
  formData.onlineShopLinks = {
    booth: item.onlineShopLinks?.booth || '',
    melonbooks: item.onlineShopLinks?.melonbooks || '',
    toranoana: item.onlineShopLinks?.toranoana || '',
    other: item.onlineShopLinks?.other || ''
  }
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

const handlePurchasePlanUpdate = () => {
  emit('purchase-plan-updated')
}

// 説明文の展開/折りたたみを切り替える
const toggleDescriptionExpansion = (itemId: string) => {
  if (expandedDescriptions.value.has(itemId)) {
    expandedDescriptions.value.delete(itemId)
  } else {
    expandedDescriptions.value.add(itemId)
  }
}

// カテゴリバッジの色を決定する
const getCategoryBadgeClass = (category: string): string => {
  const categoryColors: Record<string, string> = {
    '漫画': 'bg-blue-100 text-blue-800',
    'イラスト本': 'bg-purple-100 text-purple-800',
    'グッズ': 'bg-green-100 text-green-800',
    'アクリルキーホルダー': 'bg-yellow-100 text-yellow-800',
    'ステッカー': 'bg-pink-100 text-pink-800',
    'ポストカード': 'bg-indigo-100 text-indigo-800',
    'クリアファイル': 'bg-cyan-100 text-cyan-800',
    '缶バッジ': 'bg-orange-100 text-orange-800',
  }

  return categoryColors[category] || 'bg-gray-100 text-gray-800'
}
</script>