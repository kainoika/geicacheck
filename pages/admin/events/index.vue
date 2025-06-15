<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- ページヘッダー -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              イベント管理
            </h1>
            <p class="text-gray-600">
              芸カイベントの作成・編集・統計管理
            </p>
          </div>
          <NuxtLink to="/admin/events/create"
                    class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center">
            <PlusIcon class="h-5 w-5 mr-2" />
            新規イベント作成
          </NuxtLink>
        </div>
      </div>

      <!-- 統計サマリー -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CalendarIcon class="h-8 w-8 text-blue-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">総イベント数</p>
              <p class="text-2xl font-semibold text-gray-900">{{ events.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div class="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">開催中</p>
              <p class="text-2xl font-semibold text-gray-900">{{ activeEvents.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div class="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">開催予定</p>
              <p class="text-2xl font-semibold text-gray-900">{{ upcomingEvents.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <div class="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">終了</p>
              <p class="text-2xl font-semibold text-gray-900">{{ completedEvents.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ローディング状態 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span class="ml-3 text-gray-600">イベント情報を読み込み中...</span>
      </div>

      <!-- エラー状態 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <XCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">エラーが発生しました</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- イベント一覧テーブル -->
      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">イベント一覧</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  イベント
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  開催日
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  統計
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  デフォルト
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="event in sortedEvents" :key="event.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ event.name }}</div>
                    <div class="text-sm text-gray-500">{{ event.shortName }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatEventDate(event.eventDate) }}</div>
                  <div class="text-sm text-gray-500">{{ event.venue.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusBadgeClass(event.status)">
                    {{ getStatusText(event.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="eventStats[event.id]" class="text-sm text-gray-900">
                    <div>サークル: {{ eventStats[event.id].totalCircles }}</div>
                    <div>参加者: {{ eventStats[event.id].totalUsers }}</div>
                  </div>
                  <div v-else class="text-sm text-gray-500">読み込み中...</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button @click="toggleDefault(event.id)"
                          class="flex items-center"
                          :disabled="updatingDefault">
                    <input type="radio" 
                           :checked="event.isDefault"
                           :disabled="updatingDefault"
                           class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300">
                    <span class="ml-2 text-sm text-gray-700">
                      {{ event.isDefault ? 'デフォルト' : '' }}
                    </span>
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <NuxtLink :to="`/events/${event.id}`"
                              class="text-pink-600 hover:text-pink-900">
                      詳細
                    </NuxtLink>
                    <NuxtLink :to="`/admin/events/${event.id}/edit`"
                              class="text-blue-600 hover:text-blue-900">
                      編集
                    </NuxtLink>
                    <button @click="changeStatus(event)"
                            class="text-green-600 hover:text-green-900"
                            :disabled="updatingStatus">
                      状態変更
                    </button>
                    <button @click="confirmDelete(event)"
                            class="text-red-600 hover:text-red-900"
                            :disabled="deleting">
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- イベントが存在しない場合 -->
        <div v-if="events.length === 0" class="text-center py-12">
          <CalendarIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">イベントがありません</h3>
          <p class="mt-1 text-sm text-gray-500">
            最初のイベントを作成してください。
          </p>
          <div class="mt-6">
            <NuxtLink to="/admin/events/create"
                      class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700">
              <PlusIcon class="h-5 w-5 mr-2" />
              新規イベント作成
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 状態変更モーダル -->
    <TransitionRoot as="template" :show="showStatusModal">
      <Dialog as="div" class="relative z-10" @close="showStatusModal = false">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <ArrowPathIcon class="h-6 w-6 text-green-600" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      イベント状態を変更
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        {{ selectedEvent?.name }} の状態を変更してください。
                      </p>
                    </div>
                    <div class="mt-4">
                      <select v-model="newStatus" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                        <option value="upcoming">開催予定</option>
                        <option value="active">開催中</option>
                        <option value="completed">終了</option>
                        <option value="cancelled">中止</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button type="button" @click="updateStatus" :disabled="updatingStatus"
                          class="inline-flex w-full justify-center rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 sm:col-start-2 disabled:opacity-50">
                    {{ updatingStatus ? '更新中...' : '更新' }}
                  </button>
                  <button type="button" @click="showStatusModal = false"
                          class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">
                    キャンセル
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- 削除確認モーダル -->
    <TransitionRoot as="template" :show="showDeleteModal">
      <Dialog as="div" class="relative z-10" @close="showDeleteModal = false">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div class="sm:flex sm:items-start">
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
                  </div>
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      イベントを削除
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        本当に「{{ selectedEvent?.name }}」を削除しますか？この操作は取り消せません。
                        関連するサークルやブックマークデータも削除される可能性があります。
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button type="button" @click="deleteEvent" :disabled="deleting"
                          class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50">
                    {{ deleting ? '削除中...' : '削除' }}
                  </button>
                  <button type="button" @click="showDeleteModal = false"
                          class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
                    キャンセル
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { 
  CalendarIcon, 
  PlusIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { 
  Dialog, 
  DialogPanel, 
  DialogTitle, 
  TransitionChild, 
  TransitionRoot 
} from '@headlessui/vue'

import type { Event, EventStats } from '~/types'

// ミドルウェアで管理者権限をチェック
definePageMeta({
  title: 'イベント管理 - geica check!',
  middleware: 'admin'
})

// イベント管理
const { 
  events,
  activeEvents,
  completedEvents,
  upcomingEvents,
  fetchEvents,
  updateEvent,
  deleteEvent: deleteEventFromStore,
  getEventStats,
  loading,
  error
} = useEvents()

// State
const eventStats = ref<Record<string, EventStats>>({})
const updatingDefault = ref(false)
const updatingStatus = ref(false)
const deleting = ref(false)
const showStatusModal = ref(false)
const showDeleteModal = ref(false)
const selectedEvent = ref<Event | null>(null)
const newStatus = ref<string>('')

// Computed
const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    // デフォルトイベントを最初に
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    
    // 状態順（active > upcoming > completed > cancelled）
    const statusOrder = { active: 0, upcoming: 1, completed: 2, cancelled: 3 }
    const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 4
    const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 4
    
    if (aOrder !== bOrder) return aOrder - bOrder
    
    // 開催日順（新しい順）
    return b.eventDate.getTime() - a.eventDate.getTime()
  })
})

// Methods
const formatEventDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'upcoming':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '開催中'
    case 'upcoming':
      return '開催予定'
    case 'completed':
      return '終了'
    case 'cancelled':
      return '中止'
    default:
      return '不明'
  }
}

const toggleDefault = async (eventId: string) => {
  if (updatingDefault.value) return
  
  updatingDefault.value = true
  try {
    // 他のイベントのデフォルトを解除
    for (const event of events.value) {
      if (event.isDefault && event.id !== eventId) {
        await updateEvent(event.id, { isDefault: false })
      }
    }
    
    // 選択されたイベントをデフォルトに設定
    await updateEvent(eventId, { isDefault: true })
    
  } catch (error) {
    console.error('デフォルト設定エラー:', error)
    // エラー通知を表示
  } finally {
    updatingDefault.value = false
  }
}

const changeStatus = (event: Event) => {
  selectedEvent.value = event
  newStatus.value = event.status
  showStatusModal.value = true
}

const updateStatus = async () => {
  if (!selectedEvent.value || updatingStatus.value) return
  
  updatingStatus.value = true
  try {
    await updateEvent(selectedEvent.value.id, { status: newStatus.value as any })
    showStatusModal.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error('状態更新エラー:', error)
    // エラー通知を表示
  } finally {
    updatingStatus.value = false
  }
}

const confirmDelete = (event: Event) => {
  selectedEvent.value = event
  showDeleteModal.value = true
}

const deleteEvent = async () => {
  if (!selectedEvent.value || deleting.value) return
  
  deleting.value = true
  try {
    await deleteEventFromStore(selectedEvent.value.id)
    showDeleteModal.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error('削除エラー:', error)
    // エラー通知を表示
  } finally {
    deleting.value = false
  }
}

// 統計情報を取得
const loadEventStats = async () => {
  for (const event of events.value) {
    try {
      const stats = await getEventStats(event.id)
      if (stats) {
        eventStats.value[event.id] = stats
      }
    } catch (error) {
      console.error(`統計情報取得エラー (${event.id}):`, error)
    }
  }
}

// 初期化
onMounted(async () => {
  if (events.value.length === 0) {
    await fetchEvents()
  }
  await loadEventStats()
})
</script>