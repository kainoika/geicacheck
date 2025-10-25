import * as admin from "firebase-admin";
import { CircleData, EventData, OGPError } from "../types/ogp";

/**
 * サークルIDからサークルデータを取得
 * @param circleId サークルID
 * @returns サークルデータとイベントデータ
 * @throws OGPError サークルが見つからない場合またはFirestoreエラー
 */
export async function getCircleData(circleId: string): Promise<{ circle: CircleData; event: EventData }> {
  try {
    const db = admin.firestore();

    console.log(`📊 Fetching circle data for ID: ${circleId}`);

    // 全てのイベントから該当サークルを検索
    const eventsSnapshot = await db.collection('events').get();

    for (const eventDoc of eventsSnapshot.docs) {
      const eventData = eventDoc.data() as EventData;
      const eventId = eventDoc.id;

      console.log(`🔍 Searching in event: ${eventId}`);

      // イベント内のサークルを検索
      const circleDoc = await db
        .collection('events')
        .doc(eventId)
        .collection('circles')
        .doc(circleId)
        .get();

      if (circleDoc.exists) {
        const circleData = circleDoc.data() as CircleData;

        console.log(`✅ Circle found in event ${eventId}: ${circleData.circleName}`);

        return {
          circle: {
            ...circleData,
            eventId: eventId
          },
          event: {
            ...eventData,
            name: eventData.name || `イベント ${eventId}`,
            date: eventData.date || '',
            location: eventData.location || ''
          }
        };
      }
    }

    // サークルが見つからない場合
    console.log(`❌ Circle not found: ${circleId}`);
    throw new OGPError(
      `Circle not found: ${circleId}`,
      'CIRCLE_NOT_FOUND',
      { circleId }
    );

  } catch (error) {
    if (error instanceof OGPError) {
      throw error;
    }

    console.error('❌ Firestore error while fetching circle data:', error);
    throw new OGPError(
      'Failed to fetch circle data from Firestore',
      'FIRESTORE_ERROR',
      { circleId, originalError: error }
    );
  }
}

/**
 * イベントIDからイベントデータを取得
 * @param eventId イベントID
 * @returns イベントデータ
 */
export async function getEventData(eventId: string): Promise<EventData | null> {
  try {
    const db = admin.firestore();
    const eventDoc = await db.collection('events').doc(eventId).get();

    if (!eventDoc.exists) {
      console.log(`❌ Event not found: ${eventId}`);
      return null;
    }

    const eventData = eventDoc.data() as EventData;
    console.log(`✅ Event found: ${eventId} - ${eventData.name}`);

    return eventData;

  } catch (error) {
    console.error('❌ Error fetching event data:', error);
    return null;
  }
}

/**
 * サークルの存在チェック（軽量版）
 * @param circleId サークルID
 * @returns サークルが存在する場合true
 */
export async function circleExists(circleId: string): Promise<boolean> {
  try {
    const db = admin.firestore();
    const eventsSnapshot = await db.collection('events').get();

    for (const eventDoc of eventsSnapshot.docs) {
      const eventId = eventDoc.id;
      const circleDoc = await db
        .collection('events')
        .doc(eventId)
        .collection('circles')
        .doc(circleId)
        .get();

      if (circleDoc.exists) {
        return true;
      }
    }

    return false;

  } catch (error) {
    console.error('❌ Error checking circle existence:', error);
    return false;
  }
}

/**
 * Firestore接続テスト
 * @returns 接続テスト結果
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const db = admin.firestore();

    // 軽量なテストクエリ
    await db.collection('events').limit(1).get();

    console.log('✅ Firestore connection test successful');
    return true;

  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    return false;
  }
}