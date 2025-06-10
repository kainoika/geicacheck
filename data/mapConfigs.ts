import type { EventMapConfig } from '~/types'

// 座標を簡素化するためのヘルパー関数
const createCoordinateMapping = (
  coordinates: Record<string, { x: number; y: number }>
): Record<string, { x: number; y: number; width: number; height: number }> => {
  const mapping: Record<string, { x: number; y: number; width: number; height: number }> = {}
  for (const [key, coord] of Object.entries(coordinates)) {
    mapping[key] = { ...coord, width: 30, height: 25 }
  }
  return mapping
}

export const mapConfigs: EventMapConfig[] = [
  {
    eventId: 'geika-32',
    svgPath: '/map-geika32.svg',
    coordinateMapping: {
      // カ行（みきエリア上部）
      'カ-01': { x: 85, y: 247, width: 30, height: 25 },
      'カ-02': { x: 85, y: 217, width: 30, height: 25 },
      'カ-03': { x: 85, y: 187, width: 30, height: 25 },
      'カ-04': { x: 85, y: 157, width: 30, height: 25 },
      'カ-05': { x: 85, y: 87, width: 30, height: 25 },
      'カ-06': { x: 85, y: 57, width: 30, height: 25 },
      
      // み行（みきエリア）
      'み-01': { x: 85, y: 947, width: 30, height: 25 },
      'み-02': { x: 85, y: 917, width: 30, height: 25 },
      'み-03': { x: 85, y: 887, width: 30, height: 25 },
      'み-04': { x: 85, y: 857, width: 30, height: 25 },
      'み-05': { x: 85, y: 797, width: 30, height: 25 },
      'み-06': { x: 85, y: 767, width: 30, height: 25 },
      'み-07': { x: 85, y: 737, width: 30, height: 25 },
      'み-08': { x: 85, y: 707, width: 30, height: 25 },
      'み-09': { x: 85, y: 647, width: 30, height: 25 },
      'み-10': { x: 85, y: 617, width: 30, height: 25 },
      'み-11': { x: 85, y: 587, width: 30, height: 25 },
      'み-12': { x: 85, y: 557, width: 30, height: 25 },
      'み-13': { x: 85, y: 517, width: 30, height: 25 },
      'み-14': { x: 85, y: 487, width: 30, height: 25 },
      'み-15': { x: 85, y: 457, width: 30, height: 25 },
      'み-16': { x: 85, y: 427, width: 30, height: 25 },
      'み-17': { x: 85, y: 377, width: 30, height: 25 },
      'み-18': { x: 85, y: 347, width: 30, height: 25 },
      'み-19': { x: 85, y: 317, width: 30, height: 25 },
      'み-20': { x: 85, y: 287, width: 30, height: 25 },

      // ア行（1-24列）- SVGの座標を基準に調整
      'ア-01': { x: 265, y: 157, width: 30, height: 25 },
      'ア-02': { x: 265, y: 187, width: 30, height: 25 },
      'ア-03': { x: 265, y: 217, width: 30, height: 25 },
      'ア-04': { x: 265, y: 247, width: 30, height: 25 },
      'ア-05': { x: 265, y: 277, width: 30, height: 25 },
      'ア-06': { x: 265, y: 307, width: 30, height: 25 },
      'ア-07': { x: 265, y: 337, width: 30, height: 25 },
      'ア-08': { x: 265, y: 367, width: 30, height: 25 },
      'ア-09': { x: 265, y: 397, width: 30, height: 25 },
      'ア-10': { x: 265, y: 427, width: 30, height: 25 },
      'ア-11': { x: 265, y: 457, width: 30, height: 25 },
      'ア-12': { x: 265, y: 487, width: 30, height: 25 },
      'ア-13': { x: 300, y: 487, width: 30, height: 25 },
      'ア-14': { x: 300, y: 457, width: 30, height: 25 },
      'ア-15': { x: 300, y: 427, width: 30, height: 25 },
      'ア-16': { x: 300, y: 397, width: 30, height: 25 },
      'ア-17': { x: 300, y: 367, width: 30, height: 25 },
      'ア-18': { x: 300, y: 337, width: 30, height: 25 },
      'ア-19': { x: 300, y: 307, width: 30, height: 25 },
      'ア-20': { x: 300, y: 277, width: 30, height: 25 },
      'ア-21': { x: 300, y: 247, width: 30, height: 25 },
      'ア-22': { x: 300, y: 217, width: 30, height: 25 },
      'ア-23': { x: 300, y: 187, width: 30, height: 25 },
      'ア-24': { x: 300, y: 157, width: 30, height: 25 },

      // ア行（25-48列）
      'ア-25': { x: 465, y: 157, width: 30, height: 25 },
      'ア-26': { x: 465, y: 187, width: 30, height: 25 },
      'ア-27': { x: 465, y: 217, width: 30, height: 25 },
      'ア-28': { x: 465, y: 247, width: 30, height: 25 },
      'ア-29': { x: 465, y: 277, width: 30, height: 25 },
      'ア-30': { x: 465, y: 307, width: 30, height: 25 },
      'ア-31': { x: 465, y: 337, width: 30, height: 25 },
      'ア-32': { x: 465, y: 367, width: 30, height: 25 },
      'ア-33': { x: 465, y: 397, width: 30, height: 25 },
      'ア-34': { x: 465, y: 427, width: 30, height: 25 },
      'ア-35': { x: 465, y: 457, width: 30, height: 25 },
      'ア-36': { x: 465, y: 487, width: 30, height: 25 },
      'ア-37': { x: 500, y: 487, width: 30, height: 25 },
      'ア-38': { x: 500, y: 457, width: 30, height: 25 },
      'ア-39': { x: 500, y: 427, width: 30, height: 25 },
      'ア-40': { x: 500, y: 397, width: 30, height: 25 },
      'ア-41': { x: 500, y: 367, width: 30, height: 25 },
      'ア-42': { x: 500, y: 337, width: 30, height: 25 },
      'ア-43': { x: 500, y: 307, width: 30, height: 25 },
      'ア-44': { x: 500, y: 277, width: 30, height: 25 },
      'ア-45': { x: 500, y: 247, width: 30, height: 25 },
      'ア-46': { x: 500, y: 217, width: 30, height: 25 },
      'ア-47': { x: 500, y: 187, width: 30, height: 25 },
      'ア-48': { x: 500, y: 157, width: 30, height: 25 },

      // ア行（49-72列）
      'ア-49': { x: 665, y: 157, width: 30, height: 25 },
      'ア-50': { x: 665, y: 187, width: 30, height: 25 },
      'ア-51': { x: 665, y: 217, width: 30, height: 25 },
      'ア-52': { x: 665, y: 247, width: 30, height: 25 },
      'ア-53': { x: 665, y: 277, width: 30, height: 25 },
      'ア-54': { x: 665, y: 307, width: 30, height: 25 },
      'ア-55': { x: 665, y: 337, width: 30, height: 25 },
      'ア-56': { x: 665, y: 367, width: 30, height: 25 },
      'ア-57': { x: 665, y: 397, width: 30, height: 25 },
      'ア-58': { x: 665, y: 427, width: 30, height: 25 },
      'ア-59': { x: 665, y: 457, width: 30, height: 25 },
      'ア-60': { x: 665, y: 487, width: 30, height: 25 },
      'ア-61': { x: 700, y: 487, width: 30, height: 25 },
      'ア-62': { x: 700, y: 457, width: 30, height: 25 },
      'ア-63': { x: 700, y: 427, width: 30, height: 25 },
      'ア-64': { x: 700, y: 397, width: 30, height: 25 },
      'ア-65': { x: 700, y: 367, width: 30, height: 25 },
      'ア-66': { x: 700, y: 337, width: 30, height: 25 },
      'ア-67': { x: 700, y: 307, width: 30, height: 25 },
      'ア-68': { x: 700, y: 277, width: 30, height: 25 },
      'ア-69': { x: 700, y: 247, width: 30, height: 25 },
      'ア-70': { x: 700, y: 217, width: 30, height: 25 },
      'ア-71': { x: 700, y: 187, width: 30, height: 25 },
      'ア-72': { x: 700, y: 157, width: 30, height: 25 },

      // ド行（1-24列）
      'ド-01': { x: 265, y: 557, width: 30, height: 25 },
      'ド-02': { x: 265, y: 587, width: 30, height: 25 },
      'ド-03': { x: 265, y: 617, width: 30, height: 25 },
      'ド-04': { x: 265, y: 647, width: 30, height: 25 },
      'ド-05': { x: 265, y: 677, width: 30, height: 25 },
      'ド-06': { x: 265, y: 707, width: 30, height: 25 },
      'ド-07': { x: 265, y: 737, width: 30, height: 25 },
      'ド-08': { x: 265, y: 767, width: 30, height: 25 },
      'ド-09': { x: 265, y: 797, width: 30, height: 25 },
      'ド-10': { x: 265, y: 827, width: 30, height: 25 },
      'ド-11': { x: 265, y: 857, width: 30, height: 25 },
      'ド-12': { x: 265, y: 887, width: 30, height: 25 },
      'ド-13': { x: 300, y: 887, width: 30, height: 25 },
      'ド-14': { x: 300, y: 857, width: 30, height: 25 },
      'ド-15': { x: 300, y: 827, width: 30, height: 25 },
      'ド-16': { x: 300, y: 797, width: 30, height: 25 },
      'ド-17': { x: 300, y: 767, width: 30, height: 25 },
      'ド-18': { x: 300, y: 737, width: 30, height: 25 },
      'ド-19': { x: 300, y: 707, width: 30, height: 25 },
      'ド-20': { x: 300, y: 677, width: 30, height: 25 },
      'ド-21': { x: 300, y: 647, width: 30, height: 25 },
      'ド-22': { x: 300, y: 617, width: 30, height: 25 },
      'ド-23': { x: 300, y: 587, width: 30, height: 25 },
      'ド-24': { x: 300, y: 557, width: 30, height: 25 },

      // ド行（25-48列）
      'ド-25': { x: 465, y: 557, width: 30, height: 25 },
      'ド-26': { x: 465, y: 587, width: 30, height: 25 },
      'ド-27': { x: 465, y: 617, width: 30, height: 25 },
      'ド-28': { x: 465, y: 647, width: 30, height: 25 },
      'ド-29': { x: 465, y: 677, width: 30, height: 25 },
      'ド-30': { x: 465, y: 707, width: 30, height: 25 },
      'ド-31': { x: 465, y: 737, width: 30, height: 25 },
      'ド-32': { x: 465, y: 767, width: 30, height: 25 },
      'ド-33': { x: 465, y: 797, width: 30, height: 25 },
      'ド-34': { x: 465, y: 827, width: 30, height: 25 },
      'ド-35': { x: 465, y: 857, width: 30, height: 25 },
      'ド-36': { x: 465, y: 887, width: 30, height: 25 },
      'ド-37': { x: 500, y: 887, width: 30, height: 25 },
      'ド-38': { x: 500, y: 857, width: 30, height: 25 },
      'ド-39': { x: 500, y: 827, width: 30, height: 25 },
      'ド-40': { x: 500, y: 797, width: 30, height: 25 },
      'ド-41': { x: 500, y: 767, width: 30, height: 25 },
      'ド-42': { x: 500, y: 737, width: 30, height: 25 },
      'ド-43': { x: 500, y: 707, width: 30, height: 25 },
      'ド-44': { x: 500, y: 677, width: 30, height: 25 },
      'ド-45': { x: 500, y: 647, width: 30, height: 25 },
      'ド-46': { x: 500, y: 617, width: 30, height: 25 },
      'ド-47': { x: 500, y: 587, width: 30, height: 25 },
      'ド-48': { x: 500, y: 557, width: 30, height: 25 },

      // ド行（49-72列）
      'ド-49': { x: 665, y: 557, width: 30, height: 25 },
      'ド-50': { x: 665, y: 587, width: 30, height: 25 },
      'ド-51': { x: 665, y: 617, width: 30, height: 25 },
      'ド-52': { x: 665, y: 647, width: 30, height: 25 },
      'ド-53': { x: 665, y: 677, width: 30, height: 25 },
      'ド-54': { x: 665, y: 707, width: 30, height: 25 },
      'ド-55': { x: 665, y: 737, width: 30, height: 25 },
      'ド-56': { x: 665, y: 767, width: 30, height: 25 },
      'ド-57': { x: 665, y: 797, width: 30, height: 25 },
      'ド-58': { x: 665, y: 827, width: 30, height: 25 },
      'ド-59': { x: 665, y: 857, width: 30, height: 25 },
      'ド-60': { x: 665, y: 887, width: 30, height: 25 },
      'ド-61': { x: 700, y: 887, width: 30, height: 25 },
      'ド-62': { x: 700, y: 857, width: 30, height: 25 },
      'ド-63': { x: 700, y: 827, width: 30, height: 25 },
      'ド-64': { x: 700, y: 797, width: 30, height: 25 },
      'ド-65': { x: 700, y: 767, width: 30, height: 25 },
      'ド-66': { x: 700, y: 737, width: 30, height: 25 },
      'ド-67': { x: 700, y: 707, width: 30, height: 25 },
      'ド-68': { x: 700, y: 677, width: 30, height: 25 },
      'ド-69': { x: 700, y: 647, width: 30, height: 25 },
      'ド-70': { x: 700, y: 617, width: 30, height: 25 },
      'ド-71': { x: 700, y: 587, width: 30, height: 25 },
      'ド-72': { x: 700, y: 557, width: 30, height: 25 }
    }
  },
  {
    eventId: 'geika-31',
    svgPath: '/map-geika31.svg',
    coordinateMapping: {
      // geika-31用の座標マッピング（必要に応じて追加）
      // 現在はgeika-32と同じレイアウトと仮定
      'ア-01': { x: 265, y: 157, width: 30, height: 25 },
      'ア-02': { x: 265, y: 187, width: 30, height: 25 },
      // ... 他の座標も必要に応じて定義
    }
  }
]

export const getMapConfig = (eventId: string): EventMapConfig => {
  return mapConfigs.find(config => config.eventId === eventId) || mapConfigs[0]
}

export const getAllEventIds = (): string[] => {
  return mapConfigs.map(config => config.eventId)
}

export const getCoordinateMapping = (eventId: string) => {
  const config = getMapConfig(eventId)
  return config.coordinateMapping
}

export const getSvgPath = (eventId: string): string => {
  const config = getMapConfig(eventId)
  return config.svgPath
}