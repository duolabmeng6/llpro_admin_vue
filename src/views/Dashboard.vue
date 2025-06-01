<template>
  <div class="dashboard p-6">
    <h1 class="text-2xl font-bold mb-6 text-heading">
      仪表盘
      <span class="text-sm font-normal text-muted ml-2">欢迎回来，数据一目了然</span>
    </h1>
    
    <!-- 统计卡片区域 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- 用户总数卡片 -->
      <div class="stat-card bg-card rounded-lg overflow-hidden shadow-theme transition-all duration-300">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted mb-1">用户总数</p>
              <h3 class="text-2xl font-bold text-heading">12,628</h3>
            </div>
            <div class="stat-icon bg-tertiary text-accent p-3 rounded-lg">
              <i class="fa-solid fa-users"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-success flex items-center">
              <i class="fa-solid fa-arrow-up mr-1"></i>
              16.2%
            </span>
            <span class="text-muted ml-2">较上月</span>
          </div>
        </div>
        <div class="stat-footer border-t border-subtle px-6 py-3 bg-tertiary">
          <a href="#" class="text-accent hover:text-accent-hover flex items-center text-sm">
            查看详情
            <i class="fa-solid fa-arrow-right ml-1 text-xs"></i>
          </a>
        </div>
      </div>
      
      <!-- 订单数量卡片 -->
      <div class="stat-card bg-card rounded-lg overflow-hidden shadow-theme transition-all duration-300">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted mb-1">订单数量</p>
              <h3 class="text-2xl font-bold text-heading">2,856</h3>
            </div>
            <div class="stat-icon bg-tertiary text-accent p-3 rounded-lg">
              <i class="fa-solid fa-shopping-cart"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-success flex items-center">
              <i class="fa-solid fa-arrow-up mr-1"></i>
              8.4%
            </span>
            <span class="text-muted ml-2">较上月</span>
          </div>
        </div>
        <div class="stat-footer border-t border-subtle px-6 py-3 bg-tertiary">
          <a href="#" class="text-accent hover:text-accent-hover flex items-center text-sm">
            查看详情
            <i class="fa-solid fa-arrow-right ml-1 text-xs"></i>
          </a>
        </div>
      </div>
      
      <!-- 营收总额卡片 -->
      <div class="stat-card bg-card rounded-lg overflow-hidden shadow-theme transition-all duration-300">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted mb-1">营收总额</p>
              <h3 class="text-2xl font-bold text-heading">¥126,400</h3>
            </div>
            <div class="stat-icon bg-tertiary text-accent p-3 rounded-lg">
              <i class="fa-solid fa-yen-sign"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-danger flex items-center">
              <i class="fa-solid fa-arrow-down mr-1"></i>
              3.1%
            </span>
            <span class="text-muted ml-2">较上月</span>
          </div>
        </div>
        <div class="stat-footer border-t border-subtle px-6 py-3 bg-tertiary">
          <a href="#" class="text-accent hover:text-accent-hover flex items-center text-sm">
            查看详情
            <i class="fa-solid fa-arrow-right ml-1 text-xs"></i>
          </a>
        </div>
      </div>
      
      <!-- 转化率卡片 -->
      <div class="stat-card bg-card rounded-lg overflow-hidden shadow-theme transition-all duration-300">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted mb-1">转化率</p>
              <h3 class="text-2xl font-bold text-heading">24.8%</h3>
            </div>
            <div class="stat-icon bg-tertiary text-accent p-3 rounded-lg">
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-success flex items-center">
              <i class="fa-solid fa-arrow-up mr-1"></i>
              4.6%
            </span>
            <span class="text-muted ml-2">较上月</span>
          </div>
        </div>
        <div class="stat-footer border-t border-subtle px-6 py-3 bg-tertiary">
          <a href="#" class="text-accent hover:text-accent-hover flex items-center text-sm">
            查看详情
            <i class="fa-solid fa-arrow-right ml-1 text-xs"></i>
          </a>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 活动趋势图 -->
      <div class="bg-card rounded-lg overflow-hidden shadow-theme lg:col-span-2">
        <div class="p-4 border-b border-subtle">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-heading">活动趋势</h3>
            <div class="flex space-x-2">
              <button 
                v-for="(period, index) in periods" 
                :key="index"
                @click="setActivePeriod(period.value)"
                class="px-3 py-1 text-sm rounded-md transition-colors duration-200"
                :class="activePeriod === period.value ? 'bg-accent text-white' : 'text-muted hover:bg-tertiary'"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="p-4">
          <LineChart :chartData="activityData" :height="'300px'" />
        </div>
      </div>
      
      <!-- 数据分布图 -->
      <div class="bg-card rounded-lg overflow-hidden shadow-theme">
        <div class="p-4 border-b border-subtle">
          <h3 class="text-lg font-medium text-heading">数据分布</h3>
        </div>
        <div class="p-4">
          <PieChart :chartData="distributionData" :height="'300px'" />
        </div>
      </div>
    </div>
    
    <!-- 最近活动 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 最近活动列表 -->
      <div class="bg-card rounded-lg overflow-hidden shadow-theme lg:col-span-2">
        <div class="p-4 border-b border-subtle">
          <h3 class="text-lg font-medium text-heading">最近活动</h3>
        </div>
        <div class="p-4">
          <ul class="divide-y divide-subtle">
            <li v-for="(activity, index) in recentActivities" :key="index" class="py-3 flex items-start">
              <div 
                class="activity-icon w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                :class="activity.iconClass"
              >
                <i :class="activity.icon"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-heading font-medium">{{ activity.title }}</p>
                <p class="text-sm text-muted mt-1">{{ activity.description }}</p>
              </div>
              <div class="text-right text-sm text-muted">
                <p>{{ activity.time }}</p>
                <p 
                  class="mt-1 px-2 py-0.5 rounded-full text-xs inline-block"
                  :class="activity.statusClass"
                >
                  {{ activity.status }}
                </p>
              </div>
            </li>
          </ul>
          
          <div class="mt-4 text-center">
            <button class="text-accent hover:text-accent-hover text-sm">
              查看全部活动 <i class="fa-solid fa-angle-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 系统公告 -->
      <div class="bg-card rounded-lg overflow-hidden shadow-theme">
        <div class="p-4 border-b border-subtle">
          <h3 class="text-lg font-medium text-heading">系统公告</h3>
        </div>
        <div class="p-4">
          <ul class="space-y-4">
            <li v-for="(notice, index) in systemNotices" :key="index" class="border-l-2 pl-4" :class="notice.borderClass">
              <span class="text-xs px-2 py-0.5 rounded-full" :class="notice.tagClass">{{ notice.tag }}</span>
              <h4 class="text-heading font-medium mt-2">{{ notice.title }}</h4>
              <p class="text-sm text-muted mt-1">{{ notice.content }}</p>
              <p class="text-xs text-muted mt-2">{{ notice.time }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import LineChart from '../components/charts/LineChart.vue'
import PieChart from '../components/charts/PieChart.vue'

// 获取主题信息
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)

