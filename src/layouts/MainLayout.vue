<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTabsStore } from '../stores/tabs'
import { useThemeStore } from '../stores/theme'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import TabsNav from '../components/TabsNav.vue'

const authStore = useAuthStore()
const tabsStore = useTabsStore()
const themeStore = useThemeStore()
const route = useRoute()
const isSidebarOpen = ref(localStorage.getItem('sidebarOpen') !== 'false')
const currentTheme = ref(themeStore.currentTheme)

// 背景动画相关变量
const bgCanvas = ref(null)
const bgAnimationActive = ref(true)
const particles = ref([])
const particleColors = computed(() => {
  switch (currentTheme.value) {
    case 'light':
      return {
        primary: 'rgba(37, 99, 235, ',
        secondary: 'rgba(79, 70, 229, ',
        accent: 'rgba(6, 182, 212, '
      };
    case 'cyberpunk':
      return {
        primary: 'rgba(255, 44, 240, ',
        secondary: 'rgba(0, 238, 255, ',
        accent: 'rgba(0, 255, 143, '
      };
    case 'dark':
    default:
      return {
        primary: 'rgba(99, 102, 241, ',
        secondary: 'rgba(167, 139, 250, ',
        accent: 'rgba(103, 232, 249, '
      };
  }
});

// 监听主题变化，更新背景动画颜色和效果
watch(() => themeStore.currentTheme, (newTheme) => {
  currentTheme.value = newTheme;
  
  // 主题变化时平滑过渡粒子颜色
  if (particles.value.length > 0) {
    transitionParticleColors();
  }
}, { immediate: true });

// 监听路由变化，自动添加标签
watch(() => route.path, (newPath) => {
  // 只有在认证路由中添加标签
  if (route.meta.requiresAuth !== false && route.name !== 'NotFound') {
    tabsStore.addTab(route)
  }
}, { immediate: true })

