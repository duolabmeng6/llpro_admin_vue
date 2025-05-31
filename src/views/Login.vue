<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  
  error.value = ''
  isLoading.value = true
  
  try {
    await authStore.login({
      username: username.value,
      password: password.value
    })
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="login-bg-animation"></div>
    <div class="max-w-md w-full space-y-8 relative z-10">
      <div class="glass-morphism p-8 rounded-xl neon-border">
        <div class="text-center">
          <h2 class="mt-2 text-center text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent glow-text">
            LL Pro 系统
          </h2>
          <p class="mt-2 text-center text-sm text-gray-400">
            登录您的账户
          </p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-300 mb-1">用户名</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                v-model="username"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 bg-opacity-50 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 sm:text-sm"
                placeholder="输入用户名"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-300 mb-1">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                v-model="password"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 bg-opacity-50 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 sm:text-sm"
                placeholder="输入密码"
              />
            </div>
          </div>
          
          <div v-if="error" class="text-red-400 text-sm text-center bg-red-900 bg-opacity-30 p-2 rounded-md">
            {{ error }}
          </div>
          
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="login-btn group relative w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-md text-white transition-all duration-300"
            >
              <span v-if="isLoading" class="flex items-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                登录中...
              </span>
              <span v-else class="flex items-center">
                <i class="fas fa-sign-in-alt mr-2"></i>
                登录
              </span>
            </button>
          </div>
          
          <div class="text-sm text-center">
            <p class="text-gray-400">
              演示账号: admin / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.login-bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
  z-index: 0;
}

.login-bg-animation::before {
  content: '';
  position: absolute;
  width: 200vw;
  height: 200vh;
  top: -100vh;
  left: -100vw;
  background-image: 
    radial-gradient(circle, white 1px, transparent 1px),
    radial-gradient(circle, white 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  transform: rotate(45deg);
  opacity: 0.1;
  animation: stars-move 100s linear infinite;
}

@keyframes stars-move {
  0% {
    transform: rotate(45deg) translateY(0);
  }
  100% {
    transform: rotate(45deg) translateY(1000px);
  }
}

.login-btn {
  background: linear-gradient(45deg, var(--color-neon-blue), var(--color-neon-purple));
  background-size: 200% 200%;
  animation: gradient-shift 5s ease infinite;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
  position: relative;
  overflow: hidden;
}

.login-btn:hover {
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.8);
  transform: translateY(-2px);
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: 0.5s;
  z-index: 0;
}

.login-btn:hover::before {
  left: 100%;
  transition: 0.5s;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style> 