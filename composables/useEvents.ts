import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore'
import type { Event, EventStats, EventHistory } from '~/types'

export const useEvents = () => {
  const { $firestore } = useNuxtApp() as any

  // State
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Methods
  const fetchEvents = async () => {
    loading.value = true
    error.value = null
    
    try {
      const eventsRef = collection($firestore, 'events')
      const q = query(eventsRef, orderBy('eventDate', 'desc'))
      const snapshot = await getDocs(q)
      
      const eventList: Event[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        eventList.push({
          id: doc.id,
          name: data.name,
          shortName: data.shortName,
          eventDate: data.eventDate?.toDate() || new Date(),
          venue: data.venue || {},
          description: data.description,
          status: data.status || 'upcoming',
          registrationPeriod: {
            start: data.registrationPeriod?.start?.toDate() || new Date(),
            end: data.registrationPeriod?.end?.toDate() || new Date()
          },
          isDefault: data.isDefault || false,
          mapData: data.mapData,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        })
      })
      
      events.value = eventList
      
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
      const eventsRef = collection($firestore, 'events')
      
      // Firestoreに保存するデータを準備
      const firestoreData = {
        name: eventData.name,
        shortName: eventData.shortName,
        eventDate: eventData.eventDate,
        venue: eventData.venue,
        description: eventData.description,
        status: eventData.status,
        registrationPeriod: eventData.registrationPeriod,
        isDefault: eventData.isDefault,
        mapData: eventData.mapData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(eventsRef, firestoreData)
      
      const newEvent: Event = {
        ...eventData,
        id: docRef.id,
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
      const eventRef = doc($firestore, 'events', eventId)
      
      // Firestoreに保存するデータを準備（undefinedを除外）
      const firestoreUpdates: any = {
        updatedAt: serverTimestamp()
      }
      
      if (updates.name !== undefined) firestoreUpdates.name = updates.name
      if (updates.shortName !== undefined) firestoreUpdates.shortName = updates.shortName
      if (updates.eventDate !== undefined) firestoreUpdates.eventDate = updates.eventDate
      if (updates.venue !== undefined) firestoreUpdates.venue = updates.venue
      if (updates.description !== undefined) firestoreUpdates.description = updates.description
      if (updates.status !== undefined) firestoreUpdates.status = updates.status
      if (updates.registrationPeriod !== undefined) firestoreUpdates.registrationPeriod = updates.registrationPeriod
      if (updates.isDefault !== undefined) firestoreUpdates.isDefault = updates.isDefault
      if (updates.mapData !== undefined) firestoreUpdates.mapData = updates.mapData
      
      await updateDoc(eventRef, firestoreUpdates)
      
      // ローカル状態を更新
      const eventIndex = events.value.findIndex(event => event.id === eventId)
      if (eventIndex !== -1) {
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
      }
      
      throw new Error('イベントが見つかりません')
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
      const eventRef = doc($firestore, 'events', eventId)
      await deleteDoc(eventRef)
      
      // ローカル状態を更新
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
      // eventStatsコレクションから統計情報を取得
      const statsRef = doc($firestore, 'eventStats', eventId)
      const statsDoc = await getDoc(statsRef)
      
      if (statsDoc.exists()) {
        const data = statsDoc.data()
        return {
          eventId,
          totalCircles: data.totalCircles || 0,
          totalUsers: data.totalUsers || 0,
          totalBookmarks: data.totalBookmarks || 0,
          bookmarksByCategory: data.bookmarksByCategory || {
            check: 0,
            interested: 0,
            priority: 0
          },
          updatedAt: data.updatedAt?.toDate() || new Date()
        }
      }
      
      // 統計情報が存在しない場合は動的に計算
      return await calculateEventStats(eventId)
    } catch (err) {
      console.error('Error fetching event stats:', err)
      return null
    }
  }

  const calculateEventStats = async (eventId: string): Promise<EventStats> => {
    try {
      // サークル数を取得
      const circlesRef = collection($firestore, 'circles')
      const circlesQuery = query(circlesRef, where('eventId', '==', eventId))
      const circlesSnapshot = await getDocs(circlesQuery)
      const totalCircles = circlesSnapshot.size

      // ブックマーク数を取得
      const bookmarksRef = collection($firestore, 'bookmarks')
      const bookmarksQuery = query(bookmarksRef, where('eventId', '==', eventId))
      const bookmarksSnapshot = await getDocs(bookmarksQuery)

      // カテゴリ別ブックマーク数を計算
      const bookmarksByCategory = {
        check: 0,
        interested: 0,
        priority: 0
      }

      const userIds = new Set<string>()
      bookmarksSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.category && bookmarksByCategory.hasOwnProperty(data.category)) {
          bookmarksByCategory[data.category as keyof typeof bookmarksByCategory]++
        }
        if (data.userId) {
          userIds.add(data.userId)
        }
      })

      const stats: EventStats = {
        eventId,
        totalCircles,
        totalUsers: userIds.size,
        totalBookmarks: bookmarksSnapshot.size,
        bookmarksByCategory,
        updatedAt: new Date()
      }

      // 統計情報をFirestoreに保存
      const statsRef = doc($firestore, 'eventStats', eventId)
      await updateDoc(statsRef, {
        ...stats,
        updatedAt: serverTimestamp()
      }).catch(async () => {
        // ドキュメントが存在しない場合は作成
        await addDoc(collection($firestore, 'eventStats'), {
          ...stats,
          updatedAt: serverTimestamp()
        })
      })

      return stats
    } catch (err) {
      console.error('Error calculating event stats:', err)
      throw err
    }
  }

  const getUserEventHistory = async (userId: string): Promise<EventHistory[]> => {
    try {
      const historyRef = collection($firestore, 'eventHistory')
      const q = query(
        historyRef,
        where('userId', '==', userId),
        orderBy('participatedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      
      const history: EventHistory[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        history.push({
          userId: data.userId,
          eventId: data.eventId,
          participatedAt: data.participatedAt?.toDate() || new Date(),
          bookmarkCount: data.bookmarkCount || 0,
          lastActivity: data.lastActivity?.toDate() || new Date()
        })
      })
      
      return history
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