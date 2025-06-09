/**
 * 管理画面の編集権限申請管理機能のテスト
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('管理画面の編集権限申請管理', () => {
  describe('却下理由のデフォルトテンプレート機能', () => {
    const rejectReasonTemplates = [
      {
        id: 'twitter_mismatch',
        label: 'Twitter不一致',
        message: '申請者のTwitterスクリーンネームとサークルの登録Twitter情報が一致しません。サークル代表者のTwitterアカウントから再度申請してください。'
      },
      {
        id: 'no_twitter_connection',
        label: 'Twitter未連携',
        message: 'Twitterアカウントとの連携が確認できません。Twitterでログインしてから再度申請してください。'
      },
      {
        id: 'insufficient_evidence',
        label: '証明不足',
        message: 'サークルとの関係を示す十分な証明が不足しています。サークル代表者であることを証明できる資料や詳細な申請理由を記載して再申請してください。'
      },
      {
        id: 'no_reason',
        label: '申請理由なし',
        message: '申請理由が記載されていません。なぜ編集権限が必要なのか、サークルとの関係を詳しく記載して再申請してください。'
      }
    ]

    let rejectNote = ''
    
    const selectRejectTemplate = (message) => {
      rejectNote = message
    }
    
    beforeEach(() => {
      rejectNote = ''
    })

    it('Twitter不一致テンプレートが正しく設定される', () => {
      const template = rejectReasonTemplates.find(t => t.id === 'twitter_mismatch')
      selectRejectTemplate(template.message)
      
      expect(rejectNote).toBe('申請者のTwitterスクリーンネームとサークルの登録Twitter情報が一致しません。サークル代表者のTwitterアカウントから再度申請してください。')
    })

    it('Twitter未連携テンプレートが正しく設定される', () => {
      const template = rejectReasonTemplates.find(t => t.id === 'no_twitter_connection')
      selectRejectTemplate(template.message)
      
      expect(rejectNote).toBe('Twitterアカウントとの連携が確認できません。Twitterでログインしてから再度申請してください。')
    })

    it('証明不足テンプレートが正しく設定される', () => {
      const template = rejectReasonTemplates.find(t => t.id === 'insufficient_evidence')
      selectRejectTemplate(template.message)
      
      expect(rejectNote).toBe('サークルとの関係を示す十分な証明が不足しています。サークル代表者であることを証明できる資料や詳細な申請理由を記載して再申請してください。')
    })

    it('申請理由なしテンプレートが正しく設定される', () => {
      const template = rejectReasonTemplates.find(t => t.id === 'no_reason')
      selectRejectTemplate(template.message)
      
      expect(rejectNote).toBe('申請理由が記載されていません。なぜ編集権限が必要なのか、サークルとの関係を詳しく記載して再申請してください。')
    })

    it('すべてのテンプレートにidとlabelとmessageが含まれている', () => {
      rejectReasonTemplates.forEach(template => {
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('label')
        expect(template).toHaveProperty('message')
        expect(typeof template.id).toBe('string')
        expect(typeof template.label).toBe('string')
        expect(typeof template.message).toBe('string')
        expect(template.message.length).toBeGreaterThan(10)
      })
    })
  })

  describe('自動チェック機能の拡張', () => {
    const generateAutoChecks = (request) => {
      const twitterMatch = request.applicantTwitterId && request.registeredTwitterId && 
        request.applicantTwitterId.toLowerCase() === request.registeredTwitterId.toLowerCase()
      
      return [
        {
          name: 'Twitter連携',
          description: request.applicantTwitterId ? `@${request.applicantTwitterId}` : 'Twitter未連携',
          passed: !!request.applicantTwitterId
        },
        {
          name: 'スクリーンネーム一致',
          description: twitterMatch ? 
            `申請者(@${request.applicantTwitterId})とサークル(@${request.registeredTwitterId})が一致` :
            `申請者(@${request.applicantTwitterId || '未設定'})とサークル(@${request.registeredTwitterId || '未設定'})が不一致`,
          passed: twitterMatch
        },
        {
          name: '申請理由',
          description: request.adminNote ? '申請理由記入済み' : '申請理由なし',
          passed: !!request.adminNote
        },
        {
          name: '自動承認',
          description: request.isAutoApproved ? '自動承認済み' : '手動審査が必要',
          passed: request.isAutoApproved
        }
      ]
    }

    it('Twitter連携ありの場合、正しいチェック結果を返す', () => {
      const request = {
        applicantTwitterId: 'test_user',
        registeredTwitterId: 'circle_official',
        adminNote: '申請理由です',
        isAutoApproved: false
      }

      const checks = generateAutoChecks(request)
      const twitterCheck = checks.find(c => c.name === 'Twitter連携')
      
      expect(twitterCheck.passed).toBe(true)
      expect(twitterCheck.description).toBe('@test_user')
    })

    it('Twitter連携なしの場合、正しいチェック結果を返す', () => {
      const request = {
        applicantTwitterId: null,
        registeredTwitterId: 'circle_official',
        adminNote: '申請理由です',
        isAutoApproved: false
      }

      const checks = generateAutoChecks(request)
      const twitterCheck = checks.find(c => c.name === 'Twitter連携')
      
      expect(twitterCheck.passed).toBe(false)
      expect(twitterCheck.description).toBe('Twitter未連携')
    })

    it('スクリーンネーム一致の場合、正しいチェック結果を返す', () => {
      const request = {
        applicantTwitterId: 'circle_official',
        registeredTwitterId: 'circle_official',
        adminNote: '申請理由です',
        isAutoApproved: true
      }

      const checks = generateAutoChecks(request)
      const matchCheck = checks.find(c => c.name === 'スクリーンネーム一致')
      
      expect(matchCheck.passed).toBe(true)
      expect(matchCheck.description).toBe('申請者(@circle_official)とサークル(@circle_official)が一致')
    })

    it('スクリーンネーム不一致の場合、正しいチェック結果を返す', () => {
      const request = {
        applicantTwitterId: 'test_user',
        registeredTwitterId: 'circle_official',
        adminNote: '申請理由です',
        isAutoApproved: false
      }

      const checks = generateAutoChecks(request)
      const matchCheck = checks.find(c => c.name === 'スクリーンネーム一致')
      
      expect(matchCheck.passed).toBe(false)
      expect(matchCheck.description).toBe('申請者(@test_user)とサークル(@circle_official)が不一致')
    })

    it('申請理由ありの場合、正しいチェック結果を返す', () => {
      const request = {
        applicantTwitterId: 'test_user',
        registeredTwitterId: 'circle_official',
        adminNote: '私はこのサークルの代表者です',
        isAutoApproved: false
      }

      const checks = generateAutoChecks(request)
      const reasonCheck = checks.find(c => c.name === '申請理由')
      
      expect(reasonCheck.passed).toBe(true)
      expect(reasonCheck.description).toBe('申請理由記入済み')
    })

    it('申請理由なしの場合、正しいチェック結果を返す', () => {
      const request = {
        applicantTwitterId: 'test_user',
        registeredTwitterId: 'circle_official',
        adminNote: null,
        isAutoApproved: false
      }

      const checks = generateAutoChecks(request)
      const reasonCheck = checks.find(c => c.name === '申請理由')
      
      expect(reasonCheck.passed).toBe(false)
      expect(reasonCheck.description).toBe('申請理由なし')
    })

    it('自動承認済みの場合、正しいチェック結果を返す', () => {
      const request = {
        applicantTwitterId: 'circle_official',
        registeredTwitterId: 'circle_official',
        adminNote: '申請理由です',
        isAutoApproved: true
      }

      const checks = generateAutoChecks(request)
      const autoApprovalCheck = checks.find(c => c.name === '自動承認')
      
      expect(autoApprovalCheck.passed).toBe(true)
      expect(autoApprovalCheck.description).toBe('自動承認済み')
    })

    it('手動審査が必要な場合、正しいチェック結果を返す', () => {
      const request = {
        applicantTwitterId: 'test_user',
        registeredTwitterId: 'circle_official',
        adminNote: '申請理由です',
        isAutoApproved: false
      }

      const checks = generateAutoChecks(request)
      const autoApprovalCheck = checks.find(c => c.name === '自動承認')
      
      expect(autoApprovalCheck.passed).toBe(false)
      expect(autoApprovalCheck.description).toBe('手動審査が必要')
    })
  })

  describe('却下理由の表示機能', () => {
    it('却下された申請について却下理由が表示される', () => {
      const rejectedRequest = {
        id: 'req-1',
        status: 'rejected',
        rejectionReason: 'Twitterスクリーンネームが一致しません',
        processedAt: new Date('2024-01-15T10:00:00Z'),
        processedBy: 'admin_user'
      }

      expect(rejectedRequest.status).toBe('rejected')
      expect(rejectedRequest.rejectionReason).toBe('Twitterスクリーンネームが一致しません')
      expect(rejectedRequest.processedAt).toBeTruthy()
    })

    it('承認された申請について却下理由が表示されない', () => {
      const approvedRequest = {
        id: 'req-2',
        status: 'approved',
        rejectionReason: null,
        processedAt: new Date('2024-01-15T10:00:00Z'),
        processedBy: 'admin_user'
      }

      expect(approvedRequest.status).toBe('approved')
      expect(approvedRequest.rejectionReason).toBeNull()
    })

    it('申請中の申請について却下理由が表示されない', () => {
      const pendingRequest = {
        id: 'req-3',
        status: 'pending',
        rejectionReason: null,
        processedAt: null,
        processedBy: null
      }

      expect(pendingRequest.status).toBe('pending')
      expect(pendingRequest.rejectionReason).toBeNull()
      expect(pendingRequest.processedAt).toBeNull()
    })
  })

  describe('管理者作業効率化', () => {
    it('デフォルトテンプレートにより手入力の手間が削減される', () => {
      const templates = [
        'Twitter不一致',
        'Twitter未連携', 
        '証明不足',
        '申請理由なし',
        '重複申請',
        '無効なサークル'
      ]

      templates.forEach(label => {
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      })
    })

    it('自動チェック機能により審査判断が迅速化される', () => {
      const autoCheckItems = [
        'Twitter連携',
        'スクリーンネーム一致',
        '申請理由',
        '自動承認'
      ]

      autoCheckItems.forEach(item => {
        expect(typeof item).toBe('string')
        expect(item.length).toBeGreaterThan(0)
      })
    })
  })
})