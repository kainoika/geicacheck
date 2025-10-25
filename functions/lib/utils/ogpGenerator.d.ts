import { OGPData, CircleData, EventData } from "../types/ogp";
/**
 * サークルデータからOGPデータを生成
 * @param circle サークルデータ
 * @param event イベントデータ
 * @param circleId サークルID
 * @returns OGPデータ
 */
export declare function generateOGPData(circle: CircleData, event: EventData, circleId: string): OGPData;
/**
 * OGPデータからHTMLを生成
 * @param ogpData OGPデータ
 * @param circleId サークルID（デバッグ用）
 * @returns HTML文字列
 */
export declare function generateOGPHTML(ogpData: OGPData, circleId: string): string;
/**
 * エラー用のHTMLを生成
 * @param error エラーメッセージ
 * @param circleId サークルID
 * @returns エラー用HTML文字列
 */
export declare function generateErrorHTML(error: string, circleId?: string): string;
//# sourceMappingURL=ogpGenerator.d.ts.map