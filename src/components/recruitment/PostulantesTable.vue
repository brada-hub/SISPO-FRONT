<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
    <!-- Filters and Search Toolbar -->
    <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
      <!-- Search Input -->
      <q-input
        v-model="search"
        outlined
        dense
        rounded
        placeholder="Buscar postulante por nombre, apellido o CI..."
        class="bg-white shadow-sm w-full md:max-w-md"
        @update:model-value="onFilterChange"
      >
        <template v-slot:append>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>

      <!-- Advanced Select Filters -->
      <div class="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
        <!-- Convocatoria Filter -->
        <q-select
          v-model="selectedConvocatoria"
          :options="convocatoriaOptions"
          outlined
          dense
          rounded
          emit-value
          map-options
          bg-color="white"
          label="Convocatoria"
          class="shadow-sm min-w-[200px]"
          @update:model-value="onFilterChange"
        />

        <!-- Risk Filter -->
        <q-select
          v-model="selectedRisk"
          :options="riskOptions"
          outlined
          dense
          rounded
          bg-color="white"
          label="Nivel de Riesgo"
          class="shadow-sm min-w-[150px]"
          @update:model-value="onFilterChange"
        />

        <!-- Status Filter -->
        <q-select
          v-model="selectedStatus"
          :options="statusOptions"
          outlined
          dense
          rounded
          bg-color="white"
          label="Estado"
          class="shadow-sm min-w-[170px]"
          @update:model-value="onFilterChange"
        />

        <!-- Reset button -->
        <q-btn
          flat
          round
          dense
          color="grey-7"
          icon="restart_alt"
          @click="resetFilters"
        >
          <q-tooltip>Limpiar filtros</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Table content -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-gray-100 text-gray-600 font-extrabold uppercase text-[11px] tracking-wider border-b border-gray-200">
            <th class="py-4 px-6 text-center">Rank #</th>
            <th class="py-4 px-6">Postulante</th>
            <th class="py-4 px-6">Convocatoria</th>
            <th class="py-4 px-6 text-center cursor-pointer select-none" @click="toggleSort('scoreTotal')">
              Score CV
              <q-icon :name="getSortIcon('scoreTotal')" size="xs" class="ml-1" />
            </th>
            <th class="py-4 px-6 text-center">Clasificación</th>
            <th class="py-4 px-6 text-center cursor-pointer select-none" @click="toggleSort('riskScore')">
              Riesgo
              <q-icon :name="getSortIcon('riskScore')" size="xs" class="ml-1" />
            </th>
            <th class="py-4 px-6 text-center">Estado</th>
            <th class="py-4 px-6 text-center">Exp. Últimos 5 Años</th>
            <th class="py-4 px-6 text-center">Nivel Académico</th>
            <th class="py-4 px-6 text-center">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr 
            v-for="(row, index) in paginatedRows" 
            :key="row.id" 
            class="hover:bg-purple-50/20 transition-all cursor-pointer group"
            @click="$emit('select-postulante', row)"
          >
            <!-- Rank Number -->
            <td class="py-4 px-6 text-center font-black text-gray-400 group-hover:text-primary transition-colors">
              {{ (pagination.page - 1) * pagination.rowsPerPage + index + 1 }}
            </td>

            <!-- Postulant Name -->
            <td class="py-4 px-6">
              <div class="font-extrabold text-gray-800 text-[14px]">
                {{ row.nombres }} {{ row.apellidos }}
              </div>
              <div class="text-[11px] text-gray-400 font-medium">
                CI: {{ row.ci }}
              </div>
            </td>

            <!-- Convocatoria -->
            <td class="py-4 px-6 font-semibold text-gray-500 max-w-[200px] truncate">
              {{ row.convocatoriaTitle }}
            </td>

            <!-- Score CV -->
            <td class="py-4 px-6 text-center font-black text-h6" :class="getScoreColor(row.scoreTotal)">
              {{ row.scoreTotal }} <span class="text-[11px] font-medium text-gray-400">/100</span>
            </td>

            <!-- Classification Badge -->
            <td class="py-4 px-6 text-center">
              <q-badge :color="getClassBadge(row.classification).color" class="px-3 py-1 text-[11px] font-bold rounded-full">
                {{ getClassBadge(row.classification).label }}
              </q-badge>
            </td>

            <!-- Risk Badge -->
            <td class="py-4 px-6 text-center">
              <q-badge :color="getRiskBadge(row.riskLevel).color" class="px-3 py-1 text-[11px] font-bold rounded-full">
                {{ getRiskBadge(row.riskLevel).label }}
              </q-badge>
              <div class="text-[10px] text-gray-400 mt-1 font-bold">
                {{ row.riskScore }}% score
              </div>
            </td>

            <!-- Evaluation Status -->
            <td class="py-4 px-6 text-center">
              <q-badge :color="getStatusBadge(row.evaluationStatus).color" class="px-3 py-1 text-[11px] font-bold rounded-full">
                {{ getStatusBadge(row.evaluationStatus).label }}
              </q-badge>
            </td>

            <!-- Months in last 5 years -->
            <td class="py-4 px-6 text-center font-bold text-gray-700">
              {{ row.experienceSummary?.accumulated_months_last_5_years || 0 }} meses
            </td>

            <!-- Highest academic level -->
            <td class="py-4 px-6 text-center text-gray-600 font-semibold truncate max-w-[120px]">
              {{ row.highestLevel }}
            </td>

            <!-- Select button -->
            <td class="py-4 px-6 text-center">
              <q-btn
                round
                flat
                dense
                color="primary"
                icon="arrow_forward"
                class="group-hover:translate-x-1 transition-transform"
                @click.stop="$emit('select-postulante', row)"
              />
            </td>
          </tr>

          <!-- Empty rows state -->
          <tr v-if="sortedRows.length === 0">
            <td colspan="10" class="py-16 text-center">
              <q-icon name="group_remove" size="64px" color="grey-3" />
              <div class="text-lg font-bold text-gray-400 mt-3">No se encontraron postulantes con los filtros seleccionados</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Pagination -->
    <div class="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
      <div class="text-xs text-gray-500 font-bold">
        Mostrando {{ paginatedRows.length }} de {{ sortedRows.length }} postulantes
      </div>
      <q-pagination
        v-model="pagination.page"
        :max="maxPages"
        direction-links
        flat
        color="primary"
        active-color="primary"
        class="font-bold"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    required: true
  }
})

