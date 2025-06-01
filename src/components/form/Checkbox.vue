<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number, Boolean],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).substring(2, 9)}`
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue
})

const checkboxClasses = computed(() => {
  return [
    'form-checkbox relative appearance-none border rounded transition-all duration-200 ease-in-out cursor-pointer',
    {
      'w-3 h-3': props.size === 'sm',
      'w-4 h-4': props.size === 'md',
      'w-5 h-5': props.size === 'lg',
      'opacity-50 cursor-not-allowed': props.disabled,
      'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800': !isChecked.value,
      'border-primary-500 bg-primary-500 dark:border-primary-400 dark:bg-primary-400': isChecked.value
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

const handleChange = (event) => {
  if (props.disabled) return
  
  const checked = event.target.checked
  
  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    
    if (checked) {
      if (!newValue.includes(props.value)) {
        newValue.push(props.value)
      }
    } else {
      const index = newValue.indexOf(props.value)
      if (index !== -1) {
        newValue.splice(index, 1)
      }
    }
    
    emit('update:modelValue', newValue)
    emit('change', newValue)
  } else {
    emit('update:modelValue', checked)
    emit('change', checked)
  }
}
</script>

<template>
  <label :for="id" class="form-checkbox-wrapper inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      :id="id"
      :checked="isChecked"
      :disabled="disabled"
      :class="checkboxClasses"
      @change="handleChange"
    />
    <span v-if="isChecked" class="checkbox-icon absolute pointer-events-none">
      <i class="fa-solid fa-check text-white text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
    </span>
    <span v-if="label" :class="labelClasses">{{ label }}</span>
  </label>
</template>

<style scoped>
.form-checkbox-wrapper {
  transition: all 0.2s ease;
}

.form-checkbox-wrapper:hover .form-checkbox:not(:disabled) {
  border-color: var(--color-accent);
}

.form-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.form-checkbox:checked::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: checkbox-pop 0.2s ease-in-out forwards;
}

@keyframes checkbox-pop {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
</style> 