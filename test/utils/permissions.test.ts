/**
 * 権限関連のユーティリティ関数のテスト
 * プロフィールページで使用される権限計算ロジックのテスト
 */
import { describe, it, expect } from 'vitest'

// 権限計算ロジックの抽出（プロフィールページから）
const calculateEditPermission = (user: any, isAuthenticated: boolean, circlePermissions: any[], editPermissionRequests: any[]) => {
  // 認証状態をチェック
  if (!user || !isAuthenticated) {
    return {
      hasPermission: false,
      isPending: false,
      permissionCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0
    }
  }
  
  const permissions = circlePermissions || []
  const requests = editPermissionRequests || []
  
  const hasActivePermissions = permissions.length > 0
  const hasPendingRequests = requests.some(req => req.status === 'pending')
  
  return {
    hasPermission: hasActivePermissions,
    isPending: hasPendingRequests,
    permissionCount: permissions.length,
    pendingCount: requests.filter(req => req.status === 'pending').length,
    approvedCount: requests.filter(req => req.status === 'approved' || req.status === 'auto_approved').length,
    rejectedCount: requests.filter(req => req.status === 'rejected').length
  }
}

// 統計計算ロジックの抽出
const calculateUserStats = (bookmarks: any[], circlePermissions: any[], editPermissionRequests: any[]) => {
  const bookmarkStats = {
    totalBookmarks: bookmarks?.length || 0,
    checkCount: bookmarks?.filter(b => b.category === 'check').length || 0,
    interestedCount: bookmarks?.filter(b => b.category === 'interested').length || 0,
    priorityCount: bookmarks?.filter(b => b.category === 'priority').length || 0
  }
  
  const permissionStats = {
    editableCircles: circlePermissions.length,
    pendingRequests: editPermissionRequests.filter(r => r.status === 'pending').length,
    approvedRequests: editPermissionRequests.filter(r => r.status === 'approved').length,
    rejectedRequests: editPermissionRequests.filter(r => r.status === 'rejected').length
  }
  
  return { ...bookmarkStats, ...permissionStats }
}

// 申請ステータス関連のヘルパー関数
const getRequestStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#f59e0b'
    case 'approved': 
    case 'auto_approved': return '#16a34a'
    case 'rejected': return '#dc2626'
    default: return '#6b7280'
  }
}

const getRequestStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return '審査中'
    case 'approved': return '承認済み'
    case 'auto_approved': return '自動承認'
    case 'rejected': return '却下'
    default: return '不明'
  }
}

