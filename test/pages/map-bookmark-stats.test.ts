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
      { id: '1', eventId: 'geika-32', category: 'check', circle: {} },
      { id: '2', eventId: 'geika-32', category: 'check', circle: {} },
      { id: '3', eventId: 'geika-32', category: 'interested', circle: {} },
      { id: '4', eventId: 'geika-32', category: 'priority', circle: {} },
      { id: '5', eventId: 'geika-32', category: 'priority', circle: {} },
      { id: '6', eventId: 'geika-32', category: 'priority', circle: {} }
    ]),
    fetchBookmarksWithCircles: vi.fn()
  })
}))

vi.mock('~/composables/useEvents', () => ({
  useEvents: () => ({
    currentEvent: ref({ id: 'geika-32', name: '芸カ32' }),
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
    wrapper = mount(MapPage)
    await nextTick()

    // 統計欄の要素を取得
    const statsSection = wrapper.find('h3:contains("ブックマーク統計")').element.parentElement
    const statItems = statsSection.querySelectorAll('.text-center')

    // 4つの統計項目があることを確認（合計、チェック、気になる、優先）
    expect(statItems.length).toBe(4)

    // 各統計項目の内容を確認
    const statTexts = Array.from(statItems).map(item => item.textContent)
    
    expect(statTexts[0]).toContain('6') // 合計
    expect(statTexts[0]).toContain('合計')
    
    expect(statTexts[1]).toContain('2') // チェック
    expect(statTexts[1]).toContain('チェック')
    
    expect(statTexts[2]).toContain('1') // 気になる
    expect(statTexts[2]).toContain('気になる')
    
    expect(statTexts[3]).toContain('3') // 優先
    expect(statTexts[3]).toContain('優先')
  })

  it('各統計項目に適切な色が設定されている', async () => {
    wrapper = mount(MapPage)
    await nextTick()

    const statsSection = wrapper.find('h3:contains("ブックマーク統計")').element.parentElement
    const statItems = statsSection.querySelectorAll('.text-center')

    // 背景色クラスの確認
    expect(statItems[0].className).toContain('bg-pink-50') // 合計
    expect(statItems[1].className).toContain('bg-blue-50') // チェック
    expect(statItems[2].className).toContain('bg-amber-50') // 気になる
    expect(statItems[3].className).toContain('bg-red-50') // 優先

    // テキスト色クラスの確認
    const valueElements = statsSection.querySelectorAll('.text-xl')
    expect(valueElements[0].className).toContain('text-pink-500') // 合計
    expect(valueElements[1].className).toContain('text-blue-500') // チェック
    expect(valueElements[2].className).toContain('text-amber-600') // 気になる
    expect(valueElements[3].className).toContain('text-red-500') // 優先
  })

  it('ブックマークがない場合は0が表示される', async () => {
    // ブックマークを空に設定
    vi.mocked(useBookmarks).mockImplementation(() => ({
      bookmarksWithCircles: ref([]),
      fetchBookmarksWithCircles: vi.fn()
    }))

    wrapper = mount(MapPage)
    await nextTick()

    const statsSection = wrapper.find('h3:contains("ブックマーク統計")').element.parentElement
    const valueElements = statsSection.querySelectorAll('.text-xl')

    // 全ての値が0であることを確認
    expect(valueElements[0].textContent).toBe('0') // 合計
    expect(valueElements[1].textContent).toBe('0') // チェック
    expect(valueElements[2].textContent).toBe('0') // 気になる
    expect(valueElements[3].textContent).toBe('0') // 優先
  })
})