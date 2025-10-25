import * as functions from "firebase-functions";
export { ogp, ogpHealthCheck } from "./ogp";
/**
 * ユーザーアカウント削除時に実行されるCloud Function
 * Firebase Authentication でユーザーが削除された時に自動実行
 */
export declare const deleteUserData: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
//# sourceMappingURL=index.d.ts.map