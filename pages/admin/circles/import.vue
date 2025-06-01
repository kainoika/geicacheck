<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- ページヘッダー -->
      <div class="mb-8">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <NuxtLink to="/admin/events" class="text-gray-400 hover:text-gray-500">
                イベント管理
              </NuxtLink>
            </li>
            <li>
              <div class="flex items-center">
                <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                <span class="ml-4 text-sm font-medium text-gray-500">サークルインポート</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div class="mt-4">
          <h1 class="text-3xl font-bold text-gray-900">サークルデータインポート</h1>
          <p class="mt-2 text-gray-600">
            CSVファイルまたは前回イベントからサークルデータを一括インポートします。
          </p>
        </div>
      </div>

      <!-- イベント選択 -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">対象イベント</h2>
        <div class="max-w-xs">
          <label for="targetEvent" class="block text-sm font-medium text-gray-700">
            インポート先イベント <span class="text-red-500">*</span>
          </label>
          <select v-model="selectedEventId"
                  id="targetEvent"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            <option value="">イベントを選択してください</option>
            <option v-for="event in events" :key="event.id" :value="event.id">
              {{ event.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- インポート方法選択 -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">インポート方法</h2>
        
        <div class="space-y-4">
          <!-- CSVファイルインポート -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input v-model="importMethod"
                     id="csv-import"
                     value="csv"
                     type="radio"
                     class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300">
            </div>
            <div class="ml-3">
              <label for="csv-import" class="text-sm font-medium text-gray-700">
                CSVファイルからインポート
              </label>
              <p class="text-sm text-gray-500">
                サークル情報が記載されたCSVファイルをアップロードします
              </p>
            </div>
          </div>

          <!-- 前回イベントからコピー -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input v-model="importMethod"
                     id="event-copy"
                     value="copy"
                     type="radio"
                     class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300">
            </div>
            <div class="ml-3">
              <label for="event-copy" class="text-sm font-medium text-gray-700">
                前回イベントからコピー
              </label>
              <p class="text-sm text-gray-500">
                過去のイベントのサークル情報をベースとして使用します
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CSVファイルアップロード -->
      <div v-if="importMethod === 'csv'" class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">CSVファイルアップロード</h2>
        
        <!-- CSVフォーマット説明 -->
        <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <InformationCircleIcon class="h-5 w-5 text-blue-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">CSVフォーマット</h3>
              <div class="mt-2 text-sm text-blue-700">
                <p class="mb-2">以下の列を含むCSVファイルをアップロードしてください：</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>circleName (サークル名) - 必須</li>
                  <li>circleKana (サークル名カナ)</li>
                  <li>genre (ジャンル) - カンマ区切りで複数指定可能</li>
                  <li>day (開催日) - 1または2</li>
                  <li>area (エリア)</li>
                  <li>block (ブロック)</li>
                  <li>number (番号)</li>
                  <li>position (位置) - aまたはb</li>
                  <li>description (説明)</li>
                  <li>twitter (TwitterID)</li>
                  <li>pixiv (PixivID)</li>
                  <li>website (WebサイトURL)</li>
                  <li>oshinaUrl (お品書きURL)</li>
                  <li>tags (タグ) - カンマ区切りで複数指定可能</li>
                  <li>isAdult (成人向け) - trueまたはfalse</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- ファイルアップロード -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            CSVファイル <span class="text-red-500">*</span>
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
              <div class="flex text-sm text-gray-600">
                <label for="csv-file" class="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500">
                  <span>CSVファイルをアップロード</span>
                  <input @change="handleCsvUpload" id="csv-file" type="file" accept=".csv" class="sr-only">
                </label>
                <p class="pl-1">またはドラッグ&ドロップ</p>
              </div>
              <p class="text-xs text-gray-500">CSVファイルのみ対応</p>
            </div>
          </div>
        </div>

        <!-- アップロードされたファイル情報 -->
        <div v-if="csvFile" class="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-5 w-5 text-green-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                CSVファイルがアップロードされました
              </p>
              <p class="text-sm text-green-700">
                {{ csvFile.name }} ({{ formatFileSize(csvFile.size) }})
              </p>
              <p v-if="csvPreview.length > 0" class="text-sm text-green-700">
                {{ csvPreview.length }}件のサークルデータを検出
              </p>
            </div>
          </div>
        </div>

        <!-- CSVプレビュー -->
        <div v-if="csvPreview.length > 0" class="mt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-3">データプレビュー（最初の5件）</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">サークル名</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ジャンル</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">配置</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">連絡先</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(circle, index) in csvPreview.slice(0, 5)" :key="index">
                  <td class="px-3 py-2 text-sm text-gray-900">{{ circle.circleName }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ circle.genre.join(', ') }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">
                    {{ circle.placement.area }}-{{ circle.placement.block }}-{{ circle.placement.number }}{{ circle.placement.position }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500">
                    <span v-if="circle.contact.twitter">@{{ circle.contact.twitter }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 前回イベント選択 -->
      <div v-if="importMethod === 'copy'" class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">コピー元イベント</h2>
        
        <div class="max-w-xs">
          <label for="sourceEvent" class="block text-sm font-medium text-gray-700">
            コピー元イベント <span class="text-red-500">*</span>
          </label>
          <select v-model="sourceEventId"
                  id="sourceEvent"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            <option value="">イベントを選択してください</option>
            <option v-for="event in availableSourceEvents" :key="event.id" :value="event.id">
              {{ event.name }} ({{ event.status === 'completed' ? '終了' : event.status }})
            </option>
          </select>
        </div>

        <!-- コピー元統計 -->
        <div v-if="sourceEventId && sourceEventStats" class="mt-4 bg-gray-50 rounded-md p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-2">コピー元統計</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-lg font-semibold text-gray-900">{{ sourceEventStats.totalCircles }}</div>
              <div class="text-xs text-gray-500">サークル数</div>
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-900">{{ sourceEventStats.totalUsers }}</div>
              <div class="text-xs text-gray-500">参加者数</div>
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-900">{{ sourceEventStats.totalBookmarks }}</div>
              <div class="text-xs text-gray-500">ブックマーク数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- インポートオプション -->
      <div v-if="importMethod" class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">インポートオプション</h2>
        
        <div class="space-y-4">
          <!-- 重複チェック -->
          <div class="flex items-center">
            <input v-model="options.checkDuplicates"
                   type="checkbox"
                   id="checkDuplicates"
                   class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded">
            <label for="checkDuplicates" class="ml-2 block text-sm text-gray-900">
              重複サークルをチェックする
            </label>
          </div>

          <!-- 既存データの上書き -->
          <div class="flex items-center">
            <input v-model="options.overwriteExisting"
                   type="checkbox"
                   id="overwriteExisting"
                   class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded">
            <label for="overwriteExisting" class="ml-2 block text-sm text-gray-900">
              既存データを上書きする
            </label>
          </div>

          <!-- 公開設定 -->
          <div class="flex items-center">
            <input v-model="options.setPublic"
                   type="checkbox"
                   id="setPublic"
                   class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded">
            <label for="setPublic" class="ml-2 block text-sm text-gray-900">
              インポート後に公開状態にする
            </label>
          </div>
        </div>
      </div>

      <!-- エラー表示 -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <XCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">エラーが発生しました</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- 進捗表示 -->
      <div v-if="importing" class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <div class="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">インポート中...</h3>
            <div class="mt-2 text-sm text-blue-700">
              {{ importProgress.current }} / {{ importProgress.total }} 件処理中
            </div>
            <div class="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                   :style="{ width: `${(importProgress.current / importProgress.total) * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 結果表示 -->
      <div v-if="importResult" class="bg-green-50 border border-green-200 rounded-md p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-5 w-5 text-green-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">インポート完了</h3>
            <div class="mt-2 text-sm text-green-700">
              <p>成功: {{ importResult.success }}件</p>
              <p>スキップ: {{ importResult.skipped }}件</p>
              <p v-if="importResult.errors > 0">エラー: {{ importResult.errors }}件</p>
            </div>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="flex justify-end space-x-3">
        <NuxtLink to="/admin/events"
                  class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
          戻る
        </NuxtLink>
        <button @click="startImport"
                :disabled="!canImport || importing"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50">
          {{ importing ? 'インポート中...' : 'インポート開始' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ChevronRightIcon, 
  InformationCircleIcon,
  DocumentIcon,
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/vue/24/outline'
import type { Event, EventStats, Circle } from '~/types'

// メタデータ設定
definePageMeta({
  title: 'サークルインポート - geika check!'
})

// Composables
const { events, fetchEvents, getEventStats } = useEvents()
const { fetchCircles } = useCircles()

// State
const selectedEventId = ref('')
const importMethod = ref('')
const csvFile = ref<File | null>(null)
const csvPreview = ref<Circle[]>([])
const sourceEventId = ref('')
const sourceEventStats = ref<EventStats | null>(null)
const importing = ref(false)
const error = ref<string | null>(null)

const options = reactive({
  checkDuplicates: true,
  overwriteExisting: false,
  setPublic: true
})

const importProgress = reactive({
  current: 0,
  total: 0
})

const importResult = ref<{
  success: number
  skipped: number
  errors: number
} | null>(null)

// Computed
const availableSourceEvents = computed(() => {
  return events.value.filter(event => event.id !== selectedEventId.value)
})

const canImport = computed(() => {
  if (!selectedEventId.value || !importMethod.value) return false
  
  if (importMethod.value === 'csv') {
    return csvFile.value && csvPreview.value.length > 0
  }
  
  if (importMethod.value === 'copy') {
    return sourceEventId.value
  }
  
  return false
})

// Methods
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleCsvUpload = async (event: InputEvent) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.name.toLowerCase().endsWith('.csv')) {
    error.value = 'CSVファイルのみアップロード可能です'
    return
  }
  
  try {
    const text = await file.text()
    const parsed = parseCsv(text)
    
    csvFile.value = file
    csvPreview.value = parsed
    error.value = null
    
  } catch (err) {
    error.value = 'CSVファイルの解析に失敗しました'
    console.error('CSV parse error:', err)
  }
}

const parseCsv = (csvText: string): Circle[] => {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) throw new Error('CSVファイルが空です')
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const circles: Circle[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const circle: any = {
      id: `import-${i}`,
      eventId: selectedEventId.value,
      isPublic: options.setPublic,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    headers.forEach((header, index) => {
      const value = values[index] || ''
      
      switch (header.toLowerCase()) {
        case 'circlename':
          circle.circleName = value
          break
        case 'circlekana':
          circle.circleKana = value
          break
        case 'genre':
          circle.genre = value ? value.split(',').map(g => g.trim()) : []
          break
        case 'day':
          circle.placement = circle.placement || {}
          circle.placement.day = value
          break
        case 'area':
          circle.placement = circle.placement || {}
          circle.placement.area = value
          break
        case 'block':
          circle.placement = circle.placement || {}
          circle.placement.block = value
          break
        case 'number':
          circle.placement = circle.placement || {}
          circle.placement.number = value
          break
        case 'position':
          circle.placement = circle.placement || {}
          circle.placement.position = value
          break
        case 'description':
          circle.description = value
          break
        case 'twitter':
          circle.contact = circle.contact || {}
          circle.contact.twitter = value
          break
        case 'pixiv':
          circle.contact = circle.contact || {}
          circle.contact.pixiv = value
          break
        case 'website':
          circle.contact = circle.contact || {}
          circle.contact.website = value
          break
        case 'oshinaurl':
          circle.contact = circle.contact || {}
          circle.contact.oshinaUrl = value
          break
        case 'tags':
          circle.tags = value ? value.split(',').map(t => t.trim()) : []
          break
        case 'isadult':
          circle.isAdult = value.toLowerCase() === 'true'
          break
      }
    })
    
    if (circle.circleName) {
      circles.push(circle)
    }
  }
  
  return circles
}

const startImport = async () => {
  if (!canImport.value || importing.value) return
  
  importing.value = true
  error.value = null
  importResult.value = null
  
  try {
    let dataToImport: Circle[] = []
    
    if (importMethod.value === 'csv') {
      dataToImport = csvPreview.value
    } else if (importMethod.value === 'copy') {
      // 前回イベントからデータを取得
      const sourceCircles = await fetchCircles({}, sourceEventId.value)
      dataToImport = sourceCircles.circles.map(circle => ({
        ...circle,
        id: `copy-${circle.id}`,
        eventId: selectedEventId.value,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    }
    
    importProgress.current = 0
    importProgress.total = dataToImport.length
    
    let success = 0
    let skipped = 0
    let errors = 0
    
    // バッチ処理でインポート
    for (let i = 0; i < dataToImport.length; i++) {
      try {
        const circle = dataToImport[i]
        
        // 重複チェック
        if (options.checkDuplicates) {
          // 実際の実装では既存データとの重複をチェック
        }
        
        // サークルを保存（実際の実装ではFirestoreに保存）
        console.log('Importing circle:', circle.circleName)
        
        success++
        importProgress.current = i + 1
        
        // UI更新のための小さな遅延
        await new Promise(resolve => setTimeout(resolve, 10))
        
      } catch (err) {
        console.error('Import error for circle:', dataToImport[i].circleName, err)
        errors++
      }
    }
    
    importResult.value = { success, skipped, errors }
    
  } catch (err) {
    console.error('Import error:', err)
    error.value = 'インポート中にエラーが発生しました'
  } finally {
    importing.value = false
  }
}

// ソースイベント変更時の統計取得
watch(sourceEventId, async (newEventId) => {
  if (newEventId) {
    sourceEventStats.value = await getEventStats(newEventId)
  } else {
    sourceEventStats.value = null
  }
})

// 初期化
onMounted(async () => {
  if (events.value.length === 0) {
    await fetchEvents()
  }
})
</script>