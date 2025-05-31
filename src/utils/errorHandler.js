/**
 * 全局错误处理工具
 */

// 存储通知函数
let notifyFunction = null

/**
 * 设置通知函数
 * @param {Function} notify - 通知函数
 */
export const setNotifyFunction = (notify) => {
  notifyFunction = notify
}

/**
 * 处理API错误
 * @param {Error|Object} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {string} 格式化后的错误消息
 */
export const handleApiError = (error, defaultMessage = '操作失败') => {
  let message = defaultMessage

  if (error) {
    if (typeof error === 'string') {
      message = error
    } else if (error.message) {
      message = error.message
    } else if (error.data && error.data.message) {
      message = error.data.message
    }
  }

  // 如果设置了通知函数，则调用
  if (notifyFunction) {
    notifyFunction({
      type: 'error',
      message
    })
  }

  return message
}

/**
 * 全局未捕获错误处理
 * @param {Error} error - 错误对象
 * @param {Vue} vm - Vue实例
 * @param {string} info - 错误信息
 */
export const globalErrorHandler = (error, vm, info) => {
  console.error('全局错误:', error)
  console.error('错误组件:', vm)
  console.error('错误信息:', info)

  // 如果设置了通知函数，则调用
  if (notifyFunction) {
    notifyFunction({
      type: 'error',
      message: '系统错误，请联系管理员'
    })
  }
}

/**
 * 全局Promise未捕获错误处理
 * @param {Event} event - 错误事件
 */
export const unhandledRejectionHandler = (event) => {
  console.error('未处理的Promise错误:', event.reason)

  // 如果设置了通知函数，则调用
  if (notifyFunction) {
    notifyFunction({
      type: 'error',
      message: '系统错误，请联系管理员'
    })
  }
}

/**
 * 初始化全局错误处理
 * @param {Vue} app - Vue应用实例
 * @param {Function} notify - 通知函数
 */
export const setupErrorHandler = (app, notify) => {
  // 设置通知函数
  setNotifyFunction(notify)

  // 设置Vue全局错误处理
  app.config.errorHandler = globalErrorHandler

  // 设置全局未捕获错误处理
  window.addEventListener('unhandledrejection', unhandledRejectionHandler)
  
  return () => {
    // 清理函数
    window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
  }
} 