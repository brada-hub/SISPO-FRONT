<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-lg">
    <div class="max-w-[1500px] mx-auto space-y-8">

      <!-- 1. INSTITUTIONAL EXECUTIVE HERO BANNER -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#311452] via-[#4A1D75] to-[#1E1B4B] text-white p-6 sm:p-8 shadow-xl border border-purple-900/30">
        <!-- Background decorative elements -->
        <div class="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute right-32 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
        <div class="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block">
          <img src="~assets/unitepc_escudo.png" class="h-64 w-auto grayscale contrast-200" @error="(e) => e.target.style.display = 'none'" />
        </div>

        <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div class="space-y-2 max-w-3xl">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black tracking-widest uppercase text-purple-200">
                <q-icon name="stars" size="14px" class="text-amber-300" />
                UNITEPC • SISTEMA DE GESTIÓN DE TALENTO
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                En Línea
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-tight text-white m-0">
              Panel de Control & Inteligencia Operativa
            </h1>
            <p class="text-purple-200/80 text-sm sm:text-base font-normal leading-relaxed m-0">
              Monitoreo integral de convocatorias docentes y administrativas, avance de baremos de mérito y expedientes en tiempo real a nivel nacional.
            </p>
          </div>

          <!-- Quick Actions Hub -->
          <div class="flex flex-wrap items-center gap-3">
            <q-btn
              unelevated
              rounded
              color="white"
              text-color="primary"
              icon="add_circle"
              label="Nueva Convocatoria"
              to="/admin/convocatorias"
              class="font-black px-4 h-11 shadow-md hover:shadow-lg transition-all"
            />
            <q-btn
              outline
              rounded
              style="color: white; border-color: rgba(255,255,255,0.4);"
              icon="rule"
              label="Mesa de Decisión"
              to="/admin/decision-workspace"
              class="font-bold px-4 h-11 hover:bg-white/10 transition-all"
            />
            <q-btn
              flat
              round
              color="white"
              icon="refresh"
              :loading="loading"
              @click="loadStats"
              class="bg-white/10 hover:bg-white/20 transition-all"
            >
              <q-tooltip>Actualizar Datos</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- 2. HIGH-IMPACT KPI CARDS GRID -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <!-- Card 1: Total Postulaciones -->
        <div class="stat-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">Postulaciones Totales</span>
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-[#663399] flex items-center justify-center">
              <q-icon name="groups" size="22px" />
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {{ stats.kpis?.total || 0 }}
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="text-emerald-600 font-bold flex items-center gap-0.5">
                <q-icon name="trending_up" size="14px" /> {{ stats.kpis?.semana || 0 }}
              </span>
              <span>registrados esta semana</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Convocatorias Activas -->
        <div class="stat-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">Convocatorias</span>
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <q-icon name="campaign" size="22px" />
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {{ stats.kpis?.activas || 0 }} <span class="text-lg font-bold text-slate-400">/ {{ stats.kpis?.total_convocatorias || 0 }}</span>
            </div>
            <div class="text-xs font-semibold text-slate-500">
              {{ stats.kpis?.activas || 0 }} activas vigentes para postulación
            </div>
          </div>
        </div>

        <!-- Card 3: Avance Global de Evaluación -->
        <div class="stat-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">Avance de Baremos</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <q-icon name="task_alt" size="22px" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-baseline justify-between">
              <div class="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                {{ stats.kpis?.avance_evaluacion || 0 }}%
              </div>
              <span class="text-xs font-bold text-slate-500">{{ stats.kpis?.evaluadas || 0 }} de {{ stats.kpis?.total || 0 }}</span>
            </div>
            <q-linear-progress
              :value="(stats.kpis?.avance_evaluacion || 0) / 100"
              color="positive"
              track-color="emerald-100"
              rounded
              class="h-2 rounded-full"
            />
          </div>
        </div>

        <!-- Card 4: Postulantes Aptos / Habilitados -->
        <div class="stat-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">Aptos / Habilitados</span>
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <q-icon name="workspace_premium" size="22px" />
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {{ stats.kpis?.aptos || 0 }}
            </div>
            <div class="text-xs font-semibold text-slate-500">
              <span class="text-amber-700 font-bold">{{ stats.kpis?.tasa_habilitacion || 0 }}%</span> tasa de aprobación de méritos
            </div>
          </div>
        </div>

      </div>

      <!-- 3. PIPELINE DE SELECCIÓN (FUNNEL MODERNO) -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Flujo del Proceso</div>
            <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight m-0">
              Embudo de Selección y Clasificación de Candidatos
            </h2>
          </div>
          <q-btn
            flat
            no-caps
            rounded
            color="primary"
            icon-right="arrow_forward"
            label="Ver Bandeja Completa"
            to="/admin/postulaciones"
            class="font-bold text-xs"
          />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            v-for="step in (stats.funnel || [])"
            :key="step.key"
            class="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all relative overflow-hidden"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-black uppercase tracking-wider text-slate-500">{{ step.label }}</span>
              <q-icon :name="step.icon" :style="{ color: step.color }" size="18px" />
            </div>
            <div class="text-2xl font-black text-slate-900 mb-1">
              {{ step.count }}
            </div>
            <div class="text-[11px] font-bold text-slate-400">
              {{ stats.kpis?.total ? Math.round((step.count / stats.kpis.total) * 100) : 0 }}% del total
            </div>
            <!-- Bottom accent line -->
            <div class="absolute bottom-0 left-0 right-0 h-1" :style="{ backgroundColor: step.color }"></div>
          </div>
        </div>
      </div>

      <!-- 4. CHARTS SECTION (TIMELINE + SEDES) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- TIMELINE AREA CHART (7 COLS) -->
        <div class="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Tendencia Temporal</div>
              <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight m-0">
                Afluencia de Postulaciones (Últimos Días Activos)
              </h3>
            </div>
            <div class="px-2.5 py-1 rounded-lg bg-purple-50 text-[#663399] font-black text-xs">
              {{ stats.timeline?.reduce((acc, t) => acc + t.count, 0) || 0 }} Registros
            </div>
          </div>

          <div v-if="!loading && chartTimeline.series[0].data.length > 0" class="h-[320px]">
            <apexchart
              type="area"
              height="100%"
              :options="chartTimeline.options"
              :series="chartTimeline.series"
            ></apexchart>
          </div>
          <div v-else-if="loading" class="h-[320px] flex items-center justify-center">
            <q-spinner-dots color="primary" size="40px" />
          </div>
          <div v-else class="h-[320px] flex flex-col items-center justify-center text-slate-400">
            <q-icon name="show_chart" size="48px" class="opacity-40 mb-2" />
            <span class="text-sm font-semibold">Sin registros temporales recientes</span>
          </div>
        </div>

        <!-- SEDES DISTRIBUTION (5 COLS) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Cobertura Nacional</div>
              <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight m-0">
                Postulaciones por Sede
              </h3>
            </div>
            <div class="text-xs text-slate-400 font-bold uppercase">
              {{ stats.chart_sede?.length || 0 }} Sedes
            </div>
          </div>

          <div v-if="!loading && chartSede.series[0].data.length > 0" class="h-[320px]">
            <apexchart
              type="bar"
              height="100%"
              :options="chartSede.options"
              :series="chartSede.series"
            ></apexchart>
          </div>
          <div v-else-if="loading" class="h-[320px] flex items-center justify-center">
            <q-spinner-dots color="primary" size="40px" />
          </div>
          <div v-else class="h-[320px] flex flex-col items-center justify-center text-slate-400">
            <q-icon name="location_off" size="48px" class="opacity-40 mb-2" />
            <span class="text-sm font-semibold">Sin datos por sede</span>
          </div>
        </div>

      </div>

      <!-- 5. CONVOCATORIAS OPERATIVAS & TOP CARGOS SECTION -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- CONVOCATORIAS TABLE (7 COLS) -->
        <div class="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Gestión de Procesos</div>
                <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight m-0">
                  Estado de Convocatorias en Curso
                </h3>
              </div>
              <q-btn
                flat
                rounded
                no-caps
                color="primary"
                label="Ver Todas"
                to="/admin/convocatorias"
                class="font-bold text-xs"
              />
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-black border-b border-slate-100">
                  <tr>
                    <th class="px-6 py-3.5">Convocatoria</th>
                    <th class="px-6 py-3.5">Sedes</th>
                    <th class="px-6 py-3.5 text-center">Postulantes</th>
                    <th class="px-6 py-3.5">Avance Baremo</th>
                    <th class="px-6 py-3.5 text-center">Cierre</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                  <tr v-if="!stats.convocatorias_gestion || stats.convocatorias_gestion.length === 0">
                    <td colspan="5" class="px-6 py-10 text-center text-slate-400 font-semibold italic">
                      No hay convocatorias registradas en este período
                    </td>
                  </tr>
                  <tr
                    v-for="conv in (stats.convocatorias_gestion || []).slice(0, 6)"
                    :key="conv.id"
                    class="hover:bg-purple-50/30 transition-colors"
                  >
                    <td class="px-6 py-3.5">
                      <div class="font-black text-slate-900 truncate max-w-[220px]" :title="conv.titulo">
                        {{ conv.titulo }}
                      </div>
                      <div class="text-[10px] font-bold text-purple-700 tracking-wider">
                        {{ conv.codigo }}
                      </div>
                    </td>
                    <td class="px-6 py-3.5">
                      <div class="flex flex-wrap gap-1 max-w-[150px]">
                        <span
                          v-for="(sede, sIdx) in (conv.sedes || []).slice(0, 2)"
                          :key="sIdx"
                          class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase"
                        >
                          {{ sede }}
                        </span>
                        <span v-if="conv.sedes && conv.sedes.length > 2" class="text-[10px] text-slate-400 font-bold">
                          +{{ conv.sedes.length - 2 }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-3.5 text-center">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-black text-xs">
                        {{ conv.postulaciones_count }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5">
                      <div class="w-32 space-y-1">
                        <div class="flex justify-between text-[10px] font-black text-slate-600">
                          <span>{{ conv.avance_pct }}%</span>
                          <span class="text-slate-400">{{ conv.evaluadas_count }}/{{ conv.postulaciones_count }}</span>
                        </div>
                        <q-linear-progress
                          :value="conv.avance_pct / 100"
                          :color="conv.avance_pct >= 100 ? 'positive' : (conv.avance_pct > 50 ? 'primary' : 'warning')"
                          class="h-1.5 rounded-full"
                        />
                      </div>
                    </td>
                    <td class="px-6 py-3.5 text-center">
                      <span
                        v-if="conv.is_activa"
                        :class="[
                          'px-2.5 py-1 rounded-full text-xs font-black inline-block',
                          conv.is_urgente ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        ]"
                      >
                        {{ conv.fecha_cierre }}
                      </span>
                      <span v-else class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Finalizada
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="p-3 bg-slate-50/70 border-t border-slate-100 text-center">
            <span class="text-xs font-semibold text-slate-500">Mostrando las convocatorias activas y con mayor concurrencia</span>
          </div>
        </div>

        <!-- TOP CARGOS LIST (5 COLS) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Demanda de Plazas</div>
              <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight m-0">
                Top Cargos Solicitados
              </h3>
            </div>
            <div class="text-xs text-slate-400 font-bold uppercase">Ranking</div>
          </div>

          <div class="space-y-3">
            <div
              v-for="(cargo, cIdx) in (stats.chart_cargos || []).slice(0, 6)"
              :key="cIdx"
              class="p-3.5 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 transition-all flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center">
                  #{{ cIdx + 1 }}
                </div>
                <div>
                  <div class="font-black text-slate-900 text-xs sm:text-sm line-clamp-1">
                    {{ cargo.cargo || cargo.nombre }}
                  </div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase">
                    {{ cargo.sede || 'Nacional' }}
                  </div>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 text-[#663399] font-black text-xs">
                  {{ cargo.postulaciones_count }} post.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 6. BANDEJA DE ACTIVIDAD RECIENTE CON BUSCADOR EN VIVO -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Seguimiento Continuo</div>
            <h3 class="text-xl font-black text-slate-900 uppercase tracking-tight m-0">
              Actividad Reciente de Postulantes
            </h3>
          </div>

          <!-- Quick Search Filter -->
          <div class="w-full sm:w-72">
            <q-input
              v-model="searchQuery"
              dense
              outlined
              rounded
              placeholder="Buscar postulante o CI..."
              class="bg-slate-50"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="18px" color="primary" />
              </template>
              <template v-slot:append v-if="searchQuery">
                <q-icon name="close" size="16px" class="cursor-pointer" @click="searchQuery = ''" />
              </template>
            </q-input>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-black border-b border-slate-100">
              <tr>
                <th class="px-6 py-3.5">Postulante</th>
                <th class="px-6 py-3.5">Cargo Postulado</th>
                <th class="px-6 py-3.5">Sede</th>
                <th class="px-6 py-3.5 text-center">Estado</th>
                <th class="px-6 py-3.5 text-center">Puntaje Baremo</th>
                <th class="px-6 py-3.5 text-center">Fecha Registro</th>
                <th class="px-6 py-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="filteredRecientes.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-slate-400 font-semibold italic">
                  No se encontraron postulantes que coincidan con la búsqueda
                </td>
              </tr>
              <tr
                v-for="item in filteredRecientes"
                :key="item.id"
                class="hover:bg-purple-50/20 transition-all group"
              >
                <td class="px-6 py-3.5">
                  <div class="flex items-center gap-3">
                    <q-avatar size="34px" color="primary" text-color="white" font-size="13px" class="font-black shadow-sm">
                      <img v-if="item.foto" :src="getFileUrl(item.foto)" />
                      <span v-else>{{ (item.postulante || 'P').charAt(0) }}</span>
                    </q-avatar>
                    <div>
                      <div class="font-black text-slate-900">{{ item.postulante }}</div>
                      <div class="text-[11px] font-bold text-slate-400">CI: {{ item.ci || '---' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-3.5">
                  <div class="font-bold text-slate-800 text-xs sm:text-sm">{{ item.cargo }}</div>
                  <div class="text-[10px] text-slate-400 line-clamp-1">{{ item.convocatoria }}</div>
                </td>
                <td class="px-6 py-3.5">
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                    {{ item.sede }}
                  </span>
                </td>
                <td class="px-6 py-3.5 text-center">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-block',
                      getStatusClass(item.estado)
                    ]"
                  >
                    {{ formatStatusLabel(item.estado) }}
                  </span>
                </td>
                <td class="px-6 py-3.5 text-center">
                  <span v-if="item.puntuacion !== null" class="font-black text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg text-xs">
                    {{ item.puntuacion }} pts.
                  </span>
                  <span v-else class="text-slate-300 text-xs font-semibold">---</span>
                </td>
                <td class="px-6 py-3.5 text-center">
                  <div class="text-xs font-bold text-slate-700">{{ item.fecha }}</div>
                  <div class="text-[10px] text-slate-400">{{ item.fecha_exacta }}</div>
                </td>
                <td class="px-6 py-3.5 text-center">
                  <q-btn
                    unelevated
                    rounded
                    size="sm"
                    color="primary"
                    icon="visibility"
                    label="Expediente"
                    :to="`/admin/expediente/${item.id}`"
                    class="font-black px-3"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { api } from 'boot/axios'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const loading = ref(true)
const searchQuery = ref('')
const stats = ref({
  kpis: {
    total: 0,
    activas: 0,
    total_convocatorias: 0,
    hoy: 0,
    semana: 0,
    pendientes: 0,
    evaluadas: 0,
    avance_evaluacion: 0,
    aptos: 0,
    tasa_habilitacion: 0
  },
  funnel: [],
  timeline: [],
  chart_sede: [],
  chart_cargos: [],
  convocatorias_gestion: [],
  cierres_criticos: [],
  recientes: []
})

// TIMELINE AREA CHART OPTIONS
const chartTimeline = reactive({
  series: [{ name: 'Nuevas Postulaciones', data: [] }],
  options: {
    chart: {
      type: 'area',
      height: '100%',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#663399'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      type: 'category',
      categories: [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748B', fontWeight: 600, fontSize: '11px' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#94A3B8', fontWeight: 600 },
        formatter: (val) => Math.floor(val)
      }
    },
    grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
    tooltip: { theme: 'dark' }
  }
})

// SEDES BAR CHART OPTIONS
const chartSede = reactive({
  series: [{ name: 'Postulantes', data: [] }],
  options: {
    chart: { toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    colors: ['#4F46E5'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '45%',
        distributed: false
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      type: 'category',
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -35,
        style: { colors: '#64748B', fontSize: '10px', fontWeight: 700 }
      }
    },
    yaxis: { labels: { style: { colors: '#94A3B8' } } },
    grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
    tooltip: { theme: 'dark' }
  }
})

const getFileUrl = (path) => {
  if (!path) return ''
  const baseUrl = api.defaults.baseURL.replace(/\/api$/, '')
  return `${baseUrl}/storage/${path}`
}

const loadStats = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/dashboard/stats')
    if (data.success) {
      stats.value = data

      // Update Timeline Chart
      if (data.timeline && data.timeline.length > 0) {
        chartTimeline.series = [{
          name: 'Nuevas Postulaciones',
          data: data.timeline.map(t => t.count)
        }]
        chartTimeline.options = {
          ...chartTimeline.options,
          xaxis: {
            ...chartTimeline.options.xaxis,
            categories: data.timeline.map(t => t.fecha)
          }
        }
      }

      // Update Sede Chart
      if (data.chart_sede && data.chart_sede.length > 0) {
        chartSede.series = [{
          name: 'Postulantes',
          data: data.chart_sede.map(s => ({ x: s.nombre, y: s.postulaciones_count }))
        }]
      }
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err)
  } finally {
    loading.value = false
  }
}

const filteredRecientes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return stats.value.recientes || []

  return (stats.value.recientes || []).filter(item => {
    return (
      item.postulante?.toLowerCase().includes(query) ||
      item.ci?.toLowerCase().includes(query) ||
      item.cargo?.toLowerCase().includes(query) ||
      item.sede?.toLowerCase().includes(query)
    )
  })
})

const getStatusClass = (estado) => {
  switch (estado) {
    case 'enviada':
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    case 'en_revision':
      return 'bg-purple-50 text-purple-700 border border-purple-200'
    case 'habilitado':
    case 'apto':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    case 'seleccionado':
      return 'bg-teal-50 text-teal-800 border border-teal-300 font-extrabold'
    case 'rechazada':
    case 'no_apto':
      return 'bg-rose-50 text-rose-700 border border-rose-200'
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
}

const formatStatusLabel = (estado) => {
  switch (estado) {
    case 'enviada': return 'Por Evaluar'
    case 'en_revision': return 'En Revisión'
    case 'habilitado': return 'Habilitado'
    case 'seleccionado': return 'Seleccionado'
    case 'rechazada': return 'No Habilitado'
    case 'observada': return 'Observado'
    case 'pendiente_archivos': return 'Pendiente'
    default: return estado || 'Recibido'
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

h1, h2, h3, p, div, span, table {
  font-family: 'Inter', sans-serif;
}

.stat-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
}
</style>
