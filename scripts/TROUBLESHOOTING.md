# Firebase接続トラブルシューティングガイド

## エラー: `3 INVALID_ARGUMENT: Invalid resource field value in the request`

このエラーは以下の原因で発生する可能性があります：

### 1. 環境変数の設定不備

**確認方法:**
```bash
npm run test:firebase
```

**解決方法:**
`.env`ファイルを確認し、以下の変数が正しく設定されているか確認：

```bash
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 2. Firestoreセキュリティルールの問題

**症状:**
- 認証なしでデータを書き込もうとしている
- 権限のないコレクションにアクセスしている

**解決方法:**

#### A. 開発環境用のルール設定
Firebase Consoleで以下のルールを設定（**開発時のみ**）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### B. 本プロジェクトのルール適用
```bash
# Firebase CLIをインストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化
firebase init firestore

# ルールをデプロイ
firebase deploy --only firestore:rules
```

### 3. Firebase プロジェクト設定の問題

**確認項目:**
- Firebase Console でプロジェクトが作成されているか
- Firestore Database が有効化されているか
- 認証設定が正しいか

**解決手順:**

1. **Firebase Console にアクセス**
   - https://console.firebase.google.com/

2. **プロジェクト作成/選択**
   - 新規プロジェクト作成または既存プロジェクト選択

3. **Firestore Database 有効化**
   - 「Firestore Database」→「データベースを作成」
   - テストモードで開始（開発時）

4. **認証設定**
   - 「Authentication」→「Sign-in method」
   - Twitter認証を有効化

### 4. ネットワーク/接続の問題

**確認方法:**
```bash
# Firebase接続テスト
npm run test:firebase

# 基本的な接続確認
curl -I https://firestore.googleapis.com/
```

**解決方法:**
- VPN接続を確認
- ファイアウォール設定を確認
- プロキシ設定を確認

### 5. データ形式の問題

**よくある問題:**
- `undefined` 値の送信
- 無効な文字列の使用
- 循環参照のあるオブジェクト

**解決方法:**
```typescript
// ❌ 悪い例
const data = {
  name: undefined,  // undefinedは送信できない
  date: new Date(), // Dateオブジェクトは直接送信できない
}

// ✅ 良い例
const data = {
  name: name || '',  // 空文字列またはnullを使用
  date: serverTimestamp(), // Firestoreのタイムスタンプを使用
}
```

## デバッグ手順

### ステップ1: 環境確認
```bash
npm run test:firebase
```

### ステップ2: 最小限のデータでテスト
```typescript
// 最もシンプルなテスト
await setDoc(doc(db, 'test', 'simple'), {
  message: 'Hello World'
});
```

### ステップ3: セキュリティルール確認
Firebase Console → Firestore → ルール

### ステップ4: ログ確認
Firebase Console → Firestore → 使用状況

## よくあるエラーと解決方法

### `FirebaseError: Missing or insufficient permissions`
**原因:** セキュリティルールで書き込みが拒否されている
**解決:** ルールを確認し、適切な権限を設定

### `FirebaseError: The project ID is invalid`
**原因:** 環境変数のプロジェクトIDが間違っている
**解決:** `.env`ファイルのプロジェクトIDを確認

### `FirebaseError: Network request failed`
**原因:** ネットワーク接続の問題
**解決:** インターネット接続とファイアウォール設定を確認

### `TypeError: Cannot read property 'firestore' of undefined`
**原因:** Firebase初期化の問題
**解決:** 環境変数とFirebase設定を確認

## 緊急時の対処法

### 1. 開発環境でのクイック修正
```javascript
// firestore.rules を一時的に以下に変更
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 2. 別のコレクション名でテスト
```typescript
// 'circles' の代わりに 'test_circles' を使用
const testRef = doc(collection(db, 'test_circles'), 'test-001')
```

### 3. Firebase Emulator の使用
```bash
# Firebase Emulator をインストール
npm install -g firebase-tools

# Emulator を起動
firebase emulators:start --only firestore
```

## サポート情報

### 公式ドキュメント
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase エラーコード](https://firebase.google.com/docs/reference/js/firebase.firestore.FirestoreError)

### コミュニティ
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Discord](https://discord.gg/firebase)

### 本プロジェクト固有の問題
GitHub Issues または開発チームに連絡してください。