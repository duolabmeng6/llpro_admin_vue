<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()

// 菜单状态
const isMenuOpen = ref(false)
const menuRef = ref(null)
const avatarRef = ref(null)

// 用户信息
const user = computed(() => authStore.user || {})
const username = computed(() => user.value?.username || '用户')
const userRole = computed(() => user.value?.role || '未知角色')

// 用户头像
const userAvatar = computed(() => {
  // 如果用户有自定义头像，则使用自定义头像
  if (user.value?.avatar) {
    return user.value.avatar
  }
  // 否则返回 null，使用默认头像
  return null
})

// 菜单选项
const menuItems = [
  {
    id: 'profile',
    label: '个人资料',
    icon: 'fa-user',
    action: () => router.push('/profile')
  },
  {
    id: 'settings',
    label: '账户设置',
    icon: 'fa-cog',
    action: () => router.push('/settings')
  },
  {
    id: 'notifications',
    label: '通知中心',
    icon: 'fa-bell',
    action: () => router.push('/notifications')
  }
]

// 切换菜单
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 关闭菜单
const closeMenu = () => {
  isMenuOpen.value = false
}

// 退出登录
const logout = async () => {
  await authStore.logout()
  closeMenu()
  router.push('/login')
}

// 点击外部区域关闭菜单
const handleClickOutside = (event) => {
  if (
    menuRef.value && 
    !menuRef.value.contains(event.target) && 
    avatarRef.value && 
    !avatarRef.value.contains(event.target)
  ) {
    closeMenu()
  }
}

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="user-menu-container">
    <!-- 用户头像按钮 -->
    <div 
      ref="avatarRef"
      class="avatar-button" 
      @click.stop="toggleMenu"
      :class="{ 'active': isMenuOpen }"
    >
      <div class="avatar-wrapper">
        <img 
          v-if="userAvatar" 
          :src="userAvatar" 
          alt="用户头像" 
          class="avatar-image"
        />
        <div v-else class="avatar-placeholder">
          <i class="fas fa-user"></i>
        </div>
      </div>
    </div>

    <!-- 下拉菜单 -->
    <div 
      v-show="isMenuOpen" 
      ref="menuRef"
      class="dropdown-menu" 
      :class="{ 'menu-open': isMenuOpen }"
    >
      <!-- 用户信息区域 -->
      <div class="user-info">
        <div class="avatar-large">
          <img 
            v-if="userAvatar" 
            :src="userAvatar" 
            alt="用户头像" 
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder">
            <i class="fas fa-user"></i>
          </div>
        </div>
        <div class="user-details">
          <div class="username">{{ username }}</div>
          <div class="user-role">{{ userRole }}</div>
        </div>
      </div>

      <!-- 菜单分隔线 -->
      <div class="menu-divider"></div>

      <!-- 菜单选项 -->
      <ul class="menu-items">
        <li v-for="item in menuItems" :key="item.id" class="menu-item" @click="item.action">
          <i :class="['fas', item.icon]"></i>
          <span>{{ item.label }}</span>
        </li>
      </ul>

      <!-- 菜单分隔线 -->
      <div class="menu-divider"></div>

      <!-- 退出登录按钮 -->
      <div class="logout-button" @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>退出登录</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-menu-container {
  position: relative;
}

/* 头像按钮样式 */
.avatar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  background-color: var(--color-bg-tertiary);
  border: 2px solid transparent;
  transition: all 0.2s ease;
  overflow: hidden;
  padding: 0;
}

.avatar-button:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.avatar-button.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.3);
}

.avatar-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

/* 下拉菜单样式 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--color-shadow);
  border: 1px solid var(--color-border);
  z-index: 100;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-menu.menu-open {
  opacity: 1;
  transform: translateY(0);
}

/* 用户信息区域 */
.user-info {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--color-bg-tertiary);
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* 菜单分隔线 */
.menu-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 4px 0;
}

/* 菜单选项 */
.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: var(--color-bg-hover);
}

.menu-item i {
  width: 20px;
  color: var(--color-text-secondary);
  margin-right: 12px;
}

/* 退出登录按钮 */
.logout-button {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  color: var(--color-danger);
  transition: background-color 0.2s ease;
}

.logout-button:hover {
  background-color: var(--color-bg-hover);
}

.logout-button i {
  width: 20px;
  margin-right: 12px;
}
</style> 