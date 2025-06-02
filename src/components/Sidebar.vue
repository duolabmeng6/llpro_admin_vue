<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '../stores/tabs'
import { useThemeStore } from '../stores/theme'
import { useMenuStore } from '../stores/menu'
import { menuConfig } from '../config/menu'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle'])
const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()

// 当前主题
const currentTheme = computed(() => themeStore.currentTheme)

// 监听侧边栏状态变化，当收起时关闭所有展开的子菜单
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    menuStore.collapseAllMenus()
  } else {
    // 当展开侧边栏时，重置临时展开状态
    menuStore.setTempExpanded(false)
  }
}, { immediate: true })

// 添加键盘快捷键监听
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // 同步侧边栏状态到store
  menuStore.setSidebarExpanded(props.isOpen)
})

// 处理键盘快捷键
const handleKeydown = (event) => {
  // Alt + S 切换侧边栏
  if (event.altKey && event.key === 's') {
    toggleSidebar()
    event.preventDefault()
  }
}

// 切换菜单展开状态
const toggleSubmenu = (menuId, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation();
  }
  
  // 无论侧边栏是实际展开还是临时展开，都使用相同的切换逻辑
  menuStore.toggleMenu(menuId);
}

// 处理侧边栏鼠标悬停
const expandTimer = ref(null); // 用于存储定时器ID

const handleSidebarHover = (isHovering, event) => {
  // 只有当侧边栏处于收缩状态时，才应用临时展开
  if (!props.isOpen) {
    if (isHovering) {
      // 设置200ms延迟再展开，避免鼠标快速经过时的闪烁
      clearTimeout(expandTimer.value);
      expandTimer.value = setTimeout(() => {
        menuStore.setTempExpanded(true);
      }, 200);
    } else {
      // 鼠标移出时立即清除定时器，防止延迟展开
      clearTimeout(expandTimer.value);
      // 添加小延迟关闭，防止鼠标在菜单项之间移动时的闪烁
      setTimeout(() => {
        menuStore.setTempExpanded(false);
      }, 100);
    }
  }
}

// 阻止按钮引起的鼠标悬停扩展
const preventExpand = () => {
  // 清除展开定时器
  clearTimeout(expandTimer.value);
  
  // 如果侧边栏当前已经临时展开，立即关闭它
  if (!props.isOpen && menuStore.isTempExpanded) {
    menuStore.setTempExpanded(false);
  }
}

// 在组件卸载时清除定时器
onBeforeUnmount(() => {
  clearTimeout(expandTimer.value);
  // 清除所有菜单定时器
  menuStore.clearAllMenuTimers();
});

// 判断子菜单是否激活
const isSubmenuActive = (path, childItem) => {
  // 特殊处理外部链接 - 检查URL路径是否是/external/开头，如果是，比较ID
  if (route.path.startsWith('/external/')) {
    const linkId = route.path.split('/')[2]
    return childItem.id === linkId
  }
  // 否则使用常规路径匹配
  return route.path === path
}

// 判断菜单项是否激活
const isMenuActive = (menuItem) => {
  // 如果是一级菜单且有子菜单，检查任何子菜单是否匹配当前路由
  if (menuItem.children && menuItem.children.length > 0) {
    // 特殊处理外部链接
    if (route.path.startsWith('/external/')) {
      const linkId = route.path.split('/')[2]
      return menuItem.children.some(child => child.id === linkId)
    }
    return menuItem.children.some(child => route.path === child.path)
  }
  // 否则直接检查路径是否匹配
  return route.path === menuItem.path
}

// 切换侧边栏
const toggleSidebar = () => {
  menuStore.toggleSidebar()
  emit('toggle')
}

// 点击菜单项时，添加或切换到对应的选项卡
const handleMenuClick = (menuItem, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }
  
  const path = menuItem.path
  
  // 如果已经在当前路由，不做任何操作
  if (route.path === path && !menuItem.external) return
  
  // 处理外部链接
  if (menuItem.external && menuItem.externalUrl) {
    // 判断是否在新窗口打开
    if (menuItem.newWindow) {
      // 在新窗口打开链接
      window.open(menuItem.externalUrl, '_blank')
    } else {
      // 使用更优雅的URL形式 - 直接导航到外部链接的路由
      router.push(`/external/${menuItem.id}`)
    }
  } else {
    // 导航到指定路径
    router.push(path)
  }
}

// 计算菜单项是否有子菜单
const hasChildren = (menuItem) => {
  return menuItem.children && menuItem.children.length > 0
}

// 计算菜单是否展开
const isExpanded = (menuId) => {
  return menuStore.isMenuExpanded(menuId)
}

// 计算是否显示菜单文本（在收起状态下只显示图标，除非临时展开）
const showMenuText = computed(() => props.isOpen || menuStore.isTempExpanded)

// 计算侧边栏宽度，不再使用过渡动画依赖于这个值的变化
const sidebarWidth = computed(() => {
  if (props.isOpen || menuStore.isTempExpanded) {
    return 'w-64';
  }
  return 'w-16';
})

// 计算内容区域样式
const contentStyle = computed(() => {
  return props.isOpen || menuStore.isTempExpanded 
    ? { width: '16rem' } 
    : { width: '4rem' };
})

