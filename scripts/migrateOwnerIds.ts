import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { config } from 'dotenv'

// 環境変数を読み込む
config()

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * 既存の編集権限データに基づいてサークルのownerIdを更新する
 */
async function migrateOwnerIds() {
  console.log('🔄 既存の編集権限データからownerIdを更新します...')

  try {
    // アクティブな編集権限を取得
    const permissionsRef = collection(db, 'circle_permissions')
    const q = query(permissionsRef, where('isActive', '==', true))
    const snapshot = await getDocs(q)

    console.log(`📊 ${snapshot.size}件のアクティブな編集権限が見つかりました`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const docSnapshot of snapshot.docs) {
      const permission = docSnapshot.data()
      const { userId, circleId } = permission

      // circleIdからeventIdを抽出（例: "geika32-038" -> "geika-32"）
      const eventIdMatch = circleId.match(/^geika(\d+)-/)
      
      if (!eventIdMatch) {
        console.warn(`⚠️  無効なcircleId形式: ${circleId}`)
        skipCount++
        continue
      }

      const eventId = `geika-${eventIdMatch[1]}`
      const circleRef = doc(db, 'events', eventId, 'circles', circleId)

      try {
        // サークルのownerIdを更新
        await updateDoc(circleRef, {
          ownerId: userId,
          updatedAt: serverTimestamp()
        })
        
        console.log(`✅ ${circleId} のownerIdを ${userId} に更新しました`)
        successCount++
      } catch (error) {
        console.error(`❌ ${circleId} の更新に失敗:`, error)
        errorCount++
      }
    }

    console.log('\n📊 移行結果:')
    console.log(`✅ 成功: ${successCount}件`)
    console.log(`⏭️  スキップ: ${skipCount}件`)
    console.log(`❌ エラー: ${errorCount}件`)

  } catch (error) {
    console.error('移行処理でエラーが発生しました:', error)
    process.exit(1)
  }
}

// 実行確認
console.log('⚠️  このスクリプトは既存のサークルデータのownerIdを更新します。')
console.log('実行する前に、データのバックアップを取ることを推奨します。')
console.log('\n実行しますか？ (yes/no)')

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('> ', async (answer) => {
  if (answer.toLowerCase() === 'yes') {
    await migrateOwnerIds()
    console.log('\n✨ 移行が完了しました')
  } else {
    console.log('移行をキャンセルしました')
  }
  rl.close()
  process.exit(0)
})