<template>
    <div>
        <!-- ログイン済みユーザーのローディング画面 -->
        <div v-if="user && isRedirecting" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-blue-400">
            <div class="text-center text-white">
                <SparklesIcon class="h-16 w-16 mx-auto mb-4 animate-pulse" />
                <div class="text-xl font-semibold mb-2">サークル一覧ページに移動中...</div>
                <div class="text-lg opacity-90">しばらくお待ちください</div>
            </div>
        </div>

        <!-- 未ログインユーザー向けランディングページ -->
        <div v-else>
        <!-- ヒーローセクション -->
        <section class="text-center mt-4">
            <div
                style="background: linear-gradient(135deg, #ff69b4, #87ceeb); padding: 2rem; border-radius: 0.5rem; color: white;">

            <h2 style="font-size: 2rem; margin-bottom: 1rem; color: #ffffff;">
                ようこそ geica check! へ
            </h2>
            <p style="font-size: 1.2rem; color: #ffffff; margin-bottom: 2rem;">
                アイカツ！同人イベントをもっと楽しく、もっと効率的に
            </p>

            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn" style="background: white; color: #ff69b4;" @click="startApp">
                サークル一覧を見る
                </button>
                <NuxtLink 
                    to="/auth/login" 
                    class="btn" 
                    style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;"
                >
                    <LockClosedIcon style="width: 1.25rem; height: 1.25rem;" />
                    ログインしてはじめる
                </NuxtLink>
            </div>
            </div>
        </section>

        <!-- 主要機能へのナビゲーション -->
        <section style="margin-bottom: 3rem;">
            <h2 style="font-size: 1.8rem; margin-bottom: 2rem; color: #ff69b4; text-align: center;">
                主要機能
            </h2>
            <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 mb-4">
                <!-- サークル検索 -->
                <NuxtLink to="/circles" class="card" style="text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;"
                    onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(255, 105, 180, 0.15)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><BookOpenIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">サークル検索</h3>
                    <p class="text-muted" style="margin-bottom: 1rem;">
                        ジャンルやタグで簡単にサークルを検索できます。お気に入りのサークルを素早く見つけましょう。
                    </p>
                    <div style="color: #ff69b4; font-weight: 500; font-size: 0.9rem;">
                        → サークル一覧を見る
                    </div>
                </NuxtLink>

                <!-- ブックマーク機能 -->
                <NuxtLink to="/bookmarks" class="card" style="text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;"
                    onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(255, 105, 180, 0.15)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><StarIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">ブックマーク機能</h3>
                    <p class="text-muted" style="margin-bottom: 1rem;">
                        気になるサークルをブックマークして、チェック予定・気になる・優先の3つのカテゴリで管理できます。
                    </p>
                    <div style="color: #ff69b4; font-weight: 500; font-size: 0.9rem;">
                        → ブックマーク一覧を見る
                    </div>
                </NuxtLink>

                <!-- マップ表示 -->
                <NuxtLink to="/map" class="card" style="text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;"
                    onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(255, 105, 180, 0.15)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><MapIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">マップ表示</h3>
                    <p class="text-muted" style="margin-bottom: 1rem;">
                        配置図上でブックマークしたサークルの位置を確認できます。効率的な巡回計画を立てられます。
                    </p>
                    <div style="color: #ff69b4; font-weight: 500; font-size: 0.9rem;">
                        → 会場マップを見る
                    </div>
                </NuxtLink>
            </div>
        </section>

        <!-- ユーザー機能 -->
        <section style="margin-bottom: 3rem;">
            <h2 style="font-size: 1.8rem; margin-bottom: 2rem; color: #ff69b4; text-align: center;">
                <UserIcon style="width: 1.5rem; height: 1.5rem; display: inline; margin-right: 0.5rem; vertical-align: -0.25rem;" /> ユーザー機能
            </h2>
            <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 mb-4">
                <!-- ログイン -->
                <NuxtLink to="/auth/login" class="card" style="text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;"
                    onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(255, 105, 180, 0.15)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><LockClosedIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">Twitter認証</h3>
                    <p class="text-muted" style="margin-bottom: 1rem;">
                        Twitterアカウントでログインして、ブックマーク機能やサークル情報の編集権限を申請できます。
                    </p>
                    <div style="color: #ff69b4; font-weight: 500; font-size: 0.9rem;">
                        → ログインページへ
                    </div>
                </NuxtLink>

                <!-- プロフィール -->
                <NuxtLink to="/profile" class="card" style="text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;"
                    onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(255, 105, 180, 0.15)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><UserIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">プロフィール</h3>
                    <p class="text-muted" style="margin-bottom: 1rem;">
                        ユーザー情報の管理、ブックマーク統計の確認、編集権限の申請状況を確認できます。
                    </p>
                    <div style="color: #ff69b4; font-weight: 500; font-size: 0.9rem;">
                        → プロフィールを見る
                    </div>
                </NuxtLink>

                <!-- サークル情報編集 -->
                <NuxtLink to="/circles" class="card" style="text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;"
                    onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(255, 105, 180, 0.15)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><PencilIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">サークル参加者の方へ</h3>
                    <p class="text-muted" style="margin-bottom: 1rem;">
                        ご自身のサークル情報を編集したい場合は、サークル詳細ページから編集権限を申請できます。
                    </p>
                    <div style="color: #ff69b4; font-weight: 500; font-size: 0.9rem;">
                        → サークル一覧へ
                    </div>
                </NuxtLink>

            </div>
        </section>

        <!-- その他の機能 -->
        <section style="margin-bottom: 3rem;">
            <h2 style="font-size: 1.8rem; margin-bottom: 2rem; color: #ff69b4; text-align: center;">
                <WrenchScrewdriverIcon style="width: 1.5rem; height: 1.5rem; display: inline; margin-right: 0.5rem; vertical-align: -0.25rem;" /> その他の機能
            </h2>
            <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 mb-4">
                <!-- CSVエクスポート -->
                <div class="card">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><DocumentArrowDownIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">CSVエクスポート</h3>
                    <p class="text-muted">
                        ブックマークリストをCSV形式でエクスポートして、他のアプリでも活用できます。
                    </p>
                </div>

                <!-- PWA対応 -->
                <div class="card">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><DevicePhoneMobileIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">PWA対応</h3>
                    <p class="text-muted">
                        スマートフォンのホーム画面に追加して、アプリのように使用できます。
                    </p>
                </div>

                <!-- アプリについて -->
                <NuxtLink to="/about" class="card" style="text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;"
                    onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(255, 105, 180, 0.15)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'">
                    <div style="font-size: 2rem; margin-bottom: 1rem;"><InformationCircleIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
                    <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">アプリについて</h3>
                    <p class="text-muted" style="margin-bottom: 1rem;">
                        geica check! の詳細情報、使い方、技術情報を確認できます。
                    </p>
                    <div style="color: #ff69b4; font-weight: 500; font-size: 0.9rem;">
                        → 詳細情報を見る
                    </div>
                </NuxtLink>
            </div>
        </section>
        </div>
    </div>
