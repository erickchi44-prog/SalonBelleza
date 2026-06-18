<template>
  <div class="py-xl px-margin-mobile md:px-margin-desktop max-w-[900px] mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-md md:mb-lg">
      <h1 class="font-display text-2xl md:text-3xl text-on-surface font-semibold tracking-tight">Mis Citas</h1>
      <router-link to="/booking" class="inline-flex items-center gap-2 bg-primary text-on-primary px-3 md:px-4 py-2.5 text-sm font-label font-medium tracking-wider uppercase hover:opacity-90 transition-opacity">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-width="2"/></svg>
      </router-link>
    </div>

    <div v-if="loading" class="space-y-md">
      <div v-for="n in 3" :key="n" class="border border-outline-variant/30 bg-surface p-md animate-pulse space-y-sm">
        <div class="h-5 bg-surface-container-high w-1/4"></div>
        <div class="h-4 bg-surface-container-high w-2/3"></div>
        <div class="h-3 bg-surface-container-high w-1/3"></div>
      </div>
    </div>

    <div v-else-if="appointments.length === 0" class="text-center py-xl space-y-md">
      <i class="pi pi-calendar-times text-5xl text-outline-variant"></i>
      <p class="font-body-md text-on-surface-variant">A&uacute;n no tienes citas registradas.</p>
      <router-link to="/booking" class="inline-block">
        <app-button label="RESERVAR CITA" icon="pi pi-calendar-plus" />
      </router-link>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="border-b border-outline-variant/20 mb-md md:mb-lg">
        <div class="flex -mb-px">
          <button
            class="px-4 md:px-6 py-3 font-label text-xs md:text-sm tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'upcoming' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary hover:border-outline-variant'"
            @click="activeTab = 'upcoming'"
          >
            Pr&oacute;ximas
            <span
              class="text-[10px] font-label px-1.5 py-0.5"
              :class="activeTab === 'upcoming' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'"
            >{{ tabUpcomingCount }}</span>
          </button>
          <button
            class="px-4 md:px-6 py-3 font-label text-xs md:text-sm tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'history' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary hover:border-outline-variant'"
            @click="activeTab = 'history'"
          >
            Historial
            <span
              class="text-[10px] font-label px-1.5 py-0.5"
              :class="activeTab === 'history' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'"
            >{{ tabHistoryCount }}</span>
          </button>
          <button
            class="px-4 md:px-6 py-3 font-label text-xs md:text-sm tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'cancelled' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary hover:border-outline-variant'"
            @click="activeTab = 'cancelled'"
          >
            Canceladas
            <span
              class="text-[10px] font-label px-1.5 py-0.5"
              :class="activeTab === 'cancelled' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'"
            >{{ tabCancelledCount }}</span>
          </button>
        </div>
      </div>

      <!-- Upcoming Tab -->
      <template v-if="activeTab === 'upcoming'">
        <div v-if="upcoming.length === 0" class="text-center py-xl">
          <p class="font-body-md text-on-surface-variant">No tienes citas pr&oacute;ximas.</p>
        </div>
        <div v-else class="space-y-md md:space-y-lg">
          <div v-if="todayAppts.length > 0">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 rounded-full bg-primary shrink-0"></div>
              <h2 class="font-display text-base md:text-lg text-on-surface font-medium">Hoy, {{ formatTodayDate() }}</h2>
            </div>
            <div class="bg-surface border border-outline-variant/30 divide-y divide-outline-variant/10">
              <div v-for="appt in todayAppts" :key="appt.id" class="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-surface-container-low transition-colors">
                <span class="font-body text-sm md:text-base text-on-surface font-medium w-12 md:w-16 shrink-0">{{ toDisplayTime(appt.time + ':00') }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-body text-sm md:text-base text-on-surface font-medium leading-snug">{{ appt.services.join(', ') }}</p>
                  <p class="font-body text-xs text-on-surface-variant">{{ appt.specialist }}</p>
                </div>
                <span class="font-label text-[10px] uppercase tracking-widest px-2 py-0.5 shrink-0" :class="statusClass(appt.status)">{{ appt.status }}</span>
                <div class="flex gap-1 shrink-0">
                  <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-danger hover:bg-danger/5 transition-colors" title="Cancelar" @click="openCancelDialog(appt)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/></svg>
                  </button>
                  <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors" title="Reagendar" @click="openReschedule(appt)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="futureAppts.length > 0">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 rounded-full bg-outline shrink-0"></div>
              <h2 class="font-display text-base md:text-lg text-on-surface font-medium">Pr&oacute;ximamente</h2>
            </div>
            <div class="bg-surface border border-outline-variant/30 divide-y divide-outline-variant/10">
              <div v-for="appt in futureAppts" :key="appt.id" class="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-surface-container-low transition-colors">
                <div class="text-center w-12 md:w-16 shrink-0">
                  <p class="font-display text-sm md:text-base text-on-surface font-medium">{{ getDayNumber(appt.date) }}</p>
                  <p class="font-label text-[10px] text-on-surface-variant uppercase -mt-0.5">{{ getMonthAbbr(appt.date) }}</p>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-body text-sm md:text-base text-on-surface font-medium leading-snug">{{ appt.services.join(', ') }}</p>
                  <p class="font-body text-xs text-on-surface-variant">{{ appt.specialist }} &middot; {{ toDisplayTime(appt.time + ':00') }}</p>
                </div>
                <span class="font-label text-[10px] uppercase tracking-widest px-2 py-0.5 shrink-0" :class="statusClass(appt.status)">{{ appt.status }}</span>
                <div class="flex gap-1 shrink-0">
                  <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-danger hover:bg-danger/5 transition-colors" title="Cancelar" @click="openCancelDialog(appt)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/></svg>
                  </button>
                  <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors" title="Reagendar" @click="openReschedule(appt)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- History Tab -->
      <template v-if="activeTab === 'history'">
        <div v-if="historyAppts.length === 0" class="text-center py-xl">
          <p class="font-body-md text-on-surface-variant">No hay citas en tu historial.</p>
        </div>
        <div v-else class="bg-surface border border-outline-variant/30 divide-y divide-outline-variant/10">
          <div v-for="appt in historyAppts" :key="appt.id" class="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-surface-container-low transition-colors opacity-80">
            <div class="text-center w-12 md:w-16 shrink-0">
              <p class="font-display text-sm md:text-base text-on-surface font-medium">{{ getDayNumber(appt.date) }}</p>
              <p class="font-label text-[10px] text-on-surface-variant uppercase -mt-0.5">{{ getMonthAbbr(appt.date) }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body text-sm md:text-base text-on-surface font-medium leading-snug">{{ appt.services.join(', ') }}</p>
              <p class="font-body text-xs text-on-surface-variant">{{ appt.specialist }} &middot; {{ toDisplayTime(appt.time + ':00') }}</p>
            </div>
            <span class="font-label text-[10px] uppercase tracking-widest px-2 py-0.5 shrink-0" :class="statusClass(appt.status)">{{ appt.status }}</span>
          </div>
        </div>
      </template>

      <!-- Cancelled Tab -->
      <template v-if="activeTab === 'cancelled'">
        <div v-if="cancelledAppts.length === 0" class="text-center py-xl">
          <p class="font-body-md text-on-surface-variant">No hay citas canceladas.</p>
        </div>
        <div v-else class="bg-surface border border-outline-variant/30 divide-y divide-outline-variant/10">
          <div v-for="appt in cancelledAppts" :key="appt.id" class="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-surface-container-low transition-colors opacity-60">
            <div class="text-center w-12 md:w-16 shrink-0">
              <p class="font-display text-sm md:text-base text-on-surface font-medium line-through">{{ getDayNumber(appt.date) }}</p>
              <p class="font-label text-[10px] text-on-surface-variant uppercase -mt-0.5">{{ getMonthAbbr(appt.date) }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body text-sm md:text-base text-on-surface font-medium leading-snug">{{ appt.services.join(', ') }}</p>
              <p class="font-body text-xs text-on-surface-variant">{{ appt.specialist }} &middot; {{ toDisplayTime(appt.time + ':00') }}</p>
            </div>
            <span class="font-label text-[10px] uppercase tracking-widest px-2 py-0.5 shrink-0" :class="statusClass(appt.status)">{{ appt.status }}</span>
          </div>
        </div>
      </template>
    </template>

    <p-toast />

    <!-- Cancel Dialog -->
    <p-dialog
      v-model:visible="showCancel"
      :modal="true"
      :closable="true"
      class="w-full max-w-lg"
      :pt="{ header: '!p-0', content: '!p-0', footer: '!p-0 !gap-0 !items-stretch' }"
    >
      <template #header>
        <div class="flex items-start justify-between gap-4 p-4 md:p-6 border-b border-outline-variant/20">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="mt-0.5 md:mt-1 shrink-0 text-danger">
              <svg class="h-7 w-7 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
              </svg>
            </div>
            <div>
              <h1 class="font-headline-md text-xl md:text-2xl text-on-surface font-semibold">Cancelar Cita</h1>
              <p class="font-body-md text-xs md:text-sm text-on-surface-variant mt-0.5">Esta acci&oacute;n no se puede deshacer</p>
            </div>
          </div>
        </div>
      </template>
      <div v-if="cancelTarget">
        <section class="bg-surface-container-low p-4 md:p-8 space-y-2 md:space-y-sm">
          <h2 class="font-headline-md text-lg md:text-xl text-on-surface font-medium leading-snug">{{ cancelTarget.services.join(', ') }}</h2>
          <div class="text-sm md:text-[15px] text-on-surface-variant space-y-2 md:space-y-3 font-body-md">
            <div class="flex items-center gap-2 md:gap-3">
              <svg class="h-4 w-4 md:h-5 md:w-5 opacity-60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
              </svg>
              <span>{{ cancelTarget.specialist }}</span>
            </div>
            <div class="flex items-center gap-2 md:gap-3">
              <svg class="h-4 w-4 md:h-5 md:w-5 opacity-60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
              </svg>
              <span>{{ formatDate(cancelTarget.date) }} a las {{ toDisplayTime(cancelTarget.time + ':00') }}</span>
            </div>
          </div>
        </section>
        <section class="p-4 md:p-8 border-b border-outline-variant/20">
          <div class="bg-danger-container/20 border border-danger-container/40 p-3 md:p-5">
            <p class="font-body-md text-xs md:text-sm text-on-surface leading-relaxed">
              <span class="font-semibold">¿Cancelar esta cita?</span> Los horarios quedar&aacute;n disponibles para otros clientes.
            </p>
          </div>
        </section>
      </div>
      <template #footer>
        <footer class="flex justify-end gap-3 p-4 md:p-6 border-t border-outline-variant/20">
          <button
            class="h-11 px-5 border border-outline-variant/30 text-on-surface-variant font-label text-xs tracking-wider uppercase hover:bg-surface-container-low transition-colors cursor-pointer"
            @click="showCancel = false"
          >
            NO, VOLVER
          </button>
          <button
            class="h-11 px-6 bg-danger text-white font-label text-xs tracking-wider uppercase hover:opacity-95 transition-opacity font-semibold flex items-center gap-2 cursor-pointer"
            :disabled="cancellingId === cancelTarget?.id"
            @click="handleCancel"
          >
            <svg v-if="cancellingId !== cancelTarget?.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
            <span>S&Iacute;, CANCELAR CITA</span>
          </button>
        </footer>
      </template>
    </p-dialog>

    <!-- Reschedule Dialog -->
    <p-dialog
      v-model:visible="showReschedule"
      :modal="true"
      :closable="false"
      class="w-full max-w-lg"
      :pt="{ content: '!p-0', header: '!p-0' }"
    >
      <template #header>
        <div class="flex items-center justify-between w-full p-4 md:p-6 border-b border-outline-variant/20">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="1.5"/></svg>
            <h1 class="font-display text-base md:text-lg text-on-surface font-medium">Reagendar</h1>
          </div>
          <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors" @click="showReschedule = false">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </template>
      <div v-if="rescheduleTarget">
        <!-- Progress bar -->
        <div class="px-4 md:px-6 pt-4 md:pt-5 pb-1">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full" :class="rescheduleStep >= 1 ? 'bg-primary' : 'bg-outline-variant'"></div>
            <div class="flex-1 h-0.5" :class="rescheduleStep >= 2 ? 'bg-primary/30' : 'bg-outline-variant/30'"></div>
            <div class="w-2.5 h-2.5 rounded-full" :class="rescheduleStep >= 2 ? 'bg-primary' : 'bg-outline-variant'"></div>
            <div class="flex-1 h-0.5" :class="rescheduleStep >= 3 ? 'bg-primary/30' : 'bg-outline-variant/30'"></div>
            <div class="w-2.5 h-2.5 rounded-full" :class="rescheduleStep >= 3 ? 'bg-primary' : 'bg-outline-variant'"></div>
          </div>
          <div class="flex items-center justify-between mt-1">
            <span class="font-label text-[10px] uppercase tracking-widest" :class="rescheduleStep >= 1 ? 'text-primary font-medium' : 'text-on-surface-variant'">Fecha</span>
            <span class="font-label text-[10px] uppercase tracking-widest" :class="rescheduleStep >= 2 ? 'text-primary font-medium' : 'text-on-surface-variant'">Horario</span>
            <span class="font-label text-[10px] uppercase tracking-widest" :class="rescheduleStep >= 3 ? 'text-primary font-medium' : 'text-on-surface-variant'">Confirmar</span>
          </div>
        </div>

        <!-- Step 1: Date -->
        <div v-if="rescheduleStep === 1" class="p-4 md:p-6 space-y-4">
          <p class="font-body text-sm text-on-surface font-medium">Selecciona la nueva fecha</p>
          <div class="border border-outline-variant/30 bg-surface p-sm">
            <app-calendar
              id="rescheduleDate"
              :modelValue="rescheduleDate"
              @update:modelValue="onRescheduleDateChange"
              label="Nueva Fecha"
              :inline="true"
              :minDate="tomorrow"
              :disabledDates="rescheduleDisabledDates"
            />
          </div>
          <div class="flex justify-end">
            <button
              class="h-11 px-6 bg-primary text-on-primary font-label text-xs tracking-wider uppercase hover:opacity-90 transition-opacity font-semibold cursor-pointer"
              :disabled="!rescheduleDate"
              @click="rescheduleStep = 2"
            >CONTINUAR</button>
          </div>
        </div>

        <!-- Step 2: Time -->
        <div v-if="rescheduleStep === 2" class="p-4 md:p-6 space-y-4">
          <p class="font-body text-sm text-on-surface font-medium">Elige el horario</p>
          <div v-if="loadingSlots" class="flex items-center justify-center py-lg text-on-surface-variant gap-sm">
            <i class="pi pi-spin pi-spinner"></i>
            <span class="text-sm">Cargando horarios...</span>
          </div>
          <div v-else-if="rescheduleTimeSlots.length === 0" class="text-center py-lg space-y-sm">
            <i class="pi pi-info-circle text-2xl text-outline-variant"></i>
            <p class="text-sm text-on-surface-variant">No hay horarios disponibles para esta fecha.</p>
          </div>
          <div v-else class="grid grid-cols-3 gap-2">
            <button
              v-for="slot in rescheduleTimeSlots"
              :key="slot"
              class="h-10 font-label text-xs uppercase tracking-wider border transition-all duration-200 cursor-pointer rounded-none min-h-[44px]"
              :class="rescheduleTime === slot
                ? 'bg-primary text-on-primary border-primary'
                : 'border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary'"
              @click="rescheduleTime = slot"
            >{{ slot }}</button>
          </div>
          <div class="flex justify-between">
            <button
              class="h-11 px-5 border border-outline-variant/30 text-on-surface-variant font-label text-xs tracking-wider uppercase hover:bg-surface-container-low transition-colors cursor-pointer"
              @click="rescheduleStep = 1"
            >ATR&Aacute;S</button>
            <button
              class="h-11 px-6 bg-primary text-on-primary font-label text-xs tracking-wider uppercase hover:opacity-90 transition-opacity font-semibold cursor-pointer"
              :disabled="!rescheduleTime"
              @click="rescheduleStep = 3"
            >CONTINUAR</button>
          </div>
        </div>

        <!-- Step 3: Confirm -->
        <div v-if="rescheduleStep === 3" class="p-4 md:p-6 space-y-4">
          <div class="bg-surface-container-low p-4 space-y-2">
            <p class="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Nueva cita</p>
            <p class="font-body text-sm text-on-surface font-medium">{{ rescheduleTarget.services.join(', ') }}</p>
            <p class="font-body text-xs text-on-surface-variant">{{ rescheduleTarget.specialist }}</p>
            <p class="font-body text-xs text-primary font-semibold">{{ formatConfirmDate() }} &middot; {{ rescheduleTime }}</p>
          </div>
          <div class="flex justify-between">
            <button
              class="h-11 px-5 border border-outline-variant/30 text-on-surface-variant font-label text-xs tracking-wider uppercase hover:bg-surface-container-low transition-colors cursor-pointer"
              @click="rescheduleStep = 2"
            >ATR&Aacute;S</button>
            <button
              class="h-11 px-6 bg-primary text-on-primary font-label text-xs tracking-wider uppercase hover:opacity-90 transition-opacity font-semibold flex items-center gap-2 cursor-pointer"
              :disabled="savingReschedule"
              @click="handleReschedule"
            >
              <svg v-if="!savingReschedule" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="2.5" stroke-linecap="round"/></svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
              CONFIRMAR
            </button>
          </div>
        </div>
      </div>
    </p-dialog>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { supabase } from '../lib/supabase'
import { toDisplayTime, toDbTime, toDateString } from '../utils/time'
import { useMyAppointments } from '../composables/useMyAppointments'
import type { MyAppointmentItem } from '../composables/useMyAppointments'
import AppButton from '../components/atoms/AppButton.vue'
import AppCalendar from '../components/atoms/AppCalendar.vue'
import PToast from 'primevue/toast'
import PDialog from 'primevue/dialog'

const router = useRouter()
const toast = useToast()

const { appointments, loading, fetchMyAppointments, cancelAppointment, rescheduleAppointment } = useMyAppointments()

let userId: string | null = null

const activeTab = shallowRef<'upcoming' | 'history' | 'cancelled'>('upcoming')
const cancellingId = shallowRef<number | null>(null)
const showCancel = shallowRef(false)
const cancelTarget = shallowRef<MyAppointmentItem | null>(null)
const showReschedule = shallowRef(false)
const rescheduleTarget = shallowRef<MyAppointmentItem | null>(null)
const rescheduleDate = shallowRef<Date | null>(null)
const rescheduleTime = shallowRef('')
const rescheduleWeekSchedule = shallowRef<any[]>([])
const rescheduleOccupied = shallowRef<string[]>([])
const loadingSlots = shallowRef(false)
const savingReschedule = shallowRef(false)
const rescheduleStep = shallowRef(1)

const today = new Date()
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate())
tomorrow.setDate(tomorrow.getDate() + 1)

const upcoming = computed(() =>
  appointments.value.filter(a => a.status === 'Pendiente' || a.status === 'Confirmada')
)

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

const todayAppts = computed(() =>
  upcoming.value.filter(a => isToday(a.date)).sort((a, b) => a.time.localeCompare(b.time))
)

const futureAppts = computed(() =>
  upcoming.value.filter(a => !isToday(a.date)).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
)

const historyAppts = computed(() =>
  appointments.value.filter(a => a.status === 'Completada')
)

const cancelledAppts = computed(() =>
  appointments.value.filter(a => a.status === 'Cancelada')
)

const tabUpcomingCount = computed(() => upcoming.value.length)
const tabHistoryCount = computed(() => historyAppts.value.length)
const tabCancelledCount = computed(() => cancelledAppts.value.length)

const rescheduleDisabledDates = computed(() => {
  if (rescheduleWeekSchedule.value.length === 0) return []
  const activeDays = new Set(rescheduleWeekSchedule.value.filter((s: any) => s.active).map((s: any) => s.day_of_week))
  const dates: Date[] = []
  const start = new Date(tomorrow)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 3)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (!activeDays.has(d.getDay())) {
      dates.push(new Date(d))
    }
  }
  return dates
})

