<template>
  <div class="min-h-screen flex bg-background">
    <!-- Sidebar (Desktop) -->
    <aside class="hidden md:flex flex-col w-64 fixed top-0 left-0 bottom-0 z-40" style="background:linear-gradient(180deg, #2c1600 0%, #4a301a 50%, #61401b 100%)">
      <div class="relative px-md" style="padding-top:1.25rem;padding-bottom:1.25rem">
        <div class="flex items-center gap-sm">
          <div class="w-[38px] h-[38px] rounded-xl flex items-center justify-center font-headline-md text-sm font-bold shrink-0 shadow-lg" style="background:linear-gradient(135deg, #eebd8e, #79542e);color:#2c1600">
            AL
          </div>
          <router-link to="/" class="font-headline-md text-[#faf9f6] tracking-tight text-lg no-underline">
            Aura <span style="color:#eebd8e">Luxe</span>
          </router-link>
        </div>
      </div>

      <div class="flex-grow overflow-y-auto px-sm">
        <div class="text-[0.6rem] font-bold uppercase tracking-[0.12em] pt-sm pb-xs" style="color:rgba(255,255,255,0.2)">General</div>
        <router-link
          v-for="item in mainItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-sm px-md py-sm rounded-xl transition-all font-label-md text-sm mb-0.5 no-underline"
          style="color:rgba(255,255,255,0.5)"
          active-class="active-glass"
        >
          <i :class="item.icon" class="text-sm min-w-[20px] text-center"></i>
          <span class="flex-1">{{ item.label }}</span>
          <span v-if="item.badge" class="text-[0.6rem] font-bold px-sm py-0.5 rounded-full" style="background:rgba(220,38,38,0.15);color:#fca5a5">{{ item.badge }}</span>
        </router-link>

        <div class="text-[0.6rem] font-bold uppercase tracking-[0.12em] pt-sm pb-xs" style="color:rgba(255,255,255,0.2)">Gestión</div>
        <router-link
          v-for="item in managementItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-sm px-md py-sm rounded-xl transition-all font-label-md text-sm mb-0.5 no-underline"
          style="color:rgba(255,255,255,0.5)"
          active-class="active-glass"
        >
          <i :class="item.icon" class="text-sm min-w-[20px] text-center"></i>
          <span class="flex-1">{{ item.label }}</span>
          <span v-if="item.badge" class="text-[0.6rem] font-bold px-sm py-0.5 rounded-full" style="background:rgba(220,38,38,0.15);color:#fca5a5">{{ item.badge }}</span>
        </router-link>

        <div class="text-[0.6rem] font-bold uppercase tracking-[0.12em] pt-sm pb-xs" style="color:rgba(255,255,255,0.2)">Inteligencia</div>
        <router-link
          v-for="item in intelligenceItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-sm px-md py-sm rounded-xl transition-all font-label-md text-sm mb-0.5 no-underline"
          style="color:rgba(255,255,255,0.5)"
          active-class="active-glass"
        >
          <i :class="item.icon" class="text-sm min-w-[20px] text-center"></i>
          <span class="flex-1">{{ item.label }}</span>
        </router-link>
      </div>

      <div class="flex items-center gap-sm px-md py-md mt-auto" style="border-top:1px solid rgba(255,255,255,0.06)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center font-headline-md text-sm font-bold shrink-0" style="background:linear-gradient(135deg, #eebd8e, #79542e);color:#2c1600">
          {{ profileInitial }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-label-md text-xs font-semibold truncate" style="color:rgba(255,255,255,0.8)">{{ profile?.full_name || 'Admin' }}</p>
          <p class="text-label-sm truncate" style="color:rgba(255,255,255,0.3)">{{ profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Admin' }}</p>
        </div>
        <button @click="handleLogout" class="shrink-0 cursor-pointer border-none bg-transparent text-base transition-colors" style="color:rgba(255,255,255,0.2)" title="Cerrar Sesión">
          <i class="pi pi-sign-out"></i>
        </button>
      </div>
    </aside>

      <div aria-live="polite" aria-atomic="true" class="sr-only"></div>
      <!-- Main Content Area -->
    <div class="flex-grow flex flex-col min-w-0 md:ml-64">
      <!-- Admin Top Header Bar -->
      <header class="h-20 flex items-center justify-between px-md md:px-lg bg-surface/70 backdrop-blur-md border-b border-outline-variant/30">
        <div class="flex items-center gap-md">
          <!-- Mobile Menu Trigger -->
          <button class="md:hidden text-primary focus-visible:outline-2 focus-visible:outline-primary" @click="mobileSidebarOpen = true" aria-label="Abrir menú lateral">
            <i class="pi pi-bars text-xl"></i>
          </button>
          <div class="flex items-center gap-xs text-on-surface-variant/60 text-xs font-label-md">
            <span class="text-on-surface-variant/40">Admin</span>
            <i class="pi pi-chevron-right" style="font-size:0.45rem"></i>
            <span class="text-on-surface font-semibold">{{ currentViewTitle }}</span>
          </div>
        </div>
        <div class="flex items-center gap-md">
          <button @click="toggleDark" class="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" :aria-label="isDark ? 'Activar modo claro' : 'Activar modo oscuro'">
            <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" class="text-sm"></i>
          </button>
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
        <div class="relative flex flex-col w-64 max-w-xs h-full shadow-2xl animate-slide-in" style="background:linear-gradient(180deg, #2c1600 0%, #4a301a 50%, #61401b 100%)">
          <div class="flex items-center justify-between px-md" style="padding-top:1.25rem;padding-bottom:1.25rem">
            <router-link to="/" class="font-headline-md text-[#faf9f6] tracking-tight text-lg no-underline" @click="mobileSidebarOpen = false">
              Aura <span style="color:#eebd8e">Luxe</span>
            </router-link>
            <button class="min-w-[44px] min-h-[44px] flex items-center justify-center text-primary" @click="mobileSidebarOpen = false" aria-label="Cerrar menú">
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>
          <nav class="flex-grow p-sm space-y-xs overflow-y-auto">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-sm px-md py-sm rounded-xl transition-all font-label-md text-sm mb-0.5 no-underline"
              style="color:rgba(255,255,255,0.5)"
              active-class="active-glass"
              @click="mobileSidebarOpen = false"
            >
              <i :class="item.icon" class="text-sm min-w-[20px] text-center"></i>
              <span class="flex-1">{{ item.label }}</span>
              <span v-if="item.badge" class="text-[0.6rem] font-bold px-sm py-0.5 rounded-full" style="background:rgba(220,38,38,0.15);color:#fca5a5">{{ item.badge }}</span>
            </router-link>
          </nav>
          <div class="flex items-center gap-sm px-md py-md" style="border-top:1px solid rgba(255,255,255,0.06)">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center font-headline-md text-sm font-bold shrink-0" style="background:linear-gradient(135deg, #eebd8e, #79542e);color:#2c1600">
              {{ profileInitial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-label-md text-xs font-semibold truncate" style="color:rgba(255,255,255,0.8)">{{ profile?.full_name || 'Admin' }}</p>
              <p class="text-label-sm truncate" style="color:rgba(255,255,255,0.3)">{{ profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Admin' }}</p>
            </div>
            <button @click="handleLogout" class="shrink-0 cursor-pointer border-none bg-transparent text-base transition-colors" style="color:rgba(255,255,255,0.2)" title="Cerrar Sesión">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useDarkMode } from '../composables/useDarkMode';
import { supabase } from '../lib/supabase';

const route = useRoute();
const authStore = useAuthStore();
const { user, profile } = storeToRefs(authStore);
const { logout } = authStore;
const mobileSidebarOpen = shallowRef(false);

const pendingAppts = shallowRef<string>('');
const pendingFeedback = shallowRef<string>('');

onMounted(async () => {
  const [{ count: appts }, { count: feedback }] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'Pendiente'),
    supabase.from('feedback').select('*', { count: 'exact', head: true })
  ]);
  if (appts) pendingAppts.value = String(appts);
  if (feedback) pendingFeedback.value = String(feedback);
});

const handleLogout = async () => {
  mobileSidebarOpen.value = false;
  await logout();
};

interface MenuItem {
  label: string
  path: string
  icon: string
  badge?: string
}

const menuItems = computed<MenuItem[]>(() => [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'pi pi-th-large' },
  { label: 'Calendario de Citas', path: '/admin/calendar', icon: 'pi pi-calendar', badge: pendingAppts.value || undefined },
  { label: 'Especialistas', path: '/admin/specialists', icon: 'pi pi-users' },
  { label: 'Promociones', path: '/admin/promotions', icon: 'pi pi-percentage' },
  { label: 'Panel Valoraciones', path: '/admin/feedback', icon: 'pi pi-star', badge: pendingFeedback.value || undefined },
  { label: 'Configuración Horarios', path: '/admin/schedules', icon: 'pi pi-clock' },
  { label: 'AI Analytics', path: '/admin/analytics', icon: 'pi pi-chart-bar' }
]);

const mainItems = computed<MenuItem[]>(() => [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'pi pi-th-large' },
  { label: 'Calendario de Citas', path: '/admin/calendar', icon: 'pi pi-calendar', badge: pendingAppts.value || undefined },
  { label: 'Especialistas', path: '/admin/specialists', icon: 'pi pi-users' }
]);

const managementItems = computed<MenuItem[]>(() => [
  { label: 'Promociones', path: '/admin/promotions', icon: 'pi pi-percentage' },
  { label: 'Panel Valoraciones', path: '/admin/feedback', icon: 'pi pi-star', badge: pendingFeedback.value || undefined },
  { label: 'Configuración Horarios', path: '/admin/schedules', icon: 'pi pi-clock' }
]);

const intelligenceItems = computed<MenuItem[]>(() => [
  { label: 'AI Analytics', path: '/admin/analytics', icon: 'pi pi-chart-bar' }
]);

const currentViewTitle = computed(() => {
  const activeItem = menuItems.value.find(item => route.path.startsWith(item.path));
  return activeItem ? activeItem.label : 'Administración';
});

const profileInitial = computed(() =>
  profile?.value?.full_name?.charAt(0)?.toUpperCase() || 'A'
);

const { isDark, toggle: toggleDark } = useDarkMode();
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
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in { animation: none; }
}

.active-glass {
  background: rgba(238, 189, 142, 0.12) !important;
  color: #eebd8e !important;
  font-weight: 600 !important;
  position: relative;
}
.active-glass::before {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  border-radius: 0 4px 4px 0;
  background: #eebd8e;
}
</style>
