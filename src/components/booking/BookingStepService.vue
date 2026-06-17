<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-list text-primary"></i> Selecciona un Servicio
    </h2>
    <app-dropdown
      id="serviceSelect"
      :value="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      label="Servicio"
      :options="options"
      optionLabel="label"
      optionValue="value"
    />
    <div v-if="selected" class="p-md border border-outline-variant/30 bg-surface-container-low space-y-xs">
      <p class="font-label-md font-semibold text-on-surface">{{ selected.label }}</p>
      <div class="flex items-center gap-md text-sm text-on-surface-variant">
        <span class="flex items-center gap-xs"><i class="pi pi-clock text-primary"></i> {{ selected.duration }} min</span>
        <span class="flex items-center gap-xs"><i class="pi pi-dollar text-primary"></i> ${{ selected.price }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ServiceOption } from '../../types'
import AppDropdown from '../atoms/AppDropdown.vue'

const props = defineProps<{
  modelValue: number | null
  options: ServiceOption[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const selected = computed(() => props.options.find(o => o.value === props.modelValue))
</script>
