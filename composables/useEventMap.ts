import { ref, computed, readonly } from 'vue'
import type { EventMapConfig } from '~/types'
import { getMapConfig as getConfigFromData } from '~/data/mapConfigs'

export const useEventMap = () => {
  const mapCache = new Map<string, string>()
  const currentMapContent = ref<string>('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadEventMap = async (eventId: string): Promise<string> => {
    console.log('🔄 loadEventMap called for:', eventId)
    
    // キャッシュから取得を試行
    if (mapCache.has(eventId)) {
      const cachedContent = mapCache.get(eventId)!
      console.log('💾 Using cached map content:', cachedContent.length, 'chars')
      currentMapContent.value = cachedContent
      return cachedContent
    }

    try {
      isLoading.value = true
      error.value = null
      console.log('📡 Loading map from server...')

      const mapFileName = getMapFileName(eventId)
      console.log('📁 Map filename:', mapFileName)
      
      const response = await fetch(`/${mapFileName}`)
      console.log('📥 Fetch response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch map: ${response.status} ${response.statusText}`)
      }

      const svgContent = await response.text()
      console.log('📄 SVG content loaded:', {
        length: svgContent.length,
        starts: svgContent.substring(0, 100),
        containsSvg: svgContent.includes('<svg')
      })
      
      // キャッシュに保存
      mapCache.set(eventId, svgContent)
      currentMapContent.value = svgContent
      console.log('✅ Map loaded and cached successfully')
      
      return svgContent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = `マップの読み込みに失敗しました: ${errorMessage}`
      console.error('❌ Map loading error:', err)
      throw err
    } finally {
      isLoading.value = false
      console.log('🏁 loadEventMap finished')
    }
  }

  const getMapFileName = (eventId: string): string => {
    // イベントIDからマップファイル名を生成
    switch (eventId) {
      case 'geika-31':
        return 'map-geika31.svg'
      case 'geika-32':
        return 'map-geika32.svg'
      default:
        // デフォルトは最新のイベント
        return 'map-geika32.svg'
    }
  }

  const clearCache = () => {
    mapCache.clear()
    currentMapContent.value = ''
  }

  const preloadMaps = async (eventIds: string[]) => {
    const loadPromises = eventIds.map(async (eventId) => {
      try {
        await loadEventMap(eventId)
        console.log(`✅ Preloaded map for event: ${eventId}`)
      } catch (err) {
        console.warn(`⚠️ Failed to preload map for event: ${eventId}`, err)
      }
    })

    await Promise.allSettled(loadPromises)
  }

  const getCacheInfo = () => {
    return {
      size: mapCache.size,
      keys: Array.from(mapCache.keys()),
      totalSize: Array.from(mapCache.values()).reduce((total, content) => total + content.length, 0)
    }
  }

  return {
    currentMapContent: readonly(currentMapContent),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadEventMap,
    getMapFileName,
    clearCache,
    preloadMaps,
    getCacheInfo
  }
}

export const useCircleMapping = () => {
  const getCirclePosition = (circle: any, eventId: string): { x: number; y: number } => {
    const config = getConfigFromData(eventId)
    
    if (!circle.placement) {
      return getDefaultPosition()
    }

    const placement = circle.placement
    let blockKey: string

    // みきエリア（特別配置）
    if (placement.block === 'み' || placement.block === 'カ') {
      blockKey = `${placement.block}-${placement.number1?.toString().padStart(2, '0')}`
      
      const position = config.coordinateMapping[blockKey]
      if (position) {
        return { x: position.x, y: position.y }
      }
    }

    // 通常のサークル配置（アやド行など）
    if (placement.block && placement.number1) {
      blockKey = `${placement.block}-${placement.number1.toString().padStart(2, '0')}`
      
      const position = config.coordinateMapping[blockKey]
      if (position) {
        return { x: position.x, y: position.y }
      }
    }

    // フォールバック: 数値ベースの配置計算
    return calculatePositionFromPlacement(placement, eventId)
  }

  const calculatePositionFromPlacement = (placement: any, eventId: string): { x: number; y: number } => {
    // geika-32での配置計算（既存のロジック）
    if (eventId === 'geika-32') {
      return calculateGeika32Position(placement)
    }

    // geika-31での配置計算
    if (eventId === 'geika-31') {
      return calculateGeika31Position(placement)
    }

    return getDefaultPosition()
  }

  const calculateGeika32Position = (placement: any): { x: number; y: number } => {
    // みきエリアの処理
    if (placement.block === 'み' || placement.block === 'カ') {
      const num = parseInt(placement.number1)
      if (placement.block === 'カ' && num >= 1 && num <= 6) {
        return { x: 85, y: 40 + (num - 1) * 30 }
      } else if (placement.block === 'み' && num >= 1 && num <= 20) {
        return { x: 85, y: 270 + (num - 1) * 30 }
      }
    }

    // アやド行の処理
    const blockNum = parseInt(placement.number1)
    if (blockNum >= 1 && blockNum <= 72) {
      let baseX = 0
      let baseY = 0

      // ブロック別のオフセット
      if (placement.block === 'ア') {
        baseX = 250
        baseY = 140
      } else if (placement.block === 'ド') {
        baseX = 250
        baseY = 540
      }

      // 列の計算
      let colGroup = Math.floor((blockNum - 1) / 24)
      let posInGroup = ((blockNum - 1) % 24) + 1

      // 列内での位置
      let row = Math.floor((posInGroup - 1) / 2)
      let isRightSide = (posInGroup - 1) % 2 === 1

      let x = baseX + colGroup * 200 + (isRightSide ? 35 : 0)
      let y = baseY + row * 30

      return { x, y }
    }

    return getDefaultPosition()
  }

  const calculateGeika31Position = (placement: any): { x: number; y: number } => {
    // geika-31用の配置計算（必要に応じて実装）
    // 現在はgeika-32と同じロジックを使用
    return calculateGeika32Position(placement)
  }

  const getDefaultPosition = (): { x: number; y: number } => {
    return { x: 400, y: 300 }
  }

  return {
    getCirclePosition,
    calculatePositionFromPlacement,
    getDefaultPosition
  }
}

