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

    <!-- ATS TOP DASHBOARD BAR (Only visible when viewing all convocatorias) -->
    <PostulacionesKpis
      v-if="!selectedConvocatoria"
      :convocatorias-count="convocatorias.length"
      :total-postulantes="totalPostulantes"
      :conv-abiertas="convAbiertas"
      :total-pendientes-global="totalPendientesGlobal"
      :can-manage-all="canManageAll"
      @import-click="showImportDialog = true"
    />

    <!-- ========================================== -->
    <!-- FASE 2: UNIFIED CONVOCATORIAS ATS-STYLE VIEW -->
    <!-- ========================================== -->
    <ConvocatoriasAtsTable
      v-if="!selectedConvocatoria"
      :convocatorias="convocatorias"
      :loading="loading"
      @select="selectConvocatoria"
      @select-mode="({ conv, mode }) => selectConvocatoriaAndMode(conv, mode)"
      @export="exportConvocatoriaReport"
    />

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
          <!-- EXPORT DROPDOWN BUTTON -->
          <q-btn-dropdown
            split
            label="Exportar Excel"
            icon="download"
            color="green-8"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="exportGeneralReport"
          >
            <q-list dense class="min-w-[280px] py-2">
              <q-item clickable v-close-popup @click="exportGeneralReport">
                <q-item-section avatar>
                  <q-icon name="table_chart" color="green-8" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-bold text-xs text-gray-800">Reporte Integral con Méritos</q-item-label>
                  <q-item-label caption class="text-[10px] text-gray-500">
                    Filtro actual: Formación, posgrados, experiencia, puntajes (24 columnas)
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator class="my-1" />

              <q-item clickable v-close-popup @click="exportConvocatoriaReport(selectedConvocatoria)">
                <q-item-section avatar>
                  <q-icon name="apartment" color="indigo-8" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-bold text-xs text-gray-800">Convocatoria Completa</q-item-label>
                  <q-item-label caption class="text-[10px] text-gray-500">
                    Todas las sedes y todos los cargos de la convocatoria
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="exportMatrixExcel">
                <q-item-section avatar>
                  <q-icon name="fact_check" color="teal-8" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-bold text-xs text-gray-800">Matriz Baremo de Calificación</q-item-label>
                  <q-item-label caption class="text-[10px] text-gray-500">
                    Cuadro institucional de puntuaciones por criterio
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn
            label="Exportar PDF"
            icon="picture_as_pdf"
            color="red-7"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="exportMatrixPDF"
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
        <CargoKpiBar
          :kpi="kpiCargo"
          :filter-estado="filterEstado"
          :view-mode="viewMode"
          @select-filter="setFilterEstado"
          @select-view="(mode) => viewMode = mode"
        />

        <!-- ATS MODE SELECTOR (Segmented control) -->
        <div class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Vista de Trabajo:</span>
            <div class="flex bg-gray-100 p-1 rounded-xl flex-wrap">
              <div
                v-for="mode in ['ranking', 'matriz', 'pipeline', 'auditoria']"
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
                    mode === 'matriz' ? 'edit_note' :
                    mode === 'pipeline' ? 'dashboard' : 'gavel'
                  "
                  size="16px"
                />
                {{
                  mode === 'ranking' ? '🏆 Ranking de Méritos' :
                  mode === 'matriz' ? '📝 Baremo / Matriz' :
                  mode === 'pipeline' ? '📌 Pipeline Estados' : '⚠️ Casos Observados'
                }}
              </div>
            </div>
          </div>

          <!-- Quick Filters in Workspace -->
          <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <q-select
              v-model="filterEstado"
              :options="statusFilterOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              dense
              outlined
              rounded
              bg-color="white"
              clearable
              placeholder="Estado ATS..."
              class="w-full sm:min-w-[190px]"
            >
              <template v-slot:prepend>
                <q-icon name="filter_alt" size="16px" color="primary" />
              </template>
            </q-select>

            <q-input
              v-model="filterSearch"
              placeholder="Buscar postulante..."
              dense
              outlined
              rounded
              bg-color="white"
              class="w-full sm:min-w-[220px]"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-if="filterSearch" v-slot:append>
                <q-icon name="close" class="cursor-pointer" @click="filterSearch = ''" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Active Filter Pill Indicator -->
        <div v-if="filterEstado" class="mb-4 px-2 flex items-center gap-2 animate-fade-in">
          <span class="text-xs text-gray-500 font-bold">Filtro de Estado Activo:</span>
          <q-badge
            color="primary"
            class="px-3 py-1 text-xs font-black rounded-xl cursor-pointer flex items-center gap-2 shadow-sm"
            @click="filterEstado = null"
          >
            <span>{{ getStatusFilterBadgeLabel(filterEstado) }}</span>
            <q-icon name="close" size="14px" />
          </q-badge>
          <span class="text-xs text-gray-400 font-medium">({{ filteredRows.length }} postulantes encontrados)</span>
          <q-btn
            flat
            dense
            rounded
            size="xs"
            color="primary"
            label="Limpiar Filtro"
            class="font-black ml-2"
            @click="filterEstado = null"
          />
        </div>

        <!-- ========================================== -->
        <!-- ========================================== -->
        <!-- MODE 1: RANKING-FIRST ATS VIEW (Default)  -->
        <!-- ========================================== -->
        <PostulacionesRankingTable
          v-if="viewMode === 'ranking'"
          :rows="filteredRows"
          :selected-ids="selectedIds"
          :select-all="selectAllCheckbox"
          :status-options="statusOptions"
          :status-labels="statusLabels"
          @toggle-select-all="toggleSelectAll"
          @toggle-selection="({ id, val }) => toggleSelection(id, val)"
          @view-expediente="viewExpediente"
          @update-status="updateStatus"
          @quick-evaluate="quickEvaluateRow"
        />

        <!-- ========================================== -->
        <!-- MODE 2: AUDITORÍA HUMANA RISK QUEUE        -->
        <!-- ========================================== -->
        <PostulacionesAuditoriaView
          v-else-if="viewMode === 'auditoria'"
          :rows="auditoriaRows"
          @view-expediente="viewExpediente"
        />

        <!-- ========================================== -->
        <!-- ========================================== -->
        <!-- MODE 3: KANBAN PIPELINE VIEW (Fase 6)       -->
        <!-- ========================================== -->
        <PostulacionesKanbanView
          v-else-if="viewMode === 'pipeline'"
          :pipeline-columns="pipelineColumns"
          @view-expediente="viewExpediente"
          @move-pipeline="({ row, direction }) => moveCandidatePipeline(row, direction)"
        />

        <!-- ========================================== -->
        <!-- MODE 4: CANDIDATES LIST VIEW (Traditional) -->
        <!-- ========================================== -->
        <PostulacionesTradicionalTable
          v-else-if="viewMode === 'tradicional'"
          :rows="filteredRows"
          :columns="columns"
          :loading="loading"
          :status-options="statusOptions"
          :status-labels="statusLabels"
          :can-manage-all="canManageAll"
          @view-expediente="viewExpediente"
          @delete="deletePostulante"
          @update-status="updateStatus"
        />

        <!-- ========================================== -->
        <!-- ========================================== -->
        <!-- MODE 5: INTERACTIVE MERITS MATRIX VIEW     -->
        <!-- ========================================== -->
        <PostulacionesMatrizView
          v-else-if="viewMode === 'matriz'"
          v-model:matrix-sort-by="matrixSortBy"
          :matrix-sort-direction="matrixSortDirection"
          :filter-cargo="filterCargo"
          :current-matriz="currentMatriz"
          :dynamic-columns="dynamicColumns"
          :matriz-rows="matrizRows"
          :merit-fields="meritFields"
          :saving="saving"
          @toggle-sort-direction="toggleSortDirection"
          @export-pdf="exportMatrixPDF"
          @export-excel="exportMatrixExcel"
          @export-word="exportMatrixWord"
          @save-all="saveAll"
          @save-row="saveRow"
          @debounced-save-row="debouncedSaveRow"
          @update-field-and-save="({ row, field, v }) => updateFieldAndSave(row, field, v)"
          @view-expediente="viewExpediente"
        />

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
    <PostulacionesImportDialog
      v-model="showImportDialog"
      @imported="loadConvocatorias"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date, debounce } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { generateInstitutionalEvaluationPDF } from 'src/utils/institutionalPdfEngine'
