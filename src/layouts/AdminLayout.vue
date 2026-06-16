<template>
  <div class="min-h-screen flex bg-background">
    <!-- Sidebar (Desktop) -->
    <aside class="hidden md:flex flex-col w-64 bg-surface border-r border-outline-variant/30 text-on-surface">
      <div class="h-20 flex items-center px-md border-b border-outline-variant/30">
        <router-link to="/" class="font-headline-md text-primary tracking-tight text-xl">
          Aura Luxe Admin
        </router-link>
      </div>
      <nav class="flex-grow p-sm space-y-xs">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-sm px-md py-sm hover:bg-primary-container/10 hover:text-primary transition-all font-label-md text-sm"
          active-class="bg-primary-container/15 text-primary border-l-4 border-primary font-semibold"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="p-md border-t border-outline-variant/30 flex items-center justify-between">
        <div class="flex items-center gap-sm">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
            A
          </div>
          <div>
            <p class="font-label-md text-xs font-semibold">Administrador</p>
            <p class="text-[10px] text-on-surface-variant">Admin@auraluxe.com</p>
          </div>
        </div>
        <button @click="handleLogout" class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title="Cerrar Sesión">
          <i class="pi pi-sign-out"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-grow flex flex-col min-w-0">
      <!-- Admin Top Header Bar -->
      <header class="h-20 bg-surface border-b border-outline-variant/30 flex items-center justify-between px-md md:px-lg">
        <div class="flex items-center gap-md">
          <!-- Mobile Menu Trigger -->
          <button class="md:hidden text-primary focus:outline-none" @click="mobileSidebarOpen = true" aria-label="Open Sidebar">
            <i class="pi pi-bars text-xl"></i>
          </button>
          <h2 class="font-headline-md text-lg md:text-xl text-on-surface">{{ currentViewTitle }}</h2>
        </div>
        <div class="flex items-center gap-md">
          <router-link to="/admin/analytics" class="text-on-surface-variant hover:text-primary flex items-center gap-xs text-sm" title="AI Analytics">
            <i class="pi pi-sparkles text-primary"></i> <span class="hidden sm:inline font-semibold">AI Assistant</span>
          </router-link>
          <div class="h-4 w-px bg-outline-variant/30"></div>
          <router-link to="/" class="text-on-surface-variant hover:text-primary text-sm flex items-center gap-xs">
            <i class="pi pi-home"></i> <span class="hidden sm:inline">Ver Tienda</span>
          </router-link>
        </div>
      </header>

      <!-- View Container -->
      <main class="flex-grow p-md md:p-lg overflow-y-auto max-w-[1400px] w-full mx-auto">
        <router-view />
      </main>
    </div>

    <!-- Sidebar Drawer (Mobile) -->
    <transition name="fade">
      <div v-if="mobileSidebarOpen" class="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/50" @click="mobileSidebarOpen = false"></div>
        
        <!-- Drawer Content -->
        <div class="relative flex flex-col w-64 max-w-xs bg-surface h-full shadow-2xl animate-slide-in">
          <div class="h-20 flex items-center justify-between px-md border-b border-outline-variant/30">
            <router-link to="/" class="font-headline-md text-primary tracking-tight text-xl" @click="mobileSidebarOpen = false">
              Aura Luxe
            </router-link>
            <button class="text-primary" @click="mobileSidebarOpen = false" aria-label="Close Sidebar">
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>
          <nav class="flex-grow p-sm space-y-xs overflow-y-auto">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-sm px-md py-sm hover:bg-primary-container/10 hover:text-primary transition-all font-label-md text-sm"
              active-class="bg-primary-container/15 text-primary border-l-4 border-primary font-semibold"
              @click="mobileSidebarOpen = false"
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </router-link>
          </nav>
          <div class="p-md border-t border-outline-variant/30 flex items-center justify-between">
            <div class="flex items-center gap-sm">
              <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                A
              </div>
              <div>
                <p class="font-label-md text-xs font-semibold">Admin</p>
                <p class="text-[10px] text-on-surface-variant">Admin@auraluxe.com</p>
              </div>
            </div>
            <button @click="handleLogout" class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../lib/supabase';

const route = useRoute();
const router = useRouter();
const mobileSidebarOpen = ref(false);

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};

const menuItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'pi pi-th-large' },
  { label: 'Calendario de Citas', path: '/admin/calendar', icon: 'pi pi-calendar' },
  { label: 'Especialistas', path: '/admin/specialists', icon: 'pi pi-users' },
  { label: 'Promociones', path: '/admin/promotions', icon: 'pi pi-percentage' },
  { label: 'Panel Valoraciones', path: '/admin/feedback', icon: 'pi pi-star' },
  { label: 'Configuración Horarios', path: '/admin/schedules', icon: 'pi pi-clock' },
  { label: 'AI Analytics', path: '/admin/analytics', icon: 'pi pi-chart-bar' }
];

const currentViewTitle = computed(() => {
  const activeItem = menuItems.find(item => route.path.startsWith(item.path));
  return activeItem ? activeItem.label : 'Administración';
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.animate-slide-in {
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
