<template>
  <div class="relative">
    <!-- クリック可能な画像 -->
    <img :src="src" :alt="alt"
      class="cursor-pointer rounded-lg border border-gray-300 transition-opacity hover:opacity-90" :class="imageClass"
      @click="openModal" oncontextmenu="return false;" />

    <!-- 拡大アイコン（ホバー時に表示） -->
    <div v-if="src"
      class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 rounded-lg cursor-pointer"
      @click="openModal">
      <MagnifyingGlassPlusIcon class="h-8 w-8 text-white drop-shadow-lg" />
    </div>

    <!-- 削除ボタン（編集可能な場合） -->
    <button v-if="canEdit && src" @click="$emit('remove')"
      class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
      type="button">
      <XMarkIcon class="h-4 w-4" />
    </button>

    <!-- 拡大モーダル -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
        @click="closeModal">
        <div class="relative max-w-4xl max-h-full">
          <!-- 閉じるボタン -->
          <button @click="closeModal"
            class="absolute top-4 right-4 p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors z-10">
            <XMarkIcon class="h-6 w-6" />
          </button>

          <!-- 拡大画像 -->
          <img :src="src" :alt="alt" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" @click.stop
            oncontextmenu="return false;" />

          <!-- 画像タイトル -->
          <div v-if="title" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 rounded-b-lg">
            <h3 class="text-lg font-medium">{{ title }}</h3>
            <p v-if="description" class="text-sm text-gray-300 mt-1">{{ description }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { XMarkIcon, MagnifyingGlassPlusIcon } from '@heroicons/vue/24/outline'

interface Props {
  src?: string
  alt: string
  title?: string
  description?: string
  imageClass?: string
  canEdit?: boolean
}

interface Emits {
  (e: 'remove'): void
}

const props = withDefaults(defineProps<Props>(), {
  imageClass: 'w-full max-w-md h-auto',
  canEdit: false
})

const emit = defineEmits<Emits>()

const isModalOpen = ref(false)

const openModal = () => {
  if (props.src) {
    isModalOpen.value = true
    // ボディのスクロールを無効化
    document.body.style.overflow = 'hidden'
  }
}

const closeModal = () => {
  isModalOpen.value = false
  // ボディのスクロールを復元
  document.body.style.overflow = ''
}

// コンポーネントがアンマウントされる時にスクロールを復元
onUnmounted(() => {
  document.body.style.overflow = ''
})

// ESCキーでモーダルを閉じる
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isModalOpen.value) {
      closeModal()
    }
  }

  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
/* アニメーション用のスタイル */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>