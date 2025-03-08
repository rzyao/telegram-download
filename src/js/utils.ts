export const log = {
  info: (identifier: string, message: string, ...args: any[]) => {
    console.log(`%c[${identifier}] : ${message}`, `color: black;`, ...args);
  },
  error: (identifier: string, message: string, ...args: any[]) => {
    console.warn(`%c[${identifier}] : ${message}`, `color: red;`, ...args);
  }
}

/**
 * 根据选择器获取 HTMLElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器字符串
 * @returns 找到的 HTMLElement，如果出现异常则返回 null
 */
export function getHTMLElement(
  parentElement: HTMLElement | Document,
  selector: string,
): HTMLElement | null {
  try {
    // 使用 querySelector 查找元素
    const element = parentElement.querySelector(selector);

    // 如果没有找到，抛出异常
    if (!element) {
      throw new Error(`未找到匹配的元素，选择器: "${selector}"`);
    }

    // 如果找到的元素不是 HTMLElement 类型，也抛出异常
    if (!(element instanceof HTMLElement)) {
      throw new Error(`选择器 "${selector}" 返回的元素不是 HTMLElement 类型`);
    }

    return element;
  } catch (error) {
    console.error('getHTMLElement 发生错误:', error);
    return null;
  }
}

/**
 * 根据选择器获取 HTMLVideoElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器，用于定位视频元素
 * @returns 找到的 HTMLVideoElement，如果出现异常则返回 null
 */
export function getHTMLVideoElement(
  parentElement: HTMLElement | Document,
  selector: string,
): HTMLVideoElement | null {
  try {
    const element = parentElement.querySelector(selector);

    // 如果没有找到元素，抛出异常
    if (!element) {
      throw new Error(`未找到匹配的元素，选择器: "${selector}"`);
    }

    // 如果找到的元素不是 HTMLVideoElement 类型，抛出异常
    if (!(element instanceof HTMLVideoElement)) {
      throw new Error(`选择器 "${selector}" 返回的元素不是 HTMLVideoElement 类型`);
    }

    return element;
  } catch (error) {
    console.error('getHTMLVideoElement 发生错误:', error);
    return null;
  }
}

/**
 * 根据选择器获取 HTMLImageElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器，用于定位图片元素
 * @returns 找到的 HTMLImageElement，如果出现异常则返回 null
 */
export function getHTMLImgElement(
  parentElement: HTMLElement | Document,
  selector: string,
): HTMLImageElement | null {
  try {
    // 使用 querySelector 查找元素
    const element = parentElement.querySelector(selector);

    // 如果没有找到元素，则抛出异常
    if (!element) {
      throw new Error(`未找到匹配的元素，选择器: "${selector}"`);
    }

    // 如果找到的元素不是 HTMLImageElement 类型，也抛出异常
    if (!(element instanceof HTMLImageElement)) {
      throw new Error(`选择器 "${selector}" 返回的元素不是 HTMLImageElement 类型`);
    }

    return element;
  } catch (error) {
    console.error('getHTMLImgElement 发生错误:', error);
    return null;
  }
}

/**
 * 检测是否存在指定的 HTMLElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器字符串，用于定位元素
 * @returns 如果匹配到元素且属于 HTMLElement 类型，则返回 true，否则返回 false
 */
export function existsHTMLElement(
  parentElement: HTMLElement | Document,
  selector: string,
): boolean {
  const element = parentElement.querySelector(selector);
  return !!(element && element instanceof HTMLElement);
}

/**
 * 根据选择器查找 HTMLElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器字符串
 * @returns 找到的 HTMLElement 或 null
 */
export function findHTMLElement(
  parentElement: HTMLElement | Document,
  selector: string,
): HTMLElement | null {
  const element = parentElement.querySelector(selector);
  return element && element instanceof HTMLElement ? element : null;
}

/**
 * 生成一个唯一的 ID
 * @returns 一个唯一的字符串 ID
 */
