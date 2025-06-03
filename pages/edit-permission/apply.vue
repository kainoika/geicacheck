<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- ヘッダー -->
    <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 2rem 0;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button 
            @click="$router.back()"
            style="padding: 0.5rem; border: 1px solid #d1d5db; background: white; border-radius: 0.375rem; cursor: pointer; color: #6b7280;"
          >
            ← 戻る
          </button>
          <div>
            <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
              編集権限申請
            </h1>
            <p style="color: #6b7280; margin: 0;">
              サークル情報の編集権限を申請します
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 800px; margin: 0 auto; padding: 2rem 1rem;">
      <!-- 未ログイン状態 -->
      <div v-if="!isAuthenticated" style="text-align: center; padding: 4rem;">
        <div style="color: #9ca3af; font-size: 3rem; margin-bottom: 1rem;">🔒</div>
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          ログインが必要です
        </h2>
        <p style="color: #6b7280; margin: 0 0 2rem 0;">
          編集権限申請にはTwitterアカウントでのログインが必要です
        </p>
        <NuxtLink 
          to="/auth/login"
          style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 500;"
        >
          ログインページへ
        </NuxtLink>
      </div>

      <!-- 既に申請済み -->
      <div v-else-if="existingApplication" style="text-align: center; padding: 4rem;">
        <div 
          style="font-size: 3rem; margin-bottom: 1rem;"
          :style="{ color: getStatusColor(existingApplication.status) }"
        >
          {{ getStatusIcon(existingApplication.status) }}
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          {{ getStatusTitle(existingApplication.status) }}
        </h2>
        <p style="color: #6b7280; margin: 0 0 2rem 0;">
          {{ getStatusDescription(existingApplication.status) }}
        </p>
        
        <div v-if="existingApplication.status === 'pending'" style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb; text-align: left; margin-bottom: 2rem;">
          <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
            申請内容
          </h3>
          <div style="margin-bottom: 1rem;">
            <div style="font-weight: 500; color: #374151; margin-bottom: 0.5rem;">申請理由:</div>
            <p style="color: #4b5563; margin: 0; background: #f9fafb; padding: 1rem; border-radius: 0.375rem;">
              {{ existingApplication.reason }}
            </p>
          </div>
          <div style="font-size: 0.875rem; color: #6b7280;">
            申請日: {{ formatDate(existingApplication.createdAt) }}
          </div>
        </div>

        <NuxtLink 
          to="/profile"
          style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 500;"
        >
          プロフィールで確認
        </NuxtLink>
      </div>

      <!-- 申請フォーム -->
      <div v-else>
        <!-- 申請条件チェック -->
        <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb; margin-bottom: 2rem;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            ✅ 申請条件チェック
          </h2>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div 
              v-for="requirement in requirements" 
              :key="requirement.name"
              style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 0.5rem;"
              :style="{ backgroundColor: requirement.met ? '#f0fdf4' : '#fef2f2' }"
            >
              <div :style="{ color: requirement.met ? '#16a34a' : '#dc2626', fontSize: '1.25rem' }">
                {{ requirement.met ? '✅' : '❌' }}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 500;" :style="{ color: requirement.met ? '#15803d' : '#991b1b' }">
                  {{ requirement.name }}
                </div>
                <div style="font-size: 0.875rem;" :style="{ color: requirement.met ? '#166534' : '#7f1d1d' }">
                  {{ requirement.description }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="!allRequirementsMet" style="margin-top: 1rem; padding: 1rem; background: #fef3f2; border-radius: 0.5rem; border-left: 4px solid #ef4444;">
            <div style="font-weight: 600; color: #991b1b; margin-bottom: 0.5rem;">
              申請条件を満たしていません
            </div>
            <div style="font-size: 0.875rem; color: #7f1d1d;">
              すべての条件を満たしてから申請してください。
            </div>
          </div>
        </div>

        <!-- 申請フォーム -->
        <form v-if="allRequirementsMet" @submit.prevent="handleSubmit" style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            📝 申請フォーム
          </h2>
          
          <!-- 申請理由 -->
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
              申請理由 <span style="color: #ef4444;">*</span>
            </label>
            <textarea
              v-model="form.reason"
              required
              style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; resize: vertical; min-height: 120px;"
              placeholder="編集権限を申請する理由を詳しく記入してください。&#10;例：&#10;・アイカツ！の同人活動歴&#10;・サークル情報に詳しい理由&#10;・コミュニティへの貢献意欲など"
            ></textarea>
            <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">
              {{ form.reason.length }}/500文字
            </div>
          </div>

          <!-- 同意事項 -->
          <div style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              同意事項
            </h3>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
              <ul style="margin: 0; padding-left: 1rem; color: #4b5563; line-height: 1.6;">
                <li>正確で適切な情報のみを入力します</li>
                <li>不適切な編集や虚偽の情報入力は行いません</li>
                <li>編集権限は適切に使用し、コミュニティの利益を優先します</li>
                <li>規約違反があった場合、編集権限が取り消されることに同意します</li>
                <li>編集履歴が記録・管理されることに同意します</li>
              </ul>
            </div>
            
            <label style="display: flex; align-items: start; gap: 0.5rem; cursor: pointer;">
              <input
                v-model="form.agreeToTerms"
                type="checkbox"
                required
                style="margin-top: 0.125rem; accent-color: #ff69b4;"
              >
              <span style="font-size: 0.875rem; color: #374151;">
                上記の同意事項をすべて読み、理解し、同意します <span style="color: #ef4444;">*</span>
              </span>
            </label>
          </div>

          <!-- 送信ボタン -->
          <div style="display: flex; gap: 1rem; justify-content: end;">
            <button 
              type="button"
              @click="resetForm"
              style="padding: 0.75rem 1.5rem; background: white; color: #6b7280; border: 1px solid #d1d5db; border-radius: 0.5rem; cursor: pointer; font-weight: 500;"
            >
              リセット
            </button>
            <button 
              type="submit"
              :disabled="!isFormValid || submitting"
              style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
              :style="{ opacity: (!isFormValid || submitting) ? 0.5 : 1 }"
            >
              {{ submitting ? '申請中...' : '申請を送信' }}
            </button>
          </div>
        </form>

        <!-- 申請できない場合の案内 -->
        <div v-else style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
            申請について
          </h2>
          <p style="color: #6b7280; margin: 0 0 1rem 0; line-height: 1.6;">
            編集権限の申請には一定の条件があります。条件を満たしてから再度申請してください。
          </p>
          <p style="color: #6b7280; margin: 0; line-height: 1.6;">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// State
// Composables
const { user, isAuthenticated } = useAuth()
const { bookmarks } = useBookmarks()

const submitting = ref(false)
const existingApplication = ref(null) // TODO: 実装時に編集権限申請の状態を取得

const form = ref({
  reason: '',
  agreeToTerms: false
})

// 申請条件
const requirements = computed(() => {
  if (!user.value) return []
  
  return [
    {
      name: 'アカウント作成から7日以上経過',
      description: '信頼性確保のため、一定期間の利用実績が必要です',
      met: user.value && (Date.now() - user.value.createdAt.getTime()) > (7 * 24 * 60 * 60 * 1000)
    },
    {
      name: 'Twitterアカウント連携済み',
      description: '本人確認のため、Twitterアカウントの連携が必要です',
      met: user.value && (user.value.twitterId || user.value.twitterUsername)
    },
    {
      name: 'ブックマーク数5件以上',
      description: 'アプリの利用実績として、ブックマーク機能の使用が必要です',
      met: bookmarks.value && bookmarks.value.length >= 5
    },
    {
      name: '最近のアクティビティあり',
      description: '直近7日以内にアプリを利用していることが必要です',
      met: user.value && user.value.updatedAt && (Date.now() - user.value.updatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000)
    }
  ]
})

const allRequirementsMet = computed(() => 
  requirements.value.every(req => req.met)
)

const isFormValid = computed(() => 
  form.value.reason.trim().length >= 50 && 
  form.value.reason.length <= 500 && 
  form.value.agreeToTerms
)

// Methods
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return '⏳'
    case 'approved': return '✅'
    case 'rejected': return '❌'
    default: return '📋'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#f59e0b'
    case 'approved': return '#10b981'
    case 'rejected': return '#ef4444'
    default: return '#6b7280'
  }
}

