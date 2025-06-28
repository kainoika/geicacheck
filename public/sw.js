// geica check! Service Worker
// Version 1.0.0

const CACHE_NAME = 'geica-check-v1';
const STATIC_CACHE_NAME = 'geica-static-v1';
const DYNAMIC_CACHE_NAME = 'geica-dynamic-v1';

// キャッシュするファイルのリスト
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/map',
  '/bookmarks',
  '/circles',
  // CSS, JS ファイルは動的に追加
];

// Firebase関連のURLパターン
const FIREBASE_PATTERNS = [
  /^https:\/\/.*\.firebaseapp\.com/,
  /^https:\/\/.*\.googleapis\.com/,
  /^https:\/\/firestore\.googleapis\.com/,
];

// Install イベント
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate イベント
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Cache cleanup completed');
        return self.clients.claim();
      })
  );
});

// Fetch イベント
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Firebase API リクエストの処理
  if (FIREBASE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功したFirebaseレスポンスをキャッシュ
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // ネットワークエラー時はキャッシュから取得
          return caches.match(request);
        })
    );
    return;
  }
  
  // 静的ファイルの処理
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
          }
          
          // キャッシュにない場合はネットワークから取得
          return fetch(request)
            .then((response) => {
              // 成功したレスポンスをキャッシュ
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // ネットワークエラー時のフォールバック
              if (request.destination === 'document') {
                return caches.match('/');
              }
              return new Response('Network error occurred', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
              });
            });
        })
    );
  }
});

// バックグラウンド同期（将来の実装用）
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'bookmark-sync') {
    event.waitUntil(syncBookmarks());
  }
});

// プッシュ通知（将来の実装用）
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'New event notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'チェックする',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('geica check!', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ブックマーク同期処理（将来の実装）
async function syncBookmarks() {
  try {
    console.log('[SW] Syncing bookmarks...');
    // ここでオフライン時に保存されたブックマークを同期
    // IndexedDBからペンディング中のブックマークを取得し、Firestoreに送信
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Bookmark sync failed:', error);
    return Promise.reject(error);
  }
}