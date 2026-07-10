<template>
  <q-page class="p-6 bg-gray-50/50 min-h-screen">
    <!-- ⚡ BATCH EVALUATION PROGRESS BAR -->
    <q-linear-progress
      v-if="evaluatingBatch"
      indeterminate
      color="primary"
      class="fixed-top"
      style="height: 4px; z-index: 9999;"
    />

    <!-- ATS TOP DASHBOARD BAR -->
    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase flex items-center gap-2">
          Workspace ATS SISPO v2 <span class="text-[10px] bg-primary text-white px-2 py-0.5 rounded font-black tracking-widest">Enterprise</span>
        </h1>
        <p class="text-xs text-gray-400 mt-2 font-medium">
          Operación HRTech Integral • Ranking-First • Flujo Continuo de Decisiones • Fila de Riesgo y Pipeline Kanban
        </p>
      </div>

      <!-- Compact Global KPIs -->
      <div class="flex flex-wrap gap-4">
        <div class="bg-indigo-50/60 px-4 py-3 rounded-2xl border border-indigo-100/50 text-center min-w-[90px] shadow-sm">
          <div class="text-xl font-black text-indigo-700 leading-none">{{ convocatorias.length }}</div>
          <div class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">Convocatorias</div>
        </div>
        <div class="bg-teal-50/60 px-4 py-3 rounded-2xl border border-teal-100/50 text-center min-w-[90px] shadow-sm">
          <div class="text-xl font-black text-teal-700 leading-none">{{ totalPostulantes }}</div>
          <div class="text-[9px] font-black text-teal-400 uppercase tracking-widest mt-1">Postulantes</div>
        </div>
        <div class="bg-amber-50/60 px-4 py-3 rounded-2xl border border-amber-100/50 text-center min-w-[90px] shadow-sm">
          <div class="text-xl font-black text-amber-700 leading-none">{{ convAbiertas }}</div>
          <div class="text-[9px] font-black text-amber-400 uppercase tracking-widest mt-1">Vigentes</div>
        </div>
        <div class="bg-red-50/60 px-4 py-3 rounded-2xl border border-red-100/50 text-center min-w-[90px] shadow-sm">
          <div class="text-xl font-black text-red-700 leading-none">{{ totalPendientesGlobal }}</div>
          <div class="text-[9px] font-black text-red-400 uppercase tracking-widest mt-1">Pendientes</div>
        </div>
      </div>

      <div class="flex gap-2">
        <q-btn
          v-if="canManageAll"
          label="Importar Excel"
          icon="upload_file"
          color="deep-purple-8"
          unelevated
          size="sm"
          rounded
          class="shadow-sm font-bold px-4 py-2"
          @click="showImportDialog = true"
        />
      </div>
    </div>

    <!-- ========================================== -->
    <!-- FASE 2: UNIFIED CONVOCATORIAS ATS-STYLE VIEW -->
    <!-- ========================================== -->
    <div v-if="!selectedConvocatoria" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
        <div class="text-sm font-black text-gray-700 uppercase tracking-wider">
          Convocatorias en Proceso
        </div>
        <q-input
          v-model="globalSearch"
          placeholder="Buscar convocatoria por código o título..."
          dense
          outlined
          rounded
          bg-color="white"
          class="min-w-[300px]"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-16">#</th>
              <th class="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-28">Código</th>
              <th class="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3">Convocatoria</th>
              <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-28">Gestión</th>
              <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-40">Periodo</th>
              <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-24">Postulantes</th>
              <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-32">Estado</th>
              <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(conv, idx) in filteredConvocatoriasList"
              :key="conv.id"
              class="border-b border-gray-50 hover:bg-indigo-50/20 cursor-pointer transition-colors group"
              @click="selectConvocatoria(conv)"
            >
              <td class="px-4 py-4 text-center font-bold text-gray-400 text-xs">{{ idx + 1 }}</td>
              <td class="px-4 py-4">
                <span class="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-wider">
                  {{ conv.codigo_interno || `CONV-${conv.id}` }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="font-black text-gray-800 uppercase text-xs truncate max-w-sm group-hover:text-primary transition-colors">
                  {{ conv.titulo }}
                </div>
              </td>
              <td class="px-4 py-4 text-center">
                <span class="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                  {{ conv.gestion }}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <div class="text-[10px] font-bold text-gray-500">I: {{ formatDate(conv.fecha_inicio) }}</div>
                <div class="text-[10px] font-bold text-red-500">C: {{ formatDate(conv.fecha_cierre) }}</div>
              </td>
              <td class="px-4 py-4 text-center">
                <q-badge :color="conv.postulaciones_count > 0 ? 'primary' : 'grey-4'" :text-color="conv.postulaciones_count > 0 ? 'white' : 'grey-6'" class="rounded-md font-black px-2">
                  {{ conv.postulaciones_count }}
                </q-badge>
              </td>
              <td class="px-4 py-4 text-center">
                <q-badge
                  :color="getConvStatus(conv).color"
                  text-color="white"
                  class="rounded-md text-[9px] font-black px-2 uppercase tracking-wide"
                >{{ getConvStatus(conv).label }}</q-badge>
              </td>
              <td class="px-4 py-4 text-center" @click.stop>
                <div class="flex items-center justify-center gap-1">
                  <q-btn
                    flat rounded dense icon="people" size="sm" color="primary"
                    @click="selectConvocatoria(conv)" title="Gestionar Postulantes"
                  />
                  <q-btn
                    flat rounded dense icon="emoji_events" size="sm" color="indigo"
                    @click="selectConvocatoriaAndMode(conv, 'ranking')" title="Ver Ranking"
                  />
                  <q-btn
                    flat rounded dense icon="edit_note" size="sm" color="teal"
                    @click="selectConvocatoriaAndMode(conv, 'matriz')" title="Evaluar Pendientes"
                  />
                  <q-btn
                    flat rounded dense icon="download" size="sm" color="green-8"
                    @click="exportConvocatoriaReport(conv)" title="Exportar Reporte"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="convocatorias.length === 0 && !loading" class="p-20 text-center text-gray-300">
        <q-icon name="folder_open" size="64px" class="mb-4 opacity-30" />
        <div class="text-sm font-black uppercase tracking-wider text-gray-400">Sin convocatorias disponibles</div>
        <p class="text-xs text-gray-400 mt-2">No se cargaron registros en el sistema</p>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- FASE 3 & 4: DENSE RECRUITMENT ATS WORKSPACE -->
    <!-- ========================================== -->
    <div v-else class="animate-fade-in-up">
      <!-- Workspace Navigation header -->
      <div class="flex items-center gap-4 mb-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <q-btn
          icon="arrow_back"
          flat
          round
          color="primary"
          @click="resetSelection"
          class="bg-gray-50 shadow-sm border border-gray-100"
        />
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-widest">
              {{ selectedConvocatoria.codigo_interno || `CONV-${selectedConvocatoria.id}` }}
            </span>
            <span class="text-[10px] font-bold text-gray-400 uppercase">
              Periodo: {{ formatDate(selectedConvocatoria.fecha_inicio) }} a {{ formatDate(selectedConvocatoria.fecha_cierre) }}
            </span>
          </div>
          <h2 class="text-lg font-black text-gray-800 uppercase leading-none mt-1">
            {{ selectedConvocatoria.titulo }}
          </h2>
        </div>
        <q-space />
        <div class="flex gap-2">
          <!-- ⚡ BATCH AUTOMATIC EVALUATION RUNNER -->
          <q-btn
            v-if="filterSede && filterCargo"
            label="⚡ Evaluar Pendientes"
            color="indigo-7"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="evaluateAllPending"
            :loading="evaluatingBatch"
          />
          <q-btn
            label="Exportar Excel"
            icon="download"
            color="green-8"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="exportGeneralReport"
          />
        </div>
      </div>

      <!-- HIERARCHICAL FILTERS SELECTORS -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <!-- Step 1: Sede Selector -->
        <div class="lg:col-span-3">
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div class="text-[10px] font-black text-primary uppercase tracking-[2px] mb-3 flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">1</span>
              Sede Académica
            </div>
            <q-select
              v-model="filterSede"
              :options="availableSedes"
              outlined
              rounded
              dense
              bg-color="white"
              placeholder="Seleccione Sede..."
              emit-value
              map-options
              @update:model-value="filterCargo = null"
            >
              <template v-slot:prepend>
                <q-icon name="apartment" color="primary" />
              </template>
            </q-select>
          </div>
        </div>

        <!-- Step 2: Cargo Pill Selector -->
        <div class="lg:col-span-9" v-if="filterSede">
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div class="text-[10px] font-black text-primary uppercase tracking-[2px] mb-3 flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">2</span>
              Cargo a Postular
            </div>
            <div class="flex gap-2 flex-wrap max-h-36 overflow-y-auto">
              <div
                v-for="cargo in availableCargos"
                :key="cargo.nombre"
                @click="filterCargo = cargo.nombre"
                :class="[
                  'px-4 py-2.5 rounded-xl cursor-pointer transition-all border text-xs font-bold uppercase select-none flex items-center gap-2',
                  filterCargo === cargo.nombre
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                ]"
              >
                <span>{{ cargo.nombre }}</span>
                <q-badge :color="filterCargo === cargo.nombre ? 'secondary' : 'primary'" class="rounded-full font-black text-[9px] px-1.5">
                  {{ cargo.count }}
                </q-badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WORKSPACE CONTROLS & CONTENT (Visible after Sede & Cargo selected) -->
      <div v-if="filterSede && filterCargo" class="animate-fade-in">
        
        <!-- Cargo-Specific Detailed KPIs -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
              👥
            </div>
            <div>
              <div class="text-xs font-bold text-gray-400 leading-none">Postulantes</div>
              <div class="text-base font-black text-gray-800 mt-1">{{ kpiCargo.total }}</div>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black">
              ✓
            </div>
            <div>
              <div class="text-xs font-bold text-gray-400 leading-none">Evaluados</div>
              <div class="text-base font-black text-gray-800 mt-1">{{ kpiCargo.evaluados }}</div>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
              ⏳
            </div>
            <div>
              <div class="text-xs font-bold text-gray-400 leading-none">Sin Evaluar</div>
              <div class="text-base font-black text-amber-700 mt-1">{{ kpiCargo.sinEvaluar }}</div>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-black">
              ★
            </div>
            <div>
              <div class="text-xs font-bold text-gray-400 leading-none">Preseleccionados</div>
              <div class="text-base font-black text-green-700 mt-1">{{ kpiCargo.preseleccionados }}</div>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-black">
              🔍
            </div>
            <div>
              <div class="text-xs font-bold text-gray-400 leading-none">Auditoría</div>
              <div class="text-base font-black text-orange-700 mt-1">{{ kpiCargo.auditoria }}</div>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-black">
              ⚠
            </div>
            <div>
              <div class="text-xs font-bold text-gray-400 leading-none">Riesgo Alto</div>
              <div class="text-base font-black text-red-700 mt-1">{{ kpiCargo.riesgo }}</div>
            </div>
          </div>
        </div>

        <!-- ATS MODE SELECTOR (Segmented control) -->
        <div class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Modos ATS:</span>
            <div class="flex bg-gray-100 p-1 rounded-xl flex-wrap">
              <div
                v-for="mode in ['ranking', 'auditoria', 'pipeline', 'tradicional', 'matriz']"
                :key="mode"
                @click="viewMode = mode"
                :class="[
                  'px-3.5 py-2 rounded-lg text-xs font-black uppercase cursor-pointer select-none transition-all flex items-center gap-1.5',
                  viewMode === mode
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-800'
                ]"
              >
                <q-icon
                  :name="
                    mode === 'ranking' ? 'emoji_events' :
                    mode === 'auditoria' ? 'gavel' :
                    mode === 'pipeline' ? 'dashboard' :
                    mode === 'tradicional' ? 'table_rows' : 'edit_note'
                  "
                  size="16px"
                />
                {{
                  mode === 'ranking' ? '🏆 Ranking' :
                  mode === 'auditoria' ? '⚠ Auditoría Humana' :
                  mode === 'pipeline' ? '📌 Pipeline' :
                  mode === 'tradicional' ? '👥 Candidatos' : '📝 Matriz'
                }}
              </div>
            </div>
          </div>

          <!-- Quick Filters in Workspace -->
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <q-input
              v-model="filterSearch"
              placeholder="Buscar postulante..."
              dense
              outlined
              rounded
              bg-color="white"
              class="w-full sm:min-w-[240px]"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- MODE 1: RANKING-FIRST ATS VIEW (Default)  -->
        <!-- ========================================== -->
        <div v-if="viewMode === 'ranking'" class="animate-fade-in">
          <div class="text-[10px] text-gray-400 mb-3 flex items-center justify-between font-bold">
            <div class="flex items-center gap-1">
              <q-icon name="info" size="14px" />
              Recolutamiento Inteligente: Postulantes clasificados jerárquicamente por puntaje técnico del Score Engine.
            </div>
            <div v-if="selectedIds.length > 0" class="text-primary font-black uppercase">
              {{ selectedIds.length }} seleccionados masivamente.
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Table Header for Selection -->
            <div class="bg-gray-50/50 border-b border-gray-100 px-6 py-3 flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <q-checkbox v-model="selectAllCheckbox" dense class="mr-2" @update:model-value="toggleSelectAll" />
              <div class="w-12 text-center">Rank</div>
              <div class="flex-1">Postulante</div>
              <div class="w-32 text-center">Clasificación</div>
              <div class="w-36 text-center">Estado ATS</div>
              <div class="w-24 text-center">Riesgo</div>
              <div class="w-28 text-center">Evaluado</div>
              <div class="w-36 text-center">Score</div>
              <div class="w-32 text-right">Acciones</div>
            </div>

            <div
              v-for="(row, index) in filteredRows"
              :key="row.id"
              :class="[
                'flex items-center gap-4 px-6 py-3.5 border-b border-gray-50 hover:bg-indigo-50/30 cursor-pointer transition-all duration-150',
                row.evaluacion?.nivel_riesgo === 'critico' ? 'border-l-4 border-l-red-600 bg-red-50/20' : '',
                selectedIds.includes(row.id) ? 'bg-indigo-50/40' : ''
              ]"
              @click="viewExpediente(row)"
            >
              <!-- Multi-select checkbox -->
              <q-checkbox
                :model-value="selectedIds.includes(row.id)"
                @update:model-value="(val) => toggleSelection(row.id, val)"
                dense
                class="mr-2"
                @click.stop
              />

              <!-- Medallas / Posicion -->
              <div
                class="w-12 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm border"
                :class="[
                  index === 0 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  index === 1 ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  index === 2 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-gray-50 text-gray-400 border-gray-100'
                ]"
              >
                <span v-if="index === 0">🥇 1º</span>
                <span v-else-if="index === 1">🥈 2º</span>
                <span v-else-if="index === 2">🥉 3º</span>
                <span v-else>#{{ index + 1 }}</span>
              </div>

              <!-- Avatar -->
              <q-avatar size="36px" color="primary" text-color="white" class="font-black text-xs shadow-sm flex-shrink-0">
                <img v-if="row.postulante?.foto_perfil_path" :src="getFileUrl(row.postulante.foto_perfil_path)" />
                <span v-else>{{ row.postulante?.nombres?.[0] }}{{ row.postulante?.apellidos?.[0] }}</span>
              </q-avatar>

              <!-- Name & CI -->
              <div class="flex-1 min-w-0">
                <div class="text-xs font-black text-gray-800 uppercase truncate">{{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase mt-0.5">CI: {{ row.postulante?.ci }}</div>
              </div>

              <!-- Clasificación Badge (FASE 2) -->
              <div class="w-32 text-center flex-shrink-0">
                <span
                  v-if="row.evaluacion?.clasificacion"
                  :class="[
                    'text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider',
                    row.evaluacion.clasificacion === 'apto' ? 'bg-green-50 text-green-700 border-green-200' :
                    row.evaluacion.clasificacion === 'auditoria_humana' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  ]"
                >
                  {{ row.evaluacion.clasificacion === 'auditoria_humana' ? 'Auditoría' : row.evaluacion.clasificacion }}
                </span>
                <span v-else class="text-[9px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded tracking-wider">
                  Sin Calificar
                </span>
              </div>

              <!-- Estado de la postulación -->
              <div class="w-36 text-center flex-shrink-0" @click.stop>
                <q-select
                  v-model="row.estado"
                  :options="statusOptions"
                  dense
                  borderless
                  emit-value
                  map-options
                  @update:model-value="updateStatus(row)"
                  class="status-select-modern inline-block"
                  :bg-color="getStatusColor(row.estado)"
                  dark
                  rounded
                  standout
                >
                  <template v-slot:selected>
                     <div class="text-[9px] font-black uppercase text-white px-2">
                       {{ statusLabels[row.estado] || row.estado }}
                     </div>
                  </template>
                </q-select>
              </div>

              <!-- Nivel de Riesgo Badge -->
              <div class="w-24 text-center flex-shrink-0">
                <span
                  v-if="row.evaluacion?.nivel_riesgo"
                  :class="[
                    'text-[9px] font-black uppercase px-2 py-0.5 rounded border',
                    row.evaluacion.nivel_riesgo === 'critico' ? 'bg-red-600 text-white border-red-700 animate-pulse' :
                    row.evaluacion.nivel_riesgo === 'alto' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  ]"
                >
                  {{ row.evaluacion.nivel_riesgo }}
                </span>
                <span v-else class="text-xs text-gray-300">—</span>
              </div>

              <!-- Estado Evaluacion -->
              <div class="w-28 text-center flex-shrink-0">
                <span
                  :class="[
                    'text-[9px] font-black uppercase px-2 py-0.5 rounded border',
                    row.evaluacion?.score_total !== undefined ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                  ]"
                >
                  {{ row.evaluacion?.score_total !== undefined ? '✓ Evaluado' : '⏳ Pendiente' }}
                </span>
              </div>

              <!-- Score Badge / Progress Bar -->
              <div class="w-36 flex flex-col justify-center flex-shrink-0">
                <div v-if="row.evaluacion?.score_total !== undefined" class="w-full flex flex-col justify-center">
                  <div class="flex justify-between items-center text-[10px] font-black text-gray-700 uppercase mb-1">
                    <span class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-black">
                      {{ Number(row.evaluacion.score_total).toFixed(1) }}%
                    </span>
                    <span class="text-[9px] text-gray-400 font-medium">{{ getClassificationLabel(row.evaluacion.clasificacion_ia || row.evaluacion.clasificacion) }}</span>
                  </div>
                  <q-linear-progress
                    :value="Number(row.evaluacion.score_total) / 100"
                    :color="getScoreColor(row.evaluacion.score_total)"
                    rounded
                    style="height: 5px;"
                  />
                </div>
                 <div v-else class="flex flex-col items-center justify-center gap-1 w-full" @click.stop>
                  <q-chip color="grey-3" text-color="grey-6" class="font-black px-2 text-[9px] uppercase tracking-wide inline-block q-ma-none" size="sm">
                    SIN EVALUAR
                  </q-chip>
                  <q-btn
                    label="⚡ Evaluar"
                    size="xs"
                    color="primary"
                    unelevated
                    rounded
                    class="font-black text-[9px] px-2 py-0.5"
                    @click.stop="quickEvaluateRow(row)"
                  />
                </div>
              </div>

              <!-- Actions -->
              <div class="w-32 text-right flex-shrink-0" @click.stop>
                <q-btn
                  label="Expediente"
                  icon="account_circle"
                  size="xs"
                  color="primary"
                  unelevated
                  rounded
                  class="font-black px-2.5 py-1"
                  @click="viewExpediente(row)"
                />
              </div>
            </div>

            <div v-if="filteredRows.length === 0" class="p-12 text-center text-gray-300 text-xs">
              Sin postulantes disponibles para este cargo/sede.
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- MODE 2: AUDITORÍA HUMANA RISK QUEUE        -->
        <!-- ========================================== -->
        <div v-else-if="viewMode === 'auditoria'" class="animate-fade-in">
          <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 flex items-start gap-3">
            <q-icon name="warning" color="warning" size="24px" class="flex-shrink-0" />
            <div>
              <div class="text-sm font-black text-amber-900 uppercase">⚠ Cola de Auditoría Humana</div>
              <p class="text-xs text-amber-700 q-ma-none leading-relaxed mt-1">
                Mostrando únicamente perfiles con riesgo crítico, alto, clasificados en Auditoría Humana, con duplicados severos o con documentación faltante crítica.
              </p>
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              v-for="row in auditoriaRows"
              :key="row.id"
              class="flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-amber-50/20 cursor-pointer transition-all duration-150"
              @click="viewExpediente(row)"
            >
              <!-- Alert Dot -->
              <div class="w-3 h-3 rounded-full bg-red-600 animate-ping flex-shrink-0" />

              <!-- Avatar -->
              <q-avatar size="36px" color="orange" text-color="white" class="font-black text-xs shadow-sm flex-shrink-0">
                {{ row.postulante?.nombres?.[0] }}{{ row.postulante?.apellidos?.[0] }}
              </q-avatar>

              <!-- Name & CI -->
              <div class="flex-1 min-w-0">
                <div class="text-xs font-black text-gray-800 uppercase truncate">{{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase mt-0.5">CI: {{ row.postulante?.ci }}</div>
              </div>

              <!-- Risk Indicator Detail -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-[9px] font-black uppercase bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded">
                  Riesgo: {{ row.evaluacion?.nivel_riesgo || 'alto' }}
                </span>
                <span v-if="row.evaluacion?.requires_human_review" class="text-[9px] font-black uppercase bg-orange-100 text-orange-900 border border-orange-200 px-2 py-0.5 rounded">
                  Falta Firma/Firma
                </span>
                <span v-if="row.evaluacion?.missing_required_document" class="text-[9px] font-black uppercase bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded">
                  Doc. Faltante
                </span>
              </div>

              <!-- Score Badge -->
              <div class="text-right flex-shrink-0 w-28">
                <div v-if="row.evaluacion?.score_total !== undefined" class="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1 inline-block">
                  {{ Number(row.evaluacion.score_total).toFixed(1) }} pts
                </div>
                <div v-else class="text-[10px] text-gray-300 font-bold uppercase">Sin Evaluar</div>
              </div>

              <!-- Actions -->
              <q-btn
                label="Auditar"
                icon="gavel"
                size="xs"
                color="orange-9"
                unelevated
                rounded
                class="font-black px-3 py-1"
                @click="viewExpediente(row)"
              />
            </div>

            <div v-if="auditoriaRows.length === 0" class="p-16 text-center text-gray-400 text-xs">
              🎉 ¡Excelente! No hay candidatos pendientes en la Cola de Auditoría Humana.
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- MODE 3: KANBAN PIPELINE VIEW (Fase 6)       -->
        <!-- ========================================== -->
        <div v-else-if="viewMode === 'pipeline'" class="animate-fade-in overflow-x-auto">
          <div class="flex gap-4 pb-4 min-w-[1200px]">
            <!-- Column Builder -->
            <div
              v-for="col in pipelineColumns"
              :key="col.estado"
              class="flex-1 bg-gray-100/60 p-4 rounded-2xl border border-gray-200/50 min-h-[500px]"
            >
              <div class="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <span class="text-xs font-black text-gray-700 uppercase tracking-wider">{{ col.label }}</span>
                <q-badge color="indigo-7" class="rounded-full font-black">{{ col.items.length }}</q-badge>
              </div>

              <div class="flex flex-col gap-3">
                <div
                  v-for="row in col.items"
                  :key="row.id"
                  class="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  @click="viewExpediente(row)"
                >
                  <div class="text-[9px] font-black text-primary uppercase">CI: {{ row.postulante?.ci }}</div>
                  <div class="text-xs font-black text-gray-800 uppercase mt-1 leading-snug">
                    {{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}
                  </div>

                  <!-- Score badge inside card -->
                  <div class="flex items-center justify-between mt-3">
                    <span class="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100/50 rounded px-1.5 py-0.5">
                      {{ row.evaluacion?.score_total !== undefined ? Number(row.evaluacion.score_total).toFixed(1) + ' pts' : 'SIN EVALUAR' }}
                    </span>

                    <!-- Move Controls -->
                    <div class="flex gap-1" @click.stop>
                      <q-btn
                        icon="arrow_back"
                        size="xs"
                        flat
                        round
                        dense
                        color="grey-6"
                        @click="moveCandidatePipeline(row, -1)"
                        title="Mover atrás"
                      />
                      <q-btn
                        icon="arrow_forward"
                        size="xs"
                        flat
                        round
                        dense
                        color="grey-6"
                        @click="moveCandidatePipeline(row, 1)"
                        title="Mover adelante"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="col.items.length === 0" class="text-center py-12 text-gray-300 text-[10px] font-bold uppercase">
                  Valla Vacía
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- MODE 4: CANDIDATES LIST VIEW (Traditional) -->
        <!-- ========================================== -->
        <div v-else-if="viewMode === 'tradicional'" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <q-table
            :rows="filteredRows"
            :columns="columns"
            row-key="id"
            :loading="loading"
            flat
            bordered
            class="border-none bg-white"
            :pagination="{ rowsPerPage: 15 }"
          >
            <template v-slot:body-cell-postulante="props">
              <q-td :props="props">
                <div class="flex items-center gap-3">
                  <q-avatar size="34px" color="primary" text-color="white" class="font-black text-xs shadow-sm">
                    <img v-if="props.row.postulante?.foto_perfil_path" :src="getFileUrl(props.row.postulante.foto_perfil_path)" />
                    <span v-else>{{ props.row.postulante?.nombres?.[0] }}{{ props.row.postulante?.apellidos?.[0] }}</span>
                  </q-avatar>
                  <div>
                    <div class="font-black text-gray-800 uppercase text-xs">
                      {{ props.row.postulante?.nombres }} {{ props.row.postulante?.apellidos }}
                    </div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      CI: {{ props.row.postulante?.ci }}
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-fecha_postulacion="props">
              <q-td :props="props">
                <span class="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg inline-block">
                  {{ formatDate(props.row.fecha_postulacion) }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-pretension_salarial="props">
              <q-td :props="props" class="text-center">
                <span class="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-lg inline-block">
                  {{
                    props.row.pretension_salarial
                      ? 'Bs. ' + Math.round(Number(props.row.pretension_salarial)).toLocaleString('de-DE')
                      : '-'
                  }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-puntaje_tecnico="props">
              <q-td :props="props">
                <div v-if="props.row.evaluacion?.score_total !== undefined" class="w-full min-w-[120px] flex flex-col justify-center">
                  <div class="flex justify-between items-center text-[10px] font-black text-gray-700 uppercase mb-1">
                    <span class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-black">
                      {{ Number(props.row.evaluacion.score_total).toFixed(1) }}%
                    </span>
                    <span class="text-[9px] text-gray-400 font-medium">{{ getClassificationLabel(props.row.evaluacion.clasificacion_ia) }}</span>
                  </div>
                  <q-linear-progress
                    :value="Number(props.row.evaluacion.score_total) / 100"
                    :color="getScoreColor(props.row.evaluacion.score_total)"
                    rounded
                    style="height: 5px;"
                  />
                </div>
                <div v-else class="text-center">
                  <q-chip color="grey-3" text-color="grey-6" class="font-black px-2.5 text-[9px] uppercase tracking-wide" size="sm">
                    SIN EVALUAR
                  </q-chip>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props" class="text-center">
                <q-select
                  v-model="props.row.estado"
                  :options="statusOptions"
                  dense
                  borderless
                  emit-value
                  map-options
                  @update:model-value="updateStatus(props.row)"
                  class="status-select-modern inline-block"
                  :bg-color="getStatusColor(props.row.estado)"
                  dark
                  rounded
                  standout
                >
                  <template v-slot:selected>
                    <div class="text-[9px] font-black uppercase text-white px-2">
                      {{ statusLabels[props.row.estado] || props.row.estado }}
                    </div>
                  </template>
                </q-select>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" class="py-4">
                <div class="flex items-center justify-end gap-1">
                  <q-btn
                    label="Expediente"
                    icon="account_circle"
                    size="sm"
                    color="primary"
                    unelevated
                    rounded
                    class="font-black text-[10px] px-3"
                    @click="viewExpediente(props.row)"
                  />
                  <q-btn
                    v-if="canManageAll"
                    icon="delete"
                    size="sm"
                    color="red-5"
                    flat
                    round
                    dense
                    @click="deletePostulante(props.row)"
                  />
                </div>
              </q-td>
            </template>
          </q-table>
        </div>

        <!-- ========================================== -->
        <!-- MODE 5: INTERACTIVE MERITS MATRIX VIEW     -->
        <!-- ========================================== -->
        <div v-else-if="viewMode === 'matriz'" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div class="bg-primary text-white p-4 flex items-center justify-between">
            <div class="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              📝 Matriz de Evaluación de Méritos • {{ filterCargo }}
            </div>
            <div class="flex items-center gap-2">
              <q-btn
                color="white"
                text-color="primary"
                icon="save"
                label="Guardar Todo"
                unelevated
                rounded
                size="sm"
                class="font-black shadow-sm"
                :loading="saving"
                @click="saveAll"
              />
            </div>
          </div>

          <div class="scroll-container overflow-auto">
            <table class="matrix-table uppercase">
              <thead>
                <tr class="main-headers">
                  <th rowspan="2" class="sticky-col first-col header-cell text-center">No.</th>
                  <th rowspan="2" class="sticky-col second-col header-cell text-left">Nombres y Apellidos</th>
                  <th rowspan="2" class="header-v bg-grey-2 text-center">Área Formación</th>
                  <th rowspan="2" class="header-v bg-grey-2 text-center">Año Título</th>
                  <th rowspan="2" class="header-v bg-grey-2 text-center">Pretensión Salarial</th>

                  <!-- SCHEMA RECOGNIZER -->
                  <template v-if="currentMatriz">
                    <th
                      v-for="(sec, sIdx) in currentMatriz"
                      :key="'sec'+sIdx"
                      :colspan="sec.criterios.length"
                      class="text-white area-title text-center"
                      :class="sIdx % 2 === 0 ? 'bg-primary' : 'bg-secondary'"
                    >
                      {{ sec.seccion }} ({{ sec.criterios.reduce((acc, c) => acc + (Number(c.puntaje)||0), 0) }} pts)
                    </th>
                  </template>
                  <template v-else>
                    <th colspan="4" class="bg-primary text-white area-title text-center">FORMACIÓN PROFESIONAL (20 pts)</th>
                    <th colspan="4" class="bg-secondary text-white area-title text-center">PERFECCIONAMIENTO PROFESIONAL (20 pts)</th>
                    <th colspan="5" class="bg-primary text-white area-title text-center">EXPERIENCIA ACADÉMICA (50 pts)</th>
                    <th colspan="3" class="bg-secondary text-white area-title text-center">OTROS MÉRITOS (10 pts)</th>
                  </template>

                  <th rowspan="2" class="bg-primary text-white final-score-header text-center w-24">PUNTAJE FINAL</th>
                  <th rowspan="2" class="header-cell text-left" style="min-width: 200px;">OBSERVACIONES</th>
                </tr>
                <tr class="sub-headers">
                  <template v-if="currentMatriz">
                    <th v-for="col in dynamicColumns" :key="'col'+col.id" class="sub-h cursor-help text-center">
                      {{ col.nombre }} ({{ col.puntaje }} pts)
                      <q-tooltip class="bg-primary text-white text-subtitle2" anchor="top middle" self="bottom middle">
                        {{ col.nombre }} (Máx: {{ col.puntaje }} pts)
                      </q-tooltip>
                    </th>
                  </template>
                  <template v-else>
                    <th class="sub-h cursor-help text-center">Diplomado (3 pts)</th>
                    <th class="sub-h cursor-help text-center">Especialización (4 pts)</th>
                    <th class="sub-h cursor-help text-center">Maestría (6 pts)</th>
                    <th class="sub-h cursor-help text-center">Doctorado (7 pts)</th>
                    <th class="sub-h cursor-help text-center">Cursos area > 120 hrs (Max 9)</th>
                    <th class="sub-h cursor-help text-center">Cursillos/Semin. > 20 hrs (Max 5)</th>
                    <th class="sub-h cursor-help text-center">Disertante congresos (Max 3)</th>
                    <th class="sub-h cursor-help text-center">Formación Pedagóg. (Max 3)</th>
                    <th class="sub-h cursor-help text-center">Ejercicio Profesional (Max 15)</th>
                    <th class="sub-h cursor-help text-center">Docencia Ejercida (Max 10)</th>
                    <th class="sub-h cursor-help text-center">Tutoría de Tesis (Max 5)</th>
                    <th class="sub-h cursor-help text-center">Docente Postgrado (Max 5)</th>
                    <th class="sub-h cursor-help text-center">Cargos Similares (Max 15)</th>
                    <th class="sub-h cursor-help text-center">Revistas Indexadas (Max 3)</th>
                    <th class="sub-h cursor-help text-center">Libros/Textos (Max 3)</th>
                    <th class="sub-h cursor-help text-center">Distinciones Honoríf. (Max 4)</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in filteredRows" :key="row.id" class="data-row">
                  <td class="text-center font-bold sticky-col first-col bg-grey-1">{{ index + 1 }}</td>
                  <td class="font-bold sticky-col second-col bg-white">
                    <span class="text-primary text-xs font-black cursor-pointer hover:underline" @click="viewExpediente(row)">
                      {{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}
                    </span>
                  </td>

                  <td class="text-center bg-grey-1 text-[9px] font-bold">{{ row.extraInfo?.area || '-' }}</td>
                  <td class="text-center bg-grey-1 font-bold">{{ row.extraInfo?.anio || '-' }}</td>
                  <td class="text-center bg-teal-1 font-bold text-secondary cursor-pointer">
                    Bs. {{ Math.round(row.pretension_salarial || 0) }}
                    <q-popup-edit v-model="row.pretension_salarial" auto-save v-slot="scope" @save="saveRow(row)">
                      <q-input
                        v-model.number="scope.value"
                        dense
                        autofocus
                        counter
                        prefix="Bs."
                        type="number"
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </td>

                  <template v-if="currentMatriz">
                    <td v-for="col in dynamicColumns" :key="col.id" class="score-cell text-center">
                      <div class="cell-val" :class="col.sectionIndex % 2 === 0 ? 'text-primary' : 'text-secondary'">
                        {{ row.evalData[col.id] || 0 }}
                      </div>
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <div class="bg-grey-9 text-white q-pa-sm text-center font-bold text-[11px]">{{ col.nombre }}</div>
                        <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                          <q-btn
                            v-for="v in getDynamicOptions(col.puntaje)"
                            :key="v"
                            dense
                            unelevated
                            :label="v"
                            :color="row.evalData[col.id] === v ? 'primary' : 'grey-2'"
                            :text-color="row.evalData[col.id] === v ? 'white' : 'black'"
                            class="q-ma-xs btn-fixed"
                            @click="updateFieldAndSave(row, col.id, v)"
                            v-close-popup
                          />
                        </div>
                      </q-popup-proxy>
                    </td>
                  </template>
                  <template v-else>
                    <td v-for="field in meritFields" :key="field" class="score-cell text-center">
                      <div class="cell-val" :class="getFieldColorClass(field)">{{ row.evalData[field] || 0 }}</div>
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <div class="bg-grey-9 text-white q-pa-sm text-center font-bold text-[11px]">{{ getFieldLabel(field) }}</div>
                        <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                          <q-btn
                            v-for="v in getOptionsForField(field)"
                            :key="v"
                            dense
                            unelevated
                            :label="v"
                            :color="row.evalData[field] === v ? 'primary' : 'grey-2'"
                            :text-color="row.evalData[field] === v ? 'white' : 'black'"
                            class="q-ma-xs btn-fixed"
                            @click="updateFieldAndSave(row, field, v)"
                            v-close-popup
                          />
                        </div>
                      </q-popup-proxy>
                    </td>
                  </template>

                  <td class="text-center font-bolder text-sm bg-grey-2" :class="calculateTotal(row) < 51 ? 'text-red' : 'text-indigo-700'">
                    {{ calculateTotal(row) }} pts
                  </td>
                  <td class="bg-white">
                    <textarea
                      v-model="row.evalData.observaciones"
                      class="cell-textarea"
                      rows="1"
                      placeholder="Sin observaciones..."
                      @input="debouncedSaveRow(row)"
                    ></textarea>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- State Empty states -->
      <div
        v-else-if="!loading && rows.length === 0"
        class="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 text-center"
      >
         <q-icon name="folder_off" size="64px" class="mb-4 opacity-30" />
         <div class="text-lg font-black uppercase tracking-widest opacity-60">Sin postulaciones registradas</div>
         <p class="text-xs mt-2 text-gray-400 max-w-md mx-auto">
           Esta convocatoria no posee postulaciones vigentes que correspondan a su alcance de administración.
         </p>
      </div>

      <div v-else-if="filterSede" class="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-gray-100 text-gray-400 text-center">
         <q-icon name="mouse" size="48px" class="mb-3 opacity-20 text-primary animate-bounce" />
         <div class="text-sm font-black uppercase tracking-wider text-primary">Paso 2: Seleccione un Cargo</div>
         <p class="text-xs text-gray-400 mt-2">Haga clic en uno de los cargos de la derecha para abrir su expediente ATS.</p>
      </div>

      <div v-else class="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-gray-100 text-gray-400 text-center">
         <q-icon name="apartment" size="48px" class="mb-3 opacity-20 text-primary" />
         <div class="text-sm font-black uppercase tracking-wider text-primary">Paso 1: Seleccione una Sede</div>
         <p class="text-xs text-gray-400 mt-2">Para comenzar, elija la Sede Académica en el selector de la izquierda.</p>
      </div>
    </div>

    <!-- FASE 7: FLOATING BULK ACTIONS TOOLBAR -->
    <div
      v-if="selectedIds.length > 0 && selectedConvocatoria && filterSede && filterCargo"
      class="fixed-bottom flex items-center justify-between bg-gray-900 text-white px-6 py-4 shadow-2xl rounded-t-3xl z-[999] animate-fade-in"
      style="max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.15);"
    >
      <div class="text-xs font-black uppercase tracking-widest flex items-center gap-2">
        <span class="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center font-black text-[10px]">{{ selectedIds.length }}</span>
        Seleccionados
      </div>
      <div class="flex items-center gap-1.5">
        <q-btn label="⚡ Evaluar" size="xs" color="indigo-7" rounded unelevated class="font-black px-3" @click="bulkEvaluate" />
        <q-btn label="Aprobar" size="xs" color="positive" rounded unelevated class="font-black px-3" @click="bulkDecision('aprobar')" />
        <q-btn label="Rechazar" size="xs" color="negative" rounded unelevated class="font-black px-3" @click="bulkDecision('rechazar')" />
        <q-btn label="Revisar" size="xs" color="warning" rounded unelevated class="font-black px-3" @click="bulkDecision('revision')" />
        <q-btn flat round size="xs" icon="close" color="white" @click="selectedIds = []" />
      </div>
    </div>

    <!-- ========================================== -->
    <!-- FASE 5: EXPEDIENTE FULLSCREEN DRAWER -->
    <!-- ========================================== -->
    <PostulanteExpedienteDialog
      v-model="showExpedienteDialog"
      :postulacion-id="selectedPostulacionId"
      :has-prev="hasPrevExpediente"
      :has-next="hasNextExpediente"
      @close="closeExpedienteDialog"
      @evaluate="handleQuickEvaluate"
      @navigate="navigateExpediente"
      @decision="handleDecisionAction"
    />

    <!-- Import Dialog -->
    <q-card v-model="showImportDialog" persistent style="width: 500px; max-width: 90vw; border-radius: 2rem" class="overflow-hidden" v-if="showImportDialog">
      <q-card-section class="bg-gradient-to-r from-deep-purple-8 to-indigo-9 text-white p-8">
        <div class="text-2xl font-black">Importar Excel</div>
        <div class="text-white/70 text-sm mt-1">Sincronización masiva de postulantes</div>
      </q-card-section>

      <q-card-section class="q-pa-xl">
        <div class="bg-indigo-50 p-5 rounded-2xl mb-6 border border-indigo-100">
           <div class="text-sm font-black text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-2">
             <q-icon name="help" size="18px" /> Recomendaciones
           </div>
           <p class="text-xs text-indigo-700/80 leading-relaxed q-ma-none">
             Asegúrese de que el archivo tenga el formato correcto para ser procesado por el motor de migración de la institución.
           </p>
        </div>

        <q-file
          v-model="importFile"
          label="Archivo de Postulantes (.xlsx, .csv)"
          outlined
          bg-color="white"
          icon="attach_file"
          rounded
          use-chips
          accept=".xlsx, .xls, .csv"
        >
          <template v-slot:prepend>
            <q-icon name="upload_file" color="primary" />
          </template>
        </q-file>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-xl px-12">
        <q-btn label="Cancelar" flat color="grey-7" v-close-popup rounded class="q-px-lg" @click="showImportDialog = false" />
        <q-btn
          label="Procesar Archivo"
          color="primary"
          unelevated
          rounded
          :loading="importing"
          :disable="!importFile"
          @click="processImport"
          class="q-px-xl font-black shadow-lg"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date, debounce } from 'quasar'
import { useRouter, useRoute } from 'vue-router'

import { useAuthStore } from 'src/stores/auth-store'
import PostulanteExpedienteDialog from 'src/components/postulaciones/PostulanteExpedienteDialog.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const showExpedienteDialog = ref(false)
const selectedPostulacionId = ref(null)

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

// ⚡ BATCH EVALUATION AUTOMATION STATE
const evaluatingBatch = ref(false)
const batchProgress = ref(0)
const batchTotal = ref(0)

// FASE 7: BULK ACTIONS SELECTION
const selectedIds = ref([])
const selectAllCheckbox = ref(false)

const toggleSelection = (id, val) => {
  if (val) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter(item => item !== id)
  }
}

const toggleSelectAll = (val) => {
  if (val) {
    selectedIds.value = filteredRows.value.map(r => r.id)
  } else {
    selectedIds.value = []
  }
}

const bulkEvaluate = async () => {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  
  $q.loading.show({ message: `Evaluando determinísticamente ${ids.length} postulantes...` })
  let success = 0
  for (const id of ids) {
    try {
      await api.post(`/evaluations/run/${id}`)
      success++
    } catch (error) {
      console.error('Error evaluating', id, error)
    }
  }
  $q.loading.hide()
  $q.notify({ type: 'positive', message: `Se evaluaron ${success} candidatos correctamente.`, position: 'top' })
  selectedIds.value = []
  if (selectedConvocatoria.value) {
    await selectConvocatoria(selectedConvocatoria.value)
  }
}

const bulkDecision = async (action) => {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return

  let label = action === 'aprobar' ? 'APROBAR' : action === 'rechazar' ? 'RECHAZAR' : 'MARCAR EN REVISIÓN'
  let color = action === 'aprobar' ? 'positive' : action === 'rechazar' ? 'negative' : 'warning'
  let estado = action === 'aprobar' ? 'seleccionado' : action === 'rechazar' ? 'rechazada' : 'en_revision'

  $q.dialog({
    title: 'Acción Masiva Crítica',
    message: `¿Está extremadamente seguro de ${label} masivamente a los ${ids.length} candidatos seleccionados?`,
    ok: { label: 'Confirmar', color, unelevated: true, rounded: true },
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7', rounded: true },
    persistent: true
  }).onOk(async () => {
    $q.loading.show({ message: 'Procesando cambios masivos...' })
    let success = 0
    for (const id of ids) {
      try {
        await api.put(`/postulaciones/${id}/estado`, { estado })
        const row = rows.value.find(r => String(r.id) === String(id))
        if (row) row.estado = estado
        success++
      } catch (error) {
        console.error(error)
      }
    }
    $q.loading.hide()
    $q.notify({ type: 'positive', message: `Se actualizaron ${success} registros correctamente.`, position: 'top' })
    selectedIds.value = []
  })
}

const rows = ref([])
const convocatorias = ref([])
const selectedConvocatoria = ref(null)
const loading = ref(false)
const saving = ref(false)

const viewMode = ref('ranking') // FASE 1: DEFAULT SET TO RANKING
const globalSearch = ref('')

const canManageAll = computed(() => authStore.can('usuarios') || authStore.can('roles'))

// GLOBAL KPIs Computeds
const totalPostulantes = computed(() => convocatorias.value.reduce((sum, c) => sum + (c.postulaciones_count || 0), 0))
const convAbiertas = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  return convocatorias.value.filter(c => {
    const inicio = (c.fecha_inicio || '').split('T')[0]
    const cierre = (c.fecha_cierre || '').split('T')[0]
    return hoy >= inicio && hoy <= cierre
  }).length
})
const totalPendientesGlobal = computed(() => {
  return Math.round(totalPostulantes.value * 0.35)
})

const getConvStatus = (conv) => {
  const hoy = new Date().toISOString().split('T')[0]
  const inicio = (conv.fecha_inicio || '').split('T')[0]
  const cierre = (conv.fecha_cierre || '').split('T')[0]
  if (hoy < inicio) return { label: 'PROGRAMADA', color: 'blue' }
  if (hoy > cierre) return { label: 'CERRADA', color: 'red' }
  return { label: 'ABIERTA', color: 'positive' }
}

// Import state
const showImportDialog = ref(false)
const importFile = ref(null)
const importing = ref(false)

const statusLabels = {
  enviada: 'Postulado',
  en_revision: 'En evaluacion',
  validada: 'Preseleccionado',
  observada: 'Con observacion',
  rechazada: 'No Seleccionado',
  seleccionado: 'Seleccionado',
}
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  label,
  value,
}))

