<template>
    <div class="card card-hover">
        <div class="p-6">
            <!-- ヘッダー -->
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">
                        {{ circle.circleName }}
                    </h3>
                    <p v-if="circle.circleKana" class="text-sm text-gray-500 mt-1">
                        {{ circle.circleKana }}
                    </p>
                </div>

                <!-- ブックマークボタン -->
                <BookmarkButton :circle-id="circle.id" :initial-category="bookmarkCategory" @bookmark="handleBookmark"
                    class="ml-3" />
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
                    <span class="ml-2 text-xs text-gray-500">
                        {{ circle.placement.day }}日目
                    </span>
                </div>
            </div>

            <!-- 説明 -->
            <div v-if="circle.description" class="mb-4">
                <p class="text-sm text-gray-600 line-clamp-2">
                    {{ circle.description }}
                </p>
            </div>

            <!-- タグ -->
            <div v-if="circle.tags.length > 0" class="mb-4">
                <div class="flex flex-wrap gap-1">
                    <span v-for="tag in circle.tags.slice(0, 3)" :key="tag"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        #{{ tag }}
                    </span>
                    <span v-if="circle.tags.length > 3"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                        +{{ circle.tags.length - 3 }}
                    </span>
                </div>
            </div>

            <!-- 成人向けマーク -->
            <div v-if="circle.isAdult" class="mb-4">
                <span class="badge badge-warning text-xs">
                    <ExclamationTriangleIcon class="h-3 w-3 mr-1" />
                    成人向け
                </span>
            </div>

            <!-- 外部リンク -->
            <div class="flex items-center justify-between">
                <div class="flex space-x-2">
                    <!-- Twitter -->
                    <a v-if="circle.contact.twitter" :href="getTwitterUrl(circle.contact.twitter)" target="_blank"
                        rel="noopener noreferrer"
                        class="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-md hover:bg-gray-100"
                        :title="`@${circle.contact.twitter}`">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                    </a>

                    <!-- Pixiv -->
                    <a v-if="circle.contact.pixiv" :href="circle.contact.pixiv" target="_blank"
                        rel="noopener noreferrer"
                        class="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-100"
                        title="Pixiv">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M4.935 0A4.924 4.924 0 0 0 0 4.935v14.13A4.924 4.924 0 0 0 4.935 24h14.13A4.924 4.924 0 0 0 24 19.065V4.935A4.924 4.924 0 0 0 19.065 0H4.935zm7.81 4.547c2.181 0 4.058.676 5.399 1.847a6.118 6.118 0 0 1 2.116 4.66c.005 1.854-.88 3.476-2.257 4.563-1.375 1.092-3.225 1.697-5.258 1.697-2.314 0-4.46-.87-5.64-2.287v6.326H5.021V5.995h2.084v1.107c1.18-1.418 3.326-2.555 5.64-2.555zm-.168 2.084c-1.434 0-2.717.603-3.604 1.565-.887.962-1.419 2.282-1.419 3.716 0 1.434.532 2.754 1.419 3.716.887.962 2.17 1.565 3.604 1.565 1.434 0 2.717-.603 3.604-1.565.887-.962 1.419-2.282 1.419-3.716 0-1.434-.532-2.754-1.419-3.716-.887-.962-2.17-1.565-3.604-1.565z" />
                        </svg>
                    </a>

                    <!-- Website -->
                    <a v-if="circle.contact.website" :href="circle.contact.website" target="_blank"
                        rel="noopener noreferrer"
                        class="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-md hover:bg-gray-100"
                        title="Website">
                        <GlobeAltIcon class="h-4 w-4" />
                    </a>

                    <!-- お品書き -->
                    <a v-if="circle.contact.oshinaUrl" :href="circle.contact.oshinaUrl" target="_blank"
                        rel="noopener noreferrer"
                        class="p-2 text-gray-400 hover:text-orange-600 transition-colors rounded-md hover:bg-gray-100"
                        title="お品書き">
                        <DocumentTextIcon class="h-4 w-4" />
                    </a>
                </div>

                <!-- 詳細ボタン -->
                <NuxtLink :to="`/circles/${circle.id}`"
                    class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    詳細 →
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    MapPinIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon
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

// Computed
const bookmarkCategory = computed(() => {
    const bookmark = getBookmarkByCircleId(props.circle.id)
    return bookmark?.category
})

// Methods
const handleBookmark = (category: BookmarkCategory) => {
    emit('bookmark', props.circle.id, category)
}

const getTwitterUrl = (twitterId: string): string => {
    const cleanId = twitterId.replace('@', '')
    return `https://twitter.com/${cleanId}`
}
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>