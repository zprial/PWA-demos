// 后台同步
import logger from './logger';

// 提交name按钮
const syncBtn = document.getElementById('button--sync');
// name输入框
const nameInput = document.getElementById('name');

export default registration => {
  window.addEventListener('online', () => {
    nameInput.setAttribute('placeholder', "what's your name");
  });

  window.addEventListener('offline', () => {
    nameInput.setAttribute('placeholder', '网络已断开,恢复连接后自动提交');
  });

  syncBtn.addEventListener('click', () => {
    // 在线，则实时提交
    // 离线，则后台同步
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag: navigator.onLine ? '' : 'tag-submit-name',
        payload: {
          name: nameInput.value
        }
      })
    })
      .then(res => res.text())
      .then(res => alert('实时提交成功:' + res))
      .catch(err => {
        if (!navigator.onLine) {
          alert('将在网络恢复后自动提交');
        }
        logger.error('提交失败:', err);
      });
  });
};
