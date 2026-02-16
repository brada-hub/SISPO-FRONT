<template>
  <q-page class="portal-root min-h-screen">
    <!-- BACKGROUND PATTERN -->
    <div class="portal-bg-pattern"></div>

    <!-- HEADER SECTION -->
    <header class="portal-header shadow-lg relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#4a2371] via-[#2c4e91] to-[#009b9b]"></div>

      <!-- DECORATIVE ELEMENTS -->
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent"></div>
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 py-12 px-6 max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="text-center md:text-left">
            <div class="flex items-center gap-3 mb-4 justify-center md:justify-start">
               <q-icon name="verified" color="teal-3" size="sm" class="opacity-80" />
               <span class="text-white/60 text-[10px] font-black uppercase tracking-[.3em]">Proceso Oficial</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
              Formulario de <span class="text-teal-300">Postulación</span>
            </h1>
            <p class="text-white/70 font-bold max-w-xl text-sm leading-relaxed">
              Complete la información requerida de manera clara y precisa para participar en nuestras convocatorias vigentes.
            </p>
          </div>

          <div class="hidden lg:flex glass-info-card p-6 rounded-3xl border border-white/20 backdrop-blur-xl items-center gap-5 shadow-2xl">
            <div class="p-4 bg-teal-400/20 rounded-2xl shadow-inner">
              <q-icon name="auto_awesome" color="teal-2" size="md" />
            </div>
            <div class="text-white">
              <div class="font-black text-lg leading-tight">Talento UNITEPC</div>
              <div class="text-[10px] text-teal-200/60 font-medium uppercase tracking-widest mt-1">Convocatoria de Personal</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- PROGRESS STEPPER -->
    <main class="relative z-10 w-full bg-white min-h-[calc(100vh-200px)] pb-20">
      <div class="glass-stepper-container w-full border-t border-gray-200">
        <q-stepper
          v-model="currentStep"
          flat
          animated
          alternative-labels
          color="primary"
          active-color="primary"
          done-color="teal-7"
          class="bg-transparent"
        >
          <q-step :name="1" title="Cargos" icon="map" :done="currentStep > 1">
            <template v-slot:caption>Sedes y puestos</template>
            <StepSeleccionCargo @next="goToStep2" />
          </q-step>

          <q-step :name="2" title="Datos" icon="person" :done="currentStep > 2" :disable="!hayCargosSeleccionados">
            <template v-slot:caption>Información base</template>
            <StepDatosPersonales @next="goToStep3" @back="currentStep = 1" />
          </q-step>

          <q-step :name="3" title="Documentos" icon="folder_special" :done="currentStep > 3" :disable="!hayCargosSeleccionados">
            <template v-slot:caption>Mértitos y títulos</template>
            <StepDocumentacion @next="goToStep4" @back="currentStep = 2" />
          </q-step>

          <q-step :name="4" title="Finalizar" icon="verified" :disable="!hayCargosSeleccionados">
            <template v-slot:caption>Revisión final</template>
            <StepConfirmacion @back="currentStep = 3" @submit="handleSubmit" />
          </q-step>
        </q-stepper>
      </div>
    </main>

    <!-- SUCCESS DIALOG -->
    <q-dialog v-model="showSuccess" persistent transition-show="scale" transition-hide="scale">
      <q-card class="success-card shadow-24 overflow-hidden" style="min-width: 500px; border-radius: 28px;">
        <q-card-section class="success-header relative bg-gradient-to-br from-teal-500 to-[#663399] text-white flex flex-col items-center justify-center py-10">
          <div class="check-circle-anim bg-white rounded-full p-4 shadow-2xl mb-4">
             <q-icon name="check" color="teal" size="60px" />
          </div>
          <div class="text-2xl font-black uppercase tracking-widest">¡Postulación Exitosa!</div>
          <div class="text-white/80 text-xs mt-1">TU EXPEDIENTE HA SIDO REGISTRADO</div>
        </q-card-section>

        <q-card-section class="q-pa-xl text-center">
          <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Código de Seguimiento Oficial</p>
          <div class="relative inline-block">
             <div class="absolute -inset-4 bg-primary/5 blur-xl rounded-full"></div>
             <div class="relative bg-gray-50 border-2 border-dashed border-primary/20 p-6 rounded-2xl">
                <div class="text-4xl font-black text-primary tracking-tighter">{{ codigoSeguimiento }}</div>
             </div>
          </div>

          <div class="mt-8 grid grid-cols-2 gap-4">
             <div class="p-4 bg-gray-50 rounded-2xl border flex flex-col items-center">
                <span class="text-2xl font-black text-gray-700">{{ cantidadCargos }}</span>
                <span class="text-[10px] uppercase font-bold text-gray-400">Puestos</span>
             </div>
             <div class="p-4 bg-gray-50 rounded-2xl border flex flex-col items-center">
                <span class="text-2xl font-black text-teal-600">CERT</span>
                <span class="text-[10px] uppercase font-bold text-gray-400">Estado</span>
             </div>
          </div>
          <p class="text-gray-400 text-xs mt-8 px-6 italic">Guarda este código para futuras consultas del estado de tu postulación.</p>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-xl px-12 gap-4">
          <q-btn outline label="Ir al Inicio" color="grey-8" class="flex-grow rounded-xl h-14" to="/" />
          <q-btn unelevated label="Nueva Postulación" color="primary" class="flex-grow rounded-xl h-14 font-bold" @click="resetAndStart" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- BUSY OVERLAY -->
    <q-inner-loading :showing="store.submitting" class="z-max" style="backdrop-filter: blur(4px); background: rgba(255,255,255,0.7)">
      <q-spinner-dots size="80px" color="primary" />
      <div class="text-primary font-black mt-4 uppercase tracking-tighter">Procesando Postulación...</div>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import { useQuasar } from 'quasar'
