import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTouch, MomentumScroll } from '~/composables/useTouch'

// TouchEventのモック
const createMockTouch = (x: number, y: number): Touch => ({
  clientX: x,
  clientY: y,
  identifier: 0,
  pageX: x,
  pageY: y,
  screenX: x,
  screenY: y,
  radiusX: 1,
  radiusY: 1,
  rotationAngle: 0,
  force: 1,
  target: document.createElement('div')
})

const createMockTouchEvent = (touches: Touch[]): TouchEvent => ({
  touches: touches as any,
  targetTouches: touches as any,
  changedTouches: touches as any,
  preventDefault: vi.fn(),
  type: 'touchstart',
  target: document.createElement('div'),
  currentTarget: document.createElement('div'),
  bubbles: false,
  cancelable: true,
  defaultPrevented: false,
  eventPhase: 0,
  isTrusted: false,
  timeStamp: Date.now(),
  stopPropagation: vi.fn(),
  stopImmediatePropagation: vi.fn(),
  initEvent: vi.fn(),
  view: window,
  detail: 0,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false
} as TouchEvent)

describe('useTouch', () => {
  let touchHandler: ReturnType<typeof useTouch>

  beforeEach(() => {
    touchHandler = useTouch()
    vi.clearAllMocks()
  })

  describe('単一タッチ操作', () => {
    it('パンジェスチャーを正しく検出する', () => {
      const onPanStart = vi.fn()
      const touch = createMockTouch(100, 100)
      const event = createMockTouchEvent([touch])

      touchHandler.handleTouchStart(event, undefined, onPanStart)

      expect(onPanStart).toHaveBeenCalledWith({ x: 100, y: 100 })
      expect(touchHandler.isPanning.value).toBe(true)
    })

    it('パン移動を正しく計算する', () => {
      const onPanStart = vi.fn()
      const onPanMove = vi.fn()
      
      // 開始
      const startTouch = createMockTouch(100, 100)
      const startEvent = createMockTouchEvent([startTouch])
      touchHandler.handleTouchStart(startEvent, undefined, onPanStart)

      // 移動
      const moveTouch = createMockTouch(150, 120)
      const moveEvent = createMockTouchEvent([moveTouch])
      touchHandler.handleTouchMove(moveEvent, undefined, onPanMove)

      expect(onPanMove).toHaveBeenCalledWith(
        50,  // deltaX
        20,  // deltaY
        expect.any(Object) // velocity
      )
    })
  })

  describe('ピンチ操作', () => {
    it('ピンチジェスチャーを正しく検出する', () => {
      const onPinchStart = vi.fn()
      const touch1 = createMockTouch(100, 100)
      const touch2 = createMockTouch(200, 100)
      const event = createMockTouchEvent([touch1, touch2])

      touchHandler.handleTouchStart(event, onPinchStart)

      expect(onPinchStart).toHaveBeenCalledWith(
        100, // 距離
        { x: 150, y: 100 } // 中点
      )
      expect(touchHandler.isMultiTouch.value).toBe(true)
    })

    it('ピンチスケールを正しく計算する', () => {
      const onPinchStart = vi.fn()
      const onPinchMove = vi.fn()
      
      // 開始
      const startTouch1 = createMockTouch(100, 100)
      const startTouch2 = createMockTouch(200, 100)
      const startEvent = createMockTouchEvent([startTouch1, startTouch2])
      touchHandler.handleTouchStart(startEvent, onPinchStart)

      // 移動（距離を2倍に）
      const moveTouch1 = createMockTouch(50, 100)
      const moveTouch2 = createMockTouch(250, 100)
      const moveEvent = createMockTouchEvent([moveTouch1, moveTouch2])
      touchHandler.handleTouchMove(moveEvent, onPinchMove)

      expect(onPinchMove).toHaveBeenCalledWith(
        2,   // scale (200/100)
        { x: 150, y: 100 }, // center
        0,   // deltaX
        0    // deltaY
      )
    })
  })

  describe('タッチ終了', () => {
    it('慣性スクロールを開始する', () => {
      vi.useFakeTimers()
      
      const onMomentumStart = vi.fn()
      const onPanStart = vi.fn()
      const onPanMove = vi.fn()
      
      // パン開始
      const startTouch = createMockTouch(100, 100)
      const startEvent = createMockTouchEvent([startTouch])
      touchHandler.handleTouchStart(startEvent, undefined, onPanStart)

      // 時間を進める
      vi.advanceTimersByTime(50)

      // 素早い移動
      const moveTouch = createMockTouch(200, 150)
      const moveEvent = createMockTouchEvent([moveTouch])
      touchHandler.handleTouchMove(moveEvent, undefined, onPanMove)

      // 終了
      const endEvent = createMockTouchEvent([])
      touchHandler.handleTouchEnd(endEvent, onMomentumStart)

      expect(onMomentumStart).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number)
        })
      )
      
      vi.useRealTimers()
    })

    it('低速度では慣性スクロールを開始しない', () => {
      const onMomentumStart = vi.fn()
      const onPanStart = vi.fn()
      
      // パン開始
      const startTouch = createMockTouch(100, 100)
      const startEvent = createMockTouchEvent([startTouch])
      touchHandler.handleTouchStart(startEvent, undefined, onPanStart)

      // 即座に終了（速度が低い）
      const endEvent = createMockTouchEvent([])
      touchHandler.handleTouchEnd(endEvent, onMomentumStart)

      expect(onMomentumStart).not.toHaveBeenCalled()
    })
  })
})

describe('MomentumScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('慣性スクロールが正しく動作する', () => {
    const onUpdate = vi.fn()
    const onComplete = vi.fn()
    
    const momentum = new MomentumScroll(
      { x: 10, y: 5 },
      {
        friction: 0.9,
        threshold: 0.1,
        onUpdate,
        onComplete
      }
    )

    momentum.start()

    // 最初のフレーム
    vi.advanceTimersByTime(16)
    expect(onUpdate).toHaveBeenCalledWith(160, 80) // 10*16, 5*16

    // 摩擦により減速
    vi.advanceTimersByTime(16)
    expect(onUpdate).toHaveBeenCalledWith(144, 72) // (10*0.9)*16, (5*0.9)*16

    momentum.stop()
  })

  it('閾値以下で自動停止する', () => {
    const onUpdate = vi.fn()
    const onComplete = vi.fn()
    
    const momentum = new MomentumScroll(
      { x: 0.05, y: 0.05 }, // 低速度
      {
        friction: 0.9,
        threshold: 0.1,
        onUpdate,
        onComplete
      }
    )

    momentum.start()
    vi.advanceTimersByTime(16)

    expect(onComplete).toHaveBeenCalled()
  })

  it('手動停止が正しく動作する', () => {
    const onUpdate = vi.fn()
    const onComplete = vi.fn()
    
    const momentum = new MomentumScroll(
      { x: 10, y: 5 },
      {
        onUpdate,
        onComplete
      }
    )

    momentum.start()
    momentum.stop()

    vi.advanceTimersByTime(100)
    
    // 停止後は更新されない
    expect(onUpdate).not.toHaveBeenCalled()
  })
})