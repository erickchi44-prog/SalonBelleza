<template>
  <div class="py-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto space-y-lg">
    <div class="text-center max-w-2xl mx-auto space-y-sm">
      <h1 class="font-display-lg text-4xl md:text-5xl text-on-surface">Valoraciones</h1>
      <p class="font-body-md text-on-surface-variant">Tu experiencia importa. Comparte tu opini&oacute;n sobre nuestros servicios.</p>
    </div>

    <!-- Submit Feedback Form -->
    <div class="max-w-lg mx-auto bg-surface border border-outline-variant/30 p-lg space-y-md shadow-sm">
      <h2 class="font-headline-md text-lg text-on-surface flex items-center gap-sm">
        <i class="pi pi-star text-primary"></i> Dejar una Valoraci&oacute;n
      </h2>
      <div v-if="loadingOptions">
        <div class="h-10 bg-surface-container-high animate-pulse"></div>
      </div>
      <template v-else>
        <app-dropdown
          id="feedbackService"
          v-model="feedbackForm.serviceId"
          label="Servicio"
          :options="serviceSelectOptions"
          optionLabel="label"
          optionValue="value"
          :error="errors.serviceId"
          @blur="validateField('serviceId')"
        />
      </template>
      <div class="space-y-xs">
        <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Calificaci&oacute;n</label>
        <app-rating v-model="feedbackForm.rating" @blur="errors.rating = feedbackForm.rating ? '' : 'Selecciona una calificaci&oacute;n.'" />
        <p v-if="errors.rating" class="text-error text-label-sm">{{ errors.rating }}</p>
      </div>
      <app-textarea
        id="feedbackComment"
        v-model="feedbackForm.comment"
        label="Tu comentario"
        :rows="4"
        :error="errors.comment"
        @blur="validateField('comment')"
      />
      <app-button label="ENVIAR VALORACI&Oacute;N" icon="pi pi-send" class="w-full" @click="submitFeedback" :loading="sending" />
    </div>

    <!-- Reviews list -->
    <div class="space-y-md">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-comments text-primary"></i> Opiniones de Clientes
      </h2>
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        <div v-for="n in 3" :key="n" class="bg-surface border border-outline-variant/30 p-md animate-pulse space-y-sm">
          <div class="h-4 bg-surface-container-high w-1/3"></div>
          <div class="h-3 bg-surface-container-high w-full"></div>
          <div class="h-3 bg-surface-container-high w-2/3"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        <feedback-card
          v-for="review in reviews"
          :key="review.id"
          :id="review.id"
          :customerName="review.customerName"
          :date="review.date"
          :rating="review.rating"
          :comment="review.comment"
          :serviceName="review.serviceName"
        />
      </div>
    </div>
    <p-toast />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '../lib/supabase';
import { useFeedback } from '../composables/useFeedback';
import AppDropdown from '../components/atoms/AppDropdown.vue';
import AppRating from '../components/atoms/AppRating.vue';
import AppTextarea from '../components/atoms/AppTextarea.vue';
import AppButton from '../components/atoms/AppButton.vue';
import FeedbackCard from '../components/molecules/FeedbackCard.vue';
import PToast from 'primevue/toast';

const router = useRouter();
const toast = useToast();
const sending = shallowRef(false);
const loadingOptions = shallowRef(true);
const errors = reactive<Record<string, string>>({});

const { reviews, loading, fetchReviews } = useFeedback();

const feedbackForm = reactive({ serviceId: null as number | null, rating: 0, comment: '' });
const serviceSelectOptions = shallowRef<{ label: string; value: number }[]>([]);

function validateField(field: string) {
  delete errors[field];
  switch (field) {
    case 'serviceId':
      if (!feedbackForm.serviceId) errors.serviceId = 'Selecciona un servicio.';
      break;
    case 'comment':
      if (!feedbackForm.comment.trim()) errors.comment = 'Escribe un comentario.';
      break;
  }
}

function validateAll(): boolean {
  ['serviceId', 'comment'].forEach(validateField);
  return Object.keys(errors).length === 0;
}

const submitFeedback = async () => {
  errors.serviceId = '';
  errors.comment = '';
  if (!validateAll()) return;

  if (!feedbackForm.rating) {
    errors.rating = 'Selecciona una calificaci&oacute;n.';
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    router.push('/login');
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  sending.value = true;

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    customer_name: profile?.full_name || 'Usuario',
    service_id: feedbackForm.serviceId,
    rating: feedbackForm.rating,
    comment: feedbackForm.comment
  });

  sending.value = false;

  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    return;
  }

  feedbackForm.serviceId = null;
  feedbackForm.rating = 0;
  feedbackForm.comment = '';
  toast.add({ severity: 'success', summary: 'Gracias!', detail: 'Tu valoraci&oacute;n ha sido publicada.', life: 3000 });
  fetchReviews();
};

onMounted(async () => {
  fetchReviews();
  const { data } = await supabase.from('services').select('id, title').eq('active', true).order('id');
  serviceSelectOptions.value = (data || []).map(s => ({ label: s.title, value: s.id }));
  loadingOptions.value = false;
});
</script>
