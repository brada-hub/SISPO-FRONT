<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-lg">
    <div class="max-w-[1500px] mx-auto space-y-6">

      <!-- 1. INSTITUTIONAL EXECUTIVE HERO BANNER -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2A0E47] via-[#43196B] to-[#1E1B4B] text-white p-6 sm:p-8 shadow-xl border border-purple-900/30">
        <!-- Background decorative elements -->
        <div class="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>
        <div class="absolute right-32 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none"></div>
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
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                En Tiempo Real
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-tight text-white m-0">
              Panel de Control & Inteligencia Operativa
            </h1>
            <p class="text-purple-200/80 text-sm sm:text-base font-normal leading-relaxed m-0">
              Centro de monitoreo dinámico: filtra por sede, convocatoria o período, interactúa con el embudo de selección e inspecciona postulantes al instante.
            </p>
          </div>

          <!-- Quick Actions Hub -->
          <div class="flex flex-wrap items-center gap-2.5">
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
              icon="people_alt"
              label="Ver Postulaciones"
              to="/admin/postulaciones"
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
              <q-tooltip>Sincronizar Datos</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- 2. DYNAMIC CONTROL BAR (INTERACTIVE CROSS-FILTERS) -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all">
        <div class="flex flex-wrap items-center gap-3 flex-1">
          <!-- Icon Tag -->
          <div class="flex items-center gap-2 pr-2 text-slate-700 font-black text-xs uppercase tracking-wider hidden sm:flex">
            <q-icon name="tune" size="18px" color="primary" />
            <span>Filtros Dinámicos:</span>
          </div>

          <!-- Sede Selector -->
          <div class="min-w-[170px] flex-1 sm:flex-initial">
            <q-select
              v-model="selectedSede"
              :options="sedeOptions"
              dense
              outlined
              rounded
              emit-value
              map-options
              clearable
              placeholder="Todas las Sedes"
              class="bg-slate-50 text-xs font-semibold"
              @update:model-value="onFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" size="16px" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Convocatoria Selector -->
          <div class="min-w-[210px] flex-1 sm:flex-initial">
            <q-select
              v-model="selectedConvocatoria"
              :options="convocatoriaOptions"
              dense
              outlined
              rounded
              emit-value
              map-options
              clearable
              placeholder="Todas las Convocatorias"
              class="bg-slate-50 text-xs font-semibold"
              @update:model-value="onFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="campaign" size="16px" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Period Toggle -->
          <div class="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              v-for="p in periodOptions"
              :key="p.value"
              type="button"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                selectedPeriodo === p.value
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              ]"
              @click="setPeriodo(p.value)"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Reset Button and Active Filter Badge -->
        <div class="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <div v-if="hasActiveFilters" class="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl">
            <q-icon name="filter_alt" size="14px" />
            <span>{{ activeFiltersCount }} filtro(s) activo(s)</span>
          </div>

          <q-btn
            v-if="hasActiveFilters"
            flat
            dense
            rounded
            no-caps
            color="negative"
            icon="restart_alt"
            label="Limpiar Filtros"
            @click="resetFilters"
            class="text-xs font-bold px-2"
          />
        </div>
      </div>

      <!-- 3. HIGH-IMPACT KPI CARDS GRID -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <!-- Card 1: Total Postulaciones -->
        <div class="stat-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">Postulaciones</span>
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
              <span>registradas esta semana</span>
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
              {{ stats.kpis?.activas || 0 }} vigentes para postulación
            </div>
          </div>
        </div>

        <!-- Card 3: Avance Global de Evaluación -->
        <div class="stat-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">Avance Baremo</span>
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

      <!-- 4. PIPELINE INTERACTIVO DE SELECCIÓN (CLIQUEABLE CON CROSS-FILTER) -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-widest text-[#663399]">Pipeline Dinámico</span>
              <span class="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Haz clic en una etapa para filtrar la tabla
              </span>
            </div>
            <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight m-0">
              Embudo de Selección y Clasificación de Candidatos
            </h2>
          </div>
          <div class="flex items-center gap-2">
            <q-btn
              v-if="selectedFunnelStage"
              flat
              dense
              rounded
              no-caps
              color="negative"
              icon="clear"
              label="Quitar Filtro de Etapa"
              @click="toggleFunnelStage(null)"
              class="text-xs font-bold"
            />
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
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            v-for="step in (stats.funnel || [])"
            :key="step.key"
            :class="[
              'p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer select-none',
              selectedFunnelStage === step.key
                ? 'bg-purple-50/80 border-purple-600 shadow-md ring-2 ring-purple-500/20'
                : 'border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-sm'
            ]"
            @click="toggleFunnelStage(step.key)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-black uppercase tracking-wider text-slate-600">{{ step.label }}</span>
              <q-icon :name="step.icon" :style="{ color: step.color }" size="18px" />
            </div>
            <div class="text-2xl font-black text-slate-900 mb-1 flex items-baseline justify-between">
              <span>{{ step.count }}</span>
              <span v-if="selectedFunnelStage === step.key" class="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                Activo
              </span>
            </div>
            <div class="text-[11px] font-bold text-slate-400">
              {{ stats.kpis?.total ? Math.round((step.count / stats.kpis.total) * 100) : 0 }}% del total
            </div>
            <!-- Bottom accent line -->
            <div class="absolute bottom-0 left-0 right-0 h-1.5" :style="{ backgroundColor: step.color }"></div>
          </div>
        </div>
      </div>

      <!-- 5. CHARTS SECTION (TIMELINE + SEDES CON TOGGLE DE VISTA) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- TIMELINE AREA CHART (7 COLS) -->
        <div class="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Tendencia Temporal</div>
              <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight m-0">
                Afluencia de Postulaciones
              </h3>
            </div>
            <div class="flex items-center gap-2">
              <!-- View mode toggle: Diario vs Acumulado -->
              <div class="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
                <button
                  type="button"
                  :class="[
                    'px-2.5 py-1 rounded-lg transition-all',
                    timelineViewMode === 'daily' ? 'bg-white text-purple-900 shadow-sm font-black' : 'text-slate-500'
                  ]"
                  @click="setTimelineViewMode('daily')"
                >
                  Diario
                </button>
                <button
                  type="button"
                  :class="[
                    'px-2.5 py-1 rounded-lg transition-all',
                    timelineViewMode === 'cumulative' ? 'bg-white text-purple-900 shadow-sm font-black' : 'text-slate-500'
                  ]"
                  @click="setTimelineViewMode('cumulative')"
                >
                  Acumulado
                </button>
              </div>
              <div class="px-2.5 py-1 rounded-lg bg-purple-50 text-[#663399] font-black text-xs hidden sm:block">
                {{ stats.timeline?.reduce((acc, t) => acc + t.count, 0) || 0 }} Registros
              </div>
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
            <span class="text-sm font-semibold">Sin registros temporales en este período</span>
          </div>
        </div>

        <!-- SEDES DISTRIBUTION (5 COLS CON TOGGLE DE TIPO DE GRÁFICO) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Distribución Geográfica</div>
              <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight m-0">
                Postulaciones por Sede
              </h3>
            </div>
            <!-- Chart type toggle: Bar vs Donut -->
            <div class="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                type="button"
                :class="[
                  'px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all',
                  sedeChartType === 'bar' ? 'bg-white text-purple-900 shadow-sm font-black' : 'text-slate-500'
                ]"
                @click="setSedeChartType('bar')"
              >
                <q-icon name="bar_chart" size="14px" />
                <span>Barras</span>
              </button>
              <button
                type="button"
                :class="[
                  'px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all',
                  sedeChartType === 'donut' ? 'bg-white text-purple-900 shadow-sm font-black' : 'text-slate-500'
                ]"
                @click="setSedeChartType('donut')"
              >
                <q-icon name="donut_small" size="14px" />
                <span>Torta</span>
              </button>
            </div>
          </div>

          <div v-if="!loading && stats.chart_sede && stats.chart_sede.length > 0" class="h-[320px]">
            <apexchart
              v-if="sedeChartType === 'bar'"
              type="bar"
              height="100%"
              :options="chartSedeBar.options"
              :series="chartSedeBar.series"
            ></apexchart>
            <apexchart
              v-else
              type="donut"
              height="100%"
              :options="chartSedeDonut.options"
              :series="chartSedeDonut.series"
            ></apexchart>
          </div>
          <div v-else-if="loading" class="h-[320px] flex items-center justify-center">
            <q-spinner-dots color="primary" size="40px" />
          </div>
          <div v-else class="h-[320px] flex flex-col items-center justify-center text-slate-400">
            <q-icon name="location_off" size="48px" class="opacity-40 mb-2" />
            <span class="text-sm font-semibold">Sin datos por sede para los filtros activos</span>
          </div>
        </div>

      </div>

      <!-- 6. CONVOCATORIAS EN CURSO (CON TABS INTERACTIVOS Y BÚSQUEDA) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- CONVOCATORIAS TABLE (7 COLS) -->
        <div class="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="text-xs font-black uppercase tracking-widest text-[#663399]">Gestión de Procesos</div>
                <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight m-0">
                  Estado de Convocatorias
                </h3>
              </div>
              <!-- Tab Filter: Todas / Vigentes / Urgentes / Concluidas -->
              <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  :class="[
                    'px-2.5 py-1 rounded-lg transition-all',
                    convocatoriaTab === 'todas' ? 'bg-white text-purple-900 shadow-sm font-black' : 'text-slate-500'
                  ]"
                  @click="convocatoriaTab = 'todas'"
                >
                  Todas ({{ stats.convocatorias_gestion?.length || 0 }})
                </button>
                <button
                  type="button"
                  :class="[
                    'px-2.5 py-1 rounded-lg transition-all',
                    convocatoriaTab === 'activas' ? 'bg-white text-purple-900 shadow-sm font-black' : 'text-slate-500'
                  ]"
                  @click="convocatoriaTab = 'activas'"
                >
                  Vigentes ({{ countConvocatoriasActivas }})
                </button>
                <button
                  type="button"
                  :class="[
                    'px-2.5 py-1 rounded-lg transition-all',
                    convocatoriaTab === 'urgentes' ? 'bg-white text-amber-900 shadow-sm font-black' : 'text-slate-500'
                  ]"
                  @click="convocatoriaTab = 'urgentes'"
                >
                  Por Vencer ({{ countConvocatoriasUrgentes }})
                </button>
              </div>
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
                  <tr v-if="filteredConvocatorias.length === 0">
                    <td colspan="5" class="px-6 py-10 text-center text-slate-400 font-semibold italic">
                      No hay convocatorias en esta categoría
                    </td>
                  </tr>
                  <tr
                    v-for="conv in filteredConvocatorias.slice(0, 6)"
                    :key="conv.id"
                    class="hover:bg-purple-50/30 transition-colors cursor-pointer"
                    @click="filtrarPorConvocatoria(conv.id)"
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
          <div class="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold px-6">
            <span>Haz clic en una fila para filtrar el dashboard por esa convocatoria</span>
            <q-btn flat dense no-caps color="primary" label="Gestionar Todas" to="/admin/convocatorias" class="font-bold" />
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

      <!-- 7. BANDEJA DINÁMICA DE ACTIVIDAD RECIENTE (CON CROSS-FILTERING & QUICK PEEK) -->
      <div id="seccion-actividad" class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-widest text-[#663399]">Seguimiento Continuo</span>
              <span v-if="selectedFunnelStage" class="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                Etapa: {{ formatStatusLabel(selectedFunnelStage) }}
                <q-icon name="close" size="14px" class="cursor-pointer" @click="toggleFunnelStage(null)" />
              </span>
            </div>
            <h3 class="text-xl font-black text-slate-900 uppercase tracking-tight m-0">
              Actividad Reciente de Postulantes
            </h3>
          </div>

          <!-- Quick Search Filter -->
          <div class="w-full sm:w-80 flex items-center gap-2">
            <q-input
              v-model="searchQuery"
              dense
              outlined
              rounded
              placeholder="Buscar por postulante, CI o cargo..."
              class="bg-slate-50 flex-1"
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
                <th class="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="filteredRecientes.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-slate-400 font-semibold italic">
                  <div class="flex flex-col items-center justify-center space-y-2">
                    <q-icon name="person_search" size="40px" class="text-slate-300" />
                    <span>No se encontraron postulantes que coincidan con los filtros actuales</span>
                    <q-btn
                      v-if="hasActiveFilters || selectedFunnelStage || searchQuery"
                      flat
                      rounded
                      size="sm"
                      color="primary"
                      label="Restablecer Filtros"
                      @click="resetFilters"
                      class="font-bold mt-2"
                    />
                  </div>
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
                      <div class="font-black text-slate-900 hover:text-[#663399] cursor-pointer" @click="openQuickPeek(item)">
                        {{ item.postulante }}
                      </div>
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
                  <div class="flex items-center justify-center gap-1.5">
                    <q-btn
                      flat
                      round
                      size="sm"
                      color="purple-9"
                      icon="preview"
                      @click="openQuickPeek(item)"
                    >
                      <q-tooltip>Vista Rápida</q-tooltip>
                    </q-btn>
                    <q-btn
                      unelevated
                      rounded
                      size="sm"
                      color="primary"
                      icon="description"
                      label="Expediente"
                      :to="`/admin/expediente/${item.id}`"
                      class="font-black px-2.5"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8. QUICK PEEK MODAL (VISTA RÁPIDA DE POSTULANTE) -->
      <q-dialog v-model="quickPeekOpen">
        <q-card style="min-width: 360px; max-width: 520px; border-radius: 24px;" class="overflow-hidden shadow-2xl">
          <!-- Header with gradient -->
          <div class="bg-gradient-to-r from-[#2A0E47] to-[#43196B] p-6 text-white relative">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <q-avatar size="60px" color="white" text-color="primary" class="font-black text-xl shadow-lg border-2 border-white/20">
                  <img v-if="peekCandidate?.foto" :src="getFileUrl(peekCandidate.foto)" />
                  <span v-else>{{ (peekCandidate?.postulante || 'P').charAt(0) }}</span>
                </q-avatar>
                <div>
                  <h4 class="text-lg font-black m-0 leading-snug">{{ peekCandidate?.postulante }}</h4>
                  <div class="text-xs text-purple-200/90 font-semibold mt-0.5">CI: {{ peekCandidate?.ci || 'Sin documento' }}</div>
                  <div class="mt-2">
                    <span :class="['px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider', getStatusClass(peekCandidate?.estado)]">
                      {{ formatStatusLabel(peekCandidate?.estado) }}
                    </span>
                  </div>
                </div>
              </div>
              <q-btn flat round dense icon="close" color="white" v-close-popup />
            </div>
          </div>

          <!-- Body details -->
          <q-card-section class="q-pa-md space-y-3">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400 font-bold uppercase">Cargo Postulado:</span>
                <span class="font-black text-slate-800">{{ peekCandidate?.cargo }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400 font-bold uppercase">Convocatoria:</span>
                <span class="font-black text-slate-800 truncate max-w-[200px]" :title="peekCandidate?.convocatoria">
                  {{ peekCandidate?.convocatoria }}
                </span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400 font-bold uppercase">Sede:</span>
                <span class="font-black text-purple-900 bg-purple-50 px-2 py-0.5 rounded">{{ peekCandidate?.sede }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400 font-bold uppercase">Fecha de Registro:</span>
                <span class="font-bold text-slate-600">{{ peekCandidate?.fecha_exacta || peekCandidate?.fecha }}</span>
              </div>
            </div>

            <!-- Score highlight -->
            <div class="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-between">
              <div>
                <div class="text-[11px] font-black uppercase text-purple-900 tracking-wider">Calificación Baremo</div>
                <div class="text-xs text-slate-500 font-medium">Evaluación curricular y de méritos</div>
              </div>
              <div class="text-2xl font-black text-purple-900">
                {{ peekCandidate?.puntuacion !== null ? `${peekCandidate?.puntuacion} pts.` : 'Pendiente' }}
              </div>
            </div>
          </q-card-section>

          <!-- Actions -->
          <q-card-section class="q-pa-md pt-0 flex gap-2">
            <q-btn
              unelevated
              rounded
              color="primary"
              icon="open_in_new"
              label="Ver Expediente Completo"
              :to="`/admin/expediente/${peekCandidate?.id}`"
              class="flex-1 font-black py-2.5"
            />
            <q-btn
              flat
              rounded
              color="grey-7"
              label="Cerrar"
              v-close-popup
              class="font-bold"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

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
const selectedSede = ref(null)
const selectedConvocatoria = ref(null)
const selectedPeriodo = ref('all')
const selectedFunnelStage = ref(null)
const convocatoriaTab = ref('todas')
const timelineViewMode = ref('daily')
const sedeChartType = ref('bar')

const quickPeekOpen = ref(false)
const peekCandidate = ref(null)

const periodOptions = [
  { label: '7 Días', value: '7d' },
  { label: '30 Días', value: '30d' },
  { label: 'Histórico', value: 'all' }
]

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
  sedes_catalogo: [],
  convocatorias_catalogo: [],
  recientes: []
})

// Dynamic Sede Options for Select
const sedeOptions = computed(() => {
  return (stats.value.sedes_catalogo || []).map(s => ({
    label: s.nombre,
    value: s.id
  }))
})

// Dynamic Convocatoria Options for Select
const convocatoriaOptions = computed(() => {
  return (stats.value.convocatorias_catalogo || []).map(c => ({
    label: `${c.codigo} - ${c.titulo}`,
    value: c.id
  }))
})

// Active filters helper
const hasActiveFilters = computed(() => {
  return !!(selectedSede.value || selectedConvocatoria.value || selectedPeriodo.value !== 'all' || selectedFunnelStage.value)
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedSede.value) count++
  if (selectedConvocatoria.value) count++
  if (selectedPeriodo.value !== 'all') count++
  if (selectedFunnelStage.value) count++
  return count
})