defineEmits(['select-postulante'])

const search = ref('')
const selectedConvocatoria = ref('ALL')
const selectedRisk = ref('ALL')
const selectedStatus = ref('ALL')

// Sorting Options (Fase 5)
const sortBy = ref('scoreTotal')
const sortDesc = ref(true)

// Pagination options
const pagination = ref({
  page: 1,
  rowsPerPage: 10
})

// Filter choices options
const riskOptions = [
  { label: 'Todos los riesgos', value: 'ALL' },
  { label: 'Riesgo LOW', value: 'low' },
  { label: 'Riesgo MEDIUM', value: 'medium' },
  { label: 'Riesgo HIGH', value: 'high' },
  { label: 'Riesgo CRITICAL', value: 'critical' }
]

const statusOptions = [
  { label: 'Todos los estados', value: 'ALL' },
  { label: 'Aprobación Automática', value: 'auto_approved' },
  { label: 'Auditoría Humana Requerida', value: 'requires_human_review' },
  { label: 'Aprobado Manualmente', value: 'manually_approved' },
  { label: 'Rechazado Manualmente', value: 'manually_rejected' }
]

const convocatoriaOptions = computed(() => {
  const options = [{ label: 'Todas las convocatorias', value: 'ALL' }]
  const map = new Map()
  props.rows.forEach(r => {
    if (r.convocatoriaId && !map.has(r.convocatoriaId)) {
      map.set(r.convocatoriaId, r.convocatoriaTitle)
      options.push({ label: r.convocatoriaTitle, value: r.convocatoriaId })
    }
  })
  return options
})

