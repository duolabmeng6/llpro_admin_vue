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
      await authStore.fetchCurrentUser()
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }
})
</script>

<template>
  <router-view />
  <Notification ref="notificationRef" />
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
