<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  username: {
    type: String,
    default: '用户'
  }
})

const emit = defineEmits(['toggle'])

const authStore = useAuthStore()
const router = useRouter()

const toggleSidebar = () => {
  emit('toggle')
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-white shadow-sm z-10">
    <div class="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <div class="flex items-center">
        <button
          class="p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          @click="toggleSidebar"
        >
          <span class="sr-only">切换侧边栏</span>
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h2 class="ml-3 text-lg font-medium text-gray-900">LL Pro 管理系统</h2>
      </div>
      
      <div class="flex items-center">
        <span class="text-sm text-gray-700 mr-4">
          {{ username }}
        </span>
        <button
          class="btn btn-outline py-1 px-3 text-sm"
          @click="logout"
        >
          退出登录
        </button>
      </div>
    </div>
  </header>
</template> 