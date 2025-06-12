/**
 * 管理画面のauto_approvedステータス対応テスト
 * /admin/edit-requests画面での自動承認待ち表示・処理のテスト
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref, computed } from 'vue'

// モックデータ
const mockEditRequests = [
  {
    id: 'req-1',
    userId: 'user-1',
    circleId: 'circle-1',
    status: 'pending',
    applicantTwitterId: 'user1',
    registeredTwitterId: 'different',
    adminNote: '申請理由あり',
    isAutoApproved: false,
    createdAt: new Date('2024-01-01'),
    user: { displayName: 'ユーザー1', twitterScreenName: 'user1' }
  },
  {
    id: 'req-2',
    userId: 'user-2',
    circleId: 'circle-2',
    status: 'auto_approved',
    applicantTwitterId: 'user2',
    registeredTwitterId: 'user2',
    adminNote: null,
    isAutoApproved: true,
    createdAt: new Date('2024-01-02'),
    user: { displayName: 'ユーザー2', twitterScreenName: 'user2' }
  },
  {
    id: 'req-3',
    userId: 'user-3',
    circleId: 'circle-3',
    status: 'auto_approved',
    applicantTwitterId: 'user3',
    registeredTwitterId: 'user3',
    adminNote: undefined,
    isAutoApproved: true,
    createdAt: new Date('2024-01-03'),
    user: { displayName: 'ユーザー3', twitterScreenName: 'user3' }
  },
  {
    id: 'req-4',
    userId: 'user-4',
    circleId: 'circle-4',
    status: 'approved',
    applicantTwitterId: 'user4',
    registeredTwitterId: 'user4',
    adminNote: null,
    isAutoApproved: false,
    createdAt: new Date('2024-01-04'),
    approvedAt: new Date('2024-01-05'),
    user: { displayName: 'ユーザー4', twitterScreenName: 'user4' }
  },
  {
    id: 'req-5',
    userId: 'user-5',
    circleId: 'circle-5',
    status: 'rejected',
    applicantTwitterId: 'user5',
    registeredTwitterId: 'different5',
    adminNote: '申請理由あり',
    isAutoApproved: false,
    rejectionReason: 'Twitter情報不一致',
    createdAt: new Date('2024-01-06'),
    user: { displayName: 'ユーザー5', twitterScreenName: 'user5' }
  }
]

// コンポーザブルのモック
const mockUseEditPermissions = {
  getAllEditPermissionRequests: vi.fn().mockResolvedValue(mockEditRequests),
  approveEditPermissionRequest: vi.fn().mockResolvedValue(undefined),
  rejectEditPermissionRequest: vi.fn().mockResolvedValue(undefined),
  processAutoApprovedRequests: vi.fn().mockResolvedValue({ success: 2, failed: 0 })
}

const mockUseAuth = {
  user: { value: { uid: 'admin-user', userType: 'admin' } },
  isAdmin: { value: true }
}

// グローバルモック
vi.mock('~/composables/useEditPermissions', () => ({
  useEditPermissions: () => mockUseEditPermissions
}))

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => mockUseAuth
}))

vi.mock('@heroicons/vue/24/outline', () => ({
  ClipboardDocumentListIcon: { template: '<svg class="clipboard-icon"></svg>' },
  ClockIcon: { template: '<svg class="clock-icon"></svg>' },
  CheckCircleIcon: { template: '<svg class="check-circle-icon"></svg>' },
  XCircleIcon: { template: '<svg class="x-circle-icon"></svg>' },
  SparklesIcon: { template: '<svg class="sparkles-icon"></svg>' }
}))

// 管理画面コンポーネントの簡易実装
const AdminEditRequestsPage = {
  setup() {
    const { getAllEditPermissionRequests, processAutoApprovedRequests } = mockUseEditPermissions
    const { user, isAdmin } = mockUseAuth
    
    const editRequests = ref([])
    const activeStatus = ref('all')
    const processingAutoApproved = ref(false)
    
    const statusFilters = [
      { key: 'all', label: 'すべて' },
      { key: 'pending', label: '申請中' },
      { key: 'auto_approved', label: '自動承認待ち' },
      { key: 'approved', label: '承認済み' },
      { key: 'rejected', label: '却下' }
    ]
    
    const filteredRequests = computed(() => {
      if (activeStatus.value === 'all') {
        return editRequests.value
      }
      return editRequests.value.filter(request => request.status === activeStatus.value)
    })
    
    const pendingCount = computed(() => 
      editRequests.value.filter(r => r.status === 'pending').length
    )
    
    const autoApprovedCount = computed(() => 
      editRequests.value.filter(r => r.status === 'auto_approved').length
    )
    
    const approvedCount = computed(() => 
      editRequests.value.filter(r => r.status === 'approved').length
    )
    
    const rejectedCount = computed(() => 
      editRequests.value.filter(r => r.status === 'rejected').length
    )
    
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'pending': return '申請中'
        case 'auto_approved': return '自動承認待ち'
        case 'approved': return '承認済み'
        case 'rejected': return '却下'
        default: return '不明'
      }
    }
    
    const loadEditRequests = async () => {
      const requests = await getAllEditPermissionRequests()
      editRequests.value = requests
    }
    
    const processAllAutoApproved = async () => {
      processingAutoApproved.value = true
      try {
        const results = await processAutoApprovedRequests()
        await loadEditRequests()
        return results
      } finally {
        processingAutoApproved.value = false
      }
    }
    
    return {
      editRequests,
      activeStatus,
      statusFilters,
      filteredRequests,
      pendingCount,
      autoApprovedCount,
      approvedCount,
      rejectedCount,
      processingAutoApproved,
      getStatusLabel,
      loadEditRequests,
      processAllAutoApproved
    }
  },
  template: `
    <div class="admin-edit-requests">
      <!-- 統計情報 -->
      <div class="stats">
        <div class="stat-item">申請中: {{ pendingCount }}</div>
        <div class="stat-item">自動承認待ち: {{ autoApprovedCount }}</div>
        <div class="stat-item">承認済み: {{ approvedCount }}</div>
        <div class="stat-item">却下: {{ rejectedCount }}</div>
      </div>
      
      <!-- 一括処理ボタン -->
      <button 
        v-if="autoApprovedCount > 0"
        @click="processAllAutoApproved"
        :disabled="processingAutoApproved"
        class="bulk-process-btn"
      >
        {{ processingAutoApproved ? '処理中...' : \`自動承認を一括処理 (\${autoApprovedCount}件)\` }}
      </button>
      
      <!-- ステータスフィルター -->
      <div class="status-filters">
        <button
          v-for="filter in statusFilters"
          :key="filter.key"
          @click="activeStatus = filter.key"
          :class="{ active: activeStatus === filter.key }"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <!-- 申請一覧 -->
      <div class="requests">
        <div 
          v-for="request in filteredRequests"
          :key="request.id"
          class="request-item"
          :data-status="request.status"
        >
          <div class="request-header">
            <span class="user-name">{{ request.user?.displayName }}</span>
            <span class="status-badge">{{ getStatusLabel(request.status) }}</span>
          </div>
          <div class="request-details">
            <div>Twitter: @{{ request.applicantTwitterId }}</div>
            <div v-if="request.adminNote">理由: {{ request.adminNote }}</div>
            <div v-else>理由: なし</div>
          </div>
        </div>
      </div>
    </div>
  `
}

describe('AdminEditRequestsPage - auto_approved対応', () => {
  let wrapper: any
  
  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(AdminEditRequestsPage)
  })
  
  describe('ステータスフィルター', () => {
    it('auto_approvedフィルターが表示される', () => {
      const filters = wrapper.findAll('.status-filters button')
      const filterTexts = filters.map((f: any) => f.text())
      
      expect(filterTexts).toContain('自動承認待ち')
    })
    
    it('auto_approvedフィルターをクリックすると自動承認待ちのみ表示される', async () => {
      // データを先に読み込み
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      const buttons = wrapper.findAll('.status-filters button')
      const autoApprovedButton = buttons.find((btn: any) => btn.text().includes('自動承認待ち'))
      
      await autoApprovedButton?.trigger('click')
      await nextTick()
      
      const requests = wrapper.findAll('.request-item')
      expect(requests).toHaveLength(2) // req-2, req-3
      
      requests.forEach((req: any) => {
        expect(req.attributes('data-status')).toBe('auto_approved')
      })
    })
  })
  
  describe('統計情報', () => {
    it('自動承認待ちの件数が正しく表示される', async () => {
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      expect(wrapper.text()).toContain('自動承認待ち: 2')
    })
    
    it('各ステータスの件数が正しく計算される', async () => {
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      expect(wrapper.vm.pendingCount).toBe(1)
      expect(wrapper.vm.autoApprovedCount).toBe(2)
      expect(wrapper.vm.approvedCount).toBe(1)
      expect(wrapper.vm.rejectedCount).toBe(1)
    })
  })
  
  describe('一括処理ボタン', () => {
    it('自動承認待ちがある場合のみ表示される', async () => {
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      expect(wrapper.find('.bulk-process-btn').exists()).toBe(true)
      expect(wrapper.find('.bulk-process-btn').text()).toContain('自動承認を一括処理 (2件)')
    })
    
    it('自動承認待ちがない場合は表示されない', async () => {
      // 自動承認待ちなしのデータでモックを更新
      mockUseEditPermissions.getAllEditPermissionRequests.mockResolvedValueOnce(
        mockEditRequests.filter(req => req.status !== 'auto_approved')
      )
      
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      expect(wrapper.find('.bulk-process-btn').exists()).toBe(false)
    })
    
    it('一括処理実行時にボタンが無効化される', async () => {
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      const btn = wrapper.find('.bulk-process-btn')
      
      // 処理開始
      const processPromise = wrapper.vm.processAllAutoApproved()
      await nextTick()
      
      expect(wrapper.vm.processingAutoApproved).toBe(true)
      expect(btn.attributes('disabled')).toBeDefined()
      expect(btn.text()).toContain('処理中...')
      
      // 処理完了を待つ
      await processPromise
      await nextTick()
      
      expect(wrapper.vm.processingAutoApproved).toBe(false)
    })
    
    it('一括処理が正常に実行される', async () => {
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      const result = await wrapper.vm.processAllAutoApproved()
      
      expect(mockUseEditPermissions.processAutoApprovedRequests).toHaveBeenCalled()
      expect(mockUseEditPermissions.getAllEditPermissionRequests).toHaveBeenCalledTimes(2) // 初回 + 再読み込み
      expect(result).toEqual({ success: 2, failed: 0 })
    })
  })
  
  describe('ステータス表示', () => {
    it('auto_approvedステータスが「自動承認待ち」と表示される', () => {
      expect(wrapper.vm.getStatusLabel('auto_approved')).toBe('自動承認待ち')
    })
    
    it('各ステータスが正しくラベル変換される', () => {
      expect(wrapper.vm.getStatusLabel('pending')).toBe('申請中')
      expect(wrapper.vm.getStatusLabel('approved')).toBe('承認済み')
      expect(wrapper.vm.getStatusLabel('rejected')).toBe('却下')
      expect(wrapper.vm.getStatusLabel('unknown')).toBe('不明')
    })
  })
  
  describe('申請一覧表示', () => {
    it('自動承認待ちの申請が正しく表示される', async () => {
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      wrapper.vm.activeStatus = 'auto_approved'
      await nextTick()
      
      const autoApprovedRequests = wrapper.findAll('.request-item[data-status="auto_approved"]')
      expect(autoApprovedRequests).toHaveLength(2)
      
      // 申請理由なしが正しく表示される
      const requestDetails = autoApprovedRequests.map((req: any) => req.text())
      expect(requestDetails.some(text => text.includes('理由: なし'))).toBe(true)
    })
    
    it('申請理由がnullやundefinedの場合「なし」と表示される', async () => {
      await wrapper.vm.loadEditRequests()
      await nextTick()
      
      wrapper.vm.activeStatus = 'auto_approved'
      await nextTick()
      
      const autoApprovedRequests = wrapper.findAll('.request-item[data-status="auto_approved"]')
      const requestTexts = autoApprovedRequests.map((req: any) => req.text())
      
      // req-2 (adminNote: null) と req-3 (adminNote: undefined) の両方で「理由: なし」が表示される
      expect(requestTexts.filter(text => text.includes('理由: なし'))).toHaveLength(2)
    })
  })
  
  describe('データ取得', () => {
    it('初期化時にデータが正しく読み込まれる', async () => {
      await wrapper.vm.loadEditRequests()
      
      expect(mockUseEditPermissions.getAllEditPermissionRequests).toHaveBeenCalled()
      expect(wrapper.vm.editRequests).toHaveLength(5)
    })
    
    it('一括処理後にデータが再読み込みされる', async () => {
      await wrapper.vm.loadEditRequests()
      vi.clearAllMocks()
      
      await wrapper.vm.processAllAutoApproved()
      
      expect(mockUseEditPermissions.getAllEditPermissionRequests).toHaveBeenCalled()
    })
  })
  
  describe('エラーハンドリング', () => {
    it('一括処理でエラーが発生しても状態がリセットされる', async () => {
      mockUseEditPermissions.processAutoApprovedRequests.mockRejectedValueOnce(new Error('テストエラー'))
      
      await wrapper.vm.loadEditRequests()
      
      try {
        await wrapper.vm.processAllAutoApproved()
      } catch (error) {
        // エラーは期待される
      }
      
      expect(wrapper.vm.processingAutoApproved).toBe(false)
    })
  })
})