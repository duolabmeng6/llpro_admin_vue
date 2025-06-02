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
      class="modal-mask"
      :class="{ 'modal-animating': animating }"
      @click="onMaskClick"
    >
      <div class="modal-wrapper">
        <transition name="modal-scale">
          <div
            class="modal-container"
            :style="{ width: width, marginTop: top }"
            @click.stop
          >
            <!-- 头部 -->
            <div class="modal-header">
              <h3 class="modal-title">{{ title }}</h3>
              <button
                v-if="showClose"
                class="modal-close"
                @click="close"
                title="关闭"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
            
            <!-- 内容 -->
            <div class="modal-body">
              <slot></slot>
            </div>
            
            <!-- 底部 -->
            <div
              v-if="showFooter"
              class="modal-footer"
            >
              <button
                class="modal-btn modal-btn-cancel"
                @click="cancel"
              >
                {{ cancelText }}
              </button>
              <button
                class="modal-btn modal-btn-confirm"
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
  transition: all 0.3s ease;
  overflow-y: auto;
  padding: 20px 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* 模态框容器 */
.modal-wrapper {
  display: flex;
  justify-content: center;
  min-height: 100%;
  align-items: center;
  width: 100%;
}

/* 模态框 */
.modal-container {
  max-width: 90%;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  position: relative;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

/* 模态框标题 */
.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

/* 关闭按钮 */
.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.modal-close:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* 模态框内容 */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  color: var(--color-text-primary);
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

/* 按钮样式 */
.modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-btn-cancel {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.modal-btn-cancel:hover {
  background-color: var(--color-bg-primary);
}

.modal-btn-confirm {
  background-color: var(--modern-accent-color, var(--color-accent));
  color: var(--modern-accent-text-color, white);
}

.modal-btn-confirm:hover {
  filter: brightness(1.1);
}

/* 主题特定特效 */
@keyframes modal-open-glow {
  0% { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); }
  50% { box-shadow: 0 10px 40px var(--modern-accent-color, rgba(0, 120, 215, 0.3)); }
  100% { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); }
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
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style> 