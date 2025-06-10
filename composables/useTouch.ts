import { ref, computed, readonly } from 'vue'

interface TouchPoint {
  x: number
  y: number
}

interface TouchState {
  isActive: boolean
  initialDistance: number
  initialMidpoint: TouchPoint
  lastMidpoint: TouchPoint
  velocity: TouchPoint
  lastTime: number
}

export const useTouch = () => {
  const touchState = ref<TouchState>({
    isActive: false,
    initialDistance: 0,
    initialMidpoint: { x: 0, y: 0 },
    lastMidpoint: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    lastTime: 0
  })

  const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchMidpoint = (touch1: Touch, touch2: Touch): TouchPoint => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  const getSingleTouchPoint = (touch: Touch): TouchPoint => {
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  }

  const handleTouchStart = (
    event: TouchEvent,
    onPinchStart?: (distance: number, midpoint: TouchPoint) => void,
    onPanStart?: (point: TouchPoint) => void
  ) => {
    event.preventDefault()
    
    const touches = event.touches
    const currentTime = Date.now()

    if (touches.length === 2) {
      // ピンチジェスチャー開始
      const distance = getTouchDistance(touches[0], touches[1])
      const midpoint = getTouchMidpoint(touches[0], touches[1])
      
      touchState.value = {
        isActive: true,
        initialDistance: distance,
        initialMidpoint: midpoint,
        lastMidpoint: midpoint,
        velocity: { x: 0, y: 0 },
        lastTime: currentTime
      }
      
      onPinchStart?.(distance, midpoint)
    } else if (touches.length === 1) {
      // パンジェスチャー開始
      const point = getSingleTouchPoint(touches[0])
      
      touchState.value = {
        isActive: true,
        initialDistance: 0,
        initialMidpoint: point,
        lastMidpoint: point,
        velocity: { x: 0, y: 0 },
        lastTime: currentTime
      }
      
      onPanStart?.(point)
    }
  }

  const handleTouchMove = (
    event: TouchEvent,
    onPinchMove?: (scale: number, center: TouchPoint, deltaX: number, deltaY: number) => void,
    onPanMove?: (deltaX: number, deltaY: number, velocity: TouchPoint) => void
  ) => {
    if (!touchState.value.isActive) return
    
    event.preventDefault()
    
    const touches = event.touches
    const currentTime = Date.now()
    const deltaTime = currentTime - touchState.value.lastTime

    if (touches.length === 2) {
      // ピンチ + パン処理
      const currentDistance = getTouchDistance(touches[0], touches[1])
      const currentMidpoint = getTouchMidpoint(touches[0], touches[1])
      
      const scale = currentDistance / touchState.value.initialDistance
      const deltaX = currentMidpoint.x - touchState.value.lastMidpoint.x
      const deltaY = currentMidpoint.y - touchState.value.lastMidpoint.y
      
      // 速度計算
      if (deltaTime > 0) {
        touchState.value.velocity = {
          x: deltaX / deltaTime,
          y: deltaY / deltaTime
        }
      }
      
      touchState.value.lastMidpoint = currentMidpoint
      touchState.value.lastTime = currentTime
      
      onPinchMove?.(scale, currentMidpoint, deltaX, deltaY)
    } else if (touches.length === 1) {
      // パン処理
      const currentPoint = getSingleTouchPoint(touches[0])
      const deltaX = currentPoint.x - touchState.value.lastMidpoint.x
      const deltaY = currentPoint.y - touchState.value.lastMidpoint.y
      
      // 速度計算
      if (deltaTime > 0) {
        touchState.value.velocity = {
          x: deltaX / deltaTime,
          y: deltaY / deltaTime
        }
      }
      
      touchState.value.lastMidpoint = currentPoint
      touchState.value.lastTime = currentTime
      
      onPanMove?.(deltaX, deltaY, touchState.value.velocity)
    }
  }

  const handleTouchEnd = (
    event: TouchEvent,
    onMomentumStart?: (velocity: TouchPoint) => void,
    onTouchEnd?: () => void
  ) => {
    event.preventDefault()
    
    if (!touchState.value.isActive) return
    
    const remainingTouches = event.touches.length
    
    if (remainingTouches === 0) {
      // すべてのタッチが終了
      const velocity = touchState.value.velocity
      
      // 慣性スクロールを開始するかどうかの判定
      const velocityThreshold = 0.1
      const hasSignificantVelocity = 
        Math.abs(velocity.x) > velocityThreshold || 
        Math.abs(velocity.y) > velocityThreshold
      
      if (hasSignificantVelocity) {
        onMomentumStart?.(velocity)
      }
      
      touchState.value.isActive = false
      onTouchEnd?.()
    } else if (remainingTouches === 1 && touchState.value.initialDistance > 0) {
      // ピンチからパンに切り替え
      const touch = event.touches[0]
      const point = getSingleTouchPoint(touch)
      
      touchState.value.initialDistance = 0
      touchState.value.lastMidpoint = point
      touchState.value.velocity = { x: 0, y: 0 }
    }
  }

  const stopTouch = () => {
    touchState.value.isActive = false
  }

  const isMultiTouch = computed(() => 
    touchState.value.isActive && touchState.value.initialDistance > 0
  )

  const isPanning = computed(() => 
    touchState.value.isActive && touchState.value.initialDistance === 0
  )

  return {
    touchState: readonly(touchState),
    isMultiTouch,
    isPanning,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    stopTouch
  }
}

export class MomentumScroll {
  private animationId: number | null = null
  private velocity: TouchPoint
  private readonly friction: number
  private readonly threshold: number
  private onUpdate: (deltaX: number, deltaY: number) => void
  private onComplete: () => void

  constructor(
    initialVelocity: TouchPoint,
    options: {
      friction?: number
      threshold?: number
      onUpdate: (deltaX: number, deltaY: number) => void
      onComplete?: () => void
    }
  ) {
    this.velocity = { ...initialVelocity }
    this.friction = options.friction ?? 0.95
    this.threshold = options.threshold ?? 0.01
    this.onUpdate = options.onUpdate
    this.onComplete = options.onComplete ?? (() => {})
  }

  start() {
    if (this.animationId) {
      this.stop()
    }

    const animate = () => {
      const deltaX = this.velocity.x * 16 // 16ms フレーム想定
      const deltaY = this.velocity.y * 16

      this.onUpdate(deltaX, deltaY)

      // 摩擦を適用
      this.velocity.x *= this.friction
      this.velocity.y *= this.friction

      // 速度が閾値以下になったら停止
      if (Math.abs(this.velocity.x) < this.threshold && Math.abs(this.velocity.y) < this.threshold) {
        this.stop()
        this.onComplete()
        return
      }

      this.animationId = requestAnimationFrame(animate)
    }

    this.animationId = requestAnimationFrame(animate)
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
}