<template>
  <q-page class="bg-grey-2 flex flex-col no-wrap h-screen overflow-hidden">
    <!-- TOP BAR (No Print) -->
    <q-toolbar class="bg-white text-gray-800 shadow-sm q-px-lg no-print" style="height: 70px;">
      <q-btn flat round icon="arrow_back" @click="$router.back()" class="mr-4" />
      <q-avatar size="45px" class="shadow-sm mr-3">
        <q-icon name="person" color="primary" />
      </q-avatar>
      <div>
        <div class="text-h6 font-black tracking-tighter uppercase leading-none mb-1">
          {{ postulacion?.postulante?.nombres }} {{ postulacion?.postulante?.apellidos }}
        </div>
        <div class="text-[10px] font-bold text-grey-6 uppercase tracking-widest">
          Expediente Digital • CI: {{ postulacion?.postulante?.ci }} {{ postulacion?.postulante?.ci_expedido }}
        </div>
      </div>
      <q-space />
      <div class="flex items-center gap-4">
        <q-btn-toggle
          v-model="isLandscape"
          toggle-color="primary"
          flat
          dense
          :options="[
            {label: 'Vertical', value: false, icon: 'portrait'},
            {label: 'Horizontal', value: true, icon: 'landscape'}
          ]"
          class="bg-grey-1 rounded-borders"
        />
        <q-badge :color="getStatusColor(postulacion?.estado)" class="q-px-md q-py-xs rounded-full font-black uppercase text-[10px] tracking-widest">
           ESTADO: {{ postulacion?.estado }}
        </q-badge>
        <q-btn
          label="Descargar Expediente"
          icon="picture_as_pdf"
          color="deep-orange"
          unelevated
          rounded
          dense
          class="q-px-md"
          @click="downloadPDF"
          :loading="generatingPDF"
        />
      </div>
    </q-toolbar>

    <!-- MAIN CONTENT GRID -->
    <div class="flex-1 row no-wrap overflow-hidden">
      <!-- LEFT: EXPEDIENTE VIEW (Letter Landscape Style) -->
      <div class="col-12 col-md-7 h-full scroll flex justify-center bg-grey-4 p-8 border-r shadow-inner">
        <div id="expediente-carta" class="reporte-container print-content">

          <!-- SECTION: HEADER (Fidelidad Total) -->
          <div class="seccion-reporte text-center mb-8">
            <h1 class="text-[32px] font-black text-gray-900 leading-none uppercase tracking-tighter m-0">UNITEPC</h1>
            <h2 class="text-[20px] font-bold text-gray-700 leading-tight uppercase tracking-tight m-0">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</h2>
            <div class="text-[12px] font-black text-gray-400 q-mt-sm uppercase tracking-[0.2em] border-t border-gray-100 pt-2">EXPEDIENTE DIGITAL DE POSTULACIÓN</div>
          </div>

          <!-- SECTION: PHOTO & IDENTITY (Rigid Layout) -->
          <div class="seccion-reporte row items-center no-wrap mb-8 pb-6 border-b border-gray-100">
            <div class="col-auto">
               <div class="w-28 h-36 bg-grey-2 border-2 border-white shadow-sm overflow-hidden flex flex-center rounded-sm">
                  <img v-if="postulacion?.postulante?.foto_perfil_path" :src="getFileUrl(postulacion.postulante.foto_perfil_path)" class="w-full h-full object-cover" />
                  <q-icon v-else name="person" size="4rem" color="grey-4" />
               </div>
            </div>

            <div class="col q-px-xl">
               <div class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Postulante Autorizado:</div>
               <div class="text-[24px] font-black text-gray-900 leading-none uppercase tracking-tighter mb-2">
                 {{ postulacion?.postulante?.nombres }}<br/>{{ postulacion?.postulante?.apellidos }}
               </div>
               <div class="text-[12px] font-bold text-purple-8 uppercase tracking-tight">
                 {{ postulacion?.oferta?.cargo?.nombre }} — {{ postulacion?.oferta?.sede?.nombre }}
               </div>
            </div>

            <div v-if="postulacion?.postulante?.foto_perfil_path" class="col-auto">
               <div class="qr-box shadow-sm">
                  <QrcodeVue :value="getFileUrl(postulacion.postulante.foto_perfil_path)" :size="120" level="H" render-as="svg" />
               </div>
            </div>
          </div>

          <!-- SECTION I: DATOS PERSONALES -->
          <div class="seccion-reporte mb-8">
            <div class="bg-grey-1 q-pa-sm rounded-sm mb-4">
               <span class="text-[14px] font-black text-gray-900 uppercase tracking-widest">I. INFORMACIÓN DE IDENTIDAD</span>
            </div>
            <table class="full-width visual-table">
              <tr>
                 <td class="label">Nro. Documento:</td>
                 <td class="value font-bold">{{ postulacion?.postulante?.ci }} {{ postulacion?.postulante?.ci_expedido }}</td>
                 <td class="label">Nacionalidad:</td>
                 <td class="value font-bold uppercase">{{ postulacion?.postulante?.nacionalidad }}</td>
              </tr>
              <tr>
                 <td class="label">Teléfono/Cel:</td>
                 <td class="value font-bold">{{ postulacion?.postulante?.celular }}</td>
                 <td class="label">Correo Electrónico:</td>
                 <td class="value font-bold lowercase text-blue-9">{{ postulacion?.postulante?.email }}</td>
              </tr>
              <tr v-if="postulacion?.postulante?.ci_archivo_path">
                 <td class="label">Digital C.I.:</td>
                 <td colspan="3" class="value">
                    <div class="row items-center no-wrap full-width gap-4">
                       <a @click.prevent="previewFile(postulacion.postulante.ci_archivo_path)" class="text-blue-800 underline text-[10px] font-black cursor-pointer flex-1">
                          ACCEDER AL DOCUMENTO DE IDENTIDAD DIGITALIZADO
                       </a>
                       <div class="qr-box xsmall">
                          <QrcodeVue :value="getFileUrl(postulacion.postulante.ci_archivo_path)" :size="100" level="M" render-as="svg" />
                       </div>
                    </div>
                 </td>
              </tr>
              <tr v-if="postulacion?.postulante?.carta_postulacion_path">
                 <td class="label">Carta Postulación:</td>
                 <td colspan="3" class="value">
                    <div class="row items-center no-wrap full-width gap-4">
                       <a @click.prevent="previewFile(postulacion.postulante.carta_postulacion_path)" class="text-blue-800 underline text-[10px] font-black cursor-pointer flex-1">
                          ACCEDER A LA CARTA DE POSTULACIÓN FIRMADA
                       </a>
                       <div class="qr-box xsmall">
                          <QrcodeVue :value="getFileUrl(postulacion.postulante.carta_postulacion_path)" :size="100" level="M" render-as="svg" />
                       </div>
                    </div>
                 </td>
              </tr>
            </table>
          </div>

          <!-- SECTION II+ : DYNAMIC MERITS -->
          <div v-for="(group, idx) in groupedMeritos" :key="group.tipo?.id" class="seccion-reporte mb-8">
            <div class="bg-grey-1 q-pa-sm rounded-sm mb-2">
               <div class="text-[14px] font-black text-gray-900 uppercase tracking-widest">
                  {{ romanize(idx + 2) }}. {{ group.tipo?.nombre }}
               </div>
               <div v-if="group.tipo?.descripcion" class="text-[10px] text-grey-7 font-medium uppercase mt-0.5">
                 {{ group.tipo?.descripcion }}
               </div>
            </div>

            <table class="full-width merit-visual-table">
               <thead>
                  <tr>
                     <th v-for="campo in group.tipo?.campos" :key="campo.key">{{ campo.label }}</th>
                     <template v-for="arch in group.tipo?.config_archivos" :key="arch.id">
                        <th style="width: 100px;">ESTADO</th>
                        <th style="width: 30mm;">VERIFICACIÓN</th>
                     </template>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="merito in group.items" :key="merito.id">
                     <td v-for="campo in group.tipo?.campos" :key="campo.key" class="text-center font-bold text-[10px] text-gray-800">
                        {{ merito.respuestas[campo.key] || '---' }}
                     </td>
                     <template v-for="configArch in group.tipo?.config_archivos" :key="configArch.id">
                        <td class="text-center">
                           <div v-if="getMeritoFile(merito, configArch.id)">
                              <a @click.prevent="previewFile(getMeritoFile(merito, configArch.id))" class="text-blue-9 font-black text-[9px] underline">VER ARCHIVO</a>
                           </div>
                           <div v-else class="text-grey-4 text-[9px] italic">NO DISPONIBLE</div>
                        </td>
                        <td class="text-center">
                           <div v-if="getMeritoFile(merito, configArch.id)" class="qr-box xsmall no-border">
                              <QrcodeVue :value="getFileUrl(getMeritoFile(merito, configArch.id))" :size="120" level="M" render-as="svg" />
                           </div>
                           <div v-else>—</div>
                        </td>
                     </template>
                  </tr>
               </tbody>
            </table>
          </div>

          <!-- FOOTER (Elegante) -->
          <div class="seccion-reporte mt-12 pt-4 border-t border-gray-100 text-center">
            <div class="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
              SISTEMA DE GESTIÓN DE CONVOCATORIAS UNITEPC
            </div>
            <div class="text-[9px] text-gray-300 mt-1 font-medium">
              DOCUMENTO ELECTRÓNICO GENERADO EL {{ new Date().toLocaleString() }} | CÓDIGO DE INTEGRIDAD: {{ postulacion?.id?.toString().padStart(8, '0') }}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: DOCUMENT PREVIEWER -->
      <div class="col-12 col-md-5 h-full bg-grey-9 flex flex-col no-wrap no-print">
        <div class="bg-black/40 p-4 text-white flex justify-between items-center border-b border-white/10">
            <div class="flex items-center gap-2">
               <q-icon name="visibility" color="teal-4" />
               <span class="font-bold text-xs uppercase tracking-widest text-teal-2">Visualizador de Evidencias</span>
            </div>
            <q-btn v-if="currentFile" flat round icon="open_in_new" color="white" size="sm" @click="openFileNewTab" />
        </div>

        <div class="flex-1 overflow-hidden flex flex-center relative bg-[#1a1a1a]">
           <iframe
             v-if="currentFile && isPdf(currentFile)"
             :src="currentFileUrl"
             class="full-width full-height border-none"
           ></iframe>

           <div v-else-if="currentFile && !isPdf(currentFile)" class="full-width full-height flex flex-center overflow-auto p-4">
              <img :src="currentFileUrl" class="max-w-full max-h-full shadow-2xl rounded border border-white/10" />
           </div>

           <div v-else class="text-center text-white/10 q-pa-xl">
             <q-icon name="fingerprint" size="12rem" class="opacity-10" />
             <div class="text-[14px] font-black uppercase tracking-[0.5em] q-mt-md">Seguridad Digital</div>
             <div class="text-caption opacity-40">Seleccione un elemento del expediente para validar su autenticidad.</div>
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
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const $q = useQuasar()
const route = useRoute()
const postulacion = ref(null)
const currentFile = ref(null)
const isLandscape = ref(true)
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

