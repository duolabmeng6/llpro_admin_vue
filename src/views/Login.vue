<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useThemeEffect } from '../utils/useThemeEffect'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

const authStore = useAuthStore()
const router = useRouter()
const themeStore = useThemeStore()

// 使用自定义主题钩子，确保主题正确应用
useThemeEffect({ applyBodyClass: true })

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

// 当前主题
const currentTheme = computed(() => themeStore.currentTheme)

// 可用主题列表
const availableThemes = computed(() => themeStore.availableThemes)

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
    
    // 登录成功后跳转到仪表盘
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-bg-animation"></div>
    <div class="login-card-wrapper">
      <!-- 主题切换按钮 -->
      <div class="theme-switcher-wrapper">
        <ThemeSwitcher simple position="right" />
      </div>
      
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">
            <span class="title-gradient">
              LL Pro 系统
            </span>
          </h2>
          <p class="login-subtitle">
            登录您的账户
          </p>
        </div>
        
        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-fields">
            <div class="form-field">
              <label for="username" class="field-label">用户名</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                v-model="username"
                class="field-input"
                placeholder="输入用户名"
              />
            </div>
            <div class="form-field">
              <label for="password" class="field-label">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                v-model="password"
                class="field-input"
                placeholder="输入密码"
              />
            </div>
          </div>
          
          <div v-if="error" class="login-error">
            {{ error }}
          </div>
          
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="login-btn"
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
          
          <div class="login-demo-info">
            <p>
              演示账号: admin / admin
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
/* 登录页样式已移至 src/styles/components/login.css */
</style> 