<template>
  <div class="bar-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

// 注册Chart.js组件
Chart.register(...registerables)

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: String,
    default: '300px'
  }
})

const chartCanvas = ref(null)
let chart = null

// 创建图表实例
const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: props.chartData,
    options: { ...defaultOptions, ...props.chartOptions }
  })
}

// 监听数据变化，更新图表
watch(() => props.chartData, () => {
  if (chart) {
    chart.data = props.chartData
    chart.update()
  } else {
    createChart()
  }
}, { deep: true })

// 监听配置变化，更新图表
watch(() => props.chartOptions, () => {
  if (chart) {
    chart.options = { ...chart.options, ...props.chartOptions }
    chart.update()
  }
}, { deep: true })

// 组件挂载时创建图表
onMounted(() => {
  createChart()
})

// 组件卸载前销毁图表
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped>
.bar-chart-container {
  position: relative;
  width: 100%;
  height: v-bind('props.height');
}
</style> 