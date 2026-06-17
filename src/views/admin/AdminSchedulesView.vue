<template>
  <div class="space-y-md">
    <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
      <i class="pi pi-clock text-primary"></i> Configuraci&oacute;n de Horarios
    </h2>

    <div class="bg-surface border border-outline-variant/30 p-md shadow-sm">
      <app-dropdown id="scheduleSpecialist" v-model="selectedSpecialist" label="Especialista" :options="specialists" optionLabel="name" optionValue="id" />
    </div>

    <div v-if="loading" class="bg-surface border border-outline-variant/30 p-md animate-pulse space-y-sm">
      <div v-for="n in 7" :key="n" class="h-8 bg-surface-container-high"></div>
    </div>

    <template v-else>
      <div class="bg-surface border border-outline-variant/30 shadow-sm overflow-x-auto">
        <table class="w-full min-w-[640px] text-sm">
          <thead>
            <tr class="border-b border-outline-variant/20">
              <th class="p-md text-left font-label-md text-xs text-on-surface-variant uppercase tracking-widest">D&iacute;a</th>
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
                <span class="text-xs text-on-surface-variant">{{ day.active ? 'S&iacute;' : 'No' }}</span>
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
    </template>
    <p-toast />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '../../lib/supabase';
import { useSchedules } from '../../composables/useSchedules';
import PToast from 'primevue/toast';
import AppButton from '../../components/atoms/AppButton.vue';
import AppDropdown from '../../components/atoms/AppDropdown.vue';

const toast = useToast();
const saving = shallowRef(false);
const loading = shallowRef(true);
const selectedSpecialist = shallowRef<number | null>(null);
const specialists = shallowRef<{ id: number; name: string }[]>([]);

const { schedule, fetchSchedules, saveSchedules } = useSchedules();

const timeOptions = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM',
  '12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM']
  .map(t => ({ label: t, value: t }));

const breakOptions = [
  { label: 'Sin descanso', value: 'none' },
  { label: '12:00 PM - 01:00 PM', value: '12-1' },
  { label: '01:00 PM - 02:00 PM', value: '1-2' },
  { label: '02:00 PM - 03:00 PM', value: '2-3' }
];

const fetchSpecialists = async () => {
  const { data } = await supabase.from('specialists').select('id, name').order('id');
  specialists.value = data || [];
  if (data?.length) selectedSpecialist.value = data[0].id;
  loading.value = false;
};

const saveSchedule = async () => {
  saving.value = true;
  await saveSchedules(selectedSpecialist.value);
  saving.value = false;
  toast.add({ severity: 'success', summary: 'Horarios guardados', detail: 'Los horarios del especialista han sido actualizados.', life: 3000 });
};

watch(selectedSpecialist, (id) => { if (id) fetchSchedules(id); });

onMounted(async () => {
  await fetchSpecialists();
});
</script>
