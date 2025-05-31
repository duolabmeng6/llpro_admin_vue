<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

const authStore = useAuthStore()
const router = useRouter()
const themeStore = useThemeStore()

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

// 当前主题
const currentTheme = computed(() => themeStore.currentTheme)

// 可用主题列表
const availableThemes = computed(() => themeStore.availableThemes)

// 确保主题已正确应用
const ensureThemeApplied = () => {
  // 确保HTML根元素类名正确设置
  const themeName = themeStore.currentTheme;
  const root = document.documentElement;
  
  // 移除所有主题类名
  root.classList.remove('dark', 'light', 'cyberpunk');
  
  // 添加当前主题类名
  root.classList.add(themeName);
  
  // 设置data-theme属性
  root.setAttribute('data-theme', themeName);
  
  console.log('登录页确保主题已应用:', themeName);
}

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
    
    // 登录成功后，确保当前主题已被正确保存
    const currentThemeId = themeStore.currentTheme;
    console.log('登录成功，保存当前主题:', currentThemeId);
    
    // 确保主题已正确应用到HTML元素
    ensureThemeApplied();
    
    // 保存主题设置到localStorage，确保它在跳转后能被正确读取
    localStorage.setItem('ll_pro_admin_theme', currentThemeId);
    
    // 跳转到仪表盘
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container min-h-full py-12 px-4 sm:px-6 lg:px-8 theme-transition">
    <div class="login-bg-animation"></div>
    <div class="max-w-md w-full space-y-6 relative z-10">
      <!-- 主题切换按钮 -->
      <div class="absolute top-3 right-3 z-20">
        <ThemeSwitcher simple position="right" />
      </div>
      
      <div class="glass-morphism p-6 rounded-xl neon-border">
        <div class="text-center">
          <h2 class="mt-2 text-center text-3xl font-bold glow-text">
            <span class="title-gradient">
              LL Pro 系统
            </span>
          </h2>
          <p class="mt-2 text-center text-sm text-theme-secondary">
            登录您的账户
          </p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-theme-primary mb-1">用户名</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                v-model="username"
                class="login-input appearance-none relative block w-full px-3 py-2 border placeholder-theme-placeholder text-theme-text rounded-md focus:outline-none focus:ring-2 transition-all duration-300 sm:text-sm"
                placeholder="输入用户名"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-theme-primary mb-1">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                v-model="password"
                class="login-input appearance-none relative block w-full px-3 py-2 border placeholder-theme-placeholder text-theme-text rounded-md focus:outline-none focus:ring-2 transition-all duration-300 sm:text-sm"
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
              class="login-btn group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white transition-all duration-300"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                登录中...
              </span>
              <span v-else class="flex items-center justify-center">
                <i class="fas fa-sign-in-alt mr-2"></i>
                登录
              </span>
            </button>
          </div>
          
          <div class="text-sm text-center">
            <p class="text-theme-secondary">
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
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 各主题背景样式 */
.login-bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 深色主题背景 */
:root.dark .login-bg-animation {
  background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
}

:root.dark .login-bg-animation::before {
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

/* 浅色主题背景 */
:root.light .login-bg-animation {
  background: radial-gradient(ellipse at top, #f8fafc 0%, #e2e8f0 100%);
}

:root.light .login-bg-animation::before {
  content: '';
  position: absolute;
  width: 200vw;
  height: 200vh;
  top: -100vh;
  left: -100vw;
  background-image: 
    linear-gradient(135deg, rgba(241, 245, 249, 0.5) 25%, transparent 25%),
    linear-gradient(225deg, rgba(241, 245, 249, 0.5) 25%, transparent 25%),
    linear-gradient(315deg, rgba(241, 245, 249, 0.5) 25%, transparent 25%),
    linear-gradient(45deg, rgba(241, 245, 249, 0.5) 25%, transparent 25%);
  background-size: 60px 60px;
  opacity: 0.6;
  transform: rotate(5deg);
  animation: light-pattern-move 120s linear infinite;
}

/* 赛博朋克主题背景 */
:root.cyberpunk .login-bg-animation {
  background: radial-gradient(ellipse at bottom, #0d0221 0%, #05010e 100%);
}

:root.cyberpunk .login-bg-animation::before {
  content: '';
  position: absolute;
  width: 200vw;
  height: 200vh;
  top: -100vh;
  left: -100vw;
  background: 
    linear-gradient(90deg, transparent 0%, rgba(255, 44, 240, 0.1) 50%, transparent 100%),
    linear-gradient(180deg, transparent 0%, rgba(0, 238, 255, 0.1) 50%, transparent 100%);
  background-size: 100px 100px;
  transform: rotate(45deg);
  opacity: 0.3;
  animation: cyber-grid-move 20s linear infinite;
}

:root.cyberpunk .login-bg-animation::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 44, 240, 0.15), transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(0, 238, 255, 0.15), transparent 40%);
  opacity: 0.8;
}

/* 标题渐变文本 */
.title-gradient {
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 200% auto;
  animation: gradient-shift 5s ease infinite;
}

