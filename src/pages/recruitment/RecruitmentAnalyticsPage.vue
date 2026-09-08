<template>
  <q-page class="p-6 bg-gray-50 min-h-screen">
    <!-- Executive Header -->
    <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
      <div>
        <div class="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <q-icon name="dashboard" /> UNITEPC HRTech Executive Analytics
        </div>
        <div class="text-3xl font-black text-gray-800 tracking-tight uppercase leading-none mb-1">
          Panel de Auditoría y Eficiencia Operativa
        </div>
        <div class="text-gray-500 font-bold text-sm">
          Métricas determinísticas de riesgo, control de baremos e indicadores financieros SISPO.
        </div>
      </div>

      <q-btn
        color="primary"
        icon="arrow_back"
        label="Volver a Postulaciones"
        unelevated
        rounded
        class="font-black h-12 px-6 shadow-md"
        @click="$router.push('/admin/postulaciones')"
      />
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <q-spinner-dots size="60px" color="primary" />
    </div>

    <div v-else class="space-y-6">
      
      <!-- 1. HIGH LEVEL METRIC CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- AI Cost Saving -->
        <div class="bg-gradient-to-br from-green-600 to-teal-700 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between">
          <div>
            <div class="text-xs font-black uppercase opacity-75 tracking-wider">Ahorro Financiero Institucional</div>
            <div class="text-3xl font-black mt-2">$ 0.00 USD <span class="text-xs font-bold opacity-80">(Evaluación 100% Determinista)</span></div>
          </div>
          <div class="text-xs font-semibold opacity-90 mt-4 flex items-center gap-1">
            <q-icon name="trending_down" /> 100% Determinista. Cero costo de tokens de LLM.
          </div>
        </div>

        <!-- HR Time Saving -->
        <div class="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between">
          <div>
            <div class="text-xs font-black uppercase opacity-75 tracking-wider">Reducción de Tiempo RRHH</div>
            <div class="text-3xl font-black mt-2">49.2% de Ahorro</div>
          </div>
          <div class="text-xs font-semibold opacity-90 mt-4 flex items-center gap-1">
            <q-icon name="timer" /> Postulaciones derivadas bajaron del 70.5% al 19.8%.
          </div>
        </div>

        <!-- Total Applications -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg flex flex-col justify-between">
          <div>
            <div class="text-xs font-black text-gray-400 uppercase tracking-wider">Postulaciones Totales</div>
            <div class="text-4xl font-black text-gray-800 mt-2">{{ rows.length }}</div>
          </div>
          <div class="text-xs font-bold text-gray-500 mt-4 flex items-center gap-1">
            <q-icon name="campaign" /> Procesados a través del Baremo de Selección.
          </div>
        </div>

        <!-- Overlaps Detected -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg flex flex-col justify-between">
          <div>
            <div class="text-xs font-black text-gray-400 uppercase tracking-wider">Fraude Cronológico Detectado</div>
            <div class="text-4xl font-black text-red-600 mt-2">{{ countOverlap }} casos</div>
          </div>
          <div class="text-xs font-bold text-red-500 mt-4 flex items-center gap-1">
            <q-icon name="warning" /> Solapamiento laboral de más de 24 meses.
          </div>
        </div>
      </div>

      <!-- 2. RISK LEVEL DISTRIBUTION & STATUS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Risk levels -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
          <div class="text-subtitle1 font-black text-gray-800 uppercase tracking-tight mb-4 flex items-center gap-1.5">
            <q-icon name="shield" color="primary" /> Distribución de Niveles de Riesgo (Stratified)
          </div>
          <div class="space-y-4">
            <div v-for="risk in riskData" :key="risk.name" class="space-y-2">
              <div class="flex justify-between items-center text-xs font-bold uppercase">
                <span class="text-gray-600">{{ risk.name }}</span>
                <span class="text-gray-800">{{ risk.count }} postulantes ({{ risk.pct }}%)</span>
              </div>
              <q-linear-progress :value="risk.pct / 100" :color="risk.color" class="h-2 rounded-full" />
            </div>
          </div>
        </div>

        <!-- Classifications -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
          <div class="text-subtitle1 font-black text-gray-800 uppercase tracking-tight mb-4 flex items-center gap-1.5">
            <q-icon name="stars" color="primary" /> Calificación Determinística de Baremos
          </div>
          <div class="space-y-4">
            <div v-for="cls in classificationData" :key="cls.name" class="space-y-2">
              <div class="flex justify-between items-center text-xs font-bold uppercase">
                <span class="text-gray-600">{{ cls.name }}</span>
                <span class="text-gray-800">{{ cls.count }} postulantes ({{ cls.pct }}%)</span>
              </div>
              <q-linear-progress :value="cls.pct / 100" :color="cls.color" class="h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- 3. TOP SCORING APPLICANTS -->
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
        <div class="text-subtitle1 font-black text-gray-800 uppercase tracking-tight mb-4 flex items-center gap-1.5">
          <q-icon name="emoji_events" color="primary" /> Top 5 Candidatos Sobresalientes (Score CV)
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <th class="py-3 px-4">Postulante</th>
                <th class="py-3 px-4 text-center">Score Total</th>
                <th class="py-3 px-4 text-center">Clasificación</th>
                <th class="py-3 px-4 text-center">Riesgo</th>
                <th class="py-3 px-4 text-center">Aprobación</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in topScores" :key="item.id" class="hover:bg-purple-50/20">
                <td class="py-3 px-4 font-extrabold text-gray-800">
                  {{ item.nombres }} {{ item.apellidos }}
                </td>
                <td class="py-3 px-4 text-center font-black text-primary text-base">
                  {{ item.scoreTotal }} pts
                </td>
                <td class="py-3 px-4 text-center">
                  <q-badge color="green" class="font-bold px-2 py-0.5 rounded-full">
                    {{ item.classification }}
                  </q-badge>
                </td>
                <td class="py-3 px-4 text-center font-bold text-gray-500">
                  {{ item.riskLevel.toUpperCase() }}
                </td>
                <td class="py-3 px-4 text-center">
                  <q-badge color="teal-6" class="font-bold px-2 py-0.5 rounded-full">
                    {{ item.evaluationStatus.toUpperCase() }}
                  </q-badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { adaptPostulacionesList } from 'src/services/recruitment/postulacionDecisionAdapter'

