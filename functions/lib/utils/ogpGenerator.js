"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOGPData = generateOGPData;
exports.generateOGPHTML = generateOGPHTML;
exports.generateErrorHTML = generateErrorHTML;
const ogp_1 = require("../types/ogp");
/**
 * サークルデータからOGPデータを生成
 * @param circle サークルデータ
 * @param event イベントデータ
 * @param circleId サークルID
 * @returns OGPデータ
 */
function generateOGPData(circle, event, circleId) {
    const baseUrl = 'https://geicacheck.web.app';
    // タイトル生成
    const title = circle.penName
        ? `${circle.circleName} (${circle.penName})`
        : circle.circleName;
    // 説明文生成
    let description = '';
    if (circle.description && circle.description.trim()) {
        // 説明文を適切な長さに調整（Twitterカードの推奨は200文字以下）
        description = circle.description.length > 160
            ? `${circle.description.substring(0, 157)}...`
            : circle.description;
    }
    else {
        // デフォルト説明文
        const genreText = circle.genre.length > 0 ? ` | ${circle.genre.join('・')}` : '';
        const eventText = event.name ? ` | ${event.name}` : '';
        description = `${title}の詳細ページ${genreText}${eventText}`;
    }
    // 画像URL生成
    const image = circle.circleCutImageUrl || ogp_1.DEFAULT_OGP.image || '';
    // URL生成
    const url = `${baseUrl}/circles/${circleId}`;
    return {
        title,
        description,
        image,
        url,
        siteName: ogp_1.DEFAULT_OGP.siteName || 'ゲイカチェック',
        type: ogp_1.DEFAULT_OGP.type || 'website'
    };
}
/**
 * OGPデータからHTMLを生成
 * @param ogpData OGPデータ
 * @param circleId サークルID（デバッグ用）
 * @returns HTML文字列
 */
function generateOGPHTML(ogpData, circleId) {
    // HTMLエスケープ関数
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };
    // OGPデータのエスケープ
    const escapedData = {
        title: escapeHtml(ogpData.title),
        description: escapeHtml(ogpData.description),
        image: escapeHtml(ogpData.image),
        url: escapeHtml(ogpData.url),
        siteName: escapeHtml(ogpData.siteName),
        type: escapeHtml(ogpData.type)
    };
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Basic Meta Tags -->
    <title>${escapedData.title} | ${escapedData.siteName}</title>
    <meta name="description" content="${escapedData.description}">

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${escapedData.title}">
    <meta property="og:description" content="${escapedData.description}">
    <meta property="og:image" content="${escapedData.image}">
    <meta property="og:url" content="${escapedData.url}">
    <meta property="og:type" content="${escapedData.type}">
    <meta property="og:site_name" content="${escapedData.siteName}">
    <meta property="og:locale" content="ja_JP">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapedData.title}">
    <meta name="twitter:description" content="${escapedData.description}">
    <meta name="twitter:image" content="${escapedData.image}">
    <meta name="twitter:site" content="@geicacheck">

    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#ec4899">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- Canonical URL -->
    <link rel="canonical" href="${escapedData.url}">

    <!-- CSS for loading state -->
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
            color: #374151;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 32px;
            text-align: center;
        }
        .logo {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #ec4899, #f97316);
            border-radius: 50%;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
        }
        h1 {
            margin: 0 0 16px;
            color: #111827;
            font-size: 28px;
            font-weight: 600;
        }
        p {
            margin: 0 0 24px;
            color: #6b7280;
            line-height: 1.6;
        }
        .redirect-btn {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899, #f97316);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: transform 0.2s;
        }
        .redirect-btn:hover {
            transform: translateY(-2px);
        }
        .loading {
            margin-top: 24px;
            color: #9ca3af;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            ゲ
        </div>
        <h1>${escapedData.title}</h1>
        <p>${escapedData.description}</p>
        <a href="${escapedData.url}" class="redirect-btn">
            詳細を見る
        </a>
        <div class="loading">
            このページは自動的にリダイレクトされます...
        </div>
    </div>

    <script>
        // Bot以外のユーザーを自動でSPAにリダイレクト
        setTimeout(function() {
            window.location.href = '${escapedData.url}';
        }, 2000);

        // デバッグ情報（本番では削除予定）
        console.log('OGP Generated for Circle ID: ${circleId}');
    </script>
</body>
</html>`;
}
/**
 * エラー用のHTMLを生成
 * @param error エラーメッセージ
 * @param circleId サークルID
 * @returns エラー用HTML文字列
 */
function generateErrorHTML(error, circleId) {
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };
    const escapedError = escapeHtml(error);
    const title = 'サークル情報が見つかりません';
    const siteName = 'ゲイカチェック';
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Basic Meta Tags -->
    <title>${title} | ${siteName}</title>
    <meta name="description" content="指定されたサークル情報は見つかりませんでした。">

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="指定されたサークル情報は見つかりませんでした。">
    <meta property="og:image" content="https://geicacheck.web.app/default-ogp-image.png">
    <meta property="og:url" content="https://geicacheck.web.app/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${siteName}">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="指定されたサークル情報は見つかりませんでした。">
    <meta name="twitter:image" content="https://geicacheck.web.app/default-ogp-image.png">

    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
            color: #374151;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 32px;
            text-align: center;
        }
        .error-icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #ef4444, #f97316);
            border-radius: 50%;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 32px;
        }
        h1 {
            margin: 0 0 16px;
            color: #111827;
            font-size: 28px;
            font-weight: 600;
        }
        p {
            margin: 0 0 24px;
            color: #6b7280;
            line-height: 1.6;
        }
        .home-btn {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899, #f97316);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: transform 0.2s;
        }
        .home-btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">
            !
        </div>
        <h1>${title}</h1>
        <p>申し訳ございませんが、指定されたサークル情報は見つかりませんでした。</p>
        ${circleId ? `<p><strong>サークルID:</strong> ${escapeHtml(circleId)}</p>` : ''}
        <p><strong>エラー:</strong> ${escapedError}</p>
        <a href="https://geicacheck.web.app/" class="home-btn">
            トップページに戻る
        </a>
    </div>
</body>
</html>`;
}
//# sourceMappingURL=ogpGenerator.js.map