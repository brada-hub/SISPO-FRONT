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
            <div class="row items-center gap-2 flex-wrap">
              <div class="text-subtitle2 font-black bg-white text-primary px-3 h-9 flex items-center rounded-xl shadow-inner">
                {{ group.items.length }} POSTULANTES
              </div>

              <!-- ORDENADOR DE EVALUACIÓN -->
              <div class="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl text-xs font-bold border border-white/20">
                <span class="text-[10px] text-white/80 uppercase mr-1">Orden:</span>
                <q-btn-toggle
                  v-model="sortMode"
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
                    { label: '🔤 A-Z', value: 'alfabetico' },
                    { label: '🎯 Puntaje', value: 'puntaje' },
                    { label: '⏱️ Registro', value: 'registro' }
                  ]"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  :icon="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                  :color="sortDirection === 'asc' ? 'amber-4' : 'white'"
                  @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
                >
                  <q-tooltip>{{ sortDirection === 'asc' ? 'Ascendente' : 'Descendente' }}</q-tooltip>
                </q-btn>
              </div>

              <q-btn
                color="white"
                text-color="red-9"
                icon="picture_as_pdf"
                label="PDF"
                unelevated
                size="sm"
                @click="exportToPDF(group)"
                class="rounded-xl font-black shadow-md h-9 px-3"
              >
                <q-tooltip>Descargar Acta Oficial en PDF</q-tooltip>
              </q-btn>
              <q-btn
                color="white"
                text-color="green-8"
                icon="description"
                label="EXCEL"
                unelevated
                size="sm"
                @click="exportToExcel(group)"
                class="rounded-xl font-black shadow-md h-9 px-3"
              >
                <q-tooltip>Descargar Matriz en Excel</q-tooltip>
              </q-btn>
              <q-btn
                color="white"
                text-color="blue-9"
                icon="article"
                label="WORD"
                unelevated
                size="sm"
                @click="exportToWord(group)"
                class="rounded-xl font-black shadow-md h-9 px-3"
              >
                <q-tooltip>Descargar Acta Oficial en Word (.doc)</q-tooltip>
              </q-btn>
              <q-btn
                color="secondary"
                text-color="white"
                icon="save"
                label="GUARDAR"
                unelevated
                size="sm"
                :loading="saving"
                @click="saveGroup(group.items)"
                class="rounded-xl font-black shadow-md h-9 px-4"
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

                    <td class="text-center bg-grey-1 font-bold px-2 py-1" style="min-width: 130px; max-width: 180px; font-size: 10px; line-height: 1.25; white-space: normal; word-break: normal;">
                      {{ row.extraInfo?.area || '-' }}
                      <q-tooltip v-if="row.extraInfo?.area && row.extraInfo?.area !== '-'">{{ row.extraInfo.area }}</q-tooltip>
                    </td>
                    <td class="text-center bg-grey-1 font-bold" style="min-width: 60px;">{{ row.extraInfo?.anio || '-' }}</td>
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
                           <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style="min-width: 290px; max-width: 360px">
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
                                   @click="updateFieldAndSave(row, col.id, v)"
                                   v-close-popup
                                 />
                               </div>
                             </div>
                           </div>
                         </q-popup-proxy>
                       </td>
                    </template>
                    <template v-else>
                       <td v-for="field in meritFields" :key="field" class="score-cell">
                         <div class="cell-val" :class="getFieldColorClass(field)">{{ row.evalData[field] }}</div>
                         <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                           <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style="min-width: 290px; max-width: 360px">
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
                                   @click="updateFieldAndSave(row, field, v)"
                                   v-close-popup
                                 />
                               </div>
                             </div>
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

        <!-- HIDDEN EXPEDIENTE PDF COMPONENT (Formato Original Aprobado + Respaldos Anexados) -->
        <ExpedientePDF
          ref="pdfExpedienteRef"
          :postulacion="expedientePostulacionData"
          :filtered-meritos="expedienteMeritosData"
        />
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
import ExpedientePDF from 'components/ExpedientePDF.vue'
import { generateInstitutionalEvaluationPDF } from 'src/utils/institutionalPdfEngine'
import { exportInstitutionalMatrixExcel } from 'src/utils/institutionalExcelEngine'
import { exportInstitutionalMatrixWord } from 'src/utils/institutionalWordEngine'

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

