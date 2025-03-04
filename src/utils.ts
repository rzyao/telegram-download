/**
 * 根据选择器获取 HTMLElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器字符串
 * @returns 找到的 HTMLElement，如果出现异常则返回 null
 */
export function getHTMLElement(parentElement: HTMLElement | Document, selector: string): HTMLElement | null {
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
    console.error("getHTMLElement 发生错误:", error);
    return null;
  }
}

/**
 * 根据选择器获取 HTMLVideoElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器，用于定位视频元素
 * @returns 找到的 HTMLVideoElement，如果出现异常则返回 null
 */
export function getHTMLVideoElement(parentElement: HTMLElement | Document, selector: string): HTMLVideoElement | null {
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
    console.error("getHTMLVideoElement 发生错误:", error);
    return null;
  }
}

/**
 * 根据选择器获取 HTMLImageElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器，用于定位图片元素
 * @returns 找到的 HTMLImageElement，如果出现异常则返回 null
 */
export function getHTMLImgElement(parentElement: HTMLElement | Document, selector: string): HTMLImageElement | null {
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
    console.error("getHTMLImgElement 发生错误:", error);
    return null;
  }
}

/**
 * 检测是否存在指定的 HTMLElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器字符串，用于定位元素
 * @returns 如果匹配到元素且属于 HTMLElement 类型，则返回 true，否则返回 false
 */
export function existsHTMLElement(parentElement: HTMLElement | Document, selector: string): boolean {
  const element = parentElement.querySelector(selector);
  return !!(element && element instanceof HTMLElement);
}

/**
 * 根据选择器查找 HTMLElement 元素
 * @param parentElement 父容器，可以是 HTMLElement 或 Document
 * @param selector CSS 选择器字符串
 * @returns 找到的 HTMLElement 或 null
 */
export function findHTMLElement(parentElement: HTMLElement | Document, selector: string): HTMLElement | null {
  const element = parentElement.querySelector(selector);
  return (element && element instanceof HTMLElement) ? element : null;
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