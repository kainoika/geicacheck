# インタラクティブマップ機能 実装計画

## 📋 現状分析

### 既存の実装状況
- ✅ **EventMapコンポーネント**: ズーム・パン機能の基本実装済み
- ✅ **マップページ**: ブックマーク管理とサイドバー実装済み  
- ✅ **SVGマップ**: geika31.svg、geika32.svg ファイル存在
- ✅ **ブックマーク表示**: ピン表示とポップアップ機能
- ✅ **PC/タブレット対応**: 基本的なレスポンシブデザイン

### 不足している機能・改善点
- ❌ **タッチ操作**: スマートフォンでのピンチズーム・タッチパン
- ❌ **イベント自動切り替え**: 現在はgeika32固定
- ❌ **座標マッピング**: SVG座標とサークル位置の正確性に課題
- ❌ **パフォーマンス最適化**: 大量サークル表示時の処理
- ❌ **アクセシビリティ**: キーボード操作、スクリーンリーダー対応

## 🎯 要件・仕様

### 基本要件
1. **ブックマーク表示**: ブックマークしたサークルの配置を会場マップで確認
2. **ズーム・パン機能**: 詳細な位置まで把握できる操作性
3. **マルチデバイス対応**: スマートフォン、PC、タブレット対応
4. **イベント対応**: 開催イベントごとに配置図・位置を切り替え
5. **SVGベース**: 配置図はSVGデータを使用

### 詳細機能要件
- **タッチ操作**: ピンチズーム、タッチパン、慣性スクロール
- **キーボード操作**: 矢印キー移動、+/-キーズーム
- **アクセシビリティ**: スクリーンリーダー対応、高コントラストモード
- **パフォーマンス**: 仮想化、遅延読み込み、キャッシュ最適化

## 🏗️ 実装計画

### Phase 1: タッチ操作対応 (優先度: 高)
**期間: 1-2日**

#### 1.1 タッチイベント処理の実装
```typescript
// composables/useTouch.ts
export const useTouch = () => {
  const handleTouchStart = (event: TouchEvent) => {
    // マルチタッチ検出
    // 初期位置記録
  }
  
  const handleTouchMove = (event: TouchEvent) => {
    // ピンチズーム計算
    // タッチパン処理
  }
  
  const handleTouchEnd = (event: TouchEvent) => {
    // 慣性スクロール開始
  }
}
```

#### 1.2 EventMapコンポーネント拡張
```vue
<!-- components/map/EventMap.vue -->
<template>
  <div 
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove" 
    @touchend="handleTouchEnd"
    @gesturestart.prevent
    @gesturechange.prevent
    @gestureend.prevent
  >
    <!-- 既存のマップコンテンツ -->
  </div>
</template>
```

#### 1.3 慣性スクロール実装
```typescript
// utils/momentum.ts
export class MomentumScroll {
  private velocity = { x: 0, y: 0 }
  private friction = 0.95
  
  public startMomentum() {
    // requestAnimationFrame でスムーズな減速
  }
}
```

### Phase 2: イベント自動切り替え (優先度: 高)
**期間: 1日**

#### 2.1 イベント対応マップローダー
```typescript
// composables/useEventMap.ts
export const useEventMap = () => {
  const mapCache = new Map<string, string>()
  
  const loadEventMap = async (eventId: string): Promise<string> => {
    if (mapCache.has(eventId)) {
      return mapCache.get(eventId)!
    }
    
    const response = await fetch(`/map-${eventId}.svg`)
    const svgContent = await response.text()
    mapCache.set(eventId, svgContent)
    return svgContent
  }
}
```

#### 2.2 座標マッピング設定
```typescript
// types/map.ts
export interface EventMapConfig {
  eventId: string
  svgPath: string
  coordinateMapping: {
    [blockId: string]: {
      x: number
      y: number
      width: number
      height: number
    }
  }
}

// data/mapConfigs.ts
export const mapConfigs: EventMapConfig[] = [
  {
    eventId: 'geika-31',
    svgPath: '/map-geika31.svg',
    coordinateMapping: {
      // SVGから実際の座標を抽出して設定
    }
  },
  {
    eventId: 'geika-32', 
    svgPath: '/map-geika32.svg',
    coordinateMapping: {
      // 現在のハードコードされた座標を整理
    }
  }
]
```

### Phase 3: 座標マッピング精度向上 (優先度: 中)
**期間: 1-2日**

#### 3.1 SVG解析ユーティリティ
```typescript
// utils/svgParser.ts
export class SVGParser {
  public extractCirclePositions(svgContent: string): CirclePosition[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    
    // data-block, data-number 属性から座標を抽出
    const circleElements = doc.querySelectorAll('[data-block][data-number]')
    
    return Array.from(circleElements).map(element => ({
      block: element.getAttribute('data-block')!,
      number: element.getAttribute('data-number')!,
      x: parseFloat(element.getAttribute('x') || '0'),
      y: parseFloat(element.getAttribute('y') || '0'),
      width: parseFloat(element.getAttribute('width') || '30'),
      height: parseFloat(element.getAttribute('height') || '25')
    }))
  }
}
```

#### 3.2 動的座標マッピング
```typescript
// composables/useCircleMapping.ts
export const useCircleMapping = () => {
  const getCirclePosition = (circle: Circle, eventId: string): Position => {
    const config = getMapConfig(eventId)
    const blockKey = `${circle.placement.block}-${circle.placement.number1}`
    
    return config.coordinateMapping[blockKey] || getDefaultPosition()
  }
}
```

