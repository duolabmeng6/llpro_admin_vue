<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索...'
  },
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autoFocus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

// 内部输入值
const inputValue = ref(props.modelValue)

// 是否正在搜索
const isSearching = ref(false)

// 搜索延迟计时器
let searchTimer = null

// 监听外部值的变化
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

// 处理输入变化
const handleInput = (e) => {
  const value = e.target.value
  inputValue.value = value
  emit('update:modelValue', value)
  
  // 清除之前的计时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  // 设置新的延迟搜索计时器
  searchTimer = setTimeout(() => {
    if (value.trim() !== '') {
      isSearching.value = true
      emit('search', value)
    }
  }, 300)
}

// 清空搜索
const clearSearch = () => {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
  isSearching.value = false
}

// 执行搜索
const triggerSearch = () => {
  if (inputValue.value.trim() !== '') {
    isSearching.value = true
    emit('search', inputValue.value)
  }
}

// 焦点处理
const handleFocus = () => {
  if (inputValue.value.trim() !== '') {
    isSearching.value = true
  }
}

const handleBlur = () => {
  // 延迟隐藏搜索状态，以便用户可以点击搜索结果
  setTimeout(() => {
    isSearching.value = false
  }, 200)
}
</script>

<template>
  <div class="search-input-container relative">
    <!-- 搜索输入框 -->
    <div class="flex items-center relative">
      <input
        type="text"
        :value="inputValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="triggerSearch"
        :placeholder="placeholder"
        :disabled="disabled"
        :autofocus="autoFocus"
        class="search-input w-full py-1.5 px-5 rounded-lg bg-bg-tertiary border border-subtle focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
        :class="{ 'opacity-75 cursor-not-allowed': disabled }"
      />
      
      <!-- 搜索图标在右侧 -->
      <button
        @click="triggerSearch"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary-500 transition-colors duration-200"
        type="button"
      >
        <i class="fas fa-search"></i>
      </button>
      
      <!-- 清除按钮 -->
      <button
        v-if="inputValue"
        @click="clearSearch"
        class="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary-500 transition-colors duration-200"
        type="button"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-input {
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
  width: 100%;
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

html[data-theme="light"] .search-input {
  background-color: var(--color-bg-tertiary);
}

html[data-theme="dark"] .search-input {
  background-color: color-mix(in oklab, var(--color-bg-tertiary) 70%, black);
}

html[data-theme="cyberpunk"] .search-input {
  background-color: color-mix(in oklab, var(--color-bg-tertiary) 70%, black);
  border-color: var(--color-accent);
}

html[data-theme="green"] .search-input {
  background-color: color-mix(in oklab, var(--color-bg-tertiary) 80%, white);
}
</style> 