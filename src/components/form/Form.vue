<script setup>
import { provide, reactive, toRefs, ref } from 'vue'

const props = defineProps({
  // 表单数据对象
  model: {
    type: Object,
    required: true
  },
  // 表单验证规则
  rules: {
    type: Object,
    default: () => ({})
  },
  // 表单布局方式
  layout: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal', 'inline'].includes(value)
  },
  // 标签宽度（仅在horizontal布局中有效）
  labelWidth: {
    type: String,
    default: '120px'
  },
  // 是否禁用表单
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'reset', 'validate'])

// 表单验证状态
const formState = reactive({
  isValid: true,
  errors: {},
  touched: {},
  dirty: {},
  validated: false
})

// 表单引用
const formRef = ref(null)

// 验证单个字段
const validateField = (field) => {
  if (!props.rules[field]) return true
  
  const value = props.model[field]
  const rules = props.rules[field]
  let isValid = true
  let errorMessage = ''
  
  // 标记字段为已触碰
  formState.touched[field] = true
  
  // 遍历字段的所有验证规则
  for (const rule of rules) {
    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      isValid = false
      errorMessage = rule.message || '此字段为必填项'
      break
    }
    
    // 自定义验证函数
    if (rule.validator && typeof rule.validator === 'function') {
      const validationResult = rule.validator(value, props.model)
      if (validationResult !== true) {
        isValid = false
        errorMessage = validationResult || rule.message || '验证失败'
        break
      }
    }
    
    // 正则验证
    if (rule.pattern && !rule.pattern.test(value)) {
      isValid = false
      errorMessage = rule.message || '格式不正确'
      break
    }
  }
  
  // 更新错误状态
  if (!isValid) {
    formState.errors[field] = errorMessage
  } else {
    delete formState.errors[field]
  }
  
  return isValid
}

// 验证整个表单
const validate = () => {
  formState.validated = true
  let isValid = true
  
  // 验证所有字段
  for (const field in props.rules) {
    if (!validateField(field)) {
      isValid = false
    }
  }
  
  formState.isValid = isValid
  emit('validate', isValid, formState.errors)
  
  return isValid
}

// 重置表单
const reset = () => {
  // 重置验证状态
  formState.isValid = true
  formState.errors = {}
  formState.touched = {}
  formState.dirty = {}
  formState.validated = false
  
  // 重置表单元素
  if (formRef.value) {
    formRef.value.reset()
  }
  
  emit('reset')
}

// 处理表单提交
const handleSubmit = (event) => {
  event.preventDefault()
  
  // 验证表单
  const isValid = validate()
  
  // 提交表单
  emit('submit', {
    isValid,
    model: props.model,
    errors: formState.errors
  })
  
  return isValid
}

// 为子组件提供表单上下文
provide('form', {
  model: props.model,
  disabled: props.disabled,
  layout: props.layout,
  labelWidth: props.labelWidth,
  validateField,
  formState: toRefs(formState)
})
</script>

<template>
  <form
    ref="formRef"
    @submit="handleSubmit"
    @reset="reset"
    :class="[
      'form',
      `form-${layout}`,
      { 'form-disabled': disabled }
    ]"
  >
    <slot></slot>
  </form>
</template>

<style scoped>
.form {
  transition: all 0.3s ease;
}

.form-horizontal {
  display: flex;
  flex-direction: column;
}

.form-horizontal :deep(.form-group) {
  display: flex;
  align-items: flex-start;
}

.form-horizontal :deep(.form-label) {
  width: v-bind(labelWidth);
  text-align: right;
  padding-right: 1rem;
  margin-bottom: 0;
  padding-top: 0.5rem;
}

.form-horizontal :deep(.form-control-wrapper) {
  flex: 1;
}

.form-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.form-inline :deep(.form-group) {
  margin-bottom: 0;
}

.form-disabled :deep(*) {
  pointer-events: none;
  opacity: 0.7;
}
</style> 