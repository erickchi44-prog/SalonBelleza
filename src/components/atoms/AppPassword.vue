<template>
  <div class="relative w-full">
    <p-password
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      placeholder=" "
      :disabled="disabled"
      :toggleMask="true"
      :feedback="feedback"
      fluid
      :class="[
        'border-0 border-b-2 border-outline-variant rounded-none',
        'focus-within:border-primary transition-all duration-300',
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
import PPassword from 'primevue/password';

interface Props {
  modelValue?: string
  id: string
  label?: string
  disabled?: boolean
  feedback?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), { feedback: false });

defineEmits<{ (e: 'update:modelValue', value: string): void }>();
</script>

<style>
.p-password {
  display: flex;
  align-items: center;
}
.p-password input {
  width: 100%;
  background: transparent;
  border: none;
  box-shadow: none;
  padding-block: var(--spacing-sm);
}
.p-password-toggle-mask-icon {
  color: var(--color-on-surface-variant);
  cursor: pointer;
}
.p-password[data-p-filled="true"] + label,
.p-password:focus-within + label {
  transform: translateY(-1.25rem) scale(0.9);
  color: var(--color-primary);
}
</style>
