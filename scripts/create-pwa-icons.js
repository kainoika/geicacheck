/**
 * 簡易PWAアイコン生成スクリプト（Node.js用）
 * SVGを使用してPWAアイコンを生成
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVGアイコンのテンプレート
const createSvg = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FF69B4" rx="${size * 0.1}"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" 
        font-family="Arial, sans-serif" font-size="${size * 0.3}px" 
        font-weight="bold" fill="white">geica</text>
</svg>
`;

// 指定サイズのSVGを生成
const sizes = [192, 512];

sizes.forEach(size => {
  const svg = createSvg(size);
  const filename = path.join(__dirname, '..', 'public', `pwa-${size}x${size}.svg`);
  
  fs.writeFileSync(filename, svg);
  console.log(`Created: pwa-${size}x${size}.svg`);
});

console.log('SVG icons created successfully!');
console.log('Note: These are SVG files. For better compatibility, convert them to PNG using an image editor.');