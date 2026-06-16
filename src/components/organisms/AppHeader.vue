<template>
  <header class="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/10 shadow-sm">
    <div class="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto">
      <router-link to="/" class="font-headline-md text-headline-md text-primary tracking-tight">
        Aura Luxe Salon
      </router-link>
      
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex gap-md items-center">
        <router-link to="/services" class="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
          Servicios
        </router-link>
        <router-link to="/booking" class="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
          Reservar Cita
        </router-link>
        <router-link to="/feedback" class="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
          Valoraciones
        </router-link>
        <div class="h-4 w-px bg-outline-variant/30"></div>
        <template v-if="user">
          <router-link to="/booking" class="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md flex items-center gap-xs">
            <i class="pi pi-user"></i> Mi Cuenta
          </router-link>
          <router-link to="/admin/dashboard" class="bg-primary-container/10 text-primary border border-primary/20 px-sm py-xs hover:bg-primary-container/20 transition-all font-label-sm text-xs flex items-center gap-xs">
            <i class="pi pi-cog"></i> Panel Admin
          </router-link>
          <button @click="handleLogout" class="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md flex items-center gap-xs cursor-pointer">
            <i class="pi pi-sign-out"></i> Cerrar Sesión
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md flex items-center gap-xs">
            <i class="pi pi-sign-in"></i> Iniciar Sesión
          </router-link>
          <router-link to="/admin/dashboard" class="bg-primary-container/10 text-primary border border-primary/20 px-sm py-xs hover:bg-primary-container/20 transition-all font-label-sm text-xs flex items-center gap-xs">
            <i class="pi pi-cog"></i> Panel Admin
          </router-link>
        </template>
      </nav>

      <!-- Mobile Navigation Trigger -->
      <button class="md:hidden text-primary focus:outline-none" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle Menu">
        <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" class="text-xl"></i>
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    <transition name="slide-fade">
      <div v-if="mobileMenuOpen" class="md:hidden bg-surface border-b border-outline-variant/20 py-md px-margin-mobile absolute w-full left-0 shadow-lg space-y-md">
        <router-link to="/services" class="block text-on-surface-variant hover:text-primary py-xs font-label-md" @click="mobileMenuOpen = false">
          Servicios
        </router-link>
        <router-link to="/booking" class="block text-on-surface-variant hover:text-primary py-xs font-label-md" @click="mobileMenuOpen = false">
          Reservar Cita
        </router-link>
        <router-link to="/feedback" class="block text-on-surface-variant hover:text-primary py-xs font-label-md" @click="mobileMenuOpen = false">
          Valoraciones
        </router-link>
          <hr class="border-outline-variant/20" />
        <template v-if="user">
          <router-link to="/booking" class="block text-on-surface-variant hover:text-primary py-xs font-label-md flex items-center gap-xs" @click="mobileMenuOpen = false">
            <i class="pi pi-user"></i> Mi Cuenta
          </router-link>
          <router-link to="/admin/dashboard" class="block text-primary py-xs font-label-md flex items-center gap-xs" @click="mobileMenuOpen = false">
            <i class="pi pi-cog"></i> Panel Admin
          </router-link>
          <button @click="handleLogout" class="block text-on-surface-variant hover:text-primary py-xs font-label-md flex items-center gap-xs w-full text-left cursor-pointer">
            <i class="pi pi-sign-out"></i> Cerrar Sesión
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="block text-on-surface-variant hover:text-primary py-xs font-label-md flex items-center gap-xs" @click="mobileMenuOpen = false">
            <i class="pi pi-sign-in"></i> Iniciar Sesión
          </router-link>
          <router-link to="/admin/dashboard" class="block text-primary py-xs font-label-md flex items-center gap-xs" @click="mobileMenuOpen = false">
            <i class="pi pi-cog"></i> Panel Admin
          </router-link>
        </template>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../lib/supabase';

const router = useRouter();
const mobileMenuOpen = ref(false);
const user = ref(null);

onMounted(async () => {
  const { data: { user: u } } = await supabase.auth.getUser();
  user.value = u;
});

const handleLogout = async () => {
  await supabase.auth.signOut();
  user.value = null;
  mobileMenuOpen.value = false;
  router.push('/login');
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
