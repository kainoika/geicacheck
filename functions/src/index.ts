import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Firebase Admin SDK初期化
admin.initializeApp();

/**
 * ユーザーアカウント削除時に実行されるCloud Function
 * Firebase Authentication でユーザーが削除された時に自動実行
 */
export const deleteUserData = functions
  .region("asia-northeast1") // 東京リージョン
  .auth.user()
  .onDelete(async (user) => {
    const userId = user.uid;
    console.log(`🗑️ Starting account deletion for user: ${userId}`);

    try {
      // 削除開始ログ
      await logDeletionStart(userId);

      // 1. Firestoreデータ削除
      console.log("📂 Deleting Firestore data...");
      await deleteFirestoreData(userId);

      // 2. Cloud Storageデータ削除（将来実装）
      // console.log("📁 Deleting Cloud Storage data...");
      // await deleteStorageData(userId);

      // 3. 削除完了ログ
      await logDeletionComplete(userId);

      console.log(`✅ Account deletion completed successfully for user: ${userId}`);
    } catch (error) {
      console.error(`❌ Account deletion failed for user: ${userId}`, error);
      
      // エラーログ記録
      await logDeletionError(userId, error);
      
      // エラーを再スローして関数を失敗させる
      throw error;
    }
  });

/**
 * Firestoreからユーザー関連データを削除
 */
async function deleteFirestoreData(userId: string): Promise<void> {
  const db = admin.firestore();
  const batch = db.batch();
  let operationCount = 0;
  const MAX_BATCH_SIZE = 500;

  try {
    // 1. ユーザーのサブコレクション削除
    console.log("📚 Deleting user bookmarks...");
    operationCount += await addCollectionDeleteToBatch(
      batch, 
      `users/${userId}/bookmarks`, 
      operationCount,
      MAX_BATCH_SIZE
    );

    console.log("💰 Deleting purchase plans...");
    operationCount += await addCollectionDeleteToBatch(
      batch, 
      `users/${userId}/purchase_plans`, 
      operationCount,
      MAX_BATCH_SIZE
    );

    console.log("💳 Deleting budget summaries...");
    operationCount += await addCollectionDeleteToBatch(
      batch, 
      `users/${userId}/budget_summaries`, 
      operationCount,
      MAX_BATCH_SIZE
    );

    // バッチ実行（サブコレクション）
    if (operationCount > 0) {
      await batch.commit();
      console.log(`🔄 Committed ${operationCount} subcollection deletions`);
    }

    // 2. 他のコレクションから該当データ削除
    await deleteUserDataFromCollections(userId);

    // 3. ユーザードキュメント削除（最後）
    console.log("👤 Deleting user document...");
    await db.doc(`users/${userId}`).delete();

    console.log("✅ All Firestore data deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting Firestore data:", error);
    throw error;
  }
}

/**
 * サブコレクションの削除をバッチに追加
 */
async function addCollectionDeleteToBatch(
  batch: admin.firestore.WriteBatch,
  collectionPath: string,
  currentOperationCount: number,
  maxBatchSize: number
): Promise<number> {
  const db = admin.firestore();
  const collectionRef = db.collection(collectionPath);
  
  const snapshot = await collectionRef.get();
  let operationCount = 0;

  snapshot.docs.forEach((doc) => {
    if (currentOperationCount + operationCount < maxBatchSize) {
      batch.delete(doc.ref);
      operationCount++;
    }
  });

  console.log(`📋 Added ${operationCount} documents from ${collectionPath} to batch`);
  return operationCount;
}

/**
 * 他のコレクションからユーザーデータを削除
 */
async function deleteUserDataFromCollections(userId: string): Promise<void> {
  const db = admin.firestore();
  
  const collections = [
    "edit_permission_requests",
    "circle_permissions", 
    "notifications",
    "eventHistory"
  ];

  for (const collectionName of collections) {
    try {
      console.log(`🔍 Deleting from ${collectionName}...`);
      
      const querySnapshot = await db
        .collection(collectionName)
        .where("userId", "==", userId)
        .get();

      if (querySnapshot.empty) {
        console.log(`✅ No documents found in ${collectionName}`);
        continue;
      }

      const batch = db.batch();
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`✅ Deleted ${querySnapshot.docs.length} documents from ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error deleting from ${collectionName}:`, error);
      // 個別のコレクション削除エラーは警告として扱い、処理を続行
      console.warn(`⚠️ Continuing deletion process despite error in ${collectionName}`);
    }
  }
}

/**
 * 削除開始ログを記録
 */
async function logDeletionStart(userId: string): Promise<void> {
  try {
    const db = admin.firestore();
    await db.collection("deletion_logs").add({
      userId,
      status: "started",
      timestamp: admin.firestore.Timestamp.now(),
      message: "Account deletion process started"
    });
  } catch (error) {
    console.error("Failed to log deletion start:", error);
    // ログ記録失敗は処理を停止させない
  }
}

/**
 * 削除完了ログを記録
 */
async function logDeletionComplete(userId: string): Promise<void> {
  try {
    const db = admin.firestore();
    await db.collection("deletion_logs").add({
      userId,
      status: "completed",
      timestamp: admin.firestore.Timestamp.now(),
      message: "Account deletion process completed successfully"
    });
  } catch (error) {
    console.error("Failed to log deletion completion:", error);
    // ログ記録失敗は処理を停止させない
  }
}

/**
 * 削除エラーログを記録
 */
async function logDeletionError(userId: string, error: any): Promise<void> {
  try {
    const db = admin.firestore();
    await db.collection("deletion_logs").add({
      userId,
      status: "failed",
      timestamp: admin.firestore.Timestamp.now(),
      message: "Account deletion process failed",
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    });
  } catch (logError) {
    console.error("Failed to log deletion error:", logError);
    // ログ記録失敗は処理を停止させない
  }
}