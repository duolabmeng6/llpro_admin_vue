<script setup>
import { computed } from 'vue'
import { useTabsStore } from '../stores/tabs'
import { useThemeStore } from '../stores/theme'
import { useMenuStore } from '../stores/menu'
import { menuConfig } from '../config/menu'

const tabsStore = useTabsStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()
const tabs = computed(() => tabsStore.getTabs)
const activeTab = computed(() => tabsStore.getActiveTab)
const currentTheme = computed(() => themeStore.currentTheme)

// 根据路径查找菜单图标
const getTabIcon = (path) => {
  // 查找一级菜单
  let menuItem = menuConfig.find(item => item.path === path)
  
  // 如果未找到匹配的一级菜单，尝试在二级菜单中查找
  if (!menuItem) {
    for (const parent of menuConfig) {
      if (parent.children && parent.children.length > 0) {
        const childItem = parent.children.find(child => child.path === path)
        if (childItem) {
          return childItem.icon || parent.icon // 优先使用子菜单图标，如果没有则使用父菜单图标
        }
      }
    }
    // 如果在二级菜单中也未找到，返回默认图标
    return 'fa-solid fa-file'
  }
  
  // 返回一级菜单的图标
  return menuItem.icon || 'fa-solid fa-file'
}

// 切换标签
const switchTab = (path) => {
  tabsStore.switchTab(path)
  
  // 自动展开对应的左侧菜单
  menuStore.expandMenuByPath(path)
}

// 关闭标签
const closeTab = (e, path) => {
  // 阻止点击事件冒泡
  e.stopPropagation()
  tabsStore.closeTab(path)
}

