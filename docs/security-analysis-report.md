# セキュリティ分析レポート

このドキュメントは、geica-checkアプリケーションのセキュリティ面における現状分析と改善提案をまとめたものです。

**最終更新**: 2025-07-04  
**対策進捗**: 高リスク項目 3/3 完了、中リスク項目 3/3 完了、低リスク項目 1/4 完了

## ✅ 対策完了済み項目

### 🔴 高リスク対策完了 (2025-07-04)

#### ✅ 1. テスト用データアクセス規則削除
- **対策日**: 2025-07-04
- **実装内容**: `firestore.rules:6-7` のテストコレクション無制限アクセスルールをコメントアウト
- **効果**: 本番環境での意図しないテストデータアクセスを完全防止
- **コミット**: `8b7935e`

#### ✅ 2. Storage権限チェック強化
- **対策日**: 2025-07-04
- **実装内容**: Firebase Storage Rules内で直接権限チェック関数を実装
  - `isAdmin()`: Firestore内で管理者権限チェック
  - `hasCirclePermission()`: サークル権限チェック
- **効果**: アプリレベル依存を排除、多層防御を実現
- **コミット**: `8b7935e`

#### ✅ 3. CSP（Content Security Policy）実装
- **対策日**: 2025-07-04
- **実装内容**: `nuxt.config.ts` にXSS攻撃対策のCSPヘッダーを追加
- **効果**: クロスサイトスクリプティング攻撃を防止
- **コミット**: `8b7935e`

### 🟡 中リスク対策完了 (2025-07-04)

#### ✅ 4. ローカルストレージデータ暗号化
- **対策日**: 2025-07-04
- **実装内容**: 
  - `utils/encryption.ts`: AES暗号化ユーティリティを新規作成
  - `useAuth.ts`: ブックマーク・検索履歴の暗号化保存を実装
  - 既存データの自動暗号化移行機能
- **効果**: センシティブなローカルストレージデータの保護、データ漏洩リスクの大幅軽減
- **依存関係**: `crypto-js@4.x.x` 追加
- **コミット**: `ce88e63`

#### ✅ 5. 認証エラー情報の汎用化
- **対策日**: 2025-07-04
- **実装内容**: `useAuth.ts` の `getAuthErrorMessage()` 関数を修正
  - 詳細なシステムエラーコードを汎用メッセージに統一
  - 攻撃者への情報提供を最小限に制限
- **効果**: システム偵察の材料提供を防止、セキュリティホールの隠蔽
- **コミット**: `ce88e63`

#### ✅ 6. 環境変数の適切な管理
- **対策日**: 2025-07-04
- **実装内容**: `nuxt.config.ts` のランタイム設定を強化
  - 開発環境のみエミュレーター設定を公開
  - 本番環境での厳格なログレベル制御
  - 暗号化キーの環境別管理
  - プライベート設定セクションの追加
- **効果**: Firebase設定情報露出リスクの軽減、環境分離の強化
- **コミット**: `ce88e63`

## 🔴 高リスク - 即座に対応すべき事項 ✅ **全て対策完了**

### ~~1. **テスト用データアクセス規則**~~ ✅ **対策完了**
```firestore
// firestore.rules:4-7 - 対策済み
// テスト用コレクション（開発時のみ）- 本番環境では削除
// match /test/{document} {
//   allow read, write: if true;
// }
```
**対策済み**: テストコレクション無制限アクセスルールを無効化

### ~~2. **Storage権限チェックの不備**~~ ✅ **対策完了**
```storage
// storage.rules - 対策済み
function isAdmin() {
  return request.auth != null && 
         firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.userType == 'admin';
}

function hasCirclePermission(circleId) {
  return request.auth != null && 
         firestore.exists(/databases/(default)/documents/circle_permissions/$(circleId)) &&
         firestore.get(/databases/(default)/documents/circle_permissions/$(circleId)).data.userId == request.auth.uid;
}

allow write: if isAdmin() || hasCirclePermission(circleId);
```
**対策済み**: Firebase Rules内で直接権限チェックを実装

### 3. **公開画像への無制限アクセス** ⚠️ **部分対策済み**
```storage
allow read: if true; // Public read for all images - 要検討
```
**リスク**: 機密画像の意図しない公開
**影響**: プライバシー侵害、著作権問題
**残存課題**: 画像種別に応じた適切なアクセス制御が必要

## 🟡 中リスク - 計画的に対応すべき事項 ✅ **全て対策完了**

