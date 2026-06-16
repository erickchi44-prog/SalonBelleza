<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-clock text-primary"></i> Configuracion de Horarios
    </h2>

    <div class="bg-surface border border-outline-variant/30 p-md shadow-sm">
      <app-dropdown id="scheduleSpecialist" v-model="selectedSpecialist" label="Especialista" :options="specialists" optionLabel="name" optionValue="id" />
    </div>

    <div class="bg-surface border border-outline-variant/30 shadow-sm overflow-x-auto">
      <table class="w-full min-w-[640px] text-sm">
        <thead>
          <tr class="border-b border-outline-variant/20">
            <th class="p-md text-left font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Dia</th>
            <th class="p-md text-left font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Activo</th>
            <th class="p-md text-left font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Inicio</th>
            <th class="p-md text-left font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Cierre</th>
            <th class="p-md text-left font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Descanso</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in schedule" :key="day.day" class="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors">
            <td class="p-md font-label-md text-sm text-on-surface">{{ day.day }}</td>
            <td class="p-md">
              <span class="text-xs text-on-surface-variant">{{ day.active ? 'Si' : 'No' }}</span>
            </td>
            <td class="p-md w-36">
              <app-dropdown :id="'start-' + day.day" v-model="day.start" :options="timeOptions" optionLabel="label" optionValue="value" :disabled="!day.active" label="" />
            </td>
            <td class="p-md w-36">
              <app-dropdown :id="'end-' + day.day" v-model="day.end" :options="timeOptions" optionLabel="label" optionValue="value" :disabled="!day.active" label="" />
            </td>
            <td class="p-md w-40">
              <app-dropdown :id="'break-' + day.day" v-model="day.break" :options="breakOptions" optionLabel="label" optionValue="value" :disabled="!day.active" label="" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-end">
      <app-button label="GUARDAR HORARIOS" icon="pi pi-save" @click="saveSchedule" :loading="saving" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '../../lib/supabase';

import PToast from 'primevue/toast';
import AppButton from '../../components/atoms/AppButton.vue';
import AppDropdown from '../../components/atoms/AppDropdown.vue';

const toast = useToast();
const saving = ref(false);
const selectedSpecialist = ref(null);
const specialists = ref([]);
const schedule = ref([]);

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

const timeOptions = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM',
  '12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM']
  .map(t => ({ label: t, value: t }));

const breakOptions = [
  { label: 'Sin descanso', value: 'none' },
  { label: '12:00 PM - 01:00 PM', value: '12-1' },
  { label: '01:00 PM - 02:00 PM', value: '1-2' },
  { label: '02:00 PM - 03:00 PM', value: '2-3' }
];

const toTimeStr = (time) => {
  if (!time) return '09:00 AM';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
};

const breakToRange = (breakStart, breakEnd) => {
  if (!breakStart || !breakEnd) return 'none';
  const start = toTimeStr(breakStart);
  const end = toTimeStr(breakEnd);
  const map = { '12:00 PM - 01:00 PM': '12-1', '01:00 PM - 02:00 PM': '1-2', '02:00 PM - 03:00 PM': '2-3' };
  return map[`${start} - ${end}`] || 'none';
};

const fetchSpecialists = async () => {
  const { data } = await supabase.from('specialists').select('id, name').order('id');
  specialists.value = data || [];
  if (data?.length) selectedSpecialist.value = data[0].id;
};

const fetchSchedules = async () => {
  if (!selectedSpecialist.value) return;
  const { data } = await supabase
    .from('schedules')
    .select('*')
    .eq('specialist_id', selectedSpecialist.value)
    .order('day_of_week');

  if (data && data.length > 0) {
    schedule.value = data.map(s => ({
      id: s.id,
      day: DAY_NAMES[s.day_of_week],
      active: s.active,
      start: toTimeStr(s.start_time),
      end: toTimeStr(s.end_time),
      break: breakToRange(s.break_start, s.break_end)
    }));
  } else {
    schedule.value = DAY_NAMES.map((day, i) => ({
      id: null,
      day,
      active: i !== 0 && i !== 6,
      start: i === 0 ? '10:00 AM' : i === 6 ? '10:00 AM' : '09:00 AM',
      end: i === 0 ? '04:00 PM' : i === 6 ? '06:00 PM' : '07:00 PM',
      break: i === 0 || i === 6 ? 'none' : '1-2'
    }));
  }
};

const rangeToBreak = (range) => {
  const map = { '12-1': ['12:00', '13:00'], '1-2': ['13:00', '14:00'], '2-3': ['14:00', '15:00'] };
  return map[range] || [null, null];
};

const saveSchedule = async () => {
  saving.value = true;

  for (const day of schedule.value) {
    const dayIdx = DAY_NAMES.indexOf(day.day);
    const [breakStart, breakEnd] = rangeToBreak(day.break);
    const payload = {
      specialist_id: selectedSpecialist.value,
      day_of_week: dayIdx,
      active: day.active,
      start_time: day.start,
      end_time: day.end,
      break_start: breakStart,
      break_end: breakEnd
    };

    if (day.id) {
      await supabase.from('schedules').update(payload).eq('id', day.id);
    } else {
      await supabase.from('schedules').insert(payload);
    }
  }

  saving.value = false;
  toast.add({ severity: 'success', summary: 'Horarios guardados', detail: 'Los horarios del especialista han sido actualizados.', life: 3000 });
  fetchSchedules();
};

watch(selectedSpecialist, fetchSchedules);

onMounted(fetchSpecialists);
</script>