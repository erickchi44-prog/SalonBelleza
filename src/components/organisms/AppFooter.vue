<template>
  <footer class="w-full bg-surface border-t border-outline-variant/15 mt-auto">
    <div class="flex flex-col md:flex-row justify-between items-center gap-2 py-3 px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto">
      <div class="font-headline-sm text-sm text-primary">Aura Luxe Salon</div>
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <router-link to="/services" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-xs no-underline">
          Servicios
        </router-link>
        <router-link to="/booking" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-xs no-underline">
          Reservas
        </router-link>
        <router-link to="/feedback" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-xs no-underline">
          Valoraciones
        </router-link>
        <a href="#" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-xs no-underline">
          Pol&iacute;ticas
        </a>
        <a href="#" class="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-xs no-underline">
          Contacto
        </a>
      </div>
      <div class="flex gap-1">
        <a href="#" class="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/8 rounded transition-all no-underline text-xs" aria-label="Instagram">
          <i class="pi pi-instagram"></i>
        </a>
        <a href="#" class="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/8 rounded transition-all no-underline text-xs" aria-label="Facebook">
          <i class="pi pi-facebook"></i>
        </a>
        <a href="#" class="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/8 rounded transition-all no-underline text-xs" aria-label="WhatsApp">
          <i class="pi pi-whatsapp"></i>
        </a>
        <a href="#" class="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/8 rounded transition-all no-underline text-xs" aria-label="TikTok">
          <i class="pi pi-tiktok"></i>
        </a>
      </div>
      <div class="text-on-surface-variant/60 font-label-sm text-[10px]">&copy; 2026 Aura Luxe Salon</div>
    </div>
  </footer>
</template>
