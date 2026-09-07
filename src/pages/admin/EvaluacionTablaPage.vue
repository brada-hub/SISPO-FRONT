<template>
  <q-page class="p-4 bg-grey-3">
    <!-- Header info -->
    <div class="bg-white p-6 rounded-2xl shadow-xl border q-mb-md">
      <div class="text-center">
        <h1 class="text-h3 font-bold q-ma-none text-primary uppercase tracking-tighter">{{ headerInfo.nombre || 'Concurso de Méritos' }}</h1>
        <div class="row justify-center q-mt-sm q-col-gutter-md uppercase text-subtitle1 text-weight-bold text-primary">
          <div class="bg-purple-1 q-px-md q-py-xs rounded-full shadow-sm">
            GESTIÓN: <span class="text-black">{{ headerInfo.gestion }}</span>
          </div>
          <div class="bg-indigo-1 q-px-md q-py-xs rounded-full shadow-sm">
            INICIO: <span class="text-black">{{ formatDate(headerInfo.fecha_inicio) }}</span>
          </div>
          <div class="bg-red-1 q-px-md q-py-xs rounded-full shadow-sm">
            CIERRE: <span class="text-black">{{ formatDate(headerInfo.fecha_cierre) }}</span>
          </div>
        </div>
      </div>

      <div class="row justify-between items-center q-mt-lg">
        <q-btn icon="arrow_back" unelevated color="grey-3" text-color="grey-9" label="VOLVER" @click="goBack" class="rounded-xl px-6 font-black h-12" />

        <div class="flex gap-3 items-center">
          <div class="text-weight-bold text-grey-7 q-mr-md uppercase text-[10px] tracking-widest">
            Postulantes: <span class="text-primary text-h6">{{ localRows.length }}</span>
          </div>
          <q-btn
            color="red-9"
            icon="picture_as_pdf"
            label="PDF (OFICIO)"
            unelevated
            @click="exportToPDF()"
            class="rounded-xl shadow-lg font-black h-12 min-w-[160px]"
          />
          <q-btn
            color="green-8"
            icon="description"
            label="EXCEL"
            unelevated
            @click="exportToExcel()"
            class="rounded-xl shadow-lg font-black h-12 min-w-[160px]"
          />
          <q-btn
            color="secondary"
            icon="check_circle"
            label="GUARDAR TODO"
            unelevated
            :loading="saving"
            @click="saveAll"
            class="rounded-xl shadow-lg font-black h-12 min-w-[170px]"
          />
        </div>
      </div>
    </div>

    <!-- Sede & Cargo Selector (Horizontal Style) -->
    <div class="bg-white q-pa-lg rounded-2xl shadow-xl border q-mb-md">
       <div class="row q-col-gutter-lg items-center">
          <div class="col-12 col-md-4">
             <div class="text-caption text-weight-bold text-deep-purple-8 q-mb-xs uppercase">1. Seleccione Sede</div>
             <q-select
                v-model="selectedSedeName"
                :options="Object.keys(hierarchicalGroups)"
                outlined
                rounded
                dense
                bg-color="white"
                label="Sede Académica"
                class="shadow-sm"
                @update:model-value="onSedeChange"
             >
                <template v-slot:prepend>
                  <q-icon name="apartment" color="primary" />
                </template>
             </q-select>
          </div>
          <div class="col-12 col-md-8" v-if="selectedSedeName">
            <div class="text-caption text-weight-bold text-deep-purple-8 q-mb-xs uppercase">2. Seleccione Carrera / Cargo</div>
            <div class="row q-gutter-sm">
                <q-btn
                    v-for="(group, groupKey) in hierarchicalGroups[selectedSedeName]?.cargos"
                    :key="groupKey"
                    unelevated
                    rounded
                    no-caps
                    :color="activeTab === groupKey ? 'primary' : 'grey-2'"
                    :text-color="activeTab === groupKey ? 'white' : 'grey-7'"
                    @click="activeTab = groupKey"
                    class="q-px-md font-bold transition-all border shadow-sm"
                    :class="activeTab === groupKey ? 'shadow-10' : ''"
                >
                    <div class="column items-start">
                        <div style="font-size: 11px;">{{ group.cargo }}</div>
                        <div style="font-size: 9px;" class="opacity-70">{{ group.items.length }} postulantes</div>
                    </div>
                </q-btn>
            </div>
          </div>
       </div>
    </div>

    <!-- Main Content Area -->
    <div v-show="activeTab">
      <q-tab-panels v-model="activeTab" animated class="bg-transparent no-shadow">
        <q-tab-panel v-for="(group, groupKey) in groupedRows" :key="groupKey" :name="groupKey" class="q-pa-none">
          <!-- Section Header -->
          <div class="bg-primary text-white p-6 shadow-2xl row items-center justify-between no-wrap" style="border-radius: 20px 20px 0 0;">
            <div class="row items-center gap-4 no-wrap">
              <div class="bg-white text-primary p-3 rounded-2xl shadow-inner">
                <q-icon name="apartment" size="md" />
              </div>
              <div class="column">
                <span class="text-h5 font-black leading-none uppercase tracking-tighter">{{ group.sede }}</span>
                <span class="text-subtitle1 font-bold opacity-80 uppercase tracking-widest">{{ group.cargo }}</span>
              </div>
            </div>
            <div class="row items-center gap-2">
              <div class="text-subtitle2 font-black bg-white text-primary px-4 h-10 flex items-center rounded-xl shadow-inner mr-2">
                {{ group.items.length }} POSTULANTES
              </div>
              <q-btn
                color="white"
                text-color="red-9"
                icon="picture_as_pdf"
                label="PDF"
                unelevated
                @click="exportToPDF(group)"
                class="rounded-xl font-black shadow-md h-10 min-w-[110px]"
              />
              <q-btn
                color="white"
                text-color="green-8"
                icon="description"
                label="EXCEL"
                unelevated
                @click="exportToExcel(group)"
                class="rounded-xl font-black shadow-md h-10 min-w-[110px]"
              />
              <q-btn
                color="secondary"
                text-color="white"
                icon="save"
                label="GUARDAR"
                unelevated
                :loading="saving"
                @click="saveGroup(group.items)"
                class="rounded-xl font-black shadow-md h-10 min-w-[130px]"
              />
            </div>
          </div>

          <div class="bg-white rounded-b-2xl shadow-2xl border overflow-hidden q-mb-xl">
            <div class="scroll-container overflow-auto">
              <table class="matrix-table uppercase">
                <thead>
                  <tr class="main-headers">
                    <th rowspan="2" class="sticky-col first-col header-cell">No.</th>
                    <th rowspan="2" class="sticky-col second-col header-cell">Nombres y Apellidos</th>
                    <th rowspan="2" class="header-v bg-grey-2">Área Formación</th>
                    <th rowspan="2" class="header-v bg-grey-2">Año Título</th>
                    <th rowspan="2" class="header-v bg-grey-2">Pretensión Salarial</th>

                    <template v-if="currentMatriz">
                        <th v-for="(sec, sIdx) in currentMatriz" :key="'sec'+sIdx" :colspan="sec.criterios.length" class="text-white area-title" :class="sIdx % 2 === 0 ? 'bg-primary' : 'bg-secondary'">
                           {{ sec.seccion }} ({{ sec.criterios.reduce((acc, c) => acc + (Number(c.puntaje)||0), 0) }} pts)
                        </th>
                    </template>
                    <template v-else>
                        <th colspan="4" class="bg-primary text-white area-title">FORMACIÓN PROFESIONAL (20 pts)</th>
                        <th colspan="4" class="bg-secondary text-white area-title">PERFECCIONAMIENTO PROFESIONAL (20 pts)</th>
                        <th colspan="5" class="bg-primary text-white area-title">EXPERIENCIA ACADÉMICA (50 pts)</th>
                        <th colspan="3" class="bg-secondary text-white area-title">OTROS MÉRITOS (10 pts)</th>
                    </template>

                    <th rowspan="2" class="bg-primary text-white final-score-header">PUNTAJE FINAL</th>
                    <th rowspan="2" class="header-cell" style="min-width: 250px;">OBSERVACIONES</th>
                  </tr>
                  <tr class="sub-headers">
                    <template v-if="currentMatriz">
                        <th v-for="col in dynamicColumns" :key="'col'+col.id" class="sub-h cursor-help">
                            {{ col.nombre }} ({{ col.puntaje }} pts)
                            <q-tooltip class="bg-primary text-white text-subtitle2" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                              {{ col.nombre }} (Máximo: {{ col.puntaje }} pts)
                            </q-tooltip>
                        </th>
                    </template>
                    <template v-else>
                        <th class="sub-h cursor-help">Diplomado (3 pts)<q-tooltip class="bg-primary text-white text-subtitle2">Diplomado (Máx: 3 pts)</q-tooltip></th>
                        <th class="sub-h cursor-help">Especialización (4 pts)<q-tooltip class="bg-primary text-white text-subtitle2">Especialización (Máx: 4 pts)</q-tooltip></th>
                        <th class="sub-h cursor-help">Maestría (6 pts)<q-tooltip class="bg-primary text-white text-subtitle2">Maestría (Máx: 6 pts)</q-tooltip></th>
                        <th class="sub-h cursor-help">Doctorado (7 pts)<q-tooltip class="bg-primary text-white text-subtitle2">Doctorado (Máx: 7 pts)</q-tooltip></th>
                        <th class="sub-h cursor-help">Cursos area > 120 hrs (3 p/c max 9)<q-tooltip class="bg-primary text-white text-subtitle2">Cursos area > 120 hrs (3 p/c max 9)</q-tooltip></th>
                        <th class="sub-h cursor-help">Cursillos/Semin. > 20 hrs (1 p max 5)<q-tooltip class="bg-primary text-white text-subtitle2">Cursillos/Semin. > 20 hrs (1 p max 5)</q-tooltip></th>
                        <th class="sub-h cursor-help">Disertante congresos (1 p max 3)<q-tooltip class="bg-primary text-white text-subtitle2">Disertante congresos (1 p max 3)</q-tooltip></th>
                        <th class="sub-h cursor-help">Formación Pedagóg. (1 p max 3)<q-tooltip class="bg-primary text-white text-subtitle2">Formación Pedagóg. (1 p max 3)</q-tooltip></th>
                        <th class="sub-h cursor-help">Ejercicio Profesional (1 p/año max 15)<q-tooltip class="bg-primary text-white text-subtitle2">Ejercicio Profesional (1 p/año max 15)</q-tooltip></th>
                        <th class="sub-h cursor-help">Docencia Ejercida (1 p/sem max 10)<q-tooltip class="bg-primary text-white text-subtitle2">Docencia Ejercida (1 p/sem max 10)</q-tooltip></th>
                        <th class="sub-h cursor-help">Tutoría de Tesis (1 p max 5)<q-tooltip class="bg-primary text-white text-subtitle2">Tutoría de Tesis (1 p max 5)</q-tooltip></th>
                        <th class="sub-h cursor-help">Docente Postgrado (1 p max 5)<q-tooltip class="bg-primary text-white text-subtitle2">Docente Postgrado (1 p max 5)</q-tooltip></th>
                        <th class="sub-h cursor-help">Cargos Similares (max 15)<q-tooltip class="bg-primary text-white text-subtitle2">Cargos Similares (max 15)</q-tooltip></th>
                        <th class="sub-h cursor-help">Revistas Indexadas (1 p max 3)<q-tooltip class="bg-primary text-white text-subtitle2">Revistas Indexadas (1 p max 3)</q-tooltip></th>
                        <th class="sub-h cursor-help">Libros/Textos (1 p max 3)<q-tooltip class="bg-primary text-white text-subtitle2">Libros/Textos (1 p max 3)</q-tooltip></th>
                        <th class="sub-h cursor-help">Distinciones Honoríf. (1 p max 4)<q-tooltip class="bg-primary text-white text-subtitle2">Distinciones Honoríf. (1 p max 4)</q-tooltip></th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in group.items" :key="row.id" class="data-row">
                    <td class="text-center text-weight-bold sticky-col first-col bg-grey-1">{{ index + 1 }}</td>
                    <td class="text-weight-bold sticky-col second-col bg-white">
                      <div class="q-pr-md line-height-1">
                        <div class="text-primary text-weight-bolder cursor-pointer hover:underline" style="font-size: 13px;" @click="openExpedienteModal(row)">
                          {{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}
                          <q-tooltip>Ver Expediente Completo</q-tooltip>
                        </div>
                      </div>
                    </td>

                    <td class="text-center bg-grey-1 text-[9px] font-bold" style="width: 80px; word-break: break-all;">{{ row.extraInfo.area }}</td>
                    <td class="text-center bg-grey-1 font-bold">{{ row.extraInfo.anio }}</td>
                    <td class="text-center bg-teal-1 font-bold text-secondary cursor-pointer">
                      Bs. <br>{{ Math.round(row.pretension_salarial || 0) }}
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
                       <td v-for="col in dynamicColumns" :key="col.id" class="score-cell">
                         <div class="cell-val" :class="col.sectionIndex % 2 === 0 ? 'text-primary' : 'text-secondary'">{{ row.evalData[col.id] }}</div>
                         <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                           <div class="bg-grey-9 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ col.nombre }}</div>
                           <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                             <q-btn v-for="v in getDynamicOptions(col.puntaje)" :key="v" dense unelevated :label="v" :color="row.evalData[col.id] === v ? 'primary' : 'grey-2'" :text-color="row.evalData[col.id] === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="updateFieldAndSave(row, col.id, v)" v-close-popup />
                           </div>
                         </q-popup-proxy>
                       </td>
                    </template>
                    <template v-else>
                       <td v-for="field in meritFields" :key="field" class="score-cell">
                         <div class="cell-val" :class="getFieldColorClass(field)">{{ row.evalData[field] }}</div>
                         <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                           <div class="bg-grey-9 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel(field) }}</div>
                           <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                             <q-btn v-for="v in getOptionsForField(field)" :key="v" dense unelevated :label="v" :color="row.evalData[field] === v ? 'primary' : 'grey-2'" :text-color="row.evalData[field] === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="updateFieldAndSave(row, field, v)" v-close-popup />
                           </div>
                         </q-popup-proxy>
                       </td>
                    </template>

                    <td class="text-center text-weight-bolder text-h6 bg-grey-2" :class="calculateTotal(row) < 51 ? 'text-red' : 'text-secondary'">
                      {{ calculateTotal(row) }}
                    </td>
                    <td class="bg-white"><textarea v-model="row.evalData.observaciones" class="cell-textarea" rows="2" @input="debouncedSaveRow(row)"></textarea></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Empty State -->
    <div v-if="!activeTab && !loading" class="flex flex-center q-pa-xl bg-white rounded-2xl shadow-lg border">
      <div class="text-center">
        <q-icon name="ads_click" size="100px" color="grey-3" />
        <div class="text-h4 text-grey-4 font-black q-mt-md">SELECCIONE UNA SEDE Y CARGO</div>
        <p class="text-grey-5">Utilice el selector de arriba para visualizar los datos.</p>
      </div>
    </div>

    <!-- EXPEDIENTE MODAL -->
    <q-dialog v-model="showExpedienteModal" maximizable maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-grey-3 flex flex-col no-wrap">
        <!-- Modal Toolbar -->
        <q-toolbar class="bg-gradient-to-r from-primary to-secondary text-white shadow-md q-px-lg">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold text-subtitle1">
             EXPEDIENTE: {{ selectedPostulacion?.postulante?.nombres }} {{ selectedPostulacion?.postulante?.apellidos }}
          </q-toolbar-title>
          <q-space />
          <q-btn
            flat
            round
            icon="download"
            @click="exportToPDFExpediente"
            class="q-mr-sm"
          >
            <q-tooltip>Descargar Expediente (PDF)</q-tooltip>
          </q-btn>
        </q-toolbar>

        <!-- Expediente Content (Reusing Logic) -->
        <div class="flex-1 overflow-hidden relative">
           <!-- We embed the Page component but modify it slightly via props or styles if needed,
                but since ExpedientePage is a full page, we might just iframe it or reuse components.
                For Speed, we will use an iframe to the existing route to ensure 100% fidelity without code dupe
            -->
            <!-- Using iframe to reuse the full page logic without refactoring everything into components right now. It is efficient for this admin task. -->
            <ExpedienteDetail ref="expedienteRef" v-if="selectedPostulacion" :postulacion-id="selectedPostulacion.id" />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { debounce } from 'quasar'
import ExpedienteDetail from 'components/admin/ExpedienteDetail.vue'
import { generateInstitutionalEvaluationPDF, generateInstitutionalExpedientePDF } from 'src/utils/institutionalPdfEngine'
import { exportInstitutionalMatrixExcel } from 'src/utils/institutionalExcelEngine'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const localRows = ref([])

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/admin/evaluaciones')
  }
}
const loading = ref(false)
const saving = ref(false)
const activeTab = ref(null)
const selectedSedeName = ref(null)

