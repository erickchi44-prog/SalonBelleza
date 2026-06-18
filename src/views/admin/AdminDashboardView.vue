<template>
  <div class="space-y-lg">
    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
      <div v-for="n in 4" :key="n" class="bg-surface border border-outline-variant/30 rounded-xl p-md animate-pulse space-y-sm">
        <div class="h-3 bg-surface-container-high w-1/2 rounded"></div>
        <div class="h-8 bg-surface-container-high w-1/3 rounded"></div>
        <div class="h-3 bg-surface-container-high w-1/4 rounded"></div>
      </div>
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <div v-for="kpi in kpis" :key="kpi.label"
          class="bg-surface border border-outline-variant/30 rounded-xl p-md transition-all duration-300">
          <div class="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest flex items-center gap-sm mb-md">
            <span class="w-2 h-2 rounded-full inline-block" :style="{ background: kpi.dotColor }"></span>
            {{ kpi.label }}
          </div>
          <p class="font-display-lg text-3xl font-bold text-on-surface">{{ kpi.value }}</p>
          <div class="flex items-center gap-xs text-xs mt-xs" :class="kpi.trend > 0 ? 'text-success' : 'text-danger'">
            <i :class="kpi.trend > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="text-label-sm"></i>
            <span>{{ Math.abs(kpi.trend) }}% vs. mes anterior</span>
          </div>
        </div>
      </div>

      <!-- Timeline + Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <div class="lg:col-span-2 bg-surface border border-outline-variant/30 rounded-xl p-md">
          <div class="flex items-center justify-between mb-lg">
            <h3 class="font-headline-md text-sm text-on-surface flex items-center gap-sm">
              <i class="pi pi-calendar-clock text-primary"></i> Citas de Hoy
            </h3>
            <span class="font-label-sm text-xs text-on-surface-variant">{{ todayDate }}</span>
          </div>
          <div v-if="todayAppointments.length === 0" class="text-on-surface-variant text-sm py-lg text-center">
            No hay citas programadas para hoy.
          </div>
          <div v-else class="relative pl-lg">
            <div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-outline-variant/30"></div>
            <div v-for="appt in todayAppointments" :key="appt.id" class="relative pb-lg last:pb-0">
              <div class="absolute -left-lg top-1.5 w-[14px] h-[14px] rounded-full bg-surface border-2 border-primary"></div>
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-label-md text-sm font-semibold text-on-surface">{{ appt.customer }}</p>
                  <p class="text-xs text-on-surface-variant mt-0.5">{{ appt.services.join(', ') }}</p>
                  <p class="text-xs text-primary mt-1">
                    <i class="pi pi-clock text-label-sm mr-xs"></i>
                    {{ appt.time }} &middot; {{ appt.specialist }}
                  </p>
                </div>
                <span
                  class="px-sm py-0.5 text-label-sm font-label-sm uppercase tracking-wider font-semibold rounded-full text-xs"
                  :class="appt.status === 'Confirmada' ? 'bg-success-container/30 text-success' : appt.status === 'Pendiente' ? 'bg-warning-container/30 text-warning' : 'bg-danger-container/30 text-danger'"
                >{{ appt.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-surface border border-outline-variant/30 rounded-xl p-md">
          <h3 class="font-headline-md text-sm text-on-surface mb-md flex items-center gap-sm">
            <i class="pi pi-bolt text-primary"></i> Acciones Rápidas
          </h3>
          <div class="grid grid-cols-2 gap-xs">
            <router-link
              v-for="action in quickActions"
              :key="action.label"
              :to="action.path"
              class="flex items-center gap-sm p-sm rounded-lg border border-outline-variant/15 hover:border-primary/25 hover:bg-primary-container/5 transition-all duration-200 group"
            >
              <i :class="[action.icon, 'text-primary text-sm shrink-0']"></i>
              <span class="font-label-sm text-xs text-on-surface group-hover:text-primary transition-colors leading-tight">{{ action.label }}</span>
            </router-link>
          </div>
          <div class="mt-md p-md rounded-lg bg-primary-container/10 border border-primary/10">
            <div class="font-label-sm text-xs font-semibold text-on-surface mb-xs">📈 Resumen Rápido</div>
            <div class="text-xs text-on-surface-variant">Ocupación: 78% · Prom. cita: $68 · Cancelación: 4%</div>
          </div>
        </div>
      </div>

      <!-- Recent Bookings -->
      <div class="bg-surface border border-outline-variant/30 rounded-xl p-md">
        <div class="flex items-center justify-between mb-md">
          <h3 class="font-headline-md text-sm text-on-surface flex items-center gap-sm">
            <i class="pi pi-list-bullet text-primary"></i> Citas Recientes
          </h3>
          <router-link to="/admin/calendar" class="text-primary font-label-sm text-xs flex items-center gap-xs hover:underline">
            Ver todas <i class="pi pi-arrow-right text-label-sm"></i>
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-outline-variant/20">
                <th class="text-left font-label-md text-xs text-on-surface-variant/60 uppercase tracking-widest py-sm pr-md">Cliente</th>
                <th class="text-left font-label-md text-xs text-on-surface-variant/60 uppercase tracking-widest py-sm pr-md">Servicios</th>
                <th class="text-left font-label-md text-xs text-on-surface-variant/60 uppercase tracking-widest py-sm pr-md">Especialista</th>
                <th class="text-left font-label-md text-xs text-on-surface-variant/60 uppercase tracking-widest py-sm pr-md">Hora</th>
                <th class="text-left font-label-md text-xs text-on-surface-variant/60 uppercase tracking-widest py-sm pr-md">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in recentBookings" :key="i" class="border-b border-outline-variant/10 last:border-b-0 hover:bg-primary-container/5 transition-colors">
                <td class="py-sm pr-md font-semibold text-on-surface">{{ row.customer }}</td>
                <td class="py-sm pr-md text-on-surface-variant/80">{{ row.services.join(', ') }}</td>
                <td class="py-sm pr-md text-on-surface-variant/80">{{ row.specialist }}</td>
                <td class="py-sm pr-md text-on-surface-variant/80">{{ row.time }}</td>
                <td class="py-sm">
                  <span
                    class="px-sm py-0.5 text-label-sm font-label-sm uppercase tracking-wider font-semibold rounded-full text-xs"
                    :class="{
                      'bg-success-container/30 text-success': row.status === 'Confirmada',
                      'bg-warning-container/30 text-warning': row.status === 'Pendiente',
                      'bg-danger-container/30 text-danger': row.status === 'Cancelada'
                    }"
                  >{{ row.status }}</span>
                </td>
              </tr>
              <tr v-if="recentBookings.length === 0">
                <td colspan="5" class="text-center py-lg text-on-surface-variant/40 text-sm">No hay citas recientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import type { KpiCard, QuickAction, AppointmentDisplay } from '../../types';


const todayDate = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const loading = shallowRef(true);
const kpis = shallowRef<KpiCard[]>([
  { label: 'Citas Hoy', value: '0', trend: 0, icon: 'pi pi-calendar', iconBg: 'bg-primary/10', iconColor: 'text-primary', dotColor: '#eebd8e' },
  { label: 'Ingresos del Mes', value: '$0', trend: 0, icon: 'pi pi-dollar', iconBg: 'bg-success-container/50', iconColor: 'text-success', dotColor: '#22c55e' },
  { label: 'Nuevos Clientes', value: '0', trend: 0, icon: 'pi pi-user-plus', iconBg: 'bg-primary/10', iconColor: 'text-primary', dotColor: '#60a5fa' },
  { label: 'Valoraci&oacute;n Promedio', value: '0.0', trend: 0, icon: 'pi pi-star', iconBg: 'bg-warning-container/50', iconColor: 'text-warning', dotColor: '#eab308' }
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
    { label: 'Citas Hoy', value: String(todayCount || 0), trend: 12, icon: 'pi pi-calendar', iconBg: 'bg-primary/10', iconColor: 'text-primary', dotColor: '#eebd8e' },
    { label: 'Ingresos del Mes', value: '$0', trend: 8, icon: 'pi pi-dollar', iconBg: 'bg-success-container/50', iconColor: 'text-success', dotColor: '#22c55e' },
    { label: 'Nuevos Clientes', value: String(monthCount || 0), trend: 5, icon: 'pi pi-user-plus', iconBg: 'bg-primary/10', iconColor: 'text-primary', dotColor: '#60a5fa' },
    { label: 'Valoraci&oacute;n Promedio', value: avgRating, trend: 3, icon: 'pi pi-star', iconBg: 'bg-warning-container/50', iconColor: 'text-warning', dotColor: '#eab308' }
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
