import {
  getHTMLElement,
  getHTMLVideoElement,
  generateUniqueId,
  injectScript,
  injectAnimationStyle,
  initIframe,
  createControlButton,
  toggleIframe,
  resizeIframe,
  initLocalization,
  initHtmlTemplate,
  appendElement,
  setElementStatus,
  sendMessageToIframe,
  waitForElement,
  waitForElements,
  waitForVideoSrcLoad,
  sendMessageToInject,
  getFileNameByClipBoard,
} from './utils';
/* 注入脚本 */
injectScript('js/inject.js');
const localizedText = initLocalization();
/* 注入动画样式 */
injectAnimationStyle();
/* 初始化iframe */
const iframe = initIframe('task-list-iframe', '../iframe/iframe.html');
let isVisible = false;
let isAnimating = false;
let isWide = false;
const identifier = 'content script';
/* 添加控制按钮 */
const toggleBtn = createControlButton(localizedText.taskPanel);
toggleBtn.addEventListener('click', () => {
  toggleIframe(iframe, toggleBtn, isVisible, isAnimating);
  isVisible = !isVisible;
});
// ESC键关闭支持
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isVisible) {
    toggleIframe(iframe, toggleBtn, isVisible, isAnimating);
    isVisible = !isVisible;
  }
});
// 直接获取扩展ID
const extensionId = chrome.runtime.id;

window.addEventListener('message', (event) => {
  // 定义预期的扩展消息来源
  const expectedOrigin = 'chrome-extension://' + extensionId;

  // 验证消息的来源是否符合预期
  if (event.origin !== expectedOrigin) return;

  if (event.data.type === 'closeIframe') {
    // 执行对应操作
    toggleIframe(iframe, toggleBtn, isVisible, isAnimating);
    isVisible = !isVisible;
  }
  if (event.data.type === 'fullScreenContainer') {
    resizeIframe(iframe, toggleBtn, isWide);
    isWide = !isWide;
  }
  if (event.data.type === 'downloadTask') {
    sendMessageToInject(event.data.content);
  }
});


const htmlTemplate = initHtmlTemplate(
  localizedText.butImg,
  localizedText.butVideo,
  localizedText.butAllFile,
);
/**
 * 处理视频下载函数handleVideoDownload的可选参数
 * @param mediaPhotoSrc 媒体图片的src
 * @param taskId 任务id
 */
interface handleVideoDownloadOptions {
  mediaPhotoSrc?: string;
  taskId?: string;
}

/**
 * 处理视频下载逻辑
 *
 * @param {string} mediaType 媒体类型
 * @param {string} videoUrl 视频URL
 * @param {string} pageUrl 页面URL
 * @param {string} downloadId 下载ID
 * @param {string} fileType 文件类型
 * @param {HTMLElement} messageBubble 容器元素
 * @param {HtmlTemplate} htmlTemplate HTML模板
 * @param {LocalizationData} localizedText 本地化文本
 * @param {handleVideoDownloadOptions} [options={}] 可选参数
 */
