# データ投入スクリプト

## 概要

このディレクトリには、geica check!アプリのFirestoreデータベースにデータを投入するためのスクリプトが含まれています。

## 前提条件

### 1. 環境変数の設定

`.env`ファイルを作成し、Firebase設定を追加してください：

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 2. Firebase プロジェクトの準備

- Firebase Console でプロジェクトを作成
- Firestore Database を有効化
- 認証設定（Twitter認証など）

## スクリプト一覧

### 1. イベントデータの投入

```bash
npm run seed:events
```

**機能:**
- 基本的なイベントデータ（geica-1, geica-2, geica-3）をFirestoreに投入
- イベント統計情報の初期化

**投入されるデータ:**
- `events` コレクション: イベント基本情報
- `eventStats` コレクション: 統計情報

### 2. サークルデータの投入

```bash
npm run import:circles
```

**機能:**
- `data/geica32-circle.json`のサークルデータをFirestoreに投入
- JSONデータをFirestore形式に変換して保存

**投入されるデータ:**
- `circles` コレクション: サークル情報（140件）

**データ変換内容:**
- `genre`: 文字列 → 配列形式
- `placement`: `block` + `number1` + `number2` → 構造化
- `contact`: Twitter/Pixiv/お品書きURL → 構造化
- `isAdult`, `isPublic`: 文字列 → boolean

### 3. マルチイベント対応移行

```bash
npm run migrate:multi-event
```

**機能:**
- 既存データをマルチイベント対応形式に移行
- ブックマークにeventIdを追加

## 実行順序

初回セットアップ時は以下の順序で実行してください：

```bash
# 1. イベントデータを投入
npm run seed:events

# 2. サークルデータを投入
npm run import:circles

# 3. 必要に応じてマルチイベント移行
npm run migrate:multi-event
```

## データ構造

### Events コレクション

```typescript
{
  id: string              // 'geica-1', 'geica-2', etc.
  name: string           // '第1回 芸能人はカードが命！'
  shortName: string      // '芸カ1'
  eventDate: Date        // イベント開催日
  venue: {
    name: string         // 会場名
    address: string      // 住所
    accessInfo: string   // アクセス情報
  }
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  isDefault: boolean     // 現在のメインイベント
  // ...
}
```

### Circles コレクション

```typescript
{
  id: string                    // 'geica32-1', 'geica32-2', etc.
  circleName: string           // サークル名
  circleKana: string           // サークル名（カナ）
  genre: string[]              // ジャンル配列
  placement: {
    block: string              // ブロック（ア、カ、ド）
    number: string             // 番号（01、02-03など）
  }
  contact: {
    twitter: string            // TwitterURL
    pixiv: string              // PixivURL
    oshinaUrl: string          // お品書きURL
  }
  isAdult: boolean             // 成人向けフラグ
  isPublic: boolean            // 公開フラグ
  eventId: string              // 'geica-32'
  // ...
}
```

## トラブルシューティング

### 認証エラー

```
Error: Firebase Auth is not initialized
```

**解決方法:**
- `.env`ファイルの設定を確認
- Firebase プロジェクトの設定を確認

### レート制限エラー

```
Error: Quota exceeded
```

**解決方法:**
- スクリプト内で自動的に待機処理を実装済み
- 大量データの場合は分割実行を検討

### データ重複エラー

```
Error: Document already exists
```

**解決方法:**
- 既存データを削除してから再実行
- または `setDoc` の `merge: true` オプションを使用

## ログ出力例

```
🔥 サークルデータのFirestore投入を開始します...
📊 140件のサークルデータを処理します
📝 進捗: 10/140 (成功: 10, エラー: 0)
📝 進捗: 20/140 (成功: 20, エラー: 0)
⏳ レート制限対策で1秒待機...
...
🎉 サークルデータの投入が完了しました！
✅ 成功: 140件
❌ エラー: 0件
🏁 処理完了
```

## 注意事項

- **本番環境での実行は慎重に行ってください**
- 大量データの投入時はFirestoreの料金に注意
- バックアップを取ってから実行することを推奨
- スクリプト実行前に必ずテスト環境で動作確認

## 開発者向け情報

### 新しいスクリプトの追加

1. `scripts/` ディレクトリに TypeScript ファイルを作成
2. `package.json` の `scripts` セクションに追加
3. このREADMEに使用方法を記載

### データ形式の変更

データ形式を変更する場合は：

1. `types/index.ts` の型定義を更新
2. 変換ロジックをスクリプトで修正
3. 既存データの移行スクリプトを作成