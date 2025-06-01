<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  labelFor: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  inline: {
    type: Boolean,
    default: false
  }
})

const hasError = computed(() => props.error !== '')

// 生成唯一ID，用于关联label和表单控件
const groupId = computed(() => {
  return props.labelFor || `form-group-${Math.random().toString(36).substring(2, 9)}`
})
</script>

<template>
  <div :class="['form-group', { 'form-inline': inline }]">
    <label 
      v-if="label" 
      :for="groupId" 
      class="form-label block text-sm font-medium mb-1"
    >
      {{ label }}
      <span v-if="required" class="form-required text-red-500">*</span>
    </label>
    
    <div class="form-control-wrapper">
      <slot></slot>
    </div>
    
    <p v-if="error" class="form-error-message mt-1 text-sm">{{ error }}</p>
    <p v-else-if="helpText" class="form-help-text mt-1 text-sm">{{ helpText }}</p>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 1.25rem;
  transition: all 0.3s ease;
}

.form-inline {
  display: flex;
  align-items: center;
}

.form-inline .form-label {
  margin-bottom: 0;
  margin-right: 0.75rem;
  min-width: 8rem;
}

.form-inline .form-control-wrapper {
  flex: 1;
}

.form-control-wrapper {
  position: relative;
}
</style> 