import * as functions from "firebase-functions";
import { BOT_USER_AGENTS } from "../types/ogp";

/**
 * リクエストがBotからのものかを判定する
 * @param request HTTPSリクエストオブジェクト
 * @returns Botの場合true、通常のユーザーの場合false
 */
export function isBotRequest(request: functions.https.Request): boolean {
  const userAgent = request.get('User-Agent')?.toLowerCase() || '';

  // User-Agentが空の場合は念のためBotとして扱う
  if (!userAgent) {
    console.log('🤖 Empty User-Agent detected, treating as bot');
    return true;
  }

  // Bot User-Agentパターンの確認
  const isBotUserAgent = BOT_USER_AGENTS.some(botAgent =>
    userAgent.includes(botAgent.toLowerCase())
  );

  if (isBotUserAgent) {
    console.log(`🤖 Bot detected: ${userAgent}`);
    return true;
  }

  // プリレンダリングサービスの判定
  const prerenderingServices = [
    'prerender',
    'phantomjs',
    'headlesschrome',
    'chrome-lighthouse'
  ];

  const isPrerenderingService = prerenderingServices.some(service =>
    userAgent.includes(service)
  );

  if (isPrerenderingService) {
    console.log(`🤖 Prerendering service detected: ${userAgent}`);
    return true;
  }

  // その他のBot判定パターン
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegram/i,
    /slack/i,
    /discord/i
  ];

  const isBot = botPatterns.some(pattern => pattern.test(userAgent));

  if (isBot) {
    console.log(`🤖 Bot pattern matched: ${userAgent}`);
    return true;
  }

  // 通常のユーザー
  console.log(`👤 Regular user detected: ${userAgent}`);
  return false;
}

/**
 * Bot判定の詳細情報を取得
 * @param request HTTPSリクエストオブジェクト
 * @returns Bot判定の詳細情報
 */
export function getBotDetectionDetails(request: functions.https.Request) {
  const userAgent = request.get('User-Agent') || '';
  const acceptHeader = request.get('Accept') || '';
  const referer = request.get('Referer') || '';

  return {
    userAgent,
    acceptHeader,
    referer,
    isBot: isBotRequest(request),
    timestamp: new Date().toISOString()
  };
}

/**
 * Twitterボット専用の判定
 * @param request HTTPSリクエストオブジェクト
 * @returns Twitterボットの場合true
 */
export function isTwitterBot(request: functions.https.Request): boolean {
  const userAgent = request.get('User-Agent')?.toLowerCase() || '';
  return userAgent.includes('twitterbot');
}

/**
 * Facebookボット専用の判定
 * @param request HTTPSリクエストオブジェクト
 * @returns Facebookボットの場合true
 */
export function isFacebookBot(request: functions.https.Request): boolean {
  const userAgent = request.get('User-Agent')?.toLowerCase() || '';
  return userAgent.includes('facebookexternalhit');
}