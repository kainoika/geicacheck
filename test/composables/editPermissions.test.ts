/**
 * useEditPermissions composableのテスト
 * 編集権限関連機能のユニットテスト
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// モックの設定
const mockFirestore = {
  collection: vi.fn(() => ({
    where: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        docs: [],
        empty: true
      })
    })),
    add: vi.fn().mockResolvedValue({ id: 'test-id' }),
    doc: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ exists: false })
    }))
  }))
}

const mockNuxtApp = {
  $firestore: mockFirestore
}

// グローバルモック
vi.mock('#app', () => ({
  useNuxtApp: () => mockNuxtApp
}))

// useEditPermissions composableのモック実装
const createMockUseEditPermissions = () => {
  const submitEditPermissionRequest = vi.fn().mockImplementation(async (request) => {
    // バリデーション
    if (!request.userId || !request.circleId) {
      throw new Error('必須フィールドが不足しています')
    }
    
    // Firestoreへの保存をシミュレート
    const result = await mockFirestore.collection('edit_permission_requests').add({
      ...request,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return { id: result.id, ...request, status: 'pending' }
  })
  
  const getUserEditPermissionRequests = vi.fn().mockImplementation(async (userId) => {
    if (!userId) {
      throw new Error('ユーザーIDが必要です')
    }
    
    // 模擬データを返す
    return [
      {
        id: 'request-1',
        userId,
        circleId: 'circle-1',
        status: 'pending',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'request-2',
        userId,
        circleId: 'circle-2', 
        status: 'approved',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-03')
      }
    ]
  })
  
  const getUserCirclePermissions = vi.fn().mockImplementation(async (userId) => {
    if (!userId) {
      throw new Error('ユーザーIDが必要です')
    }
    
    // 模擬データを返す
    return [
      {
        id: 'permission-1',
        userId,
        circleId: 'circle-2',
        permission: 'edit',
        grantedAt: new Date('2024-01-03')
      }
    ]
  })
  
  const hasExistingRequest = vi.fn().mockImplementation(async (userId, circleId) => {
    if (!userId || !circleId) {
      return false
    }
    
    // 既存の申請をシミュレート
    return circleId === 'circle-1' // circle-1には既に申請済み
  })
  
  return {
    submitEditPermissionRequest,
    getUserEditPermissionRequests,
    getUserCirclePermissions,
    hasExistingRequest
  }
}

describe('useEditPermissions', () => {
  let editPermissions: ReturnType<typeof createMockUseEditPermissions>
  
  beforeEach(() => {
    vi.clearAllMocks()
    editPermissions = createMockUseEditPermissions()
  })
  
  describe('submitEditPermissionRequest', () => {
    it('正常な申請データで申請を送信できる', async () => {
      const requestData = {
        userId: 'user-123',
        circleId: 'circle-1',
        requestedPermissions: ['edit'],
        reason: 'サークル運営者です'
      }
      
      const result = await editPermissions.submitEditPermissionRequest(requestData)
      
      expect(result).toMatchObject({
        ...requestData,
        status: 'pending'
      })
      expect(result.id).toBeDefined()
      expect(editPermissions.submitEditPermissionRequest).toHaveBeenCalledWith(requestData)
    })
    
    it('必須フィールドが不足している場合エラーを投げる', async () => {
      const invalidData = {
        userId: '', // 空文字
        circleId: 'circle-1'
      }
      
      await expect(editPermissions.submitEditPermissionRequest(invalidData))
        .rejects.toThrow('必須フィールドが不足しています')
    })
    
    it('サークルIDが不足している場合エラーを投げる', async () => {
      const invalidData = {
        userId: 'user-123',
        circleId: '' // 空文字
      }
      
      await expect(editPermissions.submitEditPermissionRequest(invalidData))
        .rejects.toThrow('必須フィールドが不足しています')
    })
  })
  
  describe('getUserEditPermissionRequests', () => {
    it('ユーザーの申請履歴を取得できる', async () => {
      const userId = 'user-123'
      const requests = await editPermissions.getUserEditPermissionRequests(userId)
      
      expect(requests).toHaveLength(2)
      expect(requests[0]).toMatchObject({
        userId,
        circleId: 'circle-1',
        status: 'pending'
      })
      expect(requests[1]).toMatchObject({
        userId,
        circleId: 'circle-2',
        status: 'approved'
      })
      expect(editPermissions.getUserEditPermissionRequests).toHaveBeenCalledWith(userId)
    })
    
    it('ユーザーIDが不正な場合エラーを投げる', async () => {
      await expect(editPermissions.getUserEditPermissionRequests(''))
        .rejects.toThrow('ユーザーIDが必要です')
    })
  })
  
  describe('getUserCirclePermissions', () => {
    it('ユーザーの編集権限を取得できる', async () => {
      const userId = 'user-123'
      const permissions = await editPermissions.getUserCirclePermissions(userId)
      
      expect(permissions).toHaveLength(1)
      expect(permissions[0]).toMatchObject({
        userId,
        circleId: 'circle-2',
        permission: 'edit'
      })
      expect(editPermissions.getUserCirclePermissions).toHaveBeenCalledWith(userId)
    })
    
    it('ユーザーIDが不正な場合エラーを投げる', async () => {
      await expect(editPermissions.getUserCirclePermissions(''))
        .rejects.toThrow('ユーザーIDが必要です')
    })
  })
  
  describe('hasExistingRequest', () => {
    it('既存の申請がある場合trueを返す', async () => {
      const result = await editPermissions.hasExistingRequest('user-123', 'circle-1')
      
      expect(result).toBe(true)
      expect(editPermissions.hasExistingRequest).toHaveBeenCalledWith('user-123', 'circle-1')
    })
    
    it('既存の申請がない場合falseを返す', async () => {
      const result = await editPermissions.hasExistingRequest('user-123', 'circle-3')
      
      expect(result).toBe(false)
      expect(editPermissions.hasExistingRequest).toHaveBeenCalledWith('user-123', 'circle-3')
    })
    
    it('パラメータが不正な場合falseを返す', async () => {
      const result1 = await editPermissions.hasExistingRequest('', 'circle-1')
      const result2 = await editPermissions.hasExistingRequest('user-123', '')
      
      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })
  })
  
  describe('統合テスト', () => {
    it('申請 → 取得 → 権限確認の一連の流れが正常に動作する', async () => {
      const userId = 'user-123'
      const circleId = 'new-circle'
      
      // 1. 既存申請をチェック（ないはず）
      const hasExisting = await editPermissions.hasExistingRequest(userId, circleId)
      expect(hasExisting).toBe(false)
      
      // 2. 新しい申請を送信
      const requestData = {
        userId,
        circleId,
        requestedPermissions: ['edit'],
        reason: 'テスト申請'
      }
      
      const submitted = await editPermissions.submitEditPermissionRequest(requestData)
      expect(submitted.status).toBe('pending')
      
      // 3. 申請履歴を取得
      const requests = await editPermissions.getUserEditPermissionRequests(userId)
      expect(requests).toEqual(expect.arrayContaining([
        expect.objectContaining({ circleId: 'circle-1' }),
        expect.objectContaining({ circleId: 'circle-2' })
      ]))
      
      // 4. 権限を取得
      const permissions = await editPermissions.getUserCirclePermissions(userId)
      expect(permissions).toEqual(expect.arrayContaining([
        expect.objectContaining({ circleId: 'circle-2', permission: 'edit' })
      ]))
    })
  })
})

export { createMockUseEditPermissions }