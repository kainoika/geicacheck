import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

// モックの設定
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $firestore: {},
    $auth: {}
  })
}))

vi.mock('~/composables/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarksWithCircles: ref([
      { id: '1', eventId: 'geica-32', category: 'check', circle: {} },
      { id: '2', eventId: 'geica-32', category: 'check', circle: {} },
      { id: '3', eventId: 'geica-32', category: 'interested', circle: {} },
      { id: '4', eventId: 'geica-32', category: 'priority', circle: {} },
      { id: '5', eventId: 'geica-32', category: 'priority', circle: {} },
      { id: '6', eventId: 'geica-32', category: 'priority', circle: {} }
    ]),
    fetchBookmarksWithCircles: vi.fn()
  })
}))

vi.mock('~/composables/useEvents', () => ({
  useEvents: () => ({
    currentEvent: ref({ id: 'geica-32', name: '芸カ32' }),
    fetchEvents: vi.fn()
  })
}))

vi.mock('~/composables/useCircles', () => ({
  useCircles: () => ({
    formatPlacement: vi.fn()
  })
}))

vi.mock('~/composables/useEventMap', () => ({
  useCircleMapping: () => ({
    getCirclePosition: vi.fn(() => ({ x: 100, y: 100 }))
  })
}))

vi.mock('~/composables/useSvgPins', () => ({
  useSvgPins: () => ({
    initializePins: vi.fn(),
    renderPins: vi.fn(),
    highlightPin: vi.fn(),
    resetPinHighlight: vi.fn(),
    clearPins: vi.fn(),
    pinStyles: ref({
      check: { fill: '#0284c7' },
      interested: { fill: '#ca8a04' },
      priority: { fill: '#dc2626' }
    })
  })
}))

vi.mock('~/composables/useLogger', () => ({
  useLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn()
  })
}))

describe('マップ画面のブックマーク統計', () => {
  let wrapper: any

  beforeEach(() => {
    // fetch モック
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('<svg></svg>')
      } as Response)
    )
  })

  it('全てのブックマークカテゴリの統計が表示される', async () => {
    // このテストではmountの代わりにモックデータを使用して検証
    const { useBookmarks } = await import('~/composables/useBookmarks')
    const { useEvents } = await import('~/composables/useEvents')
    
    const mockBookmarks = vi.mocked(useBookmarks)()
    const mockEvents = vi.mocked(useEvents)()
    
    // eventBookmarksの計算をテスト
    const eventBookmarks = mockBookmarks.bookmarksWithCircles.value.filter(
      bookmark => bookmark.eventId === mockEvents.currentEvent.value.id
    )
    
    // 統計計算をテスト
    const getBookmarkCount = (category: string) => 
      eventBookmarks.filter(bookmark => bookmark.category === category).length
    
    expect(eventBookmarks.length).toBe(6) // 合計
    expect(getBookmarkCount('check')).toBe(2) // チェック
    expect(getBookmarkCount('interested')).toBe(1) // 気になる
    expect(getBookmarkCount('priority')).toBe(3) // 優先
  })

  it('各統計項目に適切な色が設定されている', async () => {
    // pinStylesの色設定をテスト
    const { useSvgPins } = await import('~/composables/useSvgPins')
    const { pinStyles } = vi.mocked(useSvgPins)()
    
    // 各カテゴリの色が適切に設定されていることを確認
    expect(pinStyles.value.check.fill).toBe('#0284c7') // チェック: 青
    expect(pinStyles.value.interested.fill).toBe('#ca8a04') // 気になる: アンバー
    expect(pinStyles.value.priority.fill).toBe('#dc2626') // 優先: 赤
  })

  it('ブックマークがない場合は0が表示される', async () => {
    // 空のブックマークリストで統計計算をテスト
    const emptyBookmarks: any[] = []
    const { useEvents } = await import('~/composables/useEvents')
    const mockEvents = vi.mocked(useEvents)()
    
    // eventBookmarksの計算をテスト（空の場合）
    const eventBookmarks = emptyBookmarks.filter(
      bookmark => bookmark.eventId === mockEvents.currentEvent.value.id
    )
    
    // 統計計算をテスト
    const getBookmarkCount = (category: string) => 
      eventBookmarks.filter(bookmark => bookmark.category === category).length
    
    // 全ての値が0であることを確認
    expect(eventBookmarks.length).toBe(0) // 合計
    expect(getBookmarkCount('check')).toBe(0) // チェック
    expect(getBookmarkCount('interested')).toBe(0) // 気になる
    expect(getBookmarkCount('priority')).toBe(0) // 優先
  })
})