import { exportInstitutionalMatrixExcel, exportInstitutionalGeneralExcel } from 'src/utils/institutionalExcelEngine'
import { exportInstitutionalMatrixWord } from 'src/utils/institutionalWordEngine'

import { useAuthStore } from 'src/stores/auth-store'
import PostulanteExpedienteDialog from 'src/components/postulaciones/PostulanteExpedienteDialog.vue'
import PostulacionesKpis from 'src/components/postulaciones/PostulacionesKpis.vue'
import ConvocatoriasAtsTable from 'src/components/postulaciones/ConvocatoriasAtsTable.vue'
import CargoKpiBar from 'src/components/postulaciones/CargoKpiBar.vue'
import PostulacionesImportDialog from 'src/components/postulaciones/PostulacionesImportDialog.vue'
import PostulacionesRankingTable from 'src/components/postulaciones/PostulacionesRankingTable.vue'
import PostulacionesKanbanView from 'src/components/postulaciones/PostulacionesKanbanView.vue'
import PostulacionesMatrizView from 'src/components/postulaciones/PostulacionesMatrizView.vue'
import PostulacionesAuditoriaView from 'src/components/postulaciones/PostulacionesAuditoriaView.vue'
import PostulacionesTradicionalTable from 'src/components/postulaciones/PostulacionesTradicionalTable.vue'

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


