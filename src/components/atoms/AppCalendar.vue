<template>
  <div class="relative w-full">
    <p-datepicker
      :id="id"
      :value="modelValue"
      @date-select="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :disabled="disabled"
      :inline="inline"
      :showIcon="true"
      :minDate="minDate"
      :disabledDates="disabledDates"
      iconDisplay="input"
      fluid
      :class="[{ 'border-error': error }]"
      v-bind="$attrs"
    />
    <label
      v-if="label && !inline"
      :for="id"
      class="absolute left-0 top-sm text-on-surface-variant font-label-md text-label-md transition-all duration-300 pointer-events-none"
    >
      {{ label }}
    </label>
    <small v-if="error" class="text-error text-label-sm mt-xs block">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import PDatepicker from 'primevue/datepicker';

interface Props {
  modelValue?: Date | string | string[] | null
  id: string
  label?: string
  placeholder?: string
  disabled?: boolean
  inline?: boolean
  minDate?: Date
  disabledDates?: Date[]
  error?: string
}

withDefaults(defineProps<Props>(), { placeholder: ' ', inline: false, disabledDates: () => [] });

defineEmits<{ (e: 'update:modelValue', value: any): void }>();
</script>

<style>
.p-datepicker:has(input) {
  display: flex;
  align-items: center;
}
.p-datepicker input {
  width: 100%;
  background: transparent;
  border: none;
  box-shadow: none;
}
.p-datepicker[data-p-filled="true"] + label,
.p-datepicker:focus-within + label {
  transform: translateY(-1.25rem) scale(0.9);
  color: var(--color-primary);
}
</style>
