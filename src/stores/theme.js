import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// 主题配置
const themes = {
  dark: {
    id: 'dark',
    name: '深色科技',
    description: '深色科技风格主题',
    preview: '/theme-previews/dark.png'
  },
  light: {
    id: 'light',
    name: '明亮简约',
    description: '明亮简约风格主题',
    preview: '/theme-previews/light.png'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '霓虹赛博朋克风格主题',
    preview: '/theme-previews/cyberpunk.png'
  },
  green: {
    id: 'green',
    name: '自然绿',
    description: '清新自然的绿色主题',
    preview: '/theme-previews/green.png'
  }
}

// 默认主题
const DEFAULT_THEME = 'light'

// 主题存储键名
const THEME_STORAGE_KEY = 'll_pro_admin_theme'

export const useThemeStore = defineStore('theme', () => {
  // 当前主题ID
  const currentTheme = ref(DEFAULT_THEME)
  
  // 是否正在加载主题
  const isLoading = ref(false)
  
  // 是否有加载错误
  const hasError = ref(false)
  
  // 错误消息
  const errorMessage = ref('')
  
  // 主题列表
  const availableThemes = Object.values(themes)
  
  // 获取当前主题对象
  const getCurrentTheme = () => themes[currentTheme.value]
  
  // 初始化主题
  const initTheme = () => {
    try {
      console.log('开始初始化主题...')
      
      // 从本地存储获取主题
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      
      // 如果没有保存的主题，则根据系统偏好设置初始主题
      if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const systemTheme = prefersDark ? 'dark' : 'light'
        console.log('使用系统偏好主题:', systemTheme)
        setTheme(systemTheme)
        return
      }
      
      // 如果有保存的主题且该主题存在，则使用保存的主题
      if (themes[savedTheme]) {
        console.log('使用保存的主题:', savedTheme)
        setTheme(savedTheme)
      } else {
        // 否则使用默认主题
        console.log('使用默认主题:', DEFAULT_THEME)
        setTheme(DEFAULT_THEME)
      }
    } catch (error) {
      console.error('初始化主题失败:', error)
      hasError.value = true
      errorMessage.value = '初始化主题失败'
      
      // 出错时更新状态但使用默认主题
      currentTheme.value = DEFAULT_THEME
      applyTheme(DEFAULT_THEME)
    } finally {
      isLoading.value = false
    }
  }
  
  // 应用主题到 HTML 元素
  const applyTheme = (themeId) => {
    try {
      document.documentElement.setAttribute('data-theme', themeId)
      console.log(`已设置 HTML data-theme 属性为: ${themeId}`)
    } catch (error) {
      console.error('应用主题到 HTML 失败:', error)
      throw error
    }
  }
  
  // 设置主题
  const setTheme = (themeId) => {
    try {
      // 检查主题是否存在
      if (!themes[themeId]) {
        throw new Error(`主题 ${themeId} 不存在`)
      }
      
      // 如果当前正在加载或已经是目标主题，则不重复操作
      if (isLoading.value || currentTheme.value === themeId) {
        return
      }
      
      // 重置错误状态
      hasError.value = false
      errorMessage.value = ''
      
      // 设置加载状态
      isLoading.value = true
      console.log('正在设置主题:', themeId)
      
      // 应用主题到 HTML
      applyTheme(themeId)
      
      // 更新当前主题
      currentTheme.value = themeId
      
      // 保存到本地存储
      localStorage.setItem(THEME_STORAGE_KEY, themeId)
      console.log(`主题已保存到本地存储: ${themeId}`)
      
      console.log(`已切换到主题: ${themes[themeId].name}`)
    } catch (error) {
      console.error('设置主题失败:', error)
      hasError.value = true
      errorMessage.value = `设置主题失败: ${error.message || '未知错误'}`
    } finally {
      // 无论成功失败，都完成加载状态
      isLoading.value = false
    }
  }
  
  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    // 处理系统主题变化
    const handleSystemThemeChange = (event) => {
      // 只有当用户没有明确设置主题时，才跟随系统主题
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      if (!savedTheme) {
        const newTheme = event.matches ? 'dark' : 'light'
        console.log('系统主题已变更，更新主题为:', newTheme)
        setTheme(newTheme)
      }
    }
    
    // 添加系统主题变化监听器
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  }
  
  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    console.log('主题变更为:', newTheme)
    applyTheme(newTheme)
  })
  
  return {
    currentTheme,
    isLoading,
    hasError,
    errorMessage,
    availableThemes,
    getCurrentTheme,
    initTheme,
    setTheme,
    setupSystemThemeListener,
    applyTheme
  }
})