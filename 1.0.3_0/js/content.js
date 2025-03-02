const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/inject.js');
document.head.appendChild(script);
import { Vue } from './vue.js'
(() => {
  let language = 'zh-CN';
  const data = { zh: { dialog: { title: '电报视频下载器', context: '你的五星好评是我们前进最大的动力🙏', loading: '正在检测中，请勿关闭当前页面！', sure: '支持一下', confirm: '残忍拒绝', butImg: '下载图片', butVideo: '下载视频', butAllFile: '强制下载', progressText: '下载进度：' } }, en: { dialog: { title: 'Telegram Video Downloader', context: 'Your 5-star rating is our biggest motivation! 🙏', loading: 'Under detection, please do not close the current page!', sure: 'Show Support', confirm: 'No Thanks', butImg: 'DOWNLOAD IMAGE', butVideo: 'DOWNLOAD VIDEO', butAllFile: 'FORCE DOWNLOAD', progressText: 'Download progress:' } } };
  let localizedText;
  function getLocalizedData() {
    return language.includes('zh') ? data['zh'] : data['en'];
  }
  function detectUserLanguage() {
    const userLanguage = navigator.language || navigator.browserLanguage;
    if (userLanguage) {
      language = userLanguage;
    }
  }
  detectUserLanguage();
  localizedText = getLocalizedData();
  const imageDownloadButton = `\n    <div class="content-teleram-script">\n      <div class="downloadBtnIns" style="max-width: 420px; display: flex; justify-content: center;">\n        <button class="download-images  down_btn_img" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px;">\n        ${localizedText.dialog.butImg}\n        </button>\n      </div>\n    </div>\n    `
  const videoDownloadButton = `\n    <div class="content-teleram-script">\n      <div class="downloadBtnIns" style="max-width: 420px; display: flex; justify-content: center;">\n        <button class="download-videos down_btn_video" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px;">\n        ${localizedText.dialog.butVideo}\n        </button>\n      </div>\n    </div>\n    `
  const progressContainer = '\n    <div class="content-teleram-script down_btn_progress"></div>\n    '
  const downloadCheckbox = '<input type="checkbox" class="download-check-item" name="checkbox-down" checked="true" />'
  const allFilesDownloadButton = `\n    <div style="max-width: 420px; display: flex; justify-content: center;" class="check-all-download">\n        <button class="download-checkbox-all" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px; padding: 5px 10px;">\n        ${localizedText.dialog.butAllFile}\n        </button>\n    </div>\n    `
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

    modalContainer.querySelector('.modal-content-loading').style.display = 'none';

    closeButton.addEventListener('click', () => {
      if (modalDialog) {
        modalDialog.style.display = 'none';
        chrome.runtime.sendMessage({ action: 'sendAliYun', event: 'dialog_close' });
      }
    });

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

    cancelButton.addEventListener('click', () => {
      if (modalDialog) {
        modalDialog.style.display = 'none';
        chrome.runtime.sendMessage({ action: 'sendAliYun', event: 'dialog_cancel' });
      }
    });

    document.body.appendChild(modalContainer);
  };
  const handleVideoDownload = (mediaType, videoUrl, pageUrl, downloadId, fileType, containerElement) => {
    chrome.storage.local.get('lastCountDialog', (lastDialogData) => {
      chrome.storage.local.get('usageCount', (usageCount) => {
        if (usageCount.usageCount) {
          const usageStats = usageCount.usageCount;
          if (
            lastDialogData.lastCountDialog >= usageStats.limit &&
            usageStats.popup === true &&
            lastDialogData.lastCountDialog !== null
          ) {
            showModalDialog();
            document.querySelector('.good-modal-dialog').style.display = 'block';
            chrome.runtime.sendMessage({ action: 'sendAliYun', event: 'dialog_block' });
          }
          else {
            let lastRequestTime = 0;
            const requestInterval = 500;
            let currentTime = new Date().getTime();
            if (currentTime - lastRequestTime < requestInterval) return;
            lastRequestTime = currentTime;
            let videoId = '';
            if ('video' === fileType) {
              const streamIndex = videoUrl.indexOf('stream/') + 'stream/'.length
              const encodedVideoId = videoUrl.substring(streamIndex)
              const decodedVideoId = decodeURIComponent(encodedVideoId)
              const videoData = JSON.parse(decodedVideoId)
              videoId = videoData.location.id
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
            const downloadEventDetail = {
              type: mediaType,
              video_src: {
                video_url: videoUrl,
                video_id: videoId,
                page: pageUrl,
                download_id: downloadId
              }
            }
            const videoDownloadEvent = new CustomEvent('video_download', { detail: downloadEventDetail });
            document.dispatchEvent(videoDownloadEvent)
            chrome.runtime.sendMessage({
              action: 'sendAliYun',
              event: 'download_' + fileType,
              params: { url: videoUrl, filename: videoId }
            })
            if (lastDialogData.lastCountDialog !== null) {
              chrome.storage.local.set({ lastCountDialog: lastDialogData.lastCountDialog + 1 });
            }
          }
        }
      });
    });
  }
  const initializeDownloadButton = (containerElement, mediaElement, mediaType, downloadIndex) => {
    const downloadButton = containerElement.querySelector('.down_btn_' + mediaType);
    if (downloadButton && mediaElement) {
      const currentUrl = window.location.href
      const hashIndex = currentUrl.indexOf('#');
      currentUrl.substring(0, hashIndex); // This line has no effect; should it be stored or used?
      downloadButton.addEventListener('click', (event) => {
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
  }
  const processAlbumMedia = (mediaElement, downloadIndex, containerElement) => {
    return new Promise((resolve, reject) => {
      mediaElement.parentNode.querySelector('.album-item-media').click();

      setTimeout(() => {
        const mediaViewerContainer = document.querySelector('.media-viewer-movers');
        const videoElement = mediaViewerContainer.querySelector('.media-viewer-aspecter video');

        handleVideoDownload('single', videoElement.src, window.location.href, downloadIndex + 1, 'video', containerElement);

        document.querySelector('.media-viewer-topbar').click();
        resolve();
      }, 300);
    });
  };
  const initializeDownloadHandlers = () => {
    const messageBubbles = document.querySelectorAll('.bubble-content-wrapper');

    messageBubbles.forEach((messageBubble, index) => {
      const imageElement = messageBubble.querySelector('.media-photo');
      const scriptContent = messageBubble.querySelector('.content-teleram-script');
      const videoElement = messageBubble.querySelector('.media-video');
      const albumItems = messageBubble.querySelectorAll('.album-item');
      const videoDuration = messageBubble.querySelector('.video-time');

      if (scriptContent === null && albumItems.length === 0 && imageElement !== null) {
        if (videoElement !== null && videoDuration !== null) {
          appendDownloadButton(messageBubble, 'video', videoDownloadButton, 'attachment');
          initializeDownloadButton(messageBubble, videoElement, 'video', index);
        }

        if (videoDuration !== null && videoElement === null) {
          appendDownloadButton(messageBubble, 'video', videoDownloadButton, 'attachment');

          messageBubble.querySelector('.down_btn_video').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            messageBubble.querySelector('.media-photo').click();

            setTimeout(() => {
              const mediaViewerContainer = document.querySelector('.media-viewer-movers');
              const videoInViewer = mediaViewerContainer.querySelector('.media-viewer-aspecter video');

              handleVideoDownload('single', videoInViewer.src, window.location.href, index + 1, 'video', messageBubble);
              document.querySelector('.media-viewer-topbar').click();
            }, 800);
          });
        }

        if (videoDuration === null && videoElement === null) {
          appendDownloadButton(messageBubble, 'img', imageDownloadButton, 'attachment');
          initializeDownloadButton(messageBubble, imageElement, 'img', index);
        }
      }

      albumItems.forEach((albumItem) => {
        const hasDownloadCheckbox = albumItem.querySelector('.download-check-item');
        if (!hasDownloadCheckbox) {
          appendDownloadButton(albumItem, 'check', downloadCheckbox, albumItem);
        }
      });

      const allDownloadCheckboxes = messageBubble.querySelectorAll('.download-checkbox-all');

      if (allDownloadCheckboxes.length === 0 && messageBubble.querySelector('.album-item') !== null) {
        appendDownloadButton(messageBubble, 'downloadAll', allFilesDownloadButton, messageBubble);

        messageBubble.querySelectorAll('.download-checkbox-all').forEach((checkbox) => {
          const parentContainer = checkbox.parentNode.parentNode;

          checkbox.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const individualDownloadCheckboxes = parentContainer.querySelectorAll('.download-check-item');
            let downloadChain = Promise.resolve();

            individualDownloadCheckboxes.forEach((checkbox, itemIndex) => {
              if (checkbox.checked) {
                const videoTimeIndicator = checkbox.parentNode.querySelector('.video-time');

                if (videoTimeIndicator === null) {
                  const imageUrl = checkbox.parentNode.querySelector('.media-photo').src;
                  handleVideoDownload('single', imageUrl, imageUrl, itemIndex + 1, 'image', messageBubble);
                } else {
                  downloadChain = downloadChain.then(() => processAlbumMedia(checkbox, itemIndex, messageBubble));
                }
              }
            });
          });
        });
      }
    });
  };

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
          const streamIndex = videoElement.src.indexOf('stream/') + 'stream/'.length;
          const encodedVideoData = videoElement.src.substring(streamIndex);
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
          console.error('Error fetching video:', error);
        }
      }
    }

    if (mediaDetails.length > 0) {
      g = mediaDetails;
    }
  };
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if ('executeScript' === message.action) {
      const videoDetails = {
        type: message.data.type_tent,
        video_src: {
          video_url: message.data.url_tent,
          video_id: message.data.id_tent,
          page: message.data.current_url_tent,
          download_id: message.data.bin_index_tent
        }
      };
      const videoDownloadEvent = new CustomEvent('video_download', { detail: videoDetails });
      document.dispatchEvent(videoDownloadEvent);
    } else if ('popupSendData' === message.action) {
      sendResponse({ data: g });
    } else {
      console.log('content-teleram-not-find');
    }
    return true;
  });
  setInterval(() => {
    initializeDownloadHandlers();
    processMediaElementsAsync();
  }, 5000);
})();