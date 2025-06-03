/**
 * 既存データをマルチイベント対応に移行するスクリプト
 * 現在のデータを「第1回芸カ」として設定し、eventIdを付与する
 */

import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  query,
  where 
} from 'firebase/firestore'

// Firebase設定（実際の設定値に置き換える）
const firebaseConfig = {
  apiKey: "AIzaSyDZiCCEOS59FBQ0XNbbHo6R27997JAA7gU",
  authDomain: "geikacheck.firebaseapp.com",
  projectId: "geikacheck",
  storageBucket: "geikacheck.firebasestorage.app",
  messagingSenderId: "77951626051",
  appId: "1:77951626051:web:cf4bfab4f52a244e385df6",
  measurementId: "G-CRR7WHLJBH"
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// 第1回芸カのイベントデータ
const GEIKA_1_EVENT = {
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
  isDefault: true,
  mapData: '', // 既存のマップデータがあれば設定
  createdAt: new Date('2025-06-02'),
  updatedAt: new Date()
}

/**
 * イベントデータを作成
 */
async function createGeika1Event() {
  console.log('🎪 第1回芸カイベントデータを作成中...')
  
  try {
    // 既に存在するかチェック
    const eventsRef = collection(db, 'events')
    const q = query(eventsRef, where('id', '==', 'geika-1'))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      console.log('✅ 第1回芸カイベントは既に存在します')
      return
    }
    
    // イベントを作成
    await addDoc(eventsRef, GEIKA_1_EVENT)
    console.log('✅ 第1回芸カイベントを作成しました')
    
  } catch (error) {
    console.error('❌ イベント作成エラー:', error)
    throw error
  }
}

/**
 * サークルデータにeventIdを追加
 */
async function migrateCircles() {
  console.log('📖 サークルデータを移行中...')
  
  try {
    const circlesRef = collection(db, 'circles')
    const snapshot = await getDocs(circlesRef)
    
    let migratedCount = 0
    let skippedCount = 0
    
    for (const circleDoc of snapshot.docs) {
      const data = circleDoc.data()
      
      // 既にeventIdが設定されている場合はスキップ
      if (data.eventId) {
        skippedCount++
        continue
      }
      
      // eventIdを追加
      await updateDoc(doc(db, 'circles', circleDoc.id), {
        eventId: 'geika-1',
        updatedAt: new Date()
      })
      
      migratedCount++
      
      // 進捗表示
      if (migratedCount % 10 === 0) {
        console.log(`📖 ${migratedCount}件のサークルを移行しました...`)
      }
    }
    
    console.log(`✅ サークル移行完了: ${migratedCount}件移行, ${skippedCount}件スキップ`)
    
  } catch (error) {
    console.error('❌ サークル移行エラー:', error)
    throw error
  }
}

/**
 * ブックマークデータにeventIdを追加
 */
async function migrateBookmarks() {
  console.log('⭐ ブックマークデータを移行中...')
  
  try {
    const bookmarksRef = collection(db, 'bookmarks')
    const snapshot = await getDocs(bookmarksRef)
    
    let migratedCount = 0
    let skippedCount = 0
    
    for (const bookmarkDoc of snapshot.docs) {
      const data = bookmarkDoc.data()
      
      // 既にeventIdが設定されている場合はスキップ
      if (data.eventId) {
        skippedCount++
        continue
      }
      
      // eventIdを追加
      await updateDoc(doc(db, 'bookmarks', bookmarkDoc.id), {
        eventId: 'geika-1',
        updatedAt: new Date()
      })
      
      migratedCount++
      
      // 進捗表示
      if (migratedCount % 50 === 0) {
        console.log(`⭐ ${migratedCount}件のブックマークを移行しました...`)
      }
    }
    
    console.log(`✅ ブックマーク移行完了: ${migratedCount}件移行, ${skippedCount}件スキップ`)
    
  } catch (error) {
    console.error('❌ ブックマーク移行エラー:', error)
    throw error
  }
}

/**
 * 編集権限申請データにeventIdを追加（オプション）
 */
async function migrateEditPermissions() {
  console.log('✏️ 編集権限申請データを移行中...')
  
  try {
    const permissionsRef = collection(db, 'editPermissionRequests')
    const snapshot = await getDocs(permissionsRef)
    
    let migratedCount = 0
    let skippedCount = 0
    
    for (const permissionDoc of snapshot.docs) {
      const data = permissionDoc.data()
      
      // 既にeventIdが設定されている場合はスキップ
      if (data.eventId) {
        skippedCount++
        continue
      }
      
      // eventIdを追加
      await updateDoc(doc(db, 'editPermissionRequests', permissionDoc.id), {
        eventId: 'geika-1',
        updatedAt: new Date()
      })
      
      migratedCount++
    }
    
    console.log(`✅ 編集権限申請移行完了: ${migratedCount}件移行, ${skippedCount}件スキップ`)
    
  } catch (error) {
    console.error('❌ 編集権限申請移行エラー:', error)
    throw error
  }
}

/**
 * 統計情報を生成
 */
async function generateEventStats() {
  console.log('📊 イベント統計情報を生成中...')
  
  try {
    // サークル数を取得
    const circlesRef = collection(db, 'circles')
    const circlesQuery = query(circlesRef, where('eventId', '==', 'geika-1'))
    const circlesSnapshot = await getDocs(circlesQuery)
    const totalCircles = circlesSnapshot.size
    
    // ブックマーク数を取得
    const bookmarksRef = collection(db, 'bookmarks')
    const bookmarksQuery = query(bookmarksRef, where('eventId', '==', 'geika-1'))
    const bookmarksSnapshot = await getDocs(bookmarksQuery)
    
    // カテゴリ別ブックマーク数を計算
    const bookmarksByCategory = {
      check: 0,
      interested: 0,
      priority: 0
    }
    
    bookmarksSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.category && bookmarksByCategory.hasOwnProperty(data.category)) {
        bookmarksByCategory[data.category as keyof typeof bookmarksByCategory]++
      }
    })
    
    // ユーザー数を取得（概算）
    const userIds = new Set()
    bookmarksSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.userId) {
        userIds.add(data.userId)
      }
    })
    
    const stats = {
      eventId: 'geika-1',
      totalCircles,
      totalUsers: userIds.size,
      totalBookmarks: bookmarksSnapshot.size,
      bookmarksByCategory,
      updatedAt: new Date()
    }
    
    // 統計情報を保存
    const statsRef = collection(db, 'eventStats')
    await addDoc(statsRef, stats)
    
    console.log('✅ 統計情報を生成しました:', stats)
    
  } catch (error) {
    console.error('❌ 統計情報生成エラー:', error)
    throw error
  }
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🚀 マルチイベント対応移行スクリプトを開始します...')
  console.log('⚠️  このスクリプトは本番データを変更します。実行前にバックアップを取ってください。')
  
  try {
    // 1. 第1回芸カイベントを作成
    await createGeika1Event()
    
    // 2. サークルデータを移行
    //await migrateCircles()
    
    // 3. ブックマークデータを移行
    //await migrateBookmarks()
    
    // 4. 編集権限申請データを移行（オプション）
    //await migrateEditPermissions()
    
    // 5. 統計情報を生成
    //await generateEventStats()
    
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

// 実行確認
main()

export { main as migrateToMultiEvent }