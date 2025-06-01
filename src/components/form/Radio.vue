<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: () => `radio-${Math.random().toString(36).substring(2, 9)}`
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isChecked = computed(() => props.modelValue === props.value)

const radioClasses = computed(() => {
  return [
    'form-radio relative appearance-none border rounded-full transition-all duration-200 ease-in-out cursor-pointer',
    {
      'w-3 h-3': props.size === 'sm',
      'w-4 h-4': props.size === 'md',
      'w-5 h-5': props.size === 'lg',
      'opacity-50 cursor-not-allowed': props.disabled,
      'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800': !isChecked.value,
      'border-primary-500 bg-white dark:border-primary-400 dark:bg-gray-800': isChecked.value
    }
  ]
})

const labelClasses = computed(() => {
  return [
    'ml-2 select-none',
    {
      'text-xs': props.size === 'sm',
      'text-sm': props.size === 'md',
      'text-base': props.size === 'lg',
      'opacity-50': props.disabled
    }
  ]
})

const handleChange = () => {
  if (props.disabled) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<template>
  <label :for="id" class="form-radio-wrapper inline-flex items-center cursor-pointer">
    <input
      type="radio"
      :id="id"
      :name="name"
      :checked="isChecked"
      :disabled="disabled"
      :class="radioClasses"
      @change="handleChange"
    />
    <span v-if="isChecked" class="radio-dot absolute pointer-events-none">
      <span class="w-1/2 h-1/2 rounded-full bg-primary-500 dark:bg-primary-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
    </span>
    <span v-if="label" :class="labelClasses">{{ label }}</span>
  </label>
</template>

<style scoped>
.form-radio-wrapper {
  transition: all 0.2s ease;
}

.form-radio-wrapper:hover .form-radio:not(:disabled) {
  border-color: var(--color-accent);
}

.form-radio:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.radio-dot span {
  animation: radio-pop 0.2s ease-in-out forwards;
}

@keyframes radio-pop {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
</style> 