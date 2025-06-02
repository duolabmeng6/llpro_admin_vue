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
  <div class="bg-card rounded-lg" :class="shadowClasses[shadow]">
    <div v-if="title || subtitle" class="px-4 py-5 sm:px-6 border-b border-theme">
      <h3 v-if="title" class="text-lg leading-6 font-medium text-primary">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="mt-1 max-w-2xl text-sm text-secondary">
        {{ subtitle }}
      </p>
    </div>
    <div :class="{ 'p-4 sm:p-6': !noPadding }" class="overflow-auto flex-1">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="px-4 py-4 sm:px-6 bg-tertiary border-t border-theme">
      <slot name="footer"></slot>
    </div>
  </div>
</template> 