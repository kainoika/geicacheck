import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'

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

interface Event {
  id: string
  name: string
  shortName: string
  eventDate: Date
  venue: {
    name: string
    address: string
    accessInfo: string
  }
  description: string
  status: 'completed' | 'active' | 'upcoming'
  registrationPeriod: {
    start: Date
    end: Date
  }
  isDefault: boolean
  mapData?: string
}

const events: Event[] = [
  {
    id: 'geika-32',
    name: '芸能人はカードが命！32',
    shortName: '芸カ32',
    eventDate: new Date('2025-03-23'),
    venue: {
      name: '大田区産業プラザPiO',
      address: '東京都大田区南蒲田1丁目20−20',
      accessInfo: '京浜急行「京急蒲田」駅より徒歩約3分'
    },
    description: 'アイカツ！シリーズオンリー同人イベント第32回',
    status: 'completed',
    registrationPeriod: {
      start: new Date('2025-01-01'),
      end: new Date('2025-02-28')
    },
    isDefault: true,
    mapData: ''
  },
  {
    id: 'geika-33',
    name: '芸能人はカードが命！33',
    shortName: '芸カ33',
    eventDate: new Date('2025-09-23'),
    venue: {
      name: '大田区産業プラザPiO',
      address: '東京都大田区南蒲田1丁目20−20',
      accessInfo: '京浜急行「京急蒲田」駅より徒歩約3分'
    },
    description: 'アイカツ！シリーズオンリー同人イベント第33回',
    status: 'upcoming',
    registrationPeriod: {
      start: new Date('2025-07-01'),
      end: new Date('2025-08-31')
    },
    isDefault: false,
    mapData: ''
  },
  {
    id: 'geika-34',
    name: '芸能人はカードが命！34',
    shortName: '芸カ34',
    eventDate: new Date('2026-03-23'),
    venue: {
      name: '大田区産業プラザPiO',
      address: '東京都大田区南蒲田1丁目20−20',
      accessInfo: '京浜急行「京急蒲田」駅より徒歩約3分'
    },
    description: 'アイカツ！シリーズオンリー同人イベント第34回',
    status: 'upcoming',
    registrationPeriod: {
      start: new Date('2026-01-01'),
      end: new Date('2026-02-28')
    },
    isDefault: false,
    mapData: ''
  }
]

async function seedEvents() {
  try {
    console.log('🔥 イベントデータのFirestore投入を開始します...')
    
    let successCount = 0
    let errorCount = 0
    
    for (const event of events) {
      try {
        const eventRef = doc(collection(db, 'events'), event.id)
        await setDoc(eventRef, {
          ...event,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        console.log(`✅ ${event.id} (${event.name}) を投入しました`)
        successCount++
        
      } catch (error) {
        console.error(`❌ ${event.id} の投入に失敗:`, error)
        errorCount++
      }
    }
    
    console.log('\n🎉 イベントデータの投入が完了しました！')
    console.log(`✅ 成功: ${successCount}件`)
    console.log(`❌ エラー: ${errorCount}件`)
    
    // イベント統計情報も初期化
    console.log('\n📊 イベント統計情報を初期化します...')
    
    for (const event of events) {
      try {
        const statsRef = doc(collection(db, 'eventStats'), event.id)
        await setDoc(statsRef, {
          eventId: event.id,
          totalCircles: 0,
          totalUsers: 0,
          totalBookmarks: 0,
          bookmarksByCategory: {
            check: 0,
            interested: 0,
            priority: 0
          },
          updatedAt: serverTimestamp()
        })
        
        console.log(`📈 ${event.id} の統計情報を初期化しました`)
        
      } catch (error) {
        console.error(`❌ ${event.id} の統計情報初期化に失敗:`, error)
      }
    }
    
  } catch (error) {
    console.error('💥 投入処理でエラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
seedEvents()
  .then(() => {
    console.log('🏁 処理完了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 予期しないエラー:', error)
    process.exit(1)
  })

export { seedEvents }