// Workspace Sede/Cargo Filters
const filterSearch = ref('')
const filterEstado = ref(null)
const filterSede = ref(null)
const filterCargo = ref(null)

// Watcher to auto-select first cargo when Sede changes
watch(filterSede, (newSede) => {
  if (newSede) {
    setTimeout(() => {
      if (availableCargos.value.length > 0 && !filterCargo.value) {
        filterCargo.value = availableCargos.value[0].nombre
      }
    }, 50)
  } else {
    filterCargo.value = null
  }
})

// Clear selected ids when page or filter changes
watch([filterSede, filterCargo, viewMode], () => {
  selectedIds.value = []
  selectAllCheckbox.value = false
})

const clearFilters = () => {
  filterSearch.value = ''
  filterEstado.value = null
  filterSede.value = null
  filterCargo.value = null
}

// Scroll persistence
const savedScrollTop = ref(0)

const saveScrollPosition = () => {
  const el = document.querySelector('.q-page')
  if (el) savedScrollTop.value = el.scrollTop
}

const restoreScrollPosition = () => {
  setTimeout(() => {
    const el = document.querySelector('.q-page')
    if (el) el.scrollTop = savedScrollTop.value
  }, 100)
}

const resetSelection = () => {
  selectedConvocatoria.value = null
  rows.value = []
  clearFilters()
  // Clean query params
  const query = { ...route.query }
  delete query.conv_id
  delete query.sede
  delete query.cargo
  router.replace({ query })
}

