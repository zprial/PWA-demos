// here is service worker scope

function log(...arguments) {
  console.log('[ServiceWorker]', ...arguments)
}

// 缓存名
const CACHE_NAME = "add-2-home-screen-cache-v8"

// 缓存资源
const urlToCache = [
  './',
  './index.css',
]

// 安装
self.addEventListener('install', evt => {
  log('1. install')
  self.skipWaiting()

  // What does event.waitUntil do in service worker and why is it needed?
  // https://stackoverflow.com/questions/37902441/what-does-event-waituntil-do-in-service-worker-and-why-is-it-needed
  evt.waitUntil(
    // 打开缓存
    caches.open(CACHE_NAME)
      .then(cache => {
        log('Cache Open:', cache)
        // 缓存文件
        // 如果所有文件都成功缓存，则将安装 Service Worker。 如有任何文件无法下载，则安装步骤将失败。
        return cache.addAll(urlToCache)
      })
  )
})

// 激活
self.addEventListener('activate', evt => {
  log('2. activate', evt)
  caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key !== CACHE_NAME) {
        log('Removing old cache', key);
        return caches.delete(key);
      }
    }));
  })
  // 通过在其中调用 clients.claim() 控制未受控制的客户端。非必须
  self.clients.claim()
})

// 监听请求
self.addEventListener('fetch', evt => {
  log('fetch', evt)
  evt.respondWith(
    caches.match(evt.request)
      .then(response => {
        if (response) {
          return response
        }

        // 动态缓存请求数据
        // https://developers.google.com/web/fundamentals/primers/service-workers/?hl=zh-cn
        // IMPORTANT:Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        const fetchRequest = evt.request.clone()
        return fetch(fetchRequest).then(response => {

          // 1. 确保响应有效。
          // 2. 检查并确保响应的状态为 200。
          // 3. 确保响应类型为 basic，亦即由自身发起的请求。 这意味着，对第三方资产的请求也不会添加到缓存。
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 如果通过检查，则克隆响应。 这样做的原因在于，
          // 该响应是数据流， 因此主体只能使用一次。 
          // 由于我们想要返回能被浏览器使用的响应，并将其传递到缓存以供使用，
          // 因此需要克隆一份副本。我们将一份发送给浏览器，另一份则保留在缓存。
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(evt.request, responseToCache)
            })
          
          return response
        })
      })
  )
})