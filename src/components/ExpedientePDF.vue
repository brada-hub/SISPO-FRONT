<template>
  <!-- Hidden clone of the expediente for PDF capture -->
  <div ref="pdfContainer" class="pdf-hidden-container">
    <div class="reporte-container" ref="expedienteClone">

      <!-- HEADER + LOGO (Section 0) -->
      <div ref="sectionHeader" class="pdf-section">
        <div class="seccion-reporte text-center mb-6">
          <h1 class="header-title">UNITEPC</h1>
          <h2 class="header-subtitle">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</h2>
          <h3 class="header-cv">CURRICULUM VITAE</h3>
          <h4 class="header-selection">{{ postulacion?.oferta?.convocatoria?.titulo }}</h4>
        </div>

        <div class="seccion-reporte row items-center no-wrap mb-4 px-10">
          <div class="col-4 flex flex-start">
            <img src="~assets/unitepc_escudo.png" style="height: 90px; width: auto;" @error="(e) => e.target.style.display = 'none'" />
          </div>
          <div class="col-8 flex items-center justify-end">
            <div class="flex items-center gap-4">
              <div class="text-right">
                  <div class="photo-label">FOTOGRAFÍA<br/>PERSONAL:</div>
                  <span v-if="postulacion?.postulante?.foto_perfil_path" class="scan-hint">Escanear QR →</span>
              </div>
              <div class="qr-box-header">
                <QrcodeVue v-if="postulacion?.postulante?.foto_perfil_path" :value="getFileUrl(postulacion.postulante.foto_perfil_path)" :size="80" level="M" render-as="svg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION I: DATOS PERSONALES -->
      <div ref="sectionDatosPersonales" class="pdf-section">
        <div class="seccion-reporte mb-6">
          <div class="section-header">I. DATOS PERSONALES</div>
          <table class="data-table">
            <tr>
              <td class="label">NOMBRE COMPLETO:</td>
              <td class="value name-value">{{ postulacion?.postulante?.nombres }} {{ postulacion?.postulante?.apellidos }}</td>
            </tr>
            <tr>
              <td class="label">CARGO AL QUE POSTULA:</td>
              <td class="value cargo-value">
                {{ postulacion?.oferta?.cargo?.nombre }}
                <span class="sede-text">({{ postulacion?.oferta?.sede?.nombre }})</span>
              </td>
            </tr>
            <tr>
              <td class="label">Nº DE CÉDULA DE IDENTIDAD:</td>
              <td class="value">{{ postulacion?.postulante?.ci }} {{ postulacion?.postulante?.ci_expedido }}</td>
            </tr>
            <tr>
              <td class="label">CÉDULA DE IDENTIDAD:</td>
              <td class="value">
                <div class="flex justify-center">
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
              <td class="value email-value">{{ postulacion?.postulante?.email }}</td>
            </tr>
            <tr>
              <td class="label">CARTA DE POSTULACIÓN:</td>
              <td class="value">
                <div class="flex justify-center">
                  <div class="qr-box-small">
                    <QrcodeVue v-if="postulacion?.postulante?.carta_postulacion_path" :value="getFileUrl(postulacion.postulante.carta_postulacion_path)" :size="60" level="M" render-as="svg" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="label">CURRICULUM VITAE:</td>
              <td class="value">
                <div class="flex justify-center">
                  <div class="qr-box-small">
                    <QrcodeVue v-if="postulacion?.postulante?.cv_pdf_path" :value="getFileUrl(postulacion.postulante.cv_pdf_path)" :size="60" level="M" render-as="svg" />
                  </div>
                </div>
              </td>
            </tr>
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
            <tr>
              <td class="label">PRETENSIÓN SALARIAL:</td>
              <td class="value font-bold" style="color: #663399;">
                {{ postulacion?.pretension_salarial ? `${Math.round(Number(postulacion.pretension_salarial)).toLocaleString('de-DE')} Bs.` : '---' }}
              </td>
            </tr>
            <tr>
              <td class="label">POR QUÉ EL CARGO:</td>
              <td class="value italic">
                {{ postulacion?.porque_cargo || '---' }}
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- DYNAMIC SECTIONS (II, III, IV...) - Each wrapped in pdf-section -->
      <div v-for="(group, idx) in filteredMeritos" :key="group.tipo?.id" :ref="el => meritSections[idx] = el" class="pdf-section">
        <div class="seccion-reporte mb-6">
          <div class="section-header">
            {{ romanize(idx + 2) }}. {{ group.tipo?.nombre }}
          </div>
          <div v-if="group.tipo?.descripcion" class="section-description">
            ({{ group.tipo?.descripcion }})
          </div>

          <table class="merit-table">
            <thead>
              <tr>
                <template v-for="campo in group.tipo?.campos" :key="campo.key">
                  <th>{{ campo.label }}</th>
                  <!-- Insert archivo header right after its related campo -->
                  <template v-for="configArch in group.tipo?.config_archivos?.filter(a => a.after_campo === campo.key)" :key="configArch.id">
                    <th class="qr-col">{{ configArch.label }}</th>
                  </template>
                </template>
                <!-- Archivos without after_campo go at the end -->
                <template v-for="configArch in group.tipo?.config_archivos?.filter(a => !a.after_campo)" :key="configArch.id">
                  <th class="qr-col">{{ configArch.label }}</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="merito in group.items" :key="merito.id">
                <template v-for="campo in group.tipo?.campos" :key="campo.key">
                  <td class="text-center font-bold uppercase">
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
                      <div v-else class="no-file">—</div>
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
                    <div v-else class="no-file">—</div>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import QrcodeVue from 'qrcode.vue'
import { api } from 'boot/axios'

const props = defineProps({
  postulacion: Object,
  filteredMeritos: Array
})

