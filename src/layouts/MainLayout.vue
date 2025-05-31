<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTabsStore } from '../stores/tabs'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import TabsNav from '../components/TabsNav.vue'

const authStore = useAuthStore()
const tabsStore = useTabsStore()
const route = useRoute()
const isSidebarOpen = ref(localStorage.getItem('sidebarOpen') !== 'false')

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  localStorage.setItem('sidebarOpen', isSidebarOpen.value)
}

// 监听路由变化，自动添加标签
watch(() => route.path, (newPath) => {
  // 只有在认证路由中添加标签
  if (route.meta.requiresAuth !== false && route.name !== 'NotFound') {
    tabsStore.addTab(route)
  }
}, { immediate: true })

onMounted(() => {
  // 初始化时，如果当前路由不是登录页，则添加到标签
  if (route.meta.requiresAuth !== false && route.name !== 'NotFound') {
    tabsStore.addTab(route)
  }
  
  // 添加背景动画
  initBackgroundAnimation()
})

// 背景动画
const initBackgroundAnimation = () => {
  const canvas = document.createElement('canvas')
  canvas.id = 'background-canvas'
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.zIndex = '-1'
  canvas.style.opacity = '0.15'
  document.body.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  let width = window.innerWidth
  let height = window.innerHeight
  
  canvas.width = width
  canvas.height = height
  
  // 粒子数组
  const particles = []
  const particleCount = 100
  
  // 创建粒子
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      color: `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.25})`
    })
  }
  
  // 连接附近的粒子
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const opacity = 1 - distance / 100
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.2})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
  }
  
  // 更新和绘制
  function animate() {
    ctx.clearRect(0, 0, width, height)
    
    // 更新粒子位置
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.speedX
      p.y += p.speedY
      
      // 边界检查
      if (p.x < 0 || p.x > width) p.speedX = -p.speedX
      if (p.y < 0 || p.y > height) p.speedY = -p.speedY
      
      // 绘制粒子
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 连接粒子
    connectParticles()
    
    requestAnimationFrame(animate)
  }
  
  // 处理窗口大小变化
  window.addEventListener('resize', () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  })
  
  // 开始动画
  animate()
}
</script>

<template>
  <div class="h-full flex bg-dark">
    <!-- Sidebar -->
    <Sidebar :is-open="isSidebarOpen" @toggle="toggleSidebar" />
    
    <!-- Main content -->
    <div 
      class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      :class="[isSidebarOpen ? 'ml-64' : 'ml-16']"
    >
      <!-- Top navbar -->
      <Navbar 
        :username="authStore.user?.username || '用户'" 
        @toggle="toggleSidebar" 
      />
      
      <!-- Tabs navigation -->
      <TabsNav />
      
      <!-- Page content -->
      <main class="flex-1 overflow-auto content-bg p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  height: 100%;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.bg-dark {
  background-color: var(--color-dark-bg);
  color: white;
}

.content-bg {
  background: rgba(15, 23, 42, 0.3);
}

/* 添加全局过渡效果 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style> 