(() => {
  const log = {
    info: (message, context = null) => {
      console.log(`%c[Tel Download] ${context ? context + ": " : ""}${message}`, "color: blue;");
    },
    error: (message, context = null) => {
      console.info(`%c[Tel Download] ${context ? context + ": " : ""}${message}`, "color: red;");
    }
  };
  const byteRangePattern = /^bytes (\d+)-(\d+)\/(\d+)$/;
  async function downloadVideo(videoUrl, videoId = "", page, downloadId, clipboardText, taskId) {
    let blobParts = [];
    let currentOffset = 0;
    let totalSize = null;
    let fileExtension = "mp4";
    let fileName = clipboardText || "";
    if (!fileName) {
      try {
        const urlSegments = videoUrl.split("/");
        const lastSegment = urlSegments.pop();
        if (lastSegment) {
          const decodedData = decodeURIComponent(lastSegment);
          const videoData = JSON.parse(decodedData);
          fileName = videoData.fileName || "";
        }
      } catch (error) {
        console.error("文件名解析失败:", error);
        fileName = "video";
      }
    }
    log.info("URL: " + videoUrl, fileName);
    const fetchVideo = (retryCount = 0, index = 0) => {
      index = index + 1;
      fetch(videoUrl, {
        method: "GET",
        headers: { Range: `bytes=${currentOffset}-` }
        // 设置Range头，请求指定字节范围的数据
      }).then(async (response) => {
        var _a;
        if (![200, 206].includes(response.status)) {
          if (retryCount < 3) {
            retryCount++;
            fetchVideo(retryCount, index);
          } else {
            throw new Error("非200/206响应: " + response.status);
          }
        }
        const contentType = ((_a = response.headers.get("Content-Type")) == null ? void 0 : _a.split(";")[0]) || "";
        fileExtension = contentType.split("/")[1] || fileExtension;
        const dotIndex = fileName.indexOf(".");
        fileName = (dotIndex !== -1 ? fileName.substring(0, dotIndex + 1) : fileName + ".") + fileExtension;
        const contentRangeHeader = response.headers.get("Content-Range");
        if (!contentRangeHeader) {
          console.error("Content-Range头缺失.", response);
          throw new Error("Content-Range头缺失.");
        }
        const contentRange = contentRangeHeader.match(byteRangePattern);
        if (!contentRange) {
          console.error("Content-Range格式错误.", response);
          throw new Error("Content-Range格式错误.");
        }
        const startByte = parseInt(contentRange[1], 10);
        const endByte = parseInt(contentRange[2], 10);
        const totalBytes = parseInt(contentRange[3], 10);
        if (startByte !== currentOffset) {
          throw new Error("检测到回复片段之间存在差距.");
        }
        if (totalSize !== null && totalBytes !== totalSize) {
          throw new Error("总大小不一致.");
        }
        currentOffset = endByte + 1;
        totalSize = totalBytes;
        log.info(`Get response: ${response.headers.get("Content-Length")} bytes data from ${contentRangeHeader}`, fileName);
        log.info(`Progress: ${(100 * currentOffset / totalSize).toFixed(0)}%`, fileName);
        if (videoId !== "") {
          const progressEvent = new CustomEvent(videoId + "video_download_progress", {
            detail: {
              video_id: videoId,
              progress: (100 * currentOffset / totalSize).toFixed(0),
              page,
              download_id: downloadId,
              task_id: taskId
            }
          });
          document.dispatchEvent(progressEvent);
        }
        return response;
      }).then(async (response) => {
        const blob = await response.blob();
        blobParts.push(blob);
      }).then(() => {
        if (totalSize === null) {
          throw new Error("_total_size is NULL");
        }
        if (currentOffset < totalSize) {
          fetchVideo(0, index);
        } else {
          finalizeDownload();
        }
      }).catch((error) => {
        if (retryCount < 3) {
          retryCount++;
          fetchVideo(retryCount);
        } else {
          log.error("下载失败", fileName);
        }
      });
    };
    const finalizeDownload = async () => {
      log.info("Finish downloading blobs", fileName);
      log.info("Concatenating blobs and downloading...", fileName);
      const finalBlob = new Blob(blobParts, { type: "video/mp4" });
      const blobUrl = window.URL.createObjectURL(finalBlob);
      log.info("Final blob size: " + finalBlob.size + " bytes", fileName);
      const downloadLink = document.createElement("a");
      document.body.appendChild(downloadLink);
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(blobUrl);
      log.info("Download triggered", fileName);
    };
    fetchVideo();
  }
  window.addEventListener("message", (event) => {
    const messageData = event.data;
    if (messageData && typeof messageData === "object") {
      if (messageData.type === "single") {
        downloadVideo(
          messageData.video_url,
          messageData.video_id,
          messageData.page,
          messageData.download_id,
          messageData.fileName,
          messageData.taskId
        );
      } else if (messageData.type === "batch") {
        const videoSources = messageData.detail;
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
})();