// 活动周期数据
const periods = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '全年', value: 'year' }
]
const activePeriod = ref('month')

// 设置活动周期
const setActivePeriod = (period) => {
  activePeriod.value = period
}

// 活动趋势数据
const activityData = computed(() => {
  // 基于主题设置图表颜色
  const primaryColor = currentTheme.value === 'cyberpunk' 
    ? 'oklch(70% 0.3 320)' 
    : currentTheme.value === 'dark'
      ? 'oklch(70% 0.2 255)'
      : currentTheme.value === 'green'
        ? 'oklch(50% 0.15 145)'
        : 'oklch(60% 0.15 255)'
  
  const secondaryColor = currentTheme.value === 'cyberpunk'
    ? 'oklch(60% 0.3 180)'
    : currentTheme.value === 'dark'
      ? 'oklch(60% 0.15 280)'
      : currentTheme.value === 'green'
        ? 'oklch(45% 0.15 180)'
        : 'oklch(60% 0.1 220)'
  
  return {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    datasets: [
      {
        label: '用户增长',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: primaryColor,
        tension: 0.3
      },
      {
        label: '活跃度',
        data: [28, 48, 40, 19, 86, 27, 90],
        fill: false,
        borderColor: secondaryColor,
        tension: 0.3
      }
    ]
  }
})