const rescheduleTimeSlots = computed(() => {
  if (!rescheduleDate.value || rescheduleWeekSchedule.value.length === 0) return []
  const dow = rescheduleDate.value.getDay()
  const daySched = rescheduleWeekSchedule.value.find((s: any) => s.day_of_week === dow)
  if (!daySched || !daySched.active) return []
  return generateTimeSlots(daySched.start_time, daySched.end_time, daySched.break_start, daySched.break_end)
    .filter(s => !rescheduleOccupied.value.includes(s))
})

function generateTimeSlots(start: string, end: string, breakStart: string | null, breakEnd: string | null): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  const breakStartMin = breakStart ? (() => { const [h, m] = breakStart.split(':').map(Number); return h * 60 + m })() : -1
  const breakEndMin = breakEnd ? (() => { const [h, m] = breakEnd.split(':').map(Number); return h * 60 + m })() : -1

  for (let m = startMin; m < endMin; m += 30) {
    if (m >= breakStartMin && m < breakEndMin) continue
    const hh = Math.floor(m / 60)
    const mm = m % 60
    const ampm = hh >= 12 ? 'PM' : 'AM'
    const displayH = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
    slots.push(`${displayH}:${String(mm).padStart(2, '0')} ${ampm}`)
  }
  return slots
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    Pendiente: 'bg-warning-container text-on-warning-container',
    Confirmada: 'bg-success-container text-on-success-container',
    Completada: 'bg-surface-container-high text-on-surface-variant',
    Cancelada: 'bg-danger-container text-on-danger-container'
  }
  return map[status] || 'bg-surface-container-high text-on-surface-variant'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatConfirmDate(): string {
  if (!rescheduleDate.value) return ''
  return rescheduleDate.value.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
}

