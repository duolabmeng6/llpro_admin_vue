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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  // 通知标题
  title: {
    type: String,
    default: ''
  },
  // 通知内容
  message: {
    type: String,
    default: ''
  },
  // 通知类型
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  // 通知持续时间（毫秒），设为0则不自动关闭
  duration: {
    type: Number,
    default: 4500
  },
  // 是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: true
  },
  // 位置
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top', 'bottom'
    ].includes(value)
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: true
  },
  // 距离边缘的偏移量
  offset: {
    type: Number,
    default: 16
  },
  // z-index
  zIndex: {
    type: Number,
    default: 9999
  }
})

const emit = defineEmits(['close'])

const notifications = ref([])
const defaultDuration = 5000 // 默认显示时间（毫秒）
const animationInterval = 10 // 进度条动画更新间隔（毫秒）

// 获取主题store
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)

// 是否显示通知
const visible = ref(false)
// 通知ID
const notificationId = ref(`notification-${Date.now()}`)
// 计时器ID
let timer = null

// 通知图标
const notificationIcon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'fa-solid fa-check-circle';
    case 'warning':
      return 'fa-solid fa-exclamation-triangle';
    case 'error':
      return 'fa-solid fa-times-circle';
    case 'info':
    default:
      return 'fa-solid fa-info-circle';
  }
})

// 计算通知位置样式
const positionStyle = computed(() => {
  const style = {
    zIndex: props.zIndex
  }
  
  if (props.position.includes('top')) {
    style.top = `${props.offset}px`
  } else {
    style.bottom = `${props.offset}px`
  }
  
  if (props.position.includes('right')) {
    style.right = `${props.offset}px`
  } else if (props.position.includes('left')) {
    style.left = `${props.offset}px`
  } else {
    style.left = '50%'
    style.transform = 'translateX(-50%)'
  }
  
  return style
})

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

// 显示通知
const show = () => {
  visible.value = true
  
  // 设置自动关闭
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

// 关闭通知
const close = () => {
  visible.value = false
  clearTimeout(timer)
  emit('close', notificationId.value)
}

// 鼠标进入，暂停计时器
const onMouseEnter = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// 鼠标离开，恢复计时器
const onMouseLeave = () => {
  if (props.duration > 0 && visible.value) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

// 组件挂载时显示通知
onMounted(() => {
  show()
})

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