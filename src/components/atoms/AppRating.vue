<template>
  <div class="flex items-center gap-xs">
    <p-rating
      :value="modelValue"
      @change="$emit('update:modelValue', ($event as any).value)"
      :readonly="readonly"
      :stars="stars"
      :cancel="false"
      class="text-primary"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import PRating from 'primevue/rating';

interface Props {
  modelValue?: number
  stars?: number
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: 0,
  stars: 5,
  readonly: false,
});

defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();
</script>

<style>
.p-rating-icon {
  color: var(--color-primary, #79542e);
}
</style>
