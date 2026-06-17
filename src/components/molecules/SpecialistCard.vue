<template>
  <div class="bg-surface border border-outline-variant/30 p-md flex flex-col items-center text-center hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md h-full">
    <div class="relative w-32 h-32 rounded-full overflow-hidden mb-md border-2 border-primary/20">
      <img :src="imageUrl" :alt="name" class="w-full h-full object-cover" loading="lazy" />
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface mb-xs">{{ name }}</h3>
    <span class="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-sm block">
      {{ specialty }}
    </span>
    <p class="font-body-md text-on-surface-variant text-sm line-clamp-3 min-h-[3rem] mb-md">
      {{ bio }}
    </p>
    <app-button
      label="SELECCIONAR"
      variant="outlined"
      class="w-full text-xs"
      @click="$emit('select', { id, name, specialty })"
    />
  </div>
</template>

<script setup lang="ts">
import AppButton from '../atoms/AppButton.vue';

interface Props {
  id?: string | number
  name?: string
  specialty?: string
  bio?: string
  imageUrl?: string
}

defineProps<Props>();

defineEmits<{
  (e: 'select', payload: { id?: string | number; name?: string; specialty?: string }): void
}>();
</script>