// 右键菜单选项
const handleContextMenu = (e, tab) => {
  e.preventDefault()
  const menu = document.createElement('div')
  
  // 根据当前主题设置右键菜单样式
  if (currentTheme.value === 'dark') {
    menu.className = 'tab-context-menu context-menu-dark'
  } else if (currentTheme.value === 'light') {
    menu.className = 'tab-context-menu context-menu-light'
  } else if (currentTheme.value === 'cyberpunk') {
    menu.className = 'tab-context-menu context-menu-cyber'
  } else {
    menu.className = 'tab-context-menu context-menu-green'
  }
  
  menu.style.position = 'fixed'
  menu.style.top = `${e.clientY}px`
  menu.style.left = `${e.clientX}px`
  menu.style.borderRadius = '8px'
  menu.style.padding = '8px 0'
  menu.style.zIndex = '1000'
  menu.style.minWidth = '180px'
  
  if (currentTheme.value === 'dark') {
    menu.style.background = 'rgba(15, 23, 42, 0.95)'
    menu.style.backdropFilter = 'blur(12px)'
    menu.style.border = '1px solid rgba(255, 255, 255, 0.1)'
    menu.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
    menu.style.color = 'white'
  } else if (currentTheme.value === 'light') {
    menu.style.background = 'rgba(255, 255, 255, 0.95)'
    menu.style.backdropFilter = 'blur(12px)'
    menu.style.border = '1px solid rgba(0, 0, 0, 0.1)'
    menu.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    menu.style.color = '#1e293b'
  } else if (currentTheme.value === 'cyberpunk') {
    menu.style.background = 'rgba(13, 2, 33, 0.95)'
    menu.style.backdropFilter = 'blur(12px)'
    menu.style.border = '1px solid rgba(255, 44, 240, 0.3)'
    menu.style.boxShadow = '0 0 15px rgba(255, 44, 240, 0.3)'
    menu.style.color = 'white'
  } else {
    menu.style.background = 'rgba(236, 252, 235, 0.8)'
    menu.style.backdropFilter = 'blur(12px)'
    menu.style.border = '1px solid oklch(80% 0.08 145)'
    menu.style.boxShadow = '0 1px 5px rgba(0, 128, 0, 0.1)'
    menu.style.color = '#1e293b'
  }
  
  const createMenuItem = (text, icon, onClick) => {
    const item = document.createElement('div')
    item.className = 'tab-context-menu-item'
    item.style.padding = '10px 16px'
    item.style.cursor = 'pointer'
    item.style.fontSize = '14px'
    item.style.display = 'flex'
    item.style.alignItems = 'center'
    item.style.transition = 'all 0.2s ease'
    
    const iconElement = document.createElement('i')
    iconElement.className = icon
    iconElement.style.marginRight = '10px'
    iconElement.style.fontSize = '14px'
    iconElement.style.width = '16px'
    iconElement.style.textAlign = 'center'
    
    const textElement = document.createElement('span')
    textElement.textContent = text
    
    item.appendChild(iconElement)
    item.appendChild(textElement)
    
    item.addEventListener('click', onClick)
    item.addEventListener('mouseover', () => {
      if (currentTheme.value === 'dark') {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
      } else if (currentTheme.value === 'light') {
        item.style.backgroundColor = 'rgba(241, 245, 249, 0.8)'
      } else if (currentTheme.value === 'cyberpunk') {
        item.style.backgroundColor = 'rgba(255, 44, 240, 0.1)'
      } else {
        item.style.backgroundColor = 'rgba(255, 44, 240, 0.1)'
      }
    })
    item.addEventListener('mouseout', () => {
      item.style.backgroundColor = 'transparent'
    })
    return item
  }
  
  // 刷新当前页
  const refreshItem = createMenuItem('刷新当前页', 'fas fa-sync-alt', () => {
    const currentPath = tab.path
    tabsStore.switchTab(currentPath)
    menuStore.expandMenuByPath(currentPath) // 展开对应菜单
    document.body.removeChild(menu)
  })
  menu.appendChild(refreshItem)
  
  // 如果标签可关闭，添加关闭选项
  if (tab.closable) {
    const closeItem = createMenuItem('关闭标签', 'fas fa-times', () => {
      tabsStore.closeTab(tab.path)
      document.body.removeChild(menu)
    })
    menu.appendChild(closeItem)
  }
  
  // 关闭其他标签
  const closeOthersItem = createMenuItem('关闭其他标签', 'fas fa-times-circle', () => {
    tabsStore.closeOtherTabs(tab.path)
    document.body.removeChild(menu)
  })
  menu.appendChild(closeOthersItem)
  
  // 关闭所有标签
  const closeAllItem = createMenuItem('关闭所有标签', 'fas fa-trash-alt', () => {
    tabsStore.closeAllTabs()
    document.body.removeChild(menu)
  })
  menu.appendChild(closeAllItem)
  
  document.body.appendChild(menu)
  
  // 点击其他地方关闭菜单
  const closeMenu = () => {
    if (document.body.contains(menu)) {
      document.body.removeChild(menu)
    }
    document.removeEventListener('click', closeMenu)
  }
  setTimeout(() => {
    document.addEventListener('click', closeMenu)
  }, 0)
}
</script>

<template>
  <div 
    class="tabs-nav" 
    :class="{
      'tabs-nav-dark': currentTheme === 'dark',
      'tabs-nav-light': currentTheme === 'light',
      'tabs-nav-cyber': currentTheme === 'cyberpunk',
      'tabs-nav-green': currentTheme === 'green'
    }"
  >
    <div class="tabs-wrapper overflow-x-auto">
      <TransitionGroup 
        :name="`tab-${currentTheme}`" 
        tag="div" 
        class="tabs-list flex h-full relative"
        css-mode
        :css="true"
        appear
      >
        <div
          v-for="tab in tabs"
          :key="tab.path"
          class="tab cursor-pointer whitespace-nowrap transition-all duration-300"
          :class="[
            activeTab === tab.path 
              ? `tab-active-${currentTheme}` 
              : `tab-inactive-${currentTheme}`
          ]"
          @click="switchTab(tab.path)"
          @contextmenu="handleContextMenu($event, tab)"
        >
          <i 
            :class="[
              getTabIcon(tab.path),
              {
                'tab-icon-dark': currentTheme === 'dark',
                'tab-icon-light': currentTheme === 'light',
                'tab-icon-cyber': currentTheme === 'cyberpunk',
                'tab-icon-green': currentTheme === 'green'
              }
            ]" 
            class="tab-icon flex-shrink-0 flex items-center justify-center"
          ></i>
          <span class="tab-title">{{ tab.title }}</span>
          <button
            v-if="tab.closable"
            class="ml-2 close-btn"
            :class="{
              'close-btn-dark': currentTheme === 'dark',
              'close-btn-light': currentTheme === 'light',
              'close-btn-cyber': currentTheme === 'cyberpunk',
              'close-btn-green': currentTheme === 'green'
            }"
            @click="closeTab($event, tab.path)"
          >
            <i class="fa-solid fa-xmark w-3 h-3 flex items-center justify-center"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
