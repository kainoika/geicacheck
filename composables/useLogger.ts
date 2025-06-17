/**
 * ロガーコンポーザブル
 * コンポーネントやコンポーザブル内でロガーを使用するためのヘルパー
 */
import { createLogger, type Logger } from '~/utils/logger'

/**
 * ロガーインスタンスを取得または作成する
 * @param context ログのコンテキスト（省略時は呼び出し元のコンポーネント名を使用）
 * @returns ロガーインスタンス
 */
export const useLogger = (context?: string): Logger => {
  // コンテキストが指定されていない場合は、現在のコンポーネントインスタンスから取得を試みる
  if (!context) {
    const instance = getCurrentInstance()
    if (instance) {
      // コンポーネント名を取得（ファイル名またはコンポーネント定義の名前）
      context = instance.type.__name || instance.type.name || 'Unknown'
    }
  }

  // ロガーインスタンスを作成
  return createLogger(context || 'App')
}