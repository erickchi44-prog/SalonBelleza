<template>
  <div class="pb-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto">
    <!-- Hero -->
    <section class="text-center pt-lg pb-xl relative">
      <p class="text-label-sm text-primary font-semibold tracking-[0.18em] uppercase mb-md">Aura Luxe Salon</p>
      <h1 class="font-display-lg text-4xl md:text-6xl md:leading-[1.1] text-on-surface">
        Donde el arte <span class="text-primary italic">encuentra</span> tu belleza
      </h1>
      <p class="font-body-lg text-on-surface-variant max-w-[520px] mx-auto mt-md leading-relaxed">
        Cada tratamiento es una experiencia curada por nuestros especialistas para realzar lo que te hace &uacute;nica.
      </p>
      <div class="w-[60px] h-[2px] bg-primary mx-auto mt-xl"></div>
    </section>

    <!-- Category Filter -->
    <div class="flex gap-xs pb-xl justify-center flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat"
        class="px-lg py-sm font-label-sm text-xs tracking-widest uppercase whitespace-nowrap border cursor-pointer transition-all duration-300"
        :class="selectedCategory === cat
          ? 'bg-primary text-on-primary border-primary'
          : 'bg-transparent text-on-surface-variant border-outline-variant/50 hover:border-primary hover:text-primary'"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
      <div v-for="n in 6" :key="n" class="bg-surface animate-pulse">
        <div class="w-full h-[280px] bg-surface-container-high"></div>
        <div class="p-lg space-y-sm">
          <div class="h-5 bg-surface-container-high w-3/4"></div>
          <div class="h-4 bg-surface-container-high w-full"></div>
          <div class="h-4 bg-surface-container-high w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div v-else-if="filteredServices.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
      <div
        v-for="service in filteredServices"
        :key="service.id"
        class="card bg-white hover:-translate-y-1 transition-transform duration-400"
      >
        <!-- Image -->
        <div class="relative w-full h-[280px] bg-surface-container-high flex items-center justify-center text-3xl text-primary/40">
          <div v-if="service.imageUrl">
            <img :src="service.imageUrl" :alt="service.title" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <i v-else :class="iconForCategory(service.category)"></i>
          <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5"></div>
          <span class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 font-label-sm text-[0.625rem] font-semibold uppercase tracking-wider text-primary">
            {{ service.category }}
          </span>
          <div class="price-tag">
            ${{ formatPrice(service.price) }}
          </div>
        </div>
        <!-- Body -->
        <div class="px-md py-lg">
          <h3 class="font-headline-md text-lg text-on-surface font-semibold mb-xs">{{ service.title }}</h3>
          <p class="font-body-md text-on-surface-variant text-sm leading-relaxed mb-md">{{ service.description }}</p>
          <div class="flex items-center gap-md text-sm text-on-surface-variant">
            <span class="flex items-center gap-xs"><i class="pi pi-clock text-primary"></i> {{ service.duration }} min</span>
          </div>
          <button
            class="mt-lg inline-flex items-center gap-xs font-label-sm text-xs font-semibold uppercase tracking-widest text-primary border-b border-primary pb-0.5 hover:gap-md transition-all duration-300 cursor-pointer bg-transparent"
            @click="onBookService(service)"
          >
            Reservar <i class="pi pi-arrow-right" style="font-size: 0.625rem"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-2xl space-y-sm border border-dashed border-outline-variant/50">
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
import type { Service } from '../types';

const router = useRouter();
const { services, loading, categories, fetchServices } = useServices();
const selectedCategory = shallowRef('TODOS');
const localRawSearch = shallowRef('');
const localSearch = shallowRef('');

const debouncedUpdate = debounce((value: string) => {
  localSearch.value = value
}, 300);

watch(localRawSearch, (val) => debouncedUpdate(val));

const filteredServices = computed(() =>
  services.value.filter(s => {
    const q = localSearch.value.toLowerCase();
    const matchesSearch = s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory.value === 'TODOS' || s.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  })
);

onMounted(fetchServices);

function iconForCategory(category: string): string {
  const map: Record<string, string> = {
    CABELLO: 'pi pi-star',
    'MANICURA & PEDICURA': 'pi pi-sun',
    FACIALES: 'pi pi-heart',
    BIENESTAR: 'pi pi-sparkles'
  };
  return map[category] || 'pi pi-star';
}

function formatPrice(price: number): string {
  return price.toLocaleString('es-MX');
}

function onBookService(service: Service) {
  localStorage.setItem('selected_booking_service', JSON.stringify({
    id: service.id,
    title: service.title,
    price: service.price,
    duration: service.duration
  }));
  router.push('/booking');
}
</script>

<style scoped>
.price-tag {
  position: absolute;
  bottom: -16px;
  right: 20px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-family: 'Playfair Display', serif;
  font-size: 1.375rem;
  font-weight: 700;
  padding: 8px 18px;
  box-shadow: 0 4px 16px rgba(121, 84, 46, 0.3);
}
</style>
