<template>
  <div class="py-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto space-y-lg">
    <!-- Header Section -->
    <div class="text-center max-w-2xl mx-auto space-y-sm">
      <h1 class="font-display-lg text-4xl md:text-6xl text-on-surface">Nuestros Servicios</h1>
      <p class="font-body-lg text-on-surface-variant">
        Explora nuestra selecci&oacute;n de tratamientos de autor dise&ntilde;ados para restaurar tu bienestar y realzar tu belleza natural.
      </p>
    </div>

    <!-- Search & Filter Controls -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant/30 pb-md">
      <div class="relative w-full md:max-w-md">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70"></i>
        <input
          v-model="localRawSearch"
          type="text"
          placeholder="Buscar servicios..."
          class="w-full pl-10 pr-4 py-2 border border-outline-variant/30 rounded-none bg-surface focus:outline-none focus-visible:border-primary font-body-md"
        />
      </div>

      <div class="flex flex-wrap gap-xs">
        <button
          v-for="cat in categories"
          :key="cat"
          class="px-md py-sm font-label-sm text-xs tracking-wider border cursor-pointer transition-all duration-300 rounded-none uppercase focus-visible:outline-2 focus-visible:outline-primary"
          :class="selectedCategory === cat ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-outline-variant/30 hover:border-primary'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
      <div v-for="n in 6" :key="n" class="bg-surface border border-outline-variant/30 p-md animate-pulse space-y-sm">
        <div class="w-full h-48 bg-surface-container-high"></div>
        <div class="h-5 bg-surface-container-high w-3/4"></div>
        <div class="h-4 bg-surface-container-high w-full"></div>
        <div class="h-4 bg-surface-container-high w-1/2"></div>
      </div>
    </div>

    <!-- Services Grid -->
    <div v-else-if="filteredServices.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
      <div v-for="service in filteredServices" :key="service.id">
        <service-card
          :id="service.id"
          :title="service.title"
          :description="service.description"
          :price="service.price"
          :duration="service.duration"
          :imageUrl="service.imageUrl"
          @select="onBookService"
        />
      </div>
    </div>
    <div v-else class="text-center py-xl space-y-sm border border-dashed border-outline-variant/50">
      <i class="pi pi-search text-3xl text-outline-variant"></i>
      <p class="font-body-md text-on-surface-variant">No se encontraron servicios que coincidan con tu b&uacute;squeda.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useServices } from '../composables/useServices';
import { debounce } from '../utils/debounce';
import ServiceCard from '../components/molecules/ServiceCard.vue';

const router = useRouter();
const { services, loading, categories, fetchServices } = useServices();
const selectedCategory = shallowRef('TODOS');
const localRawSearch = shallowRef('');
const localSearch = shallowRef('');

const debouncedUpdate = debounce((value: string) => {
  localSearch.value = value
}, 300)

watch(localRawSearch, (val) => debouncedUpdate(val))

const filteredServices = computed(() =>
  services.value.filter(s => {
    const q = localSearch.value.toLowerCase()
    const matchesSearch = s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    const matchesCategory = selectedCategory.value === 'TODOS' || s.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
)

onMounted(fetchServices);

const onBookService = (service: { id?: string | number; title?: string; price?: string | number; duration?: string | number }) => {
  localStorage.setItem('selected_booking_service', JSON.stringify(service));
  router.push('/booking');
};
</script>
