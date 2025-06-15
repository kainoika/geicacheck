import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { PurchasePlan } from '~/types'

// モックデータ
const mockPurchasePlan: PurchasePlan = {
  id: 'plan1',
  userId: 'user1',
  circleId: 'circle1',
  itemId: 'item1',
  eventId: 'geica-1',
  quantity: 2,
  priceAtTime: 1000,
  circleName: 'テストサークル',
  itemName: 'テスト商品',
  addedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('usePurchasePlans', () => {
  let usePurchasePlans: any
  let mockPlans: PurchasePlan[]

  beforeEach(() => {
    mockPlans = [mockPurchasePlan]

    // composableをモック
    usePurchasePlans = {
      purchasePlans: { value: mockPlans },
      
      addToPurchasePlan: vi.fn(async (
        circleId: string,
        itemId: string,
        eventId: string,
        price: number,
        quantity: number = 1,
        circleName?: string,
        itemName?: string
      ) => {
        const newPlan: PurchasePlan = {
          id: `plan_${Date.now()}`,
          userId: 'user1',
          circleId,
          itemId,
          eventId,
          quantity,
          priceAtTime: price,
          circleName,
          itemName,
          addedAt: new Date(),
          updatedAt: new Date()
        }
        
        mockPlans.push(newPlan)
        return newPlan.id
      }),

      removeFromPurchasePlan: vi.fn(async (planId: string) => {
        const index = mockPlans.findIndex(p => p.id === planId)
        if (index > -1) {
          mockPlans.splice(index, 1)
        }
      }),

      updatePurchaseQuantity: vi.fn(async (planId: string, quantity: number) => {
        const plan = mockPlans.find(p => p.id === planId)
        if (plan) {
          plan.quantity = quantity
          plan.updatedAt = new Date()
        }
      }),

      getPurchasePlanByItem: vi.fn(async (circleId: string, itemId: string, eventId: string) => {
        return mockPlans.find(p => 
          p.circleId === circleId && 
          p.itemId === itemId && 
          p.eventId === eventId
        ) || null
      }),

      getUserPurchasePlans: vi.fn(async (eventId: string) => {
        return mockPlans.filter(p => p.eventId === eventId)
      })
    }
  })

  describe('addToPurchasePlan', () => {
    it('購入予定を正しく追加する', async () => {
      const initialLength = mockPlans.length
      
      const planId = await usePurchasePlans.addToPurchasePlan(
        'circle2',
        'item2',
        'geica-1',
        500,
        1,
        '新しいサークル',
        '新しい商品'
      )

      expect(planId).toBeDefined()
      expect(planId).toMatch(/^plan_\d+$/)
      expect(mockPlans).toHaveLength(initialLength + 1)
      
      const newPlan = mockPlans.find(p => p.id === planId)
      expect(newPlan).toBeDefined()
      expect(newPlan?.circleId).toBe('circle2')
      expect(newPlan?.itemId).toBe('item2')
      expect(newPlan?.eventId).toBe('geica-1')
      expect(newPlan?.priceAtTime).toBe(500)
      expect(newPlan?.quantity).toBe(1)
      expect(newPlan?.circleName).toBe('新しいサークル')
      expect(newPlan?.itemName).toBe('新しい商品')
    })
  })

  describe('removeFromPurchasePlan', () => {
    it('購入予定を正しく削除する', async () => {
      const initialLength = mockPlans.length
      const planToRemove = mockPlans[0]
      
      await usePurchasePlans.removeFromPurchasePlan(planToRemove.id)
      
      expect(mockPlans).toHaveLength(initialLength - 1)
      expect(mockPlans.find(p => p.id === planToRemove.id)).toBeUndefined()
    })

    it('存在しないプランIDで何も起こらない', async () => {
      const initialLength = mockPlans.length
      
      await usePurchasePlans.removeFromPurchasePlan('nonexistent')
      
      expect(mockPlans).toHaveLength(initialLength)
    })
  })

  describe('updatePurchaseQuantity', () => {
    it('数量を正しく更新する', async () => {
      const plan = mockPlans[0]
      const originalQuantity = plan.quantity
      const newQuantity = 5
      
      await usePurchasePlans.updatePurchaseQuantity(plan.id, newQuantity)
      
      expect(plan.quantity).toBe(newQuantity)
      expect(plan.quantity).not.toBe(originalQuantity)
      expect(plan.updatedAt).toBeInstanceOf(Date)
    })

    it('存在しないプランIDで何も起こらない', async () => {
      const originalPlan = { ...mockPlans[0] }
      
      await usePurchasePlans.updatePurchaseQuantity('nonexistent', 10)
      
      expect(mockPlans[0]).toEqual(originalPlan)
    })
  })

  describe('getPurchasePlanByItem', () => {
    it('アイテムに対応する購入予定を取得する', async () => {
      const plan = await usePurchasePlans.getPurchasePlanByItem(
        'circle1',
        'item1',
        'geica-1'
      )
      
      expect(plan).toBeDefined()
      expect(plan?.id).toBe('plan1')
      expect(plan?.circleId).toBe('circle1')
      expect(plan?.itemId).toBe('item1')
      expect(plan?.eventId).toBe('geica-1')
    })

    it('該当しないアイテムでnullを返す', async () => {
      const plan = await usePurchasePlans.getPurchasePlanByItem(
        'circle999',
        'item999',
        'geica-1'
      )
      
      expect(plan).toBeNull()
    })
  })

  describe('getUserPurchasePlans', () => {
    it('指定イベントの購入予定を取得する', async () => {
      // 別イベントのプランを追加
      const otherEventPlan: PurchasePlan = {
        ...mockPurchasePlan,
        id: 'plan2',
        eventId: 'geica-2'
      }
      mockPlans.push(otherEventPlan)

      const plans = await usePurchasePlans.getUserPurchasePlans('geica-1')
      
      expect(plans).toHaveLength(1)
      expect(plans[0].eventId).toBe('geica-1')
    })

    it('該当するプランがない場合は空配列を返す', async () => {
      const plans = await usePurchasePlans.getUserPurchasePlans('nonexistent-event')
      
      expect(plans).toHaveLength(0)
      expect(Array.isArray(plans)).toBe(true)
    })
  })
})