<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme'
import { applyThemeTransition } from '../utils/themeLoader'

// 属性定义
const props = defineProps({
  // 是否使用简洁模式(登录页等场景)
  simple: {
    type: Boolean,
    default: false
  },
  // 菜单打开位置
  position: {
    type: String,
    default: 'right', // right, left
    validator: (value) => ['right', 'left'].includes(value)
  }
})

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
  <div class="relative theme-switcher" :class="{ 'simple-mode': props.simple }">
    <!-- 主题切换按钮 -->
    <button
      @click="toggleThemeSelector"
      class="theme-toggle-btn flex items-center justify-center rounded-full transition-all duration-300"
      :class="[
        isLoading ? 'opacity-50 cursor-wait' : '',
        hasError ? 'theme-toggle-error' : '',
        props.simple ? 'simple-btn' : 'standard-btn',
        !hasError && currentTheme === 'dark' ? 'theme-toggle-dark' :
        !hasError && currentTheme === 'light' ? 'theme-toggle-light' :
        !hasError && currentTheme === 'cyberpunk' ? 'theme-toggle-cyber' : ''
      ]"
      :disabled="isLoading"
      :title="hasError ? '主题加载出错，点击重试' : '切换主题'"
    >
      <i v-if="!isLoading && !hasError" class="fa-solid fa-palette" :class="{'text-xs': props.simple, 'text-sm': !props.simple}"></i>
      <i v-else-if="isLoading" class="fa-solid fa-circle-notch fa-spin" :class="{'text-xs': props.simple, 'text-sm': !props.simple}"></i>
      <i v-else class="fa-solid fa-exclamation-triangle" :class="{'text-xs': props.simple, 'text-sm': !props.simple}"></i>
    </button>
    
    <!-- 主题选择弹窗 - 全新设计 -->
    <div
      v-if="isOpen"
      class="absolute mt-2 rounded-lg z-50 theme-selector-panel"
      :class="[
        props.position === 'right' ? 'right-0' : 'left-0',
        props.simple ? 'simple-selector' : 'standard-selector',
        `theme-${currentTheme}-panel`
      ]"
    >
      <!-- 标题栏 -->
      <div class="theme-selector-header">
        <h3 class="theme-selector-title">选择主题</h3>
        <button @click="closeThemeSelector" class="theme-selector-close">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      
      <!-- 错误消息 -->
      <div v-if="errorMessage" class="theme-selector-error">
        <i class="fa-solid fa-exclamation-circle mr-2"></i>
        {{ errorMessage }}
      </div>
      
      <!-- 主题选项卡片 -->
      <div class="theme-cards-container">
        <div
          v-for="theme in themeStore.availableThemes"
          :key="theme.id"
          @click="changeTheme(theme.id)"
          class="theme-card"
          :class="[
            theme.id === currentTheme ? 'theme-card-active' : 'theme-card-inactive'
          ]"
          :disabled="isLoading || theme.id === currentTheme"
        >
          <!-- 主题预览 -->
          <div class="theme-card-preview" :class="`theme-${theme.id}-preview`">
            <!-- 模拟界面元素 -->
            <div class="preview-header"></div>
            <div class="preview-sidebar"></div>
            <div class="preview-content">
              <div class="preview-card-element"></div>
              <div class="preview-button-element"></div>
            </div>
          </div>
          
          <!-- 主题名称和描述 -->
          <div class="theme-card-info">
            <div class="theme-card-name">{{ theme.name }}</div>
            <div class="theme-card-desc">{{ theme.description }}</div>
            
            <!-- 状态指示器 -->
            <div v-if="theme.id === currentTheme" class="theme-card-status">
              <span class="status-indicator" :class="isLoading ? 'status-loading' : 'status-active'"></span>
              <span class="status-text">{{ isLoading ? '加载中...' : '当前使用' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ======== 主题切换按钮样式 ======== */
.theme-toggle-btn {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 按钮尺寸 */
.standard-btn {
  width: 32px;
  height: 32px;
  padding: 0.35rem;
}

.simple-btn {
  width: 26px;
  height: 26px;
  padding: 0.25rem;
}

/* 按钮主题样式 */
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
  transform: translateY(-1px);
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
  transform: translateY(-1px);
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
  transform: translateY(-1px);
}

.theme-toggle-error {
  color: #ef4444;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ======== 主题选择器面板 ======== */
.theme-selector-panel {
  overflow: hidden;
  animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 面板尺寸 */
.standard-selector {
  width: 280px;
}

.simple-selector {
  width: 260px;
}

/* 面板主题样式 */
.theme-dark-panel {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.theme-light-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

.theme-cyberpunk-panel {
  background: rgba(13, 2, 33, 0.95);
  border: 1px solid rgba(255, 44, 240, 0.4);
  color: #f1f5f9;
}

/* 标题栏样式 */
.theme-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.theme-dark-panel .theme-selector-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.theme-light-panel .theme-selector-header {
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

.theme-cyberpunk-panel .theme-selector-header {
  border-bottom-color: rgba(255, 44, 240, 0.3);
}

.theme-selector-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0;
  letter-spacing: 0.01em;
}

.theme-selector-close {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.7rem;
  opacity: 0.7;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
}

.theme-selector-close:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

.theme-light-panel .theme-selector-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.theme-cyberpunk-panel .theme-selector-close:hover {
  background-color: rgba(255, 44, 240, 0.2);
}

/* 错误消息样式 */
.theme-selector-error {
  margin: 0.5rem 1rem;
  padding: 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
}

.theme-dark-panel .theme-selector-error {
  background-color: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-left: 3px solid #ef4444;
}

.theme-light-panel .theme-selector-error {
  background-color: rgba(254, 226, 226, 0.8);
  color: #ef4444;
  border-left: 3px solid #ef4444;
}

.theme-cyberpunk-panel .theme-selector-error {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ff1644;
  border-left: 3px solid #ff1644;
}

/* 主题卡片容器 */
.theme-cards-container {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 主题卡片样式 - 统一背景色 */
.theme-card {
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 深色主题下的卡片样式 */
.theme-dark-panel .theme-card {
  background-color: rgba(30, 41, 59, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.theme-dark-panel .theme-card-active {
  background-color: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.theme-dark-panel .theme-card-inactive:hover {
  background-color: rgba(30, 41, 59, 0.3);
  transform: translateY(-1px);
}

/* 浅色主题下的卡片样式 */
.theme-light-panel .theme-card {
  background-color: rgba(241, 245, 249, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-light-panel .theme-card-active {
  background-color: rgba(241, 245, 249, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.theme-light-panel .theme-card-inactive:hover {
  background-color: rgba(241, 245, 249, 0.6);
  transform: translateY(-1px);
}

/* 赛博朋克主题下的卡片样式 */
.theme-cyberpunk-panel .theme-card {
  background-color: rgba(28, 6, 54, 0.2);
  border: 1px solid rgba(255, 44, 240, 0.1);
}

.theme-cyberpunk-panel .theme-card-active {
  background-color: rgba(28, 6, 54, 0.4);
  border: 1px solid rgba(255, 44, 240, 0.3);
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.1);
}

.theme-cyberpunk-panel .theme-card-inactive:hover {
  background-color: rgba(28, 6, 54, 0.3);
  transform: translateY(-1px);
}

/* 主题预览 */
.theme-card-preview {
  width: 70px;
  height: 50px;
  margin-right: 0.75rem;
  border-radius: 0.375rem;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
}

.theme-card-inactive:hover .theme-card-preview {
  transform: scale(1.03);
}

/* 深色主题预览 */
.theme-dark-preview {
  background-color: #0f172a;
  border-color: rgba(59, 130, 246, 0.3);
}

/* 明亮主题预览 */
.theme-light-preview {
  background-color: #f8fafc;
  border-color: rgba(59, 130, 246, 0.2);
}

/* 赛博朋克主题预览 */
.theme-cyberpunk-preview {
  background-color: #0d0221;
  border-color: rgba(255, 44, 240, 0.3);
}

/* 预览界面元素 */
.preview-header {
  height: 15%;
  width: 100%;
}

.theme-dark-preview .preview-header {
  background-color: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.theme-light-preview .preview-header {
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-cyberpunk-preview .preview-header {
  background-color: rgba(13, 2, 33, 0.9);
  border-bottom: 1px solid rgba(255, 44, 240, 0.3);
}

.preview-sidebar {
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 0;
  width: 20%;
}

.theme-dark-preview .preview-sidebar {
  background-color: rgba(15, 23, 42, 0.8);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.theme-light-preview .preview-sidebar {
  background-color: rgba(255, 255, 255, 0.9);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-cyberpunk-preview .preview-sidebar {
  background-color: rgba(13, 2, 33, 0.8);
  border-right: 1px solid rgba(255, 44, 240, 0.3);
}

.preview-content {
  position: absolute;
  left: 20%;
  top: 15%;
  right: 0;
  bottom: 0;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.preview-card-element {
  width: 80%;
  height: 40%;
  border-radius: 2px;
}

.theme-dark-preview .preview-card-element {
  background-color: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.theme-light-preview .preview-card-element {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-cyberpunk-preview .preview-card-element {
  background-color: rgba(28, 6, 54, 0.7);
  border: 1px solid rgba(255, 44, 240, 0.3);
}

.preview-button-element {
  width: 50%;
  height: 20%;
  border-radius: 2px;
}

.theme-dark-preview .preview-button-element {
  background-color: rgba(59, 130, 246, 0.8);
}

.theme-light-preview .preview-button-element {
  background-color: rgba(59, 130, 246, 0.8);
}

.theme-cyberpunk-preview .preview-button-element {
  background: linear-gradient(90deg, rgba(255, 44, 240, 0.8), rgba(0, 238, 255, 0.8));
}

/* 卡片信息区域 */
.theme-card-info {
  flex: 1;
  min-width: 0;
}

.theme-card-name {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-card-desc {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 状态指示器 */
.theme-card-status {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  margin-top: 0.25rem;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 0.375rem;
}

.status-active {
  background-color: #10b981;
  box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
}

.status-loading {
  background-color: #f59e0b;
  box-shadow: 0 0 5px rgba(245, 158, 11, 0.5);
  animation: pulse 1.5s infinite;
}

.status-text {
  opacity: 0.9;
}

/* 动画效果 */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 简洁模式调整 */
.simple-mode .theme-card-preview {
  width: 60px;
  height: 45px;
}

.simple-mode .theme-selector-title {
  font-size: 0.85rem;
}

.simple-mode .theme-card-name {
  font-size: 0.8rem;
}

.simple-mode .theme-card {
  padding: 0.625rem;
}
</style> 