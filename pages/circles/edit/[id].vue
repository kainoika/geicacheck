<template>
  <div style="min-height: 100vh; background: #f9fafb;">
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
            <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
              {{ isNewCircle ? 'サークル情報を追加' : 'サークル情報を編集' }}
            </h1>
            <p style="color: #6b7280; margin: 0;">
              {{ isNewCircle ? '新しいサークル情報を登録します' : `${originalCircle?.circleName || ''} の情報を編集します` }}
            </p>
          </div>
          
          <!-- 権限表示 -->
          <div style="display: flex; align-items: center; gap: 0.5rem; background: #f0fdf4; padding: 0.5rem 1rem; border-radius: 0.5rem;">
            <span style="color: #16a34a;">✅</span>
            <span style="color: #15803d; font-weight: 500; font-size: 0.875rem;">編集権限あり</span>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
      <form @submit.prevent="handleSubmit" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        <!-- 左カラム：基本情報 -->
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <!-- 基本情報 -->
          <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
              📝 基本情報
            </h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <!-- サークル名 -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  サークル名 <span style="color: #ef4444;">*</span>
                </label>
                <input
                  v-model="form.circleName"
                  type="text"
                  required
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;"
                  placeholder="例: 星宮製作所"
                >
              </div>
              
              <!-- サークル名（かな） -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  サークル名（かな）
                </label>
                <input
                  v-model="form.circleKana"
                  type="text"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;"
                  placeholder="例: ほしみやせいさくしょ"
                >
              </div>
            </div>

            <!-- 説明 -->
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                サークル説明
              </label>
              <textarea
                v-model="form.description"
                style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; resize: vertical; min-height: 100px;"
                placeholder="サークルの説明、頒布物の紹介など"
              ></textarea>
            </div>

            <!-- 成人向け -->
            <div>
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input
                  v-model="form.isAdult"
                  type="checkbox"
                  style="accent-color: #ff69b4;"
                >
                <span style="font-weight: 500; color: #374151;">成人向け作品を含む</span>
              </label>
            </div>
          </div>

          <!-- 配置情報 -->
          <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
              📍 配置情報
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
              <!-- 開催日 -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  開催日 <span style="color: #ef4444;">*</span>
                </label>
                <select
                  v-model="form.placement.day"
                  required
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                >
                  <option value="">選択</option>
                  <option value="1">1日目</option>
                  <option value="2">2日目</option>
                </select>
              </div>
              
              <!-- エリア -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  エリア <span style="color: #ef4444;">*</span>
                </label>
                <select
                  v-model="form.placement.area"
                  required
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                >
                  <option value="">選択</option>
                  <option value="東1">東1</option>
                  <option value="東2">東2</option>
                  <option value="東3">東3</option>
                  <option value="東4">東4</option>
                  <option value="東5">東5</option>
                  <option value="東6">東6</option>
                  <option value="西1">西1</option>
                  <option value="西2">西2</option>
                </select>
              </div>
              
              <!-- ブロック -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  ブロック <span style="color: #ef4444;">*</span>
                </label>
                <input
                  v-model="form.placement.block"
                  type="text"
                  required
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                  placeholder="例: あ"
                  maxlength="2"
                >
              </div>
              
              <!-- 番号 -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  番号 <span style="color: #ef4444;">*</span>
                </label>
                <input
                  v-model="form.placement.number"
                  type="text"
                  required
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                  placeholder="例: 01"
                  maxlength="3"
                >
              </div>
              
              <!-- 位置 -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  位置 <span style="color: #ef4444;">*</span>
                </label>
                <select
                  v-model="form.placement.position"
                  required
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                >
                  <option value="">選択</option>
                  <option value="a">a</option>
                  <option value="b">b</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ジャンル・タグ -->
          <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
              🎨 ジャンル・タグ
            </h2>
            
            <!-- ジャンル -->
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                ジャンル <span style="color: #ef4444;">*</span>
              </label>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span 
                  v-for="genre in form.genre" 
                  :key="genre"
                  style="display: flex; align-items: center; gap: 0.25rem; background: #e0f2fe; color: #0277bd; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;"
                >
                  {{ genre }}
                  <button 
                    type="button"
                    @click="removeGenre(genre)"
                    style="background: none; border: none; color: #0277bd; cursor: pointer; padding: 0; margin-left: 0.25rem;"
                  >
                    ×
                  </button>
                </span>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <input
                  v-model="newGenre"
                  type="text"
                  style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                  placeholder="ジャンルを入力"
                  @keyup.enter="addGenre"
                >
                <button 
                  type="button"
                  @click="addGenre"
                  style="padding: 0.5rem 1rem; background: #ff69b4; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
                >
                  追加
                </button>
              </div>
            </div>

            <!-- タグ -->
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                タグ
              </label>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span 
                  v-for="tag in form.tags" 
                  :key="tag"
                  style="display: flex; align-items: center; gap: 0.25rem; background: #f3f4f6; color: #374151; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;"
                >
                  #{{ tag }}
                  <button 
                    type="button"
                    @click="removeTag(tag)"
                    style="background: none; border: none; color: #374151; cursor: pointer; padding: 0; margin-left: 0.25rem;"
                  >
                    ×
                  </button>
                </span>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <input
                  v-model="newTag"
                  type="text"
                  style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                  placeholder="タグを入力"
                  @keyup.enter="addTag"
                >
                <button 
                  type="button"
                  @click="addTag"
                  style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
                >
                  追加
                </button>
              </div>
            </div>
          </div>

          <!-- 連絡先 -->
          <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
              📞 連絡先
            </h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <!-- Twitter -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  Twitter ID
                </label>
                <div style="display: flex; align-items: center;">
                  <span style="padding: 0.75rem; background: #f9fafb; border: 1px solid #d1d5db; border-right: none; border-radius: 0.375rem 0 0 0.375rem; color: #6b7280;">@</span>
                  <input
                    v-model="form.contact.twitter"
                    type="text"
                    style="flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0 0.375rem 0.375rem 0;"
                    placeholder="twitter_id"
                  >
                </div>
              </div>
              
              <!-- Pixiv -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  Pixiv URL
                </label>
                <input
                  v-model="form.contact.pixiv"
                  type="url"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                  placeholder="https://pixiv.net/users/..."
                >
              </div>
              
              <!-- Website -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  Website URL
                </label>
                <input
                  v-model="form.contact.website"
                  type="url"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                  placeholder="https://example.com"
                >
              </div>
              
              <!-- お品書き -->
              <div>
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  お品書き URL
                </label>
                <input
                  v-model="form.contact.oshinaUrl"
                  type="url"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                  placeholder="https://oshina.example.com"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 右カラム：プレビュー・アクション -->
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <!-- プレビュー -->
          <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
              👁️ プレビュー
            </h2>
            
            <!-- プレビューカード -->
            <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; background: #f9fafb;">
              <div style="margin-bottom: 0.75rem;">
                <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.25rem 0;">
                  {{ form.circleName || 'サークル名' }}
                </h3>
                <p v-if="form.circleKana" style="font-size: 0.875rem; color: #6b7280; margin: 0;">
                  {{ form.circleKana }}
                </p>
              </div>
              
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.875rem; color: #6b7280;">
                <span>📍</span>
                <span style="font-weight: 500;">{{ formatPlacement() }}</span>
                <span v-if="form.placement.day" style="color: #9ca3af;">{{ form.placement.day }}日目</span>
              </div>
              
              <div v-if="form.genre.length > 0" style="margin-bottom: 0.75rem;">
                <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                  <span 
                    v-for="genre in form.genre.slice(0, 3)" 
                    :key="genre"
                    style="background: #e0f2fe; color: #0277bd; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.75rem;"
                  >
                    {{ genre }}
                  </span>
                  <span 
                    v-if="form.genre.length > 3"
                    style="background: #f3f4f6; color: #6b7280; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.75rem;"
                  >
                    +{{ form.genre.length - 3 }}
                  </span>
                </div>
              </div>
              
              <div v-if="form.description" style="margin-bottom: 0.75rem;">
                <p style="color: #4b5563; font-size: 0.875rem; line-height: 1.4; margin: 0;">
                  {{ form.description.slice(0, 100) }}{{ form.description.length > 100 ? '...' : '' }}
                </p>
              </div>
              
              <div v-if="form.isAdult" style="display: flex; align-items: center; gap: 0.25rem; color: #f59e0b;">
                <span>⚠️</span>
                <span style="font-weight: 500; font-size: 0.875rem;">成人向け</span>
              </div>
            </div>
          </div>

          <!-- 保存アクション -->
          <div style="background: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
              💾 保存
            </h2>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <button 
                type="submit"
                :disabled="!isFormValid || saving"
                style="padding: 0.75rem 1.5rem; background: #ff69b4; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
                :style="{ opacity: (!isFormValid || saving) ? 0.5 : 1 }"
              >
                {{ saving ? '保存中...' : (isNewCircle ? '新規登録' : '変更を保存') }}
              </button>
              
              <button 
                type="button"
                @click="resetForm"
                style="padding: 0.75rem 1.5rem; background: white; color: #6b7280; border: 1px solid #d1d5db; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
              >
                リセット
              </button>
            </div>
          </div>

          <!-- 注意事項 -->
          <div style="background: #fef3f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: #991b1b; margin: 0 0 1rem 0;">
              ⚠️ 編集時の注意
            </h3>
            <ul style="color: #7f1d1d; font-size: 0.875rem; margin: 0; padding-left: 1rem; line-height: 1.5;">
              <li>正確な情報の入力をお願いします</li>
              <li>不適切な内容は削除される場合があります</li>
              <li>編集履歴は記録されます</li>
              <li>問題がある場合は編集権限が取り消される場合があります</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Route params
