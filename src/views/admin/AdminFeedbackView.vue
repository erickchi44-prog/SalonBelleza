<template>
  <div class="flex flex-col xl:flex-row gap-0 min-h-[calc(100vh-6rem)]">
    <!-- Loading -->
    <template v-if="loading">
      <div class="w-full xl:w-80 bg-surface border-b xl:border-b-0 xl:border-r border-outline-variant/15 px-md xl:px-lg py-md shrink-0">
        <div class="animate-pulse space-y-md">
          <div class="h-4 bg-surface-container-high w-1/2 rounded"></div>
          <div class="w-24 h-24 rounded-full bg-surface-container-high mx-auto"></div>
          <div class="h-3 bg-surface-container-high w-1/3 mx-auto rounded"></div>
          <div v-for="n in 5" :key="n" class="h-6 bg-surface-container-high w-full rounded"></div>
        </div>
      </div>
      <div class="flex-1 px-md xl:px-lg py-md space-y-sm">
        <div v-for="n in 3" :key="n" class="animate-pulse bg-surface border border-outline-variant/15 rounded-xl p-md">
          <div class="flex gap-sm">
            <div class="w-12 h-12 rounded-full bg-surface-container-high shrink-0"></div>
            <div class="flex-1 space-y-sm">
              <div class="h-4 bg-surface-container-high w-1/3 rounded"></div>
              <div class="h-3 bg-surface-container-high w-1/4 rounded"></div>
              <div class="h-8 bg-surface-container-high w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center p-lg">
      <div class="text-center max-w-sm">
        <i class="pi pi-exclamation-triangle text-3xl text-danger block mb-sm"></i>
        <p class="text-sm text-on-surface-variant mb-md">{{ error }}</p>
        <app-button label="Reintentar" icon="pi pi-refresh" @click="retry" />
      </div>
    </div>

    <template v-else>
      <!-- ===== SIDE PANEL ===== -->
      <aside class="w-full xl:w-80 bg-surface border-b xl:border-b-0 xl:border-r border-outline-variant/15 px-md xl:px-lg py-md shrink-0 overflow-y-auto">
        <h2 class="font-headline-md text-lg text-on-surface flex items-center gap-sm mb-md">
          <i class="pi pi-star text-primary"></i> Valoraciones
        </h2>

        <!-- Rating circle -->
        <div class="text-center mb-md">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-fixed-dim mx-auto flex flex-col items-center justify-center text-on-primary shadow-lg mb-sm">
            <span class="font-display-lg text-3xl font-bold leading-none">{{ averageRating }}</span>
            <span class="text-label-sm text-on-primary/80 uppercase tracking-wider">Promedio</span>
          </div>
          <div class="flex justify-center gap-[2px] mb-xs">
            <i v-for="n in 5" :key="n" class="pi pi-star-fill text-sm" :class="n <= Math.round(Number(averageRating)) ? 'text-primary-fixed-dim' : 'text-outline-variant/20'"></i>
          </div>
          <p class="text-label-sm text-on-surface-variant/40">{{ reviews.length }} valoraciones &middot; {{ uniqueServices }} servicios</p>
        </div>

        <!-- Distribution -->
        <div class="mb-md">
          <p class="text-label-sm text-on-surface-variant/30 uppercase tracking-widest font-bold mb-sm">Distribuci&oacute;n</p>
          <button
            v-for="n in [5,4,3,2,1]"
            :key="n"
            @click="filterRating = filterRating === n ? null : n"
            class="flex items-center gap-sm w-full py-xs px-sm rounded-lg transition-colors min-h-[36px] text-left"
            :class="filterRating === n ? 'bg-primary-container/10' : 'hover:bg-primary-container/5'"
          >
            <span class="text-xs font-bold text-on-surface-variant/50 w-3 text-right shrink-0">{{ n }}</span>
            <i class="pi pi-star-fill text-primary text-[0.625rem] shrink-0"></i>
            <div class="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: ratingPercent(n) + '%', background: ratingBarColor(n) }"></div>
            </div>
            <span class="text-xs text-on-surface-variant/30 w-6 text-right shrink-0 tabular-nums">{{ countByRating(n) }}</span>
          </button>
        </div>

        <!-- Filters -->
        <div class="mb-md space-y-sm">
          <p class="text-label-sm text-on-surface-variant/30 uppercase tracking-widest font-bold mb-sm">Filtros</p>
          <div>
            <label class="text-label-sm text-on-surface-variant/50 block mb-xs" for="filter-service">Servicio</label>
            <select
              id="filter-service"
              v-model="filterService"
              class="w-full bg-surface-container-high border border-outline-variant/15 rounded-lg px-sm py-sm text-sm text-on-surface outline-none focus:border-primary transition-colors"
            >
              <option value="">Todos los servicios</option>
              <option v-for="s in serviceOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="text-label-sm text-on-surface-variant/50 block mb-xs" for="filter-status">Estado</label>
            <div class="flex gap-xs flex-wrap">
              <button
                @click="filterStatus = 'all'"
                class="px-sm py-xs rounded-full border text-xs font-label-md font-semibold transition-all min-h-[36px]"
                :class="filterStatus === 'all' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/15 text-on-surface-variant/50 hover:border-primary/30'"
              >Todas</button>
              <button
                @click="filterStatus = 'responded'"
                class="px-sm py-xs rounded-full border text-xs font-label-md font-semibold transition-all min-h-[36px]"
                :class="filterStatus === 'responded' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/15 text-on-surface-variant/50 hover:border-primary/30'"
              >Respondidas</button>
              <button
                @click="filterStatus = 'pending'"
                class="px-sm py-xs rounded-full border text-xs font-label-md font-semibold transition-all min-h-[36px]"
                :class="filterStatus === 'pending' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/15 text-on-surface-variant/50 hover:border-primary/30'"
              >Sin respuesta</button>
            </div>
          </div>
        </div>

        <!-- Export -->
        <button
          @click="exportReport"
          class="w-full border-2 border-dashed border-outline-variant/20 rounded-xl py-sm text-xs font-semibold text-on-surface-variant/30 hover:text-primary hover:border-primary/30 transition-all min-h-[44px] flex items-center justify-center gap-xs"
        >
          <i class="pi pi-download"></i> Exportar reporte
        </button>
      </aside>

      <!-- ===== MAIN PANEL ===== -->
      <main class="flex-1 px-md xl:px-lg py-md overflow-y-auto min-w-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-md flex-wrap gap-sm">
          <div class="flex items-center gap-xs text-xs text-on-surface-variant/30 font-label-md">
            Admin <i class="pi pi-chevron-right" style="font-size:0.4rem"></i> <span class="text-on-surface font-semibold">Valoraciones</span>
          </div>
          <div class="flex gap-xs">
            <button @click="load" class="min-h-[44px] px-sm rounded-lg border border-outline-variant/15 text-xs font-semibold text-on-surface-variant/50 hover:text-primary hover:border-primary/30 transition-all bg-surface flex items-center gap-xs">
              <i class="pi pi-refresh"></i> Actualizar
            </button>
          </div>
        </div>

        <!-- Search + results bar -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm mb-sm">
          <div class="relative flex-1 max-w-sm w-full">
            <i class="pi pi-search absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant/20 text-sm"></i>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Buscar en valoraciones..."
              class="w-full bg-surface-container-high border border-outline-variant/15 rounded-lg py-sm pl-lg pr-sm text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div class="flex items-center gap-sm text-nowrap">
            <span class="text-xs text-on-surface-variant/30">
              <strong class="text-on-surface/60">{{ paginatedReviews.length }}</strong> de <strong class="text-on-surface/60">{{ filteredReviews.length }}</strong>
            </span>
            <div class="flex items-center gap-xs">
              <label class="text-label-sm text-on-surface-variant/30 uppercase tracking-wider" for="sort-select">Orden</label>
              <select
                id="sort-select"
                v-model="sortBy"
                class="bg-surface border border-outline-variant/15 rounded-lg py-xs px-sm text-xs text-on-surface outline-none focus:border-primary"
              >
                <option value="newest">M&aacute;s recientes</option>
                <option value="oldest">M&aacute;s antiguos</option>
                <option value="highest">Mejor calificados</option>
                <option value="lowest">Peor calificados</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Review list -->
        <div class="space-y-sm">
          <div v-if="paginatedReviews.length === 0" class="text-center py-xl">
            <i class="pi pi-inbox text-3xl text-outline-variant/20 block mb-sm"></i>
            <p class="text-sm text-on-surface-variant/30">No se encontraron valoraciones</p>
            <button v-if="hasActiveFilters" @click="clearFilters" class="text-primary text-xs font-semibold mt-sm hover:underline">Limpiar filtros</button>
          </div>

          <article
            v-for="review in paginatedReviews"
            :key="review.id"
            class="flex items-start gap-sm bg-surface border border-outline-variant/12 rounded-xl p-md hover:border-primary/15 hover:shadow-sm transition-all duration-200"
            :class="{
              'border-l-4 border-l-danger': review.rating <= 2 && !respondedIds.has(review.id),
              'border-l-4 border-l-success': respondedIds.has(review.id)
            }"
          >
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-surface-tint flex items-center justify-center text-on-primary font-bold shrink-0 shadow-sm" aria-hidden="true">
              {{ review.customerName.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-sm flex-wrap">
                <div>
                  <p class="font-label-md text-sm font-semibold text-on-surface">{{ review.customerName }}</p>
                  <div class="flex items-center gap-xs flex-wrap">
                    <app-rating :modelValue="review.rating" readonly />
                    <span class="text-label-sm text-on-surface-variant/30">{{ review.date }}</span>
                    <span class="text-label-sm text-primary font-semibold bg-primary-container/10 px-xs rounded">{{ review.serviceName }}</span>
                  </div>
                </div>
                <span
                  v-if="review.rating <= 2 && !respondedIds.has(review.id)"
                  class="text-label-sm text-danger font-bold bg-danger-container/20 px-sm py-xs rounded-full uppercase tracking-wider"
                >Prioridad</span>
                <span
                  v-if="respondedIds.has(review.id)"
                  class="text-label-sm text-success font-bold bg-success-container/20 px-sm py-xs rounded-full uppercase tracking-wider"
                >Respondida</span>
              </div>
              <p class="font-body-md text-sm text-on-surface-variant/60 leading-relaxed mt-sm">"{{ review.comment }}"</p>
              <div class="flex items-center gap-sm mt-sm pt-sm border-t border-outline-variant/10">
                <button
                  @click="toggleReply(review)"
                  class="min-h-[44px] px-sm rounded-lg text-xs font-semibold transition-all flex items-center gap-xs"
                  :class="replyingTo === review.id ? 'bg-primary text-on-primary' : 'bg-primary-container/10 text-primary hover:bg-primary hover:text-on-primary'"
                >
                  <i class="pi pi-reply"></i> {{ replyingTo === review.id ? 'Cancelar' : 'Responder' }}
                </button>
                <button
                  v-if="respondedIds.has(review.id)"
                  class="min-h-[44px] px-sm rounded-lg text-xs text-on-surface-variant/30 hover:text-on-surface-variant/60 transition-all flex items-center gap-xs"
                >
                  <i class="pi pi-check-circle text-success"></i> Respondida
                </button>
              </div>

              <!-- Inline reply form -->
              <div v-if="replyingTo === review.id" class="mt-sm pt-sm border-t border-outline-variant/10">
                <div class="flex gap-sm">
                  <input
                    v-model="replyText"
                    placeholder="Escribe tu respuesta..."
                    class="flex-1 bg-surface-container-high border border-outline-variant/15 rounded-lg px-sm py-sm text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary transition-colors"
                  />
                  <div class="flex gap-xs">
                    <app-button label="Enviar" icon="pi pi-send" @click="submitReply(review)" :loading="sending" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-xs mt-lg">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-outline-variant/15 text-on-surface-variant/30 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-surface"
          >
            <i class="pi pi-chevron-left" style="font-size:0.75rem"></i>
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="currentPage = p"
            class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-sm font-semibold transition-all"
            :class="p === currentPage ? 'bg-primary text-on-primary' : 'border border-outline-variant/15 text-on-surface-variant/30 hover:text-primary hover:border-primary/30 bg-surface'"
          >{{ p }}</button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-outline-variant/15 text-on-surface-variant/30 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-surface"
          >
            <i class="pi pi-chevron-right" style="font-size:0.75rem"></i>
          </button>
        </div>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, ref, onMounted } from 'vue';
import { useFeedback } from '../../composables/useFeedback';
import AppRating from '../../components/atoms/AppRating.vue';
import AppButton from '../../components/atoms/AppButton.vue';
import type { FeedbackDisplay } from '../../types';

const { reviews, loading: dataLoading, averageRating, fetchReviews } = useFeedback();

const loading = shallowRef(true);
const error = shallowRef<string | null>(null);
const searchQuery = shallowRef('');
const filterRating = shallowRef<number | null>(null);
const filterService = shallowRef('');
const filterStatus = shallowRef<'all' | 'responded' | 'pending'>('all');
const sortBy = shallowRef<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
const currentPage = shallowRef(1);
const perPage = 10;
const replyingTo = shallowRef<number | null>(null);
const replyText = shallowRef('');
const sending = shallowRef(false);
const respondedIds = shallowRef<Set<number>>(new Set());

const serviceOptions = computed(() => {
  const services = new Set(reviews.value.map(r => r.serviceName));
  return Array.from(services).sort();
});

const ratingBarColor = (n: number) => {
  if (n >= 5) return '#16a34a';
  if (n >= 4) return '#79542e';
  if (n >= 3) return '#ca8a04';
  return '#dc2626';
};

const uniqueServices = computed(() => serviceOptions.value.length);

const filteredReviews = computed(() => {
  let result = reviews.value;
  if (filterRating.value !== null) {
    result = result.filter(r => r.rating === filterRating.value);
  }
  if (filterService.value) {
    result = result.filter(r => r.serviceName === filterService.value);
  }
  if (filterStatus.value === 'responded') {
    result = result.filter(r => respondedIds.value.has(r.id));
  }
  if (filterStatus.value === 'pending') {
    result = result.filter(r => !respondedIds.value.has(r.id));
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

const totalPages = computed(() => Math.max(1, Math.ceil(sortedReviews.value.length / perPage)));

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return sortedReviews.value.slice(start, start + perPage);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages: number[] = [];
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4);
    else start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const hasActiveFilters = computed(() =>
  filterRating.value !== null || filterService.value || filterStatus.value !== 'all' || searchQuery.value
);

const countByRating = (n: number) => reviews.value.filter(r => r.rating === n).length;
const ratingPercent = (n: number) => reviews.value.length > 0 ? (countByRating(n) / reviews.value.length) * 100 : 0;

function toggleReply(review: FeedbackDisplay) {
  replyingTo.value = replyingTo.value === review.id ? null : review.id;
  replyText.value = '';
}

async function submitReply(review: FeedbackDisplay) {
  if (!replyText.value.trim()) return;
  sending.value = true;
  await new Promise(r => setTimeout(r, 600));
  respondedIds.value = new Set(respondedIds.value).add(review.id);
  sending.value = false;
  replyingTo.value = null;
  replyText.value = '';
}

function clearFilters() {
  filterRating.value = null;
  filterService.value = '';
  filterStatus.value = 'all';
  searchQuery.value = '';
  sortBy.value = 'newest';
  currentPage.value = 1;
}

function exportReport() {
  // placeholder
}

async function load() {
  error.value = null;
  loading.value = true;
  try {
    await fetchReviews();
  } catch (e: any) {
    error.value = e?.message || 'Error al cargar valoraciones';
  } finally {
    loading.value = false;
  }
}

async function retry() {
  await load();
}

onMounted(async () => {
  loading.value = true;
  try {
    await fetchReviews();
  } catch (e: any) {
    error.value = e?.message || 'Error al cargar valoraciones';
  } finally {
    loading.value = false;
  }
});
</script>
