import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'

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

console.log('🔧 Firebase設定確認:')
console.log('  API Key:', process.env.FIREBASE_API_KEY ? '設定済み' : '未設定')
console.log('  Auth Domain:', process.env.FIREBASE_AUTH_DOMAIN ? '設定済み' : '未設定')
console.log('  Project ID:', process.env.FIREBASE_PROJECT_ID ? '設定済み' : '未設定')
console.log('  Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET ? '設定済み' : '未設定')
console.log('  Messaging Sender ID:', process.env.FIREBASE_MESSAGING_SENDER_ID ? '設定済み' : '未設定')
console.log('  App ID:', process.env.FIREBASE_APP_ID ? '設定済み' : '未設定')

async function testFirebaseConnection() {
  try {
    console.log('\n🔥 Firebase接続テストを開始します...')
    
    // Firebase初期化
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    console.log('✅ Firebase初期化成功')
    
    // テスト1: 最もシンプルなデータ
    console.log('\n📝 テスト1: 最もシンプルなデータ')
    try {
      const testRef1 = doc(collection(db, 'test'), 'simple-test')
      await setDoc(testRef1, {
        message: 'Hello Firebase'
      })
      console.log('✅ テスト1成功: シンプルなデータ投入')
    } catch (error) {
      console.error('❌ テスト1失敗:', error)
    }
    
    // テスト2: serverTimestamp使用
    console.log('\n📝 テスト2: serverTimestamp使用')
    try {
      const testRef2 = doc(collection(db, 'test'), 'timestamp-test')
      await setDoc(testRef2, {
        message: 'Hello Firebase with timestamp',
        createdAt: serverTimestamp()
      })
      console.log('✅ テスト2成功: serverTimestamp使用')
    } catch (error) {
      console.error('❌ テスト2失敗:', error)
    }
    
    // テスト3: addDocを使用（自動ID生成）
    console.log('\n📝 テスト3: addDoc使用（自動ID生成）')
    try {
      const testRef3 = await addDoc(collection(db, 'test'), {
        message: 'Hello Firebase with auto ID',
        createdAt: serverTimestamp()
      })
      console.log('✅ テスト3成功: 自動ID生成 -', testRef3.id)
    } catch (error) {
      console.error('❌ テスト3失敗:', error)
    }
    
    // テスト4: サークルデータ形式（簡略版）
    console.log('\n📝 テスト4: サークルデータ形式（簡略版）')
    try {
      const testRef4 = doc(collection(db, 'test'), 'circle-test')
      await setDoc(testRef4, {
        circleName: 'テストサークル',
        eventId: 'geica-32',
        isPublic: true,
        createdAt: serverTimestamp()
      })
      console.log('✅ テスト4成功: サークルデータ形式')
    } catch (error) {
      console.error('❌ テスト4失敗:', error)
    }
    
    // テスト5: 配列データ
    console.log('\n📝 テスト5: 配列データ')
    try {
      const testRef5 = doc(collection(db, 'test'), 'array-test')
      await setDoc(testRef5, {
        circleName: 'テストサークル',
        genre: ['テストジャンル1', 'テストジャンル2'],
        createdAt: serverTimestamp()
      })
      console.log('✅ テスト5成功: 配列データ')
    } catch (error) {
      console.error('❌ テスト5失敗:', error)
    }
    
    // テスト6: ネストしたオブジェクト
    console.log('\n📝 テスト6: ネストしたオブジェクト')
    try {
      const testRef6 = doc(collection(db, 'test'), 'nested-test')
      await setDoc(testRef6, {
        circleName: 'テストサークル',
        placement: {
          block: 'ア',
          number: '01'
        },
        contact: {
          twitter: 'https://twitter.com/test',
          pixiv: null
        },
        createdAt: serverTimestamp()
      })
      console.log('✅ テスト6成功: ネストしたオブジェクト')
    } catch (error) {
      console.error('❌ テスト6失敗:', error)
    }
    
    // テスト7: circlesコレクションに直接投入
    console.log('\n📝 テスト7: circlesコレクションに投入')
    try {
      const testRef7 = doc(collection(db, 'circles'), 'test-circle-001')
      await setDoc(testRef7, {
        circleName: 'しずみ荘',
        circleKana: 'シズミソウ',
        eventId: 'geica-32',
        isPublic: true,
        isAdult: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log('✅ テスト7成功: circlesコレクションに投入')
    } catch (error) {
      console.error('❌ テスト7失敗:', error)
    }
    
    console.log('\n🎉 Firebase接続テスト完了')
    
  } catch (error) {
    console.error('💥 Firebase接続テストでエラーが発生しました:', error)
    
    // エラーの詳細情報を表示
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message)
      console.error('エラースタック:', error.stack)
    }
    
    // Firebase特有のエラー情報
    if ('code' in error) {
      console.error('Firebaseエラーコード:', (error as any).code)
    }
    
    process.exit(1)
  }
}

// スクリプト実行
testFirebaseConnection()
  .then(() => {
    console.log('🏁 テスト完了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 予期しないエラー:', error)
    process.exit(1)
  })