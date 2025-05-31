<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '../stores/tabs'
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

// 菜单展开状态
const expandedMenus = ref({})

// 切换菜单展开状态
const toggleSubmenu = (menuId) => {
  expandedMenus.value[menuId] = !expandedMenus.value[menuId]
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
  emit('toggle')
}

// 点击菜单项时，添加或切换到对应的选项卡
const handleMenuClick = (path) => {
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
  return !!expandedMenus.value[menuId]
}

// 计算是否显示菜单文本（在收起状态下只显示图标）
const showMenuText = computed(() => props.isOpen)
</script>

<template>
  <aside
    class="bg-secondary-800 text-white flex-shrink-0 transition-all duration-300 flex flex-col"
    :class="[isOpen ? 'w-64' : 'w-16']"
  >
    <div class="p-4 flex items-center justify-between">
      <h1 class="text-xl font-bold truncate" v-if="showMenuText">LL Pro 管理系统</h1>
      <button
        class="p-2 rounded-md hover:bg-secondary-700 ml-auto"
        @click="toggleSidebar"
      >
        <span class="sr-only">{{ isOpen ? '收起侧边栏' : '展开侧边栏' }}</span>
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="isOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
    
    <nav class="mt-5 px-2 flex-1 overflow-y-auto">
      <div v-for="menuItem in menuConfig" :key="menuItem.id" class="mb-1">
        <!-- 一级菜单 -->
        <div
          class="group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer"
          :class="[
            isMenuActive(menuItem) 
              ? 'bg-secondary-900 text-white' 
              : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
          ]"
          @click="hasChildren(menuItem) ? toggleSubmenu(menuItem.id) : handleMenuClick(menuItem.path)"
        >
          <svg
            class="mr-3 h-6 w-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            v-html="menuItem.icon"
          ></svg>
          <span v-if="showMenuText" class="flex-1 truncate">{{ menuItem.title }}</span>
          
          <!-- 展开/收起箭头（仅当有子菜单时显示） -->
          <svg
            v-if="hasChildren(menuItem) && showMenuText"
            class="ml-auto h-5 w-5 transform transition-transform duration-200"
            :class="{ 'rotate-90': isExpanded(menuItem.id) }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        
        <!-- 二级菜单 -->
        <div
          v-if="hasChildren(menuItem)"
          class="mt-1 space-y-1 overflow-hidden transition-all duration-200"
          :class="[
            isExpanded(menuItem.id) ? 'max-h-60' : 'max-h-0',
            !showMenuText ? 'absolute left-16 top-auto bg-secondary-800 rounded-md shadow-lg z-10 w-48' : ''
          ]"
          :style="!showMenuText && isExpanded(menuItem.id) ? { top: '0px' } : {}"
        >
          <div
            v-for="childItem in menuItem.children"
            :key="childItem.id"
            class="group flex items-center pl-10 pr-2 py-2 text-sm font-medium rounded-md cursor-pointer"
            :class="[
              isSubmenuActive(childItem.path)
                ? 'bg-secondary-900 text-white'
                : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
            ]"
            @click="handleMenuClick(childItem.path)"
          >
            <span class="truncate">{{ childItem.title }}</span>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
/* 添加过渡效果 */
.max-h-0 {
  max-height: 0;
  overflow: hidden;
}

.max-h-60 {
  max-height: 15rem;
}
</style> 