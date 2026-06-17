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
        <div class="flex items-center gap-sm min-w-0">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
            {{ profileInitial }}
          </div>
          <div class="min-w-0">
            <p class="font-label-md text-xs font-semibold truncate">{{ profile?.full_name || 'Admin' }}</p>
            <p class="text-label-sm text-on-surface-variant truncate">{{ user?.email || 'admin@auraluxe.com' }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0" title="Cerrar Sesi&oacute;n">
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
          <button class="md:hidden text-primary focus-visible:outline-2 focus-visible:outline-primary" @click="mobileSidebarOpen = true" aria-label="Abrir men&uacute; lateral">
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
        <div class="fixed inset-0 bg-black/50" @click="mobileSidebarOpen = false"></div>
        <div class="relative flex flex-col w-64 max-w-xs bg-surface h-full shadow-2xl animate-slide-in">
          <div class="h-20 flex items-center justify-between px-md border-b border-outline-variant/30">
            <router-link to="/" class="font-headline-md text-primary tracking-tight text-xl" @click="mobileSidebarOpen = false">
              Aura Luxe
            </router-link>
            <button class="text-primary" @click="mobileSidebarOpen = false" aria-label="Cerrar men&uacute;">
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
            <div class="flex items-center gap-sm min-w-0">
              <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                {{ profileInitial }}
              </div>
              <div class="min-w-0">
                <p class="font-label-md text-xs font-semibold truncate">{{ profile?.full_name || 'Admin' }}</p>
            <p class="text-label-sm text-on-surface-variant truncate">{{ user?.email || 'admin@auraluxe.com' }}</p>
              </div>
            </div>
            <button @click="handleLogout" class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const { user, profile } = storeToRefs(authStore);
const { logout } = authStore;
const mobileSidebarOpen = shallowRef(false);

const handleLogout = async () => {
  mobileSidebarOpen.value = false;
  await logout();
};

interface MenuItem {
  label: string
  path: string
  icon: string
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'pi pi-th-large' },
  { label: 'Calendario de Citas', path: '/admin/calendar', icon: 'pi pi-calendar' },
  { label: 'Especialistas', path: '/admin/specialists', icon: 'pi pi-users' },
  { label: 'Promociones', path: '/admin/promotions', icon: 'pi pi-percentage' },
  { label: 'Panel Valoraciones', path: '/admin/feedback', icon: 'pi pi-star' },
  { label: 'Configuraci&oacute;n Horarios', path: '/admin/schedules', icon: 'pi pi-clock' },
  { label: 'AI Analytics', path: '/admin/analytics', icon: 'pi pi-chart-bar' }
];

const currentViewTitle = computed(() => {
  const activeItem = menuItems.find(item => route.path.startsWith(item.path));
  return activeItem ? activeItem.label : 'Administraci&oacute;n';
});

const profileInitial = computed(() =>
  profile?.value?.full_name?.charAt(0)?.toUpperCase() || 'A'
);
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
