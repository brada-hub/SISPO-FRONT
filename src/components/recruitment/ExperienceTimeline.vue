<template>
  <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-md">
    <div class="flex items-center gap-2 mb-4">
      <q-icon name="timeline" color="primary" size="sm" />
      <span class="text-subtitle1 font-black text-gray-800 uppercase tracking-tight">Línea de Tiempo Laboral (Temporal Analysis)</span>
    </div>

    <!-- Experience Timeline horizontal container -->
    <div v-if="experiences.length === 0" class="py-10 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
      <q-icon name="history" size="48px" color="grey-3" />
      <div class="text-xs font-black text-gray-400 mt-2 uppercase tracking-widest">Sin registros de experiencia profesional registrados</div>
    </div>

    <div v-else class="flex flex-col gap-6">
      <!-- Summary metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50 text-center">
          <div class="text-[10px] font-black text-purple-400 uppercase tracking-widest">Meses Acumulados</div>
          <div class="text-2xl font-black text-purple-800">{{ summary?.accumulated_months || 0 }} meses</div>
        </div>
        <div class="bg-teal-50/50 p-4 rounded-xl border border-teal-100/50 text-center">
          <div class="text-[10px] font-black text-teal-400 uppercase tracking-widest">Meses Únicos</div>
          <div class="text-2xl font-black text-teal-800">{{ summary?.unique_months || 0 }} meses</div>
        </div>
        <div class="bg-red-50/50 p-4 rounded-xl border border-red-100/50 text-center">
          <div class="text-[10px] font-black text-red-400 uppercase tracking-widest">Solapamiento Estimado</div>
          <div class="text-2xl font-black text-red-800">{{ summary?.overlap_months_estimated || 0 }} meses</div>
        </div>
        <div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-center">
          <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recientes Últimos 5 Años</div>
          <div class="text-2xl font-black text-indigo-800">{{ summary?.accumulated_months_last_5_years || 0 }} m</div>
        </div>
      </div>

      <!-- Timeline cards list -->
      <div class="relative pl-6 border-l-2 border-primary/20 flex flex-col gap-6">
        <div 
          v-for="exp in sortedExperiences" 
          :key="exp.id" 
          class="relative bg-gray-50/70 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
        >
          <!-- Timeline dot indicator -->
          <div 
            class="absolute top-5 -left-[31px] w-4 h-4 rounded-full border-2 border-white shadow-md"
            :class="isVigente(exp) ? 'bg-green-500' : 'bg-primary'"
          ></div>

          <div class="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div>
              <div class="font-extrabold text-gray-800 text-[14px]">
                {{ (exp.cargo_raw || 'Cargo no definido').toUpperCase() }}
              </div>
              <div class="text-[12px] text-gray-500 font-bold">
                {{ (exp.institucion_raw || 'Empresa/Institución').toUpperCase() }}
              </div>
            </div>

            <!-- Date range badge -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-gray-400">
                {{ formatDate(exp.fecha_inicio) }} - {{ isVigente(exp) ? 'VIGENTE' : formatDate(exp.fecha_fin) }}
              </span>
              <q-badge v-if="isVigente(exp)" color="green" class="px-2 py-0.5 rounded font-black text-[10px]">
                VIGENTE
              </q-badge>
              <q-badge color="primary" class="px-2 py-0.5 rounded font-black text-[10px]">
                {{ exp.meses_experiencia || 0 }} meses
              </q-badge>
            </div>
          </div>

          <!-- Highlight Overlaps -->
          <div 
            v-if="hasOverlap(exp)" 
            class="mt-3 p-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2"
          >
            <q-icon name="warning" color="red-9" size="xs" />
            <span>Este empleo presenta solapamiento de fechas con otra actividad profesional registrada.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  experiences: {
    type: Array,
    default: () => []
  },
  summary: {
    type: Object,
    default: () => ({
      accumulated_months: 0,
      unique_months: 0,
      overlap_months_estimated: 0,
      accumulated_months_last_5_years: 0,
      overlap_detected: false
    })
  }
})

// Sort experiences chronologically by starting date descending (Fase 6)
const sortedExperiences = computed(() => {
  return [...props.experiences].sort((a, b) => {
    const dateA = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0)
    const dateB = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0)
    return dateB - dateA // Descending
  })
})

const isVigente = (exp) => {
  return !!exp.es_vigente || !exp.fecha_fin
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0]
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
}

// Detect overlap mathematically for card highlight (Fase 6)
const hasOverlap = (exp) => {
  if (!exp.fecha_inicio) return false
  const startA = new Date(exp.fecha_inicio)
  const endA = exp.fecha_fin ? new Date(exp.fecha_fin) : new Date()

  return props.experiences.some(other => {
    if (other.id === exp.id || !other.fecha_inicio) return false
    const startB = new Date(other.fecha_inicio)
    const endB = other.fecha_fin ? new Date(other.fecha_fin) : new Date()

    return startA < endB && endA > startB
  })
}
</script>
