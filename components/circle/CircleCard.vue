<template>
    <div class="card card-hover overflow-hidden" oncontextmenu="return false;">
        <!-- サークルカット画像 -->
        <div class="relative h-48 bg-gray-100 group">
            <img v-if="circle.circleCutImageUrl" :src="circle.circleCutImageUrl" :alt="`${circle.circleName}のサークルカット`"
                class="w-full h-full object-cover cursor-pointer transition-opacity hover:opacity-90"
                @error="handleImageError" @click="openImageModal" />
            <div v-else
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div class="text-center">
                    <PhotoIcon class="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p class="text-xs text-gray-400 font-medium">{{ circle.circleName }}</p>
                </div>
            </div>

            <!-- 拡大アイコン（ホバー時に表示） -->
            <div v-if="circle.circleCutImageUrl"
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 cursor-pointer"
                @click="openImageModal">
                <MagnifyingGlassPlusIcon class="h-8 w-8 text-white drop-shadow-lg" />
            </div>

            <!-- 成人向けマーク（画像上に重ねて表示） -->
            <div v-if="circle.isAdult" class="absolute top-2 left-2">
                <span class="badge badge-warning text-xs shadow-md">
                    <ExclamationTriangleIcon class="h-3 w-3 mr-1" />
                    成人向け
                </span>
            </div>

            <!-- ブックマークボタン（画像上に重ねて表示） -->
            <div class="absolute top-2 right-2">
                <BookmarkButton :circle-id="circle.id" :initial-category="bookmarkCategory" @bookmark="handleBookmark"
                    class="shadow-md" />
            </div>
        </div>

        <div class="p-4">
            <!-- タイトル -->
            <div class="mb-3">
                <h3 class="text-lg font-semibold text-gray-900 truncate">
                    {{ circle.circleName }}
                </h3>
                <p v-if="circle.penName" class="text-sm text-gray-500 mt-1">
                    {{ circle.penName }}
                </p>
            </div>

            <!-- ジャンル -->
            <div class="mb-3">
                <div class="flex flex-wrap gap-1">
                    <span v-for="genre in circle.genre" :key="genre" class="badge badge-secondary text-xs">
                        {{ genre }}
                    </span>
                </div>
            </div>

            <!-- 配置情報 -->
            <div class="mb-3">
                <div class="flex items-center text-sm text-gray-600">
                    <MapPinIcon class="h-4 w-4 mr-1" />
                    <span class="font-medium">{{ formatPlacement(circle.placement) }}</span>
                </div>
            </div>

            <!-- 説明 -->
            <div v-if="circle.description" class="mb-3">
                <p class="text-sm text-gray-600 line-clamp-2">
                    {{ circle.description }}
                </p>
            </div>

            <!-- 外部リンクと詳細ボタン -->
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <div class="flex space-x-1">
                    <!-- Twitter -->
                    <a v-if="circle.contact.twitter" :href="circle.contact.twitter" target="_blank"
                        rel="noopener noreferrer"
                        class="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-md hover:bg-gray-100"
                        :title="`@${getTwitterUsername(circle.contact.twitter)}`">
                        <svg class="w-4 h-4" viewBox="0 0 1200 1227" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
                                fill="gray" />
                        </svg>
                    </a>

                    <!-- Pixiv -->
                    <a v-if="circle.contact.pixiv" :href="circle.contact.pixiv" target="_blank"
                        rel="noopener noreferrer"
                        class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-100"
                        title="Pixiv">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M4.935 0A4.924 4.924 0 0 0 0 4.935v14.13A4.924 4.924 0 0 0 4.935 24h14.13A4.924 4.924 0 0 0 24 19.065V4.935A4.924 4.924 0 0 0 19.065 0H4.935zm7.81 4.547c2.181 0 4.058.676 5.399 1.847a6.118 6.118 0 0 1 2.116 4.66c.005 1.854-.88 3.476-2.257 4.563-1.375 1.092-3.225 1.697-5.258 1.697-2.314 0-4.46-.87-5.64-2.287v6.326H5.021V5.995h2.084v1.107c1.18-1.418 3.326-2.555 5.64-2.555zm-.168 2.084c-1.434 0-2.717.603-3.604 1.565-.887.962-1.419 2.282-1.419 3.716 0 1.434.532 2.754 1.419 3.716.887.962 2.17 1.565 3.604 1.565 1.434 0 2.717-.603 3.604-1.565.887-.962 1.419-2.282 1.419-3.716 0-1.434-.532-2.754-1.419-3.716-.887-.962-2.17-1.565-3.604-1.565z" />
                        </svg>
                    </a>

                    <!-- お品書き -->
                    <a v-if="circle.contact.oshinaUrl" :href="circle.contact.oshinaUrl" target="_blank"
                        rel="noopener noreferrer"
                        class="p-1.5 text-gray-400 hover:text-orange-600 transition-colors rounded-md hover:bg-gray-100"
                        title="お品書き">
                        <DocumentTextIcon class="h-4 w-4" />
                    </a>
                </div>

                <!-- 詳細ボタン -->
                <NuxtLink :to="`/circles/${circle.id}`"
                    class="px-3 py-1.5 text-sm text-white bg-pink-500 hover:bg-pink-600 rounded-md font-medium transition-colors">
                    詳細
                </NuxtLink>
            </div>
        </div>

        <!-- 画像拡大モーダル -->
        <Teleport to="body" oncontextmenu="return false;">
            <div v-if="isImageModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
                @click="closeImageModal">
                <div class="relative max-w-4xl max-h-full" oncontextmenu="return false;">
                    <!-- 閉じるボタン -->
                    <button @click="closeImageModal"
                        class="absolute top-4 right-4 p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors z-10">
                        <XMarkIcon class="h-6 w-6" />
                    </button>

                    <!-- 拡大画像 -->
                    <img :src="circle.circleCutImageUrl" :alt="`${circle.circleName}のサークルカット`"
                        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" @click.stop />

                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import {
    MapPinIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    PhotoIcon,
    MagnifyingGlassPlusIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline'
import type { Circle, BookmarkCategory } from '~/types'

interface Props {
    circle: Circle
}

interface Emits {
    (e: 'bookmark', circleId: string, category: BookmarkCategory): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { getBookmarkByCircleId } = useBookmarks()
const { formatPlacement } = useCircles()

// State
const isImageModalOpen = ref(false)

// Computed
const bookmarkCategory = computed(() => {
    const bookmark = getBookmarkByCircleId(props.circle.id)
    return bookmark?.category
})

// Methods
const handleBookmark = (category: BookmarkCategory) => {
    emit('bookmark', props.circle.id, category)
}

const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.style.display = 'none'
}

const getTwitterUsername = (twitterUrl: string) => {
    if (!twitterUrl) return ''
    return twitterUrl.replace(/\/+$/, '').split('/').pop() || ''
}

const openImageModal = () => {
    isImageModalOpen.value = true
    // ボディのスクロールを無効化
    document.body.style.overflow = 'hidden'
}

const closeImageModal = () => {
    isImageModalOpen.value = false
    // ボディのスクロールを復元
    document.body.style.overflow = ''
}

// ESCキーでモーダルを閉じる
onMounted(() => {
    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isImageModalOpen.value) {
            closeImageModal()
        }
    }

    document.addEventListener('keydown', handleEscape)

    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscape)
        // ボディのスクロールを復元
        document.body.style.overflow = ''
    })
})

</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>