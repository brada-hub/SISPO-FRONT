<template>
  <q-page class="bg-grey-3 flex flex-col no-wrap h-screen overflow-hidden">
    <!-- TOP BAR (No Print) -->
    <q-toolbar class="bg-white text-gray-800 shadow-md q-px-lg no-print" style="height: 70px; z-index: 10;">
      <q-btn flat round icon="arrow_back" @click="$router.back()" class="mr-4" />
      <div class="flex items-center">
        <div class="text-h6 font-black tracking-tighter uppercase leading-none mb-1">
          Expediente: {{ postulacion?.postulante?.nombres }} {{ postulacion?.postulante?.apellidos }}
        </div>
      </div>
      <q-space />
      <div class="flex items-center gap-4">
        <q-btn
          label="Descargar PDF (Carta)"
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
    <div class="flex-1 row no-wrap overflow-hidden">
      <!-- LEFT: EXPEDIENTE VIEW -->
      <div class="col-12 col-md-7 h-full scroll flex justify-center bg-grey-4 p-10 border-r shadow-inner overflow-y-auto">
        <div id="expediente-carta" class="reporte-container print-content">

          <!-- HEADER -->
          <div class="seccion-reporte text-center mb-6">
            <h1 class="header-title">UNITEPC</h1>
            <h2 class="header-subtitle">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</h2>
            <h3 class="header-cv">CURRICULUM VITAE</h3>
            <h4 class="header-selection">{{ postulacion?.oferta?.convocatoria?.titulo }}</h4>
          </div>

          <!-- PHOTO & LOGO -->
          <div class="seccion-reporte row items-center no-wrap mb-4 px-10">
            <div class="col-4 flex flex-start">
              <img src="~assets/unitepc_escudo.png" style="height: 90px; width: auto;" @error="(e) => e.target.style.display = 'none'" />
            </div>
            <div class="col-8 flex items-center justify-end">
              <div class="flex items-center gap-4">
                <div class="text-right">
                    <div class="text-[11px] font-bold text-[#663399]">FOTOGRAFÍA<br/>PERSONAL:</div>
                    <a v-if="postulacion?.postulante?.foto_perfil_path" @click="previewFile(postulacion.postulante.foto_perfil_path)" class="text-[9px] text-blue-8 underline cursor-pointer break-all max-w-[200px] inline-block">
                      {{ getFileUrl(postulacion.postulante.foto_perfil_path) }}
                    </a>
                </div>
                <div class="qr-box-header">
                  <QrcodeVue v-if="postulacion?.postulante?.foto_perfil_path" :value="getFileUrl(postulacion.postulante.foto_perfil_path)" :size="80" level="M" render-as="svg" />
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION I: DATOS PERSONALES -->
          <div class="seccion-reporte mb-6">
            <div class="section-header">I. DATOS PERSONALES</div>
            <table class="data-table">
              <tr>
                <td class="label">NOMBRE COMPLETO:</td>
                <td class="value font-bold text-lg text-[#663399]">{{ postulacion?.postulante?.nombres }} {{ postulacion?.postulante?.apellidos }}</td>
              </tr>
              <tr>
                <td class="label">CARGO AL QUE POSTULA:</td>
                <td class="value uppercase font-bold">
                  {{ postulacion?.oferta?.cargo?.nombre }}
                  <span class="text-[#663399] ml-2 font-normal">({{ postulacion?.oferta?.sede?.nombre }})</span>
                </td>
              </tr>
              <tr>
                <td class="label">Nº DE CÉDULA DE IDENTIDAD:</td>
                <td class="value">{{ postulacion?.postulante?.ci }} {{ postulacion?.postulante?.ci_expedido }}</td>
              </tr>
              <tr>
                <td class="label">CÉDULA DE IDENTIDAD:</td>
                <td class="value">
                  <div class="row no-wrap items-center gap-4">
                    <a v-if="postulacion?.postulante?.ci_archivo_path" @click="previewFile(postulacion.postulante.ci_archivo_path)" class="text-xs text-blue-8 underline cursor-pointer flex-1">
                      {{ getFileUrl(postulacion.postulante.ci_archivo_path) }}
                    </a>
                    <div class="qr-box-small">
                      <QrcodeVue v-if="postulacion?.postulante?.ci_archivo_path" :value="getFileUrl(postulacion.postulante.ci_archivo_path)" :size="60" level="M" render-as="svg" />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="label">NACIONALIDAD:</td>
                <td class="value uppercase">{{ postulacion?.postulante?.nacionalidad }}</td>
              </tr>
              <tr>
                <td class="label">DIRECCIÓN DE DOMICILIO:</td>
                <td class="value">{{ postulacion?.postulante?.direccion_domicilio }}</td>
              </tr>
              <tr>
                <td class="label">Nº DE TELÉFONO DE CONTACTO:</td>
                <td class="value">{{ postulacion?.postulante?.celular }}</td>
              </tr>
              <tr>
                <td class="label">CORREO ELECTRÓNICO:</td>
                <td class="value text-blue-8 underline">{{ postulacion?.postulante?.email }}</td>
              </tr>
              <tr>
                <td class="label">CARTA DE POSTULACIÓN:</td>
                <td class="value">
                  <div class="row no-wrap items-center gap-4">
                    <a v-if="postulacion?.postulante?.carta_postulacion_path" @click="previewFile(postulacion.postulante.carta_postulacion_path)" class="text-xs text-blue-8 underline cursor-pointer flex-1">
                      {{ getFileUrl(postulacion.postulante.carta_postulacion_path) }}
                    </a>
                    <div class="qr-box-small">
                      <QrcodeVue v-if="postulacion?.postulante?.carta_postulacion_path" :value="getFileUrl(postulacion.postulante.carta_postulacion_path)" :size="60" level="M" render-as="svg" />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="label">CURRICULUM VITAE:</td>
                <td class="value">
                  <div class="row no-wrap items-center gap-4">
                    <a v-if="postulacion?.postulante?.cv_pdf_path" @click="previewFile(postulacion.postulante.cv_pdf_path)" class="text-xs text-blue-8 underline cursor-pointer flex-1">
                      {{ getFileUrl(postulacion.postulante.cv_pdf_path) }}
                    </a>
                    <div class="qr-box-small">
                      <QrcodeVue v-if="postulacion?.postulante?.cv_pdf_path" :value="getFileUrl(postulacion.postulante.cv_pdf_path)" :size="60" level="M" render-as="svg" />
                    </div>
                  </div>
                </td>
              </tr>
              <!-- Adding References based on Part 1 request -->
              <tr>
                <td class="label">REFERENCIA PERSONAL:</td>
                <td class="value">
                  Celular: {{ postulacion?.postulante?.ref_personal_celular }} -
                  Relación: {{ postulacion?.postulante?.ref_personal_parentesco }}
                </td>
              </tr>
              <tr>
                <td class="label">REFERENCIA LABORAL:</td>
                <td class="value">
                  Celular: {{ postulacion?.postulante?.ref_laboral_celular }} -
                  Detalle: {{ postulacion?.postulante?.ref_laboral_detalle }}
                </td>
              </tr>
            </table>
          </div>

          <!-- DYNAMIC SECTIONS (II, III, IV...) -->
          <div v-for="(group, idx) in filteredMeritos" :key="group.tipo?.id" class="seccion-reporte mb-6">
            <div class="section-header">
              {{ romanize(idx + 2) }}. {{ group.tipo?.nombre }}
            </div>
            <div v-if="group.tipo?.descripcion" class="text-[10px] text-grey-7 italic mb-1 uppercase text-left font-bold pl-4">
              ({{ group.tipo?.descripcion }})
            </div>

            <table class="merit-table">
              <thead>
                <tr>
                  <template v-for="campo in group.tipo?.campos" :key="campo.key">
                    <th>{{ campo.label }}</th>
                    <!-- Insert archivo header right after its related campo -->
                    <template v-for="configArch in group.tipo?.config_archivos?.filter(a => a.after_campo === campo.key)" :key="configArch.id">
                      <th class="w-[30mm]">{{ configArch.label }}</th>
                    </template>
                  </template>
                  <!-- Archivos without after_campo go at the end -->
                  <template v-for="configArch in group.tipo?.config_archivos?.filter(a => !a.after_campo)" :key="configArch.id">
                    <th class="w-[30mm]">{{ configArch.label }}</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr v-for="merito in group.items" :key="merito.id">
                  <template v-for="campo in group.tipo?.campos" :key="campo.key">
                    <td class="text-center font-bold uppercase text-[10px]">
                      {{ merito.respuestas[campo.key] || '---' }}
                    </td>
                    <!-- Insert archivo QR right after its related campo -->
                    <template v-for="configArch in group.tipo?.config_archivos?.filter(a => a.after_campo === campo.key)" :key="configArch.id">
                      <td class="text-center">
                        <div v-if="getMeritoFile(merito, configArch.id)" class="flex justify-center">
                          <div class="qr-box-small no-border">
                            <QrcodeVue :value="getFileUrl(getMeritoFile(merito, configArch.id))" :size="75" level="M" render-as="svg" />
                          </div>
                        </div>
                        <div v-else>—</div>
                      </td>
                    </template>
                  </template>
                  <!-- Archivos without after_campo go at the end -->
                  <template v-for="configArch in group.tipo?.config_archivos?.filter(a => !a.after_campo)" :key="configArch.id">
                    <td class="text-center">
                      <div v-if="getMeritoFile(merito, configArch.id)" class="flex justify-center">
                        <div class="qr-box-small no-border">
                          <QrcodeVue :value="getFileUrl(getMeritoFile(merito, configArch.id))" :size="75" level="M" render-as="svg" />
                        </div>
                      </div>
                      <div v-else>—</div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- FOOTER -->
          <div class="seccion-reporte mt-10 pt-4 border-t-2 border-[#663399] text-center">
            <div class="text-[10px] text-[#663399] font-black uppercase tracking-widest">
              SISTEMA DE GESTIÓN DE CONVOCATORIAS UNITEPC
            </div>
            <div class="text-[9px] text-gray-500 mt-1">
              Documento generado digitalmente por el panel administrativo. ID #{{ postulacion?.id }} - {{ new Date().toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- HIDDEN PDF GENERATOR COMPONENT -->
      <ExpedientePDF
        ref="pdfExporter"
        :postulacion="postulacion"
        :filtered-meritos="filteredMeritos"
      />

      <!-- RIGHT: DOCUMENT PREVIEWER -->
      <div class="col-12 col-md-5 h-full bg-[#1e1e1e] flex flex-col no-wrap no-print overflow-hidden shadow-2xl">
        <div class="bg-black/60 p-4 text-white flex justify-between items-center border-b border-white/10">
            <div class="flex items-center gap-2">
               <q-icon name="visibility" color="amber-5" />
               <span class="font-bold text-xs uppercase tracking-widest text-[#ddd]">PREVISUALIZACIÓN DE ARCHIVO</span>
            </div>
            <q-btn v-if="currentFile" flat round icon="open_in_new" color="white" size="sm" @click="openFileNewTab" />
        </div>

        <div class="flex-1 overflow-hidden flex flex-center relative">
           <iframe
             v-if="currentFile && isPdf(currentFile)"
             :src="currentFileUrl"
             class="full-width full-height border-none"
           ></iframe>

           <div v-else-if="currentFile && !isPdf(currentFile)" class="full-width full-height flex flex-center overflow-auto p-4">
              <img :src="currentFileUrl" class="max-w-full max-h-full shadow-2xl rounded" />
           </div>

           <div v-else class="text-center text-white/20 q-pa-xl">
             <q-icon name="description" size="8rem" class="opacity-10 mb-4" />
             <div class="text-lg font-bold uppercase tracking-[0.2em]">Visor de Evidencias</div>
             <p class="text-xs opacity-50">Haga clic en cualquier enlace al lado izquierdo para cargar el documento aquí.</p>
           </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import QrcodeVue from 'qrcode.vue'