// Modal Logic
const showExpedienteModal = ref(false)
const selectedPostulacion = ref(null)
const expedienteRef = ref(null)

const openExpedienteModal = (row) => {
  selectedPostulacion.value = row
  showExpedienteModal.value = true
}

const exportToPDFExpediente = async () => {
  if (!expedienteRef.value) return

  const postu = expedienteRef.value.postulacion
  if (!postu) return

  try {
    $q.loading.show({ message: 'Generando Expediente Digital Institucional...' })
    await generateInstitutionalExpedientePDF({
      postulacion: postu,
      filteredMeritos: expedienteRef.value.filteredMeritos || []
    })
    $q.notify({ type: 'positive', message: 'Expediente Institucional descargado con éxito.' })
  } catch (err) {
    console.error('Error al exportar Expediente PDF:', err)
    $q.notify({ type: 'negative', message: 'Error al generar Expediente: ' + (err.message || 'Error desconocido') })
  } finally {
    $q.loading.hide()
  }
}

const headerInfo = ref({
  nombre: '',
  gestion: '',
  fecha_inicio: '',
  fecha_cierre: '',
  matriz: null,
})

const currentMatriz = computed(() => {
  if (headerInfo.value.matriz && Array.isArray(headerInfo.value.matriz) && headerInfo.value.matriz.length > 0) {
     return headerInfo.value.matriz
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

const getDynamicOptions = (maxPuntaje) => {
   let opts = []
   for(let i=0; i<=maxPuntaje; i++) {
     opts.push(i)
   }
   return opts
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const extractExtraInfo = (postulacion) => {
  const p = postulacion.postulante
  if (!p) {
    return { area: '-', anio: '-' }
  }

  // 1. Direct Normalized Formación Académica
  if (p.formaciones_academicas && Array.isArray(p.formaciones_academicas) && p.formaciones_academicas.length > 0) {
    const mainFormacion = p.formaciones_academicas[0]
    const area = mainFormacion.carrera || '-'
    const fecha = mainFormacion.fecha_titulo || mainFormacion.fecha_diploma || ''
    return {
      area,
      anio: String(fecha || '').match(/\d{4}/)?.[0] || '-'
    }
  }

  return {
    area: '-',
    anio: '-'
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

const groupedRows = computed(() => {
  const groups = {}
  localRows.value.forEach(row => {
    const key = `${row.oferta?.sede_id}_${row.oferta?.cargo_id}`
    if (!groups[key]) {
      groups[key] = {
        sede: row.oferta?.sede?.nombre || 'Sede no definida',
        cargo: row.oferta?.cargo?.nombre || 'Cargo no definido',
        items: []
      }
    }
    groups[key].items.push(row)
  })
  return groups
})

const hierarchicalGroups = computed(() => {
  const sedes = {}
  Object.entries(groupedRows.value).forEach(([key, group]) => {
    if (!sedes[group.sede]) {
      sedes[group.sede] = {
        name: group.sede,
        cargos: {}
      }
    }
    sedes[group.sede].cargos[key] = group
  })
  return sedes
})

const onSedeChange = () => {
    if (selectedSedeName.value && hierarchicalGroups.value[selectedSedeName.value]) {
        const cargoKeys = Object.keys(hierarchicalGroups.value[selectedSedeName.value].cargos)
        if (cargoKeys.length > 0) {
            activeTab.value = cargoKeys[0]
        } else {
            activeTab.value = null
        }
    } else {
        activeTab.value = null
    }
}

const loadData = async () => {
  loading.value = true
  try {
    const { convocatoria_id, sede_id, cargo_id } = route.query
    const params = { convocatoria_id }
    if (sede_id) params.sede_id = sede_id
    if (cargo_id) params.cargo_id = cargo_id

    // Fetch Convocatoria details to get the official title/name
    if (convocatoria_id) {
      try {
        const { data: convo } = await api.get(`/convocatorias/${convocatoria_id}`)
        if (convo && convo.titulo) {
          headerInfo.value.nombre = convo.titulo
          headerInfo.value.gestion = convo.gestion
          headerInfo.value.fecha_inicio = convo.fecha_inicio
          headerInfo.value.fecha_cierre = convo.fecha_cierre
          headerInfo.value.matriz = convo.matriz_evaluacion
        }
      } catch (e) {
        console.error('Error fetching convocatoria info:', e)
      }
    }

    const { data } = await api.get('/postulaciones', { params })

    // If we didn't get the info from fetching the convo directly, try to get it from the first row
    if (data.length > 0 && !headerInfo.value.nombre) {
      const convoData = data[0].oferta?.convocatoria
      if (convoData) {
        headerInfo.value.nombre = convoData.titulo
        headerInfo.value.gestion = convoData.gestion
        headerInfo.value.fecha_inicio = convoData.fecha_inicio
        headerInfo.value.fecha_cierre = convoData.fecha_cierre
        headerInfo.value.matriz = convoData.matriz_evaluacion
      }
    }

    // Still empty? Use a more visible fallback for debugging
    if (!headerInfo.value.nombre) {
      headerInfo.value.nombre = 'Título no disponible'
    }

    localRows.value = data.map((postulacion) => {
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

    if (Object.keys(hierarchicalGroups.value).length > 0) {
        selectedSedeName.value = Object.keys(hierarchicalGroups.value)[0]
        const firstKey = Object.keys(hierarchicalGroups.value[selectedSedeName.value].cargos)[0]
        activeTab.value = firstKey
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
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
      const area1 = Math.min((d.a1_diplomado || 0) + (d.a1_especialidad || 0) + (d.a1_maestria || 0) + (d.a1_doctorado || 0), 20)
      const area2 = Math.min((d.a2_cursos_120 || 0) + (d.a2_cursos_20 || 0) + (d.a2_disertante || 0) + (d.a2_pedagogico || 0), 20)
      const area3 = Math.min((d.a3_ejercicio_prof || 0) + (d.a3_docencia || 0) + (d.a3_tutorias || 0) + (d.a3_docente_post || 0) + (d.a3_cargos_sim || 0), 50)
      const area4 = Math.min((d.a4_revistas || 0) + (d.a4_libros || 0) + (d.a4_distinciones || 0), 10)
      return area1 + area2 + area3 + area4
  }
}

const exportToPDF = async (targetGroup = null) => {
  const group = targetGroup || (activeTab.value ? groupedRows.value[activeTab.value] : null) || Object.values(groupedRows.value)[0]
  if (!group || !group.items || group.items.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay postulantes para exportar en este grupo.' })
    return
  }

  try {
    $q.loading.show({ message: 'Generando Acta Oficial Institucional en PDF...' })
    await generateInstitutionalEvaluationPDF({
      convocatoria: {
        titulo: headerInfo.value.nombre,
        codigo_interno: headerInfo.value.codigo_interno || `CONV-${route.params.id}`,
        gestion: headerInfo.value.gestion,
        fecha_inicio: headerInfo.value.fecha_inicio,
        fecha_cierre: headerInfo.value.fecha_cierre
      },
      sede: group.sede || 'TODAS LAS SEDES',
      cargo: group.cargo || 'TODOS LOS CARGOS',
      items: group.items,
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

const exportToExcel = async (targetGroup = null) => {
  const group = targetGroup || (activeTab.value ? groupedRows.value[activeTab.value] : null) || Object.values(groupedRows.value)[0]
  if (!group || !group.items || group.items.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay postulantes para exportar en este grupo.' })
    return
  }

  try {
    $q.loading.show({ message: 'Generando Matriz Institucional en Excel...' })
    await exportInstitutionalMatrixExcel({
      convocatoria: {
        titulo: headerInfo.value.nombre,
        codigo_interno: headerInfo.value.codigo_interno || `CONV-${route.params.id}`,
        gestion: headerInfo.value.gestion,
        fecha_inicio: headerInfo.value.fecha_inicio,
        fecha_cierre: headerInfo.value.fecha_cierre
      },
      sede: group.sede || 'TODAS LAS SEDES',
      cargo: group.cargo || 'TODOS LOS CARGOS',
      items: group.items,
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

const saveGroup = async (items) => {
  saving.value = true
  try {
    for (const row of items) {
       await saveRow(row, true)
    }
    $q.notify({ color: 'positive', message: 'Tabla guardada correctamente' })
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Error al guardar la tabla' })
  } finally {
    saving.value = false
  }
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
      if (!silent) {
         $q.notify({ color: 'positive', message: 'Fila guardada', icon: 'check', position: 'bottom-right', timeout: 500 })
      }
    } catch (error) {
      console.error(error);
      if (!silent) {
        $q.notify({ color: 'negative', message: 'Error al auto-guardar', position: 'bottom-right' })
      }
    }
}

const updateFieldAndSave = (row, field, v) => {
    row.evalData[field] = v
    saveRow(row)
}

const debouncedSaveRow = debounce((row) => saveRow(row), 1000)

const saveAll = async () => {
    saving.value = true
    try {
        for (const row of localRows.value) {
            await saveRow(row, true)
        }
        $q.notify({ color: 'positive', message: '¡Todo guardado!' })
    } catch (error) {
        console.error(error)
        $q.notify({ color: 'negative', message: 'Error al guardar todo' })
    } finally {
        saving.value = false
    }
}

onMounted(loadData)
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
  border-right: 1px solid #cce;
  border-bottom: 1px solid #cce;
  padding: 4px;
}
.area-title {
  font-size: 13px;
  letter-spacing: 1px;
  padding: 8px;
  font-weight: 900;
  border-top: 1px solid #cce;
}
.header-v {
  font-size: 10px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  background-color: #f8f9fa !important;
  color: #334;
  font-weight: 800;
  text-align: left;
  padding: 10px 4px !important;
  border-top: 1px solid #cce;
}
.sub-h {
  font-size: 10px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  height: 180px;
  min-width: 36px;
  white-space: nowrap;
  background-color: #f1f5f9 !important;
  color: #1e293b;
  font-weight: 800;
  text-align: left;
  padding: 10px 4px !important;
  position: sticky;
  top: 45px;
  z-index: 35;
}
.sticky-col { position: sticky; z-index: 40; }
.first-col { left: 0; width: 40px; background-color: #f8f9fa !important; z-index: 45; border-right: 2px solid #3f51b5; }
.second-col {
  left: 40px;
  min-width: 250px;
  z-index: 45;
  background-color: white !important;
  border-right: 2px solid #3f51b5;
  box-shadow: 4px 0 10px rgba(0,0,0,0.1);
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
}
.header-cell {
  background-color: #f8f9fa;
  border-top: 1px solid #cce;
}
.data-row:hover td { background-color: #eff6ff !important; }
.score-cell {
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  padding: 0 !important;
  min-width: 45px;
  height: 45px;
  text-align: center;
  background-color: white;
}
.score-cell:hover {
  background-color: #ebf4ff;
  box-shadow: inset 0 0 10px rgba(63, 81, 181, 0.1);
}
.cell-val {
  font-size: 18px;
  font-weight: 900;
  line-height: 45px;
  width: 100%;
  height: 100%;
}
.btn-fixed {
  width: 40px;
  height: 40px;
  font-weight: 800;
  border-radius: 8px;
  font-size: 14px;
}
.cell-textarea {
  width: 100%;
  border: none;
  font-size: 10px;
  padding: 4px;
  resize: vertical;
  background: transparent;
}
.cell-textarea:focus { outline: 1px solid #3f51b5; background: white; }
</style>
