<template>
  <div class="multiple-image-upload">
    <!-- 画像一覧 -->
    <div v-if="modelValue && modelValue.length > 0" class="image-list">
      <div
        v-for="(image, index) in sortedImages"
        :key="image.id"
        class="image-item"
        :data-testid="`image-item-${index}`"
      >
        <img
          :src="image.url"
          :alt="`お品書き${index + 1}`"
          class="max-w-full w-full h-auto object-contain rounded-lg"
        />

        <!-- 編集可能な場合のコントロール -->
        <div v-if="canEdit" class="image-controls">
          <!-- 順序変更ボタン -->
          <div class="reorder-buttons">
            <button
              v-if="index > 0"
              type="button"
              class="btn-reorder"
              :data-testid="`move-up-${index}`"
              @click="moveUp(index)"
              title="上へ移動"
            >
              <ChevronUpIcon class="h-4 w-4" />
            </button>
            <button
              v-if="index < sortedImages.length - 1"
              type="button"
              class="btn-reorder"
              :data-testid="`move-down-${index}`"
              @click="moveDown(index)"
              title="下へ移動"
            >
              <ChevronDownIcon class="h-4 w-4" />
            </button>
          </div>

          <!-- 削除ボタン -->
          <button
            type="button"
            class="btn-delete"
            :data-testid="`delete-button-${index}`"
            @click="confirmDelete(image.id)"
          >
            <TrashIcon class="h-4 w-4" />
            削除
          </button>
        </div>

        <!-- インジケーター -->
        <div class="image-indicator">
          {{ index + 1 }} / {{ sortedImages.length }}
        </div>
      </div>
    </div>

    <!-- アップロードエリア -->
    <div
      v-if="canEdit && canUploadMore"
      class="upload-area"
      :data-testid="'upload-area'"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        @change="handleFileSelect"
        class="file-input"
      />

      <div v-if="uploading" class="uploading-state">
        <div class="spinner"></div>
        <p class="text-sm text-gray-600">アップロード中...</p>

        <!-- プログレスバー -->
        <div v-for="(progress, index) in uploadProgress" :key="index" class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="text-xs text-gray-500">{{ Math.round(progress) }}%</span>
        </div>
      </div>

      <div v-else class="upload-prompt">
        <PhotoIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <div class="text-sm text-gray-600 mt-2">
          <span class="font-medium text-blue-600">クリックして画像を選択</span>
          またはドラッグ&ドロップ
        </div>
        <p class="text-xs text-gray-500 mt-1">
          PNG、JPG、JPEG形式（最大10MB、{{ remainingSlots }}枚まで追加可能）
        </p>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <p v-if="error" class="error-message">
      {{ error }}
    </p>

    <!-- 読み取り専用モード（画像なし） -->
    <div v-if="!canEdit && (!modelValue || modelValue.length === 0)" class="empty-state">
      <PhotoIcon class="h-12 w-12 text-gray-300 mx-auto" />
      <p class="mt-2 text-sm text-gray-500">お品書き画像は登録されていません</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PhotoIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { MenuImage } from '~/types';
import { useCircleImages } from '~/composables/useCircleImages';

/**
 * MultipleImageUploadコンポーネントのProps
 */
interface Props {
  /** 現在の画像配列（v-modelでバインド） */
  modelValue: MenuImage[];
  /** サークルID */
  circleId: string;
  /** イベントID */
  eventId: string;
  /** 編集可能かどうか（falseの場合は読み取り専用） */
  canEdit: boolean;
  /** 最大画像枚数（デフォルト: 4） */
  maxImages?: number;
}

/**
 * MultipleImageUploadコンポーネントのEmits
 */
interface Emits {
  /** 画像配列が更新されたときに発火（v-model用） */
  (e: 'update:modelValue', value: MenuImage[]): void;
  /** エラーが発生したときに発火 */
  (e: 'error', message: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxImages: 4,
});

const emit = defineEmits<Emits>();

const logger = useLogger('MultipleImageUpload');

const { uploadMenuImages, deleteMenuImage, reorderMenuImages, uploading, uploadProgress } =
  useCircleImages();

