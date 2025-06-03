import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { join } from 'path'

// 環境変数を読み込み
config()

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface CircleData {
  id: string
  circleName: string
  circleKana?: string
  penName?: string
  penNameKana?: string
  circleImageUrl?: string
  genre: string
  block: string
  number1: string
  number2?: string
  description?: string
  twitter?: string
  pixiv?: string
  oshinaUrl?: string
  isAdult: string
  ownerId?: string
  isPublic: string
  eventId: string
  createdAt?: string
  updatedAt?: string
}

// JSONデータをFirestore形式に変換
function convertToFirestoreFormat(circleData: CircleData) {
  return {
    circleName: circleData.circleName,
    circleKana: circleData.circleKana || '',
    penName: circleData.penName || '',
    penNameKana: circleData.penNameKana || '',
    circleImageUrl: circleData.circleImageUrl || '',
    genre: circleData.genre ? [circleData.genre] : [], // 配列形式に変換
    placement: {
      block: circleData.block,
      number1: circleData.number1 || '',
      // number2はオプションなので存在しない場合は空文字
      number2: circleData.number2 || ''
    },
    description: circleData.description || '',
    contact: {
      twitter: circleData.twitter || '',
      pixiv: circleData.pixiv || '',
      oshinaUrl: circleData.oshinaUrl || ''
    },
    isAdult: circleData.isAdult === 'true',
    ownerId: circleData.ownerId || '',
    isPublic: circleData.isPublic === 'true',
    eventId: circleData.eventId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
}

async function importCircles() {
  try {
    console.log('🔥 サークルデータのFirestore投入を開始します...')
    
    // JSONファイルを読み込み
    const jsonPath = join(process.cwd(), 'data', 'geika32-circle.json')
    const jsonData = readFileSync(jsonPath, 'utf-8')
    const circles: CircleData[] = JSON.parse(jsonData)
    
    console.log(`📊 ${circles.length}件のサークルデータを処理します`)
    
    let successCount = 0
    let errorCount = 0
    
    // バッチ処理で投入
    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i]
      
      try {
        // Firestoreドキュメント作成
        const circleRef = doc(collection(db, 'circles'), `geika32-${circle.id}`)
        const firestoreData = convertToFirestoreFormat(circle)
        console.log(firestoreData)
        await setDoc(circleRef, firestoreData)
        
        successCount++
        
        // 進捗表示
        if (i % 10 === 0 || i === circles.length - 1) {
          console.log(`📝 進捗: ${i + 1}/${circles.length} (成功: ${successCount}, エラー: ${errorCount})`)
        }
        
        // レート制限対策（少し待機）
        if (i % 50 === 0 && i > 0) {
          console.log('⏳ レート制限対策で1秒待機...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`❌ サークルID ${circle.id} の投入に失敗:`, error)
        errorCount++
      }
    }
    
    console.log('\n🎉 サークルデータの投入が完了しました！')
    console.log(`✅ 成功: ${successCount}件`)
    console.log(`❌ エラー: ${errorCount}件`)
    
    if (errorCount > 0) {
      console.log('⚠️  エラーが発生したデータがあります。ログを確認してください。')
    }
    
  } catch (error) {
    console.error('💥 投入処理でエラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
importCircles()

export { importCircles }