<template>
  <div class="relative w-full">
    <p-select
      :id="id"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      placeholder=" "
      :disabled="disabled"
      fluid
      :class="[{ 'border-error': error }]"
      v-bind="$attrs"
    />
    <label
      v-if="label"
      :for="id"
      :style="isFilled ? 'transform: translateY(-1.25rem) scale(0.9); color: var(--color-primary);' : ''"
      class="absolute left-0 top-sm text-on-surface-variant font-label-md text-label-md transition-all duration-300 pointer-events-none"
    >
      {{ label }}
    </label>
    <small v-if="error" class="text-error text-label-sm mt-xs block">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import PSelect from 'primevue/select';

interface Props {
  id: string
  label?: string
  options: any[]
  optionLabel?: string
  optionValue?: string
  disabled?: boolean
  error?: string
}

defineProps<Props>();

const attrs = useAttrs()
const isFilled = computed(() => {
  const a = attrs as any
  const val = a.modelValue !== undefined ? a.modelValue : a.value
  return val !== null && val !== undefined && val !== ''
})

</script>

<style>
.p-select {
  background: transparent;
  border: none;
  box-shadow: none;
  border-bottom: 2px solid var(--color-outline-variant);
  border-radius: 0;
  padding-block: var(--spacing-sm);
  padding-inline: 0;
  transition: border-color 0.3s;
}
.p-select:focus-within {
  border-bottom-color: var(--color-primary);
}
.p-select-label {
  padding: 0;
  background: transparent;
}
.p-select-dropdown-icon {
  color: var(--color-on-surface-variant);
}
.p-select:focus-within + label {
  transform: translateY(-1.25rem) scale(0.9);
  color: var(--color-primary);
}
/* Dropdown overlay panel */
.p-select-overlay {
  border: 1px solid var(--color-outline-variant);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: var(--color-surface);
}
.p-select-option {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-on-surface);
  font-family: var(--font-body-md);
  font-size: 0.875rem;
  transition: background 0.2s;
}
.p-select-option:hover,
.p-select-option-focused {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}
.p-select-option-selected {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
}
</style>