import StepSeleccionCargo from 'components/postulacion/StepSeleccionCargo.vue'
import StepDatosPersonales from 'components/postulacion/StepDatosPersonales.vue'
import StepDocumentacion from 'components/postulacion/StepDocumentacion.vue'
import StepConfirmacion from 'components/postulacion/StepConfirmacion.vue'

import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()
const store = usePostulacionStore()

const currentStep = computed({
  get: () => store.currentStep,
  set: (val) => { store.currentStep = val }
})

const hayCargosSeleccionados = computed(() => store.hayCargosSeleccionados)

const showSuccess = ref(false)
const codigoSeguimiento = ref('')
const cantidadCargos = ref(0)

onMounted(async () => {
  store.resetPostulacion()
  await store.fetchOfertasActivas()

  // Si viene con un ID de convocatoria por parámetro, autoseleccionamos todo lo relacionado
  const convId = route.query.convocatoria
  if (convId) {
    await store.autoSelectConvocatoria(convId)
  }
})

const goToStep2 = () => {
  if (!store.hayCargosSeleccionados) {
    $q.notify({
      type: 'warning',
      message: 'Debes seleccionar al menos un cargo para continuar',
      position: 'top',
    })
    return
  }
  currentStep.value = 2
}

const goToStep3 = async () => {
  await store.fetchRequisitosUnificados()
  currentStep.value = 3
}

const goToStep4 = () => {
  currentStep.value = 4
}

const handleSubmit = async () => {
  try {
    const result = await store.submitPostulacion()
    codigoSeguimiento.value = result.data.codigo_seguimiento
    cantidadCargos.value = result.data.cantidad_cargos || 1
    showSuccess.value = true

    $q.notify({
      type: 'positive',
      message: 'Postulación enviada correctamente',
      position: 'top'
    })
  } catch (error) {
    console.error('Submission technical details:', error)

    if (error.type === 'validation' && error.details) {
      // Formatear errores de validación de Laravel de forma amigable
      const errorList = Object.entries(error.details)
        .map(([field, messages]) => {
          // Limpiar el nombre del campo (ej: meritos.0.respuestas.nombre -> nombre)
          const fieldParts = field.split('.')
          const rawName = fieldParts[fieldParts.length - 1]
          const humanName = rawName.replace('_', ' ').toUpperCase()
          return `<li><b>${humanName}:</b> ${messages.join('. ')}</li>`
        })
        .join('')

      $q.dialog({
        title: '<div class="text-negative flex items-center gap-2"><q-icon name="report_problem" size="sm" /> Errores de Validación</div>',
        message: `Se encontraron algunos problemas en su información:<br><ul class="q-mt-sm" style="list-style: disc; padding-left: 20px;">${errorList}</ul>`,
        html: true,
        ok: { color: 'primary', label: 'Corregir ahora', flat: true },
        class: 'rounded-2xl'
      })
    } else {
      // Error general o mensaje directo del backend (ej: "Usted ya tiene una postulación...")
      $q.notify({
        type: 'negative',
        message: error.message || 'Error inesperado al enviar la postulación. Intente de nuevo.',
        position: 'top',
        timeout: 15000,
        actions: [{ icon: 'close', color: 'white', round: true }]
      })
    }
  }
}

const resetAndStart = () => {
  showSuccess.value = false
  store.resetPostulacion()
  store.fetchOfertasActivas()
}
</script>

<style scoped>
.portal-root {
  background-color: #f1f5f9;
}

.portal-bg-pattern {
  position: fixed;
  inset: 0;
  opacity: 0.04;
  background-image: radial-gradient(#663399 1px, transparent 1px);
  background-size: 30px_30px;
  pointer-events: none;
}

.portal-header {
  border-radius: 0;
}

.logo-animation {
  filter: drop-shadow(0 0 8px rgba(255,255,255,0.15));
}

.glass-info-card {
  background: rgba(255, 255, 255, 0.08);
  max-width: 320px;
}

.glass-stepper-container {
  /* Sombre sutil */
  box-shadow: 0 -5px 20px rgba(0,0,0,0.02);
}

:deep(.q-stepper) {
  width: 100%;
}

:deep(.q-stepper__header) {
  padding: 20px 40px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.q-stepper__tab--active) {
  color: #663399 !important;
  font-weight: 800;
}

:deep(.q-stepper__step-inner) {
  padding: 0;
}

.check-circle-anim {
  animation: check-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes check-pop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>

