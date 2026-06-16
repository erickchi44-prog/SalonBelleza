<template>
  <footer class="w-full bg-surface-container-low border-t border-outline-variant/20 mt-auto">
    <div class="flex flex-col md:flex-row justify-between items-center py-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto">
      <div class="mb-md md:mb-0 text-center md:text-left">
        <h3 class="font-headline-md text-headline-md text-primary">Aura Luxe Salon</h3>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-xs mt-xs text-sm">
          © 2026 Aura Luxe Salon. Un oasis de belleza, bienestar y tranquilidad.
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-md">
        <router-link to="/services" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm">
          Servicios
        </router-link>
        <router-link to="/booking" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm">
          Reservas
        </router-link>
        <router-link to="/feedback" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm">
          Valoraciones
        </router-link>
        <a href="#" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm">
          Políticas de Privacidad
        </a>
      </div>
    </div>
  </footer>
</template>
