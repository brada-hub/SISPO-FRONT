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

    <!-- Tabs Navigation -->
    <div class="bg-white rounded-t-2xl shadow-sm border-x border-t">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7"
        active-color="deep-purple-9"
        indicator-color="deep-purple-9"
        align="left"
        narrow-indicator
      >
        <q-tab
          v-for="(group, key) in groupedRows"
          :key="key"
          :name="key"
          no-caps
        >
          <div class="column items-start q-pa-sm">
            <div class="text-caption text-grey-7 font-bold">{{ group.sede }}</div>
            <div class="text-weight-bolder text-uppercase" style="font-size: 13px;">{{ group.cargo }}</div>
          </div>
        </q-tab>
      </q-tabs>
    </div>

    <!-- Grouped Matrix Tables in Panels -->
    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <q-tab-panel v-for="(group, groupKey) in groupedRows" :key="groupKey" :name="groupKey" class="q-pa-none">
        <!-- Section Header -->
        <div class="bg-deep-purple-9 text-white p-4 shadow-lg row items-center justify-between no-wrap" style="border-radius: 12px 12px 0 0;">
          <div class="row items-center gap-4 no-wrap">
            <q-icon name="apartment" size="md" />
            <div class="column">
              <span class="text-h6 font-bold leading-none uppercase truncate" style="max-width: 400px;">{{ group.sede }}</span>
              <span class="text-subtitle2 font-medium opacity-80 uppercase tracking-widest truncate" style="max-width: 400px;">{{ group.cargo }}</span>
            </div>
          </div>
          <div class="row items-center gap-3">
            <div class="text-h6 font-black bg-white text-deep-purple-9 px-4 py-1 rounded-full whitespace-nowrap shadow-sm">
              {{ group.items.length }} POSTULANTES
            </div>
            <q-btn
              color="white"
              text-color="red-9"
              icon="picture_as_pdf"
              label="PDF"
              unelevated
              @click="exportToPDF(group)"
              class="rounded-xl font-bold q-mr-sm shadow-sm"
            />
            <q-btn
              color="white"
              text-color="deep-purple-9"
              icon="save"
              label="Guardar"
              unelevated
              :loading="saving"
              @click="saveGroup(group.items)"
              class="rounded-xl font-bold shadow-sm"
            />
          </div>
        </div>

        <div class="bg-white rounded-b-2xl shadow-2xl border overflow-hidden q-mb-xl">
          <div class="scroll-container overflow-auto">
            <table class="matrix-table uppercase">
              <thead>
                <!-- Area Headers -->
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
                <!-- Sub-headers -->
                <tr class="sub-headers">
                  <!-- Formación -->
                  <th class="sub-h">Diplomado (3 pts)</th>
                  <th class="sub-h">Especialización (4 pts)</th>
                  <th class="sub-h">Maestría (6 pts)</th>
                  <th class="sub-h">Doctorado (7 pts)</th>
                  <!-- Perfeccionamiento -->
                  <th class="sub-h">Cursos area > 120 hrs (3 p/c max 9)</th>
                  <th class="sub-h">Cursillos/Semin. > 20 hrs (1 p max 5)</th>
                  <th class="sub-h">Disertante congresos (1 p max 3)</th>
                  <th class="sub-h">Formación Pedagóg. (1 p max 3)</th>
                  <!-- Experiencia -->
                  <th class="sub-h">Ejercicio Profesional (1 p/año max 15)</th>
                  <th class="sub-h">Docencia Ejercida (1 p/sem max 10)</th>
                  <th class="sub-h">Tutoría de Tesis (1 p max 5)</th>
                  <th class="sub-h">Docente Postgrado (1 p max 5)</th>
                  <th class="sub-h">Cargos Similares (max 15)</th>
                  <!-- Otros -->
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
                  <td class="text-center bg-teal-1 font-bold text-teal-10">Bs. <br>{{ Math.round(row.pretension_salarial || 0) }}</td>

                  <!-- Inputs Area 1 -->
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a1_diplomado }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-deep-purple-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a1_diplomado') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a1_diplomado')" :key="v" dense unelevated :label="v" :color="row.evalData.a1_diplomado === v ? 'deep-purple-10' : 'grey-2'" :text-color="row.evalData.a1_diplomado === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a1_diplomado = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a1_especialidad }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-deep-purple-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a1_especialidad') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a1_especialidad')" :key="v" dense unelevated :label="v" :color="row.evalData.a1_especialidad === v ? 'deep-purple-10' : 'grey-2'" :text-color="row.evalData.a1_especialidad === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a1_especialidad = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a1_maestria }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-deep-purple-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a1_maestria') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a1_maestria')" :key="v" dense unelevated :label="v" :color="row.evalData.a1_maestria === v ? 'deep-purple-10' : 'grey-2'" :text-color="row.evalData.a1_maestria === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a1_maestria = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a1_doctorado }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-deep-purple-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a1_doctorado') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a1_doctorado')" :key="v" dense unelevated :label="v" :color="row.evalData.a1_doctorado === v ? 'deep-purple-10' : 'grey-2'" :text-color="row.evalData.a1_doctorado === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a1_doctorado = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>

                  <!-- Inputs Area 2 -->
                  <td class="score-cell"><div class="cell-val text-teal-10">{{ row.evalData.a2_cursos_120 }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-teal-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a2_cursos_120') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a2_cursos_120')" :key="v" dense unelevated :label="v" :color="row.evalData.a2_cursos_120 === v ? 'teal-10' : 'grey-2'" :text-color="row.evalData.a2_cursos_120 === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a2_cursos_120 = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a2_cursos_20 }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-teal-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a2_cursos_20') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a2_cursos_20')" :key="v" dense unelevated :label="v" :color="row.evalData.a2_cursos_20 === v ? 'teal-10' : 'grey-2'" :text-color="row.evalData.a2_cursos_20 === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a2_cursos_20 = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a2_disertante }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-teal-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a2_disertante') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a2_disertante')" :key="v" dense unelevated :label="v" :color="row.evalData.a2_disertante === v ? 'teal-10' : 'grey-2'" :text-color="row.evalData.a2_disertante === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a2_disertante = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a2_pedagogico }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-teal-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a2_pedagogico') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a2_pedagogico')" :key="v" dense unelevated :label="v" :color="row.evalData.a2_pedagogico === v ? 'teal-10' : 'grey-2'" :text-color="row.evalData.a2_pedagogico === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a2_pedagogico = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>

                  <!-- Inputs Area 3 -->
                  <td class="score-cell"><div class="cell-val text-orange-9">{{ row.evalData.a3_ejercicio_prof }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-orange-9 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a3_ejercicio_prof') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a3_ejercicio_prof')" :key="v" dense unelevated :label="v" :color="row.evalData.a3_ejercicio_prof === v ? 'orange-9' : 'grey-2'" :text-color="row.evalData.a3_ejercicio_prof === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a3_ejercicio_prof = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a3_docencia }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-orange-9 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a3_docencia') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a3_docencia')" :key="v" dense unelevated :label="v" :color="row.evalData.a3_docencia === v ? 'orange-9' : 'grey-2'" :text-color="row.evalData.a3_docencia === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a3_docencia = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a3_tutorias }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-orange-9 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a3_tutorias') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a3_tutorias')" :key="v" dense unelevated :label="v" :color="row.evalData.a3_tutorias === v ? 'orange-9' : 'grey-2'" :text-color="row.evalData.a3_tutorias === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a3_tutorias = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a3_docente_post }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-orange-9 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a3_docente_post') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a3_docente_post')" :key="v" dense unelevated :label="v" :color="row.evalData.a3_docente_post === v ? 'orange-9' : 'grey-2'" :text-color="row.evalData.a3_docente_post === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a3_docente_post = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a3_cargos_sim }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-orange-9 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a3_cargos_sim') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a3_cargos_sim')" :key="v" dense unelevated :label="v" :color="row.evalData.a3_cargos_sim === v ? 'orange-9' : 'grey-2'" :text-color="row.evalData.a3_cargos_sim === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a3_cargos_sim = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>

                  <!-- Inputs Area 4 -->
                  <td class="score-cell"><div class="cell-val text-deep-purple-10">{{ row.evalData.a4_revistas }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-deep-purple-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a4_revistas') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a4_revistas')" :key="v" dense unelevated :label="v" :color="row.evalData.a4_revistas === v ? 'deep-purple-10' : 'grey-2'" :text-color="row.evalData.a4_revistas === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a4_revistas = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a4_libros }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-deep-purple-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a4_libros') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a4_libros')" :key="v" dense unelevated :label="v" :color="row.evalData.a4_libros === v ? 'deep-purple-10' : 'grey-2'" :text-color="row.evalData.a4_libros === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a4_libros = v" v-close-popup />
                      </div>
                    </q-popup-proxy>
                  </td>
                  <td class="score-cell"><div class="cell-val">{{ row.evalData.a4_distinciones }}</div>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <div class="bg-deep-purple-10 text-white q-pa-sm text-center text-weight-bold" style="font-size: 11px;">{{ getFieldLabel('a4_distinciones') }}</div>
                      <div class="q-pa-xs bg-white shadow-10 rounded-borders row justify-center" style="max-width: 250px">
                        <q-btn v-for="v in getOptionsForField('a4_distinciones')" :key="v" dense unelevated :label="v" :color="row.evalData.a4_distinciones === v ? 'deep-purple-10' : 'grey-2'" :text-color="row.evalData.a4_distinciones === v ? 'white' : 'black'" class="q-ma-xs btn-fixed" @click="row.evalData.a4_distinciones = v" v-close-popup />
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
const headerInfo = ref({
  nombre: '',
  gestion: '2025'
})

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

