<template>
  <div class="space-y-md">
    <div class="flex items-center justify-between">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-users text-primary"></i> Especialistas
      </h2>
      <app-button label="NUEVO" icon="pi pi-user-plus" @click="openDialog()" />
    </div>

    <div v-if="loading" class="bg-surface border border-outline-variant/30 rounded-xl animate-pulse space-y-sm p-md">
      <div v-for="n in 4" :key="n" class="h-12 bg-surface-container-high rounded-md"></div>
    </div>

    <template v-else>
      <div class="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden">
        <!-- Table header -->
        <div class="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr] gap-0 px-lg py-sm bg-surface-container-high/50 font-label-md text-xs text-on-surface-variant/60 uppercase tracking-widest font-bold border-b border-outline-variant/20">
          <span>Nombre</span>
          <span>Especialidad</span>
          <span class="text-center">Citas</span>
          <span class="text-center">Rating</span>
          <span class="text-center">Estado</span>
          <span></span>
        </div>

        <!-- Table rows -->
        <div
          v-for="spec in specialists" :key="spec.id"
          class="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr] gap-0 px-lg py-sm items-center border-b border-outline-variant/10 last:border-b-0 hover:bg-primary-container/5 transition-colors cursor-pointer"
          @click="openDialog(spec)"
        >
          <div class="flex items-center gap-md min-w-0">
            <div class="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              {{ spec.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <p class="font-label-md text-sm font-semibold text-on-surface truncate">{{ spec.name }}</p>
              <p class="text-label-sm text-primary uppercase tracking-widest text-xs">{{ spec.specialty }}</p>
            </div>
          </div>
          <div class="text-sm text-on-surface-variant/80">{{ spec.specialty?.split(' ')[0] }}</div>
          <div class="text-sm text-on-surface-variant font-semibold text-center">{{ spec.appointments }}</div>
          <div class="text-sm text-on-surface-variant font-semibold text-center">{{ spec.rating }}</div>
          <div class="text-center">
            <span
              class="inline-block px-sm py-0.5 text-label-sm font-label-sm rounded-full text-xs font-semibold"
              :class="spec.active ? 'bg-success-container/30 text-success' : 'bg-danger-container/20 text-danger/60'"
            >{{ spec.active ? 'Activo' : 'Inactivo' }}</span>
          </div>
          <div class="flex justify-end gap-xs" @click.stop>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-md border-none bg-transparent text-on-surface-variant/40 cursor-pointer hover:bg-primary-container/20 hover:text-primary transition-all text-xs"
              title="Editar"
              @click="openDialog(spec)"
            ><i class="pi pi-pencil"></i></button>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-md border-none bg-transparent text-on-surface-variant/40 cursor-pointer hover:bg-danger-container/20 hover:text-danger transition-all text-xs"
              title="Eliminar"
              @click="deleteSpecialist(spec)"
            ><i class="pi pi-trash"></i></button>
          </div>
        </div>

        <div v-if="specialists.length === 0" class="text-center py-xl text-on-surface-variant/40 font-body-md text-sm">
          No hay especialistas registrados
        </div>
      </div>
    </template>

    <!-- Drawer -->
    <Drawer v-model:visible="showDialog" :header="editingId ? 'Editar Especialista' : 'Nuevo Especialista'" position="right" :style="{ width: '480px' }" class="font-body-md">
      <template #header>
        <div class="flex items-center gap-sm">
          <i :class="editingId ? 'pi pi-pencil text-primary' : 'pi pi-user-plus text-primary'"></i>
          <span class="font-headline-md text-base text-on-surface font-bold">{{ editingId ? 'Editar Especialista' : 'Nuevo Especialista' }}</span>
        </div>
      </template>

      <div class="flex flex-col gap-lg" style="height: calc(100vh - 140px);">
        <div class="flex-1 overflow-y-auto space-y-lg px-sm">
          <!-- Photo upload -->
          <div
            class="border-2 border-dashed border-outline-variant/30 rounded-xl p-lg text-center cursor-pointer hover:border-primary/40 hover:bg-primary-container/5 transition-all"
            @click="triggerUpload"
          >
            <div v-if="form.imageUrl" class="w-20 h-20 rounded-full mx-auto mb-sm overflow-hidden bg-surface-container-high">
              <img :src="form.imageUrl" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-20 h-20 rounded-full mx-auto mb-sm bg-surface-container-high flex items-center justify-center">
              <i class="pi pi-camera text-on-surface-variant/30" style="font-size:1.2rem"></i>
            </div>
            <p class="font-body-md text-xs text-on-surface-variant/60">Foto del especialista</p>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
          </div>

          <!-- Name -->
          <div>
            <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest block mb-xs">Nombre completo</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ej. María Pérez"
              class="w-full px-sm py-xs text-sm border border-outline-variant/30 rounded-md bg-surface text-on-surface outline-none focus:border-primary transition-colors"
            />
          </div>

          <!-- Specialty + Years -->
          <div class="grid grid-cols-2 gap-sm">
            <div>
              <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest block mb-xs">Especialidad</label>
              <AppDropdown
                id="specSpecialty"
                v-model="form.specialty"
                :options="specialtyOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
              />
            </div>
            <div>
              <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest block mb-xs">Años de exp.</label>
              <input
                v-model="form.yearsExp"
                type="number"
                placeholder="5"
                class="w-full px-sm py-xs text-sm border border-outline-variant/30 rounded-md bg-surface text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <!-- Bio -->
          <div>
            <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest block mb-xs">Biografía</label>
            <textarea
              v-model="form.bio"
              rows="3"
              placeholder="Breve descripción del especialista..."
              class="w-full px-sm py-xs text-sm border border-outline-variant/30 rounded-md bg-surface text-on-surface outline-none focus:border-primary transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Active toggle -->
          <div class="flex items-center justify-between py-xs">
            <span class="font-label-md text-sm text-on-surface">Activo</span>
            <button
              class="w-10 h-5 rounded-full border-none cursor-pointer transition-all relative"
              :class="form.active ? 'bg-success' : 'bg-outline-variant/40'"
              @click="form.active = !form.active"
            >
              <span
                class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                :class="form.active ? 'left-[22px]' : 'left-0.5'"
              ></span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-sm pt-sm border-t border-outline-variant/20 shrink-0 px-sm">
          <app-button label="CANCELAR" variant="outlined" @click="showDialog = false" />
          <app-button :label="editingId ? 'GUARDAR CAMBIOS' : 'CREAR'" icon="pi pi-check" @click="saveSpecialist" />
        </div>
      </div>
    </Drawer>

    <!-- Confirm modal (opción 1: centrado básico) -->
    <Teleport to="body">
      <div v-if="showConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showConfirm = false">
        <div class="bg-surface rounded-[20px] w-[400px] max-w-[90vw] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.2)] text-center">
          <div class="w-14 h-14 rounded-full bg-warning-container/30 flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-ban text-warning" style="font-size:1.3rem"></i>
          </div>
          <h2 class="font-headline-md text-base text-on-surface font-bold mb-1">Desactivar especialista</h2>
          <p class="font-body-md text-sm text-on-surface-variant mb-6">
            ¿Estás seguro de desactivar a <span class="font-semibold text-on-surface">{{ deleteTarget?.name }}</span>?<br>Dejará de estar disponible para nuevas citas.
          </p>
          <div class="flex gap-3 justify-center">
            <button class="btn-outline-sm" @click="showConfirm = false">Cancelar</button>
            <button class="btn-danger-sm" @click="confirmDelete">Desactivar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import Drawer from 'primevue/drawer';
