<template>
  <q-page class="p-4 bg-grey-3">
    <!-- Header info -->
    <div class="bg-white p-6 rounded-2xl shadow-xl border q-mb-md">
      <div class="text-center">
        <h1 class="text-h3 font-bold q-ma-none text-deep-purple-9 uppercase tracking-tighter">{{ headerInfo.nombre || 'Concurso de Méritos' }}</h1>
        <div class="row justify-center q-mt-md q-col-gutter-xl uppercase text-h6 text-weight-bold text-deep-purple-8">
          <div class="bg-deep-purple-1 q-px-lg q-py-xs rounded-full">GESTIÓN: <span class="text-black">{{ headerInfo.gestion }}</span></div>
        </div>
      </div>

      <div class="row justify-between items-center q-mt-lg">
        <q-btn icon="arrow_back" unelevated color="grey-7" label="Regresar al Listado" @click="$router.back()" class="rounded-xl px-4" />
        <div class="flex gap-4 items-center">
          <div class="text-weight-bold text-grey-7">Se evaluarán <span class="text-deep-purple-9 text-h6">{{ localRows.length }}</span> postulantes en total</div>
          <q-btn
            color="red-9"
            icon="picture_as_pdf"
            label="Exportar Todo (PDF)"
            unelevated
            @click="exportToPDF()"
            class="rounded-xl shadow-lg q-mr-sm"
          />
          <q-btn
            color="green-9"
            icon="check_circle"
            label="Guardar Todas las Tablas"
            unelevated
            size="lg"
            :loading="saving"
            @click="saveAll"
            class="rounded-xl px-xl shadow-lg"
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
                  <q-icon name="apartment" color="deep-purple-9" />
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
                    :color="activeTab === groupKey ? 'deep-purple-9' : 'grey-2'"
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
          <div class="bg-deep-purple-9 text-white p-6 shadow-2xl row items-center justify-between no-wrap" style="border-radius: 20px 20px 0 0;">
            <div class="row items-center gap-4 no-wrap">
              <div class="bg-white text-deep-purple-9 p-3 rounded-2xl shadow-inner">
                <q-icon name="apartment" size="md" />
              </div>
              <div class="column">
                <span class="text-h5 font-black leading-none uppercase tracking-tighter">{{ group.sede }}</span>
                <span class="text-subtitle1 font-bold opacity-80 uppercase tracking-widest">{{ group.cargo }}</span>
              </div>
            </div>
            <div class="row items-center gap-3">
              <div class="text-h6 font-black bg-white text-deep-purple-9 px-6 py-2 rounded-2xl whitespace-nowrap shadow-lg">
                {{ group.items.length }} POSTULANTES
              </div>
              <q-btn
                color="white"
                text-color="red-9"
                icon="picture_as_pdf"
                label="Generar PDF"
                unelevated
                @click="exportToPDF(group)"
                class="rounded-xl font-bold shadow-lg"
              />
              <q-btn
                color="green-6"
                text-color="white"
                icon="save"
                label="Guardar Tabla"
                unelevated
                :loading="saving"
                @click="saveGroup(group.items)"
                class="rounded-xl font-bold px-lg shadow-lg"
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

                    <th colspan="4" class="bg-deep-purple-10 text-white area-title">FORMACIÓN PROFESIONAL (20 pts)</th>
                    <th colspan="4" class="bg-teal-9 text-white area-title">PERFECCIONAMIENTO PROFESIONAL (20 pts)</th>
                    <th colspan="5" class="bg-orange-9 text-white area-title">EXPERIENCIA ACADEMICA (50 pts)</th>
                    <th colspan="3" class="bg-deep-purple-10 text-white area-title">OTROS MERITOS (10 pts)</th>

                    <th rowspan="2" class="bg-grey-10 text-white final-score-header">PUNTAJE FINAL</th>
                    <th rowspan="2" class="header-cell" style="min-width: 250px;">OBSERVACIONES</th>
                  </tr>
                  <tr class="sub-headers">
                    <th class="sub-h">Diplomado (3 pts)</th>
                    <th class="sub-h">Especialización (4 pts)</th>
                    <th class="sub-h">Maestría (6 pts)</th>
                    <th class="sub-h">Doctorado (7 pts)</th>
                    <th class="sub-h">Cursos area > 120 hrs (3 p/c max 9)</th>
                    <th class="sub-h">Cursillos/Semin. > 20 hrs (1 p max 5)</th>
                    <th class="sub-h">Disertante congresos (1 p max 3)</th>
                    <th class="sub-h">Formación Pedagóg. (1 p max 3)</th>
                    <th class="sub-h">Ejercicio Profesional (1 p/año max 15)</th>
                    <th class="sub-h">Docencia Ejercida (1 p/sem max 10)</th>
                    <th class="sub-h">Tutoría de Tesis (1 p max 5)</th>
                    <th class="sub-h">Docente Postgrado (1 p max 5)</th>
                    <th class="sub-h">Cargos Similares (max 15)</th>
                    <th class="sub-h">Revistas Indexadas (1 p max 3)</th>
                    <th class="sub-h">Libros/Textos (1 p max 3)</th>
                    <th class="sub-h">Distinciones Honoríf. (1 p max 4)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in group.items" :key="row.id" class="data-row">
                    <td class="text-center text-weight-bold sticky-col first-col bg-grey-1">{{ index + 1 }}</td>
                    <td class="text-weight-bold sticky-col second-col bg-white">
                      <div class="q-pr-md line-height-1">
                        <div class="text-deep-purple-10 text-weight-bolder" style="font-size: 13px;">{{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}</div>
                        <div class="text-[10px] text-grey-7 font-bold tracking-tighter">CI: {{ row.postulante?.ci }}</div>
                      </div>
                    </td>

                    <td class="text-center bg-grey-1 text-[9px] font-bold" style="width: 80px; word-break: break-all;">{{ row.extraInfo.area }}</td>
                    <td class="text-center bg-grey-1 font-bold">{{ row.extraInfo.anio }}</td>
                    <td class="text-center bg-teal-1 font-bold text-teal-10 cursor-pointer">
                      Bs. <br>{{ Math.round(row.pretension_salarial || 0) }}
                      <q-popup-edit v-model="row.pretension_salarial" auto-save v-slot="scope">
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

                    <td v-for="field in meritFields" :key="field" class="score-cell">
                      <div class="cell-val" :class="getFieldColorClass(field)">{{ row.evalData[field] }}</div>
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <div class="bg-grey-9 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel(field) }}</div>
                        <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                          <q-btn v-for="v in getOptionsForField(field)" :key="v" dense unelevated :label="v" :color="row.evalData[field] === v ? 'primary' : 'grey-2'" :text-color="row.evalData[field] === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData[field] = v" v-close-popup />
                        </div>
                      </q-popup-proxy>
                    </td>

                    <td class="text-center text-weight-bolder text-h6 bg-grey-2" :class="calculateTotal(row) < 51 ? 'text-red' : 'text-teal-9'">
                      {{ calculateTotal(row) }}
                    </td>
                    <td class="bg-white"><textarea v-model="row.evalData.observaciones" class="cell-textarea" rows="2"></textarea></td>
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const route = useRoute()
const $q = useQuasar()
const localRows = ref([])
const loading = ref(false)
const saving = ref(false)
const activeTab = ref(null)
const selectedSedeName = ref(null)

const headerInfo = ref({
  nombre: '',
  gestion: '2025'
})

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
  if (field.startsWith('a1')) return 'text-deep-purple-10'
  if (field.startsWith('a2')) return 'text-teal-10'
  if (field.startsWith('a3')) return 'text-orange-9'
  return 'text-indigo-10'
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
    activeTab.value = null
}