const getStatusTitle = (status) => {
  switch (status) {
    case 'pending': return '申請審査中'
    case 'approved': return '申請が承認されました'
    case 'rejected': return '申請が却下されました'
    default: return '申請状況不明'
  }
}

const getStatusDescription = (status) => {
  switch (status) {
    case 'pending': return '申請を受け付けました。審査結果をお待ちください。'
    case 'approved': return 'おめでとうございます！編集権限が付与されました。'
    case 'rejected': return '申請が却下されました。条件を満たしてから再申請してください。'
    default: return ''
  }
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const resetForm = () => {
  form.value = {
    reason: '',
    agreeToTerms: false
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    // 実際の実装では API に送信
    await new Promise(resolve => setTimeout(resolve, 2000)) // シミュレーション
    
    console.log('Submit application:', form.value)
    
    // 申請完了後の状態を設定
    existingApplication.value = {
      id: 'sample-app-id',
      reason: form.value.reason,
      status: 'pending',
      createdAt: new Date()
    }
    
    alert('編集権限申請を送信しました。審査結果をお待ちください。')
  } catch (error) {
    console.error('Submit error:', error)
    alert('申請の送信に失敗しました。もう一度お試しください。')
  } finally {
    submitting.value = false
  }
}

// 初期化
onMounted(() => {
  // 実際の実装では既存の申請をチェック
  // existingApplication.value = await checkExistingApplication()
})

// SEO
useHead({
  title: '編集権限申請 - geika check!',
  meta: [
    { name: 'description', content: 'サークル情報の編集権限を申請するページです。' }
  ]
})
</script>