import ExpedientePDF from 'components/ExpedientePDF.vue'

const $q = useQuasar()
const route = useRoute()
const pdfExporter = ref(null)
const postulacion = ref(null)
const currentFile = ref(null)
const generatingPDF = ref(false)

const loadExpediente = async () => {
  try {
    const { data } = await api.get(`/postulaciones/${route.params.id}/expediente`)
    postulacion.value = data
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error cargando expediente' })
  }
}

const filteredMeritos = computed(() => {
  if (!postulacion.value?.postulante?.meritos || !postulacion.value?.oferta?.convocatoria?.config_requisitos_ids) return []

  const allowedIds = postulacion.value.oferta.convocatoria.config_requisitos_ids.map(id => Number(id))
  const groups = {}

  postulacion.value.postulante.meritos.forEach(merito => {
    const tid = merito.tipo_documento_id

    // Logic 1: Filter by convocatoria requirements
    if (!allowedIds.includes(tid)) return

    // Logic 2: Only show if it has files
    if (!merito.archivos || merito.archivos.length === 0) return

    if (!groups[tid]) {
      groups[tid] = { tipo: merito.tipo_documento, items: [] }
    }
    groups[tid].items.push(merito)
  })

  return Object.values(groups).sort((a, b) => (a.tipo?.orden || 0) - (b.tipo?.orden || 0))
})