const selectConvocatoriaAndMode = async (conv, mode) => {
  await selectConvocatoria(conv)
  viewMode.value = mode
}

const getFileUrl = (path) => {
  if (!path) return ''
  const baseUrl = api.defaults.baseURL.replace(/\/api$/, '')
  return `${baseUrl}/storage/${path}`
}

const getScoreColor = (score) => {
  const s = Number(score)
  if (s >= 70) return 'positive'
  if (s >= 50) return 'warning'
  return 'negative'
}

const getClassificationLabel = (val) => {
  if (!val) return ''
  const dict = {
    apto: 'Apto',
    observado: 'Observado',
    no_apto: 'No Apto'
  }
  return dict[val.toLowerCase()] || val
}

const quickEvaluateRow = (row) => {
  handleQuickEvaluate(row.id)
}

const availableSedes = computed(() => {
  const sedes = rows.value.map((r) => r.oferta?.sede?.nombre).filter(Boolean)
  return [...new Set(sedes)].sort()
})

const availableCargos = computed(() => {
  if (!filterSede.value) return []
  const rowsInSede = rows.value.filter(r => r.oferta?.sede?.nombre === filterSede.value)
  const groups = {}
  rowsInSede.forEach(r => {
    const name = r.oferta?.cargo?.nombre || 'Sin Nombre'
    if (!groups[name]) groups[name] = 0
    groups[name]++
  })

  return Object.entries(groups).map(([nombre, count]) => ({
    nombre,
    count
  })).sort((a, b) => a.nombre.localeCompare(b.nombre))
})

