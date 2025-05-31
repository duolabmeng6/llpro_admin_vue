<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary-600">404</h1>
      <h2 class="mt-4 text-3xl font-bold text-gray-900">页面未找到</h2>
      <p class="mt-2 text-base text-gray-500">
        抱歉，我们找不到您要访问的页面。
      </p>
      <div class="mt-6 flex justify-center space-x-4">
        <button
          @click="goBack"
          class="btn btn-outline"
        >
          返回上一页
        </button>
        <button
          @click="goHome"
          class="btn btn-primary"
        >
          返回仪表盘
        </button>
      </div>
    </div>
  </div>
</template> 