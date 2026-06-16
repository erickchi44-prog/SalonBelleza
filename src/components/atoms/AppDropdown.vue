<template>
  <div class="relative w-full">
    <p-select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.value)"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      :placeholder="placeholder"
      :disabled="disabled"
      fluid
      class="w-full bg-transparent border-0 border-b-2 border-outline-variant py-sm focus:ring-0 focus:border-primary transition-all duration-300 placeholder-transparent"
      v-bind="$attrs"
    />
    <label
      v-if="label"
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
import PSelect from 'primevue/select';

const props = defineProps({
  modelValue: [String, Number, Object],
  id: {
    type: String,
    required: true
  },
  label: String,
  options: {
    type: Array,
    required: true
  },
  optionLabel: String,
  optionValue: String,
  placeholder: {
    type: String,
    default: ' '
  },
  disabled: Boolean,
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
/* Style PrimeVue Select to match custom flat styles */
.p-select {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-bottom: 2px solid var(--color-outline-variant, #d4c4b7) !important;
  border-radius: 0 !important;
}
.p-select-label {
  padding-left: 0 !important;
  background: transparent !important;
}
</style>