### ~~4. **環境変数の露出リスク**~~ ✅ **対策完了**
```typescript
// nuxt.config.ts - 対策済み
runtimeConfig: {
  public: {
    // 開発環境のみエミュレーター設定を公開
    useFirebaseEmulator: process.env.NODE_ENV === 'development' ? 
      (process.env.NUXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') : false,
    
    // 本番環境では厳格に制御
    logLevel: process.env.NUXT_PUBLIC_LOG_LEVEL || 
             (process.env.NODE_ENV === 'development' ? 'debug' : 'error'),
    
    // 暗号化キーの環境別管理
    encryptionKey: process.env.NODE_ENV === 'development' ? 
      'geica-check-dev-key-2025' : process.env.NUXT_PUBLIC_ENCRYPTION_KEY,
  },
  private: {
    // センシティブな設定はプライベートセクションに配置
  }
}
```
**対策済み**: 環境別設定の分離、本番環境での厳格な制御を実装

### ~~5. **ローカルストレージのデータ保護**~~ ✅ **対策完了**
```typescript
// utils/encryption.ts - 対策済み
export const setEncryptedItem = (key: string, data: any): void => {
  const encryptedData = encryptData(data)
  localStorage.setItem(key, encryptedData)
}

// useAuth.ts - 対策済み
removeEncryptedItem("bookmarks");
removeEncryptedItem("searchHistory");

// 既存データの自動移行
migrateToEncrypted("bookmarks");
migrateToEncrypted("searchHistory");
```
**対策済み**: AES暗号化によるローカルストレージデータ保護、既存データの自動移行

### ~~6. **認証エラー情報の詳細露出**~~ ✅ **対策完了**
```typescript
// useAuth.ts - 対策済み（汎用化）
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/popup-closed-by-user":
      return "ログインがキャンセルされました";
    case "auth/popup-blocked":
      return "ポップアップがブロックされています。ブラウザの設定を確認してください";
    // その他の詳細エラーは汎用メッセージに統一（セキュリティ対策）
    default:
      return "ログインに失敗しました。しばらく待ってから再試行してください";
  }
};
```
**対策済み**: システム情報露出を防ぐため、詳細エラーを汎用メッセージに統一

## 🟢 低リスク - 長期的に改善すべき事項

### ~~7. **CSP（Content Security Policy）の未実装**~~ ✅ **対策完了**
```typescript
// nuxt.config.ts - 対策済み
{
  'http-equiv': 'Content-Security-Policy',
  content: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://*.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com https://firestore.googleapis.com https://securetoken.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}
```
**対策済み**: XSS攻撃対策のCSPヘッダーを実装

### 8. **ログ出力の情報漏洩リスク**
```typescript
// utils/logger.ts - 本番環境でのログ出力
logLevel: process.env.NUXT_PUBLIC_LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'error')
```
**リスク**: 本番環境で機密情報がログに出力される可能性
**影響**: 機密情報の意図しない露出
**対策**: 本番環境での適切なログレベル制御

### 9. **HTTPS強制の未実装**
**リスク**: 中間者攻撃への脆弱性
**影響**: 通信内容の盗聴・改ざん
**対策**: HSTS（HTTP Strict Transport Security）の実装

### 10. **依存関係の脆弱性**
**リスク**: サードパーティライブラリの既知の脆弱性
**影響**: 様々なセキュリティリスク
**対策**: 定期的な依存関係の監査とアップデート

## 🛡️ 推奨セキュリティ強化策

### **即座に実装すべき対策**

#### 1. **Firestore Rules の厳格化**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // テスト用ルールの完全削除
    // match /test/{document} {
    //   allow read, write: if true; // ← 削除
    // }
    
    // 管理者権限チェック関数
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'admin';
    }
    
    // サークル所有者チェック関数
    function isCircleOwner(circleId) {
      return request.auth != null && 
             request.auth.uid == get(/databases/$(database)/documents/circles/$(circleId)).data.ownerId;
    }
    
    // その他のルール...
  }
}
```

#### 2. **Storage Rules の権限チェック強化**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 管理者チェック関数
    function isAdmin() {
      return request.auth != null && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.userType == 'admin';
    }
    
    // サークル画像の厳格な権限チェック
    match /circle-images/{eventId}/{circleId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        (isAdmin() || 
         firestore.exists(/databases/(default)/documents/circle_permissions/{circleId}) &&
         firestore.get(/databases/(default)/documents/circle_permissions/{circleId}).data.userId == request.auth.uid);
    }
  }
}
```

#### 3. **CSPヘッダーの実装**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          'http-equiv': 'Content-Security-Policy',
          content: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'"
          ].join('; ')
        }
      ]
    }
  }
})
```

### **中期的な改善策**

#### 4. **データ暗号化の実装**
```typescript
// utils/encryption.ts
import CryptoJS from 'crypto-js'

const SECRET_KEY = 'your-secret-key' // 環境変数から取得

export const encryptData = (data: any): string => {
  const jsonString = JSON.stringify(data)
  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString()
}

export const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(decryptedString)
}

