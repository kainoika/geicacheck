<template>
  <div class="circle-list-item">
    <div style="display: flex; align-items: start; gap: 1rem;">
      <!-- 左側：サークル情報 -->
      <div style="flex: 1; min-width: 0;">
        <!-- ヘッダー -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
          <div style="flex: 1; min-width: 0;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.25rem 0; line-height: 1.4;">
              {{ circle.circleName }}
            </h3>
            <p v-if="circle.circleKana" style="font-size: 0.875rem; color: #6b7280; margin: 0;">
              {{ circle.circleKana }}
            </p>
          </div>
          
          <!-- ブックマークボタン -->
          <div style="margin-left: 1rem; flex-shrink: 0;">
            <button
              @click="handleBookmark"
              :style="{
                padding: '0.5rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: isBookmarked ? '#fef3f2' : '#f9fafb',
                color: isBookmarked ? '#ff69b4' : '#6b7280'
              }"
              :title="isBookmarked ? 'ブックマーク済み' : 'ブックマークに追加'"
              onmouseover="this.style.transform='scale(1.05)'"
              onmouseout="this.style.transform='scale(1)'"
            >
              {{ isBookmarked ? '⭐' : '☆' }}
            </button>
          </div>
        </div>

        <!-- メタ情報 -->
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem; font-size: 0.875rem; color: #6b7280;">
          <!-- 配置 -->
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <span>📍</span>
            <span style="font-weight: 500;">{{ formatPlacement(circle.placement) }}</span>
          </div>
          
          <!-- 成人向けマーク -->
          <div v-if="circle.isAdult" style="display: flex; align-items: center; gap: 0.25rem; color: #f59e0b;">
            <span>⚠️</span>
            <span style="font-weight: 500;">成人向け</span>
          </div>
        </div>

        <!-- ジャンル -->
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <span 
              v-for="genre in circle.genre" 
              :key="genre"
              style="display: inline-block; background: #e0f2fe; color: #0277bd; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500;"
            >
              {{ genre }}
            </span>
          </div>
        </div>

        <!-- 説明 -->
        <div v-if="circle.description" style="margin-bottom: 0.75rem;">
          <p style="color: #4b5563; font-size: 0.875rem; line-height: 1.5; margin: 0;">
            {{ circle.description }}
          </p>
        </div>

      </div>

      <!-- 右側：アクション -->
      <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: end; flex-shrink: 0;">
        <!-- 外部リンク -->
        <div style="display: flex; gap: 0.5rem;">
          <!-- Twitter -->
          <a 
            v-if="circle.contact && circle.contact.twitter"
            :href="getTwitterUrl(circle.contact.twitter)"
            target="_blank"
            rel="noopener noreferrer"
            style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: #f0f9ff; color: #0284c7; border-radius: 0.375rem; text-decoration: none; transition: all 0.2s;"
            :title="`@${circle.contact.twitter}`"
            onmouseover="this.style.backgroundColor='#e0f2fe'"
            onmouseout="this.style.backgroundColor='#f0f9ff'"
          >
            🐦
          </a>

          <!-- Pixiv -->
          <a 
            v-if="circle.contact && circle.contact.pixiv"
            :href="circle.contact.pixiv"
            target="_blank"
            rel="noopener noreferrer"
            style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: #f0f9ff; color: #0284c7; border-radius: 0.375rem; text-decoration: none; transition: all 0.2s;"
            title="Pixiv"
            onmouseover="this.style.backgroundColor='#e0f2fe'"
            onmouseout="this.style.backgroundColor='#f0f9ff'"
          >
            🎨
          </a>

          <!-- Website -->
          <a 
            v-if="circle.contact && circle.contact.website"
            :href="circle.contact.website"
            target="_blank"
            rel="noopener noreferrer"
            style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: #f0fdf4; color: #16a34a; border-radius: 0.375rem; text-decoration: none; transition: all 0.2s;"
            title="Website"
            onmouseover="this.style.backgroundColor='#dcfce7'"
            onmouseout="this.style.backgroundColor='#f0fdf4'"
          >
            🌐
          </a>

          <!-- お品書き -->
          <a 
            v-if="circle.contact && circle.contact.oshinaUrl"
            :href="circle.contact.oshinaUrl"
            target="_blank"
            rel="noopener noreferrer"
            style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: #fff7ed; color: #ea580c; border-radius: 0.375rem; text-decoration: none; transition: all 0.2s;"
            title="お品書き"
            onmouseover="this.style.backgroundColor='#fed7aa'"
            onmouseout="this.style.backgroundColor='#fff7ed'"
          >
            📋
          </a>
        </div>

        <!-- 詳細ボタン -->
        <button
          @click="goToDetail"
          style="padding: 0.5rem 1rem; background: white; color: #ff69b4; border: 1px solid #ff69b4; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; font-weight: 500;"
          onmouseover="this.style.backgroundColor='#ff69b4'; this.style.color='white'"
          onmouseout="this.style.backgroundColor='white'; this.style.color='#ff69b4'"
        >
          詳細 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Circle, BookmarkCategory } from '~/types'

// Props
interface Props {
  circle: Circle
}

// Emits
interface Emits {
  (e: 'bookmark', circleId: string, category: BookmarkCategory): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { getBookmarkByCircleId } = useBookmarks()
const { formatPlacement } = useCircles()
const router = useRouter()

// Computed
const bookmark = computed(() => getBookmarkByCircleId(props.circle.id))
const isBookmarked = computed(() => !!bookmark.value)

// Methods
const getTwitterUrl = (twitterId: string): string => {
  const cleanId = twitterId.replace('@', '')
  return `https://twitter.com/${cleanId}`
}

const handleBookmark = () => {
  const category: BookmarkCategory = bookmark.value?.category || 'check'
  emit('bookmark', props.circle.id, category)
}

const goToDetail = () => {
  router.push(`/circles/${props.circle.id}`)
}
</script>

<style scoped>
.circle-list-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.circle-list-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #ff69b4;
}

@media (max-width: 640px) {
  .circle-list-item {
    padding: 1rem;
  }
  
  .circle-list-item > div {
    flex-direction: column;
    gap: 1rem;
  }
  
  .circle-list-item > div > div:last-child {
    align-items: start;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>