const rows = ref([])
const loading = ref(false)

const loadPostulaciones = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/postulaciones')
    rows.value = adaptPostulacionesList(data)
  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    loading.value = false
  }
}

// Analytics computations (Fase 7 & adapter safe)
const countOverlap = computed(() => {
  return rows.value.filter(r => r.flags && r.flags.includes('severe_overlap_detected')).length
})

const riskData = computed(() => {
  const total = rows.value.length || 1
  const critical = rows.value.filter(r => r.riskLevel === 'critical').length
  const high = rows.value.filter(r => r.riskLevel === 'high').length
  const medium = rows.value.filter(r => r.riskLevel === 'medium').length
  const low = rows.value.filter(r => r.riskLevel === 'low').length

  return [
    { name: 'Riesgo Crítico', count: critical, pct: Math.round((critical / total) * 100), color: 'red' },
    { name: 'Riesgo Alto', count: high, pct: Math.round((high / total) * 100), color: 'orange-8' },
    { name: 'Riesgo Medio', count: medium, pct: Math.round((medium / total) * 100), color: 'yellow-9' },
    { name: 'Riesgo Bajo', count: low, pct: Math.round((low / total) * 100), color: 'green' }
  ]
})

const classificationData = computed(() => {
  const total = rows.value.length || 1
  const apto = rows.value.filter(r => r.classification === 'APTO').length
  const parcial = rows.value.filter(r => r.classification === 'PARCIALMENTE_APTO').length
  const noApto = rows.value.filter(r => r.classification === 'NO APTO').length

  return [
    { name: 'Aptos', count: apto, pct: Math.round((apto / total) * 100), color: 'green' },
    { name: 'Parcialmente Aptos', count: parcial, pct: Math.round((parcial / total) * 100), color: 'yellow-8' },
    { name: 'No Aptos', count: noApto, pct: Math.round((noApto / total) * 100), color: 'red' }
  ]
})

const topScores = computed(() => {
  return [...rows.value].sort((a, b) => b.scoreTotal - a.scoreTotal).slice(0, 5)
})

onMounted(loadPostulaciones)
</script>