// Reset all filtering fields
const resetFilters = () => {
  search.value = ''
  selectedConvocatoria.value = 'ALL'
  selectedRisk.value = 'ALL'
  selectedStatus.value = 'ALL'
  sortBy.value = 'scoreTotal'
  sortDesc.value = true
  pagination.value.page = 1
}

const onFilterChange = () => {
  pagination.value.page = 1
}

// Global deterministic filtering (Fase 5)
const filteredRows = computed(() => {
  return props.rows.filter(row => {
    // 1. Search term match
    const name = `${row.nombres} ${row.apellidos}`.toLowerCase()
    const ci = String(row.ci || '').toLowerCase()
    const matchesSearch = !search.value 
      || name.includes(search.value.toLowerCase()) 
      || ci.includes(search.value.toLowerCase())

    // 2. Convocatoria filter
    const matchesConvo = selectedConvocatoria.value === 'ALL' || row.convocatoriaId === selectedConvocatoria.value

    // 3. Risk filter
    const matchesRisk = selectedRisk.value === 'ALL' || row.riskLevel === selectedRisk.value

    // 4. Status filter
    const matchesStatus = selectedStatus.value === 'ALL' || row.evaluationStatus === selectedStatus.value

    return matchesSearch && matchesConvo && matchesRisk && matchesStatus
  })
})

// Sorting Logic (Fase 5)
const sortedRows = computed(() => {
  return [...filteredRows.value].sort((a, b) => {
    let valA = a[sortBy.value]
    let valB = b[sortBy.value]
    
    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()

    if (valA < valB) return sortDesc.value ? 1 : -1
    if (valA > valB) return sortDesc.value ? -1 : 1
    return 0
  })
})

const maxPages = computed(() => {
  return Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage) || 1
})

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const end = start + pagination.value.rowsPerPage
  return sortedRows.value.slice(start, end)
})

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = field
    sortDesc.value = true
  }
}

const getSortIcon = (field) => {
  if (sortBy.value !== field) return 'unfold_more'
  return sortDesc.value ? 'arrow_downward' : 'arrow_upward'
}

// Style Helpers
const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 55) return 'text-yellow-600'
  return 'text-red-500'
}

const getClassBadge = (classification) => {
  switch (classification) {
    case 'APTO':
      return { label: 'APTO', color: 'green' }
    case 'PARCIALMENTE_APTO':
      return { label: 'PARCIALMENTE APTO', color: 'warning' }
    default:
      return { label: 'NO APTO', color: 'red' }
  }
}

const getRiskBadge = (level) => {
  switch (level) {
    case 'low':
      return { label: 'LOW RISK', color: 'green' }
    case 'medium':
      return { label: 'MEDIUM RISK', color: 'yellow-8' }
    case 'high':
      return { label: 'HIGH RISK', color: 'orange-8' }
    case 'critical':
      return { label: 'CRITICAL RISK', color: 'red-9' }
    default:
      return { label: 'SIN RIESGO', color: 'grey' }
  }
}

const getStatusBadge = (status) => {
  switch (status) {
    case 'auto_approved':
      return { label: 'APROBACIÓN AUT.', color: 'teal-7' }
    case 'requires_human_review':
      return { label: 'AUDITORÍA REQ.', color: 'deep-orange-8' }
    case 'manually_approved':
      return { label: 'APROBADO MANUAL', color: 'purple-7' }
    case 'manually_rejected':
      return { label: 'RECHAZADO MANUAL', color: 'red-10' }
    default:
      return { label: 'EVALUADO', color: 'indigo' }
  }
}
</script>
