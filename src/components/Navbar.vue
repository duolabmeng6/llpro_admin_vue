<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useSettingsStore } from '../stores/settings'
import ThemeSwitcher from './ThemeSwitcher.vue'
import MenuSearch from './MenuSearch.vue'
import DateTime from './DateTime.vue'
import UserMenu from './UserMenu.vue'

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
const settingsStore = useSettingsStore()
const router = useRouter()
const currentTheme = computed(() => themeStore.currentTheme)

// 打开设置面板
const openSettings = () => {
  settingsStore.showSettingsPanel()
}
</script>

<template>
  <header class="navbar relative z-10 glass-morphism">
    <div class="navbar-content px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center relative z-10">
      <!-- 菜单搜索组件 -->
      <div class="w-64 md:w-96">
        <MenuSearch />
      </div>
      
      <div class="flex items-center space-x-6">
        <!-- 日期时间组件 -->
        <div class="hidden md:block">
          <DateTime />
        </div>
        
        <!-- 主题切换器 -->
        <ThemeSwitcher />
        
        <!-- 设置按钮 -->
        <button 
          @click="openSettings"
          class="settings-btn flex items-center justify-center rounded-full transition-all duration-300"
          title="系统设置"
        >
          <i class="fa-solid fa-cog"></i>
        </button>
        
        <!-- 用户菜单组件 -->
        <UserMenu />
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

/* 设置按钮样式 */
.settings-btn {
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.settings-btn:hover {
  transform: translateY(-2px) rotate(30deg);
  box-shadow: 0 2px 8px var(--color-shadow);
  color: var(--color-accent);
}
</style> 