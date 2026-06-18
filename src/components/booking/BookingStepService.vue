<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-list text-primary"></i> Selecciona tus Servicios
    </h2>
    <p class="font-body-md text-sm text-on-surface-variant">Puedes elegir uno o varios servicios para tu cita.</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
      <div
        v-for="opt in options"
        :key="opt.value"
        class="border p-md cursor-pointer transition-all duration-300"
        :class="isSelected(opt.value)
          ? 'border-primary bg-primary-container/10 shadow-md'
          : 'border-outline-variant/30 bg-surface hover:border-primary hover:shadow-sm'"
        @click="toggle(opt.value)"
      >
        <div class="flex items-start justify-between mb-xs">
          <p class="font-label-md font-semibold text-on-surface text-sm">{{ opt.label }}</p>
          <i
            class="pi text-sm transition-all"
            :class="isSelected(opt.value) ? 'pi-check-circle text-primary' : 'pi-circle text-outline-variant'"
          ></i>
        </div>
        <div class="flex items-center gap-md text-xs text-on-surface-variant">
          <span class="flex items-center gap-xs"><i class="pi pi-clock text-primary"></i> {{ opt.duration }} min</span>
          <span class="flex items-center gap-xs"><i class="pi pi-dollar text-primary"></i> ${{ opt.price }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ServiceOption } from '../../types'

const props = defineProps<{
  modelValue: number[]
  options: ServiceOption[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

function isSelected(id: number) {
  return props.modelValue.includes(id)
}

function toggle(id: number) {
  const idx = props.modelValue.indexOf(id)
  if (idx >= 0) {
    emit('update:modelValue', props.modelValue.filter(i => i !== id))
  } else {
    emit('update:modelValue', [...props.modelValue, id])
  }
}
</script>
