import * as functions from "firebase-functions";
/**
 * リクエストがBotからのものかを判定する
 * @param request HTTPSリクエストオブジェクト
 * @returns Botの場合true、通常のユーザーの場合false
 */
export declare function isBotRequest(request: functions.https.Request): boolean;
/**
 * Bot判定の詳細情報を取得
 * @param request HTTPSリクエストオブジェクト
 * @returns Bot判定の詳細情報
 */
export declare function getBotDetectionDetails(request: functions.https.Request): {
    userAgent: string;
    acceptHeader: string;
    referer: string;
    isBot: boolean;
    timestamp: string;
};
/**
 * Twitterボット専用の判定
 * @param request HTTPSリクエストオブジェクト
 * @returns Twitterボットの場合true
 */
export declare function isTwitterBot(request: functions.https.Request): boolean;
/**
 * Facebookボット専用の判定
 * @param request HTTPSリクエストオブジェクト
 * @returns Facebookボットの場合true
 */
export declare function isFacebookBot(request: functions.https.Request): boolean;
//# sourceMappingURL=botDetector.d.ts.map