<template>
  <div
    class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
    :class="{ 'ring-2 ring-pink-500': isCurrent }">
    <!-- イベント状態バッジ -->
    <div class="px-4 pt-4">
      <div class="flex justify-between items-start mb-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusBadgeClass">
          {{ statusText }}
        </span>
        <div v-if="isCurrent" class="flex items-center text-pink-600">
          <StarIcon class="h-4 w-4 mr-1" />
          <span class="text-xs font-medium">選択中</span>
        </div>
      </div>
    </div>

    <!-- イベント情報 -->
    <div class="px-4 pb-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        {{ event.name }}
      </h3>

      <div class="space-y-2 text-sm text-gray-600 mb-4">
        <!-- 開催日 -->
        <div class="flex items-center">
          <CalendarIcon class="h-4 w-4 mr-2 text-gray-400" />
          <span>{{ formatEventDate(event.eventDate) }}</span>
        </div>

        <!-- 会場 -->
        <div class="flex items-center">
          <MapPinIcon class="h-4 w-4 mr-2 text-gray-400" />
          <span>{{ event.venue.name }}</span>
        </div>

      </div>

      <!-- 説明 -->
      <p v-if="event.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
        {{ event.description }}
      </p>

      <!-- アクションボタン -->
      <div class="flex space-x-2">
        <button @click="$emit('select', event.id)"
          class="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :disabled="isCurrent">
          {{ isCurrent ? '選択中' : 'このイベントを選択' }}
        </button>

        <NuxtLink :to="`/events/${event.id}`"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          詳細
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, MapPinIcon, ClockIcon, StarIcon } from '@heroicons/vue/24/outline'
import type { Event, EventStats } from '~/types'

// Props
interface Props {
  event: Event
  isCurrent?: boolean
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCurrent: false,
  showStats: false
})

// Emits
defineEmits<{
  select: [eventId: string]
}>()

// 統計情報（オプション）
const stats = ref<EventStats | null>(null)

// Computed
const statusBadgeClass = computed(() => {
  switch (props.event.status) {
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
})

const statusText = computed(() => {
  switch (props.event.status) {
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

const formatDateRange = (period: { start: Date; end: Date }) => {
  const startDate = new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  }).format(period.start)
  const endDate = new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  }).format(period.end)

  eturn`${startDate} - ${endDate}`
}

// 統計情報を取得（showStatsがtrueの場合）
onMounted(async () => {
  if (props.showStats) {
    const { getEventStats } = useEvents()
    stats.value = await getEventStats(props.event.id)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>