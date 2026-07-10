<template>
  <div class="ai-panel-wrapper q-pa-md">
    
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h6 text-primary flex items-center">
          <q-icon name="analytics" size="md" class="q-mr-sm" color="primary" />
          Evaluación Determinística (SISPO)
        </div>
        <div class="text-caption text-grey-7">Evaluación matemática y determinista de perfil vs requisitos.</div>
      </div>
      
      <div>
        <q-btn
          v-if="!analysisData && !isLoading"
          color="primary"
          icon="calculate"
          label="Evaluar automáticamente"
          unelevated
          @click="handleAnalyze"
        />
        <q-btn
          v-if="analysisData && !isLoading"
          color="grey-7"
          flat
          icon="refresh"
          label="Recalcular evaluación"
          size="sm"
          @click="handleReanalyze"
        />
      </div>
    </div>

    <!-- SKELETON LOADER -->
    <AiSkeletonLoader v-if="isLoading" />

    <!-- NO DATA YET -->
    <div v-else-if="!analysisData" class="flex flex-center q-pa-xl bg-grey-1 rounded-borders dashed-border">
      <div class="text-center">
        <q-icon name="document_scanner" size="4xl" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">Aún no hay evaluación del sistema</div>
        <div class="text-body2 text-grey-6">Haz clic en "Evaluar automáticamente" para que el Score Engine evalúe al candidato.</div>
      </div>
    </div>

    <!-- AI DASHBOARD (DATA EXISTS) -->
    <div v-else class="row q-col-gutter-lg">
      
      <!-- LEFT COLUMN: Score & Radar -->
      <div class="col-12 col-md-5">
        <!-- Main Score Card -->
        <q-card class="score-card no-shadow bg-primary text-white q-mb-md">
          <q-card-section class="text-center q-py-xl relative-position">
             <div class="text-overline text-white opacity-80">Compatibilidad Global</div>
             <div class="text-h2 text-weight-bolder q-my-sm">
                {{ matchingData?.score_total || 0 }}<span class="text-h4">%</span>
             </div>
             
             <div class="q-mt-md bg-white q-pa-xs rounded-borders inline-block">
               <AiScoreBadge :clasificacion="matchingData?.clasificacion_ia || 'no_apto'" />
             </div>

             <!-- Override Button -->
             <div class="absolute-top-right q-pa-sm">
                <q-btn 
                  flat round dense icon="gavel" color="white" 
                  @click="showOverrideDialog = true"
                  title="Auditoría: Cambiar Clasificación"
                />
             </div>
          </q-card-section>
        </q-card>

        <AiRadarChart :scores="matchingData || {}" />
      </div>

      <!-- RIGHT COLUMN: Observations & Details -->
      <div class="col-12 col-md-7">
        <AiObservationsCard 
          class="q-mb-md"
          :observaciones="matchingData?.observaciones_ia"
          :fortalezas="matchingData?.fortalezas"
          :debilidades="matchingData?.debilidades"
        />

        <q-card class="no-shadow bg-grey-1 bordered">
          <q-card-section>
             <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-sm">Datos Extraídos del CV</div>
             <div class="row q-col-gutter-sm">
               <div class="col-6">
                 <div class="text-caption text-grey-6">Nivel Académico:</div>
                 <div class="text-body2 text-weight-medium">{{ analysisData?.nivel_academico || 'No detectado' }}</div>
               </div>
               <div class="col-6">
                 <div class="text-caption text-grey-6">Años Experiencia:</div>
                 <div class="text-body2 text-weight-medium">{{ analysisData?.anios_experiencia || 0 }} años</div>
               </div>
               <div class="col-12">
                 <div class="text-caption text-grey-6">Habilidades Clave:</div>
                 <div class="q-gutter-xs q-mt-xs">
                    <q-badge 
                      v-for="(skill, i) in (analysisData?.habilidades || [])" 
                      :key="i" 
                      color="indigo-1" 
                      text-color="indigo-8"
                    >
                      {{ skill }}
                    </q-badge>
                 </div>
               </div>
             </div>
          </q-card-section>
        </q-card>

        <div class="q-mt-lg">
          <AiAuditTimeline :logs="auditLogs" />
        </div>
      </div>
    </div>

    <AiHumanOverrideDialog 
      v-model="showOverrideDialog"
      :current-clasificacion="matchingData?.clasificacion_ia"
      :loading="isSubmittingOverride"
      @submit="handleOverride"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAiAnalysis } from '../../composables/useAiAnalysis'

// Components
import AiSkeletonLoader from './AiSkeletonLoader.vue'
import AiScoreBadge from './AiScoreBadge.vue'
import AiRadarChart from './AiRadarChart.vue'
import AiObservationsCard from './AiObservationsCard.vue'
import AiHumanOverrideDialog from './AiHumanOverrideDialog.vue'
import AiAuditTimeline from './AiAuditTimeline.vue'

const props = defineProps({
  postulacionId: {
    type: [Number, String],
    required: true
  }
})

const { 
  isLoading, 
  analysisData, 
  matchingData, 
  auditLogs,
  analyzeCV, 
  fetchAnalysis, 
  fetchMatching,
  fetchAuditLogs,
  reanalyzeCV,
  overrideClassification
} = useAiAnalysis()

const showOverrideDialog = ref(false)
const isSubmittingOverride = ref(false)

const loadData = async () => {
  if (!props.postulacionId) return
  isLoading.value = true
  await fetchAnalysis(props.postulacionId)
  if (analysisData.value) {
    await fetchMatching(props.postulacionId)
    await fetchAuditLogs(props.postulacionId)
  } else {
    matchingData.value = null
    auditLogs.value = []
  }
  isLoading.value = false
}

const handleAnalyze = async () => {
  const success = await analyzeCV(props.postulacionId)
  if (success) {
    await loadData()
  }
}

const handleReanalyze = async () => {
  const success = await reanalyzeCV(props.postulacionId)
  if (success) {
    await loadData()
  }
}

const handleOverride = async (payload) => {
  isSubmittingOverride.value = true
  const success = await overrideClassification(matchingData.value.id, payload)
  if (success) {
    showOverrideDialog.value = false
    await fetchAuditLogs(props.postulacionId) // refresh timeline
  }
  isSubmittingOverride.value = false
}

watch(() => props.postulacionId, loadData, { immediate: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashed-border {
  border: 2px dashed #cbd5e1;
}
.score-card {
  border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
}
.opacity-80 {
  opacity: 0.8;
}
.bordered {
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
}
</style>
