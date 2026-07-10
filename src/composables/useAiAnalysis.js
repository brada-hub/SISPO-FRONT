import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

export function useAiAnalysis() {
  const $q = useQuasar()
  const isLoading = ref(false)
  const analysisData = ref(null)
  const matchingData = ref(null)
  const auditLogs = ref([])

  /**
   * Request a new evaluation for a postulacion
   */
  const analyzeCV = async (postulacionId) => {
    isLoading.value = true
    try {
      const response = await api.post(`/evaluations/run/${postulacionId}`)
      $q.notify({
        color: 'positive',
        icon: 'check_circle',
        message: response.data.message || 'Evaluación automática completada.',
      })
      return true
    } catch (error) {
      $q.notify({
        color: 'negative',
        icon: 'error',
        message: error.response?.data?.message || 'Error al iniciar evaluación automática',
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch the existing evaluation results
   */
  const fetchAnalysis = async (postulacionId) => {
    try {
      const response = await api.get(`/evaluations/analysis/${postulacionId}`)
      if (response.data.success) {
        analysisData.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching evaluation:', error)
      }
      analysisData.value = null
    }
    return null
  }

  /**
   * Fetch the scoring results (scores, classification)
   */
  const fetchMatching = async (postulacionId) => {
    try {
      const response = await api.get(`/evaluations/matching/${postulacionId}`)
      if (response.data.success) {
        matchingData.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching scoring:', error)
      }
      matchingData.value = null
    }
    return null
  }

  /**
   * Fetch evaluation audit logs for the timeline
   */
  const fetchAuditLogs = async (postulacionId) => {
    try {
      const response = await api.get(`/evaluations/audit-log/${postulacionId}`)
      if (response.data.success) {
        auditLogs.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching evaluation audit logs:', error)
      auditLogs.value = []
    }
    return []
  }

  /**
   * Force a recalculation
   */
  const reanalyzeCV = async (postulacionId) => {
    isLoading.value = true
    try {
      const response = await api.post(`/evaluations/recalculate/${postulacionId}`)
      $q.notify({
        color: 'positive',
        icon: 'check_circle',
        message: response.data.message || 'Recálculo de evaluación completado.',
      })
      analysisData.value = null
      matchingData.value = null
      return true
    } catch (error) {
      $q.notify({
        color: 'negative',
        icon: 'error',
        message: error.response?.data?.message || 'Error al recalcular evaluación',
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Submit a human override of the calculated classification
   */
  const overrideClassification = async (matchingId, payload) => {
    isLoading.value = true
    try {
      const response = await api.post(`/evaluations/override/${matchingId}`, payload)
      $q.notify({
        color: 'positive',
        icon: 'gavel',
        message: response.data.message || 'Clasificación actualizada (Auditoría guardada)',
      })
      // Update local state
      if (matchingData.value && matchingData.value.id === matchingId) {
        matchingData.value = response.data.data
      }
      return true
    } catch (error) {
      $q.notify({
        color: 'negative',
        icon: 'error',
        message: error.response?.data?.message || 'Error al modificar clasificación',
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
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
  }
}
