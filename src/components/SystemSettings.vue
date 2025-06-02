<template>
  <div class="system-settings-container">
    <!-- 遮罩层 -->
    <div 
      v-if="isVisible" 
      class="settings-backdrop" 
      @click="closeSettings"
    ></div>
    
    <!-- 设置面板 -->
    <div 
      class="settings-panel glass-morphism"
      :class="{ 'visible': isVisible }"
    >
      <!-- 标题栏 -->
      <div class="settings-header">
        <h3 class="settings-title">
          <i class="fa-solid fa-cog mr-2"></i>
          系统设置
        </h3>
        <button 
          class="close-button" 
          @click="closeSettings"
          title="关闭设置"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      
      <!-- 设置内容 -->
      <div class="settings-content">
        <!-- 主题设置部分 -->
        <div class="settings-section">
          <h4 class="section-title">
            <i class="fa-solid fa-palette mr-2"></i>
            主题设置
          </h4>
          
          <div class="themes-container">
            <div
              v-for="theme in availableThemes"
              :key="theme.id"
              @click="changeTheme(theme.id)"
              class="theme-card"
              :class="{ 'theme-card-active': theme.id === currentTheme }"
            >
              <!-- 主题预览 -->
              <div 
                class="theme-preview"
                :data-preview-theme="theme.id"
              >
                <div class="theme-preview-header"></div>
                <div class="theme-preview-content">
                  <div class="theme-preview-sidebar"></div>
                  <div class="theme-preview-main">
                    <div class="theme-preview-card"></div>
                    <div class="theme-preview-button"></div>
                  </div>
                </div>
              </div>
              
              <!-- 主题信息 -->
              <div class="theme-info">
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-description">{{ theme.description }}</div>
                
                <!-- 状态指示器 -->
                <div v-if="theme.id === currentTheme" class="theme-status">
                  <span 
                    class="status-indicator"
                    :class="{ 'loading': isThemeLoading }"
                  ></span>
                  <span class="status-text">{{ isThemeLoading ? '加载中...' : '当前使用' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 侧边栏设置部分 -->
        <div class="settings-section">
          <h4 class="section-title">
            <i class="fa-solid fa-bars mr-2"></i>
            侧边栏设置
          </h4>
          
          <div class="sidebar-settings">
            <div class="setting-item">
              <span class="setting-label">默认展开侧边栏</span>
              <div class="toggle-switch-wrapper">
                <label class="toggle-switch">
                  <input 
                    type="checkbox" 
                    v-model="sidebarExpanded"
                    @change="updateSidebarDefault"
                  >
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <p class="setting-description">
              设置应用启动时侧边栏的默认状态，您仍然可以随时通过点击侧边栏上的按钮来切换展开/收起状态。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useSettingsStore } from '../stores/settings'
import { useMenuStore } from '../stores/menu'

// 获取主题store
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
const menuStore = useMenuStore()

// 设置面板可见性
const isVisible = computed(() => settingsStore.isSettingsPanelVisible)

// 当前选中的主题
const currentTheme = computed(() => themeStore.currentTheme)

// 是否正在加载主题
const isThemeLoading = computed(() => themeStore.isLoading)

// 可用主题列表
const availableThemes = computed(() => themeStore.availableThemes)

// 侧边栏默认状态
const sidebarExpanded = ref(settingsStore.sidebarDefaultExpanded)

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

// 监听设置store中的侧边栏默认状态
watch(() => settingsStore.sidebarDefaultExpanded, (newValue) => {
  sidebarExpanded.value = newValue
})

// 组件挂载时，确保设置已初始化
onMounted(() => {
  settingsStore.initSettings()
})

// 切换主题
const changeTheme = (themeId) => {
  if (themeId === currentTheme.value || isThemeLoading.value) {
    return
  }
  
  errorMessage.value = ''
  
  try {
    themeStore.setTheme(themeId)
  } catch (error) {
    errorMessage.value = '切换主题失败，请稍后重试'
    
    // 3秒后清除错误消息
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }
}

// 更新侧边栏默认状态
const updateSidebarDefault = () => {
  // 更新设置存储中的默认值
  settingsStore.setSidebarDefaultExpanded(sidebarExpanded.value)
  
  // 立即更新侧边栏状态
  localStorage.setItem('sidebarOpen', sidebarExpanded.value)
  
  // 触发storage事件，通知其他组件更新
  const storageEvent = new StorageEvent('storage', {
    key: 'sidebarOpen',
    newValue: String(sidebarExpanded.value),
    url: window.location.href
  })
  window.dispatchEvent(storageEvent)
}

// 关闭设置面板
const closeSettings = () => {
  settingsStore.hideSettingsPanel()
}
</script>

<style scoped>
/* 设置容器 */
.system-settings-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  pointer-events: none;
}

/* 背景遮罩 */
.settings-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
  pointer-events: auto;
}

/* 设置面板 */
.settings-panel {
  position: absolute;
  top: 0;
  right: -380px;
  width: 360px;
  height: 100%;
  background-color: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border);
  box-shadow: -5px 0 25px var(--color-shadow);
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  overflow: hidden;
}

.settings-panel.visible {
  right: 0;
}

/* 标题栏 */
.settings-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
}

.close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--color-bg-quaternary);
  color: var(--color-text-primary);
  transform: rotate(90deg);
}

/* 设置内容 */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* 设置区块 */
.settings-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
}

/* 主题卡片容器 */
.themes-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

/* 主题卡片 */
.theme-card {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-bg-tertiary);
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.theme-card-active {
  border: 2px solid var(--color-accent);
}

/* 主题预览 */
.theme-preview {
  height: 80px;
  border-radius: 0.375rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
  border: 1px solid var(--color-border);
}

.theme-preview-header {
  height: 12px;
}

.theme-preview-content {
  height: 68px;
  display: flex;
}

.theme-preview-sidebar {
  width: 16px;
  height: 100%;
}

.theme-preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.theme-preview-card {
  width: 60%;
  height: 24px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.theme-preview-button {
  width: 40%;
  height: 8px;
  border-radius: 4px;
}

/* 主题信息 */
.theme-info {
  padding-top: 0.5rem;
}

.theme-name {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.theme-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.theme-status {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
  margin-right: 0.375rem;
}

.status-indicator.loading {
  background-color: #f59e0b;
  animation: pulse 1s infinite;
}

.status-text {
  color: var(--color-text-secondary);
}

/* 侧边栏设置 */
.sidebar-settings {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.setting-label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.setting-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* 开关组件 */
.toggle-switch-wrapper {
  padding: 0.25rem 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-quaternary);
  border: 1px solid var(--color-border);
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--color-accent);
}

input:focus + .toggle-slider {
  box-shadow: 0 0 1px var(--color-accent);
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
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
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style> 