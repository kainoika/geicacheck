/**
 * PWAアイコン生成スクリプト
 * 既存のfavicon.icoから仮のPWAアイコンを生成
 */

import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

const publicDir = path.join(process.cwd(), 'public')

// 仮のアイコンを生成（ピンク背景に白文字）
async function generateIcon(size: number) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#FF69B4"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, sans-serif" font-size="${size * 0.25}px" 
            font-weight="bold" fill="white">geica</text>
    </svg>
  `

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(publicDir, `pwa-${size}x${size}.png`))

  console.log(`✅ Generated pwa-${size}x${size}.png`)
}

async function main() {
  try {
    // 必要なサイズのアイコンを生成
    await generateIcon(192)
    await generateIcon(512)
    
    console.log('🎉 PWA icons generated successfully!')
  } catch (error) {
    console.error('❌ Error generating icons:', error)
  }
}

main()