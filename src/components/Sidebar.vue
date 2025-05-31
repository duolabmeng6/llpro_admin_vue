<script setup>
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle'])

const route = useRoute()

const toggleSidebar = () => {
  emit('toggle')
}
</script>

<template>
  <aside
    class="bg-secondary-800 text-white w-64 flex-shrink-0 transition-all duration-300"
    :class="{ '-ml-64': !isOpen }"
  >
    <div class="p-4 flex items-center justify-between">
      <h1 class="text-xl font-bold">LL Pro 管理系统</h1>
      <button
        class="lg:hidden p-2 rounded-md hover:bg-secondary-700"
        @click="toggleSidebar"
      >
        <span class="sr-only">关闭侧边栏</span>
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    
    <nav class="mt-5 px-2">
      <router-link
        to="/dashboard"
        class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
        :class="[route.path === '/dashboard' ? 'bg-secondary-900 text-white' : 'text-secondary-300 hover:bg-secondary-700 hover:text-white']"
      >
        <svg
          class="mr-3 h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        仪表盘
      </router-link>
      
      <router-link
        to="/users"
        class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md"
        :class="[route.path === '/users' ? 'bg-secondary-900 text-white' : 'text-secondary-300 hover:bg-secondary-700 hover:text-white']"
      >
        <svg
          class="mr-3 h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        用户管理
      </router-link>
      
      <router-link
        to="/roles"
        class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md"
        :class="[route.path === '/roles' ? 'bg-secondary-900 text-white' : 'text-secondary-300 hover:bg-secondary-700 hover:text-white']"
      >
        <svg
          class="mr-3 h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        角色管理
      </router-link>
      
      <router-link
        to="/settings"
        class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md"
        :class="[route.path === '/settings' ? 'bg-secondary-900 text-white' : 'text-secondary-300 hover:bg-secondary-700 hover:text-white']"
      >
        <svg
          class="mr-3 h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        系统设置
      </router-link>
    </nav>
  </aside>
</template> 