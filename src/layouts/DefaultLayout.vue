<template>
  <div class="min-h-screen flex flex-col bg-background">
    <app-header />
    <main class="flex-grow pt-20 pb-20 md:pb-0">
      <router-view />
    </main>
    <app-footer />

    <!-- Bottom Tab Bar (Mobile) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 safe-area-pb">
      <div class="flex items-center justify-around h-16">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-0 transition-colors"
          :class="isActive(tab.path) ? 'text-primary' : 'text-on-surface-variant/70'"
          :aria-label="tab.label"
        >
          <i :class="[tab.icon, 'text-lg']"></i>
          <span class="text-label-sm font-label-sm">{{ tab.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AppHeader from '../components/organisms/AppHeader.vue';
import AppFooter from '../components/organisms/AppFooter.vue';

const route = useRoute();
const { user } = storeToRefs(useAuthStore());

interface Tab {
  label: string
  path: string
  icon: string
}

const tabs = computed<Tab[]>(() => [
  { label: 'Servicios', path: '/services', icon: 'pi pi-list' },
  { label: 'Reservar', path: '/booking', icon: 'pi pi-calendar-plus' },
  { label: 'Valoraciones', path: '/feedback', icon: 'pi pi-star' },
  {
    label: user.value ? 'Cuenta' : 'Ingresar',
    path: user.value ? '/booking' : '/login',
    icon: user.value ? 'pi pi-user' : 'pi pi-sign-in'
  }
])

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<style scoped>
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
