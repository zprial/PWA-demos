# PWA-demos

- ServiceWorker
- Manifest
- Add to Home Screen
- Push Api
- Web Notifications
- Background Sync

## 参考资料

- [PWA 学习手册](https://pwa.alienzhou.com/)

- [Service Worker](https://developers.google.com/web/fundamentals/primers/service-workers/?hl=zh-cn)
- [Service Worker 生命周期](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle?hl=zh-cn)
- [高性能 Service Worker 加载](https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading)
- [离线指南](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#stale-while-revalidate)

- [The Web App Manifest](https://developers.google.com/web/fundamentals/web-app-manifest/)
- [图标和浏览器颜色](https://developers.google.com/web/fundamentals/design-and-ux/browser-customization/)
- [Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

- [Add to Home Screen](https://developers.google.com/web/fundamentals/app-install-banners/)

- [向网络应用添加推送通知](https://developers.google.com/web/fundamentals/codelabs/push-notifications/?hl=zh-cn#%E4%B8%8B%E8%BD%BD%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81)

## server.js 接口说明

- POST /api/subscription: 订阅推送
- GET /api/subscriptions: 获取所有已保存的的用户推送信息
- POST /api/push: 向单个用户推送
- POST /api/push/total: 向多个用户推送

## 生命周期

![sw-lifecycle](./sw-lifecycle.png)
