<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  // 是否显示模态框
  show: {
    type: Boolean,
    default: false
  },
  // 模态框标题
  title: {
    type: String,
    default: ''
  },
  // 是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: true
  },
  // 是否点击遮罩层关闭
  closeOnClickMask: {
    type: Boolean,
    default: true
  },
  // 宽度
  width: {
    type: String,
    default: '500px'
  },
  // 顶部偏移
  top: {
    type: String,
    default: '15vh'
  },
  // 确认按钮文本
  confirmText: {
    type: String,
    default: '确认'
  },
  // 取消按钮文本
  cancelText: {
    type: String,
    default: '取消'
  },
  // 是否显示底部
  showFooter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:show',
  'confirm',
  'cancel'
])

// 获取主题store
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)

// 是否显示模态框
const visible = ref(props.show)
// 是否正在动画中
const animating = ref(false)

// 监听show属性变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    open()
  } else {
    close()
  }
}, { immediate: true })

// 打开模态框
const open = () => {
  visible.value = true
  animating.value = true
  
  // 禁止滚动
  document.body.style.overflow = 'hidden'
  
  // 主题相关动画效果
  const applyThemeSpecificEffect = () => {
    const modalElement = document.querySelector('.modal-container');
    if (!modalElement) return;
    
    if (currentTheme.value === 'cyberpunk') {
      // 赛博朋克主题特效 - 添加霓虹闪光
      modalElement.classList.add('modal-cyberpunk-effect');
      setTimeout(() => {
        modalElement.classList.remove('modal-cyberpunk-effect');
      }, 800);
    } else if (currentTheme.value === 'dark') {
      // 深色主题特效 - 添加轻微发光
      modalElement.classList.add('modal-dark-effect');
      setTimeout(() => {
        modalElement.classList.remove('modal-dark-effect');
      }, 600);
    }
  };
  
  // 动画结束后设置animating为false
  setTimeout(() => {
    animating.value = false
    applyThemeSpecificEffect();
  }, 300)
}

// 关闭模态框
const close = () => {
  if (animating.value) return
  
  animating.value = true
  
  // 延迟关闭，等动画完成
  setTimeout(() => {
    visible.value = false
    animating.value = false
    emit('update:show', false)
    
    // 恢复滚动
    document.body.style.overflow = ''
  }, 300)
}

// 点击遮罩层关闭
const onMaskClick = () => {
  if (props.closeOnClickMask) {
    close()
  }
}

// 确认
const confirm = () => {
  emit('confirm')
  close()
}

// 取消
const cancel = () => {
  emit('cancel')
  close()
}

// 按ESC键关闭模态框
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && visible.value) {
    close()
  }
}

// 监听ESC键
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  // 确保组件销毁时恢复滚动
  document.body.style.overflow = ''
})
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="modal-mask"
      :class="[
        `modal-mask-${currentTheme}`,
        { 'modal-animating': animating }
      ]"
      @click="onMaskClick"
    >
      <div class="modal-wrapper">
        <transition name="modal-scale">
          <div
            class="modal-container"
            :class="`modal-container-${currentTheme}`"
            :style="{ width: width, marginTop: top }"
            @click.stop
          >
            <!-- 头部 -->
            <div class="modal-header" :class="`modal-header-${currentTheme}`">
              <h3 class="modal-title">{{ title }}</h3>
              <button
                v-if="showClose"
                class="modal-close"
                :class="`modal-close-${currentTheme}`"
                @click="close"
              >
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
            
            <!-- 内容 -->
            <div class="modal-body" :class="`modal-body-${currentTheme}`">
              <slot></slot>
            </div>
            
            <!-- 底部 -->
            <div
              v-if="showFooter"
              class="modal-footer"
              :class="`modal-footer-${currentTheme}`"
            >
              <button
                class="modal-btn modal-btn-cancel"
                :class="`modal-btn-cancel-${currentTheme}`"
                @click="cancel"
              >
                {{ cancelText }}
              </button>
              <button
                class="modal-btn modal-btn-confirm"
                :class="`modal-btn-confirm-${currentTheme}`"
                @click="confirm"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 模态框遮罩 */
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  transition: background-color 0.3s ease;
  overflow-y: auto;
  padding: 20px 0;
}