// Group rows by Sede and Cargo
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
      headerInfo.value.nombre = data[0].oferta?.convocatoria?.nombre || ''
    }

    localRows.value = data.map((postulacion) => {
      const existing = postulacion.evaluacion?.detalle_evaluacion || {}
      const formacion = postulacion.postulante?.meritos?.find(m => m.tipo_documento?.nombre === 'FORMACIÓN ACADÉMICA')
      const area = formacion?.respuestas?.profesion || '-'
      const anioRaw = formacion?.respuestas?.fecha_titulo || ''
      const anio = anioRaw ? anioRaw.substring(0, 4) : '-'

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

    // Auto-select first tab
    if (Object.keys(groupedRows.value).length > 0) {
      activeTab.value = Object.keys(groupedRows.value)[0]
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

    // 1. Header Bar (Vibrant University Lila)
    doc.setFillColor(74, 20, 140)
    doc.rect(5, 5, 320, 22, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(group.sede.toUpperCase(), 15, 14)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(group.cargo.toUpperCase(), 15, 21)

    // 2. Postulantes Badge
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(260, 8, 50, 14, 7, 7, 'F')
    doc.setTextColor(74, 20, 140)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`${group.items.length} POSTULANTES`, 285, 17, { align: 'center' })

    // 3. Table Construction
    const head = [
      [
        { content: 'NO.', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 7 } },
        { content: 'NOMBRES Y APELLIDOS', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 7 } },
        { content: 'ÁREA FORMACIÓN', rowSpan: 2, styles: { valign: 'bottom', halign: 'center', minCellHeight: 45 } },
        { content: 'AÑO TÍTULO', rowSpan: 2, styles: { valign: 'bottom', halign: 'center' } },
        { content: 'PRETENSIÓN SALARIAL', rowSpan: 2, styles: { valign: 'bottom', halign: 'center' } },
        { content: 'FORMACIÓN PROFESIONAL (20 PTS)', colSpan: 4, styles: { fillColor: [74, 20, 140], halign: 'center', textColor: [255, 255, 255] } },
        { content: 'PERFECCIONAMIENTO PROFESIONAL (20 PTS)', colSpan: 4, styles: { fillColor: [0, 150, 136], halign: 'center', textColor: [255, 255, 255] } },
        { content: 'EXPERIENCIA ACADEMICA (50 PTS)', colSpan: 5, styles: { fillColor: [245, 124, 0], halign: 'center', textColor: [255, 255, 255] } }, // Orange-9
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
      styles: {
        fontSize: 7,
        cellPadding: 1,
        valign: 'middle',
        halign: 'center',
        lineColor: [180, 180, 180],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [250, 250, 250],
        textColor: [40, 40, 40],
        fontStyle: 'bold',
        fontSize: 6
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50, textColor: [74, 20, 140] },
        2: { cellWidth: 15 },
        3: { cellWidth: 12 },
        4: { cellWidth: 15, textColor: [0, 150, 136], fontStyle: 'bold' },
        21: { cellWidth: 22, fontStyle: 'bold', fontSize: 9 },
        22: { halign: 'left', cellWidth: 45 }
      },
      didParseCell: function(data) {
        if (data.section === 'head') {
          const verticalCols = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
          const isMeritSub = data.row.index === 1 && verticalCols.includes(data.column.index)
          const isMainRotated = data.row.index === 0 && [2, 3, 4].includes(data.column.index)

          if (isMeritSub || isMainRotated) {
             data.cell.styles.minCellHeight = 60
             data.cell.rawText = data.cell.text.join(' ')
             data.cell.text = []
          }
        }
        if (data.section === 'body' && data.column.index === 21) {
          const val = parseInt(data.cell.text[0]) || 0
          data.cell.styles.textColor = (val < 51) ? [220, 0, 0] : [0, 150, 0]
          data.cell.styles.fillColor = [245, 245, 245]
        }
      },
      didDrawCell: function(data) {
        const verticalCols = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        const isMeritSub = data.section === 'head' && data.row.index === 1 && verticalCols.includes(data.column.index)
        const isMainRotated = data.section === 'head' && data.row.index === 0 && [2, 3, 4].includes(data.column.index)

        if ((isMeritSub || isMainRotated) && data.cell.rawText) {
          doc.saveGraphicsState()
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(40, 40, 40)

          // Center horizontally within cell width
          const x = data.cell.x + (data.cell.width / 2) + 1
          // Position vertically near the bottom of the cell
          const y = data.cell.y + data.cell.height - 4

          // Angle 90: text goes top-to-bottom starting at y.
          // Wait, bottom-to-top is better. angle: -90 or angle: 90 with correct start?
          // Let's use 90 and adjust so it draws INSIDE.
          doc.text(data.cell.rawText, x, y, { angle: 90 })
          doc.restoreGraphicsState()
        }
      }
    })

    // 4. Firmas al final
    const finalY = (doc).lastAutoTable.finalY + 30
    if (finalY < 195) {
      doc.setDrawColor(0)
      doc.setLineWidth(0.4)
      doc.setFontSize(9)
      doc.setTextColor(0)

      doc.line(30, finalY, 100, finalY)
      doc.text('FIRMA RESPONSABLE 1', 65, finalY + 5, { align: 'center' })

      doc.line(130, finalY, 200, finalY)
      doc.text('FIRMA RESPONSABLE 2', 165, finalY + 5, { align: 'center' })

      doc.line(230, finalY, 300, finalY)
      doc.text('FIRMA RESPONSABLE 3', 265, finalY + 5, { align: 'center' })
    }
  })

  const fileName = targetGroup ? `EVALUACION_${targetGroup.cargo}_${targetGroup.sede}.pdf` : 'EVALUACION_GENERAL.pdf'
  doc.save(fileName)
}

