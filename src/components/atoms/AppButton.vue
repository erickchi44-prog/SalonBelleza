<template>
  <p-button
    :label="label"
    :icon="icon"
    :loading="loading"
    :disabled="disabled"
    :severity="severity"
    :variant="variant"
    class="font-label-md rounded-none uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg"
    :class="customClasses"
    v-bind="$attrs"
  >
    <slot></slot>
  </p-button>
</template>

<script setup>
import { computed } from 'vue';
import PButton from 'primevue/button';

const props = defineProps({
  label: String,
  icon: String,
  loading: Boolean,
  disabled: Boolean,
  severity: String, // 'primary', 'secondary', 'success', 'info', 'warning', 'danger'
  variant: String, // 'outlined', 'text', 'link'
  primaryBrand: {
    type: Boolean,
    default: true
  }
});

const customClasses = computed(() => {
  if (props.primaryBrand && !props.severity && !props.variant) {
    return 'bg-primary border-primary text-on-primary hover:bg-surface-tint hover:border-surface-tint';
  }
  return '';
});
</script>
