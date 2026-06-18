<template>
  <div class="app-layout">
    <!-- Left Panel -->
    <aside class="left-panel">
      <h1 class="font-display text-2xl text-on-surface">Reservar</h1>
      <p class="font-body-md text-sm text-on-surface-variant mb-lg">Agenda tu pr&oacute;xima cita</p>

      <nav class="step-nav">
        <div
          v-for="(step, index) in steps"
          :key="step.key"
          class="step-nav-item"
          :class="navItemClass(index)"
          @click="goStep(index)"
        >
          <div class="num">
            <i v-if="currentStep > index" class="pi pi-check text-xs"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-text">
            <div class="step-label font-label text-[10px] uppercase tracking-widest">Paso {{ index + 1 }}</div>
            <div class="step-name font-body text-sm font-medium">{{ step.label }}</div>
          </div>
        </div>
      </nav>

      <div class="left-summary">
        <p class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-sm">Resumen</p>
        <div v-if="selectedServices.length > 0">
          <div class="flex justify-between items-center font-semibold">
            <span class="font-body text-sm">Total</span>
            <span class="font-headline-md text-xl text-primary">${{ totalPrice }}</span>
          </div>
          <p class="font-body text-xs text-on-surface-variant mt-xs">{{ selectedServices.length }} servicio(s)</p>
        </div>
        <p v-else class="font-body text-xs text-on-surface-variant">A&uacute;n sin servicios</p>
      </div>
    </aside>

    <!-- Right Content -->
    <main class="right-content">
      <div class="step-area">
        <div class="max-w-2xl">
          <template v-if="loadingServices || loadingSpecialists">
            <div class="text-center py-xl">
              <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
              <p class="font-body-md text-on-surface-variant mt-sm">Cargando...</p>
            </div>
          </template>

          <template v-else>
            <booking-step-service
              v-if="currentStep === 0"
              :modelValue="selectedServiceIds"
              @update:modelValue="(ids: number[]) => selectedServiceIds = ids"
              :options="serviceOptions"
            />

            <booking-step-specialist
              v-if="currentStep === 1"
              :modelValue="selectedSpecialistId"
              @update:modelValue="selectSpecialist"
              :specialists="specialists"
            />

            <booking-step-date-time
              v-if="currentStep === 2"
              :selectedDate="selectedDate"
              :selectedTime="selectedTime"
              :minDate="minDate"
              :timeSlots="availableTimeSlots"
              :disabledDates="disabledDates"
              :loading="loadingSlots"
              @update:selectedDate="selectDate"
              @update:selectedTime="selectTime"
            />

            <booking-step-confirm
              v-if="currentStep === 3"
              :services="selectedServices"
              :totalPrice="totalPrice"
              :totalDuration="totalDuration"
              :specialist="selectedSpecialist"
              :formattedDate="formattedDate"
              :selectedTime="selectedTime"
              :notes="notes"
              @update:notes="notes = $event"
            />
          </template>
        </div>
      </div>

      <!-- Fixed Nav Buttons -->
      <div class="nav-buttons">
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
    </main>
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
  currentStep, loadingSubmit, loadingSlots, loadingServices, loadingSpecialists, notes,
  serviceOptions, specialists,
  selectedServices, selectedSpecialist, selectedDate, selectedTime,
  totalPrice, totalDuration,
  formattedDate, minDate, disabledDates, availableTimeSlots, canProceed,
  selectedServiceIds, selectedSpecialistId,
  selectSpecialist, selectDate, selectTime,
  nextStep, prevStep, confirmBooking
} = useBooking()

function navItemClass(index: number) {
  return {
    active: currentStep.value === index,
    completed: currentStep.value > index
  }
}

function goStep(index: number) {
  if (index === currentStep.value) return
  if (index < currentStep.value) {
    currentStep.value = index
  } else if (index === currentStep.value + 1 && canProceed.value) {
    currentStep.value = index
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  align-items: flex-start;
}

/* ===== Left Panel ===== */
.left-panel {
  width: 280px;
  flex-shrink: 0;
  background: var(--color-surface-container);
  border-right: 1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent);
  position: sticky;
  top: 120px;
  height: calc(100dvh - 120px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
}

.step-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.step-nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border: none;
  background: none;
  text-align: left;
  width: 100%;
  font-family: 'Hanken Grotesk', sans-serif;
}

.step-nav-item:hover {
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.step-nav-item.active {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.step-nav-item .num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 2px solid var(--color-outline-variant);
  flex-shrink: 0;
  transition: all 0.2s;
  color: var(--color-on-surface-variant);
}

.step-nav-item.active .num {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.step-nav-item.completed .num {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.step-nav-item .step-text {
  flex: 1;
  min-width: 0;
}

.step-nav-item .step-text .step-label {
  color: var(--color-on-surface-variant);
  transition: color 0.2s;
}

.step-nav-item.active .step-text .step-label {
  color: var(--color-primary);
  font-weight: 600;
}

.step-nav-item .step-text .step-name {
  margin-top: 2px;
  color: var(--color-on-surface);
}

.step-nav-item.completed .step-text .step-name {
  opacity: 0.6;
}

.left-summary {
  border-top: 1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent);
  padding-top: 20px;
  margin-top: auto;
}

/* ===== Right Content ===== */
.right-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 180px);
  overflow-y: auto;
}

.step-area {
  flex: 1;
  padding: 40px 48px;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 48px;
  border-top: 1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent);
  background: var(--color-surface);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.nav-buttons:empty {
  display: none;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .app-layout {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    height: auto;
    position: static;
    padding: 20px;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    border-right: none;
    border-bottom: 1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent);
  }

  .left-panel h1 {
    font-size: 1.25rem;
    margin-bottom: 0;
  }

  .left-panel > p {
    display: none;
  }

  .step-nav {
    flex-direction: row;
    flex: none;
    order: 1;
    width: 100%;
    margin-top: 8px;
    gap: 0;
  }

  .step-nav-item {
    flex: 1;
    flex-direction: column;
    gap: 4px;
    padding: 10px 8px;
    text-align: center;
    min-width: 0;
  }

  .step-nav-item .step-text {
    display: none;
  }

  .left-summary {
    display: none;
  }

  .step-area {
    padding: 24px 16px;
  }

  .right-content {
    height: auto;
    overflow: visible;
  }

  .step-area {
    flex: none;
  }

  .nav-buttons {
    padding: 16px;
  }
}
</style>
