<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  autoClose: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 5000
  },
  icon: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const visible = ref(true)
let timer = null

const typeConfig = {
  info: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-400',
    iconColor: 'text-blue-400',
    icon: '<i class="fas fa-info-circle h-5 w-5"></i>'
  },
  success: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-400',
    iconColor: 'text-green-400',
    icon: '<i class="fas fa-check-circle h-5 w-5"></i>'
  },
  warning: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-400',
    iconColor: 'text-yellow-400',
    icon: '<i class="fas fa-exclamation-triangle h-5 w-5"></i>'
  },
  error: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-400',
    iconColor: 'text-red-400',
    icon: '<i class="fas fa-times-circle h-5 w-5"></i>'
  }
}

const close = () => {
  visible.value = false
  emit('close')
  if (timer) {
    clearTimeout(timer)
  }
}

onMounted(() => {
  if (props.autoClose) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="visible"
      :class="[
        'rounded-md p-4 border-l-4',
        typeConfig[type].bgColor,
        typeConfig[type].borderColor
      ]"
    >
      <div class="flex">
        <div v-if="icon" class="flex-shrink-0" :class="typeConfig[type].iconColor" v-html="typeConfig[type].icon"></div>
        <div class="ml-3 flex-1">
          <h3 v-if="title" class="text-sm font-medium" :class="typeConfig[type].textColor">{{ title }}</h3>
          <div class="text-sm" :class="typeConfig[type].textColor">
            <slot></slot>
          </div>
        </div>
        <div v-if="dismissible" class="pl-3 ml-auto">
          <div class="-mx-1.5 -my-1.5">
            <button
              type="button"
              :class="[
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                `${typeConfig[type].textColor} hover:bg-${type}-100 focus:ring-${type}-600`
              ]"
              @click="close"
            >
              <span class="sr-only">Dismiss</span>
              <i class="fas fa-times h-5 w-5"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template> 