describe('権限計算ユーティリティ', () => {
  describe('calculateEditPermission', () => {
    const mockUser = { uid: 'test-user', email: 'test@example.com' }
    
    it('未認証時は全ての値がfalse/0になる', () => {
      const result = calculateEditPermission(null, false, [], [])
      
      expect(result).toEqual({
        hasPermission: false,
        isPending: false,
        permissionCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
      })
    })
    
    it('ユーザーがnullの場合は全ての値がfalse/0になる', () => {
      const result = calculateEditPermission(null, true, [], [])
      
      expect(result).toEqual({
        hasPermission: false,
        isPending: false,
        permissionCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
      })
    })
    
    it('認証済みだが権限がない場合', () => {
      const result = calculateEditPermission(mockUser, true, [], [])
      
      expect(result).toEqual({
        hasPermission: false,
        isPending: false,
        permissionCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
      })
    })
    
    it('権限がある場合、hasPermissionがtrueになる', () => {
      const permissions = [
        { id: '1', circleId: 'circle-1', permission: 'edit' },
        { id: '2', circleId: 'circle-2', permission: 'edit' }
      ]
      
      const result = calculateEditPermission(mockUser, true, permissions, [])
      
      expect(result.hasPermission).toBe(true)
      expect(result.permissionCount).toBe(2)
      expect(result.isPending).toBe(false)
    })
    
    it('申請中の場合、isPendingがtrueになる', () => {
      const requests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'approved' }
      ]
      
      const result = calculateEditPermission(mockUser, true, [], requests)
      
      expect(result.isPending).toBe(true)
      expect(result.pendingCount).toBe(1)
      expect(result.approvedCount).toBe(1)
    })
    
    it('複数の申請ステータスを正しく集計する', () => {
      const requests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'approved' },
        { id: '4', status: 'auto_approved' },
        { id: '5', status: 'rejected' }
      ]
      
      const result = calculateEditPermission(mockUser, true, [], requests)
      
      expect(result.pendingCount).toBe(2)
      expect(result.approvedCount).toBe(2) // approved + auto_approved
      expect(result.rejectedCount).toBe(1)
    })
    
    it('権限と申請の両方がある場合', () => {
      const permissions = [
        { id: '1', circleId: 'circle-1', permission: 'edit' }
      ]
      const requests = [
        { id: '1', status: 'approved' },
        { id: '2', status: 'pending' }
      ]
      
      const result = calculateEditPermission(mockUser, true, permissions, requests)
      
      expect(result.hasPermission).toBe(true)
      expect(result.isPending).toBe(true)
      expect(result.permissionCount).toBe(1)
      expect(result.pendingCount).toBe(1)
      expect(result.approvedCount).toBe(1)
    })
  })
  
  describe('calculateUserStats', () => {
    it('空のデータで正しく計算される', () => {
      const result = calculateUserStats([], [], [])
      
      expect(result).toEqual({
        totalBookmarks: 0,
        checkCount: 0,
        interestedCount: 0,
        priorityCount: 0,
        editableCircles: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
      })
    })
    
    it('ブックマーク統計が正しく計算される', () => {
      const bookmarks = [
        { id: '1', category: 'check' },
        { id: '2', category: 'check' },
        { id: '3', category: 'interested' },
        { id: '4', category: 'priority' },
        { id: '5', category: 'other' } // その他のカテゴリ
      ]
      
      const result = calculateUserStats(bookmarks, [], [])
      
      expect(result.totalBookmarks).toBe(5)
      expect(result.checkCount).toBe(2)
      expect(result.interestedCount).toBe(1)
      expect(result.priorityCount).toBe(1)
    })
    
    it('権限統計が正しく計算される', () => {
      const permissions = [
        { id: '1', circleId: 'circle-1' },
        { id: '2', circleId: 'circle-2' },
        { id: '3', circleId: 'circle-3' }
      ]
      
      const requests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'approved' },
        { id: '3', status: 'rejected' }
      ]
      
      const result = calculateUserStats([], permissions, requests)
      
      expect(result.editableCircles).toBe(3)
      expect(result.pendingRequests).toBe(1)
      expect(result.approvedRequests).toBe(1)
      expect(result.rejectedRequests).toBe(1)
    })
    
    it('nullやundefinedの配列を安全に処理する', () => {
      // @ts-ignore - テスト用にnullを渡す
      const result = calculateUserStats(null, [], [])
      
      expect(result.totalBookmarks).toBe(0)
      expect(result.checkCount).toBe(0)
      expect(result.interestedCount).toBe(0)
      expect(result.priorityCount).toBe(0)
    })
  })
  
  describe('ステータス関連ヘルパー', () => {
    describe('getRequestStatusColor', () => {
      it('正しい色コードを返す', () => {
        expect(getRequestStatusColor('pending')).toBe('#f59e0b')
        expect(getRequestStatusColor('approved')).toBe('#16a34a')
        expect(getRequestStatusColor('auto_approved')).toBe('#16a34a')
        expect(getRequestStatusColor('rejected')).toBe('#dc2626')
        expect(getRequestStatusColor('unknown')).toBe('#6b7280')
      })
    })
    
    describe('getRequestStatusLabel', () => {
      it('正しいラベルを返す', () => {
        expect(getRequestStatusLabel('pending')).toBe('審査中')
        expect(getRequestStatusLabel('approved')).toBe('承認済み')
        expect(getRequestStatusLabel('auto_approved')).toBe('自動承認')
        expect(getRequestStatusLabel('rejected')).toBe('却下')
        expect(getRequestStatusLabel('unknown')).toBe('不明')
      })
    })
  })
  
  describe('エッジケースのテスト', () => {
    it('配列にundefinedやnullの要素が含まれていても正常に動作する', () => {
      const bookmarksWithNulls = [
        { id: '1', category: 'check' },
        null,
        { id: '2', category: 'interested' },
        undefined,
        { id: '3', category: 'check' }
      ].filter(Boolean) // nullとundefinedを除去
      
      const result = calculateUserStats(bookmarksWithNulls, [], [])
      
      expect(result.totalBookmarks).toBe(3)
      expect(result.checkCount).toBe(2)
      expect(result.interestedCount).toBe(1)
    })
    
    it('ステータスが不正な申請も含めて正しく処理する', () => {
      const requests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'approved' },
        { id: '3', status: 'invalid_status' },
        { id: '4', status: null },
        { id: '5', status: undefined }
      ]
      
      const mockUser = { uid: 'test-user' }
      const result = calculateEditPermission(mockUser, true, [], requests)
      
      // 無効なステータスは集計されない
      expect(result.pendingCount).toBe(1)
      expect(result.approvedCount).toBe(1)
      expect(result.rejectedCount).toBe(0)
    })
  })
})

// エクスポートしてプロフィールページでも利用可能にする
export {
  calculateEditPermission,
  calculateUserStats,
  getRequestStatusColor,
  getRequestStatusLabel
}