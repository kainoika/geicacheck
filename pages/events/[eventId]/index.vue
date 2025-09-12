<template>
  <div class="min-h-screen bg-gray-50">
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
    <div v-else-if="error || !event" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              イベントが見つかりません
            </h3>
            <div class="mt-2 text-sm text-red-700">
              指定されたイベントは存在しないか、削除された可能性があります。
            </div>
            <div class="mt-4">
              <NuxtLink to="/events" class="text-red-600 hover:text-red-500 font-medium">
                ← イベント一覧に戻る
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- イベント詳細 -->
    <div v-else>
      <!-- ヘッダー -->
      <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex items-center justify-between">
            <div>
              <nav class="flex" aria-label="Breadcrumb">
                <ol class="flex items-center space-x-4">
                  <li>
                    <NuxtLink to="/events" class="text-gray-400 hover:text-gray-500">
                      イベント一覧
                    </NuxtLink>
                  </li>
                  <li>
                    <div class="flex items-center">
                      <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <span class="ml-4 text-sm font-medium text-gray-500">{{ event.shortName }}</span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div class="mt-4 flex items-center space-x-4">
                <h1 class="text-3xl font-bold text-gray-900">
                  {{ event.name }}
                </h1>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="statusBadgeClass">
                  {{ statusText }}
                </span>
              </div>
            </div>

            <div class="flex space-x-3">
              <button v-if="!isCurrent" @click="selectEvent"
                class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                このイベントを選択
              </button>
              <span v-else class="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-800 rounded-md font-medium">
                <StarIcon class="h-4 w-4 mr-2" />
                選択中
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- メインコンテンツ -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 左カラム: イベント詳細 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 基本情報 -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
              <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">開催日</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatEventDate(event.eventDate) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">会場</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ event.venue.name }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">住所</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ event.venue.address }}</dd>
                </div>
                <div v-if="event.venue.accessInfo">
                  <dt class="text-sm font-medium text-gray-500">アクセス</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ event.venue.accessInfo }}</dd>
                </div>
              </dl>
            </div>

            <!-- 説明 -->
            <div v-if="event.description" class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">イベント概要</h2>
              <p class="text-gray-700 whitespace-pre-wrap">{{ event.description }}</p>
            </div>

            <!-- クイックアクション -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NuxtLink :to="`/circles`"
                  class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <BookOpenIcon class="h-5 w-5 mr-2 text-gray-400" />
                  <span class="text-sm font-medium">サークル一覧</span>
                </NuxtLink>
                <NuxtLink :to="`/map`"
                  class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <MapIcon class="h-5 w-5 mr-2 text-gray-400" />
                  <span class="text-sm font-medium">マップ</span>
                </NuxtLink>
                <NuxtLink :to="`/bookmarks`"
                  class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <StarIcon class="h-5 w-5 mr-2 text-gray-400" />
                  <span class="text-sm font-medium">ブックマーク</span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- 他のイベント -->
            <div v-if="otherEvents.length > 0" class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">他のイベント</h2>
              <div class="space-y-3">
                <NuxtLink v-for="otherEvent in otherEvents" :key="otherEvent.id" :to="`/events/${otherEvent.id}`"
                  class="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ otherEvent.shortName }}</div>
                      <div class="text-xs text-gray-500">{{ formatDate(otherEvent.eventDate) }}</div>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full" :class="getStatusBadgeClass(otherEvent.status)">
                      {{ getStatusText(otherEvent.status) }}
                    </span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronRightIcon,
  StarIcon,
  BookOpenIcon,
  MapIcon
} from '@heroicons/vue/24/outline'
import type { Event, EventStats } from '~/types'

// ルートパラメータ
const route = useRoute()
const eventId = route.params.eventId as string

// メタデータ設定
definePageMeta({
  title: 'イベント詳細 - geica check!'
})

// イベント管理
const {
  events,
  currentEvent,
  getEventById,
  setCurrentEvent,
  fetchEvents,
  getEventStats,
  loading,
  error
} = useEvents()

// State
const stats = ref<EventStats | null>(null)

// Computed
const event = computed(() => getEventById(eventId))
const isCurrent = computed(() => currentEvent.value?.id === eventId)

const otherEvents = computed(() => {
  return events.value
    .filter(e => e.id !== eventId)
    .slice(0, 5) // 最大5件表示
})

const statusBadgeClass = computed(() => {
  if (!event.value) return ''
  return getStatusBadgeClass(event.value.status)
})

const statusText = computed(() => {
  if (!event.value) return ''
  return getStatusText(event.value.status)
})

// Methods
const selectEvent = () => {
  setCurrentEvent(eventId)
}

const formatEventDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(date)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
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

// 初期化
onMounted(async () => {
  // イベントデータがない場合は取得
  if (events.value.length === 0) {
    await fetchEvents()
  }

  // 統計情報を取得
  if (event.value) {
    stats.value = await getEventStats(eventId)
  }
})

// イベントが見つからない場合は404ページに遷移
watch(event, (newEvent) => {
  if (!newEvent && !loading.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'イベントが見つかりません'
    })
  }
})
</script>