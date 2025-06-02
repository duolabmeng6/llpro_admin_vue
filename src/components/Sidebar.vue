<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
const handleSidebarHover = (isHovering) => {
  // 只有当侧边栏处于收缩状态时，才应用临时展开
  if (!props.isOpen) {
    menuStore.setTempExpanded(isHovering);
  }
}

// 判断菜单项是否激活
const isMenuActive = (menuItem) => {
  // 如果是一级菜单且有子菜单，检查任何子菜单是否匹配当前路由
  if (menuItem.children && menuItem.children.length > 0) {
    return menuItem.children.some(child => route.path === child.path)
  }
  // 否则直接检查路径是否匹配
  return route.path === menuItem.path
}

// 判断子菜单是否激活
const isSubmenuActive = (path) => {
  return route.path === path
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

// 计算侧边栏宽度
const sidebarWidth = computed(() => {
  if (props.isOpen || menuStore.isTempExpanded) {
    return 'w-64';
  }
  return 'w-16';
})
</script>

<template>
  <aside
    class="sidebar-container flex-shrink-0 transition-all duration-300 flex flex-col fixed h-full z-20 glass-morphism"
    :class="sidebarWidth"
    @mouseenter="handleSidebarHover(true)"
    @mouseleave="handleSidebarHover(false)"
  >
    <div class="p-4 flex items-center justify-between sidebar-header border-b border-subtle">
      <h1 
        v-if="showMenuText"
        class="text-xl font-bold truncate sidebar-title gradient-text"
      >
        LL Pro 系统
      </h1>
      <button
        v-if="props.isOpen || menuStore.isTempExpanded"
        class="p-2 rounded-md sidebar-toggle-btn transition-all duration-300 text-muted hover:bg-tertiary ml-auto"
        @click="toggleSidebar"
        :title="isOpen ? '收起侧边栏 (Alt+S)' : '展开侧边栏 (Alt+S)'"
      >
        <span class="sr-only">{{ isOpen ? '收起侧边栏' : '展开侧边栏' }}</span>
        <i :class="[isOpen ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right']" class="w-6 h-6 flex items-center justify-center"></i>
      </button>
    </div>
    
    <nav class="mt-5 px-2 flex-1 overflow-y-auto scrollbar-thin">
      <div 
        v-for="menuItem in menuConfig" 
        :key="menuItem.id" 
        class="mb-3 relative"
      >
        <!-- 一级菜单 -->
        <div
          class="group flex items-center px-3 py-2.5 text-base font-medium rounded-lg cursor-pointer menu-item transition-all duration-300"
          :class="isMenuActive(menuItem) ? 'menu-active' : 'menu-inactive'"
          @click="hasChildren(menuItem) ? toggleSubmenu(menuItem.id, $event) : handleMenuClick(menuItem, $event)"
        >
          <div class="flex items-center w-full">
            <i 
              :class="[menuItem.icon, { 'mr-3': showMenuText }]" 
              class="h-5 w-5 flex-shrink-0 flex items-center justify-center transition-transform duration-300"
            ></i>
            <span 
              v-if="showMenuText" 
              class="flex-1 truncate"
            >
              {{ menuItem.title }}
            </span>
            
            <!-- 展开/收起箭头（仅当有子菜单时显示） -->
            <i 
              v-if="hasChildren(menuItem) && showMenuText"
              class="fa-solid fa-chevron-right ml-auto transform transition-transform duration-300 h-5 w-5 flex items-center justify-center"
              :class="{ 'rotate-90': isExpanded(menuItem.id) }"
            ></i>
          </div>
        </div>
        
        <!-- 二级菜单 -->
        <div
          v-if="hasChildren(menuItem) && showMenuText"
          class="mt-1 space-y-1 overflow-hidden transition-all duration-300"
          :class="[isExpanded(menuItem.id) ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0']"
        >
          <div
            v-for="childItem in menuItem.children"
            :key="childItem.id"
            class="group flex items-center pl-10 pr-2 py-2 text-sm font-medium rounded-lg cursor-pointer submenu-item transition-all duration-300 h-9"
            :class="isSubmenuActive(childItem.path) ? 'submenu-active' : 'submenu-inactive'"
            @click="handleMenuClick(childItem, $event)"
          >
            <div class="flex items-center w-full">
              <i 
                v-if="childItem.icon" 
                :class="childItem.icon" 
                class="mr-2 w-4 h-4 flex-shrink-0 flex items-center justify-center"
              ></i>
              <span class="truncate">{{ childItem.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
/* 侧边栏基础样式 */
.sidebar-container {
  transition: all 0.3s ease;
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

/* 菜单项样式 */
.menu-item {
  display: flex;
  align-items: center;
}

.menu-active {
  background-color: var(--color-accent);
  color: white;
}

.menu-inactive {
  color: var(--color-text-secondary);
}

.menu-inactive:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* 子菜单项样式 */
.submenu-item {
  display: flex;
  align-items: center;
}

.submenu-active {
  background-color: var(--color-bg-tertiary);
  color: var(--color-accent);
}

.submenu-inactive {
  color: var(--color-text-secondary);
}

.submenu-inactive:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
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