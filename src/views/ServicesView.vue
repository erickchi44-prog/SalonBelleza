<template>
  <div class="py-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto space-y-lg">
    <!-- Header Section -->
    <div class="text-center max-w-2xl mx-auto space-y-sm">
      <h1 class="font-display-lg text-4xl md:text-6xl text-on-surface">Nuestros Servicios</h1>
      <p class="font-body-lg text-on-surface-variant">
        Explora nuestra selección de tratamientos de autor diseñados para restaurar tu bienestar y realzar tu belleza natural.
      </p>
    </div>

    <!-- Search & Filter Controls -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant/30 pb-md">
      <!-- Search Input -->
      <div class="relative w-full md:max-w-md">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar servicios..."
          class="w-full pl-10 pr-4 py-2 border border-outline-variant/30 rounded-none bg-surface focus:outline-none focus:border-primary font-body-md"
        />
      </div>

      <!-- Categories Selector -->
      <div class="flex flex-wrap gap-xs">
        <button
          v-for="cat in categories"
          :key="cat"
          class="px-md py-sm font-label-sm text-xs tracking-wider border cursor-pointer transition-all duration-300 rounded-none uppercase"
          :class="selectedCategory === cat ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-outline-variant/30 hover:border-primary'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Services Grid -->
    <div v-if="filteredServices.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
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
      <p class="font-body-md text-on-surface-variant">No se encontraron servicios que coincidan con tu búsqueda.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabase';
import ServiceCard from '../components/molecules/ServiceCard.vue';

const router = useRouter();
const searchQuery = ref('');
const selectedCategory = ref('TODOS');
const services = ref([]);

const categories = ['TODOS', 'CABELLO', 'MANICURA & PEDICURA', 'FACIALES', 'BIENESTAR'];

onMounted(async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('id');
  if (!error) services.value = data;
});

const filteredServices = computed(() => {
  return services.value.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === 'TODOS' || service.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const onBookService = (service) => {
  localStorage.setItem('selected_booking_service', JSON.stringify(service));
  router.push('/booking');
};
</script>