const handleVideoDownload = async (
  mediaType: string,
  videoUrl: string,
  pageUrl: string,
  downloadId: string,
  fileType: string,
  messageBubble: HTMLElement,
  htmlTemplate: HtmlTemplates,
  localizedText: LocalizationData,
  options: handleVideoDownloadOptions = {},
) => {
  console.log(identifier, 'handleVideoDownload');
  let lastRequestTime = 0;
  const requestInterval = 500;
  let currentTime = new Date().getTime();
  console.log(identifier, 'currentTime', currentTime);
  console.log(identifier, 'lastRequestTime', lastRequestTime);
  console.log(identifier, 'requestInterval', requestInterval);
  console.log(identifier, 'currentTime - lastRequestTime', currentTime - lastRequestTime);
  if (currentTime - lastRequestTime < requestInterval) return;
  lastRequestTime = currentTime;
  let videoId = '';
  console.log(identifier, 'fileType', fileType);
  if (fileType === 'video') {
    const streamIndex = videoUrl.indexOf('stream/') + 'stream/'.length;
    const encodedVideoId = videoUrl.substring(streamIndex);
    const decodedVideoId = decodeURIComponent(encodedVideoId);
    const videoData = JSON.parse(decodedVideoId);
    videoId = videoData.location.id;
  }
  console.log(identifier, 'videoId', videoId);

  // 监听视频下载进度
  document.addEventListener(videoId + 'video_download_progress', (event: any) => {
    const progressElement = messageBubble.querySelector('.down_btn_progress') as HTMLElement;
    const downloadButton = messageBubble.querySelector('.down_btn_video') as HTMLElement;
    const checkAllDownloadButton = messageBubble.querySelector(
      '.check-all-download',
    ) as HTMLElement;

    if (
      event.detail.progress !== null &&
      event.detail.progress !== '100' &&
      messageBubble !== null
    ) {
      sendMessageToIframe(
        'down_task_status',
        event.detail.task_id,
        'downloading',
        event.detail.progress,
      );
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
        progressContainerElement.innerHTML = htmlTemplate.progressContainer.trim();
        messageBubble.appendChild(progressContainerElement);
      } else {
        progressElement.style.display = 'block';
        progressElement.innerHTML = `${localizedText.progressText} ${progressValue}%`;
      }
    } else {
      if (downloadButton !== null) downloadButton.style.display = 'block';
      if (checkAllDownloadButton !== null) checkAllDownloadButton.style.display = 'flex';
      if (progressElement !== null) progressElement.style.display = 'none';
    }
    if (event.detail.progress === '100') {
      sendMessageToIframe(
        'down_task_status',
        event.detail.task_id,
        'completed',
        event.detail.progress,
      );
      setElementStatus(event.detail.task_id, 'success');
    }
  });
  console.log(identifier, 'options', options);
  if (options?.taskId) {
    const fileName = await getFileNameByClipBoard();
    const downloadEventDetail = {
      type: mediaType,
      video_url: videoUrl,
      video_id: videoId,
      page: pageUrl,
      download_id: downloadId,
      fileName: fileName,
      taskId: options.taskId,
    };
    sendMessageToInject(downloadEventDetail);
    sendMessageToIframe(
      'add_task',
      options.taskId,
      'pending',
      options.mediaPhotoSrc,
      downloadEventDetail,
    );
  } else {
    console.log(`%c[${identifier}] : 缺少taskId`, `color: red;`);
  }
};

