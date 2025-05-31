<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification',
            `notification-${notification.type || 'info'}`
          ]"
        >
          <div class="notification-content">
            <div class="notification-icon">
              <i v-if="notification.type === 'success'" class="fas fa-check h-6 w-6"></i>
              <i v-else-if="notification.type === 'error'" class="fas fa-times h-6 w-6"></i>
              <i v-else-if="notification.type === 'warning'" class="fas fa-exclamation-triangle h-6 w-6"></i>
              <i v-else class="fas fa-info-circle h-6 w-6"></i>
            </div>
            <div class="notification-message">{{ notification.message }}</div>
            <button class="notification-close" @click="removeNotification(notification.id)">
              <i class="fas fa-times h-5 w-5"></i>
            </button>
          </div>
          <div class="notification-progress">
            <div
              class="notification-progress-bar"
              :style="{ width: `${notification.progress}%` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const notifications = ref([])
const defaultDuration = 5000 // 默认显示时间（毫秒）
const animationInterval = 10 // 进度条动画更新间隔（毫秒）

// 添加通知
const notify = ({ type = 'info', message, duration = defaultDuration }) => {
  const id = uuidv4()
  const notification = {
    id,
    type,
    message,
    duration,
    progress: 100,
    timer: null
  }

  notifications.value.push(notification)

  // 设置自动关闭
  startProgressTimer(notification)

  return id
}

// 开始进度条计时器
const startProgressTimer = (notification) => {
  const steps = notification.duration / animationInterval
  const stepSize = 100 / steps
  
  notification.timer = setInterval(() => {
    notification.progress -= stepSize
    
    if (notification.progress <= 0) {
      removeNotification(notification.id)
    }
  }, animationInterval)
}

// 移除通知
const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  
  if (index !== -1) {
    clearInterval(notifications.value[index].timer)
    notifications.value.splice(index, 1)
  }
}

// 清除所有通知
const clearAll = () => {
  notifications.value.forEach(notification => {
    clearInterval(notification.timer)
  })
  notifications.value = []
}

// 组件卸载前清除所有计时器
onBeforeUnmount(() => {
  clearAll()
})

// 导出方法
defineExpose({
  notify,
  removeNotification,
  clearAll
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
}

.notification-content {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-message {
  flex-grow: 1;
  font-size: 14px;
  line-height: 1.4;
}

.notification-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

.notification-progress {
  height: 4px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
}

.notification-progress-bar {
  height: 100%;
  transition: width 0.1s linear;
}

/* 通知类型样式 */
.notification-success {
  border-left: 4px solid #10b981;
}

.notification-success .notification-icon {
  color: #10b981;
}

.notification-success .notification-progress-bar {
  background-color: #10b981;
}

.notification-error {
  border-left: 4px solid #ef4444;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-error .notification-progress-bar {
  background-color: #ef4444;
}

.notification-warning {
  border-left: 4px solid #f59e0b;
}

.notification-warning .notification-icon {
  color: #f59e0b;
}

.notification-warning .notification-progress-bar {
  background-color: #f59e0b;
}

.notification-info {
  border-left: 4px solid #3b82f6;
}

.notification-info .notification-icon {
  color: #3b82f6;
}

.notification-info .notification-progress-bar {
  background-color: #3b82f6;
}

/* 过渡动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 