const loadData = async () => {
  loading.value = true
  try {
    const { convocatoria_id, sede_id, cargo_id } = route.query
    const params = { convocatoria_id }
    if (sede_id) params.sede_id = sede_id
    if (cargo_id) params.cargo_id = cargo_id

    const { data } = await api.get('/postulaciones', { params })

    if (data.length > 0) {
      headerInfo.value.gestion = data[0].oferta?.convocatoria?.gestion || '2025'
      headerInfo.value.nombre = data[0].oferta?.convocatoria?.titulo || 'Importación Externa'
    }

    localRows.value = data.map((postulacion) => {
      const existing = postulacion.evaluacion?.detalle_evaluacion || {}
      const formacion = postulacion.postulante?.meritos?.find(m => m.tipo_documento?.nombre.includes('FORMACIÓN'))
      const area = formacion?.respuestas?.profesion || '-'
      const anioRaw = formacion?.respuestas?.fecha_titulo || ''
      const anio = anioRaw ? anioRaw.split('-')[0] : '-'

      return {
        ...postulacion,
        extraInfo: { area, anio },
        evalData: {
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
          observaciones: postulacion.evaluacion?.observaciones || '',
        },
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
  const d = row.evalData
  const area1 = Math.min((d.a1_diplomado || 0) + (d.a1_especialidad || 0) + (d.a1_maestria || 0) + (d.a1_doctorado || 0), 20)
  const area2 = Math.min((d.a2_cursos_120 || 0) + (d.a2_cursos_20 || 0) + (d.a2_disertante || 0) + (d.a2_pedagogico || 0), 20)
  const area3 = Math.min((d.a3_ejercicio_prof || 0) + (d.a3_docencia || 0) + (d.a3_tutorias || 0) + (d.a3_docente_post || 0) + (d.a3_cargos_sim || 0), 50)
  const area4 = Math.min((d.a4_revistas || 0) + (d.a4_libros || 0) + (d.a4_distinciones || 0), 10)
  return area1 + area2 + area3 + area4
}

const exportToPDF = (targetGroup = null) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [216, 330]
  })

  const groupsToExport = targetGroup ? { [activeTab.value]: targetGroup } : groupedRows.value

  Object.values(groupsToExport).forEach((group, gIdx) => {
    if (gIdx > 0) doc.addPage()

    doc.setFillColor(74, 20, 140)
    doc.rect(5, 5, 320, 22, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(group.sede.toUpperCase(), 15, 14)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(group.cargo.toUpperCase(), 15, 21)

    doc.setFillColor(255, 255, 255)
    doc.roundedRect(260, 8, 50, 14, 7, 7, 'F')
    doc.setTextColor(74, 20, 140)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`${group.items.length} POSTULANTES`, 285, 17, { align: 'center' })

    const head = [
      [
        { content: 'NO.', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 7 } },
        { content: 'NOMBRES Y APELLIDOS', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 7 } },
        { content: 'ÁREA FORMACIÓN', rowSpan: 2, styles: { valign: 'bottom', halign: 'center', minCellHeight: 45 } },
        { content: 'AÑO TÍTULO', rowSpan: 2, styles: { valign: 'bottom', halign: 'center' } },
        { content: 'PRETENSIÓN SALARIAL', rowSpan: 2, styles: { valign: 'bottom', halign: 'center' } },
        { content: 'FORMACIÓN PROFESIONAL (20 PTS)', colSpan: 4, styles: { fillColor: [74, 20, 140], halign: 'center', textColor: [255, 255, 255] } },
        { content: 'PERFECCIONAMIENTO PROFESIONAL (20 PTS)', colSpan: 4, styles: { fillColor: [0, 150, 136], halign: 'center', textColor: [255, 255, 255] } },
        { content: 'EXPERIENCIA ACADEMICA (50 PTS)', colSpan: 5, styles: { fillColor: [245, 124, 0], halign: 'center', textColor: [255, 255, 255] } },
        { content: 'OTROS MERITOS (10 PTS)', colSpan: 3, styles: { fillColor: [74, 20, 140], halign: 'center', textColor: [255, 255, 255] } },
        { content: 'PUNTAJE FINAL', rowSpan: 2, styles: { fillColor: [40, 40, 40], valign: 'middle', halign: 'center', textColor: [255, 255, 255], fontSize: 8 } },
        { content: 'OBSERVACIONES', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 8 } }
      ],
      [
        'DIPLOMADO (3 PTS)', 'ESPECIALIZACIÓN (4 PTS)', 'MAESTRÍA (6 PTS)', 'DOCTORADO (7 PTS)',
        'CURSOS ÁREA > 120 HRS (3 P/C MAX 9)', 'CURSILLOS/SEMIN. > 20 HRS (1 P MAX 5)', 'DISERTANTE CONGRESOS (1 P MAX 3)', 'FORMACIÓN PEDAGÓG. (1 P MAX 3)',
        'EJERCICIO PROFESIONAL (1 P/AÑO MAX 15)', 'DOCENCIA EJERCIDA (1 P/SEM MAX 10)', 'TUTORÍA DE TESIS (1 P MAX 5)', 'DOCENTE POSTGRADO (1 P MAX 5)', 'CARGOS SIMILARES (MAX 15)',
        'REVISTAS INDEXADAS (1 P MAX 3)', 'LIBROS/TEXTOS (1 P MAX 3)', 'DISTINCIONES HONORÍF. (1 P MAX 4)'
      ]
    ]

    const body = group.items.map((row, idx) => [
      idx + 1,
      { content: `${row.postulante?.nombres || ''} ${row.postulante?.apellidos || ''}\nCI: ${row.postulante?.ci || ''}`.toUpperCase(), styles: { halign: 'left', fontSize: 7, fontStyle: 'bold' } },
      row.extraInfo.area,
      row.extraInfo.anio,
      `BS. ${Math.round(row.pretension_salarial || 0)}`,
      row.evalData.a1_diplomado,
      row.evalData.a1_especialidad,
      row.evalData.a1_maestria,
      row.evalData.a1_doctorado,
      row.evalData.a2_cursos_120,
      row.evalData.a2_cursos_20,
      row.evalData.a2_disertante,
      row.evalData.a2_pedagogico,
      row.evalData.a3_ejercicio_prof,
      row.evalData.a3_docencia,
      row.evalData.a3_tutorias,
      row.evalData.a3_docente_post,
      row.evalData.a3_cargos_sim,
      row.evalData.a4_revistas,
      row.evalData.a4_libros,
      row.evalData.a4_distinciones,
      calculateTotal(row),
      row.evalData.observaciones || ''
    ])

    autoTable(doc, {
      startY: 32,
      head: head,
      body: body,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1, valign: 'middle', halign: 'center', lineColor: [180, 180, 180], lineWidth: 0.1 },
      headStyles: { fillColor: [250, 250, 250], textColor: [40, 40, 40], fontStyle: 'bold', fontSize: 6 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50, textColor: [74, 20, 140] },
        21: { cellWidth: 22, fontStyle: 'bold', fontSize: 9 },
        22: { halign: 'left', cellWidth: 45 }
      }
    })
  })

  const fileName = targetGroup ? `EVALUACION_${targetGroup.cargo}_${targetGroup.sede}.pdf` : 'EVALUACION_GENERAL.pdf'
  doc.save(fileName)
}

