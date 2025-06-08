<template>
  <div v-if="showPanel" class="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-96 overflow-hidden">
    <!-- ヘッダー -->
    <div class="bg-gray-800 text-white p-3 flex items-center justify-between">
      <h3 class="font-bold flex items-center gap-2">
        <ChartBarIcon class="h-5 w-5" />
        Firestore Metrics
      </h3>
      <button @click="togglePanel" class="hover:bg-gray-700 p-1 rounded">
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>
    
    <!-- メトリクス本体 -->
    <div class="overflow-y-auto max-h-80">
      <!-- サマリー -->
      <div class="p-4 border-b">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ metricsData.totals.reads }}</div>
            <div class="text-xs text-gray-600">Reads</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ metricsData.totals.writes }}</div>
            <div class="text-xs text-gray-600">Writes</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-red-600">{{ metricsData.totals.deletes }}</div>
            <div class="text-xs text-gray-600">Deletes</div>
          </div>
        </div>
        
        <!-- 推定コスト -->
        <div class="mt-3 p-2 bg-yellow-50 rounded text-center">
          <div class="text-sm text-yellow-800">
            推定コスト: ${{ estimatedCost.toFixed(4) }}
          </div>
          <div class="text-xs text-yellow-600">
            (Read: $0.036/100k, Write: $0.108/100k)
          </div>
        </div>
      </div>
      
      <!-- コレクション別 -->
      <div class="p-4 border-b">
        <h4 class="font-semibold mb-2 text-sm text-gray-700">コレクション別</h4>
        <div class="space-y-2">
          <div v-for="stat in metricsData.byCollection" :key="stat.collection" class="text-sm">
            <div class="font-medium text-gray-800">{{ stat.collection }}</div>
            <div class="flex gap-4 text-xs text-gray-600">
              <span v-if="stat.reads">R: {{ stat.reads }}</span>
              <span v-if="stat.writes">W: {{ stat.writes }}</span>
              <span v-if="stat.deletes">D: {{ stat.deletes }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近の操作 -->
      <div class="p-4">
        <h4 class="font-semibold mb-2 text-sm text-gray-700">最近の操作</h4>
        <div class="space-y-1 text-xs">
          <div v-for="op in metricsData.recentOperations.slice(0, 10)" :key="op.timestamp" 
               class="flex items-center justify-between py-1 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <span :class="{
                'text-blue-600': op.type === 'read',
                'text-green-600': op.type === 'write',
                'text-red-600': op.type === 'delete'
              }" class="font-medium uppercase">{{ op.type }}</span>
              <span class="text-gray-600">{{ op.count }} docs</span>
            </div>
            <div class="text-gray-500">{{ formatTime(op.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- フッター -->
    <div class="bg-gray-50 p-2 flex justify-between">
      <button @click="resetMetrics" class="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
        リセット
      </button>
      <button @click="downloadReport" class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
        レポート出力
      </button>
    </div>
  </div>
  
  <!-- 最小化時のボタン -->
  <button v-if="!showPanel" @click="togglePanel" 
          class="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700">
    <ChartBarIcon class="h-6 w-6" />
  </button>
</template>

<script setup lang="ts">
import { ChartBarIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const { getMetricsForUI, resetMetrics: resetMetricsData, showSummary } = useFirestoreMetrics()

const showPanel = ref(true)
const metricsData = ref(getMetricsForUI())

// 1秒ごとに更新
const updateInterval = setInterval(() => {
  metricsData.value = getMetricsForUI()
}, 1000)

// 推定コスト計算（簡易版）
const estimatedCost = computed(() => {
  const reads = metricsData.value.totals.reads
  const writes = metricsData.value.totals.writes
  const deletes = metricsData.value.totals.deletes
  
  // Firestore料金（東京リージョン）
  const readCost = (reads / 100000) * 0.036
  const writeCost = ((writes + deletes) / 100000) * 0.108
  
  return readCost + writeCost
})

const togglePanel = () => {
  showPanel.value = !showPanel.value
}

const resetMetrics = () => {
  if (confirm('メトリクスをリセットしますか？')) {
    resetMetricsData()
    metricsData.value = getMetricsForUI()
  }
}

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString('ja-JP')
}

const downloadReport = () => {
  showSummary()
  
  const report = {
    timestamp: new Date().toISOString(),
    totals: metricsData.value.totals,
    byCollection: metricsData.value.byCollection,
    estimatedCost: estimatedCost.value,
    operations: metricsData.value.recentOperations
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `firestore-metrics-${new Date().toISOString()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onUnmounted(() => {
  clearInterval(updateInterval)
})
</script>