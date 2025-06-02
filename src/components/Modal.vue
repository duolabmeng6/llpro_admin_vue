<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

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

// 是否显示模态框
const visible = ref(props.show)
// 是否正在动画中
const animating = ref(false)

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
    
    // 使用CSS变量控制的动画效果
    modalElement.classList.add('modal-open-effect');
    setTimeout(() => {
      modalElement.classList.remove('modal-open-effect');
    }, 800);
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

// 监听show属性变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    open()
  } else if (visible.value) { // 只有当visible为true时才调用close
    close()
  }
}, { immediate: true })

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
      class="modal-mask glass-morphism"
      :class="{ 'modal-animating': animating }"
      @click="onMaskClick"
    >
      <div class="modal-wrapper">
        <transition name="modal-scale">
          <div
            class="modal-container bg-card shadow-theme-lg"
            :style="{ width: width, marginTop: top }"
            @click.stop
          >
            <!-- 头部 -->
            <div class="modal-header bg-elevated border-b border-subtle">
              <h3 class="modal-title text-heading">{{ title }}</h3>
              <button
                v-if="showClose"
                class="modal-close text-secondary hover:bg-tertiary"
                @click="close"
              >
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
            
            <!-- 内容 -->
            <div class="modal-body text-body">
              <slot></slot>
            </div>
            
            <!-- 底部 -->
            <div
              v-if="showFooter"
              class="modal-footer bg-elevated border-t border-subtle"
            >
              <button
                class="modal-btn modal-btn-cancel bg-tertiary text-secondary border border-subtle hover:bg-button-hover"
                @click="cancel"
              >
                {{ cancelText }}
              </button>
              <button
                class="modal-btn modal-btn-confirm bg-button-primary-bg text-button-primary-text hover:bg-button-primary-hover-bg"
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
  background-color: color-mix(in oklab, var(--color-bg-primary) 70%, transparent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
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
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  position: relative;
  border: 1px solid var(--color-border);
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
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
}

/* 按钮样式 */
.modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 主题特定特效 */
@keyframes modal-open-glow {
  0% { box-shadow: 0 0 10px var(--color-shadow); }
  50% { box-shadow: 0 0 20px var(--color-accent); }
  100% { box-shadow: 0 0 10px var(--color-shadow); }
}

.modal-open-effect {
  animation: modal-open-glow 0.8s ease-in-out;
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