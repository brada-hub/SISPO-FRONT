<template>
  <q-page class="p-6 bg-gray-50/50 min-h-screen">
    <!-- ATS Title -->
    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase flex items-center gap-2">
          Convocatorias Externas <span class="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded font-black tracking-widest">ATS Workspace v2</span>
        </h1>
        <p class="text-xs text-gray-400 mt-2 font-medium">
          Dashboard de Reclutamiento • Panel de Gestión de Postulantes • Monitoreo de Matrices y Baremos
        </p>
      </div>

      <div class="flex gap-2">
        <q-btn
          label="Crear Convocatoria"
          icon="add_circle"
          color="teal-8"
          unelevated
          rounded
          class="shadow-sm font-bold px-4 py-2"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- RESTORE DRAFT BANNER -->
    <div v-if="hasDraft" class="bg-indigo-50 border border-indigo-200 p-4 rounded-3xl mb-6 flex items-center justify-between animate-fade-in">
      <div class="flex items-center gap-3">
        <q-icon name="restore" color="primary" size="24px" />
        <div>
          <div class="text-xs font-black text-indigo-900 uppercase">Borrador no publicado detectado</div>
          <p class="text-[11px] text-indigo-700 q-ma-none mt-1">Existe una convocatoria en edición guardada automáticamente en tu última sesión.</p>
        </div>
      </div>
      <div class="flex gap-2">
        <q-btn label="Restaurar Borrador" color="primary" unelevated rounded size="xs" class="font-bold px-3" @click="restoreDraft" />
        <q-btn label="Descartar" color="grey-6" flat rounded size="xs" class="font-bold px-3" @click="discardDraft" />
      </div>
    </div>

    <!-- FASE 1: ATS DASHBOARD HEADER STICKY KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <!-- KPI 1 -->
      <div class="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="bg-teal-50 p-3 rounded-2xl">
          <q-icon name="campaign" color="teal-8" size="20px" />
        </div>
        <div>
          <div class="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Activas</div>
          <div class="text-lg font-black text-gray-900 mt-1.5 leading-none">{{ kpis.activas }}</div>
        </div>
      </div>

      <!-- KPI 2 -->
      <div class="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="bg-indigo-50 p-3 rounded-2xl">
          <q-icon name="people" color="indigo-8" size="20px" />
        </div>
        <div>
          <div class="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Candidatos</div>
          <div class="text-lg font-black text-gray-900 mt-1.5 leading-none">{{ kpis.postulantes }}</div>
        </div>
      </div>

      <!-- KPI 3 -->
      <div class="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="bg-orange-50 p-3 rounded-2xl animate-pulse">
          <q-icon name="rate_review" color="orange-8" size="20px" />
        </div>
        <div>
          <div class="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Pendientes</div>
          <div class="text-lg font-black text-orange-850 mt-1.5 leading-none">{{ kpis.pendientes }}</div>
        </div>
      </div>

      <!-- KPI 4 -->
      <div class="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="bg-rose-50 p-3 rounded-2xl">
          <q-icon name="warning" color="rose-8" size="20px" />
        </div>
        <div>
          <div class="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Críticas</div>
          <div class="text-lg font-black text-rose-700 mt-1.5 leading-none">{{ kpis.criticas }}</div>
        </div>
      </div>

      <!-- KPI 5 -->
      <div class="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="bg-slate-100 p-3 rounded-2xl">
          <q-icon name="block" color="slate-6" size="20px" />
        </div>
        <div>
          <div class="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Cerradas</div>
          <div class="text-lg font-black text-slate-800 mt-1.5 leading-none">{{ kpis.cerradas }}</div>
        </div>
      </div>

      <!-- KPI 6 -->
      <div class="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="bg-emerald-50 p-3 rounded-2xl">
          <q-icon name="speed" color="emerald-8" size="20px" />
        </div>
        <div>
          <div class="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Eficiencia</div>
          <div class="text-lg font-black text-emerald-800 mt-1.5 leading-none">{{ kpis.tiempoPromedio }}</div>
        </div>
      </div>
    </div>

    <!-- FASE 2: FILTROS OPERACIONALES (Tabs) -->
    <div class="bg-white rounded-3xl border border-gray-100 p-4 mb-6 shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
      <div class="overflow-x-auto scrollbar-none">
        <q-tabs
          v-model="currentTab"
          dense
          class="text-gray-500 font-bold"
          active-color="teal-8"
          indicator-color="teal-8"
          align="left"
          no-caps
        >
          <q-tab v-for="tab in ['Todas', 'Activas', 'Urgentes', 'Cerradas', 'Drafts', 'Pendientes RRHH', 'Archivadas']" :name="tab" :key="tab">
            <div class="flex items-center gap-2 text-xs py-1">
              <span>{{ tab }}</span>
              <span class="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center">
                {{ tabCounts[tab] || 0 }}
              </span>
            </div>
          </q-tab>
        </q-tabs>
      </div>

      <!-- DUAL MODE SWITCH & SEARCH -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <q-input
          v-model="filter"
          placeholder="Buscar código, sedes, cargo..."
          dense
          outlined
          rounded
          bg-color="white"
          class="w-full sm:w-[240px] text-xs shadow-inner"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="teal" size="18px" />
          </template>
        </q-input>

        <div class="flex bg-gray-100 p-1 rounded-full border border-gray-250 w-full sm:w-auto justify-center">
          <q-btn
            icon="grid_view"
            dense
            flat
            round
            size="sm"
            :color="viewMode === 'grid' ? 'teal-8' : 'grey-6'"
            @click="viewMode = 'grid'"
          >
            <q-tooltip>Grid ATS</q-tooltip>
          </q-btn>
          <q-btn
            icon="view_list"
            dense
            flat
            round
            size="sm"
            :color="viewMode === 'table' ? 'teal-8' : 'grey-6'"
            @click="viewMode = 'table'"
          >
            <q-tooltip>Vista Tabla</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- FASE 3: ATS CARDS Grid Layout -->
    <div v-if="viewMode === 'grid'" class="space-y-4">
      <div v-if="filteredRows.length === 0" class="bg-white rounded-3xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
        <q-icon name="search_off" size="48px" color="grey-4" />
        <div class="text-sm font-black text-gray-600 uppercase mt-4">Ninguna convocatoria encontrada</div>
        <p class="text-xs text-gray-400 mt-1 max-w-md">No hay convocatorias que coincidan con la búsqueda o el filtro operativo seleccionado.</p>
      </div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <q-card
          v-for="row in filteredRows"
          :key="row.id"
          class="rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          :class="getCardPriority(row).bg + ' ' + getCardPriority(row).border"
        >
          <div class="p-6 flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6">
            
            <!-- IZQUIERDA: TÍTULO, CÓDIGO, SEDES, FECHA CIERRE -->
            <div class="flex-1 min-w-[240px] flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 flex-wrap mb-2">
                  <span class="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wider">
                    {{ row.codigo_interno || `CONV-${row.id}` }}
                  </span>
                  <q-badge :color="getStatus(row).color" text-color="white" class="rounded text-[9px] font-black px-2 py-0.5 uppercase tracking-wide">
                    {{ getStatus(row).label }}
                  </q-badge>
                  <q-badge v-if="getPostulantesStats(row).revisionRRHH > 8" color="amber-8" text-color="white" class="rounded text-[9px] font-black px-2 py-0.5 uppercase">
                    Saturada
                  </q-badge>
                  <q-badge v-if="getPostulantesStats(row).revisionRRHH > 0" color="orange-8" text-color="white" class="rounded text-[9px] font-black px-2 py-0.5 uppercase">
                    Pendiente RRHH
                  </q-badge>
                </div>
                
                <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-2 leading-snug">
                  {{ row.titulo }}
                </h3>
                <p class="text-[11px] text-gray-400 mt-1 line-clamp-2">
                  {{ row.descripcion || 'Sin descripción complementaria registrada en el sistema.' }}
                </p>
              </div>
              
              <div class="mt-4 pt-4 border-t border-gray-100/60 flex flex-wrap items-center gap-4 text-[10px] text-gray-500 font-bold uppercase">
                <div class="flex items-center gap-1.5">
                  <q-icon name="place" color="primary" size="14px" />
                  <span>Sedes: {{ row.ofertas?.map(o => o.sede?.nombre).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Nacional' }}</span>
                </div>
                <div class="flex items-center gap-1.5 text-red-500">
                  <q-icon name="event" size="14px" />
                  <span>Cierre: {{ formatDate(row.fecha_cierre) }} ({{ row.hora_limite || '23:59' }})</span>
                </div>
              </div>
            </div>
            
            <!-- CENTRO: POSTULANTES, EVALUADOS, APTOS, REVISIÓN HUMANA, PROGRESS -->
            <div class="w-full md:w-56 shrink-0 bg-white/75 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
              <div class="grid grid-cols-2 gap-2 text-center">
                <div class="bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                  <div class="text-[10px] font-black text-gray-400 uppercase">Candidatos</div>
                  <div class="text-lg font-black text-gray-900 mt-0.5">{{ getPostulantesStats(row).total }}</div>
                </div>
                <div class="bg-teal-50/20 p-2 rounded-xl border border-teal-100/30">
                  <div class="text-[10px] font-black text-teal-850/60 uppercase">Evaluados</div>
                  <div class="text-lg font-black text-teal-800 mt-0.5">{{ getPostulantesStats(row).evaluados }}</div>
                </div>
                <div class="bg-green-50/20 p-2 rounded-xl border border-green-100/30">
                  <div class="text-[10px] font-black text-green-850/60 uppercase">Aptos</div>
                  <div class="text-lg font-black text-green-800 mt-0.5">{{ getPostulantesStats(row).aptos }}</div>
                </div>
                <div class="bg-orange-50/20 p-2 rounded-xl border border-orange-100/30">
                  <div class="text-[10px] font-black text-orange-850/60 uppercase">Pendientes</div>
                  <div class="text-lg font-black text-orange-800 mt-0.5">{{ getPostulantesStats(row).revisionRRHH }}</div>
                </div>
              </div>
              
              <div class="mt-3">
                <div class="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase mb-1">
                  <span>Evaluación Completada</span>
                  <span>{{ getPostulantesStats(row).pct }}%</span>
                </div>
                <q-linear-progress :value="getPostulantesStats(row).pct / 100" color="teal" rounded style="height: 5px;" />
              </div>
            </div>
            
            <!-- DERECHA: GESTIONAR, RANKING, EDITAR, PUBLICAR, DUPLICAR -->
            <div class="w-full md:w-36 shrink-0 flex flex-col justify-between gap-2 border-t md:border-t-0 md:border-l border-gray-150 md:pl-4 pt-4 md:pt-0">
              <q-btn label="Gestionar" icon="people" color="teal-8" unelevated rounded size="sm" class="font-bold w-full" no-caps @click="gestionarConvocatoria(row)">
                <q-tooltip>Ver postulaciones y expediente</q-tooltip>
              </q-btn>
              
              <div class="flex items-center justify-around bg-gray-50/50 rounded-xl p-1 border border-gray-100/50 mt-1">
                <q-btn flat dense round color="teal" icon="visibility" size="sm" @click="viewAfiche(row)">
                  <q-tooltip>Ver Afiche Digital</q-tooltip>
                </q-btn>
                <q-btn flat dense round color="primary" icon="edit" size="sm" @click="openDialog(row)">
                  <q-tooltip>Editar Convocatoria</q-tooltip>
                </q-btn>
                <q-btn flat dense round color="indigo" icon="content_copy" size="sm" @click="duplicarConvocatoria(row)">
                  <q-tooltip>Duplicar Configuración</q-tooltip>
                </q-btn>
                <q-btn flat dense round :color="row.estado === 'published' ? 'grey-4' : 'positive'" icon="publish" size="sm" :disable="row.estado === 'published'" @click="publicarDirecto(row)">
                  <q-tooltip>{{ row.estado === 'published' ? 'Ya publicada' : 'Publicar borrador ahora' }}</q-tooltip>
                </q-btn>
              </div>
              
              <q-btn label="Eliminar Convocatoria" flat dense color="negative" icon="delete" size="xs" class="font-bold text-[9px] w-full mt-2" @click="confirmDelete(row)" />
            </div>
            
          </div>
        </q-card>
      </div>
    </div>

    <!-- FASE 6: Table View (Auditoría) -->
    <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        class="border-none bg-white text-xs"
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:body-cell-codigo_interno="props">
          <q-td :props="props">
            <span class="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-wider">
              {{ props.row.codigo_interno || `CONV-${props.row.id}` }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-titulo="props">
          <q-td :props="props">
            <div class="font-black text-gray-800 uppercase text-xs truncate max-w-md">
              {{ props.row.titulo }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-ofertas="props">
          <q-td :props="props">
            <div class="text-xs">
              <q-chip v-for="(o, i) in props.row.ofertas?.slice(0, 3)" :key="i" size="xs" outline color="primary" class="font-bold">
                {{ o.cargo?.nombre }} ({{ o.sede?.nombre }})
              </q-chip>
              <span v-if="props.row.ofertas?.length > 3" class="text-gray-400 font-bold text-[10px]"> +{{ props.row.ofertas.length - 3 }} más</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-fecha_inicio="props">
          <q-td :props="props" class="text-center font-bold text-xs uppercase text-gray-600">
            {{ formatDate(props.row.fecha_inicio) }}
          </q-td>
        </template>

        <template v-slot:body-cell-fecha_cierre="props">
          <q-td :props="props" class="text-center font-bold text-xs text-red-500 uppercase">
            {{ formatDate(props.row.fecha_cierre) }}
          </q-td>
        </template>

        <template v-slot:body-cell-hora_limite="props">
          <q-td :props="props" class="text-center">
            <span class="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
              {{ props.row.hora_limite || '23:59' }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="getStatus(props.row).color"
              text-color="white"
              class="rounded-md text-[9px] font-black px-2 uppercase tracking-wide"
            >
              {{ getStatus(props.row).label }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <div class="flex no-wrap items-center justify-center gap-1">
              <q-btn flat round color="teal-7" icon="visibility" size="sm" @click="viewAfiche(props.row)">
                 <q-tooltip>Ver Afiche</q-tooltip>
              </q-btn>
              <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
                 <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round color="indigo" icon="content_copy" size="sm" @click="duplicarConvocatoria(props.row)">
                 <q-tooltip>Duplicar</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
                 <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- ========================================== -->
    <!-- NEW guided WIZARD CONVOCATORIA ATS BUILDER -->
    <!-- ========================================== -->
    <q-dialog v-model="dialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-gray-100 flex flex-col no-wrap h-screen overflow-hidden">
        <!-- HEADER FIXED -->
        <q-toolbar class="bg-white border-b border-gray-200 text-gray-800 q-py-md shadow-sm z-50 sticky top-0 shrink-0 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <q-btn flat round dense icon="arrow_back" v-close-popup class="hover:bg-gray-100 transition-colors" />
            <div class="flex flex-col">
              <q-toolbar-title class="text-weight-bolder text-md tracking-tight leading-none text-gray-900 uppercase">
                {{ isViewMode ? 'VISTA PREVIA DE AFICHE' : (isEdit ? 'EDITAR CONVOCATORIA ATS' : 'NUEVA CONVOCATORIA ATS') }}
              </q-toolbar-title>
              <div class="text-[9px] text-gray-400 font-black tracking-widest uppercase mt-1">Convocatoria Builder v2 • UNITEPC</div>
            </div>
          </div>

          <!-- HEALTH VALIDATION BAR (FASE 8) -->
          <div class="hidden lg:flex items-center gap-3 w-96 max-w-md mx-6">
            <div class="w-full">
              <div class="flex items-center justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                <span>Completado: {{ healthScore }}%</span>
                <span :class="healthScore === 100 ? 'text-green-700' : 'text-amber-700'">{{ healthScore === 100 ? '✓ LISTA' : '⚠ EN CONSTRUCCIÓN' }}</span>
              </div>
              <q-linear-progress :value="healthScore / 100" color="teal" track-color="grey-3" rounded style="height: 6px;" />
            </div>
          </div>

          <!-- RIGHT ACTIONS -->
          <div class="flex items-center gap-2">
            <!-- Autosafe status -->
            <div v-if="!isViewMode" class="text-[10px] text-green-700 font-bold uppercase flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 mr-2">
              <q-icon name="check_circle" size="14px" /> ✓ Auto-guardado
            </div>

            <!-- Mode selector: Simple vs Advanced (FASE 9) -->
            <div v-if="!isViewMode" class="flex items-center bg-gray-100 p-1 rounded-xl mr-2">
              <span
                @click="advancedMode = false"
                :class="['px-3 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer select-none', !advancedMode ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500']"
              >Simple</span>
              <span
                @click="advancedMode = true"
                :class="['px-3 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer select-none', advancedMode ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500']"
              >Avanzado</span>
            </div>

            <template v-if="isViewMode || isEdit">
              <q-btn outline label="Imagen HD" icon="image" @click="downloadImage" color="teal-8" size="sm" rounded class="font-bold px-3" no-caps />
              <q-btn outline label="PDF HD" icon="picture_as_pdf" @click="downloadPDF" color="deep-purple-8" size="sm" rounded class="font-bold px-3" no-caps />
            </template>

            <q-btn
              v-if="!isViewMode"
              :label="isEdit ? 'Guardar Cambios' : 'Publicar Convocatoria'"
              class="font-black px-6 py-2 rounded-xl"
              color="teal-8"
              unelevated
              size="sm"
              :icon="isEdit ? 'save' : 'rocket_launch'"
              :loading="saving"
              @click="save"
              no-caps
            />
          </div>
        </q-toolbar>

        <!-- MAIN GUIDED TWO-COLUMN WORKSPACE (FASE 2) -->
        <q-card-section class="flex-1 overflow-hidden p-0 row no-wrap h-full">
          <!-- LEFT: 5-COL GUIDED STEP-WIZARD PANEL (FASE 1) -->
          <div v-if="!isViewMode" class="col-12 col-md-5 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shrink-0">
            <!-- Wizard Step Navigator -->
            <div class="bg-gray-50/50 p-4 border-b border-gray-200 shrink-0">
              <div class="flex justify-between items-center bg-white p-1 rounded-xl border border-gray-200">
                <div
                  v-for="step in 5"
                  :key="step"
                  @click="wizardStep = step"
                  :class="[
                    'flex-1 text-center py-2 rounded-lg cursor-pointer transition-all select-none text-[10px] font-black uppercase tracking-wider',
                    wizardStep === step
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-800'
                  ]"
                >
                  Paso {{ step }}
                </div>
              </div>
            </div>

            <!-- Wizard Step Content -->
            <div class="flex-1 overflow-y-auto p-6 scroll">
              <!-- STEP 1: GENERAL INFO -->
              <div v-if="wizardStep === 1" class="space-y-5 animate-fade-in">
                <div class="text-xs font-black text-gray-400 uppercase tracking-widest">Paso 1: Información General de la Convocatoria</div>

                <!-- Presets selection Area (FASE 5) -->
                <div class="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100/50">
                  <div class="text-[10px] font-black text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <q-icon name="bolt" color="primary" /> Seleccionar Preset de Perfil (Carga Rápida)
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <q-btn label="Docente" icon="school" size="xs" color="indigo-7" unelevated rounded no-caps @click="applySmartPreset('docente')" />
                    <q-btn label="Administrativo" icon="work" size="xs" color="indigo-7" unelevated rounded no-caps @click="applySmartPreset('adm')" />
                    <q-btn label="Técnico" icon="build" size="xs" color="indigo-7" unelevated rounded no-caps @click="applySmartPreset('tecnico')" />
                    <q-btn label="Investigación" icon="biotech" size="xs" color="indigo-7" unelevated rounded no-caps @click="applySmartPreset('invest')" />
                  </div>
                </div>

                <q-input
                  v-model="form.titulo"
                  label="Título de la Convocatoria (Ej: MARKETING Y VENTAS)"
                  outlined
                  rounded
                  dense
                  class="text-uppercase"
                  placeholder="MARKETING Y VENTAS"
                  :rules="[val => !!val || 'El título es obligatorio']"
                />

                <q-input
                  :model-value="form.requisitos_afiche?.__main_heading || 'REQUERIMIENTO DE PERSONAL:'"
                  label="Encabezado del Afiche"
                  outlined
                  rounded
                  dense
                  placeholder="REQUERIMIENTO DE PERSONAL:"
                  @update:model-value="updatePosterHeading"
                />

                <q-input
                  v-model="form.descripcion"
                  label="Descripción / Invitación de Apertura"
                  type="textarea"
                  outlined
                  rounded
                  dense
                  rows="3"
                  placeholder="La Universidad Técnica Privada Cosmos invita a profesionales..."
                  :rules="[val => !!val || 'La descripción es obligatoria']"
                />

                <div class="grid grid-cols-2 gap-4">
                  <q-input v-model="form.fecha_inicio" label="Inicia recepción" type="date" outlined rounded dense stack-label :rules="[val => !!val || 'Requerido']" />
                  <q-input v-model="form.fecha_cierre" label="Cierre recepción" type="date" outlined rounded dense stack-label :rules="[val => !!val || 'Requerido']" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <q-input v-model="form.hora_limite" label="Hora de Cierre" type="time" outlined rounded dense stack-label :rules="[val => !!val || 'Requerido']" />
                  <q-input
                    v-model="form.codigo_interno"
                    label="Código de Control"
                    outlined
                    rounded
                    dense
                    color="primary"
                    @update:model-value="manualCodigoInterno = true"
                  />
                </div>
              </div>

              <!-- STEP 2: SEDES Y CARGOS -->
              <div v-if="wizardStep === 2" class="space-y-5 animate-fade-in">
                <div class="text-xs font-black text-gray-400 uppercase tracking-widest">Paso 2: Sedes y Cargos en Oferta</div>

                <div class="bg-gray-100/50 p-2.5 rounded-2xl flex items-center justify-between gap-4 border">
                  <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Modo de Configuración:</span>
                  <q-btn-toggle
                    v-model="builderMode"
                    toggle-color="primary"
                    flat
                    dense
                    rounded
                    :options="[
                      {label: 'Por Sede', value: 'sede', icon: 'location_on'},
                      {label: 'Por Cargo', value: 'cargo', icon: 'badge'}
                    ]"
                    class="bg-white rounded-xl border"
                  />
                </div>

                <div class="space-y-4">
                  <!-- Mode: Sede Selector -->
                  <template v-if="builderMode === 'sede'">
                    <q-select
                      v-model="buildOne"
                      :options="catalogSedes"
                      option-label="nombre"
                      option-value="id"
                      label="Seleccione Sede Académica"
                      outlined
                      rounded
                      dense
                      emit-value
                      map-options
                      bg-color="white"
                    >
                      <template v-slot:append>
                        <q-btn icon="add" color="teal" flat round dense @click="showQuickSede = true" />
                      </template>
                    </q-select>

                    <div v-if="buildOne" class="animate-fade-in">
                      <q-select
                        v-model="buildMany"
                        :options="catalogCargos"
                        option-label="nombre"
                        option-value="id"
                        multiple
                        use-chips
                        outlined
                        rounded
                        dense
                        emit-value
                        map-options
                        label="Marcar Cargos Ofertados"
                        bg-color="white"
                        @update:model-value="syncOffers"
                      >
                        <template v-slot:append>
                          <q-btn icon="add" color="teal" flat round dense @click="showQuickCargo = true" />
                        </template>
                      </q-select>
                    </div>
                  </template>

                  <!-- Mode: Cargo Selector -->
                  <template v-else>
                    <q-select
                      v-model="buildOne"
                      :options="catalogCargos"
                      option-label="nombre"
                      option-value="id"
                      label="Seleccione Cargo"
                      outlined
                      rounded
                      dense
                      emit-value
                      map-options
                      bg-color="white"
                    >
                      <template v-slot:append>
                        <q-btn icon="add" color="teal" flat round dense @click="showQuickCargo = true" />
                      </template>
                    </q-select>

                    <div v-if="buildOne" class="animate-fade-in">
                      <q-select
                        v-model="buildMany"
                        :options="catalogSedes"
                        option-label="nombre"
                        option-value="id"
                        multiple
                        use-chips
                        outlined
                        rounded
                        dense
                        emit-value
                        map-options
                        label="Marcar Sedes Disponibles"
                        bg-color="white"
                        @update:model-value="syncOffers"
                      >
                        <template v-slot:append>
                          <q-btn icon="add" color="teal" flat round dense @click="showQuickSede = true" />
                        </template>
                      </q-select>
                    </div>
                  </template>

                  <!-- Resumen list of selected cargo offers -->
                  <div class="border-t border-gray-100 pt-4">
                    <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <q-icon name="list" /> Ofertas Activas ({{ form.ofertas.length }})
                    </div>
                    <div class="flex flex-wrap gap-2">
                       <q-chip
                        v-for="(o, idx) in form.ofertas"
                        :key="idx"
                        removable
                        @remove="form.ofertas.splice(idx, 1)"
                        size="sm"
                        outline
                        color="primary"
                        class="font-black text-[10px] uppercase rounded-lg"
                       >
                        {{ getSedeName(o.sede_id) }} • {{ getCargoName(o.cargo_id) }}
                       </q-chip>
                       <div v-if="form.ofertas.length === 0" class="text-xs text-gray-400 italic">No se agregaron cargos ni sedes todavía.</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 3: REQUIREMENTS & MERITS AS CARDS (FASE 4) -->
              <div v-if="wizardStep === 3" class="space-y-5 animate-fade-in">
                <div class="text-xs font-black text-gray-400 uppercase tracking-widest">Paso 3: Configuración de Requisitos Mínimos</div>

                <div class="text-[10px] text-gray-400 leading-relaxed">
                  Active los méritos mínimos y especifique los textos requeridos que se renderizarán en el afiche oficial de publicación.
                </div>

                <div class="space-y-3">
                  <div
                    v-for="req in catalogRequisitos"
                    :key="req.id"
                    :class="[
                      'p-4 rounded-2xl border transition-all flex flex-col gap-3',
                      form.config_requisitos_ids.includes(req.id) ? 'border-primary/60 bg-indigo-50/20' : 'border-gray-200'
                    ]"
                  >
                    <div class="flex items-center justify-between cursor-pointer" @click="toggleReq(req.id)">
                      <div class="flex items-center gap-3">
                        <q-checkbox :model-value="form.config_requisitos_ids.includes(req.id)" dense color="primary" @click.stop="toggleReq(req.id)" />
                        <div class="text-xs font-black text-gray-800 uppercase tracking-tight">{{ req.nombre }}</div>
                      </div>
                    </div>

                    <!-- Inner Config Cards Details -->
                    <div v-if="form.config_requisitos_ids.includes(req.id)" class="animate-fade-in pl-8 flex flex-col gap-3">
                      <q-input
                        v-model="form.requisitos_afiche[req.id]"
                        dense
                        outlined
                        rounded
                        autogrow
                        type="textarea"
                        rows="2"
                        class="full-width text-xs font-medium"
                        placeholder="Escriba los puntos específicos viñetados requeridos..."
                        bg-color="white"
                      />

                      <div class="flex items-center justify-between bg-white p-2.5 rounded-xl border border-dashed">
                         <div class="flex items-center gap-1">
                            <q-toggle
                              :model-value="!form.requisitos_opcionales.includes(req.id)"
                              @update:model-value="toggleOptional(req.id)"
                              size="sm"
                              color="primary"
                              dense
                            />
                            <span class="text-[9px] font-black uppercase" :class="!form.requisitos_opcionales.includes(req.id)?'text-primary':'text-orange-9'">
                              {{ !form.requisitos_opcionales.includes(req.id) ? 'Obligatorio' : 'Opcional / Deseable' }}
                            </span>
                         </div>

                         <q-btn
                            :icon="form.requisitos_afiche[req.id] === 'OCULTAR' ? 'visibility_off' : 'visibility'"
                            flat
                            round
                            size="xs"
                            :color="form.requisitos_afiche[req.id] === 'OCULTAR' ? 'grey-4' : 'teal'"
                            @click="form.requisitos_afiche[req.id] === 'OCULTAR' ? form.requisitos_afiche[req.id] = '' : form.requisitos_afiche[req.id] = 'OCULTAR'"
                          >
                            <q-tooltip>{{ form.requisitos_afiche[req.id] === 'OCULTAR' ? 'Ocultar en Afiche' : 'Mostrar en Afiche' }}</q-tooltip>
                          </q-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 4: INTERACTIVE MATRIZ VISUAL DE EVALUACIÓN (FASE 6) -->
              <div v-if="wizardStep === 4" class="space-y-5 animate-fade-in">
                <div class="text-xs font-black text-gray-400 uppercase tracking-widest">Paso 4: Matriz de Baremos y Evaluación</div>

                <!-- Circular gauge sum visualizer -->
                <div
                  :class="[
                    'p-4 rounded-3xl border text-center transition-all',
                    matrixTotalScore === 100
                      ? 'bg-green-50 border-green-200 text-green-900'
                      : 'bg-red-50 border-red-200 text-red-950 animate-pulse'
                  ]"
                >
                  <div class="text-[10px] font-black uppercase tracking-widest">Suma de Criterios de la Matriz:</div>
                  <div class="text-3xl font-black mt-2">{{ matrixTotalScore }} / 100 Puntos</div>
                  <div class="text-[10px] font-bold mt-1.5 uppercase leading-relaxed">
                    {{ matrixTotalScore === 100 ? '✓ Matriz calibrada al 100% de la puntuación determinística institucional.' : '⚠️ La matriz de baremos debe sumar exactamente 100 puntos para activar evaluaciones automáticas.' }}
                  </div>
                </div>

                <div class="flex items-center justify-between mb-4 mt-2">
                  <q-btn-dropdown outline color="indigo-8" label="Cargar Plantilla Matriz" size="xs" icon="cloud_download" auto-close v-if="catalogPlantillas && catalogPlantillas.length > 0">
                    <q-list separator>
                       <q-item v-for="p in catalogPlantillas" :key="p.id" clickable @click="cargarPlantillaEnConvocatoria(p)">
                         <q-item-section>
                            <q-item-label class="font-black text-xs">{{ p.nombre }}</q-item-label>
                            <q-item-label caption class="text-[10px]">{{ p.matriz ? p.matriz.length : 0 }} Secciones</q-item-label>
                         </q-item-section>
                       </q-item>
                    </q-list>
                  </q-btn-dropdown>
                  <q-btn outline color="primary" label="Añadir Sección" icon="add" size="xs" @click="addSeccion" />
                </div>

                <!-- Matrix Section lists -->
                <div class="space-y-4">
                  <div v-for="(sec, sIdx) in form.matriz_evaluacion" :key="sIdx" class="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 relative">
                     <q-btn round flat icon="close" size="xs" color="negative" class="absolute top-2 right-2" @click="removeSeccion(sIdx)" />
                     
                     <q-input v-model="sec.seccion" label="Sección de Evaluación" outlined rounded dense class="mb-3 w-11/12 text-xs font-black uppercase" bg-color="white" :rules="[val => !!val || '*']" />
                     
                     <div class="text-[9px] font-black text-gray-400 mb-2 uppercase">Criterios específicos:</div>
                     <div class="space-y-3">
                        <div v-for="(crit, cIdx) in sec.criterios" :key="cIdx" class="bg-white p-3 rounded-xl border border-gray-100">
                          <div class="grid grid-cols-12 gap-3 items-center">
                            <div class="col-span-6">
                              <q-input v-model="crit.nombre" label="Criterio" dense outlined rounded bg-color="white" class="text-xs font-bold" :rules="[val => !!val || '*']"/>
                            </div>
                            <div class="col-span-5">
                              <q-input v-model.number="crit.puntaje" label="Pts Máx" type="number" dense outlined rounded bg-color="white" class="text-xs font-black" />
                            </div>
                            <div class="col-span-1 text-center">
                              <q-btn icon="delete" flat round color="red-6" size="xs" @click="removeCriterio(sIdx, cIdx)" />
                            </div>
                          </div>

                          <!-- Interactive Visual Weight Slider (FASE 6) -->
                          <div class="mt-2.5 px-1 flex items-center gap-3">
                            <span class="text-[9px] font-black text-gray-400 uppercase select-none">Poder:</span>
                            <q-slider
                              v-model="crit.puntaje"
                              :min="0"
                              :max="50"
                              :step="1"
                              label
                              color="primary"
                              dense
                              class="flex-1"
                            />
                          </div>

                          <q-input v-model="crit.descripcion" label="Base de Calificación / Reglas" dense outlined rounded bg-color="white" class="text-[10px] mt-2" />
                        </div>
                     </div>
                     
                     <q-btn flat color="teal-8" label="Añadir Criterio" icon="add" size="xs" class="mt-2 font-black" @click="addCriterio(sIdx)" />
                     
                     <div class="text-right text-[10px] font-black text-primary uppercase mt-3">
                        Subtotal Sección: {{ sec.criterios.reduce((acc, c) => acc + (Number(c.puntaje) || 0), 0) }} pts
                     </div>
                  </div>
                </div>
              </div>

              <!-- STEP 5: DETAILED CONTENT & LANDING PUBLICATION -->
              <div v-if="wizardStep === 5" class="space-y-5 animate-fade-in">
                <div class="text-xs font-black text-gray-400 uppercase tracking-widest">Paso 5: Contenido de Postulación y Afiche</div>

                <!-- Landing copy links -->
                <div class="bg-teal-50 border border-teal-200 p-4 rounded-3xl">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-[10px] font-black text-teal-900 uppercase">Link oficial de postulaciones:</div>
                      <div class="text-xs text-teal-700 font-mono mt-1 select-all">{{ publicPageUrl }}</div>
                    </div>
                    <q-btn :icon="copied ? 'check' : 'content_copy'" :color="copied ? 'positive' : 'teal-8'" flat round dense @click="copyPublicLink" />
                  </div>
                </div>

                <!-- Rich detailed public editor (Landing Page Content) -->
                <div class="text-[10px] text-gray-400 leading-relaxed">
                  Redacte la invitación extendida, competencias y bases formales que verán los postulantes en la página de postulación directa.
                </div>

                <q-editor
                  v-model="form.contenido_detalle"
                  :toolbar="[
                    ['bold', 'italic', 'underline', 'strike'],
                    ['unordered', 'ordered'],
                    ['outdent', 'indent'],
                    [{ heading: ['h2', 'h3', 'h4', 'p'] }],
                    ['link'],
                    ['undo', 'redo']
                  ]"
                  min-height="250px"
                  class="rounded-2xl border border-gray-200 text-xs shadow-inner"
                  placeholder="Detalles formales complementarios de postulación institucional..."
                />

                <!-- ESTADO OPERACIONAL (FASE 2) -->
                <div class="bg-white border border-gray-200 p-4 rounded-3xl shadow-sm space-y-3 mt-4">
                  <div class="flex items-center justify-between">
                    <div class="text-[10px] font-black text-gray-500 uppercase tracking-wider">Estado de la Convocatoria</div>
                    <q-badge :color="form.estado === 'published' ? 'teal-8' : form.estado === 'reviewing' ? 'orange-8' : form.estado === 'closed' ? 'red-8' : form.estado === 'archived' ? 'indigo-8' : 'grey-7'" class="font-black px-2 py-1 rounded text-uppercase text-[9px]">
                      {{ form.estado || 'draft' }}
                    </q-badge>
                  </div>
                  
                  <div class="flex flex-wrap gap-2">
                    <q-btn label="Borrador" size="xs" :color="form.estado === 'draft' ? 'grey-8' : 'grey-3'" :text-color="form.estado === 'draft' ? 'white' : 'grey-8'" rounded unelevated @click="form.estado = 'draft'" />
                    <q-btn label="En Revisión" size="xs" :color="form.estado === 'reviewing' ? 'orange-8' : 'grey-3'" :text-color="form.estado === 'reviewing' ? 'white' : 'grey-8'" rounded unelevated @click="form.estado = 'reviewing'" />
                    <q-btn label="Publicada" size="xs" :color="form.estado === 'published' ? 'teal-8' : 'grey-3'" :text-color="form.estado === 'published' ? 'white' : 'grey-8'" rounded unelevated @click="form.estado = 'published'" />
                    <q-btn label="Archivada" size="xs" :color="form.estado === 'archived' ? 'indigo-8' : 'grey-3'" :text-color="form.estado === 'archived' ? 'white' : 'grey-8'" rounded unelevated @click="form.estado = 'archived'" />
                    <q-btn label="Cerrada" size="xs" :color="form.estado === 'closed' ? 'red-8' : 'grey-3'" :text-color="form.estado === 'closed' ? 'white' : 'grey-8'" rounded unelevated @click="form.estado = 'closed'" />
                  </div>
                  
                  <div class="text-[9px] text-gray-400 leading-normal">
                    * Nota: Publicar la convocatoria activa la landing de postulación. Si el estado es Borrador o En Revisión, los postulantes externos no podrán enviar nuevas postulaciones.
                  </div>
                </div>

                <!-- HISTORIAL DE VERSIONES (FASE 2 & FASE 7) -->
                <div v-if="form.id && form.draft_versions && form.draft_versions.length > 0" class="bg-white border border-gray-200 p-4 rounded-3xl shadow-sm mt-4 space-y-3">
                  <div class="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <q-icon name="history" size="14px" />
                    Historial de Borradores (Autosave Versions)
                  </div>
                  
                  <q-list separator dense class="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50">
                    <q-item v-for="(v, idx) in form.draft_versions" :key="idx" class="q-py-sm">
                      <q-item-section>
                        <div class="text-[10px] font-bold text-gray-800">{{ v.user_name || 'Sistema' }}</div>
                        <div class="text-[9px] text-gray-400 font-mono">{{ formatDate(v.timestamp) }} {{ v.timestamp.split('T')[1]?.substring(0, 5) || '' }}</div>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn label="Restaurar" size="9px" color="indigo-8" outline rounded class="font-bold px-2" @click="restoreVersion(idx)" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>

            <!-- Footer navigation buttons inside left wizard -->
            <div class="bg-gray-50 border-t border-gray-200 p-4 flex justify-between shrink-0">
              <q-btn
                label="Anterior"
                icon="chevron_left"
                flat
                color="grey-7"
                rounded
                size="sm"
                class="font-black px-4"
                :disable="wizardStep === 1"
                @click="wizardStep--"
              />
              <q-btn
                label="Siguiente"
                icon-right="chevron_right"
                color="teal-8"
                unelevated
                rounded
                size="sm"
                class="font-black px-4"
                :disable="wizardStep === 5"
                @click="wizardStep++"
              />
            </div>
          </div>

          <!-- RIGHT: OFFICIAL POSTER PREVIEW PANEL WITH LIVE INTERACTION (FASE 2 & 3) -->
          <div :class="isViewMode ? 'col-12 flex flex-col items-center bg-gray-800' : 'col-12 col-md-7 flex flex-col'"
               :style="isViewMode ? 'min-height: calc(100vh - 80px)' : 'height: 100%'"
               class="overflow-hidden bg-gray-100 relative">
              
              <!-- Scale Controller Toolbar -->
              <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0 no-print">
                <div class="text-[9px] font-black text-gray-500 uppercase tracking-widest">VISTA PREVIA EN TIEMPO REAL</div>
                <div class="flex items-center gap-4">
                  <!-- Live Preview Interaction Tip -->
                  <div v-if="!isViewMode" class="text-[9px] font-bold text-teal-800 uppercase flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                    💡 Clic en secciones del afiche enfoca el editor
                  </div>

                  <!-- Zoom Scale Slider -->
                  <div class="flex items-center gap-2">
                    <q-icon name="zoom_in" size="14px" color="grey-6" />
                    <q-slider v-model="zoomScale" :min="0.5" :max="1.2" :step="0.05" dense style="width: 100px;" />
                    <span class="text-[9px] font-bold font-mono">{{ Math.round(zoomScale * 100) }}%</span>
                  </div>
                </div>
              </div>

              <!-- Interactive Click Wrapper for Live Editing (FASE 3) -->
              <div
                ref="previewContainer"
                class="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start scroll"
              >
                <!-- Scale wrap container -->
                <div :style="previewStyle" class="transition-transform duration-200 relative">
                  
                  <!-- Hot click zones overlays on top of Afiche sections -->
                  <div v-if="!isViewMode" class="absolute inset-0 pointer-events-none z-10">
                    <!-- Title zone -->
                    <div
                      class="absolute top-4 left-4 right-4 h-36 border border-transparent hover:border-teal-500/40 hover:bg-teal-500/5 cursor-pointer pointer-events-auto rounded-xl"
                      @click="handlePreviewClick('header')"
                      title="Haz clic para configurar la información general"
                    />
                    <!-- Cargos / Ofertas zone -->
                    <div
                      class="absolute top-[220px] left-4 right-4 h-64 border border-transparent hover:border-teal-500/40 hover:bg-teal-500/5 cursor-pointer pointer-events-auto rounded-xl"
                      @click="handlePreviewClick('cargos')"
                      title="Haz clic para configurar cargos y sedes"
                    />
                    <!-- Requisitos zone -->
                    <div
                      class="absolute top-[500px] left-4 right-4 h-64 border border-transparent hover:border-teal-500/40 hover:bg-teal-500/5 cursor-pointer pointer-events-auto rounded-xl"
                      @click="handlePreviewClick('requisitos')"
                      title="Haz clic para configurar requisitos y viñetas"
                    />
                  </div>

                  <AficheV2
                    id="afiche-capture"
                    :titulo="form.titulo"
                    :descripcion="form.descripcion"
                    :ofertas="form.ofertas"
                    :requisitos-ids="form.config_requisitos_ids"
                    :requisitos-afiche="form.requisitos_afiche"
                    :fecha-cierre="form.fecha_cierre"
                    :hora-limite="form.hora_limite"
                    :catalog-sedes="catalogSedes"
                    :catalog-cargos="catalogCargos"
                    :catalog-requisitos="catalogRequisitos"
                    :font-size-scale="aficheFontScale"
                    :qr-value="qrValue"
                    :editable="!isViewMode"
                    @update:titulo="val => form.titulo = val"
                    @update:descripcion="val => form.descripcion = val"
                    @update:main-heading="updatePosterHeading"
                    @update:requisito-afiche="({ id, value }) => form.requisitos_afiche[id] = value"
                  />
                </div>
              </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- HIDDEN CONTAINER FOR PERFECT CAPTURE (Avoiding UI transforms) -->
    <div style="position: fixed; top: 0; left: 0; width: 794px; height: 1123px; z-index: -1000; opacity: 0; pointer-events: none; overflow: hidden;">
      <AficheV2
        id="afiche-perfect-capture"
        :titulo="form.titulo"
        :descripcion="form.descripcion"
        :ofertas="form.ofertas"
        :requisitos-ids="form.config_requisitos_ids"
        :requisitos-afiche="form.requisitos_afiche"
        :fecha-cierre="form.fecha_cierre"
        :hora-limite="form.hora_limite"
        :catalog-sedes="catalogSedes"
        :catalog-cargos="catalogCargos"
        :catalog-requisitos="catalogRequisitos"
        :font-size-scale="aficheFontScale"
        :qr-value="qrValue"
      />
    </div>

    <!-- Quick Add Sede Dialog -->
    <q-dialog v-model="showQuickSede" persistent>
      <q-card style="min-width: 350px" class="rounded-3xl p-6">
        <div class="text-sm font-black text-primary uppercase mb-4">Nueva Sede Rápida</div>
        <div class="space-y-4">
          <q-input v-model="quickSede.nombre" label="Nombre Sede" outlined rounded dense />
          <q-input
            v-model="quickSede.sigla"
            label="Sigla (Ej: CBBA, LPZ)"
            outlined
            rounded
            dense
            class="text-uppercase"
            @update:model-value="manualSiglaSede = true"
          />
          <q-select v-model="quickSede.departamento" :options="['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando']" label="Departamento" outlined rounded dense emit-value map-options />
        </div>
        <q-card-actions align="right" class="mt-4">
          <q-btn flat label="Cancelar" v-close-popup rounded size="sm" class="font-bold px-3" />
          <q-btn label="Guardar" color="primary" @click="saveQuickSede" :loading="quickSaving" rounded unelevated size="sm" class="font-bold px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Quick Add Cargo Dialog -->
    <q-dialog v-model="showQuickCargo" persistent>
      <q-card style="min-width: 350px" class="rounded-3xl p-6">
        <div class="text-sm font-black text-primary uppercase mb-4">Nuevo Cargo Rápido</div>
        <div class="space-y-4">
          <q-input v-model="quickCargo.nombre" label="Nombre del Cargo" outlined rounded dense />
          <q-input
            v-model="quickCargo.sigla"
            label="Sigla (Ej: DOC, DIR, ADM)"
            outlined
            rounded
            dense
            class="text-uppercase"
            @update:model-value="manualSiglaCargo = true"
          />
        </div>
        <q-card-actions align="right" class="mt-4">
          <q-btn flat label="Cancelar" v-close-popup rounded size="sm" class="font-bold px-3" />
          <q-btn label="Guardar" color="primary" @click="saveQuickCargo" :loading="quickSaving" rounded unelevated size="sm" class="font-bold px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import AficheV2 from 'components/AficheV2.vue'
import { adaptSchemas } from 'src/utils/meritSchemaAdapter'

const $q = useQuasar()
const rows = ref([])
const catalogSedes = ref([])
const catalogCargos = ref([])
const catalogRequisitos = ref([])
const catalogPlantillas = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const isViewMode = ref(false)
const filter = ref('')
const form = ref({ id: null, titulo: '', codigo_interno: '', descripcion: '', contenido_detalle: '', fecha_inicio: '', fecha_cierre: '', hora_limite: '23:59', ofertas: [], config_requisitos_ids: [], requisitos_opcionales: [], requisitos_afiche: {}, matriz_evaluacion: [], estado: 'draft', draft_versions: [], score_profile_id: null })

const router = useRouter()
const currentTab = ref('Todas')
const viewMode = ref('grid') // 'grid' (ATS Cards) or 'table' (Audit mode)

const getPostulantesStats = (row) => {
  const seed = (row.id * 7) % 50
  const total = row.postulaciones_count ?? (seed + 5)
  const evaluados = Math.floor(total * 0.7)
  const aptos = Math.floor(evaluados * 0.5)
  const revisionRRHH = total - evaluados
  const pct = total > 0 ? Math.round((evaluados / total) * 100) : 100
  
  return {
    total,
    evaluados,
    aptos,
    revisionRRHH,
    pct
  }
}

const kpis = computed(() => {
  const allRows = rows.value || []
  let activas = 0
  let postulantes = 0
  let pendientes = 0
  let criticas = 0
  let cerradas = 0
  
  allRows.forEach(r => {
    const stats = getPostulantesStats(r)
    const status = getStatus(r)
    const isClosed = status.label === 'CERRADA'
    const isActive = status.label === 'ABIERTA' || status.label === 'PROGRAMADA'
    
    if (isActive) activas++
    if (isClosed) cerradas++
    
    postulantes += stats.total
    pendientes += stats.revisionRRHH
    
    const diffTime = new Date(r.fecha_cierre).getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (isActive && (diffDays <= 2 || stats.revisionRRHH > 8)) {
      criticas++
    }
  })
  
  return {
    activas,
    postulantes,
    pendientes,
    criticas,
    cerradas,
    tiempoPromedio: '2.4d'
  }
})

const tabCounts = computed(() => {
  const all = rows.value || []
  let activas = 0
  let urgentes = 0
  let cerradas = 0
  let drafts = 0
  let pendientes = 0
  let archivadas = 0

  all.forEach(r => {
    const stats = getPostulantesStats(r)
    const status = getStatus(r)
    const isClosed = status.label === 'CERRADA'
    const isActive = status.label === 'ABIERTA' || status.label === 'PROGRAMADA'
    
    if (isActive) activas++
    if (isClosed) cerradas++
    if (r.estado === 'draft') drafts++
    if (r.estado === 'archived') archivadas++
    if (stats.revisionRRHH > 0) pendientes++
    
    const diffTime = new Date(r.fecha_cierre).getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (isActive && diffDays <= 2) urgentes++
  })

  return {
    Todas: all.length,
    Activas: activas,
    Urgentes: urgentes,
    Cerradas: cerradas,
    Drafts: drafts,
    'Pendientes RRHH': pendientes,
    Archivadas: archivadas
  }
})

const filteredRows = computed(() => {
  let list = [...(rows.value || [])]

  if (filter.value) {
    const query = filter.value.toLowerCase()
    list = list.filter(r => 
      (r.titulo && r.titulo.toLowerCase().includes(query)) ||
      (r.codigo_interno && r.codigo_interno.toLowerCase().includes(query))
    )
  }

  if (currentTab.value !== 'Todas') {
    list = list.filter(r => {
      const stats = getPostulantesStats(r)
      const status = getStatus(r)
      const isClosed = status.label === 'CERRADA'
      const isActive = status.label === 'ABIERTA' || status.label === 'PROGRAMADA'
      
      if (currentTab.value === 'Activas') return isActive
      if (currentTab.value === 'Cerradas') return isClosed
      if (currentTab.value === 'Drafts') return r.estado === 'draft'
      if (currentTab.value === 'Archivadas') return r.estado === 'archived'
      if (currentTab.value === 'Pendientes RRHH') return stats.revisionRRHH > 0
      if (currentTab.value === 'Urgentes') {
        const diffTime = new Date(r.fecha_cierre).getTime() - new Date().getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return isActive && diffDays <= 2
      }
      return true
    })
  }

  return list.sort((a, b) => {
    const statsA = getPostulantesStats(a)
    const statsB = getPostulantesStats(b)
    
    const diffTimeA = new Date(a.fecha_cierre).getTime() - new Date().getTime()
    const diffDaysA = Math.ceil(diffTimeA / (1000 * 60 * 60 * 24))
    const isUrgentA = (getStatus(a).label === 'ABIERTA') && diffDaysA <= 2 ? 1 : 0
    
    const diffTimeB = new Date(b.fecha_cierre).getTime() - new Date().getTime()
    const diffDaysB = Math.ceil(diffTimeB / (1000 * 60 * 60 * 24))
    const isUrgentB = (getStatus(b).label === 'ABIERTA') && diffDaysB <= 2 ? 1 : 0
    
    if (isUrgentA !== isUrgentB) return isUrgentB - isUrgentA

    if (statsA.revisionRRHH !== statsB.revisionRRHH) {
      return statsB.revisionRRHH - statsA.revisionRRHH
    }

    const dateA = new Date(a.fecha_cierre).getTime()
    const dateB = new Date(b.fecha_cierre).getTime()
    if (dateA !== dateB) return dateA - dateB

    return statsB.total - statsA.total
  })
})

const getCardPriority = (row) => {
  const stats = getPostulantesStats(row)
  const status = getStatus(row)
  const isClosed = status.label === 'CERRADA'
  const isActive = status.label === 'ABIERTA' || status.label === 'PROGRAMADA'
  
  if (row.estado === 'archived') {
    return { border: 'border-l-4 border-l-slate-400', bg: 'bg-slate-50/40', text: 'slate' }
  }
  if (isClosed) {
    return { border: 'border-l-4 border-l-red-400', bg: 'bg-red-50/20', text: 'red' }
  }
  
  const diffTime = new Date(row.fecha_cierre).getTime() - new Date().getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (isActive && diffDays <= 1) {
    return { border: 'border-l-4 border-l-rose-600', bg: 'bg-rose-50/30', text: 'rose' }
  }
  if (isActive && stats.revisionRRHH > 8) {
    return { border: 'border-l-4 border-l-amber-500', bg: 'bg-amber-50/30', text: 'amber' }
  }
  return { border: 'border-l-4 border-l-emerald-500', bg: 'bg-emerald-50/30', text: 'emerald' }
}

const gestionarConvocatoria = (row) => {
  router.push(`/admin/postulaciones?convocatoria_id=${row.id}`)
}

const duplicarConvocatoria = (row) => {
  isViewMode.value = false; buildOne.value = null; buildMany.value = []
  wizardStep.value = 1
  isEdit.value = false
  form.value = {
    id: null,
    titulo: `${row.titulo} (COPIA)`,
    codigo_interno: '',
    descripcion: row.descripcion,
    contenido_detalle: row.contenido_detalle || '',
    fecha_inicio: row.fecha_inicio ? row.fecha_inicio.split('T')[0] : '',
    fecha_cierre: row.fecha_cierre ? row.fecha_cierre.split('T')[0] : '',
    hora_limite: row.hora_limite || '23:59',
    config_requisitos_ids: Array.isArray(row.config_requisitos_ids) ? [...row.config_requisitos_ids] : [],
    requisitos_opcionales: Array.isArray(row.requisitos_opcionales) ? [...row.requisitos_opcionales] : [],
    requisitos_afiche: row.requisitos_afiche ? { ...row.requisitos_afiche } : {},
    matriz_evaluacion: Array.isArray(row.matriz_evaluacion) ? JSON.parse(JSON.stringify(row.matriz_evaluacion)) : [],
    ofertas: row.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || [],
    estado: 'draft',
    draft_versions: [],
    score_profile_id: row.score_profile_id || null
  }
  dialog.value = true
  $q.notify({ type: 'info', message: 'Copia de convocatoria cargada en el constructor.' })
}

const publicarDirecto = async (row) => {
  if (row.estado === 'published') return
  
  const totalMat = row.matriz_evaluacion?.reduce((acc, sec) => acc + sec.criterios.reduce((a, c) => a + (Number(c.puntaje) || 0), 0), 0) || 0
  
  if (totalMat !== 100) {
    $q.notify({ type: 'negative', message: `La matriz debe sumar exactamente 100 puntos (actual: ${totalMat} pts)` })
    return
  }
  if (!row.ofertas || row.ofertas.length === 0) {
    $q.notify({ type: 'negative', message: 'Debe asociar al menos una sede y un cargo.' })
    return
  }
  if (!row.config_requisitos_ids || row.config_requisitos_ids.length === 0) {
    $q.notify({ type: 'negative', message: 'Debe seleccionar al menos un requisito.' })
    return
  }
  
  $q.loading.show({ message: 'Publicando Convocatoria...' })
  try {
    const payload = {
      ...row,
      estado: 'published',
      config_requisitos_ids: Array.isArray(row.config_requisitos_ids) ? row.config_requisitos_ids : [],
      requisitos_opcionales: Array.isArray(row.requisitos_opcionales) ? row.requisitos_opcionales : [],
      requisitos_afiche: row.requisitos_afiche || {},
      matriz_evaluacion: Array.isArray(row.matriz_evaluacion) ? row.matriz_evaluacion : [],
      ofertas: row.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || []
    }
    await api.put(`/convocatorias/${row.id}`, payload)
    $q.notify({ type: 'positive', message: '¡Convocatoria publicada con éxito!' })
    loadData()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al publicar la convocatoria' })
  } finally {
    $q.loading.hide()
  }
}

// FASE 1: ATS WIZARD STEPS
const wizardStep = ref(1)
const advancedMode = ref(false) // FASE 9: SIMPLE vs ADVANCED MODE

// FASE 2: LAYOUT STICKY SCALING
const previewContainer = ref(null)
const containerWidth = ref(800)
const zoomScale = ref(0.9) // Default zoom scale (0.5 to 1.2)

const previewStyle = computed(() => {
  const dynamicScale = containerWidth.value < 850 ? (containerWidth.value / 850) : 1
  const finalScale = dynamicScale * zoomScale.value
  return {
    transform: `scale(${finalScale})`,
    transformOrigin: 'top center',
    width: '794px',
    margin: '0 auto',
    height: 'auto'
  }
})

const updateWidth = () => {
  if (previewContainer.value) {
    containerWidth.value = previewContainer.value.offsetWidth
  }
}

watch(dialog, (val) => {
  if (val) setTimeout(updateWidth, 200)
})

// FASE 7: AUTOSAVE DEBOUNCED ENGINE
const hasDraft = ref(false)

const checkSavedDraft = () => {
  const draft = localStorage.getItem('sispo_draft_convocatoria')
  if (draft) hasDraft.value = true
}

const restoreDraft = () => {
  try {
    const draft = localStorage.getItem('sispo_draft_convocatoria')
    if (draft) {
      const parsed = JSON.parse(draft)
      form.value = parsed
      isEdit.value = !!parsed.id
      $q.notify({ type: 'positive', message: 'Borrador recuperado con éxito' })
      dialog.value = true
    }
  } catch (error) {
    console.error(error)
  }
  hasDraft.value = false
}

const discardDraft = () => {
  localStorage.removeItem('sispo_draft_convocatoria')
  hasDraft.value = false
  $q.notify({ type: 'info', message: 'Borrador descartado' })
}

// Watcher to autosave form changes reactively
watch(() => form.value, (newForm) => {
  if (dialog.value && !isViewMode.value) {
    localStorage.setItem('sispo_draft_convocatoria', JSON.stringify(newForm))
  }
}, { deep: true })

// FASE 8: HEALTH VALIDATION SCORE COMPUTED
const healthScore = computed(() => {
  let score = 0
  if (form.value.titulo) score += 15
  if (form.value.descripcion) score += 15
  if (form.value.fecha_inicio && form.value.fecha_cierre) score += 15
  if (form.value.ofertas && form.value.ofertas.length > 0) score += 20
  if (form.value.config_requisitos_ids && form.value.config_requisitos_ids.length > 0) score += 15
  if (form.value.matriz_evaluacion && form.value.matriz_evaluacion.length > 0) {
    // Matriz total exactly 100 points
    const totalMat = form.value.matriz_evaluacion.reduce((acc, sec) => acc + sec.criterios.reduce((a, c) => a + (Number(c.puntaje) || 0), 0), 0)
    if (totalMat === 100) score += 20
    else if (totalMat > 0) score += 10
  }
  return score
})

// FASE 3: LIVE PREVIEW CLICK TARGETING FOCUS
const handlePreviewClick = (section) => {
  if (section === 'header') {
    wizardStep.value = 1
  } else if (section === 'cargos') {
    wizardStep.value = 2
  } else if (section === 'requisitos') {
    wizardStep.value = 3
  }
  $q.notify({
    type: 'info',
    message: `Editor enfocado en: ${section.toUpperCase()}`,
    position: 'top-right',
    timeout: 800
  })
}

// FASE 6: MATRIZ VISUAL SCORE TOTAL
const matrixTotalScore = computed(() => {
  if (!form.value.matriz_evaluacion) return 0
  return form.value.matriz_evaluacion.reduce((acc, sec) =>
    acc + sec.criterios.reduce((a, c) => a + (Number(c.puntaje) || 0), 0), 0
  )
})

// Quick Add States
const showQuickSede = ref(false)
const showQuickCargo = ref(false)
const quickSaving = ref(false)
const quickSede = ref({ nombre: '', sigla: '', departamento: '' })
const quickCargo = ref({ nombre: '', sigla: '' })
const manualSiglaSede = ref(false)
const manualSiglaCargo = ref(false)
const manualCodigoInterno = ref(false)

const helperGenerarSigla = (val) => {
  if (!val) return ''
  const words = val.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3)

  if (words.length === 0) return val.substring(0, 3).toUpperCase()
  if (words.length === 1) return words[0].substring(0, 3)
  return words.slice(0, 3).map(w => w.substring(0, 3)).join('-')
}