/* 基本样式 */
.tabs-nav {
  height: 44px;
  display: flex;
  align-items: center;
}

/* 深色主题 */
.tabs-nav-dark {
  background: rgba(15, 23, 42, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* 明亮主题 */
.tabs-nav-light {
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 赛博朋克主题 */
.tabs-nav-cyber {
  background: rgba(13, 2, 33, 0.7);
  border-bottom: 1px solid rgba(255, 44, 240, 0.3);
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.2);
}

/* 绿色主题 */
.tabs-nav-green {
  background: rgba(236, 252, 235, 0.8);
  border-bottom: 1px solid oklch(80% 0.08 145);
  box-shadow: 0 1px 5px rgba(0, 128, 0, 0.1);
}

.tabs-wrapper {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
  -webkit-transform: translateZ(0); /* 启用硬件加速 */
  transform: translateZ(0);
  backface-visibility: hidden; /* 防止 3D 变换的背面闪烁 */
  perspective: 1000px; /* 提供 3D 空间 */
  position: relative; /* 添加相对定位作为绝对定位的参考 */
}

/* 滚动条样式 - 深色主题 */
.tabs-nav-dark .tabs-wrapper::-webkit-scrollbar {
  height: 3px;
}

.tabs-nav-dark .tabs-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(59, 130, 246, 0.5);
  border-radius: 1.5px;
}

.tabs-nav-dark .tabs-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(59, 130, 246, 0.8);
}

/* 滚动条样式 - 明亮主题 */
.tabs-nav-light .tabs-wrapper::-webkit-scrollbar {
  height: 3px;
}

.tabs-nav-light .tabs-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(59, 130, 246, 0.3);
  border-radius: 1.5px;
}

.tabs-nav-light .tabs-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(59, 130, 246, 0.5);
}

/* 滚动条样式 - 赛博朋克主题 */
.tabs-nav-cyber .tabs-wrapper::-webkit-scrollbar {
  height: 3px;
}

.tabs-nav-cyber .tabs-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(255, 44, 240, 0.5);
  border-radius: 1.5px;
}

.tabs-nav-cyber .tabs-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 44, 240, 0.8);
}

/* 滚动条样式 - 绿色主题 */
.tabs-nav-green .tabs-wrapper::-webkit-scrollbar {
  height: 3px;
}

.tabs-nav-green .tabs-wrapper::-webkit-scrollbar-thumb {
  background-color: oklch(50% 0.15 145, 0.5);
  border-radius: 1.5px;
}

.tabs-nav-green .tabs-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: oklch(40% 0.18 145, 0.7);
}

.tabs-list {
  height: 100%;
  position: relative;
  display: flex;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  overflow: visible; /* 确保动画不被裁剪 */
  min-height: 44px;
  width: 100%; /* 确保占满容器宽度 */
}

.tab {
  height: 100%;
  position: relative;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  transform-origin: center center; /* 确保缩放动画从中心开始 */
}

/* 标签底部指示线 */
.tab::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  transition: width 0.3s ease;
}

