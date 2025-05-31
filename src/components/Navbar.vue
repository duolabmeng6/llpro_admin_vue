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
        <button @click="toggleSidebar" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-bars h-6 w-6"></i>
        </button>
        <h2 class="ml-3 text-lg font-medium text-gray-900">欢迎使用</h2>
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