import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDoc,
  setDoc,
  doc,
  updateDoc
} from 'firebase/firestore'

config()

const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const EVENT_ID = 'geika-31'

const GEIKA_EVENT = {
  id: EVENT_ID,
  name: '芸能人はカードが命！31',
  shortName: '芸カ31',
  eventDate: new Date('2024-11-23'),
  venue: {
    name: 'TRC東京流通センター第一展示場ABCDホール',
    address: '東京都大田区平和島6丁目1−1 東京流通センター センタービル 2F',
    accessInfo: '東京モノレール「東京流通センター」駅より徒歩約1分'
  },
  description: 'アイカツ！シリーズオンリー同人イベント第31回',
  status: 'completed',
  isDefault: false,
  mapData: '',
  createdAt: new Date('2025-06-02'),
  updatedAt: new Date()
}

/**
 * イベントデータを作成（手動ID）
 */
async function createGeika32Event() {
  console.log('🎪 芸カイベントデータを作成中...')

  try {
    const eventRef = doc(db, 'events', EVENT_ID)
    const existing = await getDoc(eventRef)

    if (existing.exists()) {
      console.log('⚠️ すでに存在しています。スキップします。')
      return
    }

    await setDoc(eventRef, GEIKA_EVENT)
    console.log('✅ 芸カイベントを作成しました')
  } catch (error) {
    console.error('❌ イベント作成エラー:', error)
    throw error
  }
}

/**
 * イベントデータを作成または更新（手動ID）
 */
async function upsertGeika32Event() {
  console.log('🎪 芸カイベントデータを作成または更新中...')

  try {
    const eventRef = doc(db, 'events', EVENT_ID)
    const existing = await getDoc(eventRef)

    if (existing.exists()) {
      await updateDoc(eventRef, GEIKA_EVENT)
      console.log('🔄 芸カイベントを更新しました')
    } else {
      await setDoc(eventRef, GEIKA_EVENT)
      console.log('✅ 芸カイベントを新規作成しました')
    }
  } catch (error) {
    console.error('❌ イベント作成/更新エラー:', error)
    throw error
  }
}

async function main() {
  console.log('🚀 マルチイベント対応移行スクリプトを開始します...')
  console.log('⚠️ 本番データを変更します。実行前にバックアップを取ってください。')

  try {
    await createGeika32Event()

    console.log('🎉 移行が完了しました！')
    console.log('📋 次のステップ:')
    console.log('  1. アプリケーションでイベント選択機能をテスト')
    console.log('  2. 第2回芸カイベントの作成準備')
    console.log('  3. 管理者ダッシュボードの開発')
  } catch (error) {
    console.error('💥 移行中にエラーが発生しました:', error)
    process.exit(1)
  }
}

main()

export { main as migrateToMultiEvent }
