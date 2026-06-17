<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-check-square text-primary"></i> Confirmar Reserva
    </h2>
    <div class="border border-outline-variant/30 divide-y divide-outline-variant/20 bg-surface">
      <div class="p-md flex justify-between">
        <span class="font-label-md text-sm text-on-surface-variant">Servicio</span>
        <span class="font-label-md text-sm font-semibold text-on-surface">{{ service?.label }}</span>
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
      <div class="p-md flex justify-between bg-primary-container/10">
        <span class="font-label-md text-sm font-semibold text-on-surface">Total</span>
        <span class="font-headline-md text-primary text-lg font-bold">${{ service?.price }}</span>
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
  service?: ServiceOption
  specialist?: Specialist
  formattedDate: string
  selectedTime: string
  notes: string
}>()

defineEmits<{
  (e: 'update:notes', value: string): void
}>()
</script>