// Convocatorias Counts
const countConvocatoriasActivas = computed(() => {
  return (stats.value.convocatorias_gestion || []).filter(c => c.is_activa).length
})

const countConvocatoriasUrgentes = computed(() => {
  return (stats.value.convocatorias_gestion || []).filter(c => c.is_urgente).length
})

// Filtered Convocatorias by Tab
const filteredConvocatorias = computed(() => {
  const list = stats.value.convocatorias_gestion || []
  if (convocatoriaTab.value === 'activas') {
    return list.filter(c => c.is_activa)
  }
  if (convocatoriaTab.value === 'urgentes') {
    return list.filter(c => c.is_urgente)
  }
  return list
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
        opacityFrom: 0.45,
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

// SEDES BAR CHART
const chartSedeBar = reactive({
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

// SEDES DONUT CHART
const chartSedeDonut = reactive({
  series: [],
  options: {
    chart: { fontFamily: 'Inter, sans-serif' },
    labels: [],
    colors: ['#663399', '#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'],
    legend: { position: 'bottom', fontSize: '11px', fontWeight: 600 },
    dataLabels: { enabled: true, formatter: (val) => `${Math.round(val)}%` },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Sedes',
              fontSize: '12px',
              fontWeight: 800,
              color: '#663399'
            }
          }
        }
      }
    },
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
    const params = {}
    if (selectedSede.value) params.sede_id = selectedSede.value
    if (selectedConvocatoria.value) params.convocatoria_id = selectedConvocatoria.value
    if (selectedPeriodo.value && selectedPeriodo.value !== 'all') params.periodo = selectedPeriodo.value

    const { data } = await api.get('/dashboard/stats', { params })
    if (data.success) {
      stats.value = data
      updateCharts(data)
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err)
  } finally {
    loading.value = false
  }
}

