<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-users text-primary"></i> Selecciona tu Especialista
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
      <div
        v-for="spec in specialists"
        :key="spec.id"
        class="border p-md cursor-pointer transition-all duration-300 hover:shadow-md"
        :class="modelValue === spec.id ? 'border-primary bg-primary-container/10 shadow-md' : 'border-outline-variant/30 bg-surface'"
        @click="$emit('update:modelValue', spec.id)"
      >
        <div class="flex items-center gap-sm mb-sm">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {{ spec.name.charAt(0) }}
          </div>
          <div>
            <p class="font-label-md font-semibold text-on-surface text-sm">{{ spec.name }}</p>
            <p class="text-label-sm text-primary uppercase tracking-wider">{{ spec.specialty }}</p>
          </div>
        </div>
        <p class="text-xs text-on-surface-variant">{{ spec.bio }}</p>
        <div v-if="modelValue === spec.id" class="flex justify-end mt-sm">
          <i class="pi pi-check-circle text-primary text-lg"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Specialist } from '../../types'

defineProps<{
  modelValue: number | null
  specialists: Specialist[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()
</script>
