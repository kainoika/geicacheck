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
                <span class="ml-4 text-sm font-medium text-gray-500">新規作成</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div class="mt-4">
          <h1 class="text-3xl font-bold text-gray-900">新規イベント作成</h1>
          <p class="mt-2 text-gray-600">
            新しい芸カイベントの基本情報を入力してください。
          </p>
        </div>
      </div>

      <!-- フォーム -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- 基本情報 -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">基本情報</h2>
          
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- イベント名 -->
            <div class="sm:col-span-2">
              <label for="name" class="block text-sm font-medium text-gray-700">
                イベント名 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.name"
                     type="text"
                     id="name"
                     required
                     placeholder="第2回 芸能人はカードが命！"
                     class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <p class="mt-1 text-sm text-gray-500">
                正式なイベント名を入力してください
              </p>
            </div>

            <!-- 短縮名 -->
            <div>
              <label for="shortName" class="block text-sm font-medium text-gray-700">
                短縮名 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.shortName"
                     type="text"
                     id="shortName"
                     required
                     placeholder="芸カ2"
                     class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <p class="mt-1 text-sm text-gray-500">
                ナビゲーションで表示される短い名前
              </p>
            </div>

            <!-- 開催日 -->
            <div>
              <label for="eventDate" class="block text-sm font-medium text-gray-700">
                開催日 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.eventDate"
                     type="date"
                     id="eventDate"
                     required
                     class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            </div>

            <!-- 状態 -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">
                状態 <span class="text-red-500">*</span>
              </label>
              <select v-model="form.status"
                      id="status"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
                <option value="upcoming">開催予定</option>
                <option value="active">開催中</option>
                <option value="completed">終了</option>
                <option value="cancelled">中止</option>
              </select>
            </div>

            <!-- デフォルト設定 -->
            <div class="sm:col-span-2">
              <div class="flex items-center">
                <input v-model="form.isDefault"
                       type="checkbox"
                       id="isDefault"
                       class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded">
                <label for="isDefault" class="ml-2 block text-sm text-gray-900">
                  このイベントをデフォルトに設定
                </label>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                デフォルトイベントはアプリ起動時に自動選択されます
              </p>
            </div>

            <!-- 説明 -->
            <div class="sm:col-span-2">
              <label for="description" class="block text-sm font-medium text-gray-700">
                イベント説明
              </label>
              <textarea v-model="form.description"
                        id="description"
                        rows="3"
                        placeholder="アイカツ！シリーズオンリー同人イベント第2回"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"></textarea>
            </div>
          </div>
        </div>

        <!-- 会場情報 -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">会場情報</h2>
          
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- 会場名 -->
            <div>
              <label for="venueName" class="block text-sm font-medium text-gray-700">
                会場名 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.venue.name"
                     type="text"
                     id="venueName"
                     required
                     placeholder="東京ビッグサイト"
                     class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            </div>

            <!-- 住所 -->
            <div>
              <label for="venueAddress" class="block text-sm font-medium text-gray-700">
                住所 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.venue.address"
                     type="text"
                     id="venueAddress"
                     required
                     placeholder="東京都江東区有明3-11-1"
                     class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            </div>

            <!-- アクセス情報 -->
            <div class="sm:col-span-2">
              <label for="accessInfo" class="block text-sm font-medium text-gray-700">
                アクセス情報
              </label>
              <textarea v-model="form.venue.accessInfo"
                        id="accessInfo"
                        rows="2"
                        placeholder="ゆりかもめ「国際展示場正門駅」徒歩3分"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"></textarea>
            </div>
          </div>
        </div>

        <!-- 申込期間 -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">申込期間</h2>
          
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- 申込開始日 -->
            <div>
              <label for="registrationStart" class="block text-sm font-medium text-gray-700">
                申込開始日 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.registrationPeriod.start"
                     type="date"
                     id="registrationStart"
                     required
                     class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            </div>

            <!-- 申込終了日 -->
            <div>
              <label for="registrationEnd" class="block text-sm font-medium text-gray-700">
                申込終了日 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.registrationPeriod.end"
                     type="date"
                     id="registrationEnd"
                     required
                     class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            </div>
          </div>
        </div>

        <!-- マップデータ -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">マップデータ</h2>
          
          <div class="space-y-4">
            <!-- ファイルアップロード -->
            <div>
              <label for="mapFile" class="block text-sm font-medium text-gray-700">
                SVGマップファイル
              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="mapFile" class="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
                      <span>ファイルをアップロード</span>
                      <input @change="handleFileUpload" id="mapFile" name="mapFile" type="file" accept=".svg" class="sr-only">
                    </label>
                    <p class="pl-1">またはドラッグ&ドロップ</p>
                  </div>
                  <p class="text-xs text-gray-500">SVGファイルのみ対応</p>
                </div>
              </div>
            </div>

            <!-- アップロードされたファイル情報 -->
            <div v-if="uploadedFile" class="bg-green-50 border border-green-200 rounded-md p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <CheckCircleIcon class="h-5 w-5 text-green-400" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-green-800">
                    ファイルがアップロードされました
                  </p>
                  <p class="text-sm text-green-700">
                    {{ uploadedFile.name }} ({{ formatFileSize(uploadedFile.size) }})
                  </p>
                </div>
              </div>
            </div>

            <!-- マップデータプレビュー -->
            <div v-if="form.mapData" class="border border-gray-200 rounded-md p-4">
              <h3 class="text-sm font-medium text-gray-900 mb-2">プレビュー</h3>
              <div class="bg-gray-50 rounded-md p-4 max-h-64 overflow-auto">
                <div v-html="form.mapData" class="max-w-full"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- エラー表示 -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
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

        <!-- アクションボタン -->
        <div class="flex justify-end space-x-3">
          <NuxtLink to="/admin/events"
                    class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
            キャンセル
          </NuxtLink>
          <button type="submit"
                  :disabled="creating"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50">
            {{ creating ? '作成中...' : 'イベントを作成' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ChevronRightIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/vue/24/outline'
import type { Event, EventVenue } from '~/types'

// メタデータ設定
definePageMeta({
  title: '新規イベント作成 - geika check!'
})

// イベント管理
const { createEvent } = useEvents()

// State
const creating = ref(false)
const error = ref<string | null>(null)
const uploadedFile = ref<File | null>(null)

// フォームデータ
const form = reactive({
  name: '',
  shortName: '',
  eventDate: '',
  status: 'upcoming' as const,
  isDefault: false,
  description: '',
  venue: {
    name: '',
    address: '',
    accessInfo: ''
  } as EventVenue,
  registrationPeriod: {
    start: '',
    end: ''
  },
  mapData: ''
})

// Methods
const handleFileUpload = async (event: InputEvent) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (file.type !== 'image/svg+xml') {
    error.value = 'SVGファイルのみアップロード可能です'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB制限
    error.value = 'ファイルサイズは5MB以下にしてください'
    return
  }
  
  try {
    const text = await file.text()
    form.mapData = text
    uploadedFile.value = file
    error.value = null
  } catch (err) {
    error.value = 'ファイルの読み込みに失敗しました'
    console.error('File upload error:', err)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const validateForm = (): boolean => {
  error.value = null
  
  // 必須フィールドチェック
  if (!form.name.trim()) {
    error.value = 'イベント名は必須です'
    return false
  }
  
  if (!form.shortName.trim()) {
    error.value = '短縮名は必須です'
    return false
  }
  
  if (!form.eventDate) {
    error.value = '開催日は必須です'
    return false
  }
  
  if (!form.venue.name.trim()) {
    error.value = '会場名は必須です'
    return false
  }
  
  if (!form.venue.address.trim()) {
    error.value = '住所は必須です'
    return false
  }
  
  if (!form.registrationPeriod.start) {
    error.value = '申込開始日は必須です'
    return false
  }
  
  if (!form.registrationPeriod.end) {
    error.value = '申込終了日は必須です'
    return false
  }
  
  // 日付の妥当性チェック
  const eventDate = new Date(form.eventDate)
  const regStart = new Date(form.registrationPeriod.start)
  const regEnd = new Date(form.registrationPeriod.end)
  
  if (regStart >= regEnd) {
    error.value = '申込終了日は開始日より後の日付を設定してください'
    return false
  }
  
  if (regEnd >= eventDate) {
    error.value = 'イベント開催日は申込終了日より後の日付を設定してください'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm() || creating.value) return
  
  creating.value = true
  error.value = null
  
  try {
    // イベントデータを構築
    const eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      eventDate: new Date(form.eventDate),
      venue: {
        name: form.venue.name.trim(),
        address: form.venue.address.trim(),
        accessInfo: form.venue.accessInfo.trim() || undefined,
        mapData: form.mapData || undefined
      },
      description: form.description.trim() || undefined,
      status: form.status,
      registrationPeriod: {
        start: new Date(form.registrationPeriod.start),
        end: new Date(form.registrationPeriod.end)
      },
      isDefault: form.isDefault,
      mapData: form.mapData || undefined
    }
    
    // イベントを作成
    await createEvent(eventData)
    
    // 成功時はイベント管理ページに遷移
    await navigateTo('/admin/events')
    
  } catch (err) {
    console.error('Event creation error:', err)
    error.value = 'イベントの作成に失敗しました。もう一度お試しください。'
  } finally {
    creating.value = false
  }
}

// 初期値設定
onMounted(() => {
  // デフォルトの申込期間を設定（開催日の2ヶ月前〜1ヶ月前）
  const today = new Date()
  const twoMonthsLater = new Date(today)
  twoMonthsLater.setMonth(today.getMonth() + 2)
  
  const oneMonthLater = new Date(today)
  oneMonthLater.setMonth(today.getMonth() + 1)
  
  form.eventDate = twoMonthsLater.toISOString().split('T')[0]
  form.registrationPeriod.start = today.toISOString().split('T')[0]
  form.registrationPeriod.end = oneMonthLater.toISOString().split('T')[0]
})
</script>