// 计算菜单项样式
const getMenuItemStyle = (isCollapsed) => {
  if (isCollapsed) {
    return {
      padding: '0.625rem 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };
  }
  return {
    padding: '0.625rem 0.75rem'
  };
}

// 计算图标容器样式
const getIconContainerStyle = (isCollapsed) => {
  if (isCollapsed) {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    };
  }
  return {};
}
</script>

<template>
  <aside
    class="sidebar-container flex-shrink-0 fixed h-full z-20 glass-morphism overflow-hidden"
    :style="contentStyle"
    @mouseenter="handleSidebarHover(true, $event)"
    @mouseleave="handleSidebarHover(false, $event)"
  >
    <div class="p-4 flex items-center justify-between sidebar-header border-b border-subtle">
      <div class="flex-1 flex justify-center overflow-hidden">
        <transition name="fade" mode="out-in">
          <h1 
            v-if="showMenuText"
            key="full-title"
            class="text-xl font-bold truncate sidebar-title gradient-text"
          >
            LL Pro 系统
          </h1>
          <!-- 收缩状态显示的Logo -->
          <div v-else key="logo" class="logo-container w-8 h-8 flex items-center justify-center">
            <span class="text-xl font-bold gradient-text">L</span>
          </div>
        </transition>
      </div>
      <button
        class="p-2 rounded-md sidebar-toggle-btn text-muted hover:bg-tertiary flex-shrink-0"
        @click="toggleSidebar"
        @mouseenter="preventExpand"
        :title="isOpen ? '收起侧边栏 (Alt+S)' : '展开侧边栏 (Alt+S)'"
      >
        <span class="sr-only">{{ isOpen ? '收起侧边栏' : '展开侧边栏' }}</span>
        <i :class="[isOpen ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right']" class="w-5 h-5 flex items-center justify-center"></i>
      </button>
    </div>
    
    <nav class="mt-5 px-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
      <div 
        v-for="menuItem in menuConfig" 
        :key="menuItem.id" 
        class="mb-3 relative"
      >
        <!-- 一级菜单 -->
        <div
          class="menu-item-wrapper"
          :class="[isMenuActive(menuItem) ? 'active' : 'inactive']"
          @click="hasChildren(menuItem) ? toggleSubmenu(menuItem.id, $event) : handleMenuClick(menuItem, $event)"
        >
          <div class="menu-item-expanded" v-if="showMenuText">
            <div class="icon-wrapper">
              <i :class="menuItem.icon"></i>
            </div>
            <span class="menu-title">{{ menuItem.title }}</span>
            <i 
              v-if="hasChildren(menuItem)"
              class="fa-solid fa-chevron-right expand-icon"
              :class="{ 'expanded': isExpanded(menuItem.id) }"
            ></i>
          </div>
          <div class="menu-item-collapsed" v-else>
            <div class="icon-wrapper">
              <i :class="menuItem.icon"></i>
            </div>
          </div>
        </div>
        
        <!-- 二级菜单 -->
        <div
          v-if="hasChildren(menuItem) && showMenuText"
          class="submenu-container"
          :class="[isExpanded(menuItem.id) ? 'expanded' : 'collapsed']"
        >
          <div
            v-for="childItem in menuItem.children"
            :key="childItem.id"
            class="submenu-item"
            :class="[isSubmenuActive(childItem.path, childItem) ? 'active' : 'inactive']"
            @click="handleMenuClick(childItem, $event)"
          >
            <div class="submenu-icon-wrapper" v-if="childItem.icon">
              <i :class="childItem.icon"></i>
            </div>
            <span class="submenu-title">{{ childItem.title }}</span>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
/* 侧边栏基础样式 */
.sidebar-container {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  box-shadow: 0 0 20px var(--color-shadow);
  color: var(--color-text-primary);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 侧边栏标题样式 */
.gradient-text {
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 5px var(--color-shadow);
}

/* Logo容器 */
.logo-container {
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  box-shadow: 0 0 10px var(--color-shadow);
}

/* 菜单项容器 */
.menu-item-wrapper {
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.menu-item-wrapper.active {
  background-color: var(--color-accent);
  color: white;
}

.menu-item-wrapper.inactive {
  color: var(--color-text-secondary);
}

.menu-item-wrapper.inactive:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* 展开状态的菜单项 */
.menu-item-expanded {
  display: flex;
  align-items: center;
  padding: 0.625rem 0.75rem;
}

/* 收缩状态的菜单项 */
.menu-item-collapsed {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.625rem 0;
}

/* 图标容器 */
.icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 菜单标题 */
.menu-title {
  flex: 1;
  margin-left: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 展开箭头 */
.expand-icon {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

/* 子菜单容器 */
.submenu-container {
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.submenu-container.expanded {
  max-height: 15rem;
  opacity: 1;
}

.submenu-container.collapsed {
  max-height: 0;
  opacity: 0;
}

/* 子菜单项 */
.submenu-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.5rem 0.5rem 2.5rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: background-color 0.3s ease, color 0.3s ease;
  margin-top: 0.25rem;
}

.submenu-item.active {
  background-color: var(--color-bg-tertiary);
  color: var(--color-accent);
}

.submenu-item.inactive {
  color: var(--color-text-secondary);
}

.submenu-item.inactive:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* 子菜单图标 */
.submenu-icon-wrapper {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

/* 子菜单标题 */
.submenu-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 滚动条样式 */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-thumb);
}
</style> 