<template>
  <q-page class="bg-grey-3 flex flex-col no-wrap h-screen overflow-hidden">
    <!-- TOP BAR (No Print) -->
    <q-toolbar v-if="!$route.query.hideheader" class="bg-white text-gray-800 shadow-md q-px-lg no-print" style="height: 70px; z-index: 10;">
      <q-btn flat round icon="arrow_back" @click="$router.back()" class="mr-4" />
      <div class="flex items-center">
        <div class="text-h6 font-black tracking-tighter uppercase leading-none mb-1">
          Expediente: {{ postulacion?.postulante?.nombres }} {{ postulacion?.postulante?.apellidos }}
        </div>
      </div>
      <q-space />
      <div class="flex items-center gap-4">
        <q-btn
          label="Descargar PDF (Oficio)"
          icon="picture_as_pdf"
          style="background-color: #663399; color: white;"
          unelevated
          rounded
          @click="downloadPDF"
          :loading="generatingPDF"
        />
      </div>
    </q-toolbar>

    <!-- MAIN CONTENT -->
    <ExpedienteDetail ref="detailComp" :postulacion-id="$route.params.id" />

    <!-- HIDDEN PDF GENERATOR COMPONENT (Connects to Detail Data) -->
    <ExpedientePDF
      ref="pdfExporter"
      :postulacion="postulacionData"
      :filtered-meritos="meritosData"
    />
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import ExpedientePDF from 'components/ExpedientePDF.vue'
import ExpedienteDetail from 'components/admin/ExpedienteDetail.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const pdfExporter = ref(null)
const generatingPDF = ref(false)
const detailComp = ref(null)

const postulacionData = computed(() => detailComp.value?.postulacion || null)
const meritosData = computed(() => detailComp.value?.filteredMeritos || [])


const downloadPDF = async () => {
  if (!pdfExporter.value) return
  generatingPDF.value = true
  try {
    await pdfExporter.value.generatePDF()
    $q.notify({ type: 'positive', message: 'PDF generado con éxito' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al generar el PDF' })
  } finally {
    generatingPDF.value = false
  }
}
</script>

<style scoped>
/* Only localized styles if any - none needed as detail handles it */
</style>
