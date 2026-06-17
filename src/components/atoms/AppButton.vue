<template>
  <p-button
    :label="label"
    :icon="icon"
    :loading="loading"
    :disabled="disabled"
    class="font-label-md rounded-none uppercase tracking-widest transition-all duration-300 px-md py-sm"
    :class="btnClasses"
    v-bind="$attrs"
  >
    <slot></slot>
  </p-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PButton from 'primevue/button';

interface Props {
  label?: string
  icon?: string
  loading?: boolean
  disabled?: boolean
  severity?: string
  variant?: string
}

const props = withDefaults(defineProps<Props>(), {});

const btnClasses = computed(() => {
  if (props.variant === 'outlined') {
    return 'border-primary text-primary hover:bg-primary/10 bg-transparent shadow-none hover:shadow-none'
  }
  if (props.variant === 'text') {
    return 'bg-transparent border-transparent text-primary hover:bg-primary/10 shadow-none hover:shadow-none'
  }
  return 'bg-primary border-primary text-on-primary hover:bg-surface-tint hover:border-surface-tint shadow-md hover:shadow-lg'
})
</script>