const saveGroup = async (items) => {
  saving.value = true
  try {
    for (const row of items) {
      const d = row.evalData
      const t1 = Math.min((d.a1_diplomado || 0) + (d.a1_especialidad || 0) + (d.a1_maestria || 0) + (d.a1_doctorado || 0), 20)
      const t2 = Math.min((d.a2_cursos_120 || 0) + (d.a2_cursos_20 || 0) + (d.a2_disertante || 0) + (d.a2_pedagogico || 0), 20)
      const t3 = Math.min((d.a3_ejercicio_prof || 0) + (d.a3_docencia || 0) + (d.a3_tutorias || 0) + (d.a3_docente_post || 0) + (d.a3_cargos_sim || 0), 50)
      const t4 = Math.min((d.a4_revistas || 0) + (d.a4_libros || 0) + (d.a4_distinciones || 0), 10)

      await api.post('/evaluaciones-meritos', {
        postulacion_id: row.id,
        puntaje_formacion: t1,
        puntaje_perfeccionamiento: t2,
        puntaje_experiencia: t3,
        puntaje_otros: t4,
        puntaje_total: t1 + t2 + t3 + t4,
        detalle_evaluacion: d,
        observaciones: d.observaciones,
        pretension_salarial: row.pretension_salarial
      })
    }
    $q.notify({ color: 'positive', message: 'Tabla guardada correctamente' })
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Error al guardar la tabla' })
  } finally {
    saving.value = false
  }
}

