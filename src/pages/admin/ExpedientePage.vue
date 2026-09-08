<template>
  <q-page class="bg-grey-3 flex flex-col no-wrap h-screen overflow-hidden">
    <!-- TOP BAR (No Print) -->
    <q-toolbar v-if="!$route.query.hideheader" class="bg-white text-gray-800 shadow-md q-px-lg no-print" style="height: 70px; z-index: 10;">
      <q-btn flat round icon="arrow_back" @click="goBack" class="mr-4" />
      <div class="flex items-center">
        <div class="text-h6 font-black tracking-tighter uppercase leading-none mb-1">
          Expediente: {{ postulacionData?.postulante?.nombres }} {{ postulacionData?.postulante?.apellidos }}
        </div>
      </div>
      <q-space />
      <div class="flex items-center gap-4">
        <q-btn-dropdown
          split
          label="Descargar Hoja de Vida"
          icon="description"
          style="background-color: #663399; color: white;"
          unelevated
          rounded
          @click="downloadPDF('cv')"
          :loading="generatingPDF"
        >
          <q-list style="min-width: 260px;">
            <q-item clickable v-close-popup @click="downloadPDF('cv')">
              <q-item-section avatar>
                <q-icon name="description" color="deep-purple" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Hoja de Vida (Ultraligero)</q-item-label>
                <q-item-label caption>Genera el CV en 1 segundo (~350 KB)</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="downloadPDF('full')">
              <q-item-section avatar>
                <q-icon name="attach_file" color="teal" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Expediente Completo</q-item-label>
                <q-item-label caption>Incluye todos los respaldos y anexos fusionados</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-toolbar>

    <!-- MAIN CONTENT -->
    <ExpedienteDetail ref="detailComp" :postulacion-id="$route.params.id" />
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ExpedienteDetail from 'components/admin/ExpedienteDetail.vue'
import { generateInstitutionalExpedientePDF } from 'src/utils/institutionalPdfEngine.js'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/admin/postulaciones')
  }
}
const generatingPDF = ref(false)
const detailComp = ref(null)

const postulacionData = computed(() => detailComp.value?.postulacion || null)
const meritosData = computed(() => detailComp.value?.filteredMeritos || [])

const downloadPDF = async (mode = 'cv') => {
  if (!postulacionData.value) {
    $q.notify({ type: 'warning', message: 'Los datos del postulante aún están cargando...' })
    return
  }
  generatingPDF.value = true
  try {
    await generateInstitutionalExpedientePDF({
      postulacion: postulacionData.value,
      filteredMeritos: meritosData.value,
      includeAttachments: mode === 'full'
    })
    $q.notify({
      type: 'positive',
      message: mode === 'cv' ? 'Hoja de Vida Oficial generada (100% nítida)' : 'Expediente Completo generado con éxito'
    })
  } catch (err) {
    console.error('Error generando PDF institucional:', err)
    $q.notify({ type: 'negative', message: 'Error al generar el PDF' })
  } finally {
    generatingPDF.value = false
  }
}
</script>

<style scoped>
/* Only localized styles if any - none needed as detail handles it */
</style>
