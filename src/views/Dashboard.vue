<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/users'

const authStore = useAuthStore()
const userStore = useUserStore()

const stats = ref([
  { name: '用户总数', value: 0, icon: 'users', color: 'neon-blue' },
  { name: '活跃用户', value: 0, icon: 'user-check', color: 'neon-cyan' },
  { name: '非活跃用户', value: 0, icon: 'user-x', color: 'neon-purple' },
  { name: '管理员用户', value: 0, icon: 'shield', color: 'neon-pink' }
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
      return '<i class="fas fa-users text-xl"></i>'
    case 'user-check':
      return '<i class="fas fa-user-check text-xl"></i>'
    case 'user-x':
      return '<i class="fas fa-user-times text-xl"></i>'
    case 'shield':
      return '<i class="fas fa-shield-alt text-xl"></i>'
    default:
      return '<i class="fas fa-question text-xl"></i>'
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold flex items-center text-heading">
      <i class="fas fa-tachometer-alt mr-2 text-neon-blue"></i>
      仪表盘
    </h1>
    <p class="mt-1 text-sm text-muted">
      欢迎回来，<span class="text-neon-cyan">{{ authStore.user?.username || '用户' }}</span>!
    </p>
    
    <div class="mt-6">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Stats cards -->
        <div
          v-for="(item, index) in stats"
          :key="index"
          class="glass-morphism overflow-hidden rounded-lg border-l-4 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]"
          :class="`border-${item.color}`"
          :style="`box-shadow: 0 5px 15px rgba(var(--color-${item.color}), 0.2);`"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div 
                  class="p-3 rounded-md flex items-center justify-center stat-icon"
                  :class="`text-${item.color}`"
                  v-html="getIcon(item.icon)"
                ></div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium truncate text-muted">
                    {{ item.name }}
                  </dt>
                  <dd>
                    <div class="text-2xl font-medium text-heading">
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
      <h2 class="text-lg font-medium flex items-center text-heading">
        <i class="fas fa-history mr-2 text-neon-purple"></i>
        最近活动
      </h2>
      <div class="mt-4 rounded-lg glass-morphism">
        <div class="p-6">
          <div class="text-center py-8 text-muted" v-if="userStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            加载中...
          </div>
          <div class="text-center py-8 text-muted" v-else>
            <i class="fas fa-inbox text-neon-purple text-2xl mb-3"></i>
            <p>暂无最近活动</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-icon {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.text-neon-blue {
  color: var(--color-neon-blue);
  filter: drop-shadow(0 0 3px var(--color-neon-blue));
}

.text-neon-cyan {
  color: var(--color-neon-cyan);
  filter: drop-shadow(0 0 3px var(--color-neon-cyan));
}

.text-neon-purple {
  color: var(--color-neon-purple);
  filter: drop-shadow(0 0 3px var(--color-neon-purple));
}

.text-neon-pink {
  color: var(--color-neon-pink);
  filter: drop-shadow(0 0 3px var(--color-neon-pink));
}

.border-neon-blue {
  border-color: var(--color-neon-blue);
}

.border-neon-cyan {
  border-color: var(--color-neon-cyan);
}

.border-neon-purple {
  border-color: var(--color-neon-purple);
}

.border-neon-pink {
  border-color: var(--color-neon-pink);
}
</style> 