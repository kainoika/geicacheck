import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useEventMap, useCircleMapping } from '~/composables/useEventMap'

// fetchのモック
global.fetch = vi.fn()

describe('useEventMap', () => {
  let eventMapHandler: ReturnType<typeof useEventMap>

  beforeEach(() => {
    eventMapHandler = useEventMap()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadEventMap', () => {
    it('SVGマップを正常に読み込む', async () => {
      const mockSvgContent = '<svg>test content</svg>'
      
      ;(fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockSvgContent)
      })

      const result = await eventMapHandler.loadEventMap('geika-32')

      expect(fetch).toHaveBeenCalledWith('/map-geika32.svg')
      expect(result).toBe(mockSvgContent)
      expect(eventMapHandler.currentMapContent.value).toBe(mockSvgContent)
      expect(eventMapHandler.isLoading.value).toBe(false)
      expect(eventMapHandler.error.value).toBe(null)
    })

    it('キャッシュから正しく取得する', async () => {
      const mockSvgContent = '<svg>cached content</svg>'
      
      // 最初の読み込み
      ;(fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockSvgContent)
      })

      await eventMapHandler.loadEventMap('geika-32')
      
      // fetchをクリア
      vi.clearAllMocks()
      
      // 2回目の読み込み（キャッシュから）
      const result = await eventMapHandler.loadEventMap('geika-32')

      expect(fetch).not.toHaveBeenCalled()
      expect(result).toBe(mockSvgContent)
    })

    it('ネットワークエラーを正しく処理する', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(eventMapHandler.loadEventMap('invalid-event'))
        .rejects.toThrow('Failed to fetch map: 404 Not Found')
      
      expect(eventMapHandler.error.value).toContain('マップの読み込みに失敗しました')
    })
  })

  describe('getMapFileName', () => {
    it('正しいファイル名を返す', () => {
      expect(eventMapHandler.getMapFileName('geika-31')).toBe('map-geika31.svg')
      expect(eventMapHandler.getMapFileName('geika-32')).toBe('map-geika32.svg')
      expect(eventMapHandler.getMapFileName('unknown')).toBe('map-geika32.svg') // デフォルト
    })
  })

  describe('preloadMaps', () => {
    it('複数のマップを事前読み込みする', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<svg>test</svg>')
      })

      await eventMapHandler.preloadMaps(['geika-31', 'geika-32'])

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenCalledWith('/map-geika31.svg')
      expect(fetch).toHaveBeenCalledWith('/map-geika32.svg')
    })
  })

  describe('cache management', () => {
    it('キャッシュ情報を正しく取得する', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<svg>test content</svg>')
      })

      await eventMapHandler.loadEventMap('geika-32')
      
      const cacheInfo = eventMapHandler.getCacheInfo()
      
      expect(cacheInfo.size).toBe(1)
      expect(cacheInfo.keys).toContain('geika-32')
      expect(cacheInfo.totalSize).toBeGreaterThan(0)
    })

    it('キャッシュをクリアする', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<svg>test</svg>')
      })

      await eventMapHandler.loadEventMap('geika-32')
      eventMapHandler.clearCache()
      
      const cacheInfo = eventMapHandler.getCacheInfo()
      expect(cacheInfo.size).toBe(0)
      expect(eventMapHandler.currentMapContent.value).toBe('')
    })
  })
})

describe('useCircleMapping', () => {
  let circleMappingHandler: ReturnType<typeof useCircleMapping>

  beforeEach(() => {
    circleMappingHandler = useCircleMapping()
  })

  describe('getCirclePosition', () => {
    const mockCircle = {
      id: 'test-circle',
      placement: {
        block: 'ア',
        number1: '01',
        number2: ''
      }
    }

    it('正常な配置で座標を取得する', () => {
      const position = circleMappingHandler.getCirclePosition(mockCircle, 'geika-32')
      
      expect(position).toEqual(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number)
        })
      )
    })

    it('みきエリアの座標を正しく計算する', () => {
      const mikuCircle = {
        ...mockCircle,
        placement: {
          block: 'み',
          number1: '01',
          number2: ''
        }
      }

      const position = circleMappingHandler.getCirclePosition(mikuCircle, 'geika-32')
      
      expect(position.x).toBe(85)
      expect(position.y).toBe(947)
    })

    it('無効な配置でデフォルト位置を返す', () => {
      const invalidCircle = {
        ...mockCircle,
        placement: {
          block: 'Invalid',
          number1: '999',
          number2: ''
        }
      }

      const position = circleMappingHandler.getCirclePosition(invalidCircle, 'geika-32')
      const defaultPosition = circleMappingHandler.getDefaultPosition()
      
      expect(position).toEqual(defaultPosition)
    })

    it('配置情報が未定義の場合デフォルト位置を返す', () => {
      const circleWithoutPlacement = {
        ...mockCircle,
        placement: undefined
      }

      const position = circleMappingHandler.getCirclePosition(circleWithoutPlacement as any, 'geika-32')
      const defaultPosition = circleMappingHandler.getDefaultPosition()
      
      expect(position).toEqual(defaultPosition)
    })
  })

  describe('getDefaultPosition', () => {
    it('デフォルト位置を返す', () => {
      const defaultPosition = circleMappingHandler.getDefaultPosition()
      
      expect(defaultPosition).toEqual({ x: 400, y: 300 })
    })
  })
})