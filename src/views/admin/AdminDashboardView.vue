<template>
  <div class="space-y-lg">
    <!-- KPI Cards Row -->
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
        <div class="flex items-center gap-xs text-xs" :class="kpi.trend > 0 ? 'text-green-600' : 'text-red-500'">
          <i :class="kpi.trend > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="text-[10px]"></i>
          <span>{{ Math.abs(kpi.trend) }}% vs. mes anterior</span>
        </div>
      </div>
    </div>

    <!-- Charts and Quick Actions Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-md">
      <!-- Recent Bookings Table -->
      <div class="lg:col-span-2 bg-surface border border-outline-variant/30 p-md shadow-sm">
        <div class="flex items-center justify-between mb-md">
          <h3 class="font-headline-md text-base text-on-surface">Citas Recientes</h3>
          <router-link to="/admin/calendar" class="text-primary font-label-sm text-xs flex items-center gap-xs hover:underline">
            Ver todas <i class="pi pi-arrow-right text-[10px]"></i>
          </router-link>
        </div>
        <p-datatable :value="recentBookings" class="text-sm" :rows="5" stripedRows>
          <p-column field="customer" header="Cliente" />
          <p-column field="service" header="Servicio" />
          <p-column field="specialist" header="Especialista" />
          <p-column field="time" header="Hora" />
          <p-column header="Estado">
            <template #body="{ data }">
              <span
                class="px-sm py-xs text-[10px] font-label-sm uppercase tracking-wider font-semibold"
                :class="{
                  'bg-green-100 text-green-700': data.status === 'Confirmada',
                  'bg-yellow-100 text-yellow-700': data.status === 'Pendiente',
                  'bg-red-100 text-red-600': data.status === 'Cancelada'
                }"
              >{{ data.status }}</span>
            </template>
          </p-column>
        </p-datatable>
      </div>

      <!-- Quick Actions Panel -->
      <div class="bg-surface border border-outline-variant/30 p-md shadow-sm space-y-sm">
        <h3 class="font-headline-md text-base text-on-surface mb-md">Acciones Rápidas</h3>
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
          <i class="pi pi-chevron-right ml-auto text-[10px] text-outline-variant group-hover:text-primary transition-colors"></i>
        </router-link>
      </div>
    </div>

    <!-- Upcoming Appointments Today -->
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
          <p class="text-xs text-on-surface-variant">{{ appt.service }}</p>
          <div class="flex items-center gap-xs mt-xs text-xs text-primary">
            <i class="pi pi-clock text-[10px]"></i>
            <span>{{ appt.time }} · {{ appt.specialist }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import PDataTable from 'primevue/datatable';
import PColumn from 'primevue/column';

const todayDate = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const kpis = ref([
  { label: 'Citas Hoy', value: '0', trend: 0, icon: 'pi pi-calendar', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { label: 'Ingresos del Mes', value: '$0', trend: 0, icon: 'pi pi-dollar', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  { label: 'Nuevos Clientes', value: '0', trend: 0, icon: 'pi pi-user-plus', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Valoración Promedio', value: '0.0', trend: 0, icon: 'pi pi-star', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-500' }
]);

const recentBookings = ref([]);
const todayAppointments = ref([]);

const quickActions = [
  { label: 'Nueva Cita', path: '/admin/calendar', icon: 'pi pi-calendar-plus' },
  { label: 'Gestionar Especialistas', path: '/admin/specialists', icon: 'pi pi-users' },
  { label: 'Crear Promoción', path: '/admin/promotions', icon: 'pi pi-percentage' },
  { label: 'Ver Valoraciones', path: '/admin/feedback', icon: 'pi pi-star' },
  { label: 'Configurar Horarios', path: '/admin/schedules', icon: 'pi pi-clock' },
  { label: 'AI Analytics', path: '/admin/analytics', icon: 'pi pi-chart-bar' }
];

onMounted(async () => {
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const { count: todayCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('appointment_date', today);

  const { count: monthCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', startOfMonth);

  const { data: feedbackData } = await supabase
    .from('feedback')
    .select('rating');

  const avgRating = feedbackData?.length
    ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
    : '0.0';

  kpis.value[0].value = String(todayCount || 0);
  kpis.value[1].value = `$${monthCount * 0 || 0}`;
  kpis.value[2].value = String(monthCount || 0);
  kpis.value[3].value = avgRating;

  const { data: bookings } = await supabase
    .from('appointments')
    .select('customer_name, appointment_time, status, services(title), specialists(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  recentBookings.value = (bookings || []).map(b => ({
    customer: b.customer_name,
    service: b.services?.title || '-',
    specialist: b.specialists?.name || '-',
    time: b.appointment_time?.slice(0, 5) || '-',
    status: b.status
  }));

  const { data: todayData } = await supabase
    .from('appointments')
    .select('id, customer_name, appointment_time, services(title), specialists(name)')
    .eq('appointment_date', today)
    .order('appointment_time');

  todayAppointments.value = (todayData || []).map(a => ({
    id: a.id,
    customer: a.customer_name,
    service: a.services?.title || '-',
    time: a.appointment_time?.slice(0, 5) || '-',
    specialist: a.specialists?.name || '-'
  }));
});
</script>
