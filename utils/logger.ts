/**
 * ロガーユーティリティ
 * 開発環境でのみログを出力し、本番環境では必要最小限のエラーログのみを残すシステム
 */

/**
 * ログレベルの定義
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * ログレベルの優先度（数値が大きいほど重要）
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3
}

/**
 * ロガー設定インターフェース
 */
export interface LoggerConfig {
  /** 開発環境かどうか */
  isDevelopment: boolean
  /** 有効なログレベル（最小レベル） */
  minLevel: LogLevel
  /** 絵文字を有効にするか */
  enableEmoji: boolean
  /** タイムスタンプを有効にするか */
  enableTimestamp: boolean
  /** スタックトレースを有効にするか（エラーログのみ） */
  enableStackTrace: boolean
  /** カラー出力を有効にするか */
  enableColors: boolean
}

/**
 * ログエントリーインターフェース
 */
export interface LogEntry {
  /** ログレベル */
  level: LogLevel
  /** ログメッセージ */
  message: string
  /** ログのコンテキスト（どこから呼ばれたか） */
  context?: string
  /** 追加データ */
  data?: any
  /** タイムスタンプ */
  timestamp?: Date
  /** スタックトレース */
  stack?: string
}

/**
 * ログレベルごとの絵文字
 */
const LOG_EMOJIS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '🔍',
  [LogLevel.INFO]: '📘',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '❌'
}

/**
 * ログレベルごとのカラー（ANSI エスケープコード）
 */
const LOG_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m'  // Red
}

/**
 * カラーリセット
 */
const COLOR_RESET = '\x1b[0m'

/**
 * ロガークラス
 */
export class Logger {
  private config: LoggerConfig
  private context?: string
  private timers: Map<string, number> = new Map()

  /**
   * コンストラクタ
   * @param context ログのコンテキスト（例: 'useAuth', 'BookmarkButton'）
   * @param config ロガー設定（省略時はデフォルト設定を使用）
   */
  constructor(context?: string, config?: Partial<LoggerConfig>) {
    this.context = context
    this.config = {
      isDevelopment: process.env.NODE_ENV === 'development',
      minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.ERROR,
      enableEmoji: true,
      enableTimestamp: true,
      enableStackTrace: true,
      enableColors: true,
      ...config
    }

    // 環境変数から最小ログレベルを読み取る
    const envLogLevel = process.env.NUXT_PUBLIC_LOG_LEVEL?.toLowerCase()
    if (envLogLevel && Object.values(LogLevel).includes(envLogLevel as LogLevel)) {
      this.config.minLevel = envLogLevel as LogLevel
    }
  }

