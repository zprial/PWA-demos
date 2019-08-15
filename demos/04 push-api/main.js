// 接收消息按钮
const pushBtn = document.getElementById('btn-push')

// web push 公钥
const applicationServerPublicKey = 'BFSoYpakSC3PNvADJBlkqT9NwH60TIR1BsAQkvXeGIW1FWAJUmehbG7AWO09fMJBzP9aSf8dDWzLCAf70YGU5g0';

// 缓存 sw 注册
let swRegistration = null
// 是否已经订阅push
let isSubscribed = false

// 1. 注册 Service Worker
// 缓存 registration 对象
if ('serviceWorker' in navigator  && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        // 缓存变量
        swRegistration = registration
        console.log('Service Worker registered', registration)

        // 展示按钮
        initPushBtn()
      })
      .catch(err => {
        console.log('Servie Worker regist failed', err)
      })
  })
}

// 2.初始化按钮，绑定订阅和取消订阅事件
function initPushBtn() {
  // 检查是否已经订阅web push
  swRegistration.pushManager.getSubscription()
    .then(subscription => {
      isSubscribed = subscription !== null
      updateSubscriptionOnServer(subscription);

      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }

      updateBtn()
    })
  
  pushBtn.addEventListener('click', () => {
    if (isSubscribed) {
      // 取消订阅
      unsubscribePush()
    } else {
      // 订阅推送
      subscribePush()
    }
  })
}

// 3. 订阅推送
function subscribePush() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  // 开始订阅
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  }).then(subscription => {
    // 用户允许推送
    console.log('User is subscribed:', subscription);
    updateSubscriptionOnServer(subscription);
    
    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    // 用户禁止推送
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

// 4. 处理推送，swrvice-worker

// 5. 取消订阅
function unsubscribePush() {
  swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(function(error) {
      console.log('Error unsubscribing', error);
    })
    .then(function() {
      updateSubscriptionOnServer(null);
  
      console.log('User is unsubscribed.');
      isSubscribed = false;
  
      updateBtn();
    });
}


// 往服务器上存贮订阅信息
function updateSubscriptionOnServer(subscription) {
  console.log('updateSubscriptionOnServer:', subscription)
  console.log(JSON.stringify(subscription))
  fetch('/api/subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription
    })
  })
}

// 转base64 到 Unit8Array
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 更新按钮文案
function updateBtn() {
  if (Notification.permission === 'denied') {
    pushBtn.textContent = 'push不被允许';
    pushBtn.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }
  if (isSubscribed) {
    pushBtn.textContent = '禁用push(已启用)';
  } else {
    pushBtn.textContent = '启用push(未启用)';
  }

}
