const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const koaBody = require('koa-body');
const webpush = require('web-push');
const session = require('koa-session');
const favicon = require('koa-favicon');
const glob = require('glob');

const app = new Koa();
const router = new Router();

// 内存存储 subscriptions
const cacheSubscription = {};

const vapidKeys = {
  publicKey:
    'BFSoYpakSC3PNvADJBlkqT9NwH60TIR1BsAQkvXeGIW1FWAJUmehbG7AWO09fMJBzP9aSf8dDWzLCAf70YGU5g0',
  privateKey: 'J6AGTn2Ra8U_y3KMbXbzRqP5mkm289HuGdFK2St9hIc'
};

// 设置web-push的VAPID值
webpush.setVapidDetails(
  'http://doraemon.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 查找所有 html 页面
const htmls = glob.sync('demos/*/index.html');

router.get('/', async (ctx) => {
  ctx.response.body = `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>PWA-demos</title>
    </head>
    <body>
      <ul>${htmls.map(html => `<li><a href="${html.replace(/(^demos\/)|(index.html$)/ig, '')}">${html.replace(/^demos/i, '')}</a></li>`).join('')}</ul>
    </body>
    </html>
  `
})

// 存储 subscription
router.post('/api/subscription', ctx => {
  if (!ctx.session.bornId) {
    ctx.session.bornId = Date.now()
  }
  if (ctx.session && ctx.session.bornId) {
    if (ctx.request.body.subscription) {
      cacheSubscription[ctx.session.bornId] = ctx.request.body.subscription;
    } else {
      delete cacheSubscription[ctx.session.bornId];
    }
  }
  ctx.response.body = 'ok'
});

// 获取所有订阅数据
router.get('/api/subscriptions', ctx => {
  ctx.response.body = cacheSubscription;
})

// 向客户端推送
router.post('/api/push', async ctx => {
  const { bornId, payload } = ctx.request.body;
  const subscription = cacheSubscription[bornId];
  if (subscription) {
    try {
      const data = await webpush.sendNotification(subscription, JSON.stringify(payload));
      console.log('push service响应数据:', data);
      ctx.response.body = data;
    } catch (error) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        delete cacheSubscription[bornId];
      }
      console.log('推送失败:', error)
      ctx.response.body = error.message;
    }
  } else {
    ctx.response.body = `没有此bornId[${bornId}]`;
  }
});

// 向所有客户端推送
router.post('/api/push/total', async ctx => {
  const { bornIds = Object.keys(cacheSubscription), payload } = ctx.request.body;
  bornIds.forEach(async bornId => {
    const subscription = cacheSubscription[bornId];
    if (subscription) {
      try {
        const data = await webpush.sendNotification(subscription, JSON.stringify(payload));
        console.log('push service响应数据:', data);
      } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          delete cacheSubscription[bornId];
        }
        console.log('推送失败:', bornId, error)
      }
    }
  })
  ctx.response.body = '已发起推送';
});

// 响应客户端同步事件
router.post('/api/sync', async ctx => {
  const { tag, payload = {} } = ctx.request.body;
  console.log("收到客户端同步事件:", ctx.request.body)
  if (tag === 'tag-submit-name') {
    if (ctx.session && ctx.session.bornId) {
      const subscription = cacheSubscription[ctx.session.bornId];
      if (subscription) {
        try {
          const data = await webpush.sendNotification(subscription, `hello ${payload.name}`);
          ctx.response.body = data;
          return
        } catch (error) {
          console.log('推送失败:', error)
        }
      }
    }
    ctx.response.body = `您提交了: ${payload.name}`
    return
  }
  ctx.response.body = payload ? payload.name : 'ok'
})

app.keys = ['hello world'];
app.use(
  session(
    {
      key: 'pwa_demos_uid',
      maxAge: 86400000
    },
    app
  )
);

app.use(koaBody());
app.use(router.routes());
app.use(serve(__dirname + '/demos'));
app.use(favicon(__dirname + '/demos/public/favicon.ico'))
app.listen(8000, () => {
  console.log(`service start: http://localhost:8000`);
});
