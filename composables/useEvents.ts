import type { Event, EventStats, EventHistory } from '~/types'

export const useEvents = () => {
  // State
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // サンプルイベントデータ
  const sampleEvents: Event[] = [
    {
      id: 'geika-1',
      name: '第1回 芸能人はカードが命！',
      shortName: '芸カ1',
      eventDate: new Date('2025-06-15'),
      venue: {
        name: '東京ビッグサイト',
        address: '東京都江東区有明3-11-1',
        accessInfo: 'ゆりかもめ「国際展示場正門駅」徒歩3分'
      },
      description: 'アイカツ！シリーズオンリー同人イベント第1回',
      status: 'completed',
      registrationPeriod: {
        start: new Date('2025-04-01'),
        end: new Date('2025-05-15')
      },
      isDefault: false,
      mapData: '<svg>...</svg>', // 実際のSVGデータ
      createdAt: new Date('2025-03-01'),
      updatedAt: new Date('2025-06-15')
    },
    {
      id: 'geika-2',
      name: '第2回 芸能人はカードが命！',
      shortName: '芸カ2',
      eventDate: new Date('2025-12-15'),
      venue: {
        name: '東京ビッグサイト',
        address: '東京都江東区有明3-11-1',
        accessInfo: 'ゆりかもめ「国際展示場正門駅」徒歩3分'
      },
      description: 'アイカツ！シリーズオンリー同人イベント第2回',
      status: 'active',
      registrationPeriod: {
        start: new Date('2025-10-01'),
        end: new Date('2025-11-15')
      },
      isDefault: true,
      mapData: '<svg>...</svg>', // 実際のSVGデータ
      createdAt: new Date('2025-09-01'),
      updatedAt: new Date('2025-12-01')
    },
    {
      id: 'geika-3',
      name: '第3回 芸能人はカードが命！',
      shortName: '芸カ3',
      eventDate: new Date('2026-06-15'),
      venue: {
        name: '東京ビッグサイト',
        address: '東京都江東区有明3-11-1',
        accessInfo: 'ゆりかもめ「国際展示場正門駅」徒歩3分'
      },
      description: 'アイカツ！シリーズオンリー同人イベント第3回',
      status: 'upcoming',
      registrationPeriod: {
        start: new Date('2026-04-01'),
        end: new Date('2026-05-15')
      },
      isDefault: false,
      mapData: '<svg>...</svg>', // 実際のSVGデータ
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-01')
    }
  ]

  // Methods
  const fetchEvents = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 実際の実装ではFirestoreから取得
      await new Promise(resolve => setTimeout(resolve, 500)) // シミュレート
      events.value = sampleEvents
      
      // デフォルトイベントを設定
      const defaultEvent = events.value.find(event => event.isDefault)
      if (defaultEvent) {
        currentEvent.value = defaultEvent
      } else if (events.value.length > 0) {
        currentEvent.value = events.value[0]
      }
    } catch (err) {
      error.value = 'イベント情報の取得に失敗しました'
      console.error('Error fetching events:', err)
    } finally {
      loading.value = false
    }
  }

  const getEventById = (eventId: string): Event | undefined => {
    return events.value.find(event => event.id === eventId)
  }

  const setCurrentEvent = (eventId: string) => {
    const event = getEventById(eventId)
    if (event) {
      currentEvent.value = event
      // ローカルストレージに保存
      if (process.client) {
        localStorage.setItem('selectedEventId', eventId)
      }
    }
  }

  const getActiveEvents = computed(() => {
    return events.value.filter(event => event.status === 'active')
  })

  const getCompletedEvents = computed(() => {
    return events.value.filter(event => event.status === 'completed')
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())
  })

  const getUpcomingEvents = computed(() => {
    return events.value.filter(event => event.status === 'upcoming')
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
  })

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      // 実際の実装ではFirestoreに保存
      const newEvent: Event = {
        ...eventData,
        id: `geika-${Date.now()}`, // 実際はFirestoreが生成
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      events.value.push(newEvent)
      return newEvent
    } catch (err) {
      error.value = 'イベントの作成に失敗しました'
      console.error('Error creating event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    loading.value = true
    error.value = null

    try {
      const eventIndex = events.value.findIndex(event => event.id === eventId)
      if (eventIndex === -1) {
        throw new Error('イベントが見つかりません')
      }

      // 実際の実装ではFirestoreを更新
      events.value[eventIndex] = {
        ...events.value[eventIndex],
        ...updates,
        updatedAt: new Date()
      }

      // 現在のイベントも更新
      if (currentEvent.value?.id === eventId) {
        currentEvent.value = events.value[eventIndex]
      }

      return events.value[eventIndex]
    } catch (err) {
      error.value = 'イベントの更新に失敗しました'
      console.error('Error updating event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEvent = async (eventId: string) => {
    loading.value = true
    error.value = null

    try {
      // 実際の実装ではFirestoreから削除
      events.value = events.value.filter(event => event.id !== eventId)
      
      // 削除されたイベントが現在のイベントの場合、別のイベントを選択
      if (currentEvent.value?.id === eventId) {
        const activeEvent = getActiveEvents.value[0]
        currentEvent.value = activeEvent || events.value[0] || null
      }
    } catch (err) {
      error.value = 'イベントの削除に失敗しました'
      console.error('Error deleting event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEventStats = async (eventId: string): Promise<EventStats | null> => {
    try {
      // 実際の実装ではFirestoreから統計情報を取得
      // サンプルデータを返す
      return {
        eventId,
        totalCircles: 150,
        totalUsers: 1200,
        totalBookmarks: 3500,
        bookmarksByCategory: {
          check: 1500,
          interested: 1200,
          priority: 800
        },
        updatedAt: new Date()
      }
    } catch (err) {
      console.error('Error fetching event stats:', err)
      return null
    }
  }

  const getUserEventHistory = async (userId: string): Promise<EventHistory[]> => {
    try {
      // 実際の実装ではFirestoreからユーザーの参加履歴を取得
      // サンプルデータを返す
      return [
        {
          userId,
          eventId: 'geika-1',
          participatedAt: new Date('2025-06-15'),
          bookmarkCount: 25,
          lastActivity: new Date('2025-06-15')
        }
      ]
    } catch (err) {
      console.error('Error fetching user event history:', err)
      return []
    }
  }

  // 初期化時にローカルストレージから選択されたイベントを復元
  onMounted(() => {
    if (process.client) {
      const savedEventId = localStorage.getItem('selectedEventId')
      if (savedEventId && events.value.length > 0) {
        const savedEvent = getEventById(savedEventId)
        if (savedEvent) {
          currentEvent.value = savedEvent
        }
      }
    }
  })

  return {
    // State
    events: readonly(events),
    currentEvent: readonly(currentEvent),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    activeEvents: getActiveEvents,
    completedEvents: getCompletedEvents,
    upcomingEvents: getUpcomingEvents,

    // Methods
    fetchEvents,
    getEventById,
    setCurrentEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventStats,
    getUserEventHistory
  }
}