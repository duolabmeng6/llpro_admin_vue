<script setup>
import { onMounted, ref, provide } from 'vue'
import { useAuthStore } from './stores/auth'
import Notification from './components/Notification.vue'

const authStore = useAuthStore()
const notificationRef = ref(null)

// 提供通知方法给子组件
provide('notify', (options) => {
  if (notificationRef.value) {
    return notificationRef.value.notify(options)
  }
})

onMounted(async () => {
  // 设置全局通知实例
  if (notificationRef.value) {
    window.$notificationInstance = notificationRef.value
  }
  
  // 获取当前用户信息
  if (authStore.token) {
    try {
      console.log('正在获取用户信息...')
      console.log('当前token:', authStore.token)
      await authStore.fetchCurrentUser()
      console.log('获取用户信息成功:', authStore.user)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 显示通知
      if (notificationRef.value) {
        notificationRef.value.notify({
          type: 'error',
          title: '获取用户信息失败',
          message: error.message || '请重新登录'
        })
      }
    }
  } else {
    console.log('未找到token，用户未登录')
  }
})
</script>

<template>
  <div class="min-h-screen bg-primary text-primary transition-colors">
    <router-view />
    <Notification ref="notificationRef" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