const sortMode = ref('alfabetico') // 'alfabetico' | 'puntaje' | 'registro'
const sortDirection = ref('asc')

// Modal Logic
const showExpedienteModal = ref(false)
const selectedPostulacion = ref(null)
const expedienteRef = ref(null)
const pdfExpedienteRef = ref(null)

const expedientePostulacionData = computed(() => expedienteRef.value?.postulacion || null)
const expedienteMeritosData = computed(() => expedienteRef.value?.filteredMeritos || [])

const openExpedienteModal = (row) => {
  selectedPostulacion.value = row
  showExpedienteModal.value = true
}

const exportToPDFExpediente = async () => {
  if (!pdfExpedienteRef.value) {
    $q.notify({ type: 'warning', message: 'Cargando expediente...' })
    return
  }

  try {
    $q.loading.show({ message: 'Generando Expediente y respaldos adjuntos...' })
    await pdfExpedienteRef.value.generatePDF()
    $q.notify({ type: 'positive', message: 'Expediente descargado con éxito con todos sus respaldos.' })
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
           descripcion: crit.descripcion || crit.detalle || crit.pautas || '',
           seccion: sec.seccion || `Sección ${sIdx + 1}`,
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

  let area = ''
  let anio = ''

  // 1. Prioridad: Formación Académica (normalizada camelCase y snake_case)
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

  // 2. Prioridad: Méritos del postulante (respuestas JSON con profesion/carrera/titulo)
  const meritos = p.meritos || []
  if ((!area || !anio) && Array.isArray(meritos) && meritos.length > 0) {
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
        items: list.map(e => `${e.cargo_desempenado || 'Cargo'} en ${e.institucion_empresa || '-'} (${e.fecha_inicio ? String(e.fecha_inicio).substring(0,4) : ''} - ${e.fecha_fin ? String(e.fecha_fin).substring(0,4) : 'Actualidad'})`)
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

  const isAsc = sortDirection.value === 'asc'

  // Ensure deterministic ordering based on sortMode
  Object.values(groups).forEach(g => {
    g.items.sort((a, b) => {
      let diff = 0
      if (sortMode.value === 'puntaje') {
        const aVal = a.evaluacion?.score_total ?? calculateTotal(a)
        const bVal = b.evaluacion?.score_total ?? calculateTotal(b)
        diff = Number(bVal || 0) - Number(aVal || 0)
        return isAsc ? -diff : diff
      }
      if (sortMode.value === 'registro') {
        diff = (a.id || 0) - (b.id || 0)
        return isAsc ? diff : -diff
      }
      const apeA = `${a.postulante?.apellidos || ''} ${a.postulante?.nombres || ''}`.trim().toLowerCase()
      const apeB = `${b.postulante?.apellidos || ''} ${b.postulante?.nombres || ''}`.trim().toLowerCase()
      diff = apeA.localeCompare(apeB)
      if (diff === 0) return (a.id || 0) - (b.id || 0)
      return isAsc ? diff : -diff
    })
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

const exportToWord = async (targetGroup = null) => {
  const group = targetGroup || (activeTab.value ? groupedRows.value[activeTab.value] : null) || Object.values(groupedRows.value)[0]
  if (!group || !group.items || group.items.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay postulantes para exportar en este grupo.' })
    return
  }

  try {
    $q.loading.show({ message: 'Generando Matriz Institucional en Word (.doc)...' })
    await exportInstitutionalMatrixWord({
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
    $q.notify({ type: 'positive', message: 'Acta Oficial Word descargada con éxito.' })
  } catch (err) {
    console.error('Error al exportar Word:', err)
    $q.notify({ type: 'negative', message: 'Error al generar Word: ' + (err.message || 'Error desconocido') })
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