### Phase 4: パフォーマンス最適化 (優先度: 中)
**期間: 1日**

#### 4.1 仮想化によるピン表示最適化
```typescript
// composables/useVirtualPins.ts
export const useVirtualPins = (pins: Ref<Pin[]>, viewport: Ref<Viewport>) => {
  const visiblePins = computed(() => {
    return pins.value.filter(pin => 
      isInViewport(pin, viewport.value)
    )
  })
  
  return { visiblePins }
}
```

#### 4.2 マップキャッシュシステム
```typescript
// utils/mapCache.ts
export class MapCache {
  private cache = new Map<string, CachedMap>()
  private maxSize = 5
  
  public async getMap(eventId: string): Promise<string> {
    // LRUキャッシュ実装
  }
}
```

### Phase 5: アクセシビリティ対応 (優先度: 低)
**期間: 1日**

#### 5.1 キーボード操作
```typescript
// composables/useKeyboardNavigation.ts
export const useKeyboardNavigation = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': panUp(); break
      case 'ArrowDown': panDown(); break
      case 'ArrowLeft': panLeft(); break
      case 'ArrowRight': panRight(); break
      case '+': case '=': zoomIn(); break
      case '-': zoomOut(); break
      case '0': resetZoom(); break
    }
  }
}
```

#### 5.2 スクリーンリーダー対応
```vue
<template>
  <div 
    role="application"
    aria-label="会場マップ"
    :aria-describedby="mapDescriptionId"
  >
    <div :id="mapDescriptionId" class="sr-only">
      ブックマークしたサークルの配置を確認できる会場マップです。
      矢印キーで移動、+/-キーでズームできます。
    </div>
    
    <!-- ピン要素にaria-label追加 -->
    <circle 
      v-for="pin in visiblePins"
      :aria-label="`${pin.circle.circleName} ${formatPlacement(pin.circle.placement)}`"
      role="button"
      tabindex="0"
    />
  </div>
</template>
```

## 📱 レスポンシブ対応詳細

### モバイル最適化
```vue
<template>
  <div class="map-container">
    <!-- モバイル用タッチガイド -->
    <div class="mobile-guide md:hidden">
      <div class="guide-item">👆 タップでサークル選択</div>
      <div class="guide-item">🤏 ピンチでズーム</div>
      <div class="guide-item">👋 ドラッグで移動</div>
    </div>
    
    <!-- デスクトップ用マウスガイド -->
    <div class="desktop-guide hidden md:block">
      <div class="guide-item">🖱️ マウスホイールでズーム</div>
      <div class="guide-item">✋ ドラッグで移動</div>
      <div class="guide-item">📍 ピンクリックで詳細</div>
    </div>
  </div>
</template>
```

### ビューポート別最適化
```typescript
// composables/useResponsiveMap.ts
export const useResponsiveMap = () => {
  const isMobile = computed(() => window.innerWidth < 768)
  const isTablet = computed(() => 
    window.innerWidth >= 768 && window.innerWidth < 1024
  )
  
  const mapConfig = computed(() => ({
    pinSize: isMobile.value ? 12 : 10,
    zoomSensitivity: isMobile.value ? 0.3 : 0.1,
    panSensitivity: isMobile.value ? 1.2 : 1.0
  }))
  
  return { mapConfig }
}
```

## 🧪 テスト計画

### 単体テスト
```typescript
// tests/composables/useTouch.test.ts
describe('useTouch', () => {
  it('should handle pinch zoom correctly', () => {
    // ピンチズームのテスト
  })
  
  it('should detect pan gestures', () => {
    // パンジェスチャーのテスト
  })
})
```

### 統合テスト
```typescript
// tests/components/EventMap.test.ts
describe('EventMap', () => {
  it('should render bookmarked circles correctly', () => {
    // ブックマーク表示のテスト
  })
  
  it('should handle event switching', () => {
    // イベント切り替えのテスト
  })
})
```

## 🚀 実装優先順位

### 必須機能 (Phase 1-2)
1. **タッチ操作対応** - スマートフォンユーザビリティの向上
2. **イベント自動切り替え** - 複数イベント対応

### 重要機能 (Phase 3-4)  
3. **座標マッピング精度向上** - 正確なサークル位置表示
4. **パフォーマンス最適化** - 大量データ処理

### 改善機能 (Phase 5)
5. **アクセシビリティ対応** - インクルーシブデザイン

## 📊 技術仕様

### 使用技術
- **フロントエンド**: Vue 3 Composition API, TypeScript
- **タッチ処理**: Touch Events API, Gesture Events
- **SVG操作**: DOM Parser, SVG API
- **キャッシュ**: Map, WeakMap, IndexedDB
- **アニメーション**: RequestAnimationFrame, CSS Transforms

### パフォーマンス目標
- **初期読み込み**: 2秒以内
- **ズーム応答性**: 60fps
- **パン応答性**: 16ms以内
- **メモリ使用量**: 50MB以下

## 🔄 実装後の運用

### モニタリング
- ユーザー操作の分析
- パフォーマンスメトリクス監視
- エラーレート追跡

### メンテナンス
- SVGファイルの更新手順
- 座標マッピングの調整方法
- 新イベント追加のワークフロー

---

**推定実装期間**: 5-7日  
**リリース目標**: Phase 1-2を優先実装

この計画により、既存のマップ機能を大幅に強化し、全デバイスで快適なユーザー体験を提供できます。