const updateCharts = (data) => {
  // 1. Timeline
  if (data.timeline && data.timeline.length > 0) {
    let counts = data.timeline.map(t => t.count)
    if (timelineViewMode.value === 'cumulative') {
      let run = 0
      counts = counts.map(c => (run += c))
    }
    chartTimeline.series = [{
      name: timelineViewMode.value === 'cumulative' ? 'Postulaciones Acumuladas' : 'Nuevas Postulaciones',
      data: counts
    }]
    chartTimeline.options = {
      ...chartTimeline.options,
      xaxis: {
        ...chartTimeline.options.xaxis,
        categories: data.timeline.map(t => t.fecha)
      }
    }
  } else {
    chartTimeline.series = [{ name: 'Nuevas Postulaciones', data: [] }]
  }

  // 2. Sedes Bar & Donut
  if (data.chart_sede && data.chart_sede.length > 0) {
    chartSedeBar.series = [{
      name: 'Postulantes',
      data: data.chart_sede.map(s => ({ x: s.nombre, y: s.postulaciones_count }))
    }]

    chartSedeDonut.series = data.chart_sede.map(s => s.postulaciones_count)
    chartSedeDonut.options = {
      ...chartSedeDonut.options,
      labels: data.chart_sede.map(s => s.nombre)
    }
  } else {
    chartSedeBar.series = [{ name: 'Postulantes', data: [] }]
    chartSedeDonut.series = []
  }
}

