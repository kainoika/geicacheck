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
            <!-- サークルカット画像 -->
            <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <ImageUpload
                v-model="circle.circleCutImageUrl"
                label="サークルカット画像"
                :path="`circle-images/${currentEvent?.id}/${circle.id}/circle-cut`"
                :can-edit="permissions.canUploadImages"
                @update:modelValue="updateCircleCut"
                @error="uploadError = $event"
              />
            </div>

            <!-- お品書き画像 -->
            <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <ImageUpload
                v-model="circle.menuImageUrl"
                label="お品書き画像"
                :path="`circle-images/${currentEvent?.id}/${circle.id}/menu`"
                :can-edit="permissions.canUploadImages"
                @update:modelValue="updateMenuImage"
                @error="uploadError = $event"
              />
            </div>

            <!-- ジャンル -->
            <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <GenreManager
                :genres="circle.genre"
                :can-edit="permissions.canEditGenres"
                :popular-genres="popularGenres"
                @update:genres="updateGenres"
              />
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

            <!-- 頒布物一覧 -->
            <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
              <CircleItemManager
                :items="circle.items || []"
                :can-edit="permissions.canManageItems"
                :circle-id="circle.id"
                :event-id="circle.eventId"
                @add-item="addItem"
                @update-item="updateItem"
                @delete-item="deleteItem"
              />
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
                  :href="circle.contact.twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f0f9ff; border-radius: 0.5rem; text-decoration: none; color: #1da1f2; transition: all 0.2s;"
                  onmouseover="this.style.backgroundColor='#e0f2fe'"
                  onmouseout="this.style.backgroundColor='#f0f9ff'"
                >
                  <span style="font-size: 1.25rem;">🐦</span>
                  <div>
                    <div style="font-weight: 600;">Twitter</div>
                    <!-- TwitterのURLからユーザーネームだけを表示 -->
                    <div style="font-size: 0.875rem; opacity: 0.8;">@{{ getTwitterUsername(circle.contact.twitter) }}</div>
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
                  <span style="color: #6b7280;">ブロック</span>
                  <span style="font-weight: 600; color: #111827;">{{ circle.placement.block }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">番号</span>
                  <span style="font-weight: 600; color: #111827;">{{ circle.placement.number1 }}-{{ circle.placement.number2 }}</span>
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

<script setup lang="ts">
import type { Circle, BookmarkCategory, CircleItem, CircleItemFormData } from '~/types'

// Route params
const route = useRoute()
const circleId = route.params.id as string

// State
const circle = ref<Circle | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const uploadError = ref('')

// Composables
const { isAuthenticated, user } = useAuth()
const { fetchCircleById, formatPlacement, updateCircle, getPopularGenres } = useCircles()
const { currentEvent } = useEvents()
const { addBookmark, toggleBookmark, getBookmarkByCircleId } = useBookmarks()
const { canEditCircle, canUploadImages, canManageItems, canEditGenres } = useCirclePermissions()

// 権限チェック
const permissions = computed(() => {
  if (!circle.value) return { canEdit: false, canUploadImages: false, canManageItems: false, canEditGenres: false }
  return {
    canEdit: canEditCircle(circle.value),
    canUploadImages: canUploadImages(circle.value),
    canManageItems: canManageItems(circle.value),
    canEditGenres: canEditGenres(circle.value)
  }
})

const hasEditPermission = computed(() => permissions.value.canEdit)

// 人気ジャンル取得
const popularGenres = ref<string[]>([])

const loadPopularGenres = async () => {
  if (!currentEvent.value) return
  try {
    popularGenres.value = await getPopularGenres(currentEvent.value.id)
  } catch (err) {
    console.error('人気ジャンル取得エラー:', err)
  }
}

// ブックマーク状態
const bookmark = computed(() => getBookmarkByCircleId(circleId))
const isBookmarked = computed(() => !!bookmark.value)

// Methods
const getTwitterUsername = (twitterUrl: string) => {
  if (!twitterUrl) return ''
  // 末尾のスラッシュを除去し、URLの最後の部分を取得
  return twitterUrl.replace(/\/+$/, '').split('/').pop() || ''
}

const handleBookmark = async (category) => {
  try {
    if (!currentEvent.value) return
    await toggleBookmark(circleId, category)
  } catch (error) {
    console.error('Bookmark error:', error)
  }
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

// 画像アップロード処理
const updateCircleCut = async (imageUrl: string | undefined) => {
  if (!circle.value) return
  saving.value = true
  try {
    await updateCircle(circle.value.id, currentEvent.value!.id, {
      circleCutImageUrl: imageUrl
    })
    circle.value.circleCutImageUrl = imageUrl
  } catch (err) {
    console.error('サークルカット更新エラー:', err)
    uploadError.value = 'サークルカットの更新に失敗しました'
  } finally {
    saving.value = false
  }
}

const updateMenuImage = async (imageUrl: string | undefined) => {
  if (!circle.value) return
  saving.value = true
  try {
    await updateCircle(circle.value.id, currentEvent.value!.id, {
      menuImageUrl: imageUrl
    })
    circle.value.menuImageUrl = imageUrl
  } catch (err) {
    console.error('お品書き更新エラー:', err)
    uploadError.value = 'お品書きの更新に失敗しました'
  } finally {
    saving.value = false
  }
}

// 頒布物管理
const addItem = async (itemData: CircleItemFormData & { imageUrl?: string }) => {
  if (!circle.value) return
  
  const newItem: CircleItem = {
    id: `item_${Date.now()}`,
    ...itemData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const updatedItems = [...(circle.value.items || []), newItem]
  
  try {
    await updateCircle(circle.value.id, currentEvent.value!.id, {
      items: updatedItems
    })
    circle.value.items = updatedItems
  } catch (err) {
    console.error('頒布物追加エラー:', err)
    alert('頒布物の追加に失敗しました')
  }
}

const updateItem = async (itemId: string, itemData: CircleItemFormData & { imageUrl?: string }) => {
  if (!circle.value || !circle.value.items) return
  
  const updatedItems = circle.value.items.map(item => 
    item.id === itemId 
      ? { ...item, ...itemData, updatedAt: new Date() }
      : item
  )
  
  try {
    await updateCircle(circle.value.id, currentEvent.value!.id, {
      items: updatedItems
    })
    circle.value.items = updatedItems
  } catch (err) {
    console.error('頒布物更新エラー:', err)
    alert('頒布物の更新に失敗しました')
  }
}

const deleteItem = async (itemId: string) => {
  if (!circle.value || !circle.value.items) return
  
  const updatedItems = circle.value.items.filter(item => item.id !== itemId)
  
  try {
    await updateCircle(circle.value.id, currentEvent.value!.id, {
      items: updatedItems
    })
    circle.value.items = updatedItems
  } catch (err) {
    console.error('頒布物削除エラー:', err)
    alert('頒布物の削除に失敗しました')
  }
}

// ジャンル管理
const updateGenres = async (genres: string[]) => {
  if (!circle.value) return
  
  try {
    await updateCircle(circle.value.id, currentEvent.value!.id, {
      genre: genres
    })
    circle.value.genre = genres
  } catch (err) {
    console.error('ジャンル更新エラー:', err)
    alert('ジャンルの更新に失敗しました')
  }
}

// データ取得
const fetchCircle = async () => {
  loading.value = true
  error.value = null
  
  try {
    if (!currentEvent.value) {
      throw new Error('イベント情報が見つかりません')
    }

    // fetchCircleById を使用してサークル詳細を取得
    const circleData = await fetchCircleById(circleId, currentEvent.value.id)
    
    if (!circleData) {
      throw new Error('指定されたサークルが見つかりません')
    }
    
    circle.value = circleData
  } catch (err) {
    console.error('Fetch circle error:', err)
    error.value = err.message || 'サークル情報の取得に失敗しました'
  } finally {
    loading.value = false
  }
}

// 初期化
onMounted(async () => {
  // プラグインでイベントが初期化されていない場合の待機
  if (!currentEvent.value) {
    let attempts = 0
    const maxAttempts = 50 // 5秒間
    
    while (!currentEvent.value && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }
  
  await fetchCircle()
  await loadPopularGenres()
})

// イベント変更時にデータを再読み込み
watch(currentEvent, async () => {
  if (currentEvent.value) {
    await fetchCircle()
  }
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