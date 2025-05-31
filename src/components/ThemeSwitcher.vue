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
      class="flex items-center justify-center p-2 rounded-full transition-colors duration-300"
      :class="[
        isLoading ? 'opacity-50 cursor-wait' : '',
        hasError ? 'text-red-500 animate-pulse' : '',
        !hasError && (
          currentTheme === 'dark' ? 'text-blue-400 hover:text-blue-300' :
          currentTheme === 'light' ? 'text-blue-600 hover:text-blue-500' :
          'text-pink-500 hover:text-pink-400'
        )
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
      class="absolute right-0 mt-2 w-64 rounded-lg shadow-xl z-50 overflow-hidden theme-selector"
      :class="{
        'dark-theme-selector': currentTheme === 'dark',
        'light-theme-selector': currentTheme === 'light',
        'cyber-theme-selector': currentTheme === 'cyberpunk'
      }"
    >
      <div class="p-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-medium selector-title">选择主题</h3>
          <button @click="closeThemeSelector" class="selector-close-btn">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <!-- 错误消息 -->
        <div v-if="errorMessage" class="mb-3 p-2 text-xs rounded error-message">
          {{ errorMessage }}
        </div>
        
        <!-- 主题列表 -->
        <div class="space-y-3">
          <button
            v-for="theme in availableThemes"
            :key="theme.id"
            @click="changeTheme(theme.id)"
            class="w-full p-3 rounded-lg transition-all duration-300 flex items-center theme-item"
            :disabled="isLoading || theme.id === currentTheme"
            :class="{
              'opacity-50 cursor-wait': isLoading && theme.id === currentTheme,
              'theme-item-active': theme.id === currentTheme,
              'theme-item-inactive': theme.id !== currentTheme
            }"
          >
            <!-- 主题图标 -->
            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 theme-icon"
              :class="{
                'dark-icon': theme.id === 'dark',
                'light-icon': theme.id === 'light',
                'cyber-icon': theme.id === 'cyberpunk'
              }"
            >
              <i
                :class="[
                  theme.id === currentTheme && isLoading ? 'fa-solid fa-circle-notch fa-spin' :
                  theme.id === 'dark' ? 'fa-solid fa-moon' :
                  theme.id === 'light' ? 'fa-solid fa-sun' :
                  'fa-solid fa-bolt'
                ]"
              ></i>
            </div>
            
            <!-- 主题信息 -->
            <div class="text-left">
              <div class="font-medium">{{ theme.name }}</div>
              <div class="text-xs opacity-70">{{ theme.description }}</div>
            </div>
            
            <!-- 当前选中标记 -->
            <div v-if="theme.id === currentTheme" class="ml-auto">
              <i class="fa-solid fa-check"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-transition {
  transition: opacity 0.2s ease, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 深色主题选择器 */
.dark-theme-selector {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

/* 明亮主题选择器 */
.light-theme-selector {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #333;
}

/* 赛博朋克主题选择器 */
.cyber-theme-selector {
  background: rgba(20, 20, 30, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid #ff00ff;
  color: white;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
}

/* 主题项样式 */
.theme-item-active {
  background-color: rgba(100, 100, 150, 0.2);
}

.dark-theme-selector .theme-item-active {
  background-color: rgba(30, 41, 59, 0.8);
}

.light-theme-selector .theme-item-active {
  background-color: rgba(240, 240, 250, 0.8);
}

.cyber-theme-selector .theme-item-active {
  background-color: rgba(60, 20, 60, 0.8);
  border: 1px solid #ff00ff;
}

/* 主题图标样式 */
.dark-icon {
  background-color: #1e293b;
  color: #60a5fa;
}

.light-icon {
  background-color: #f8fafc;
  color: #3b82f6;
}

.cyber-icon {
  background-color: #0f0f1a;
  color: #ff00ff;
}

/* 关闭按钮样式 */
.selector-close-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.selector-close-btn:hover {
  opacity: 1;
}

/* 主题项悬停效果 */
.theme-item-inactive:hover {
  background-color: rgba(100, 100, 100, 0.1);
}

/* 错误消息样式 */
.error-message {
  background-color: rgba(254, 202, 202, 0.2);
  color: #ef4444;
  border-left: 3px solid #ef4444;
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
</style> 