const saveGroup = async (items) => {
  saving.value = true
  try {
    for (const row of items) {
      const d = row.evalData
      const totalArea1 = Math.min((d.a1_diplomado || 0) + (d.a1_especialidad || 0) + (d.a1_maestria || 0) + (d.a1_doctorado || 0), 20)
      const totalArea2 = Math.min((d.a2_cursos_120 || 0) + (d.a2_cursos_20 || 0) + (d.a2_disertante || 0) + (d.a2_pedagogico || 0), 20)
      const totalArea3 = Math.min((d.a3_ejercicio_prof || 0) + (d.a3_docencia || 0) + (d.a3_tutorias || 0) + (d.a3_docente_post || 0) + (d.a3_cargos_sim || 0), 50)
      const totalArea4 = Math.min((d.a4_revistas || 0) + (d.a4_libros || 0) + (d.a4_distinciones || 0), 10)

      const payload = {
        postulacion_id: row.id,
        puntaje_formacion: totalArea1,
        puntaje_perfeccionamiento: totalArea2,
        puntaje_experiencia: totalArea3,
        puntaje_otros: totalArea4,
        puntaje_total: totalArea1 + totalArea2 + totalArea3 + totalArea4,
        detalle_evaluacion: d,
        observaciones: d.observaciones,
      }
      await api.post('/evaluaciones-meritos', payload)
    }
    $q.notify({ color: 'positive', icon: 'check', message: 'Tabla guardada correctamente' })
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
      const totalArea1 = Math.min((d.a1_diplomado || 0) + (d.a1_especialidad || 0) + (d.a1_maestria || 0) + (d.a1_doctorado || 0), 20)
      const totalArea2 = Math.min((d.a2_cursos_120 || 0) + (d.a2_cursos_20 || 0) + (d.a2_disertante || 0) + (d.a2_pedagogico || 0), 20)
      const totalArea3 = Math.min((d.a3_ejercicio_prof || 0) + (d.a3_docencia || 0) + (d.a3_tutorias || 0) + (d.a3_docente_post || 0) + (d.a3_cargos_sim || 0), 50)
      const totalArea4 = Math.min((d.a4_revistas || 0) + (d.a4_libros || 0) + (d.a4_distinciones || 0), 10)

      const payload = {
        postulacion_id: row.id,
        puntaje_formacion: totalArea1,
        puntaje_perfeccionamiento: totalArea2,
        puntaje_experiencia: totalArea3,
        puntaje_otros: totalArea4,
        puntaje_total: totalArea1 + totalArea2 + totalArea3 + totalArea4,
        detalle_evaluacion: d,
        observaciones: d.observaciones,
      }
      await api.post('/evaluaciones-meritos', payload)
    }
    $q.notify({ color: 'positive', icon: 'done_all', message: '¡Todas las tablas guardadas!' })
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
  border-radius: 0 0 16px 16px;
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
  color: #1e293b;
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
.line-height-1 { line-height: 1.1; }
.cell-textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  font-size: 11px;
  resize: none;
  border-radius: 4px;
  padding: 4px;
  background-color: #f8fafc;
}
.rounded-xl { border-radius: 12px; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
