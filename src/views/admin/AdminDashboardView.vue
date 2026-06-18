<template>
  <div class="space-y-lg">
    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
      <div v-for="n in 4" :key="n" class="bg-surface border border-outline-variant/30 p-md animate-pulse space-y-sm">
        <div class="h-3 bg-surface-container-high w-1/2"></div>
        <div class="h-8 bg-surface-container-high w-1/3"></div>
        <div class="h-3 bg-surface-container-high w-1/4"></div>
      </div>
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <div v-for="kpi in kpis" :key="kpi.label"
          class="bg-surface border border-outline-variant/30 p-md flex flex-col gap-sm hover:border-primary/40 transition-all duration-300 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">{{ kpi.label }}</span>
            <div class="w-9 h-9 rounded-full flex items-center justify-center" :class="kpi.iconBg">
              <i :class="[kpi.icon, kpi.iconColor, 'text-sm']"></i>
            </div>
          </div>
          <p class="font-display-lg text-3xl font-bold text-on-surface">{{ kpi.value }}</p>
          <div class="flex items-center gap-xs text-xs" :class="kpi.trend > 0 ? 'text-success' : 'text-danger'">
            <i :class="kpi.trend > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="text-label-sm"></i>
            <span>{{ Math.abs(kpi.trend) }}% vs. mes anterior</span>
          </div>
        </div>
      </div>

      <!-- Charts and Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <div class="lg:col-span-2 bg-surface border border-outline-variant/30 p-md shadow-sm">
          <div class="flex items-center justify-between mb-md">
            <h3 class="font-headline-md text-base text-on-surface">Citas Recientes</h3>
            <router-link to="/admin/calendar" class="text-primary font-label-sm text-xs flex items-center gap-xs hover:underline">
              Ver todas <i class="pi pi-arrow-right text-label-sm"></i>
            </router-link>
          </div>
          <p-datatable :value="recentBookings" class="text-sm" :rows="5" stripedRows>
            <p-column field="customer" header="Cliente" />
            <p-column header="Servicios">
              <template #body="{ data }">
                {{ data.services.join(', ') }}
              </template>
            </p-column>
            <p-column field="specialist" header="Especialista" />
            <p-column field="time" header="Hora" />
            <p-column header="Estado">
              <template #body="{ data }">
                <span
                  class="px-sm py-xs text-label-sm font-label-sm uppercase tracking-wider font-semibold"
                  :class="{
                    'bg-success-container text-on-success-container': data.status === 'Confirmada',
                    'bg-warning-container text-on-warning-container': data.status === 'Pendiente',
                    'bg-danger-container text-on-danger-container': data.status === 'Cancelada'
                  }"
                >{{ data.status }}</span>
              </template>
            </p-column>
          </p-datatable>
        </div>

        <div class="bg-surface border border-outline-variant/30 p-md shadow-sm space-y-sm">
          <h3 class="font-headline-md text-base text-on-surface mb-md">Acciones R&aacute;pidas</h3>
          <router-link
            v-for="action in quickActions"
            :key="action.label"
            :to="action.path"
            class="flex items-center gap-md p-sm border border-outline-variant/20 hover:border-primary hover:bg-primary-container/10 transition-all duration-300 group cursor-pointer"
          >
            <div class="w-9 h-9 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-all">
              <i :class="[action.icon, 'text-primary text-sm']"></i>
            </div>
            <span class="font-label-md text-sm text-on-surface group-hover:text-primary transition-colors">{{ action.label }}</span>
            <i class="pi pi-chevron-right ml-auto text-label-sm text-outline-variant group-hover:text-primary transition-colors"></i>
          </router-link>
        </div>
      </div>

      <!-- Today's Appointments -->
      <div class="bg-surface border border-outline-variant/30 p-md shadow-sm">
        <div class="flex items-center justify-between mb-md">
          <h3 class="font-headline-md text-base text-on-surface flex items-center gap-sm">
            <i class="pi pi-calendar-clock text-primary"></i> Citas de Hoy
          </h3>
          <span class="font-label-sm text-xs text-on-surface-variant">{{ todayDate }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
          <div
            v-for="appt in todayAppointments"
            :key="appt.id"
            class="border-l-4 border-primary pl-md py-sm bg-primary-container/5"
          >
            <p class="font-label-md text-sm font-semibold text-on-surface">{{ appt.customer }}</p>
            <p class="text-xs text-on-surface-variant">{{ appt.services.join(', ') }}</p>
            <div class="flex items-center gap-xs mt-xs text-xs text-primary">
              <i class="pi pi-clock text-label-sm"></i>
              <span>{{ appt.time }} &middot; {{ appt.specialist }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import type { KpiCard, QuickAction, AppointmentDisplay } from '../../types';
import PDataTable from 'primevue/datatable';
import PColumn from 'primevue/column';

const todayDate = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const loading = shallowRef(true);
const kpis = shallowRef<KpiCard[]>([
  { label: 'Citas Hoy', value: '0', trend: 0, icon: 'pi pi-calendar', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { label: 'Ingresos del Mes', value: '$0', trend: 0, icon: 'pi pi-dollar', iconBg: 'bg-success-container/50', iconColor: 'text-success' },
  { label: 'Nuevos Clientes', value: '0', trend: 0, icon: 'pi pi-user-plus', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { label: 'Valoraci&oacute;n Promedio', value: '0.0', trend: 0, icon: 'pi pi-star', iconBg: 'bg-warning-container/50', iconColor: 'text-warning' }
]);

const recentBookings = shallowRef<AppointmentDisplay[]>([]);
const todayAppointments = shallowRef<any[]>([]);

const quickActions: QuickAction[] = [
  { label: 'Nueva Cita', path: '/admin/calendar', icon: 'pi pi-calendar-plus' },
  { label: 'Gestionar Especialistas', path: '/admin/specialists', icon: 'pi pi-users' },
  { label: 'Crear Promoci&oacute;n', path: '/admin/promotions', icon: 'pi pi-percentage' },
  { label: 'Ver Valoraciones', path: '/admin/feedback', icon: 'pi pi-star' },
  { label: 'Configurar Horarios', path: '/admin/schedules', icon: 'pi pi-clock' },
  { label: 'AI Analytics', path: '/admin/analytics', icon: 'pi pi-chart-bar' }
];

onMounted(async () => {
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [{ count: todayCount }, { count: monthCount }, { data: feedbackData }, { data: bookings }, { data: todayData }] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('appointment_date', startOfMonth),
    supabase.from('feedback').select('rating'),
    supabase.from('appointments').select('customer_name, appointment_time, status, appointment_services(services(title)), specialists(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('appointments').select('id, customer_name, appointment_time, appointment_services(services(title)), specialists(name)').eq('appointment_date', today).order('appointment_time')
  ]);

  const avgRating = feedbackData?.length
    ? (feedbackData.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
    : '0.0';

  kpis.value = [
    { label: 'Citas Hoy', value: String(todayCount || 0), trend: 12, icon: 'pi pi-calendar', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'Ingresos del Mes', value: '$0', trend: 8, icon: 'pi pi-dollar', iconBg: 'bg-success-container/50', iconColor: 'text-success' },
    { label: 'Nuevos Clientes', value: String(monthCount || 0), trend: 5, icon: 'pi pi-user-plus', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'Valoraci&oacute;n Promedio', value: avgRating, trend: 3, icon: 'pi pi-star', iconBg: 'bg-warning-container/50', iconColor: 'text-warning' }
  ];

  recentBookings.value = (bookings || []).map((b: any) => ({
    customer: b.customer_name,
    services: b.appointment_services?.map((as: any) => as.services?.title || '-') || [],
    specialist: b.specialists?.name || '-',
    time: b.appointment_time?.slice(0, 5) || '-',
    status: b.status
  }));

  todayAppointments.value = (todayData || []).map((a: any) => ({
    id: a.id,
    customer: a.customer_name,
    services: a.appointment_services?.map((as: any) => as.services?.title || '-') || [],
    time: a.appointment_time?.slice(0, 5) || '-',
    specialist: a.specialists?.name || '-'
  }));

  loading.value = false;
});
</script>
