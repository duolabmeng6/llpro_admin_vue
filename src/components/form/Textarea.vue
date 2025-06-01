<script setup>
import { computed, ref, onMounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  },
  maxRows: {
    type: Number,
    default: 10
  },
  autoResize: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substring(2, 9)}`
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'input'])

const textareaRef = ref(null)
const hasError = computed(() => props.error !== '')

const textareaClasses = computed(() => {
  return [
    'form-textarea block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-shadow duration-200',
    {
      'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': hasError.value,
      'border-gray-300 focus:ring-primary-500 focus:border-primary-500': !hasError.value,
      'opacity-50 cursor-not-allowed': props.disabled
    }
  ]
})

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event.target.value)
  
  if (props.autoResize) {
    autoResize()
  }
}

const handleChange = (event) => {
  emit('change', event.target.value)
}

const autoResize = () => {
  if (!props.autoResize || !textareaRef.value) return
  
  // 重置高度以获取正确的scrollHeight
  textareaRef.value.style.height = 'auto'
  
  // 计算新高度
  const lineHeight = parseInt(getComputedStyle(textareaRef.value).lineHeight)
  const minHeight = props.rows * lineHeight
  const maxHeight = props.maxRows * lineHeight
  
  const newHeight = Math.min(Math.max(textareaRef.value.scrollHeight, minHeight), maxHeight)
  textareaRef.value.style.height = `${newHeight}px`
}

watch(() => props.modelValue, () => {
  if (props.autoResize) {
    // 使用nextTick确保DOM已更新
    setTimeout(autoResize, 0)
  }
})

onMounted(() => {
  if (props.autoResize) {
    autoResize()
  }
})
</script>

<template>
  <textarea
    ref="textareaRef"
    :id="id"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :class="textareaClasses"
    @input="updateValue"
    @change="handleChange"
  ></textarea>
</template>

<style scoped>
.form-textarea {
  resize: vertical;
  min-height: 2.5rem;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  transform: scale(1.005);
}

.form-textarea:disabled {
  resize: none;
}
</style> 