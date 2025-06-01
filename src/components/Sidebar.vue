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
const handleMenuClick = (path, event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }
  
  // 如果已经在当前路由，不做任何操作
  if (route.path === path) return
  
  // 导航到指定路径
  router.push(path)
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
    class="sidebar-container flex-shrink-0 transition-all duration-300 flex flex-col fixed h-full z-20"
    :class="[
      sidebarWidth,
      currentTheme === 'dark' ? 'sidebar-dark' :
      currentTheme === 'light' ? 'sidebar-light' :
      'sidebar-cyber'
    ]"
    @mouseenter="handleSidebarHover(true)"
    @mouseleave="handleSidebarHover(false)"
  >
    <div class="p-4 flex items-center justify-between sidebar-header">
      <h1 
        v-if="showMenuText"
        class="text-xl font-bold truncate sidebar-title"
        :class="{
          'sidebar-title-dark': currentTheme === 'dark',
          'sidebar-title-light': currentTheme === 'light',
          'sidebar-title-cyber': currentTheme === 'cyberpunk'
        }"
      >
        LL Pro 系统
      </h1>
      <button
        v-if="props.isOpen || menuStore.isTempExpanded"
        class="p-2 rounded-md sidebar-toggle-btn transition-all duration-300"
        :class="[
          {
            'sidebar-toggle-dark': currentTheme === 'dark',
            'sidebar-toggle-light': currentTheme === 'light',
            'sidebar-toggle-cyber': currentTheme === 'cyberpunk'
          },
          'ml-auto'
        ]"
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
          :class="[
            isMenuActive(menuItem) 
              ? `menu-active-${currentTheme}` 
              : `menu-inactive-${currentTheme}`
          ]"
          @click="hasChildren(menuItem) ? toggleSubmenu(menuItem.id, $event) : handleMenuClick(menuItem.path, $event)"
        >
          <i 
            :class="[menuItem.icon, { 'mr-3': showMenuText }]" 
            class="h-6 w-6 flex-shrink-0 flex items-center justify-center transition-transform duration-300"
          ></i>
          <span 
            v-if="showMenuText" 
            class="flex-1 truncate flex items-center"
          >
            {{ menuItem.title }}
          </span>
          
          <!-- 展开/收起箭头（仅当有子菜单时显示） -->
          <i 
            v-if="hasChildren(menuItem) && showMenuText"
            class="fa-solid fa-chevron-right ml-auto transform transition-transform duration-300 flex items-center justify-center"
            :class="{ 'rotate-90': isExpanded(menuItem.id) }"
          ></i>
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
            class="group flex items-center pl-10 pr-2 py-2 text-sm font-medium rounded-lg cursor-pointer submenu-item transition-all duration-300"
            :class="[
              isSubmenuActive(childItem.path)
                ? `submenu-active-${currentTheme}`
                : `submenu-inactive-${currentTheme}`
            ]"
            @click="handleMenuClick(childItem.path, $event)"
          >
            <i 
              v-if="childItem.icon" 
              :class="childItem.icon" 
              class="mr-2 w-4 h-4 flex items-center justify-center"
            ></i>
            <span class="truncate">{{ childItem.title }}</span>
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
}

/* 深色主题侧边栏 */
.sidebar-dark {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  color: var(--color-text-primary);
}

.sidebar-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* 明亮主题侧边栏 */
.sidebar-light {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

/* 赛博朋克主题侧边栏 */
.sidebar-cyber {
  background: rgba(13, 2, 33, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 44, 240, 0.3);
  box-shadow: 0 0 15px rgba(255, 44, 240, 0.3);
  color: var(--color-text-primary);
}

/* 侧边栏标题样式 */
.sidebar-title-dark {
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 5px rgba(96, 165, 250, 0.5);
}

.sidebar-title-light {
  background: linear-gradient(90deg, #2563eb, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sidebar-title-cyber {
  background: linear-gradient(90deg, #ff2cf0, #00eeff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(255, 44, 240, 0.7);
}

/* 切换按钮样式 */
.sidebar-toggle-btn {
  position: relative;
  z-index: 20;
}

.sidebar-toggle-dark {
  color: #60a5fa;
}

.sidebar-toggle-dark:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  transform: scale(1.1);
}

.sidebar-toggle-light {
  color: #2563eb;
}

.sidebar-toggle-light:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: scale(1.1);
}

.sidebar-toggle-cyber {
  color: #ff2cf0;
  text-shadow: 0 0 5px rgba(255, 44, 240, 0.5);
}

.sidebar-toggle-cyber:hover {
  background-color: rgba(255, 44, 240, 0.15);
  color: #ff73f4;
  transform: scale(1.1);
}

/* 菜单项样式 - 深色主题 */
.menu-item {
  border-left: 2px solid transparent;
  transition: all 0.3s ease;
}

.menu-active-dark {
  background: rgba(59, 130, 246, 0.15);
  border-left: 2px solid #3b82f6;
  color: white;
}

.menu-active-dark i {
  color: #3b82f6;
}

.menu-inactive-dark {
  color: rgba(255, 255, 255, 0.7);
}

.menu-inactive-dark:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transform: translateX(2px);
}

/* 菜单项样式 - 明亮主题 */
.menu-active-light {
  background: rgba(59, 130, 246, 0.1);
  border-left: 2px solid #2563eb;
  color: #1e293b;
}

.menu-active-light i {
  color: #2563eb;
}

.menu-inactive-light {
  color: #64748b;
}

.menu-inactive-light:hover {
  background: rgba(241, 245, 249, 0.8);
  color: #1e293b;
  transform: translateX(2px);
}

/* 菜单项样式 - 赛博朋克主题 */
.menu-active-cyberpunk {
  background: rgba(255, 44, 240, 0.15);
  border-left: 2px solid #ff2cf0;
  color: white;
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.3);
}

.menu-active-cyberpunk i {
  color: #ff2cf0;
  text-shadow: 0 0 5px rgba(255, 44, 240, 0.7);
}

.menu-inactive-cyberpunk {
  color: rgba(255, 255, 255, 0.7);
}

.menu-inactive-cyberpunk:hover {
  background: rgba(255, 44, 240, 0.1);
  color: white;
  transform: translateX(2px);
}

/* 子菜单样式 - 深色主题 */
.submenu-active-dark {
  background: rgba(59, 130, 246, 0.1);
  color: white;
}

.submenu-inactive-dark {
  color: rgba(255, 255, 255, 0.6);
}

.submenu-inactive-dark:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

/* 子菜单样式 - 明亮主题 */
.submenu-active-light {
  background: rgba(59, 130, 246, 0.1);
  color: #1e293b;
}

.submenu-inactive-light {
  color: #64748b;
}

.submenu-inactive-light:hover {
  background: rgba(241, 245, 249, 0.8);
  color: #1e293b;
}

/* 子菜单样式 - 赛博朋克主题 */
.submenu-active-cyberpunk {
  background: rgba(255, 44, 240, 0.15);
  color: white;
}

.submenu-inactive-cyberpunk {
  color: rgba(255, 255, 255, 0.6);
}

.submenu-inactive-cyberpunk:hover {
  background: rgba(255, 44, 240, 0.1);
  color: white;
}

/* 图标垂直对齐修正 */
.menu-item i {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* 确保子菜单图标对齐 */
.submenu-item i {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style> 