export function generateUniqueId(): string {
  // 如果支持 crypto.randomUUID，直接使用
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // 备用方案：使用当前时间戳和随机数生成唯一 ID
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomPart}`;
  }
}
/**
 * 注入脚本
 * @param {string} filePath 脚本路径
 */
export function injectScript(filePath: string): void {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(filePath);
  document.head.appendChild(script);
  script.onload = () => {
    script.remove();
  };
}

/**
 * 注入动画样式，用于控制 iframe 的进出动画效果
 */
export function injectAnimationStyle(): void {
  const style = document.createElement('style');
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

/**
 * 初始化控制扩展面板的 iframe
 * @param {string} id iframeid
 * @param {string} src html文件路径
 * @return {HTMLIFrameElement} iframe
 */
export function initIframe(id: string, src: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.id = id;
  iframe.src = chrome.runtime.getURL(src);
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0px',
    bottom: '20px',
    width: '400px',
    height: '600px',
    border: 'none',
    zIndex: '2147483647',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    borderRadius: '8px',
    transform: 'translateX(0)',
    opacity: '1',
    display: 'none',
  });
  document.body.appendChild(iframe);
  return iframe;
}

/**
 * 添加控制按钮
 * @param {string} text 按钮文本
 * @return {HTMLButtonElement}
 */
export function createControlButton(text: string): HTMLButtonElement {
  const toggleBtn = document.createElement('button');
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    'z-index': '2147483646',
    padding: '8px 16px',
    'border-radius': '4px',
    background: '#008aff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  });
  toggleBtn.textContent = text;
  document.body.appendChild(toggleBtn);
  return toggleBtn;
}


/**
 * 控制iframede显示
 * @param {HTMLIFrameElement} iframe iframe元素
 * @param {HTMLButtonElement} toggleBtn 按钮元素
 * @param {boolean} isVisible 是否显示
 * @param {boolean} isAnimating 是否正在动画
 * @return {*}  {void}
 */
export function toggleIframe(
  iframe: HTMLIFrameElement,
  toggleBtn: HTMLButtonElement,
  isVisible: boolean,
  isAnimating: boolean,
): void {
  if (isAnimating) return;

  if (isVisible) {
    iframe.classList.add('slide-out');
    toggleBtn.textContent = '任务列表';
  } else {
    iframe.style.display = 'block';
    iframe.classList.add('slide-in');
    toggleBtn.textContent = '任务列表';
  }

  iframe.addEventListener(
    'animationend',
    () => {
      iframe.classList.remove(isVisible ? 'slide-out' : 'slide-in');
      if (isVisible) {
        iframe.style.display = 'none';
      }
      isVisible = !isVisible;
      isAnimating = false;
    },
    { once: true },
  );
}

/**
 * 调整iframe宽度
 * @param {HTMLIFrameElement} iframe iframe元素
 * @param {HTMLButtonElement} resizeBtn 按钮元素
 * @param {boolean} isWide 是否宽
 * @return {*}  {void}
 */
export function resizeIframe(iframe: HTMLIFrameElement, resizeBtn: HTMLButtonElement, isWide: boolean): void {
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
}

/**
 * 获取本地化文本
 * @return {*}  {{
 *   dialog: {
 *     title: string;
 *     butImg: string;
 *     butVideo: string;
 *     butAllFile: string;
 *     progressText: string;
 *     taskPanel: string;
 *   };
 * }}
 */
export function initLocalization(): LocalizationData {
  // 默认语言设置为中文
  let language = 'zh-CN';
  // 定义中英文的本地化数据
  const data = {
    zh: {
      title: '电报视频下载器',
      butImg: '下载图片',
      butVideo: '下载视频',
      butAllFile: '强制下载',
      progressText: '下载进度：',
      taskPanel: '任务面板',
    },
    en: {
      title: 'Telegram Video Downloader',
      butImg: 'DOWNLOAD IMAGE',
      butVideo: 'DOWNLOAD VIDEO',
      butAllFile: 'FORCE DOWNLOAD',
      progressText: 'Download progress:',
      taskPanel: 'Task Panel',
    },
  };

  // 检测用户的浏览器语言
  const userLanguage = navigator.language;
  if (userLanguage) {
    language = userLanguage;
  }

  // 返回本地化文本
  return language.includes('zh') ? data['zh'] : data['en'];
}


/**
 * 初始化html模板
 * @param {*} localizedText
 * @return {*} {
 *   imageDownloadButton: string;
 *   videoDownloadButton: string;
 *   progressContainer: string;
 *   downloadCheckbox: string;
 *   allFilesDownloadButton: string;
 *   statusBoxInnerHTML: string;
 * }
 */
export function initHtmlTemplate(butImg: string, butVideo: string, butAllFile: string): HtmlTemplates {
  // 定义下载按钮的 HTML 模板
  const imageDownloadButton = `
   <div class="content-teleram-script">
     <div class="downloadBtnIns" style="max-width: 420px; display: flex; justify-content: center;">
       <button class="download-images  down_btn_img" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px;">
       ${butImg}
       </button>
     </div>
   </div>
   `;
  // 视频下载按钮
  const videoDownloadButton = `
   <div class="content-teleram-script">
     <div class="downloadBtnIns" style="max-width: 420px; display: flex; justify-content: center;">
       <button class="download-videos down_btn_video" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px;">
       ${butVideo}
       </button>
     </div>
   </div>
   `;
  // 下载进度容器
  const progressContainer = `
   <div class="content-teleram-script down_btn_progress"></div>
   `;
  // 下载选择框
  const downloadCheckbox =
    '<input type="checkbox" class="download-check-item" name="checkbox-down" checked="true" />';
  // 全部下载按钮
  const allFilesDownloadButton = `
   <div style="max-width: 420px; display: flex; justify-content: center;" class="check-all-download">
       <button class="download-checkbox-all" data-text="FORCE DOWNLOAD" title="Download all resources by default, or please select the resources you want to download in batches" style="color: white; background-color: #008aff; border-radius: 5px; padding: 5px 10px;">
       ${butAllFile}
       </button>
   </div>
   `;
  // 下载状态容器
  const statusBoxInnerHTML = `<div class="status-box"/> <div class="download-status"/></div>`;
  return {
    imageDownloadButton,
    videoDownloadButton,
    progressContainer,
    downloadCheckbox,
    allFilesDownloadButton,
    statusBoxInnerHTML,
  };
}

/**
 * 添加元素到指定的父元素
 * @param {HTMLElement} parentElement 父元素
 * @param {string} buttonType 按钮类型
 * @param {string} buttonHtml 按钮HTML
 * @param {(HTMLElement | 'attachment')} targetElement 目标元素
 * @param {{
 *     imageDownloadButton: string;
 *     videoDownloadButton: string;
 *     allFilesDownloadButton: string;
 *     progressContainer: string;
 *     downloadCheckbox: string;
 *     statusBoxInnerHTML: string;
 *   }} htmlTemplate 模板
 */
export function appendElement(
  parentElement: HTMLElement,
  buttonType: string,
  buttonHtml: string,
  targetElement: HTMLElement | 'attachment',
  htmlTemplate: HtmlTemplates,
): void {
  console.log('appendElement', parentElement);
  // 如果按钮已存在则直接返回，避免重复添加
  if (parentElement.querySelector(`.down_btn_${buttonType}`)) return;

  const container: HTMLElement = targetElement === 'attachment' ? parentElement : targetElement;

  // 创建包装容器并填充按钮HTML
  const wrapperDiv = document.createElement('div');
  wrapperDiv.className = `${buttonType}-telegram-script`;
  wrapperDiv.innerHTML = buttonHtml.trim();

  // 将包装的按钮元素插入到目标容器中
  container.appendChild(wrapperDiv.firstChild as Node);

  // 如果存在下载检查框，则添加状态容器
  const checkBox = container.querySelector('.download-check-item') as HTMLElement | null;
  if (checkBox) {
    checkBox.setAttribute('id', generateUniqueId());
    const statusWrapper = document.createElement('div');
    statusWrapper.className = `${buttonType}-telegram-script`;
    statusWrapper.innerHTML = htmlTemplate.statusBoxInnerHTML.trim();
    const statusBox = statusWrapper.querySelector('.status-box') as HTMLElement;
    statusBox.id = generateUniqueId();
    container.appendChild(statusWrapper.firstChild as Node);
  }
};

/**
 * 设置元素状态
 * @param {string} id 元素ID
 * @param {string} status 状态
 * @return {*}  {void}
 */
export function setElementStatus(id: string, status: string): void {
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

/**
 * 发送消息到iframe
 * @param {string} type 类型
 * @param {string | undefined} id ID
 * @param {string} status 状态
 * @param {any} info 信息
 * @param {any} detail 详情
 */
export function sendMessageToIframe(
  type: string,
  id: string | undefined,
  status: string,
  info: any,
  detail: any = {},
) {
  log.info('content.ts', 'sendMessageToIframe', type, id, status, info, detail);
  if (!id) return;
  const iframe = document.getElementById('task-list-iframe') as HTMLIFrameElement;
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage({ type, id, status, info, detail }, '*');
  }
};

/**
 * 等待元素加载
 */
export function waitForElement(selector: string, timeout = 15000): Promise<HTMLElement | Error> {
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
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`元素 ${selector} 加载超时`));
    }, timeout);
  });
};

/**
 * 等待视频源加载
 */
export function waitForVideoSrcLoad(
  videoElement: HTMLVideoElement,
  interval = 100,
): Promise<string | Error> {
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

/**
 * 获取剪贴板文件名
 * @return {*}  {(Promise<string | null>)}
 */
export async function getFileNameByClipBoard(): Promise<string | null> {
  try {
    const clipboardText = await navigator.clipboard.readText();
    return clipboardText;
  } catch (error) {
    return null;
  }
};

/**
 * 发送下载消息到inject.ts
 * @param {any} messageData 参数
 * @return {*}  {void}
 */
export function sendMessageToInject(messageData: {
  type: string;
  video_url: string;
  video_id: string;
  page: string;
  download_id: string;
  fileName: string | null;
  taskId: string;
}): void {
  console.info('content.js', 'sendMessageToInject', messageData);
  window.parent.postMessage(messageData, '*');
}

/**
 * 等待元素加载
 */
export function waitForElements(
  container: HTMLElement | Document,
  selector: string,
  timeout = 15000,
): Promise<HTMLElement[]> {
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
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`元素 ${selector} 加载超时`));
    }, timeout);
  });
};
