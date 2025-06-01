<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import ThemeSwitcher from './ThemeSwitcher.vue'

const props = defineProps({
  username: {
    type: String,
    default: '用户'
  }
})

// 简化，不需要emit
const emit = defineEmits([])

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const currentTime = ref('00:00:00')
const currentTheme = computed(() => themeStore.currentTheme)

// 更新时间
const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="navbar relative z-10 glass-morphism">
    <div class="navbar-content px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center relative z-10">
      <div class="flex items-center">
        <!-- 完全移除搜索按钮，保持简洁布局 -->
        <div class="flex items-center">
          <h2 class="text-lg font-medium navbar-title gradient-text">
            LL Pro <span class="navbar-subtitle">系统控制台</span>
          </h2>
        </div>
      </div>
      
      <div class="flex items-center space-x-6">
        <!-- 时间显示 -->
        <div class="hidden md:flex items-center navbar-time text-accent">
          <i class="fas fa-clock mr-2"></i>
          <span class="text-sm font-mono">{{ currentTime }}</span>
        </div>
        
        <!-- 主题切换器 -->
        <ThemeSwitcher />
        
        <!-- 用户信息 -->
        <div class="flex items-center navbar-user rounded-full px-3 py-1.5 bg-tertiary border border-subtle">
          <i class="fas fa-user-circle mr-2"></i>
          <span class="text-sm">
            {{ username }}
          </span>
        </div>
        
        <!-- 退出按钮 -->
        <button
          class="navbar-logout relative overflow-hidden px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 bg-button-primary text-button-primary hover:bg-button-primary-hover"
          @click="logout"
        >
          <span class="relative z-10 flex items-center">
            <i class="fas fa-sign-out-alt mr-2"></i>
            退出登录
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 导航栏基础样式 */
.navbar {
  position: relative;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px var(--color-shadow);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

/* 标题渐变样式 */
.gradient-text {
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 5px var(--color-shadow);
}

.gradient-text .navbar-subtitle {
  color: transparent;
}

/* 用户信息 */
.navbar-user {
  transition: all 0.2s ease;
}

.navbar-user:hover {
  background-color: var(--color-bg-tertiary);
}

/* 退出按钮悬停效果 */
.navbar-logout:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px var(--color-shadow);
}

/* 时间显示 */
.navbar-time {
  transition: all 0.2s ease;
}
</style> 