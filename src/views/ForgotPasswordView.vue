<template>
  <main class="min-h-screen flex flex-col md:flex-row">
    <section class="relative w-full md:w-1/2 min-h-[350px] md:min-h-0 overflow-hidden flex flex-col justify-end md:flex-1">
      <div class="absolute inset-0 bg-black/20 z-10"></div>
      <img
        class="absolute inset-0 w-full h-full object-cover"
        alt="Interior de spa lujoso y tranquilo"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk"
        loading="lazy"
      />
      <div class="absolute inset-0 z-20 flex flex-col justify-end p-margin-mobile md:p-xl bg-gradient-to-t from-black/60 to-transparent">
        <h2 class="font-display-lg text-white mb-sm opacity-90 text-3xl md:text-5xl">&iquest;Olvidaste tu contrase&ntilde;a?</h2>
        <p class="font-body-lg text-white/80 max-w-md text-sm md:text-base">
          Te enviaremos un enlace para restablecer tu contrase&ntilde;a y que puedas volver a disfrutar de nuestros servicios.
        </p>
      </div>
    </section>

    <section class="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface md:flex-1 overflow-y-auto">
      <div class="w-full max-w-md space-y-lg">
        <div class="space-y-xs">
          <h1 class="font-headline-lg text-on-surface text-3xl">Recuperar Contrase&ntilde;a</h1>
          <p class="font-body-md text-on-surface-variant text-sm">
            Ingresa tu correo electr&oacute;nico y te enviaremos las instrucciones.
          </p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-md">
          <div v-if="sent" class="p-sm bg-success-container/30 border border-success/30">
            <p class="font-label-sm text-xs text-on-success-container">
              <i class="pi pi-check-circle mr-xs"></i>
              Si el correo est&aacute; registrado, recibir&aacute;s un enlace para restablecer tu contrase&ntilde;a.
            </p>
          </div>

          <app-input
            id="email"
            v-model="email"
            label="Correo electr&oacute;nico"
            type="email"
            required
            :error="errors.email"
            @blur="validateEmail"
          />

          <div v-if="serverError" class="p-sm bg-error-container/30 border border-error/30">
            <p class="font-label-sm text-xs text-error">{{ serverError }}</p>
          </div>

          <div class="pt-base">
            <app-button
              type="submit"
              label="ENVIAR ENLACE"
              :loading="loading"
              class="w-full py-md"
            />
          </div>
        </form>

        <div class="text-center pt-md border-t border-outline-variant/30">
          <p class="font-body-md text-on-surface-variant text-sm">
            &iquest;Recordaste tu contrase&ntilde;a?
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
import { useAuthStore } from '../stores/auth';
import AppInput from '../components/atoms/AppInput.vue';
import AppButton from '../components/atoms/AppButton.vue';

const authStore = useAuthStore();
const { resetPassword } = authStore;
const loading = shallowRef(false);
const sent = shallowRef(false);
const email = shallowRef('');
const serverError = shallowRef('');
const errors = reactive<{ email?: string }>({});

function validateEmail() {
  if (!email.value.includes('@')) {
    errors.email = 'Por favor ingresa un correo v&aacute;lido.';
  } else {
    delete errors.email;
  }
}

const handleResetPassword = async () => {
  serverError.value = '';
  sent.value = false;
  validateEmail();
  if (errors.email) return;

  loading.value = true;
  try {
    await resetPassword(email.value);
    sent.value = true;
  } catch (e: any) {
    serverError.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>
