<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- ページヘッダー -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          イベント一覧
        </h1>
        <p class="text-gray-600">
          芸能人はカードが命！（芸カ）の開催履歴とスケジュール
        </p>
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
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              エラーが発生しました
            </h3>
            <div class="mt-2 text-sm text-red-700">
              {{ error }}
            </div>
          </div>
        </div>
      </div>

      <!-- イベント一覧 -->
      <div v-else class="space-y-8">
        <!-- アクティブイベント -->
        <section v-if="activeEvents.length > 0">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            開催中のイベント
          </h2>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <EventCard 
              v-for="event in activeEvents" 
              :key="event.id" 
              :event="event" 
              :is-current="currentEvent?.id === event.id"
              @select="selectEvent"
            />
          </div>
        </section>

        <!-- 今後のイベント -->
        <section v-if="upcomingEvents.length > 0">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            今後のイベント
          </h2>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <EventCard 
              v-for="event in upcomingEvents" 
              :key="event.id" 
              :event="event" 
              :is-current="currentEvent?.id === event.id"
              @select="selectEvent"
            />
          </div>
        </section>

        <!-- 過去のイベント -->
        <section v-if="completedEvents.length > 0">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div class="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            過去のイベント
          </h2>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <EventCard 
              v-for="event in completedEvents" 
              :key="event.id" 
              :event="event" 
              :is-current="currentEvent?.id === event.id"
              @select="selectEvent"
            />
          </div>
        </section>

        <!-- イベントが存在しない場合 -->
        <div v-if="events.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">イベントがありません</h3>
          <p class="mt-1 text-sm text-gray-500">
            まだイベントが登録されていません。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types'

// メタデータ設定
definePageMeta({
  title: 'イベント一覧 - geica check!'
})

// イベント管理
const { 
  events,
  currentEvent, 
  activeEvents, 
  completedEvents, 
  upcomingEvents, 
  setCurrentEvent, 
  fetchEvents,
  loading,
  error
} = useEvents()

// メソッド
const selectEvent = (eventId: string) => {
  setCurrentEvent(eventId)
  // 選択したイベントのページに遷移
  navigateTo(`/events/${eventId}`)
}

// 初期化
onMounted(async () => {
  if (events.value.length === 0) {
    await fetchEvents()
  }
})
</script>