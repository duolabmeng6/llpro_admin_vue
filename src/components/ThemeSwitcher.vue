<template>
  <div class="relative theme-switcher" :class="{ 'simple-mode': props.simple }">
    <!-- 主题切换按钮 -->
    <button
      @click="toggleThemeSelector"
      class="theme-toggle-btn flex items-center justify-center rounded-full transition-all duration-300"
      :class="[
        isLoading ? 'opacity-50 cursor-wait' : '',
        hasError ? 'bg-red-500 text-white' : ''
      ]"
      :disabled="isLoading"
      :title="hasError ? '主题加载出错，点击重试' : '切换主题'"
    >
      <i v-if="!isLoading && !hasError" class="fa-solid fa-palette"></i>
      <i v-else-if="isLoading" class="fa-solid fa-circle-notch fa-spin"></i>
      <i v-else class="fa-solid fa-exclamation-triangle"></i>
    </button>
    
    <!-- 主题选择弹窗 -->
    <div
      v-if="isOpen"
      class="absolute mt-2 rounded-lg z-50 theme-selector-panel shadow-theme-lg glass-morphism"
      :class="props.position === 'right' ? 'right-0' : 'left-0'"
    >
      <!-- 标题栏 -->
      <div class="flex justify-between items-center p-3 border-b border-subtle">
        <h3 class="font-medium text-heading">选择主题</h3>
        <button @click="closeThemeSelector" class="p-1 rounded-full hover:bg-tertiary text-muted">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      
      <!-- 错误消息 -->
      <div v-if="errorMessage" class="m-3 p-2 text-sm rounded bg-red-100 text-red-600 border-l-4 border-red-500">
        <i class="fa-solid fa-exclamation-circle mr-2"></i>
        {{ errorMessage }}
      </div>
      
      <!-- 主题选项卡片 -->
      <div class="p-3 flex flex-col gap-3">
        <div
          v-for="theme in availableThemes"
          :key="theme.id"
          @click="changeTheme(theme.id)"
          class="theme-card flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
          :class="theme.id === currentTheme ? 'theme-card-active' : ''"
          :disabled="isLoading || theme.id === currentTheme"
        >
          <!-- 主题预览 -->
          <div 
            class="theme-preview w-12 h-12 rounded-md overflow-hidden flex-shrink-0 mr-3 border border-subtle"
            :data-preview-theme="theme.id"
          >
            <div class="theme-preview-header h-2"></div>
            <div class="theme-preview-content h-10 flex">
              <div class="theme-preview-sidebar w-2"></div>
              <div class="theme-preview-main flex-1 flex flex-col justify-center items-center">
                <div class="theme-preview-card w-6 h-2 rounded-sm mb-1"></div>
                <div class="theme-preview-button w-4 h-1 rounded-sm"></div>
              </div>
            </div>
          </div>
          
          <!-- 主题信息 -->
          <div class="flex-1">
            <div class="font-medium text-heading">{{ theme.name }}</div>
            <div class="text-xs text-muted">{{ theme.description }}</div>
            
            <!-- 状态指示器 -->
            <div v-if="theme.id === currentTheme" class="flex items-center mt-1 text-xs">
              <span 
                class="inline-block w-2 h-2 rounded-full mr-1"
                :class="isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'"
              ></span>
              <span class="text-muted">{{ isLoading ? '加载中...' : '当前使用' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme'

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
  // 删除日志
})

// 切换主题
const changeTheme = (themeId) => {
  if (themeId === currentTheme.value || isLoading.value) {
    return
  }
  
  errorMessage.value = ''
  
  try {
    themeStore.setTheme(themeId)
    
    // 如果没有错误，关闭主题选择器
    if (!hasError.value) {
      isOpen.value = false
    }
  } catch (error) {
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

<style scoped>
/* 主题切换按钮 */
.theme-toggle-btn {
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;
  background-color: var(--color-bg-secondary);
  color: var(--color-accent);
  border: 1px solid var(--color-border);
}

.simple-mode .theme-toggle-btn {
  width: 30px;
  height: 30px;
}

/* 按钮悬停效果 */
.theme-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px var(--color-shadow);
}

/* 主题选择面板 */
.theme-selector-panel {
  width: 280px;
  overflow: hidden;
  animation: fadeInUp 0.2s ease;
}

/* 主题卡片样式 */
.theme-card {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.theme-card:hover {
  transform: translateY(-1px);
}

.theme-card-active {
  border: 2px solid var(--color-accent);
}

/* 主题预览样式 - 使用data属性选择器 */
.theme-preview[data-preview-theme="light"] {
  background-color: oklch(97.9% 0.005 256.8);
}

.theme-preview[data-preview-theme="light"] .theme-preview-header {
  background-color: oklch(100% 0 0);
}

.theme-preview[data-preview-theme="light"] .theme-preview-sidebar {
  background-color: oklch(95% 0.01 250);
}

.theme-preview[data-preview-theme="light"] .theme-preview-card {
  background-color: white;
  border: 1px solid oklch(90% 0.01 250);
}

.theme-preview[data-preview-theme="light"] .theme-preview-button {
  background-color: var(--color-primary-600);
}

/* 深色主题预览 */
.theme-preview[data-preview-theme="dark"] {
  background-color: oklch(19.2% 0.042 255.3);
}

.theme-preview[data-preview-theme="dark"] .theme-preview-header {
  background-color: oklch(15% 0.04 255);
}

.theme-preview[data-preview-theme="dark"] .theme-preview-sidebar {
  background-color: oklch(12% 0.03 255);
}

.theme-preview[data-preview-theme="dark"] .theme-preview-card {
  background-color: oklch(25% 0.04 255);
  border: 1px solid oklch(30% 0.03 255);
}

.theme-preview[data-preview-theme="dark"] .theme-preview-button {
  background-color: var(--color-primary-500);
}

/* 赛博朋克主题预览 */
.theme-preview[data-preview-theme="cyberpunk"] {
  background-color: oklch(8% 0.04 280);
}

.theme-preview[data-preview-theme="cyberpunk"] .theme-preview-header {
  background-color: oklch(6% 0.03 280);
}

.theme-preview[data-preview-theme="cyberpunk"] .theme-preview-sidebar {
  background-color: oklch(10% 0.04 275);
}

.theme-preview[data-preview-theme="cyberpunk"] .theme-preview-card {
  background-color: oklch(12% 0.05 275);
  border: 1px solid oklch(60% 0.2 320);
}

.theme-preview[data-preview-theme="cyberpunk"] .theme-preview-button {
  background-color: oklch(70% 0.3 320);
}

/* 绿色主题预览 */
.theme-preview[data-preview-theme="green"] {
  background-color: oklch(92% 0.04 145);
}

.theme-preview[data-preview-theme="green"] .theme-preview-header {
  background-color: oklch(97% 0.02 140);
}

.theme-preview[data-preview-theme="green"] .theme-preview-sidebar {
  background-color: oklch(88% 0.06 148);
}

.theme-preview[data-preview-theme="green"] .theme-preview-card {
  background-color: oklch(97% 0.02 140);
  border: 1px solid oklch(80% 0.08 145);
}

.theme-preview[data-preview-theme="green"] .theme-preview-button {
  background-color: oklch(45% 0.15 145);
}

/* 动画 */
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
</style>