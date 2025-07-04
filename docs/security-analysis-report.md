# セキュリティ分析レポート

このドキュメントは、geica-checkアプリケーションのセキュリティ面における現状分析と改善提案をまとめたものです。

## 🔴 高リスク - 即座に対応すべき事項

### 1. **テスト用データアクセス規則**
```firestore
// firestore.rules:6-7 - 危険！
match /test/{document} {
  allow read, write: if true;  // ← 無制限アクセス
}
```
**リスク**: 本番環境でテストコレクションが悪用される可能性
**影響**: データ改ざん、情報漏洩
**対策**: 環境別の条件分岐または完全削除

### 2. **Storage権限チェックの不備**
```storage
// storage.rules:15,21 - アプリレベル依存
allow write: if request.auth != null; // Admin check handled in application
```
**リスク**: アプリケーション側のチェックをバイパスされる可能性
**影響**: 不正ファイルアップロード、ストレージ容量攻撃
**対策**: Storage Rules内で直接権限チェックを実装

### 3. **公開画像への無制限アクセス**
```storage
allow read: if true; // Public read for all images
```
**リスク**: 機密画像の意図しない公開
**影響**: プライバシー侵害、著作権問題
**対策**: 画像種別に応じた適切なアクセス制御

## 🟡 中リスク - 計画的に対応すべき事項

### 4. **環境変数の露出リスク**
```typescript
// nuxt.config.ts:69-79 - 公開設定
runtimeConfig: {
  public: {
    firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY, // ← 公開される
    firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
    // ...
  }
}
```
**リスク**: Firebase設定情報がクライアント側で露出
**影響**: API乱用、不正アクセス試行
**対策**: 必要最小限の情報のみ公開、ドメイン制限の実装

### 5. **ローカルストレージのデータ保護**
```typescript
// useAuth.ts:105-106
localStorage.removeItem("bookmarks");
localStorage.removeItem("searchHistory");
```
**リスク**: センシティブなデータが平文でブラウザに保存
**影響**: ユーザーデータの漏洩
**対策**: 暗号化またはセッション期限の設定

### 6. **認証エラー情報の詳細露出**
```typescript
// useAuth.ts:282-297
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/popup-closed-by-user": return "ログインがキャンセルされました";
    case "auth/popup-blocked": return "ポップアップがブロックされました";
    // ... 詳細なエラー情報
  }
}
```
**リスク**: 攻撃者にシステム情報を提供する可能性
**影響**: システム偵察の材料提供
**対策**: 汎用的なエラーメッセージに統一

## 🟢 低リスク - 長期的に改善すべき事項

### 7. **CSP（Content Security Policy）の未実装**
```typescript
// nuxt.config.ts - CSPヘッダーなし
```
**リスク**: XSS攻撃への脆弱性
**影響**: スクリプトインジェクション攻撃
**対策**: 適切なCSPヘッダーの実装

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

## 📊 優先度マトリックス

| セキュリティ対策 | 影響度 | 実装難易度 | 優先度 | 実装目安 |
|------------------|--------|------------|--------|----------|
| テスト用ルール削除 | 高 | 低 | **最優先** | 即座 |
| Storage Rules強化 | 高 | 中 | **高** | 1週間以内 |
| CSP実装 | 中 | 低 | **高** | 1週間以内 |
| 環境変数の適切な管理 | 中 | 中 | 高 | 2週間以内 |
| データ暗号化 | 中 | 中 | 中 | 1ヶ月以内 |
| セッション管理強化 | 中 | 中 | 中 | 1ヶ月以内 |
| 監査ログ実装 | 低 | 高 | 低 | 3ヶ月以内 |
| レート制限 | 低 | 中 | 低 | 3ヶ月以内 |

