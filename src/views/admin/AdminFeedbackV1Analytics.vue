<template>
  <div class="space-y-md">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-star text-primary"></i> Panel de Valoraciones
      </h2>
      <div v-if="!loading" class="flex items-center gap-sm">
        <app-button label="Exportar" icon="pi pi-download" variant="outlined" @click="exportReport" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-md">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-sm">
        <div v-for="n in 4" :key="n" class="bg-surface border border-outline-variant/30 rounded-xl p-md animate-pulse">
          <div class="h-3 bg-surface-container-high w-2/3 rounded mb-sm"></div>
          <div class="h-7 bg-surface-container-high w-1/2 rounded"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-md">
        <div class="md:col-span-2 bg-surface border border-outline-variant/30 rounded-xl p-md animate-pulse">
          <div v-for="n in 5" :key="n" class="h-4 bg-surface-container-high w-full mb-sm rounded"></div>
        </div>
        <div class="md:col-span-3 bg-surface border border-outline-variant/30 rounded-xl p-md animate-pulse">
          <div v-for="n in 3" :key="n" class="h-16 bg-surface-container-high mb-sm rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-danger-container/20 border border-danger/20 rounded-xl p-lg text-center">
      <i class="pi pi-exclamation-triangle text-danger text-2xl mb-sm block"></i>
      <p class="font-label-md text-sm text-on-surface mb-md">{{ error }}</p>
      <app-button label="Reintentar" icon="pi pi-refresh" @click="retry" />
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-sm">
        <div class="bg-surface border border-outline-variant/30 rounded-xl p-md shadow-sm">
          <p class="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mb-xs">Promedio</p>
          <div class="flex items-baseline gap-xs">
            <span class="font-display-lg text-3xl font-bold text-primary">{{ averageRating }}</span>
            <div class="flex gap-[2px]">
              <i v-for="n in 5" :key="n" class="pi pi-star-fill text-xs" :class="n <= Math.round(Number(averageRating)) ? 'text-primary' : 'text-outline-variant/40'"></i>
            </div>
          </div>
        </div>
        <div class="bg-surface border border-outline-variant/30 rounded-xl p-md shadow-sm">
          <p class="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mb-xs">Total</p>
          <p class="font-display-lg text-3xl font-bold text-on-surface">{{ reviews.length }}</p>
          <p class="text-label-sm text-on-surface-variant mt-xs">valoraciones</p>
        </div>
        <div class="bg-surface border border-outline-variant/30 rounded-xl p-md shadow-sm">
          <p class="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mb-xs">Respuestas</p>
          <p class="font-display-lg text-3xl font-bold text-on-surface">{{ respondedCount }}</p>
          <p class="text-label-sm text-on-surface-variant mt-xs">respondidas</p>
        </div>
        <div class="bg-surface border border-outline-variant/30 rounded-xl p-md shadow-sm">
          <p class="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mb-xs">Servicios</p>
          <p class="font-display-lg text-3xl font-bold text-on-surface">{{ uniqueServices }}</p>
          <p class="text-label-sm text-on-surface-variant mt-xs">con reseñas</p>
        </div>
      </div>

      <!-- Charts + Reviews -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-md">
        <!-- Rating Distribution -->
        <div class="md:col-span-2 bg-surface border border-outline-variant/30 rounded-xl p-md shadow-sm">
          <h3 class="font-label-md text-sm text-on-surface-variant uppercase tracking-widest mb-md">Distribución</h3>
          <div v-for="n in [5,4,3,2,1]" :key="n" class="flex items-center gap-sm mb-sm last:mb-0 min-h-[44px]">
            <span class="font-label-sm text-xs text-on-surface-variant w-3 shrink-0 font-semibold">{{ n }}</span>
            <i class="pi pi-star-fill text-primary text-xs shrink-0"></i>
            <div class="flex-1 bg-surface-container-high h-3 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="ratingPercent(n)" aria-valuemin="0" aria-valuemax="100" :aria-label="`${n} estrellas: ${ratingPercent(n)}%`">
              <div class="bg-primary h-full rounded-full transition-all duration-700" :style="`width: ${ratingPercent(n)}%`"></div>
            </div>
            <span class="font-label-sm text-xs text-on-surface-variant w-6 text-right shrink-0 tabular-nums">{{ countByRating(n) }}</span>
          </div>
          <div class="mt-md pt-md border-t border-outline-variant/10">
            <p class="text-label-sm text-on-surface-variant/60 text-center">Calificación general basada en {{ reviews.length }} valoraciones</p>
          </div>
        </div>

        <!-- Review List -->
        <div class="md:col-span-3 bg-surface border border-outline-variant/30 rounded-xl p-md shadow-sm">
          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-sm mb-md">
            <div class="relative flex-1 min-w-0">
              <i class="pi pi-search absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm"></i>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Buscar por cliente o servicio..."
                class="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg py-sm pl-lg pr-sm text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div class="flex gap-sm flex-wrap">
              <button
                v-for="opt in ratingOptions"
                :key="opt.value ?? 'all'"
                @click="filterRating = opt.value"
                class="px-sm py-sm rounded-lg border text-xs font-label-md font-semibold uppercase tracking-wider transition-all min-h-[44px]"
                :class="filterRating === opt.value ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/20 text-on-surface-variant hover:border-primary/30'"
              >{{ opt.label }}</button>
            </div>
          </div>

          <!-- Results count -->
          <div class="flex items-center justify-between mb-sm">
            <p class="text-label-sm text-on-surface-variant/60">{{ filteredReviews.length }} de {{ reviews.length }} valoraciones</p>
            <select
              v-model="sortBy"
              class="text-xs bg-surface border border-outline-variant/20 rounded-lg py-sm px-sm text-on-surface font-label-md focus:outline-none focus:border-primary"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="highest">Mejor calificados</option>
              <option value="lowest">Peor calificados</option>
            </select>
          </div>

          <!-- Cards -->
          <div class="space-y-sm max-h-[600px] overflow-y-auto pr-xs">
            <div v-if="sortedReviews.length === 0" class="text-center py-xl">
              <i class="pi pi-inbox text-2xl text-outline-variant/40 block mb-sm"></i>
              <p class="text-sm text-on-surface-variant/60">No se encontraron valoraciones</p>
              <button v-if="filterRating || searchQuery" @click="clearFilters" class="text-primary text-xs font-label-md font-semibold mt-sm hover:underline">Limpiar filtros</button>
            </div>
            <article
              v-for="review in sortedReviews"
              :key="review.id"
              class="border border-outline-variant/20 rounded-xl p-md hover:border-primary/30 hover:shadow-sm transition-all duration-300"
            >
              <div class="flex items-start justify-between gap-sm mb-sm">
                <div class="flex items-center gap-sm min-w-0">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-surface-tint flex items-center justify-center text-on-primary font-bold text-sm shrink-0 shadow-sm" aria-hidden="true">
                    {{ review.customerName.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-label-md text-sm font-semibold text-on-surface truncate">{{ review.customerName }}</p>
                    <div class="flex items-center gap-xs">
                      <app-rating :modelValue="review.rating" readonly />
                      <span class="text-label-sm text-on-surface-variant/50">· {{ review.date }}</span>
                    </div>
                  </div>
                </div>
                <button
                  @click="toggleExpand(review.id)"
                  class="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant/40 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                  :aria-label="expandedId === review.id ? 'Colapsar' : 'Expandir'"
                  :aria-expanded="expandedId === review.id"
                >
                  <i class="pi pi-ellipsis-v text-sm"></i>
                </button>
              </div>
              <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">"{{ review.comment }}"</p>
              <div class="flex items-center justify-between mt-sm pt-sm border-t border-outline-variant/10">
                <span class="flex items-center gap-xs text-label-sm text-primary font-medium">
                  <i class="pi pi-tag"></i> {{ review.serviceName }}
                </span>
                <button
                  @click="initiateReply(review)"
                  class="flex items-center gap-xs text-label-sm text-on-surface-variant hover:text-primary transition-colors min-h-[44px] px-sm rounded-lg hover:bg-primary/5"
                  :aria-label="'Responder a ' + review.customerName"
                >
                  <i class="pi pi-reply"></i> Responder
                </button>
              </div>
              <!-- Inline reply -->
              <div v-if="replyingTo?.id === review.id" class="mt-sm pt-sm border-t border-outline-variant/10">
                <div class="flex gap-sm">
                  <app-input
                    id="reply"
                    v-model="replyText"
                    label="Escribe tu respuesta..."
                    class="flex-1"
                  />
                  <div class="flex gap-xs items-start pt-xs">
                    <app-button label="Enviar" icon="pi pi-send" @click="submitReply(review)" :loading="sending" />
                    <button
                      @click="cancelReply"
                      class="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant/40 hover:text-danger transition-colors"
                      aria-label="Cancelar respuesta"
                    >
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, ref, onMounted } from 'vue';
import { useFeedback } from '../../composables/useFeedback';
import AppRating from '../../components/atoms/AppRating.vue';
import AppButton from '../../components/atoms/AppButton.vue';
import AppInput from '../../components/atoms/AppInput.vue';
import type { FeedbackDisplay } from '../../types';

const { reviews, loading: dataLoading, averageRating, fetchReviews } = useFeedback();

const loading = shallowRef(true);
const error = shallowRef<string | null>(null);
const searchQuery = shallowRef('');
const filterRating = shallowRef<number | null>(null);
const sortBy = shallowRef<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
const expandedId = shallowRef<number | null>(null);
const replyingTo = shallowRef<FeedbackDisplay | null>(null);
const replyText = shallowRef('');
const sending = shallowRef(false);
const selectedService = shallowRef<string | null>(null);

const ratingOptions = [
  { label: 'Todas', value: null },
  { label: '5', value: 5 },
  { label: '4', value: 4 },
  { label: '3', value: 3 },
  { label: '2', value: 2 },
  { label: '1', value: 1 },
];

const respondedCount = computed(() => 0);

const uniqueServices = computed(() => {
  const services = new Set(reviews.value.map(r => r.serviceName));
  return services.size;
});

const filteredReviews = computed(() => {
  let result = reviews.value;
  if (filterRating.value !== null) {
    result = result.filter(r => r.rating === filterRating.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(r =>
      r.customerName.toLowerCase().includes(q) ||
      r.serviceName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  }
  return result;
});

const sortedReviews = computed(() => {
  const sorted = [...filteredReviews.value];
  switch (sortBy.value) {
    case 'newest': return sorted.reverse();
    case 'oldest': return sorted;
    case 'highest': return sorted.sort((a, b) => b.rating - a.rating);
    case 'lowest': return sorted.sort((a, b) => a.rating - b.rating);
    default: return sorted;
  }
});

const countByRating = (n: number) => reviews.value.filter(r => r.rating === n).length;
const ratingPercent = (n: number) => reviews.value.length > 0 ? (countByRating(n) / reviews.value.length) * 100 : 0;

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id;
}

function initiateReply(review: FeedbackDisplay) {
  replyingTo.value = review;
  replyText.value = '';
}

function cancelReply() {
  replyingTo.value = null;
  replyText.value = '';
}

async function submitReply(review: FeedbackDisplay) {
  if (!replyText.value.trim()) return;
  sending.value = true;
  await new Promise(r => setTimeout(r, 800));
  sending.value = false;
  replyingTo.value = null;
  replyText.value = '';
}

function clearFilters() {
  filterRating.value = null;
  searchQuery.value = '';
  sortBy.value = 'newest';
}

async function retry() {
  error.value = null;
  loading.value = true;
  await loadData();
}

async function loadData() {
  try {
    await fetchReviews();
  } catch (e: any) {
    error.value = e?.message || 'Error al cargar valoraciones';
  } finally {
    loading.value = false;
  }
}

function exportReport() {
  // Placeholder for export functionality
}

onMounted(async () => {
  loading.value = true;
  await loadData();
});
</script>