const pdfContainer = ref(null)
const expedienteClone = ref(null)
const sectionHeader = ref(null)
const sectionDatosPersonales = ref(null)
const meritSections = ref([])

const getFileUrl = (path) => {
  if (!path) return ''
  const baseUrl = api.defaults.baseURL.replace(/\/api$/, '')
  return `${baseUrl}/storage/${path}`
}

const getMeritoFile = (merito, configId) => {
  if (!merito.archivos) return null
  const arch = merito.archivos.find(a => a.config_archivo_id === configId)
  return arch ? arch.archivo_path : null
}

const romanize = (num) => {
  const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let roman = ''; for (let i in lookup) { while (num >= lookup[i]) { roman += i; num -= lookup[i] } }
  return roman
}

const generatePDF = async () => {
  console.log('PDF: Iniciando generación por secciones...')

  if (!props.postulacion || !expedienteClone.value) {
    console.error('PDF: No hay datos o elemento')
    return
  }

  // Make the container visible for capture
  pdfContainer.value.style.position = 'absolute'
  pdfContainer.value.style.left = '-9999px'
  pdfContainer.value.style.top = '0'
  pdfContainer.value.style.display = 'block'
  pdfContainer.value.style.zIndex = '-1'

  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    // Create PDF in Letter format (portrait)
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'letter'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const usableHeight = pdfHeight - (margin * 2) - 10 // Leave space for page number
    const contentWidth = pdfWidth - (margin * 2)

    let currentY = margin

    // Function to capture and add a section
    const addSection = async (element, forceNewPage = false) => {
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgWidth = contentWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Check if section fits on current page
      if (forceNewPage || (currentY + imgHeight > usableHeight && currentY > margin)) {
        pdf.addPage()
        currentY = margin
      }

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight)
      currentY += imgHeight + 5 // Add some spacing between sections
    }

    // Capture each section separately
    console.log('PDF: Capturando header...')
    await addSection(sectionHeader.value)

    console.log('PDF: Capturando datos personales...')
    await addSection(sectionDatosPersonales.value)

    // Capture merit sections
    for (let i = 0; i < meritSections.value.length; i++) {
      const section = meritSections.value[i]
      if (section) {
        console.log(`PDF: Capturando sección de méritos ${i + 1}...`)
        await addSection(section)
      }
    }

    // Add footer and page numbers
    const totalPages = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)

      // Footer line
      pdf.setDrawColor(102, 51, 153)
      pdf.setLineWidth(0.5)
      pdf.line(margin, pdfHeight - 15, pdfWidth - margin, pdfHeight - 15)

      // Footer text
      pdf.setFontSize(8)
      pdf.setTextColor(102, 51, 153)
      pdf.text('SISTEMA DE GESTIÓN DE CONVOCATORIAS UNITEPC', pdfWidth / 2, pdfHeight - 10, { align: 'center' })

      pdf.setFontSize(7)
      pdf.setTextColor(100)
      const now = new Date()
      const d = now.getDate().toString().padStart(2, '0')
      const m = (now.getMonth() + 1).toString().padStart(2, '0')
      const y = now.getFullYear()
      const hh = now.getHours().toString().padStart(2, '0')
      const mm = now.getMinutes().toString().padStart(2, '0')
      const footerInfo = `Expediente #${props.postulacion.id} | Página ${i} de ${totalPages} | Generado: ${d}-${m}-${y} ${hh}:${mm}`
      pdf.text(footerInfo, pdfWidth / 2, pdfHeight - 6, { align: 'center' })
    }

    // Generate filename
    const p = props.postulacion.postulante
    const nombre = String(p?.nombres || 'Postulante').replace(/[^a-zA-Z]/g, '')
    const ci = String(p?.ci || '0').replace(/[^0-9]/g, '')
    const filename = `Expediente_${nombre}_${ci}.pdf`

    console.log('PDF: Guardando como:', filename)
    pdf.save(filename)

    console.log('PDF: Generación completada')
    return true
  } catch (err) {
    console.error('PDF Error:', err)
    throw err
  } finally {
    pdfContainer.value.style.display = 'none'
  }
}

defineExpose({ generatePDF })
</script>

<style scoped>
.pdf-hidden-container {
  display: none;
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: -1;
}

.pdf-section {
  background: white;
}

.reporte-container {
  background: white;
  width: 259mm;
  padding: 15mm;
  font-family: 'Times New Roman', Times, serif;
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

.section-description {
  font-size: 10px;
  color: #666;
  font-style: italic;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-weight: bold;
  padding-left: 16px;
  text-align: left;
}

/* PHOTO SECTION */
.photo-label {
  font-size: 11px;
  font-weight: bold;
  color: #663399;
}
.scan-hint {
  font-size: 10px;
  color: #663399;
  font-style: italic;
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
.name-value {
  font-weight: bold;
  font-size: 14px;
  color: #663399;
}
.cargo-value {
  text-transform: uppercase;
  font-weight: bold;
}
.sede-text {
  color: #663399;
  margin-left: 8px;
  font-weight: normal;
}
.email-value {
  color: #1e40af;
  text-decoration: underline;
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
.qr-col {
  width: 25mm;
}
.no-file {
  color: #999;
  font-style: italic;
  font-size: 9px;
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

/* Flexbox utilities */
.row { display: flex; }
.no-wrap { flex-wrap: nowrap; }
.items-center { align-items: center; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.gap-4 { gap: 16px; }
.flex { display: flex; }
.flex-start { justify-content: flex-start; }
.col-4 { width: 33.33%; }
.col-8 { width: 66.66%; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.uppercase { text-transform: uppercase; }
.font-bold { font-weight: bold; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.px-10 { padding-left: 40px; padding-right: 40px; }
</style>
