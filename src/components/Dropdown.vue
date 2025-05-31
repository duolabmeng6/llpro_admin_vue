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

// 应用主题特定的动画效果
const applyThemeEffect = (optionEl) => {
  if (!optionEl) return
  
  if (currentTheme.value === 'cyberpunk') {
    optionEl.classList.add('dropdown-option-cyber-effect')
    setTimeout(() => {
      optionEl.classList.remove('dropdown-option-cyber-effect')
    }, 600)
  } else if (currentTheme.value === 'dark') {
    optionEl.classList.add('dropdown-option-dark-effect')
    setTimeout(() => {
      optionEl.classList.remove('dropdown-option-dark-effect')
    }, 300)
  }
}
</script>

<template>
  <div 
    ref="dropdownRef" 
    class="dropdown" 
    :class="`dropdown-${currentTheme}`"
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
      class="dropdown-trigger"
      :class="{
        [`dropdown-trigger-${currentTheme}`]: true,
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
        class="fa-solid fa-chevron-down dropdown-arrow"
        :class="{ 'dropdown-arrow-open': isOpen }"
      ></i>
    </div>
    
    <!-- 选项列表 -->
    <transition :name="`dropdown-${placement}`">
      <div
        v-if="isOpen"
        class="dropdown-options"
        :class="{
          [`dropdown-options-${currentTheme}`]: true,
          'dropdown-options-top': placement === 'top',
          'dropdown-options-bottom': placement === 'bottom'
        }"
        :style="optionsPosition"
      >
        <template v-if="options.length > 0">
          <div
            v-for="(option, index) in options"
            :key="option.value"
            class="dropdown-option"
            :class="{
              [`dropdown-option-${currentTheme}`]: true,
              'dropdown-option-selected': option.value === modelValue
            }"
            @click="selectOption(option)"
            @mouseenter="applyThemeEffect($event.target)"
          >
            <i 
              v-if="showIcon && option.icon" 
              :class="option.icon"
              class="dropdown-option-icon"
            ></i>
            <span class="dropdown-option-label">{{ option.label }}</span>
          </div>
        </template>
        <div v-else class="dropdown-empty">
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
  border: 1px solid transparent;
}

/* 黑暗主题触发器 */
.dropdown-trigger-dark {
  background-color: rgba(15, 23, 42, 0.6);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.dropdown-trigger-dark:hover:not(.dropdown-trigger-disabled) {
  background-color: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

.dropdown-trigger-dark.dropdown-trigger-active {
  border-color: rgba(59, 130, 246, 0.7);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* 明亮主题触发器 */
.dropdown-trigger-light {
  background-color: #ffffff;
  color: #1e293b;
  border-color: rgba(203, 213, 225, 0.8);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dropdown-trigger-light:hover:not(.dropdown-trigger-disabled) {
  border-color: #94a3b8;
}

.dropdown-trigger-light.dropdown-trigger-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

/* 赛博朋克主题触发器 */
.dropdown-trigger-cyberpunk {
  background-color: rgba(13, 2, 33, 0.7);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 44, 240, 0.3);
  box-shadow: 0 0 5px rgba(255, 44, 240, 0.2);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.dropdown-trigger-cyberpunk:hover:not(.dropdown-trigger-disabled) {
  border-color: rgba(255, 44, 240, 0.5);
  box-shadow: 0 0 8px rgba(255, 44, 240, 0.3);
}

.dropdown-trigger-cyberpunk.dropdown-trigger-active {
  border-color: rgba(255, 44, 240, 0.8);
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.4);
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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dropdown-options-bottom {
  top: calc(100% + 0.25rem);
}

.dropdown-options-top {
  bottom: calc(100% + 0.25rem);
}

/* 深色主题选项列表 */
.dropdown-options-dark {
  background-color: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 明亮主题选项列表 */
.dropdown-options-light {
  background-color: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: #1e293b;
}

/* 赛博朋克主题选项列表 */
.dropdown-options-cyberpunk {
  background-color: rgba(28, 6, 54, 0.95);
  border: 1px solid rgba(255, 44, 240, 0.3);
  box-shadow: 0 0 15px rgba(255, 44, 240, 0.3);
  color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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

/* 选项动画 */
@keyframes dropdown-option-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 深色主题选项 */
.dropdown-option-dark {
  color: rgba(255, 255, 255, 0.9);
}

.dropdown-option-dark:hover {
  background-color: rgba(59, 130, 246, 0.15);
}

.dropdown-option-dark.dropdown-option-selected {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

/* 明亮主题选项 */
.dropdown-option-light {
  color: #1e293b;
}

.dropdown-option-light:hover {
  background-color: #f1f5f9;
}

.dropdown-option-light.dropdown-option-selected {
  background-color: #ebf5ff;
  color: #2563eb;
}

/* 赛博朋克主题选项 */
.dropdown-option-cyberpunk {
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
}

.dropdown-option-cyberpunk:hover {
  background-color: rgba(255, 44, 240, 0.15);
  text-shadow: 0 0 2px rgba(255, 44, 240, 0.5);
}

.dropdown-option-cyberpunk.dropdown-option-selected {
  background-color: rgba(255, 44, 240, 0.2);
  color: #ff2cf0;
  text-shadow: 0 0 3px rgba(255, 44, 240, 0.6);
}

/* 赛博朋克特效 */
.dropdown-option-cyber-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 44, 240, 0.2), 
    rgba(255, 44, 240, 0.3), 
    transparent
  );
  z-index: 1;
  animation: dropdown-cyber-sweep 0.5s ease-out forwards;
}

@keyframes dropdown-cyber-sweep {
  to {
    left: 100%;
  }
}

/* 深色主题特效 */
.dropdown-option-dark-effect {
  animation: dropdown-dark-pulse 0.3s ease-out;
}

@keyframes dropdown-dark-pulse {
  0% { background-color: transparent; }
  50% { background-color: rgba(59, 130, 246, 0.15); }
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
  color: rgba(255, 255, 255, 0.5);
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