/* 深色主题标签 */
.tab-inactive-dark {
  color: rgba(255, 255, 255, 0.7);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.tab-inactive-dark::before {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.tab-inactive-dark:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.tab-inactive-dark:hover::before {
  width: 100%;
}

.tab-active-dark {
  background: rgba(59, 130, 246, 0.15);
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.tab-active-dark::before {
  width: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

/* 明亮主题标签 */
.tab-inactive-light {
  color: #64748b;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.tab-inactive-light::before {
  background: linear-gradient(90deg, #2563eb, #4f46e5);
}

.tab-inactive-light:hover {
  background: rgba(241, 245, 249, 0.8);
  color: #1e293b;
}

.tab-inactive-light:hover::before {
  width: 100%;
}

.tab-active-light {
  background: rgba(59, 130, 246, 0.1);
  color: #1e293b;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.tab-active-light::before {
  width: 100%;
  background: linear-gradient(90deg, #2563eb, #4f46e5);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

/* 赛博朋克主题标签 */
.tab-inactive-cyberpunk {
  color: rgba(255, 255, 255, 0.7);
  border-right: 1px solid rgba(255, 44, 240, 0.1);
}

.tab-inactive-cyberpunk::before {
  background: linear-gradient(90deg, #ff2cf0, #00eeff);
}

.tab-inactive-cyberpunk:hover {
  background: rgba(255, 44, 240, 0.1);
  color: white;
}

.tab-inactive-cyberpunk:hover::before {
  width: 100%;
}

.tab-active-cyberpunk {
  background: rgba(255, 44, 240, 0.15);
  color: white;
  border-right: 1px solid rgba(255, 44, 240, 0.1);
}

.tab-active-cyberpunk::before {
  width: 100%;
  background: linear-gradient(90deg, #ff2cf0, #00eeff);
  box-shadow: 0 0 8px rgba(255, 44, 240, 0.5);
}

/* 绿色主题标签 */
.tab-inactive-green {
  color: oklch(30% 0.06 145);
  border-right: 1px solid oklch(80% 0.08 145, 0.3);
}

.tab-inactive-green::before {
  background: linear-gradient(90deg, oklch(40% 0.18 145), oklch(45% 0.15 170));
}

.tab-inactive-green:hover {
  background: oklch(88% 0.06 148, 0.5);
  color: oklch(15% 0.05 145);
}

.tab-inactive-green:hover::before {
  width: 100%;
}

.tab-active-green {
  background: oklch(88% 0.06 148, 0.7);
  color: oklch(15% 0.05 145);
  border-right: 1px solid oklch(80% 0.08 145, 0.3);
}

.tab-active-green::before {
  width: 100%;
  background: linear-gradient(90deg, oklch(40% 0.18 145), oklch(45% 0.15 170));
  box-shadow: 0 0 8px rgba(0, 128, 0, 0.3);
}

/* 标签图标样式 */
.tab-icon {
  width: 14px;
  height: 14px;
  font-size: 13px;
  transition: all 0.3s ease;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: -0.5px; /* 微调垂直对齐 */
}

/* 深色主题图标 */
.tab-inactive-dark .tab-icon {
  color: rgba(255, 255, 255, 0.7);
}

.tab-active-dark .tab-icon {
  color: white;
}

/* 明亮主题图标 */
.tab-inactive-light .tab-icon {
  color: #64748b;
}

.tab-active-light .tab-icon {
  color: #1e293b;
}

/* 赛博朋克主题图标 */
.tab-inactive-cyberpunk .tab-icon {
  color: rgba(255, 255, 255, 0.7);
}

.tab-active-cyberpunk .tab-icon {
  color: white;
}

/* 绿色主题图标 */
.tab-inactive-green .tab-icon {
  color: oklch(30% 0.06 145);
}

.tab-active-green .tab-icon {
  color: oklch(15% 0.05 145);
}

.tab-title {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* 关闭按钮 */
.close-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn-dark {
  color: rgba(255, 255, 255, 0.7);
}

.close-btn-dark:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  opacity: 1;
  transform: scale(1.1);
}

.close-btn-light {
  color: #64748b;
}

.close-btn-light:hover {
  background: rgba(100, 116, 139, 0.2);
  color: #1e293b;
  opacity: 1;
  transform: scale(1.1);
}

.close-btn-cyber {
  color: rgba(255, 255, 255, 0.7);
}

.close-btn-cyber:hover {
  background: rgba(255, 44, 240, 0.3);
  color: white;
  opacity: 1;
  transform: scale(1.1);
}

/* 绿色主题关闭按钮 */
.close-btn-green {
  color: oklch(30% 0.06 145);
}

.close-btn-green:hover {
  background: oklch(80% 0.08 145, 0.4);
  color: oklch(15% 0.05 145);
  opacity: 1;
  transform: scale(1.1);
}

/* 右键菜单动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-context-menu {
  animation: fadeIn 0.2s ease-out;
}

/* 标签关闭动画 - 深色主题 */
.tab-dark-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  z-index: 1; /* 确保进入的标签位于顶层 */
  max-width: 300px;
  will-change: transform, opacity;
}

.tab-dark-enter-from {
  opacity: 0;
  transform: translateX(10px) scale(0.95);
  transform-origin: left center;
}

.tab-dark-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  position: absolute;
  max-width: 300px;
  z-index: 0;
  will-change: transform, opacity;
}

.tab-dark-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.tab-dark-move {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  will-change: transform;
}

/* 标签关闭动画 - 明亮主题 */
.tab-light-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  z-index: 1; /* 确保进入的标签位于顶层 */
  max-width: 300px;
  will-change: transform, opacity;
}

.tab-light-enter-from {
  opacity: 0;
  transform: translateX(10px) scale(0.95);
  transform-origin: left center;
}

.tab-light-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  position: absolute;
  max-width: 300px;
  z-index: 0;
  will-change: transform, opacity;
}

.tab-light-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.tab-light-move {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  will-change: transform;
}

/* 标签关闭动画 - 赛博朋克主题 */
.tab-cyberpunk-enter-active {
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 1; /* 确保进入的标签位于顶层 */
  max-width: 300px;
  will-change: transform, opacity, filter;
}

.tab-cyberpunk-enter-from {
  opacity: 0;
  transform: translateX(10px) scale(0.9);
  transform-origin: left center;
  filter: brightness(1.2);
}

.tab-cyberpunk-leave-active {
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: absolute;
  max-width: 300px;
  z-index: 0;
  will-change: transform, opacity, filter;
  overflow: hidden;
}

.tab-cyberpunk-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(3deg);
  filter: brightness(1.5) saturate(1.5);
}

.tab-cyberpunk-move {
  transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  will-change: transform;
}

/* 标签关闭的闪光效果 - 赛博朋克主题 */
@keyframes neonFlash {
  0% { box-shadow: 0 0 5px rgba(255, 44, 240, 0.3), 0 0 8px rgba(255, 44, 240, 0.2); }
  35% { box-shadow: 0 0 15px rgba(255, 44, 240, 0.8), 0 0 20px rgba(0, 238, 255, 0.6); }
  70% { box-shadow: 0 0 10px rgba(255, 44, 240, 0.5), 0 0 15px rgba(0, 238, 255, 0.4); }
  100% { box-shadow: 0 0 5px rgba(255, 44, 240, 0.3), 0 0 8px rgba(255, 44, 240, 0.2); }
}

.tab-cyberpunk-leave-active::before {
  animation: neonFlash 0.35s ease-out;
  width: 100%; /* 确保闪光效果覆盖整个标签 */
}

/* 标签关闭动画 - 绿色主题 */
.tab-green-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  z-index: 1;
  max-width: 300px;
  will-change: transform, opacity;
}

.tab-green-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transform-origin: top center;
}

.tab-green-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  position: absolute;
  max-width: 300px;
  z-index: 0;
  will-change: transform, opacity;
}

.tab-green-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.tab-green-move {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  will-change: transform;
}

/* 标签关闭的闪光效果 - 绿色主题 */
@keyframes greenGlow {
  0% { box-shadow: 0 0 5px rgba(0, 128, 0, 0.2), 0 0 8px rgba(0, 128, 0, 0.1); }
  50% { box-shadow: 0 0 10px rgba(0, 128, 0, 0.4), 0 0 15px rgba(0, 128, 0, 0.2); }
  100% { box-shadow: 0 0 5px rgba(0, 128, 0, 0.2), 0 0 8px rgba(0, 128, 0, 0.1); }
}

.tab-green-leave-active::before {
  animation: greenGlow 0.35s ease-out;
  width: 100%;
}

/* 图标垂直对齐修正 */
.close-btn i {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style> 