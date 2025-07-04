/**
 * SVGネイティブなピン管理コンポーザブル
 * 
 * このコンポーザブルは以下の機能を提供します：
 * - SVGマップに直接ピンを埋め込み
 * - レスポンシブ対応の座標管理
 * - ピンのクリックイベント処理
 * - カテゴリ別のピンスタイル管理
 */

import { ref, computed, readonly, nextTick } from 'vue'
import type { BookmarkWithCircle, BookmarkCategory } from '~/types'

/**
 * SVGピン表示オプション
 */
export interface SvgPinOptions {
  /** ピンの半径 */
  radius: number
  /** ストローク幅 */
  strokeWidth: number
  /** ドロップシャドウの有無 */
  dropShadow: boolean
  /** アニメーション有効 */
  animated: boolean
}

/**
 * ピンスタイル設定
 */
export interface PinStyle {
  fill: string
  stroke: string
  strokeWidth: number
  iconPath: string
  iconStroke: string
}

const DEFAULT_OPTIONS: SvgPinOptions = {
  radius: 12,
  strokeWidth: 3,
  dropShadow: true,
  animated: true
}

interface SvgPinsDependencies {
  logger?: ReturnType<typeof useLogger>
}

export const useSvgPins = (
  options: Partial<SvgPinOptions> = {},
  deps?: SvgPinsDependencies
) => {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const logger = deps?.logger ?? useLogger('useSvgPins')
  
  // 状態管理
  const svgElement = ref<SVGElement | null>(null)
  const pinsGroup = ref<SVGGElement | null>(null)
  const isInitialized = ref(false)
  
  /**
   * カテゴリ別のピンスタイル定義
   */
  const pinStyles = computed<Record<BookmarkCategory, PinStyle>>(() => ({
    check: {
      fill: '#0284c7',
      stroke: '#ffffff',
      strokeWidth: config.strokeWidth,
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      iconStroke: '#ffffff'
    },
    interested: {
      fill: '#ca8a04',
      stroke: '#ffffff',
      strokeWidth: config.strokeWidth,
      iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      iconStroke: '#ffffff'
    },
    priority: {
      fill: '#dc2626',
      stroke: '#ffffff',
      strokeWidth: config.strokeWidth,
      iconPath: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
      iconStroke: '#ffffff'
    }
  }))
  
  /**
   * SVGマップにピングループを初期化
   * 
   * @param mapSvgElement - マップのSVG要素
   */
  const initializePins = async (mapSvgElement: SVGElement) => {
    svgElement.value = mapSvgElement
    
    // 既存のピングループを削除
    const existingPinsGroup = mapSvgElement.querySelector('#bookmark-pins-group')
    if (existingPinsGroup) {
      existingPinsGroup.remove()
    }
    
    // 新しいピングループを作成
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.id = 'bookmark-pins-group'
    group.setAttribute('class', 'bookmark-pins')
    
    // ドロップシャドウフィルター定義
    if (config.dropShadow) {
      addDropShadowFilter(mapSvgElement)
    }
    
    // マップの最後に追加（最前面に表示）
    mapSvgElement.appendChild(group)
    pinsGroup.value = group
    isInitialized.value = true
    
    logger.info('✅ SVG pins initialized')
  }
  
  /**
   * ドロップシャドウフィルターをSVGに追加
   */
  const addDropShadowFilter = (svgElement: SVGElement) => {
    let defs = svgElement.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svgElement.insertBefore(defs, svgElement.firstChild)
    }
    
    // 既存のフィルターをチェック
    if (defs.querySelector('#pin-drop-shadow')) {
      return
    }
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.id = 'pin-drop-shadow'
    filter.setAttribute('x', '-50%')
    filter.setAttribute('y', '-50%')
    filter.setAttribute('width', '200%')
    filter.setAttribute('height', '200%')
    
    const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow')
    feDropShadow.setAttribute('dx', '2')
    feDropShadow.setAttribute('dy', '2')
    feDropShadow.setAttribute('stdDeviation', '3')
    feDropShadow.setAttribute('flood-opacity', '0.3')
    
    filter.appendChild(feDropShadow)
    defs.appendChild(filter)
  }
  
  /**
   * ブックマークピンを描画
   * 
   * @param bookmarks - ブックマーク一覧
   * @param getPositionFunc - 座標取得関数
   * @param onPinClick - ピンクリック時のコールバック
   */
  const renderPins = (
    bookmarks: BookmarkWithCircle[],
    getPositionFunc: (circle: any) => { x: number; y: number },
    onPinClick: (circle: any) => void
  ) => {
    if (!isInitialized.value || !pinsGroup.value) {
      logger.warn('SVG pins not initialized')
      return
    }
    
    // 既存のピンをクリア
    pinsGroup.value.innerHTML = ''
    
    // 各ブックマークのピンを作成
    bookmarks.forEach((bookmark, index) => {
      const position = getPositionFunc(bookmark.circle)
      const style = pinStyles.value[bookmark.category]
      
      const pinGroup = createPinElement(bookmark, position, style, onPinClick, index)
      pinsGroup.value!.appendChild(pinGroup)
    })
    
    logger.info(`✅ Rendered ${bookmarks.length} SVG pins`)
  }
  
  /**
   * 個別ピン要素を作成
   */
  const createPinElement = (
    bookmark: BookmarkWithCircle,
    position: { x: number; y: number },
    style: PinStyle,
    onPinClick: (circle: any) => void,
    index: number
  ): SVGGElement => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('class', 'bookmark-pin')
    group.setAttribute('data-bookmark-id', bookmark.id)
    group.setAttribute('data-category', bookmark.category)
    
    // アニメーション用の遅延
    if (config.animated) {
      group.style.opacity = '0'
      group.style.transform = 'scale(0.5)'
      group.style.transformOrigin = `${position.x}px ${position.y}px`
      group.style.transition = `opacity 0.3s ease ${index * 0.05}s, transform 0.3s ease ${index * 0.05}s`
    }
    
    // ピンサークル
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', position.x.toString())
    circle.setAttribute('cy', position.y.toString())
    circle.setAttribute('r', config.radius.toString())
    circle.setAttribute('fill', style.fill)
    circle.setAttribute('stroke', style.stroke)
    circle.setAttribute('stroke-width', style.strokeWidth.toString())
    circle.setAttribute('class', 'pin-background')
    
    // タッチ領域を拡大するための透明な円
    const touchArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    touchArea.setAttribute('cx', position.x.toString())
    touchArea.setAttribute('cy', position.y.toString())
    touchArea.setAttribute('r', (config.radius * 1.5).toString()) // タッチしやすいように1.5倍
    touchArea.setAttribute('fill', 'transparent')
    touchArea.setAttribute('class', 'pin-touch-area')
    touchArea.style.cursor = 'pointer'
    
    if (config.dropShadow) {
      circle.setAttribute('filter', 'url(#pin-drop-shadow)')
    }
    
    // クリックイベント
    circle.style.cursor = 'pointer'
    
    // クリックハンドラー
    const handleClick = (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
      onPinClick(bookmark.circle)
    }
    
    // タッチ領域にイベントを設定
    touchArea.addEventListener('click', handleClick)
    touchArea.addEventListener('touchend', (e) => {
      e.stopPropagation()
      e.preventDefault()
      onPinClick(bookmark.circle)
    })
    
    // 可視円にもイベントを設定（冗長性のため）
    circle.addEventListener('click', handleClick)
    circle.addEventListener('touchend', (e) => {
      e.stopPropagation()
      e.preventDefault()
      onPinClick(bookmark.circle)
    })
    
    // ホバー効果（デスクトップのみ）
    const isTouchDevice = 'ontouchstart' in window
    if (!isTouchDevice) {
      // transformOriginを中心に設定
      circle.style.transformOrigin = `${position.x}px ${position.y}px`
      
      circle.addEventListener('mouseenter', () => {
        circle.style.transform = 'scale(1.05)' // より小さいスケールでブレを防止
        circle.style.transition = 'transform 0.2s ease'
      })
      
      circle.addEventListener('mouseleave', () => {
        circle.style.transform = 'scale(1)'
      })
    }
    
    // アイコン
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    icon.setAttribute('d', style.iconPath)
    icon.setAttribute('fill', 'none')
    icon.setAttribute('stroke', style.iconStroke)
    icon.setAttribute('stroke-width', '2')
    icon.setAttribute('stroke-linecap', 'round')
    icon.setAttribute('stroke-linejoin', 'round')
    icon.setAttribute('class', 'pin-icon')
    icon.style.pointerEvents = 'none'
    
    // アイコンのスケールと位置調整
    const iconSize = config.radius * 1.2
    const iconOffset = iconSize / 2
    icon.setAttribute('transform', 
      `translate(${position.x - iconOffset}, ${position.y - iconOffset}) scale(${iconSize / 24})`
    )
    
    // グループにもイベントを設定（ピン全体をクリック可能に）
    group.style.cursor = 'pointer'
    group.addEventListener('click', handleClick)
    group.addEventListener('touchend', (e) => {
      e.stopPropagation()
      e.preventDefault()
      onPinClick(bookmark.circle)
    })
    
    // 要素を追加（順序重要：タッチ領域を最前面に）
    group.appendChild(circle)
    group.appendChild(icon)
    group.appendChild(touchArea) // タッチ領域を最後に追加して最前面に
    
    // アニメーション開始
    if (config.animated) {
      setTimeout(() => {
        group.style.opacity = '1'
        group.style.transform = 'scale(1)'
      }, 50)
    }
    
    return group
  }
  
  /**
   * 特定のピンを強調表示
   * 
   * @param bookmarkId - ブックマークID
   */
  const highlightPin = (bookmarkId: string) => {
    if (!pinsGroup.value) return
    
    // 全てのピンを通常状態にリセット
    const allPins = pinsGroup.value.querySelectorAll('.bookmark-pin')
    allPins.forEach(pin => {
      (pin as SVGElement).style.opacity = '0.6'
      const circle = pin.querySelector('.pin-background') as SVGCircleElement
      if (circle) {
        circle.style.transform = 'scale(1)'
      }
    })
    
    // 指定されたピンを強調
    const targetPin = pinsGroup.value.querySelector(`[data-bookmark-id="${bookmarkId}"]`)
    if (targetPin) {
      (targetPin as SVGElement).style.opacity = '1'
      const circle = targetPin.querySelector('.pin-background') as SVGCircleElement
      if (circle) {
        circle.style.transform = 'scale(1.3)'
        circle.style.transition = 'transform 0.3s ease'
      }
    }
  }
  
  /**
   * ピンの強調表示をリセット
   */
  const resetPinHighlight = () => {
    if (!pinsGroup.value) return
    
    const allPins = pinsGroup.value.querySelectorAll('.bookmark-pin')
    allPins.forEach(pin => {
      (pin as SVGElement).style.opacity = '1'
      const circle = pin.querySelector('.pin-background') as SVGCircleElement
      if (circle) {
        circle.style.transform = 'scale(1)'
      }
    })
  }
  
  /**
   * 全てのピンを削除
   */
  const clearPins = () => {
    if (pinsGroup.value) {
      pinsGroup.value.innerHTML = ''
    }
  }
  
  /**
   * 後片付け
   */
  const cleanup = () => {
    clearPins()
    svgElement.value = null
    pinsGroup.value = null
    isInitialized.value = false
  }
  
  return {
    isInitialized: readonly(isInitialized),
    pinStyles: readonly(pinStyles),
    initializePins,
    renderPins,
    highlightPin,
    resetPinHighlight,
    clearPins,
    cleanup
  }
}