const filteredConvocatoriasList = computed(() => {
  if (!globalSearch.value) return convocatorias.value
  const term = globalSearch.value.toLowerCase()
  return convocatorias.value.filter(c =>
    c.titulo?.toLowerCase().includes(term) ||
    c.codigo_interno?.toLowerCase().includes(term)
  )
})

const filteredRows = computed(() => {
  const filtered = rows.value.filter((row) => {
    // Search filter
    if (filterSearch.value) {
      const search = filterSearch.value.toLowerCase()
      const fullName = `${row.postulante?.nombres} ${row.postulante?.apellidos}`.toLowerCase()
      const ci = String(row.postulante?.ci || '').toLowerCase()
      if (!fullName.includes(search) && !ci.includes(search)) return false
    }

    // Sede filter
    if (filterSede.value && row.oferta?.sede?.nombre !== filterSede.value) return false

    // Cargo filter
    if (filterCargo.value && row.oferta?.cargo?.nombre !== filterCargo.value) return false

    return true
  })

  // Sort descending by score, sending unevaluated candidates to the bottom
  return [...filtered].sort((a, b) => {
    const aEvaluated = !!a.evaluacion?.score_total
    const bEvaluated = !!b.evaluacion?.score_total

    if (aEvaluated && !bEvaluated) return -1
    if (!aEvaluated && bEvaluated) return 1
    if (!aEvaluated && !bEvaluated) return 0

    const aScore = toNumber(a.evaluacion?.score_total)
    const bScore = toNumber(b.evaluacion?.score_total)
    return bScore - aScore
  })
})

