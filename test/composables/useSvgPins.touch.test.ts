import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSvgPins } from '~/composables/useSvgPins'
import type { BookmarkWithCircle } from '~/types'

describe('useSvgPins - タッチイベント', () => {
  let svgElement: SVGElement
  let mockBookmark: BookmarkWithCircle
  let onPinClickMock: vi.Mock
  
  beforeEach(() => {
    // SVG要素のモック
    svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    document.body.appendChild(svgElement)
    
    // ブックマークデータのモック
    mockBookmark = {
      id: 'bookmark1',
      category: 'check',
      circle: {
        id: 'circle1',
        circleName: 'テストサークル'
      }
    } as BookmarkWithCircle
    
    // クリックハンドラーのモック
    onPinClickMock = vi.fn()
  })
  
  afterEach(() => {
    document.body.removeChild(svgElement)
    vi.clearAllMocks()
  })
  
  it('ピンがタッチイベントに反応する', async () => {
    const { initializePins, renderPins } = useSvgPins()
    
    // ピンを初期化
    await initializePins(svgElement)
    
    // ピンを描画
    renderPins(
      [mockBookmark],
      () => ({ x: 100, y: 100 }),
      onPinClickMock
    )
    
    // タッチ領域を取得
    const touchArea = svgElement.querySelector('.pin-touch-area') as SVGCircleElement
    expect(touchArea).toBeTruthy()
    
    // タッチイベントをシミュレート
    const touchEndEvent = new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true
    })
    
    touchArea.dispatchEvent(touchEndEvent)
    
    // クリックハンドラーが呼ばれたことを確認
    expect(onPinClickMock).toHaveBeenCalledWith(mockBookmark.circle)
  })
  
  it('タッチ領域が可視円より大きい', async () => {
    const { initializePins, renderPins } = useSvgPins({ radius: 12 })
    
    await initializePins(svgElement)
    
    renderPins(
      [mockBookmark],
      () => ({ x: 100, y: 100 }),
      onPinClickMock
    )
    
    const visibleCircle = svgElement.querySelector('.pin-background') as SVGCircleElement
    const touchArea = svgElement.querySelector('.pin-touch-area') as SVGCircleElement
    
    const visibleRadius = parseFloat(visibleCircle.getAttribute('r') || '0')
    const touchRadius = parseFloat(touchArea.getAttribute('r') || '0')
    
    // タッチ領域が可視円の1.5倍であることを確認
    expect(touchRadius).toBe(visibleRadius * 1.5)
  })
  
  it('デスクトップではホバー効果が有効', async () => {
    // タッチデバイスではないことをシミュレート
    Object.defineProperty(window, 'ontouchstart', {
      value: undefined,
      configurable: true
    })
    
    const { initializePins, renderPins } = useSvgPins()
    
    await initializePins(svgElement)
    
    renderPins(
      [mockBookmark],
      () => ({ x: 100, y: 100 }),
      onPinClickMock
    )
    
    const circle = svgElement.querySelector('.pin-background') as SVGCircleElement
    
    // mouseenterイベントをシミュレート
    const mouseEnterEvent = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true
    })
    
    circle.dispatchEvent(mouseEnterEvent)
    
    // スケールが適用されていることを確認
    expect(circle.style.transform).toContain('scale(1.05)')
  })
  
  it('モバイルではホバー効果が無効', async () => {
    // タッチデバイスであることをシミュレート
    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
      configurable: true
    })
    
    const { initializePins, renderPins } = useSvgPins()
    
    await initializePins(svgElement)
    
    renderPins(
      [mockBookmark],
      () => ({ x: 100, y: 100 }),
      onPinClickMock
    )
    
    const circle = svgElement.querySelector('.pin-background') as SVGCircleElement
    
    // mouseenterイベントをシミュレート
    const mouseEnterEvent = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true
    })
    
    circle.dispatchEvent(mouseEnterEvent)
    
    // スケールが適用されていないことを確認
    expect(circle.style.transform).not.toContain('scale')
  })
  
  it('複数のピンが独立して動作する', async () => {
    const { initializePins, renderPins } = useSvgPins()
    
    await initializePins(svgElement)
    
    const bookmarks: BookmarkWithCircle[] = [
      { id: '1', category: 'check', circle: { id: 'c1', circleName: 'サークル1' } } as BookmarkWithCircle,
      { id: '2', category: 'interested', circle: { id: 'c2', circleName: 'サークル2' } } as BookmarkWithCircle,
      { id: '3', category: 'priority', circle: { id: 'c3', circleName: 'サークル3' } } as BookmarkWithCircle
    ]
    
    renderPins(
      bookmarks,
      (_, index) => ({ x: 100 + index * 50, y: 100 }),
      onPinClickMock
    )
    
    const touchAreas = svgElement.querySelectorAll('.pin-touch-area')
    expect(touchAreas.length).toBe(3)
    
    // 2番目のピンをタッチ
    const touchEvent = new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true
    })
    
    touchAreas[1].dispatchEvent(touchEvent)
    
    // 正しいサークルが呼ばれたことを確認
    expect(onPinClickMock).toHaveBeenCalledWith(bookmarks[1].circle)
    expect(onPinClickMock).toHaveBeenCalledTimes(1)
  })
})