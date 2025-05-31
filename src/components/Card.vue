<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  shadow: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
  }
})

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-md',
  xl: 'shadow-lg'
}
</script>

<template>
  <div class="bg-white rounded-lg overflow-hidden" :class="shadowClasses[shadow]">
    <div v-if="title || subtitle" class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 v-if="title" class="text-lg leading-6 font-medium text-gray-900">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="mt-1 max-w-2xl text-sm text-gray-500">
        {{ subtitle }}
      </p>
    </div>
    <div :class="{ 'p-4 sm:p-6': !noPadding }">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
      <slot name="footer"></slot>
    </div>
  </div>
</template> 