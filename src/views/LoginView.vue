<template>
  <main class="min-h-screen flex flex-col md:flex-row">
    <!-- Left: Gradient Panel -->
    <section class="relative w-full md:w-[45%] min-h-[300px] md:min-h-0 overflow-hidden flex flex-col justify-center md:flex-1 bg-gradient-to-br from-[#2c1600] via-[#5a3c20] to-primary">
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.03]"></div>
      <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#eebd8e]/[0.08]"></div>
      <div class="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-white/10"></div>
      <div class="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-white/10"></div>

      <div class="relative z-10 px-margin-mobile md:px-xl max-w-md mx-auto w-full">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 mb-8">
          <i class="pi pi-sparkles text-[#eebd8e] text-xs"></i>
          <span class="font-label-sm text-[10px] text-[#eebd8e] uppercase tracking-[0.18em] font-semibold">Aura Luxe Salon</span>
        </div>
        <h2 class="font-display-lg text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-5">
          Donde el arte <span class="text-[#eebd8e] italic">encuentra</span> tu belleza
        </h2>
        <p class="font-body-md text-white/60 max-w-sm text-sm md:text-base leading-relaxed">
          Accede a tu cuenta para gestionar tus citas, descubrir promociones exclusivas y conectar con tus especialistas favoritos.
        </p>
      </div>
    </section>

    <!-- Right: Form Panel -->
    <section class="w-full md:w-[55%] flex items-center justify-center p-margin-mobile md:p-xl bg-surface md:flex-1 overflow-y-auto">
      <div class="w-full max-w-sm animate-fade-in">
        <div class="flex items-center gap-2.5 mb-9">
          <span class="w-8 h-8 bg-primary flex items-center justify-center">
            <i class="pi pi-sparkles text-on-primary text-sm"></i>
          </span>
          <span class="font-headline-md text-primary text-lg tracking-tight">Aura Luxe</span>
        </div>

        <h1 class="font-headline-md text-on-surface text-2xl font-semibold">Bienvenido de vuelta</h1>
        <p class="font-body-md text-on-surface-variant text-sm mb-8">Ingresa tus credenciales para continuar.</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="relative">
            <i class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant/80 z-10 text-sm pointer-events-none"></i>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="Correo electr&oacute;nico"
              class="w-full h-[50px] pl-11 pr-4 bg-white border border-outline-variant/60 text-on-surface font-body-md text-sm outline-none transition-all duration-250 placeholder:text-outline-variant/60 focus:border-primary focus:shadow-[0_0_0_4px_rgba(121,84,46,0.08)]"
              :class="{ 'border-error': errors.email }"
              @blur="validateEmail"
            />
            <p v-if="errors.email" class="text-error font-label-sm text-xs mt-1.5">{{ errors.email }}</p>
          </div>

          <div class="relative">
            <i class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant/80 z-10 text-sm pointer-events-none"></i>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Contrase&ntilde;a"
              class="w-full h-[50px] pl-11 pr-12 bg-white border border-outline-variant/60 text-on-surface font-body-md text-sm outline-none transition-all duration-250 placeholder:text-outline-variant/60 focus:border-primary focus:shadow-[0_0_0_4px_rgba(121,84,46,0.08)]"
              :class="{ 'border-error': errors.password }"
              @blur="validatePassword"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant/60 hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer bg-transparent border-none"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar contrase&ntilde;a' : 'Mostrar contrase&ntilde;a'"
              tabindex="-1"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
            </button>
            <p v-if="errors.password" class="text-error font-label-sm text-xs mt-1.5">{{ errors.password }}</p>
          </div>

          <div class="flex justify-end -mt-1">
            <router-link to="/forgot-password" class="font-label-sm text-xs text-primary hover:text-primary/80 transition-colors">
              &iquest;Olvidaste tu contrase&ntilde;a?
            </router-link>
          </div>

          <transition name="fade">
            <div v-if="serverError" class="flex items-start gap-2.5 p-3 bg-error-container/20 border border-error/20" role="alert">
              <i class="pi pi-exclamation-circle text-error mt-0.5 shrink-0"></i>
              <p class="font-label-sm text-xs text-on-error-container">{{ serverError }}</p>
            </div>
          </transition>

          <app-button
            type="submit"
            label="INICIAR SESI&Oacute;N"
            :loading="loading"
            class="!w-full !py-[15px]"
          />
        </form>

        <p class="text-center mt-7 font-body-md text-sm text-on-surface-variant">
          &iquest;No tienes cuenta?
          <router-link to="/register" class="text-primary font-semibold hover:text-primary/80 transition-colors">Reg&iacute;strate gratis</router-link>
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { shallowRef, reactive, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import AppButton from '../components/atoms/AppButton.vue';

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);
const { login } = authStore;

const email = shallowRef('');
const password = shallowRef('');
const serverError = shallowRef('');
const showPassword = shallowRef(false);
const errors = reactive<{ email?: string; password?: string }>({});

onMounted(() => {
  setTimeout(() => document.getElementById('email')?.focus(), 100)
});

function validateEmail() {
  if (!email.value.includes('@')) {
    errors.email = 'Por favor ingresa un correo v&aacute;lido.';
  } else {
    delete errors.email;
  }
}

function validatePassword() {
  if (password.value.length < 6) {
    errors.password = 'La contrase&ntilde;a debe tener al menos 6 caracteres.';
  } else {
    delete errors.password;
  }
}

const handleLogin = async () => {
  serverError.value = '';
  errors.email = '';
  errors.password = '';
  validateEmail();
  validatePassword();
  if (errors.email || errors.password) return;

  try {
    await login(email.value, password.value);
  } catch (e: any) {
    serverError.value = e.message;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }
}
</style>
