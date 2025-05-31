<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const props = defineProps({
  username: {
    type: String,
    default: '用户'
  }
})

const emit = defineEmits(['toggle'])

const authStore = useAuthStore()
const router = useRouter()
const currentTime = ref('00:00:00')

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

const toggleSidebar = () => {
  emit('toggle')
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="glass-morphism z-10 relative">
    <div class="navbar-bg-animation"></div>
    <div class="navbar-content px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center relative z-10">
      <div class="flex items-center">
        <button 
          @click="toggleSidebar" 
          class="flex items-center justify-center text-white hover:text-neon-blue transition-all duration-300 transform hover:scale-110"
        >
          <i class="fas fa-bars text-xl"></i>
        </button>
        
        <div class="ml-4 flex items-center">
          <h2 class="text-lg font-medium text-white glow-text bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text">
            LL Pro <span class="text-transparent">系统控制台</span>
          </h2>
        </div>
      </div>
      
      <div class="flex items-center space-x-6">
        <!-- 时间显示 -->
        <div class="hidden md:flex items-center text-neon-cyan">
          <i class="fas fa-clock mr-2"></i>
          <span class="text-sm font-mono">{{ currentTime }}</span>
        </div>
        
        <!-- 用户信息 -->
        <div class="flex items-center neon-border rounded-full px-3 py-1.5 bg-opacity-20 bg-black">
          <i class="fas fa-user-circle text-neon-purple mr-2"></i>
          <span class="text-sm text-white">
            {{ username }}
          </span>
        </div>
        
        <!-- 退出按钮 -->
        <button
          class="btn-logout relative overflow-hidden px-4 py-1.5 rounded-md text-white text-sm font-medium transition-all duration-300"
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
.navbar-bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(15, 23, 42, 0.8),
    rgba(30, 41, 59, 0.8)
  );
  z-index: 1;
}

.btn-logout {
  background: linear-gradient(45deg, var(--color-neon-purple), var(--color-neon-blue));
  background-size: 200% 200%;
  animation: gradient-shift 5s ease infinite;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

.btn-logout:hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
  transform: translateY(-2px);
}

.btn-logout::before {
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

.btn-logout:hover::before {
  left: 100%;
  transition: 0.5s;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style> 