<template>
  <div class="space-y-md">
    <div class="flex items-center justify-between">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-users text-primary"></i> Gesti&oacute;n de Especialistas
      </h2>
      <app-button label="NUEVO ESPECIALISTA" icon="pi pi-user-plus" @click="openDialog()" />
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-md">
      <div v-for="n in 3" :key="n" class="bg-surface border border-outline-variant/30 p-md animate-pulse space-y-sm">
        <div class="flex items-center gap-md">
          <div class="w-14 h-14 rounded-full bg-surface-container-high"></div>
          <div class="space-y-xs flex-1">
            <div class="h-4 bg-surface-container-high w-2/3"></div>
            <div class="h-3 bg-surface-container-high w-1/3"></div>
          </div>
        </div>
        <div class="h-3 bg-surface-container-high w-full"></div>
      </div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-md">
        <div v-for="spec in specialists" :key="spec.id"
          class="bg-surface border border-outline-variant/30 p-md shadow-sm hover:border-primary/40 transition-all duration-300 flex flex-col gap-md">
          <div class="flex items-center gap-md">
            <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
              {{ spec.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <h3 class="font-headline-md text-base text-on-surface truncate">{{ spec.name }}</h3>
              <p class="font-label-sm text-label-sm text-primary uppercase tracking-widest">{{ spec.specialty }}</p>
            </div>
          </div>
          <p class="font-body-md text-xs text-on-surface-variant">{{ spec.bio }}</p>
          <div class="grid grid-cols-3 gap-xs text-center border-t border-outline-variant/20 pt-sm">
            <div>
              <p class="font-headline-md text-lg text-primary font-bold">{{ spec.appointments }}</p>
              <p class="text-label-sm text-on-surface-variant uppercase tracking-wider">Citas</p>
            </div>
            <div>
              <p class="font-headline-md text-lg text-primary font-bold">{{ spec.rating }}</p>
              <p class="text-label-sm text-on-surface-variant uppercase tracking-wider">Rating</p>
            </div>
            <div>
              <p class="font-headline-md text-lg text-primary font-bold">{{ spec.years_exp }}a</p>
              <p class="text-label-sm text-on-surface-variant uppercase tracking-wider">Exp.</p>
            </div>
          </div>
          <div class="flex gap-sm">
            <app-button label="EDITAR" variant="outlined" icon="pi pi-pencil" class="flex-1 text-xs" @click="openDialog(spec)" />
            <app-button label="HORARIOS" variant="text" icon="pi pi-clock" class="flex-1 text-xs" @click="$router.push('/admin/schedules')" />
          </div>
        </div>
      </div>
    </template>

    <p-dialog v-model:visible="showDialog" :header="editingId ? 'Editar Especialista' : 'Nuevo Especialista'" modal :style="{ width: '480px' }">
      <div class="space-y-md p-md">
        <app-input id="specName" v-model="form.name" label="Nombre Completo" />
        <app-dropdown id="specSpecialty" v-model="form.specialty" label="Especialidad"
          :options="specialtyOptions" optionLabel="label" optionValue="value" />
        <app-input id="specYears" v-model="form.yearsExp" label="A&ntilde;os de Experiencia" type="number" />
        <app-textarea id="specBio" v-model="form.bio" label="Biograf&iacute;a" :rows="3" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-sm p-sm">
          <app-button label="CANCELAR" variant="outlined" @click="showDialog = false" />
          <app-button :label="editingId ? 'GUARDAR CAMBIOS' : 'CREAR'" icon="pi pi-check" @click="saveSpecialist" />
        </div>
      </template>
    </p-dialog>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import type { Specialist } from '../../types';
import PDialog from 'primevue/dialog';
import AppButton from '../../components/atoms/AppButton.vue';
import AppInput from '../../components/atoms/AppInput.vue';
import AppDropdown from '../../components/atoms/AppDropdown.vue';
import AppTextarea from '../../components/atoms/AppTextarea.vue';

const loading = shallowRef(true);
const showDialog = shallowRef(false);
const editingId = shallowRef<number | null>(null);
const form = shallowRef({ name: '', specialty: null as string | null, yearsExp: '', bio: '' });
const specialists = shallowRef<any[]>([]);

const specialtyOptions = [
  { label: 'Estilista', value: 'Estilista Senior' },
  { label: 'Especialista Spa', value: 'Especialista en Spa' },
  { label: 'Barbero', value: 'Maestro Barbero' },
  { label: 'Nail Artist', value: 'Nail Artist' }
];

const fetchSpecialists = async () => {
  loading.value = true;
  const { data } = await supabase.from('specialists').select('*').order('id');
  if (data) specialists.value = data;
  loading.value = false;
};

const openDialog = (spec: any = null) => {
  editingId.value = spec?.id || null;
  form.value = spec
    ? { name: spec.name, specialty: spec.specialty, yearsExp: String(spec.years_exp), bio: spec.bio }
    : { name: '', specialty: null, yearsExp: '', bio: '' };
  showDialog.value = true;
};

const saveSpecialist = async () => {
  const payload = {
    name: form.value.name,
    specialty: form.value.specialty,
    years_exp: Number(form.value.yearsExp),
    bio: form.value.bio
  };

  if (editingId.value) {
    await supabase.from('specialists').update(payload).eq('id', editingId.value);
  } else {
    await supabase.from('specialists').insert({ ...payload, appointments: 0, rating: 0 });
  }

  showDialog.value = false;
  fetchSpecialists();
};

onMounted(fetchSpecialists);
</script>
