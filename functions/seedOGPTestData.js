const admin = require('firebase-admin');

// Firebase Admin SDK初期化（エミュレータ用）
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

admin.initializeApp({
  projectId: 'geikacheck'
});

const db = admin.firestore();

/**
 * OGPテスト用のサンプルデータを作成
 */
async function seedOGPTestData() {
  console.log('🌱 Seeding OGP test data to Firestore emulator...');

  try {
    // テスト用イベントデータ
    const eventData = {
      name: 'ゲイカ6',
      date: '2024-12-29',
      location: 'ビッグサイト東1・2ホール',
      status: 'active',
      mapImageUrl: 'https://example.com/map.png',
      description: 'アイカツ！オンリーイベント',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    console.log('📅 Creating test event: geica-6');
    await db.collection('events').doc('geica-6').set(eventData);

    // テスト用サークルデータ
    const testCircles = [
      {
        id: 'test-circle-1',
        data: {
          circleName: 'テストサークル1',
          penName: 'テスト作者1',
          description: 'これはOGPテスト用のサンプルサークルです。アイカツ！の二次創作を制作しています。',
          genre: ['イラスト本', 'グッズ'],
          isAdult: false,
          placement: 'A01a',
          circleCutImageUrl: 'https://via.placeholder.com/400x300/ec4899/white?text=%E3%83%86%E3%82%B9%E3%83%88%E3%82%B5%E3%83%BC%E3%82%AF%E3%83%AB1',
          contact: {
            twitter: 'https://twitter.com/test_circle1',
            pixiv: 'https://www.pixiv.net/users/12345',
            oshinaUrl: 'https://example.com/oshina1'
          },
          eventId: 'geica-6',
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      },
      {
        id: 'test-circle-2',
        data: {
          circleName: 'テストサークル2（成人向け）',
          penName: 'テスト作者2',
          description: 'OGPテスト用の成人向けサークルです。',
          genre: ['漫画', '小説'],
          isAdult: true,
          placement: 'B15b',
          circleCutImageUrl: 'https://via.placeholder.com/400x300/f97316/white?text=%E3%83%86%E3%82%B9%E3%83%88%E3%82%B5%E3%83%BC%E3%82%AF%E3%83%AB2',
          contact: {
            twitter: 'https://twitter.com/test_circle2',
            pixiv: 'https://www.pixiv.net/users/67890'
          },
          eventId: 'geica-6',
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      },
      {
        id: 'test-circle-no-image',
        data: {
          circleName: '画像なしサークル',
          penName: 'テスト作者3',
          description: 'サークルカット画像がないケースのテスト用サークルです。',
          genre: ['コスプレ'],
          isAdult: false,
          placement: 'C03a',
          circleCutImageUrl: null, // 画像なし
          contact: {
            twitter: 'https://twitter.com/test_circle3'
          },
          eventId: 'geica-6',
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      }
    ];

    // サークルデータを作成
    for (const circle of testCircles) {
      console.log(`🎪 Creating test circle: ${circle.id} - ${circle.data.circleName}`);

      await db
        .collection('events')
        .doc('geica-6')
        .collection('circles')
        .doc(circle.id)
        .set(circle.data);
    }

    console.log('✅ OGP test data seeding completed successfully!');
    console.log('\n📊 Created data:');
    console.log('   Event: geica-6');
    console.log(`   Circles: ${testCircles.length} test circles`);
    console.log('\n🧪 Test URLs:');
    testCircles.forEach(circle => {
      console.log(`   http://127.0.0.1:5001/geikacheck/asia-northeast1/ogp/circles/${circle.id}`);
    });

    console.log('\n🤖 Test with different User-Agents:');
    console.log('   - Twitterbot/1.0 (should return OGP HTML)');
    console.log('   - Mozilla/5.0 ... (should redirect to SPA)');

  } catch (error) {
    console.error('❌ Error seeding OGP test data:', error);
    throw error;
  } finally {
    console.log('\n🏁 Test data seeding process completed');
    process.exit(0);
  }
}

// メイン実行
seedOGPTestData().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});