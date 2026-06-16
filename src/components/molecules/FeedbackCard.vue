<template>
  <div class="bg-surface border border-outline-variant/30 p-md hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
    <div class="flex justify-between items-start mb-sm">
      <div>
        <h4 class="font-headline-md text-base text-on-surface mb-xs">{{ customerName }}</h4>
        <span class="font-label-sm text-xs text-on-surface-variant/80">{{ date }}</span>
      </div>
      <app-rating :modelValue="rating" readonly />
    </div>
    <p class="font-body-md text-on-surface-variant text-sm italic">
      "{{ comment }}"
    </p>
    <div v-if="serviceName" class="mt-sm pt-sm border-t border-outline-variant/10 flex items-center gap-xs text-xs text-primary font-medium">
      <i class="pi pi-tag"></i>
      <span>{{ serviceName }}</span>
    </div>
  </div>
</template>

<script setup>
import AppRating from '../atoms/AppRating.vue';

defineProps({
  id: [String, Number],
  customerName: String,
  date: String,
  rating: Number,
  comment: String,
  serviceName: String
});
</script>
