<template>
    <div>
        <!-- ヒーローセクション -->
        <section class="text-center mb-4">
            <h2 style="font-size: 2rem; margin-bottom: 1rem; color: #ff69b4;">
                ようこそ geika check! へ
            </h2>
            <p style="font-size: 1.2rem; color: #6c757d; margin-bottom: 2rem;">
                「芸能人はカードが命！（芸カ）」のサークル情報を効率的にチェック
            </p>

            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <NuxtLink to="/circles" class="btn btn-primary">
                    サークル一覧を見る
                </NuxtLink>
                <button class="btn btn-outline" @click="showDemo">
                    デモを見る
                </button>
            </div>
        </section>

        <!-- 機能紹介 -->
        <section class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 mb-4">
            <div class="card">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📖</div>
                <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">サークル検索</h3>
                <p class="text-muted">
                    ジャンルやタグで簡単にサークルを検索できます。お気に入りのサークルを素早く見つけましょう。
                </p>
            </div>

            <div class="card">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⭐</div>
                <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">ブックマーク機能</h3>
                <p class="text-muted">
                    気になるサークルをブックマークして、チェック予定・気になる・優先の3つのカテゴリで管理できます。
                </p>
            </div>

            <div class="card">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🗺️</div>
                <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">マップ表示</h3>
                <p class="text-muted">
                    配置図上でブックマークしたサークルの位置を確認できます。効率的な巡回計画を立てられます。
                </p>
            </div>

            <div class="card">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🔐</div>
                <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">Twitter認証</h3>
                <p class="text-muted">
                    Twitterアカウントでログインして、サークル情報の編集権限を申請できます。
                </p>
            </div>

            <div class="card">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📊</div>
                <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">CSVエクスポート</h3>
                <p class="text-muted">
                    ブックマークリストをCSV形式でエクスポートして、他のアプリでも活用できます。
                </p>
            </div>

            <div class="card">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📱</div>
                <h3 style="color: #ff69b4; margin-bottom: 0.5rem;">PWA対応</h3>
                <p class="text-muted">
                    スマートフォンのホーム画面に追加して、アプリのように使用できます。
                </p>
            </div>
        </section>

        <!-- サンプルサークル -->
        <section v-if="showSampleCircles">
            <h2 style="font-size: 1.8rem; margin-bottom: 1.5rem; color: #ff69b4; text-align: center;">
                サンプルサークル
            </h2>

            <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3">
                <div v-for="circle in sampleCircles" :key="circle.id" class="card">
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <h3 style="color: #212529; margin-bottom: 0.5rem; font-size: 1.2rem;">
                                {{ circle.name }}
                            </h3>
                            <p style="color: #6c757d; font-size: 0.9rem;">{{ circle.kana }}</p>
                        </div>
                        <button class="btn"
                            style="background: #ff69b4; color: white; padding: 0.5rem; font-size: 0.8rem;"
                            @click="toggleBookmark(circle.id)">
                            {{ bookmarkedCircles.includes(circle.id) ? '⭐' : '☆' }}
                        </button>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <span v-for="genre in circle.genres" :key="genre"
                            style="display: inline-block; background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem; margin-right: 0.5rem; margin-bottom: 0.25rem;">
                            {{ genre }}
                        </span>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; color: #6c757d; font-size: 0.9rem;">
                            <span style="margin-right: 0.5rem;">📍</span>
                            <span>{{ circle.placement }}</span>
                        </div>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <p style="color: #6c757d; font-size: 0.9rem; line-height: 1.4;">
                            {{ circle.description }}
                        </p>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <a v-if="circle.twitter" :href="`https://twitter.com/${circle.twitter}`" target="_blank"
                            style="color: #1da1f2; text-decoration: none; font-size: 0.9rem;">
                            🐦 Twitter
                        </a>
                        <a v-if="circle.pixiv" :href="circle.pixiv" target="_blank"
                            style="color: #0096fa; text-decoration: none; font-size: 0.9rem;">
                            🎨 Pixiv
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- アクションボタン -->
        <section class="text-center mt-4">
            <div
                style="background: linear-gradient(135deg, #ff69b4, #87ceeb); padding: 2rem; border-radius: 0.5rem; color: white;">
                <h2 style="margin-bottom: 1rem;">今すぐ始めよう！</h2>
                <p style="margin-bottom: 1.5rem; opacity: 0.9;">
                    アイカツ！同人イベントをもっと楽しく、もっと効率的に
                </p>
                <button class="btn" style="background: white; color: #ff69b4;" @click="startApp">
                    アプリを始める
                </button>
            </div>
        </section>
    </div>
</template>

<script setup>
// State
const showSampleCircles = ref(false)
const bookmarkedCircles = ref([])

// サンプルデータ
const sampleCircles = ref([
    {
        id: '1',
        name: '星宮製作所',
        kana: 'ほしみやせいさくしょ',
        genres: ['アイカツ！', 'いちご'],
        placement: '東1-あ-01a',
        description: '星宮いちごちゃんのイラスト本とグッズを頒布予定です。キラキラ可愛いいちごちゃんをお楽しみください！',
        twitter: 'hoshimiya_circle',
        pixiv: 'https://pixiv.net/users/12345'
    },
    {
        id: '2',
        name: 'あおい工房',
        kana: 'あおいこうぼう',
        genres: ['アイカツ！', 'あおい'],
        placement: '東1-あ-02b',
        description: '霧矢あおいちゃんのアクセサリーとステッカーを作りました。クールビューティーなあおいちゃんグッズです。',
        twitter: 'aoi_koubou',
        pixiv: null
    },
    {
        id: '3',
        name: 'らんらん堂',
        kana: 'らんらんどう',
        genres: ['アイカツ！', 'らん'],
        placement: '東1-い-15a',
        description: '紫吹蘭ちゃんの同人誌とポストカードセットを頒布します。大人っぽい蘭ちゃんの魅力をお届け！',
        twitter: 'ranran_dou',
        pixiv: 'https://pixiv.net/users/67890'
    }
])

// Methods
const showDemo = () => {
    showSampleCircles.value = !showSampleCircles.value
}

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
    title: 'geika check! - アイカツ！同人イベントサークルチェックアプリ',
    meta: [
        { name: 'description', content: 'アイカツ！シリーズオンリー同人イベント「芸能人はカードが命！（芸カ）」のサークル情報を効率的にチェックできるWebアプリです。' }
    ]
})
</script>