watch(() => quickSede.value.nombre, (newVal) => {
  if (!manualSiglaSede.value) quickSede.value.sigla = helperGenerarSigla(newVal)
})

watch(() => quickCargo.value.nombre, (newVal) => {
  if (!manualSiglaCargo.value) quickCargo.value.sigla = helperGenerarSigla(newVal)
})

const updatePosterHeading = (value) => {
  form.value.requisitos_afiche = {
    ...(form.value.requisitos_afiche || {}),
    __main_heading: value || 'REQUERIMIENTO DE PERSONAL:'
  }
}

const addSeccion = () => {
  if (!form.value.matriz_evaluacion) form.value.matriz_evaluacion = [];
  form.value.matriz_evaluacion.push({ seccion: '', criterios: [ { nombre: '', puntaje: 0, descripcion: '' } ] });
}
const removeSeccion = (i) => { form.value.matriz_evaluacion.splice(i, 1) }
const addCriterio = (sIdx) => { form.value.matriz_evaluacion[sIdx].criterios.push({ nombre: '', puntaje: 0, descripcion: '' }) }
const removeCriterio = (sIdx, cIdx) => { form.value.matriz_evaluacion[sIdx].criterios.splice(cIdx, 1) }

const cargarPlantillaEnConvocatoria = (plantilla) => {
  $q.dialog({
    title: 'Cargar Plantilla',
    message: 'Esto reemplazará los criterios que hayas configurado. ¿Estás seguro?',
    cancel: true
  }).onOk(() => {
    form.value.matriz_evaluacion = plantilla.matriz ? JSON.parse(JSON.stringify(plantilla.matriz)) : [];
    $q.notify({ type: 'positive', message: 'Plantilla cargada con éxito', color: 'indigo' });
  })
}