function getDayNumber(dateStr: string): string {
  if (!dateStr) return '-'
  return String(new Date(dateStr + 'T00:00:00').getDate())
}

function getMonthAbbr(dateStr: string): string {
  if (!dateStr) return ''
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return months[new Date(dateStr + 'T00:00:00').getMonth()]
}

function openCancelDialog(appt: MyAppointmentItem) {
  cancelTarget.value = appt
  showCancel.value = true
}

async function handleCancel() {
  if (!cancelTarget.value) return
  cancellingId.value = cancelTarget.value.id
  const error = await cancelAppointment(cancelTarget.value.id)
  cancellingId.value = null
  showCancel.value = false

  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 4000 })
  } else {
    toast.add({ severity: 'success', summary: 'Cita cancelada', detail: 'La cita ha sido cancelada exitosamente.', life: 3000 })
    if (userId) await fetchMyAppointments(userId)
  }
}

async function openReschedule(appt: MyAppointmentItem) {
  rescheduleTarget.value = appt
  rescheduleDate.value = null
  rescheduleTime.value = ''
  rescheduleOccupied.value = []
  rescheduleStep.value = 1
  showReschedule.value = true

  const { data } = await supabase
    .from('schedules')
    .select('*')
    .eq('specialist_id', appt.specialistId)
    .order('day_of_week')

  rescheduleWeekSchedule.value = data || []
}

