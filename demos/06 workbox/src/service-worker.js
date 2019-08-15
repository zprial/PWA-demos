console.log('hello service worker');

workbox.precaching.precacheAndRoute(self.__precacheManifest);

function log(...arguments) {
  console.log('[ServiceWorker]', ...arguments);
}

workbox.core.setCacheNameDetails({
  prefix: 'workbox-demo',
  suffix: 'hero',
  precache: 'custom-precache-name', // 不设置的话默认值为 'precache'
  runtime: 'custom-runtime-name' // 不设置的话默认值为 'runtime'
});

workbox.core.skipWaiting();

workbox.core.clientsClaim();

// https://developers.google.com/web/tools/workbox/guides/route-requests
workbox.routing.registerRoute(
  new RegExp(/\.(png|svg)$/),
  new workbox.strategies.CacheFirst({
    cacheName: 'img-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 60 // 60s
      })
    ]
  })
);

// ==================== begin 处理推送 =======================
// 接收推送
self.addEventListener('push', evt => {
  log('Push Received');
  log('Push had this datas: ', evt.data.text());

  // 构建push样式
  const title = '这里是消息推送标题';
  const options = {
    body: evt.data.text(),
    icon: '/public/icon_128.png',
    badge: '/public/avatar.png',
    // 自定义操作
    actions: [
      {
        action: 'show-book',
        title: '去看看'
      },
      {
        action: 'contact-me',
        title: '联系我'
      }
    ]
  };

  evt.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 监听推送点击
self.addEventListener('notificationclick', evt => {
  const action = evt.action
  log('Notification click Received.', evt)

  evt.notification.close()

  // 可以根据自定义行为触发不同的动作
  log('notificationclick action:', action)
  switch(action) {
    case 'show-book':
    case 'contact-me':
      log('推送点击:', action)
      return
    default:
      log('notificationclick action default')
      break;
  }

  // 调用 event.waitUntil()，确保浏览器不会在显示新窗口前终止服务工作线程。
  evt.waitUntil(
    clients.openWindow('/')
  )
})

// ==================== end 处理推送 =======================

// 处理后台同步 background-sync
const bgSyncPlugin = new workbox.backgroundSync.Plugin('tag-submit-name', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

workbox.routing.registerRoute(
  /\/api\/sync/,
  new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);