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
exports.getCircleData = getCircleData;
exports.getEventData = getEventData;
exports.circleExists = circleExists;
exports.testFirestoreConnection = testFirestoreConnection;
const admin = __importStar(require("firebase-admin"));
const ogp_1 = require("../types/ogp");
/**
 * サークルIDからサークルデータを取得
 * @param circleId サークルID
 * @returns サークルデータとイベントデータ
 * @throws OGPError サークルが見つからない場合またはFirestoreエラー
 */
async function getCircleData(circleId) {
    try {
        const db = admin.firestore();
        console.log(`📊 Fetching circle data for ID: ${circleId}`);
        // 全てのイベントから該当サークルを検索
        const eventsSnapshot = await db.collection('events').get();
        for (const eventDoc of eventsSnapshot.docs) {
            const eventData = eventDoc.data();
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
                const circleData = circleDoc.data();
                console.log(`✅ Circle found in event ${eventId}: ${circleData.circleName}`);
                return {
                    circle: Object.assign(Object.assign({}, circleData), { eventId: eventId }),
                    event: Object.assign(Object.assign({}, eventData), { name: eventData.name || `イベント ${eventId}`, date: eventData.date || '', location: eventData.location || '' })
                };
            }
        }
        // サークルが見つからない場合
        console.log(`❌ Circle not found: ${circleId}`);
        throw new ogp_1.OGPError(`Circle not found: ${circleId}`, 'CIRCLE_NOT_FOUND', { circleId });
    }
    catch (error) {
        if (error instanceof ogp_1.OGPError) {
            throw error;
        }
        console.error('❌ Firestore error while fetching circle data:', error);
        throw new ogp_1.OGPError('Failed to fetch circle data from Firestore', 'FIRESTORE_ERROR', { circleId, originalError: error });
    }
}
/**
 * イベントIDからイベントデータを取得
 * @param eventId イベントID
 * @returns イベントデータ
 */
async function getEventData(eventId) {
    try {
        const db = admin.firestore();
        const eventDoc = await db.collection('events').doc(eventId).get();
        if (!eventDoc.exists) {
            console.log(`❌ Event not found: ${eventId}`);
            return null;
        }
        const eventData = eventDoc.data();
        console.log(`✅ Event found: ${eventId} - ${eventData.name}`);
        return eventData;
    }
    catch (error) {
        console.error('❌ Error fetching event data:', error);
        return null;
    }
}
/**
 * サークルの存在チェック（軽量版）
 * @param circleId サークルID
 * @returns サークルが存在する場合true
 */
async function circleExists(circleId) {
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
    }
    catch (error) {
        console.error('❌ Error checking circle existence:', error);
        return false;
    }
}
/**
 * Firestore接続テスト
 * @returns 接続テスト結果
 */
async function testFirestoreConnection() {
    try {
        const db = admin.firestore();
        // 軽量なテストクエリ
        await db.collection('events').limit(1).get();
        console.log('✅ Firestore connection test successful');
        return true;
    }
    catch (error) {
        console.error('❌ Firestore connection test failed:', error);
        return false;
    }
}
//# sourceMappingURL=firestoreClient.js.map