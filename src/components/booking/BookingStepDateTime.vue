<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-calendar text-primary"></i> Selecciona Fecha y Hora
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
      <div class="border border-outline-variant/30 bg-surface p-md">
        <app-calendar
          id="bookingDate"
          :modelValue="selectedDate"
          @update:modelValue="$emit('update:selectedDate', $event)"
          label="Fecha de la Cita"
          :inline="true"
          :minDate="minDate"
          :disabledDates="disabledDates"
        />
      </div>
      <div v-if="selectedDate" class="border border-outline-variant/30 bg-surface p-md space-y-md">
        <p class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Horarios disponibles</p>
        <div v-if="loading" class="flex items-center justify-center py-lg text-on-surface-variant">
          <i class="pi pi-spin pi-spinner mr-sm"></i>
          <span class="text-sm">Cargando horarios...</span>
        </div>
        <div v-else-if="timeSlots.length === 0" class="text-center py-lg text-sm text-on-surface-variant">
          No hay horarios disponibles para esta fecha.
        </div>
        <div v-else class="grid grid-cols-3 gap-sm">
          <button
            v-for="slot in timeSlots"
            :key="slot"
            class="min-h-[44px] font-label-sm text-xs border transition-all duration-200 cursor-pointer rounded-none uppercase tracking-wider"
            :class="selectedTime === slot
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary'"
            @click="$emit('update:selectedTime', slot)"
            :aria-label="`Horario ${slot}`"
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

defineProps<{
  selectedDate: Date | null
  selectedTime: string
  minDate: Date
  timeSlots: string[]
  disabledDates: Date[]
  loading: boolean
}>()

defineEmits<{
  (e: 'update:selectedDate', value: Date | null): void
  (e: 'update:selectedTime', value: string): void
}>();
</script>

<style>
.p-datepicker.p-datepicker-inline {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  font-family: "Hanken Grotesk", sans-serif;
  width: 100%;
}

.p-datepicker .p-datepicker-header {
  border-bottom: 1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent);
  padding: 0 0 0.75rem 0;
  margin-bottom: 0.75rem;
  background: transparent;
}

.p-datepicker .p-datepicker-title .p-datepicker-month,
.p-datepicker .p-datepicker-title .p-datepicker-year {
  font-family: "Playfair Display", serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-on-surface);
}

.p-datepicker .p-datepicker-prev,
.p-datepicker .p-datepicker-next {
  color: var(--color-primary);
  border-radius: 0;
  width: 2rem;
  height: 2rem;
  transition: background-color 0.2s;
}

.p-datepicker .p-datepicker-prev:hover,
.p-datepicker .p-datepicker-next:hover {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.p-datepicker .p-datepicker-calendar th {
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-on-surface-variant);
  padding-bottom: 0.5rem;
  text-align: center;
}

.p-datepicker .p-datepicker-calendar td {
  text-align: center;
  padding: 0.125rem;
}

.p-datepicker .p-datepicker-calendar td span {
  width: 2.25rem;
  height: 2.25rem;
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 0;
  transition: all 0.2s;
  color: var(--color-on-surface);
}

.p-datepicker .p-datepicker-calendar td span:hover {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.p-datepicker .p-datepicker-calendar td span.p-highlight {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.p-datepicker .p-datepicker-calendar td span.p-highlight:hover {
  background: var(--color-surface-tint);
  color: var(--color-on-primary);
}

.p-datepicker .p-datepicker-calendar td.p-datepicker-today span {
  border: 1px solid var(--color-primary);
}

.p-datepicker .p-datepicker-calendar td.p-datepicker-today span.p-highlight {
  border: none;
}

.p-datepicker .p-datepicker-calendar td span.p-disabled {
  color: var(--color-outline-variant);
  opacity: 0.5;
}

.p-datepicker .p-datepicker-calendar td span.p-disabled:hover {
  background: transparent;
  color: var(--color-outline-variant);
}

.p-datepicker .p-datepicker-calendar td span:not(.p-disabled):not(.p-highlight) {
  color: var(--color-on-surface);
}

.p-datepicker .p-datepicker-calendar td span:not(.p-disabled):not(.p-highlight):hover {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}
</style>
