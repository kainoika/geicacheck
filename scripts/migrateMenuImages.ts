/**
 * データ移行スクリプト: menuImageUrl → menuImages[]
 *
 * 既存のmenuImageUrl（単一画像URL）を新しいmenuImages[]（複数画像配列）形式に移行します。
 *
 * セットアップ:
 *   1. Firebase Console → プロジェクト設定 → サービスアカウント
 *   2. 「新しい秘密鍵の生成」をクリックしてJSONをダウンロード
 *   3. プロジェクトルートに serviceAccountKey.json として保存
 *
 * 使用方法:
 *   npm run migrate:menu-images          # 本番実行
 *   npm run migrate:menu-images --dry-run # ドライラン（実際の更新なし）
 */

import * as admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface MenuImage {
  id: string;
  url: string;
  order: number;
  uploadedAt: any;
  fileSize?: number;
  fileName?: string;
}

// サービスアカウントキーのパス
const serviceAccountPath = resolve(process.cwd(), 'serviceAccountKey.json');

// Firebase Admin SDK初期化
if (!existsSync(serviceAccountPath)) {
  console.error('❌ エラー: serviceAccountKey.json が見つかりません');
  console.error('');
  console.error('セットアップ手順:');
  console.error('1. Firebase Console → プロジェクト設定 → サービスアカウント');
  console.error('2. 「新しい秘密鍵の生成」をクリック');
  console.error('3. ダウンロードしたJSONファイルを serviceAccountKey.json としてプロジェクトルートに保存');
  console.error('');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * menuImageUrlをmenuImages配列に移行
 */
async function migrateMenuImages(dryRun = false) {
  console.log(`🔄 お品書き画像データを${dryRun ? '確認' : '移行'}します...`);
  if (dryRun) {
    console.log('📝 ドライランモード: 実際の更新は行いません\n');
  }

  try {
    // 全イベントを取得
    const eventsSnapshot = await db.collection('events').get();
    console.log(`📊 ${eventsSnapshot.size}件のイベントが見つかりました\n`);

    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const eventDoc of eventsSnapshot.docs) {
      const eventId = eventDoc.id;
      const eventData = eventDoc.data();
      console.log(`\n📅 イベント: ${eventData.name || eventId}`);

      // このイベントのサークルを取得
      const circlesRef = db.collection(`events/${eventId}/circles`);
      const circlesSnapshot = await circlesRef.get();

      console.log(`   サークル数: ${circlesSnapshot.size}件`);

      let eventMigrated = 0;
      let eventSkipped = 0;
      let eventErrors = 0;

      for (const circleDoc of circlesSnapshot.docs) {
        const circleData = circleDoc.data();
        const circleId = circleDoc.id;

        // menuImageUrlが存在し、menuImagesが未設定の場合のみ移行
        if (circleData.menuImageUrl && !circleData.menuImages) {
          try {
            const menuImageUrl = circleData.menuImageUrl;

            // menuImages配列を作成
            const menuImages: MenuImage[] = [
              {
                id: `menu_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                url: menuImageUrl,
                order: 0,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                // 既存画像はサイズとファイル名が不明
              },
            ];

            if (!dryRun) {
              // Firestoreを更新
              await circleDoc.ref.update({
                menuImages: menuImages,
                menuImageUrl: admin.firestore.FieldValue.delete(), // 古いフィールドを削除
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }

            eventMigrated++;
            console.log(
              `   ✅ ${circleData.circleName || circleId}: ${dryRun ? '移行可能' : '移行完了'}`
            );
          } catch (err) {
            eventErrors++;
            console.error(`   ❌ ${circleId}: エラー`, err);
          }
        } else if (circleData.menuImages) {
          // すでにmenuImagesが設定されている
          eventSkipped++;
        } else {
          // menuImageUrlもmenuImagesも存在しない（画像なし）
          eventSkipped++;
        }
      }

      console.log(
        `   📈 移行: ${eventMigrated}件, スキップ: ${eventSkipped}件, エラー: ${eventErrors}件`
      );

      totalMigrated += eventMigrated;
      totalSkipped += eventSkipped;
      totalErrors += eventErrors;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 移行結果サマリー');
    console.log('='.repeat(50));
    console.log(`✅ 移行${dryRun ? '可能' : '完了'}: ${totalMigrated}件`);
    console.log(`⏭️  スキップ: ${totalSkipped}件`);
    console.log(`❌ エラー: ${totalErrors}件`);

    if (dryRun) {
      console.log('\n💡 本番実行するには --dry-run フラグを外してください');
    } else {
      console.log('\n🎉 移行が完了しました！');
    }
  } catch (error) {
    console.error('❌ 移行中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// コマンドライン引数をチェック
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// 実行
migrateMenuImages(dryRun)
  .then(() => {
    console.log('\n✨ スクリプトが正常に終了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 スクリプトが異常終了しました:', error);
    process.exit(1);
  });
