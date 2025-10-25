"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ogpHealthCheck = exports.ogp = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const botDetector_1 = require("./utils/botDetector");
const firestoreClient_1 = require("./utils/firestoreClient");
const ogpGenerator_1 = require("./utils/ogpGenerator");
const ogp_1 = require("./types/ogp");
/**
 * OGP対応のCloud Function
 * Botからのリクエストに対してサーバーサイドレンダリングでOGPタグ付きHTMLを返す
 * 通常のユーザーリクエストはSPAにリダイレクト
 */
exports.ogp = functions
    .region("asia-northeast1") // 東京リージョン
    .runWith({
    timeoutSeconds: 30, // OGP生成のタイムアウト: 30秒
    memory: "512MB" // メモリ: 512MB
})
    .https
    .onRequest(async (request, response) => {
    const startTime = Date.now();
    try {
        console.log(`🌐 OGP request received: ${request.method} ${request.url}`);
        // Bot判定
        const botDetails = (0, botDetector_1.getBotDetectionDetails)(request);
        console.log('🔍 Bot detection details:', JSON.stringify(botDetails, null, 2));
        // 通常のユーザーの場合はSPAにリダイレクト
        if (!(0, botDetector_1.isBotRequest)(request)) {
            console.log('👤 Regular user detected, redirecting to SPA');
            const redirectUrl = `https://geicacheck.web.app${request.url}`;
            response.redirect(302, redirectUrl);
            return;
        }
        // BotリクエストのOGP処理
        console.log('🤖 Bot request detected, generating OGP');
        // URLパスからサークルIDを抽出
        const pathMatch = request.path.match(/^\/circles\/([^/]+)$/);
        if (!pathMatch || !pathMatch[1]) {
            console.log('❌ Invalid URL path:', request.path);
            response.status(400).send((0, ogpGenerator_1.generateErrorHTML)('Invalid URL path', request.path));
            return;
        }
        const circleId = pathMatch[1];
        console.log(`🔍 Processing circle ID: ${circleId}`);
        // パラメータバリデーション
        if (!circleId.trim()) {
            console.log('❌ Empty circle ID');
            response.status(400).send((0, ogpGenerator_1.generateErrorHTML)('Circle ID is required'));
            return;
        }
        // サークルデータ取得
        let circleData, eventData;
        try {
            const result = await (0, firestoreClient_1.getCircleData)(circleId);
            circleData = result.circle;
            eventData = result.event;
            console.log(`✅ Circle data retrieved: ${circleData.circleName}`);
        }
        catch (error) {
            console.error('❌ Error fetching circle data:', error);
            if (error instanceof ogp_1.OGPError && error.code === 'CIRCLE_NOT_FOUND') {
                response.status(404).send((0, ogpGenerator_1.generateErrorHTML)('サークルが見つかりません', circleId));
            }
            else {
                response.status(500).send((0, ogpGenerator_1.generateErrorHTML)('データの取得に失敗しました', circleId));
            }
            return;
        }
        // OGPデータ生成
        let ogpData;
        try {
            ogpData = (0, ogpGenerator_1.generateOGPData)(circleData, eventData, circleId);
            console.log('✅ OGP data generated:', JSON.stringify(ogpData, null, 2));
        }
        catch (error) {
            console.error('❌ Error generating OGP data:', error);
            response.status(500).send((0, ogpGenerator_1.generateErrorHTML)('OGPデータの生成に失敗しました', circleId));
            return;
        }
        // HTML生成
        let html;
        try {
            html = (0, ogpGenerator_1.generateOGPHTML)(ogpData, circleId);
            console.log('✅ OGP HTML generated');
        }
        catch (error) {
            console.error('❌ Error generating HTML:', error);
            response.status(500).send((0, ogpGenerator_1.generateErrorHTML)('HTMLの生成に失敗しました', circleId));
            return;
        }
        // レスポンス送信
        const processingTime = Date.now() - startTime;
        console.log(`⚡ OGP generation completed in ${processingTime}ms`);
        // キャッシュヘッダー設定（5分間キャッシュ）
        response.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=300',
            'X-Processing-Time': `${processingTime}ms`,
            'X-Circle-ID': circleId,
            'X-Bot-Detected': 'true'
        });
        response.status(200).send(html);
        // 成功ログ記録
        await logOGPAccess({
            circleId,
            userAgent: request.get('User-Agent') || '',
            processingTime,
            status: 'success',
            timestamp: admin.firestore.Timestamp.now()
        });
    }
    catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('❌ Unexpected error in OGP function:', error);
        // エラーログ記録
        await logOGPAccess({
            circleId: 'unknown',
            userAgent: request.get('User-Agent') || '',
            processingTime,
            status: 'error',
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            timestamp: admin.firestore.Timestamp.now()
        });
        response.status(500).send((0, ogpGenerator_1.generateErrorHTML)('予期しないエラーが発生しました'));
    }
});
/**
 * OGPアクセスログを記録
 * @param logData ログデータ
 */
async function logOGPAccess(logData) {
    try {
        const db = admin.firestore();
        await db.collection('ogp_access_logs').add(logData);
        console.log('📊 OGP access log recorded');
    }
    catch (error) {
        console.error('❌ Failed to record OGP access log:', error);
        // ログ記録失敗は処理を停止させない
    }
}
/**
 * OGPヘルスチェック用エンドポイント
 */
exports.ogpHealthCheck = functions
    .region("asia-northeast1")
    .runWith({
    timeoutSeconds: 10,
    memory: "256MB"
})
    .https
    .onRequest(async (request, response) => {
    try {
        console.log('🏥 OGP health check requested');
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            region: 'asia-northeast1',
            functions: {
                ogp: 'active',
                ogpHealthCheck: 'active'
            }
        };
        response.set({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        response.status(200).json(healthData);
        console.log('✅ Health check completed');
    }
    catch (error) {
        console.error('❌ Health check failed:', error);
        response.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=ogp.js.map