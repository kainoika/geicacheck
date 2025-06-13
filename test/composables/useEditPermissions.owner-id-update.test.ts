import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDoc, updateDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'

// モックを先に設定
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $firestore: {}
  })
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn()
}))

vi.mock('~/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { value: { uid: 'admin123' } }
  }))
}))

// モック設定後にインポート
const { useEditPermissions } = await import('~/composables/useEditPermissions')

describe('useEditPermissions - ownerId更新', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('grantCirclePermission', () => {
    it('権限付与時にサークルのownerIdを更新する', async () => {
      const mockAddDoc = vi.mocked(addDoc)
      const mockUpdateDoc = vi.mocked(updateDoc)
      const mockDoc = vi.mocked(doc)
      
      mockAddDoc.mockResolvedValue({ id: 'permission123' } as any)
      mockDoc.mockReturnValue({ id: 'mockDocRef' } as any)

      const { grantCirclePermission } = useEditPermissions()
      
      await grantCirclePermission('user123', 'geika32-038', 'editor')

      // circle_permissionsへの追加を確認
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          circleId: 'geika32-038',
          permission: 'editor',
          grantedBy: 'admin123',
          isActive: true
        })
      )

      // サークルのownerId更新を確認
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'events',
        'geika-32',
        'circles',
        'geika32-038'
      )
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ownerId: 'user123',
          updatedAt: serverTimestamp()
        })
      )
    })

    it('circleIdの形式が異なる場合はownerId更新をスキップする', async () => {
      const mockAddDoc = vi.mocked(addDoc)
      const mockUpdateDoc = vi.mocked(updateDoc)
      
      mockAddDoc.mockResolvedValue({ id: 'permission123' } as any)

      const { grantCirclePermission } = useEditPermissions()
      
      await grantCirclePermission('user123', 'invalid-format-123', 'editor')

      // circle_permissionsへの追加は実行される
      expect(mockAddDoc).toHaveBeenCalled()
      
      // ownerIdの更新は実行されない
      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })

    it('ownerId更新に失敗しても権限付与は成功する', async () => {
      const mockAddDoc = vi.mocked(addDoc)
      const mockUpdateDoc = vi.mocked(updateDoc)
      const mockDoc = vi.mocked(doc)
      
      mockAddDoc.mockResolvedValue({ id: 'permission123' } as any)
      mockDoc.mockReturnValue({ id: 'mockDocRef' } as any)
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'))

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { grantCirclePermission } = useEditPermissions()
      
      // エラーが発生しても例外をthrowしない
      await expect(
        grantCirclePermission('user123', 'geika32-038', 'editor')
      ).resolves.not.toThrow()

      // エラーログが出力される
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'サークルのownerId更新エラー:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('approveEditPermissionRequest', () => {
    it('申請承認時にgrantCirclePermissionが呼ばれる', async () => {
      const mockGetDoc = vi.mocked(getDoc)
      const mockUpdateDoc = vi.mocked(updateDoc)
      const mockAddDoc = vi.mocked(addDoc)
      const mockDoc = vi.mocked(doc)
      
      // リクエスト情報のモック
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          userId: 'user123',
          circleId: 'geika32-038'
        })
      } as any)
      
      mockDoc.mockReturnValue({ id: 'mockDocRef' } as any)
      mockAddDoc.mockResolvedValue({ id: 'permission123' } as any)

      const { approveEditPermissionRequest } = useEditPermissions()
      
      await approveEditPermissionRequest('request123')

      // 申請の更新
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'approved',
          approvedBy: 'admin123'
        })
      )

      // 権限付与（grantCirclePermissionが呼ばれる）
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          circleId: 'geika32-038',
          permission: 'editor'
        })
      )

      // サークルのownerId更新も含まれる
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ownerId: 'user123'
        })
      )
    })
  })
})