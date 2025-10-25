# OGP機能デプロイ・検証ガイド

## デプロイ前チェックリスト

### 1. 環境設定確認
```bash
# Firebase プロジェクトの確認
firebase projects:list
firebase use --add  # 必要に応じてプロジェクト選択

# .firebaserc の確認
cat .firebaserc
```

### 2. 本番用設定の確認

#### firebase.json の確認
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/circles/**",
        "function": "ogp"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### functions/src/utils/ogpGenerator.ts の確認
```typescript
// 本番用のベースURLが正しく設定されているか確認
const baseUrl = 'https://geicacheck.web.app'; // 実際のドメインに変更
```

### 3. デプロイ実行

#### Cloud Functions のみデプロイ
```bash
# ビルド確認
npm run build --prefix functions

# Functions のみデプロイ
firebase deploy --only functions

# 特定の関数のみデプロイ
firebase deploy --only functions:ogp,functions:ogpHealthCheck
```

#### 完全デプロイ
```bash
# Hosting + Functions 同時デプロイ
firebase deploy --only hosting,functions
```

### 4. デプロイ後の動作確認

#### ヘルスチェック
```bash
curl https://asia-northeast1-your-project.cloudfunctions.net/ogpHealthCheck
```

#### Bot判定テスト
```bash
# 通常ユーザー（リダイレクトされるべき）
curl -I -H "User-Agent: Mozilla/5.0" https://your-domain.web.app/circles/circle-id

# Twitter Bot（OGP HTMLを受信するべき）
curl -H "User-Agent: Twitterbot/1.0" https://your-domain.web.app/circles/circle-id
```

## Twitter Card Validator での検証

### 1. Twitter Card Validator へのアクセス
https://cards-dev.twitter.com/validator

### 2. 検証用URL例
```
https://geicacheck.web.app/circles/実際のサークルID
```

### 3. 期待される表示内容

#### サマリーカード（大きな画像付き）
- **Card Type**: Summary Card with Large Image
- **Title**: [サークル名] ([ペンネーム])
- **Description**: サークル説明文（160文字以内）
- **Image**: サークルカット画像または デフォルト画像

#### メタ情報
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@geicacheck">
<meta name="twitter:title" content="[サークル名]">
<meta name="twitter:description" content="[説明文]">
<meta name="twitter:image" content="[画像URL]">

<meta property="og:title" content="[サークル名]">
<meta property="og:description" content="[説明文]">
<meta property="og:image" content="[画像URL]">
<meta property="og:url" content="[ページURL]">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ゲイカチェック">
```

### 4. トラブルシューティング

#### 「Unable to render Card preview」エラー
- URLが正しくアクセス可能か確認
- HTTPS で配信されているか確認
- robots.txt でクローラーがブロックされていないか確認

#### 画像が表示されない
- 画像URLが正しくアクセス可能か確認
- 画像サイズが Twitter の要件を満たしているか確認（推奨: 1200x675px、最小: 300x157px）
- 画像形式が対応形式か確認（JPG, PNG, WEBP, GIF）

#### 古いキャッシュが表示される
- 「Refresh cache」ボタンをクリック
- 数分待ってから再度検証

## パフォーマンス監視

### 1. Cloud Functions 監視
```bash
# ログ確認
firebase functions:log

# 特定関数のログ
firebase functions:log --only ogp
```

### 2. Firebase Console での確認
- [Firebase Console](https://console.firebase.google.com/) → Functions
- 実行回数、エラー率、実行時間を監視

### 3. 監視すべきメトリクス
- **実行時間**: 平均 < 3秒を目標
- **エラー率**: < 1% を目標
- **メモリ使用量**: 512MB 以内
- **同時実行数**: 必要に応じてスケーリング確認

## セキュリティ設定

### 1. Firestore Security Rules
```javascript
// firestore.rules で適切なアクセス制御を確認
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // OGP機能で使用するコレクションへの読み取りアクセス
    match /events/{eventId}/circles/{circleId} {
      allow read: if true; // OGP生成のため公開読み取り許可
    }
  }
}
```

### 2. Cloud Functions 環境変数
機密情報が含まれる場合は環境変数を使用：
```bash
firebase functions:config:set someservice.key="THE API KEY"
```

## 本番リリースフロー

### 1. ステージング環境での最終確認
- 全ての機能が正常動作することを確認
- パフォーマンステストを実行

### 2. 本番デプロイ
```bash
# 本番環境を選択
firebase use production

# デプロイ実行
firebase deploy --only functions,hosting

# デプロイ後確認
firebase functions:log --only ogp
```

### 3. リリース後監視
- Twitter Card Validator での検証
- 実際のソーシャルメディアでの共有テスト
- エラー率・レスポンス時間の監視

## ロールバック手順

緊急時のロールバック：
```bash
# 前のバージョンにロールバック
firebase functions:delete ogp
firebase deploy --only functions

# または Firebase Console から手動で無効化
```

## 注意事項

### 1. コールドスタート
- 初回実行時は数秒の遅延が発生する可能性
- 必要に応じて定期的な Warm-up 処理を検討

### 2. 料金
- Cloud Functions の実行回数に応じて課金
- 月間実行回数を監視し、予算アラートを設定

### 3. レート制限
- Twitter Card Validator の過度な使用は控える
- ソーシャルメディアのクローラーアクセス頻度を監視

---

**作成日:** 2025-10-25
**対象機能:** OGP対応 (GitHub Issue #32)
**環境:** Firebase Hosting + Cloud Functions