function waitForElement(selector, timeout = 15000) {
  return new Promise((resolve, reject) => {
    // 如果已存在则直接返回
    const target = document.getElementById(selector);
    if (target) return resolve(target);

    // 配置观察选项
    const observer = new MutationObserver((mutations) => {
      const target = document.getElementById(selector);
      if (target) {
        observer.disconnect();
        resolve(target);
      }
    });

    // 开始观察整个文档
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 设置超时
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`元素 ${selector} 加载超时`));
    }, timeout);
  });
}
function addEvent() {
  // 获取父容器元素
  waitForElement('column-center').then((container) => {
    console.log('addEvent');
    // 事件委托：监听父容器上的双击事件
    container.addEventListener('dblclick', async function (event) {
      console.log('dblclick');
      console.log(event);
      if (event.target?.classList.contains('translatable-message')) {
        const text = event.target.innerText;

        // 检查剪贴板是否为空
        try {
          const clipboardText = await navigator.clipboard.readText();
        } catch (err) {
          console.error('%c剪贴板读取失败:', err);
          // 读取失败时允许继续复制
        }

        // 执行复制操作
        navigator.clipboard.writeText(text)
          .then(() => console.log('%c复制成功', 'color:green;'))
          .catch(err => alert('复制失败，请手动复制！'));
      }
    });
  });

};
addEvent();
// 获取剪贴板中的文件名
const getFileNameByClipBoard = async () => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    return clipboardText;
  } catch (error) {
    return null;
  }
};
const logger = {
  info: (message, context = null) => {
    return;
    console.log(`[Tel Download] ${context ? context + ': ' : ''}${message}`);
  },
  error: (message, context = null) => {
    console.error(`[Tel Download] ${context ? context + ': ' : ''}${message}`);
  }
};
const byteRangePattern = /^bytes (\d+)-(\d+)\/(\d+)$/;
document.addEventListener('video_download', function (event) {
  if (event.detail.type === 'single') {
    downloadVideo(event.detail.video_src.video_url, event.detail.video_src.video_id, event.detail.video_src.page, event.detail.video_src.download_id, event.detail.video_src.fileName);
  } else if (event.detail.type === 'batch') {
    let videoSources = event.detail.video_src;
    for (let i = 0; i < videoSources.length; i++) {
      downloadVideo(videoSources[i].video_url, videoSources[i].video_id, videoSources[i].page, videoSources[i].download_id);
    }
  }
});

// 定义全局任务状态事件
const down_task_status_event = new CustomEvent('down_task_status', { detail: { id: 'down_task_status', status: 'success' } });

const downloadVideo = async (videoUrl, videoId = '', page, downloadId, clipboardText) => {
  let blobParts = []
  let currentOffset = 0
  let totalSize = null
  let fileExtension = 'mp4'
  let fileName = clipboardText; // 使用新变量避免覆盖

  if (!fileName) {
    try {
      const urlSegment = videoUrl.split('/').pop();
      const decodedData = decodeURIComponent(urlSegment);
      const videoData = JSON.parse(decodedData);
      fileName = videoData.fileName || ''; // 使用空值兜底
    } catch (error) {
      console.error('文件名解析失败:', error);
      fileName = 'video'; // 确保有默认值
    }
  }

  logger.info('URL: ' + videoUrl, fileName);

  const fetchVideo = () => {
    fetch(videoUrl, {
      method: 'GET',
      headers: { Range: `bytes=${currentOffset}-` },
      'User-Agent': 'User-Agent Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/117.0'
    })
      .then((response) => {
        if (![200, 206].includes(response.status)) {
          throw new Error('Non 200/206 response was received: ' + response.status);
        }
        const contentType = response.headers.get('Content-Type').split(';')[0];
        fileExtension = contentType.split('/')[1];
        fileName = fileName.substring(0, fileName.indexOf('.') + 1) + fileExtension;

        const contentRange = response.headers.get('Content-Range').match(byteRangePattern),
          startByte = parseInt(contentRange[1]),
          endByte = parseInt(contentRange[2]),
          totalBytes = parseInt(contentRange[3]);

        if (startByte !== currentOffset) {
          throw new Error('Gap detected between responses.');
        }
        if (totalSize && totalBytes !== totalSize) {
          throw new Error('Total size differs');
        }

        currentOffset = endByte + 1;
        totalSize = totalBytes;

        logger.info(`Get response: ${response.headers.get('Content-Length')} bytes data from ${response.headers.get('Content-Range')}`, fileName);
        logger.info(`Progress: ${((100 * currentOffset) / totalSize).toFixed(0)}%`, fileName);

        if (videoId !== '') {
          let progressEvent = new CustomEvent(videoId + 'video_download_progress', {
            detail: {
              video_id: videoId,
              progress: ((100 * currentOffset) / totalSize).toFixed(0),
              page: page,
              download_id: downloadId
            }
          });
          document.dispatchEvent(progressEvent);
        }

        return response.blob();
      })
      .then((blob) => {
        blobParts.push(blob);
      })
      .then(() => {
        if (!totalSize) {
          throw new Error('_total_size is NULL');
        }
        if (currentOffset < totalSize) {
          fetchVideo();
        } else {
          finalizeDownload();
        }
      })
      .catch((error) => {
        logger.error(error, fileName);
      });
  };

  const finalizeDownload = async () => {
    logger.info('Finish downloading blobs', fileName);
    logger.info('Concatenating blobs and downloading...', fileName);

    const finalBlob = new Blob(blobParts, { type: 'video/mp4' }),
      blobUrl = window.URL.createObjectURL(finalBlob);

    logger.info('Final blob size: ' + finalBlob.size + ' bytes', fileName);

    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(blobUrl);

    logger.info('Download triggered', fileName);
  };

  fetchVideo();
};