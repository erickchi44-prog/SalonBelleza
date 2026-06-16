<template>
  <main class="min-h-[calc(100vh-80px)] flex flex-col md:flex-row">
    <!-- Left Side: Image Overlay -->
    <section class="relative w-full md:w-1/2 min-h-[350px] md:min-h-0 overflow-hidden flex flex-col justify-end">
      <div class="absolute inset-0 bg-black/20 z-10"></div>
      <img
        class="absolute inset-0 w-full h-full object-cover"
        alt="Tratamiento facial de relajación"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk"
      />
      <div class="absolute inset-0 z-20 flex flex-col justify-end p-margin-mobile md:p-xl bg-gradient-to-t from-black/60 to-transparent">
        <h2 class="font-display-lg text-white mb-sm opacity-90 text-3xl md:text-5xl">Comienza tu viaje</h2>
        <p class="font-body-lg text-white/80 max-w-md text-sm md:text-base">
          Regístrate para agendar citas con tus especialistas favoritos y recibir promociones exclusivas adaptadas a ti.
        </p>
      </div>
    </section>

    <!-- Right Side: Register Form -->
    <section class="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface">
      <div class="w-full max-w-md space-y-lg py-sm">
        <div class="space-y-xs">
          <h1 class="font-headline-lg text-headline-lg text-on-surface text-3xl">Crea tu Cuenta</h1>
          <p class="font-body-md text-on-surface-variant text-sm">
            Regístrate para una experiencia personalizada en Aura Luxe Salon.
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-md">
          <!-- Name Field -->
          <app-input
            id="fullName"
            v-model="fullName"
            label="Nombre Completo"
            type="text"
            required
            :error="errors.fullName"
          />

          <!-- Email Field -->
          <app-input
            id="email"
            v-model="email"
            label="Correo electrónico"
            type="email"
            required
            :error="errors.email"
          />

          <!-- Phone Field -->
          <app-input
            id="phone"
            v-model="phone"
            label="Teléfono / Celular"
            type="tel"
            required
            :error="errors.phone"
          />

          <!-- Password Field -->
          <app-password
            id="password"
            v-model="password"
            label="Contraseña"
            required
            :feedback="true"
            :error="errors.password"
          />

          <!-- Confirm Password Field -->
          <app-password
            id="confirmPassword"
            v-model="confirmPassword"
            label="Confirmar Contraseña"
            required
            :feedback="false"
            :error="errors.confirmPassword"
          />

          <!-- CTA Button -->
          <div class="pt-base">
            <app-button
              type="submit"
              label="REGISTRARSE"
              :loading="loading"
              class="w-full py-md"
            />
          </div>
        </form>

        <!-- Footer Link -->
        <div class="text-center pt-md border-t border-outline-variant/30">
          <p class="font-body-md text-on-surface-variant text-sm">
            ¿Ya tienes una cuenta?
            <router-link to="/login" class="text-primary font-semibold hover:underline transition-all ml-xs">
              Inicia Sesión
            </router-link>
          </p>
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
const fullName = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errors = ref({});

const handleRegister = async () => {
  errors.value = {};
  
  if (fullName.value.trim().length < 3) {
    errors.value.fullName = 'Por favor ingresa tu nombre completo.';
    return;
  }
  if (!email.value.includes('@')) {
    errors.value.email = 'Por favor ingresa un correo válido.';
    return;
  }
  if (phone.value.trim().length < 8) {
    errors.value.phone = 'Por favor ingresa un número de teléfono válido.';
    return;
  }
  if (password.value.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden.';
    return;
  }

  loading.value = true;
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        full_name: fullName.value,
        phone: phone.value,
      },
    },
  });
  loading.value = false;

  if (error) {
    errors.value.email = error.message;
    return;
  }

  router.push('/login');
};
</script>
