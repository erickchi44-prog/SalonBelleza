<template>
  <header class="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant/15">
    <div class="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto">
      <router-link to="/" class="flex items-center gap-2 font-headline-md text-headline-md text-primary tracking-tight no-underline">
        <span class="w-7 h-7 bg-primary flex items-center justify-center">
          <i class="pi pi-sparkles text-on-primary text-sm"></i>
        </span>
        Aura Luxe
      </router-link>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-0.5">
        <router-link to="/services" class="text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md text-label-md px-3 py-2 rounded">
          Servicios
        </router-link>
        <router-link to="/booking" class="text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md text-label-md px-3 py-2 rounded">
          Reservar
        </router-link>
        <router-link to="/feedback" class="text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md text-label-md px-3 py-2 rounded">
          Valoraciones
        </router-link>
        <button @click="toggleDark" class="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" :aria-label="isDark ? 'Activar modo claro' : 'Activar modo oscuro'">
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" class="text-sm"></i>
        </button>
        <template v-if="user">
          <div class="relative" ref="dropdownRef">
            <button @click="dropdownOpen = !dropdownOpen" class="flex items-center gap-1.5 px-1.5 py-1 rounded-full bg-primary/6 hover:bg-primary/10 transition-all cursor-pointer select-none border-none font-family-inherit">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style="background:linear-gradient(135deg,#eebd8e,#79542e);color:#2c1600">
                {{ profileInitial }}
              </div>
              <span class="text-sm font-semibold text-on-surface max-w-[80px] truncate">{{ firstName }}</span>
              <i class="pi pi-chevron-down text-xs text-on-surface-variant transition-transform" :class="{'rotate-180': dropdownOpen}"></i>
            </button>
            <transition name="fade-down">
              <div v-if="dropdownOpen" class="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl shadow-xl border border-outline-variant/15 overflow-hidden z-50">
                <div class="p-3 border-b border-outline-variant/10">
                  <p class="font-semibold text-sm text-on-surface">{{ profile?.full_name || 'Usuario' }}</p>
                  <p class="text-xs text-on-surface-variant truncate mt-0.5">{{ user?.email }}</p>
                </div>
                <div class="p-1.5">
                  <router-link to="/my-appointments" class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-primary/6 transition-colors no-underline" @click="dropdownOpen = false">
                    <i class="pi pi-calendar text-on-surface-variant"></i> Mis Citas
                  </router-link>
                  <router-link to="/admin/dashboard" v-if="profile?.role === 'admin'" class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-primary/6 transition-colors no-underline" @click="dropdownOpen = false">
                    <i class="pi pi-cog text-on-surface-variant"></i> Panel Admin
                  </router-link>
                  <hr class="border-outline-variant/10 my-1" />
                  <button @click="handleLogout" class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left cursor-pointer border-none font-family-inherit">
                    <i class="pi pi-sign-out"></i> Cerrar Sesión
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md text-label-md px-3 py-2 rounded flex items-center gap-1.5">
            <i class="pi pi-sign-in"></i> Ingresar
          </router-link>
        </template>
      </nav>

      <!-- Mobile toggle -->
      <button class="md:hidden text-on-surface-variant hover:text-primary p-2 cursor-pointer" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Abrir men&uacute;">
        <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" class="text-xl"></i>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-fade">
      <div v-if="mobileMenuOpen" class="md:hidden bg-surface border-b border-outline-variant/15 py-3 px-margin-mobile absolute w-full left-0 shadow-lg space-y-1">
        <router-link to="/services" class="block text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md px-3 py-2 rounded" @click="mobileMenuOpen = false">
          Servicios
        </router-link>
        <router-link to="/booking" class="block text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md px-3 py-2 rounded" @click="mobileMenuOpen = false">
          Reservar
        </router-link>
        <router-link to="/feedback" class="block text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md px-3 py-2 rounded" @click="mobileMenuOpen = false">
          Valoraciones
        </router-link>
        <hr class="border-outline-variant/15 my-1" />
        <template v-if="user">
          <router-link to="/my-appointments" class="block text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md px-3 py-2 rounded" @click="mobileMenuOpen = false">
            <i class="pi pi-calendar mr-1.5"></i> Mis Citas
          </router-link>
          <router-link to="/admin/dashboard" class="block text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md px-3 py-2 rounded" @click="mobileMenuOpen = false">
            <i class="pi pi-cog mr-1.5"></i> Panel Admin
          </router-link>
          <button @click="handleLogoutMobile" class="block text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md px-3 py-2 rounded w-full text-left cursor-pointer">
            <i class="pi pi-sign-out mr-1.5"></i> Cerrar Sesi&oacute;n
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="block text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md px-3 py-2 rounded" @click="mobileMenuOpen = false">
            <i class="pi pi-sign-in mr-1.5"></i> Iniciar Sesi&oacute;n
          </router-link>
        </template>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { shallowRef, computed, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../../stores/auth';
import { useDarkMode } from '../../composables/useDarkMode';

const authStore = useAuthStore();
const { user, profile } = storeToRefs(authStore);
const { logout } = authStore;
const mobileMenuOpen = shallowRef(false);
const dropdownOpen = shallowRef(false);
const dropdownRef = ref<HTMLElement | null>(null);

const firstName = computed(() =>
  profile.value?.full_name?.split(' ')[0] || 'Usuario'
);

const profileInitial = computed(() =>
  firstName.value.charAt(0).toUpperCase()
);

const { isDark, toggle: toggleDark } = useDarkMode();

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const handleLogout = async () => {
  mobileMenuOpen.value = false;
  dropdownOpen.value = false;
  await logout();
};

const handleLogoutMobile = async () => {
  mobileMenuOpen.value = false;
  await logout();
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
.fade-down-enter-active {
  transition: all 0.15s ease-out;
}
.fade-down-leave-active {
  transition: all 0.1s ease-in;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: reduce) {
  .slide-fade-enter-active,
  .slide-fade-leave-active,
  .fade-down-enter-active,
  .fade-down-leave-active {
    transition: none;
  }
}
</style>
