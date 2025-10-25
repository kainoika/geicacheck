"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OGPError = exports.DEFAULT_OGP = exports.BOT_USER_AGENTS = void 0;
/**
 * Bot User-Agentの判定パターン
 */
exports.BOT_USER_AGENTS = [
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'slackbot',
    'discordbot',
    'whatsapp',
    'telegrambot',
    'skype',
    'googlebot',
    'bingbot',
    'yandexbot',
    'baiduspider',
    'applebot',
    'ia_archiver'
];
/**
 * デフォルトOGPデータ
 */
exports.DEFAULT_OGP = {
    siteName: 'ゲイカチェック',
    type: 'website',
    image: 'https://geicacheck.com/default-ogp-image.png', // デフォルト画像
    description: 'アイカツ同人誌イベントのサークル情報をチェック'
};
/**
 * OGP生成エラーの型定義
 */
class OGPError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'OGPError';
    }
}
exports.OGPError = OGPError;
//# sourceMappingURL=ogp.js.map