const fileInput = ref<HTMLInputElement>();
const error = ref('');

/**
 * 順序でソートされた画像一覧
 */
const sortedImages = computed(() => {
  if (!props.modelValue) return [];
  return [...props.modelValue].sort((a, b) => a.order - b.order);
});

/**
 * 追加可能な残り枚数
 */
const remainingSlots = computed(() => {
  return props.maxImages - (props.modelValue?.length || 0);
});

/**
 * さらにアップロード可能か
 */
const canUploadMore = computed(() => {
  return remainingSlots.value > 0;
});

/**
 * ファイル選択処理
 */
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (files.length === 0) return;

  await uploadFiles(files);

  // input をリセット
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

/**
 * ドロップ処理
 */
const handleDrop = async (event: DragEvent) => {
  event.preventDefault();

  const files = Array.from(event.dataTransfer?.files || []);
  if (files.length === 0) return;

  await uploadFiles(files);
};

/**
 * ファイルアップロード
 */
const uploadFiles = async (files: File[]) => {
  error.value = '';

  try {
    logger.info('ファイルアップロード開始', { count: files.length });

    const updatedImages = await uploadMenuImages(
      props.circleId,
      props.eventId,
      files,
      props.modelValue || []
    );

    emit('update:modelValue', updatedImages);

    logger.info('ファイルアップロード完了', { totalImages: updatedImages.length });
  } catch (err: any) {
    logger.error('ファイルアップロードエラー', err);
    error.value = err.message || 'アップロードに失敗しました';
    emit('error', error.value);
  }
};

/**
 * 画像削除確認
 */
const confirmDelete = (imageId: string) => {
  if (confirm('この画像を削除しますか？')) {
    deleteImage(imageId);
  }
};

/**
 * 画像削除
 */
const deleteImage = async (imageId: string) => {
  error.value = '';

  try {
    logger.info('画像削除開始', { imageId });

    const updatedImages = await deleteMenuImage(
      props.circleId,
      props.eventId,
      imageId,
      props.modelValue
    );

    emit('update:modelValue', updatedImages);

    logger.info('画像削除完了', { remainingImages: updatedImages.length });
  } catch (err: any) {
    logger.error('画像削除エラー', err);
    error.value = err.message || '削除に失敗しました';
    emit('error', error.value);
  }
};

/**
 * 画像を上に移動
 */
const moveUp = async (index: number) => {
  if (index === 0) return;

  const imageId = sortedImages.value[index].id;
  await reorder(imageId, index - 1);
};

/**
 * 画像を下に移動
 */
const moveDown = async (index: number) => {
  if (index === sortedImages.value.length - 1) return;

  const imageId = sortedImages.value[index].id;
  await reorder(imageId, index + 1);
};

/**
 * 画像の順序変更
 */
const reorder = async (imageId: string, newOrder: number) => {
  error.value = '';

  try {
    logger.info('順序変更開始', { imageId, newOrder });

    const updatedImages = await reorderMenuImages(
      props.circleId,
      props.eventId,
      imageId,
      newOrder,
      props.modelValue
    );

    emit('update:modelValue', updatedImages);

    logger.info('順序変更完了');
  } catch (err: any) {
    logger.error('順序変更エラー', err);
    error.value = err.message || '順序変更に失敗しました';
    emit('error', error.value);
  }
};
</script>

<style scoped>
.multiple-image-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.image-item {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.image-controls {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  align-items: flex-end;
}

.reorder-buttons {
  display: flex;
  gap: 0.25rem;
}

.btn-reorder,
.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reorder:hover,
.btn-delete:hover {
  background: #f3f4f6;
}

.btn-delete {
  color: #dc2626;
  border-color: #dc2626;
}

.btn-delete:hover {
  background: #fee2e2;
}

.image-indicator {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.upload-area {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.uploading-state,
.upload-prompt {
  pointer-events: none;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #3b82f6;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

@media (max-width: 767px) {
  .image-list {
    grid-template-columns: 1fr;
  }
}
</style>
