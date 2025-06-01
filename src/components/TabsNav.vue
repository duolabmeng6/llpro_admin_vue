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
  
  // 使用主题无关的样式类
  menu.className = 'tab-context-menu glass-morphism'
  
  menu.style.position = 'fixed'
  menu.style.top = `${e.clientY}px`
  menu.style.left = `${e.clientX}px`
  menu.style.borderRadius = '8px'
  menu.style.padding = '8px 0'
  menu.style.zIndex = '1000'
  menu.style.minWidth = '180px'
  menu.style.backdropFilter = 'blur(12px)'
  menu.style.boxShadow = '0 10px 25px -5px var(--color-shadow)'
  menu.style.border = '1px solid var(--color-border)'
  menu.style.color = 'var(--color-text-primary)'
  menu.style.backgroundColor = 'color-mix(in oklab, var(--color-bg-secondary) 95%, transparent)'
  
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
      item.style.backgroundColor = 'var(--color-bg-tertiary)'
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
  <div class="tabs-nav glass-morphism">
    <div class="tabs-wrapper overflow-x-auto">
      <TransitionGroup 
        name="tab-transition" 
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
              ? 'tab-active' 
              : 'tab-inactive'
          ]"
          @click="switchTab(tab.path)"
          @contextmenu="handleContextMenu($event, tab)"
        >
          <i 
            :class="getTabIcon(tab.path)" 
            class="tab-icon flex-shrink-0 flex items-center justify-center"
          ></i>
          <span class="tab-title">{{ tab.title }}</span>
          <button
            v-if="tab.closable"
            class="ml-2 close-btn"
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
/* 基础标签导航样式 */
.tabs-nav {
  width: 100%;
  height: 40px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.tabs-nav::-webkit-scrollbar {
  height: 0;
  width: 0;
  background: transparent;
}

.tabs-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.tabs-list {
  display: flex;
  height: 100%;
  position: relative;
}

/* 标签样式 */
.tab {
  padding: 0 16px;
  display: flex;
  align-items: center;
  height: 100%;
  transition: all 0.2s ease;
  position: relative;
  border-right: 1px solid var(--color-border);
  font-size: 14px;
}

.tab-active {
  background-color: var(--color-bg-secondary);
  color: var(--color-accent);
  box-shadow: inset 0 -2px 0 var(--color-accent);
}

.tab-inactive {
  color: var(--color-text-secondary);
  background-color: transparent;
}

.tab-inactive:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* 标签图标 */
.tab-icon {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  transition: all 0.3s ease;
}

/* 关闭按钮 */
.close-btn {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  opacity: 0.6;
  transition: all 0.2s ease;
  background-color: transparent;
}

.close-btn:hover {
  opacity: 1;
  background-color: var(--color-bg-tertiary);
}

.tab-active .close-btn {
  opacity: 0.8;
}

/* 标签切换动画 */
.tab-transition-enter-active,
.tab-transition-leave-active {
  transition: all 0.3s ease;
}

.tab-transition-enter-from,
.tab-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 上下文菜单样式通过JS设置，确保在不同主题下使用CSS变量 */
</style> 