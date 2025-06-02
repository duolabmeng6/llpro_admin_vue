import { onMounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme'

/**
 * 自定义钩子，用于确保主题正确应用到页面
 * @param {Object} options - 配置选项
 * @param {Boolean} options.applyBodyClass - 是否将主题类应用到body元素
 * @returns {Object} 主题相关的状态和方法
 */
export function useThemeEffect(options = {}) {
  const themeStore = useThemeStore()
  
  // 应用主题类到HTML元素
  const applyThemeClass = (themeName) => {
    const root = document.documentElement
    
    // 移除所有主题类
    root.classList.remove('dark', 'light', 'cyberpunk', 'green')
    
    // 添加当前主题类
    root.classList.add(themeName)
    
    // 设置data-theme属性
    root.setAttribute('data-theme', themeName)
    
    // 如果需要，也应用到body元素
    if (options.applyBodyClass) {
      document.body.classList.remove('theme-dark', 'theme-light', 'theme-cyberpunk', 'theme-green')
      document.body.classList.add(`theme-${themeName}`)
    }
    
    console.log('主题类已应用:', themeName)
  }
  
  // 组件挂载时确保主题已应用
  onMounted(() => {
    applyThemeClass(themeStore.currentTheme)
  })
  
  // 监听主题变化
  watch(() => themeStore.currentTheme, (newTheme) => {
    applyThemeClass(newTheme)
  })
  
  return {
    currentTheme: themeStore.currentTheme,
    availableThemes: themeStore.availableThemes,
    setTheme: themeStore.setTheme
  }
} 