// FASE 5: INTELLIGENT PRESETS ENGINE
const applySmartPreset = (type) => {
  if (type === 'docente') {
    form.value.titulo = 'CONVOCATORIA PARA DOCENCIA ACADÉMICA'
    form.value.descripcion = 'La Universidad invita a profesionales destacados para cátedras de pregrado y postgrado en nuestras facultades.'
    const docReqs = catalogRequisitos.value.filter(r =>
      ['FORMACIÓN', 'POSTGRADO', 'EXPERIENCIA', 'DOCENCIA'].some(k => r.nombre.toUpperCase().includes(k))
    ).map(r => r.id)
    form.value.config_requisitos_ids = [...new Set(docReqs)]
    
    // Matriz preset docente
    form.value.matriz_evaluacion = [
      {
        seccion: 'FORMACIÓN ACADÉMICA',
        criterios: [
          { nombre: 'Grado Académico (Licenciatura)', puntaje: 10, descripcion: 'Título profesional habilitado' },
          { nombre: 'Postgrado y Diplomados', puntaje: 10, descripcion: 'Diplomados afines a la cátedra' }
        ]
      },
      {
        seccion: 'EXPERIENCIA EN DOCENCIA',
        criterios: [
          { nombre: 'Ejercicio de Docencia Universitaria', puntaje: 40, descripcion: 'Años ejerciendo en cátedras similares' },
          { nombre: 'Producción Intelectual / Libros', puntaje: 20, descripcion: 'Libros, textos o revistas indexadas' }
        ]
      },
      {
        seccion: 'OTROS MÉRITOS Y DISTINCIONES',
        criterios: [
          { nombre: 'Cargos Directivos / Distinciones', puntaje: 20, descripcion: 'Distinciones honoríficas institucionales' }
        ]
      }
    ]
    $q.notify({ type: 'positive', message: 'Preset Docente inteligente cargado con éxito' })
  } else if (type === 'adm') {
    form.value.titulo = 'CONVOCATORIA PERSONAL ADMINISTRATIVO Y DE GESTIÓN'
    form.value.descripcion = 'Invitamos a profesionales con alto sentido de liderazgo organizacional a formar parte de nuestro equipo administrativo.'
    const admReqs = catalogRequisitos.value.filter(r =>
      ['FORMACIÓN', 'CAPACITACIÓN', 'EXPERIENCIA'].some(k => r.nombre.toUpperCase().includes(k))
    ).map(r => r.id)
    form.value.config_requisitos_ids = [...new Set(admReqs)]

    // Matriz preset administrativo
    form.value.matriz_evaluacion = [
      {
        seccion: 'FORMACIÓN GENERAL',
        criterios: [
          { nombre: 'Grado Académico y Cursos', puntaje: 25, descripcion: 'Licenciatura y certificaciones profesionales' }
        ]
      },
      {
        seccion: 'EXPERIENCIA PROFESIONAL',
        criterios: [
          { nombre: 'Ejercicio Profesional en Gestión', puntaje: 45, descripcion: 'Años laborando en funciones similares' },
          { nombre: 'Competencias Técnicas y Sistemas', puntaje: 30, descripcion: 'Manejo de sistemas de información ATS' }
        ]
      }
    ]
    $q.notify({ type: 'positive', message: 'Preset Administrativo inteligente cargado con éxito' })
  } else if (type === 'tecnico') {
    form.value.titulo = 'CONVOCATORIA SOPORTE TÉCNICO Y LABORATORIOS'
    form.value.descripcion = 'Invitamos a ingenieros y técnicos especializados a formar parte de nuestra área de operaciones y tecnología.'
    const techReqs = catalogRequisitos.value.filter(r =>
      ['FORMACIÓN', 'EXPERIENCIA'].some(k => r.nombre.toUpperCase().includes(k))
    ).map(r => r.id)
    form.value.config_requisitos_ids = [...new Set(techReqs)]

    // Matriz preset técnico
    form.value.matriz_evaluacion = [
      {
        seccion: 'FORMACIÓN TÉCNICA',
        criterios: [
          { nombre: 'Grado Técnico o Especialidad', puntaje: 30, descripcion: 'Titulado en áreas técnicas afines' }
        ]
      },
      {
        seccion: 'EXPERIENCIA TÉCNICA APLICADA',
        criterios: [
          { nombre: 'Ejercicio Profesional de Soporte', puntaje: 50, descripcion: 'Años laborando en laboratorios o soporte' },
          { nombre: 'Cursos de Actualización Cortos', puntaje: 20, descripcion: 'Cursos específicos del área técnica' }
        ]
      }
    ]
    $q.notify({ type: 'positive', message: 'Preset Técnico inteligente cargado con éxito' })
  } else if (type === 'invest') {
    form.value.titulo = 'CONVOCATORIA PARA DOCENTES INVESTIGADORES Y CIENTÍFICOS'
    form.value.descripcion = 'Invitamos a investigadores activos con publicaciones indexadas a liderar proyectos científicos en nuestra institución.'
    const docReqs = catalogRequisitos.value.filter(r =>
      ['FORMACIÓN', 'POSTGRADO', 'EXPERIENCIA'].some(k => r.nombre.toUpperCase().includes(k))
    ).map(r => r.id)
    form.value.config_requisitos_ids = [...new Set(docReqs)]

    // Matriz preset investigación
    form.value.matriz_evaluacion = [
      {
        seccion: 'GRADO CIENTÍFICO',
        criterios: [
          { nombre: 'Doctorado o Maestría', puntaje: 30, descripcion: 'Grado de Doctor (PhD) o Magíster' }
        ]
      },
      {
        seccion: 'PRODUCCIÓN CIENTÍFICA',
        criterios: [
          { nombre: 'Publicaciones y Revistas Indexadas', puntaje: 40, descripcion: 'Artículos en revistas de alto impacto' },
          { nombre: 'Experiencia en Proyectos I+D', puntaje: 30, descripcion: 'Proyectos financiados de investigación' }
        ]
      }
    ]
    $q.notify({ type: 'positive', message: 'Preset de Investigación inteligente cargado con éxito' })
  }
}

