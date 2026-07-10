<template>
  <q-banner rounded class="bg-indigo-1 text-indigo-10 q-mb-md shadow-1" style="border: 1px solid #c7d2fe;">
    <template v-slot:avatar>
      <q-icon name="auto_awesome" color="indigo-7" size="lg" />
    </template>
    
    <div class="text-subtitle1 text-weight-bold">
      Evaluación Automática Masiva
    </div>
    <div class="text-body2">
      Puedes procesar todos los CVs de esta convocatoria de forma automática. El sistema generará un ranking de compatibilidad para acelerar la revisión manual.
    </div>
    
    <template v-slot:action>
      <q-btn 
        flat 
        color="indigo-9" 
        label="Lanzar Evaluación Masiva" 
        icon="play_circle_filled"
        :loading="isLoading"
        @click="onBatchAnalyze"
      />
    </template>
  </q-banner>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const props = defineProps({
  convocatoriaId: {
    type: [Number, String],
    required: true
  }
})

const $q = useQuasar()
const isLoading = ref(false)

const onBatchAnalyze = async () => {
  $q.dialog({
    title: 'Confirmar Evaluación Masiva',
    message: 'Esto iniciará la evaluación matemática automática para todos los postulantes de esta convocatoria que aún no hayan sido evaluados. Este proceso tomará unos momentos. ¿Deseas continuar?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    isLoading.value = true
    try {
      const response = await api.post(`/evaluations/batch-run/${props.convocatoriaId}`)
      $q.notify({
        color: 'positive',
        icon: 'check_circle',
        message: response.data.message || 'Evaluación masiva enviada a la cola'
      })
    } catch (error) {
      $q.notify({
        color: 'negative',
        icon: 'error',
        message: error.response?.data?.message || 'Error al iniciar evaluación masiva'
      })
    } finally {
      isLoading.value = false
    }
  })
}
</script>