:root.dark .title-gradient {
  background-image: linear-gradient(45deg, #60a5fa, #a78bfa, #60a5fa);
}

:root.light .title-gradient {
  background-image: linear-gradient(45deg, #2563eb, #3b82f6, #2563eb);
}

:root.cyberpunk .title-gradient {
  background-image: linear-gradient(45deg, #ff2cf0, #00eeff, #ff2cf0);
}

/* 玻璃态效果 */
.glass-morphism {
  transition: all 0.5s ease;
  border-radius: 0.75rem;
}

:root.dark .glass-morphism {
  background: rgba(30, 41, 59, 0.4);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

:root.light .glass-morphism {
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

:root.cyberpunk .glass-morphism {
  background: rgba(28, 6, 54, 0.5);
  box-shadow: 0 8px 32px 0 rgba(255, 44, 240, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 44, 240, 0.5);
  box-shadow: 0 0 15px rgba(255, 44, 240, 0.5);
}

/* 霓虹边框 */
.neon-border {
  position: relative;
  overflow: hidden;
}

:root.dark .neon-border {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

:root.light .neon-border {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
}

:root.cyberpunk .neon-border {
  box-shadow: 0 0 20px rgba(255, 44, 240, 0.4);
}

:root.cyberpunk .neon-border::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: inherit;
  background: linear-gradient(45deg, #ff2cf0, #00eeff, #ff2cf0);
  background-size: 200% 200%;
  z-index: -1;
  animation: gradient-shift 5s ease infinite;
  filter: blur(8px);
  opacity: 0.7;
}

/* 文本渐变和发光效果 */
.glow-text {
  transition: all 0.3s ease;
}

:root.dark .glow-text {
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

:root.light .glow-text {
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

:root.cyberpunk .glow-text {
  text-shadow: 0 0 15px rgba(255, 44, 240, 0.6);
}

/* 输入框样式 */
.login-input {
  transition: all 0.3s ease;
}

:root.dark .login-input {
  border-color: rgba(255, 255, 255, 0.1);
  background-color: rgba(15, 23, 42, 0.5);
  color: rgba(255, 255, 255, 0.9);
}

:root.dark .login-input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

:root.light .login-input {
  border-color: rgba(30, 41, 59, 0.1);
  background-color: rgba(255, 255, 255, 0.8);
  color: #1e293b;
}

:root.light .login-input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

:root.cyberpunk .login-input {
  border-color: rgba(255, 44, 240, 0.3);
  background-color: rgba(13, 2, 33, 0.6);
  color: rgba(255, 255, 255, 0.9);
}

:root.cyberpunk .login-input:focus {
  border-color: rgba(255, 44, 240, 0.7);
  box-shadow: 0 0 0 2px rgba(255, 44, 240, 0.3);
}

/* 登录按钮样式 */
.login-btn {
  background-size: 200% 200%;
  animation: gradient-shift 5s ease infinite;
  position: relative;
  overflow: hidden;
  /* 通用样式 - 确保所有主题下文本都是白色 */
  color: white !important;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  /* 统一按钮大小 */
  padding: 0.5rem 1rem;
  height: 2.5rem;
  max-height: 2.5rem;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

/* 深色主题按钮 */
:root.dark .login-btn {
  background: linear-gradient(45deg, #3b82f6, #a78bfa) !important;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

:root.dark .login-btn:hover {
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.8);
  transform: translateY(-2px);
}

/* 明亮主题按钮 */
:root.light .login-btn {
  background: linear-gradient(45deg, #2563eb, #3b82f6) !important;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

:root.light .login-btn:hover {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

/* 赛博朋克主题按钮 */
:root.cyberpunk .login-btn {
  background: linear-gradient(45deg, #ff2cf0, #00eeff) !important;
  box-shadow: 0 0 20px rgba(255, 44, 240, 0.6);
}

:root.cyberpunk .login-btn:hover {
  box-shadow: 0 0 30px rgba(255, 44, 240, 0.8);
  transform: translateY(-2px);
}

/* 按钮悬停光效 */
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

/* 文本颜色主题适配 */
.text-theme-primary {
  transition: color 0.3s ease;
}

:root.dark .text-theme-primary {
  color: rgba(255, 255, 255, 0.9);
}

:root.light .text-theme-primary {
  color: #1e293b;
}

:root.cyberpunk .text-theme-primary {
  color: rgba(255, 255, 255, 0.9);
}

.text-theme-secondary {
  transition: color 0.3s ease;
}

:root.dark .text-theme-secondary {
  color: rgba(255, 255, 255, 0.7);
}

:root.light .text-theme-secondary {
  color: #64748b;
}

:root.cyberpunk .text-theme-secondary {
  color: rgba(255, 44, 240, 0.9);
}

.text-theme-text {
  transition: color 0.3s ease;
}

:root.dark .text-theme-text {
  color: rgba(255, 255, 255, 0.9);
}

:root.light .text-theme-text {
  color: #1e293b;
}

:root.cyberpunk .text-theme-text {
  color: rgba(255, 255, 255, 0.9);
}

.placeholder-theme-placeholder::placeholder {
  transition: color 0.3s ease;
}

:root.dark .placeholder-theme-placeholder::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

:root.light .placeholder-theme-placeholder::placeholder {
  color: #94a3b8;
}

:root.cyberpunk .placeholder-theme-placeholder::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* 动画 */
@keyframes stars-move {
  0% {
    transform: rotate(45deg) translateY(0);
  }
  100% {
    transform: rotate(45deg) translateY(1000px);
  }
}

@keyframes light-pattern-move {
  0% {
    transform: rotate(5deg) translateY(0);
  }
  100% {
    transform: rotate(5deg) translateY(1000px);
  }
}

@keyframes cyber-grid-move {
  0% {
    transform: rotate(45deg) translateY(0);
  }
  100% {
    transform: rotate(45deg) translateY(100px);
  }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 