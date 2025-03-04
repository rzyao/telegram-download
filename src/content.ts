console.log('%c执行content-teleram.js', 'color:red;background-color:#4fad4f;');
// 创建一个新的 script 元素并设置其 src 属性为 inject.js 的路径
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/inject.js');
document.head.appendChild(script);
const appContainer = document.createElement('div');
appContainer.id = '__chrome-extension-app';
document.body.appendChild(appContainer);

import { getHTMLElement, getHTMLImgElement, getHTMLVideoElement, findHTMLElement, generateUniqueId } from './utils';

// 动态创建隔离环境
const iframe = document.createElement('iframe');
iframe.setAttribute('id', 'task-list-iframe');
iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
iframe.src = chrome.runtime.getURL('../html/content.html');


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

(() => {
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
  toggleIframe();

  const fullScreenContainer = () => {
    if (isWide) {
      iframe.style.width = '400px';
      resizeBtn.textContent = '调整宽度';
    } else {
      const columnCenter = document.getElementById('column-center');
      if (columnCenter) {
        iframe.style.width = columnCenter.clientWidth + 'px';
        resizeBtn.textContent = '恢复原宽度';
      }
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

    if (event.data.type === 'closeIframe') {
      // 执行对应操作
      toggleIframe();
    }
    if (event.data.type === 'fullScreenContainer') {
      fullScreenContainer();
    }
  });

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
    const userLanguage = navigator.language;
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
  const statusBoxInnerHTML = `<div class="status-box"/> <div class="download-status"/></div>`;

  // 添加下载按钮到指定的父元素
  const appendDownloadButton = (parentElement: HTMLElement, buttonType: string, buttonHtml: string, targetElement: HTMLElement | string) => {
    let newElement: HTMLElement | null = null;
    const existingButton = parentElement.querySelector('.down_btn_' + buttonType);

    newElement = targetElement !== 'attachment' ? targetElement as HTMLElement : parentElement;

    if (!existingButton) {
      const wrapperDiv = document.createElement('div');
      wrapperDiv.className = `${buttonType}-telegram-script`;
      const uniqueId = generateUniqueId();
      wrapperDiv.innerHTML = buttonHtml.trim();
      const checkBox = wrapperDiv.querySelector('.download-check-item') as HTMLElement;
      checkBox?.setAttribute('id', uniqueId);
      if (newElement) {
        // 添加选择框
        newElement.appendChild(wrapperDiv.firstChild as Node);


        if (checkBox) {
          const wrapperDiv2 = document.createElement('div');
          wrapperDiv2.className = `${buttonType}-telegram-script`;
          const uniqueId = generateUniqueId();
          wrapperDiv2.innerHTML = statusBoxInnerHTML.trim();

          // 添加状态容器
          const statusBox = wrapperDiv2.querySelector('.status-box') as HTMLElement;
          statusBox.id = uniqueId;
          newElement.appendChild(wrapperDiv2.firstChild as Node);
        }

      }

    }
  };

  const setElementStatus = (id: string, status: string) => {
    const statusContainerElement = document.getElementById(id) as HTMLElement;
    const statusElement = getHTMLElement(statusContainerElement, '.download-status') as HTMLElement;
    if (statusContainerElement) {
      switch (status) {
        case 'success':
          statusElement.setAttribute('class', 'download-status status-success');
          break;
        case 'error':
          statusElement.setAttribute('class', 'download-status status-error');
          break;
      }
    }
  };

  const sendMessageToIframe = (type: string, id: string | undefined, status: string, info: any) => {
    console.log('%c sendMessageToIframe', 'color: red; font-weight: bold;', type, id, status, info);
    if (!id) return;
    const iframe = document.getElementById('task-list-iframe') as HTMLIFrameElement;
    console.log('%c iframe', 'color: red; font-weight: bold;', iframe);
    if (iframe?.contentWindow) {
      console.log('%c iframe.contentWindow', 'color: red; font-weight: bold;', iframe.contentWindow);
      // 修改 postMessage 的目标源为 '*'
      iframe.contentWindow.postMessage({ type, id, status, info }, '*');
    }
  };

  // 等待元素加载
  const waitForElements = (container: HTMLElement | Document, selector: string, timeout = 15000): Promise<HTMLElement[]> => {
    return new Promise((resolve, reject) => {
      // 将 NodeList 转换为数组
      const target = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
      if (target.length > 0) return resolve(target);

      const observer = new MutationObserver((mutations) => {
        const updatedTarget = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
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
  const waitForElement = (selector: string, timeout = 15000): Promise<HTMLElement | Error> => {
    return new Promise((resolve, reject) => {
      // 如果已存在则直接返回
      const target = document.querySelector(selector) as HTMLElement;
      if (target) return resolve(target);

      // 配置观察选项
      const observer = new MutationObserver((mutations) => {
        const updatedTarget = document.querySelector(selector) as HTMLElement;
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
  const waitForVideoSrcLoad = (videoElement: HTMLVideoElement, interval = 100): Promise<string | Error> => {
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


  /**
   * 处理视频下载函数handleVideoDownload的可选参数
   * @param mediaPhotoSrc 媒体图片的src
   * @param taskId 任务id
   */
  interface handleVideoDownloadOptions {
    mediaPhotoSrc?: string;
    taskId?: string;
  }

  // 处理视频下载逻辑
  const handleVideoDownload = async (mediaType: string, videoUrl: string, pageUrl: string, downloadId: string, fileType: string, containerElement: HTMLElement, options: handleVideoDownloadOptions = {}) => {
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

    // 监听视频下载进度
    document.addEventListener(videoId + 'video_download_progress', (event: any) => {
      console.log('video_download_progress', event);

      const progressElement = containerElement.querySelector('.down_btn_progress') as HTMLElement;
      const downloadButton = containerElement.querySelector('.down_btn_video') as HTMLElement;
      const checkAllDownloadButton = containerElement.querySelector('.check-all-download') as HTMLElement;

      if (event.detail.progress !== null && event.detail.progress !== '100' && containerElement !== null) {
        sendMessageToIframe('down_task_status', event.detail.task_id, 'downloading', event.detail.progress);
        let progressValue: number | string = 0;

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
      if (event.detail.progress === '100') {
        sendMessageToIframe('down_task_status', event.detail.task_id, 'completed', event.detail.progress);
        setElementStatus(event.detail.task_id, 'success');
      }
    });

    console.log('%c options', 'color: red; font-weight: bold;', options)
    if (options?.taskId) {
      const fileName = await getFileNameByClipBoard();
      const downloadEventDetail = {
        type: mediaType,
        video_src: {
          video_url: videoUrl,
          video_id: videoId,
          page: pageUrl,
          download_id: downloadId,
          fileName: fileName,
          taskId: options.taskId
        }
      };
      window.postMessage(downloadEventDetail, '*');
      sendMessageToIframe('add_task', options.taskId, 'pending', options.mediaPhotoSrc);
    }
  };

  // 初始化下载按钮事件
  const initializeDownloadButton = (containerElement: HTMLElement, mediaElement: HTMLImageElement | HTMLVideoElement, mediaType: string, downloadIndex: number) => {
    const downloadButton = getHTMLElement(containerElement, '.down_btn_' + mediaType);
    if (downloadButton && mediaElement) {
      const currentUrl = window.location.href;
      const hashIndex = currentUrl.indexOf('#');
      currentUrl.substring(0, hashIndex);
      downloadButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (mediaType === 'video') {
          handleVideoDownload('single', mediaElement.src, currentUrl, String(downloadIndex + 1), 'video', containerElement);
        } else if (mediaType === 'img') {
          handleVideoDownload('single', mediaElement.src, currentUrl, String(downloadIndex + 1), 'image', containerElement);
        } else {
          console.error('Unsupported media type:', mediaType);
        }
      });
    }
  };

  // 点击事件延时处理
  const clickWithTimeout = (element: HTMLElement, timeout = 500) =>
    new Promise((resolve, reject) => {
      element.click();
      setTimeout(resolve, timeout);
    });

  // 处理相册媒体（优化版）
  const processAlbumMedia = (mediaElement: HTMLElement, downloadIndex: string, containerElement: HTMLElement): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      (async () => {
        try {
          const parent = mediaElement.parentNode as HTMLElement;
          const statusBox = parent.querySelector('.status-box');
          const taskId = statusBox?.getAttribute('id') || undefined;
          const albumMedia = getHTMLElement(parent, '.album-item-media') as HTMLElement;
          const mediaPhotoSrc = albumMedia.querySelector('.media-photo')?.getAttribute('src') || '';
          albumMedia.click();

          const mediaViewerContainer = await waitForElement('.media-viewer-movers');
          if (mediaViewerContainer instanceof Error) {
            throw mediaViewerContainer
          }

          // 获取视频元素
          const videoElements = await waitForElements(mediaViewerContainer, '.media-viewer-aspecter video');
          const videoElement = videoElements[0] as HTMLVideoElement;
          console.log('videoElement:', videoElement);

          // 等待有效视频源
          const videoSrc = await waitForVideoSrcLoad(videoElement);
          if (videoSrc instanceof Error) {
            throw videoSrc
          }
          console.log('videoSrc:', videoSrc);

          // 处理不同视频源类型
          if (videoSrc.includes('blob')) {
            console.log('检测到blob视频源');
            const menuElements = await waitForElements(document, '.quality-download-options-button-menu');
            const buttonMenu = menuElements[0] as HTMLElement;

            // 增强版菜单点击（带重试机制）
            const maxRetries = 3;
            let retryCount = 0;

            const clickMenuWithRetry = async (): Promise<void> => {
              while (retryCount < maxRetries) {
                try {
                  await clickWithTimeout(buttonMenu, 300);
                  console.log(`第 ${retryCount + 1} 次点击下载菜单`);

                  // 等待菜单项加载（带超时检测）
                  const menuItems = await Promise.race([
                    waitForElements(buttonMenu, '.btn-menu-item', 1000),
                    new Promise<Element[]>((_, reject) =>
                      setTimeout(() => reject(new Error('菜单项加载超时')), 1000)
                    )
                  ]) as Element[];

                  if (menuItems.length > 0) {
                    await clickWithTimeout(menuItems[0] as HTMLElement, 100);
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
            handleVideoDownload('single', videoSrc, window.location.href, downloadIndex + 1, 'video', containerElement, { taskId, mediaPhotoSrc });
          }

          // 统一关闭查看器
          const closeViewer = () => {
            const topbar = document.querySelector('.media-viewer-topbar') as HTMLElement;
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
          const topbar = document.querySelector('.media-viewer-topbar') as HTMLElement;
          topbar?.click();
        }
      })();  // 立即执行
    });
  };

  // 初始化下载处理程序
  const initializeDownloadHandlers = () => {
    // 获取所有的消息气泡元素
    const messageBubbles = document.querySelectorAll('.bubble-content-wrapper') as NodeListOf<HTMLElement>;

    // 遍历每个消息气泡
    messageBubbles.forEach((messageBubble, index) => {
      // 查找消息气泡中的图片元素
      const imageElement = messageBubble.querySelector('.media-photo') as HTMLImageElement;
      // 查找消息气泡中的脚本内容
      const scriptContent = messageBubble.querySelector('.content-teleram-script');
      // 查找消息气泡中的视频元素
      const videoElement = messageBubble.querySelector('.media-video') as HTMLVideoElement;
      // 查找消息气泡中的相册项
      const albumItems = messageBubble.querySelectorAll('.album-item') as NodeListOf<HTMLElement>;
      // 查找消息气泡中的视频时长
      const videoDuration = messageBubble.querySelector('.video-time') as HTMLElement;

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
          const downBtnVideo = getHTMLElement(messageBubble, '.down_btn_video') as HTMLElement;
          downBtnVideo?.addEventListener('click', (event) => {
            console.log('messageBubble   click');
            event.preventDefault();
            event.stopPropagation();

            // 模拟点击图片以打开视频查看器
            const mediaPhoto = getHTMLElement(messageBubble, '.media-photo') as HTMLImageElement;
            const mediaPhotoSrc = mediaPhoto.src;
            mediaPhoto?.click();

            setTimeout(() => {
              // 获取媒体查看器容器
              const mediaViewerContainer = getHTMLElement(document, '.media-viewer-movers') as HTMLElement;
              // 获取查看器中的视频元素
              const videoInViewer = getHTMLVideoElement(mediaViewerContainer, '.media-viewer-aspecter video') as HTMLVideoElement;
              // 如果src包含blob，点击原生按钮下载
              if (videoInViewer.src.includes('blob')) {
                waitForElements(document, '.quality-download-options-button-menu').then((elements) => {
                  setTimeout(() => {
                    const buttonMenu = elements[0] as HTMLElement;
                    buttonMenu.click();
                    console.log('button-menu click');
                    waitForElements(buttonMenu, '.btn-menu-item').then((elements) => {
                      setTimeout(() => {
                        elements[0]?.click();
                        console.log('elements[0] click');
                        setTimeout(() => {
                          const topbar = getHTMLElement(document, '.media-viewer-topbar') as HTMLElement;
                          topbar?.click();
                          console.log('关闭blob视频查看器');
                        }, 500);
                      }, 100);
                    });
                  }, 100);
                });
              } else {
                // 处理视频下载
                handleVideoDownload('single', videoInViewer.src, window.location.href, String(index + 1), 'video', messageBubble, { mediaPhotoSrc: mediaPhotoSrc });
                // 关闭视频查看器
                const topbar = getHTMLElement(document, '.media-viewer-topbar') as HTMLElement;
                topbar?.click();
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

      // 查找所有的下载全部按钮
      const allDownloadButton = messageBubble.querySelectorAll('.download-checkbox-all');

      // 如果没有下载全部按钮且存在相册项
      if (allDownloadButton.length === 0 && messageBubble.querySelector('.album-item') !== null) {
        // 添加下载全部按钮
        appendDownloadButton(messageBubble, 'downloadAll', allFilesDownloadButton, messageBubble);

        // 为下载全部按钮添加点击事件
        messageBubble.querySelectorAll('.download-checkbox-all').forEach((checkbox) => {
          const parentContainer = checkbox.parentNode?.parentNode as HTMLElement;

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
              const checkboxInput = checkbox as HTMLInputElement;
              if (!checkboxInput.checked) return chain;
              await chain;

              const videoTimeIndicator = checkboxInput.parentNode?.querySelector('.video-time');
              if (videoTimeIndicator === null) {
                const imageUrl = (checkboxInput.parentNode?.querySelector('.media-photo') as HTMLImageElement).src;
                handleVideoDownload('single', imageUrl, imageUrl, String(itemIndex + 1), 'image', messageBubble);
              } else {
                try {
                  await processAlbumMedia(checkboxInput, String(itemIndex + 1), messageBubble);
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
  const fetchBlobAsync = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      throw (console.error('Fetch error:', error), error);
    }
  };

  let g: any[] = [];
  // 异步处理媒体元素
  const processMediaElementsAsync = async () => {
    const bubbleContentWrappers = document.querySelectorAll('.bubble-content-wrapper') as NodeListOf<HTMLElement>;
    let mediaDetails: { index: number; fileName: string; type: string; size: string; }[] = [];

    for (let index = 0; index < bubbleContentWrappers.length; index++) {
      const wrapper = bubbleContentWrappers[index];
      const imageElement = wrapper.querySelector('.media-photo') as HTMLImageElement;
      const videoElement = wrapper.querySelector('.media-video') as HTMLVideoElement;
      const videoTimeElement = wrapper.querySelector('.video-time') as HTMLElement;

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
            fileName: imageElement?.src,
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
  chrome.runtime.onMessage.addListener((message: { action: string; data: any; }, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
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


