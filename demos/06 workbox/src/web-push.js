// 推送 webpush
import logger from './logger';

// web push 公钥
const applicationServerPublicKey =
  'BFSoYpakSC3PNvADJBlkqT9NwH60TIR1BsAQkvXeGIW1FWAJUmehbG7AWO09fMJBzP9aSf8dDWzLCAf70YGU5g0';

// 接收/关闭消息按钮
const pushBtn = document.getElementById('btn-push');

// 是否已经订阅push
let isSubscribed = false;

export default swRegistration => {
  // 检查是否已经订阅web push
  swRegistration.pushManager.getSubscription().then(subscription => {
    isSubscribed = subscription !== null;
    // 更新订阅信息
    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      logger.success('已经订阅:', subscription);
    } else {
      logger.warn('未订阅!');
      // 开始订阅推送
      subscribePush(swRegistration);
    }
    updateBtn();
  });

  // 绑定推送以及取消推送
  pushBtn.addEventListener('click', () => {
    if (isSubscribed) {
      unsubscribePush(swRegistration);
    } else {
      subscribePush(swRegistration);
    }
  });
};

// 订阅推送
function subscribePush(swRegistration) {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey
    })
    .then(subscription => {
      logger.success('接收推送');

      isSubscribed = true;

      updateSubscriptionOnServer(subscription);
      updateBtn();
    })
    .catch(err => {
      isSubscribed = false;
      logger.error('订阅推送失败:', err);
      updateBtn();
    });
}

// 取消推送
function unsubscribePush(swRegistration) {
  swRegistration.pushManager
    .getSubscription()
    .then(subscription => {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(err => {
      logger.error('取消推送失败:', err);
    })
    .then(() => {
      updateSubscriptionOnServer(null);
      logger.success('取消推送成功');
      isSubscribed = false;

      updateBtn();
    });
}

// 更新按钮文案
function updateBtn() {
  if (Notification.permission === 'denied') {
    pushBtn.textContent = '推送不被允许';
    pushBtn.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushBtn.textContent = '已开启推送';
  } else {
    pushBtn.textContent = '未启用推送';
  }
}

// 转base64 到 Unit8Array
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 更新服务器存储推送信息
function updateSubscriptionOnServer(subscription) {
  console.log('updateSubscriptionOnServer:', subscription);
  fetch('/api/subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription
    })
  });
}