// Import state
const showImportDialog = ref(false)

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

const statusFilterOptions = [
  { label: 'Todos los Estados', value: null },
  { label: '★ Preseleccionados', value: 'validada' },
  { label: '📥 Postulados (Enviados)', value: 'enviada' },
  { label: '⏱ En Evaluación', value: 'en_revision' },
  { label: '🏆 Seleccionados', value: 'seleccionado' },
  { label: '⚠️ Con Observación', value: 'observada' },
  { label: '❌ No Seleccionados', value: 'rechazada' },
  { label: '✓ Evaluados (Con Score)', value: 'evaluados' },
  { label: '⏳ Sin Evaluar (Pendientes)', value: 'sin_evaluar' },
  { label: '🚨 Riesgo Alto / Crítico', value: 'riesgo' },
]

// Workspace Sede/Cargo Filters
const filterSearch = ref('')
const filterEstado = ref(null)
const filterSede = ref(null)
const filterCargo = ref(null)

const setFilterEstado = (estado) => {
  if (filterEstado.value === estado) {
    filterEstado.value = null
  } else {
    filterEstado.value = estado
  }
}

const getStatusFilterBadgeLabel = (val) => {
  const match = statusFilterOptions.find((o) => o.value === val)
  return match ? match.label : String(val).toUpperCase()
}

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

    // Estado filter
    if (filterEstado.value) {
      if (filterEstado.value === 'validada') {
        if (row.estado !== 'validada' && row.estado !== 'seleccionado') return false
      } else if (filterEstado.value === 'evaluados') {
        if (row.evaluacion?.score_total === undefined || row.evaluacion?.score_total === null) return false
      } else if (filterEstado.value === 'sin_evaluar') {
        if (row.evaluacion?.score_total !== undefined && row.evaluacion?.score_total !== null) return false
      } else if (filterEstado.value === 'riesgo') {
        const r = row.evaluacion?.nivel_riesgo
        if (r !== 'critico' && r !== 'alto') return false
      } else {
        if (row.estado !== filterEstado.value) return false
      }
    }

    return true
  })

  // Sort descending by score, sending unevaluated candidates to the bottom
  return [...filtered].sort((a, b) => {
    const aVal = a.evaluacion?.score_total
    const bVal = b.evaluacion?.score_total
    const aEvaluated = aVal !== undefined && aVal !== null
    const bEvaluated = bVal !== undefined && bVal !== null

    if (aEvaluated && !bEvaluated) return -1
    if (!aEvaluated && bEvaluated) return 1
    if (!aEvaluated && !bEvaluated) return 0

    const aScore = toNumber(aVal)
    const bScore = toNumber(bVal)
    return bScore - aScore
  })
})

