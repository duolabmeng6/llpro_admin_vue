import { createApp, ref } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './styles/main.css'
import App from './App.vue'
import { setupErrorHandler } from './utils/errorHandler'

// 创建Vue应用实例
const app = createApp(App)

// 全局通知方法
const notify = (options) => {
  if (window.$notificationInstance) {
    return window.$notificationInstance.notify(options)
  }
}

// 设置全局属性
app.config.globalProperties.$notify = notify

// 设置错误处理
setupErrorHandler(app, notify)

// 注册Pinia和路由
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')

// 等待DOM更新后初始化主题
setTimeout(() => {
  try {
    // 初始化主题
    const { useThemeStore } = require('./stores/theme')
    const themeStore = useThemeStore()
    console.log('初始化主题...')
    themeStore.initTheme()
  } catch (error) {
    console.error('初始化主题失败:', error)
  }
}, 100)
