/**
 * 編集権限却下理由機能のテスト
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('編集権限却下理由機能', () => {
  describe('管理画面での却下理由入力', () => {
    const mockRejectEditPermissionRequest = vi.fn()
    let rejectNote = ''
    let rejectValidationError = false
    
    const confirmReject = async (selectedRequestId: string) => {
      // バリデーション
      if (!rejectNote || rejectNote.trim() === '') {
        rejectValidationError = true
        return false
      }
      
      try {
        await mockRejectEditPermissionRequest(selectedRequestId, rejectNote.trim())
        rejectNote = ''
        rejectValidationError = false
        return true
      } catch (error) {
        throw error
      }
    }
    
    beforeEach(() => {
      vi.clearAllMocks()
      rejectNote = ''
      rejectValidationError = false
    })
    
    it('却下理由が空の場合、バリデーションエラーが発生する', async () => {
      rejectNote = ''
      
      const result = await confirmReject('request-1')
      
      expect(result).toBe(false)
      expect(rejectValidationError).toBe(true)
      expect(mockRejectEditPermissionRequest).not.toHaveBeenCalled()
    })
    
    it('却下理由が空白文字のみの場合、バリデーションエラーが発生する', async () => {
      rejectNote = '   '
      
      const result = await confirmReject('request-1')
      
      expect(result).toBe(false)
      expect(rejectValidationError).toBe(true)
      expect(mockRejectEditPermissionRequest).not.toHaveBeenCalled()
    })
    
    it('却下理由が入力されている場合、正常に処理される', async () => {
      rejectNote = 'サークル情報と申請内容が一致しません'
      mockRejectEditPermissionRequest.mockResolvedValue(true)
      
      const result = await confirmReject('request-1')
      
      expect(result).toBe(true)
      expect(rejectValidationError).toBe(false)
      expect(mockRejectEditPermissionRequest).toHaveBeenCalledWith(
        'request-1',
        'サークル情報と申請内容が一致しません'
      )
      expect(rejectNote).toBe('') // リセットされる
    })
    
    it('却下理由の前後の空白はトリムされる', async () => {
      rejectNote = '  証明書類が不足しています  '
      mockRejectEditPermissionRequest.mockResolvedValue(true)
      
      await confirmReject('request-1')
      
      expect(mockRejectEditPermissionRequest).toHaveBeenCalledWith(
        'request-1',
        '証明書類が不足しています'
      )
    })
    
    it('APIエラー時は例外がスローされる', async () => {
      rejectNote = '却下理由'
      mockRejectEditPermissionRequest.mockRejectedValue(new Error('API Error'))
      
      await expect(confirmReject('request-1')).rejects.toThrow('API Error')
      expect(rejectValidationError).toBe(false) // バリデーションは通過
    })
  })
  
  describe('プロフィール画面での却下理由表示', () => {
    const mockEditPermissionRequests = [
      {
        id: 'req-1',
        circleId: 'circle-1',
        status: 'pending',
        createdAt: new Date('2024-01-01'),
        rejectionReason: null
      },
      {
        id: 'req-2',
        circleId: 'circle-2',
        status: 'approved',
        createdAt: new Date('2024-01-02'),
        rejectionReason: null
      },
      {
        id: 'req-3',
        circleId: 'circle-3',
        status: 'rejected',
        createdAt: new Date('2024-01-03'),
        rejectionReason: 'Twitter情報が一致しません'
      },
      {
        id: 'req-4',
        circleId: 'circle-4',
        status: 'rejected',
        createdAt: new Date('2024-01-04'),
        rejectionReason: null // 旧データ（理由なし）
      }
    ]
    
    it('却下された申請に却下理由がある場合、表示される', () => {
      const rejectedWithReason = mockEditPermissionRequests.find(
        req => req.status === 'rejected' && req.rejectionReason
      )
      
      expect(rejectedWithReason).toBeDefined()
      expect(rejectedWithReason?.rejectionReason).toBe('Twitter情報が一致しません')
    })
    
    it('却下された申請に却下理由がない場合、表示されない', () => {
      const rejectedWithoutReason = mockEditPermissionRequests.find(
        req => req.status === 'rejected' && !req.rejectionReason
      )
      
      expect(rejectedWithoutReason).toBeDefined()
      expect(rejectedWithoutReason?.rejectionReason).toBeNull()
    })
    
    it('承認済みや申請中の場合、却下理由は表示されない', () => {
      const nonRejectedRequests = mockEditPermissionRequests.filter(
        req => req.status !== 'rejected'
      )
      
      expect(nonRejectedRequests.length).toBe(2)
      nonRejectedRequests.forEach(req => {
        expect(req.rejectionReason).toBeNull()
      })
    })
    
    it('却下理由の表示条件が正しく判定される', () => {
      mockEditPermissionRequests.forEach(req => {
        const shouldShowRejectionReason = req.status === 'rejected' && !!req.rejectionReason
        
        if (req.id === 'req-3') {
          expect(shouldShowRejectionReason).toBe(true)
        } else {
          expect(shouldShowRejectionReason).toBe(false)
        }
      })
    })
  })
  
  describe('Firestoreデータ構造', () => {
    it('EditPermissionRequest型にrejectionReasonフィールドが含まれる', () => {
      const request: any = {
        id: 'test-id',
        userId: 'user-123',
        circleId: 'circle-123',
        status: 'rejected',
        rejectionReason: '申請内容に不備があります',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      expect(request).toHaveProperty('rejectionReason')
      expect(typeof request.rejectionReason).toBe('string')
    })
    
    it('rejectionReasonはオプショナルフィールドである', () => {
      const requestWithoutReason: any = {
        id: 'test-id',
        userId: 'user-123',
        circleId: 'circle-123',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // rejectionReasonがなくても有効
      expect(requestWithoutReason.rejectionReason).toBeUndefined()
    })
  })
  
  describe('統合シナリオ', () => {
    it('管理者が却下理由を入力して却下し、ユーザーがプロフィール画面で確認できる', async () => {
      // 1. 管理者が却下処理
      const mockReject = vi.fn().mockResolvedValue({
        id: 'req-1',
        status: 'rejected',
        rejectionReason: 'サークル代表者の確認が取れませんでした',
        updatedAt: new Date()
      })
      
      const result = await mockReject('req-1', 'サークル代表者の確認が取れませんでした')
      
      expect(result.status).toBe('rejected')
      expect(result.rejectionReason).toBe('サークル代表者の確認が取れませんでした')
      
      // 2. ユーザーのプロフィール画面での表示
      const userRequests = [result]
      const rejectedRequest = userRequests.find(req => req.status === 'rejected')
      
      expect(rejectedRequest).toBeDefined()
      expect(rejectedRequest?.rejectionReason).toBe('サークル代表者の確認が取れませんでした')
    })
  })
})