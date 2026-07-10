<template>
  <div class="radar-container q-pa-md bg-white rounded-borders shadow-1">
    <div class="text-subtitle2 text-weight-bold q-mb-sm text-primary flex items-center">
      <q-icon name="insights" size="xs" class="q-mr-xs" />
      Perfil de Competencias
    </div>

    <div v-if="!isEvaluated" class="flex flex-center text-grey-6 q-pa-lg text-center" style="min-height: 200px;">
      <div>
        <q-icon name="report_problem" size="md" class="text-grey-5 q-mb-xs" />
        <div class="text-caption text-weight-medium">Sin evaluación</div>
        <div class="text-caption text-grey-5">Presione "Evaluar" para generar puntajes.</div>
      </div>
    </div>

    <apexchart
      v-else
      type="radar"
      :height="radarHeight"
      width="100%"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import apexchart from 'vue3-apexcharts'

const props = defineProps({
  scores: {
    type: Object,
    required: true,
  }
})

const radarHeight = computed(() => 280)

const isEvaluated = computed(() => {
  return !!props.scores?.postulacion_id || !!props.scores?.score_total
})

/**
 * Extract score breakdown from multiple possible locations:
 * 1. evaluacion.score_breakdown (Score Engine direct)
 * 2. cvAnalysis.ai_response.score_breakdown_json (legacy AI)
 * 3. Direct score_* fields on the scores object
 */
const breakdown = computed(() => {
  // Try Score Engine format first (from evaluacion)
  let bd = props.scores?.score_breakdown
  if (bd) {
    if (typeof bd === 'string') {
      try { bd = JSON.parse(bd) } catch { bd = null }
    }
    if (bd) return bd
  }

  // Try legacy AI format
  if (props.scores?.cvAnalysis?.ai_response) {
    let res = props.scores.cvAnalysis.ai_response
    if (typeof res === 'string') {
      try { res = JSON.parse(res) } catch { /* noop */ }
    }
    let sbd = res?.score_breakdown_json
    if (typeof sbd === 'string') {
      try { sbd = JSON.parse(sbd) } catch { /* noop */ }
    }
    if (sbd) return sbd
  }

  return null
})

const normalizedDimensions = computed(() => {
  const bd = breakdown.value

  const getPercentage = (points, max) => {
    const p = parseFloat(points)
    const m = parseFloat(max)
    if (!Number.isFinite(p) || !Number.isFinite(m) || m <= 0) return 0
    return Math.min(100, Math.max(0, Math.round((p / m) * 100)))
  }

  // Try breakdown object keys (Score Engine format uses category keys)
  if (bd) {
    return {
      academic: getPercentage(bd.academic_formation?.score ?? bd.formacion_academica?.score ?? 0, bd.academic_formation?.max_points ?? bd.formacion_academica?.max_points ?? 25),
      professional: getPercentage(bd.professional_experience?.score ?? bd.experiencia_profesional?.score ?? 0, bd.professional_experience?.max_points ?? bd.experiencia_profesional?.max_points ?? 30),
      teaching: getPercentage(bd.teaching_experience?.score ?? bd.experiencia_docencia?.score ?? 0, bd.teaching_experience?.max_points ?? bd.experiencia_docencia?.max_points ?? 15),
      postgrad: getPercentage(bd.postgraduate?.score ?? bd.postgrado?.score ?? 0, bd.postgraduate?.max_points ?? bd.postgrado?.max_points ?? 15),
      training: getPercentage(bd.training?.score ?? bd.capacitacion?.score ?? 0, bd.training?.max_points ?? bd.capacitacion?.max_points ?? 5),
      publications: getPercentage(bd.intellectual_production?.score ?? bd.produccion_intelectual?.score ?? 0, bd.intellectual_production?.max_points ?? bd.produccion_intelectual?.max_points ?? 5),
      recognitions: getPercentage(bd.recognitions?.score ?? bd.reconocimientos?.score ?? 0, bd.recognitions?.max_points ?? bd.reconocimientos?.max_points ?? 5)
    }
  }

  // Fallback: direct score_* fields
  return {
    academic: getPercentage(props.scores?.score_formacion ?? 0, 25),
    professional: getPercentage(props.scores?.score_experiencia ?? 0, 30),
    teaching: getPercentage(props.scores?.score_docencia ?? 0, 15),
    postgrad: getPercentage(props.scores?.score_postgrado ?? 0, 15),
    training: getPercentage(props.scores?.score_capacitacion ?? 0, 5),
    publications: getPercentage(props.scores?.score_produccion ?? 0, 5),
    recognitions: getPercentage(props.scores?.score_reconocimiento ?? 0, 5)
  }
})

const series = computed(() => {
  const d = normalizedDimensions.value
  return [{
    name: 'Puntuación (%)',
    data: [
      d.academic,
      d.professional,
      d.teaching,
      d.postgrad,
      d.training,
      d.publications,
      d.recognitions
    ]
  }]
})

const chartOptions = computed(() => {
  return {
    chart: {
      type: 'radar',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 600,
      }
    },
    labels: [
      'Formación',
      'Exp. Profesional',
      'Exp. Docencia',
      'Postgrado',
      'Capacitación',
      'Producción Int.',
      'Reconocimientos'
    ],
    stroke: {
      width: 2,
      colors: ['#6366f1']
    },
    fill: {
      opacity: 0.15,
      colors: ['#6366f1']
    },
    markers: {
      size: 3,
      colors: ['#fff'],
      strokeColors: '#6366f1',
      strokeWidth: 2,
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        show: true,
        style: { fontSize: '9px', colors: ['#94a3b8'] },
        formatter: (val) => val.toFixed(0)
      }
    },
    xaxis: {
      labels: {
        style: {
          fontSize: '9px',
          fontWeight: 700,
          colors: ['#475569','#475569','#475569','#475569','#475569','#475569','#475569']
        }
      }
    },
    plotOptions: {
      radar: {
        size: undefined,
        polygons: {
          strokeColors: '#e2e8f0',
          connectorColors: '#e2e8f0',
          fill: {
            colors: ['#f8fafc', '#fff']
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value + " %";
        }
      }
    }
  }
})
</script>

<style scoped>
.radar-container {
  min-height: 280px;
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
}
</style>
