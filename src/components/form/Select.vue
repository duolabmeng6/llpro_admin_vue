<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectRef = ref(null)
const isOpen = ref(false)
const selectedLabel = ref('')

const hasError = computed(() => props.error !== '')

const selectClasses = computed(() => {
  return [
    'form-select block w-full px-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 appearance-none',
    {
      'py-1.5 text-xs': props.size === 'sm',
      'py-2 text-sm': props.size === 'md',
      'py-2.5 text-base': props.size === 'lg',
      'border-red-300 focus:ring-red-500 focus:border-red-500': hasError.value,
      'border-gray-300 focus:ring-primary-500 focus:border-primary-500': !hasError.value,
      'opacity-50 cursor-not-allowed': props.disabled
    }
  ]
})

const updateValue = (value, label) => {
  if (props.disabled) return
  
  emit('update:modelValue', value)
  emit('change', value)
  
  if (!props.multiple) {
    selectedLabel.value = label
    isOpen.value = false
  }
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const closeDropdown = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

// 初始化选中项的标签
const initSelectedLabel = () => {
  if (props.modelValue && !props.multiple) {
    const selected = props.options.find(option => 
      option.value === props.modelValue || 
      (option.options && option.options.some(subOption => subOption.value === props.modelValue))
    )
    
    if (selected) {
      selectedLabel.value = selected.label
    } else {
      // 查找嵌套选项
      for (const option of props.options) {
        if (option.options) {
          const subOption = option.options.find(sub => sub.value === props.modelValue)
          if (subOption) {
            selectedLabel.value = subOption.label
            break
          }
        }
      }
    }
  } else {
    selectedLabel.value = ''
  }
}

watch(() => props.modelValue, initSelectedLabel)
watch(() => props.options, initSelectedLabel)

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  initSelectedLabel()
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <div ref="selectRef" class="select-container relative">
    <div
      :class="selectClasses"
      @click="toggleDropdown"
      :id="id"
      :tabindex="disabled ? -1 : 0"
    >
      <div class="flex items-center justify-between">
        <span v-if="modelValue && selectedLabel" class="selected-value">
          {{ selectedLabel }}
        </span>
        <span v-else class="text-gray-400">{{ placeholder }}</span>
        <span class="select-arrow ml-2">
          <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300" 
             :class="{'transform rotate-180': isOpen}"></i>
        </span>
      </div>
    </div>
    
    <div v-if="isOpen" class="select-dropdown absolute w-full mt-1 z-10 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
      <template v-for="(option, index) in options" :key="index">
        <!-- 选项组 -->
        <template v-if="option.options">
          <div class="select-group-label px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            {{ option.label }}
          </div>
          <div 
            v-for="(subOption, subIndex) in option.options" 
            :key="`${index}-${subIndex}`"
            class="select-option px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            :class="{'bg-gray-100 dark:bg-gray-700': subOption.value === modelValue}"
            @click="updateValue(subOption.value, subOption.label)"
          >
            {{ subOption.label }}
          </div>
        </template>
        
        <!-- 普通选项 -->
        <div 
          v-else
          class="select-option px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          :class="{'bg-gray-100 dark:bg-gray-700': option.value === modelValue}"
          @click="updateValue(option.value, option.label)"
        >
          {{ option.label }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.select-container {
  user-select: none;
}

.select-dropdown {
  transform-origin: top;
  animation: selectDropdown 0.2s ease-out;
}

@keyframes selectDropdown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.select-option {
  transition: background-color 0.2s ease;
}

.select-arrow {
  pointer-events: none;
}
</style> 