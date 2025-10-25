#!/usr/bin/env node

/**
 * OGP機能の統合テストスクリプト
 * Cloud Functions エミュレータ環境でのテストを実行
 */

const https = require('https');
const http = require('http');

// テスト設定
const EMULATOR_HOST = 'localhost';
const EMULATOR_PORT = 5001;
const PROJECT_ID = 'geikacheck'; // Firebase Emulatorで使用されているプロジェクトID

// テスト用のUser-Agent
const TEST_USER_AGENTS = {
  twitterbot: 'Twitterbot/1.0',
  facebookbot: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  regularuser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// テスト用のサークルID（存在するID、存在しないID）
const TEST_CIRCLE_IDS = {
  existing: 'test-circle-1', // 実際に存在するサークルIDに置き換え
  nonexisting: 'non-existing-circle-id'
};

/**
 * HTTPリクエストを送信
 */
function makeRequest(path, userAgent) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: EMULATOR_HOST,
      port: EMULATOR_PORT,
      path: `/${PROJECT_ID}/asia-northeast1/ogp${path}`,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3'
      },
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          userAgent: userAgent
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * ヘルスチェックテスト
 */
async function testHealthCheck() {
  console.log('🏥 Testing OGP Health Check...');

  try {
    const response = await makeRequest('/health', TEST_USER_AGENTS.regularuser);

    if (response.statusCode === 200) {
      console.log('✅ Health check passed');
      console.log(`   Response: ${response.body.substring(0, 100)}...`);
      return true;
    } else {
      console.log('❌ Health check failed');
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Response: ${response.body.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

/**
 * Bot判定テスト
 */
async function testBotDetection() {
  console.log('🤖 Testing Bot Detection...');

  const testCases = [
    {
      name: 'Twitter Bot',
      userAgent: TEST_USER_AGENTS.twitterbot,
      expectedBehavior: 'should return HTML with OGP'
    },
    {
      name: 'Facebook Bot',
      userAgent: TEST_USER_AGENTS.facebookbot,
      expectedBehavior: 'should return HTML with OGP'
    },
    {
      name: 'Regular User',
      userAgent: TEST_USER_AGENTS.regularuser,
      expectedBehavior: 'should redirect to SPA'
    }
  ];

  let passedTests = 0;

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`   User-Agent: ${testCase.userAgent}`);
    console.log(`   Expected: ${testCase.expectedBehavior}`);

    try {
      const response = await makeRequest(`/circles/${TEST_CIRCLE_IDS.existing}`, testCase.userAgent);

      console.log(`   Status: ${response.statusCode}`);

      if (testCase.name === 'Regular User') {
        // 通常ユーザーはリダイレクトされるべき
        if (response.statusCode === 302) {
          console.log('✅ Test passed - User redirected to SPA');
          passedTests++;
        } else {
          console.log('❌ Test failed - User should be redirected');
        }
      } else {
        // BotはOGP HTMLを受信するべき
        if (response.statusCode === 200 && response.body.includes('og:title')) {
          console.log('✅ Test passed - Bot received OGP HTML');
          passedTests++;
        } else {
          console.log('❌ Test failed - Bot should receive OGP HTML');
          console.log(`   Response preview: ${response.body.substring(0, 200)}...`);
        }
      }
    } catch (error) {
      console.log(`❌ Test error: ${error.message}`);
    }
  }

  console.log(`\n🏆 Bot Detection Tests: ${passedTests}/${testCases.length} passed`);
  return passedTests === testCases.length;
}

/**
 * OGP生成テスト
 */
async function testOGPGeneration() {
  console.log('🎨 Testing OGP Generation...');

  const testCases = [
    {
      name: 'Valid Circle ID',
      circleId: TEST_CIRCLE_IDS.existing,
      expectedStatus: 200
    },
    {
      name: 'Invalid Circle ID',
      circleId: TEST_CIRCLE_IDS.nonexisting,
      expectedStatus: 404
    },
    {
      name: 'Empty Circle ID',
      circleId: '',
      expectedStatus: 400
    }
  ];

  let passedTests = 0;

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`   Circle ID: ${testCase.circleId}`);

    try {
      const response = await makeRequest(`/circles/${testCase.circleId}`, TEST_USER_AGENTS.twitterbot);

      console.log(`   Status: ${response.statusCode} (expected: ${testCase.expectedStatus})`);

      if (response.statusCode === testCase.expectedStatus) {
        console.log('✅ Test passed - Status code matches expected');

        if (response.statusCode === 200) {
          // OGPタグの確認
          const hasOGTitle = response.body.includes('og:title');
          const hasOGDescription = response.body.includes('og:description');
          const hasOGImage = response.body.includes('og:image');
          const hasTwitterCard = response.body.includes('twitter:card');

          console.log(`   OG Title: ${hasOGTitle ? '✅' : '❌'}`);
          console.log(`   OG Description: ${hasOGDescription ? '✅' : '❌'}`);
          console.log(`   OG Image: ${hasOGImage ? '✅' : '❌'}`);
          console.log(`   Twitter Card: ${hasTwitterCard ? '✅' : '❌'}`);

          if (hasOGTitle && hasOGDescription && hasOGImage && hasTwitterCard) {
            console.log('✅ All OGP tags present');
          } else {
            console.log('❌ Some OGP tags missing');
          }
        }

        passedTests++;
      } else {
        console.log('❌ Test failed - Status code mismatch');
      }
    } catch (error) {
      console.log(`❌ Test error: ${error.message}`);
    }
  }

  console.log(`\n🏆 OGP Generation Tests: ${passedTests}/${testCases.length} passed`);
  return passedTests === testCases.length;
}

