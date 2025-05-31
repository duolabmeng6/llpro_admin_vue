<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'

const authStore = useAuthStore()
const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="h-full flex">
    <!-- Sidebar -->
    <Sidebar :is-open="isSidebarOpen" @toggle="toggleSidebar" />
    
    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top navbar -->
      <Navbar 
        :username="authStore.user?.username || 'User'" 
        @toggle="toggleSidebar" 
      />
      
      <!-- Page content -->
      <main class="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template> 