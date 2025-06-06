import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, collection, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import type { Circle, User, Event, Bookmark, CirclePermission } from '../types/index'

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
const auth = getAuth(app)
const storage = getStorage(app)

// Emulatorに接続
try {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectStorageEmulator(storage, 'localhost', 9199)
  console.log('🔌 Emulatorに接続しました')
} catch (error) {
  console.log('⚠️ Emulatorは既に接続済みです')
}

// サンプルデータ
const sampleCircles: Circle[] = [
  {
    id: 'circle-001',
    circleName: '星宮いちごファンクラブ',
    circleKana: 'ほしみやいちごふぁんくらぶ',
    penName: '星野あかり',
    penNameKana: 'ほしのあかり',
    genre: ['グッズ', 'イラスト'],
    placement: {
      block: 'A',
      number1: '01',
      number2: 'a'
    },
    description: '星宮いちごちゃんのオリジナルグッズとイラスト本を頒布します！アクリルキーホルダーやステッカーなど。',
    contact: {
      twitter: 'ichigo_fan_club',
      pixiv: '12345678',
      oshinaUrl: 'https://ichigo-fan.example.com'
    },
    isAdult: false,
    ownerId: 'user-001',
    isPublic: true,
    eventId: 'geika-32',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'circle-002',
    circleName: '霧矢あおい研究所',
    circleKana: 'きりやあおいけんきゅうじょ',
    penName: 'あおい愛好家',
    penNameKana: 'あおいあいこうか',
    genre: ['漫画', '小説'],
    placement: {
      block: 'B',
      number1: '15',
      number2: 'b'
    },
    description: '霧矢あおいちゃんの魅力を研究し、漫画と小説で表現しています。今回は新刊「あおいの日常」を頒布予定。',
    contact: {
      twitter: 'aoi_laboratory',
      pixiv: '87654321'
    },
    isAdult: false,
    ownerId: 'user-002',
    isPublic: true,
    eventId: 'geika-32',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'circle-003',
    circleName: '紫吹蘭アンソロジー',
    circleKana: 'しぶきらんあんそろじー',
    penName: '蘭々',
    penNameKana: 'らんらん',
    genre: ['アンソロジー', 'イラスト'],
    placement: {
      block: 'C',
      number1: '08',
      number2: 'a'
    },
    description: '紫吹蘭ちゃんのアンソロジー本とイラスト集。複数の作家さんによる合同誌です。',
    contact: {
      twitter: 'ran_anthology',
      pixiv: '11223344',
      oshinaUrl: 'https://ran-anthology.example.com'
    },
    isAdult: false,
    isPublic: true,
    eventId: 'geika-32',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'circle-004',
    circleName: '有栖川おとめワールド',
    circleKana: 'ありすがわおとめわーるど',
    penName: 'おとめ推し',
    penNameKana: 'おとめおし',
    genre: ['グッズ', 'アクセサリー'],
    placement: {
      block: 'A',
      number1: '25',
      number2: 'b'
    },
    description: '有栖川おとめちゃんをイメージしたアクセサリーとオリジナルグッズ。可愛いピンク系アイテム多数！',
    contact: {
      twitter: 'otome_world',
      pixiv: '55667788'
    },
    isAdult: false,
    isPublic: true,
    eventId: 'geika-32',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'circle-005',
    circleName: 'ソレイユ総合研究所',
    circleKana: 'それいゆそうごうけんきゅうじょ',
    penName: 'ソレイユ博士',
    penNameKana: 'それいゆはかせ',
    genre: ['評論', '資料集'],
    placement: {
      block: 'D',
      number1: '12',
      number2: 'a'
    },
    description: 'ソレイユについての考察本と資料集。アイカツ！の世界観を深く掘り下げた評論誌。',
    contact: {
      twitter: 'soleil_lab',
      pixiv: '99887766',
      oshinaUrl: 'https://soleil-research.example.com'
    },
    isAdult: false,
    isPublic: true,
    eventId: 'geika-32',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const sampleUsers: User[] = [
  {
    uid: 'user-001',
    email: 'akari@example.com',
    displayName: '星野あかり',
    photoURL: '',
    userType: 'circle',
    twitterId: 'ichigo_fan_club',
    twitterUsername: 'ichigo_fan_club',
    settings: {
      emailNotifications: true,
      adultContent: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    uid: 'user-002',
    email: 'aoi@example.com',
    displayName: 'あおい愛好家',
    photoURL: '',
    userType: 'circle',
    twitterId: 'aoi_laboratory',
    twitterUsername: 'aoi_laboratory',
    settings: {
      emailNotifications: true,
      adultContent: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    uid: 'admin-001',
    email: 'admin@example.com',
    displayName: '管理者',
    photoURL: '',
    userType: 'admin',
    twitterId: 'geika_admin',
    twitterUsername: 'geika_admin',
    settings: {
      emailNotifications: true,
      adultContent: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const sampleEvents: Event[] = [
  {
    id: 'geika-32',
    name: '第32回 芸能人はカードが命！',
    shortName: '芸カ32',
    eventDate: new Date('2024-06-15'),
    venue: {
      name: '東京流通センター',
      address: '東京都大田区平和島6-1-1',
      accessInfo: 'りんかい線「国際展示場駅」より徒歩13分\n東京モノレール「流通センター駅」より徒歩5分'
    },
    description: 'アイカツ！シリーズオンリー同人イベント。アイカツ！、アイカツスターズ！、アイカツフレンズ！、アイカツオンパレード！、アイカツプラネット！の全シリーズ対応。',
    status: 'active',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const sampleBookmarks: Omit<Bookmark, 'id'>[] = [
  {
    userId: 'user-001',
    eventId: 'geika-32',
    circleId: 'circle-002',
    category: 'check',
    memo: 'あおいちゃんの新刊楽しみ！',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: 'user-001',
    eventId: 'geika-32',
    circleId: 'circle-003',
    category: 'interested',
    memo: 'アンソロジー気になる',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: 'admin-001',
    eventId: 'geika-32',
    circleId: 'circle-001',
    category: 'priority',
    memo: '管理者チェック用',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const samplePermissions: CirclePermission[] = [
  {
    id: 'user-001_geika-32_circle-001',
    userId: 'user-001',
    circleId: 'circle-001',
    permission: 'owner',
    grantedAt: new Date(),
    grantedBy: 'system',
    isActive: true
  },
  {
    id: 'user-002_geika-32_circle-002',
    userId: 'user-002',
    circleId: 'circle-002',
    permission: 'owner',
    grantedAt: new Date(),
    grantedBy: 'system',
    isActive: true
  }
]

// DateをTimestampに変換するヘルパー関数
function convertDatesToTimestamps(obj: any): any {
  if (obj instanceof Date) {
    return Timestamp.fromDate(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToTimestamps)
  }
  if (obj && typeof obj === 'object') {
    const converted: any = {}
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDatesToTimestamps(value)
    }
    return converted
  }
  return obj
}

async function seedData() {
  console.log('🌱 Emulator用サンプルデータを登録中...')

  try {
    // イベントデータ
    console.log('📅 イベントデータを登録中...')
    for (const event of sampleEvents) {
      const convertedEvent = convertDatesToTimestamps(event)
      console.log(`  - ${event.name} を登録中...`)
      await setDoc(doc(db, 'events', event.id), convertedEvent)
      console.log(`  ✓ ${event.name} 登録完了`)
    }

    // サークルデータ
    console.log('🎪 サークルデータを登録中...')
    for (const circle of sampleCircles) {
      const convertedCircle = convertDatesToTimestamps(circle)
      console.log(`  - ${circle.circleName} を登録中...`)
      await setDoc(doc(db, 'events', 'geika-32', 'circles', circle.id), convertedCircle)
      console.log(`  ✓ ${circle.circleName} 登録完了`)
    }

    // ユーザーデータ
    console.log('👤 ユーザーデータを登録中...')
    for (const user of sampleUsers) {
      const convertedUser = convertDatesToTimestamps(user)
      console.log(`  - ${user.displayName} を登録中...`)
      await setDoc(doc(db, 'users', user.uid), convertedUser)
      console.log(`  ✓ ${user.displayName} 登録完了`)
    }

    // ブックマークデータ
    console.log('🔖 ブックマークデータを登録中...')
    for (const bookmark of sampleBookmarks) {
      const convertedBookmark = convertDatesToTimestamps(bookmark)
      console.log(`  - ブックマーク (${bookmark.circleId}) を登録中...`)
      const docRef = await addDoc(collection(db, 'events', bookmark.eventId, 'bookmarks'), convertedBookmark)
      console.log(`  ✓ ブックマーク ID: ${docRef.id} 登録完了`)
    }

    // サークル権限データ
    console.log('🔑 権限データを登録中...')
    for (const permission of samplePermissions) {
      const convertedPermission = convertDatesToTimestamps(permission)
      console.log(`  - 権限 (${permission.id}) を登録中...`)
      await setDoc(doc(db, 'circle_permissions', permission.id), convertedPermission)
      console.log(`  ✓ 権限 ${permission.id} 登録完了`)
    }

    console.log('✅ サンプルデータの登録が完了しました！')
    console.log('')
    console.log('📊 登録されたデータ:')
    console.log(`  - イベント: ${sampleEvents.length}件`)
    console.log(`  - サークル: ${sampleCircles.length}件`)
    console.log(`  - ユーザー: ${sampleUsers.length}件`)
    console.log(`  - ブックマーク: ${sampleBookmarks.length}件`)
    console.log(`  - 権限: ${samplePermissions.length}件`)
    console.log('')
    console.log('🌐 Emulator UI: http://localhost:4000')
    console.log('🔥 Firestore: http://localhost:4000/firestore')
    console.log('🔐 Authentication: http://localhost:4000/auth')

  } catch (error) {
    console.error('❌ データ登録中にエラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
seedData()
  .then(() => {
    console.log('🎉 シードスクリプト完了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 シードスクリプトでエラー:', error)
    process.exit(1)
  })