const onFilterChange = () => {
  loadStats()
}

const setPeriodo = (p) => {
  selectedPeriodo.value = p
  loadStats()
}

const setTimelineViewMode = (mode) => {
  timelineViewMode.value = mode
  updateCharts(stats.value)
}

const setSedeChartType = (type) => {
  sedeChartType.value = type
}

const toggleFunnelStage = (stageKey) => {
  if (selectedFunnelStage.value === stageKey) {
    selectedFunnelStage.value = null
  } else {
    selectedFunnelStage.value = stageKey
    // Smooth scroll to table
    const el = document.getElementById('seccion-actividad')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

const filtrarPorConvocatoria = (convId) => {
  selectedConvocatoria.value = convId
  loadStats()
}

const resetFilters = () => {
  selectedSede.value = null
  selectedConvocatoria.value = null
  selectedPeriodo.value = 'all'
  selectedFunnelStage.value = null
  searchQuery.value = ''
  loadStats()
}

const openQuickPeek = (item) => {
  peekCandidate.value = item
  quickPeekOpen.value = true
}

const filteredRecientes = computed(() => {
  let list = stats.value.recientes || []

  // Funnel stage cross-filter
  if (selectedFunnelStage.value) {
    list = list.filter(item => {
      if (selectedFunnelStage.value === 'apto') {
        return item.estado === 'apto' || item.estado === 'habilitado'
      }
      return item.estado === selectedFunnelStage.value
    })
  }

  // Live text query
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return list

  return list.filter(item => {
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
    case 'habilitado':
    case 'apto': return 'Habilitado'
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
