const log = {
  info: (identifier2, message, ...args) => {
    console.log(`%c[${identifier2}] : ${message}`, `color: black;`, ...args);
  },
  error: (identifier2, message, ...args) => {
    console.warn(`%c[${identifier2}] : ${message}`, `color: red;`, ...args);
  }
};
function getHTMLElement(parentElement, selector) {
  try {
    const element = parentElement.querySelector(selector);
    if (!element) {
      throw new Error(`未找到匹配的元素，选择器: "${selector}"`);
    }
    if (!(element instanceof HTMLElement)) {
      throw new Error(`选择器 "${selector}" 返回的元素不是 HTMLElement 类型`);
    }
    return element;
  } catch (error) {
    console.error("getHTMLElement 发生错误:", error);
    return null;
  }
}
function getHTMLVideoElement(parentElement, selector) {
  try {
    const element = parentElement.querySelector(selector);
    if (!element) {
      throw new Error(`未找到匹配的元素，选择器: "${selector}"`);
    }
    if (!(element instanceof HTMLVideoElement)) {
      throw new Error(`选择器 "${selector}" 返回的元素不是 HTMLVideoElement 类型`);
    }
    return element;
  } catch (error) {
    console.error("getHTMLVideoElement 发生错误:", error);
    return null;
  }
}
function generateUniqueId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomPart}`;
  }
}
function injectScript(filePath) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(filePath);
  document.head.appendChild(script);
  script.onload = () => {
    script.remove();
  };
}
function injectAnimationStyle() {
  const style = document.createElement("style");
  style.textContent = `
   @keyframes slideOutRight {
     from { transform: translateX(0); opacity: 1; }
     to   { transform: translateX(100%); opacity: 0; }
   }
   @keyframes slideInRight {
     from { transform: translateX(100%); opacity: 0; }
     to   { transform: translateX(0); opacity: 1; }
   }
   .iframe-animation {
     transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   }
   .slide-out { animation: slideOutRight 0.5s forwards; }
   .slide-in  { animation: slideInRight 0.5s forwards; }
 `;
  document.head.appendChild(style);
}
function initIframe(id, src) {
  const iframe2 = document.createElement("iframe");
  iframe2.id = id;
  iframe2.src = chrome.runtime.getURL(src);
  Object.assign(iframe2.style, {
    position: "fixed",
    right: "0px",
    bottom: "20px",
    width: "400px",
    height: "600px",
    border: "none",
    zIndex: "2147483647",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
    borderRadius: "8px",
    transform: "translateX(0)",
    opacity: "1",
    display: "none"
  });
  document.body.appendChild(iframe2);
  return iframe2;
}
function createControlButton(text) {
  const toggleBtn2 = document.createElement("button");
  Object.assign(toggleBtn2.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    "z-index": "2147483646",
    padding: "8px 16px",
    "border-radius": "4px",
    background: "#008aff",
    color: "white",
    border: "none",
    cursor: "pointer"
  });
  toggleBtn2.textContent = text;
  document.body.appendChild(toggleBtn2);
  return toggleBtn2;
}
function toggleIframe(iframe2, toggleBtn2, isVisible2, isAnimating2) {
  if (isAnimating2) return;
  if (isVisible2) {
    iframe2.classList.add("slide-out");
    toggleBtn2.textContent = "任务列表";
  } else {
    iframe2.style.display = "block";
    iframe2.classList.add("slide-in");
    toggleBtn2.textContent = "任务列表";
  }
  iframe2.addEventListener(
    "animationend",
    () => {
      iframe2.classList.remove(isVisible2 ? "slide-out" : "slide-in");
      if (isVisible2) {
        iframe2.style.display = "none";
      }
      isVisible2 = !isVisible2;
      isAnimating2 = false;
    },
    { once: true }
  );
}
function resizeIframe(iframe2, resizeBtn, isWide2) {
  if (isWide2) {
    iframe2.style.width = "400px";
    resizeBtn.textContent = "调整宽度";
  } else {
    const columnCenter = document.getElementById("column-center");
    if (columnCenter) {
      iframe2.style.width = columnCenter.clientWidth + "px";
      resizeBtn.textContent = "恢复原宽度";
    }
  }
  isWide2 = !isWide2;
}
function initLocalization() {
  let language = "zh-CN";
  const data = {
    zh: {
      title: "电报视频下载器",
      butImg: "下载图片",
      butVideo: "下载视频",
      butAllFile: "强制下载",
      progressText: "下载进度：",
      taskPanel: "任务面板"
    },
    en: {
      title: "Telegram Video Downloader",
      butImg: "DOWNLOAD IMAGE",
      butVideo: "DOWNLOAD VIDEO",
      butAllFile: "FORCE DOWNLOAD",
      progressText: "Download progress:",
      taskPanel: "Task Panel"
    }
  };
  const userLanguage = navigator.language;
  if (userLanguage) {
    language = userLanguage;
  }
  return language.includes("zh") ? data["zh"] : data["en"];
}
function initHtmlTemplate(butImg, butVideo, butAllFile) {
  const imageDownloadButton = `
   <div class="content-teleram-script">
     <div class="downloadBtnIns" style="max-width: 420px; display: flex; justify-content: center;">
       <button class="download-images  down_btn_img" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px;">
       ${butImg}
       </button>
     </div>
   </div>
   `;
  const videoDownloadButton = `
   <div class="content-teleram-script">
     <div class="downloadBtnIns" style="max-width: 420px; display: flex; justify-content: center;">
       <button class="download-videos down_btn_video" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px;">
       ${butVideo}
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
       ${butAllFile}
       </button>
   </div>
   `;
  const statusBoxInnerHTML = `<div class="status-box"/> <div class="download-status"/></div>`;
  return {
    imageDownloadButton,
    videoDownloadButton,
    progressContainer,
    downloadCheckbox,
    allFilesDownloadButton,
    statusBoxInnerHTML
  };
}
function appendElement(parentElement, buttonType, buttonHtml, targetElement, htmlTemplate2) {
  console.log("appendElement", parentElement);
  if (parentElement.querySelector(`.down_btn_${buttonType}`)) return;
  const container = targetElement === "attachment" ? parentElement : targetElement;
  const wrapperDiv = document.createElement("div");
  wrapperDiv.className = `${buttonType}-telegram-script`;
  wrapperDiv.innerHTML = buttonHtml.trim();
  container.appendChild(wrapperDiv.firstChild);
  const checkBox = container.querySelector(".download-check-item");
  if (checkBox) {
    checkBox.setAttribute("id", generateUniqueId());
    const statusWrapper = document.createElement("div");
    statusWrapper.className = `${buttonType}-telegram-script`;
    statusWrapper.innerHTML = htmlTemplate2.statusBoxInnerHTML.trim();
    const statusBox = statusWrapper.querySelector(".status-box");
    statusBox.id = generateUniqueId();
    container.appendChild(statusWrapper.firstChild);
  }
}
function setElementStatus(id, status) {
  const statusContainerElement = document.getElementById(id);
  const statusElement = getHTMLElement(statusContainerElement, ".download-status");
  if (statusContainerElement) {
    switch (status) {
      case "success":
        statusElement.setAttribute("class", "download-status status-success");
        break;
      case "error":
        statusElement.setAttribute("class", "download-status status-error");
        break;
    }
  }
}
function sendMessageToIframe(type, id, status, info, detail = {}) {
  log.info("content.ts", "sendMessageToIframe", type, id, status, info, detail);
  if (!id) return;
  const iframe2 = document.getElementById("task-list-iframe");
  if (iframe2 == null ? void 0 : iframe2.contentWindow) {
    iframe2.contentWindow.postMessage({ type, id, status, info, detail }, "*");
  }
}
function waitForElement(selector, timeout = 15e3) {
  return new Promise((resolve, reject) => {
    const target = document.querySelector(selector);
    if (target) return resolve(target);
    const observer = new MutationObserver((mutations) => {
      const updatedTarget = document.querySelector(selector);
      if (updatedTarget) {
        observer.disconnect();
        resolve(updatedTarget);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`元素 ${selector} 加载超时`));
    }, timeout);
  });
}
function waitForVideoSrcLoad(videoElement, interval = 100) {
  return new Promise((resolve, reject) => {
    if (!videoElement) return reject(new Error("无效的视频元素"));
    const checkSrc = setInterval(() => {
      if (videoElement.src.includes("blob") || videoElement.src.includes("stream")) {
        clearInterval(checkSrc);
        clearTimeout(timeout);
        resolve(videoElement.src);
      }
    }, interval);
    const timeout = setTimeout(() => {
      clearInterval(checkSrc);
      reject(new Error("等待视频源超时"));
    }, 1e4);
  });
}
async function getFileNameByClipBoard() {
  try {
    const clipboardText = await navigator.clipboard.readText();
    return clipboardText;
  } catch (error) {
    return null;
  }
}
function sendMessageToInject(messageData) {
  console.info("content.js", "sendMessageToInject", messageData);
  window.parent.postMessage(messageData, "*");
}
function waitForElements(container, selector, timeout = 15e3) {
  return new Promise((resolve, reject) => {
    const target = Array.from(container.querySelectorAll(selector));
    if (target.length > 0) return resolve(target);
    const observer = new MutationObserver((mutations) => {
      const updatedTarget = Array.from(container.querySelectorAll(selector));
      if (updatedTarget.length > 0) {
        observer.disconnect();
        resolve(updatedTarget);
      }
    });
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`元素 ${selector} 加载超时`));
    }, timeout);
  });
}
injectScript("js/inject.js");
const localizedText = initLocalization();
injectAnimationStyle();
const iframe = initIframe("task-list-iframe", "../html/content.html");
let isVisible = false;
let isAnimating = false;
let isWide = false;
const identifier = "content script";
const toggleBtn = createControlButton(localizedText.taskPanel);
toggleBtn.addEventListener("click", () => {
  toggleIframe(iframe, toggleBtn, isVisible, isAnimating);
  isVisible = !isVisible;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isVisible) {
    toggleIframe(iframe, toggleBtn, isVisible, isAnimating);
    isVisible = !isVisible;
  }
});
const extensionId = chrome.runtime.id;
window.addEventListener("message", (event) => {
  const expectedOrigin = "chrome-extension://" + extensionId;
  if (event.origin !== expectedOrigin) return;
  if (event.data.type === "closeIframe") {
    toggleIframe(iframe, toggleBtn, isVisible, isAnimating);
    isVisible = !isVisible;
  }
  if (event.data.type === "fullScreenContainer") {
    resizeIframe(iframe, toggleBtn, isWide);
    isWide = !isWide;
  }
  if (event.data.type === "downloadTask") {
    sendMessageToInject(event.data.content);
  }
});
const htmlTemplate = initHtmlTemplate(
  localizedText.butImg,
  localizedText.butVideo,
  localizedText.butAllFile
);
const handleVideoDownload = async (mediaType, videoUrl, pageUrl, downloadId, fileType, messageBubble, htmlTemplate2, localizedText2, options = {}) => {
  console.log(identifier, "handleVideoDownload");
  let lastRequestTime = 0;
  const requestInterval = 500;
  let currentTime = (/* @__PURE__ */ new Date()).getTime();
  console.log(identifier, "currentTime", currentTime);
  console.log(identifier, "lastRequestTime", lastRequestTime);
  console.log(identifier, "requestInterval", requestInterval);
  console.log(identifier, "currentTime - lastRequestTime", currentTime - lastRequestTime);
  if (currentTime - lastRequestTime < requestInterval) return;
  lastRequestTime = currentTime;
  let videoId = "";
  console.log(identifier, "fileType", fileType);
  if (fileType === "video") {
    const streamIndex = videoUrl.indexOf("stream/") + "stream/".length;
    const encodedVideoId = videoUrl.substring(streamIndex);
    const decodedVideoId = decodeURIComponent(encodedVideoId);
    const videoData = JSON.parse(decodedVideoId);
    videoId = videoData.location.id;
  }
  console.log(identifier, "videoId", videoId);
  document.addEventListener(videoId + "video_download_progress", (event) => {
    const progressElement = messageBubble.querySelector(".down_btn_progress");
    const downloadButton = messageBubble.querySelector(".down_btn_video");
    const checkAllDownloadButton = messageBubble.querySelector(
      ".check-all-download"
    );
    if (event.detail.progress !== null && event.detail.progress !== "100" && messageBubble !== null) {
      sendMessageToIframe(
        "down_task_status",
        event.detail.task_id,
        "downloading",
        event.detail.progress
      );
      let progressValue = 0;
      if (downloadButton !== null) {
        downloadButton.style.display = "none";
        progressValue = event.detail.progress;
      }
      if (checkAllDownloadButton !== null) {
        checkAllDownloadButton.style.display = "none";
        progressValue = Math.max(-1, parseInt(event.detail.progress));
      }
      if (progressElement === null) {
        const progressContainerElement = document.createElement("div");
        progressContainerElement.className = "progress-teleram-script";
        progressContainerElement.innerHTML = htmlTemplate2.progressContainer.trim();
        messageBubble.appendChild(progressContainerElement);
      } else {
        progressElement.style.display = "block";
        progressElement.innerHTML = `${localizedText2.progressText} ${progressValue}%`;
      }
    } else {
      if (downloadButton !== null) downloadButton.style.display = "block";
      if (checkAllDownloadButton !== null) checkAllDownloadButton.style.display = "flex";
      if (progressElement !== null) progressElement.style.display = "none";
    }
    if (event.detail.progress === "100") {
      sendMessageToIframe(
        "down_task_status",
        event.detail.task_id,
        "completed",
        event.detail.progress
      );
      setElementStatus(event.detail.task_id, "success");
    }
  });
  console.log(identifier, "options", options);
  if (options == null ? void 0 : options.taskId) {
    const fileName = await getFileNameByClipBoard();
    const downloadEventDetail = {
      type: mediaType,
      video_url: videoUrl,
      video_id: videoId,
      page: pageUrl,
      download_id: downloadId,
      fileName,
      taskId: options.taskId
    };
    sendMessageToInject(downloadEventDetail);
    sendMessageToIframe(
      "add_task",
      options.taskId,
      "pending",
      options.mediaPhotoSrc,
      downloadEventDetail
    );
  } else {
    console.log(`%c[${identifier}] : 缺少taskId`, `color: red;`);
  }
};
const initializeDownloadButton = (messageBubble, mediaElement, mediaType, downloadIndex, htmlTemplate2, localizedText2, mediaPhotoElement) => {
  const downloadButton = getHTMLElement(messageBubble, ".down_btn_" + mediaType);
  const parentElement = mediaElement.parentElement;
  console.log("parentElement", parentElement);
  if (downloadButton && mediaElement) {
    const statusWrapper = document.createElement("div");
    statusWrapper.innerHTML = htmlTemplate2.statusBoxInnerHTML.trim();
    const statusBox = statusWrapper.querySelector(".status-box");
    const id = generateUniqueId();
    statusBox.id = id;
    parentElement.appendChild(statusWrapper.firstChild);
    const pageUrl = window.location.href;
    const hashIndex = pageUrl.indexOf("#");
    pageUrl.substring(0, hashIndex);
    downloadButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (mediaType === "video") {
        handleVideoDownload(
          "single",
          mediaElement.src,
          pageUrl,
          String(downloadIndex + 1),
          "video",
          messageBubble,
          htmlTemplate2,
          localizedText2,
          { mediaPhotoSrc: mediaPhotoElement == null ? void 0 : mediaPhotoElement.src, taskId: id }
        );
      } else if (mediaType === "img") {
        handleVideoDownload(
          "single",
          mediaElement.src,
          pageUrl,
          String(downloadIndex + 1),
          "image",
          messageBubble,
          htmlTemplate2,
          localizedText2,
          { mediaPhotoSrc: mediaPhotoElement == null ? void 0 : mediaPhotoElement.src, taskId: id }
        );
      } else {
        console.error("未支持的媒体类型:", mediaType);
      }
    });
  }
};
const clickWithTimeout = (element, timeout = 500) => new Promise((resolve, reject) => {
  element.click();
  setTimeout(resolve, timeout);
});
const processAlbumMedia = (mediaElement, downloadIndex, containerElement) => {
  return new Promise((resolve, reject) => {
    (async () => {
      var _a;
      try {
        const parent = mediaElement.parentNode;
        const statusBox = parent.querySelector(".status-box");
        const taskId = (statusBox == null ? void 0 : statusBox.getAttribute("id")) || void 0;
        const albumMedia = getHTMLElement(parent, ".album-item-media");
        const mediaPhotoSrc = ((_a = albumMedia.querySelector(".media-photo")) == null ? void 0 : _a.getAttribute("src")) || "";
        albumMedia.click();
        const mediaViewerContainer = await waitForElement(".media-viewer-movers");
        if (mediaViewerContainer instanceof Error) {
          throw mediaViewerContainer;
        }
        const videoElements = await waitForElements(
          mediaViewerContainer,
          ".media-viewer-aspecter video"
        );
        const videoElement = videoElements[0];
        const videoSrc = await waitForVideoSrcLoad(videoElement);
        if (videoSrc instanceof Error) {
          throw videoSrc;
        }
        if (videoSrc.includes("blob")) {
          console.log(identifier, "检测到blob视频源");
          const menuElements = await waitForElements(
            document,
            ".quality-download-options-button-menu"
          );
          const buttonMenu = menuElements[0];
          const maxRetries = 3;
          let retryCount = 0;
          const clickMenuWithRetry = async () => {
            while (retryCount < maxRetries) {
              try {
                await clickWithTimeout(buttonMenu, 300);
                console.log(identifier, `第 ${retryCount + 1} 次点击下载菜单`);
                const menuItems = await Promise.race([
                  waitForElements(buttonMenu, ".btn-menu-item", 1e3),
                  new Promise(
                    (_, reject2) => setTimeout(() => reject2(new Error("菜单项加载超时")), 1e3)
                  )
                ]);
                if (menuItems.length > 0) {
                  await clickWithTimeout(menuItems[0], 100);
                  console.log(identifier, "已选择下载选项");
                  return;
                }
              } catch (error) {
                console.warn(`菜单操作失败（尝试 ${retryCount + 1}/${maxRetries}）:`, error);
                retryCount++;
                await new Promise((resolve2) => setTimeout(resolve2, 500 * Math.pow(2, retryCount)));
              }
            }
            throw new Error(`连续 ${maxRetries} 次尝试打开菜单失败`);
          };
          await clickMenuWithRetry();
        } else {
          console.log(identifier, "检测到stream视频源，开始下载 handleVideoDownload");
          handleVideoDownload(
            "single",
            videoSrc,
            window.location.href,
            downloadIndex + 1,
            "video",
            containerElement,
            htmlTemplate,
            localizedText,
            { taskId, mediaPhotoSrc }
          );
        }
        const closeViewer = () => {
          const topbar = document.querySelector(".media-viewer-topbar");
          topbar == null ? void 0 : topbar.click();
          console.log(identifier, "已关闭视频查看器");
        };
        setTimeout(() => {
          closeViewer();
          resolve();
        }, 500);
      } catch (error) {
        console.error("处理相册媒体时出错:", error);
        reject(error);
      } finally {
        const topbar = document.querySelector(".media-viewer-topbar");
        topbar == null ? void 0 : topbar.click();
      }
    })();
  });
};
const initializeDownloadHandlers = (htmlTemplate2, localizedText2) => {
  const messageBubbles = document.querySelectorAll(
    ".bubble-content-wrapper"
  );
  console.log("messageBubbles", messageBubbles);
  messageBubbles.forEach((messageBubble, index) => {
    var _a;
    messageBubble.setAttribute("id", generateUniqueId());
    const imageElement = messageBubble.querySelector(".media-photo");
    const scriptContent = messageBubble.querySelector(".content-teleram-script");
    const videoElement = messageBubble.querySelector(".media-video");
    const albumItems = messageBubble.querySelectorAll(".album-item");
    const videoDuration = messageBubble.querySelector(".video-time");
    if (scriptContent === null && albumItems.length === 0 && imageElement !== null) {
      if (videoElement !== null && videoDuration !== null) {
        console.log("videoElement !== null && videoDuration !== null");
        appendElement(messageBubble, "video", htmlTemplate2.videoDownloadButton, "attachment", htmlTemplate2);
        initializeDownloadButton(messageBubble, videoElement, "video", index, htmlTemplate2, localizedText2, imageElement);
      }
      if (videoDuration !== null && videoElement === null) {
        console.log("videoDuration !== null && videoElement === null");
        appendElement(messageBubble, "video", htmlTemplate2.videoDownloadButton, "attachment", htmlTemplate2);
        const statusWrapper = document.createElement("div");
        statusWrapper.innerHTML = htmlTemplate2.statusBoxInnerHTML.trim();
        const statusBox = statusWrapper.querySelector(".status-box");
        const id = generateUniqueId();
        statusBox.id = id;
        (_a = messageBubble.querySelector(".media-container")) == null ? void 0 : _a.appendChild(statusWrapper.firstChild);
        const downBtnVideo = getHTMLElement(messageBubble, ".down_btn_video");
        downBtnVideo == null ? void 0 : downBtnVideo.addEventListener("click", (event) => {
          console.log(identifier, "messageBubble   click");
          event.preventDefault();
          event.stopPropagation();
          const mediaPhoto = getHTMLElement(messageBubble, ".media-photo");
          const mediaPhotoSrc = mediaPhoto.src;
          mediaPhoto == null ? void 0 : mediaPhoto.click();
          setTimeout(() => {
            const mediaViewerContainer = getHTMLElement(
              document,
              ".media-viewer-movers"
            );
            const videoInViewer = getHTMLVideoElement(
              mediaViewerContainer,
              ".media-viewer-aspecter video"
            );
            if (videoInViewer.src.includes("blob")) {
              waitForElements(document, ".quality-download-options-button-menu").then(
                (elements) => {
                  setTimeout(() => {
                    const buttonMenu = elements[0];
                    buttonMenu.click();
                    console.log(identifier, "button-menu click");
                    waitForElements(buttonMenu, ".btn-menu-item").then((elements2) => {
                      setTimeout(() => {
                        var _a2;
                        (_a2 = elements2[0]) == null ? void 0 : _a2.click();
                        console.log(identifier, "elements[0] click");
                        setTimeout(() => {
                          const topbar = getHTMLElement(
                            document,
                            ".media-viewer-topbar"
                          );
                          topbar == null ? void 0 : topbar.click();
                          console.log(identifier, "关闭blob视频查看器");
                        }, 500);
                      }, 100);
                    });
                  }, 100);
                }
              );
            } else {
              handleVideoDownload(
                "single",
                videoInViewer.src,
                window.location.href,
                String(index + 1),
                "video",
                messageBubble,
                htmlTemplate2,
                localizedText2,
                { mediaPhotoSrc, taskId: id }
              );
              const topbar = getHTMLElement(document, ".media-viewer-topbar");
              topbar == null ? void 0 : topbar.click();
            }
          }, 800);
        });
      }
      if (videoDuration === null && videoElement === null) {
        appendElement(messageBubble, "img", htmlTemplate2.imageDownloadButton, "attachment", htmlTemplate2);
        initializeDownloadButton(messageBubble, imageElement, "img", index, htmlTemplate2, localizedText2, imageElement);
      }
    }
    if (scriptContent === null && albumItems.length === 0 && videoDuration !== null && videoElement !== null && imageElement === null) {
      appendElement(messageBubble, "video", htmlTemplate2.videoDownloadButton, "attachment", htmlTemplate2);
      const img = document.createElement("img");
      img.src = "";
      initializeDownloadButton(messageBubble, videoElement, "video", index, htmlTemplate2, localizedText2, img);
    }
    albumItems.forEach((albumItem) => {
      const hasDownloadCheckbox = albumItem.querySelector(".download-check-item");
      if (!hasDownloadCheckbox) {
        appendElement(albumItem, "check", htmlTemplate2.downloadCheckbox, albumItem, htmlTemplate2);
      }
    });
    const allDownloadButton = messageBubble.querySelectorAll(".download-checkbox-all");
    if (allDownloadButton.length === 0 && messageBubble.querySelector(".album-item") !== null) {
      appendElement(messageBubble, "downloadAll", htmlTemplate2.allFilesDownloadButton, messageBubble, htmlTemplate2);
      messageBubble.querySelectorAll(".download-checkbox-all").forEach((checkbox) => {
        var _a2;
        const parentContainer = (_a2 = checkbox.parentNode) == null ? void 0 : _a2.parentNode;
        checkbox.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          const individualDownloadCheckboxes = parentContainer.querySelectorAll(".download-check-item");
          const checkboxesArray = Array.from(individualDownloadCheckboxes);
          let downloadChain = Promise.resolve();
          downloadChain = checkboxesArray.reduce(async (chain, checkbox2, itemIndex) => {
            var _a3, _b, _c;
            const checkboxInput = checkbox2;
            if (!checkboxInput.checked) return chain;
            await chain;
            const videoTimeIndicator = (_a3 = checkboxInput.parentNode) == null ? void 0 : _a3.querySelector(".video-time");
            if (videoTimeIndicator === null) {
              const imageUrl = ((_b = checkboxInput.parentNode) == null ? void 0 : _b.querySelector(".media-photo")).src;
              const taskId = (_c = document.getElementById(checkboxInput.id)) == null ? void 0 : _c.id;
              handleVideoDownload(
                "single",
                imageUrl,
                imageUrl,
                String(itemIndex + 1),
                "image",
                messageBubble,
                htmlTemplate2,
                localizedText2,
                { mediaPhotoSrc: imageUrl, taskId }
              );
            } else {
              try {
                await processAlbumMedia(checkboxInput, String(itemIndex + 1), messageBubble);
              } catch (error) {
                console.error(`相册项 ${itemIndex} 下载失败:`, error);
              }
            }
          }, Promise.resolve());
          downloadChain.then(() => console.log(identifier, "所有下载任务添加完成")).catch((finalError) => console.error("下载链意外终止:", finalError));
        });
      });
    }
  });
};
setInterval(() => {
  initializeDownloadHandlers(htmlTemplate, localizedText);
}, 5e3);
//# sourceMappingURL=content.js.map
