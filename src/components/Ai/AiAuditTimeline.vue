<template>
  <div class="q-pa-md">
    <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-md">
      <q-icon name="history" size="sm" class="q-mr-sm" />
      Timeline de Auditoría
    </div>

    <q-timeline color="primary" layout="dense">
      <q-timeline-entry
        v-for="log in formattedLogs"
        :key="log.id"
        :title="log.title"
        :subtitle="log.time"
        :color="log.color"
        :icon="log.icon"
      >
        <div class="text-body2 text-grey-8">
          {{ log.description }}
        </div>
        
        <!-- Detalles extra si es override -->
        <div v-if="log.action === 'overridden_by_human'" class="q-mt-sm bg-grey-1 q-pa-sm rounded-borders" style="border-left: 3px solid #f59e0b;">
          <div class="text-caption text-weight-bold">Justificación:</div>
          <div class="text-caption text-italic text-grey-8">"{{ log.raw.human_override_reason }}"</div>
          <div class="q-mt-xs row items-center">
             <q-badge color="grey-4" text-color="grey-9" class="q-mr-sm">
                De: {{ formatClasificacion(log.raw.previous_value?.clasificacion_ia) }}
             </q-badge>
             <q-icon name="arrow_forward" size="xs" class="q-mr-sm" />
             <q-badge color="orange-2" text-color="orange-9">
                A: {{ formatClasificacion(log.raw.new_value?.clasificacion_ia) }}
             </q-badge>
          </div>
        </div>
      </q-timeline-entry>

      <q-timeline-entry
        v-if="logs.length === 0"
        title="Sin registros"
        subtitle="-"
        icon="info"
        color="grey-4"
      >
        <div>No hay eventos registrados en la auditoría.</div>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

const formatClasificacion = (val) => {
  const map = {
    'apto': 'Apto',
    'parcialmente_apto': 'Parcialmente Apto',
    'no_apto': 'No Apto'
  }
  return map[val] || val || 'Desconocido'
}

const formattedLogs = computed(() => {
  return props.logs.map(log => {
    let title = 'Evento Desconocido'
    let description = ''
    let color = 'primary'
    let icon = 'circle'
    
    // Parse time
    const dateObj = new Date(log.created_at)
    const timeStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})

    if (log.action === 'created' && log.auditable_type === 'ai_cv_analyses') {
      title = 'Análisis de CV Completado'
      description = `Documento procesado. Prompt Version: ${log.prompt_version || 'N/A'}`
      icon = 'document_scanner'
      color = 'purple-4'
    } 
    else if (log.action === 'created' && log.auditable_type === 'ai_matching_results') {
      title = 'Evaluación Determinística Generada'
      const score = log.new_value?.score_total || 0
      description = `Cálculo SISPO: Score ${score}%, ${formatClasificacion(log.new_value?.clasificacion_ia)}.`
      icon = 'calculate'
      color = 'indigo-5'
    }
    else if (log.action === 'overridden_by_human') {
      title = 'Intervención Humana (Override)'
      description = `Modificado por usuario humano (Auditoría de Control).`
      icon = 'gavel'
      color = 'orange-5'
    }
    else if (log.action === 'reanalyzed') {
      title = 'Re-análisis Forzado'
      description = 'Se solicitó una nueva evaluación completa del expediente.'
      icon = 'refresh'
      color = 'blue-5'
    }

    return {
      id: log.id,
      title,
      time: timeStr,
      description,
      color,
      icon,
      action: log.action,
      raw: log
    }
  })
})
</script>

<style scoped>
/* Ajustes menores si es necesario */
</style>
