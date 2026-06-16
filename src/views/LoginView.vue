<template>
  <main class="min-h-[calc(100vh-80px)] flex flex-col md:flex-row">
    <!-- Left Side: Image Overlay -->
    <section class="relative w-full md:w-1/2 min-h-[350px] md:min-h-0 overflow-hidden flex flex-col justify-end">
      <div class="absolute inset-0 bg-black/20 z-10"></div>
      <img
        class="absolute inset-0 w-full h-full object-cover"
        alt="Interior de spa lujoso y tranquilo"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk"
      />
      <div class="absolute inset-0 z-20 flex flex-col justify-end p-margin-mobile md:p-xl bg-gradient-to-t from-black/60 to-transparent">
        <h2 class="font-display-lg text-white mb-sm opacity-90 text-3xl md:text-5xl">Bienvenido de nuevo</h2>
        <p class="font-body-lg text-white/80 max-w-md text-sm md:text-base">
          Regresa a tu oasis de tranquilidad y redescubre tu brillo interior con nuestros servicios de autor.
        </p>
      </div>
    </section>

    <!-- Right Side: Login Form -->
    <section class="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface">
      <div class="w-full max-w-md space-y-lg">
        <div class="space-y-xs">
          <h1 class="font-headline-lg text-headline-lg text-on-surface text-3xl">Iniciar Sesión</h1>
          <p class="font-body-md text-on-surface-variant text-sm">
            Ingresa tus credenciales para gestionar tus citas.
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-md">
          <!-- Email Field -->
          <div class="relative">
            <app-input
              id="email"
              v-model="email"
              label="Correo electrónico"
              type="email"
              required
              :error="errors.email"
            />
          </div>

          <!-- Password Field -->
          <div class="relative">
            <app-password
              id="password"
              v-model="password"
              label="Contraseña"
              required
              :feedback="false"
              :error="errors.password"
            />
            <div class="flex justify-end mt-xs">
              <a href="#" class="font-label-sm text-[11px] text-primary hover:underline transition-all">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <!-- CTA Button -->
          <div class="pt-base">
            <app-button
              type="submit"
              label="INICIAR SESIÓN"
              :loading="loading"
              class="w-full py-md"
            />
          </div>
        </form>

        <!-- Footer Link -->
        <div class="text-center pt-md border-t border-outline-variant/30">
          <p class="font-body-md text-on-surface-variant text-sm">
            ¿No tienes una cuenta?
            <router-link to="/register" class="text-primary font-semibold hover:underline transition-all ml-xs">
              Regístrate
            </router-link>
          </p>
        </div>

        <!-- Social Login -->
        <div class="text-center space-y-sm">
          <p class="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">O continúa con</p>
          <div class="flex justify-center gap-md">
            <button class="p-sm rounded-full border border-outline-variant hover:border-primary hover:bg-primary-fixed/30 transition-all text-on-surface cursor-pointer" aria-label="Ingresar con Google">
              <i class="pi pi-google text-sm"></i>
            </button>
            <button class="p-sm rounded-full border border-outline-variant hover:border-primary hover:bg-primary-fixed/30 transition-all text-on-surface cursor-pointer" aria-label="Ingresar con Facebook">
              <i class="pi pi-facebook text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabase';
import AppInput from '../components/atoms/AppInput.vue';
import AppPassword from '../components/atoms/AppPassword.vue';
import AppButton from '../components/atoms/AppButton.vue';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const errors = ref({});

const handleLogin = async () => {
  errors.value = {};
  if (!email.value.includes('@')) {
    errors.value.email = 'Por favor ingresa un correo válido.';
    return;
  }
  if (password.value.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  loading.value = true;
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  loading.value = false;

  if (error) {
    errors.value.email = error.message;
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user.id)
    .single();

  if (profile?.role === 'admin') {
    router.push('/admin/dashboard');
  } else {
    router.push('/booking');
  }
};
</script>
