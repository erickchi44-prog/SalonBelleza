<template>
  <div class="space-y-lg">
    <div class="flex items-center justify-between">
      <h2 class="font-headline-md text-xl text-on-surface flex items-center gap-sm">
        <i class="pi pi-chart-bar text-primary"></i> AI Analytics & Insights
      </h2>
      <div class="flex items-center gap-sm bg-primary/10 border border-primary/20 px-md py-xs">
        <i class="pi pi-sparkles text-primary text-sm"></i>
        <span class="font-label-sm text-xs text-primary font-semibold">AI Assistant activo</span>
      </div>
    </div>

    <!-- AI Summary Card -->
    <div class="bg-gradient-to-r from-primary/10 to-surface-container border border-primary/20 p-lg shadow-sm">
      <div class="flex items-start gap-md">
        <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <i class="pi pi-sparkles text-primary"></i>
        </div>
        <div class="space-y-xs">
          <p class="font-headline-md text-sm text-primary font-semibold uppercase tracking-widest">Resumen Inteligente — Junio 2026</p>
          <p class="font-body-md text-sm text-on-surface">
            Los ingresos del mes son <strong class="text-primary">$18,420</strong>, un <strong class="text-green-600">+8%</strong> respecto al mes anterior.
            El servicio más solicitado fue <strong class="text-primary">Balayage Premium</strong>. Los martes y viernes concentran el <strong class="text-primary">62%</strong> de las citas.
            Se recomienda abrir disponibilidad adicional los <strong class="text-primary">miércoles</strong> con Elena Vargas para satisfacer la demanda reprimida.
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
      <div v-for="stat in stats" :key="stat.label" class="bg-surface border border-outline-variant/30 p-md shadow-sm">
        <div class="flex items-center justify-between mb-sm">
          <span class="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">{{ stat.label }}</span>
          <i :class="[stat.icon, 'text-primary text-sm']"></i>
        </div>
        <p class="font-display-lg text-2xl font-bold text-on-surface">{{ stat.value }}</p>
        <div class="mt-sm h-1 bg-surface-container-high">
          <div class="h-1 bg-primary transition-all duration-1000" :style="`width: ${stat.progress}%`"></div>
        </div>
      </div>
    </div>

    <!-- Service Performance + Top Specialists -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">
      <!-- Service Performance -->
      <div class="bg-surface border border-outline-variant/30 p-md shadow-sm space-y-sm">
        <h3 class="font-headline-md text-base text-on-surface mb-md flex items-center gap-sm">
          <i class="pi pi-list text-primary text-sm"></i> Rendimiento por Servicio
        </h3>
        <div v-for="svc in servicePerf" :key="svc.name" class="flex items-center gap-md">
          <span class="font-label-sm text-xs text-on-surface-variant w-36 truncate">{{ svc.name }}</span>
          <div class="flex-1 bg-surface-container-high h-2">
            <div class="bg-primary h-2 transition-all duration-700" :style="`width: ${svc.pct}%`"></div>
          </div>
          <span class="font-label-md text-xs font-semibold text-on-surface w-10 text-right">{{ svc.bookings }}</span>
        </div>
      </div>

      <!-- Top Specialists -->
      <div class="bg-surface border border-outline-variant/30 p-md shadow-sm space-y-sm">
        <h3 class="font-headline-md text-base text-on-surface mb-md flex items-center gap-sm">
          <i class="pi pi-crown text-primary text-sm"></i> Top Especialistas
        </h3>
        <div v-for="(spec, idx) in topSpecialists" :key="spec.name" class="flex items-center gap-md py-sm border-b border-outline-variant/10 last:border-0">
          <span class="font-display-lg text-xl font-bold w-6 text-center" :class="idx === 0 ? 'text-primary' : 'text-on-surface-variant/40'">{{ idx + 1 }}</span>
          <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{{ spec.name.charAt(0) }}</div>
          <div class="flex-1 min-w-0">
            <p class="font-label-md text-sm font-semibold text-on-surface truncate">{{ spec.name }}</p>
            <p class="text-[10px] text-on-surface-variant">{{ spec.specialty }}</p>
          </div>
          <div class="text-right">
            <p class="font-label-md text-sm font-bold text-primary">{{ spec.bookings }}</p>
            <p class="text-[10px] text-on-surface-variant">citas</p>
          </div>
          <app-rating :modelValue="spec.rating" :readonly="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import AppRating from '../../components/atoms/AppRating.vue';

const stats = ref([
  { label: 'Ingresos del Mes', value: '$0', icon: 'pi pi-dollar', progress: 0 },
  { label: 'Citas Completadas', value: '0', icon: 'pi pi-calendar-check', progress: 0 },
  { label: 'Tasa de Cancelación', value: '0%', icon: 'pi pi-times-circle', progress: 0 },
  { label: 'Satisfacción Promedio', value: '0.0 ★', icon: 'pi pi-star-fill', progress: 0 }
]);

const servicePerf = ref([]);
const topSpecialists = ref([]);

onMounted(async () => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const { count: completedCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Completada');

  const { count: cancelledCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Cancelada');

  const { count: totalCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  const { data: feedbackData } = await supabase
    .from('feedback')
    .select('rating');

  const avgRating = feedbackData?.length
    ? (feedbackData.reduce((s, f) => s + f.rating, 0) / feedbackData.length).toFixed(1)
    : '0.0';

  const cancelRate = totalCount ? ((cancelledCount || 0) / totalCount * 100).toFixed(1) : '0';
  const csat = totalCount ? Math.round(((completedCount || 0) / totalCount) * 100) : 0;

  stats.value = [
    { label: 'Citas Completadas', value: String(completedCount || 0), icon: 'pi pi-calendar-check', progress: csat },
    { label: 'Tasa de Cancelación', value: `${cancelRate}%`, icon: 'pi pi-times-circle', progress: Math.min(Number(cancelRate) * 10, 100) },
    { label: 'Satisfacción Promedio', value: `${avgRating} ★`, icon: 'pi pi-star-fill', progress: Math.round(Number(avgRating) * 20) },
    { label: 'Ingresos del Mes', value: '$0', icon: 'pi pi-dollar', progress: 0 }
  ];

  const { data: svcData } = await supabase
    .from('appointments')
    .select('services(title)');

  const svcCount = {};
  (svcData || []).forEach(a => {
    const name = a.services?.title || 'Otro';
    svcCount[name] = (svcCount[name] || 0) + 1;
  });

  const maxSvc = Math.max(...Object.values(svcCount), 1);
  servicePerf.value = Object.entries(svcCount)
    .map(([name, bookings]) => ({ name, bookings, pct: Math.round((bookings / maxSvc) * 100) }))
    .sort((a, b) => b.bookings - a.bookings);

  const { data: specs } = await supabase
    .from('specialists')
    .select('name, specialty, appointments, rating')
    .order('appointments', { ascending: false })
    .limit(4);

  topSpecialists.value = (specs || []).map(s => ({
    name: s.name,
    specialty: s.specialty,
    bookings: s.appointments,
    rating: Math.round(s.rating)
  }));
});
</script>
