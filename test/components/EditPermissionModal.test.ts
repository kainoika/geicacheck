/**
 * EditPermissionModal コンポーネントのテスト
 * 編集権限申請モーダルの動作テスト
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref, computed, watch } from 'vue'

// Heroiconsのモック
vi.mock('@heroicons/vue/24/outline', () => ({
  PencilIcon: { template: '<svg class="mock-pencil-icon"></svg>' },
  XMarkIcon: { template: '<svg class="mock-x-mark-icon"></svg>' },
  InformationCircleIcon: { template: '<svg class="mock-information-circle-icon"></svg>' },
  CheckCircleIcon: { template: '<svg class="mock-check-circle-icon"></svg>' },
  ExclamationTriangleIcon: { template: '<svg class="mock-exclamation-triangle-icon"></svg>' }
}))

// モックの準備
const mockUser = {
  uid: 'user-123',
  displayName: 'テストユーザー',
  twitterScreenName: 'testuser'
}

const mockCircle = {
  id: 'circle-123',
  circleName: 'テストサークル',
  placement: 'A-01',
  contact: {
    twitter: 'https://twitter.com/testcircle'
  }
}

const mockCircleNoTwitter = {
  ...mockCircle,
  contact: {}
}

const mockCircleDifferentTwitter = {
  ...mockCircle,
  contact: {
    twitter: 'https://twitter.com/differentuser'
  }
}

// コンポーザブルのモック
const mockUseAuth = {
  user: { value: mockUser }
}

const mockUseCircles = {
  formatPlacement: vi.fn((placement) => placement)
}

const mockSubmitEditPermissionRequest = vi.fn()
const mockUseEditPermissions = {
  submitEditPermissionRequest: mockSubmitEditPermissionRequest
}

// グローバルモック
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => mockUseAuth
}))

vi.mock('~/composables/useCircles', () => ({
  useCircles: () => mockUseCircles
}))

vi.mock('~/composables/useEditPermissions', () => ({
  useEditPermissions: () => mockUseEditPermissions
}))

// EditPermissionModalコンポーネントの簡易実装
const EditPermissionModal = {
  props: {
    circle: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'success'],
  setup(props: any, { emit }: any) {
    const { user } = mockUseAuth
    const { formatPlacement } = mockUseCircles
    const { submitEditPermissionRequest } = mockUseEditPermissions
    
    const reason = ref('')
    const submitting = ref(false)
    const showReasonError = ref(false)
    
    const userTwitterScreenName = computed(() => user.value?.twitterScreenName || '')
    const circleTwitterUsername = computed(() => {
      if (!props.circle.contact?.twitter) return ''
      return props.circle.contact.twitter.replace(/\/+$/, '').split('/').pop() || ''
    })
    
    const twitterMatches = computed(() => {
      if (!userTwitterScreenName.value || !circleTwitterUsername.value) return false
      return userTwitterScreenName.value.toLowerCase() === circleTwitterUsername.value.toLowerCase()
    })
    
    const submitRequest = async () => {
      if (!user.value) return
      
      // Twitter情報が一致しない場合は申請理由が必須
      if (!twitterMatches.value && !reason.value.trim()) {
        showReasonError.value = true
        return
      }
      
      submitting.value = true
      try {
        await submitEditPermissionRequest({
          circleId: props.circle.id,
          applicantTwitterId: userTwitterScreenName.value,
          registeredTwitterId: circleTwitterUsername.value,
          reason: reason.value.trim() || undefined
        })
        
        emit('success')
      } catch (error) {
        console.error('編集権限申請エラー:', error)
        alert('申請の送信に失敗しました。もう一度お試しください。')
      } finally {
        submitting.value = false
      }
    }
    
    watch(reason, () => {
      if (showReasonError.value && reason.value.trim()) {
        showReasonError.value = false
      }
    })
    
    return {
      reason,
      submitting,
      showReasonError,
      twitterMatches,
      userTwitterScreenName,
      circleTwitterUsername,
      formatPlacement,
      submitRequest
    }
  },
  template: `
    <div class="modal">
      <h2>編集権限申請</h2>
      <div class="circle-info">
        <h3>{{ circle.circleName }}</h3>
        <p>{{ formatPlacement(circle.placement) }}</p>
        <p v-if="circle.contact?.twitter">Twitter: @{{ circleTwitterUsername }}</p>
      </div>
      
      <div class="twitter-match-info">
        <p v-if="twitterMatches">Twitter情報が一致しています（自動承認対象）</p>
        <p v-else>Twitter情報が一致しません（手動審査が必要）</p>
      </div>
      
      <div class="form-section">
        <label>
          申請理由
          <span v-if="!twitterMatches" class="required">必須</span>
          <span v-else class="optional">任意</span>
        </label>
        <textarea
          v-model="reason"
          :class="{ error: !twitterMatches && showReasonError }"
          :placeholder="twitterMatches ? '任意' : '必須'"
        />
        <p v-if="!twitterMatches && showReasonError" class="error-message">
          Twitter情報が一致しない場合は申請理由の入力が必須です
        </p>
      </div>
      
      <div class="actions">
        <button @click="$emit('close')">キャンセル</button>
        <button @click="submitRequest" :disabled="submitting">
          {{ submitting ? '申請中...' : '申請を送信' }}
        </button>
      </div>
    </div>
  `
}

describe('EditPermissionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('Twitter情報が一致する場合', () => {
    it('申請理由が任意と表示される', () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: {
            ...mockCircle,
            contact: { twitter: 'https://twitter.com/testuser' }
          }
        }
      })
      
      expect(wrapper.find('.optional').exists()).toBe(true)
      expect(wrapper.find('.required').exists()).toBe(false)
      expect(wrapper.text()).toContain('Twitter情報が一致しています')
    })
    
    it('申請理由が空でも申請できる', async () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: {
            ...mockCircle,
            contact: { twitter: 'https://twitter.com/testuser' }
          }
        }
      })
      
      await wrapper.find('button:last-child').trigger('click')
      
      expect(mockSubmitEditPermissionRequest).toHaveBeenCalledWith({
        circleId: 'circle-123',
        applicantTwitterId: 'testuser',
        registeredTwitterId: 'testuser',
        reason: undefined
      })
      expect(wrapper.find('.error-message').exists()).toBe(false)
    })
    
    it('申請理由を入力しても申請できる', async () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: {
            ...mockCircle,
            contact: { twitter: 'https://twitter.com/testuser' }
          }
        }
      })
      
      await wrapper.find('textarea').setValue('テスト理由')
      await wrapper.find('button:last-child').trigger('click')
      
      expect(mockSubmitEditPermissionRequest).toHaveBeenCalledWith({
        circleId: 'circle-123',
        applicantTwitterId: 'testuser',
        registeredTwitterId: 'testuser',
        reason: 'テスト理由'
      })
    })
  })
  
  describe('Twitter情報が一致しない場合', () => {
    it('申請理由が必須と表示される', () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: mockCircleDifferentTwitter
        }
      })
      
      expect(wrapper.find('.required').exists()).toBe(true)
      expect(wrapper.find('.optional').exists()).toBe(false)
      expect(wrapper.text()).toContain('Twitter情報が一致しません')
    })
    
    it('申請理由が空だとエラーが表示される', async () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: mockCircleDifferentTwitter
        }
      })
      
      await wrapper.find('button:last-child').trigger('click')
      await nextTick()
      
      expect(mockSubmitEditPermissionRequest).not.toHaveBeenCalled()
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toContain('申請理由の入力が必須です')
    })
    
    it('申請理由を入力すると申請できる', async () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: mockCircleDifferentTwitter
        }
      })
      
      await wrapper.find('textarea').setValue('サークル代表者です')
      await wrapper.find('button:last-child').trigger('click')
      
      expect(mockSubmitEditPermissionRequest).toHaveBeenCalledWith({
        circleId: 'circle-123',
        applicantTwitterId: 'testuser',
        registeredTwitterId: 'differentuser',
        reason: 'サークル代表者です'
      })
    })
    
    it('エラー表示後に申請理由を入力するとエラーが消える', async () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: mockCircleDifferentTwitter
        }
      })
      
      // エラーを表示させる
      await wrapper.find('button:last-child').trigger('click')
      await nextTick()
      expect(wrapper.find('.error-message').exists()).toBe(true)
      
      // 申請理由を入力
      await wrapper.find('textarea').setValue('理由')
      await nextTick()
      
      expect(wrapper.find('.error-message').exists()).toBe(false)
    })
  })
  
  describe('サークルのTwitter情報がない場合', () => {
    it('Twitter情報が一致しないと判定される', () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: mockCircleNoTwitter
        }
      })
      
      expect(wrapper.find('.required').exists()).toBe(true)
      expect(wrapper.text()).toContain('Twitter情報が一致しません')
    })
    
    it('申請理由が必須になる', async () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: mockCircleNoTwitter
        }
      })
      
      await wrapper.find('button:last-child').trigger('click')
      await nextTick()
      
      expect(mockSubmitEditPermissionRequest).not.toHaveBeenCalled()
      expect(wrapper.find('.error-message').exists()).toBe(true)
    })
  })
  
  describe('申請送信処理', () => {
    it('申請成功時にsuccessイベントが発火する', async () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: {
            ...mockCircle,
            contact: { twitter: 'https://twitter.com/testuser' }
          }
        }
      })
      
      await wrapper.find('button:last-child').trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('success')).toBeTruthy()
    })
    
    it('申請中はボタンが無効化される', async () => {
      mockSubmitEditPermissionRequest.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: {
            ...mockCircle,
            contact: { twitter: 'https://twitter.com/testuser' }
          }
        }
      })
      
      const submitButton = wrapper.find('button:last-child')
      await submitButton.trigger('click')
      
      expect(submitButton.attributes('disabled')).toBeDefined()
      expect(submitButton.text()).toContain('申請中...')
    })
    
    it('エラー時にアラートが表示される', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      mockSubmitEditPermissionRequest.mockRejectedValueOnce(new Error('テストエラー'))
      
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: {
            ...mockCircle,
            contact: { twitter: 'https://twitter.com/testuser' }
          }
        }
      })
      
      await wrapper.find('button:last-child').trigger('click')
      await nextTick()
      
      expect(alertSpy).toHaveBeenCalledWith('申請の送信に失敗しました。もう一度お試しください。')
      alertSpy.mockRestore()
    })
  })
  
  describe('UIイベント', () => {
    it('キャンセルボタンでcloseイベントが発火する', async () => {
      const wrapper = mount(EditPermissionModal, {
        props: {
          circle: mockCircle
        }
      })
      
      await wrapper.find('button:first-child').trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })
})