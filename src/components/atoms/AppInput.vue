<template>
  <div class="relative w-full">
    <p-inputtext
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full bg-transparent border-0 border-b-2 border-outline-variant py-sm focus:ring-0 focus:border-primary transition-all duration-300 placeholder-transparent"
      :class="{ 'border-error': error }"
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
import PInputtext from 'primevue/inputtext';

const props = defineProps({
  modelValue: [String, Number],
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

<style scoped>
/* Ensure peer-like behavior for PrimeVue components */
.p-inputtext:focus + label,
.p-inputtext:not(:placeholder-shown) + label {
  transform: translateY(-1.25rem) scale(0.9);
  color: var(--color-primary, #79542e);
}
</style>
