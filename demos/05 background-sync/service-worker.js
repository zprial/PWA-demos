// here is service worker scope

// 创建消息通道
const msgChannel = new MessageChannel();

function log(...arguments) {
  console.log('[ServiceWorker]', ...arguments)
}

// 构造后台同步请求
function newRequest(url = '/api/sync', body = '') {
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
}

// 缓存名
const CACHE_NAME = "background-sync-v2"

// 缓存资源
const urlToCache = [
  './',
  './index.css',
]

// 安装
self.addEventListener('install', evt => {
  log('1. install')
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
  evt.waitUntil(self.skipWaiting())
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
  evt.waitUntil(self.clients.claim())
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

// 监听推送
self.addEventListener('push', (evt) => {
  log('Push Received')
  log('Push had this data: ', evt.data.text())

  // 构建push样式
  const title = "push标题"
  const options = {
    body: evt.data.text(),
    icon: '/public/icon_128.png',
    badge: '/public/avatar.png',
    // 自定义操作
    actions: [{
      action: 'show-book',
      title: '去看看'
    }, {
        action: 'contact-me',
        title: '联系我'
    }],
  }

  evt.waitUntil(
    self.registration.showNotification(title, options)
  )
})

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

// 监听message事件, 本demo中，提交按钮会postMessage
self.addEventListener('message', evt => {
  const data = JSON.parse(evt.data);
  console.log(`service worker收到消息：${evt.data}`);
  msgChannel.port1.postMessage(data);
})


// 监听同步事件 sync
// 就算断网，就算关掉当前页面，也会在下次有望的时候重新同步
self.addEventListener('sync', evt => {
  console.log(`service worker需要进行后台同步，tag: ${evt.tag}`);

  // 通过 MessageChannel 来传递 onMessage 的数据
  const msgPromise = new Promise(function (resolve, reject) {
    msgChannel.port2.onmessage = e => {
      console.log('channel port2 接收数据：', e)
      resolve(e.data);
    }
    // 五秒超时
    setTimeout(resolve, 5000);
  });

  // 可以通过evt.tag来判断处理什么事情
  if (evt.tag === 'tag-submit-name') {
    // 提交姓名
    evt.waitUntil(
      msgPromise.then(data => {
        let request = newRequest('/api/sync', JSON.stringify(data))
        fetch(request)
      })
    )
  }

})