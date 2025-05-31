<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme'
import { applyThemeTransition } from '../utils/themeLoader'

// 获取主题store
const themeStore = useThemeStore()

// 控制主题选择器弹窗显示状态
const isOpen = ref(false)

// 当前选中的主题
const currentTheme = computed(() => themeStore.currentTheme)

// 是否正在加载主题
const isLoading = computed(() => themeStore.isLoading)

// 是否有错误
const hasError = computed(() => themeStore.hasError)

// 可用主题列表
const availableThemes = computed(() => themeStore.availableThemes)

// 错误消息
const errorMessage = ref('')

// 监听主题store中的错误
watch(() => themeStore.errorMessage, (message) => {
  if (message) {
    errorMessage.value = message
    
    // 3秒后清除错误消息
    setTimeout(() => {
      if (errorMessage.value === message) {
        errorMessage.value = ''
      }
    }, 3000)
  }
})

// 组件挂载时，确保主题已初始化
onMounted(() => {
  console.log('ThemeSwitcher组件已挂载, 当前主题:', currentTheme.value)
})

// 切换主题
const changeTheme = async (themeId) => {
  if (themeId === currentTheme.value || isLoading.value) {
    return
  }
  
  errorMessage.value = ''
  console.log('切换主题:', themeId)
  
  try {
    // 应用主题切换过渡效果
    await applyThemeTransition(async () => {
      await themeStore.setTheme(themeId)
    })
    
    // 如果没有错误，关闭主题选择器
    if (!hasError.value) {
      isOpen.value = false
    }
  } catch (error) {
    console.error('切换主题失败:', error)
    errorMessage.value = '切换主题失败，请稍后重试'
    
    // 3秒后清除错误消息
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }
}

// 切换主题选择器显示状态
const toggleThemeSelector = () => {
  if (!isLoading.value) {
    isOpen.value = !isOpen.value
    errorMessage.value = ''
  }
}

