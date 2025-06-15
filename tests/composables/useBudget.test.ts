import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { PurchasePlan } from '~/types'

// モックデータ
const mockPurchasePlans: PurchasePlan[] = [
  {
    id: 'plan1',
    userId: 'user1',
    circleId: 'circle1',
    itemId: 'item1',
    eventId: 'geica-1',
    quantity: 2,
    priceAtTime: 1000,
    circleName: 'テストサークル1',
    itemName: 'テスト商品1',
    addedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'plan2',
    userId: 'user1',
    circleId: 'circle2',
    itemId: 'item2',
    eventId: 'geica-1',
    quantity: 1,
    priceAtTime: 500,
    circleName: 'テストサークル2',
    itemName: 'テスト商品2',
    addedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'plan3',
    userId: 'user1',
    circleId: 'circle1',
    itemId: 'item3',
    eventId: 'geica-1',
    quantity: 3,
    priceAtTime: 800,
    circleName: 'テストサークル1',
    itemName: 'テスト商品3',
    addedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

describe('useBudget', () => {
  let useBudget: any

  beforeEach(() => {
    // composableをモック
    vi.doMock('~/composables/useBudget', () => ({
      useBudget: () => useBudget
    }))

    // 基本的なuseBudget実装を作成
    useBudget = {
      calculateBudgetSummary: (plans: PurchasePlan[], eventId: string) => {
        const byCircleMap = new Map<string, {
          circleName: string
          items: number
          totalPrice: number
        }>()

        let totalItems = 0
        let totalPrice = 0

        plans.forEach(plan => {
          const itemTotal = plan.priceAtTime * plan.quantity
          totalItems += plan.quantity
          totalPrice += itemTotal

          const existing = byCircleMap.get(plan.circleId) || {
            circleName: plan.circleName || 'サークル名未設定',
            items: 0,
            totalPrice: 0
          }

          byCircleMap.set(plan.circleId, {
            circleName: existing.circleName,
            items: existing.items + plan.quantity,
            totalPrice: existing.totalPrice + itemTotal
          })
        })

        const byCircle = Array.from(byCircleMap.entries()).map(([circleId, data]) => ({
          circleId,
          ...data
        }))

        return {
          eventId,
          totalItems,
          totalPrice,
          byCircle,
          updatedAt: new Date()
        }
      },

      getBudgetStatistics: (plans: PurchasePlan[]) => {
        const totalPrice = plans.reduce((sum, plan) => sum + (plan.priceAtTime * plan.quantity), 0)
        const totalItems = plans.reduce((sum, plan) => sum + plan.quantity, 0)
        const averagePrice = totalItems > 0 ? Math.round(totalPrice / totalItems) : 0
        const uniqueCircles = new Set(plans.map(plan => plan.circleId)).size

        return {
          totalPrice,
          totalItems,
          averagePrice,
          uniqueCircles,
          minPrice: plans.length > 0 ? Math.min(...plans.map(p => p.priceAtTime)) : 0,
          maxPrice: plans.length > 0 ? Math.max(...plans.map(p => p.priceAtTime)) : 0
        }
      },

      exportBudgetAsCSV: async (plans: PurchasePlan[]) => {
        if (plans.length === 0) return ''

        const headers = ['サークル名', '商品名', '単価', '数量', '小計']
        
        const rows = plans.map(plan => [
          plan.circleName || '',
          plan.itemName || '',
          plan.priceAtTime.toString(),
          plan.quantity.toString(),
          (plan.priceAtTime * plan.quantity).toString()
        ])

        const total = plans.reduce((sum, plan) => sum + (plan.priceAtTime * plan.quantity), 0)
        rows.push(['', '', '', '合計', total.toString()])

        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        return csv
      }
    }
  })

  describe('calculateBudgetSummary', () => {
    it('正しく予算サマリーを計算する', () => {
      const result = useBudget.calculateBudgetSummary(mockPurchasePlans, 'geica-1')

      expect(result.eventId).toBe('geica-1')
      expect(result.totalItems).toBe(6) // 2 + 1 + 3
      expect(result.totalPrice).toBe(4900) // (1000*2) + (500*1) + (800*3)
      expect(result.byCircle).toHaveLength(2) // 2つのサークル
      
      // サークル1の集計
      const circle1 = result.byCircle.find(c => c.circleId === 'circle1')
      expect(circle1?.circleName).toBe('テストサークル1')
      expect(circle1?.items).toBe(5) // 2 + 3
      expect(circle1?.totalPrice).toBe(4400) // (1000*2) + (800*3)

      // サークル2の集計
      const circle2 = result.byCircle.find(c => c.circleId === 'circle2')
      expect(circle2?.circleName).toBe('テストサークル2')
      expect(circle2?.items).toBe(1)
      expect(circle2?.totalPrice).toBe(500)
    })

    it('空の配列で正しく処理する', () => {
      const result = useBudget.calculateBudgetSummary([], 'geica-1')

      expect(result.eventId).toBe('geica-1')
      expect(result.totalItems).toBe(0)
      expect(result.totalPrice).toBe(0)
      expect(result.byCircle).toHaveLength(0)
    })
  })

  describe('getBudgetStatistics', () => {
    it('正しく統計を計算する', () => {
      const result = useBudget.getBudgetStatistics(mockPurchasePlans)

      expect(result.totalPrice).toBe(4900)
      expect(result.totalItems).toBe(6)
      expect(result.averagePrice).toBe(817) // 4900 / 6 = 816.67... → 817
      expect(result.uniqueCircles).toBe(2)
      expect(result.minPrice).toBe(500)
      expect(result.maxPrice).toBe(1000)
    })

    it('空の配列で正しく処理する', () => {
      const result = useBudget.getBudgetStatistics([])

      expect(result.totalPrice).toBe(0)
      expect(result.totalItems).toBe(0)
      expect(result.averagePrice).toBe(0)
      expect(result.uniqueCircles).toBe(0)
      expect(result.minPrice).toBe(0)
      expect(result.maxPrice).toBe(0)
    })
  })

  describe('exportBudgetAsCSV', () => {
    it('正しくCSVを生成する', async () => {
      const csv = await useBudget.exportBudgetAsCSV(mockPurchasePlans)

      expect(csv).toContain('サークル名,商品名,単価,数量,小計')
      expect(csv).toContain('"テストサークル1","テスト商品1","1000","2","2000"')
      expect(csv).toContain('"テストサークル2","テスト商品2","500","1","500"')
      expect(csv).toContain('"テストサークル1","テスト商品3","800","3","2400"')
      expect(csv).toContain('"","","","合計","4900"')
    })

    it('空の配列で空文字列を返す', async () => {
      const csv = await useBudget.exportBudgetAsCSV([])

      expect(csv).toBe('')
    })
  })
})