  /**
   * ログレベルが有効かどうかをチェック
   */
  private isLevelEnabled(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel]
  }

  /**
   * 機密情報をサニタイズ（セキュリティ強化）
   */
  private sanitizeMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      return String(message || '')
    }

    // 機密情報のパターンを定義
    const sensitivePatterns = [
      // API キー、トークン、パスワード
      /api[_-]?key["\s]*[=:]["\s]*[\w\-\.]+/gi,
      /token["\s]*[=:]["\s]*[\w\-\.]+/gi,
      /password["\s]*[=:]["\s]*[\w\-\.]+/gi,
      /secret["\s]*[=:]["\s]*[\w\-\.]+/gi,
      /auth["\s]*[=:]["\s]*[\w\-\.]+/gi,
      
      // Firebase設定（部分的）
      /firebaseApiKey["\s]*[=:]["\s]*[\w\-\.]+/gi,
      /firebaseAuthDomain["\s]*[=:]["\s]*[\w\-\.]+/gi,
      
      // 暗号化キー
      /encryptionKey["\s]*[=:]["\s]*[\w\-\.]+/gi,
      /crypto[_-]?key["\s]*[=:]["\s]*[\w\-\.]+/gi,
      
      // ユーザーID、メールアドレス（部分的にマスク）
      /([\w\._%+-]+)@([\w\.-]+\.[A-Za-z]{2,})/g,
      
      // IPv4アドレス
      /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
      
      // JWT トークンのような長い文字列
      /\b[A-Za-z0-9_-]{50,}\b/g
    ]

    let sanitized = message
    
    // 各パターンをマスク
    sensitivePatterns.forEach(pattern => {
      if (pattern.source.includes('@')) {
        // メールアドレスは部分マスク
        sanitized = sanitized.replace(pattern, (match, user, domain) => {
          const maskedUser = user.length > 2 ? user.substring(0, 2) + '***' : '***'
          return `${maskedUser}@${domain}`
        })
      } else {
        // その他は完全マスク
        sanitized = sanitized.replace(pattern, '[REDACTED]')
      }
    })

    return sanitized
  }

  /**
   * ログをフォーマット（機密情報サニタイズ付き）
   */
  private formatLog(entry: LogEntry): string {
    const parts: string[] = []

    // タイムスタンプ
    if (this.config.enableTimestamp) {
      const timestamp = entry.timestamp || new Date()
      parts.push(`[${timestamp.toISOString()}]`)
    }

    // 絵文字とレベル
    if (this.config.enableEmoji) {
      parts.push(LOG_EMOJIS[entry.level])
    }
    
    // カラー付きレベル
    if (this.config.enableColors && typeof process !== 'undefined' && process.stdout?.isTTY) {
      parts.push(`${LOG_COLORS[entry.level]}[${entry.level.toUpperCase()}]${COLOR_RESET}`)
    } else {
      parts.push(`[${entry.level.toUpperCase()}]`)
    }

    // コンテキスト
    if (entry.context) {
      parts.push(`[${entry.context}]`)
    }

    // メッセージ（機密情報をサニタイズ）
    const sanitizedMessage = this.sanitizeMessage(entry.message)
    parts.push(sanitizedMessage)

    return parts.join(' ')
  }

  /**
   * データをサニタイズ（機密情報除去）
   */
  private sanitizeData(data: any): any {
    if (!data) return data
    
    try {
      // プリミティブ型はそのまま返す
      if (typeof data !== 'object') {
        return typeof data === 'string' ? this.sanitizeMessage(data) : data
      }
      
      // Error オブジェクトの場合
      if (data instanceof Error) {
        return {
          name: data.name,
          message: this.sanitizeMessage(data.message),
          // スタックトレースも本番環境では制限
          ...(this.config.isDevelopment && { stack: data.stack })
        }
      }
      
      // 配列の場合
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item))
      }
      
      // オブジェクトの場合は機密情報を含む可能性のあるキーをチェック
      const sanitized: any = {}
      const sensitiveKeys = [
        'password', 'secret', 'token', 'key', 'auth', 'credential',
        'apikey', 'api_key', 'firebaseapikey', 'encryptionkey', 'crypto_key'
      ]
      
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase()
        
        if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
          sanitized[key] = '[REDACTED]'
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeData(value)
        } else if (typeof value === 'string') {
          sanitized[key] = this.sanitizeMessage(value)
        } else {
          sanitized[key] = value
        }
      }
      
      return sanitized
    } catch (error) {
      // サニタイズ処理でエラーが発生した場合は安全な文字列を返す
      return '[SANITIZATION_ERROR]'
    }
  }

  /**
   * ログを出力（機密情報サニタイズ付き）
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.isLevelEnabled(level)) {
      return
    }

    // 本番環境では DEBUG と INFO ログを完全に無効化（追加のセキュリティ対策）
    if (!this.config.isDevelopment && (level === LogLevel.DEBUG || level === LogLevel.INFO)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      context: this.context,
      data: this.sanitizeData(data),
      timestamp: new Date()
    }

    const formattedMessage = this.formatLog(entry)
    const sanitizedData = entry.data

    // ログレベルに応じたコンソールメソッドを使用
    switch (level) {
      case LogLevel.DEBUG:
        console.log(formattedMessage, sanitizedData !== undefined ? sanitizedData : '')
        break
      case LogLevel.INFO:
        console.info(formattedMessage, sanitizedData !== undefined ? sanitizedData : '')
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, sanitizedData !== undefined ? sanitizedData : '')
        break
      case LogLevel.ERROR:
        if (data instanceof Error && this.config.enableStackTrace) {
          // エラーの場合も機密情報をサニタイズ
          const sanitizedError = this.sanitizeData(data)
          console.error(formattedMessage, sanitizedError)
        } else {
          console.error(formattedMessage, sanitizedData !== undefined ? sanitizedData : '')
        }
        break
    }
  }

  /**
   * デバッグログ
   * @param message ログメッセージ
   * @param data 追加データ
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  /**
   * 情報ログ
   * @param message ログメッセージ
   * @param data 追加データ
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data)
  }

  /**
   * 警告ログ
   * @param message ログメッセージ
   * @param data 追加データ
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data)
  }

  /**
   * エラーログ
   * @param message ログメッセージ
   * @param error エラーオブジェクトまたは追加データ
   */
  error(message: string, error?: Error | any): void {
    this.log(LogLevel.ERROR, message, error)
  }

  /**
   * グループログ開始
   * @param label グループラベル
   */
  group(label: string): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      console.group(this.config.enableEmoji ? `📁 ${label}` : label)
    }
  }

  /**
   * グループログ終了
   */
  groupEnd(): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      console.groupEnd()
    }
  }

  /**
   * 条件付きログ
   * @param condition 条件
   * @param message ログメッセージ
   */
  assert(condition: boolean, message: string): void {
    if (!condition && this.isLevelEnabled(LogLevel.ERROR)) {
      this.error(`Assertion failed: ${message}`)
    }
  }

  /**
   * パフォーマンス計測開始
   * @param label 計測ラベル
   */
  time(label: string): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      this.timers.set(label, Date.now())
      this.debug(`Timer started: ${label}`)
    }
  }

  /**
   * パフォーマンス計測終了
   * @param label 計測ラベル
   */
  timeEnd(label: string): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      const startTime = this.timers.get(label)
      if (startTime) {
        const duration = Date.now() - startTime
        this.timers.delete(label)
        this.debug(`Timer ended: ${label}`, { duration: `${duration}ms` })
      } else {
        this.warn(`Timer not found: ${label}`)
      }
    }
  }

  /**
   * 子ロガーを作成（コンテキストを継承）
   * @param childContext 子コンテキスト
   */
  child(childContext: string): Logger {
    const context = this.context ? `${this.context}:${childContext}` : childContext
    return new Logger(context, this.config)
  }
}

/**
 * デフォルトのロガーインスタンス
 */
export const logger = new Logger()

/**
 * コンテキスト付きロガーを作成
 * @param context ログのコンテキスト
 * @param config ロガー設定（省略可）
 * @returns ロガーインスタンス
 */
export const createLogger = (context: string, config?: Partial<LoggerConfig>): Logger => {
  return new Logger(context, config)
}