<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const iframeUrl = ref('')
const loading = ref(true)
const error = ref(false)

// 从路由参数中获取URL
const getUrlFromRoute = () => {
  // 首先检查路由元数据是否包含外部URL（用于优雅的URL形式）
  if (route.meta.externalUrl) {
    return route.meta.externalUrl
  }
  
  // 如果没有，尝试从查询参数获取URL（兼容旧方式）
  if (route.query.url) {
    return decodeURIComponent(route.query.url)
  }
  
  return ''
}

// 处理iframe加载完成
const handleIframeLoad = () => {
  loading.value = false
}

// 处理iframe加载错误
const handleIframeError = () => {
  loading.value = false
  error.value = true
}

// 初始化URL
onMounted(() => {
  iframeUrl.value = getUrlFromRoute()
})

// 监听路由变化，更新iframe URL
watch(() => [route.query.url, route.meta.externalUrl], () => {
  loading.value = true
  error.value = false
  iframeUrl.value = getUrlFromRoute()
}, { immediate: true })
</script>

<template>
  <div class="iframe-container">
    <!-- 加载中提示 -->
    <div v-if="loading" class="iframe-loading">
      <div class="loading-spinner"></div>
      <div class="mt-4 text-center">
        <h3 class="text-lg font-semibold">正在加载外部网页</h3>
        <p class="text-sm text-muted mt-2">{{ iframeUrl }}</p>
      </div>
    </div>
    
    <!-- 加载错误提示 -->
    <div v-if="error" class="iframe-error">
      <div class="flex flex-col items-center justify-center">
        <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
        <h3 class="text-lg font-semibold">加载外部网页失败</h3>
        <p class="text-sm text-muted mt-2">{{ iframeUrl }}</p>
        <button 
          @click="iframeUrl = getUrlFromRoute(); loading = true; error = false;"
          class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md"
        >
          重试
        </button>
      </div>
    </div>
    
    <!-- iframe -->
    <iframe 
      v-if="iframeUrl" 
      :src="iframeUrl" 
      class="iframe-content"
      @load="handleIframeLoad"
      @error="handleIframeError"
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen
    ></iframe>
  </div>
</template>

<style scoped>
.iframe-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.iframe-content {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
  min-height: calc(100vh - 115px); /* 减去导航栏、选项卡栏的高度 */
}

.iframe-loading,
.iframe-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-bg-primary);
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--color-bg-tertiary);
  border-top: 5px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.text-muted {
  color: var(--color-text-secondary);
}
</style> 