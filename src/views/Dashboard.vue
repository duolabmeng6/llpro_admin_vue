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
      return '<i class="fas fa-users h-6 w-6"></i>'
    case 'user-check':
      return '<i class="fas fa-user-check h-6 w-6"></i>'
    case 'user-x':
      return '<i class="fas fa-user-times h-6 w-6"></i>'
    case 'shield':
      return '<i class="fas fa-shield-alt h-6 w-6"></i>'
    default:
      return '<i class="fas fa-question h-6 w-6"></i>'
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