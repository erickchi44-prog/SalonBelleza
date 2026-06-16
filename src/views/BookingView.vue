<template>
  <div class="py-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto space-y-lg">
    <div class="text-center max-w-2xl mx-auto space-y-sm">
      <h1 class="font-display-lg text-4xl md:text-5xl text-on-surface">Reservar Cita</h1>
      <p class="font-body-md text-on-surface-variant">
        Selecciona tu servicio, especialista y horario preferido en pocos pasos.
      </p>
    </div>

    <!-- Progress Steps -->
    <div class="flex items-center justify-center gap-0 mb-lg">
      <div v-for="(step, index) in steps" :key="step.key" class="flex items-center">
        <div class="flex flex-col items-center">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center border-2 font-label-md text-sm transition-all duration-300"
            :class="currentStep > index ? 'bg-primary border-primary text-on-primary' :
                    currentStep === index ? 'border-primary text-primary bg-surface' :
                    'border-outline-variant text-on-surface-variant bg-surface'"
          >
            <i v-if="currentStep > index" class="pi pi-check text-xs"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="text-[10px] font-label-sm mt-xs text-on-surface-variant hidden md:block whitespace-nowrap">{{ step.label }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="w-12 md:w-24 h-px mx-xs" :class="currentStep > index ? 'bg-primary' : 'bg-outline-variant/40'"></div>
      </div>
    </div>

    <!-- Step 1: Seleccionar Servicio -->
    <div v-if="currentStep === 0" class="space-y-md">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-list text-primary"></i> Selecciona un Servicio
      </h2>
      <app-dropdown
        id="serviceSelect"
        v-model="selectedServiceId"
        label="Servicio"
        :options="serviceOptions"
        optionLabel="label"
        optionValue="value"
      />
      <div v-if="selectedService" class="p-md border border-outline-variant/30 bg-surface-container-low space-y-xs">
        <p class="font-label-md font-semibold text-on-surface">{{ selectedService.label }}</p>
        <div class="flex items-center gap-md text-sm text-on-surface-variant">
          <span class="flex items-center gap-xs"><i class="pi pi-clock text-primary"></i> {{ selectedService.duration }} min</span>
          <span class="flex items-center gap-xs"><i class="pi pi-dollar text-primary"></i> ${{ selectedService.price }}</span>
        </div>
      </div>
    </div>

    <!-- Step 2: Seleccionar Especialista -->
    <div v-if="currentStep === 1" class="space-y-md">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-users text-primary"></i> Selecciona tu Especialista
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        <div
          v-for="spec in specialists"
          :key="spec.id"
          class="border p-md cursor-pointer transition-all duration-300 hover:shadow-md"
          :class="selectedSpecialistId === spec.id ? 'border-primary bg-primary-container/10 shadow-md' : 'border-outline-variant/30 bg-surface'"
          @click="selectedSpecialistId = spec.id"
        >
          <div class="flex items-center gap-sm mb-sm">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {{ spec.name.charAt(0) }}
            </div>
            <div>
              <p class="font-label-md font-semibold text-on-surface text-sm">{{ spec.name }}</p>
              <p class="text-[11px] text-primary uppercase tracking-wider">{{ spec.specialty }}</p>
            </div>
          </div>
          <p class="text-xs text-on-surface-variant">{{ spec.bio }}</p>
          <div v-if="selectedSpecialistId === spec.id" class="flex justify-end mt-sm">
            <i class="pi pi-check-circle text-primary text-lg"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Seleccionar Fecha y Hora -->
    <div v-if="currentStep === 2" class="space-y-md">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-calendar text-primary"></i> Selecciona Fecha y Hora
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div>
          <app-calendar
            id="bookingDate"
            v-model="selectedDate"
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
              @click="selectedTime = slot"
            >
              {{ slot }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Confirmación -->
    <div v-if="currentStep === 3" class="space-y-md">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-check-square text-primary"></i> Confirmar Reserva
      </h2>
      <div class="border border-outline-variant/30 divide-y divide-outline-variant/20 bg-surface">
        <div class="p-md flex justify-between">
          <span class="font-label-md text-sm text-on-surface-variant">Servicio</span>
          <span class="font-label-md text-sm font-semibold text-on-surface">{{ selectedService?.label }}</span>
        </div>
        <div class="p-md flex justify-between">
          <span class="font-label-md text-sm text-on-surface-variant">Especialista</span>
          <span class="font-label-md text-sm font-semibold text-on-surface">{{ selectedSpecialist?.name }}</span>
        </div>
        <div class="p-md flex justify-between">
          <span class="font-label-md text-sm text-on-surface-variant">Fecha</span>
          <span class="font-label-md text-sm font-semibold text-on-surface">{{ selectedDate?.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
        </div>
        <div class="p-md flex justify-between">
          <span class="font-label-md text-sm text-on-surface-variant">Hora</span>
          <span class="font-label-md text-sm font-semibold text-on-surface">{{ selectedTime }}</span>
        </div>
        <div class="p-md flex justify-between bg-primary-container/10">
          <span class="font-label-md text-sm font-semibold text-on-surface">Total</span>
          <span class="font-headline-md text-primary text-lg font-bold">${{ selectedService?.price }}</span>
        </div>
      </div>
      <app-textarea
        id="bookingNotes"
        v-model="notes"
        label="Notas adicionales (opcional)"
        :rows="3"
      />
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between pt-md border-t border-outline-variant/20">
      <app-button
        v-if="currentStep > 0"
        label="ANTERIOR"
        variant="outlined"
        icon="pi pi-arrow-left"
        @click="currentStep--"
      />
      <div v-else></div>

      <app-button
        v-if="currentStep < steps.length - 1"
        label="SIGUIENTE"
        icon="pi pi-arrow-right"
        icon-pos="right"
        :disabled="!canProceed"
        @click="currentStep++"
      />
      <app-button
        v-else
        label="CONFIRMAR RESERVA"
        icon="pi pi-check"
        :loading="loading"
        @click="confirmBooking"
      />
    </div>

    <!-- Success Toast via PrimeVue -->
    <p-toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabase';
import AppDropdown from '../components/atoms/AppDropdown.vue';
import AppCalendar from '../components/atoms/AppCalendar.vue';
import AppTextarea from '../components/atoms/AppTextarea.vue';
import AppButton from '../components/atoms/AppButton.vue';
import PToast from 'primevue/toast';

const toast = useToast();
const router = useRouter();

const currentStep = ref(0);
const loading = ref(false);
const notes = ref('');
const serviceOptions = ref([]);
const specialists = ref([]);

const steps = [
  { key: 'service', label: 'Servicio' },
  { key: 'specialist', label: 'Especialista' },
  { key: 'datetime', label: 'Fecha & Hora' },
  { key: 'confirm', label: 'Confirmación' }
];

const selectedServiceId = ref(null);
const selectedSpecialistId = ref(null);
const selectedDate = ref(null);
const selectedTime = ref('');
const minDate = new Date();

const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];

const selectedService = computed(() => serviceOptions.value.find(s => s.value === selectedServiceId.value));
const selectedSpecialist = computed(() => specialists.value.find(s => s.id === selectedSpecialistId.value));

const canProceed = computed(() => {
  if (currentStep.value === 0) return !!selectedServiceId.value;
  if (currentStep.value === 1) return !!selectedSpecialistId.value;
  if (currentStep.value === 2) return !!selectedDate.value && !!selectedTime.value;
  return true;
});

const toDbTime = (timeStr) => {
  if (!timeStr) return null;
  const [time, mod] = timeStr.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (mod === 'PM' && h !== 12) h += 12;
  if (mod === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
};

const confirmBooking = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    router.push('/login');
    return;
  }

  loading.value = true;

  const { error } = await supabase.from('appointments').insert({
    user_id: user.id,
    customer_name: user.email,
    service_id: selectedServiceId.value,
    specialist_id: selectedSpecialistId.value,
    appointment_date: selectedDate.value?.toISOString().split('T')[0],
    appointment_time: toDbTime(selectedTime.value),
    notes: notes.value,
    status: 'Pendiente'
  });

  loading.value = false;

  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 4000 });
    return;
  }

  toast.add({ severity: 'success', summary: '¡Cita Confirmada!', detail: `Tu cita para el ${selectedDate.value?.toLocaleDateString('es-MX')} a las ${selectedTime.value} ha sido registrada.`, life: 4000 });
  setTimeout(() => router.push('/feedback'), 2500);
};

onMounted(async () => {
  const [{ data: svc }, { data: specs }] = await Promise.all([
    supabase.from('services').select('*').eq('active', true).order('id'),
    supabase.from('specialists').select('id, name, specialty, bio').eq('active', true).order('id')
  ]);

  serviceOptions.value = (svc || []).map(s => ({
    label: s.title,
    value: s.id,
    duration: s.duration,
    price: s.price
  }));

  specialists.value = specs || [];
});
</script>