function onRescheduleDateChange(date: Date | null) {
  rescheduleDate.value = date
  rescheduleTime.value = ''
  if (date && rescheduleTarget.value) {
    fetchRescheduleOccupied(rescheduleTarget.value.specialistId, date)
  } else {
    rescheduleOccupied.value = []
  }
}

async function fetchRescheduleOccupied(specialistId: number, date: Date) {
  loadingSlots.value = true
  const dateStr = toDateString(date)
  const { data } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('specialist_id', specialistId)
    .eq('appointment_date', dateStr)
    .neq('status', 'Cancelada')

  rescheduleOccupied.value = (data || []).map((a: any) => toDisplayTime(a.appointment_time))
  loadingSlots.value = false
}

async function handleReschedule() {
  if (!rescheduleTarget.value || !rescheduleDate.value || !rescheduleTime.value) return

  savingReschedule.value = true
  const error = await rescheduleAppointment(
    rescheduleTarget.value.id,
    toDateString(rescheduleDate.value),
    rescheduleTime.value
  )
  savingReschedule.value = false

  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 4000 })
  } else {
    toast.add({ severity: 'success', summary: 'Cita reagendada', detail: 'La fecha y hora han sido actualizadas.', life: 3000 })
    showReschedule.value = false
    if (userId) await fetchMyAppointments(userId)
  }
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    router.push('/login')
    return
  }
  userId = user.id
  await fetchMyAppointments(userId)
})
</script>
