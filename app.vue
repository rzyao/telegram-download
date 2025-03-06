<template>
  <div>
    <!-- 任务管理容器，当 showContainer 为 true 时显示 -->
    <transition name="slide">
      <div v-if="showContainer" class="task-manager-container">
        <!-- 关闭按钮 -->
        <div class="button-line">
          <el-button type="text" size="small" :icon="DArrowRight" @click="closeContainer">隐藏</el-button>
          <el-button type="text" size="small" :icon="FullScreen" @click="fullScreenContainer">全屏</el-button>
        </div>
        <!-- 表格内容 -->
        <el-table border :data="tasks" style="width: 100%" height="600" row-key="id" :row-class-name="tableRowClassName" v-loading="loading" @row-click="handleRowClick" :cell-style="imageCellStyle">
          <!-- 图片列 -->
          <el-table-column label="图片" width="70">
            <template #default="{ row }">
              <el-image :src="row.img" fit="contain" class="task-image" style="width: 60px; height: 60px" :preview-src-list="[row.img]" :initial-index="0" hide-on-click-modal>
                <template #error>
                  <div class="image-error">
                    <el-icon>
                      <Picture />
                    </el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
            </template>
          </el-table-column>

          <!-- 状态列 -->
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="statusTagType[row.status]" effect="light" size="small" round>
                {{ statusText[row.status] }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 任务信息列 -->
          <el-table-column prop="name" label="任务信息">
            <template #default="{ row }">
              <div class="task-info">
                <el-text type="info" truncated>{{ row.info }}</el-text>
              </div>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button :disabled="row.status === 'pending' || row.status === 'processing' " type="primary" size="small" @click.stop="handleRetry(row)">重试</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, onBeforeUnmount } from 'vue';
import { Picture, FullScreen, DArrowRight } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

// 状态配置
const statusText = {
  pending: '等待中',
  downloading: '进行中',
  completed: '已完成',
  failed: '已失败'
};

const statusTagType = {
  pending: 'warning',
  downloading: 'primary',
  completed: 'success',
  failed: 'danger'
};

// 模拟数据
const tasks = ref<any[]>([]);

const loading = ref(false);

const log = {
  info: (msg, context = null) => {
    console.log(`%c[iframe] ${msg}`, 'color: red;',context);
  },
  error: (msg, context = null) => {
    console.warn(`%c[iframe] ${msg}`, 'color: red;', context);
  }
}

// 单元格样式设置函数，用于图片列
const imageCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    return {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '60px',
      height: '60px',
      overflow: 'hidden'
    };
  }
};

// 行样式
const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 1 ? 'stripe-row' : '';
};


// 行点击处理
const handleRowClick = (row, column, event) => {
  if (column.label !== '操作') {
    ElNotification({
      title: '任务详情',
      message: h('pre', JSON.stringify(row, null, 2)),
      duration: 3000
    });
  }
};

// 控制任务管理容器显示与隐藏
const showContainer = ref(true);
const closeContainer = () => {
  window.parent.postMessage(
    {
      type: 'closeIframe'
    },
    'https://web.telegram.org/*'
  );
};

const fullScreenContainer = () => {
  window.parent.postMessage(
    {
      type: 'fullScreenContainer',
      content: 'fullScreenContainer'
    },
    'https://web.telegram.org'
  );
};

// 重试任务
const handleRetry = (task) => {
  log.info('handleRetry', task);
  window.parent.postMessage(
    {
      type: 'downloadTask',
      content: task.detail
    },
    'https://web.telegram.org/*'
  );
};

// 定义消息处理函数
const handleMessage = (event) => {
  if (event.origin !== 'https://web.telegram.org') return;
  switch (event.data.type) {
    case 'add_task':
      addTask(event.data);
      break;
    case 'down_task_status':
      modifyTask(event.data);
      break;
  }
};

// 添加任务
const addTask = (task: any) => {
  const { id, status, info, url, detail } = task;
  log.info('addTask', task);
  tasks.value.unshift({ id, status, img: info, url, detail });
};

// 修改任务
const modifyTask = (task: any) => {
  log.info('modifyTask', task);
  const { id, status, info } = task;
  tasks.value = tasks.value.map((t: any) => (t.id === id ? { ...t, status, info: info + '%' } : t));
};

// 提取公共错误处理函数
const handleResizeObserverError = (e: any) => {
  if (e && e.message && e.message.includes('ResizeObserver')) {
    e.stopImmediatePropagation();
    e.stopPropagation();
  }
};

// 组件挂载后注册消息事件监听器
onMounted(() => {
  window.addEventListener('message', handleMessage);
  // 添加错误监听（使用统一处理函数）
  window.addEventListener('error', handleResizeObserverError, true);
});

// 组件卸载前移除消息事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage);
  // 移除错误监听（使用统一处理函数）
  window.removeEventListener('error', handleResizeObserverError, true);
});
</script>

<style scoped>
.task-manager-container {
  padding: 0px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: relative;
}

.button-line {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: calc(100% - 1px);
  margin-left: -1px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

/* 关闭按钮样式 */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f56c6c;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

/* 信息图标样式，固定在屏幕右侧 */
.info-icon {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #409eff;
  color: white;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

/* transition 实现向右滑出的动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

.task-image {
  object-fit: contain;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  padding: 10px;
}

.task-info {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}

.task-title {
  font-weight: 600;
  color: var(--el-color-primary);
}

:deep(.el-table) {
  --el-table-border-color: #f0f0f0;
  --el-table-header-bg-color: #f8f9fa;
}

:deep(.el-table__row) {
  transition: background 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #fafafa !important;
}

:deep(.stripe-row) {
  background-color: #f8fafc;
}

:deep(.el-table__fixed-right) {
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.03);
}
</style>