import AppButton from '../../components/atoms/AppButton.vue';
import AppDropdown from '../../components/atoms/AppDropdown.vue';

const loading = shallowRef(true);
const showDialog = shallowRef(false);
const editingId = shallowRef<number | null>(null);
const form = ref({ name: '', specialty: null as string | null, yearsExp: '', bio: '', active: true, imageUrl: '' });
const specialists = shallowRef<any[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const showConfirm = shallowRef(false);
const deleteTarget = shallowRef<any>(null);

const specialtyOptions = [
  { label: 'Estilista Senior', value: 'Estilista Senior' },
  { label: 'Maestro Barbero', value: 'Maestro Barbero' },
  { label: 'Nail Artist', value: 'Nail Artist' },
  { label: 'Especialista en Spa', value: 'Especialista en Spa' }
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
    ? {
        name: spec.name,
        specialty: spec.specialty,
        yearsExp: String(spec.years_exp),
        bio: spec.bio,
        active: spec.active ?? true,
        imageUrl: spec.imageUrl || ''
      }
    : { name: '', specialty: null, yearsExp: '', bio: '', active: true, imageUrl: '' };
  showDialog.value = true;
};

const saveSpecialist = async () => {
  const payload: Record<string, any> = {
    name: form.value.name,
    specialty: form.value.specialty,
    years_exp: Number(form.value.yearsExp),
    bio: form.value.bio,
    active: form.value.active
  };
  if (form.value.imageUrl) payload.imageUrl = form.value.imageUrl;

  if (editingId.value) {
    await supabase.from('specialists').update(payload).eq('id', editingId.value);
  } else {
    payload.appointments = 0;
    payload.rating = 0;
    await supabase.from('specialists').insert(payload);
  }

  showDialog.value = false;
  fetchSpecialists();
};

const deleteSpecialist = (spec: any) => {
  deleteTarget.value = spec;
  showConfirm.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  await supabase.from('specialists').update({ active: false }).eq('id', deleteTarget.value.id);
  showConfirm.value = false;
  deleteTarget.value = null;
  fetchSpecialists();
};

function triggerUpload() {
  fileInput.value?.click();
}

function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      form.value.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

onMounted(fetchSpecialists);
</script>

<style scoped>
.btn-outline-sm {
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: inherit;
  background: transparent;
  color: #999;
  border: 1.5px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 100px;
}
.btn-outline-sm:hover { border-color: #ccc; color: #666; }
.btn-danger-sm {
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: inherit;
  background: #ef5350;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 100px;
}
.btn-danger-sm:hover { background: #d32f2f; }
@media (prefers-reduced-motion: reduce) { .btn-outline-sm, .btn-danger-sm { transition: none; } }
</style>
