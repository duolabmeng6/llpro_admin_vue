<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/users'

const authStore = useAuthStore()
const userStore = useUserStore()

const stats = ref([
  { name: '用户总数', value: 0, icon: 'users' },
  { name: '活跃用户', value: 0, icon: 'user-check' },
  { name: '非活跃用户', value: 0, icon: 'user-x' },
  { name: '管理员用户', value: 0, icon: 'shield' }
])

onMounted(async () => {
  try {
    const users = await userStore.fetchUsers()
    
    // Update stats
    stats.value[0].value = users.length
    stats.value[1].value = users.filter(user => user.status === 'active').length
    stats.value[2].value = users.filter(user => user.status === 'inactive').length
    stats.value[3].value = users.filter(user => user.role === 'admin').length
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
})

// Helper function to get icon SVG based on icon name
const getIcon = (iconName) => {
  switch (iconName) {
    case 'users':
      return `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>`
    case 'user-check':
      return `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
    case 'user-x':
      return `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
    case 'shield':
      return `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>`
    default:
      return ''
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">仪表盘</h1>
    <p class="mt-1 text-sm text-gray-500">
      欢迎回来，{{ authStore.user?.username || '用户' }}!
    </p>
    
    <div class="mt-6">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Stats cards -->
        <div
          v-for="(item, index) in stats"
          :key="index"
          class="bg-white overflow-hidden shadow rounded-lg"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 bg-primary-100 text-primary-600 rounded-md" v-html="getIcon(item.icon)"></div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ item.name }}
                  </dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">
                      {{ item.value }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent activity section -->
    <div class="mt-8">
      <h2 class="text-lg font-medium text-gray-900">最近活动</h2>
      <div class="mt-4 bg-white shadow rounded-lg">
        <div class="p-6">
          <div class="text-center text-gray-500 py-8" v-if="userStore.loading">
            加载中...
          </div>
          <div class="text-center text-gray-500 py-8" v-else>
            <p>暂无最近活动</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 