import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { loadTheme } from '../utils/themeLoader'

// 主题配置
const themes = {
  dark: {
    id: 'dark',
    name: '深色科技',
    description: '深色科技风格主题',
    file: 'themes/dark.css',
    preview: '/theme-previews/dark.png'
  },
  light: {
    id: 'light',
    name: '明亮简约',
    description: '明亮简约风格主题',
    file: 'themes/light.css',
    preview: '/theme-previews/light.png'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '霓虹赛博朋克风格主题',
    file: 'themes/cyberpunk.css',
    preview: '/theme-previews/cyberpunk.png'
  }
}

// 默认主题
const DEFAULT_THEME = 'light'

// 主题存储键名
const THEME_STORAGE_KEY = 'll_pro_admin_theme'

// 主题切换超时（毫秒）
const THEME_SWITCH_TIMEOUT = 5000

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
      console.log('保存的主题:', savedTheme)
      
      // 重置错误状态
      hasError.value = false
      errorMessage.value = ''
      
      // 如果有保存的主题且该主题存在，则使用保存的主题
      if (savedTheme && themes[savedTheme]) {
        console.log('使用保存的主题:', savedTheme)
        setTheme(savedTheme, false) // 不保存到localStorage，避免循环
      } else {
        // 否则使用默认主题
        console.log('使用默认主题:', DEFAULT_THEME)
        setTheme(DEFAULT_THEME, false) // 不保存到localStorage，避免循环
      }
      
      // 验证主题是否正确应用到HTML
      setTimeout(() => {
        const htmlTheme = document.documentElement.getAttribute('data-theme')
        if (htmlTheme !== currentTheme.value) {
          console.warn('主题未正确应用到HTML，正在修复...')
          updateHtmlThemeClass(currentTheme.value)
        } else {
          console.log('主题已正确应用到HTML')
        }
      }, 500)
    } catch (error) {
      console.error('初始化主题失败:', error)
      hasError.value = true
      errorMessage.value = '初始化主题失败'
      
      // 出错时更新状态但不尝试加载主题
      currentTheme.value = DEFAULT_THEME
      isLoading.value = false
      
      // 尝试应急恢复
      try {
        console.log('尝试应急恢复默认主题...')
        updateHtmlThemeClass(DEFAULT_THEME)
      } catch (recoveryError) {
        console.error('应急恢复失败:', recoveryError)
      }
    }
  }
  
  // 更新HTML主题类
  const updateHtmlThemeClass = (themeId) => {
    try {
      const root = document.documentElement
      
      // 移除所有主题类
      root.classList.remove('dark', 'light', 'cyberpunk')
      
      // 添加当前主题类
      root.classList.add(themeId)
      
      // 设置data-theme属性
      root.setAttribute('data-theme', themeId)
      
      console.log(`已更新HTML根元素类名: ${themeId}`)
    } catch (error) {
      console.error('更新HTML主题类失败:', error)
    }
  }
  
  // 设置主题
  const setTheme = async (themeId, saveToStorage = true) => {
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
      
      // 获取主题配置
      const theme = themes[themeId]
      
      try {
        // 设置加载超时
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`加载主题 ${themeId} 超时`))
          }, THEME_SWITCH_TIMEOUT)
        })
        
        // 加载主题CSS，带超时
        await Promise.race([loadTheme(theme.file), timeoutPromise])
        
        // 更新当前主题
        currentTheme.value = themeId
        
        // 保存到本地存储
        if (saveToStorage) {
          localStorage.setItem(THEME_STORAGE_KEY, themeId)
          console.log(`主题已保存到本地存储: ${themeId}`)
        }
        
        // 确保HTML类名更新
        updateHtmlThemeClass(themeId)
        
        console.log(`已切换到主题: ${theme.name}`)
      } catch (error) {
        console.error('加载主题文件失败:', error)
        hasError.value = true
        errorMessage.value = `加载主题失败: ${error.message || '未知错误'}`
        
        // 不更改当前主题状态，保持在原来的主题
      } finally {
        // 无论成功失败，都完成加载状态
        isLoading.value = false
      }
    } catch (error) {
      console.error('设置主题失败:', error)
      hasError.value = true
      errorMessage.value = `设置主题失败: ${error.message || '未知错误'}`
      isLoading.value = false
    }
  }
  
  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    console.log('主题变更为:', newTheme)
    updateHtmlThemeClass(newTheme)
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
    updateHtmlThemeClass
  }
}) 