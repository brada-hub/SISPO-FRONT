<template>
  <div class="animate-fade-in">
    <div class="text-[10px] text-gray-400 mb-3 flex items-center justify-between font-bold">
      <div class="flex items-center gap-1">
        <q-icon name="info" size="14px" />
        Reclutamiento Inteligente: Postulantes clasificados jerárquicamente por puntaje técnico del Score Engine.
      </div>
      <div v-if="selectedIds.length > 0" class="text-primary font-black uppercase">
        {{ selectedIds.length }} seleccionados masivamente.
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Table Header for Selection -->
      <div class="bg-gray-50/50 border-b border-gray-100 px-6 py-3 flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <q-checkbox :model-value="selectAll" dense class="mr-2" @update:model-value="(val) => $emit('toggle-select-all', val)" />
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
        v-for="(row, index) in rows"
        :key="row.id"
        :class="[
          'flex items-center gap-4 px-6 py-3.5 border-b border-gray-50 hover:bg-indigo-50/30 cursor-pointer transition-all duration-150',
          row.evaluacion?.nivel_riesgo === 'critico' ? 'border-l-4 border-l-red-600 bg-red-50/20' : '',
          selectedIds.includes(row.id) ? 'bg-indigo-50/40' : ''
        ]"
        @click="$emit('view-expediente', row)"
      >
        <!-- Multi-select checkbox -->
        <q-checkbox
          :model-value="selectedIds.includes(row.id)"
          @update:model-value="(val) => $emit('toggle-selection', { id: row.id, val })"
          dense
          class="mr-2"
          @click.stop
        />

        <!-- Medallas / Posicion -->
        <div
          class="w-12 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm border"
          :class="[
            row.evaluacion?.score_total === undefined ? 'bg-gray-50 text-gray-400 border-gray-100' :
            index === 0 ? 'bg-amber-50 text-amber-700 border-amber-200' :
            index === 1 ? 'bg-slate-50 text-slate-600 border-slate-200' :
            index === 2 ? 'bg-orange-50 text-orange-700 border-orange-200' :
            'bg-gray-50 text-gray-500 border-gray-100'
          ]"
        >
          <span v-if="row.evaluacion?.score_total === undefined" class="text-[10px] text-gray-400 font-bold">#—</span>
          <span v-else-if="index === 0">🥇 1º</span>
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

        <!-- Clasificación Badge -->
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
            @update:model-value="$emit('update-status', row)"
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
              @click.stop="$emit('quick-evaluate', row)"
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
            @click="$emit('view-expediente', row)"
          />
        </div>
      </div>

      <div v-if="rows.length === 0" class="p-12 text-center text-gray-300 text-xs">
        Sin postulantes disponibles para este cargo/sede.
      </div>
    </div>
  </div>
</template>

<script setup>
import { api } from 'boot/axios'

defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  selectAll: {
    type: Boolean,
    default: false
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  statusLabels: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['toggle-select-all', 'toggle-selection', 'view-expediente', 'update-status', 'quick-evaluate'])

const getFileUrl = (path) => {
  if (!path) return ''
  const baseUrl = api.defaults.baseURL.replace(/\/api$/, '')
  return `${baseUrl}/storage/${path}`
}

const getClassificationLabel = (val) => {
  const map = {
    altamente_recomendado: 'Altamente Recomendado',
    recomendado: 'Recomendado',
    no_recomendado: 'No Recomendado',
    apto: 'Apto',
    auditoria_humana: 'Auditoría Humana',
    no_apto: 'No Apto'
  }
  return map[val] || val || 'Pendiente'
}

const getScoreColor = (score) => {
  if (score === undefined || score === null) return 'grey-5'
  const val = Number(score)
  if (val >= 80) return 'green-7'
  if (val >= 60) return 'indigo-7'
  if (val >= 40) return 'amber-7'
  return 'red-7'
}

const getStatusColor = (status) => {
  switch (status) {
    case 'enviada': return 'indigo-7'
    case 'en_revision': return 'orange-7'
    case 'validada': return 'teal-7'
    case 'observada': return 'deep-orange-7'
    case 'rechazada': return 'red-7'
    case 'seleccionado': return 'positive'
    default: return 'grey-7'
  }
}
</script>
