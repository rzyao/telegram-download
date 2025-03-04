interface Logger {
  info: (message: string, context?: string | null) => void;
  error: (message: any, context?: string | null) => void;
}

const logger: Logger = {
  info: (message, context = null) => {
    console.log(`[Tel Download] ${context ? context + ': ' : ''}${message}`);
  },
  error: (message, context = null) => {
    console.error(`[Tel Download] ${context ? context + ': ' : ''}${message}`);
  }
};

const byteRangePattern = /^bytes (\d+)-(\d+)\/(\d+)$/;

/**
 * 下载视频
 * @param videoUrl 视频链接
 * @param videoId 视频ID，可选
 * @param page 页码，可选
 * @param downloadId 下载ID，可选
 * @param clipboardText 剪贴板中预设的文件名，可选
 */
async function downloadVideo(
  videoUrl: string,
  videoId: string = '',
  page?: number,
  downloadId?: string,
  clipboardText?: string | null,
  taskId?: string
): Promise<void> {
  let blobParts: Blob[] = [];
  let currentOffset: number = 0;
  let totalSize: number | null = null;
  let fileExtension: string = 'mp4';
  let fileName: string = clipboardText || '';

  if (!fileName) {
    try {
      const urlSegments = videoUrl.split('/');
      const lastSegment = urlSegments.pop();
      if (lastSegment) {
        const decodedData = decodeURIComponent(lastSegment);
        const videoData = JSON.parse(decodedData);
        fileName = videoData.fileName || '';
      }
    } catch (error) {
      console.error('文件名解析失败:', error);
      fileName = 'video';
    }
  }

  logger.info('URL: ' + videoUrl, fileName);

  const fetchVideo = (): void => {
    fetch(videoUrl, {
      method: 'GET',
      headers: { Range: `bytes=${currentOffset}-` }
      // 注意：某些 header（如 User-Agent）在浏览器环境下不可修改
    })
      .then(async (response) => {
        if (![200, 206].includes(response.status)) {
          throw new Error('Non 200/206 response was received: ' + response.status);
        }
        const contentType = response.headers.get('Content-Type')?.split(';')[0] || '';
        fileExtension = contentType.split('/')[1] || fileExtension;
        // 更新文件名：取点前部分并追加新扩展名
        const dotIndex = fileName.indexOf('.');
        fileName = (dotIndex !== -1 ? fileName.substring(0, dotIndex + 1) : fileName + '.') + fileExtension;

        const contentRangeHeader = response.headers.get('Content-Range');
        if (!contentRangeHeader) {
          throw new Error('Content-Range header missing');
        }
        const contentRange = contentRangeHeader.match(byteRangePattern);
        if (!contentRange) {
          throw new Error('Content-Range format error');
        }

        const startByte = parseInt(contentRange[1], 10);
        const endByte = parseInt(contentRange[2], 10);
        const totalBytes = parseInt(contentRange[3], 10);

        if (startByte !== currentOffset) {
          throw new Error('Gap detected between responses.');
        }
        if (totalSize !== null && totalBytes !== totalSize) {
          throw new Error('Total size differs');
        }

        currentOffset = endByte + 1;
        totalSize = totalBytes;

        logger.info(`Get response: ${response.headers.get('Content-Length')} bytes data from ${contentRangeHeader}`, fileName);
        logger.info(`Progress: ${((100 * currentOffset) / totalSize).toFixed(0)}%`, fileName);

        if (videoId !== '') {
          const progressEvent = new CustomEvent(videoId + 'video_download_progress', {
            detail: {
              video_id: videoId,
              progress: ((100 * currentOffset) / totalSize).toFixed(0),
              page: page,
              download_id: downloadId,
              task_id: taskId
            }
          });
          document.dispatchEvent(progressEvent);
        }

        return response.blob();
      })
      .then((blob: Blob) => {
        blobParts.push(blob);
      })
      .then(() => {
        if (totalSize === null) {
          throw new Error('_total_size is NULL');
        }
        if (currentOffset < totalSize) {
          fetchVideo();
        } else {
          finalizeDownload();
        }
      })
      .catch((error: any) => {
        logger.error(error, fileName);
      });
  };

  const finalizeDownload = async (): Promise<void> => {
    logger.info('Finish downloading blobs', fileName);
    logger.info('Concatenating blobs and downloading...', fileName);

    const finalBlob = new Blob(blobParts, { type: 'video/mp4' });
    const blobUrl = window.URL.createObjectURL(finalBlob);

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
}

// 监听 message 事件，根据消息类型执行下载操作
window.addEventListener('message', (event: MessageEvent) => {
  const messageData = event.data;
  if (messageData && typeof messageData === 'object') {
    if (messageData.type === 'single') {
      downloadVideo(
        messageData.video_src.video_url,
        messageData.video_src.video_id,
        messageData.video_src.page,
        messageData.video_src.download_id,
        messageData.video_src.fileName,
        messageData.video_src.taskId
      );
    } else if (messageData.type === 'batch') {
      const videoSources = messageData.video_src as Array<any>;
      for (let i = 0; i < videoSources.length; i++) {
        downloadVideo(
          videoSources[i].video_url,
          videoSources[i].video_id,
          videoSources[i].page,
          videoSources[i].download_id,
          videoSources[i].fileName,
          videoSources[i].taskId
        );
      }
    }
  }
}); 