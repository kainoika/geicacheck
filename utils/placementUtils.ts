/**
 * サークル配置番号の正規化処理ユーティリティ
 * 
 * このモジュールは以下の機能を提供します：
 * - 範囲表記（ア-01-02）を個別配置（[ア-01, ア-02]）に変換
 * - 2スペースサークルの座標計算
 * - 配置番号のバリデーション
 */

import type { PlacementInfo } from '~/types'

/**
 * 正規化された配置情報
 * 1つのサークルが複数スペースを使用する場合の詳細情報
 */
export interface NormalizedPlacement {
  /** 元の配置情報 */
  original: PlacementInfo
  /** 個別の配置番号リスト（例：["ア-01", "ア-02"]） */
  positions: string[]
  /** 使用スペース数 */
  spaceCount: number
  /** 2スペースかどうか */
  isDoubleSpace: boolean
  /** メイン配置（通常は最初の配置） */
  primaryPosition: string
  /** セカンダリ配置（2スペースの場合のみ） */
  secondaryPosition?: string
}

/**
 * 配置座標情報
 */
export interface PlacementCoordinate {
  /** X座標 */
  x: number
  /** Y座標 */
  y: number
  /** 配置番号 */
  position: string
}

/**
 * サークル配置の正規化処理
 * 
 * @param placement - サークルの配置情報
 * @returns 正規化された配置情報
 * 
 * @example
 * // 1スペースの場合
 * normalizePlacement({ block: "ア", number1: "01", number2: "" })
 * // -> { positions: ["ア-01"], spaceCount: 1, isDoubleSpace: false, ... }
 * 
 * // 2スペースの場合
 * normalizePlacement({ block: "ア", number1: "01", number2: "02" })
 * // -> { positions: ["ア-01", "ア-02"], spaceCount: 2, isDoubleSpace: true, ... }
 */
export function normalizePlacement(placement: PlacementInfo): NormalizedPlacement {
  const { block, number1, number2 } = placement
  
  // 基本的なバリデーション
  if (!block || !number1) {
    throw new Error(`Invalid placement: block="${block}", number1="${number1}"`)
  }
  
  const primaryPosition = `${block}-${number1}`
  
  // 1スペースの場合
  if (!number2 || number2 === '') {
    return {
      original: placement,
      positions: [primaryPosition],
      spaceCount: 1,
      isDoubleSpace: false,
      primaryPosition
    }
  }
  
  // 2スペースの場合
  const secondaryPosition = `${block}-${number2}`
  
  return {
    original: placement,
    positions: [primaryPosition, secondaryPosition],
    spaceCount: 2,
    isDoubleSpace: true,
    primaryPosition,
    secondaryPosition
  }
}

/**
 * 配置番号文字列から配置情報を解析
 * 
 * @param placementString - 配置番号文字列（例："ア-01"、"ア-01-02"）
 * @returns 配置情報
 * 
 * @example
 * parsePlacementString("ア-01") 
 * // -> { block: "ア", number1: "01", number2: "" }
 * 
 * parsePlacementString("ア-01-02")
 * // -> { block: "ア", number1: "01", number2: "02" }
 */
export function parsePlacementString(placementString: string): PlacementInfo {
  if (!placementString) {
    throw new Error('Placement string is required')
  }
  
  // パターン1: "ア-01-02" (2スペース)
  const doubleSpaceMatch = placementString.match(/^(.+)-(\d+)-(\d+)$/)
  if (doubleSpaceMatch) {
    const [, block, number1, number2] = doubleSpaceMatch
    return { block, number1, number2 }
  }
  
  // パターン2: "ア-01" (1スペース)
  const singleSpaceMatch = placementString.match(/^(.+)-(\d+)$/)
  if (singleSpaceMatch) {
    const [, block, number1] = singleSpaceMatch
    return { block, number1, number2: '' }
  }
  
  throw new Error(`Invalid placement format: ${placementString}`)
}

/**
 * 正規化された配置から表示用文字列を生成
 * 
 * @param normalized - 正規化された配置情報
 * @returns 表示用文字列
 * 
 * @example
 * formatPlacementDisplay({ positions: ["ア-01"], isDoubleSpace: false, ... })
 * // -> "ア-01"
 * 
 * formatPlacementDisplay({ positions: ["ア-01", "ア-02"], isDoubleSpace: true, ... })
 * // -> "ア-01・02"
 */
export function formatPlacementDisplay(normalized: NormalizedPlacement): string {
  if (!normalized.isDoubleSpace) {
    return normalized.primaryPosition
  }
  
  // 2スペースの場合は "ア-01・02" 形式で表示
  const { block, number1 } = normalized.original
  const { number2 } = normalized.original
  return `${block}-${number1}・${number2}`
}

/**
 * 配置番号が有効かどうかをチェック
 * 
 * @param placement - 配置情報
 * @returns 有効性
 */
export function isValidPlacement(placement: PlacementInfo): boolean {
  try {
    const normalized = normalizePlacement(placement)
    
    // 基本的なバリデーション
    if (!normalized.positions.length) {
      return false
    }
    
    // 2スペースの場合の連続性チェック
    if (normalized.isDoubleSpace) {
      const num1 = parseInt(normalized.original.number1)
      const num2 = parseInt(normalized.original.number2)
      
      // 連続する番号かチェック（num2 = num1 + 1）
      if (num2 !== num1 + 1) {
        return false
      }
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * 2つの配置番号を統合して範囲表記を生成
 * 
 * @param position1 - 最初の配置番号（例："ア-01"）
 * @param position2 - 2番目の配置番号（例："ア-02"）
 * @returns 統合された配置情報
 * 
 * @example
 * mergePlacementPositions("ア-01", "ア-02")
 * // -> { block: "ア", number1: "01", number2: "02" }
 */
export function mergePlacementPositions(position1: string, position2: string): PlacementInfo {
  const placement1 = parsePlacementString(position1)
  const placement2 = parsePlacementString(position2)
  
  // 同じブロックかチェック
  if (placement1.block !== placement2.block) {
    throw new Error(`Different blocks: ${placement1.block} vs ${placement2.block}`)
  }
  
  // 連続する番号かチェック
  const num1 = parseInt(placement1.number1)
  const num2 = parseInt(placement2.number1)
  
  if (num2 !== num1 + 1) {
    throw new Error(`Non-consecutive numbers: ${num1} and ${num2}`)
  }
  
  return {
    block: placement1.block,
    number1: placement1.number1,
    number2: placement2.number1
  }
}

/**
 * 配置情報から検索用のキーワードを生成
 * 
 * @param placement - 配置情報
 * @returns 検索用キーワードの配列
 * 
 * @example
 * generatePlacementSearchKeys({ block: "ア", number1: "01", number2: "02" })
 * // -> ["ア-01", "ア-02", "ア-01-02", "ア01", "ア02", "ア", "01", "02"]
 */
export function generatePlacementSearchKeys(placement: PlacementInfo): string[] {
  const normalized = normalizePlacement(placement)
  const keys = new Set<string>()
  
  // 個別の配置番号
  normalized.positions.forEach(pos => keys.add(pos))
  
  // 範囲表記（2スペースの場合）
  if (normalized.isDoubleSpace) {
    keys.add(`${placement.block}-${placement.number1}-${placement.number2}`)
  }
  
  // ハイフンなしバージョン
  normalized.positions.forEach(pos => {
    keys.add(pos.replace('-', ''))
  })
  
  // ブロック名のみ
  keys.add(placement.block)
  
  // 番号のみ
  keys.add(placement.number1)
  if (placement.number2) {
    keys.add(placement.number2)
  }
  
  return Array.from(keys)
}