const route = useRoute()
const circleId = route.params.id
const logger = useLogger('CircleEditPage')

// State
const isNewCircle = computed(() => circleId === 'new')
const originalCircle = ref(null)
const saving = ref(false)
const newGenre = ref('')
const newTag = ref('')

// Form data
const form = ref({
  circleName: '',
  circleKana: '',
  description: '',
  genre: [],
  tags: [],
  placement: {
    day: '',
    area: '',
    block: '',
    number: '',
    position: ''
  },
  contact: {
    twitter: '',
    pixiv: '',
    website: '',
    oshinaUrl: ''
  },
  isAdult: false
})

// Computed
const isFormValid = computed(() => {
  return form.value.circleName.trim() &&
         form.value.placement.day &&
         form.value.placement.area &&
         form.value.placement.block &&
         form.value.placement.number &&
         form.value.placement.position &&
         form.value.genre.length > 0
})

// Methods
const formatPlacement = () => {
  const p = form.value.placement
  if (!p.area || !p.block || !p.number || !p.position) {
    return '配置未設定'
  }
  return `${p.area}-${p.block}-${p.number}${p.position}`
}

const addGenre = () => {
  if (newGenre.value.trim() && !form.value.genre.includes(newGenre.value.trim())) {
    form.value.genre.push(newGenre.value.trim())
    newGenre.value = ''
  }
}

