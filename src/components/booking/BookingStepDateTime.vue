<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-calendar text-primary"></i> Selecciona Fecha y Hora
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
      <div>
        <app-calendar
          id="bookingDate"
          :modelValue="selectedDate"
          @update:modelValue="$emit('update:selectedDate', $event)"
          label="Fecha de la Cita"
          :inline="true"
          :minDate="minDate"
        />
      </div>
      <div v-if="selectedDate" class="space-y-md">
        <p class="font-label-md text-sm text-on-surface-variant uppercase tracking-widest">Horarios disponibles</p>
        <div class="grid grid-cols-3 gap-sm">
          <button
            v-for="slot in timeSlots"
            :key="slot"
            class="py-sm font-label-sm text-xs border transition-all duration-200 cursor-pointer"
            :class="selectedTime === slot
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary'"
            @click="$emit('update:selectedTime', slot)"
          >
            {{ slot }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppCalendar from '../atoms/AppCalendar.vue'

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
]

defineProps<{
  selectedDate: Date | null
  selectedTime: string
  minDate: Date
}>()

defineEmits<{
  (e: 'update:selectedDate', value: Date | null): void
  (e: 'update:selectedTime', value: string): void
}>();
</script>
