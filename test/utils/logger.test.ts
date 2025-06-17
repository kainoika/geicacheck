/**
 * ロガーユーティリティのテスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Logger, LogLevel, createLogger } from '../../utils/logger'

describe('Logger', () => {
  // コンソールメソッドをモック化
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    group: console.group,
    groupEnd: console.groupEnd
  }

  beforeEach(() => {
    // コンソールメソッドをスパイに置き換え
    console.log = vi.fn()
    console.info = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    console.group = vi.fn()
    console.groupEnd = vi.fn()
    
    // 環境変数をリセット
    process.env.NODE_ENV = 'development'
    delete process.env.NUXT_PUBLIC_LOG_LEVEL
  })

  afterEach(() => {
    // コンソールメソッドを元に戻す
    console.log = originalConsole.log
    console.info = originalConsole.info
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.group = originalConsole.group
    console.groupEnd = originalConsole.groupEnd
  })

  describe('ログレベル制御', () => {
    it('開発環境ではすべてのログレベルが出力される', () => {
      const logger = new Logger('TestLogger')
      
      logger.debug('debug message')
      logger.info('info message')
      logger.warn('warn message')
      logger.error('error message')

      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.info).toHaveBeenCalledTimes(1)
      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(console.error).toHaveBeenCalledTimes(1)
    })

    it('本番環境ではエラーログのみ出力される', () => {
      process.env.NODE_ENV = 'production'
      const logger = new Logger('TestLogger')
      
      logger.debug('debug message')
      logger.info('info message')
      logger.warn('warn message')
      logger.error('error message')

      expect(console.log).not.toHaveBeenCalled()
      expect(console.info).not.toHaveBeenCalled()
      expect(console.warn).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledTimes(1)
    })

    it('環境変数でログレベルを設定できる', () => {
      process.env.NUXT_PUBLIC_LOG_LEVEL = 'warn'
      const logger = new Logger('TestLogger')
      
      logger.debug('debug message')
      logger.info('info message')
      logger.warn('warn message')
      logger.error('error message')

      expect(console.log).not.toHaveBeenCalled()
      expect(console.info).not.toHaveBeenCalled()
      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(console.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('ログフォーマット', () => {
    it('コンテキストが含まれる', () => {
      const logger = new Logger('MyContext')
      logger.info('test message')

      expect(console.info).toHaveBeenCalled()
      const callArgs = (console.info as any).mock.calls[0][0]
      expect(callArgs).toContain('[MyContext]')
      expect(callArgs).toContain('test message')
    })

    it('タイムスタンプが含まれる', () => {
      const logger = new Logger('TestLogger')
      logger.info('test message')

      expect(console.info).toHaveBeenCalled()
      const callArgs = (console.info as any).mock.calls[0][0]
      expect(callArgs).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('絵文字が含まれる', () => {
      const logger = new Logger('TestLogger')
      
      logger.debug('debug')
      logger.info('info')
      logger.warn('warn')
      logger.error('error')

      expect((console.log as any).mock.calls[0][0]).toContain('🔍')
      expect((console.info as any).mock.calls[0][0]).toContain('📘')
      expect((console.warn as any).mock.calls[0][0]).toContain('⚠️')
      expect((console.error as any).mock.calls[0][0]).toContain('❌')
    })

    it('絵文字を無効化できる', () => {
      const logger = new Logger('TestLogger', { enableEmoji: false })
      logger.info('test message')

      expect(console.info).toHaveBeenCalled()
      const callArgs = (console.info as any).mock.calls[0][0]
      expect(callArgs).not.toContain('📘')
    })
  })

  describe('追加データの出力', () => {
    it('追加データが出力される', () => {
      const logger = new Logger('TestLogger')
      const data = { foo: 'bar', count: 123 }
      
      logger.info('test message', data)

      expect(console.info).toHaveBeenCalledTimes(1)
      expect((console.info as any).mock.calls[0][1]).toEqual(data)
    })

    it('エラーオブジェクトのスタックトレースが出力される', () => {
      const logger = new Logger('TestLogger')
      const error = new Error('Test error')
      
      logger.error('error occurred', error)

      expect(console.error).toHaveBeenCalledTimes(1)
      expect((console.error as any).mock.calls[0][1]).toContain('Error: Test error')
    })
  })

  describe('グループログ', () => {
    it('グループログが機能する', () => {
      const logger = new Logger('TestLogger')
      
      logger.group('Test Group')
      logger.info('inside group')
      logger.groupEnd()

      expect(console.group).toHaveBeenCalledTimes(1)
      expect((console.group as any).mock.calls[0][0]).toContain('Test Group')
      expect(console.groupEnd).toHaveBeenCalledTimes(1)
    })

    it('ログレベルが無効な場合はグループログも出力されない', () => {
      process.env.NODE_ENV = 'production'
      const logger = new Logger('TestLogger')
      
      logger.group('Test Group')
      logger.groupEnd()

      expect(console.group).not.toHaveBeenCalled()
      expect(console.groupEnd).not.toHaveBeenCalled()
    })
  })

  describe('アサーション', () => {
    it('条件がfalseの場合エラーログが出力される', () => {
      const logger = new Logger('TestLogger')
      
      logger.assert(false, 'This should fail')

      expect(console.error).toHaveBeenCalledTimes(1)
      expect((console.error as any).mock.calls[0][0]).toContain('Assertion failed: This should fail')
    })

    it('条件がtrueの場合ログは出力されない', () => {
      const logger = new Logger('TestLogger')
      
      logger.assert(true, 'This should pass')

      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe('パフォーマンス計測', () => {
    it('タイマーが機能する', async () => {
      const logger = new Logger('TestLogger')
      
      logger.time('test-timer')
      await new Promise(resolve => setTimeout(resolve, 50))
      logger.timeEnd('test-timer')

      expect(console.log).toHaveBeenCalledTimes(2)
      expect((console.log as any).mock.calls[0][0]).toContain('Timer started: test-timer')
      expect((console.log as any).mock.calls[1][0]).toContain('Timer ended: test-timer')
      expect((console.log as any).mock.calls[1][1]).toHaveProperty('duration')
    })

    it('存在しないタイマーの終了時に警告が出る', () => {
      const logger = new Logger('TestLogger')
      
      logger.timeEnd('non-existent-timer')

      expect(console.warn).toHaveBeenCalledTimes(1)
      expect((console.warn as any).mock.calls[0][0]).toContain('Timer not found: non-existent-timer')
    })
  })

  describe('子ロガー', () => {
    it('子ロガーがコンテキストを継承する', () => {
      const parentLogger = new Logger('Parent')
      const childLogger = parentLogger.child('Child')
      
      childLogger.info('test message')

      expect(console.info).toHaveBeenCalled()
      const callArgs = (console.info as any).mock.calls[0][0]
      expect(callArgs).toContain('[Parent:Child]')
    })
  })

  describe('createLogger', () => {
    it('createLoggerが正しく動作する', () => {
      const logger = createLogger('CustomLogger')
      
      logger.info('test message')

      expect(console.info).toHaveBeenCalled()
      const callArgs = (console.info as any).mock.calls[0][0]
      expect(callArgs).toContain('[CustomLogger]')
    })

    it('カスタム設定を適用できる', () => {
      const logger = createLogger('CustomLogger', {
        enableEmoji: false,
        enableTimestamp: false
      })
      
      logger.info('test message')

      expect(console.info).toHaveBeenCalled()
      const callArgs = (console.info as any).mock.calls[0][0]
      expect(callArgs).not.toContain('📘')
      expect(callArgs).not.toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })
})