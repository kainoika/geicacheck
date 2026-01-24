<template>
  <div
    v-if="images && images.length > 0"
    class="image-carousel"
    :data-testid="'carousel-container'"
    tabindex="0"
    @keydown="handleKeydown"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- 画像表示エリア -->
    <div class="carousel-main">
      <img
        v-if="currentImage"
        :src="currentImage.url"
        :alt="`お品書き${currentIndex + 1}`"
        class="carousel-image"
      />
    </div>

    <!-- ナビゲーションボタン（複数枚の場合のみ） -->
    <template v-if="hasMultiple">
      <button
        type="button"
        class="nav-button nav-prev"
        :data-testid="'carousel-prev'"
        @click="prev"
        aria-label="前の画像へ"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </button>

      <button
        type="button"
        class="nav-button nav-next"
        :data-testid="'carousel-next'"
        @click="next"
        aria-label="次の画像へ"
      >
        <ChevronRightIcon class="h-6 w-6" />
      </button>
    </template>

    <!-- インジケーター（複数枚の場合のみ） -->
    <div v-if="hasMultiple" class="carousel-indicator" :data-testid="'carousel-indicator'">
      <div class="indicator-text">
        {{ currentIndex + 1 }} / {{ totalCount }}
      </div>

      <!-- ドット -->
      <div class="indicator-dots">
        <button
          v-for="(_, index) in images"
          :key="index"
          type="button"
          class="indicator-dot"
          :class="{ active: index === currentIndex }"
          :data-testid="`carousel-dot-${index}`"
          @click="goTo(index)"
          :aria-label="`画像${index + 1}へ移動`"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import type { MenuImage } from '~/types';
import { useImageCarousel } from '~/composables/useImageCarousel';

/**
 * ImageCarouselコンポーネントのProps
 */
interface Props {
  /** 表示する画像配列 */
  images: MenuImage[];
}

const props = defineProps<Props>();

const imagesRef = ref(props.images);
const { currentIndex, currentImage, hasMultiple, totalCount, next, prev, goTo } =
  useImageCarousel(imagesRef);

// タッチジェスチャー用の状態
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50; // スワイプと認識する最小距離（px）

/**
 * タッチ開始
 */
const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.touches[0].clientX;
};

/**
 * タッチ移動
 */
const handleTouchMove = (event: TouchEvent) => {
  touchEndX.value = event.touches[0].clientX;
};

/**
 * タッチ終了（スワイプ判定）
 */
const handleTouchEnd = () => {
  const distance = touchStartX.value - touchEndX.value;

  if (Math.abs(distance) < minSwipeDistance) {
    // スワイプ距離が足りない
    return;
  }

  if (distance > 0) {
    // 左スワイプ → 次へ
    next();
  } else {
    // 右スワイプ → 前へ
    prev();
  }

  // リセット
  touchStartX.value = 0;
  touchEndX.value = 0;
};

/**
 * キーボード操作
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    prev();
  } else if (event.key === 'ArrowRight') {
    next();
  }
};

// クリーンアップは不要（イベントリスナーはテンプレート内で定義）
</script>

<style scoped>
.image-carousel {
  position: relative;
  width: 100%;
  max-width: 100%;
  background: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
  outline: none;
}

.carousel-main {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.carousel-image {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: auto;
  object-fit: contain;
}

/* ナビゲーションボタン */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.nav-button:hover {
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-prev {
  left: 0.5rem;
}

.nav-next {
  right: 0.5rem;
}

/* インジケーター */
.carousel-indicator {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
}

.indicator-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.indicator-dots {
  display: flex;
  gap: 0.375rem;
}

.indicator-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.indicator-dot.active {
  background: white;
  width: 0.75rem;
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* モバイル対応 */
@media (max-width: 767px) {
  .nav-button {
    width: 2rem;
    height: 2rem;
  }

  .nav-prev {
    left: 0.25rem;
  }

  .nav-next {
    right: 0.25rem;
  }

  .carousel-indicator {
    bottom: 0.5rem;
    padding: 0.375rem 0.75rem;
  }

  .indicator-text {
    font-size: 0.75rem;
  }

  .indicator-dots {
    gap: 0.25rem;
  }

  .indicator-dot {
    width: 0.375rem;
    height: 0.375rem;
  }

  .indicator-dot.active {
    width: 0.5rem;
  }
}

/* タッチデバイス用の最小タップエリア確保 */
@media (pointer: coarse) {
  .nav-button {
    min-width: 44px;
    min-height: 44px;
  }

  .indicator-dot {
    min-width: 24px;
    min-height: 24px;
  }
}
</style>
