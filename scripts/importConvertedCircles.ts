import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { join } from 'path'

// 環境変数を読み込み
config()

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface CircleData {
  id: string
  circleName: string
  circleKana: string
  penName: string
  penNameKana: string
  circleImageUrl: string | null
  genre: string[]
  placement: {
    block: string
    number1: string
    number2: string | null
  }
  description: string
  contact: {
    twitter: string | null
    pixiv: string | null
    oshinaUrl: string | null
  }
  isAdult: boolean
  ownerId: string | null
  isPublic: boolean
  eventId: string
}

// JSONデータをFirestore形式に変換
function convertToFirestoreFormat(circleData: CircleData, index: number) {
  return {
    id: circleData.id,
    circleName: circleData.circleName,
    circleKana: circleData.circleKana,
    penName: circleData.penName,
    penNameKana: circleData.penNameKana,
    circleImageUrl: circleData.circleImageUrl,
    genre: circleData.genre,
    placement: {
      block: circleData.placement.block,
      // number2が存在しない場合は空文字列にする
      number1: circleData.placement.number1,
      // number2がnullの場合は空文字列にする
      number2: circleData.placement.number2 || '',
    },
    description: circleData.description,
    contact: circleData.contact,
    isAdult: circleData.isAdult,
    ownerId: circleData.ownerId,
    isPublic: circleData.isPublic,
    eventId: circleData.eventId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
}

async function importConvertedCircles() {
  try {
    console.log('🔥 変換済みサークルデータのFirestore投入を開始します...')
    
    // 変換済みJSONファイルを読み込み
    const jsonPath = join(process.cwd(), 'data', 'geica31-circle-converted.json')
    const jsonData = readFileSync(jsonPath, 'utf-8')
    const circles: CircleData[] = JSON.parse(jsonData)
    
    console.log(`📊 ${circles.length}件のサークルデータを処理します`)
    
    let successCount = 0
    let errorCount = 0
    
    // バッチ処理で投入
    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i]
      
      try {
        // Firestoreドキュメント作成（インデックスベースのID）
        const circleRef = doc(db, 'events', "geica-31", 'circles', `geica31-${String(i + 1).padStart(3, '0')}`)
        const firestoreData = convertToFirestoreFormat(circle, i + 1)
        
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
        console.error(`❌ サークル ${circle.circleName} の投入に失敗:`, error)
        errorCount++
      }
    }
    
    console.log('\n🎉 サークルデータの投入が完了しました！')
    console.log(`✅ 成功: ${successCount}件`)
    console.log(`❌ エラー: ${errorCount}件`)
    
    if (errorCount > 0) {
      console.log('⚠️  エラーが発生したデータがあります。ログを確認してください。')
    }
    
    // 統計情報を表示
    const stats = {
      total: successCount,
      withGenres: circles.filter(c => c.genre.length > 0).length,
      withTwitter: circles.filter(c => c.contact.twitter).length,
      withPixiv: circles.filter(c => c.contact.pixiv).length,
      adultContent: circles.filter(c => c.isAdult).length,
      blocks: {
        ア: circles.filter(c => c.placement.block === 'ア').length,
        カ: circles.filter(c => c.placement.block === 'カ').length,
        ド: circles.filter(c => c.placement.block === 'ド').length,
      }
    }
    
    console.log('\n📈 投入データ統計:')
    console.log(`  総数: ${stats.total}件`)
    console.log(`  ジャンル有り: ${stats.withGenres}件`)
    console.log(`  Twitter有り: ${stats.withTwitter}件`)
    console.log(`  Pixiv有り: ${stats.withPixiv}件`)
    console.log(`  成人向け: ${stats.adultContent}件`)
    console.log(`  ブロック別:`)
    console.log(`    アブロック: ${stats.blocks.ア}件`)
    console.log(`    カブロック: ${stats.blocks.カ}件`)
    console.log(`    ドブロック: ${stats.blocks.ド}件`)
    
  } catch (error) {
    console.error('💥 投入処理でエラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
importConvertedCircles()
  .then(() => {
    console.log('🏁 処理完了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 予期しないエラー:', error)
    process.exit(1)
  })

export { importConvertedCircles }