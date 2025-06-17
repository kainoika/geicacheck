/**
 * ロガープラグイン
 * アプリケーション全体でロガーを使用できるようにする
 */
import { logger, createLogger } from '~/utils/logger'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      logger: logger,
      createLogger: createLogger
    }
  }
})