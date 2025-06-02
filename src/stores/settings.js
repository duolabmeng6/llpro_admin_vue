import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// 设置存储键名
const SIDEBAR_DEFAULT_KEY = 'll_pro_admin_sidebar_default'
const SETTINGS_PANEL_KEY = 'll_pro_admin_settings_panel'

export const useSettingsStore = defineStore('settings', () => {
  // 设置面板是否可见
  const isSettingsPanelVisible = ref(false)
  
  // 侧边栏默认状态（true为展开，false为收起）
  const sidebarDefaultExpanded = ref(true)
  
  // 是否正在加载设置
  const isLoading = ref(false)
  
  // 是否有加载错误
  const hasError = ref(false)
  
  // 错误消息
  const errorMessage = ref('')
  
  // 初始化设置
  const initSettings = () => {
    try {
      isLoading.value = true
      
      // 从本地存储加载侧边栏默认状态
      const savedSidebarDefault = localStorage.getItem(SIDEBAR_DEFAULT_KEY)
      
      if (savedSidebarDefault !== null) {
        sidebarDefaultExpanded.value = savedSidebarDefault === 'true'
      }
      
      hasError.value = false
      errorMessage.value = ''
    } catch (error) {
      hasError.value = true
      errorMessage.value = '初始化设置失败'
      console.error('初始化设置失败:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  // 保存设置到本地存储
  const saveSettings = () => {
    try {
      // 保存侧边栏默认状态
      localStorage.setItem(SIDEBAR_DEFAULT_KEY, sidebarDefaultExpanded.value)
      
      hasError.value = false
      errorMessage.value = ''
      return true
    } catch (error) {
      hasError.value = true
      errorMessage.value = '保存设置失败'
      console.error('保存设置失败:', error)
      return false
    }
  }
  
  // 切换设置面板可见性
  const toggleSettingsPanel = () => {
    isSettingsPanelVisible.value = !isSettingsPanelVisible.value
  }
  
  // 显示设置面板
  const showSettingsPanel = () => {
    isSettingsPanelVisible.value = true
  }
  
  // 隐藏设置面板
  const hideSettingsPanel = () => {
    isSettingsPanelVisible.value = false
  }
  
  // 设置侧边栏默认状态
  const setSidebarDefaultExpanded = (status) => {
    if (sidebarDefaultExpanded.value === status) return
    
    sidebarDefaultExpanded.value = status
    saveSettings()
  }
  
  // 切换侧边栏默认状态
  const toggleSidebarDefaultExpanded = () => {
    sidebarDefaultExpanded.value = !sidebarDefaultExpanded.value
    saveSettings()
  }
  
  // 监听设置面板可见性变化
  watch(isSettingsPanelVisible, (newValue) => {
    // 可以添加额外的副作用，如记录用户行为等
    try {
      localStorage.setItem(SETTINGS_PANEL_KEY, newValue)
    } catch (error) {
      console.error('保存设置面板状态失败:', error)
    }
  })
  
  return {
    isSettingsPanelVisible,
    sidebarDefaultExpanded,
    isLoading,
    hasError,
    errorMessage,
    initSettings,
    saveSettings,
    toggleSettingsPanel,
    showSettingsPanel,
    hideSettingsPanel,
    setSidebarDefaultExpanded,
    toggleSidebarDefaultExpanded
  }
}) 