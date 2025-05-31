<script setup>
import { computed } from 'vue'
import { useTabsStore } from '../stores/tabs'

const tabsStore = useTabsStore()
const tabs = computed(() => tabsStore.getTabs)
const activeTab = computed(() => tabsStore.getActiveTab)

// 切换标签
const switchTab = (path) => {
  tabsStore.switchTab(path)
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
  menu.className = 'tab-context-menu glass-morphism-light'
  menu.style.position = 'fixed'
  menu.style.top = `${e.clientY}px`
  menu.style.left = `${e.clientX}px`
  menu.style.borderRadius = '8px'
  menu.style.padding = '8px 0'
  menu.style.zIndex = '1000'
  menu.style.minWidth = '180px'
  menu.style.border = '1px solid rgba(255, 255, 255, 0.1)'
  menu.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
  
  const createMenuItem = (text, icon, onClick) => {
    const item = document.createElement('div')
    item.className = 'tab-context-menu-item'
    item.style.padding = '10px 16px'
    item.style.cursor = 'pointer'
    item.style.fontSize = '14px'
    item.style.color = 'white'
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
      item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
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
  <div class="tabs-nav glass-morphism-light border-b border-opacity-10 border-white">
    <div class="tabs-wrapper overflow-x-auto">
      <div class="tabs-list flex h-full">
        <div
          v-for="tab in tabs"
          :key="tab.path"
          class="tab flex items-center px-4 py-2 cursor-pointer whitespace-nowrap transition-all duration-300"
          :class="{ 'tab-active': activeTab === tab.path }"
          @click="switchTab(tab.path)"
          @contextmenu="handleContextMenu($event, tab)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <button
            v-if="tab.closable"
            class="ml-2 text-gray-400 hover:text-white close-btn"
            @click="closeTab($event, tab.path)"
          >
            <i class="fa-solid fa-xmark w-3 h-3 flex items-center justify-center"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-nav {
  height: 42px;
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.7);
}

.tabs-wrapper {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
}

.tabs-wrapper::-webkit-scrollbar {
  height: 3px;
}

.tabs-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.5);
  border-radius: 1.5px;
}

.tabs-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(99, 102, 241, 0.8);
}

.tabs-list {
  height: 100%;
}

.tab {
  height: 100%;
  position: relative;
  color: rgba(255, 255, 255, 0.7);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.tab::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-neon-blue), var(--color-neon-purple));
  transition: width 0.3s ease;
}

.tab:hover::before {
  width: 100%;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.tab-active {
  background: rgba(99, 102, 241, 0.15);
  color: white;
}

.tab-active::before {
  width: 100%;
  box-shadow: 0 0 8px var(--color-neon-blue);
}

.tab-title {
  position: relative;
  z-index: 1;
}

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

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
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
</style> 