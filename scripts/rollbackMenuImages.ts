/**
 * ロールバックスクリプト: menuImages[] → menuImageUrl
 *
 * 新しいmenuImages[]（複数画像配列）を古いmenuImageUrl（単一画像URL）形式に戻します。
 * ⚠️ 注意: 複数画像がある場合、最初の1枚のみが保持されます。
 *
 * セットアップ:
 *   1. Firebase Console → プロジェクト設定 → サービスアカウント
 *   2. 「新しい秘密鍵の生成」をクリックしてJSONをダウンロード
 *   3. プロジェクトルートに serviceAccountKey.json として保存
 *
 * 使用方法:
 *   npm run rollback:menu-images          # 本番実行
 *   npm run rollback:menu-images --dry-run # ドライラン（実際の更新なし）
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { ServiceAccount } from 'firebase-admin';

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

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

/**
 * menuImages配列をmenuImageUrlに戻す
 */
async function rollbackMenuImages(dryRun = false) {
  console.log(`🔄 お品書き画像データを${dryRun ? '確認' : 'ロールバック'}します...`);
  if (dryRun) {
    console.log('📝 ドライランモード: 実際の更新は行いません\n');
  }

  console.log('⚠️  警告: 複数画像がある場合、最初の1枚のみが保持されます\n');

  try {
    // 全イベントを取得
    const eventsSnapshot = await db.collection('events').get();
    console.log(`📊 ${eventsSnapshot.size}件のイベントが見つかりました\n`);

    let totalRolledBack = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalMultipleImagesWarning = 0;

    for (const eventDoc of eventsSnapshot.docs) {
      const eventId = eventDoc.id;
      const eventData = eventDoc.data();
      console.log(`\n📅 イベント: ${eventData.name || eventId}`);

      // このイベントのサークルを取得
      const circlesRef = db.collection(`events/${eventId}/circles`);
      const circlesSnapshot = await circlesRef.get();

      console.log(`   サークル数: ${circlesSnapshot.size}件`);

      let eventRolledBack = 0;
      let eventSkipped = 0;
      let eventErrors = 0;
      let eventMultipleWarnings = 0;

      for (const circleDoc of circlesSnapshot.docs) {
        const circleData = circleDoc.data();
        const circleId = circleDoc.id;

        // menuImagesが存在し、menuImageUrlが未設定の場合のみロールバック
        if (circleData.menuImages && Array.isArray(circleData.menuImages) && circleData.menuImages.length > 0) {
          try {
            const menuImages: MenuImage[] = circleData.menuImages;

            // 複数画像の警告
            if (menuImages.length > 1) {
              eventMultipleWarnings++;
              console.log(
                `   ⚠️  ${circleData.circleName || circleId}: ${menuImages.length}枚の画像があります（最初の1枚のみ保持）`
              );
            }

            // 最初の画像のURLを取得
            const firstImageUrl = menuImages[0].url;

            if (!dryRun) {
              // Firestoreを更新
              await circleDoc.ref.update({
                menuImageUrl: firstImageUrl,
                menuImages: admin.firestore.FieldValue.delete(), // 新しいフィールドを削除
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }

            eventRolledBack++;
            console.log(
              `   ✅ ${circleData.circleName || circleId}: ${dryRun ? 'ロールバック可能' : 'ロールバック完了'}`
            );
          } catch (err) {
            eventErrors++;
            console.error(`   ❌ ${circleId}: エラー`, err);
          }
        } else if (circleData.menuImageUrl) {
          // すでにmenuImageUrlが設定されている
          eventSkipped++;
        } else {
          // menuImagesもmenuImageUrlも存在しない（画像なし）
          eventSkipped++;
        }
      }

      console.log(
        `   📈 ロールバック: ${eventRolledBack}件, スキップ: ${eventSkipped}件, エラー: ${eventErrors}件, 複数画像警告: ${eventMultipleWarnings}件`
      );

      totalRolledBack += eventRolledBack;
      totalSkipped += eventSkipped;
      totalErrors += eventErrors;
      totalMultipleImagesWarning += eventMultipleWarnings;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 ロールバック結果サマリー');
    console.log('='.repeat(50));
    console.log(`✅ ロールバック${dryRun ? '可能' : '完了'}: ${totalRolledBack}件`);
    console.log(`⏭️  スキップ: ${totalSkipped}件`);
    console.log(`❌ エラー: ${totalErrors}件`);
    console.log(`⚠️  複数画像警告: ${totalMultipleImagesWarning}件`);

    if (dryRun) {
      console.log('\n💡 本番実行するには --dry-run フラグを外してください');
    } else {
      console.log('\n🎉 ロールバックが完了しました！');
    }
  } catch (error) {
    console.error('❌ ロールバック中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// コマンドライン引数をチェック
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// 実行
rollbackMenuImages(dryRun)
  .then(() => {
    console.log('\n✨ スクリプトが正常に終了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 スクリプトが異常終了しました:', error);
    process.exit(1);
  });
