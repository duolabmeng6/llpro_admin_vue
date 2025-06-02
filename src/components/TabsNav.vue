<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
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

// 添加滚动相关的ref
const tabsWrapperRef = ref(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(false)
const isScrolling = ref(false)

// 检查滚动状态
const checkScrollPosition = () => {
  if (!tabsWrapperRef.value) return
  
  const { scrollLeft, scrollWidth, clientWidth } = tabsWrapperRef.value
  
  // 显示左箭头条件：已经滚动了一定距离
  showLeftArrow.value = scrollLeft > 0
  
  // 显示右箭头条件：还有内容可以向右滚动
  showRightArrow.value = scrollLeft + clientWidth < scrollWidth - 10 // 添加一点余量
}

// 向左滚动
const scrollLeft = () => {
  if (!tabsWrapperRef.value) return
  
  isScrolling.value = true
  const scrollAmount = tabsWrapperRef.value.clientWidth / 2
  
  tabsWrapperRef.value.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  })
  
  // 滚动完成后更新箭头状态
  setTimeout(() => {
    isScrolling.value = false
    checkScrollPosition()
  }, 300)
}

// 向右滚动
const scrollRight = () => {
  if (!tabsWrapperRef.value) return
  
  isScrolling.value = true
  const scrollAmount = tabsWrapperRef.value.clientWidth / 2
  
  tabsWrapperRef.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
  
  // 滚动完成后更新箭头状态
  setTimeout(() => {
    isScrolling.value = false
    checkScrollPosition()
  }, 300)
}

// 滚动到激活的标签
const scrollToActiveTab = () => {
  if (!tabsWrapperRef.value) return
  
  const activeTabElement = tabsWrapperRef.value.querySelector('.tab-active')
  if (!activeTabElement) return
  
  // 计算需要滚动的位置
  const tabRect = activeTabElement.getBoundingClientRect()
  const wrapperRect = tabsWrapperRef.value.getBoundingClientRect()
  
  // 检查标签是否在可视区域内
  const isVisible = (
    tabRect.left >= wrapperRect.left &&
    tabRect.right <= wrapperRect.right
  )
  
  if (!isVisible) {
    // 计算滚动位置，使激活标签居中
    const scrollCenter = activeTabElement.offsetLeft - (wrapperRect.width / 2) + (tabRect.width / 2)
    
    tabsWrapperRef.value.scrollTo({
      left: Math.max(0, scrollCenter),
      behavior: 'smooth'
    })
    
    // 滚动后更新箭头状态
    setTimeout(checkScrollPosition, 300)
  }
}

// 监听activeTab变化，滚动到活动标签
watch(() => activeTab.value, (newPath) => {
  if (newPath) {
    // 当活动标签改变时，确保滚动到该标签
    setTimeout(scrollToActiveTab, 10)
  }
})

// 监听tabs变化，如果有新增标签，滚动到最右侧
watch(() => tabs.value.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    // 如果标签数量增加，滚动到最右侧
    setTimeout(() => {
      if (tabsWrapperRef.value) {
        // 滚动到最右侧
        tabsWrapperRef.value.scrollLeft = tabsWrapperRef.value.scrollWidth
        // 更新滚动箭头状态
        checkScrollPosition()
      }
    }, 10)
  }
})

// 监听标签变化和窗口大小变化
onMounted(() => {
  // 初始检查
  setTimeout(() => {
    checkScrollPosition()
    // 初始滚动到激活标签
    scrollToActiveTab()
  }, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkScrollPosition)
  
  // 监听滚动事件
  if (tabsWrapperRef.value) {
    tabsWrapperRef.value.addEventListener('scroll', checkScrollPosition)
  }
})

// 监听activeTab变化，滚动到活动标签
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScrollPosition)
  
  if (tabsWrapperRef.value) {
    tabsWrapperRef.value.removeEventListener('scroll', checkScrollPosition)
  }
})

// 切换标签时滚动到激活的标签
const switchTab = (path) => {
  tabsStore.switchTab(path)
  
  // 自动展开对应的左侧菜单
  menuStore.expandMenuByPath(path)
  
  // 滚动到激活的标签
  setTimeout(scrollToActiveTab, 10)
}

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
  <div class="tabs-nav glass-morphism relative">
    <!-- 左侧导航箭头 -->
    <button 
      v-show="showLeftArrow"
      class="tab-scroll-button tab-scroll-left glass-morphism"
      @click="scrollLeft"
      :disabled="isScrolling"
    >
      <i class="fas fa-chevron-left"></i>
    </button>
    
    <div 
      ref="tabsWrapperRef"
      class="tabs-wrapper overflow-x-auto"
      @scroll="checkScrollPosition"
    >
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
    
    <!-- 右侧导航箭头 -->
    <button 
      v-show="showRightArrow"
      class="tab-scroll-button tab-scroll-right glass-morphism"
      @click="scrollRight"
      :disabled="isScrolling"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
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
  overflow: visible;
}

.tabs-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.tabs-wrapper::-webkit-scrollbar {
  height: 0;
  width: 0;
  background: transparent;
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

/* 导航按钮样式 */
.tab-scroll-button {
  position: absolute;
  top: 0;
  width: 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-secondary);
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  opacity: 0.9;
  z-index: 10;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.tab-scroll-button:hover {
  opacity: 1;
  background-color: var(--color-bg-tertiary);
}

.tab-scroll-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-scroll-left {
  left: 0;
  border-right: 1px solid var(--color-border);
  box-shadow: 2px 0 5px var(--color-shadow);
}

.tab-scroll-right {
  right: 0;
  border-left: 1px solid var(--color-border);
  box-shadow: -2px 0 5px var(--color-shadow);
}
</style> 