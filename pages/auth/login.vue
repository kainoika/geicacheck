<template>
  <div style="min-height: 100vh; background: linear-gradient(135deg, #ff69b4 0%, #87ceeb 50%, #ffd700 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); max-width: 400px; width: 100%;">
      <!-- ヘッダー -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <SparklesIcon style="width: 3rem; height: 3rem; color: #ff69b4; margin: 0 auto 1rem;" />
        <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
          geica check!
        </h1>
        <p style="color: #6b7280; margin: 0;">
          アイカツ！同人イベントサークルチェックアプリ
        </p>
      </div>

      <!-- ログイン状態 -->
      <div v-if="user" style="text-align: center;">
        <!-- ログイン済み -->
        <div style="margin-bottom: 1.5rem;">
          <div style="width: 4rem; height: 4rem; border-radius: 50%; background: #f3f4f6; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
            <UserIcon v-if="!user.displayName" class="h-6 w-6" />{{ user.displayName ? user.displayName.charAt(0) : '' }}
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
            ログイン済み
          </h2>
          <p style="color: #6b7280; margin: 0 0 0.5rem 0;">
            {{ user.displayName || 'ユーザー' }}
          </p>
          <p style="color: #9ca3af; font-size: 0.875rem; margin: 0;">
            {{ user.email }}
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <NuxtLink 
            to="/circles"
            style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border: none; border-radius: 0.5rem; text-decoration: none; text-align: center; font-weight: 500; transition: all 0.2s;"
            onmouseover="this.style.backgroundColor='#e91e63'"
            onmouseout="this.style.backgroundColor='#ff69b4'"
          >
            サークル一覧へ
          </NuxtLink>
          
          <button 
            @click="handleSignOut"
            :disabled="loading"
            style="padding: 0.75rem 1.5rem; background: white; color: #6b7280; border: 1px solid #d1d5db; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
            :style="{ opacity: loading ? 0.5 : 1 }"
            onmouseover="this.style.backgroundColor='#f9fafb'"
            onmouseout="this.style.backgroundColor='white'"
          >
            {{ loading ? 'ログアウト中...' : 'ログアウト' }}
          </button>
        </div>
      </div>

      <!-- ログインフォーム -->
      <div v-else>
        <!-- 説明 -->
        <div style="margin-bottom: 2rem; text-align: center;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
            ログインしてブックマーク機能を使おう
          </h2>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: start; gap: 0.75rem;">
              <InformationCircleIcon style="color: #0284c7; width: 1.25rem; height: 1.25rem;" />
              <div style="flex: 1;">
                <h3 style="font-size: 0.875rem; font-weight: 600; color: #0c4a6e; margin: 0 0 0.5rem 0;">
                  ログインすると使える機能
                </h3>
                <ul style="font-size: 0.875rem; color: #075985; margin: 0; padding-left: 1rem;">
                  <li>サークルのブックマーク機能</li>
                  <li>ブックマークのカテゴリ分け</li>
                  <li>ブックマークリストのCSVエクスポート</li>
                  <li>サークル情報の編集権限申請</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Twitter ログインボタン -->
        <button 
          @click="handleTwitterSignIn"
          :disabled="loading"
          style="width: 100%; padding: 0.75rem 1.5rem; background: #1da1f2; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1rem;"
          :style="{ opacity: loading ? 0.5 : 1 }"
          onmouseover="this.style.backgroundColor='#1a91da'"
          onmouseout="this.style.backgroundColor='#1da1f2'"
        >
          <AtSymbolIcon style="width: 1.25rem; height: 1.25rem;" />
          {{ loading ? 'ログイン中...' : 'Twitterでログイン' }}
        </button>

        <!-- 注意事項 -->
        <div style="background: #fef3f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem;">
          <div style="display: flex; align-items: start; gap: 0.75rem;">
            <ExclamationTriangleIcon style="color: #dc2626; width: 1.25rem; height: 1.25rem;" />
            <div style="flex: 1;">
              <h3 style="font-size: 0.875rem; font-weight: 600; color: #991b1b; margin: 0 0 0.5rem 0;">
                プライバシーについて
              </h3>
              <p style="font-size: 0.875rem; color: #7f1d1d; margin: 0; line-height: 1.4;">
                ログイン時に取得する情報は、ユーザー名、プロフィール画像、TwitterIDのみです。ツイートの投稿や閲覧は行いません。
              </p>
            </div>
          </div>
        </div>

        <!-- ゲスト利用 -->
        <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 0.875rem; margin: 0 0 1rem 0;">
            ログインせずに利用する
          </p>
          <NuxtLink 
            to="/circles"
            style="color: #ff69b4; text-decoration: none; font-weight: 500; font-size: 0.875rem;"
          >
            サークル一覧を見る →
          </NuxtLink>
        </div>
      </div>

      <!-- エラー表示 -->
      <div v-if="error" style="margin-top: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem;">
        <div style="display: flex; align-items: start; gap: 0.75rem;">
          <XCircleIcon style="color: #dc2626; width: 1.25rem; height: 1.25rem;" />
          <div style="flex: 1;">
            <h3 style="font-size: 0.875rem; font-weight: 600; color: #991b1b; margin: 0 0 0.5rem 0;">
              エラーが発生しました
            </h3>
            <p style="font-size: 0.875rem; color: #7f1d1d; margin: 0;">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  SparklesIcon,
  UserIcon,
  InformationCircleIcon,
  AtSymbolIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

// Composables
const { user, loading, error, signInWithTwitter, signOut } = useAuth()

// Methods
const handleTwitterSignIn = async () => {
  try {
    await signInWithTwitter()
    // ログイン成功後、サークル一覧へリダイレクト
    await navigateTo('/circles')
  } catch (err) {
    console.error('Twitter sign in error:', err)
    // エラーは useAuth composable で処理される
  }
}

const handleSignOut = async () => {
  try {
    await signOut()
    // ログアウト成功後、トップページへリダイレクト
    await navigateTo('/')
  } catch (err) {
    console.error('Sign out error:', err)
    // エラーは useAuth composable で処理される
  }
}

// SEO
useHead({
  title: 'ログイン - geica check!',
  meta: [
    { name: 'description', content: 'geica check! にログインして、ブックマーク機能やサークル情報の編集機能を利用しましょう。' }
  ]
})
</script>

<style scoped>
/* アニメーション */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div {
  animation: fadeIn 0.5s ease-out;
}
</style>