const groupedMeritos = computed(() => {
  if (!postulacion.value?.postulante?.meritos) return []
  const groups = {}
  postulacion.value.postulante.meritos.forEach(merito => {
    const tid = merito.tipo_documento_id
    if (!groups[tid]) {
      groups[tid] = { tipo: merito.tipo_documento, items: [] }
    }
    groups[tid].items.push(merito)
  })
  return Object.values(groups).sort((a, b) => (a.tipo?.orden || 0) - (b.tipo?.orden || 0))
})

const getStatusColor = (status) => {
  switch(status) {
    case 'enviada': return 'indigo-7';
    case 'en_revision': return 'orange-7';
    case 'validada': return 'teal-7';
    case 'observada': return 'deep-orange-7';
    case 'rechazada': return 'red-7';
    default: return 'grey-7';
  }
}

const previewFile = (path) => { currentFile.value = path }
const getFileUrl = (path) => {
  if (!path) return ''
  const baseUrl = api.defaults.baseURL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}
const currentFileUrl = computed(() => currentFile.value ? getFileUrl(currentFile.value) : null)
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
  const originalEl = document.querySelector('#expediente-carta')
  if (!originalEl) return
  generatingPDF.value = true

  const clone = originalEl.cloneNode(true)
  clone.id = 'expediente-clon'

  Object.assign(clone.style, {
    position: 'absolute',
    left: '-9999px',
    top: '0',
    width: '1056px',
    background: 'white',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  })

  document.body.appendChild(clone)
  await new Promise(resolve => setTimeout(resolve, 1500))

  try {
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'letter', compress: true })
    const pdfHeight = 215.9
    const contentWidth = 259
    const sections = Array.from(clone.querySelectorAll('.seccion-reporte'))
    let currentY = 10

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const canvas = await html2canvas(section, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1056,
        windowWidth: 1056,
        scrollX: 0,
        scrollY: 0
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.9)
      const imgProps = doc.getImageProperties(imgData)
      const sectionHeightInMm = (imgProps.height * contentWidth) / imgProps.width

      if (currentY + sectionHeightInMm > (pdfHeight - 15)) {
         doc.addPage()
         currentY = 10
      }

      const xOffset = (279.4 - contentWidth) / 2
      doc.addImage(imgData, 'JPEG', xOffset, currentY, contentWidth, sectionHeightInMm)
      currentY += sectionHeightInMm + 5
    }

    doc.save(`Expediente_UNITEPC_${postulacion.value?.postulante?.nombres}.pdf`)
    $q.notify({ type: 'positive', message: 'Reporte de Fidelidad Total Generado', icon: 'verified' })
  } catch (error) {
    console.error('Error generating PDF:', error)
    $q.notify({ type: 'negative', message: 'Error en renderizado final.' })
  } finally {
    if (document.body.contains(clone)) document.body.removeChild(clone)
    generatingPDF.value = false
  }
}