/**
 * パフォーマンステスト
 */
async function testPerformance() {
  console.log('⚡ Testing Performance...');

  const testCount = 5;
  const times = [];

  for (let i = 0; i < testCount; i++) {
    console.log(`\n📊 Performance Test ${i + 1}/${testCount}`);

    const startTime = Date.now();

    try {
      const response = await makeRequest(`/circles/${TEST_CIRCLE_IDS.existing}`, TEST_USER_AGENTS.twitterbot);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      times.push(responseTime);

      console.log(`   Response time: ${responseTime}ms`);
      console.log(`   Status: ${response.statusCode}`);

      if (response.headers['x-processing-time']) {
        console.log(`   Server processing time: ${response.headers['x-processing-time']}`);
      }

    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    console.log(`\n📈 Performance Summary:`);
    console.log(`   Average response time: ${avgTime.toFixed(2)}ms`);
    console.log(`   Max response time: ${maxTime}ms`);
    console.log(`   Min response time: ${minTime}ms`);

    return avgTime < 5000; // 5秒以内を合格とする
  }

  return false;
}

/**
 * メイン実行関数
 */
async function runTests() {
  console.log('🚀 Starting OGP Integration Tests...');
  console.log(`📍 Target: ${EMULATOR_HOST}:${EMULATOR_PORT}`);
  console.log(`📦 Project: ${PROJECT_ID}`);
  console.log('─'.repeat(50));

  const results = {
    healthCheck: false,
    botDetection: false,
    ogpGeneration: false,
    performance: false
  };

  try {
    // ヘルスチェック
    results.healthCheck = await testHealthCheck();
    console.log('\n' + '─'.repeat(50));

    // Bot判定テスト
    results.botDetection = await testBotDetection();
    console.log('\n' + '─'.repeat(50));

    // OGP生成テスト
    results.ogpGeneration = await testOGPGeneration();
    console.log('\n' + '─'.repeat(50));

    // パフォーマンステスト
    results.performance = await testPerformance();
    console.log('\n' + '─'.repeat(50));

    // 結果サマリー
    console.log('\n🏁 Test Results Summary:');
    console.log(`   Health Check: ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Bot Detection: ${results.botDetection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   OGP Generation: ${results.ogpGeneration ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Performance: ${results.performance ? '✅ PASS' : '❌ FAIL'}`);

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} test suites passed`);

    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! OGP functionality is ready.');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// メイン実行
if (require.main === module) {
  runTests();
}