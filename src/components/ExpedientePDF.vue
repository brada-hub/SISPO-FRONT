<template>
  <!-- Hidden clone of the expediente for PDF capture -->
  <div ref="pdfContainer" class="pdf-hidden-container">
    <div class="reporte-container" ref="expedienteClone">

      <!-- TOP GOLD ACCENT BAR -->
      <div class="top-gold-bar"></div>

      <!-- HEADER + LOGO (Section 0) -->
      <div ref="sectionHeader" class="pdf-section">
        <div class="header-card mb-6">
          <div class="row items-center no-wrap px-4 py-3">
            <div class="col-3 flex items-center justify-start">
              <img src="~assets/unitepc_escudo.png" style="height: 85px; width: auto;" @error="(e) => e.target.style.display = 'none'" />
            </div>
            <div class="col-6 text-center">
              <h1 class="header-univ-title">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</h1>
              <div class="header-univ-subtitle">VICERRECTORADO ACADÉMICO  •  DIRECCIÓN GENERAL DE TALENTO HUMANO</div>
              <div class="header-doc-title">EXPEDIENTE Y HOJA DE VIDA DIGITAL</div>
              <div class="header-convo-pill">{{ postulacion?.oferta?.convocatoria?.titulo || 'HOJA DE VIDA INSTITUCIONAL' }}</div>
            </div>
            <div class="col-3 flex items-center justify-end">
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="photo-label">FOTOGRAFÍA<br/>DIGITAL:</div>
                  <span v-if="postulacion?.postulante?.foto_perfil_path" class="scan-hint">QR Verificación</span>
                </div>
                <div class="qr-box-header">
                  <QrcodeVue v-if="postulacion?.postulante?.foto_perfil_path" :value="getFileUrl(postulacion.postulante.foto_perfil_path)" :size="75" level="M" render-as="svg" />
                  <div v-else class="qr-placeholder flex items-center justify-center text-xs text-grey-6">SIN FOTO</div>
                </div>
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
              <td class="label">{{ (postulacion?.tipo === 'staff' || postulacion?.rol_id) ? 'CARGO INSTITUCIONAL:' : 'CARGO AL QUE POSTULA:' }}</td>
              <td class="value cargo-value">
                {{ postulacion?.oferta?.cargo?.nombre || postulacion?.rol?.nombre || 'Personal / Postulante' }}
                <span class="sede-text">({{ postulacion?.oferta?.sede?.nombre || postulacion?.sede?.nombre || '---' }})</span>
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
              <td class="label">CORREO PERSONAL:</td>
              <td class="value email-value">{{ postulacion?.postulante?.email }}</td>
            </tr>
            <tr v-if="postulacion?.email || postulacion?.postulante?.email_institucional">
              <td class="label">CORREO INSTITUCIONAL:</td>
              <td class="value" style="color: #663399; font-weight: bold;">
                {{ postulacion?.email || postulacion?.postulante?.email_institucional }}
              </td>
            </tr>
            <tr v-if="postulacion?.postulante?.carta_postulacion_path && !postulacion?.rol_id">
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
                Telf: {{ postulacion?.postulante?.ref_personal_celular }} -
                Relación: {{ postulacion?.postulante?.ref_personal_parentesco }}
              </td>
            </tr>
            <tr v-if="postulacion?.pretension_salarial && !postulacion?.rol_id">
              <td class="label">PRETENSIÓN SALARIAL:</td>
              <td class="value font-bold" style="color: #663399;">
                {{ postulacion?.pretension_salarial ? `${Math.round(Number(postulacion.pretension_salarial)).toLocaleString('de-DE')} Bs.` : '---' }}
              </td>
            </tr>
            <tr v-if="postulacion?.porque_cargo && !postulacion?.rol_id">
              <td class="label">POR QUÉ EL CARGO:</td>
              <td class="value italic">
                {{ postulacion?.porque_cargo }}
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
                  <!-- Insert archivo header right after its related campo (only if after_campo is explicitly set) -->
                  <template v-for="configArch in group.tipo?.config_archivos?.filter(a => a.after_campo && a.after_campo === campo.key)" :key="configArch.id">
                    <th class="qr-col">{{ configArch.label }}</th>
                  </template>
                </template>
                <!-- Archivos without after_campo (null/undefined/empty) go at the end ONCE -->
                <template v-for="configArch in group.tipo?.config_archivos?.filter(a => !a.after_campo || a.after_campo === '')" :key="configArch.id">
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
                  <!-- Insert archivo QR right after its related campo (only if after_campo is explicitly set) -->
                  <template v-for="configArch in group.tipo?.config_archivos?.filter(a => a.after_campo && a.after_campo === campo.key)" :key="configArch.id">
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
                <!-- Archivos without after_campo go at the end ONCE -->
                <template v-for="configArch in group.tipo?.config_archivos?.filter(a => !a.after_campo || a.after_campo === '')" :key="configArch.id">
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
import { generateInstitutionalExpedientePDF } from 'src/utils/institutionalPdfEngine'

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
  if (!props.postulacion) {
    console.error('PDF: No hay datos de postulación')
    return false
  }

  // 1. Primary path: Vectorial Institutional Engine (Crisp, Official UNITEPC Layout, Multi-page)
  try {
    console.log('PDF: Generando con motor vectorial institucional UNITEPC...')
    await generateInstitutionalExpedientePDF({
      postulacion: props.postulacion,
      filteredMeritos: props.filteredMeritos || []
    })
    return true
  } catch (err) {
    console.warn('Fallo motor vectorial institucional, usando fallback html2canvas:', err)
  }

  // 2. Fallback: html2canvas DOM Capture
  pdfContainer.value.style.position = 'absolute'
  pdfContainer.value.style.left = '-9999px'
  pdfContainer.value.style.top = '0'
  pdfContainer.value.style.display = 'block'
  pdfContainer.value.style.zIndex = '-1'

  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [216, 330]
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const usableHeight = pdfHeight - (margin * 2) - 10
    const contentWidth = pdfWidth - (margin * 2)

    let currentY = margin

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

      if (forceNewPage || (currentY + imgHeight > usableHeight && currentY > margin)) {
        pdf.addPage()
        currentY = margin
      }

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight)
      currentY += imgHeight + 5
    }

    await addSection(sectionHeader.value)
    await addSection(sectionDatosPersonales.value)

    for (let i = 0; i < meritSections.value.length; i++) {
      const section = meritSections.value[i]
      if (section) {
        await addSection(section)
      }
    }

    const totalPages = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setDrawColor(74, 21, 75)
      pdf.setLineWidth(0.4)
      pdf.line(margin, pdfHeight - 15, pdfWidth - margin, pdfHeight - 15)

      pdf.setFontSize(8)
      pdf.setTextColor(74, 21, 75)
      pdf.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS • SISTEMA DE SELECCIÓN (SISPO)', pdfWidth / 2, pdfHeight - 10, { align: 'center' })

      pdf.setFontSize(7)
      pdf.setTextColor(100)
      const nowStr = new Date().toLocaleString('es-BO')
      pdf.text(`Expediente #${props.postulacion.id} | Página ${i} de ${totalPages} | Emisión: ${nowStr}`, pdfWidth / 2, pdfHeight - 6, { align: 'center' })
    }

    const p = props.postulacion.postulante
    const nombre = String(p?.nombres || 'Postulante').replace(/[^a-zA-Z]/g, '')
    const ci = String(p?.ci || '0').replace(/[^0-9]/g, '')
    pdf.save(`Expediente_${nombre}_${ci}.pdf`)
    return true
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
  width: 216mm;
  padding: 12mm;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
}

