# GitHub Issue #32: OGP対応実装計画書

## 課題の理解

### 現状の問題
- サークル詳細ページ（`/circles/:id`）のリンクをTwitterでシェアする際、OGP（Open Graph Protocol）対応がされていない
- URLがそのまま表示され、Twitterカード表示されない
- サークルの告知としての効果が低い

### 技術的背景
- アプリケーション構成：Nuxt 3 SPAモード + Firebase Hosting
- SPAモードのため、静的なmetaタグでは対応できない
- 動的なOGPタグ生成が必要

## 技術的アプローチ

### 選択した方式：Cloud Functions + SSR
NuxtのSPAモード環境でOGP対応を実現するため、以下の方式を採用：

1. **Cloud Functions for Firebase**を使用してOGPタグを動的生成
2. **Bot判定ロジック**によりクローラー（Twitter、Facebook等）のみに対してサーバーサイドレンダリング
3. 通常のユーザーには既存のSPAを配信

### アーキテクチャ概要

```
Twitter Bot/Crawler Request
↓
Firebase Hosting
↓
Cloud Functions (SSR)
→ Firestore (Circle Data)
→ HTML + OGP Meta Tags
↓
Twitter Card Display

User Request
↓
Firebase Hosting
↓
Nuxt SPA (existing)
```

## 実装詳細

### 1. Cloud Functions セットアップ

#### 必要なファイル
- `functions/src/ogp.ts` - OGP生成ロジック
- `functions/src/index.ts` - エントリーポイント
- `functions/package.json` - 依存関係

#### OGPデータ構造
```typescript
interface OGPData {
  title: string           // サークル名
  description: string     // サークル説明
  image: string          // サークルカット画像URL
  url: string            // 詳細ページURL
  siteName: string       // サイト名
  type: string           // og:type (website/article)
}
```

### 2. Firebase Hosting リライト設定

#### `firebase.json` 修正
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/circles/**",
        "function": "ogp"
      }
    ]
  }
}
```

### 3. Bot判定ロジック

#### User-Agent判定対象
- Twitterbot
- facebookexternalhit
- LinkedInBot
- Slackbot
- その他主要なソーシャルメディアクローラー

### 4. Firestore データ取得

#### 必要なCircleデータ
- `circleName` - OGタイトル用
- `description` - OG説明文用
- `circleCutImageUrl` - OG画像用
- `eventId` - イベント情報取得用

### 5. HTMLテンプレート

#### 生成するOGPタグ
```html
<meta property="og:title" content="{サークル名}" />
<meta property="og:description" content="{サークル説明}" />
<meta property="og:image" content="{サークルカット画像URL}" />
<meta property="og:url" content="{詳細ページURL}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="ゲイカチェック" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{サークル名}" />
<meta name="twitter:description" content="{サークル説明}" />
<meta name="twitter:image" content="{サークルカット画像URL}" />
```

## 実装手順

### フェーズ1: 基盤構築
1. Cloud Functions プロジェクトのセットアップ
2. 必要な依存関係のインストール
3. TypeScript設定とビルド環境構築

### フェーズ2: OGP生成機能
1. Bot判定ロジックの実装
2. Firestoreからのデータ取得機能
3. HTMLテンプレート生成機能
4. エラーハンドリング実装

### フェーズ3: 統合とテスト
1. Firebase Hosting リライト設定
2. ローカル環境でのテスト
3. デプロイとTwitterカード検証
4. パフォーマンス最適化

### フェーズ4: 運用対応
1. ログ監視設定
2. エラー通知設定
3. キャッシュ戦略の検討
4. ドキュメント整備

## 考慮事項

### パフォーマンス
- Cloud Functionsのコールドスタート対策
- Firestoreクエリの最適化
- 画像URLの妥当性チェック
- レスポンス時間の監視

### SEO・アクセシビリティ
- 適切なfallback処理
- 画像が存在しない場合のデフォルト画像
- 説明文の最適な長さ調整

### セキュリティ
- 不正なパラメータへの対応
- Rate limiting の検討
- CORS設定の確認

### 運用・保守
- エラーログの監視
- Twitter Card Validator での定期チェック
- 新しいBot User-Agentへの対応

## 期待される効果

### 機能改善
- TwitterでのURL共有時にカード表示
- サークル情報の視覚的な訴求力向上
- ソーシャルメディアでの拡散効果向上

### 技術的メリット
- SEO効果の向上
- ソーシャルメディア最適化
- 将来的なOGP機能拡張の基盤構築

## リスク・制約

### 技術リスク
- Cloud Functionsのコスト増加
- レスポンス時間の増加可能性
- Firebase Hosting設定の複雑化

### 運用リスク
- Bot判定ロジックの誤認識
- 画像URLの変更によるOGP表示問題
- ソーシャルメディアのクローラー仕様変更

## 成功指標

### 定量的指標
- Twitter Card Validatorでの検証通過
- OGP対応ページのソーシャル共有数向上
- Cloud Functionsの応答速度（目標: 3秒以内）

### 定性的指標
- ユーザーからのフィードバック改善
- サークル告知効果の向上
- 開発・運用効率の維持

## 実装スケジュール

### 準備期間（1週間）
- 技術調査とプロトタイプ作成
- Cloud Functions環境構築

### 開発期間（2週間）
- OGP生成機能実装
- テスト環境での動作確認

### テスト期間（1週間）
- 統合テストとパフォーマンステスト
- Twitter Card Validator検証

### リリース（1日）
- 本番デプロイ
- 監視設定とドキュメント更新

---

**作成日:** 2025-10-25
**作成者:** Claude Code
**対象Issue:** GitHub Issue #32
**実装方式:** Cloud Functions + Bot判定によるSSR