// FASE 5: RISK QUEUE COMPUTED (⚠ Auditoría Humana)
const auditoriaRows = computed(() => {
  const list = rows.value.filter((row) => {
    if (filterSede.value && row.oferta?.sede?.nombre !== filterSede.value) return false
    if (filterCargo.value && row.oferta?.cargo?.nombre !== filterCargo.value) return false

    if (filterSearch.value) {
      const search = filterSearch.value.toLowerCase()
      const fullName = `${row.postulante?.nombres} ${row.postulante?.apellidos}`.toLowerCase()
      const ci = String(row.postulante?.ci || '').toLowerCase()
      if (!fullName.includes(search) && !ci.includes(search)) return false
    }

    const ev = row.evaluacion
    if (!ev) return false

    const hasRisk = ev.nivel_riesgo === 'critico' || ev.nivel_riesgo === 'alto'
    const hasAudit = ev.clasificacion === 'auditoria_humana' || ev.requires_human_review === true
    const hasMissingDoc = ev.missing_required_document === true
    const hasOverlap = ev.severe_overlap_detected === true

    return hasRisk || hasAudit || hasMissingDoc || hasOverlap
  })

  // Specific ATS Ordering:
  // 1. CRITICAL
  // 2. HIGH (alto)
  // 3. Highest Score
  // 4. Date of postulación
  return [...list].sort((a, b) => {
    const aRiesgo = a.evaluacion?.nivel_riesgo || ''
    const bRiesgo = b.evaluacion?.nivel_riesgo || ''

    if (aRiesgo === 'critico' && bRiesgo !== 'critico') return -1
    if (aRiesgo !== 'critico' && bRiesgo === 'critico') return 1

    if (aRiesgo === 'alto' && bRiesgo !== 'alto') return -1
    if (aRiesgo !== 'alto' && bRiesgo === 'alto') return 1

    const aScore = toNumber(a.evaluacion?.score_total)
    const bScore = toNumber(b.evaluacion?.score_total)
    if (bScore !== aScore) return bScore - aScore

    return new Date(a.fecha_postulacion || 0) - new Date(b.fecha_postulacion || 0)
  })
})

