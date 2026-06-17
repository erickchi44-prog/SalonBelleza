<template>
  <div class="py-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto space-y-lg">
    <div class="text-center max-w-2xl mx-auto space-y-sm">
      <h1 class="font-display-lg text-4xl md:text-5xl text-on-surface">Reservar Cita</h1>
      <p class="font-body-md text-on-surface-variant">
        Selecciona tu servicio, especialista y horario preferido en pocos pasos.
      </p>
    </div>

    <!-- Progress Steps -->
    <div class="flex items-center justify-center gap-0 mb-lg min-h-8">
      <template v-for="(step, index) in steps" :key="step.key">
        <div class="flex flex-col items-center relative w-8">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center border-2 font-label-md text-sm transition-all duration-300"
            :class="currentStep > index ? 'bg-primary border-primary text-on-primary' :
                    currentStep === index ? 'border-primary text-primary bg-surface' :
                    'border-outline-variant text-on-surface-variant bg-surface'"
          >
            <i v-if="currentStep > index" class="pi pi-check text-xs"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="absolute top-full mt-xs left-1/2 -translate-x-1/2 whitespace-nowrap hidden md:block text-label-sm font-label-sm text-on-surface-variant">{{ step.label }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="w-12 md:w-24 h-px mx-xs" :class="currentStep > index ? 'bg-primary' : 'bg-outline-variant/40'"></div>
      </template>
    </div>

    <!-- Loading -->
    <div v-if="loadingServices || loadingSpecialists" class="text-center py-xl">
      <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
      <p class="font-body-md text-on-surface-variant mt-sm">Cargando...</p>
    </div>

    <template v-else>
      <!-- Step 1: Service -->
      <booking-step-service
        v-if="currentStep === 0"
        :modelValue="selectedServiceId"
        @update:modelValue="selectService"
        :options="serviceOptions"
      />

      <!-- Step 2: Specialist -->
      <booking-step-specialist
        v-if="currentStep === 1"
        :modelValue="selectedSpecialistId"
        @update:modelValue="selectSpecialist"
        :specialists="specialists"
      />

      <!-- Step 3: Date & Time -->
      <booking-step-date-time
        v-if="currentStep === 2"
        :selectedDate="selectedDate"
        :selectedTime="selectedTime"
        :minDate="minDate"
        @update:selectedDate="selectDate"
        @update:selectedTime="selectTime"
      />

      <!-- Step 4: Confirmation -->
      <booking-step-confirm
        v-if="currentStep === 3"
        :service="selectedService"
        :specialist="selectedSpecialist"
        :formattedDate="formattedDate"
        :selectedTime="selectedTime"
        :notes="notes"
        @update:notes="notes = $event"
      />
    </template>

    <!-- Navigation Buttons -->
    <div class="flex justify-between pt-md border-t border-outline-variant/20">
      <app-button
        v-if="currentStep > 0"
        label="ANTERIOR"
        variant="outlined"
        icon="pi pi-arrow-left"
        @click="prevStep"
      />
      <div v-else></div>

      <app-button
        v-if="currentStep < steps.length - 1"
        label="SIGUIENTE"
        icon="pi pi-arrow-right"
        icon-pos="right"
        :disabled="!canProceed"
        @click="nextStep"
      />
      <app-button
        v-else
        label="CONFIRMAR RESERVA"
        icon="pi pi-check"
        :loading="loadingSubmit"
        @click="confirmBooking"
      />
    </div>

    <p-toast />
  </div>
</template>

<script setup lang="ts">
import { useBooking, steps } from '../composables/useBooking'
import BookingStepService from '../components/booking/BookingStepService.vue'
import BookingStepSpecialist from '../components/booking/BookingStepSpecialist.vue'
import BookingStepDateTime from '../components/booking/BookingStepDateTime.vue'
import BookingStepConfirm from '../components/booking/BookingStepConfirm.vue'
import AppButton from '../components/atoms/AppButton.vue'
import PToast from 'primevue/toast'

const {
  currentStep, loadingSubmit, loadingServices, loadingSpecialists, notes,
  serviceOptions, specialists,
  selectedService, selectedSpecialist, selectedDate, selectedTime,
  formattedDate, minDate, canProceed,
  selectedServiceId, selectedSpecialistId,
  selectService, selectSpecialist, selectDate, selectTime,
  nextStep, prevStep, confirmBooking
} = useBooking()
</script>
