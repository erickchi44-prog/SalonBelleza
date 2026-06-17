<template>
  <div class="space-y-md">
    <div class="flex items-center justify-between">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-star text-primary"></i> Panel de Valoraciones
      </h2>
      <div class="flex items-center gap-sm bg-surface border border-outline-variant/30 px-md py-sm shadow-sm">
        <div class="text-center">
          <p class="font-display-lg text-3xl font-bold text-primary">{{ averageRating }}</p>
          <div class="flex gap-xs justify-center">
            <i v-for="n in 5" :key="n" class="pi pi-star-fill text-xs" :class="n <= Math.round(Number(averageRating)) ? 'text-primary' : 'text-outline-variant'"></i>
          </div>
          <p class="text-label-sm text-on-surface-variant mt-xs">{{ reviews.length }} valoraciones</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-md">
      <div class="md:col-span-1 bg-surface border border-outline-variant/30 p-md animate-pulse">
        <div class="h-4 bg-surface-container-high w-1/2 mb-md"></div>
        <div v-for="n in 5" :key="n" class="h-4 bg-surface-container-high w-full mb-sm"></div>
      </div>
      <div class="md:col-span-2 bg-surface border border-outline-variant/30 p-md animate-pulse">
        <div v-for="n in 3" :key="n" class="h-20 bg-surface-container-high mb-sm"></div>
      </div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div class="bg-surface border border-outline-variant/30 p-md shadow-sm md:col-span-1">
          <h3 class="font-label-md text-sm text-on-surface-variant uppercase tracking-widest mb-md">Distribuci&oacute;n de Calificaciones</h3>
          <div v-for="n in [5,4,3,2,1]" :key="n" class="flex items-center gap-sm mb-sm">
            <span class="font-label-sm text-xs text-on-surface-variant w-3">{{ n }}</span>
            <i class="pi pi-star-fill text-primary text-xs"></i>
            <div class="flex-1 bg-surface-container-high h-2">
              <div class="bg-primary h-2 transition-all duration-700" :style="`width: ${ratingPercent(n)}%`"></div>
            </div>
            <span class="font-label-sm text-xs text-on-surface-variant w-6 text-right">{{ countByRating(n) }}</span>
          </div>
        </div>

        <div class="md:col-span-2 bg-surface border border-outline-variant/30 p-md shadow-sm">
          <div class="flex items-center justify-between mb-md">
            <h3 class="font-label-md text-sm text-on-surface-variant uppercase tracking-widest">Filtros</h3>
            <app-dropdown id="filterRating" v-model="filterRating" label="Calificaci&oacute;n" :options="ratingOptions" optionLabel="label" optionValue="value" class="w-40" />
          </div>
          <div class="space-y-sm max-h-[360px] overflow-y-auto pr-xs">
            <div v-for="review in filteredReviews" :key="review.id"
              class="border border-outline-variant/20 p-md hover:border-primary/30 transition-all duration-300">
              <div class="flex items-start justify-between mb-sm">
                <div class="flex items-center gap-sm">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {{ review.customerName.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-label-md text-sm font-semibold text-on-surface">{{ review.customerName }}</p>
                    <p class="text-label-sm text-on-surface-variant">{{ review.date }}</p>
                  </div>
                </div>
                <app-rating :modelValue="review.rating" :readonly="true" />
              </div>
              <p class="font-body-md text-sm text-on-surface-variant italic">"{{ review.comment }}"</p>
              <div class="flex items-center justify-between mt-sm">
                <span class="flex items-center gap-xs text-label-sm text-primary font-medium">
                  <i class="pi pi-tag"></i> {{ review.serviceName }}
                </span>
                <button class="text-label-sm text-on-surface-variant hover:text-primary flex items-center gap-xs transition-colors">
                  <i class="pi pi-reply"></i> Responder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, onMounted } from 'vue';
import { useFeedback } from '../../composables/useFeedback';
import AppRating from '../../components/atoms/AppRating.vue';
import AppDropdown from '../../components/atoms/AppDropdown.vue';

const { reviews, loading, averageRating, fetchReviews } = useFeedback();

const filterRating = shallowRef<number | null>(null);

const ratingOptions = [
  { label: 'Todas', value: null },
  { label: '5 estrellas', value: 5 },
  { label: '4 estrellas', value: 4 },
  { label: '3 estrellas', value: 3 },
  { label: '2 estrellas', value: 2 },
  { label: '1 estrella', value: 1 }
];

const filteredReviews = computed(() =>
  filterRating.value ? reviews.value.filter(r => r.rating === filterRating.value) : reviews.value
);

const countByRating = (n: number) => reviews.value.filter(r => r.rating === n).length;
const ratingPercent = (n: number) => reviews.value.length > 0 ? (countByRating(n) / reviews.value.length) * 100 : 0;

onMounted(fetchReviews);
</script>