.top-gold-bar {
  height: 4px;
  background: #c5a059;
  border-radius: 2px;
  margin-bottom: 8px;
}

.seccion-reporte {
  width: 100%;
}

/* HEADER CARD */
.header-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
}

.header-univ-title {
  font-size: 16px;
  font-weight: 800;
  color: #4a154b;
  margin: 0;
  line-height: 1.2;
}

.header-univ-subtitle {
  font-size: 8.5px;
  font-weight: 700;
  color: #c5a059;
  margin-top: 3px;
  letter-spacing: 0.4px;
}

.header-doc-title {
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
  margin-top: 4px;
}

.header-convo-pill {
  font-size: 8.5px;
  color: #64748b;
  margin-top: 2px;
}

.section-header {
  background: #4a154b;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 4px 4px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-description {
  font-size: 9px;
  color: #64748b;
  font-style: italic;
  margin: 4px 0 6px 4px;
  text-transform: uppercase;
}

/* PHOTO SECTION */
.photo-label {
  font-size: 9px;
  font-weight: 800;
  color: #4a154b;
}
.scan-hint {
  font-size: 8px;
  color: #0f766e;
  font-weight: 600;
}

/* TABLES */
.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #cbd5e1;
  border-radius: 0 0 4px 4px;
}
.data-table td {
  padding: 5px 10px;
  border: 1px solid #e2e8f0;
  font-size: 10px;
}
.data-table .label {
  width: 32%;
  font-weight: 700;
  color: #4a154b;
  text-align: right;
  background-color: #f8fafc;
}
.name-value {
  font-weight: 800;
  font-size: 12px;
  color: #4a154b;
}
.cargo-value {
  text-transform: uppercase;
  font-weight: 700;
}
.sede-text {
  color: #0f766e;
  margin-left: 6px;
  font-weight: 600;
}
.email-value {
  color: #1e40af;
}

.merit-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #cbd5e1;
}
.merit-table th {
  background-color: #f8fafc;
  color: #4a154b;
  font-weight: 800;
  font-size: 8.5px;
  padding: 6px 4px;
  border: 1px solid #cbd5e1;
  border-bottom: 2px solid #c5a059;
  text-transform: uppercase;
}
.merit-table td {
  padding: 6px 4px;
  border: 1px solid #e2e8f0;
  font-size: 9px;
}
.qr-col {
  width: 25mm;
}
.no-file {
  color: #94a3b8;
  font-style: italic;
  font-size: 8px;
}

/* QR BOXES */
.qr-box-header {
  border: 1px solid #cbd5e1;
  padding: 3px;
  background: white;
  border-radius: 4px;
}
.qr-box-small {
  border: 1px solid #cbd5e1;
  padding: 2px;
  background: white;
  border-radius: 4px;
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
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.flex { display: flex; }
.flex-start { justify-content: flex-start; }
.col-3 { width: 25%; }
.col-4 { width: 33.33%; }
.col-6 { width: 50%; }
.col-8 { width: 66.66%; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.uppercase { text-transform: uppercase; }
.font-bold { font-weight: bold; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.px-10 { padding-left: 40px; padding-right: 40px; }
</style>
