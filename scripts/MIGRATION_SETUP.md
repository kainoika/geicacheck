# データ移行スクリプトのセットアップ手順

## 概要

お品書き画像のデータ移行スクリプトは、**Firebase Admin SDK**を使用してFirestoreのセキュリティルールをバイパスし、安全に実行できます。

これにより、**手作業でセキュリティルールを変更する必要がなくなります**。

## 🔧 初回セットアップ（1回のみ）

### 1. サービスアカウントキーの取得

1. [Firebase Console](https://console.firebase.google.com/)を開く
2. プロジェクトを選択
3. 左メニュー「プロジェクトの設定」（⚙️アイコン）をクリック
4. 「サービスアカウント」タブを選択
5. 「新しい秘密鍵の生成」ボタンをクリック
6. 確認ダイアログで「キーを生成」をクリック
7. JSONファイルがダウンロードされる

### 2. サービスアカウントキーの配置

ダウンロードしたJSONファイルをプロジェクトルートに配置し、名前を変更：

```bash
# ダウンロードしたファイル名（例）:
# geicacheck-firebase-adminsdk-xxxxx-xxxxxxxxxx.json

# プロジェクトルートに移動してリネーム
mv ~/Downloads/geicacheck-firebase-adminsdk-*.json ./serviceAccountKey.json
```

**重要**: このファイルは`.gitignore`に登録済みのため、誤ってコミットされることはありません。

### 3. セットアップの確認

以下のコマンドでセットアップが正しく完了したか確認：

```bash
# ファイルが存在することを確認
ls -l serviceAccountKey.json

# dry-runモードで実行テスト
npm run migrate:menu-images:dry-run
```

エラーが出なければセットアップ完了です！

## 🚀 使用方法

### データ移行（menuImageUrl → menuImages[]）

```bash
# 1. まずdry-runで影響を確認
npm run migrate:menu-images:dry-run

# 2. 問題なければ本番実行
npm run migrate:menu-images
```

### ロールバック（menuImages[] → menuImageUrl）

```bash
# 1. まずdry-runで影響を確認
npm run rollback:menu-images:dry-run

# 2. 問題なければ本番実行
npm run rollback:menu-images
```

## 📊 実行結果の例

```
🔄 お品書き画像データを移行します...
📊 3件のイベントが見つかりました

📅 イベント: ゲイカ32
   サークル数: 245件
   ✅ サークルA: 移行完了
   ✅ サークルB: 移行完了
   📈 移行: 123件, スキップ: 122件, エラー: 0件

==================================================
📊 移行結果サマリー
==================================================
✅ 移行完了: 123件
⏭️  スキップ: 122件
❌ エラー: 0件

🎉 移行が完了しました！
```

## ⚠️ トラブルシューティング

### エラー: serviceAccountKey.json が見つかりません

**原因**: サービスアカウントキーが配置されていない

**解決方法**:
1. 上記「初回セットアップ」の手順に従ってキーを取得
2. プロジェクトルートに `serviceAccountKey.json` として配置

### エラー: Permission denied

**原因**: サービスアカウントに権限がない（通常は発生しません）

**解決方法**:
1. Firebase Console → IAMと管理 → サービスアカウント
2. 該当のサービスアカウントに「Firebase Admin」ロールが付与されているか確認

### スクリプトが途中で止まる

**原因**: ネットワーク接続の問題、または大量データの処理

**解決方法**:
- インターネット接続を確認
- 再度実行（すでに移行済みのデータはスキップされます）

## 🔒 セキュリティに関する注意事項

### ✅ DO（推奨）

- ✅ `serviceAccountKey.json` はプロジェクトルートに配置
- ✅ `.gitignore` に登録されていることを確認（既に登録済み）
- ✅ 本番環境では環境変数経由で管理することを検討
- ✅ 使用後は安全な場所に保管

### ❌ DON'T（禁止）

- ❌ サービスアカウントキーをGitにコミットしない
- ❌ サービスアカウントキーを公開リポジトリにアップロードしない
- ❌ サービスアカウントキーをSlack/Discordなどで共有しない
- ❌ 不要になったキーは削除する

## 📝 補足情報

### Admin SDKの利点

- **セキュリティルールをバイパス**: 管理者権限で全データにアクセス可能
- **手作業不要**: Firestoreのルールを変更する必要なし
- **安全**: サービスアカウント認証で本人確認
- **監査ログ**: Firebase Consoleで実行履歴を確認可能

### 従来の方法との比較

| 項目 | Admin SDK（新） | クライアントSDK（旧） |
|------|----------------|---------------------|
| セキュリティルール | バイパス可能 ✅ | 制限される ❌ |
| 手作業での権限変更 | 不要 ✅ | 必要 ❌ |
| 認証方法 | サービスアカウント | APIキー |
| 安全性 | 高い ✅ | 低い ❌ |

## 🔗 参考リンク

- [Firebase Admin SDK ドキュメント](https://firebase.google.com/docs/admin/setup)
- [サービスアカウントの管理](https://cloud.google.com/iam/docs/service-accounts)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
