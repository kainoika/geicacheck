/**
 * PWA head要素の手動設定
 * @vite-pwa/nuxtが自動でmanifestリンクを追加しない場合の対策
 */

export default defineNuxtPlugin(() => {
  if (process.client) {
    // manifestリンクが存在しない場合のみ追加
    const existingManifest = document.querySelector('link[rel="manifest"]')
    
    if (!existingManifest) {
      // manifest.webmanifestへのリンクを追加
      const manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      manifestLink.href = '/manifest.webmanifest'
      document.head.appendChild(manifestLink)
      
      console.log('PWA: Manually added manifest link')
    }

    // theme-colorメタタグ確認
    const existingThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!existingThemeColor) {
      const themeColorMeta = document.createElement('meta')
      themeColorMeta.name = 'theme-color'
      themeColorMeta.content = '#FF69B4'
      document.head.appendChild(themeColorMeta)
      
      console.log('PWA: Added theme-color meta tag')
    }

    // viewport確認（PWA要件）
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      const viewportMeta = document.createElement('meta')
      viewportMeta.name = 'viewport'
      viewportMeta.content = 'width=device-width, initial-scale=1'
      document.head.appendChild(viewportMeta)
      
      console.log('PWA: Added viewport meta tag')
    }
  }
})