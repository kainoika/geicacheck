/**
 * OGP（Open Graph Protocol）データの型定義
 */
export interface OGPData {
    /** サークル名（OGタイトル用） */
    title: string;
    /** サークル説明文（OG説明用） */
    description: string;
    /** サークルカット画像URL（OG画像用） */
    image: string;
    /** 詳細ページURL */
    url: string;
    /** サイト名 */
    siteName: string;
    /** OGタイプ（website/article） */
    type: string;
}
/**
 * Firestoreから取得するサークルデータの型定義
 */
export interface CircleData {
    /** サークル名 */
    circleName: string;
    /** サークル説明 */
    description?: string;
    /** サークルカット画像URL */
    circleCutImageUrl?: string;
    /** イベントID */
    eventId: string;
    /** ペンネーム */
    penName?: string;
    /** ジャンル */
    genre: string[];
    /** 成人向けフラグ */
    isAdult: boolean;
}
/**
 * イベントデータの型定義
 */
export interface EventData {
    /** イベント名 */
    name: string;
    /** イベント日付 */
    date: string;
    /** イベント場所 */
    location: string;
}
/**
 * Bot User-Agentの判定パターン
 */
export declare const BOT_USER_AGENTS: readonly ["twitterbot", "facebookexternalhit", "linkedinbot", "slackbot", "discordbot", "whatsapp", "telegrambot", "skype", "googlebot", "bingbot", "yandexbot", "baiduspider", "applebot", "ia_archiver"];
/**
 * デフォルトOGPデータ
 */
export declare const DEFAULT_OGP: Partial<OGPData>;
/**
 * OGP生成エラーの型定義
 */
export declare class OGPError extends Error {
    code: 'CIRCLE_NOT_FOUND' | 'INVALID_PARAMS' | 'FIRESTORE_ERROR' | 'GENERATION_ERROR';
    details?: any | undefined;
    constructor(message: string, code: 'CIRCLE_NOT_FOUND' | 'INVALID_PARAMS' | 'FIRESTORE_ERROR' | 'GENERATION_ERROR', details?: any | undefined);
}
//# sourceMappingURL=ogp.d.ts.map