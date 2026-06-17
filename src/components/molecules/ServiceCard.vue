<template>
  <div class="bg-surface border border-outline-variant/30 flex flex-col justify-between p-md hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md h-full">
    <div class="space-y-sm">
      <div v-if="imageUrl" class="relative w-full h-48 overflow-hidden mb-sm">
        <img :src="imageUrl" :alt="title" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
      </div>
      <div class="flex justify-between items-start">
        <h3 class="font-headline-md text-headline-md text-on-surface line-clamp-1">{{ title }}</h3>
        <span class="font-label-md text-label-md text-primary font-semibold">${{ price }}</span>
      </div>
      <p class="font-body-md text-on-surface-variant text-sm line-clamp-3 min-h-[4.5rem]">
        {{ description }}
      </p>
      <div class="flex items-center gap-xs text-on-surface-variant text-xs">
        <i class="pi pi-clock text-primary"></i>
        <span>{{ duration }} min</span>
      </div>
    </div>
    <div class="pt-md">
      <app-button
        label="AGENDAR"
        class="w-full text-xs"
        @click="$emit('select', { id, title, price, duration })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '../atoms/AppButton.vue';

interface Props {
  id?: string | number
  title?: string
  description?: string
  price?: string | number
  duration?: string | number
  imageUrl?: string
}

defineProps<Props>();

defineEmits<{
  (e: 'select', payload: { id?: string | number; title?: string; price?: string | number; duration?: string | number }): void
}>();
</script>
