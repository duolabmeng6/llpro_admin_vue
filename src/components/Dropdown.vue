<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  // 选项列表，支持icon, label, value
  options: {
    type: Array,
    default: () => []
  },
  // 当前选中值
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: null
  },
  // 占位文本
  placeholder: {
    type: String,
    default: '请选择'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 自定义宽度
  width: {
    type: String,
    default: '100%'
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: true
  },
  // 设置一个自定义的触发器，如果设置了，则不显示默认触发器
  customTrigger: {
    type: Boolean,
    default: false
  },
  // 下拉菜单方向，top或bottom
  placement: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'bottom'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 获取主题store
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)

// 下拉菜单显示状态
const isOpen = ref(false)
// 下拉菜单元素引用
const dropdownRef = ref(null)

// 当前选中项
const selectedItem = computed(() => {
  if (props.modelValue === null) return null
  return props.options.find(option => option.value === props.modelValue) || null
})

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

// 关闭下拉菜单
const closeDropdown = () => {
  isOpen.value = false
}

// 选择选项
const selectOption = (option) => {
  if (props.disabled) return
  
  emit('update:modelValue', option.value)
  emit('change', option.value)
  closeDropdown()
}

// 点击外部关闭下拉菜单
const handleOutsideClick = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// 按ESC键关闭下拉菜单
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeyDown)
  
  // 为选项添加出现动画延迟
  addOptionAnimationDelays()
})

// 为选项添加出现动画延迟
const addOptionAnimationDelays = () => {
  nextTick(() => {
    const optionElements = document.querySelectorAll('.dropdown-option')
    optionElements.forEach((element, index) => {
      element.style.animationDelay = `${index * 0.03}s`
    })
  })
}

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeyDown)
})

// 计算选项列表位置和尺寸
const optionsPosition = ref({
  width: '100%',
  maxHeight: '200px'
})

// 当下拉菜单状态变化时，重新计算位置
watch(isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      updateOptionsPosition()
      addOptionAnimationDelays()
    })
  }
})

// 更新选项列表位置
const updateOptionsPosition = () => {
  if (dropdownRef.value) {
    const triggerEl = dropdownRef.value.querySelector('.dropdown-trigger')
    if (triggerEl) {
      optionsPosition.value.width = `${triggerEl.offsetWidth}px`
    }
  }
}

// 应用选项悬停效果
const applyOptionHoverEffect = (optionEl) => {
  if (!optionEl) return
  
  optionEl.classList.add('dropdown-option-hover-effect')
  setTimeout(() => {
    optionEl.classList.remove('dropdown-option-hover-effect')
  }, 300)
}
</script>

<template>
  <div 
    ref="dropdownRef" 
    class="dropdown" 
    :style="{ width: width }"
  >
    <!-- 自定义触发器 -->
    <div 
      v-if="customTrigger"
      class="dropdown-trigger"
      :class="{
        'dropdown-trigger-disabled': disabled
      }"
      @click="toggleDropdown"
    >
      <slot name="trigger"></slot>
    </div>
    
    <!-- 默认触发器 -->
    <div 
      v-else
      class="dropdown-trigger bg-elevated border border-subtle text-body"
      :class="{
        'dropdown-trigger-active': isOpen,
        'dropdown-trigger-disabled': disabled
      }"
      @click="toggleDropdown"
    >
      <!-- 选中项或占位符 -->
      <div class="dropdown-selected">
        <i 
          v-if="showIcon && selectedItem && selectedItem.icon" 
          :class="selectedItem.icon" 
          class="dropdown-icon"
        ></i>
        <span class="dropdown-label">
          {{ selectedItem ? selectedItem.label : placeholder }}
        </span>
      </div>
      
      <!-- 下拉箭头 -->
      <i 
        class="fa-solid fa-chevron-down dropdown-arrow text-secondary"
        :class="{ 'dropdown-arrow-open': isOpen }"
      ></i>
    </div>
    
    <!-- 选项列表 -->
    <transition :name="`dropdown-${placement}`">
      <div
        v-if="isOpen"
        class="dropdown-options bg-card border border-subtle shadow-theme-lg"
        :class="{
          'dropdown-options-top': placement === 'top',
          'dropdown-options-bottom': placement === 'bottom'
        }"
        :style="optionsPosition"
      >
        <template v-if="options.length > 0">
          <div
            v-for="(option, index) in options"
            :key="option.value"
            class="dropdown-option text-body"
            :class="{
              'dropdown-option-selected': option.value === modelValue
            }"
            @click="selectOption(option)"
            @mouseenter="applyOptionHoverEffect($event.target)"
          >
            <i 
              v-if="showIcon && option.icon" 
              :class="option.icon"
              class="dropdown-option-icon"
            ></i>
            <span class="dropdown-option-label">{{ option.label }}</span>
          </div>
        </template>
        <div v-else class="dropdown-empty text-secondary">
          无可用选项
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
  user-select: none;
  font-size: 0.875rem;
}

/* 触发器样式 */
.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 2.5rem;
}

.dropdown-trigger:hover:not(.dropdown-trigger-disabled) {
  border-color: var(--color-accent);
}

.dropdown-trigger-active {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 25%, transparent);
}

/* 禁用状态 */
.dropdown-trigger-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 选中项样式 */
.dropdown-selected {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 图标样式 */
.dropdown-icon {
  margin-right: 0.5rem;
  font-size: 0.875rem;
}

/* 标签样式 */
.dropdown-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 箭头样式 */
.dropdown-arrow {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow-open {
  transform: rotate(180deg);
}

/* 选项列表容器 */
.dropdown-options {
  position: absolute;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 0.375rem;
  z-index: 10;
  transition: transform 0.2s ease, opacity 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dropdown-options-bottom {
  top: calc(100% + 0.25rem);
}

.dropdown-options-top {
  bottom: calc(100% + 0.25rem);
}

/* 选项样式 */
.dropdown-option {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
  animation: dropdown-option-in 0.2s ease forwards;
  opacity: 0;
  transform: translateY(5px);
}

.dropdown-option:hover {
  background-color: var(--color-bg-tertiary);
}

.dropdown-option-selected {
  background-color: color-mix(in oklab, var(--color-accent) 15%, transparent);
  color: var(--color-accent);
}

/* 选项动画 */
@keyframes dropdown-option-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 选项悬停效果 */
.dropdown-option-hover-effect {
  animation: dropdown-option-pulse 0.3s ease-out;
}

@keyframes dropdown-option-pulse {
  0% { background-color: transparent; }
  50% { background-color: var(--color-bg-tertiary); }
  100% { background-color: transparent; }
}

/* 选项图标 */
.dropdown-option-icon {
  margin-right: 0.5rem;
  font-size: 0.875rem;
}

/* 空状态 */
.dropdown-empty {
  padding: 0.75rem;
  text-align: center;
  font-style: italic;
}

/* 下拉动画 */
.dropdown-bottom-enter-active,
.dropdown-bottom-leave-active,
.dropdown-top-enter-active,
.dropdown-top-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-bottom-enter-from,
.dropdown-bottom-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-top-enter-from,
.dropdown-top-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 主题过渡延迟应用 */
.theme-transition .dropdown-trigger {
  transition-delay: calc(var(--theme-transition-delay-unit) * 2);
}

.theme-transition .dropdown-options {
  transition-delay: calc(var(--theme-transition-delay-unit) * 3);
}

.theme-transition .dropdown-option {
  transition-delay: calc(var(--theme-transition-delay-unit) * 4);
}
</style> 