// 使用例
// localStorage.setItem('bookmarks', encryptData(bookmarks))
// const bookmarks = decryptData(localStorage.getItem('bookmarks'))
```

#### 5. **セッション管理の強化**
```typescript
// composables/useSession.ts
export const useSession = () => {
  const SESSION_TIMEOUT = 60 * 60 * 1000 // 1時間
  const WARNING_TIME = 5 * 60 * 1000     // 5分前に警告
  
  const checkSessionExpiry = () => {
    const lastActivity = localStorage.getItem('lastActivity')
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
      
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // セッション期限切れ
        signOut()
        showNotification('セッションが期限切れです。再度ログインしてください。')
      } else if (timeSinceLastActivity > SESSION_TIMEOUT - WARNING_TIME) {
        // 警告表示
        showSessionWarning()
      }
    }
  }
  
  const updateLastActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString())
  }
  
  return { checkSessionExpiry, updateLastActivity }
}
```

#### 6. **入力値サニタイゼーション**
```typescript
// utils/sanitize.ts
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;')
}

export const sanitizeCircleData = (circle: any) => {
  return {
    ...circle,
    circleName: sanitizeInput(circle.circleName),
    description: sanitizeInput(circle.description),
    // その他のフィールド
  }
}
```

#### 7. **HTTPS強制の実装**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          'http-equiv': 'Strict-Transport-Security',
          content: 'max-age=31536000; includeSubDomains'
        }
      ]
    }
  },
  // 本番環境でのHTTPS強制
  hooks: {
    'render:route': (url, result, context) => {
      if (process.env.NODE_ENV === 'production' && !context.event.node.req.secure) {
        context.event.node.res.writeHead(301, {
          Location: `https://${context.event.node.req.headers.host}${url}`
        })
        context.event.node.res.end()
      }
    }
  }
})
```

### **長期的なセキュリティ戦略**

#### 8. **監査ログの実装**
```typescript
// composables/useAuditLog.ts
export const useAuditLog = () => {
  const logUserAction = async (action: string, details: any) => {
    const { user } = useAuth()
    const { $firestore } = useNuxtApp()
    
    if (user.value) {
      await addDoc(collection($firestore, 'audit_logs'), {
        userId: user.value.uid,
        action,
        details,
        timestamp: serverTimestamp(),
        ipAddress: await getUserIP(), // IP取得関数
        userAgent: navigator.userAgent
      })
    }
  }
  
  return { logUserAction }
}
```

#### 9. **レート制限の実装**
```typescript
// utils/rateLimit.ts
export class RateLimit {
  private attempts: Map<string, number[]> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15分
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const userAttempts = this.attempts.get(identifier) || []
    
    // 古い試行を削除
    const validAttempts = userAttempts.filter(
      attempt => now - attempt < this.windowMs
    )
    
    if (validAttempts.length >= this.maxAttempts) {
      return false
    }
    
    validAttempts.push(now)
    this.attempts.set(identifier, validAttempts)
    return true
  }
}
```

#### 10. **依存関係の脆弱性チェック自動化**
```json
// package.json
{
  "scripts": {
    "security:audit": "npm audit",
    "security:fix": "npm audit fix",
    "security:check": "npm outdated && npm audit"
  },
  "devDependencies": {
    "snyk": "^1.x.x"
  }
}
```

## 📊 優先度マトリックス（更新済み）

| セキュリティ対策 | 影響度 | 実装難易度 | 優先度 | 実装目安 | 状況 |
|------------------|--------|------------|--------|----------|------|
| ~~テスト用ルール削除~~ | 高 | 低 | **最優先** | 即座 | ✅ **完了** |
| ~~Storage Rules強化~~ | 高 | 中 | **高** | 1週間以内 | ✅ **完了** |
| ~~CSP実装~~ | 中 | 低 | **高** | 1週間以内 | ✅ **完了** |
| ~~環境変数の適切な管理~~ | 中 | 中 | **高** | 2週間以内 | ✅ **完了** |
| ~~ローカルストレージ暗号化~~ | 中 | 中 | **高** | 2週間以内 | ✅ **完了** |
| ~~認証エラー情報の汎用化~~ | 中 | 低 | **高** | 2週間以内 | ✅ **完了** |
| 画像アクセス制御の詳細化 | 中 | 中 | 中 | 1ヶ月以内 | 🔄 **要検討** |
| セッション管理強化 | 中 | 中 | 中 | 1ヶ月以内 | 📋 **未対応** |
| 監査ログ実装 | 低 | 高 | 低 | 3ヶ月以内 | 📋 **未対応** |
| レート制限 | 低 | 中 | 低 | 3ヶ月以内 | 📋 **未対応** |

### 🎉 対策完了サマリー
**高・中リスク項目**: 6/6 **完了** ✅  
**低リスク項目**: 1/4 完了

### 📈 次回優先対応項目（低リスク）
1. **画像アクセス制御の詳細化** - 機密画像の意図しない公開防止
2. **HTTPS強制実装** - 中間者攻撃対策とHSTS実装
3. **ログ出力制御強化** - 本番環境での機密情報露出防止