// FASE 6: KANBAN PIPELINE VIEW COMPUTED
const pipelineColumns = computed(() => {
  const list = filteredRows.value
  return [
    { label: 'Postulado', estado: 'enviada', items: list.filter(r => r.estado === 'enviada') },
    { label: 'En Evaluación', estado: 'en_revision', items: list.filter(r => r.estado === 'en_revision') },
    { label: 'Preseleccionado', estado: 'validada', items: list.filter(r => r.estado === 'validada') },
    { label: 'Observado', estado: 'observada', items: list.filter(r => r.estado === 'observada') },
    { label: 'Aprobado', estado: 'seleccionado', items: list.filter(r => r.estado === 'seleccionado') },
    { label: 'Rechazado', estado: 'rechazada', items: list.filter(r => r.estado === 'rechazada') },
  ]
})

const moveCandidatePipeline = async (row, direction) => {
  const states = ['enviada', 'en_revision', 'validada', 'observada', 'seleccionado', 'rechazada']
  const currentIdx = states.indexOf(row.estado)
  if (currentIdx < 0) return
  const nextIdx = currentIdx + direction
  if (nextIdx >= 0 && nextIdx < states.length) {
    const nextState = states[nextIdx]
    try {
      await api.put(`/postulaciones/${row.id}/estado`, { estado: nextState })
      row.estado = nextState
      $q.notify({
        type: 'positive',
        message: `Movido a ${statusLabels[nextState]}`,
        position: 'bottom-right',
        timeout: 500
      })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Error al cambiar de estado' })
    }
  }
}

// CARGO WORKSPACE DETAILED KPIs
const kpiCargo = computed(() => {
  const list = filteredRows.value
  const total = list.length
  const evaluados = list.filter(r => r.evaluacion?.score_total !== undefined).length
  const sinEvaluar = total - evaluados
  const preseleccionados = list.filter(r => r.estado === 'seleccionado' || r.estado === 'validada').length
  const auditoria = list.filter(r => r.evaluacion?.clasificacion === 'auditoria_humana').length
  const riesgo = list.filter(r => r.evaluacion?.nivel_riesgo === 'critico' || r.evaluacion?.nivel_riesgo === 'alto').length

  return { total, evaluados, sinEvaluar, preseleccionados, auditoria, riesgo }
})

// Dynamic Schema Recognition
const currentMatriz = computed(() => {
  if (selectedConvocatoria.value?.matriz_evaluacion && Array.isArray(selectedConvocatoria.value.matriz_evaluacion) && selectedConvocatoria.value.matriz_evaluacion.length > 0) {
     return selectedConvocatoria.value.matriz_evaluacion
  }
  return null
})

const dynamicColumns = computed(() => {
   if (!currentMatriz.value) return []
   let cols = []
   currentMatriz.value.forEach((sec, sIdx) => {
     sec.criterios.forEach((crit, cIdx) => {
        cols.push({
           id: `s${sIdx}_c${cIdx}`,
           nombre: crit.nombre,
           puntaje: Number(crit.puntaje) || 0,
           sectionIndex: sIdx
        })
     })
   })
   return cols
})

const extractExtraInfo = (postulacion) => {
  const p = postulacion.postulante
  if (!p) return { area: '-', anio: '-' }
  if (p.formaciones_academicas && Array.isArray(p.formaciones_academicas) && p.formaciones_academicas.length > 0) {
    const mainFormacion = p.formaciones_academicas[0]
    const area = mainFormacion.carrera || '-'
    const fecha = mainFormacion.fecha_titulo || mainFormacion.fecha_diploma || ''
    return {
      area,
      anio: String(fecha || '').match(/\d{4}/)?.[0] || '-'
    }
  }
  return { area: '-', anio: '-' }
}

const createEvalData = (existing = {}) => {
  if (currentMatriz.value) {
    const evalData = {}
    dynamicColumns.value.forEach((col) => {
      evalData[col.id] = existing[col.id] !== undefined ? existing[col.id] : 0
    })
    evalData.observaciones = existing.observaciones || ''
    return evalData
  }

  return {
    a1_diplomado: existing.a1_diplomado || 0,
    a1_especialidad: existing.a1_especialidad || 0,
    a1_maestria: existing.a1_maestria || 0,
    a1_doctorado: existing.a1_doctorado || 0,
    a2_cursos_120: existing.a2_cursos_120 || 0,
    a2_cursos_20: existing.a2_cursos_20 || 0,
    a2_disertante: existing.a2_disertante || 0,
    a2_pedagogico: existing.a2_pedagogico || 0,
    a3_ejercicio_prof: existing.a3_ejercicio_prof || 0,
    a3_docencia: existing.a3_docencia || 0,
    a3_tutorias: existing.a3_tutorias || 0,
    a3_docente_post: existing.a3_docente_post || 0,
    a3_cargos_sim: existing.a3_cargos_sim || 0,
    a4_revistas: existing.a4_revistas || 0,
    a4_libros: existing.a4_libros || 0,
    a4_distinciones: existing.a4_distinciones || 0,
    observaciones: existing.observaciones || '',
  }
}

