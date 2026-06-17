<template>
  <div class="relative w-full">
    <p-textarea
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      placeholder=" "
      :disabled="disabled"
      :rows="rows"
      autoResize
      :class="[
        'w-full bg-transparent border-0 border-b-2 border-outline-variant',
        'py-sm focus:ring-0 focus:border-primary',
        'transition-all duration-300 placeholder-transparent',
        { 'border-error': error }
      ]"
      v-bind="$attrs"
    />
    <label
      v-if="label"
      :for="id"
      class="absolute left-0 top-sm text-on-surface-variant font-label-md text-label-md transition-all duration-300 pointer-events-none"
    >
      {{ label }}
    </label>
    <small v-if="error" class="text-error text-label-sm mt-xs block">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import PTextarea from 'primevue/textarea';

interface Props {
  modelValue?: string
  id: string
  label?: string
  disabled?: boolean
  rows?: number
  error?: string
}

withDefaults(defineProps<Props>(), { rows: 3 });

defineEmits<{ (e: 'update:modelValue', value: string): void }>();
</script>

<style scoped>
.p-textarea:focus + label,
.p-textarea:not(:placeholder-shown) + label {
  transform: translateY(-1.25rem) scale(0.9);
  color: var(--color-primary);
}
</style>