// 平滑过渡粒子颜色
const transitionParticleColors = () => {
  // 创建过渡动画
  const colorTransition = (particle, targetColor) => {
    // 保存当前颜色以便于过渡
    if (!particle.originalColor) {
      particle.originalColor = particle.color;
    }
    
    // 设置目标颜色
    particle.targetColor = targetColor;
    particle.transitionProgress = 0;
    particle.inTransition = true;
    
    // 添加特殊效果用于主题变化强调
    particle.emphasis = Math.random() > 0.7;
    particle.emphasisProgress = 0;
  };
  
  // 调整粒子速度和大小来创造主题变化的视觉效果
  const applyThemeChangeEffects = () => {
    particles.value.forEach(particle => {
      // 短暂加速粒子
      particle.originalSpeedX = particle.speedX;
      particle.originalSpeedY = particle.speedY;
      particle.originalSize = particle.size;
      
      // 根据主题调整速度
      const speedMultiplier = currentTheme.value === 'cyberpunk' ? 3 : 
                             currentTheme.value === 'light' ? 1.5 : 2;
      
      // 随机方向加速
      particle.speedX = particle.originalSpeedX * speedMultiplier * (Math.random() > 0.5 ? 1 : -1);
      particle.speedY = particle.originalSpeedY * speedMultiplier * (Math.random() > 0.5 ? 1 : -1);
      
      // 粒子尺寸暂时变大
      particle.size = particle.originalSize * (1 + Math.random() * 1);
      
      // 计划恢复原始速度和大小
      setTimeout(() => {
        // 平滑恢复
        particle.restoreOriginal = true;
        particle.restoreProgress = 0;
      }, 500 + Math.random() * 1000);
    });
  };
  
  // 应用主题变化特效
  applyThemeChangeEffects();
  
  // 创建新的粒子，增加视觉丰富度
  const addThemeTransitionParticles = () => {
    const canvas = bgCanvas.value;
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const newParticles = [];
    const newParticleCount = currentTheme.value === 'cyberpunk' ? 30 : 
                            currentTheme.value === 'light' ? 15 : 20;
    
    for (let i = 0; i < newParticleCount; i++) {
      const colorType = i % 3 === 0 ? 'primary' : (i % 3 === 1 ? 'secondary' : 'accent');
      const opacity = (Math.random() * 0.7 + 0.3).toFixed(2);
      
      // 创建从中心辐射的粒子
      const centerX = width / 2;
      const centerY = height / 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(width, height) / 3;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // 向外辐射的速度
      const speed = 1 + Math.random() * 2;
      const speedX = Math.cos(angle) * speed;
      const speedY = Math.sin(angle) * speed;
      
      newParticles.push({
        x,
        y,
        size: Math.random() * 3 + 1,
        speedX,
        speedY,
        color: particleColors.value[colorType] + opacity + ')',
        temporary: true, // 标记为临时粒子
        life: 100, // 生命值
        inTransition: false,
        blinkEffect: Math.random() > 0.5,
        blinkPhase: Math.random() * Math.PI * 2
      });
    }
    
    // 添加到现有粒子数组
    particles.value = [...particles.value, ...newParticles];
  };
  
  // 添加主题变化时的临时粒子
  addThemeTransitionParticles();
  
  // 为每个粒子设置目标颜色
  particles.value.forEach((particle, index) => {
    // 根据粒子的索引分配不同的主色调，创造多彩效果
    const colorType = index % 3 === 0 ? 'primary' : (index % 3 === 1 ? 'secondary' : 'accent');
    const opacity = (Math.random() * 0.5 + 0.25).toFixed(2);
    const targetColor = particleColors.value[colorType] + opacity + ')';
    
    colorTransition(particle, targetColor);
    
    // 为过渡添加一点随机延迟，使效果更自然
    particle.transitionDelay = Math.random() * 300;
    setTimeout(() => {
      particle.canTransition = true;
    }, particle.transitionDelay);
  });
};

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  localStorage.setItem('sidebarOpen', isSidebarOpen.value)
}

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
  canvas.style.transition = 'opacity 0.5s ease'
  document.body.appendChild(canvas)
  bgCanvas.value = canvas
  
  const ctx = canvas.getContext('2d')
  let width = window.innerWidth
  let height = window.innerHeight
  
  canvas.width = width
  canvas.height = height
  
  // 粒子数组
  const particlesArray = []
  const particleCount = 100
  
  // 创建粒子
  for (let i = 0; i < particleCount; i++) {
    const colorType = i % 3 === 0 ? 'primary' : (i % 3 === 1 ? 'secondary' : 'accent');
    const opacity = (Math.random() * 0.5 + 0.25).toFixed(2);
    
    particlesArray.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      color: particleColors.value[colorType] + opacity + ')',
      inTransition: false,
      transitionProgress: 0,
      blinkEffect: Math.random() > 0.7, // 随机粒子有闪烁效果
      blinkPhase: Math.random() * Math.PI * 2 // 随机闪烁相位
    })
  }
  
  particles.value = particlesArray
  
  // 连接附近的粒子
  function connectParticles() {
    for (let i = 0; i < particles.value.length; i++) {
      for (let j = i; j < particles.value.length; j++) {
        const dx = particles.value[i].x - particles.value[j].x
        const dy = particles.value[i].y - particles.value[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const opacity = 1 - distance / 100
          
          // 根据当前主题选择连线颜色
          let connectionColor;
          if (currentTheme.value === 'cyberpunk') {
            // 霓虹线条效果
            connectionColor = `rgba(${Math.sin(Date.now() * 0.001) * 127 + 128}, 
                                     ${Math.sin(Date.now() * 0.002 + 2) * 127 + 128}, 
                                     ${Math.sin(Date.now() * 0.003 + 4) * 127 + 128}, 
                                     ${opacity * 0.2})`;
          } else if (currentTheme.value === 'light') {
            connectionColor = `rgba(37, 99, 235, ${opacity * 0.1})`;
          } else {
            // 深色主题
            connectionColor = `rgba(99, 102, 241, ${opacity * 0.2})`;
          }
          
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = currentTheme.value === 'cyberpunk' ? 0.8 : 0.5;
          ctx.beginPath()
          ctx.moveTo(particles.value[i].x, particles.value[i].y)
          ctx.lineTo(particles.value[j].x, particles.value[j].y)
          ctx.stroke()
        }
      }
    }
  }
  
  // 更新和绘制
  function animate() {
    if (!bgAnimationActive.value) return;
    
    ctx.clearRect(0, 0, width, height)
    
    // 更新粒子位置
    for (let i = 0; i < particles.value.length; i++) {
      const p = particles.value[i]
      p.x += p.speedX
      p.y += p.speedY
      
      // 边界检查
      if (p.x < 0 || p.x > width) p.speedX = -p.speedX
      if (p.y < 0 || p.y > height) p.speedY = -p.speedY
      
      // 处理颜色过渡
      if (p.inTransition && p.canTransition) {
        p.transitionProgress += 0.02;
        if (p.transitionProgress >= 1) {
          p.color = p.targetColor;
          p.originalColor = null;
          p.inTransition = false;
        } else {
          // 提取原始颜色和目标颜色的RGBA值
          const parseColor = (color) => {
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
            if (match) {
              return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3]),
                a: match[4] ? parseFloat(match[4]) : 1
              };
            }
            return { r: 0, g: 0, b: 0, a: 1 };
          };
          
          const original = parseColor(p.originalColor);
          const target = parseColor(p.targetColor);
          
          // 使用缓动函数使过渡更平滑
          const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const progress = easeInOutCubic(p.transitionProgress);
          
          // 线性插值计算过渡颜色
          const r = Math.round(original.r + (target.r - original.r) * progress);
          const g = Math.round(original.g + (target.g - original.g) * progress);
          const b = Math.round(original.b + (target.b - original.b) * progress);
          const a = parseFloat((original.a + (target.a - original.a) * progress).toFixed(2));
          
          p.color = `rgba(${r}, ${g}, ${b}, ${a})`;
        }
      }
      
      // 处理临时粒子
      if (p.temporary) {
        p.life -= 1;
        if (p.life <= 0) {
          // 移除生命值为0的临时粒子
          particles.value.splice(i, 1);
          i--;
          continue;
        }
        // 随着生命值减少，降低不透明度
        p.color = p.color.replace(/[0-9.]+\)$/, `${p.life / 100})`);
      }
      
      // 恢复原始速度和大小
      if (p.restoreOriginal) {
        p.restoreProgress += 0.02;
        if (p.restoreProgress >= 1) {
          p.speedX = p.originalSpeedX;
          p.speedY = p.originalSpeedY;
          p.size = p.originalSize;
          p.restoreOriginal = false;
        } else {
          // 平滑过渡回原始值
          const progress = 1 - Math.pow(1 - p.restoreProgress, 3); // 缓动函数
          p.speedX = p.speedX + (p.originalSpeedX - p.speedX) * progress;
          p.speedY = p.speedY + (p.originalSpeedY - p.speedY) * progress;
          p.size = p.size + (p.originalSize - p.size) * progress;
        }
      }
      
      // 主题变化强调效果
      if (p.emphasis) {
        p.emphasisProgress += 0.01;
        if (p.emphasisProgress >= 1) {
          p.emphasis = false;
        }
      }
      
      // 闪烁效果
      let drawSize = p.size;
      if (p.blinkEffect) {
        p.blinkPhase += 0.03;
        const blinkFactor = (Math.sin(p.blinkPhase) + 1) / 2; // 0到1的值
        drawSize = p.size * (0.7 + blinkFactor * 0.5);
        
        // 主题强调时，增强闪烁效果
        if (p.emphasis) {
          drawSize *= 1 + p.emphasisProgress * 0.5;
        }
      }
      
      // 绘制粒子
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 连接粒子
    connectParticles()
    
    // 如果背景动画是活跃的，则继续
    if (bgAnimationActive.value) {
      requestAnimationFrame(animate)
    }
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
  <div class="h-full flex main-container" :class="[currentTheme]">
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

/* 主题对应的内容背景 */
.dark .content-bg {
  background: rgba(15, 23, 42, 0.3);
}

.light .content-bg {
  background: rgba(241, 245, 249, 0.5);
}

.cyberpunk .content-bg {
  background: rgba(28, 6, 54, 0.3);
  box-shadow: inset 0 0 20px rgba(255, 44, 240, 0.1);
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