// Ordenamiento flexible para la Matriz/Baremo de evaluación a voluntad del evaluador
const matrixSortBy = ref('alfabetico') // 'alfabetico' | 'puntaje' | 'ats' | 'registro'
const matrixSortDirection = ref('asc') // 'asc' | 'desc'

const toggleSortDirection = () => {
  matrixSortDirection.value = matrixSortDirection.value === 'asc' ? 'desc' : 'asc'
}

watch(matrixSortBy, (newVal) => {
  if (newVal === 'puntaje' || newVal === 'ats') {
    matrixSortDirection.value = 'desc'
  } else {
    matrixSortDirection.value = 'asc'
  }
})

const matrizRows = computed(() => {
  const filtered = rows.value.filter((row) => {
    if (filterSearch.value) {
      const search = filterSearch.value.toLowerCase()
      const fullName = `${row.postulante?.nombres} ${row.postulante?.apellidos}`.toLowerCase()
      const ci = String(row.postulante?.ci || '').toLowerCase()
      if (!fullName.includes(search) && !ci.includes(search)) return false
    }

    if (filterSede.value && row.oferta?.sede?.nombre !== filterSede.value) return false
    if (filterCargo.value && row.oferta?.cargo?.nombre !== filterCargo.value) return false

    // Estado filter
    if (filterEstado.value) {
      if (filterEstado.value === 'validada') {
        if (row.estado !== 'validada' && row.estado !== 'seleccionado') return false
      } else if (filterEstado.value === 'evaluados') {
        if (row.evaluacion?.score_total === undefined || row.evaluacion?.score_total === null) return false
      } else if (filterEstado.value === 'sin_evaluar') {
        if (row.evaluacion?.score_total !== undefined && row.evaluacion?.score_total !== null) return false
      } else if (filterEstado.value === 'riesgo') {
        const r = row.evaluacion?.nivel_riesgo
        if (r !== 'critico' && r !== 'alto') return false
      } else {
        if (row.estado !== filterEstado.value) return false
      }
    }

    return true
  })

  const isAsc = matrixSortDirection.value === 'asc'

  return [...filtered].sort((a, b) => {
    let diff = 0

    if (matrixSortBy.value === 'puntaje') {
      // Puntaje actual de evaluación de méritos
      const aVal = a.evaluacion?.score_total ?? calculateTotal(a)
      const bVal = b.evaluacion?.score_total ?? calculateTotal(b)
      const aEvaluated = aVal !== undefined && aVal !== null && aVal !== 0
      const bEvaluated = bVal !== undefined && bVal !== null && bVal !== 0

      if (aEvaluated && !bEvaluated) diff = -1
      else if (!aEvaluated && bEvaluated) diff = 1
      else {
        diff = toNumber(bVal) - toNumber(aVal)
      }
      return isAsc ? -diff : diff
    }

    if (matrixSortBy.value === 'ats') {
      // Ranking ATS / Compatibilidad global
      const aAts = a.evaluacion?.score_total ?? a.aiMatchingResult?.score_global ?? a.evaluationResult?.score_total ?? 0
      const bAts = b.evaluacion?.score_total ?? b.aiMatchingResult?.score_global ?? b.evaluationResult?.score_total ?? 0
      diff = toNumber(bAts) - toNumber(aAts)
      if (diff === 0) {
        diff = (a.id || 0) - (b.id || 0)
      }
      return isAsc ? -diff : diff
    }

    if (matrixSortBy.value === 'registro') {
      diff = (a.id || 0) - (b.id || 0)
      return isAsc ? diff : -diff
    }

    // Default: 'alfabetico' (A-Z Apellidos y Nombres)
    const apeA = `${a.postulante?.apellidos || ''} ${a.postulante?.nombres || ''}`.trim().toLowerCase()
    const apeB = `${b.postulante?.apellidos || ''} ${b.postulante?.nombres || ''}`.trim().toLowerCase()
    diff = apeA.localeCompare(apeB)
    if (diff === 0) {
      diff = (a.id || 0) - (b.id || 0)
    }
    return isAsc ? diff : -diff
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
const cargoRows = computed(() => {
  return rows.value.filter((row) => {
    if (filterSede.value && row.oferta?.sede?.nombre !== filterSede.value) return false
    if (filterCargo.value && row.oferta?.cargo?.nombre !== filterCargo.value) return false
    return true
  })
})

const kpiCargo = computed(() => {
  const list = cargoRows.value
  const total = list.length
  const evaluados = list.filter(r => r.evaluacion?.score_total !== undefined && r.evaluacion?.score_total !== null).length
  const sinEvaluar = total - evaluados
  const preseleccionados = list.filter(r => r.estado === 'seleccionado' || r.estado === 'validada').length
  const auditoria = list.filter(r => r.evaluacion?.clasificacion === 'auditoria_humana' || r.estado === 'observada').length
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
           descripcion: crit.descripcion || crit.detalle || crit.pautas || '',
           seccion: sec.seccion || `Sección ${sIdx + 1}`,
           sectionIndex: sIdx
        })
     })
   })
   return cols
})

