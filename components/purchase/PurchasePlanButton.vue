<template>
  <div class="purchase-plan-button">
    <button
      v-if="!isPlanned"
      @click="handleAdd"
      :disabled="loading"
      style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;"
      :style="{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }"
      onmouseover="this.style.backgroundColor='#059669'"
      onmouseout="this.style.backgroundColor='#10b981'"
    >
      <ShoppingCartIcon class="h-4 w-4" />
      <span>購入予定に追加</span>
    </button>

    <div v-else style="display: flex; align-items: center; gap: 0.5rem;">
      <!-- 数量セレクター -->
      <div style="display: flex; align-items: center; background: #f3f4f6; border-radius: 0.375rem; overflow: hidden;">
        <button
          @click="handleDecrease"
          :disabled="loading || quantity <= 1"
          style="padding: 0.5rem; background: transparent; border: none; cursor: pointer; color: #6b7280; transition: all 0.2s;"
          :style="{ opacity: loading || quantity <= 1 ? 0.5 : 1, cursor: loading || quantity <= 1 ? 'not-allowed' : 'pointer' }"
          onmouseover="this.style.backgroundColor='#e5e7eb'"
          onmouseout="this.style.backgroundColor='transparent'"
        >
          <MinusIcon class="h-4 w-4" />
        </button>
        
        <span style="padding: 0 1rem; font-weight: 600; color: #111827; min-width: 3rem; text-align: center;">
          {{ quantity }}
        </span>
        
        <button
          @click="handleIncrease"
          :disabled="loading"
          style="padding: 0.5rem; background: transparent; border: none; cursor: pointer; color: #6b7280; transition: all 0.2s;"
          :style="{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }"
          onmouseover="this.style.backgroundColor='#e5e7eb'"
          onmouseout="this.style.backgroundColor='transparent'"
        >
          <PlusIcon class="h-4 w-4" />
        </button>
      </div>

      <!-- 削除ボタン -->
      <button
        @click="handleRemove"
        :disabled="loading"
        style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s;"
        :style="{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }"
        onmouseover="this.style.backgroundColor='#dc2626'"
        onmouseout="this.style.backgroundColor='#ef4444'"
        title="購入予定から削除"
      >
        <TrashIcon class="h-4 w-4" />
      </button>
    </div>

    <!-- 価格表示 -->
    <div v-if="isPlanned && showPrice" style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
      小計: ¥{{ (price * quantity).toLocaleString() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import type { PurchasePlan } from '~/types'

interface Props {
  circleId: string
  itemId: string
  price: number
  circleName?: string
  itemName?: string
  showPrice?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPrice: true
})

const emit = defineEmits<{
  updated: [plan: PurchasePlan | null]
}>()

// Composables
const { currentEvent } = useEvents()
const {
  addToPurchasePlan,
  removeFromPurchasePlan,
  updatePurchaseQuantity,
  getPurchasePlanByItem
} = usePurchasePlans()

// State
const loading = ref(false)
const isPlanned = ref(false)
const quantity = ref(1)
const planId = ref<string | null>(null)

// 購入予定の状態を確認
const checkPlanStatus = async () => {
  if (!currentEvent.value) return

  try {
    const plan = await getPurchasePlanByItem(
      props.circleId,
      props.itemId,
      currentEvent.value.id
    )

    if (plan) {
      isPlanned.value = true
      quantity.value = plan.quantity
      planId.value = plan.id
    } else {
      isPlanned.value = false
      quantity.value = 1
      planId.value = null
    }
  } catch (error) {
    console.error('購入予定状態確認エラー:', error)
  }
}

// 購入予定に追加
const handleAdd = async () => {
  if (!currentEvent.value || loading.value) return

  try {
    loading.value = true

    const id = await addToPurchasePlan(
      props.circleId,
      props.itemId,
      currentEvent.value.id,
      props.price,
      1,
      props.circleName,
      props.itemName
    )

    planId.value = id
    isPlanned.value = true
    quantity.value = 1

    const plan = await getPurchasePlanByItem(
      props.circleId,
      props.itemId,
      currentEvent.value.id
    )
    emit('updated', plan)
  } catch (error) {
    console.error('購入予定追加エラー:', error)
    alert('購入予定の追加に失敗しました')
  } finally {
    loading.value = false
  }
}

// 購入予定から削除
const handleRemove = async () => {
  if (!planId.value || loading.value) return

  try {
    loading.value = true

    await removeFromPurchasePlan(planId.value)

    isPlanned.value = false
    quantity.value = 1
    planId.value = null

    emit('updated', null)
  } catch (error) {
    console.error('購入予定削除エラー:', error)
    alert('購入予定の削除に失敗しました')
  } finally {
    loading.value = false
  }
}

// 数量を増やす
const handleIncrease = async () => {
  if (!planId.value || loading.value) return

  try {
    loading.value = true
    const newQuantity = quantity.value + 1

    await updatePurchaseQuantity(planId.value, newQuantity)
    quantity.value = newQuantity

    const plan = await getPurchasePlanByItem(
      props.circleId,
      props.itemId,
      currentEvent.value!.id
    )
    emit('updated', plan)
  } catch (error) {
    console.error('数量更新エラー:', error)
  } finally {
    loading.value = false
  }
}

// 数量を減らす
const handleDecrease = async () => {
  if (!planId.value || loading.value || quantity.value <= 1) return

  try {
    loading.value = true
    const newQuantity = quantity.value - 1

    await updatePurchaseQuantity(planId.value, newQuantity)
    quantity.value = newQuantity

    const plan = await getPurchasePlanByItem(
      props.circleId,
      props.itemId,
      currentEvent.value!.id
    )
    emit('updated', plan)
  } catch (error) {
    console.error('数量更新エラー:', error)
  } finally {
    loading.value = false
  }
}

// 初期化
onMounted(() => {
  checkPlanStatus()
})

// イベント変更時に再チェック
watch(() => currentEvent.value?.id, () => {
  checkPlanStatus()
})
</script>

<style scoped>
.purchase-plan-button {
  display: inline-block;
}

/* ボタンのホバーエフェクト */
button:not(:disabled) {
  transition: all 0.2s ease;
}

button:not(:disabled):active {
  transform: scale(0.95);
}

/* 数量表示のアニメーション */
span {
  transition: all 0.2s ease;
}
</style>