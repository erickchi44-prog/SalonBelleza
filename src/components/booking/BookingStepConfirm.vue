<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-check-square text-primary"></i> Confirmar Reserva
    </h2>
    <div class="border border-outline-variant/30 divide-y divide-outline-variant/20 bg-surface">
      <div class="p-md">
        <span class="font-label-md text-sm text-on-surface-variant block mb-xs">Servicios</span>
        <div v-for="svc in services" :key="svc.value" class="flex items-center justify-between text-sm">
          <span class="font-label-md font-semibold text-on-surface">{{ svc.label }}</span>
          <span class="text-on-surface-variant">${{ svc.price }}</span>
        </div>
        <div class="flex items-center justify-between mt-xs pt-xs border-t border-outline-variant/20">
          <span class="font-label-md text-xs text-on-surface-variant">{{ totalDuration }} min total</span>
          <span class="font-headline-md text-primary font-bold">${{ totalPrice }}</span>
        </div>
      </div>
      <div class="p-md flex justify-between">
        <span class="font-label-md text-sm text-on-surface-variant">Especialista</span>
        <span class="font-label-md text-sm font-semibold text-on-surface">{{ specialist?.name }}</span>
      </div>
      <div class="p-md flex justify-between">
        <span class="font-label-md text-sm text-on-surface-variant">Fecha</span>
        <span class="font-label-md text-sm font-semibold text-on-surface">{{ formattedDate }}</span>
      </div>
      <div class="p-md flex justify-between">
        <span class="font-label-md text-sm text-on-surface-variant">Hora</span>
        <span class="font-label-md text-sm font-semibold text-on-surface">{{ selectedTime }}</span>
      </div>
    </div>
    <app-textarea
      id="bookingNotes"
      :modelValue="notes"
      @update:modelValue="$emit('update:notes', $event)"
      label="Notas adicionales (opcional)"
      :rows="3"
    />
  </div>
</template>

<script setup lang="ts">
import type { ServiceOption, Specialist } from '../../types'
import AppTextarea from '../atoms/AppTextarea.vue'

defineProps<{
  services: ServiceOption[]
  totalPrice: number
  totalDuration: number
  specialist?: Specialist
  formattedDate: string
  selectedTime: string
  notes: string
}>()

defineEmits<{
  (e: 'update:notes', value: string): void
}>()
</script>
