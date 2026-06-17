<template>
  <div class="space-y-md">
    <div class="flex items-center justify-between">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-percentage text-primary"></i> Gesti&oacute;n de Promociones
      </h2>
      <app-button label="NUEVA PROMOCI&Oacute;N" icon="pi pi-plus" @click="openDialog()" />
    </div>

    <div v-if="loading" class="bg-surface border border-outline-variant/30 p-md animate-pulse space-y-sm">
      <div v-for="n in 3" :key="n" class="h-12 bg-surface-container-high"></div>
    </div>

    <template v-else>
      <div class="bg-surface border border-outline-variant/30 shadow-sm overflow-hidden">
        <p-datatable :value="promotions" :paginator="true" :rows="8" stripedRows class="text-sm">
          <p-column field="title" header="T&iacute;tulo">
            <template #body="{ data }">
              <div>
                <p class="font-semibold text-on-surface text-sm">{{ data.title }}</p>
                <p class="text-xs text-on-surface-variant">{{ data.description }}</p>
              </div>
            </template>
          </p-column>
          <p-column field="discount" header="Descuento">
            <template #body="{ data }">
              <span class="bg-primary/10 text-primary px-sm py-xs text-xs font-bold">{{ data.discount }}% OFF</span>
            </template>
          </p-column>
          <p-column field="validUntil" header="V&aacute;lido hasta" />
          <p-column field="service" header="Servicio" />
          <p-column header="Estado">
            <template #body="{ data }">
              <span class="px-sm py-xs text-label-sm font-label-sm uppercase tracking-wider"
                :class="data.active ? 'bg-success-container text-on-success-container' : 'bg-surface-dim text-on-surface-variant'">
                {{ data.active ? 'Activa' : 'Inactiva' }}
              </span>
            </template>
          </p-column>
          <p-column header="Acciones">
            <template #body="{ data }">
              <div class="flex gap-xs">
                <button class="text-primary hover:text-surface-tint transition-colors p-xs" title="Editar" @click="openDialog(data)">
                  <i class="pi pi-pencil text-sm"></i>
                </button>
                <button class="text-on-surface-variant hover:text-error transition-colors p-xs" title="Eliminar" @click="deletePromotion(data.id)">
                  <i class="pi pi-trash text-sm"></i>
                </button>
              </div>
            </template>
          </p-column>
        </p-datatable>
      </div>
    </template>

    <p-dialog v-model:visible="showDialog" :header="editingId ? 'Editar Promoci&oacute;n' : 'Nueva Promoci&oacute;n'" modal :style="{ width: '520px' }">
      <div class="space-y-md p-md">
        <app-input id="promoTitle" v-model="form.title" label="T&iacute;tulo de la Promoci&oacute;n" />
        <app-textarea id="promoDesc" v-model="form.description" label="Descripci&oacute;n" :rows="2" />
        <div class="grid grid-cols-2 gap-md">
          <app-input id="promoDiscount" v-model="form.discount" label="Descuento (%)" type="number" />
          <app-calendar id="promoDate" v-model="form.validUntil" label="V&aacute;lido hasta" :minDate="new Date()" />
        </div>
        <app-dropdown id="promoService" v-model="form.service" label="Servicio Aplicable"
          :options="serviceOptions" optionLabel="label" optionValue="value" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-sm p-sm">
          <app-button label="CANCELAR" variant="outlined" @click="showDialog = false" />
          <app-button :label="editingId ? 'GUARDAR CAMBIOS' : 'CREAR PROMOCI&Oacute;N'" icon="pi pi-check" @click="savePromotion" />
        </div>
      </template>
    </p-dialog>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import type { PromotionDisplay } from '../../types';
import PDataTable from 'primevue/datatable';
import PColumn from 'primevue/column';
import PDialog from 'primevue/dialog';
import AppButton from '../../components/atoms/AppButton.vue';
import AppInput from '../../components/atoms/AppInput.vue';
import AppDropdown from '../../components/atoms/AppDropdown.vue';
import AppCalendar from '../../components/atoms/AppCalendar.vue';
import AppTextarea from '../../components/atoms/AppTextarea.vue';

const loading = shallowRef(true);
const showDialog = shallowRef(false);
const editingId = shallowRef<number | null>(null);
const form = shallowRef({ title: '', description: '', discount: '', validUntil: null as Date | null, service: null as number | string | null });
const promotions = shallowRef<PromotionDisplay[]>([]);
const serviceOptions = shallowRef<{ label: string; value: string | number }[]>([]);

const fetchPromotions = async () => {
  loading.value = true;
  const { data } = await supabase
    .from('promotions')
    .select('*, services(title)')
    .order('created_at', { ascending: false });

  promotions.value = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    discount: p.discount,
    validUntil: p.valid_until
      ? new Date(p.valid_until).toLocaleDateString('es-MX')
      : '-',
    service: p.services?.title || 'Todos los servicios',
    active: p.active
  }));
  loading.value = false;
};

const fetchOptions = async () => {
  const { data } = await supabase.from('services').select('id, title').eq('active', true).order('id');
  serviceOptions.value = [
    { label: 'Todos los servicios', value: 'all' },
    ...(data || []).map(s => ({ label: s.title, value: s.id }))
  ];
};

const openDialog = (promo: any = null) => {
  editingId.value = promo?.id || null;
  form.value = promo
    ? { title: promo.title, description: promo.description, discount: String(promo.discount), validUntil: null, service: null }
    : { title: '', description: '', discount: '', validUntil: null, service: null };
  showDialog.value = true;
};

const savePromotion = async () => {
  const payload = {
    title: form.value.title,
    description: form.value.description,
    discount: Number(form.value.discount),
    valid_until: form.value.validUntil?.toISOString().split('T')[0],
    service_id: form.value.service === 'all' ? null : form.value.service,
    active: true
  };

  if (editingId.value) {
    await supabase.from('promotions').update(payload).eq('id', editingId.value);
  } else {
    await supabase.from('promotions').insert(payload);
  }

  showDialog.value = false;
  fetchPromotions();
};

const deletePromotion = async (id: number) => {
  await supabase.from('promotions').delete().eq('id', id);
  fetchPromotions();
};

onMounted(() => {
  fetchOptions();
  fetchPromotions();
});
</script>
