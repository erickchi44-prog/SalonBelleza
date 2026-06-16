<template>
  <div class="flex items-center gap-xs">
    <p-rating
      :value="modelValue"
      @change="$emit('update:modelValue', $event.value)"
      :readonly="readonly"
      :stars="stars"
      :cancel="false"
      class="text-primary"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup>
import PRating from 'primevue/rating';

defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  stars: {
    type: Number,
    default: 5
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
</script>

<style>
.p-rating-icon {
  color: var(--color-primary, #79542e) !important;
}
</style>
