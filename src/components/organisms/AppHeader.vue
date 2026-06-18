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
        <template v-if="user">
          <router-link to="/my-appointments" class="text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md text-label-md px-3 py-2 rounded">
            Mis Citas
          </router-link>
          <router-link to="/admin/dashboard" class="text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md text-label-md px-3 py-2 rounded">
            <i class="pi pi-cog"></i>
          </router-link>
          <button @click="handleLogout" class="text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all font-label-md text-label-md p-2 rounded cursor-pointer">
            <i class="pi pi-sign-out"></i>
          </button>
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
import { shallowRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { logout } = authStore;
const mobileMenuOpen = shallowRef(false);

const handleLogout = async () => {
  mobileMenuOpen.value = false;
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
</style>
