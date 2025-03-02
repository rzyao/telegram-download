<template>
  <div class="task-manager-container">
    <el-table
      :data="tasks"
      style="width: 100%"
      height="80vh"
      row-key="id"
      :row-class-name="tableRowClassName"
      v-loading="loading"
      @row-click="handleRowClick"
    >
      <!-- 图片列 -->
      <el-table-column label="预览" width="150">
        <template #default="{ row }">
          <el-image 
            :src="row.img"
            :preview-src-list="[row.img]"
            fit="cover"
            class="task-image"
            :initial-index="0"
            hide-on-click-modal
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>加载失败</span>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>

      <!-- 任务信息列 -->
      <el-table-column prop="name" label="任务名称" min-width="200">
        <template #default="{ row }">
          <div class="task-info">
            <div class="task-title">{{ row.name }}</div>
            <el-text type="info" truncated>{{ row.info }}</el-text>
          </div>
        </template>
      </el-table-column>

      <!-- 状态列 -->
      <el-table-column prop="status" label="状态" width="150">
        <template #default="{ row }">
          <el-tag 
            :type="statusTagType[row.status]"
            effect="light"
            round
          >
            {{ statusText[row.status] }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small" 
            @click.stop="handleAction(row)"
          >
            <template #icon>
              <el-icon><VideoPlay /></el-icon>
            </template>
            操作
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Picture, 
  VideoPlay 
} from '@element-plus/icons-vue'

// 状态配置
const statusText = {
  pending: '等待中',
  processing: '进行中',
  completed: '已完成',
  failed: '已失败'
}

const statusTagType = {
  pending: 'warning',
  processing: 'primary',
  completed: 'success',
  failed: 'danger'
}

// 模拟数据
const tasks = ref(Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `任务 ${i + 1}`,
  img: `https://picsum.photos/200/150?random=${i}`,
  info: `这是第 ${i + 1} 个任务的详细描述信息，用于测试文本截断效果`,
  status: ['pending', 'processing', 'completed', 'failed'][i % 4]
})))

// 行样式
const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 1 ? 'stripe-row' : ''
}

// 操作处理
const handleAction = (row) => {
  ElMessage.info(`操作任务：${row.name}`)
}

// 行点击处理
const handleRowClick = (row, column, event) => {
  if (column.label !== '操作') {
    ElNotification({
      title: '任务详情',
      message: h('pre', JSON.stringify(row, null, 2)),
      duration: 3000
    })
  }
}
</script>

<style scoped>
.task-manager-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.task-image {
  width: 120px;
  height: 80px;
  border-radius: 4px;
  transition: transform 0.3s ease;
}

.task-image:hover {
  transform: scale(1.05);
  cursor: zoom-in;
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
  flex-direction: column;
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
  box-shadow: -2px 0 6px rgba(0,0,0,0.03);
}
</style>

