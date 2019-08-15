// Add to Home Screen
import './install';
import initWebPush from './web-push';
import initBackgroundSync from './background-sync';

// 缓存 sw 注册
let swRegistration = null;

// Service Worker Init
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        swRegistration = registration;
        console.log('注册service成功:', registration);
        
        // 监听推送 web-push
        initWebPush(swRegistration);
      })
      .catch(err => {
        console.log('注册service失败:', err);
      });

    navigator.serviceWorker.ready.then(registration => {
      // 初始化sync事件
      initBackgroundSync(registration);
    })
  });
}
