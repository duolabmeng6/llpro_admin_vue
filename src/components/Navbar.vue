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
  <header 
    class="navbar relative z-10"
    :class="{
      'navbar-dark': currentTheme === 'dark',
      'navbar-light': currentTheme === 'light',
      'navbar-cyber': currentTheme === 'cyberpunk',
      'navbar-green': currentTheme === 'green'
    }"
  >
    <div class="navbar-content px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center relative z-10">
      <div class="flex items-center">
        <!-- 完全移除搜索按钮，保持简洁布局 -->
        <div class="flex items-center">
          <h2 
            class="text-lg font-medium navbar-title"
            :class="{
              'title-dark': currentTheme === 'dark',
              'title-light': currentTheme === 'light',
              'title-cyber': currentTheme === 'cyberpunk',
              'title-green': currentTheme === 'green'
            }"
          >
            LL Pro <span class="navbar-subtitle">系统控制台</span>
          </h2>
        </div>
      </div>
      
      <div class="flex items-center space-x-6">
        <!-- 时间显示 -->
        <div 
          class="hidden md:flex items-center navbar-time"
          :class="{
            'time-dark': currentTheme === 'dark',
            'time-light': currentTheme === 'light',
            'time-cyber': currentTheme === 'cyberpunk',
            'time-green': currentTheme === 'green'
          }"
        >
          <i class="fas fa-clock mr-2"></i>
          <span class="text-sm font-mono">{{ currentTime }}</span>
        </div>
        
        <!-- 主题切换器 -->
        <ThemeSwitcher />
        
        <!-- 用户信息 -->
        <div 
          class="flex items-center navbar-user rounded-full px-3 py-1.5"
          :class="{
            'user-dark': currentTheme === 'dark',
            'user-light': currentTheme === 'light',
            'user-cyber': currentTheme === 'cyberpunk',
            'user-green': currentTheme === 'green'
          }"
        >
          <i class="fas fa-user-circle mr-2"></i>
          <span class="text-sm">
            {{ username }}
          </span>
        </div>
        
        <!-- 退出按钮 -->
        <button
          class="navbar-logout relative overflow-hidden px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300"
          :class="{
            'logout-dark': currentTheme === 'dark',
            'logout-light': currentTheme === 'light',
            'logout-cyber': currentTheme === 'cyberpunk',
            'logout-green': currentTheme === 'green'
          }"
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 深色主题导航栏 */
.navbar-dark {
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
}

/* 明亮主题导航栏 */
.navbar-light {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #1e293b;
}

/* 赛博朋克主题导航栏 */
.navbar-cyber {
  background: rgba(13, 2, 33, 0.95);
  border-bottom: 1px solid rgba(255, 44, 240, 0.3);
  color: white;
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.3);
}

/* 绿色主题导航栏 */
.navbar-green {
  background: rgba(240, 250, 240, 0.95);
  border-bottom: 1px solid oklch(80% 0.08 145);
  color: oklch(15% 0.05 145);
  box-shadow: 0 1px 4px rgba(0, 128, 0, 0.1);
}

/* 标题样式 */
.title-dark {
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 5px rgba(96, 165, 250, 0.5);
}

.title-dark .navbar-subtitle {
  color: transparent;
}

.title-light {
  background: linear-gradient(90deg, #2563eb, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.title-light .navbar-subtitle {
  color: transparent;
}

.title-cyber {
  background: linear-gradient(90deg, #ff2cf0, #00eeff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(255, 44, 240, 0.7);
}

.title-cyber .navbar-subtitle {
  color: transparent;
}

/* 绿色主题标题 */
.title-green {
  background: linear-gradient(90deg, oklch(40% 0.18 145), oklch(45% 0.15 170));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 5px rgba(0, 128, 0, 0.3);
}

.title-green .navbar-subtitle {
  color: transparent;
}

/* 时间显示 */
.time-dark {
  color: #60a5fa;
}

.time-light {
  color: #3b82f6;
}

.time-cyber {
  color: #00eeff;
  text-shadow: 0 0 5px rgba(0, 238, 255, 0.7);
}

/* 绿色主题时间显示 */
.time-green {
  color: oklch(35% 0.15 145);
}

/* 用户信息 */
.user-dark {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: white;
}

.user-dark i {
  color: #a78bfa;
}

.user-light {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #1e293b;
}

.user-light i {
  color: #4f46e5;
}

.user-cyber {
  background: rgba(28, 6, 54, 0.7);
  border: 1px solid rgba(255, 44, 240, 0.3);
  color: white;
  box-shadow: 0 0 8px rgba(255, 44, 240, 0.3);
}

.user-cyber i {
  color: #ff2cf0;
  text-shadow: 0 0 5px rgba(255, 44, 240, 0.5);
}

/* 绿色主题用户信息 */
.user-green {
  background: rgba(236, 252, 235, 0.8);
  border: 1px solid oklch(80% 0.08 145);
  color: oklch(15% 0.05 145);
}

.user-green i {
  color: oklch(40% 0.18 145);
}

/* 退出按钮 */
.logout-dark {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  color: white ;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.logout-dark span,
.logout-dark i {
  color: white ;
}

.logout-dark:hover {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

.logout-light {
  background: linear-gradient(45deg, #2563eb, #4f46e5);
  color: white ;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.2);
}

.logout-light span,
.logout-light i {
  color: white ;
}

.logout-light:hover {
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.logout-cyber {
  background: linear-gradient(45deg, #ff2cf0, #00eeff);
  color: white ;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.3);
}

.logout-cyber span,
.logout-cyber i {
  color: white ;
}

.logout-cyber:hover {
  box-shadow: 0 0 15px rgba(255, 44, 240, 0.5);
  transform: translateY(-2px);
}

/* 绿色主题退出按钮 */
.logout-green {
  background: linear-gradient(45deg, oklch(40% 0.18 145), oklch(45% 0.15 170));
  color: white;
  box-shadow: 0 0 10px rgba(0, 128, 0, 0.3);
}

.logout-green span,
.logout-green i {
  color: white;
}

.logout-green:hover {
  box-shadow: 0 0 15px rgba(0, 128, 0, 0.5);
  transform: translateY(-2px);
}

/* 按钮闪光效果 */
.logout-dark::before,
.logout-light::before,
.logout-cyber::before,
.logout-green::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
  z-index: 0;
}

.logout-dark:hover::before,
.logout-light:hover::before,
.logout-cyber:hover::before,
.logout-green:hover::before {
  left: 100%;
  transition: 0.5s;
}
</style> 