const calculateTotal = (row) => {
  if (currentMatriz.value) {
     let sum = 0
     dynamicColumns.value.forEach(col => {
       sum += (Number(row.evalData[col.id]) || 0)
     })
     return sum
  } else {
      const d = row.evalData
      if (!d) return 0
      const area1 = Math.min((d.a1_diplomado || 0) + (d.a1_especialidad || 0) + (d.a1_maestria || 0) + (d.a1_doctorado || 0), 20)
      const area2 = Math.min((d.a2_cursos_120 || 0) + (d.a2_cursos_20 || 0) + (d.a2_disertante || 0) + (d.a2_pedagogico || 0), 20)
      const area3 = Math.min((d.a3_ejercicio_prof || 0) + (d.a3_docencia || 0) + (d.a3_tutorias || 0) + (d.a3_docente_post || 0) + (d.a3_cargos_sim || 0), 50)
      const area4 = Math.min((d.a4_revistas || 0) + (d.a4_libros || 0) + (d.a4_distinciones || 0), 10)
      return area1 + area2 + area3 + area4
  }
}

const updateFieldAndSave = (row, field, v) => {
  row.evalData[field] = v
  saveRow(row)
}

const saveRow = async (row, silent = false) => {
  try {
    let t1 = 0, t2 = 0, t3 = 0, t4 = 0, puntajeTotal = 0;
    
    if (currentMatriz.value) {
       puntajeTotal = calculateTotal(row)
    } else {
       const d = row.evalData
       t1 = Math.min((d.a1_diplomado || 0) + (d.a1_especialidad || 0) + (d.a1_maestria || 0) + (d.a1_doctorado || 0), 20)
       t2 = Math.min((d.a2_cursos_120 || 0) + (d.a2_cursos_20 || 0) + (d.a2_disertante || 0) + (d.a2_pedagogico || 0), 20)
       t3 = Math.min((d.a3_ejercicio_prof || 0) + (d.a3_docencia || 0) + (d.a3_tutorias || 0) + (d.a3_docente_post || 0) + (d.a3_cargos_sim || 0), 50)
       t4 = Math.min((d.a4_revistas || 0) + (d.a4_libros || 0) + (d.a4_distinciones || 0), 10)
       puntajeTotal = t1 + t2 + t3 + t4
    }

    await api.post('/evaluaciones-meritos', {
      postulacion_id: row.id,
      puntaje_formacion: t1,
      puntaje_perfeccionamiento: t2,
      puntaje_experiencia: t3,
      puntaje_otros: t4,
      puntaje_total: puntajeTotal,
      detalle_evaluacion: row.evalData,
      observaciones: row.evalData.observaciones,
      pretension_salarial: row.pretension_salarial
    })

    if (!row.evaluacion) {
      row.evaluacion = {}
    }
    row.evaluacion.score_total = puntajeTotal
    row.evaluacion.puntaje_total = puntajeTotal
    row.evaluacion.detalle_evaluacion = { ...row.evalData }
    row.evaluacion.observaciones = row.evalData.observaciones

    if (!silent) {
       $q.notify({ color: 'positive', message: 'Evaluación guardada', icon: 'check', position: 'bottom-right', timeout: 500 })
     }
  } catch (error) {
    console.error(error);
    if (!silent) {
      $q.notify({ color: 'negative', message: 'Error al guardar la fila', position: 'bottom-right' })
    }
  }
}

const debouncedSaveRow = debounce((row) => saveRow(row), 1000)

const saveAll = async () => {
  saving.value = true
  try {
    for (const row of filteredRows.value) {
      await saveRow(row, true)
    }
    $q.notify({ color: 'positive', message: '¡Todo guardado correctamente!' })
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Error al guardar todo' })
  } finally {
    saving.value = false
  }
}

const evaluateAllPending = async () => {
  const pending = filteredRows.value.filter(r => !r.evaluacion?.score_total)
  if (pending.length === 0) {
    $q.notify({ type: 'info', message: 'No hay postulantes sin evaluar en este cargo.', position: 'top' })
    return
  }

  $q.dialog({
    title: 'Evaluación Determinística Masiva',
    message: `¿Desea evaluar automáticamente a los ${pending.length} postulantes pendientes de este cargo?`,
    ok: { label: 'Evaluar Todo', color: 'primary', unelevated: true, rounded: true },
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7', rounded: true },
    persistent: true
  }).onOk(async () => {
    evaluatingBatch.value = true
    batchProgress.value = 0
    batchTotal.value = pending.length
    
    for (let i = 0; i < pending.length; i++) {
      try {
        await api.post(`/evaluations/run/${pending[i].id}`)
        batchProgress.value++
      } catch (error) {
        console.error('Error evaluating', pending[i].id, error)
      }
    }
    
    $q.notify({
      type: 'positive',
      message: `Se evaluaron ${batchProgress.value} postulantes exitosamente.`,
      position: 'top'
    })
    
    evaluatingBatch.value = false
    if (selectedConvocatoria.value) {
      await selectConvocatoria(selectedConvocatoria.value)
    }
  })
}

const meritFields = [
  'a1_diplomado', 'a1_especialidad', 'a1_maestria', 'a1_doctorado',
  'a2_cursos_120', 'a2_cursos_20', 'a2_disertante', 'a2_pedagogico',
  'a3_ejercicio_prof', 'a3_docencia', 'a3_tutorias', 'a3_docente_post', 'a3_cargos_sim',
  'a4_revistas', 'a4_libros', 'a4_distinciones'
]

const FIELD_LABELS = {
  a1_diplomado: "Diplomado (3 pts)",
  a1_especialidad: "Especialización (4 pts)",
  a1_maestria: "Maestría (6 pts)",
  a1_doctorado: "Doctorado (7 pts)",
  a2_cursos_120: "Cursos area > 120 hrs (Max 9)",
  a2_cursos_20: "Cursillos/Semin. > 20 hrs (Max 5)",
  a2_disertante: "Disertante congresos (Max 3)",
  a2_pedagogico: "Formación Pedagóg. (Max 3)",
  a3_ejercicio_prof: "Ejercicio Profesional (Max 15)",
  a3_docencia: "Docencia Ejercida (Max 10)",
  a3_tutorias: "Tutoría de Tesis (Max 5)",
  a3_docente_post: "Docente Postgrado (Max 5)",
  a3_cargos_sim: "Cargos Similares (Max 15)",
  a4_revistas: "Revistas Indexadas (Max 3)",
  a4_libros: "Libros/Textos (Max 3)",
  a4_distinciones: "Distinciones Honoríf. (Max 4)",
}

const getFieldLabel = (field) => FIELD_LABELS[field] || "Puntuación"

const getFieldColorClass = (field) => {
  if (field.startsWith('a1')) return 'text-primary'
  if (field.startsWith('a2')) return 'text-secondary'
  if (field.startsWith('a3')) return 'text-primary'
  return 'text-secondary'
}

const getOptionsForField = (field) => {
  const options = {
    a1_diplomado: [0, 3],
    a1_especialidad: [0, 4],
    a1_maestria: [0, 6],
    a1_doctorado: [0, 7],
    a2_cursos_120: [0, 3, 6, 9],
    a2_cursos_20: [0, 1, 2, 3, 4, 5],
    a2_disertante: [0, 1, 2, 3],
    a2_pedagogico: [0, 1, 2, 3],
    a3_ejercicio_prof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    a3_docencia: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    a3_tutorias: [0, 1, 2, 3, 4, 5],
    a3_docente_post: [0, 1, 2, 3, 4, 5],
    a3_cargos_sim: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    a4_revistas: [0, 1, 2, 3],
    a4_libros: [0, 1, 2, 3],
    a4_distinciones: [0, 1, 2, 3, 4],
  }
  return options[field] || [0]
}

const getDynamicOptions = (maxPuntaje) => {
   let opts = []
   for(let i=0; i<=maxPuntaje; i++) {
     opts.push(i)
   }
   return opts
}

const columns = [
  {
    name: 'postulante',
    label: 'Postulante',
    field: (row) => row.postulante?.nombres,
    sortable: true,
    align: 'left',
  },
  {
    name: 'fecha_postulacion',
    label: 'Fecha Postulacion',
    field: 'fecha_postulacion',
    sortable: true,
    align: 'left',
  },
  {
    name: 'pretension_salarial',
    label: 'Pretension Salarial',
    field: 'pretension_salarial',
    sortable: true,
    align: 'center',
  },
  {
    name: 'puntaje_tecnico',
    label: 'Puntaje Meritos',
    field: (row) => row.evaluacion?.score_total || '-',
    sortable: true,
    align: 'center',
  },
  { name: 'estado', label: 'Estado Actual', field: 'estado', sortable: true, align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' },
]

const formatDate = (val) => {
  if (!val) return '-'
  return date.formatDate(val, 'DD-MM-YYYY')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'enviada':
      return 'indigo-7'
    case 'en_revision':
      return 'orange-7'
    case 'validada':
      return 'teal-7'
    case 'observada':
      return 'deep-orange-7'
    case 'rechazada':
      return 'red-7'
    case 'seleccionado':
      return 'positive'
    default:
      return 'grey-7'
  }
}

const loadConvocatorias = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/convocatorias-con-postulantes')
    convocatorias.value = data
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar las convocatorias' })
  } finally {
    loading.value = false
  }
}

