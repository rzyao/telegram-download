console.log('%c执行content-teleram.js', 'color:red;background-color:#4fad4f;');
// 创建一个新的 script 元素并设置其 src 属性为 inject.js 的路径
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/inject.js');
document.head.appendChild(script);
const appContainer = document.createElement('div');
appContainer.id = '__chrome-extension-app';
document.body.appendChild(appContainer);

// 动态创建隔离环境
const iframe = document.createElement('iframe');
iframe.src = chrome.runtime.getURL('../content/content.html');
iframe.sandbox = "allow-scripts allow-same-origin"

// 动画样式定义
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .iframe-animation {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .slide-out {
    animation: slideOutRight 0.5s forwards;
  }

  .slide-in {
    animation: slideInRight 0.5s forwards;
  }
`;
document.head.appendChild(animationStyle);

// 初始化iframe样式
Object.assign(iframe.style, {
  position: 'fixed',
  right: '0px',
  bottom: '20px',
  width: '400px',
  height: '600px',
  border: 'none',
  'z-index': '2147483647',
  'box-shadow': '0 0 10px rgba(0,0,0,0.2)',
  'border-radius': '8px',
  transform: 'translateX(0)', // 初始位置
  opacity: '1' // 初始透明度
});

// 添加动画控制按钮
const toggleBtn = document.createElement('button');
Object.assign(toggleBtn.style, {
  position: 'fixed',
  right: '20px',
  bottom: '20px',
  'z-index': '2147483647',
  padding: '8px 16px',
  'border-radius': '4px',
  background: '#008aff',
  color: 'white',
  border: 'none',
  cursor: 'pointer'
});
toggleBtn.textContent = 'Toggle Panel';
document.body.appendChild(toggleBtn);

// 创建一个按钮用于调整 iframe 宽度
const resizeBtn = document.createElement('button');
Object.assign(resizeBtn.style, {
  position: 'fixed',
  right: '20px',
  top: '20px', // 与 toggleBtn 保持一定距离
  'z-index': '2147483647',
  padding: '8px 16px',
  'border-radius': '4px',
  background: '#008aff',
  color: 'white',
  border: 'none',
  cursor: 'pointer'
});
resizeBtn.textContent = '调整宽度';
document.body.appendChild(resizeBtn);

// 动画状态管理
let isVisible = true;
let isAnimating = false;
let isWide = false;

const toggleIframe = () => {
  if (isAnimating) return;

  isAnimating = true;

  if (isVisible) {
    iframe.classList.add('slide-out');
    toggleBtn.textContent = '任务列表';
  } else {
    iframe.style.display = 'block';
    iframe.classList.add('slide-in');
    toggleBtn.textContent = '任务列表';
  }

  iframe.addEventListener('animationend', () => {
    iframe.classList.remove(isVisible ? 'slide-out' : 'slide-in');
    if (isVisible) {
      iframe.style.display = 'none';
    }
    isVisible = !isVisible;
    isAnimating = false;
  }, { once: true });
};

const fullScreenContainer = () => {
  if (isWide) {
    // 如果当前是加宽状态，则恢复为默认宽度
    iframe.style.width = '400px';
    resizeBtn.textContent = '调整宽度';
  } else {
    // 如果当前是默认状态，则加宽 iframe ,设置为#column-center的宽度
    const columnCenter = document.getElementById('column-center');
    iframe.style.width = columnCenter.clientWidth + 'px';
    resizeBtn.textContent = '恢复原宽度';
  }
  isWide = !isWide;
};

// 绑定事件
toggleBtn.addEventListener('click', toggleIframe);
resizeBtn.addEventListener('click', fullScreenContainer);
document.body.appendChild(iframe);

// ESC键关闭支持
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isVisible) {
    toggleIframe();
  }
});

// 直接获取扩展ID
const extensionId = chrome.runtime.id;
console.log('当前扩展ID:', extensionId);

window.addEventListener('message', (event) => {
  // 定义预期的扩展消息来源
  const expectedOrigin = 'chrome-extension://' + extensionId;

  // 验证消息的来源是否符合预期
  if (event.origin !== expectedOrigin) return;

  // 如果验证通过，则处理消息
  console.log('验证成功，接收到消息：', event.data);
  if (event.data.type === 'closeIframe') {
    // 执行对应操作
    toggleIframe();
  }
  if (event.data.type === 'fullScreenContainer') {
    fullScreenContainer();
  }
});
(() => {
  // 默认语言设置为中文
  let language = 'zh-CN';
  // 定义中英文的本地化数据
  const data = {
    zh: {
      dialog: {
        title: '电报视频下载器',
        context: '你的五星好评是我们前进最大的动力🙏',
        loading: '正在检测中，请勿关闭当前页面！',
        sure: '支持一下',
        confirm: '残忍拒绝',
        butImg: '下载图片',
        butVideo: '下载视频',
        butAllFile: '强制下载',
        progressText: '下载进度：'
      }
    },
    en: {
      dialog: {
        title: 'Telegram Video Downloader',
        context: 'Your 5-star rating is our biggest motivation! 🙏',
        loading: 'Under detection, please do not close the current page!',
        sure: 'Show Support',
        confirm: 'No Thanks',
        butImg: 'DOWNLOAD IMAGE',
        butVideo: 'DOWNLOAD VIDEO',
        butAllFile: 'FORCE DOWNLOAD',
        progressText: 'Download progress:'
      }
    }
  };

  let localizedText;

  // 根据语言设置获取本地化数据
  function getLocalizedData() {
    return language.includes('zh') ? data['zh'] : data['en'];
  }

  // 检测用户的浏览器语言
  function detectUserLanguage() {
    const userLanguage = navigator.language || navigator.browserLanguage;
    if (userLanguage) {
      language = userLanguage;
    }
  }

  // 初始化语言和本地化文本
  detectUserLanguage();
  localizedText = getLocalizedData();

  // 定义下载按钮的 HTML 模板
  const imageDownloadButton = `
    <div class="content-teleram-script">
      <div class="downloadBtnIns" style="max-width: 420px; display: flex; justify-content: center;">
        <button class="download-images  down_btn_img" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px;">
        ${localizedText.dialog.butImg}
        </button>
      </div>
    </div>
    `;
  const videoDownloadButton = `
    <div class="content-teleram-script">
      <div class="downloadBtnIns" style="max-width: 420px; display: flex; justify-content: center;">
        <button class="download-videos down_btn_video" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px;">
        ${localizedText.dialog.butVideo}
        </button>
      </div>
    </div>
    `;
  const progressContainer = `
    <div class="content-teleram-script down_btn_progress"></div>
    `;
  const downloadCheckbox = '<input type="checkbox" class="download-check-item" name="checkbox-down" checked="true" />';
  const allFilesDownloadButton = `
    <div style="max-width: 420px; display: flex; justify-content: center;" class="check-all-download">
        <button class="download-checkbox-all" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px; padding: 5px 10px;">
        ${localizedText.dialog.butAllFile}
        </button>
    </div>
    `;

  // 添加下载按钮到指定的父元素
  const appendDownloadButton = (parentElement, buttonType, buttonHtml, targetElement) => {
    let newElement = null;
    const existingButton = parentElement.querySelector('.down_btn_' + buttonType);

    newElement = targetElement !== 'attachment' ? targetElement : parentElement;

    if (!existingButton) {
      const wrapperDiv = document.createElement('div');
      wrapperDiv.className = `${buttonType}-telegram-script`;
      wrapperDiv.innerHTML = buttonHtml.trim();

      if (newElement) {
        newElement.appendChild(wrapperDiv.firstChild);
      }
    }
  };

  const statusContainer = `
    <div class="script_status" style="display: flex; justify-content: center;">
      <div class="script_status_text" >
        <span class="script_status_success" style="display: none">
          <svg t="1740863833146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1464" width="50" height="50"><path d="M512 85.333333c235.648 0 426.666667 191.018667 426.666667 426.666667s-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512 276.352 85.333333 512 85.333333z m-74.965333 550.4L346.453333 545.152a42.666667 42.666667 0 1 0-60.330666 60.330667l120.704 120.704a42.666667 42.666667 0 0 0 60.330666 0l301.653334-301.696a42.666667 42.666667 0 1 0-60.288-60.330667l-271.530667 271.488z" fill="#52C41A" p-id="1465"></path></svg>
        </span>
        <span class="script_status_error" style="display: none">
          <svg t="1740863922754" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4255" width="50" height="50"><path d="M512 1024C229.23264 1024 0 794.76736 0 512S229.23264 0 512 0s512 229.23264 512 512-229.23264 512-512 512z m0.7168-549.49888L324.93568 286.72 276.48 335.17568 464.26112 522.9568 276.48 710.73792l48.45568 48.45568L512.7168 571.41248 700.49792 759.1936l48.45568-48.45568L561.17248 522.9568 748.9536 335.17568 700.49792 286.72 512.7168 474.50112z" fill="#F4420A" p-id="4256"></path></svg>
        </span>
        <span class="script_status_running" style="display: none">
          <svg t="1740864280083" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12594" width="50" height="50"><path d="M535.68 512a48 48 0 0 1-14.08 35.2l-142.72 142.72a48 48 0 0 1-67.84-67.84L421.12 512 311.04 401.92a48 48 0 1 1 67.84-67.84l142.72 142.72a48 48 0 0 1 14.08 35.2z" fill="#27BC7A" p-id="12595"></path><path d="M774.4 512a48 48 0 0 1-14.08 35.2l-142.72 142.72a48 48 0 0 1-67.84-67.84L659.84 512 549.76 401.92a48 48 0 0 1 67.84-67.84l142.72 142.72a48 48 0 0 1 14.08 35.2z" fill="#27BC7A" p-id="12596"></path><path d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-96A416 416 0 1 0 96 512 416 416 0 0 0 512 928z" fill="#27BC7A" p-id="12597"></path></svg>
        </span>
      </div>
    </div>
    `;

  // 添加状态容器到指定的父元素
  const appendStatusContainer = (parentElement, id) => {
    const progressContainerElement = document.createElement('div');
    progressContainerElement.id = id;
    progressContainerElement.innerHTML = statusContainer.trim();
    parentElement.appendChild(progressContainerElement);
  };

  const initStatus = (statusContainerElement) => {
    statusContainerElement.querySelector('.script_status_success').style.display = 'none';
    statusContainerElement.querySelector('.script_status_error').style.display = 'none';
    statusContainerElement.querySelector('.script_status_running').style.display = 'none';
  };

  const setElementStatus = (id, status) => {
    const statusContainerElement = document.getElementById(id);
    if (statusContainerElement) {
      initStatus(statusContainerElement);
      switch (status) {
        case 'success':
          statusContainerElement.querySelector('.script_status_success').style.display = 'block';
          break;
        case 'error':
          statusContainerElement.querySelector('.script_status_error').style.display = 'block';
          break;
        case 'running':
          statusContainerElement.querySelector('.script_status_running').style.display = 'block';
          break;
      }
    }
  };

  const TaskSList = []

  const addTask = (id, status) => {
    TaskSList.push({ id, status });
  }

  const saveTaskStatus = (id, status, info) => {
    if (info === null) {
      addTask(id, status);
      return;
    }
    TaskSList.forEach((item) => {
      if (item.id === id) {
        item.status = status;
        item.detail = info;
      }
    });
  };

  document.addEventListener('down_task_status', (event) => {
    saveTaskStatus(event.detail.id, event.detail.status, event.detail.info);
    setElementStatus(event.detail.id, event.detail.status);
  });




  // 显示模态对话框
  const showModalDialog = () => {
    const modalHtml = `
              <div id="myModal" class="good-modal-dialog">
                <span class="modal-close" id="good-modal-close">&#10006;</span>
                <div class="modal-content-head">${localizedText.dialog.title}</div>
                <div class="modal-content">
                  <div class="modal-content-txt">${localizedText.dialog.context}</div>
                </div>
                <div class="modal-content-loading">
                  <div class="loadEffect">
                    <span></span><span></span><span></span><span></span>
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <div class="loading-txt">${localizedText.dialog.loading}</div>
                </div>
                <div class="modal-buttons">
                    <button class="cancel" id="good-cancel-button">${localizedText.dialog.confirm}</button>
                    <button class="confirm" id="good-confirm-button">${localizedText.dialog.sure}</button>
                </div>
              </div>
            `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;

    const closeButton = modalContainer.querySelector('#good-modal-close');
    const confirmButton = modalContainer.querySelector('#good-confirm-button');
    const cancelButton = modalContainer.querySelector('#good-cancel-button');
    const modalDialog = modalContainer.querySelector('.good-modal-dialog');

    // 隐藏加载动画
    modalContainer.querySelector('.modal-content-loading').style.display = 'none';

    // 关闭按钮事件
    closeButton.addEventListener('click', () => {
      if (modalDialog) {
        modalDialog.style.display = 'none';
        chrome.runtime.sendMessage({ action: 'sendAliYun', event: 'dialog_close' });
      }
    });

    // 确认按钮事件
    confirmButton.addEventListener('click', () => {
      window.open('https://chromewebstore.google.com/detail/telegram-Restricted-conten/kinmpocfdjcofdjfnpiiiohfbabfhhdd', '_blank');

      closeButton.style.display = 'none';
      confirmButton.style.display = 'none';
      cancelButton.style.display = 'none';
      modalContainer.querySelector('.modal-content-txt').style.display = 'none';
      modalContainer.querySelector('.modal-content-loading').style.display = 'block';

      setTimeout(() => {
        chrome.storage.local.get('lastCountDialog', (data) => {
          if (data.lastCountDialog) {
            chrome.storage.local.set({ lastCountDialog: null });
          }
        });
        modalDialog.style.display = 'none';
        chrome.runtime.sendMessage({ action: 'sendAliYun', event: 'dialog_none' });
      }, 20000);
    });

    // 取消按钮事件
    cancelButton.addEventListener('click', () => {
      if (modalDialog) {
        modalDialog.style.display = 'none';
        chrome.runtime.sendMessage({ action: 'sendAliYun', event: 'dialog_cancel' });
      }
    });

    // 将模态对话框添加到文档中
    document.body.appendChild(modalContainer);
  };

  // 等待元素加载
  const waitForElements = (container, selector, timeout = 15000) => {
    return new Promise((resolve, reject) => {
      // 如果已存在则直接返回
      const target = container.querySelectorAll(selector);
      if (target.length > 0) return resolve(target);

      // 配置观察选项
      const observer = new MutationObserver((mutations) => {
        const updatedTarget = container.querySelectorAll(selector);
        if (updatedTarget.length > 0) {
          observer.disconnect();
          resolve(updatedTarget);
        }
      });

      // 开始观察整个文档
      observer.observe(container, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`元素 ${selector} 加载超时`));
      }, timeout);
    });
  };

  // 等待元素加载
  const waitForElement = (selector, timeout = 15000) => {
    return new Promise((resolve, reject) => {
      // 如果已存在则直接返回
      const target = document.querySelector(selector);
      if (target) return resolve(target);

      // 配置观察选项
      const observer = new MutationObserver((mutations) => {
        const updatedTarget = document.querySelector(selector);
        if (updatedTarget) {
          observer.disconnect();
          resolve(updatedTarget);
        }
      });

      // 开始观察整个文档
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`元素 ${selector} 加载超时`));
      }, timeout);
    });
  };

  // 等待视频源加载
  const waitForVideoSrcLoad = (videoElement, interval = 100) => {
    return new Promise((resolve, reject) => {
      if (!videoElement) return reject(new Error('无效的视频元素'));

      const checkSrc = setInterval(() => {
        if (videoElement.src.includes('blob') || videoElement.src.includes('stream')) {
          clearInterval(checkSrc);
          clearTimeout(timeout);
          resolve(videoElement.src);
        }
      }, interval);

      // 可选：设置一个超时来避免无限等待
      const timeout = setTimeout(() => {
        clearInterval(checkSrc);
        reject(new Error('等待视频源超时'));
      }, 10000);
    });
  };

  // 获取剪贴板中的文件名
  const getFileNameByClipBoard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      return clipboardText;
    } catch (error) {
      return null;
    }
  };

  // 处理视频下载逻辑
  const handleVideoDownload = async (mediaType, videoUrl, pageUrl, downloadId, fileType, containerElement) => {
    console.log('执行handleVideoDownload');
    let lastRequestTime = 0;
    const requestInterval = 500;
    let currentTime = new Date().getTime();
    if (currentTime - lastRequestTime < requestInterval) return;
    lastRequestTime = currentTime;
    let videoId = '';
    if ('video' === fileType) {
      const streamIndex = videoUrl.indexOf('stream/') + 'stream/'.length;
      const encodedVideoId = videoUrl.substring(streamIndex);
      const decodedVideoId = decodeURIComponent(encodedVideoId);
      console.log('decodedVideoId', decodedVideoId);
      const videoData = JSON.parse(decodedVideoId);
      videoId = videoData.location.id;
    }
    document.addEventListener(videoId + 'video_download_progress', (event) => {
      const progressElement = containerElement.querySelector('.down_btn_progress');
      const downloadButton = containerElement.querySelector('.down_btn_video');
      const checkAllDownloadButton = containerElement.querySelector('.check-all-download');

      if (event.detail.progress !== null && event.detail.progress !== '100' && containerElement !== null) {
        let progressValue = null;

        if (downloadButton !== null) {
          downloadButton.style.display = 'none';
          progressValue = event.detail.progress;
        }

        if (checkAllDownloadButton !== null) {
          checkAllDownloadButton.style.display = 'none';
          progressValue = Math.max(-1, parseInt(event.detail.progress));
        }

        if (progressElement === null) {
          const progressContainerElement = document.createElement('div');
          progressContainerElement.className = 'progress-teleram-script';
          progressContainerElement.innerHTML = progressContainer.trim();
          containerElement.appendChild(progressContainerElement);
        } else {
          progressElement.style.display = 'block';
          progressElement.innerHTML = `${localizedText.dialog.progressText} ${progressValue}%`;
        }
      } else {
        if (downloadButton !== null) downloadButton.style.display = 'block';
        if (checkAllDownloadButton !== null) checkAllDownloadButton.style.display = 'flex';
        if (progressElement !== null) progressElement.style.display = 'none';
      }
    });

    const fileName = await getFileNameByClipBoard();

    const downloadEventDetail = {
      type: mediaType,
      video_src: {
        video_url: videoUrl,
        video_id: videoId,
        page: pageUrl,
        download_id: downloadId,
        fileName: fileName
      }
    };
    const videoDownloadEvent = new CustomEvent('video_download', { detail: downloadEventDetail });
    document.dispatchEvent(videoDownloadEvent);
    // chrome.runtime.sendMessage({
    //   action: 'sendAliYun',
    //   event: 'download_' + fileType,
    //   params: { url: videoUrl, filename: videoId }
    // })
  };

  // 初始化下载按钮事件
  const initializeDownloadButton = (containerElement, mediaElement, mediaType, downloadIndex) => {
    const downloadButton = containerElement.querySelector('.down_btn_' + mediaType);
    if (downloadButton && mediaElement) {
      const currentUrl = window.location.href;
      const hashIndex = currentUrl.indexOf('#');
      currentUrl.substring(0, hashIndex); // 这行代码没有实际效果；是否应该存储或使用？
      downloadButton.addEventListener('click', (event) => {
        console.log('initializeDownloadButton   click');
        event.preventDefault();
        event.stopPropagation();
        if (mediaType === 'video') {
          handleVideoDownload('single', mediaElement.src, currentUrl, downloadIndex + 1, 'video', containerElement);
        } else if (mediaType === 'img') {
          handleVideoDownload('single', mediaElement.src, currentUrl, downloadIndex + 1, 'image', containerElement);
        } else {
          console.error('Unsupported media type:', mediaType);
        }
      });
    }
  };

  // 点击事件延时处理
  const clickWithTimeout = (element, timeout = 500) =>
    new Promise((resolve, reject) => {
      element.click();
      setTimeout(resolve, timeout);
    });

  // 处理相册媒体（优化版）
  const processAlbumMedia = (mediaElement, downloadIndex, containerElement) => {
    return new Promise(async (resolve, reject) => {
      console.log('执行processAlbumMedia');
      try {
        // 打开相册媒体查看器
        mediaElement.parentNode.querySelector('.album-item-media').click();

        // 等待媒体查看器加载
        const mediaViewerContainer = await waitForElement('.media-viewer-movers');
        console.log('mediaViewerContainer:', mediaViewerContainer);

        // 获取视频元素
        const videoElements = await waitForElements(mediaViewerContainer, '.media-viewer-aspecter video');
        const videoElement = videoElements[0];
        console.log('videoElement:', videoElement);

        // 等待有效视频源
        const videoSrc = await waitForVideoSrcLoad(videoElement);
        console.log('videoSrc:', videoSrc);

        // 处理不同视频源类型
        if (videoSrc.includes('blob')) {
          console.log('检测到blob视频源');
          const menuElements = await waitForElements(document, '.quality-download-options-button-menu');
          const buttonMenu = menuElements[0];

          // 增强版菜单点击（带重试机制）
          const maxRetries = 3;
          let retryCount = 0;

          const clickMenuWithRetry = async () => {
            while (retryCount < maxRetries) {
              try {
                await clickWithTimeout(buttonMenu, 300);
                console.log(`第 ${retryCount + 1} 次点击下载菜单`);

                // 等待菜单项加载（带超时检测）
                const menuItems = await Promise.race([
                  waitForElements(buttonMenu, '.btn-menu-item', 1000),
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('菜单项加载超时')), 1000)
                  )
                ]);

                if (menuItems.length > 0) {
                  await clickWithTimeout(menuItems[0], 100);
                  console.log('已选择下载选项');
                  return; // 成功则退出循环
                }
              } catch (error) {
                console.warn(`菜单操作失败（尝试 ${retryCount + 1}/${maxRetries}）:`, error);
                retryCount++;

                // 增加指数退避延迟
                await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
              }
            }
            throw new Error(`连续 ${maxRetries} 次尝试打开菜单失败`);
          };

          await clickMenuWithRetry();
        } else {
          console.log('检测到stream视频源，开始下载 handleVideoDownload');
          handleVideoDownload('single', videoSrc, window.location.href, downloadIndex + 1, 'video', containerElement);
        }

        // 统一关闭查看器
        const closeViewer = () => {
          const topbar = document.querySelector('.media-viewer-topbar');
          topbar?.click();
          console.log('已关闭视频查看器');
        };

        // 添加关闭超时保护
        setTimeout(() => {
          closeViewer();
          resolve();
        }, 500);
      } catch (error) {
        console.error('处理相册媒体时出错:', error);
        reject(error);
      } finally {
        // 清理可能残留的查看器
        document.querySelector('.media-viewer-topbar')?.click();
      }
    });
  };

  // 初始化下载处理程序
  const initializeDownloadHandlers = () => {
    // 获取所有的消息气泡元素
    const messageBubbles = document.querySelectorAll('.bubble-content-wrapper');

    // 遍历每个消息气泡
    messageBubbles.forEach((messageBubble, index) => {
      // 查找消息气泡中的图片元素
      const imageElement = messageBubble.querySelector('.media-photo');
      // 查找消息气泡中的脚本内容
      const scriptContent = messageBubble.querySelector('.content-teleram-script');
      // 查找消息气泡中的视频元素
      const videoElement = messageBubble.querySelector('.media-video');
      // 查找消息气泡中的相册项
      const albumItems = messageBubble.querySelectorAll('.album-item');
      // 查找消息气泡中的视频时长
      const videoDuration = messageBubble.querySelector('.video-time');

      // 如果没有脚本内容且没有相册项，并且存在图片元素
      if (scriptContent === null && albumItems.length === 0 && imageElement !== null) {
        // 如果存在视频元素和视频时长
        if (videoElement !== null && videoDuration !== null) {
          // 添加视频下载按钮并初始化下载按钮事件
          appendDownloadButton(messageBubble, 'video', videoDownloadButton, 'attachment');
          initializeDownloadButton(messageBubble, videoElement, 'video', index);
        }

        // 如果存在视频时长但没有视频元素
        if (videoDuration !== null && videoElement === null) {
          // 添加视频下载按钮
          appendDownloadButton(messageBubble, 'video', videoDownloadButton, 'attachment');

          // 为视频下载按钮添加点击事件
          messageBubble.querySelector('.down_btn_video').addEventListener('click', (event) => {
            console.log('messageBubble   click');
            event.preventDefault();
            event.stopPropagation();

            // 模拟点击图片以打开视频查看器
            messageBubble.querySelector('.media-photo').click();

            setTimeout(() => {
              // 获取媒体查看器容器
              const mediaViewerContainer = document.querySelector('.media-viewer-movers');
              // 获取查看器中的视频元素
              const videoInViewer = mediaViewerContainer.querySelector('.media-viewer-aspecter video');
              // 如果src包含blob，点击原生按钮下载
              if (videoInViewer.src.includes('blob')) {
                waitForElements(document, '.quality-download-options-button-menu').then((elements) => {
                  setTimeout(() => {
                    const buttonMenu = elements[0];
                    buttonMenu.click();
                    console.log('button-menu click');
                    waitForElements(buttonMenu, '.btn-menu-item').then((elements) => {
                      setTimeout(() => {
                        elements[0].click();
                        console.log('elements[0] click');
                        setTimeout(() => {
                          document.querySelector('.media-viewer-topbar').click();
                          console.log('关闭blob视频查看器');
                        }, 500);
                      }, 100);
                    });
                  }, 100);
                });
              } else {
                // 处理视频下载
                handleVideoDownload('single', videoInViewer.src, window.location.href, index + 1, 'video', messageBubble);
                // 关闭视频查看器
                document.querySelector('.media-viewer-topbar').click();
              }
            }, 800);
          });
        }

        // 如果没有视频时长且没有视频元素
        if (videoDuration === null && videoElement === null) {
          // 添加图片下载按钮并初始化下载按钮事件
          appendDownloadButton(messageBubble, 'img', imageDownloadButton, 'attachment');
          initializeDownloadButton(messageBubble, imageElement, 'img', index);
        }
      }

      // 为每个相册项添加下载复选框
      albumItems.forEach((albumItem) => {
        const hasDownloadCheckbox = albumItem.querySelector('.download-check-item');
        if (!hasDownloadCheckbox) {
          appendDownloadButton(albumItem, 'check', downloadCheckbox, albumItem);
        }
      });

      // 查找所有的下载全部复选框
      const allDownloadCheckboxes = messageBubble.querySelectorAll('.download-checkbox-all');

      // 如果没有下载全部复选框且存在相册项
      if (allDownloadCheckboxes.length === 0 && messageBubble.querySelector('.album-item') !== null) {
        // 添加下载全部按钮
        appendDownloadButton(messageBubble, 'downloadAll', allFilesDownloadButton, messageBubble);

        // 为下载全部按钮添加点击事件
        messageBubble.querySelectorAll('.download-checkbox-all').forEach((checkbox) => {
          const parentContainer = checkbox.parentNode.parentNode;

          checkbox.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            // 获取所有的单个下载复选框
            const individualDownloadCheckboxes = parentContainer.querySelectorAll('.download-check-item');
            // 修复方案：将 NodeList 转换为数组
            const checkboxesArray = Array.from(individualDownloadCheckboxes);

            let downloadChain = Promise.resolve();

            // 修改为异步reduce
            downloadChain = checkboxesArray.reduce(async (chain, checkbox, itemIndex) => {
              if (!checkbox.checked) return chain;
              await chain;
              // 后续代码保持异步操作
              const videoTimeIndicator = checkbox.parentNode.querySelector('.video-time');
              if (videoTimeIndicator === null) {
                // 同步处理图片下载
                const imageUrl = checkbox.parentNode.querySelector('.media-photo').src;
                handleVideoDownload('single', imageUrl, imageUrl, itemIndex + 1, 'image', messageBubble);
              } else {
                try {
                  await processAlbumMedia(checkbox, itemIndex, messageBubble);
                } catch (error) {
                  console.error(`相册项 ${itemIndex} 下载失败:`, error);
                }
              }
            }, Promise.resolve());

            // 添加最终状态处理
            downloadChain.then(() => console.log('所有下载任务完成')).catch((finalError) => console.error('下载链意外终止:', finalError));
          });
        });
      }
    });
  };

  // 异步获取 Blob 数据
  const fetchBlobAsync = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      throw (console.error('Fetch error:', error), error);
    }
  };

  let g = [];
  // 异步处理媒体元素
  const processMediaElementsAsync = async () => {
    const bubbleContentWrappers = document.querySelectorAll('.bubble-content-wrapper');
    let mediaDetails = [];

    for (let index = 0; index < bubbleContentWrappers.length; index++) {
      const wrapper = bubbleContentWrappers[index];
      const imageElement = wrapper.querySelector('.media-photo');
      const videoElement = wrapper.querySelector('.media-video');
      const videoTimeElement = wrapper.querySelector('.video-time');

      if (imageElement !== null && videoTimeElement === null) {
        try {
          const imageBlob = await fetchBlobAsync(imageElement.src);
          const imageSizeMB = (imageBlob.size / 1048576).toFixed(2);
          const imageDetails = {
            index: index,
            fileName: imageElement.src,
            type: 'image',
            size: imageSizeMB + 'MB'
          };
          mediaDetails.push(imageDetails);
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      }

      if (videoElement !== null) {
        try {
          const streamIndex = videoElement.src?.indexOf('stream/') + 'stream/'.length;
          const encodedVideoData = videoElement.src?.substring(streamIndex);
          const decodedVideoData = decodeURIComponent(encodedVideoData);
          const videoData = JSON.parse(decodedVideoData);
          const videoSizeMB = (videoData.size / 1048576).toFixed(2);
          const videoDetails = {
            index: index,
            fileName: imageElement.src,
            videoUrl: videoElement.src,
            type: videoData.mimeType,
            size: videoSizeMB + 'MB',
            videoObj: videoData
          };
          mediaDetails.push(videoDetails);
        } catch (error) {
          console.error('Error fetching videoDetails:', error);
        }
      }
    }

    if (mediaDetails.length > 0) {
      g = mediaDetails;
    }
  };

  // 监听来自后台的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'executeScript') {
      const videoDetails = {
        type: message.data.type_tent,
        video_src: {
          video_url: message.data.url_tent,
          video_id: message.data.id_tent,
          page: message.data.current_url_tent,
          download_id: message.data.bin_index_tent
        }
      };
      console.log('来自后台的消息 videoDetails', videoDetails);
      const videoDownloadEvent = new CustomEvent('video_download', { detail: videoDetails });
      document.dispatchEvent(videoDownloadEvent);
    } else if ('popupSendData' === message.action) {
      sendResponse({ data: g });
    } else {
      console.log('content-teleram-not-find');
    }
    return true;
  });

  // 定时初始化下载处理程序和处理媒体元素
  setInterval(() => {
    initializeDownloadHandlers();
    processMediaElementsAsync();
  }, 5000);
})();
