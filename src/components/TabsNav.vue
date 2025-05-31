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
  menu.className = 'tab-context-menu'
  menu.style.position = 'fixed'
  menu.style.top = `${e.clientY}px`
  menu.style.left = `${e.clientX}px`
  menu.style.backgroundColor = 'white'
  menu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
  menu.style.borderRadius = '4px'
  menu.style.padding = '8px 0'
  menu.style.zIndex = '1000'
  
  const createMenuItem = (text, onClick) => {
    const item = document.createElement('div')
    item.className = 'tab-context-menu-item'
    item.textContent = text
    item.style.padding = '8px 16px'
    item.style.cursor = 'pointer'
    item.style.fontSize = '14px'
    item.addEventListener('click', onClick)
    item.addEventListener('mouseover', () => {
      item.style.backgroundColor = '#f3f4f6'
    })
    item.addEventListener('mouseout', () => {
      item.style.backgroundColor = 'transparent'
    })
    return item
  }
  
  // 刷新当前页
  const refreshItem = createMenuItem('刷新当前页', () => {
    const currentPath = tab.path
    tabsStore.switchTab(currentPath)
    document.body.removeChild(menu)
  })
  menu.appendChild(refreshItem)
  
  // 如果标签可关闭，添加关闭选项
  if (tab.closable) {
    const closeItem = createMenuItem('关闭标签', () => {
      tabsStore.closeTab(tab.path)
      document.body.removeChild(menu)
    })
    menu.appendChild(closeItem)
  }
  
  // 关闭其他标签
  const closeOthersItem = createMenuItem('关闭其他标签', () => {
    tabsStore.closeOtherTabs(tab.path)
    document.body.removeChild(menu)
  })
  menu.appendChild(closeOthersItem)
  
  // 关闭所有标签
  const closeAllItem = createMenuItem('关闭所有标签', () => {
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
  <div class="tabs-nav bg-white border-b border-gray-200">
    <div class="tabs-wrapper overflow-x-auto">
      <div class="tabs-list flex">
        <div
          v-for="tab in tabs"
          :key="tab.path"
          class="tab flex items-center px-4 py-2 cursor-pointer border-r border-gray-200 whitespace-nowrap"
          :class="{ 'tab-active': activeTab === tab.path }"
          @click="switchTab(tab.path)"
          @contextmenu="handleContextMenu($event, tab)"
        >
          <span>{{ tab.title }}</span>
          <button
            v-if="tab.closable"
            class="ml-2 text-gray-400 hover:text-gray-600"
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
  height: 40px;
  display: flex;
  align-items: center;
}

.tabs-wrapper {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
}

.tabs-wrapper::-webkit-scrollbar {
  height: 4px;
}

.tabs-wrapper::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 2px;
}

.tabs-list {
  height: 100%;
}

.tab {
  height: 100%;
  transition: all 0.2s;
}

.tab-active {
  background-color: #f9fafb;
  border-bottom: 2px solid #3b82f6;
  font-weight: 500;
}
</style> 