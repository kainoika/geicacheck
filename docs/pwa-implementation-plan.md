# PWA対応実装計画書

## 1. 現状分析

### 現在のアプリケーション構成
- **Nuxt 3 SPA** - クライアントサイドレンダリング
- **Firebase** - バックエンドサービス（Auth、Firestore、Storage）
- **Vue 3 Composition API** - フロントエンド
- **Tailwind CSS** - スタイリング
- **モバイル最適化済み** - タッチ操作、レスポンシブデザイン

### PWA要件に対する現状
✅ **HTTPS対応済み** - Firebase Hostingで自動提供  
✅ **レスポンシブデザイン** - モバイル最適化済み  
✅ **基本メタ情報** - title、description、theme-color設定済み  
❌ **Web App Manifest** - 未実装  
❌ **Service Worker** - 未実装  
❌ **オフライン対応** - 未実装  
❌ **アプリアイコン** - favicon.icoのみ  
❌ **インストール促進** - 未実装  

## 2. PWA実装計画

### Phase 1: 基本PWA設定 【優先度: 高】

#### 2.1 Nuxt PWAモジュール導入
```bash
npm install @nuxtjs/pwa@next
```

#### 2.2 Web App Manifest作成
- アプリ名: "geica check!"
- 短縮名: "geica"
- テーマカラー: #FF69B4（現在のピンク）
- 背景色: #f8f9fa
- 表示モード: standalone
- 画面向き: portrait-primary
- 開始URL: /

#### 2.3 アプリアイコン作成
**必要なサイズ:**
- 192x192px (Android Chrome)
- 512x512px (Android Chrome)
- 180x180px (iOS Safari)
- 152x152px (iPad)
- 120x120px (iPhone)
- 76x76px (iPad非Retina)

**デザインコンセプト:**
- アイカツ！テーマのピンク基調
- "geica"文字またはカードアイコン
- 丸角デザイン（iOS対応）

### Phase 2: Service Worker実装 【優先度: 高】

#### 2.1 キャッシュ戦略
**Network First (ネットワーク優先):**
- `/api/*` - Firebase API呼び出し
- マップSVGファイル - 最新版取得優先

**Cache First (キャッシュ優先):**
- 静的アセット（CSS、JS、画像）
- フォント（Google Fonts）

**Stale While Revalidate:**
- アプリケーションシェル
- ページコンポーネント

#### 2.2 オフライン対応
**オフライン時に利用可能な機能:**
- ブックマークリストの閲覧
- イベントマップの表示
- 基本的なナビゲーション
- キャッシュされたサークル情報

**オフライン時の制限:**
- 新規ブックマーク追加
- リアルタイム同期
- ログイン/ログアウト
- 画像の新規読み込み

### Phase 3: インストール促進とUX向上 【優先度: 中】

#### 3.1 インストール促進
- **Install Promptの実装**
  - ユーザーが複数回サイトを訪問
  - 5分以上の滞在時間
  - ブックマーク機能を使用

#### 3.2 UX改善
- **オフライン インジケーター**
- **更新通知**
- **バックグラウンド同期**（ブックマーク）
- **プッシュ通知**（イベント更新）

### Phase 4: 高度なPWA機能 【優先度: 低】

#### 4.1 Background Sync
- オフライン時のブックマーク変更をキュー
- オンライン復帰時に自動同期

#### 4.2 Push Notifications
- 新しいイベント開催通知
- サークル情報更新通知
- 個人設定でON/OFF可能

#### 4.3 Share Target API
- 他のアプリからサークル情報を共有
- URLスキーム: `web+geica://circle/{id}`

## 3. 技術実装詳細

### 3.1 ファイル構成
```
public/
├── icons/
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── apple-touch-icon-180x180.png
├── manifest.json
└── sw.js (自動生成)

nuxt.config.ts (PWA設定追加)
```

### 3.2 設定例
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/pwa'],
  pwa: {
    meta: {
      name: 'geica check!',
      description: 'アイカツ！同人イベントサークルチェックアプリ',
      theme_color: '#FF69B4'
    },
    manifest: {
      name: 'geica check!',
      short_name: 'geica',
      display: 'standalone',
      orientation: 'portrait-primary'
    },
    workbox: {
      enabled: true,
      offlineStrategy: 'NetworkFirst'
    }
  }
})
```

## 4. 実装スケジュール

### Week 1: 基本設定
- [ ] PWAモジュール導入
- [ ] アプリアイコン作成・設置
- [ ] Web App Manifest設定

### Week 2: Service Worker
- [ ] キャッシュ戦略実装
- [ ] オフライン対応
- [ ] テスト・デバッグ

### Week 3: UX向上
- [ ] インストール促進UI
- [ ] オフライン表示
- [ ] 更新通知

### Week 4: 高度機能（オプション）
- [ ] Background Sync
- [ ] Push Notifications
- [ ] 最終テスト・調整

## 5. 成功指標

### 技術指標
- Lighthouse PWA スコア: 90+
- Service Worker登録率: 80%+
- キャッシュヒット率: 70%+

### ユーザー指標
- アプリインストール率: 20%+
- 再訪問率向上: 15%+
- セッション時間向上: 10%+

### パフォーマンス指標
- 初回読み込み時間: 3秒以内
- リピート訪問読み込み: 1秒以内
- オフライン機能利用率: 5%+

## 6. 実装時の注意点

### 6.1 Firebase統合での考慮事項
- Firestore offline persistenceとの競合回避
- Firebase Auth状態の適切なキャッシュ
- Storage画像の効率的なキャッシュ戦略

### 6.2 既存機能への影響
- ログシステム(`useLogger`)との連携
- 既存のモバイル最適化との競合回避
- パフォーマンステストの更新

### 6.3 セキュリティ考慮事項
- Service Worker経由でのAPIアクセス制御
- オフラインデータの適切な暗号化
- 認証トークンのキャッシュ戦略

## 7. テスト計画

### 7.1 自動テスト
- PWA Lighthouse監査の自動化
- Service Worker機能テスト
- オフライン機能テスト

### 7.2 手動テスト
- 各ブラウザでのインストールテスト
- オフライン→オンライン復帰テスト
- 異なるデバイスでの動作確認

### 7.3 ユーザビリティテスト
- インストール促進UIの効果測定
- オフライン機能の使いやすさ評価
- パフォーマンス体感調査

## 8. 運用・保守

### 8.1 監視項目
- Service Worker更新エラー率
- キャッシュサイズとヒット率
- インストール・アンインストール率

### 8.2 更新戦略
- Service Worker更新の段階的ロールアウト
- キャッシュ戦略の継続的改善
- ユーザーフィードバックの反映

---

**作成日**: 2025-06-28  
**作成者**: Claude  
**バージョン**: 1.0  
**ステータス**: 計画段階  