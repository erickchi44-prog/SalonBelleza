<template>
  <div class="relative w-full">
    <p-datepicker
      :id="id"
      :value="modelValue"
      @update:value="$emit('update:modelValue', $event)"
      @date-select="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :disabled="disabled"
      :inline="inline"
      :showIcon="true"
      :minDate="minDate"
      iconDisplay="input"
      fluid
      class="w-full bg-transparent border-0 border-b-2 border-outline-variant py-sm focus:ring-0 focus:border-primary transition-all duration-300 placeholder-transparent"
      v-bind="$attrs"
    />
    <label
      v-if="label && !inline"
      :for="id"
      class="absolute left-0 top-sm text-on-surface-variant font-label-md text-label-md transition-all duration-300 pointer-events-none"
      :class="labelClasses"
    >
      {{ label }}
    </label>
    <small v-if="error" class="text-error text-label-sm mt-xs block">{{ error }}</small>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PDatepicker from 'primevue/datepicker';

const props = defineProps({
  modelValue: [Date, String, Array],
  id: {
    type: String,
    required: true
  },
  label: String,
  placeholder: {
    type: String,
    default: ' '
  },
  disabled: Boolean,
  inline: Boolean,
  minDate: Date,
  error: String
});

defineEmits(['update:modelValue']);

const labelClasses = computed(() => {
  const isFilled = props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '';
  return {
    '-translate-y-5 scale-90 text-primary': isFilled,
    'peer-focus:-translate-y-5 peer-focus:scale-90 peer-focus:text-primary': !isFilled
  };
});
</script>

<style>
/* Style PrimeVue DatePicker to match custom flat styles */
.p-datepicker input {
  width: 100%;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}
.p-datepicker {
  display: flex !important;
  align-items: center;
}
</style>