const removeGenre = (genre) => {
  const index = form.value.genre.indexOf(genre)
  if (index > -1) {
    form.value.genre.splice(index, 1)
  }
}

const addTag = () => {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  }
}

const resetForm = () => {
  if (isNewCircle.value) {
    // 新規作成の場合は空にリセット
    form.value = {
      circleName: '',
      circleKana: '',
      description: '',
      genre: [],
      tags: [],
      placement: {
        day: '',
        area: '',
        block: '',
        number: '',
        position: ''
      },
      contact: {
        twitter: '',
        pixiv: '',
        website: '',
        oshinaUrl: ''
      },
      isAdult: false
    }
  } else {
    // 編集の場合は元のデータに戻す
    loadCircleData()
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  saving.value = true
  
  try {
    // 実際の実装では API に送信
    await new Promise(resolve => setTimeout(resolve, 1000)) // シミュレーション
    
    logger.info('Save circle:', form.value)
    alert(isNewCircle.value ? 'サークル情報を登録しました' : 'サークル情報を更新しました')
    
    // 詳細ページにリダイレクト
    if (isNewCircle.value) {
      await navigateTo('/circles/1') // 実際の実装では新しいIDを使用
    } else {
      await navigateTo(`/circles/${circleId}`)
    }
  } catch (error) {
    console.error('Save error:', error)
    alert('保存に失敗しました')
  } finally {
    saving.value = false
  }
}

const loadCircleData = async () => {
  if (isNewCircle.value) return
  
  try {
    // 実際の実装では API からデータを取得
    const sampleData = {
      id: circleId,
      circleName: '星宮製作所',
      circleKana: 'ほしみやせいさくしょ',
      description: '星宮いちごちゃんのイラスト本とグッズを頒布予定です。',
      genre: ['アイカツ！', 'いちご'],
      tags: ['いちご', 'イラスト', 'グッズ'],
      placement: {
        day: '1',
        area: '東1',
        block: 'あ',
        number: '01',
        position: 'a'
      },
      contact: {
        twitter: 'hoshimiya_circle',
        pixiv: 'https://pixiv.net/users/12345',
        website: '',
        oshinaUrl: ''
      },
      isAdult: false
    }
    
    originalCircle.value = sampleData
    form.value = { ...sampleData }
  } catch (error) {
    console.error('Load error:', error)
    alert('データの読み込みに失敗しました')
  }
}

// 初期化
onMounted(() => {
  // 編集権限チェック
  const hasEditPermission = true // 実際の実装では useAuth().hasEditPermission を使用
  if (!hasEditPermission) {
    alert('編集権限がありません')
    navigateTo('/circles')
    return
  }
  
  loadCircleData()
})

// SEO
useHead(() => ({
  title: `${isNewCircle.value ? 'サークル情報を追加' : 'サークル情報を編集'} - geica check!`,
  meta: [
    { name: 'description', content: 'サークル情報の編集・追加ページです。' }
  ]
}))
</script>

<style scoped>
@media (max-width: 768px) {
  form {
    grid-template-columns: 1fr !important;
  }
}
</style>