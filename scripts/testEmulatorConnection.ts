import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'

// Emulator用のFirebase設定
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Emulatorに接続
try {
  connectFirestoreEmulator(db, 'localhost', 8080)
  console.log('🔌 Firestore Emulatorに接続しました')
} catch (error) {
  console.log('⚠️ Emulatorは既に接続済みです')
}

async function testConnection() {
  console.log('🧪 Emulator接続テストを開始...')

  try {
    // テストデータを書き込み
    const testDoc = {
      name: 'テストドキュメント',
      timestamp: Timestamp.now(),
      number: 123,
      array: ['test1', 'test2'],
      nested: {
        field1: 'value1',
        field2: true
      }
    }

    console.log('📝 テストドキュメントを書き込み中...')
    await setDoc(doc(db, 'test', 'test-doc'), testDoc)
    console.log('✓ 書き込み完了')

    // テストデータを読み取り
    console.log('📖 テストドキュメントを読み取り中...')
    const docSnapshot = await getDoc(doc(db, 'test', 'test-doc'))
    
    if (docSnapshot.exists()) {
      console.log('✓ 読み取り完了')
      console.log('📄 ドキュメントデータ:', docSnapshot.data())
    } else {
      console.log('❌ ドキュメントが見つかりません')
    }

    console.log('')
    console.log('✅ Emulator接続テスト成功！')
    console.log('🌐 Emulator UI: http://localhost:4000')
    console.log('🔥 Firestore: http://localhost:4000/firestore')
    console.log('')
    console.log('💡 次に以下を確認してください:')
    console.log('  1. Emulator UIでtest/test-docが作成されているか')
    console.log('  2. データの内容が正しく表示されているか')

  } catch (error) {
    console.error('❌ 接続テストでエラーが発生しました:', error)
    console.log('')
    console.log('🔧 トラブルシューティング:')
    console.log('  1. Emulatorが起動しているか確認: npm run emulators:start')
    console.log('  2. ポート8080がFirestore Emulatorで使用されているか確認')
    console.log('  3. firebase.jsonの設定を確認')
    process.exit(1)
  }
}

// テスト実行
testConnection()
  .then(() => {
    console.log('🎉 テスト完了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 テストでエラー:', error)
    process.exit(1)
  })