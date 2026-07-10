<template>
  <q-drawer
    v-model="isOpen"
    side="right"
    overlay
    behavior="mobile"
    :width="550"
    bordered
    class="bg-gray-50 flex flex-col no-wrap"
  >
    <!-- Drawer Header -->
    <div class="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-md relative">
      <div class="absolute top-4 right-4">
        <q-btn flat round dense icon="close" color="white" @click="isOpen = false" />
      </div>

      <div class="text-[10px] font-black bg-white/20 inline-block px-2.5 py-1 rounded-md mb-2 backdrop-blur-sm uppercase tracking-widest">
        Expediente Técnico SISPO
      </div>
      <div class="text-2xl font-black uppercase tracking-tight leading-none mb-1">
        {{ postulante?.nombres }} {{ postulante?.apellidos }}
      </div>
      <div class="text-xs font-semibold opacity-90">
        CI: {{ postulante?.ci }} | Convocatoria: {{ postulante?.convocatoriaTitle }}
      </div>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      
      <!-- 1. GENERAL METRICS STRATIFIED -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Score Card -->
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Puntaje Evaluado</div>
          <div class="text-3xl font-black text-primary">{{ postulante?.scoreTotal }} <span class="text-xs font-semibold text-gray-400">/100</span></div>
          <q-badge :color="getClassBadge(postulante?.classification).color" class="mt-2 font-bold px-2 py-0.5 rounded-full">
            {{ getClassBadge(postulante?.classification).label }}
          </q-badge>
        </div>

        <!-- Risk Card -->
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nivel de Riesgo</div>
          <div class="text-2xl font-black" :class="getRiskBadge(postulante?.riskLevel).textColor">
            {{ getRiskBadge(postulante?.riskLevel).label }}
          </div>
          <q-badge :color="getRiskBadge(postulante?.riskLevel).color" class="mt-2 font-bold px-2.5 py-0.5 rounded-full">
            {{ postulante?.riskScore }}% score de riesgo
          </q-badge>
        </div>
      </div>

      <!-- 2. EVALUATION STATUS BANNER -->
      <div class="p-4 rounded-xl border flex items-center justify-between shadow-sm" :class="getStatusBanner(postulante?.evaluationStatus).bgClass">
        <div class="flex items-center gap-3">
          <q-icon :name="getStatusBanner(postulante?.evaluationStatus).icon" :color="getStatusBanner(postulante?.evaluationStatus).iconColor" size="md" />
          <div>
            <div class="text-[10px] font-black uppercase tracking-widest" :class="getStatusBanner(postulante?.evaluationStatus).textColor">
              Estado de la Aprobación
            </div>
            <div class="text-sm font-black text-gray-800 uppercase">
              {{ getStatusBanner(postulante?.evaluationStatus).label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 3. RISK FLAGS SECTION -->
      <div v-if="postulante?.flags && postulante.flags.length > 0" class="space-y-3">
        <div class="text-xs font-black text-gray-400 uppercase tracking-widest">Alertas de Auditoría Interna</div>
        <div 
          v-for="flag in postulante.flags" 
          :key="flag" 
          class="p-3.5 rounded-xl border flex items-start gap-3 shadow-inner"
          :class="getFlagStyle(flag).bgClass"
        >
          <q-icon :name="getFlagStyle(flag).icon" :color="getFlagStyle(flag).iconColor" size="sm" class="mt-0.5" />
          <div>
            <div class="font-extrabold text-[13px] text-gray-800 uppercase leading-none mb-1">
              {{ getFlagStyle(flag).label }}
            </div>
            <div class="text-xs text-gray-500 font-semibold leading-tight">
              {{ postulante.reasonSummary }}
            </div>
          </div>
        </div>
      </div>

      <!-- 4. EXPERIENCE TIMELINE -->
      <ExperienceTimeline 
        v-if="postulante"
        :experiences="postulante.experiences || []" 
        :summary="postulante.experienceSummary" 
      />

      <!-- 5. MATHEMATICAL BREAKDOWN (CRITERIA SCORING) -->
      <div class="space-y-4">
        <div class="text-xs font-black text-gray-400 uppercase tracking-widest">Desglose de Puntajes por Criterio</div>
        <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-md space-y-4">
          <div 
            v-for="(crit, key) in criteriaBreakdown" 
            :key="key" 
            class="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
          >
            <div class="flex justify-between items-center mb-1">
              <span class="font-extrabold text-gray-800 text-[13px] uppercase">{{ crit.name }}</span>
              <span class="font-black text-primary text-[14px]">
                {{ crit.score }} <span class="text-xs text-gray-400">/ {{ crit.max }} pts</span>
              </span>
            </div>
            
            <!-- Progress bar -->
            <q-linear-progress 
              :value="crit.max > 0 ? (crit.score / crit.max) : 0" 
              color="primary" 
              class="rounded-full h-1.5 mb-2"
            />
            
            <div class="text-[11px] text-gray-500 font-semibold italic">
              {{ crit.detail || 'Cumple con los requisitos mínimos del criterio.' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 6. TRAINING & EDUCATION SUMMARY -->
      <div class="space-y-4">
        <div class="text-xs font-black text-gray-400 uppercase tracking-widest">Méritos Académicos & Cursos</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Max Education -->
          <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
            <q-icon name="school" color="primary" size="sm" />
            <div>
              <div class="text-[9px] font-black text-gray-400 uppercase">Grado Académico</div>
              <div class="text-xs font-extrabold text-gray-700 uppercase truncate max-w-[170px]">
                {{ postulante?.highestLevel || 'LICENCIATURA' }}
              </div>
            </div>
          </div>

          <!-- Training hours -->
          <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
            <q-icon name="history_edu" color="primary" size="sm" />
            <div>
              <div class="text-[9px] font-black text-gray-400 uppercase">Cursos 5 Años</div>
              <div class="text-xs font-extrabold text-gray-700 uppercase">
                {{ postulante?.trainingSummary?.accumulated_hours_last_5_years || 0 }} horas
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. OPERATIONAL RRHH ACTIONS -->
      <div class="pt-6 border-t border-gray-100 space-y-3">
        <div class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Acciones de Selección (Auditoría)</div>
        
        <!-- Manual comment -->
        <q-input
          v-model="manualComment"
          outlined
          type="textarea"
          rows="2"
          label="Observaciones de auditoría manual..."
          class="bg-white rounded-xl shadow-sm text-xs"
        />

        <div class="row q-col-gutter-sm">
          <!-- Manual Approve -->
          <div class="col-6">
            <q-btn
              label="APROBAR CV"
              icon="check_circle"
              color="green-7"
              unelevated
              rounded
              class="w-full font-black text-xs py-3"
              :loading="updating"
              @click="submitDecision('manually_approved')"
            />
          </div>
          
          <!-- Manual Reject -->
          <div class="col-6">
            <q-btn
              label="RECHAZAR CV"
              icon="cancel"
              color="red-9"
              unelevated
              rounded
              class="w-full font-black text-xs py-3"
              :loading="updating"
              @click="submitDecision('manually_rejected')"
            />
          </div>
        </div>
      </div>

    </div>
  </q-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import ExperienceTimeline from './ExperienceTimeline.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  postulante: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'status-updated'])

const $q = useQuasar()
const manualComment = ref('')
const updating = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Initialize manual comment
watch(() => props.postulante, (newVal) => {
  if (newVal) {
    manualComment.value = newVal.reasonSummary || ''
  }
}, { immediate: true })

// Build dynamic criteria list from score_breakdown_json (Fase 3 & Adapter safe)
const criteriaBreakdown = computed(() => {
  const bd = props.postulante?.breakdown || {}
  
  const mapping = [
    { key: 'academic_formation', name: 'Formación Académica' },
    { key: 'postgraduate', name: 'Formación de Postgrado' },
    { key: 'professional_experience', name: 'Experiencia Profesional' },
    { key: 'teaching_experience', name: 'Experiencia Docente' },
    { key: 'training', name: 'Capacitación y Cursos' },
    { key: 'intellectual_production', name: 'Producción Intelectual' },
    { key: 'recognitions', name: 'Reconocimientos' }
  ]

  return mapping.map(item => {
    const data = bd[item.key] || {}
    return {
      name: item.name,
      score: data.score !== undefined ? Number(data.score) : 0,
      max: data.max_points !== undefined ? Number(data.max_points) : 5,
      detail: data.detail || 'Cumple de manera regular con los requisitos.'
    }
  })
})

// Submit operational action (Fase 4 - POST with complete notifies and refresh)
const submitDecision = async (status) => {
  if (!props.postulante?.id) return;
  
  updating.value = true
  try {
    const payload = {
      evaluation_status: status,
      manual_comment: manualComment.value
    }
    
    // API endpoint configured in api.php Sanctum group
    await api.post(`/admin/postulaciones/${props.postulante.id}/update-status`, payload)
    
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `Auditoría finalizada: CV ${status === 'manually_approved' ? 'Aprobado' : 'Rechazado'} con éxito.`
    })
    
    emit('status-updated')
    isOpen.value = false
  } catch (error) {
    console.error(error)
    
    let errMsg = 'Error al registrar la decisión de Recursos Humanos.'
    if (error.response?.data?.message) {
      errMsg = error.response.data.message
    }
    
    $q.notify({
      type: 'negative',
      icon: 'warning',
      message: errMsg
    })
  } finally {
    updating.value = false
  }
}

// Helpers
const getClassBadge = (classification) => {
  switch (classification) {
    case 'APTO':
      return { label: 'APTO', color: 'green-7' }
    case 'PARCIALMENTE_APTO':
      return { label: 'PARCIALMENTE APTO', color: 'warning' }
    default:
      return { label: 'NO APTO', color: 'red' }
  }
}

const getRiskBadge = (level) => {
  switch (level) {
    case 'low':
      return { label: 'RIESGO BAJO', color: 'green-1', textColor: 'text-green-8' }
    case 'medium':
      return { label: 'RIESGO MEDIO', color: 'yellow-1', textColor: 'text-yellow-9' }
    case 'high':
      return { label: 'RIESGO ALTO', color: 'orange-1', textColor: 'text-orange-9' }
    case 'critical':
      return { label: 'CRÍTICO', color: 'red-1', textColor: 'text-red-9' }
    default:
      return { label: 'SIN RIESGO', color: 'grey-1', textColor: 'text-grey-7' }
  }
}

const getStatusBanner = (status) => {
  switch (status) {
    case 'auto_approved':
      return { label: 'APROBADO AUTOMÁTICAMENTE', icon: 'verified', iconColor: 'teal', bgClass: 'bg-teal-50 border-teal-200', textColor: 'text-teal-500' }
    case 'requires_human_review':
      return { label: 'REQUIERE REVISIÓN RRHH', icon: 'flaky', iconColor: 'deep-orange', bgClass: 'bg-deep-orange-50 border-deep-orange-200', textColor: 'text-deep-orange-500' }
    case 'manually_approved':
      return { label: 'APROBADO POR RRHH', icon: 'offline_pin', iconColor: 'purple', bgClass: 'bg-purple-50 border-purple-200', textColor: 'text-purple-500' }
    case 'manually_rejected':
      return { label: 'RECHAZADO POR RRHH', icon: 'highlight_off', iconColor: 'red', bgClass: 'bg-red-50 border-red-200', textColor: 'text-red-500' }
    default:
      return { label: 'EVALUADO', icon: 'rule', iconColor: 'indigo', bgClass: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-500' }
  }
}

const getFlagStyle = (flag) => {
  switch (flag) {
    case 'severe_overlap_detected':
      return { label: 'Solapamiento Laboral Extremo', icon: 'gavel', iconColor: 'red-9', bgClass: 'bg-red-50/55 border-red-100' }
    case 'academic_match_uncertain':
      return { label: 'Incertidumbre Académica', icon: 'domain_verification', iconColor: 'orange-9', bgClass: 'bg-orange-50/55 border-orange-100' }
    case 'score_gray_zone':
      return { label: 'CV en Zona Gris de Selección', icon: 'flaky', iconColor: 'yellow-9', bgClass: 'bg-yellow-50/55 border-yellow-100' }
    default:
      return { label: 'Anomalía Semántica', icon: 'report_problem', iconColor: 'grey-9', bgClass: 'bg-gray-100 border-gray-200' }
  }
}
</script>
