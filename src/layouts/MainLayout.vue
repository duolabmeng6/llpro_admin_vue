<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTabsStore } from '../stores/tabs'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import TabsNav from '../components/TabsNav.vue'

const authStore = useAuthStore()
const tabsStore = useTabsStore()
const route = useRoute()
const isSidebarOpen = ref(localStorage.getItem('sidebarOpen') !== 'false')

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  localStorage.setItem('sidebarOpen', isSidebarOpen.value)
}

// 监听路由变化，自动添加标签
watch(() => route.path, (newPath) => {
  // 只有在认证路由中添加标签
  if (route.meta.requiresAuth !== false && route.name !== 'NotFound') {
    tabsStore.addTab(route)
  }
}, { immediate: true })

onMounted(() => {
  // 初始化时，如果当前路由不是登录页，则添加到标签
  if (route.meta.requiresAuth !== false && route.name !== 'NotFound') {
    tabsStore.addTab(route)
  }
})
</script>

<template>
  <div class="h-full flex">
    <!-- Sidebar -->
    <Sidebar :is-open="isSidebarOpen" @toggle="toggleSidebar" />
    
    <!-- Main content -->
    <div 
      class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      :class="[isSidebarOpen ? 'ml-64' : 'ml-16']"
    >
      <!-- Top navbar -->
      <Navbar 
        :username="authStore.user?.username || '用户'" 
        @toggle="toggleSidebar" 
      />
      
      <!-- Tabs navigation -->
      <TabsNav />
      
      <!-- Page content -->
      <main class="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template> 