<template>
  <div class="budget-summary">
    <!-- ローディング状態 -->
    <div v-if="loading" style="text-align: center; padding: 2rem;">
      <div style="color: #6b7280;">予算情報を読み込み中...</div>
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; color: #dc2626; margin-bottom: 0.5rem;">
        <ExclamationTriangleIcon class="h-5 w-5" />
        <span style="font-weight: 600;">エラー</span>
      </div>
      <p style="color: #991b1b; font-size: 0.875rem; margin: 0;">{{ error }}</p>
    </div>

    <!-- 予算サマリー表示 -->
    <div v-else>
      <!-- ヘッダー -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <CurrencyYenIcon class="h-5 w-5" />
          {{ eventName }} 予算管理
        </h3>
        
        <button
          @click="refreshBudget"
          :disabled="loading"
          style="padding: 0.5rem; border: 1px solid #d1d5db; background: white; border-radius: 0.375rem; cursor: pointer; color: #6b7280; transition: all 0.2s;"
          :style="{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }"
          title="予算情報を更新"
        >
          <ArrowPathIcon class="h-4 w-4" />
        </button>
      </div>

      <!-- 予算カード -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <!-- 合計予算 -->
        <div style="background: linear-gradient(135deg, #ec4899, #f472b6); color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-size: 0.875rem; opacity: 0.9;">合計予算</span>
            <BanknotesIcon class="h-5 w-5" style="opacity: 0.7;" />
          </div>
          <div style="font-size: 1.875rem; font-weight: 700;">
            ¥{{ statistics.totalPrice.toLocaleString() }}
          </div>
          <div style="font-size: 0.75rem; opacity: 0.9; margin-top: 0.25rem;">
            {{ statistics.totalItems }}点
          </div>
        </div>

        <!-- 平均単価 -->
        <div style="background: white; border: 1px solid #e5e7eb; padding: 1.5rem; border-radius: 0.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-size: 0.875rem; color: #6b7280;">平均単価</span>
            <CalculatorIcon class="h-5 w-5 text-gray-400" />
          </div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #111827;">
            ¥{{ statistics.averagePrice.toLocaleString() }}
          </div>
          <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
            最低 ¥{{ statistics.minPrice }} / 最高 ¥{{ statistics.maxPrice }}
          </div>
        </div>

        <!-- サークル数 -->
        <div style="background: white; border: 1px solid #e5e7eb; padding: 1.5rem; border-radius: 0.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-size: 0.875rem; color: #6b7280;">購入予定サークル</span>
            <UserGroupIcon class="h-5 w-5 text-gray-400" />
          </div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #111827;">
            {{ statistics.uniqueCircles }}
          </div>
          <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
            サークル
          </div>
        </div>
      </div>

      <!-- サークル別内訳 -->
      <div v-if="showDetails && budgetSummary?.byCircle.length" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem;">
        <h4 style="font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
          サークル別内訳
        </h4>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div
            v-for="circle in budgetSummary.byCircle"
            :key="circle.circleId"
            style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #f9fafb; border-radius: 0.375rem;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 500; color: #111827;">
                {{ circle.circleName }}
              </div>
              <div style="font-size: 0.75rem; color: #6b7280;">
                {{ circle.items }}点
              </div>
            </div>
            <div style="font-weight: 600; color: #111827;">
              ¥{{ circle.totalPrice.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- アクション -->
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button
          @click="showDetails = !showDetails"
          style="flex: 1; padding: 0.75rem 1rem; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer; font-weight: 500; transition: all 0.2s;"
          onmouseover="this.style.backgroundColor='#f9fafb'"
          onmouseout="this.style.backgroundColor='white'"
        >
          {{ showDetails ? '詳細を隠す' : '詳細を表示' }}
        </button>
        
        <button
          @click="exportCSV"
          :disabled="!statistics.totalItems"
          style="padding: 0.75rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;"
          :style="{ opacity: !statistics.totalItems ? 0.5 : 1, cursor: !statistics.totalItems ? 'not-allowed' : 'pointer' }"
          onmouseover="this.style.backgroundColor='#059669'"
          onmouseout="this.style.backgroundColor='#10b981'"
        >
          <DocumentArrowDownIcon class="h-4 w-4" />
          CSVエクスポート
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CurrencyYenIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CalculatorIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

interface Props {
  eventId: string
  eventName?: string
}

const props = withDefaults(defineProps<Props>(), {
  eventName: 'イベント'
})

// Composables
const { user, isAuthenticated } = useAuth()
const { getBudgetSummary, getBudgetStatistics, exportBudgetAsCSV } = useBudget()
const { getUserPurchasePlans } = usePurchasePlans()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const showDetails = ref(false)
const budgetSummary = ref<any>(null)
const statistics = ref({
  totalPrice: 0,
  totalItems: 0,
  averagePrice: 0,
  uniqueCircles: 0,
  minPrice: 0,
  maxPrice: 0
})

// 予算情報を取得
const loadBudget = async () => {
  if (!isAuthenticated.value) {
    error.value = 'ログインが必要です'
    return
  }

  try {
    loading.value = true
    error.value = null

    // 購入予定を取得
    const plans = await getUserPurchasePlans(props.eventId)
    
    // 統計を計算
    statistics.value = getBudgetStatistics(plans)
    
    // サマリーを取得
    budgetSummary.value = await getBudgetSummary(props.eventId)
  } catch (err) {
    console.error('予算情報取得エラー:', err)
    error.value = '予算情報の取得に失敗しました'
  } finally {
    loading.value = false
  }
}

// 予算情報を更新
const refreshBudget = async () => {
  await loadBudget()
}

// CSVエクスポート
const exportCSV = async () => {
  try {
    const csv = await exportBudgetAsCSV(props.eventId)
    if (!csv) {
      alert('エクスポートするデータがありません')
      return
    }

    // ダウンロード処理
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `budget_${props.eventId}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('CSVエクスポートエラー:', err)
    alert('CSVエクスポートに失敗しました')
  }
}

// 初期化
onMounted(() => {
  loadBudget()
})

// イベントID変更時に再読み込み
watch(() => props.eventId, () => {
  loadBudget()
})
</script>

<style scoped>
.budget-summary {
  width: 100%;
}

/* カードのホバーエフェクト */
.budget-summary > div > div > div {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.budget-summary > div > div > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* ボタンアニメーション */
button {
  transition: all 0.2s ease;
}

button:not(:disabled):active {
  transform: scale(0.95);
}

/* 数値のアニメーション */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.budget-summary div[style*="font-size: 1.875rem"],
.budget-summary div[style*="font-size: 1.5rem"] {
  animation: fadeIn 0.5s ease-out;
}
</style>