const extractExtraInfo = (postulacion) => {
  const p = postulacion.postulante
  if (!p) return { area: '-', anio: '-' }

  let area = ''
  let anio = ''

  // 1. Prioridad: formaciones académicas (revisar camelCase y snake_case)
  const formaciones = p.formaciones_academicas || p.formacionesAcademicas || []
  if (Array.isArray(formaciones) && formaciones.length > 0) {
    for (const f of formaciones) {
      const cName =
        f.career?.name ||
        f.carrera_raw ||
        f.carrera ||
        f.professionalArea?.name ||
        f.professional_area?.name ||
        f.nivel_academico_normalizado ||
        f.nivel_academico_raw
      if (cName && !area) {
        area = String(cName).trim()
      }
      const fecha = f.fecha_titulo || f.fecha_diploma
      if (fecha && !anio) {
        const match = String(fecha).match(/\b(19\d\d|20\d\d)\b/)
        if (match) anio = match[0]
      }
      if (area && anio) break
    }
  }

  // 2. Prioridad: méritos del postulante (respuestas JSON con profesion/carrera/titulo)
  const meritos = p.meritos || []
  if ((!area || !anio) && Array.isArray(meritos) && meritos.length > 0) {
    // Filtrar méritos de formación de pregrado / académica
    const formacionMeritos = meritos.filter((m) => {
      const nom = (m.tipoDocumento?.nombre || m.tipo_documento?.nombre || '').toUpperCase()
      const cat = (m.tipoDocumento?.categoria || m.tipo_documento?.categoria || '').toUpperCase()
      const desc = (m.tipoDocumento?.descripcion || m.tipo_documento?.descripcion || '').toUpperCase()
      return (
        m.tipo_documento_id === 1 ||
        cat.includes('FORMACIÓN') ||
        cat.includes('FORMACION') ||
        nom.includes('FORMACIÓN') ||
        nom.includes('FORMACION') ||
        nom.includes('PREGRADO') ||
        nom.includes('TÍTULO') ||
        nom.includes('TITULO') ||
        desc.includes('PREGRADO')
      )
    })

    const targetMeritos = formacionMeritos.length > 0 ? formacionMeritos : meritos
    for (const m of targetMeritos) {
      const r = m.respuestas || {}
      if (!area) {
        const cand = r.profesion || r.carrera || r.titulo || r.nombre_titulo || r.carrera_egreso || r.area
        if (cand) area = String(cand).trim()
      }
      if (!anio) {
        const rawDate = r.fecha_titulo || r.fecha_diploma || r.fecha || r.fecha_emision || r.anio || r.gestion
        if (rawDate) {
          const match = String(rawDate).match(/\b(19\d\d|20\d\d)\b/)
          if (match) anio = match[0]
        }
      }
      if (area && anio) break
    }

    // Si aún no se encontró área, buscar en cualquier mérito que contenga profesión/carrera
    if (!area) {
      for (const m of meritos) {
        const r = m.respuestas || {}
        const cand = r.profesion || r.carrera || r.titulo || r.nombre_titulo || r.area
        if (cand) {
          area = String(cand).trim()
          if (!anio) {
            const rawDate = r.fecha_titulo || r.fecha_diploma || r.fecha || r.anio
            if (rawDate) {
              const match = String(rawDate).match(/\b(19\d\d|20\d\d)\b/)
              if (match) anio = match[0]
            }
          }
          break
        }
      }
    }
  }

  // 3. Fallback a campos directos del postulante si existiesen
  if (!area && (p.profesion || p.titulo_profesional || p.carrera)) {
    area = String(p.profesion || p.titulo_profesional || p.carrera).trim()
  }

  return {
    area: area || '-',
    anio: anio || '-'
  }
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
    for (const row of matrizRows.value) {
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

const exportMatrixPDF = async () => {
  const items = matrizRows.value.length > 0 ? matrizRows.value : rows.value
  if (!items || items.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay postulantes para exportar en este filtro.' })
    return
  }

  try {
    $q.loading.show({ message: 'Generando Acta Oficial Institucional en PDF...' })
    await generateInstitutionalEvaluationPDF({
      convocatoria: selectedConvocatoria.value || {},
      sede: filterSede.value || 'TODAS LAS SEDES',
      cargo: filterCargo.value || 'TODOS LOS CARGOS',
      items,
      currentMatriz: currentMatriz.value,
      dynamicColumns: dynamicColumns.value,
      calculateTotal
    })
    $q.notify({ type: 'positive', message: 'Acta Oficial PDF descargada con éxito.' })
  } catch (err) {
    console.error('Error al exportar PDF:', err)
    $q.notify({ type: 'negative', message: 'Error al generar PDF: ' + (err.message || 'Error desconocido') })
  } finally {
    $q.loading.hide()
  }
}

const exportMatrixExcel = async () => {
  const items = matrizRows.value.length > 0 ? matrizRows.value : rows.value
  if (!items || items.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay postulantes para exportar en este filtro.' })
    return
  }

  try {
    $q.loading.show({ message: 'Generando Matriz Institucional en Excel...' })
    await exportInstitutionalMatrixExcel({
      convocatoria: selectedConvocatoria.value || {},
      sede: filterSede.value || 'TODAS LAS SEDES',
      cargo: filterCargo.value || 'TODOS LOS CARGOS',
      items,
      currentMatriz: currentMatriz.value,
      dynamicColumns: dynamicColumns.value,
      calculateTotal
    })
    $q.notify({ type: 'positive', message: 'Matriz Excel descargada con éxito.' })
  } catch (err) {
    console.error('Error al exportar Excel:', err)
    $q.notify({ type: 'negative', message: 'Error al generar Excel: ' + (err.message || 'Error desconocido') })
  } finally {
    $q.loading.hide()
  }
}

const exportMatrixWord = async () => {
  const items = matrizRows.value.length > 0 ? matrizRows.value : rows.value
  if (!items || items.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay postulantes para exportar en este filtro.' })
    return
  }

  try {
    $q.loading.show({ message: 'Generando Acta Oficial Institucional en Word (.doc)...' })
    await exportInstitutionalMatrixWord({
      convocatoria: selectedConvocatoria.value || {},
      sede: filterSede.value || 'TODAS LAS SEDES',
      cargo: filterCargo.value || 'TODOS LOS CARGOS',
      items,
      currentMatriz: currentMatriz.value,
      dynamicColumns: dynamicColumns.value,
      calculateTotal
    })
    $q.notify({ type: 'positive', message: 'Acta Oficial Word descargada con éxito.' })
  } catch (err) {
    console.error('Error al exportar Word:', err)
    $q.notify({ type: 'negative', message: 'Error al generar Word: ' + (err.message || 'Error desconocido') })
  } finally {
    $q.loading.hide()
  }
}

const exportGeneralReport = async () => {
  const items = filteredRows.value
  if (!items || items.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay postulantes con los filtros seleccionados para exportar.' })
    return
  }

  try {
    $q.loading.show({ message: 'Generando Reporte General Institucional con Méritos...' })
    await exportInstitutionalGeneralExcel({
      convocatoria: selectedConvocatoria.value || {},
      items,
      filterSede: filterSede.value || 'TODAS LAS SEDES',
      filterCargo: filterCargo.value || 'TODOS LOS CARGOS',
      filterEstado: filterEstado.value
    })
    $q.notify({ type: 'positive', message: 'Reporte General Excel con Méritos descargado con éxito.' })
  } catch (err) {
    console.error('Error al exportar Reporte General:', err)
    $q.notify({ type: 'negative', message: 'Error al generar Reporte General: ' + (err.message || 'Error desconocido') })
  } finally {
    $q.loading.hide()
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
    const items = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : [])

    // Map with interactive merit variables and consolidate scores from Score Engine & AI
    rows.value = items.map((postulacion) => {
      const existing = {
        ...(postulacion.evaluacion?.detalle_evaluacion || {}),
        observaciones: postulacion.evaluacion?.observaciones || ''
      }

      // Consolidate score & classification from all engine sources
      const er = postulacion.evaluation_result || postulacion.evaluationResult || {}
      const ai = postulacion.ai_matching_result || postulacion.aiMatchingResult || {}
      const ev = postulacion.evaluacion || {}

      let score = null
      if (er.score_total !== undefined && er.score_total !== null) {
        score = Number(er.score_total)
      } else if (ai.score_total !== undefined && ai.score_total !== null) {
        score = Number(ai.score_total)
      } else if (ev.puntaje_total !== undefined && ev.puntaje_total !== null && Number(ev.puntaje_total) > 0) {
        score = Number(ev.puntaje_total)
      }

      const clasificacion = er.classification || ai.clasificacion_ia || (score !== null ? (score >= 70 ? 'apto' : (score >= 50 ? 'auditoria_humana' : 'no_apto')) : null)
      const nivel_riesgo = er.review_risk_level || (score !== null ? (score < 40 ? 'alto' : 'bajo') : null)

      const unifiedEval = {
        ...ev,
        score_total: score !== null ? score : undefined,
        puntaje_total: score !== null ? score : (ev.puntaje_total || 0),
        clasificacion: clasificacion,
        clasificacion_ia: ai.clasificacion_ia || clasificacion,
        nivel_riesgo: nivel_riesgo,
        requires_human_review: er.requires_human_review || false,
        strengths: er.strengths_json || ai.fortalezas || [],
        weaknesses: er.weaknesses_json || ai.debilidades || []
      }

      return {
        ...postulacion,
        evaluacion: unifiedEval,
        extraInfo: extractExtraInfo(postulacion),
        evalData: createEvalData(existing)
      }
    })

    // Restore sede and cargo from query
    const sedes = [...new Set(items.map(r => r.oferta?.sede?.nombre).filter(Boolean))]
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

onMounted(async () => {
  await loadConvocatorias()
  // Restore convocatoria from query param (deep link)
  const convId = route.query.conv_id || route.query.convocatoria_id
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
.first-col { left: 0; width: 44px; min-width: 44px; max-width: 44px; background-color: #f8f9fa !important; z-index: 45; border-right: 2px solid rgba(102, 51, 153, 0.4); box-sizing: border-box; }
.second-col {
  left: 44px;
  min-width: 220px;
  max-width: 280px;
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
