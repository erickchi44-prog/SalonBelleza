<template>
  <div class="min-h-screen flex flex-col bg-background">
    <app-header />
    <main class="flex-grow pt-20">
      <router-view />
    </main>
    <app-footer />
  </div>
</template>

<script setup>
import AppHeader from '../components/organisms/AppHeader.vue';
import AppFooter from '../components/organisms/AppFooter.vue';
</script>