onMounted(loadExpediente)
</script>

<style>
/* ARQUITECTURA DE FIDELIDAD TOTAL */
.reporte-container {
  background: white;
  width: 259mm;
  padding: 8mm;
  margin: 0 auto;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  color: #1a1a1a;
  line-height: 1.2;
}

.seccion-reporte {
  width: 100%;
  page-break-inside: avoid;
  overflow: hidden;
}

/* TABLAS LIMPIAS (SIN LÍNEAS NEGRAS PESADAS) */
.visual-table {
  border-collapse: collapse;
  margin-top: 5px;
}
.visual-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 11px;
}
.visual-table .label {
  color: #777;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 140px;
}

.merit-visual-table {
  border-collapse: collapse;
  margin-top: 5px;
}
.merit-visual-table th {
  background: #f8f9fa !important;
  color: #555;
  font-weight: 800;
  font-size: 9px;
  text-transform: uppercase;
  padding: 10px 6px;
  text-align: center;
  border-bottom: 2px solid #eee;
}
.merit-visual-table td {
  padding: 10px 6px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 10px;
  text-align: center;
}

/* SISTEMA DE QRs RIGIDOS Y LIMPIOS */
.qr-box {
  width: 30mm;
  height: 30mm;
  background: white;
  padding: 4px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-box.xsmall { width: 18mm; height: 18mm; padding: 2px; }
.qr-box.no-border { border: none; }
.qr-box svg { width: 100% !important; height: 100% !important; }

@media print {
  @page { size: letter landscape; margin: 10mm; }
  body { background: white !important; margin: 0; }
  .no-print { display: none !important; }
  .reporte-container {
    width: 259mm !important;
    padding: 0 !important;
    margin: 0 auto !important;
    border: none;
    box-shadow: none;
  }
}

/* Previsualización Scroll Fix */
.col-md-7.scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
