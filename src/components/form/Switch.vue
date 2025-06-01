<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'danger', 'warning', 'info'].includes(value)
  },
  id: {
    type: String,
    default: () => `switch-${Math.random().toString(36).substring(2, 9)}`
  },
  labelPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const switchClasses = computed(() => {
  return [
    'form-switch relative inline-flex items-center cursor-pointer transition-colors duration-300 ease-in-out rounded-full',
    {
      'opacity-50 cursor-not-allowed': props.disabled,
      'bg-primary-500 dark:bg-primary-600': props.modelValue && props.color === 'primary',
      'bg-green-500 dark:bg-green-600': props.modelValue && props.color === 'success',
      'bg-red-500 dark:bg-red-600': props.modelValue && props.color === 'danger',
      'bg-yellow-500 dark:bg-yellow-600': props.modelValue && props.color === 'warning',
      'bg-blue-500 dark:bg-blue-600': props.modelValue && props.color === 'info',
      'bg-gray-300 dark:bg-gray-600': !props.modelValue,
      'h-5 w-9': props.size === 'sm',
      'h-6 w-11': props.size === 'md',
      'h-7 w-14': props.size === 'lg'
    }
  ]
})

const toggleClasses = computed(() => {
  return [
    'form-switch-toggle absolute bg-white rounded-full transform transition-transform duration-300 ease-in-out shadow-md',
    {
      'translate-x-full': props.modelValue,
      'translate-x-0': !props.modelValue,
      'h-3.5 w-3.5 left-1 top-0.75': props.size === 'sm',
      'h-4.5 w-4.5 left-1 top-0.75': props.size === 'md',
      'h-5.5 w-5.5 left-1 top-0.75': props.size === 'lg'
    }
  ]
})

const labelClasses = computed(() => {
  return [
    'select-none',
    {
      'text-xs': props.size === 'sm',
      'text-sm': props.size === 'md',
      'text-base': props.size === 'lg',
      'mr-2': props.labelPosition === 'left',
      'ml-2': props.labelPosition === 'right',
      'opacity-50': props.disabled
    }
  ]
})

const toggle = () => {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
  emit('change', !props.modelValue)
}
</script>

<template>
  <div class="form-switch-wrapper inline-flex items-center">
    <label v-if="label && labelPosition === 'left'" :for="id" :class="labelClasses">{{ label }}</label>
    
    <button
      type="button"
      :id="id"
      :class="switchClasses"
      :disabled="disabled"
      @click="toggle"
      role="switch"
      :aria-checked="modelValue"
    >
      <span class="sr-only">{{ label || 'Toggle' }}</span>
      <span :class="toggleClasses"></span>
    </button>
    
    <label v-if="label && labelPosition === 'right'" :for="id" :class="labelClasses">{{ label }}</label>
  </div>
</template>

<style scoped>
.form-switch {
  will-change: background-color;
}

.form-switch:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.form-switch-toggle {
  will-change: transform;
}

/* 自定义尺寸 */
.h-3.5 {
  height: 0.875rem;
}

.w-3.5 {
  width: 0.875rem;
}

.h-4.5 {
  height: 1.125rem;
}

.w-4.5 {
  width: 1.125rem;
}

.h-5.5 {
  height: 1.375rem;
}

.w-5.5 {
  width: 1.375rem;
}

.top-0.75 {
  top: 0.1875rem;
}

/* 悬停效果 */
.form-switch:not(:disabled):hover {
  filter: brightness(1.05);
}

/* 点击效果 */
.form-switch:not(:disabled):active .form-switch-toggle {
  transform: scale(0.95) translate(var(--switch-translate-x, 0));
}

.form-switch:not(:disabled):active .form-switch-toggle {
  --switch-translate-x: 100%;
}
</style> 