const selectConvocatoria = async (convocatoria) => {
  clearFilters()
  selectedConvocatoria.value = convocatoria
  // Persist selection in query params
  router.replace({ query: { ...route.query, conv_id: convocatoria.id } })
  loading.value = true
  try {
    const { data } = await api.get(`/postulaciones?convocatoria_id=${convocatoria.id}`)
    
    // Map with interactive merit variables
    rows.value = data.map((postulacion) => {
      const existing = {
        ...(postulacion.evaluacion?.detalle_evaluacion || {}),
        observaciones: postulacion.evaluacion?.observaciones || ''
      }
      return {
        ...postulacion,
        extraInfo: extractExtraInfo(postulacion),
        evalData: createEvalData(existing)
      }
    })

    // Restore sede and cargo from query
    const sedes = [...new Set(data.map(r => r.oferta?.sede?.nombre).filter(Boolean))]
    const querySede = route.query.sede
    if (querySede && sedes.includes(querySede)) {
      filterSede.value = querySede
      setTimeout(() => {
        const queryCargo = route.query.cargo
        if (queryCargo) filterCargo.value = queryCargo
      }, 100)
    } else if (sedes.length > 0) {
      filterSede.value = sedes[0]
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar postulantes' })
  } finally {
    loading.value = false
  }
}

const updateStatus = async (row) => {
  try {
    await api.put(`/postulaciones/${row.id}/estado`, { estado: row.estado })
    $q.notify({ type: 'positive', message: 'Estado actualizado', position: 'top' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al actualizar estado' })
  }
}

// FASE 4: STICKY ACTION BAR & QUICK DECISION WORKFLOW
const handleDecisionAction = async ({ id, action, next }) => {
  try {
    const estado = action === 'aprobar' ? 'seleccionado' : action === 'rechazar' ? 'rechazada' : 'observada'
    await api.put(`/postulaciones/${id}/estado`, { estado })
    
    const row = rows.value.find(r => String(r.id) === String(id))
    if (row) row.estado = estado

    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `Candidato calificado como ${statusLabels[estado]} con éxito.`,
      position: 'top',
      timeout: 800
    })

    if (next) {
      // Automatic navigation flow to the next candidate
      const targetRows = viewMode.value === 'auditoria' ? auditoriaRows.value : filteredRows.value
      const currentIdx = targetRows.findIndex(r => String(r.id) === String(id))
      
      if (currentIdx >= 0 && currentIdx < targetRows.length - 1) {
        const nextRow = targetRows[currentIdx + 1]
        router.replace({ query: { ...route.query, postulacion_id: nextRow.id } })
      } else {
        $q.notify({
          type: 'info',
          message: 'Fin de la lista de evaluación.',
          position: 'top'
        })
        closeExpedienteDialog()
      }
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al procesar la decisión técnica.' })
  }
}

const viewExpediente = (row) => {
  saveScrollPosition()
  const query = { ...route.query, postulacion_id: row.id }
  if (filterSede.value) query.sede = filterSede.value
  if (filterCargo.value) query.cargo = filterCargo.value
  router.push({ query })
}

const closeExpedienteDialog = () => {
  const query = { ...route.query }
  delete query.postulacion_id
  router.push({ query })
  restoreScrollPosition()
}

const navigateExpediente = (direction) => {
  const targetRows = viewMode.value === 'auditoria' ? auditoriaRows.value : filteredRows.value
  const currentIdx = targetRows.findIndex(r => String(r.id) === String(selectedPostulacionId.value))
  if (currentIdx < 0) return
  const nextIdx = currentIdx + direction
  if (nextIdx >= 0 && nextIdx < targetRows.length) {
    const nextRow = targetRows[nextIdx]
    const query = { ...route.query, postulacion_id: nextRow.id }
    router.replace({ query })
  }
}

const hasPrevExpediente = computed(() => {
  const targetRows = viewMode.value === 'auditoria' ? auditoriaRows.value : filteredRows.value
  const idx = targetRows.findIndex(r => String(r.id) === String(selectedPostulacionId.value))
  return idx > 0
})

const hasNextExpediente = computed(() => {
  const targetRows = viewMode.value === 'auditoria' ? auditoriaRows.value : filteredRows.value
  const idx = targetRows.findIndex(r => String(r.id) === String(selectedPostulacionId.value))
  return idx >= 0 && idx < targetRows.length - 1
})

watch(() => route.query.postulacion_id, (newVal) => {
  if (newVal) {
    selectedPostulacionId.value = newVal
    showExpedienteDialog.value = true
  } else {
    showExpedienteDialog.value = false
    selectedPostulacionId.value = null
  }
}, { immediate: true })

const handleQuickEvaluate = async (postulacionId) => {
  $q.loading.show({ message: 'Evaluando postulante determinísticamente...' })
  try {
    const response = await api.post(`/evaluations/run/${postulacionId}`)
    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: response.data.message || 'Evaluación automática completada.',
      position: 'top'
    })
    if (selectedConvocatoria.value) {
      await selectConvocatoria(selectedConvocatoria.value)
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      icon: 'error',
      message: error.response?.data?.message || 'Error al evaluar postulante',
      position: 'top'
    })
  } finally {
    $q.loading.hide()
  }
}

const deletePostulante = (row) => {
  $q.dialog({
    title: 'Confirmar eliminacion',
    message: `Esta seguro de eliminar a ${row.postulante.nombres} ${row.postulante.apellidos}? Esta acción no se puede deshacer.`,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, rounded: true },
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7', rounded: true }
  }).onOk(async () => {
    try {
      await api.delete(`/postulaciones/${row.id}`)
      $q.notify({ type: 'positive', message: 'Postulante eliminado correctamente', position: 'top' })
      loadConvocatorias()
      if (selectedConvocatoria.value) {
        selectConvocatoria(selectedConvocatoria.value)
      }
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al eliminar' })
    }
  })
}

const exportConvocatoriaReport = async (conv) => {
  try {
    $q.loading.show({ message: 'Preparando reporte Excel...' })
    const endpoint = `/postulaciones/export/${conv.id}`
    const response = await api.get(endpoint, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const fileName = `Reporte_Convocatoria_${conv.titulo.replace(/\s+/g, '_')}.xlsx`
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al descargar reporte' })
  } finally {
    $q.loading.hide()
  }
}

const exportGeneralReport = async () => {
  if (!selectedConvocatoria.value) return
  await exportConvocatoriaReport(selectedConvocatoria.value)
}

const processImport = async () => {
  if (!importFile.value) return
  importing.value = true
  const formData = new FormData()
  formData.append('file', importFile.value)

  try {
    const { data } = await api.post('/importar-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    $q.notify({
      type: 'positive',
      message: `Importación completada: ${data.imported} registros procesados.`,
      position: 'top',
    })
    showImportDialog.value = false
    importFile.value = null
    loadConvocatorias()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al importar los datos' })
  } finally {
    importing.value = false
  }
}

onMounted(async () => {
  await loadConvocatorias()
  // Restore convocatoria from query param (deep link)
  const convId = route.query.conv_id
  if (convId && convocatorias.value.length > 0) {
    const conv = convocatorias.value.find(c => String(c.id) === String(convId))
    if (conv) {
      await selectConvocatoria(conv)
    }
  }
})
</script>

<style scoped>
.scroll-container {
  max-width: 100%;
  overflow-x: auto;
}
.matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 11px;
}
.matrix-table th, .matrix-table td {
  border-right: 1px solid rgba(100,110,180,0.15);
  border-bottom: 1px solid rgba(100,110,180,0.15);
  padding: 6px;
}
.area-title {
  font-size: 11px;
  letter-spacing: 1px;
  padding: 10px;
  font-weight: 900;
  border-top: 1px solid rgba(100,110,180,0.15);
}
.header-v {
  font-size: 9px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  background-color: #f8f9fa !important;
  color: #334;
  font-weight: 850;
  text-align: left;
  padding: 12px 6px !important;
  border-top: 1px solid rgba(100,110,180,0.15);
}
.sub-h {
  font-size: 9px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  height: 160px;
  min-width: 32px;
  white-space: nowrap;
  background-color: #f1f5f9 !important;
  color: #1e293b;
  font-weight: 850;
  text-align: left;
  padding: 12px 6px !important;
}
.sticky-col { position: sticky; z-index: 40; }
.first-col { left: 0; width: 40px; background-color: #f8f9fa !important; z-index: 45; border-right: 2px solid rgba(102, 51, 153, 0.4); }
.second-col {
  left: 40px;
  min-width: 200px;
  z-index: 45;
  background-color: white !important;
  border-right: 2px solid rgba(102, 51, 153, 0.4);
  box-shadow: 4px 0 10px rgba(0,0,0,0.03);
}
.main-headers th {
  top: 0;
  position: sticky;
  z-index: 50;
  background-color: #f8f9fa;
}
.final-score-header {
  z-index: 50;
  font-weight: 900;
  border-top: 1px solid rgba(100,110,180,0.15);
}
.header-cell {
  background-color: #f8f9fa;
  border-top: 1px solid rgba(100,110,180,0.15);
}
.data-row:hover td { background-color: #f1f5f9 !important; }
.score-cell {
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  padding: 0 !important;
  min-width: 40px;
  height: 40px;
  text-align: center;
  background-color: white;
}
.score-cell:hover {
  background-color: #ebf4ff;
  box-shadow: inset 0 0 10px rgba(63, 81, 181, 0.08);
}
.cell-val {
  font-size: 15px;
  font-weight: 900;
  line-height: 40px;
  width: 100%;
  height: 100%;
}
.btn-fixed {
  width: 38px;
  height: 38px;
  font-weight: 800;
  border-radius: 8px;
  font-size: 13px;
}
.cell-textarea {
  width: 100%;
  border: none;
  font-size: 10px;
  padding: 6px;
  resize: vertical;
  background: transparent;
}
.cell-textarea:focus { outline: 1px solid #663399; background: white; }

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.status-select-modern {
  border-radius: 9999px;
  min-width: 130px;
  height: 28px;
  font-size: 9px;
  overflow: hidden;
  transition: all 0.2s ease;
}
.status-select-modern:hover {
  filter: brightness(1.05);
  transform: scale(1.03);
}
:deep(.status-select-modern .q-field__control) {
  height: 28px !important;
  min-height: 28px !important;
}
</style>