// 数据分布图数据
const distributionData = computed(() => {
  // 基于主题设置图表颜色
  let colors = []
  
  if (currentTheme.value === 'cyberpunk') {
    colors = [
      'oklch(70% 0.3 320)',
      'oklch(60% 0.3 180)',
      'oklch(65% 0.35 350)',
      'oklch(70% 0.3 220)'
    ]
  } else if (currentTheme.value === 'dark') {
    colors = [
      'oklch(70% 0.2 255)',
      'oklch(60% 0.15 280)',
      'oklch(65% 0.18 230)',
      'oklch(55% 0.2 270)'
    ]
  } else if (currentTheme.value === 'green') {
    colors = [
      'oklch(50% 0.15 145)',
      'oklch(45% 0.15 180)',
      'oklch(40% 0.18 145)',
      'oklch(55% 0.12 160)'
    ]
  } else { // light theme
    colors = [
      'oklch(60% 0.15 255)',
      'oklch(60% 0.1 220)',
      'oklch(55% 0.15 240)',
      'oklch(65% 0.1 200)'
    ]
  }
  
  return {
    labels: ['产品A', '产品B', '产品C', '产品D'],
    datasets: [{
      data: [40, 20, 30, 10],
      backgroundColor: colors,
      hoverOffset: 4
    }]
  }
})

// 最近活动数据
const recentActivities = [
  {
    icon: 'fa-solid fa-user',
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    title: '新用户注册',
    description: '张三完成了账号注册',
    time: '10分钟前',
    status: '已完成',
    statusClass: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
  },
  {
    icon: 'fa-solid fa-shopping-cart',
    iconClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    title: '新订单创建',
    description: '用户李四创建了新订单 #38293',
    time: '30分钟前',
    status: '处理中',
    statusClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
  },
  {
    icon: 'fa-solid fa-comment',
    iconClass: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
    title: '新留言',
    description: '客户王五在订单 #37123 下留言',
    time: '1小时前',
    status: '待回复',
    statusClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
  },
  {
    icon: 'fa-solid fa-truck',
    iconClass: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
    title: '订单发货',
    description: '订单 #36091 已发货',
    time: '3小时前',
    status: '已完成',
    statusClass: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
  },
  {
    icon: 'fa-solid fa-exclamation-circle',
    iconClass: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
    title: '系统警告',
    description: '服务器负载过高，已自动扩容',
    time: '5小时前',
    status: '已解决',
    statusClass: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
  }
]

// 系统公告数据
const systemNotices = [
  {
    tag: '重要',
    title: '系统将于本周日凌晨2点进行维护',
    content: '维护期间系统将不可用，预计持续2小时。',
    time: '2024-05-12 10:30',
    tagClass: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    borderClass: 'border-red-500'
  },
  {
    tag: '新功能',
    title: '多语言支持功能上线',
    content: '现在可以在设置中切换界面语言，支持中文、英文和日文。',
    time: '2024-05-10 16:45',
    tagClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    borderClass: 'border-blue-500'
  },
  {
    tag: '提示',
    title: '如何使用新的数据分析工具',
    content: '查看帮助中心了解如何使用新上线的数据分析功能。',
    time: '2024-05-08 09:15',
    tagClass: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
    borderClass: 'border-green-500'
  }
]

// 组件加载完成后的初始化
onMounted(() => {
  console.log('Dashboard组件已加载，当前主题:', currentTheme.value)
})
</script>

<style scoped>
/* 统计卡片样式 */
.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px var(--color-shadow);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* 活动图标 */
.activity-icon {
  font-size: 1rem;
}

/* 主题特定样式 */
/* 赛博朋克主题特殊效果 */
html[data-theme='cyberpunk'] .stat-card {
  box-shadow: var(--neon-glow);
}

html[data-theme='cyberpunk'] .stat-icon i,
html[data-theme='cyberpunk'] .activity-icon i {
  text-shadow: var(--neon-text-shadow);
}

html[data-theme='cyberpunk'] .text-heading {
  text-shadow: 0 0 2px currentColor;
}

/* 绿色主题特殊效果 */
html[data-theme='green'] .stat-card,
html[data-theme='green'] .bg-card {
  border-radius: 16px;
  transition: all 0.4s ease;
}

html[data-theme='green'] .theme-emphasis {
  background: linear-gradient(135deg, oklch(70% 0.12 145), oklch(75% 0.10 170));
  border-radius: 4px;
  padding: 2px 6px;
}

/* 黑暗主题特殊效果 */
html[data-theme='dark'] .stat-card,
html[data-theme='dark'] .bg-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .dashboard {
    padding: 1rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
}
</style>
