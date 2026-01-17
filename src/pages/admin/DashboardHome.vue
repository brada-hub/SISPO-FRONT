<template>
  <q-page class="bg-gray-50 q-pa-lg">
    <div class="max-w-[1400px] mx-auto">
      <!-- HEADER -->
      <div class="row items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Panel de Control</h1>
          <p class="text-gray-500 text-lg">Resumen general del Sistema de Convocatorias (SISPO)</p>
        </div>
        <q-btn
          color="primary"
          icon="refresh"
          label="Actualizar Datos"
          @click="loadStats"
          :loading="loading"
          rounded
          unelevated
          class="px-6 h-12 shadow-sm hover:shadow-md transition-all"
        />
      </div>

      <!-- KPI CARDS -->
      <div class="row q-col-gutter-lg mb-10">
        <!-- TOTAL POSTULACIONES -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card p-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden h-full">
            <div class="icon-box bg-purple-50 text-purple-600 rounded-xl p-4">
              <q-icon name="people" size="32px" />
            </div>
            <div>
              <div class="text-gray-500 font-medium mb-1">Postulaciones</div>
              <div class="text-3xl font-bold text-gray-900">{{ stats.kpis.total }}</div>
            </div>
            <div class="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <q-icon name="people" size="100px" />
            </div>
          </div>
        </div>

        <!-- CONVOCATORIAS ACTIVAS -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card p-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden h-full">
            <div class="icon-box bg-blue-50 text-blue-600 rounded-xl p-4">
              <q-icon name="campaign" size="32px" />
            </div>
            <div>
              <div class="text-gray-500 font-medium mb-1">Activas</div>
              <div class="text-3xl font-bold text-gray-900">{{ stats.kpis.activas }}</div>
            </div>
            <div class="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <q-icon name="campaign" size="100px" />
            </div>
          </div>
        </div>

        <!-- POSTULACIONES HOY -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card p-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden h-full">
            <div class="icon-box bg-emerald-50 text-emerald-600 rounded-xl p-4">
              <q-icon name="trending_up" size="32px" />
            </div>
            <div>
              <div class="text-gray-500 font-medium mb-1">Nuevos Hoy</div>
              <div class="text-3xl font-bold text-gray-900">{{ stats.kpis.hoy }}</div>
            </div>
            <div class="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <q-icon name="trending_up" size="100px" />
            </div>
          </div>
        </div>

        <!-- POR REVISAR -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card p-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden h-full">
            <div class="icon-box bg-orange-50 text-orange-600 rounded-xl p-4">
              <q-icon name="pending_actions" size="32px" />
            </div>
            <div>
              <div class="text-gray-500 font-medium mb-1">Por Revisar</div>
              <div class="text-3xl font-bold text-gray-900">{{ stats.kpis.pendientes }}</div>
            </div>
            <div class="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <q-icon name="pending_actions" size="100px" />
            </div>
          </div>
        </div>
      </div>

      <!-- CHARTS SECTION -->
      <div class="row q-col-gutter-lg mb-10">
        <!-- DISTRIBUCIÓN POR SEDE -->
        <div class="col-12 col-lg-7">
          <q-card flat bordered class="rounded-2xl h-full p-2">
            <q-card-section>
              <div class="flex items-center justify-between mb-4">
                <div class="text-lg font-bold text-gray-800">Postulantes por Sede</div>
                <div class="text-xs text-gray-400 font-medium uppercase tracking-wider">Procesos Activos</div>
              </div>
              <div v-if="!loading" class="h-[350px]">
                <apexchart type="bar" height="100%" :options="chartSede.options" :series="chartSede.series"></apexchart>
              </div>
              <div v-else class="h-[350px] flex items-center justify-center">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- PORCENTAJE POR CARGO -->
        <div class="col-12 col-lg-5">
          <q-card flat bordered class="rounded-2xl h-full p-2">
            <q-card-section>
              <div class="flex items-center justify-between mb-4">
                <div class="text-lg font-bold text-gray-800">Cargos Postulados</div>
                <div class="text-xs text-gray-400 font-medium uppercase tracking-wider">En Convocatorias</div>
              </div>
              <div v-if="!loading" class="h-[350px]">
                <apexchart type="bar" height="100%" :options="chartCargo.options" :series="chartCargo.series"></apexchart>
              </div>
              <div v-else class="h-[350px] flex items-center justify-center">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- TABLES SECTION -->
      <div class="row q-col-gutter-lg">
        <!-- CRITICAL CONVOCATORIAS -->
        <div class="col-12 col-md-5">
          <q-card flat bordered class="rounded-2xl h-full overflow-hidden">
            <q-card-section class="bg-primary text-white py-4">
              <div class="flex items-center gap-2">
                <q-icon name="timer" size="24px" />
                <div class="text-lg font-bold">Cierres Próximos (7 días)</div>
              </div>
            </q-card-section>

            <q-list separator>
              <q-item v-if="stats.cierres_criticos.length === 0" class="py-8">
                <q-item-section class="text-center text-gray-400 italic">No hay cierres críticos próximos</q-item-section>
              </q-item>

              <q-item v-for="conc in stats.cierres_criticos" :key="conc.id" class="py-4 hover:bg-gray-50 transition-colors">
                <q-item-section>
                  <q-item-label class="font-bold text-gray-800">{{ conc.titulo }}</q-item-label>
                  <q-item-label caption>En {{ getDaysRemaining(conc.fecha_cierre) }} días</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="getBadgeColor(conc.fecha_cierre)" rounded class="px-3 py-1 font-bold">
                    {{ formatDate(conc.fecha_cierre) }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>

            <q-card-actions align="center" class="py-3 bg-gray-50">
              <q-btn flat color="primary" label="Ver todas" to="/admin/convocatorias" no-caps class="font-bold" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- RECENT ACTIVITY -->
        <div class="col-12 col-md-7">
          <q-card flat bordered class="rounded-2xl h-full overflow-hidden">
            <q-card-section class="py-5 px-6 border-b border-gray-100 flex items-center justify-between">
              <div class="text-lg font-bold text-gray-800">Actividad Reciente</div>
              <q-btn flat round dense icon="more_horiz" color="gray-400" />
            </q-card-section>

            <table class="w-full text-left">
              <thead class="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                <tr>
                  <th class="px-6 py-4">Postulante</th>
                  <th class="px-6 py-4">Cargo / Sede</th>
                  <th class="px-6 py-4">Fecha</th>
                  <th class="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="stats.recientes.length === 0">
                   <td colspan="4" class="px-6 py-12 text-center text-gray-400 italic">No hay actividad reciente</td>
                </tr>
                <tr v-for="item in stats.recientes" :key="item.id" class="hover:bg-gray-50 group transition-all">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {{ item.postulante.nombres[0] }}
                      </div>
                      <div class="font-bold text-gray-800">{{ item.postulante.nombres }} {{ item.postulante.apellidos }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ item.oferta.cargo.nombre }}</div>
                    <div class="text-[10px] text-gray-500 uppercase font-bold">{{ item.oferta.sede.nombre }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600">{{ formatDateTime(item.created_at) }}</div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="visibility"
                      :to="`/admin/expediente/${item.id}`"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <q-tooltip>Ver Expediente</q-tooltip>
                    </q-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { api } from 'boot/axios'
import VueApexCharts from 'vue3-apexcharts'

// ApexCharts component
const apexchart = VueApexCharts

const loading = ref(true)
const stats = ref({
  kpis: { total: 0, activas: 0, hoy: 0, pendientes: 0 },
  chart_sede: [],
  chart_cargos: [],
  cierres_criticos: [],
  recientes: []
})

const chartSede = reactive({
  series: [{ name: 'Postulantes', data: [] }],
  options: {
    chart: { toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    colors: ['#663399'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '40%',
        distributed: false
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      type: 'category',
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { labels: { style: { colors: '#9CA3AF' } } },
    grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
    tooltip: { theme: 'dark' }
  }
})

const chartCargo = reactive({
  series: [{ data: [] }],
  options: {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: '50%',
        distributed: true,
      }
    },
    colors: ['#3B82F6', '#663399', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4', '#F97316', '#64748B'],
    xaxis: {
      type: 'category',
      labels: {
        show: true,
        style: { colors: '#9CA3AF' },
        formatter: (val) => Math.floor(val)
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        maxWidth: 220,
        style: {
          fontWeight: 600,
          fontSize: '11px',
          colors: '#374151'
        }
      }
    },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 5,
      style: {
        colors: ['#374151'],
        fontSize: '13px',
        fontWeight: 800
      }
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } }
    },
    tooltip: { theme: 'dark' }
  }
})

const loadStats = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/dashboard/stats')
    if (data.success) {
      stats.value = data

      // Update Sede Chart
      chartSede.series = [{
        name: 'Postulantes',
        data: data.chart_sede.map(s => ({ x: s.nombre, y: s.postulaciones_count }))
      }]

      // Update Cargo Chart
      chartCargo.series = [{
        name: 'Postulantes',
        data: data.chart_cargos.map(c => ({ x: c.nombre, y: c.postulaciones_count }))
      }]
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '---'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '---'
  const date = new Date(dateStr)
  return date.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const getDaysRemaining = (dateStr) => {
  const diffTime = new Date(dateStr) - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

const getBadgeColor = (dateStr) => {
  const days = getDaysRemaining(dateStr)
  if (days <= 2) return 'red'
  if (days <= 5) return 'orange'
  return 'blue'
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

h1, p, div, span, table {
  font-family: 'Inter', sans-serif;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.icon-box {
  transition: transform 0.3s ease;
}

.stat-card:hover .icon-box {
  transform: scale(1.1);
}
</style>
