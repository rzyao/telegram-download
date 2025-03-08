(() => {
  interface Logger {
    info: (message: string, context?: string | null) => void;
    error: (message: any, context?: string | null) => void;
  }

  const log: Logger = {
    info: (message, context = null) => {
      console.log(`%c[Tel Download] ${context ? context + ': ' : ''}${message}`, 'color: blue;');
    },
    error: (message, context = null) => {
      console.info(`%c[Tel Download] ${context ? context + ': ' : ''}${message}`, 'color: red;');
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

    log.info('URL: ' + videoUrl, fileName);

    /**
     * 分片下载视频文件
     * @param retryCount 当前重试次数，默认为0
     */
    const fetchVideo = (retryCount: number = 0, index: number = 0): void => {
      index = index + 1
      // 使用fetch API发起HTTP请求，支持断点续传
      fetch(videoUrl, {
        method: 'GET',
        headers: { Range: `bytes=${currentOffset}-` }  // 设置Range头，请求指定字节范围的数据
      })
        .then(async (response) => {
          // 检查响应状态码是否正确(200表示完整响应，206表示部分内容响应)
          if (![200, 206].includes(response.status)) {
            if (retryCount < 3) {  // 如果失败次数小于3次，进行重试
              retryCount++;
              fetchVideo(retryCount, index);
            } else {
              throw new Error('非200/206响应: ' + response.status);
            }
          }

          // 从Content-Type头获取文件扩展名
          const contentType = response.headers.get('Content-Type')?.split(';')[0] || '';
          fileExtension = contentType.split('/')[1] || fileExtension;

          // 更新文件名：保留原文件名的基础部分，更新扩展名
          const dotIndex = fileName.indexOf('.');
          fileName = (dotIndex !== -1 ? fileName.substring(0, dotIndex + 1) : fileName + '.') + fileExtension;

          // 验证Content-Range头是否存在和格式是否正确
          const contentRangeHeader = response.headers.get('Content-Range');
          if (!contentRangeHeader) {
            console.error('Content-Range头缺失.', response);
            throw new Error('Content-Range头缺失.');
          }
          const contentRange = contentRangeHeader.match(byteRangePattern);
          if (!contentRange) {
            console.error('Content-Range格式错误.', response);
            throw new Error('Content-Range格式错误.');
          }

          // 解析Content-Range中的字节范围信息
          const startByte = parseInt(contentRange[1], 10);  // 当前片段的起始字节
          const endByte = parseInt(contentRange[2], 10);    // 当前片段的结束字节
          const totalBytes = parseInt(contentRange[3], 10); // 文件总字节数

          // 验证数据连续性和一致性
          if (startByte !== currentOffset) {
            throw new Error('检测到回复片段之间存在差距.');
          }
          if (totalSize !== null && totalBytes !== totalSize) {
            throw new Error('总大小不一致.');
          }

          // 更新下载进度信息
          currentOffset = endByte + 1;  // 更新下一次请求的起始位置
          totalSize = totalBytes;       // 更新文件总大小

          // 记录下载进度日志
          log.info(`Get response: ${response.headers.get('Content-Length')} bytes data from ${contentRangeHeader}`, fileName);
          log.info(`Progress: ${((100 * currentOffset) / totalSize).toFixed(0)}%`, fileName);

          // 如果存在videoId，发送下载进度事件
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

          return response;
        })
        .then(async (response) => {
          // 将响应数据转换为Blob并存储
          const blob = await response.blob();
          blobParts.push(blob);
        })
        .then(() => {
          // 检查是否需要继续下载
          if (totalSize === null) {
            throw new Error('_total_size is NULL');
          }
          if (currentOffset < totalSize) {
            fetchVideo(0, index);  // 如果还有数据，继续下载下一个片段
          } else {
            finalizeDownload();  // 所有片段下载完成，开始合并文件
          }
        })
        .catch((error: any) => {
          // 错误处理和重试逻辑
          if (retryCount < 3) {
            retryCount++;
            fetchVideo(retryCount);  // 重试当前片段的下载
          } else {
            log.error('下载失败', fileName);  // 超过最大重试次数，放弃下载
          }
        });
    };

    const finalizeDownload = async (): Promise<void> => {
      log.info('Finish downloading blobs', fileName);
      log.info('Concatenating blobs and downloading...', fileName);

      const finalBlob = new Blob(blobParts, { type: 'video/mp4' });
      const blobUrl = window.URL.createObjectURL(finalBlob);

      log.info('Final blob size: ' + finalBlob.size + ' bytes', fileName);

      const downloadLink = document.createElement('a');
      document.body.appendChild(downloadLink);
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(blobUrl);

      log.info('Download triggered', fileName);
    };

    fetchVideo();
  }

  // 监听 message 事件，根据消息类型执行下载操作
  window.addEventListener('message', (event: MessageEvent) => {
    const messageData = event.data;
    if (messageData && typeof messageData === 'object') {
      if (messageData.type === 'single') {
        downloadVideo(
          messageData.video_url,
          messageData.video_id,
          messageData.page,
          messageData.download_id,
          messageData.fileName,
          messageData.taskId
        );
      } else if (messageData.type === 'batch') {
        const videoSources = messageData.detail as Array<any>;
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
})()