/* 遮罩主题样式 */
.modal-mask-dark {
  background-color: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-mask-light {
  background-color: rgba(241, 245, 249, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-mask-cyberpunk {
  background-color: rgba(13, 2, 33, 0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 44, 240, 0.1), transparent 20%),
    radial-gradient(circle at 80% 70%, rgba(0, 238, 255, 0.1), transparent 20%);
}

/* 模态框容器 */
.modal-wrapper {
  display: flex;
  justify-content: center;
  min-height: 100%;
  align-items: flex-start;
}

/* 模态框 */
.modal-container {
  max-width: 90%;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  position: relative;
}

/* 主题特定容器样式 */
.modal-container-dark {
  background-color: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.modal-container-light {
  background-color: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: #1e293b;
}

.modal-container-cyberpunk {
  background-color: rgba(28, 6, 54, 0.95);
  border: 1px solid rgba(255, 44, 240, 0.3);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 15px rgba(255, 44, 240, 0.3);
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom-width: 1px;
}

.modal-header-dark {
  background-color: rgba(15, 23, 42, 0.5);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.modal-header-light {
  background-color: #f8fafc;
  border-bottom-color: #e2e8f0;
}

.modal-header-cyberpunk {
  background-color: rgba(13, 2, 33, 0.8);
  border-bottom: 1px solid rgba(255, 44, 240, 0.4);
  position: relative;
  overflow: hidden;
}

.modal-header-cyberpunk::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 44, 240, 0.8), rgba(0, 238, 255, 0.8), transparent);
  animation: flow-border 3s linear infinite;
  background-size: 200% 100%;
}

/* 模态框标题 */
.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

/* 关闭按钮 */
.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.modal-close-dark {
  color: rgba(255, 255, 255, 0.7);
}

.modal-close-dark:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.modal-close-light {
  color: #64748b;
}

.modal-close-light:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #1e293b;
}

.modal-close-cyberpunk {
  color: rgba(255, 44, 240, 0.7);
}

.modal-close-cyberpunk:hover {
  background-color: rgba(255, 44, 240, 0.2);
  color: rgba(255, 44, 240, 1);
  text-shadow: 0 0 5px rgba(255, 44, 240, 0.8);
}

/* 模态框内容 */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top-width: 1px;
}

.modal-footer-dark {
  background-color: rgba(15, 23, 42, 0.5);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.modal-footer-light {
  background-color: #f8fafc;
  border-top-color: #e2e8f0;
}

.modal-footer-cyberpunk {
  background-color: rgba(13, 2, 33, 0.8);
  border-top: 1px solid rgba(255, 44, 240, 0.4);
  position: relative;
  overflow: hidden;
}

.modal-footer-cyberpunk::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 238, 255, 0.8), rgba(255, 44, 240, 0.8), transparent);
  animation: flow-border 3s linear infinite reverse;
  background-size: 200% 100%;
}

/* 按钮样式 */
.modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

/* 取消按钮 */
.modal-btn-cancel-dark {
  background-color: rgba(30, 41, 59, 0.7);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.modal-btn-cancel-dark:hover {
  background-color: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
}

.modal-btn-cancel-light {
  background-color: #f1f5f9;
  color: #64748b;
  border-color: #e2e8f0;
}

.modal-btn-cancel-light:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.modal-btn-cancel-cyberpunk {
  background-color: rgba(54, 9, 109, 0.7);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 238, 255, 0.4);
  box-shadow: 0 0 5px rgba(0, 238, 255, 0.2);
}

.modal-btn-cancel-cyberpunk:hover {
  background-color: rgba(54, 9, 109, 0.9);
  border-color: rgba(0, 238, 255, 0.6);
  box-shadow: 0 0 8px rgba(0, 238, 255, 0.4);
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

/* 确认按钮 */
.modal-btn-confirm-dark {
  background-color: #3b82f6;
  color: white;
}

.modal-btn-confirm-dark:hover {
  background-color: #2563eb;
}

.modal-btn-confirm-light {
  background-color: #2563eb;
  color: white;
}

.modal-btn-confirm-light:hover {
  background-color: #1d4ed8;
}

.modal-btn-confirm-cyberpunk {
  background-color: rgba(255, 44, 240, 0.8);
  color: white;
  border: 1px solid rgba(255, 44, 240, 0.6);
  box-shadow: 0 0 8px rgba(255, 44, 240, 0.4);
}

.modal-btn-confirm-cyberpunk:hover {
  background-color: rgba(255, 44, 240, 1);
  box-shadow: 0 0 12px rgba(255, 44, 240, 0.6);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

/* 主题特定特效 */
@keyframes modal-cyberpunk-glow {
  0% { box-shadow: 0 0 10px rgba(255, 44, 240, 0.5), 0 0 20px rgba(255, 44, 240, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 44, 240, 0.7), 0 0 30px rgba(255, 44, 240, 0.5); }
  100% { box-shadow: 0 0 10px rgba(255, 44, 240, 0.5), 0 0 20px rgba(255, 44, 240, 0.3); }
}

@keyframes modal-dark-glow {
  0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.3); }
  100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
}

.modal-cyberpunk-effect {
  animation: modal-cyberpunk-glow 1s ease-in-out;
}

.modal-dark-effect {
  animation: modal-dark-glow 0.8s ease-in-out;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 主题过渡延迟应用 */
.theme-transition .modal-container {
  transition-delay: calc(var(--theme-transition-delay-unit) * 3);
}

.theme-transition .modal-header {
  transition-delay: calc(var(--theme-transition-delay-unit) * 4);
}

.theme-transition .modal-body {
  transition-delay: calc(var(--theme-transition-delay-unit) * 5);
}

.theme-transition .modal-footer {
  transition-delay: calc(var(--theme-transition-delay-unit) * 6);
}

.theme-transition .modal-btn {
  transition-delay: calc(var(--theme-transition-delay-unit) * 7);
}
</style> 