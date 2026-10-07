<template>
  <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
    <div class="bg-primary text-white p-4 flex flex-wrap items-center justify-between gap-3">
      <div class="text-xs font-black uppercase tracking-wider flex items-center gap-2">
        📝 Matriz de Evaluación de Méritos • {{ filterCargo }}
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <!-- ORDENADOR FLEXIBLE DE CANDIDATOS EN MATRIZ -->
        <div class="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl text-xs font-bold border border-white/20">
          <span class="text-[10px] text-white/80 uppercase">Ordenar:</span>
          <q-btn-toggle
            :model-value="matrixSortBy"
            @update:model-value="(val) => $emit('update:matrixSortBy', val)"
            dense
            rounded
            toggle-color="white"
            toggle-text-color="primary"
            color="transparent"
            text-color="white"
            size="xs"
            unelevated
            class="font-black"
            :options="[
              { label: '🔤 Alfabético (A-Z)', value: 'alfabetico' },
              { label: '🎯 Por Puntaje', value: 'puntaje' },
              { label: '🤖 Ranking ATS', value: 'ats' },
              { label: '⏱️ Registro', value: 'registro' }
            ]"
          />
          <q-btn
            flat
            round
            dense
            size="xs"
            :icon="matrixSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
            :color="matrixSortDirection === 'asc' ? 'amber-4' : 'white'"
            @click="$emit('toggle-sort-direction')"
          >
            <q-tooltip>{{ matrixSortDirection === 'asc' ? 'Ascendente (A-Z / Menor a Mayor)' : 'Descendente (Z-A / Mayor a Menor)' }}</q-tooltip>
          </q-btn>
        </div>

        <!-- DESCARGAS OFICIALES: PDF, EXCEL, WORD -->
        <q-btn
          color="red-7"
          icon="picture_as_pdf"
          label="PDF"
          unelevated
          rounded
          size="sm"
          class="font-black shadow-sm"
          @click="$emit('export-pdf')"
        >
          <q-tooltip>Descargar Acta Oficial PDF (Oficio con el orden actual)</q-tooltip>
        </q-btn>
        <q-btn
          color="green-8"
          icon="table_view"
          label="Excel"
          unelevated
          rounded
          size="sm"
          class="font-black shadow-sm"
          @click="$emit('export-excel')"
        >
          <q-tooltip>Descargar Matriz Excel (con el orden actual)</q-tooltip>
        </q-btn>
        <q-btn
          color="blue-8"
          icon="description"
          label="Word"
          unelevated
          rounded
          size="sm"
          class="font-black shadow-sm"
          @click="$emit('export-word')"
        >
          <q-tooltip>Descargar Acta Oficial en Word (.doc horizontal con el orden actual)</q-tooltip>
        </q-btn>
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
          @click="$emit('save-all')"
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
          <tr v-for="(row, index) in matrizRows" :key="row.id" class="data-row">
            <td class="text-center font-bold sticky-col first-col bg-grey-1">{{ index + 1 }}</td>
            <td class="font-bold sticky-col second-col bg-white">
              <span class="text-primary text-xs font-black cursor-pointer hover:underline" @click="$emit('view-expediente', row)">
                {{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}
              </span>
            </td>

            <td class="text-center bg-grey-1 font-bold px-2 py-1" style="min-width: 140px; max-width: 190px; font-size: 10px; line-height: 1.25; white-space: normal; word-break: normal;">
              {{ row.extraInfo?.area || '-' }}
              <q-tooltip v-if="row.extraInfo?.area && row.extraInfo?.area !== '-'">{{ row.extraInfo.area }}</q-tooltip>
            </td>
            <td class="text-center bg-grey-1 font-bold" style="min-width: 60px;">{{ row.extraInfo?.anio || '-' }}</td>
            <td class="text-center bg-teal-1 font-bold text-secondary cursor-pointer">
              Bs. {{ Math.round(row.pretension_salarial || 0) }}
              <q-popup-edit v-model="row.pretension_salarial" auto-save v-slot="scope" @save="$emit('save-row', row)">
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
                  <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style="min-width: 290px; max-width: 360px">
                    <!-- Header del Criterio -->
                    <div class="bg-gray-900 text-white p-3">
                      <div class="flex items-center justify-between gap-2 mb-1">
                        <span class="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          {{ col.seccion || 'Criterio de Evaluación' }}
                        </span>
                        <q-badge color="primary" class="font-black text-[10px] px-2 py-0.5 rounded-md">
                          Máx: {{ col.puntaje }} pts
                        </q-badge>
                      </div>
                      <div class="text-xs font-black leading-snug text-white">
                        {{ col.nombre }}
                      </div>
                      <div class="text-[10px] text-gray-300 mt-1 truncate">
                        Postulante: <strong class="text-white">{{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}</strong>
                      </div>
                    </div>

                    <!-- Descripción o Rúbrica del Criterio -->
                    <div class="p-3 bg-amber-50/60 border-b border-amber-100">
                      <div class="flex items-start gap-1.5 text-amber-900">
                        <q-icon name="info" size="15px" class="mt-0.5 text-amber-700 flex-shrink-0" />
                        <div class="text-[11px] leading-relaxed">
                          <span class="font-bold text-amber-950 block">Descripción del Criterio:</span>
                          <div class="mt-0.5 text-gray-700 font-medium whitespace-pre-line">
                            {{ col.descripcion || getCriterionDefaultHelp(col) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Méritos cargados por el postulante (si aplica) -->
                    <div v-if="getCandidateMeritsForCriterion(row, col)" class="p-2.5 bg-indigo-50/40 border-b border-indigo-100/60">
                      <div class="text-[10px] font-black uppercase text-indigo-900 flex items-center gap-1 mb-1">
                        <q-icon name="verified" size="13px" class="text-indigo-600" />
                        {{ getCandidateMeritsForCriterion(row, col).tipo }}:
                      </div>
                      <div class="space-y-1 max-h-24 overflow-y-auto pr-1">
                        <div
                          v-for="(item, iIdx) in getCandidateMeritsForCriterion(row, col).items"
                          :key="iIdx"
                          class="text-[10px] text-gray-700 bg-white p-1.5 rounded-md border border-gray-200/60 leading-tight"
                        >
                          {{ item }}
                        </div>
                      </div>
                    </div>

                    <!-- Selector de Puntuación -->
                    <div class="p-3 bg-white">
                      <div class="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 text-center">
                        Asignar Puntuación:
                      </div>
                      <div class="flex flex-wrap justify-center gap-1.5">
                        <q-btn
                          v-for="v in getDynamicOptions(col.puntaje)"
                          :key="v"
                          dense
                          unelevated
                          :label="v"
                          :color="row.evalData[col.id] === v ? 'primary' : 'grey-2'"
                          :text-color="row.evalData[col.id] === v ? 'white' : 'black'"
                          class="w-9 h-9 font-black text-xs rounded-xl transition-transform hover:scale-105"
                          @click="$emit('update-field-and-save', { row, field: col.id, v })"
                          v-close-popup
                        />
                      </div>
                    </div>
                  </div>
                </q-popup-proxy>
              </td>
            </template>
            <template v-else>
              <td v-for="field in meritFields" :key="field" class="score-cell text-center">
                <div class="cell-val" :class="getFieldColorClass(field)">{{ row.evalData[field] || 0 }}</div>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style="min-width: 290px; max-width: 360px">
                    <!-- Header del Criterio -->
                    <div class="bg-gray-900 text-white p-3">
                      <div class="flex items-center justify-between gap-2 mb-1">
                        <span class="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          Criterio Institucional
                        </span>
                        <q-badge color="primary" class="font-black text-[10px] px-2 py-0.5 rounded-md">
                          Baremo Estándar
                        </q-badge>
                      </div>
                      <div class="text-xs font-black leading-snug text-white">
                        {{ getFieldLabel(field) }}
                      </div>
                      <div class="text-[10px] text-gray-300 mt-1 truncate">
                        Postulante: <strong class="text-white">{{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}</strong>
                      </div>
                    </div>

                    <!-- Descripción o Rúbrica del Criterio -->
                    <div class="p-3 bg-amber-50/60 border-b border-amber-100">
                      <div class="flex items-start gap-1.5 text-amber-900">
                        <q-icon name="info" size="15px" class="mt-0.5 text-amber-700 flex-shrink-0" />
                        <div class="text-[11px] leading-relaxed">
                          <span class="font-bold text-amber-950 block">Descripción del Criterio:</span>
                          <div class="mt-0.5 text-gray-700 font-medium">
                            {{ FIELD_DESCRIPTIONS[field] || 'Asigne el puntaje correspondiente según los documentos de respaldo.' }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Méritos cargados por el postulante (si aplica) -->
                    <div v-if="getCandidateMeritsForCriterion(row, field)" class="p-2.5 bg-indigo-50/40 border-b border-indigo-100/60">
                      <div class="text-[10px] font-black uppercase text-indigo-900 flex items-center gap-1 mb-1">
                        <q-icon name="verified" size="13px" class="text-indigo-600" />
                        {{ getCandidateMeritsForCriterion(row, field).tipo }}:
                      </div>
                      <div class="space-y-1 max-h-24 overflow-y-auto pr-1">
                        <div
                          v-for="(item, iIdx) in getCandidateMeritsForCriterion(row, field).items"
                          :key="iIdx"
                          class="text-[10px] text-gray-700 bg-white p-1.5 rounded-md border border-gray-200/60 leading-tight"
                        >
                          {{ item }}
                        </div>
                      </div>
                    </div>

                    <!-- Selector de Puntuación -->
                    <div class="p-3 bg-white">
                      <div class="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 text-center">
                        Asignar Puntuación:
                      </div>
                      <div class="flex flex-wrap justify-center gap-1.5">
                        <q-btn
                          v-for="v in getOptionsForField(field)"
                          :key="v"
                          dense
                          unelevated
                          :label="v"
                          :color="row.evalData[field] === v ? 'primary' : 'grey-2'"
                          :text-color="row.evalData[field] === v ? 'white' : 'black'"
                          class="w-9 h-9 font-black text-xs rounded-xl transition-transform hover:scale-105"
                          @click="$emit('update-field-and-save', { row, field, v })"
                          v-close-popup
                        />
                      </div>
                    </div>
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
                @input="$emit('debounced-save-row', row)"
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  filterCargo: {
    type: String,
    default: ''
  },
  matrixSortBy: {
    type: String,
    default: 'alfabetico'
  },
  matrixSortDirection: {
    type: String,
    default: 'asc'
  },
  currentMatriz: {
    type: Array,
    default: null
  },
  dynamicColumns: {
    type: Array,
    default: () => []
  },
  matrizRows: {
    type: Array,
    default: () => []
  },
  meritFields: {
    type: Array,
    default: () => []
  },
  saving: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:matrixSortBy',
  'toggle-sort-direction',
  'export-pdf',
  'export-excel',
  'export-word',
  'save-all',
  'save-row',
  'debounced-save-row',
  'update-field-and-save',
  'view-expediente'
])

const FIELD_LABELS = {
  a1_diplomado: 'Diplomado (3 pts)',
  a1_especialidad: 'Especialización (4 pts)',
  a1_maestria: 'Maestría (6 pts)',
  a1_doctorado: 'Doctorado (7 pts)',
  a2_cursos_120: 'Cursos area > 120 hrs (Max 9)',
  a2_cursos_20: 'Cursillos/Semin. > 20 hrs (Max 5)',
  a2_disertante: 'Disertante congresos (Max 3)',
  a2_pedagogico: 'Formación Pedagóg. (Max 3)',
  a3_ejercicio_prof: 'Ejercicio Profesional (Max 15)',
  a3_docencia: 'Docencia Ejercida (Max 10)',
  a3_tutorias: 'Tutoría de Tesis (Max 5)',
  a3_docente_post: 'Docente Postgrado (Max 5)',
  a3_cargos_sim: 'Cargos Similares (Max 15)',
  a4_revistas: 'Revistas Indexadas (Max 3)',
  a4_libros: 'Libros/Textos (Max 3)',
  a4_distinciones: 'Distinciones Honoríf. (Max 4)'
}

const FIELD_DESCRIPTIONS = {
  a1_diplomado: 'Diplomado en Educación Superior o área afín (3 pts por título).',
  a1_especialidad: 'Especialidad médica, clínica o profesional reconocida (4 pts).',
  a1_maestria: 'Grado de Maestría concluida con título o diploma oficial (6 pts).',
  a1_doctorado: 'Grado de Doctorado (Ph.D. / Dr.) con título en provisión nacional (7 pts).',
  a2_cursos_120: 'Cursos de actualización y especialización mayores a 120 horas académicas (3 pts c/u, máx. 9 pts).',
  a2_cursos_20: 'Cursillos, seminarios y talleres mayores a 20 horas académicas (1 pt c/u, máx. 5 pts).',
  a2_disertante: 'Participación en calidad de disertante o expositor en congresos o seminarios (1 pt c/u, máx. 3 pts).',
  a2_pedagogico: 'Cursos de formación pedagógica, didáctica universitaria o competencias docentes (1 pt c/u, máx. 3 pts).',
  a3_ejercicio_prof: 'Años de ejercicio profesional certificado en el área específica (1 pt por año, máx. 15 pts).',
  a3_docencia: 'Años de docencia universitaria certificada de pregrado (1 pt por año/materia, máx. 10 pts).',
  a3_tutorias: 'Tutoría o asesoría de tesis de grado y proyectos de titulación aprobados (1 pt c/u, máx. 5 pts).',
  a3_docente_post: 'Docencia universitaria ejercida en programas de postgrado (1 pt c/u, máx. 5 pts).',
  a3_cargos_sim: 'Desempeño en cargos de jefatura, dirección académica o similar (máx. 15 pts).',
  a4_revistas: 'Artículos científicos publicados en revistas indexadas (1 pt c/u, máx. 3 pts).',
  a4_libros: 'Autoría o coautoría de libros, textos guía o manuales con ISBN/Depósito legal (máx. 3 pts).',
  a4_distinciones: 'Distinciones académicas, premios o reconocimientos honoríficos institucionales (máx. 4 pts).'
}

const getFieldLabel = (field) => FIELD_LABELS[field] || 'Puntuación'

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
    a4_distinciones: [0, 1, 2, 3, 4]
  }
  return options[field] || [0]
}

const getDynamicOptions = (maxPuntaje) => {
  let opts = []
  for (let i = 0; i <= maxPuntaje; i++) {
    opts.push(i)
  }
  return opts
}

const getCriterionDefaultHelp = (col) => {
  if (col.descripcion) return col.descripcion
  const n = (col.nombre || '').toUpperCase()
  if (n.includes('EXPERIENCIA') || n.includes('LABORAL')) {
    return `Evaluación de la trayectoria y experiencia laboral demostrable (Puntaje máximo: ${col.puntaje} pts).`
  }
  if (n.includes('DOCENCIA')) {
    return `Evaluación de la experiencia docente universitaria y ejercicio de cátedra (Puntaje máximo: ${col.puntaje} pts).`
  }
  if (n.includes('FORMACIÓN') || n.includes('TÍTULO') || n.includes('LICENCIATURA')) {
    return `Verificación del título profesional y formación académica habilitante (Puntaje máximo: ${col.puntaje} pts).`
  }
  if (n.includes('POSTGRADO') || n.includes('DIPLOMADO') || n.includes('MAESTR') || n.includes('DOCTOR')) {
    return `Cursos y programas de postgrado certificados en el área requerida (Puntaje máximo: ${col.puntaje} pts).`
  }
  if (n.includes('CAPACITA') || n.includes('CURSO')) {
    return `Horas académicas y certificados de actualización o formación continua (Puntaje máximo: ${col.puntaje} pts).`
  }
  if (n.includes('PRODUCCI') || n.includes('LIBRO') || n.includes('ARTÍCULO')) {
    return `Publicaciones científicas, libros y producción intelectual acreditada (Puntaje máximo: ${col.puntaje} pts).`
  }
  return `Asigne la puntuación correspondiente de acuerdo al baremo establecido (Puntaje máximo: ${col.puntaje} pts).`
}

const getCandidateMeritsForCriterion = (row, colOrField) => {
  const p = row.postulante
  if (!p) return null

  const name = typeof colOrField === 'string'
    ? (getFieldLabel(colOrField) + ' ' + (FIELD_DESCRIPTIONS[colOrField] || '')).toUpperCase()
    : ((colOrField.nombre || '') + ' ' + (colOrField.descripcion || '') + ' ' + (colOrField.seccion || '')).toUpperCase()

  if (name.includes('DOCEN') || name.includes('CÁTEDRA') || name.includes('ASIGNATURA')) {
    const list = p.experiencias_docencia || p.experienciasDocencia || []
    if (list.length > 0) {
      return {
        tipo: 'Docencia Registrada',
        items: list.map(d => `${d.asignatura || 'Docencia'} (${d.universidad || '-'}) - ${d.tipo_docencia || ''}`)
      }
    }
  }

  if (name.includes('LABORAL') || name.includes('EJERCICIO') || name.includes('PROFESIONAL') || name.includes('CARGO') || name.includes('TRABAJO')) {
    const list = p.experiencias_profesionales || p.experienciasProfesionales || []
    if (list.length > 0) {
      return {
        tipo: 'Experiencia Laboral Registrada',
        items: list.map(e => `${e.cargo_desempenado || 'Cargo'} en ${e.institucion_empresa || '-'} (${e.fecha_inicio ? String(e.fecha_inicio).substring(0, 4) : ''} - ${e.fecha_fin ? String(e.fecha_fin).substring(0, 4) : 'Actualidad'})`)
      }
    }
  }

  if (name.includes('POSTGRADO') || name.includes('POSGRADO') || name.includes('DIPLOMADO') || name.includes('MAESTR') || name.includes('DOCTOR') || name.includes('ESPECIAL')) {
    const list = p.formaciones_postgrado || p.formacionesPostgrado || []
    if (list.length > 0) {
      return {
        tipo: 'Postgrados Registrados',
        items: list.map(pos => `${pos.tipo_postgrado || 'Postgrado'}: ${pos.titulo_postgrado || '-'} (${pos.universidad || '-'})`)
      }
    }
  }

  if (name.includes('CURSO') || name.includes('CAPACITA') || name.includes('TALLER') || name.includes('SEMINARIO')) {
    const list = p.capacitaciones || []
    if (list.length > 0) {
      return {
        tipo: 'Cursos y Capacitaciones Registrados',
        items: list.map(c => `${c.nombre_curso || c.nombre || 'Curso'} - ${c.institucion || '-'} ${c.horas_academicas ? '(' + c.horas_academicas + ' hrs)' : ''}`)
      }
    }
  }

  if (name.includes('PRODUCCI') || name.includes('LIBRO') || name.includes('REVISTA') || name.includes('ARTÍCULO') || name.includes('PUBLICAC')) {
    const list = p.producciones || p.producciones_intelectuales || p.produccionesIntelectuales || []
    if (list.length > 0) {
      return {
        tipo: 'Producción Intelectual Registrada',
        items: list.map(pr => `${pr.tipo_produccion || 'Obra'}: ${pr.titulo_obra || pr.titulo || '-'} (${pr.editorial_revista || '-'})`)
      }
    }
  }

  if (name.includes('RECONOCIMIENTO') || name.includes('DISTINCI') || name.includes('PREMIO') || name.includes('HONOR')) {
    const list = p.reconocimientos || []
    if (list.length > 0) {
      return {
        tipo: 'Reconocimientos Registrados',
        items: list.map(r => `${r.descripcion_reconocimiento || r.titulo || 'Distinción'} - ${r.institucion_otorgante || '-'}`)
      }
    }
  }

  if (name.includes('FORMACI') || name.includes('LICENCIATURA') || name.includes('TÍTULO') || name.includes('ACADÉMIC')) {
    const list = p.formaciones_academicas || p.formacionesAcademicas || []
    if (list.length > 0) {
      return {
        tipo: 'Formación Pregrado Registrada',
        items: list.map(f => `${f.academicLevel?.name || f.nivel_academico_raw || 'Licenciatura'}: ${f.career?.name || f.carrera_raw || '-'} (${f.universidad || '-'})`)
      }
    }
  }

  return null
}

const calculateTotal = (row) => {
  if (props.currentMatriz) {
    let sum = 0
    props.dynamicColumns.forEach(col => {
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
</script>
