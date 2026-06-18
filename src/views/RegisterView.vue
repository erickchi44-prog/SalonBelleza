<template>
  <main class="min-h-screen flex flex-col md:flex-row">
    <section class="relative w-full md:w-1/2 min-h-[350px] md:min-h-0 overflow-hidden flex flex-col justify-end md:flex-1">
      <div class="absolute inset-0 bg-black/20 z-10"></div>
      <img
        class="absolute inset-0 w-full h-full object-cover"
        alt="Tratamiento facial de relajaci&oacute;n"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk"
        loading="lazy"
      />
      <div class="absolute inset-0 z-20 flex flex-col justify-end p-margin-mobile md:p-xl bg-gradient-to-t from-black/60 to-transparent">
        <h2 class="font-display-lg text-white mb-sm opacity-90 text-3xl md:text-5xl">Comienza tu viaje</h2>
        <p class="font-body-lg text-white/80 max-w-md text-sm md:text-base">
          Reg&iacute;strate para agendar citas con tus especialistas favoritos y recibir promociones exclusivas adaptadas a ti.
        </p>
      </div>
    </section>

    <section class="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface md:flex-1 overflow-y-auto">
      <div class="w-full max-w-md space-y-lg py-sm">
        <div class="space-y-xs">
          <h1 class="font-headline-lg text-headline-lg text-on-surface text-3xl">Crea tu Cuenta</h1>
          <p class="font-body-md text-on-surface-variant text-sm">
            Reg&iacute;strate para una experiencia personalizada en Aura Luxe Salon.
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-md">
          <app-input
            id="fullName"
            v-model="fullName"
            label="Nombre Completo"
            type="text"
            required
            :error="errors.fullName"
            @blur="validateField('fullName')"
          />
          <app-input
            id="email"
            v-model="email"
            label="Correo electr&oacute;nico"
            type="email"
            required
            :error="errors.email"
            @blur="validateField('email')"
          />
          <app-input
            id="phone"
            v-model="phone"
            label="Tel&eacute;fono / Celular"
            type="tel"
            required
            :error="errors.phone"
            @blur="validateField('phone')"
          />
          <app-password
            id="password"
            v-model="password"
            label="Contrase&ntilde;a"
            required
            :feedback="true"
            :error="errors.password"
            @blur="validateField('password')"
          />
          <app-password
            id="confirmPassword"
            v-model="confirmPassword"
            label="Confirmar Contrase&ntilde;a"
            required
            :feedback="false"
            :error="errors.confirmPassword"
            @blur="validateField('confirmPassword')"
          />

          <div v-if="serverError" class="p-sm bg-error-container/30 border border-error/30" role="alert">
            <p class="font-label-sm text-xs text-error">{{ serverError }}</p>
          </div>

          <div class="pt-base">
            <app-button
              type="submit"
              label="REGISTRARSE"
              :loading="loading"
              class="w-full py-md"
            />
          </div>
        </form>

        <div class="text-center pt-md border-t border-outline-variant/30">
          <p class="font-body-md text-on-surface-variant text-sm">
            &iquest;Ya tienes una cuenta?
            <router-link to="/login" class="text-primary font-semibold hover:underline transition-all ml-xs">
              Inicia Sesi&oacute;n
            </router-link>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { shallowRef, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import AppInput from '../components/atoms/AppInput.vue';
import AppPassword from '../components/atoms/AppPassword.vue';
import AppButton from '../components/atoms/AppButton.vue';

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);
const { register } = authStore;
const fullName = shallowRef('');
const email = shallowRef('');
const phone = shallowRef('');
const password = shallowRef('');
const confirmPassword = shallowRef('');
const serverError = shallowRef('');
const errors = reactive<Record<string, string>>({});

function validateField(field: string) {
  delete errors[field];
  switch (field) {
    case 'fullName':
      if (fullName.value.trim().length < 3) errors.fullName = 'Por favor ingresa tu nombre completo.';
      break;
    case 'email':
      if (!email.value.includes('@')) errors.email = 'Por favor ingresa un correo v&aacute;lido.';
      break;
    case 'phone':
      if (phone.value.trim().length < 8) errors.phone = 'Por favor ingresa un n&uacute;mero de tel&eacute;fono v&aacute;lido.';
      break;
    case 'password':
      if (password.value.length < 6) errors.password = 'La contrase&ntilde;a debe tener al menos 6 caracteres.';
      break;
    case 'confirmPassword':
      if (password.value !== confirmPassword.value) errors.confirmPassword = 'Las contrase&ntilde;as no coinciden.';
      break;
  }
}

function validateAll(): boolean {
  ['fullName', 'email', 'phone', 'password', 'confirmPassword'].forEach(validateField);
  return Object.keys(errors).length === 0;
}

const handleRegister = async () => {
  serverError.value = '';
  if (!validateAll()) return;

  try {
    await register(fullName.value, email.value, phone.value, password.value);
  } catch (e: any) {
    serverError.value = e.message;
  }
};
</script>