// 关闭主题选择器
const closeThemeSelector = () => {
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <!-- 主题切换按钮 -->
    <button
      @click="toggleThemeSelector"
      class="theme-toggle-btn flex items-center justify-center p-2 rounded-full transition-all duration-300"
      :class="[
        isLoading ? 'opacity-50 cursor-wait' : '',
        hasError ? 'theme-toggle-error' : '',
        !hasError && currentTheme === 'dark' ? 'theme-toggle-dark' :
        !hasError && currentTheme === 'light' ? 'theme-toggle-light' :
        !hasError && currentTheme === 'cyberpunk' ? 'theme-toggle-cyber' : ''
      ]"
      :disabled="isLoading"
      :title="hasError ? '主题加载出错，点击重试' : '切换主题'"
    >
      <i v-if="!isLoading && !hasError" class="fa-solid fa-palette text-lg"></i>
      <i v-else-if="isLoading" class="fa-solid fa-circle-notch fa-spin text-lg"></i>
      <i v-else class="fa-solid fa-exclamation-triangle text-lg"></i>
    </button>
    
    <!-- 主题选择弹窗 -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-72 rounded-lg z-50 overflow-hidden theme-selector"
      :class="{
        'dark-theme-selector': currentTheme === 'dark',
        'light-theme-selector': currentTheme === 'light',
        'cyber-theme-selector': currentTheme === 'cyberpunk'
      }"
    >
      <div class="p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-medium text-lg selector-title">选择主题</h3>
          <button @click="closeThemeSelector" class="selector-close-btn hover:opacity-100 p-1">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <!-- 错误消息 -->
        <div v-if="errorMessage" class="mb-4 p-3 text-sm rounded error-message">
          <i class="fa-solid fa-exclamation-circle mr-2"></i>
          {{ errorMessage }}
        </div>
        
        <!-- 主题列表 -->
        <div class="space-y-4">
          <button
            v-for="theme in themeStore.availableThemes"
            :key="theme.id"
            @click="changeTheme(theme.id)"
            class="w-full transition-all duration-300 flex items-start theme-item"
            :disabled="isLoading || theme.id === currentTheme"
            :class="{
              'opacity-50 cursor-wait': isLoading && theme.id === currentTheme,
              'theme-item-active': theme.id === currentTheme,
              'theme-item-inactive': theme.id !== currentTheme,
              'dark-theme-item': theme.id === 'dark',
              'light-theme-item': theme.id === 'light',
              'cyber-theme-item': theme.id === 'cyberpunk'
            }"
          >
            <!-- 主题预览 -->
            <div class="w-16 h-16 rounded-lg theme-preview mr-3 flex items-center justify-center overflow-hidden">
              <div v-if="theme.id === 'dark'" class="dark-theme-preview w-full h-full">
                <div class="preview-navbar"></div>
                <div class="preview-content">
                  <div class="preview-card"></div>
                </div>
              </div>
              <div v-else-if="theme.id === 'light'" class="light-theme-preview w-full h-full">
                <div class="preview-navbar"></div>
                <div class="preview-content">
                  <div class="preview-card"></div>
                </div>
              </div>
              <div v-else class="cyber-theme-preview w-full h-full">
                <div class="preview-navbar"></div>
                <div class="preview-content">
                  <div class="preview-card"></div>
                </div>
              </div>
            </div>
            
            <!-- 主题信息 -->
            <div class="text-left flex-1">
              <div class="font-medium text-base">{{ theme.name }}</div>
              <div class="text-xs opacity-70 mt-1">{{ theme.description }}</div>
              
              <!-- 活动指示器 -->
              <div class="mt-2 flex items-center" v-if="theme.id === currentTheme">
                <span class="h-2 w-2 rounded-full mr-2" 
                  :class="isLoading ? 'loading-indicator' : 'active-indicator'"></span>
                <span class="text-xs">{{ isLoading ? '加载中...' : '当前使用' }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 通用过渡效果 */
.theme-transition {
  transition: all 0.3s ease;
}

/* 切换按钮样式 */
.theme-toggle-btn {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
}

.theme-toggle-dark {
  color: #60a5fa;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
}

.theme-toggle-dark:hover {
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.theme-toggle-light {
  color: #3b82f6;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.theme-toggle-light:hover {
  color: #2563eb;
  background: #ffffff;
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.theme-toggle-cyber {
  color: #ff2cf0;
  background: rgba(13, 2, 33, 0.9);
  border: 1px solid rgba(255, 44, 240, 0.5);
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.3);
  text-shadow: 0 0 5px rgba(255, 44, 240, 0.5);
}

.theme-toggle-cyber:hover {
  color: #ff73f4;
  border-color: #ff2cf0;
  box-shadow: 0 0 15px rgba(255, 44, 240, 0.5);
}

.theme-toggle-error {
  color: #ef4444;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 主题选择器容器样式 */
.theme-selector {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

/* 深色主题选择器 */
.dark-theme-selector {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  color: white;
}

/* 明亮主题选择器 */
.light-theme-selector {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

/* 赛博朋克主题选择器 */
.cyber-theme-selector {
  background: rgba(13, 2, 33, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 44, 240, 0.5);
  color: white;
  box-shadow: 0 0 20px rgba(255, 44, 240, 0.4);
}

/* 主题项样式 */
.theme-item {
  padding: 1rem;
  border-radius: 0.5rem;
}

.dark-theme-item.theme-item-active {
  background-color: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.light-theme-item.theme-item-active {
  background-color: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.cyber-theme-item.theme-item-active {
  background-color: rgba(28, 6, 54, 0.8);
  border: 1px solid rgba(255, 44, 240, 0.5);
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.2);
}

.theme-item-inactive:hover {
  transform: translateY(-2px);
}

.dark-theme-item.theme-item-inactive:hover {
  background-color: rgba(30, 41, 59, 0.4);
}

.light-theme-item.theme-item-inactive:hover {
  background-color: rgba(241, 245, 249, 0.4);
}

.cyber-theme-item.theme-item-inactive:hover {
  background-color: rgba(28, 6, 54, 0.4);
}

/* 主题预览样式 */
.theme-preview {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.dark-theme-preview {
  background-color: #0f172a;
}

.light-theme-preview {
  background-color: #f8fafc;
}

.cyber-theme-preview {
  background-color: #0d0221;
  border: 1px solid #ff2cf0;
  box-shadow: 0 0 5px rgba(255, 44, 240, 0.5);
}

.preview-navbar {
  height: 15%;
  width: 100%;
}

.dark-theme-preview .preview-navbar {
  background-color: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.light-theme-preview .preview-navbar {
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.cyber-theme-preview .preview-navbar {
  background-color: rgba(13, 2, 33, 0.9);
  border-bottom: 1px solid #ff2cf0;
}

.preview-content {
  height: 85%;
  width: 100%;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-card {
  height: 60%;
  width: 80%;
  border-radius: 2px;
}

.dark-theme-preview .preview-card {
  background-color: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.light-theme-preview .preview-card {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.cyber-theme-preview .preview-card {
  background-color: rgba(28, 6, 54, 0.7);
  border: 1px solid rgba(255, 44, 240, 0.3);
  box-shadow: 0 0 5px rgba(255, 44, 240, 0.2);
}

/* 关闭按钮样式 */
.selector-close-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
  border-radius: 9999px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-theme-selector .selector-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.light-theme-selector .selector-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.cyber-theme-selector .selector-close-btn:hover {
  background-color: rgba(255, 44, 240, 0.2);
}

/* 错误消息样式 */
.error-message {
  border-left: 3px solid #ef4444;
}

.dark-theme-selector .error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
}

.light-theme-selector .error-message {
  background-color: rgba(254, 226, 226, 0.8);
  color: #ef4444;
}

.cyber-theme-selector .error-message {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ff1644;
  border-color: #ff1644;
  text-shadow: 0 0 5px rgba(255, 22, 68, 0.5);
}

/* 按钮动画 */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 活动指示器 */
.active-indicator {
  background-color: #10b981;
  box-shadow: 0 0 5px #10b981;
}

.loading-indicator {
  background-color: #f59e0b;
  box-shadow: 0 0 5px #f59e0b;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 