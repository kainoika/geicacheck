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
  // プロジェクトの設定値
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// 第1回芸カのイベントデータ
const GEIKA_1_EVENT = {
  id: 'geika-1',
  name: '第1回 芸能人はカードが命！',
  shortName: '芸カ1',
  eventDate: new Date('2025-06-15'),
  venue: {
    name: '東京ビッグサイト',
    address: '東京都江東区有明3-11-1',
    accessInfo: 'ゆりかもめ「国際展示場正門駅」徒歩3分'
  },
  description: 'アイカツ！シリーズオンリー同人イベント第1回',
  status: 'completed',
  registrationPeriod: {
    start: new Date('2025-04-01'),
    end: new Date('2025-05-15')
  },
  isDefault: false, // 第2回が開催中の場合
  mapData: '', // 既存のマップデータがあれば設定
  createdAt: new Date('2025-03-01'),
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
    await migrateCircles()
    
    // 3. ブックマークデータを移行
    await migrateBookmarks()
    
    // 4. 編集権限申請データを移行（オプション）
    await migrateEditPermissions()
    
    // 5. 統計情報を生成
    await generateEventStats()
    
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
if (require.main === module) {
  console.log('このスクリプトを実行しますか？ (y/N)')
  process.stdin.setEncoding('utf8')
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk !== null) {
      const input = chunk.trim().toLowerCase()
      if (input === 'y' || input === 'yes') {
        main()
      } else {
        console.log('移行をキャンセルしました。')
        process.exit(0)
      }
    }
  })
}

export { main as migrateToMultiEvent }