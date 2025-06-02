<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { menuConfig } from '../config/menu'
import SearchInput from './SearchInput.vue'
import { useMenuStore } from '../stores/menu'

const menuStore = useMenuStore()
const router = useRouter()
const searchQuery = ref('')
const searchResults = ref([])
const showResults = ref(false)

// 扁平化菜单结构以便搜索
const flattenedMenu = computed(() => {
  const flattened = []
  
  // 递归函数处理嵌套菜单
  const processMenu = (items, parentTitle = '') => {
    items.forEach(item => {
      const menuItem = {
        id: item.id,
        title: item.title,
        path: item.path,
        icon: item.icon,
        fullTitle: parentTitle ? `${parentTitle} > ${item.title}` : item.title
      }
      
      flattened.push(menuItem)
      
      // 处理子菜单
      if (item.children && item.children.length > 0) {
        processMenu(item.children, menuItem.title)
      }
    })
  }
  
  processMenu(menuConfig)
  return flattened
})

// 搜索菜单
const searchMenu = (query) => {
  if (!query || query.trim() === '') {
    searchResults.value = []
    return
  }
  
  const normalizedQuery = query.toLowerCase().trim()
  
  // 过滤匹配菜单项
  searchResults.value = flattenedMenu.value.filter(item => 
    item.title.toLowerCase().includes(normalizedQuery) || 
    (item.fullTitle && item.fullTitle.toLowerCase().includes(normalizedQuery))
  )
  
  showResults.value = true
}

// 处理菜单项点击
const handleMenuItemClick = (item) => {
  // 如果有子菜单的父项被点击，展开该菜单
  menuStore.expandMenuByPath(item.path)
  
  // 导航到选中的路径
  router.push(item.path)
  
  // 关闭搜索结果
  showResults.value = false
  searchQuery.value = ''
}

// 处理搜索输入
const handleSearch = (query) => {
  searchMenu(query)
}

// 处理清除搜索
const handleClear = () => {
  searchResults.value = []
  showResults.value = false
}

// 点击外部时关闭结果
const handleClickOutside = (event) => {
  if (showResults.value && !event.target.closest('.menu-search-container')) {
    showResults.value = false
  }
}

// 监听点击事件
watch(showResults, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      window.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    window.removeEventListener('click', handleClickOutside)
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="menu-search-container relative">
    <SearchInput 
      v-model="searchQuery" 
      placeholder="输入内容 搜索菜单名称" 
      @search="handleSearch"
      @clear="handleClear"
    />
    
    <!-- 搜索结果下拉框 -->
    <div 
      v-if="showResults && searchResults.length > 0" 
      class="search-results absolute w-full mt-1 py-1 rounded-lg shadow-lg bg-bg-primary border border-subtle max-h-80 overflow-y-auto z-50"
    >
      <div 
        v-for="item in searchResults" 
        :key="item.id" 
        @click="handleMenuItemClick(item)"
        class="search-result-item px-4 py-2 cursor-pointer hover:bg-primary-500 hover:text-white transition-colors duration-150"
      >
        <div class="flex items-center">
          <i v-if="item.icon" :class="[item.icon, 'mr-2 w-5 text-center']"></i>
          <span class="font-medium">{{ item.title }}</span>
        </div>
        <div v-if="item.fullTitle && item.fullTitle !== item.title" class="text-xs text-muted pl-7">
          {{ item.fullTitle }}
        </div>
      </div>
    </div>
    
    <!-- 无结果提示 -->
    <div 
      v-if="showResults && searchQuery && !searchResults.length" 
      class="search-results absolute w-full mt-1 py-3 rounded-lg shadow-lg bg-bg-primary border border-subtle z-50"
    >
      <div class="text-center text-muted">
        <i class="fas fa-search mr-2"></i>
        未找到匹配的菜单项
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-results {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

.search-result-item {
  transition: all 0.15s ease;
}

.search-result-item:hover {
  background-color: var(--color-primary-500);
  color: white;
}

.search-result-item:hover .text-muted {
  color: rgba(255, 255, 255, 0.7);
}
</style> 