/* 初始化下载按钮 */
const initializeDownloadButton = (
  messageBubble: HTMLElement,
  mediaElement: HTMLImageElement | HTMLVideoElement,
  mediaType: string,
  downloadIndex: number,
  htmlTemplate: HtmlTemplates,
  localizedText: LocalizationData,
  mediaPhotoElement: HTMLImageElement | HTMLVideoElement,
) => {
  const downloadButton = getHTMLElement(messageBubble, '.down_btn_' + mediaType);
  const parentElement = mediaElement.parentElement as HTMLElement;
  console.log('parentElement', parentElement);
  if (downloadButton && mediaElement) {
    const statusWrapper = document.createElement('div');
    statusWrapper.innerHTML = htmlTemplate.statusBoxInnerHTML.trim();
    const statusBox = statusWrapper.querySelector('.status-box') as HTMLElement;
    const id = generateUniqueId();
    statusBox.id = id;
    parentElement.appendChild(statusWrapper.firstChild as Node);
    const pageUrl = window.location.href;
    const hashIndex = pageUrl.indexOf('#');
    pageUrl.substring(0, hashIndex);
    downloadButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (mediaType === 'video') {
        handleVideoDownload(
          'single',
          mediaElement.src,
          pageUrl,
          String(downloadIndex + 1),
          'video',
          messageBubble,
          htmlTemplate,
          localizedText,
          { mediaPhotoSrc: mediaPhotoElement?.src, taskId: id },
        );
      } else if (mediaType === 'img') {
        handleVideoDownload(
          'single',
          mediaElement.src,
          pageUrl,
          String(downloadIndex + 1),
          'image',
          messageBubble,
          htmlTemplate,
          localizedText,
          { mediaPhotoSrc: mediaPhotoElement?.src, taskId: id },
        );
      } else {
        console.error('未支持的媒体类型:', mediaType);
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
const processAlbumMedia = (
  mediaElement: HTMLElement,
  downloadIndex: string,
  containerElement: HTMLElement,
): Promise<void> => {
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
          throw mediaViewerContainer;
        }

        // 获取视频元素
        const videoElements = await waitForElements(
          mediaViewerContainer,
          '.media-viewer-aspecter video',
        );
        const videoElement = videoElements[0] as HTMLVideoElement;

        // 等待有效视频源
        const videoSrc = await waitForVideoSrcLoad(videoElement);
        if (videoSrc instanceof Error) {
          throw videoSrc;
        }

        // 处理不同视频源类型
        if (videoSrc.includes('blob')) {
          console.log(identifier, '检测到blob视频源');
          const menuElements = await waitForElements(
            document,
            '.quality-download-options-button-menu',
          );
          const buttonMenu = menuElements[0] as HTMLElement;

          // 增强版菜单点击（带重试机制）
          const maxRetries = 3;
          let retryCount = 0;

          const clickMenuWithRetry = async (): Promise<void> => {
            while (retryCount < maxRetries) {
              try {
                await clickWithTimeout(buttonMenu, 300);
                console.log(identifier, `第 ${retryCount + 1} 次点击下载菜单`);

                // 等待菜单项加载（带超时检测）
                const menuItems = (await Promise.race([
                  waitForElements(buttonMenu, '.btn-menu-item', 1000),
                  new Promise<Element[]>((_, reject) =>
                    setTimeout(() => reject(new Error('菜单项加载超时')), 1000),
                  ),
                ])) as Element[];

                if (menuItems.length > 0) {
                  await clickWithTimeout(menuItems[0] as HTMLElement, 100);
                  console.log(identifier, '已选择下载选项');
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
          console.log(identifier, '检测到stream视频源，开始下载 handleVideoDownload');
          handleVideoDownload(
            'single',
            videoSrc,
            window.location.href,
            downloadIndex + 1,
            'video',
            containerElement,
            htmlTemplate,
            localizedText,
            { taskId, mediaPhotoSrc },
          );
        }

        // 统一关闭查看器
        const closeViewer = () => {
          const topbar = document.querySelector('.media-viewer-topbar') as HTMLElement;
          topbar?.click();
          console.log(identifier, '已关闭视频查看器');
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
    })(); // 立即执行
  });
};



/**
 * 初始化下载处理程序
 * @param {HtmlTemplate} htmlTemplate
 */
const initializeDownloadHandlers = (htmlTemplate: HtmlTemplates, localizedText: LocalizationData) => {
  // 获取所有的消息气泡元素
  const messageBubbles = document.querySelectorAll(
    '.bubble-content-wrapper',
  ) as NodeListOf<HTMLElement>;
  console.log('messageBubbles', messageBubbles);

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
        console.log('videoElement !== null && videoDuration !== null');
        // 添加视频下载按钮并初始化下载按钮事件,单视频气泡,可直接下载
        appendElement(messageBubble, 'video', htmlTemplate.videoDownloadButton, 'attachment', htmlTemplate);
        initializeDownloadButton(messageBubble, videoElement, 'video', index, htmlTemplate, localizedText, imageElement);
      }

      // 如果存在视频时长但没有视频元素,单视频气泡,需要选择清晰度下载
      if (videoDuration !== null && videoElement === null) {
        console.log('videoDuration !== null && videoElement === null');
        // 添加视频下载按钮
        appendElement(messageBubble, 'video', htmlTemplate.videoDownloadButton, 'attachment', htmlTemplate);
        const statusWrapper = document.createElement('div');
        statusWrapper.innerHTML = htmlTemplate.statusBoxInnerHTML.trim();
        const statusBox = statusWrapper.querySelector('.status-box') as HTMLElement;
        const id = generateUniqueId();
        statusBox.id = id;
        messageBubble.querySelector('.media-container')?.appendChild(statusWrapper.firstChild as Node);

        // 为视频下载按钮添加点击事件
        const downBtnVideo = getHTMLElement(messageBubble, '.down_btn_video') as HTMLElement;
        downBtnVideo?.addEventListener('click', (event) => {
          console.log(identifier, 'messageBubble   click');
          event.preventDefault();
          event.stopPropagation();

          // 模拟点击图片以打开视频查看器
          const mediaPhoto = getHTMLElement(messageBubble, '.media-photo') as HTMLImageElement;
          const mediaPhotoSrc = mediaPhoto.src;
          mediaPhoto?.click();

          setTimeout(() => {
            // 获取媒体查看器容器
            const mediaViewerContainer = getHTMLElement(
              document,
              '.media-viewer-movers',
            ) as HTMLElement;
            // 获取查看器中的视频元素
            const videoInViewer = getHTMLVideoElement(
              mediaViewerContainer,
              '.media-viewer-aspecter video',
            ) as HTMLVideoElement;
            // 如果src包含blob，点击原生按钮下载
            if (videoInViewer.src.includes('blob')) {
              waitForElements(document, '.quality-download-options-button-menu').then(
                (elements) => {
                  setTimeout(() => {
                    const buttonMenu = elements[0] as HTMLElement;
                    buttonMenu.click();
                    console.log(identifier, 'button-menu click');
                    waitForElements(buttonMenu, '.btn-menu-item').then((elements) => {
                      setTimeout(() => {
                        elements[0]?.click();
                        console.log(identifier, 'elements[0] click');
                        setTimeout(() => {
                          const topbar = getHTMLElement(
                            document,
                            '.media-viewer-topbar',
                          ) as HTMLElement;
                          topbar?.click();
                          console.log(identifier, '关闭blob视频查看器');
                        }, 500);
                      }, 100);
                    });
                  }, 100);
                },
              );
            } else {
              // 处理视频下载
              handleVideoDownload(
                'single',
                videoInViewer.src,
                window.location.href,
                String(index + 1),
                'video',
                messageBubble,
                htmlTemplate,
                localizedText,
                { mediaPhotoSrc: mediaPhotoSrc, taskId: id },
              );
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
        appendElement(messageBubble, 'img', htmlTemplate.imageDownloadButton, 'attachment', htmlTemplate);
        initializeDownloadButton(messageBubble, imageElement, 'img', index, htmlTemplate, localizedText, imageElement);
      }
    }
    // 如果没有脚本内容且没有相册项，并且不存在图片元素，没有缩略图
    if (scriptContent === null && albumItems.length === 0 && videoDuration !== null && videoElement !== null && imageElement === null) {
      appendElement(messageBubble, 'video', htmlTemplate.videoDownloadButton, 'attachment', htmlTemplate);
      const img = document.createElement('img');
      img.src = ''
      initializeDownloadButton(messageBubble, videoElement, 'video', index, htmlTemplate, localizedText, img);
    }

    // 为每个相册项添加下载复选框
    albumItems.forEach((albumItem) => {
      const hasDownloadCheckbox = albumItem.querySelector('.download-check-item');
      if (!hasDownloadCheckbox) {
        appendElement(albumItem, 'check', htmlTemplate.downloadCheckbox, albumItem, htmlTemplate);
      }
    });

    // 查找下载全部按钮
    const allDownloadButton = messageBubble.querySelectorAll('.download-checkbox-all');

    // 如果没有下载全部按钮且存在相册项
    if (allDownloadButton.length === 0 && messageBubble.querySelector('.album-item') !== null) {
      // 添加下载全部按钮
      appendElement(messageBubble, 'downloadAll', htmlTemplate.allFilesDownloadButton, messageBubble, htmlTemplate);

      // 为下载全部按钮添加点击事件
      messageBubble.querySelectorAll('.download-checkbox-all').forEach((checkbox) => {
        const parentContainer = checkbox.parentNode?.parentNode as HTMLElement;

        checkbox.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();

          // 获取所有的单个下载复选框
          const individualDownloadCheckboxes =
            parentContainer.querySelectorAll('.download-check-item');
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
              const imageUrl = (
                checkboxInput.parentNode?.querySelector('.media-photo') as HTMLImageElement
              ).src;
              const taskId = document.getElementById(checkboxInput.id)?.id;
              handleVideoDownload(
                'single',
                imageUrl,
                imageUrl,
                String(itemIndex + 1),
                'image',
                messageBubble,
                htmlTemplate,
                localizedText,
                { mediaPhotoSrc: imageUrl, taskId },
              );
            } else {
              try {
                await processAlbumMedia(checkboxInput, String(itemIndex + 1), messageBubble);
              } catch (error) {
                console.error(`相册项 ${itemIndex} 下载失败:`, error);
              }
            }
          }, Promise.resolve());

          // 添加最终状态处理
          downloadChain
            .then(() => console.log(identifier, '所有下载任务添加完成'))
            .catch((finalError) => console.error('下载链意外终止:', finalError));
        });
      });
    }
  });
};

// 定时初始化下载处理程序和处理媒体元素
setInterval(() => {
  initializeDownloadHandlers(htmlTemplate, localizedText);
}, 5000);      