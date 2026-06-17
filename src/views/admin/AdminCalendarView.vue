<template>
  <div class="space-y-md">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-xl">
      <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
      <p class="font-body-md text-on-surface-variant mt-sm">Cargando calendario...</p>
    </div>

    <template v-else>
      <div class="flex items-center justify-between">
        <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
          <i class="pi pi-calendar text-primary"></i> Calendario de Citas
        </h2>
        <app-button label="NUEVA CITA" icon="pi pi-plus" @click="showDialog = true" />
      </div>

      <div class="flex flex-wrap gap-sm items-center bg-surface border border-outline-variant/30 p-md">
        <app-calendar id="calFilter" v-model="filterDate" label="Filtrar por fecha" />
        <app-dropdown
          id="calSpecialist"
          v-model="filterSpecialist"
          label="Especialista"
          :options="specialistOptions"
          optionLabel="label"
          optionValue="value"
          class="min-w-40"
        />
        <app-button label="HOY" variant="outlined" icon="pi pi-clock" @click="filterDate = new Date()" class="text-xs" />
      </div>

      <div class="bg-surface border border-outline-variant/30 shadow-sm overflow-hidden overflow-x-auto">
        <div class="grid grid-cols-8 border-b border-outline-variant/20 min-w-[640px]">
          <div class="p-sm text-center font-label-sm text-xs text-on-surface-variant uppercase">Hora</div>
          <div v-for="day in weekDays" :key="day.label" class="p-sm text-center border-l border-outline-variant/10">
            <p class="font-label-sm text-xs text-on-surface-variant uppercase">{{ day.dayName }}</p>
            <p class="font-headline-md text-lg" :class="day.isToday ? 'text-primary font-bold' : 'text-on-surface'">{{ day.dayNum }}</p>
          </div>
        </div>

        <div class="overflow-y-auto max-h-[520px] min-w-[640px]">
          <div v-for="slot in timeSlots" :key="slot" class="grid grid-cols-8 border-b border-outline-variant/10 min-h-[56px]">
            <div class="p-sm text-center font-label-sm text-label-sm text-on-surface-variant/60 self-start pt-1">{{ slot }}</div>
            <div
              v-for="day in weekDays" :key="day.date"
              class="border-l border-outline-variant/10 p-xs relative hover:bg-primary-container/5 transition-colors"
            >
              <div
                v-for="appt in getAppointments(day.date, slot)"
                :key="appt.id"
                class="bg-primary text-on-primary text-label-sm p-xs mb-xs cursor-pointer hover:bg-surface-tint transition-colors"
              >
                <p class="font-semibold truncate">{{ appt.customer }}</p>
                <p class="opacity-80 truncate">{{ appt.service }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p-dialog v-model:visible="showDialog" header="Nueva Cita" modal :style="{ width: '480px' }" class="font-body-md">
        <div class="space-y-md p-md">
          <app-input id="newApptCustomer" v-model="newAppt.customer" label="Nombre del Cliente" />
          <app-dropdown id="newApptService" v-model="newAppt.service" label="Servicio" :options="serviceOptions" optionLabel="label" optionValue="value" />
          <app-dropdown id="newApptSpecialist" v-model="newAppt.specialist" label="Especialista" :options="specialistOptions" optionLabel="label" optionValue="value" />
          <app-calendar id="newApptDate" v-model="newAppt.date" label="Fecha" :minDate="new Date()" />
          <app-dropdown id="newApptTime" v-model="newAppt.time" label="Hora" :options="timeOptions" optionLabel="label" optionValue="value" />
          <app-textarea id="newApptNotes" v-model="newAppt.notes" label="Notas (opcional)" :rows="2" />
        </div>
        <template #footer>
          <div class="flex justify-end gap-sm p-sm">
            <app-button label="CANCELAR" variant="outlined" @click="showDialog = false" />
            <app-button label="GUARDAR CITA" icon="pi pi-check" @click="saveAppointment" />
          </div>
        </template>
      </p-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, watch } from 'vue';
import { supabase } from '../../lib/supabase';
import { toDisplayTime } from '../../utils/time';
import PDialog from 'primevue/dialog';
import AppButton from '../../components/atoms/AppButton.vue';
import AppInput from '../../components/atoms/AppInput.vue';
import AppCalendar from '../../components/atoms/AppCalendar.vue';
import AppDropdown from '../../components/atoms/AppDropdown.vue';
import AppTextarea from '../../components/atoms/AppTextarea.vue';

const loading = shallowRef(true);
const showDialog = shallowRef(false);
const filterDate = shallowRef(new Date());
const filterSpecialist = shallowRef<number | null>(null);
const appointments = shallowRef<any[]>([]);
const specialistOptions = shallowRef<{ label: string; value: number | null }[]>([]);
const serviceOptions = shallowRef<{ label: string; value: number }[]>([]);

const newAppt = ref({ customer: '', service: null as number | null, specialist: null as number | null, date: null as Date | null, time: null as string | null, notes: '' });

const timeOptions = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM'].map(t => ({ label: t, value: t }));

const timeSlots = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];

interface WeekDay {
  date: string
  dayName: string
  dayNum: number
  isToday: boolean
  label: string
}

const weekDays = computed<WeekDay[]>(() => {
  const base = filterDate.value ? new Date(filterDate.value) : new Date();
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const today = new Date();
    return {
      date: d.toISOString().slice(0, 10) as string,
      dayName: d.toLocaleDateString('es-MX', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      label: `${d.getDate()}/${d.getMonth() + 1}`
    };
  });
});

function getAppointments(date: string, slot: string) {
  return appointments.value.filter((a: any) => a.date === date && a.time === slot);
}

const fetchAppointments = async () => {
  let query = supabase
    .from('appointments')
    .select('id, customer_name, appointment_date, appointment_time, services(title), specialists(name)');

  if (filterSpecialist.value) {
    query = query.eq('specialist_id', filterSpecialist.value);
  }

  const { data } = await query.order('appointment_date').order('appointment_time');

  appointments.value = (data || []).map((a: any) => ({
    id: a.id,
    date: a.appointment_date,
    time: toDisplayTime(a.appointment_time),
    customer: a.customer_name,
    service: a.services?.title || '-'
  }));
};

const fetchOptions = async () => {
  const [{ data: specs }, { data: services }] = await Promise.all([
    supabase.from('specialists').select('id, name').eq('active', true).order('id'),
    supabase.from('services').select('id, title').eq('active', true).order('id')
  ]);

  specialistOptions.value = [
    { label: 'Todas', value: null },
    ...(specs || []).map(s => ({ label: s.name, value: s.id }))
  ];

  serviceOptions.value = (services || []).map(s => ({ label: s.title, value: s.id }));
};

const saveAppointment = async () => {
  const { error } = await supabase.from('appointments').insert({
    customer_name: newAppt.value.customer,
    service_id: newAppt.value.service,
    specialist_id: newAppt.value.specialist,
    appointment_date: newAppt.value.date?.toISOString().split('T')[0],
    appointment_time: newAppt.value.time,
    notes: newAppt.value.notes,
    status: 'Pendiente'
  });

  if (!error) {
    showDialog.value = false;
    newAppt.value = { customer: '', service: null, specialist: null, date: null, time: null, notes: '' };
    fetchAppointments();
  }
};

watch(filterSpecialist, () => fetchAppointments());

onMounted(async () => {
  await Promise.all([fetchOptions(), fetchAppointments()]);
  loading.value = false;
});
</script>