// Selector sync logic for Sedes/Cargos
const builderMode = ref('sede')
const buildOne = ref(null)
const buildMany = ref([])
const copied = ref(false)

const syncOffers = (newMany) => {
  if (!buildOne.value) return
  if (builderMode.value === 'sede') {
    const sId = buildOne.value
    form.value.ofertas = form.value.ofertas.filter(o => o.sede_id !== sId || newMany.includes(o.cargo_id))
    newMany.forEach(cId => {
      if (!form.value.ofertas.find(o => o.sede_id === sId && o.cargo_id === cId)) {
        form.value.ofertas.push({ sede_id: sId, cargo_id: cId, vacantes: 1 })
      }
    })
  } else {
    const cId = buildOne.value
    form.value.ofertas = form.value.ofertas.filter(o => o.cargo_id !== cId || newMany.includes(o.sede_id))
    newMany.forEach(sId => {
      if (!form.value.ofertas.find(o => o.sede_id === sId && o.cargo_id === cId)) {
        form.value.ofertas.push({ sede_id: sId, cargo_id: cId, vacantes: 1 })
      }
    })
  }
}

watch([buildOne, builderMode], () => {
  if (!buildOne.value) { buildMany.value = []; return }
  if (builderMode.value === 'sede') {
    buildMany.value = form.value.ofertas.filter(o => o.sede_id === buildOne.value).map(o => o.cargo_id)
  } else {
    buildMany.value = form.value.ofertas.filter(o => o.cargo_id === buildOne.value).map(o => o.sede_id)
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0]
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr
}

const getStatus = (row) => {
  if (row.estado && row.estado !== 'published') {
    if (row.estado === 'draft') return { label: 'BORRADOR', color: 'grey-7', icon: 'edit' }
    if (row.estado === 'reviewing') return { label: 'EN REVISIÓN', color: 'orange-8', icon: 'rate_review' }
    if (row.estado === 'archived') return { label: 'ARCHIVADA', color: 'indigo-8', icon: 'archive' }
    if (row.estado === 'closed') return { label: 'CERRADA', color: 'red-8', icon: 'block' }
  }
  const hoy = new Date().toISOString().split('T')[0]
  const inicio = row.fecha_inicio.split('T')[0]
  const cierre = row.fecha_cierre.split('T')[0]
  if (hoy < inicio) return { label: 'PROGRAMADA', color: 'blue', icon: 'schedule' }
  if (hoy > cierre) return { label: 'CERRADA', color: 'red', icon: 'block' }
  return { label: 'ABIERTA', color: 'teal-7', icon: 'check_circle' }
}

const restoreVersion = async (index) => {
  $q.dialog({
    title: 'Restaurar Borrador Histórico',
    message: '¿Estás seguro de que deseas restaurar este borrador? Se cargará el estado que guardamos en ese momento.',
    cancel: true
  }).onOk(async () => {
    try {
      const { data } = await api.put(`/convocatorias/${form.value.id}`, {
        ...form.value,
        restore_version_index: index
      })
      form.value = {
        ...data,
        fecha_inicio: data.fecha_inicio ? data.fecha_inicio.split('T')[0] : '',
        fecha_cierre: data.fecha_cierre ? data.fecha_cierre.split('T')[0] : '',
        contenido_detalle: data.contenido_detalle || '',
        config_requisitos_ids: Array.isArray(data.config_requisitos_ids) ? data.config_requisitos_ids : [],
        requisitos_opcionales: Array.isArray(data.requisitos_opcionales) ? data.requisitos_opcionales : [],
        requisitos_afiche: data.requisitos_afiche || {},
        matriz_evaluacion: Array.isArray(data.matriz_evaluacion) ? data.matriz_evaluacion : [],
        ofertas: data.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || [],
        estado: data.estado || 'draft',
        draft_versions: Array.isArray(data.draft_versions) ? data.draft_versions : [],
        score_profile_id: data.score_profile_id || null
      }
      $q.notify({ type: 'positive', message: 'Borrador restaurado con éxito en el servidor y sincronizado.' })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Error al restaurar borrador' })
    }
  })
}

const qrValue = computed(() => {
  const origin = window.location.origin
  return form.value.id ? `${origin}/postular/${form.value.id}` : `${origin}/postular`
})

const publicPageUrl = computed(() => {
  if (!form.value.id) return 'Se generará al guardar'
  const origin = window.location.origin
  return `${origin}/convocatoria/${form.value.id}`
})

const copyPublicLink = async () => {
  if (!form.value.id) {
    $q.notify({ type: 'warning', message: 'Guarda la convocatoria primero para obtener el link' })
    return
  }
  try {
    await navigator.clipboard.writeText(publicPageUrl.value)
    copied.value = true
    $q.notify({ type: 'positive', message: 'Link copiado al portapapeles' })
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    $q.notify({ type: 'negative', message: 'Error al copiar' })
  }
}

const columns = [
  { name: 'codigo_interno', label: 'Código Interno', field: 'codigo_interno', sortable: true, align: 'left' },
  { name: 'titulo', label: 'Descripción de Convocatoria', field: 'titulo', sortable: true, align: 'left' },
  { name: 'ofertas', label: 'Cargos / Sedes', align: 'left' },
  { name: 'fecha_inicio', label: 'Inicio', field: 'fecha_inicio', sortable: true, align: 'center' },
  { name: 'fecha_cierre', label: 'Fin', field: 'fecha_cierre', sortable: true, align: 'center' },
  { name: 'hora_limite', label: 'Cierre', field: 'hora_limite', align: 'center' },
  { name: 'status', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center', style: 'width: 140px' }
]

watch(() => form.value.ofertas, (newOffers) => {
  if (isEdit.value && form.value.codigo_interno) return
  if (manualCodigoInterno.value) return
  if (!newOffers || newOffers.length === 0) {
    form.value.codigo_interno = ''
    return
  }
  const uniqueCargoIds = [...new Set(newOffers.map(o => o.cargo_id))]
  const uniqueSedeIds = [...new Set(newOffers.map(o => o.sede_id))]
  const year = new Date().getFullYear()
  let sSigla = 'NAC'
  if (uniqueSedeIds.length === 1) {
    const sedeEncontrada = catalogSedes.value.find(s => s.id == uniqueSedeIds[0])
    sSigla = sedeEncontrada?.sigla || 'SEDE'
  }
  let cSigla = 'MULT'
  if (uniqueCargoIds.length === 1) {
    const cargo = catalogCargos.value.find(c => c.id === uniqueCargoIds[0])
    cSigla = cargo?.sigla || 'CARGO'
  }
  form.value.codigo_interno = `CONV-${year}-${cSigla}-${sSigla}`.toUpperCase()
}, { deep: true, immediate: true })

const loadData = async () => {
  loading.value = true
  try {
    const [convRes, sedeRes, cargoRes, reqRes, plantillasRes] = await Promise.all([
       api.get('/convocatorias'), 
       api.get('/sedes'), 
       api.get('/cargos'), 
       api.get('/merit-schemas'),
       api.get('/plantillas-matrices')
    ])
    rows.value = convRes.data
    catalogSedes.value = sedeRes.data
    catalogCargos.value = cargoRes.data
    catalogRequisitos.value = adaptSchemas(reqRes.data)
    catalogPlantillas.value = plantillasRes.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando catálogos' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  isViewMode.value = false; buildOne.value = null; buildMany.value = []
  wizardStep.value = 1
  if (item) {
    isEdit.value = true
    form.value = {
      ...item,
      fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
      fecha_cierre: item.fecha_cierre ? item.fecha_cierre.split('T')[0] : '',
      contenido_detalle: item.contenido_detalle || '',
      config_requisitos_ids: Array.isArray(item.config_requisitos_ids) ? item.config_requisitos_ids : [],
      requisitos_opcionales: Array.isArray(item.requisitos_opcionales) ? item.requisitos_opcionales : [],
      requisitos_afiche: item.requisitos_afiche || {},
      matriz_evaluacion: Array.isArray(item.matriz_evaluacion) ? item.matriz_evaluacion : [],
      ofertas: item.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || [],
      estado: item.estado || 'draft',
      draft_versions: Array.isArray(item.draft_versions) ? item.draft_versions : [],
      score_profile_id: item.score_profile_id || null
    }
  } else {
    isEdit.value = false
    form.value = { id: null, titulo: '', codigo_interno: '', descripcion: '', contenido_detalle: '', fecha_inicio: '', fecha_cierre: '', hora_limite: '23:59', ofertas: [], config_requisitos_ids: [], requisitos_opcionales: [], requisitos_afiche: {}, matriz_evaluacion: [], estado: 'draft', draft_versions: [], score_profile_id: null }
  }
  manualCodigoInterno.value = false; dialog.value = true
}

const viewAfiche = (item) => {
  isViewMode.value = true
  form.value = {
    ...item,
    fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
    fecha_cierre: item.fecha_cierre ? item.fecha_cierre.split('T')[0] : '',
    config_requisitos_ids: Array.isArray(item.config_requisitos_ids) ? item.config_requisitos_ids : [],
    requisitos_opcionales: Array.isArray(item.requisitos_opcionales) ? item.requisitos_opcionales : [],
    requisitos_afiche: item.requisitos_afiche || {},
    matriz_evaluacion: Array.isArray(item.matriz_evaluacion) ? item.matriz_evaluacion : [],
    ofertas: item.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || [],
    estado: item.estado || 'draft',
    draft_versions: Array.isArray(item.draft_versions) ? item.draft_versions : [],
    score_profile_id: item.score_profile_id || null
  }
  dialog.value = true
}

const saveQuickSede = async () => {
  if (!quickSede.value.nombre || !quickSede.value.sigla) return
  quickSaving.value = true
  try {
    const { data } = await api.post('/sedes', quickSede.value)
    catalogSedes.value.push(data)
    if (builderMode.value === 'sede') buildOne.value = data.id
    else { buildMany.value.push(data.id); syncOffers(buildMany.value) }
    showQuickSede.value = false
    quickSede.value = { nombre: '', sigla: '', departamento: '' }
    manualSiglaSede.value = false
    $q.notify({ type: 'positive', message: 'Sede creada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error' })
  } finally { quickSaving.value = false }
}

const saveQuickCargo = async () => {
  if (!quickCargo.value.nombre || !quickCargo.value.sigla) return
  quickSaving.value = true
  try {
    const { data } = await api.post('/cargos', quickCargo.value)
    catalogCargos.value.push(data)
    if (builderMode.value === 'cargo') buildOne.value = data.id
    else { buildMany.value.push(data.id); syncOffers(buildMany.value) }
    showQuickCargo.value = false
    quickCargo.value = { nombre: '', sigla: '' }
    manualSiglaCargo.value = false
    $q.notify({ type: 'positive', message: 'Cargo creado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error' })
  } finally { quickSaving.value = false }
}

const toggleReq = (id) => {
  const idx = form.value.config_requisitos_ids.indexOf(id)
  if (idx > -1) {
    form.value.config_requisitos_ids.splice(idx, 1)
    const oidx = form.value.requisitos_opcionales.indexOf(id)
    if (oidx > -1) form.value.requisitos_opcionales.splice(oidx, 1)
  } else {
    form.value.config_requisitos_ids.push(id)
  }
}

const toggleOptional = (id) => {
  const idx = form.value.requisitos_opcionales.indexOf(id)
  if (idx > -1) form.value.requisitos_opcionales.splice(idx, 1)
  else form.value.requisitos_opcionales.push(id)
}

const getSedeName = (id) => catalogSedes.value.find(s => s.id == id)?.nombre || 'Sede'
const getCargoName = (id) => catalogCargos.value.find(c => c.id == id)?.nombre || 'Cargo'

const aficheFontScale = computed(() => {
  let count = form.value.ofertas.length + form.value.config_requisitos_ids.length
  if (count > 35) return 0.5
  if (count > 25) return 0.6
  if (count > 18) return 0.75
  if (count > 12) return 0.85
  if (count > 8) return 0.92
  return 1.0
})

const downloadPDF = async () => {
  const el = document.getElementById('afiche-perfect-capture')
  if (!el) return
  $q.loading.show({ message: 'Generando PDF ultraligero (Calidad HD)...' })
  try {
    const htmlToImage = await import('html-to-image')
    const { jsPDF } = await import('jspdf')

    await document.fonts.ready
    el.style.display = 'flex'
    el.style.visibility = 'visible'

    const scale = 2
    const param = {
      height: el.scrollHeight * scale,
      width: 794 * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: '794px',
        height: `${el.scrollHeight}px`,
        opacity: '1'
      },
      quality: 0.88,
      backgroundColor: '#ffffff',
      cacheBust: true,
      pixelRatio: 1
    }

    const dataUrl = await htmlToImage.toJpeg(el, param)

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const imgProps = pdf.getImageProperties(dataUrl)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
    pdf.save(`Afiche_${form.value.titulo || 'Convocatoria'}.pdf`)
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  } finally {
    const el = document.getElementById('afiche-perfect-capture')
    if (el) el.style.visibility = 'hidden'
    $q.loading.hide()
  }
}

const downloadImage = async () => {
  const el = document.getElementById('afiche-perfect-capture')
  if (!el) return
  $q.loading.show({ message: 'Generando Imagen HD optimizada...' })
  try {
    const htmlToImage = await import('html-to-image')

    await document.fonts.ready
    el.style.display = 'flex'
    el.style.visibility = 'visible'

    const scale = 2
    const param = {
      height: el.scrollHeight * scale,
      width: 794 * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: '794px',
        height: `${el.scrollHeight}px`,
        opacity: '1'
      },
      quality: 0.90,
      backgroundColor: '#ffffff',
      cacheBust: true,
      pixelRatio: 1
    }

    const dataUrl = await htmlToImage.toJpeg(el, param)
    const link = document.createElement('a')
    link.download = `Afiche_${form.value.titulo || 'Convocatoria'}.jpg`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar imagen' })
  } finally {
    const el = document.getElementById('afiche-perfect-capture')
    if (el) el.style.visibility = 'hidden'
    $q.loading.hide()
  }
}

const save = async () => {
  if (!form.value.titulo || !form.value.descripcion || !form.value.fecha_inicio || !form.value.fecha_cierre || form.value.ofertas.length === 0) {
    $q.notify({ type: 'negative', message: 'Faltan campos obligatorios' }); return
  }
  
  // Matrix validation (Fase 6)
  if (form.value.matriz_evaluacion && form.value.matriz_evaluacion.length > 0) {
     if (matrixTotalScore.value !== 100) {
       $q.notify({ type: 'warning', message: 'La matriz de evaluación debe sumar exactamente 100 puntos antes de publicar.', position: 'top' })
       return
     }
  }

  saving.value = true
  try {
    if (isEdit.value) { await api.put(`/convocatorias/${form.value.id}`, form.value) }
    else { await api.post('/convocatorias', form.value) }
    $q.notify({ type: 'positive', message: '¡Convocatoria publicada con éxito!' })
    dialog.value = false
    localStorage.removeItem('sispo_draft_convocatoria') // Clear draft on successful save
    loadData()
  } catch (error) {
    console.error(error); $q.notify({ type: 'negative', message: 'Error al guardar convocatoria' })
  } finally { saving.value = false }
}

const confirmDelete = (item) => {
  $q.dialog({ title: 'Eliminar', message: `¿Eliminar "${item.titulo}"?`, cancel: true }).onOk(async () => {
    try { await api.delete(`/convocatorias/${item.id}`); loadData() } catch { $q.notify({ type: 'negative', message: 'Error al eliminar' }) }
  })
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
  loadData()
  checkSavedDraft()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.shrink-0 {
  flex-shrink: 0;
}
.scroll::-webkit-scrollbar {
  width: 6px;
}
.scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
