import { CircleData, EventData } from "../types/ogp";
/**
 * サークルIDからサークルデータを取得
 * @param circleId サークルID
 * @returns サークルデータとイベントデータ
 * @throws OGPError サークルが見つからない場合またはFirestoreエラー
 */
export declare function getCircleData(circleId: string): Promise<{
    circle: CircleData;
    event: EventData;
}>;
/**
 * イベントIDからイベントデータを取得
 * @param eventId イベントID
 * @returns イベントデータ
 */
export declare function getEventData(eventId: string): Promise<EventData | null>;
/**
 * サークルの存在チェック（軽量版）
 * @param circleId サークルID
 * @returns サークルが存在する場合true
 */
export declare function circleExists(circleId: string): Promise<boolean>;
/**
 * Firestore接続テスト
 * @returns 接続テスト結果
 */
export declare function testFirestoreConnection(): Promise<boolean>;
//# sourceMappingURL=firestoreClient.d.ts.map