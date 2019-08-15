/**
 * 添加到屏幕条件
 * In order for a user to be able to install your Progressive Web App, it needs to meet the following criteria:

    * The web app is not already installed.
        and prefer_related_applications is not true.
    * Meets a user engagement heuristic (currently, the user has interacted with the domain for at least 30 seconds)
    * Includes a web app manifest that includes:
        * short_name or name
        * icons must include a 192px and a 512px sized icons
        * start_url
        * display must be one of: fullscreen, standalone, or minimal-ui
    * Served over HTTPS (required for service workers)
    * Has registered a service worker with a fetch event handler
 */
import logger from './logger';

let deferredPrompt;
const installButton = document.getElementById('button--install');

installButton.addEventListener('click', () => {
  // 隐藏按钮，因为最多只能触发一次 prompt()
  installButton.classList.remove('show')
  // 询问是否添加到桌面
  deferredPrompt.prompt();
  // 等待用户选择
  deferredPrompt.userChoice.then(choiceResult => {
    if (choiceResult.outcome === 'accepted') {
      logger.success('User accepted the A2HS prompt');
    } else {
      logger.warn('User dismissed the A2HS prompt');
    }
    deferredPrompt = null;
  })
})

window.addEventListener('beforeinstallprompt', (e) => {
  logger.log('beforeinstallprompt is trigger')
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // show add-to-home-screen button
  installButton.classList.add('show')
});

// Add event listener for appinstalled event
window.addEventListener('appinstalled', (evt) => {
  logger.success('app installed', evt)
});