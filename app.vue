<template>
  <div id="app" style="min-height: 100vh; display: flex; flex-direction: column;">
    <!-- ヘッダー -->
    <AppHeader />
    
    <!-- メインコンテンツ -->
    <main style="flex: 1;">
      <NuxtPage />
    </main>
    
    <!-- フッター -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'

// TODO: イベントデータの初期化は各ページで行う
// const { fetchEvents, currentEvent, loading } = useEvents()

// アプリ起動時の設定
onMounted(() => {
  console.log('🚀 App mounted')
})

// メタ情報の設定
useHead({
  title: 'geika check! - アイカツ！同人イベントサークルチェックアプリ',
  meta: [
    { name: 'description', content: 'アイカツ！シリーズオンリー同人イベント「芸能人はカードが命！（芸カ）」のサークルチェックを効率化するWebアプリ' },
    { name: 'keywords', content: 'アイカツ,同人,イベント,サークル,チェック,ブックマーク' },
    { property: 'og:title', content: 'geika check!' },
    { property: 'og:description', content: 'アイカツ！同人イベントサークルチェックアプリ' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'geika check!' },
    { name: 'twitter:description', content: 'アイカツ！同人イベントサークルチェックアプリ' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<style>
/* グローバルスタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, Osaka, 'MS PGothic', arial, helvetica, sans-serif;
  scroll-behavior: smooth;
}

body {
  background-color: #f8f9fa;
  color: #212529;
  line-height: 1.6;
}

/* ボタンスタイル */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  margin: 0.25rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #ff69b4;
  color: white;
}

.btn-primary:hover {
  background-color: #e91e63;
  transform: translateY(-1px);
}

.btn-outline {
  background-color: transparent;
  color: #ff69b4;
  border: 2px solid #ff69b4;
}

.btn-outline:hover {
  background-color: #ff69b4;
  color: white;
}

/* カードスタイル */
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 1rem 0;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(255, 105, 180, 0.2);
}

/* グリッドレイアウト */
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 768px) {
  .grid-cols-md-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-cols-lg-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid-cols-xl-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ユーティリティクラス */
.text-center {
  text-align: center;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.p-4 {
  padding: 1rem;
}

.text-primary {
  color: #ff69b4;
}

.text-muted {
  color: #6c757d;
}

/* アニメーション */
@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

.sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}
</style>
