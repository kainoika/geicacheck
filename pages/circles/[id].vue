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
      <div class="header-section">
        <div class="header-container">
          <div class="header-top">
            <button 
              @click="$router.back()"
              class="back-button"
            >
              ← 戻る
            </button>
            <div class="title-section">
              <h1 class="circle-title">
                {{ circle.circleName }}
              </h1>
              <p v-if="circle.circleKana" class="circle-kana">
                {{ circle.circleKana }}
              </p>
            </div>
            
            <!-- ブックマークボタン -->
            <div class="bookmark-section">
              <BookmarkButton 
                :circle-id="circle.id"
                @bookmark="handleBookmark"
              />
            </div>
          </div>

          <!-- 基本情報 -->
          <div class="info-tags">
            <!-- 配置 -->
            <div class="info-tag placement-tag">
              <MapPinIcon class="h-4 w-4 text-red-500" />
              <div class="tag-text">{{ formatPlacement(circle.placement) }}</div>
            </div>

            <!-- 成人向けマーク -->
            <div v-if="circle.isAdult" class="info-tag adult-tag">
              <ExclamationTriangleIcon class="h-4 w-4 text-yellow-600" />
              <span class="tag-text">成人向け</span>
            </div>

            <!-- マップで確認 -->
            <NuxtLink to="/map" class="info-tag map-tag">
              <MapIcon class="h-4 w-4 text-blue-600" />
              <span class="tag-text">マップで確認</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- メインコンテンツ -->
      <div style="max-width: 1280px; margin: 0 auto; padding: 1rem;">
        <div class="circle-detail-grid">
          <!-- 左カラム：詳細情報 -->
          <div class="main-content">
            <!-- サークルカット画像 -->
            <div class="content-card">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <PhotoIcon class="h-5 w-5" />
                サークルカット
              </h2>
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
            <div class="content-card">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <DocumentTextIcon class="h-5 w-5" />
                お品書き
              </h2>
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
            <div class="content-card">
              <GenreManager
                :genres="circle.genre"
                :can-edit="permissions.canEditGenres"
                :popular-genres="popularGenres"
                @update:genres="updateGenres"
              />
            </div>

            <!-- 説明 -->
            <div v-if="circle.description" class="content-card">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <DocumentTextIcon class="h-5 w-5" />
                サークル説明
              </h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0;">
                {{ circle.description }}
              </p>
            </div>

            <!-- 頒布物一覧 -->
            <div class="content-card">
              <CircleItemManager
                :items="circle.items || []"
                :can-edit="permissions.canManageItems"
                :circle-id="circle.id"
                :event-id="circle.eventId"
                :circle-name="circle.circleName"
                @add-item="addItem"
                @update-item="updateItem"
                @delete-item="deleteItem"
                @purchase-plan-updated="handlePurchasePlanUpdate"
              />
            </div>

          </div>

          <!-- 右カラム：サイドバー -->
          <div class="sidebar-content">
            <!-- 連絡先 -->
            <div class="content-card">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <PhoneIcon class="h-5 w-5" />
                連絡先
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
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
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
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M4.935 0A4.924 4.924 0 0 0 0 4.935v14.13A4.924 4.924 0 0 0 4.935 24h14.13A4.924 4.924 0 0 0 24 19.065V4.935A4.924 4.924 0 0 0 19.065 0H4.935zm7.81 4.547c2.181 0 4.058.676 5.399 1.847a6.118 6.118 0 0 1 2.116 4.66c.005 1.854-.88 3.476-2.257 4.563-1.375 1.092-3.225 1.697-5.258 1.697-2.314 0-4.46-.87-5.64-2.287v6.326H5.021V5.995h2.084v1.107c1.18-1.418 3.326-2.555 5.64-2.555zm-.168 2.084c-1.434 0-2.717.603-3.604 1.565-.887.962-1.419 2.282-1.419 3.716 0 1.434.532 2.754 1.419 3.716.887.962 2.17 1.565 3.604 1.565 1.434 0 2.717-.603 3.604-1.565.887-.962 1.419-2.282 1.419-3.716 0-1.434-.532-2.754-1.419-3.716-.887-.962-2.17-1.565-3.604-1.565z" />
                  </svg>
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
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  <div>
                    <div style="font-weight: 600;">お品書き</div>
                    <div style="font-size: 0.875rem; opacity: 0.8;">頒布物一覧</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- 配置詳細 -->
            <div class="content-card">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <MapPinIcon class="h-5 w-5" />
                配置詳細
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">ブロック</span>
                  <span style="font-weight: 600; color: #111827;">{{ circle.placement.block }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">番号</span>
                  <span style="font-weight: 600; color: #111827;">{{ circle.placement.number1 }}{{ circle.placement.number2 ? '-' + circle.placement.number2 : '' }}</span>
                </div>
              </div>
            </div>

            <!-- アクション -->
            <div class="content-card">
              <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <BoltIcon class="h-5 w-5" />
                アクション
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <!-- 編集権限申請ボタン -->
                <button
                  v-if="isAuthenticated && !permissions.canEdit && !hasEditPermissionRequest"
                  @click="showEditPermissionModal = true"
                  style="padding: 0.75rem; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
                  onmouseover="this.style.backgroundColor='#dcfce7'"
                  onmouseout="this.style.backgroundColor='#f0fdf4'"
                >
                  <PencilIcon class="h-4 w-4" />
                  編集権限を申請
                </button>

                <!-- 申請中表示 -->
                <div
                  v-if="isAuthenticated && hasEditPermissionRequest"
                  style="padding: 0.75rem; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 0.5rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
                >
                  <ClockIcon class="h-4 w-4" />
                  編集権限申請中
                </div>

                <!-- Twitterでシェア -->
                <button
                  @click="shareToTwitter"
                  style="padding: 0.75rem; background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
                  onmouseover="this.style.backgroundColor='#bfdbfe'"
                  onmouseout="this.style.backgroundColor='#dbeafe'"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitterでシェア
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 編集権限申請モーダル -->
      <EditPermissionModal
        v-if="showEditPermissionModal"
        :circle="circle"
        @close="showEditPermissionModal = false"
        @success="handlePermissionRequestSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MapPinIcon,
  ExclamationTriangleIcon,
  MapIcon,
  DocumentTextIcon,
  PhoneIcon,
  BoltIcon,
  PhotoIcon,
  PencilIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'
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
const showEditPermissionModal = ref(false)
const hasEditPermissionRequest = ref(false)

// Composables
const { isAuthenticated, user } = useAuth()
const { fetchCircleById, formatPlacement, updateCircle, getPopularGenres } = useCircles()
const { currentEvent } = useEvents()
const { addBookmark, toggleBookmark, getBookmarkByCircleId } = useBookmarks()
const { canEditCircle, canUploadImages, canManageItems, canEditGenres, refreshPermissions } = useCirclePermissions()
const { hasExistingRequest } = useEditPermissions()

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

const shareToTwitter = () => {
  if (!circle.value) return
  
  const text = `${circle.value.circleName} | geika check!`
  const url = window.location.href
  const hashtags = 'アイカツ,芸カ'
  
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`
  
  window.open(twitterUrl, '_blank', 'width=550,height=420')
}

const handlePermissionRequestSuccess = () => {
  hasEditPermissionRequest.value = true
  showEditPermissionModal.value = false
}

// 編集権限申請状態をチェック
const checkPermissionRequestStatus = async () => {
  if (!user.value || !circle.value) return
  
  try {
    const hasRequest = await hasExistingRequest(user.value.uid, circle.value.id)
    hasEditPermissionRequest.value = hasRequest
  } catch (error) {
    console.error('編集権限申請状態確認エラー:', error)
  }
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
const addItem = async (itemData: CircleItemFormData) => {
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

const updateItem = async (itemId: string, itemData: CircleItemFormData) => {
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
  if (!circle.value || !circle.value.items) {
    console.error('❌ サークル情報または頒布物がありません')
    alert('サークル情報が見つかりません')
    return
  }
  
  if (!currentEvent.value) {
    console.error('❌ イベント情報がありません')
    alert('イベント情報が見つかりません')
    return
  }
  
  const updatedItems = circle.value.items.filter(item => item.id !== itemId)
  
  try {
    console.log('🗑️ Deleting item:', {
      circleId: circle.value.id,
      eventId: currentEvent.value.id,
      itemId,
      updatedItemsCount: updatedItems.length
    })
    
    await updateCircle(circle.value.id, currentEvent.value.id, {
      items: updatedItems
    })
    
    // 成功した場合のみローカル状態を更新
    circle.value.items = updatedItems
    console.log('✅ Item deleted successfully')
  } catch (err) {
    console.error('❌ 頒布物削除エラー:', err)
    
    // より詳細なエラー情報を表示
    const errorMessage = err.message || '頒布物の削除に失敗しました'
    alert(`頒布物の削除に失敗しました: ${errorMessage}`)
  }
}

// ジャンル管理
const updateGenres = async (genres: string[]) => {
  if (!circle.value) {
    console.error('❌ サークル情報がありません')
    alert('サークル情報が見つかりません')
    return
  }
  
  if (!currentEvent.value) {
    console.error('❌ イベント情報がありません')
    alert('イベント情報が見つかりません')
    return
  }
  
  try {
    console.log('🔄 Updating genres:', {
      circleId: circle.value.id,
      eventId: currentEvent.value.id,
      genres: genres,
      currentUser: user.value,
      circleOwnerId: circle.value.ownerId,
      isOwner: circle.value.ownerId === user.value?.uid,
      userType: user.value?.userType
    })
    
    await updateCircle(circle.value.id, currentEvent.value.id, {
      genre: genres
    })
    
    // 成功した場合のみローカル状態を更新
    circle.value.genre = genres
    console.log('✅ Genres updated successfully')
  } catch (err) {
    console.error('❌ ジャンル更新エラー:', err)
    
    // より詳細なエラー情報を表示
    const errorMessage = err.message || 'ジャンルの更新に失敗しました'
    alert(`ジャンルの更新に失敗しました: ${errorMessage}`)
  }
}

// 購入予定更新ハンドラー
const handlePurchasePlanUpdate = () => {
  // 購入予定が更新された際の処理
  // 現在は特に何もしないが、将来的に状態の更新などを実装可能
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
  
  // 認証済みユーザーの場合、権限を更新してから申請状態をチェック
  if (user.value) {
    await refreshPermissions()
  }
  await checkPermissionRequestStatus()
})

// イベント変更時にデータを再読み込み
watch(currentEvent, async () => {
  if (currentEvent.value) {
    await fetchCircle()
  }
})

// ユーザー変更時に権限と申請状態を再チェック
watch(user, async () => {
  if (user.value) {
    await refreshPermissions()
    await checkPermissionRequestStatus()
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

/* ヘッダーセクション */
.header-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 0;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-top {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.back-button {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.title-section {
  flex: 1;
  min-width: 0;
}

.circle-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
  word-break: break-word;
}

.circle-kana {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.3;
}

.bookmark-section {
  flex-shrink: 0;
}

/* 情報タグ */
.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.info-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
}

.placement-tag {
  background: #fef3f2;
  color: #dc2626;
}

.adult-tag {
  background: #fef3c7;
  color: #92400e;
}

.map-tag {
  background: #f0f9ff;
  color: #0284c7;
  font-weight: 500;
}

.map-tag:hover {
  background: #e0f2fe;
}

.tag-text {
  font-weight: 600;
  white-space: nowrap;
}

/* メインレイアウト */
.circle-detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

/* タブレット以上 */
@media (min-width: 768px) {
  .header-section {
    padding: 2rem 0;
  }
  
  .circle-title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .circle-kana {
    font-size: 1.125rem;
  }
  
  .info-tag {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
  
  .circle-detail-grid {
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
  
  .main-content {
    gap: 2rem;
  }
  
  .sidebar-content {
    gap: 2rem;
  }
  
  .content-card {
    padding: 1.5rem;
  }
}

/* モバイル調整 */
@media (max-width: 767px) {
  .header-top {
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .back-button {
    margin-top: 0.125rem;
  }
  
  .info-tags {
    gap: 0.5rem;
  }
  
  .info-tag {
    font-size: 0.8rem;
    padding: 0.375rem 0.625rem;
  }
  
  .tag-text {
    font-size: 0.8rem;
  }
}
</style>