const saveAll = async () => {
    saving.value = true
    try {
        for (const row of localRows.value) {
            const d = row.evalData
            const t1 = Math.min((d.a1_diplomado || 0) + (d.a1_especialidad || 0) + (d.a1_maestria || 0) + (d.a1_doctorado || 0), 20)
            const t2 = Math.min((d.a2_cursos_120 || 0) + (d.a2_cursos_20 || 0) + (d.a2_disertante || 0) + (d.a2_pedagogico || 0), 20)
            const t3 = Math.min((d.a3_ejercicio_prof || 0) + (d.a3_docencia || 0) + (d.a3_tutorias || 0) + (d.a3_docente_post || 0) + (d.a3_cargos_sim || 0), 50)
            const t4 = Math.min((d.a4_revistas || 0) + (d.a4_libros || 0) + (d.a4_distinciones || 0), 10)

            await api.post('/evaluaciones-meritos', {
                postulacion_id: row.id,
                puntaje_formacion: t1,
                puntaje_perfeccionamiento: t2,
                puntaje_experiencia: t3,
                puntaje_otros: t4,
                puntaje_total: t1 + t2 + t3 + t4,
                detalle_evaluacion: d,
                observaciones: d.observaciones,
                pretension_salarial: row.pretension_salarial
            })
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
