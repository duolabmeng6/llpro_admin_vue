<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 时间格式化
const currentTime = ref('00:00:00')
const currentDate = ref('')
const currentWeekday = ref('')

// 星期几的中文表示
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 更新时间和日期
const updateDateTime = () => {
  const now = new Date()
  
  // 更新时间 (时:分:秒)
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
  
  // 更新日期 (年-月-日)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  currentDate.value = `${year}-${month}-${day}`
  
  // 更新星期几
  currentWeekday.value = `星期${weekdays[now.getDay()]}`
}

// 定时器引用
let timer = null

onMounted(() => {
  // 立即更新一次
  updateDateTime()
  
  // 设置定时器，每秒更新一次
  timer = setInterval(updateDateTime, 1000)
})

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="datetime-container">
    <div class="time-display">
      <i class="fas fa-clock mr-2 text-accent"></i>
      <span class="time">{{ currentTime }}</span>
    </div>
    <div class="date-display">
      <span class="date">{{ currentDate }}</span>
      <span class="weekday ml-2">{{ currentWeekday }}</span>
    </div>
  </div>
</template>

<style scoped>
.datetime-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time-display {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
}

.time {
  font-family: 'JetBrains Mono', monospace, sans-serif;
  letter-spacing: 0.5px;
}

.date-display {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 2px;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .datetime-container {
    display: none;
  }
}
</style> 