</template>

<script setup>
import {
    StarIcon,
    HomeIcon,
    BookOpenIcon,
    MapIcon,
    LockClosedIcon,
    UserIcon,
    PencilIcon,
    WrenchScrewdriverIcon,
    InformationCircleIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    DocumentArrowDownIcon,
    SparklesIcon
} from '@heroicons/vue/24/outline'

// 認証状態の確認とリダイレクト
const { user } = useAuth()
const logger = useLogger('IndexPage')

// リダイレクト状態管理
const isRedirecting = ref(false)

// ログイン済みユーザーはサークル一覧ページにリダイレクト
const checkAuthAndRedirect = () => {
  if (user.value) {
    logger.info('User is authenticated, redirecting to circles page')
    isRedirecting.value = true
    // 少し遅延を入れてスムーズなUXを提供
    setTimeout(() => {
      navigateTo('/circles')
    }, 500)
  }
}

// 初期チェック
onMounted(() => {
  // 認証状態が確定するまで少し待つ
  setTimeout(() => {
    checkAuthAndRedirect()
  }, 100)
})

// ユーザー状態が変更された時の監視
watch(() => user.value, (newUser, oldUser) => {
  // undefinedから実際の値に変わった時のみ処理
  if (oldUser === undefined && newUser) {
    logger.info('User logged in, redirecting to circles page')
    isRedirecting.value = true
    setTimeout(() => {
      navigateTo('/circles')
    }, 500)
  }
}, { immediate: true })

// State
const bookmarkedCircles = ref([])

// Methods
const toggleBookmark = (circleId) => {
    const index = bookmarkedCircles.value.indexOf(circleId)
    if (index > -1) {
        bookmarkedCircles.value.splice(index, 1)
    } else {
        bookmarkedCircles.value.push(circleId)
    }
}

const startApp = () => {
    // サークル一覧ページへナビゲーション
    navigateTo('/circles')
}

// SEO
useHead({
    title: 'geica check! - アイカツ！同人イベントサークルチェックアプリ',
    meta: [
        { name: 'description', content: 'アイカツ！シリーズオンリー同人イベント「芸能人はカードが命！（芸カ）」のサークル情報を効率的にチェックできるWebアプリです。' }
    ]
})
</script>