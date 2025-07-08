import CryptoJS from 'crypto-js'

/**
 * ローカルストレージ用データ暗号化ユーティリティ
 * センシティブなデータ（ブックマーク、検索履歴等）を安全に保存
 */

// 暗号化キーの生成（Nuxt runtimeConfigから取得）
const getEncryptionKey = (): string => {
  // Nuxt runtimeConfigから暗号化キーを取得
  const config = useRuntimeConfig()
  const key = config.public.encryptionKey as string
  
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NUXT_PUBLIC_ENCRYPTION_KEY is required in production')
    }
    // 開発環境のフォールバック
    return 'geica-check-dev-key-2025'
  }
  
  return key
}

/**
 * データを暗号化してJSON文字列として返す
 * @param data 暗号化するデータ（任意の型）
 * @returns 暗号化された文字列
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(jsonString, getEncryptionKey()).toString()
    return encrypted
  } catch (error) {
    console.error('Data encryption failed:', error)
    throw new Error('データの暗号化に失敗しました')
  }
}

/**
 * 暗号化されたデータを復号化して元のデータを返す
 * @param encryptedData 暗号化された文字列
 * @returns 復号化されたデータ
 */
export const decryptData = <T = any>(encryptedData: string): T => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey())
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedString) {
      throw new Error('復号化に失敗しました')
    }
    
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Data decryption failed:', error)
    throw new Error('データの復号化に失敗しました')
  }
}

/**
 * ローカルストレージに暗号化されたデータを安全に保存
 * @param key ストレージキー
 * @param data 保存するデータ
 */
export const setEncryptedItem = (key: string, data: any): void => {
  try {
    const encryptedData = encryptData(data)
    localStorage.setItem(key, encryptedData)
  } catch (error) {
    console.error(`Failed to set encrypted item ${key}:`, error)
    throw error
  }
}

/**
 * ローカルストレージから暗号化されたデータを安全に取得
 * @param key ストレージキー
 * @returns 復号化されたデータ、存在しない場合はnull
 */
export const getEncryptedItem = <T = any>(key: string): T | null => {
  try {
    const encryptedData = localStorage.getItem(key)
    if (!encryptedData) {
      return null
    }
    
    return decryptData<T>(encryptedData)
  } catch (error) {
    console.error(`Failed to get encrypted item ${key}:`, error)
    // 復号化に失敗した場合は古い非暗号化データの可能性があるため削除
    localStorage.removeItem(key)
    return null
  }
}

/**
 * ローカルストレージから暗号化されたアイテムを安全に削除
 * @param key ストレージキー
 */
export const removeEncryptedItem = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove encrypted item ${key}:`, error)
  }
}

/**
 * データが暗号化されているかチェック
 * @param data チェックするデータ
 * @returns 暗号化されている場合true
 */
export const isEncrypted = (data: string): boolean => {
  try {
    // Base64エンコードされた文字列かチェック（AES暗号化の特徴）
    return /^[A-Za-z0-9+/]+=*$/.test(data) && data.length > 20
  } catch {
    return false
  }
}

/**
 * 既存の非暗号化データを暗号化データに移行
 * @param key ストレージキー
 */
export const migrateToEncrypted = (key: string): void => {
  try {
    const existingData = localStorage.getItem(key)
    if (!existingData) return
    
    // 既に暗号化されている場合はスキップ
    if (isEncrypted(existingData)) return
    
    try {
      // 既存データをJSONとして解析できる場合は暗号化して保存
      const parsedData = JSON.parse(existingData)
      setEncryptedItem(key, parsedData)
      console.log(`Migrated ${key} to encrypted storage`)
    } catch {
      // JSONではない場合は文字列として暗号化
      setEncryptedItem(key, existingData)
      console.log(`Migrated ${key} (string) to encrypted storage`)
    }
  } catch (error) {
    console.error(`Failed to migrate ${key} to encrypted storage:`, error)
  }
}