import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'

// モックを設定
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $firestore: {}
  })
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn()
}))

// useState のモック
const mockUseState = vi.fn()
vi.mock('#imports', () => ({
  useState: mockUseState,
  computed: vi.fn((fn) => ({ value: fn() })),
  watch: vi.fn(),
  onUnmounted: vi.fn(),
  readonly: vi.fn((val) => val)
}))

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ uid: 'user123' }),
    isAuthenticated: ref(true)
  })
}))

vi.mock('~/composables/useEvents', () => ({
  useEvents: () => ({
    currentEvent: ref({ id: 'geika-32', name: '芸カ32' })
  })
}))

vi.mock('~/composables/useCircles', () => ({
  useCircles: () => ({
    fetchCirclesByIds: vi.fn(() => Promise.resolve([]))
  })
}))

describe('useBookmarks - イベント切り替え対応', () => {
  let mockStateStore: Record<string, any>

  beforeEach(() => {
    // useState のモック実装
    mockStateStore = {}
    mockUseState.mockImplementation((key: string, defaultValue: () => any) => {
      if (!mockStateStore[key]) {
        mockStateStore[key] = { value: defaultValue() }
      }
      return mockStateStore[key]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockStateStore = {}
  })

  it('イベント別に異なるuseStateキーを使用する', async () => {
    const { useBookmarks } = await import('~/composables/useBookmarks')
    
    // 芸カ32のコンテキストでuseBookmarksを呼び出し
    vi.mocked(useEvents).mockReturnValue({
      currentEvent: ref({ id: 'geika-32', name: '芸カ32' })
    })
    
    const bookmarks32 = useBookmarks()
    
    // useState が適切なキーで呼ばれることを確認
    expect(mockUseState).toHaveBeenCalledWith('bookmarks.list.geika-32', expect.any(Function))
    expect(mockUseState).toHaveBeenCalledWith('bookmarks.withCircles.geika-32', expect.any(Function))
    
    vi.clearAllMocks()
    
    // 芸カ31のコンテキストでuseBookmarksを呼び出し
    vi.mocked(useEvents).mockReturnValue({
      currentEvent: ref({ id: 'geika-31', name: '芸カ31' })
    })
    
    const bookmarks31 = useBookmarks()
    
    // 異なるキーで呼ばれることを確認
    expect(mockUseState).toHaveBeenCalledWith('bookmarks.list.geika-31', expect.any(Function))
    expect(mockUseState).toHaveBeenCalledWith('bookmarks.withCircles.geika-31', expect.any(Function))
  })

  it('clearOtherEventsData が他のイベントのデータをクリアする', async () => {
    const { useBookmarks } = await import('~/composables/useBookmarks')
    
    // 芸カ32のコンテキストで初期化
    vi.mocked(useEvents).mockReturnValue({
      currentEvent: ref({ id: 'geika-32', name: '芸カ32' })
    })
    
    const { clearOtherEventsData } = useBookmarks()
    
    // 芸カ31と芸カ33のデータを設定
    mockStateStore['bookmarks.list.geika-31'] = { value: [{ id: '1', circleId: 'c1' }] }
    mockStateStore['bookmarks.withCircles.geika-31'] = { value: [{ id: '1', circle: {} }] }
    mockStateStore['bookmarks.list.geika-33'] = { value: [{ id: '2', circleId: 'c2' }] }
    mockStateStore['bookmarks.withCircles.geika-33'] = { value: [{ id: '2', circle: {} }] }
    
    // clearOtherEventsData を実行
    clearOtherEventsData()
    
    // 他のイベントのデータがクリアされることを確認
    expect(mockStateStore['bookmarks.list.geika-31'].value).toEqual([])
    expect(mockStateStore['bookmarks.withCircles.geika-31'].value).toEqual([])
    expect(mockStateStore['bookmarks.list.geika-33'].value).toEqual([])
    expect(mockStateStore['bookmarks.withCircles.geika-33'].value).toEqual([])
    
    // 現在のイベント（芸カ32）のデータは影響を受けない
    if (mockStateStore['bookmarks.list.geika-32']) {
      expect(mockStateStore['bookmarks.list.geika-32'].value).not.toEqual([])
    }
  })

  it('clearBookmarksForEvent が指定イベントのデータをクリアする', async () => {
    const { useBookmarks } = await import('~/composables/useBookmarks')
    
    vi.mocked(useEvents).mockReturnValue({
      currentEvent: ref({ id: 'geika-32', name: '芸カ32' })
    })
    
    const { clearBookmarksForEvent } = useBookmarks()
    
    // テストデータを設定
    mockStateStore['bookmarks.list.geika-31'] = { value: [{ id: '1' }] }
    mockStateStore['bookmarks.withCircles.geika-31'] = { value: [{ id: '1' }] }
    
    // 芸カ31のデータをクリア
    clearBookmarksForEvent('geika-31')
    
    // 指定されたイベントのデータがクリアされることを確認
    expect(mockStateStore['bookmarks.list.geika-31'].value).toEqual([])
    expect(mockStateStore['bookmarks.withCircles.geika-31'].value).toEqual([])
  })

  it('getStateKey が正しいキーを生成する', async () => {
    const { useBookmarks } = await import('~/composables/useBookmarks')
    
    // currentEvent が設定されている場合
    vi.mocked(useEvents).mockReturnValue({
      currentEvent: ref({ id: 'geika-32', name: '芸カ32' })
    })
    
    const bookmarks = useBookmarks()
    
    // イベントIDが含まれたキーが生成されることを確認
    expect(mockUseState).toHaveBeenCalledWith('bookmarks.list.geika-32', expect.any(Function))
    expect(mockUseState).toHaveBeenCalledWith('bookmarks.withCircles.geika-32', expect.any(Function))
  })

  it('currentEvent が null の場合はデフォルトキーを使用', async () => {
    const { useBookmarks } = await import('~/composables/useBookmarks')
    
    // currentEvent が null の場合
    vi.mocked(useEvents).mockReturnValue({
      currentEvent: ref(null)
    })
    
    const bookmarks = useBookmarks()
    
    // デフォルトキーが使用されることを確認
    expect(mockUseState).toHaveBeenCalledWith('bookmarks.list.default', expect.any(Function))
    expect(mockUseState).toHaveBeenCalledWith('bookmarks.withCircles.default', expect.any(Function))
  })
})