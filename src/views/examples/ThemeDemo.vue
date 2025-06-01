<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">主题切换演示</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 主题切换器 -->
      <div class="bg-card rounded-lg p-6 shadow">
        <h2 class="text-xl font-semibold mb-4 text-primary">主题设置</h2>
        <p class="text-secondary mb-4">选择适合你的界面主题，所有设置将自动保存。</p>
        
        <div class="flex justify-center py-4">
          <ThemeSwitcher />
        </div>
        
        <div class="text-center text-sm text-secondary mt-4">
          当前主题: <span class="font-semibold">{{ currentThemeName }}</span>
        </div>
      </div>
      
      <!-- 主题系统信息 -->
      <div class="bg-card rounded-lg p-6 shadow">
        <h2 class="text-xl font-semibold mb-4 text-primary">关于主题系统</h2>
        <p class="text-secondary mb-4">
          本系统使用 CSS 变量和 HTML data-theme 属性实现主题切换，支持浅色、深色和赛博朋克三种主题。
        </p>
        <ul class="list-disc list-inside text-secondary space-y-2">
          <li>自动适应系统浅色/深色模式</li>
          <li>记住用户的主题偏好</li>
          <li>平滑的主题切换过渡效果</li>
          <li>使用 Tailwind CSS v4 的变量支持</li>
        </ul>
      </div>
    </div>
    
    <!-- 组件展示 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- 按钮展示 -->
      <div class="bg-card rounded-lg p-6 shadow">
        <h3 class="text-lg font-medium mb-4 text-primary">按钮</h3>
        <div class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <Button variant="primary">主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">边框按钮</Button>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button variant="success">成功按钮</Button>
            <Button variant="danger">危险按钮</Button>
            <Button variant="warning">警告按钮</Button>
          </div>
        </div>
      </div>
      
      <!-- 表单控件 -->
      <div class="bg-card rounded-lg p-6 shadow">
        <h3 class="text-lg font-medium mb-4 text-primary">表单控件</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-secondary text-sm mb-1">输入框</label>
            <input type="text" class="w-full rounded-md border border-theme bg-input-bg text-input-text p-2" placeholder="请输入内容" />
          </div>
          <div>
            <label class="block text-secondary text-sm mb-1">选择框</label>
            <select class="w-full rounded-md border border-theme bg-input-bg text-input-text p-2">
              <option>选项一</option>
              <option>选项二</option>
              <option>选项三</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 卡片样式 -->
      <div class="bg-card rounded-lg p-6 shadow">
        <h3 class="text-lg font-medium mb-4 text-primary">卡片样式</h3>
        <div class="border border-theme p-4 rounded-md bg-tertiary">
          <h4 class="font-medium text-primary">卡片标题</h4>
          <p class="text-sm text-secondary mt-2">这是一个简单的卡片内容，展示不同主题下的样式变化。</p>
        </div>
      </div>
    </div>
    
    <!-- 颜色展示 -->
    <h2 class="text-xl font-semibold mb-4 text-primary">主题颜色</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="(color, index) in colors" :key="index" class="rounded-md overflow-hidden">
        <div :class="color.bgClass" class="h-24 flex items-center justify-center">
          <span :class="color.textClass" class="font-medium">{{ color.name }}</span>
        </div>
        <div class="p-2 bg-card border-t border-theme">
          <span class="text-sm text-secondary">{{ color.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../../stores/theme'
import ThemeSwitcher from '../../components/ThemeSwitcher.vue'
import Button from '../../components/Button.vue'

const themeStore = useThemeStore()

// 当前主题名称
const currentThemeName = computed(() => {
  const theme = themeStore.getCurrentTheme()
  return theme ? theme.name : '默认主题'
})

// 颜色展示
const colors = [
  { name: '主背景色', bgClass: 'bg-primary', textClass: 'text-primary', description: '--color-bg-primary' },
  { name: '次背景色', bgClass: 'bg-secondary', textClass: 'text-primary', description: '--color-bg-secondary' },
  { name: '三级背景色', bgClass: 'bg-tertiary', textClass: 'text-primary', description: '--color-bg-tertiary' },
  { name: '卡片背景', bgClass: 'bg-card', textClass: 'text-primary', description: '--color-card-bg' },
  { name: '主要文本', bgClass: 'bg-card', textClass: 'text-primary', description: '--color-text-primary' },
  { name: '次要文本', bgClass: 'bg-card', textClass: 'text-secondary', description: '--color-text-secondary' },
  { name: '主要按钮', bgClass: 'bg-button-primary', textClass: 'text-button-primary', description: '--color-button-primary-bg' },
  { name: '次要按钮', bgClass: 'bg-button-secondary', textClass: 'text-button-secondary', description: '--color-button-secondary-bg' }
]
</script>