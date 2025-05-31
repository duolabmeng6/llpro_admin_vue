/**
 * 通知服务
 * 提供全局方便调用的通知方法
 */
import { createApp, h } from 'vue'
import Notification from '../components/Notification.vue'

// 通知队列
const notifications = []
// 通知容器ID
const CONTAINER_ID = 'notification-container'

/**
 * 创建通知容器
 * @returns {HTMLElement} 通知容器元素
 */
const createContainer = () => {
  // 如果已经存在容器，则直接返回
  let container = document.getElementById(CONTAINER_ID)
  if (container) {
    return container
  }

  // 创建容器
  container = document.createElement('div')
  container.id = CONTAINER_ID
  container.style.position = 'fixed'
  container.style.zIndex = '9999'
  container.style.pointerEvents = 'none'
  container.style.width = '100vw'
  container.style.height = '100vh'
  container.style.top = '0'
  container.style.left = '0'

  document.body.appendChild(container)
  return container
}

/**
 * 创建通知实例并显示
 * @param {Object} options 通知选项
 * @returns {string} 通知ID
 */
const notify = (options) => {
  const container = createContainer()
  
  // 创建通知元素
  const notificationElement = document.createElement('div')
  notificationElement.style.pointerEvents = 'auto'
  container.appendChild(notificationElement)
  
  // 创建Vue应用并挂载通知组件
  const app = createApp({
    render() {
      return h(Notification, {
        ...options,
        onClose: (id) => {
          // 关闭通知后移除元素和应用实例
          setTimeout(() => {
            app.unmount()
            container.removeChild(notificationElement)
            
            // 从队列中移除
            const index = notifications.findIndex(n => n.id === id)
            if (index !== -1) {
              notifications.splice(index, 1)
            }
          }, 300) // 等待离开动画完成
        }
      })
    }
  })
  
  app.mount(notificationElement)
  
  // 生成通知ID
  const id = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  
  // 添加到队列
  notifications.push({ id, app, element: notificationElement })
  
  return id
}

/**
 * 创建不同类型的通知
 */
const info = (message, options = {}) => {
  return notify({ message, type: 'info', ...options })
}

const success = (message, options = {}) => {
  return notify({ message, type: 'success', ...options })
}

const warning = (message, options = {}) => {
  return notify({ message, type: 'warning', ...options })
}

const error = (message, options = {}) => {
  return notify({ message, type: 'error', ...options })
}

/**
 * 关闭指定ID的通知
 * @param {string} id 通知ID
 */
const close = (id) => {
  const notification = notifications.find(n => n.id === id)
  if (notification) {
    notification.app.unmount()
    notification.element.remove()
    
    // 从队列中移除
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.splice(index, 1)
    }
  }
}

/**
 * 关闭所有通知
 */
const closeAll = () => {
  notifications.forEach(notification => {
    notification.app.unmount()
    notification.element.remove()
  })
  
  notifications.length = 0
}

// 导出通知服务
export const notificationService = {
  info,
  success,
  warning,
  error,
  notify,
  close,
  closeAll
} 