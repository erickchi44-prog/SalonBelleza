<template>
  <div class="space-y-md">
    <div v-if="loading" class="text-center py-xl">
      <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
      <p class="font-body-md text-on-surface-variant mt-sm">Cargando calendario...</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-sm">
        <div class="flex items-center gap-md">
          <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
            <i class="pi pi-calendar text-primary"></i> Calendario
          </h2>
          <div class="flex bg-surface-container-high rounded-md p-0.5">
            <button
              v-for="mode in viewModes" :key="mode.key"
              class="px-md py-xs text-label-sm font-label-sm rounded-sm transition-all cursor-pointer border-none"
              :class="viewMode === mode.key ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant/60 hover:text-on-surface'"
              @click="viewMode = mode.key"
            >{{ mode.label }}</button>
          </div>
        </div>
        <app-button label="NUEVA CITA" icon="pi pi-plus" @click="showDialog = true" />
      </div>

      <!-- Filter bar -->
      <div class="flex items-center gap-sm flex-wrap bg-surface border border-outline-variant/30 p-md">
        <div class="flex gap-0.5">
          <button class="w-8 h-8 flex items-center justify-center border border-outline-variant/30 bg-surface text-on-surface cursor-pointer hover:bg-primary-container/10 transition-colors text-sm" @click="navigate(-1)" aria-label="Anterior">‹</button>
          <button class="w-8 h-8 flex items-center justify-center border border-outline-variant/30 bg-surface text-on-surface cursor-pointer hover:bg-primary-container/10 transition-colors text-sm" @click="navigate(1)" aria-label="Siguiente">›</button>
        </div>
        <span class="font-label-md text-sm text-on-surface font-semibold min-w-[180px]">{{ dateLabel }}</span>
        <app-dropdown
          id="calSpecialist"
          v-model="filterSpecialist"
          label="Especialista"
          :options="specialistOptions"
          optionLabel="label"
          optionValue="value"
          class="min-w-40"
        />
        <app-button label="HOY" variant="outlined" icon="pi pi-clock" @click="goToday" class="text-xs" />
      </div>

      <!-- ===== DAY VIEW ===== -->
      <div v-if="viewMode === 'day'" class="bg-surface border border-outline-variant/30">
        <div class="p-lg max-w-2xl mx-auto">
          <div class="flex items-center justify-between mb-md">
            <h3 class="font-headline-md text-sm text-on-surface">
              {{ formatDate(filterDate, { weekday: 'long', day: 'numeric', month: 'long' }) }}
            </h3>
            <span class="font-label-sm text-xs text-on-surface-variant">{{ getApptsForDay(apptDateStr).length }} citas</span>
          </div>
          <div v-if="getApptsForDay(apptDateStr).length === 0" class="text-center py-xl text-on-surface-variant/40 font-body-md text-sm">
            No hay citas para este día
          </div>
          <div v-else class="space-y-sm">
            <div
              v-for="appt in getApptsForDay(apptDateStr)"
              :key="appt.id"
              class="flex items-center gap-md p-md border border-outline-variant/30 rounded-lg hover:border-primary/30 transition-all cursor-pointer bg-surface"
            >
              <div
                class="w-1 h-12 rounded-sm shrink-0"
                :class="appt.status === 'Confirmada' ? 'bg-success' : appt.status === 'Pendiente' ? 'bg-warning' : 'bg-danger'"
              ></div>
              <div class="font-label-md text-sm font-bold text-primary min-w-[52px]">{{ appt.time?.slice(0, 5) }}</div>
              <div class="flex-1 min-w-0">
                <p class="font-label-md text-sm font-semibold text-on-surface">{{ appt.customer }}</p>
                <p class="font-body-md text-xs text-on-surface-variant mt-0.5">
                  <span class="inline-flex items-center gap-xs"><i class="pi pi-user text-xs"></i>{{ appt.specialist }}</span>
                  <span class="mx-xs">·</span>
                  {{ appt.services.join(', ') }}
                </p>
              </div>
              <span
                class="px-sm py-0.5 text-label-sm font-label-sm uppercase tracking-wider font-semibold rounded-full text-xs shrink-0"
                :class="appt.status === 'Confirmada' ? 'bg-success-container/30 text-success' : appt.status === 'Pendiente' ? 'bg-warning-container/30 text-warning' : 'bg-danger-container/30 text-danger'"
              >{{ appt.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== WEEK VIEW ===== -->
      <div v-if="viewMode === 'week'" class="flex border border-outline-variant/30 overflow-hidden bg-surface" style="min-height: 480px;">
        <div
          v-for="(day, idx) in weekDays" :key="day.date"
          class="flex-1 flex flex-col min-w-0 border-r border-outline-variant/10 last:border-r-0"
          :class="day.isToday ? 'bg-primary-container/5' : ''"
        >
          <div class="p-sm text-center border-b border-outline-variant/10 bg-surface-container-high/30">
            <p class="font-label-sm text-xs text-on-surface-variant uppercase">{{ day.dayName }}</p>
            <p class="font-headline-md text-lg" :class="day.isToday ? 'text-primary font-bold' : 'text-on-surface'">{{ day.dayNum }}</p>
            <p class="font-label-sm text-xs text-on-surface-variant/60">{{ getApptsForDay(day.date).length }} citas</p>
          </div>
          <div class="flex-1 overflow-y-auto p-xs space-y-xs">
            <template v-if="getApptsForDay(day.date).length === 0">
              <p class="text-center text-xs text-on-surface-variant/20 py-lg">—</p>
            </template>
            <div
              v-for="appt in getApptsForDay(day.date)"
              :key="appt.id"
              class="p-sm border border-outline-variant/20 rounded-md cursor-pointer hover:border-primary/30 transition-all bg-surface"
              :style="{ borderLeftColor: appt.status === 'Confirmada' ? 'var(--color-success)' : appt.status === 'Pendiente' ? 'var(--color-warning)' : 'var(--color-danger)', borderLeftWidth: '3px' }"
              @click="goToDay(appt.date)"
            >
              <p class="font-label-sm text-xs font-bold text-primary">{{ appt.time?.slice(0, 5) }}</p>
              <p class="font-label-md text-sm font-semibold text-on-surface truncate">{{ appt.customer }}</p>
              <p class="text-xs text-on-surface-variant/60 truncate">{{ appt.specialist }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== MONTH VIEW ===== -->
      <div v-if="viewMode === 'month'" class="bg-surface border border-outline-variant/30 overflow-hidden">
        <div class="grid grid-cols-7 border-b border-outline-variant/10">
          <div v-for="dow in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" :key="dow"
            class="p-sm text-center font-label-sm text-xs text-on-surface-variant uppercase bg-surface-container-high/30"
          >{{ dow }}</div>
        </div>
        <div class="grid grid-cols-7">
          <div
            v-for="(day, idx) in monthDays" :key="idx"
            class="min-h-[80px] p-xs border-b border-outline-variant/10 border-r border-outline-variant/10 cursor-pointer hover:bg-primary-container/5 transition-colors"
            :class="{ 'bg-surface-container-high/20': day.isOtherMonth, 'bg-primary-container/10': day.isToday }"
            @click="goToDay(day.date)"
          >
            <div
              class="w-7 h-7 flex items-center justify-center font-label-md text-sm font-semibold mb-xs"
              :class="[day.isToday ? 'bg-primary text-on-primary rounded-full' : day.isOtherMonth ? 'text-on-surface-variant/20' : 'text-on-surface']"
            >{{ day.dayNum }}</div>
            <div class="space-y-0.5">
              <div
                v-for="appt in day.appointments.slice(0, 3)" :key="appt.id"
                class="h-1.5 rounded-full"
                :class="appt.status === 'Confirmada' ? 'bg-success' : appt.status === 'Pendiente' ? 'bg-warning' : 'bg-danger'"
                :style="{ width: Math.min(80, 40 + 20 * day.appointments.length) + '%' }"
              ></div>
            </div>
            <p v-if="day.appointments.length > 3" class="font-label-sm text-xs text-on-surface-variant/60 mt-0.5">+{{ day.appointments.length - 3 }}</p>
          </div>
        </div>
      </div>

      <!-- Drawer: Nueva Cita -->
      <Drawer v-model:visible="showDialog" header="Nueva Cita" :style="{ width: '480px' }" position="right" class="font-body-md">
        <template #header>
          <div class="flex items-center gap-sm">
            <i class="pi pi-plus-circle text-primary"></i>
            <span class="font-headline-md text-base text-on-surface font-bold">Nueva Cita</span>
          </div>
        </template>

        <div class="flex flex-col gap-lg" style="height: calc(100vh - 140px);">
          <div class="flex-1 overflow-y-auto space-y-lg px-sm">
            <!-- Cliente -->
            <div>
              <div class="font-label-md text-xs text-on-surface-variant/50 uppercase tracking-widest font-bold flex items-center gap-sm mb-xs">Cliente</div>
              <div class="flex bg-surface-container-high rounded-md p-0.5 mb-sm">
                <button
                  class="flex-1 px-sm py-xs text-label-sm font-label-sm rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-xs"
                  :class="clientMode === 'existing' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant/60 hover:text-on-surface'"
                  @click="clientMode = 'existing'"
                ><i class="pi pi-search" style="font-size:0.6rem"></i> Existente</button>
                <button
                  class="flex-1 px-sm py-xs text-label-sm font-label-sm rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-xs"
                  :class="clientMode === 'new' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant/60 hover:text-on-surface'"
                  @click="clientMode = 'new'"
                ><i class="pi pi-user-plus" style="font-size:0.6rem"></i> Nuevo</button>
              </div>

              <!-- Existing client -->
              <template v-if="clientMode === 'existing'">
                <div class="relative mb-xs">
                  <i class="pi pi-search absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant/40" style="font-size:0.75rem"></i>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o teléfono..."
                    class="w-full pl-xl pr-sm py-xs text-sm border border-outline-variant/30 rounded-md bg-surface text-on-surface outline-none focus:border-primary transition-colors"
                    v-model="clientQuery"
                  />
                </div>
                <div v-if="clientResults.length > 0" class="border border-outline-variant/20 rounded-md max-h-36 overflow-y-auto">
                  <div
                    v-for="c in clientResults" :key="c.id"
                    class="flex items-center gap-sm px-sm py-xs cursor-pointer transition-colors border-b border-outline-variant/10 last:border-b-0"
                    :class="selectedClient?.id === c.id ? 'bg-primary-container/10' : 'hover:bg-primary-container/5'"
                    @click="selectClient(c)"
                  >
                    <div class="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {{ getInitials(c.full_name) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-label-md text-sm font-semibold text-on-surface truncate">{{ c.full_name }}</p>
                      <p class="text-xs text-on-surface-variant/60 truncate">{{ c.phone || c.email }}</p>
                    </div>
                  </div>
                </div>
                <p v-else-if="clientQuery && !loadingClients" class="text-xs text-on-surface-variant/40 text-center py-sm">Sin resultados</p>
                <p v-else-if="loadingClients" class="text-xs text-on-surface-variant/40 text-center py-sm">
                  <i class="pi pi-spin pi-spinner"></i> Buscando...
                </p>
                <p v-else class="text-xs text-on-surface-variant/30 text-center py-sm">Escribe para buscar clientes</p>
              </template>

              <!-- New client -->
              <template v-if="clientMode === 'new'">
                <div class="grid grid-cols-2 gap-sm mb-xs">
                  <div>
                    <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest block mb-xs">Nombre</label>
                    <input type="text" v-model="newAppt.customer" placeholder="Nombre completo" class="w-full px-sm py-xs text-sm border border-outline-variant/30 rounded-md bg-surface text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest block mb-xs">Teléfono</label>
                    <input type="tel" v-model="newAppt.phone" placeholder="+52 55 ..." class="w-full px-sm py-xs text-sm border border-outline-variant/30 rounded-md bg-surface text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest block mb-xs">Correo</label>
                  <input type="email" v-model="newAppt.email" placeholder="correo@ejemplo.com" class="w-full px-sm py-xs text-sm border border-outline-variant/30 rounded-md bg-surface text-on-surface outline-none focus:border-primary transition-colors" />
                </div>
              </template>
            </div>

            <!-- Servicios -->
            <div>
              <div class="font-label-md text-xs text-on-surface-variant/50 uppercase tracking-widest font-bold flex items-center gap-sm mb-xs">Servicios</div>
              <div class="space-y-xs max-h-40 overflow-y-auto">
                <div
                  v-for="svc in serviceOptions" :key="svc.value"
                  class="flex items-center gap-sm px-sm py-xs border rounded-md cursor-pointer transition-all text-sm"
                  :class="newAppt.service_ids.includes(svc.value)
                    ? 'border-primary bg-primary-container/10'
                    : 'border-outline-variant/20 hover:border-primary/50'"
                  @click="toggleAdminService(svc.value)"
                >
                  <div
                    class="w-4 h-4 flex items-center justify-center rounded-xs border transition-all shrink-0"
                    :class="newAppt.service_ids.includes(svc.value)
                      ? 'border-primary bg-primary'
                      : 'border-outline-variant/50'"
                  >
                    <i v-if="newAppt.service_ids.includes(svc.value)" class="pi pi-check text-on-primary" style="font-size:0.45rem"></i>
                  </div>
                  <span class="flex-1 text-on-surface">{{ svc.label }}</span>
                  <span class="text-on-surface-variant text-xs">${{ svc.price }}</span>
                </div>
              </div>
              <div v-if="computedTotal > 0" class="flex justify-between items-center mt-xs pt-xs border-t border-outline-variant/20">
                <span class="font-label-md text-xs text-on-surface-variant font-semibold">Total</span>
                <span class="font-headline-md text-sm text-primary font-bold">${{ computedTotal }}</span>
              </div>
            </div>

            <!-- Asignación -->
            <div>
              <div class="font-label-md text-xs text-on-surface-variant/50 uppercase tracking-widest font-bold flex items-center gap-sm mb-xs">Asignación</div>
              <app-dropdown id="newApptSpecialist" v-model="newAppt.specialist" label="Especialista" :options="specialistOptions" optionLabel="label" optionValue="value" class="mb-sm" />
              <div class="grid grid-cols-2 gap-sm">
                <app-calendar id="newApptDate" v-model="newAppt.date" label="Fecha" :minDate="new Date()" />
                <app-dropdown id="newApptTime" v-model="newAppt.time" label="Hora" :options="timeOptions" optionLabel="label" optionValue="value" />
              </div>
              <div class="mt-xs">
                <label class="font-label-md text-xs text-on-surface-variant uppercase tracking-widest block mb-xs">Duración estimada</label>
                <input type="text" :value="computedDuration" disabled class="w-full px-sm py-xs text-sm border border-outline-variant/20 rounded-md bg-surface-container-high/30 text-on-surface-variant/60" />
              </div>
            </div>

            <!-- Notas -->
            <div>
              <div class="font-label-md text-xs text-on-surface-variant/50 uppercase tracking-widest font-bold flex items-center gap-sm mb-xs">Notas</div>
              <app-textarea id="newApptNotes" v-model="newAppt.notes" label="" :rows="2" placeholder="Notas opcionales..." />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-sm pt-sm border-t border-outline-variant/20 shrink-0 px-sm">
            <app-button label="CANCELAR" variant="outlined" @click="closeDrawer" />
            <app-button label="GUARDAR CITA" icon="pi pi-check" :disabled="!canSave" @click="saveAppointment" />
          </div>
        </div>
      </Drawer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, watch } from 'vue';
import { supabase } from '../../lib/supabase';
import { toDisplayTime } from '../../utils/time';
import { useToast } from 'primevue/usetoast';
import Drawer from 'primevue/drawer';
import AppButton from '../../components/atoms/AppButton.vue';
import AppCalendar from '../../components/atoms/AppCalendar.vue';
import AppDropdown from '../../components/atoms/AppDropdown.vue';
import AppTextarea from '../../components/atoms/AppTextarea.vue';

const loading = shallowRef(true);
const toast = useToast();
const showDialog = shallowRef(false);
const filterDate = shallowRef(new Date());
const filterSpecialist = shallowRef<number | null>(null);
const viewMode = shallowRef<'day' | 'week' | 'month'>('week');
const viewModes = [
  { key: 'day' as const, label: 'Día' },
  { key: 'week' as const, label: 'Semana' },
  { key: 'month' as const, label: 'Mes' }
];
const appointments = shallowRef<any[]>([]);
const specialistOptions = shallowRef<{ label: string; value: number | null }[]>([]);
const serviceOptions = shallowRef<{ label: string; value: number; duration: number; price: number }[]>([]);

const newAppt = ref({ customer: '', phone: '', email: '', service_ids: [] as number[], specialist: null as number | null, date: null as Date | null, time: null as string | null, notes: '', user_id: null as string | null });

const clientMode = ref<'existing' | 'new'>('existing');
const clientQuery = ref('');
const clientResults = shallowRef<{ id: string; full_name: string; phone: string; email: string }[]>([]);
const selectedClient = shallowRef<{ id: string; full_name: string; phone: string; email: string } | null>(null);
const loadingClients = shallowRef(false);

const timeOptions = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM'].map(t => ({ label: t, value: t }));

function toggleAdminService(id: number) {
  const idx = newAppt.value.service_ids.indexOf(id)
  if (idx >= 0) {
    newAppt.value.service_ids = newAppt.value.service_ids.filter(i => i !== id)
  } else {
    newAppt.value.service_ids = [...newAppt.value.service_ids, id]
  }
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function selectClient(c: { id: string; full_name: string; phone: string; email: string }) {
  selectedClient.value = c
  newAppt.value.customer = c.full_name
  newAppt.value.user_id = c.id
}

function closeDrawer() {
  showDialog.value = false
  resetForm()
}

function resetForm() {
  newAppt.value = { customer: '', phone: '', email: '', service_ids: [], specialist: null, date: null, time: null, notes: '', user_id: null }
  clientQuery.value = ''
  clientResults.value = []
  selectedClient.value = null
  clientMode.value = 'existing'
}

const computedTotal = computed(() => {
  return serviceOptions.value
    .filter(s => newAppt.value.service_ids.includes(s.value))
    .reduce((sum, s) => sum + s.price, 0)
})

const computedDuration = computed(() => {
  const totalMin = serviceOptions.value
    .filter(s => newAppt.value.service_ids.includes(s.value))
    .reduce((sum, s) => sum + s.duration, 0)
  if (totalMin === 0) return '—'
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h} h ${m} min` : `${m} min`
})

const canSave = computed(() => {
  if (newAppt.value.service_ids.length === 0) return false
  if (clientMode.value === 'new' && !newAppt.value.customer.trim()) return false
  return true
})

const searchClients = async (q: string) => {
  if (!q.trim()) {
    clientResults.value = []
    return
  }
  loadingClients.value = true
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .ilike('full_name', `%${q}%`)
    .limit(6)
  if (error) {
    clientResults.value = []
  } else {
    clientResults.value = (data || []).map((p: any) => ({ ...p, email: '' })) as any
  }
  loadingClients.value = false
}

watch(clientQuery, (q) => {
  searchClients(q)
})

const apptDateStr = computed(() => {
  const d = filterDate.value || new Date()
  return d.toISOString().split('T')[0]
})

function getApptsForDay(date: string) {
  return appointments.value.filter((a: any) => a.date === date)
}

function formatDate(d: Date, opts: Intl.DateTimeFormatOptions = {}) {
  if (!d) return ''
  return d.toLocaleDateString('es-MX', opts)
}

const dateLabel = computed(() => {
  const d = filterDate.value || new Date()
  if (viewMode.value === 'day') {
    return formatDate(d, { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())
  } else if (viewMode.value === 'week') {
    const day = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return `${formatDate(monday, { day: 'numeric' })} — ${formatDate(sunday, { day: 'numeric', month: 'long', year: 'numeric' })}`
  } else {
    return formatDate(d, { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())
  }
})

interface WeekDay {
  date: string
  dayName: string
  dayNum: number
  isToday: boolean
  label: string
}

const weekDays = computed<WeekDay[]>(() => {
  const base = filterDate.value ? new Date(filterDate.value) : new Date();
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const today = new Date();
    return {
      date: d.toISOString().slice(0, 10) as string,
      dayName: d.toLocaleDateString('es-MX', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      label: `${d.getDate()}/${d.getMonth() + 1}`
    };
  });
});

interface MonthDay {
  date: string
  dayNum: number
  isToday: boolean
  isOtherMonth: boolean
  appointments: any[]
}

const monthDays = computed<MonthDay[]>(() => {
  const base = filterDate.value ? new Date(filterDate.value) : new Date()
  const year = base.getFullYear()
  const month = base.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1)
  const totalDays = lastDay.getDate()
  const today = new Date()
  const days: MonthDay[] = []

  // Previous month padding
  const prevMonthLast = new Date(year, month, 0).getDate()
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLast - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      dayNum: prevMonthLast - i,
      isToday: false,
      isOtherMonth: true,
      appointments: getApptsForDay(dateStr)
    })
  }

  // Current month
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      dayNum: i,
      isToday: d.toDateString() === today.toDateString(),
      isOtherMonth: false,
      appointments: getApptsForDay(dateStr)
    })
  }

  // Next month padding to fill 42 cells (6 rows)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      dayNum: i,
      isToday: false,
      isOtherMonth: true,
      appointments: getApptsForDay(dateStr)
    })
  }

  return days
})

function navigate(dir: number) {
  const d = new Date(filterDate.value || new Date())
  if (viewMode.value === 'day') {
    d.setDate(d.getDate() + dir)
  } else if (viewMode.value === 'week') {
    d.setDate(d.getDate() + dir * 7)
  } else {
    d.setMonth(d.getMonth() + dir)
  }
  filterDate.value = d
}

function goToday() {
  filterDate.value = new Date()
}

function goToDay(date: string) {
  filterDate.value = new Date(date + 'T00:00:00')
  viewMode.value = 'day'
}

const fetchAppointments = async () => {
  let query = supabase
    .from('appointments')
    .select(`
      id, customer_name, appointment_date, appointment_time, status,
      appointment_services(service_id, services(title)),
      specialists(name)
    `);

  if (filterSpecialist.value) {
    query = query.eq('specialist_id', filterSpecialist.value);
  }

  const { data } = await query.order('appointment_date').order('appointment_time');

  appointments.value = (data || []).map((a: any) => ({
    id: a.id,
    date: a.appointment_date,
    time: toDisplayTime(a.appointment_time),
    customer: a.customer_name,
    services: a.appointment_services?.map((as: any) => as.services?.title || '-') || [],
    specialist: a.specialists?.name || '-',
    status: a.status || 'Pendiente'
  }));
};

const fetchOptions = async () => {
  const [{ data: specs }, { data: services }] = await Promise.all([
    supabase.from('specialists').select('id, name').eq('active', true).order('id'),
    supabase.from('services').select('id, title, duration, price').eq('active', true).order('id')
  ]);

  specialistOptions.value = [
    { label: 'Todas', value: null },
    ...(specs || []).map(s => ({ label: s.name, value: s.id }))
  ];

  serviceOptions.value = (services || []).map(s => ({ label: s.title, value: s.id, duration: s.duration, price: s.price }));
};

const saveAppointment = async () => {
  const { data: appointment, error: apptError } = await supabase.from('appointments').insert({
    customer_name: newAppt.value.customer,
    specialist_id: newAppt.value.specialist,
    appointment_date: newAppt.value.date?.toISOString().split('T')[0],
    appointment_time: newAppt.value.time,
    notes: newAppt.value.notes,
    status: 'Pendiente'
  }).select('id').single();

  if (apptError) {
    toast.add({ severity: 'error', summary: 'Error', detail: apptError.message, life: 5000 })
    return;
  }

  const { error: relError } = await supabase.from('appointment_services').insert(
    newAppt.value.service_ids.map(service_id => ({
      appointment_id: appointment.id,
      service_id
    }))
  );

  if (relError) {
    await supabase.from('appointments').delete().eq('id', appointment.id);
    return;
  }

  const isNew = clientMode.value === 'new'
  const newEmail = newAppt.value.email
  const newName = newAppt.value.customer
  const newPhone = newAppt.value.phone

  showDialog.value = false;
  resetForm();
  fetchAppointments();

  if (isNew && newEmail) {
    await inviteNewClient(newEmail, newName, newPhone)
  }
};

const inviteNewClient = async (email: string, fullName: string, phone: string) => {
  const pwd = Array.from({ length: 16 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('')
  const { error } = await supabase.auth.signUp({
    email,
    password: pwd,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${window.location.origin}/login`
    }
  })
  if (error) {
    if (error.message.includes('already')) {
      toast.add({ severity: 'info', summary: 'Ya registrado', detail: `${email} ya tiene cuenta en el sistema`, life: 4000 })
    } else {
      toast.add({ severity: 'warn', summary: 'Invitación fallida', detail: error.message, life: 5000 })
    }
  } else {
    toast.add({ severity: 'success', summary: 'Invitación enviada', detail: `Se envió un enlace a ${email} para completar su registro`, life: 5000 })
  }
};

watch(filterSpecialist, () => fetchAppointments());

onMounted(async () => {
  await Promise.all([fetchOptions(), fetchAppointments()]);
  loading.value = false;
});
</script>
