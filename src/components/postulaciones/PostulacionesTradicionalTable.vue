<template>
  <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
    <q-table
      :rows="rows"
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
            @update:model-value="$emit('update-status', props.row)"
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
              @click="$emit('view-expediente', props.row)"
            />
            <q-btn
              v-if="canManageAll"
              icon="delete"
              size="sm"
              color="red-5"
              flat
              round
              dense
              @click="$emit('delete', props.row)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { date } from 'quasar'

defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  loading: {
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
  },
  canManageAll: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-expediente', 'delete', 'update-status'])

const formatDate = (val) => {
  if (!val) return '-'
  return date.formatDate(val, 'DD/MM/YYYY')
}

const getFileUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = process.env.API_URL || 'http://localhost:8000'
  return `${base}/storage/${path}`
}

const getScoreColor = (score) => {
  if (score >= 80) return 'positive'
  if (score >= 60) return 'primary'
  if (score >= 40) return 'warning'
  return 'negative'
}

const getStatusColor = (status) => {
  const map = {
    postulado: 'blue-grey-6',
    en_revision: 'orange-8',
    evaluado: 'indigo-7',
    entrevista: 'purple-7',
    aprobado: 'positive',
    rechazado: 'negative'
  }
  return map[status] || 'grey-7'
}

const getClassificationLabel = (val) => {
  const map = {
    cumple_perfil: 'Apto',
    parcialmente_cumple: 'Intermedio',
    no_cumple: 'No Cumple',
    requiere_evaluacion_humana: 'Auditoría'
  }
  return map[val] || val || 'Pendiente'
}
</script>
