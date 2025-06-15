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
    eventId: 'geica-32',
    svgPath: '/map-geica32.svg',
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
    eventId: 'geica-31',
    svgPath: '/map-geica31.svg',
    coordinateMapping: {
      // つエリア (左上) - つ-41からつ-44
      'つ-41': { x: 85, y: 152, width: 30, height: 25 },
      'つ-42': { x: 85, y: 182, width: 30, height: 25 },
      'つ-43': { x: 85, y: 212, width: 30, height: 25 },
      'つ-44': { x: 85, y: 242, width: 30, height: 25 },

      // つエリア (右上) - つ-25からつ-28
      'つ-25': { x: 1140, y: 622, width: 30, height: 25 },
      'つ-26': { x: 1140, y: 652, width: 30, height: 25 },
      'つ-27': { x: 1140, y: 682, width: 30, height: 25 },
      'つ-28': { x: 1140, y: 712, width: 30, height: 25 },

      // あエリア (transform="translate(150, 180)")
      // あ-24からあ-13 (第1行)
      'あ-24': { x: 165, y: 197, width: 30, height: 25 },
      'あ-23': { x: 200, y: 197, width: 30, height: 25 },
      'あ-22': { x: 235, y: 197, width: 30, height: 25 },
      'あ-21': { x: 270, y: 197, width: 30, height: 25 },
      'あ-20': { x: 305, y: 197, width: 30, height: 25 },
      'あ-19': { x: 340, y: 197, width: 30, height: 25 },
      'あ-18': { x: 375, y: 197, width: 30, height: 25 },
      'あ-17': { x: 410, y: 197, width: 30, height: 25 },
      'あ-16': { x: 445, y: 197, width: 30, height: 25 },
      'あ-15': { x: 480, y: 197, width: 30, height: 25 },
      'あ-14': { x: 515, y: 197, width: 30, height: 25 },
      'あ-13': { x: 550, y: 197, width: 30, height: 25 },

      // あ-12からあ-01 (第1行右側、transform="translate(500, 0)")
      'あ-12': { x: 665, y: 197, width: 30, height: 25 },
      'あ-11': { x: 700, y: 197, width: 30, height: 25 },
      'あ-10': { x: 735, y: 197, width: 30, height: 25 },
      'あ-09': { x: 770, y: 197, width: 30, height: 25 },
      'あ-08': { x: 805, y: 197, width: 30, height: 25 },
      'あ-07': { x: 840, y: 197, width: 30, height: 25 },
      'あ-06': { x: 875, y: 197, width: 30, height: 25 },
      'あ-05': { x: 910, y: 197, width: 30, height: 25 },
      'あ-04': { x: 945, y: 197, width: 30, height: 25 },
      'あ-03': { x: 980, y: 197, width: 30, height: 25 },
      'あ-02': { x: 1015, y: 197, width: 30, height: 25 },
      'あ-01': { x: 1050, y: 197, width: 30, height: 25 },

      // あ-25からあ-34 (第2行、transform="translate(0, 50)")
      'あ-25': { x: 165, y: 247, width: 30, height: 25 },
      'あ-26': { x: 200, y: 247, width: 30, height: 25 },
      'あ-27': { x: 235, y: 247, width: 30, height: 25 },
      'あ-28': { x: 270, y: 247, width: 30, height: 25 },
      'あ-29': { x: 305, y: 247, width: 30, height: 25 },
      'あ-30': { x: 340, y: 247, width: 30, height: 25 },
      'あ-31': { x: 445, y: 247, width: 30, height: 25 },
      'あ-32': { x: 480, y: 247, width: 30, height: 25 },
      'あ-33': { x: 515, y: 247, width: 30, height: 25 },
      'あ-34': { x: 550, y: 247, width: 30, height: 25 },

      // あ-35からあ-44 (第2行右側)
      'あ-35': { x: 665, y: 247, width: 30, height: 25 },
      'あ-36': { x: 700, y: 247, width: 30, height: 25 },
      'あ-37': { x: 735, y: 247, width: 30, height: 25 },
      'あ-38': { x: 770, y: 247, width: 30, height: 25 },
      'あ-39': { x: 875, y: 247, width: 30, height: 25 },
      'あ-40': { x: 910, y: 247, width: 30, height: 25 },
      'あ-41': { x: 945, y: 247, width: 30, height: 25 },
      'あ-42': { x: 980, y: 247, width: 30, height: 25 },
      'あ-43': { x: 1015, y: 247, width: 30, height: 25 },
      'あ-44': { x: 1050, y: 247, width: 30, height: 25 },

      // いエリア (transform="translate(150, 350)")
      // い-24からい-13 (第1行)
      'い-24': { x: 165, y: 367, width: 30, height: 25 },
      'い-23': { x: 200, y: 367, width: 30, height: 25 },
      'い-22': { x: 235, y: 367, width: 30, height: 25 },
      'い-21': { x: 270, y: 367, width: 30, height: 25 },
      'い-20': { x: 305, y: 367, width: 30, height: 25 },
      'い-19': { x: 340, y: 367, width: 30, height: 25 },
      'い-18': { x: 375, y: 367, width: 30, height: 25 },
      'い-17': { x: 410, y: 367, width: 30, height: 25 },
      'い-16': { x: 445, y: 367, width: 30, height: 25 },
      'い-15': { x: 480, y: 367, width: 30, height: 25 },
      'い-14': { x: 515, y: 367, width: 30, height: 25 },
      'い-13': { x: 550, y: 367, width: 30, height: 25 },

      // い-12からい-01 (第1行右側)
      'い-12': { x: 665, y: 367, width: 30, height: 25 },
      'い-11': { x: 700, y: 367, width: 30, height: 25 },
      'い-10': { x: 735, y: 367, width: 30, height: 25 },
      'い-09': { x: 770, y: 367, width: 30, height: 25 },
      'い-08': { x: 805, y: 367, width: 30, height: 25 },
      'い-07': { x: 840, y: 367, width: 30, height: 25 },
      'い-06': { x: 875, y: 367, width: 30, height: 25 },
      'い-05': { x: 910, y: 367, width: 30, height: 25 },
      'い-04': { x: 945, y: 367, width: 30, height: 25 },
      'い-03': { x: 980, y: 367, width: 30, height: 25 },
      'い-02': { x: 1015, y: 367, width: 30, height: 25 },
      'い-01': { x: 1050, y: 367, width: 30, height: 25 },

      // い-25からい-34 (第2行)
      'い-25': { x: 165, y: 417, width: 30, height: 25 },
      'い-26': { x: 200, y: 417, width: 30, height: 25 },
      'い-27': { x: 235, y: 417, width: 30, height: 25 },
      'い-28': { x: 270, y: 417, width: 30, height: 25 },
      'い-29': { x: 305, y: 417, width: 30, height: 25 },
      'い-30': { x: 340, y: 417, width: 30, height: 25 },
      'い-31': { x: 445, y: 417, width: 30, height: 25 },
      'い-32': { x: 480, y: 417, width: 30, height: 25 },
      'い-33': { x: 515, y: 417, width: 30, height: 25 },
      'い-34': { x: 550, y: 417, width: 30, height: 25 },

      // い-35からい-44 (第2行右側)
      'い-35': { x: 665, y: 417, width: 30, height: 25 },
      'い-36': { x: 700, y: 417, width: 30, height: 25 },
      'い-37': { x: 735, y: 417, width: 30, height: 25 },
      'い-38': { x: 770, y: 417, width: 30, height: 25 },
      'い-39': { x: 875, y: 417, width: 30, height: 25 },
      'い-40': { x: 910, y: 417, width: 30, height: 25 },
      'い-41': { x: 945, y: 417, width: 30, height: 25 },
      'い-42': { x: 980, y: 417, width: 30, height: 25 },
      'い-43': { x: 1015, y: 417, width: 30, height: 25 },
      'い-44': { x: 1050, y: 417, width: 30, height: 25 },

      // かエリア (transform="translate(150, 520)")
      // か-24からか-13 (第1行)
      'か-24': { x: 165, y: 537, width: 30, height: 25 },
      'か-23': { x: 200, y: 537, width: 30, height: 25 },
      'か-22': { x: 235, y: 537, width: 30, height: 25 },
      'か-21': { x: 270, y: 537, width: 30, height: 25 },
      'か-20': { x: 305, y: 537, width: 30, height: 25 },
      'か-19': { x: 340, y: 537, width: 30, height: 25 },
      'か-18': { x: 375, y: 537, width: 30, height: 25 },
      'か-17': { x: 410, y: 537, width: 30, height: 25 },
      'か-16': { x: 445, y: 537, width: 30, height: 25 },
      'か-15': { x: 480, y: 537, width: 30, height: 25 },
      'か-14': { x: 515, y: 537, width: 30, height: 25 },
      'か-13': { x: 550, y: 537, width: 30, height: 25 },

      // か-12からか-01 (第1行右側)
      'か-12': { x: 665, y: 537, width: 30, height: 25 },
      'か-11': { x: 700, y: 537, width: 30, height: 25 },
      'か-10': { x: 735, y: 537, width: 30, height: 25 },
      'か-09': { x: 770, y: 537, width: 30, height: 25 },
      'か-08': { x: 805, y: 537, width: 30, height: 25 },
      'か-07': { x: 840, y: 537, width: 30, height: 25 },
      'か-06': { x: 875, y: 537, width: 30, height: 25 },
      'か-05': { x: 910, y: 537, width: 30, height: 25 },
      'か-04': { x: 945, y: 537, width: 30, height: 25 },
      'か-03': { x: 980, y: 537, width: 30, height: 25 },
      'か-02': { x: 1015, y: 537, width: 30, height: 25 },
      'か-01': { x: 1050, y: 537, width: 30, height: 25 },

      // か-25からか-34 (第2行)
      'か-25': { x: 165, y: 587, width: 30, height: 25 },
      'か-26': { x: 200, y: 587, width: 30, height: 25 },
      'か-27': { x: 235, y: 587, width: 30, height: 25 },
      'か-28': { x: 270, y: 587, width: 30, height: 25 },
      'か-29': { x: 305, y: 587, width: 30, height: 25 },
      'か-30': { x: 340, y: 587, width: 30, height: 25 },
      'か-31': { x: 445, y: 587, width: 30, height: 25 },
      'か-32': { x: 480, y: 587, width: 30, height: 25 },
      'か-33': { x: 515, y: 587, width: 30, height: 25 },
      'か-34': { x: 550, y: 587, width: 30, height: 25 },

      // か-35からか-44 (第2行右側)
      'か-35': { x: 665, y: 587, width: 30, height: 25 },
      'か-36': { x: 700, y: 587, width: 30, height: 25 },
      'か-37': { x: 735, y: 587, width: 30, height: 25 },
      'か-38': { x: 770, y: 587, width: 30, height: 25 },
      'か-39': { x: 875, y: 587, width: 30, height: 25 },
      'か-40': { x: 910, y: 587, width: 30, height: 25 },
      'か-41': { x: 945, y: 587, width: 30, height: 25 },
      'か-42': { x: 980, y: 587, width: 30, height: 25 },
      'か-43': { x: 1015, y: 587, width: 30, height: 25 },
      'か-44': { x: 1050, y: 587, width: 30, height: 25 },

      // つエリア左下 - つ-40からつ-33
      'つ-40': { x: 85, y: 507, width: 30, height: 25 },
      'つ-39': { x: 85, y: 537, width: 30, height: 25 },
      'つ-38': { x: 85, y: 567, width: 30, height: 25 },
      'つ-37': { x: 85, y: 597, width: 30, height: 25 },
      'つ-36': { x: 85, y: 627, width: 30, height: 25 },
      'つ-35': { x: 85, y: 657, width: 30, height: 25 },
      'つ-34': { x: 85, y: 687, width: 30, height: 25 },
      'つ-33': { x: 85, y: 717, width: 30, height: 25 },

      // つエリア右下 - つ-32からつ-29
      'つ-32': { x: 1140, y: 507, width: 30, height: 25 },
      'つ-31': { x: 1140, y: 537, width: 30, height: 25 },
      'つ-30': { x: 1140, y: 567, width: 30, height: 25 },
      'つ-29': { x: 1140, y: 597, width: 30, height: 25 },

      // つエリア下部 (つ-14からつ-01)
      'つ-14': { x: 365, y: 717, width: 30, height: 25 },
      'つ-13': { x: 400, y: 717, width: 30, height: 25 },
      'つ-12': { x: 435, y: 717, width: 30, height: 25 },
      'つ-11': { x: 470, y: 717, width: 30, height: 25 },
      'つ-10': { x: 505, y: 717, width: 30, height: 25 },
      'つ-09': { x: 540, y: 717, width: 30, height: 25 },
      'つ-08': { x: 575, y: 717, width: 30, height: 25 },
      'つ-07': { x: 610, y: 717, width: 30, height: 25 },
      'つ-06': { x: 645, y: 717, width: 30, height: 25 },
      'つ-05': { x: 680, y: 717, width: 30, height: 25 },
      'つ-04': { x: 715, y: 717, width: 30, height: 25 },
      'つ-03': { x: 750, y: 717, width: 30, height: 25 },
      'つ-02': { x: 785, y: 717, width: 30, height: 25 },
      'つ-01': { x: 820, y: 717, width: 30, height: 25 },

      // つエリア下部第2行 (つ-15からつ-24)
      'つ-15': { x: 465, y: 797, width: 30, height: 25 },
      'つ-16': { x: 500, y: 797, width: 30, height: 25 },
      'つ-17': { x: 535, y: 797, width: 30, height: 25 },
      'つ-18': { x: 570, y: 797, width: 30, height: 25 },
      'つ-19': { x: 605, y: 797, width: 30, height: 25 },
      'つ-20': { x: 640, y: 797, width: 30, height: 25 },
      'つ-21': { x: 675, y: 797, width: 30, height: 25 },
      'つ-22': { x: 710, y: 797, width: 30, height: 25 },
      'つ-23': { x: 745, y: 797, width: 30, height: 25 },
      'つ-24': { x: 780, y: 797, width: 30, height: 25 }
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