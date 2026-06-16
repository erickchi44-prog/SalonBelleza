<template>
  <div class="py-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto space-y-lg">
    <div class="text-center max-w-2xl mx-auto space-y-sm">
      <h1 class="font-display-lg text-4xl md:text-5xl text-on-surface">Valoraciones</h1>
      <p class="font-body-md text-on-surface-variant">Tu experiencia importa. Comparte tu opinión sobre nuestros servicios.</p>
    </div>

    <!-- Submit Feedback Form -->
    <div class="max-w-lg mx-auto bg-surface border border-outline-variant/30 p-lg space-y-md shadow-sm">
      <h2 class="font-headline-md text-lg text-on-surface flex items-center gap-sm">
        <i class="pi pi-star text-primary"></i> Dejar una Valoración
      </h2>
      <app-dropdown
        id="feedbackService"
        v-model="feedbackForm.serviceId"
        label="Servicio"
        :options="serviceOptions"
        optionLabel="label"
        optionValue="value"
      />
      <div class="space-y-xs">
        <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Calificación</label>
        <app-rating v-model="feedbackForm.rating" />
      </div>
      <app-textarea
        id="feedbackComment"
        v-model="feedbackForm.comment"
        label="Tu comentario"
        :rows="4"
      />
      <app-button label="ENVIAR VALORACIÓN" icon="pi pi-send" class="w-full" @click="submitFeedback" :loading="loading" />
    </div>

    <!-- Reviews list -->
    <div class="space-y-md">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-comments text-primary"></i> Opiniones de Clientes
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
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

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '../lib/supabase';
import AppDropdown from '../components/atoms/AppDropdown.vue';
import AppRating from '../components/atoms/AppRating.vue';
import AppTextarea from '../components/atoms/AppTextarea.vue';
import AppButton from '../components/atoms/AppButton.vue';
import FeedbackCard from '../components/molecules/FeedbackCard.vue';
import PToast from 'primevue/toast';

const router = useRouter();
const toast = useToast();
const loading = ref(false);

const feedbackForm = ref({ serviceId: null, rating: 0, comment: '' });
const serviceOptions = ref([]);
const reviews = ref([]);

const fetchReviews = async () => {
  const { data } = await supabase
    .from('feedback')
    .select('*, services(title)')
    .order('created_at', { ascending: false });

  reviews.value = (data || []).map(r => ({
    id: r.id,
    customerName: r.customer_name,
    date: new Date(r.created_at).toLocaleDateString('es-MX'),
    rating: r.rating,
    comment: r.comment,
    serviceName: r.services?.title || '-'
  }));
};

const submitFeedback = async () => {
  if (!feedbackForm.value.serviceId || feedbackForm.value.rating === 0 || !feedbackForm.value.comment) {
    toast.add({ severity: 'warn', summary: 'Campos incompletos', detail: 'Por favor completa todos los campos.', life: 3000 });
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

  loading.value = true;

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    customer_name: profile?.full_name || 'Usuario',
    service_id: feedbackForm.value.serviceId,
    rating: feedbackForm.value.rating,
    comment: feedbackForm.value.comment
  });

  loading.value = false;

  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    return;
  }

  feedbackForm.value = { serviceId: null, rating: 0, comment: '' };
  toast.add({ severity: 'success', summary: '¡Gracias!', detail: 'Tu valoración ha sido publicada.', life: 3000 });
  fetchReviews();
};

onMounted(async () => {
  fetchReviews();
  const { data } = await supabase.from('services').select('id, title').eq('active', true).order('id');
  serviceOptions.value = (data || []).map(s => ({ label: s.title, value: s.id }));
});
</script>
