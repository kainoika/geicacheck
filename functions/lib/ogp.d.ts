import * as functions from "firebase-functions";
/**
 * OGP対応のCloud Function
 * Botからのリクエストに対してサーバーサイドレンダリングでOGPタグ付きHTMLを返す
 * 通常のユーザーリクエストはSPAにリダイレクト
 */
export declare const ogp: functions.HttpsFunction;
/**
 * OGPヘルスチェック用エンドポイント
 */
export declare const ogpHealthCheck: functions.HttpsFunction;
//# sourceMappingURL=ogp.d.ts.map