const getFileUrl = (path) => {
  if (!path) return ''
  const baseUrl = api.defaults.baseURL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}

const currentFileUrl = computed(() => currentFile.value ? getFileUrl(currentFile.value) : null)

const previewFile = (path) => {
  currentFile.value = path
}

const getMeritoFile = (merito, configId) => {
  if (!merito.archivos) return null
  const arch = merito.archivos.find(a => a.config_archivo_id === configId)
  return arch ? arch.archivo_path : null
}

const isPdf = (path) => path.toLowerCase().endsWith('.pdf')

const openFileNewTab = () => { if (currentFileUrl.value) window.open(currentFileUrl.value, '_blank') }

const romanize = (num) => {
  const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let roman = ''; for (let i in lookup) { while (num >= lookup[i]) { roman += i; num -= lookup[i] } }
  return roman
}

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


onMounted(loadExpediente)
</script>

<style scoped>
.reporte-container {
  background: white;
  width: 259mm;
  padding: 15mm;
  margin: 0 auto;
  font-family: 'Times New Roman', Times, serif; /* For a more formal look like the images */
  color: #000;
}

.seccion-reporte {
  width: 100%;
}

/* HEADERS */
.header-title {
  font-size: 42px;
  font-weight: 800;
  margin: 0;
  line-height: 1;
}
.header-subtitle {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.header-cv {
  font-size: 18px;
  font-weight: 700;
  margin: 10px 0 0 0;
}
.header-selection {
  font-size: 18px;
  font-weight: 700;
  color: #663399;
  margin: 0;
}

.section-header {
  background: transparent;
  color: #000;
  font-size: 16px;
  font-weight: 900;
  border-bottom: none;
  padding: 5px 0;
  text-transform: uppercase;
}

/* TABLES */
.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #663399;
}
.data-table td {
  padding: 6px 12px;
  border: 1px solid #663399;
  font-size: 12px;
}
.data-table .label {
  width: 35%;
  font-weight: 900;
  color: #663399;
  text-align: right;
  background-color: #f3efff;
}

.merit-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #663399;
}
.merit-table th {
  background-color: #f3efff;
  color: #663399;
  font-weight: 900;
  font-size: 10px;
  padding: 8px 4px;
  border: 1px solid #663399;
  text-transform: uppercase;
}
.merit-table td {
  padding: 8px 4px;
  border: 1px solid #663399;
  font-size: 11px;
}

/* QR BOXES */
.qr-box-header {
  border: 1px solid #663399;
  padding: 2px;
  background: white;
}
.qr-box-small {
  border: 1px solid #663399;
  padding: 2px;
  background: white;
  width: auto;
  display: inline-block;
}
.qr-box-small.no-border {
  border: none;
}

@media print {
  body { background: white !important; }
  .no-print { display: none !important; }
  .reporte-container {
    width: 259mm !important;
    padding: 10mm !important;
    margin: 0 !important;
  }
}

/* Responsive fix */
.scroll::-webkit-scrollbar {
  width: 8px;
}
.scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
.scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
