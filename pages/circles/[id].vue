<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- ローディング状態 -->
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; min-height: 50vh;">
      <div style="display: flex; align-items: center; gap: 0.5rem; color: #6b7280;">
        <div style="width: 1rem; height: 1rem; border: 2px solid #ff69b4; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        読み込み中...
      </div>
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" style="text-align: center; padding: 4rem;">
      <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
        サークルが見つかりません
      </h2>
      <p style="color: #6b7280; margin: 0 0 2rem 0;">{{ error }}</p>
      <NuxtLink 
        to="/circles"
        style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 500;"
      >
        サークル一覧に戻る
      </NuxtLink>
    </div>

    <!-- サークル詳細 -->
    <div v-else-if="circle">
      <!-- ヘッダー -->
      <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 2rem 0;">
        <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <button 
              @click="$router.back()"
              style="padding: 0.5rem; border: 1px solid #d1d5db; background: white; border-radius: 0.375rem; cursor: pointer; color: #6b7280;"
            >
              ← 戻る
            </button>
            <div style="flex: 1;">
              <h1 style="font-size: 2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
                {{ circle.circleName }}
              </h1>
              <p v-if="circle.circleKana" style="color: #6b7280; margin: 0; font-size: 1.125rem;">
                {{ circle.circleKana }}
              </p>
            </div>
            
            <!-- ブックマークボタン -->
            <div style="flex-shrink: 0;">
              <BookmarkButton 
                :circle-id="circle.id"
                @bookmark="handleBookmark"
              />
            </div>
          </div>

          <!-- 基本情報 -->
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
            <!-- 配置 -->
            <div style="display: flex; align-items: center; gap: 0.5rem; background: #fef3f2; padding: 0.5rem 1rem; border-radius: 0.5rem;">
              <span style="font-size: 1.25rem;">📍</span>
              <div>
                <div style="font-weight: 600; color: #111827;">{{ formatPlacement(circle.placement) }}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">{{ circle.placement.day }}日目</div>
              </div>
            </div>

            <!-- 成人向けマーク -->
            <div v-if="circle.isAdult" style="display: flex; align-items: center; gap: 0.5rem; background: #fef3c7; padding: 0.5rem 1rem; border-radius: 0.5rem;">
              <span style="font-size: 1.25rem;">⚠️</span>
              <span style="font-weight: 600; color: #92400e;">成人向け</span>
            </div>

            <!-- マップで確認 -->
            <NuxtLink 
              to="/map"
              style="display: flex; align-items: center; gap: 0.5rem; background: #f0f9ff; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; color: #0284c7; font-weight: 500;"
            >
              <span style="font-size: 1.25rem;">🗺️</span>
              マップで確認
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- メインコンテンツ -->
      <div style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
          <!-- 左カラム：詳細情報 -->
          <div style="display: flex; flex-direction: column; gap: 2rem;">
            <!-- ジャンル -->
            <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                🎨 ジャンル
              </h2>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                <span 
                  v-for="genre in circle.genre" 
                  :key="genre"
                  style="background: #e0f2fe; color: #0277bd; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500;"
                >
                  {{ genre }}
                </span>
              </div>
            </div>

            <!-- 説明 -->
            <div v-if="circle.description" style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                📝 サークル説明
              </h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0;">
                {{ circle.description }}
              </p>
            </div>

            <!-- タグ -->
            <div v-if="circle.tags && circle.tags.length > 0" style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                🏷️ タグ
              </h2>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                <span 
                  v-for="tag in circle.tags" 
                  :key="tag"
                  style="background: #f3f4f6; color: #374151; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem;"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- 頒布物情報 -->
            <div v-if="circle.items && circle.items.length > 0" style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                📦 頒布物
              </h2>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div 
                  v-for="item in circle.items" 
                  :key="item.id"
                  style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;"
                >
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h3 style="font-weight: 600; color: #111827; margin: 0;">{{ item.name }}</h3>
                    <span style="font-weight: 600; color: #ff69b4;">{{ item.price }}円</span>
                  </div>
                  <p v-if="item.description" style="color: #6b7280; margin: 0; font-size: 0.875rem;">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 右カラム：サイドバー -->
          <div style="display: flex; flex-direction: column; gap: 2rem;">
            <!-- 連絡先 -->
            <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                📞 連絡先
              </h2>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- Twitter -->
                <a 
                  v-if="circle.contact.twitter"
                  :href="getTwitterUrl(circle.contact.twitter)"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f0f9ff; border-radius: 0.5rem; text-decoration: none; color: #1da1f2; transition: all 0.2s;"
                  onmouseover="this.style.backgroundColor='#e0f2fe'"
                  onmouseout="this.style.backgroundColor='#f0f9ff'"
                >
                  <span style="font-size: 1.25rem;">🐦</span>
                  <div>
                    <div style="font-weight: 600;">Twitter</div>
                    <div style="font-size: 0.875rem; opacity: 0.8;">@{{ circle.contact.twitter }}</div>
                  </div>
                </a>

                <!-- Pixiv -->
                <a 
                  v-if="circle.contact.pixiv"
                  :href="circle.contact.pixiv"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f0f9ff; border-radius: 0.5rem; text-decoration: none; color: #0284c7; transition: all 0.2s;"
                  onmouseover="this.style.backgroundColor='#e0f2fe'"
                  onmouseout="this.style.backgroundColor='#f0f9ff'"
                >
                  <span style="font-size: 1.25rem;">🎨</span>
                  <div>
                    <div style="font-weight: 600;">Pixiv</div>
                    <div style="font-size: 0.875rem; opacity: 0.8;">作品を見る</div>
                  </div>
                </a>

                <!-- Website -->
                <a 
                  v-if="circle.contact.website"
                  :href="circle.contact.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f0fdf4; border-radius: 0.5rem; text-decoration: none; color: #16a34a; transition: all 0.2s;"
                  onmouseover="this.style.backgroundColor='#dcfce7'"
                  onmouseout="this.style.backgroundColor='#f0fdf4'"
                >
                  <span style="font-size: 1.25rem;">🌐</span>
                  <div>
                    <div style="font-weight: 600;">Website</div>
                    <div style="font-size: 0.875rem; opacity: 0.8;">公式サイト</div>
                  </div>
                </a>

                <!-- お品書き -->
                <a 
                  v-if="circle.contact.oshinaUrl"
                  :href="circle.contact.oshinaUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #fff7ed; border-radius: 0.5rem; text-decoration: none; color: #ea580c; transition: all 0.2s;"
                  onmouseover="this.style.backgroundColor='#fed7aa'"
                  onmouseout="this.style.backgroundColor='#fff7ed'"
                >
                  <span style="font-size: 1.25rem;">📋</span>
                  <div>
                    <div style="font-weight: 600;">お品書き</div>
                    <div style="font-size: 0.875rem; opacity: 0.8;">頒布物一覧</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- 配置詳細 -->
            <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                📍 配置詳細
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">開催日</span>
                  <span style="font-weight: 600; color: #111827;">{{ circle.placement.day }}日目</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">エリア</span>
                  <span style="font-weight: 600; color: #111827;">{{ circle.placement.area }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">ブロック</span>
                  <span style="font-weight: 600; color: #111827;">{{ circle.placement.block }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">番号</span>
                  <span style="font-weight: 600; color: #111827;">{{ circle.placement.number }}{{ circle.placement.position }}</span>
                </div>
              </div>
            </div>

            <!-- アクション -->
            <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                ⚡ アクション
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <!-- 編集ボタン（編集権限がある場合） -->
                <NuxtLink
                  v-if="hasEditPermission"
                  :to="`/circles/edit/${circle.id}`"
                  style="padding: 0.75rem; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 0.5rem; text-decoration: none; font-weight: 500; transition: all 0.2s; text-align: center;"
                  onmouseover="this.style.backgroundColor='#dcfce7'"
                  onmouseout="this.style.backgroundColor='#f0fdf4'"
                >
                  ✏️ 情報を編集
                </NuxtLink>
                
                <button
                  @click="shareCircle"
                  style="padding: 0.75rem; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
                  onmouseover="this.style.backgroundColor='#e5e7eb'"
                  onmouseout="this.style.backgroundColor='#f3f4f6'"
                >
                  🔗 シェア
                </button>
                
                <button
                  v-if="isAuthenticated"
                  @click="reportCircle"
                  style="padding: 0.75rem; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
                  onmouseover="this.style.backgroundColor='#fee2e2'"
                  onmouseout="this.style.backgroundColor='#fef2f2'"
                >
                  🚨 報告
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Route params
const route = useRoute()
const circleId = route.params.id

// State
const circle = ref(null)
const loading = ref(true)
const error = ref(null)
const isAuthenticated = ref(true) // サンプル
const hasEditPermission = ref(true) // サンプル（実際の実装では useAuth().hasEditPermission を使用）

// サンプルデータ
const sampleCircles = {
  '1': {
    id: '1',
    circleName: '星宮製作所',
    circleKana: 'ほしみやせいさくしょ',
    genre: ['アイカツ！', 'いちご'],
    placement: { day: '1', area: '東1', block: 'あ', number: '01', position: 'a' },
    description: '星宮いちごちゃんのイラスト本とグッズを頒布予定です。キラキラ可愛いいちごちゃんをお楽しみください！今回は新刊として「いちごちゃんの日常」をテーマにした4コマ漫画本と、アクリルキーホルダー、缶バッジセットをご用意しています。',
    contact: { 
      twitter: 'hoshimiya_circle', 
      pixiv: 'https://pixiv.net/users/12345',
      website: 'https://hoshimiya-circle.example.com',
      oshinaUrl: 'https://oshina.example.com/hoshimiya'
    },
    tags: ['いちご', 'イラスト', 'グッズ', 'キラキラ', '4コマ', 'アクリルキーホルダー'],
    isAdult: false,
    items: [
      {
        id: '1',
        name: 'いちごちゃんの日常 4コマ本',
        price: 500,
        description: 'B5サイズ、28ページのフルカラー4コマ漫画本です。'
      },
      {
        id: '2',
        name: 'いちごちゃんアクリルキーホルダー',
        price: 800,
        description: '約6cmのアクリルキーホルダー。両面印刷です。'
      },
      {
        id: '3',
        name: '缶バッジセット（3個入り）',
        price: 600,
        description: '直径5.7cmの缶バッジ3個セットです。'
      }
    ]
  },
  '2': {
    id: '2',
    circleName: 'あおい工房',
    circleKana: 'あおいこうぼう',
    genre: ['アイカツ！', 'あおい'],
    placement: { day: '1', area: '東1', block: 'あ', number: '02', position: 'b' },
    description: '霧矢あおいちゃんのアクセサリーとステッカーを作りました。クールビューティーなあおいちゃんグッズです。',
    contact: { twitter: 'aoi_koubou' },
    tags: ['あおい', 'アクセサリー', 'ステッカー', 'クール'],
    isAdult: false,
    items: []
  }
}

// Methods
const formatPlacement = (placement) => {
  return `${placement.area}-${placement.block}-${placement.number}${placement.position}`
}

const getTwitterUrl = (twitterId) => {
  const cleanId = twitterId.replace('@', '')
  return `https://twitter.com/${cleanId}`
}

const handleBookmark = (category) => {
  console.log('Bookmark:', circleId, category)
  // 実際の実装では useBookmarks().toggleBookmark を使用
}

const shareCircle = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${circle.value.circleName} - geika check!`,
        text: circle.value.description,
        url: window.location.href
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    // フォールバック: URLをクリップボードにコピー
    await navigator.clipboard.writeText(window.location.href)
    alert('URLをクリップボードにコピーしました')
  }
}

const reportCircle = () => {
  alert('報告機能は準備中です')
}

// データ取得
const fetchCircle = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 実際の実装では API からデータを取得
    await new Promise(resolve => setTimeout(resolve, 500)) // シミュレーション
    
    const circleData = sampleCircles[circleId]
    if (!circleData) {
      throw new Error('指定されたサークルが見つかりません')
    }
    
    circle.value = circleData
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 初期化
onMounted(() => {
  fetchCircle()
})

// SEO
useHead(() => ({
  title: circle.value ? `${circle.value.circleName} - geika check!` : 'サークル詳細 - geika check!',
  meta: [
    { 
      name: 'description', 
      content: circle.value ? circle.value.description : 'サークル詳細ページ' 
    }
  ]
}))
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
}
</style>