<template>
  <div class="space-y-4">
    <!-- 現在の画像表示 -->
    <div v-if="modelValue" class="w-full">
      <ImageViewer
        :src="modelValue"
        :alt="label"
        :can-edit="canEdit"
        image-class="w-full max-w-full h-auto object-contain"
        @remove="removeImage"
      />
    </div>

    <!-- アップロードエリア -->
    <div v-if="canEdit" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        {{ label }}
      </label>
      
      <div
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        class="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        :class="{ 'border-blue-400 bg-blue-50': dragOver }"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div v-if="uploading" class="space-y-2">
          <div class="animate-spin mx-auto h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="text-sm text-gray-600">アップロード中...</p>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
        </div>
        
        <div v-else class="space-y-2">
          <PhotoIcon class="mx-auto h-12 w-12 text-gray-400" />
          <div class="text-sm text-gray-600">
            <span class="font-medium text-blue-600">クリックして画像を選択</span>
            またはドラッグ&ドロップ
          </div>
          <p class="text-xs text-gray-500">
            PNG、JPG、JPEG形式（最大5MB）
          </p>
        </div>
      </div>
      
      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>
    </div>
    
    <!-- 読み取り専用の場合の表示 -->
    <div v-else-if="!modelValue" class="text-center py-8 text-gray-500">
      <PhotoIcon class="mx-auto h-12 w-12 text-gray-300" />
      <p class="mt-2 text-sm">{{ label }}は登録されていません</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PhotoIcon } from '@heroicons/vue/24/outline'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

interface Props {
  modelValue?: string
  label: string
  path: string // Storage内のパス
  canEdit: boolean
  maxSize?: number // MB
}

interface Emits {
  (e: 'update:modelValue', value: string | undefined): void
  (e: 'deleted:image'): void
  (e: 'error', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 5
})

const emit = defineEmits<Emits>()

const { $storage } = useNuxtApp()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const dragOver = ref(false)

const removeImage = async () => {
  if (!props.modelValue) return

  try {
    // Storageから画像を削除
    const imageRef = storageRef($storage, props.modelValue)
    await deleteObject(imageRef)
    
    emit('update:modelValue', undefined)
    emit('deleted:image')
  } catch (err) {
    console.error('画像削除エラー:', err)
    emit('error', '画像の削除に失敗しました')
  }
}

const validateFile = (file: File): boolean => {
  error.value = ''

  // ファイルタイプチェック
  if (!file.type.startsWith('image/')) {
    error.value = '画像ファイルを選択してください'
    return false
  }

  // ファイルサイズチェック
  const maxSizeBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    error.value = `ファイルサイズは${props.maxSize}MB以下にしてください`
    return false
  }

  return true
}

const uploadFile = async (file: File) => {
  if (!validateFile(file)) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    // ファイル名を生成（タイムスタンプ + 元のファイル名）
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const fullPath = `${props.path}/${fileName}`
    
    const imageRef = storageRef($storage, fullPath)
    const uploadTask = uploadBytesResumable(imageRef, file)

    // アップロード進捗の監視
    uploadTask.on('state_changed', 
      (snapshot) => {
        uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      },
      (error) => {
        console.error('アップロードエラー:', error)
        emit('error', 'ファイルのアップロードに失敗しました')
        uploading.value = false
      },
      async () => {
        // アップロード完了
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        emit('update:modelValue', downloadURL)
        uploading.value = false
        
        // 既存の画像がある場合は削除
        if (props.modelValue && props.modelValue !== downloadURL) {
          try {
            const oldImageRef = storageRef($storage, props.modelValue)
            await deleteObject(oldImageRef)
          } catch (err) {
            console.warn('古い画像の削除に失敗:', err)
          }
        }
      }
    )
  } catch (err) {
    console.error('アップロード開始エラー:', err)
    emit('error', 'ファイルのアップロードに失敗しました')
    uploading.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  const file = event.dataTransfer?.files[0]
  if (file) {
    uploadFile(file)
  }
}
</script>