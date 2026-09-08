import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { api } from 'boot/axios'
import logoUnitepcUrl from 'src/assets/logo_unitepc.png'
import escudoUnitepcUrl from 'src/assets/unitepc_escudo.png'

/**
 * Helper to preload an image into an HTMLImageElement
 */
const loadImg = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * Format a date string to DD/MM/YYYY
 */
const formatDate = (d) => {
  if (!d) return '-'
  try {
    const parts = String(d).split('T')[0].split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  } catch {
    // fallback
  }
  return String(d)
}

/**
 * Format cell value for display, automatically transforming ISO dates (e.g. 2018-08-02T00:00:00.000000Z) to DD/MM/YYYY
 */
const formatCellValue = (val) => {
  if (val === null || val === undefined || val === '') return '---'
  const str = String(val).trim()
  if (!str) return '---'

  // Match ISO date format: YYYY-MM-DD or YYYY-MM-DDT...
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return `${d}/${m}/${y}`
  }

  // Match YYYY/MM/DD
  const slashMatch = str.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
  if (slashMatch) {
    const [, y, m, d] = slashMatch
    return `${d}/${m}/${y}`
  }

  return str.toUpperCase()
}

/**
 * Generate an official UNITEPC Evaluation Matrix Report in Landscape Oficio (216x330mm)
 */
export const generateInstitutionalEvaluationPDF = async ({
  convocatoria = {},
  sede = 'TODAS LAS SEDES',
  cargo = 'TODOS LOS CARGOS',
  items = [],
  currentMatriz = null,
  dynamicColumns = [],
  calculateTotal = () => 0
}) => {
  if (!items || items.length === 0) {
    throw new Error('No hay datos para exportar.')
  }

  // Preload institutional images in parallel
  const [escudoImg, logoImg] = await Promise.all([
    loadImg(escudoUnitepcUrl),
    loadImg(logoUnitepcUrl)
  ])

  // Landscape Oficio (Legal: 216mm x 330mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [216, 330]
  })

  const pageWidth = 330
  const pageHeight = 216
  const margin = 10
  const printableWidth = pageWidth - margin * 2 // 310mm

  // Convocatoria Details
  const convoTitle = (convocatoria.titulo || 'CONVOCATORIA PÚBLICA DE MÉRITOS').toUpperCase()
  const convoCode = (convocatoria.codigo_interno || `CONV-${convocatoria.id || 'UNITEPC'}`).toUpperCase()
  const convoGestion = convocatoria.gestion || new Date().getFullYear()
  const convoPeriodo = `${formatDate(convocatoria.fecha_inicio)} al ${formatDate(convocatoria.fecha_cierre)}`
  const sedeStr = (sede || 'TODAS LAS SEDES').toUpperCase()
  const cargoStr = (cargo || 'TODOS LOS CARGOS').toUpperCase()
  const nowStr = new Date().toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })

  // Colors
  const purplePrimary = [74, 21, 75]    // #4A154B
  const purpleSoft = [92, 45, 145]     // #5C2D91
  const goldAccent = [197, 160, 89]     // #C5A059
  const emeraldAccent = [15, 118, 110]  // #0F766E
  const navyAccent = [30, 58, 138]      // #1E3A8A
  const slateDark = [30, 41, 59]        // #1E293B

  // Dynamic Column Setup
  const detailCount = currentMatriz ? dynamicColumns.length : 16
  const totalColumnIndex = 5 + detailCount
  const observationColumnIndex = totalColumnIndex + 1

  const columnStyles = {
    0: { cellWidth: 8, halign: 'center' },
    1: { cellWidth: 44, textColor: purplePrimary, fontStyle: 'bold', halign: 'left' },
    2: { cellWidth: 20, fontSize: 5, halign: 'center' },
    3: { cellWidth: 12, halign: 'center' },
    4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
    [totalColumnIndex]: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
    [observationColumnIndex]: { cellWidth: 40, halign: 'left', fontSize: 5.5 }
  }

  for (let i = 5; i < totalColumnIndex; i++) {
    columnStyles[i] = { cellWidth: currentMatriz ? 9 : 8, halign: 'center' }
  }

  // Header Definition
  const head = currentMatriz
    ? [
        [
          { content: 'NO.', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 6.5, fontStyle: 'bold' } },
          { content: 'NOMBRES Y APELLIDOS', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 7, fontStyle: 'bold' } },
          { content: 'ÁREA FORMACIÓN', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 5.5, fontStyle: 'bold' } },
          { content: 'AÑO TÍTULO', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 5.5, fontStyle: 'bold' } },
          { content: 'PRETENSIÓN SALARIAL', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 5.5, fontStyle: 'bold' } },
          ...currentMatriz.map((sec, sectionIndex) => ({
            content: `${sec.seccion.toUpperCase()} (${sec.criterios.reduce((sum, crit) => sum + (Number(crit.puntaje) || 0), 0)} PTS)`,
            colSpan: sec.criterios.length,
            styles: {
              fillColor: sectionIndex % 2 === 0 ? purpleSoft : emeraldAccent,
              halign: 'center',
              textColor: [255, 255, 255],
              fontSize: 6.5,
              fontStyle: 'bold'
            }
          })),
          { content: 'PUNTAJE FINAL', rowSpan: 2, styles: { fillColor: purplePrimary, valign: 'middle', halign: 'center', textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' } },
          { content: 'OBSERVACIONES', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 7, fontStyle: 'bold' } }
        ],
        dynamicColumns.map((col) => ({
          content: `${col.nombre}\n(${col.puntaje})`,
          styles: {
            fontSize: 4.8,
            halign: 'center',
            textColor: col.sectionIndex % 2 === 0 ? purpleSoft : emeraldAccent
          }
        }))
      ]
    : [
        [
          { content: 'NO.', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 6.5, fontStyle: 'bold' } },
          { content: 'NOMBRES Y APELLIDOS', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 7, fontStyle: 'bold' } },
          { content: 'ÁREA FORMACIÓN', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 5.5, fontStyle: 'bold' } },
          { content: 'AÑO TÍTULO', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 5.5, fontStyle: 'bold' } },
          { content: 'PRETENSIÓN SALARIAL', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 5.5, fontStyle: 'bold' } },
          { content: 'I. FORMACIÓN PROFESIONAL (20 PTS)', colSpan: 4, styles: { fillColor: purplePrimary, halign: 'center', textColor: [255, 255, 255], fontSize: 6.5, fontStyle: 'bold' } },
          { content: 'II. PERFECCIONAMIENTO PROFESIONAL (20 PTS)', colSpan: 4, styles: { fillColor: emeraldAccent, halign: 'center', textColor: [255, 255, 255], fontSize: 6.5, fontStyle: 'bold' } },
          { content: 'III. EXPERIENCIA ACADÉMICA Y LABORAL (50 PTS)', colSpan: 5, styles: { fillColor: navyAccent, halign: 'center', textColor: [255, 255, 255], fontSize: 6.5, fontStyle: 'bold' } },
          { content: 'IV. OTROS MÉRITOS Y PRODUCCIÓN (10 PTS)', colSpan: 3, styles: { fillColor: purpleSoft, halign: 'center', textColor: [255, 255, 255], fontSize: 6.5, fontStyle: 'bold' } },
          { content: 'PUNTAJE TOTAL', rowSpan: 2, styles: { fillColor: purplePrimary, valign: 'middle', halign: 'center', textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' } },
          { content: 'OBSERVACIONES / DICTAMEN', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontSize: 7, fontStyle: 'bold' } }
        ],
        [
          { content: 'DIPLOMADO\n(3)', styles: { fontSize: 5, halign: 'center' } },
          { content: 'ESPECIALIZ.\n(4)', styles: { fontSize: 5, halign: 'center' } },
          { content: 'MAESTRÍA\n(6)', styles: { fontSize: 5, halign: 'center' } },
          { content: 'DOCTORADO\n(7)', styles: { fontSize: 5, halign: 'center' } },
          { content: 'CURSOS ÁREA\n>120 (MAX 9)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'CURSILLOS\n>20 (MAX 5)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'DISERTANTE\nCONG. (MAX 3)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'FORMACIÓN\nPEDAG. (MAX 3)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'EJERCICIO\nPROF. (MAX 15)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'DOCENCIA\nEJER. (MAX 10)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'TUTORÍA\nTESIS (MAX 5)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'DOCENTE\nPOSTG. (MAX 5)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'CARGOS\nSIMIL. (MAX 15)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'REVISTAS\nINDEX. (MAX 3)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'LIBROS/\nTEXTOS (MAX 3)', styles: { fontSize: 4.2, halign: 'center' } },
          { content: 'DISTINCIONES\nHONOR. (MAX 4)', styles: { fontSize: 4.2, halign: 'center' } }
        ]
      ]

  // Body Mapping
  const body = items.map((row, idx) => {
    const detailCells = currentMatriz
      ? dynamicColumns.map((col) => ({
          content: Number(row.evalData?.[col.id] ?? 0),
          styles: {
            textColor: col.sectionIndex % 2 === 0 ? purpleSoft : emeraldAccent,
            fontStyle: 'bold'
          }
        }))
      : [
          { content: row.evalData?.a1_diplomado || 0, styles: { textColor: purplePrimary, fontStyle: 'bold' } },
          { content: row.evalData?.a1_especialidad || 0, styles: { textColor: purplePrimary, fontStyle: 'bold' } },
          { content: row.evalData?.a1_maestria || 0, styles: { textColor: purplePrimary, fontStyle: 'bold' } },
          { content: row.evalData?.a1_doctorado || 0, styles: { textColor: purplePrimary, fontStyle: 'bold' } },
          { content: row.evalData?.a2_cursos_120 || 0, styles: { textColor: emeraldAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a2_cursos_20 || 0, styles: { textColor: emeraldAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a2_disertante || 0, styles: { textColor: emeraldAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a2_pedagogico || 0, styles: { textColor: emeraldAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a3_ejercicio_prof || 0, styles: { textColor: navyAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a3_docencia || 0, styles: { textColor: navyAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a3_tutorias || 0, styles: { textColor: navyAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a3_docente_post || 0, styles: { textColor: navyAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a3_cargos_sim || 0, styles: { textColor: navyAccent, fontStyle: 'bold' } },
          { content: row.evalData?.a4_revistas || 0, styles: { textColor: purpleSoft, fontStyle: 'bold' } },
          { content: row.evalData?.a4_libros || 0, styles: { textColor: purpleSoft, fontStyle: 'bold' } },
          { content: row.evalData?.a4_distinciones || 0, styles: { textColor: purpleSoft, fontStyle: 'bold' } }
        ]

    const total = calculateTotal(row)
    const isApproved = total >= 51

    return [
      idx + 1,
      {
        content: `${row.postulante?.nombres || ''} ${row.postulante?.apellidos || ''}`.toUpperCase(),
        styles: { halign: 'left', fontSize: 6, fontStyle: 'bold', textColor: slateDark }
      },
      { content: (row.extraInfo?.area || '-').toUpperCase(), styles: { fontSize: 5, halign: 'center' } },
      row.extraInfo?.anio || '-',
      `Bs. ${Math.round(row.pretension_salarial || 0)}`,
      ...detailCells,
      {
        content: `${total} PTS ${isApproved ? '✓' : '✗'}`,
        styles: {
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'center',
          textColor: isApproved ? [4, 120, 87] : [185, 28, 28],
          fillColor: isApproved ? [240, 253, 244] : [254, 242, 242]
        }
      },
      { content: (row.evalData?.observaciones || '-').toUpperCase(), styles: { halign: 'left', fontSize: 5 } }
    ]
  })

  // Hook to draw Header & Footer on each page
  autoTable(doc, {
    startY: 42,
    head,
    body,
    theme: 'grid',
    styles: {
      fontSize: 5.5,
      cellPadding: 1.2,
      valign: 'middle',
      halign: 'center',
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: slateDark,
      fontStyle: 'bold',
      lineColor: [203, 213, 225],
      lineWidth: 0.15
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252]
    },
    columnStyles,
    margin: { left: margin, right: margin, bottom: 25 },
    didDrawPage: (data) => {
      // 1. TOP GOLD ACCENT LINE
      doc.setFillColor(...goldAccent)
      doc.rect(margin, 6, printableWidth, 1.2, 'F')

      // 2. HEADER CONTAINER (Card design)
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, 7.5, printableWidth, 31, 2, 2, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.2)
      doc.roundedRect(margin, 7.5, printableWidth, 31, 2, 2, 'S')

      // LOGO EMBEDDING
      if (escudoImg) {
        doc.addImage(escudoImg, 'PNG', margin + 3, 9, 18, 23)
      } else {
        doc.setFillColor(...purplePrimary)
        doc.roundedRect(margin + 3, 10, 18, 20, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('UNITEPC', margin + 12, 21, { align: 'center' })
      }

      // MAIN TITLES
      const textStartX = margin + 25
      doc.setTextColor(...purplePrimary)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS', textStartX, 14)

      doc.setTextColor(...goldAccent)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.text('VICERRECTORADO ACADÉMICO  •  DIRECCIÓN DE TALENTO HUMANO', textStartX, 18.5)

      doc.setTextColor(...slateDark)
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.text('ACTA OFICIAL DE EVALUACIÓN Y CALIFICACIÓN DE MÉRITOS', textStartX, 24)

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(`${convoCode}  •  ${convoTitle.substring(0, 75)}`, textStartX, 29)

      // INFO BADGE (RIGHT SIDE)
      const badgeX = printableWidth - 85

      // LOGO INSTITUCIONAL (CENTER-RIGHT)
      if (logoImg) {
        doc.addImage(logoImg, 'PNG', badgeX - 34, 13, 30, 16)
      }

      doc.setFillColor(248, 245, 255)
      doc.roundedRect(badgeX, 9, 85, 27, 2, 2, 'F')
      doc.setDrawColor(216, 180, 254)
      doc.setLineWidth(0.2)
      doc.roundedRect(badgeX, 9, 85, 27, 2, 2, 'S')

      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...purplePrimary)
      doc.text(`SEDE: ${sedeStr}`, badgeX + 4, 14)
      doc.text(`CARGO: ${cargoStr.substring(0, 38)}`, badgeX + 4, 18.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text(`PERIODO: ${convoPeriodo}`, badgeX + 4, 23)
      doc.text(`EVALUADOS: ${items.length} Postulantes  |  EMISIÓN: ${nowStr}`, badgeX + 4, 27.5)

      // FOOTER
      const footerY = pageHeight - 8
      doc.setDrawColor(203, 213, 225)
      doc.setLineWidth(0.15)
      doc.line(margin, footerY - 4, printableWidth + margin, footerY - 4)

      doc.setFontSize(6)
      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'normal')
      doc.text(
        'Documento Oficial Institucional emitido por el Sistema de Selección y Postulación (SISPO) • Universidad Técnica Privada Cosmos',
        margin,
        footerY
      )
      doc.text(
        `Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`,
        printableWidth + margin,
        footerY,
        { align: 'right' }
      )
    }
  })

  // Check if we have space for the Tribunal signature block on the last page
  const finalY = doc.lastAutoTable.finalY || 100
  let sigY = finalY + 12

  if (sigY + 28 > pageHeight - 15) {
    doc.addPage()
    sigY = 40
  }

  // TRIBUNAL SIGNATURE BLOCK
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...purplePrimary)
  doc.text('CONFORMIDAD DE LA COMISIÓN EVALUADORA DE MÉRITOS', margin + 5, sigY)
  doc.setDrawColor(...goldAccent)
  doc.setLineWidth(0.3)
  doc.line(margin + 5, sigY + 2, margin + 115, sigY + 2)

  const sigColWidth = printableWidth / 3
  const lineY = sigY + 20

  // 3 Signatures
  const signatories = [
    { title: 'Presidente Comisión Evaluadora', subtitle: 'Decanatura / Vicerrectorado Académico' },
    { title: 'Vocal 1 - Especialista de Área', subtitle: 'Dirección de Carrera / Comité Técnico' },
    { title: 'Vocal 2 - Talento Humano', subtitle: 'Dirección General de Talento Humano' }
  ]

  signatories.forEach((sig, sIdx) => {
    const startX = margin + sIdx * sigColWidth + 10
    const endX = startX + sigColWidth - 20
    const midX = (startX + endX) / 2

    doc.setDrawColor(100, 116, 139)
    doc.setLineWidth(0.2)
    doc.line(startX, lineY, endX, lineY)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...slateDark)
    doc.text(sig.title.toUpperCase(), midX, lineY + 4, { align: 'center' })

    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(sig.subtitle, midX, lineY + 7.5, { align: 'center' })
  })

  // Save with clean file name
  const cleanCargo = cargoStr.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25)
  const cleanSede = sedeStr.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 15)
  const fileName = `ACTA_EVALUACION_${cleanCargo}_${cleanSede}_${convoGestion}.pdf`
  doc.save(fileName)
}

/**
 * Helper to cache and generate QR codes as crisp PNG Data URLs
 */
const qrCache = new Map()
const getQrDataUrl = async (text) => {
  if (!text) return null
  if (qrCache.has(text)) return qrCache.get(text)
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 140,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    qrCache.set(text, dataUrl)
    return dataUrl
  } catch (err) {
    console.warn('Error generating QR:', err)
    return null
  }
}

/**
 * Format storage file path to full absolute URL
 */
const getFileUrl = (path) => {
  if (!path) return ''
  const baseUrl = (api?.defaults?.baseURL || '').replace(/\/api$/, '') || 'https://api.sipost.xpertiaplus.com'
  const cleanPath = path.replace(/^\/+/, '').replace(/^storage\//, '')
  return `${baseUrl}/storage/${cleanPath}`
}

/**
 * Roman numerals converter (1 -> I, 2 -> II, etc.)
 */
const romanize = (num) => {
  const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let roman = ''
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i
      num -= lookup[i]
    }
  }
  return roman
}

/**
 * Helper to extract backing file path from a merito item
 */
const getMeritoFile = (merito, configId) => {
  if (!merito?.archivos) return null
  const arch = merito.archivos.find((a) => a.config_archivo_id === configId)
  return arch ? arch.archivo_path : null
}

/**
 * Generate an official UNITEPC Expediente / Hoja de Vida PDF
 * Exact institutional design: Bolivian Oficio (216x330mm), Times typography,
 * corporate purple (#663399) borders, lilac (#f3efff) headers, and embedded QR codes.
 */
export const generateInstitutionalExpedientePDF = async ({
  postulacion = {},
  filteredMeritos = [],
  includeAttachments = false
}) => {
  if (!postulacion || !postulacion.postulante) {
    throw new Error('No se encontraron datos del postulante para generar el expediente.')
  }

  const post = postulacion.postulante || {}
  const fullName = `${post.nombres || ''} ${post.apellidos || ''}`.trim().toUpperCase()
  const cargoName = (postulacion.oferta?.cargo?.nombre || postulacion.rol?.nombre || 'POSTULANTE').toUpperCase()
  const sedeName = (postulacion.oferta?.sede?.nombre || postulacion.sede?.nombre || 'SEDE GENERAL').toUpperCase()
  const convoTitle = (postulacion.oferta?.convocatoria?.titulo || 'HOJA DE VIDA INSTITUCIONAL').toUpperCase()
  const ciFull = `${post.ci || ''} ${post.ci_expedido || ''}`.trim()
  const pretension = postulacion.pretension_salarial
    ? `${Math.round(Number(postulacion.pretension_salarial)).toLocaleString('de-DE')} Bs.`
    : null

  // 1. Collect all URLs to pre-generate QR codes in parallel
  const urlsToFetch = new Set()
  if (post.foto_perfil_path) urlsToFetch.add(getFileUrl(post.foto_perfil_path))
  if (post.ci_archivo_path) urlsToFetch.add(getFileUrl(post.ci_archivo_path))
  if (post.carta_postulacion_path || postulacion.carta_postulacion_path) {
    urlsToFetch.add(getFileUrl(post.carta_postulacion_path || postulacion.carta_postulacion_path))
  }
  if (post.cv_pdf_path) urlsToFetch.add(getFileUrl(post.cv_pdf_path))

  if (Array.isArray(filteredMeritos)) {
    filteredMeritos.forEach((group) => {
      const configArchs = group.tipo?.config_archivos || []
      const items = group.items || []
      items.forEach((m) => {
        configArchs.forEach((ca) => {
          const fPath = getMeritoFile(m, ca.id)
          if (fPath) urlsToFetch.add(getFileUrl(fPath))
        })
      })
    })
  }

  // Pre-load escudo and generate all QR codes in parallel
  const [escudoImg] = await Promise.all([
    loadImg(escudoUnitepcUrl),
    ...Array.from(urlsToFetch).map((url) => getQrDataUrl(url))
  ])

  // Lookups for QR Data URLs
  const fotoQrUrl = post.foto_perfil_path ? await getQrDataUrl(getFileUrl(post.foto_perfil_path)) : null
  const ciQrUrl = post.ci_archivo_path ? await getQrDataUrl(getFileUrl(post.ci_archivo_path)) : null
  const cartaQrUrl = (post.carta_postulacion_path || postulacion.carta_postulacion_path)
    ? await getQrDataUrl(getFileUrl(post.carta_postulacion_path || postulacion.carta_postulacion_path))
    : null
  const cvQrUrl = post.cv_pdf_path ? await getQrDataUrl(getFileUrl(post.cv_pdf_path)) : null

  // Create PDF in Bolivian Oficio (216mm x 330mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [216, 330]
  })

  const pageWidth = 216
  const pageHeight = 330
  const margin = 15
  const printableWidth = pageWidth - margin * 2 // 186mm

  // Official Institutional Palette
  const purplePrimary = [102, 51, 153] // #663399
  const purpleLight = [243, 239, 255]   // #f3efff
  const textDark = [0, 0, 0]
  const textMuted = [102, 102, 102]     // #666666

  // -------------------------------------------------------------
  // SECTION 0: INSTITUTIONAL HEADER (Page 1)
  // -------------------------------------------------------------
  let currentY = 16

  doc.setFont('times', 'bold')
  doc.setFontSize(36)
  doc.setTextColor(...textDark)
  doc.text('UNITEPC', pageWidth / 2, currentY, { align: 'center' })
  currentY += 9

  doc.setFontSize(18)
  doc.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS', pageWidth / 2, currentY, { align: 'center' })
  currentY += 7.5

  doc.setFontSize(14)
  doc.text('CURRICULUM VITAE', pageWidth / 2, currentY, { align: 'center' })
  currentY += 6.5

  doc.setFontSize(13)
  doc.setTextColor(...purplePrimary)
  doc.text(convoTitle, pageWidth / 2, currentY, { align: 'center' })
  currentY += 6

  // Row: Escudo UNITEPC (Left) & Fotografía Personal QR (Right)
  const photoBoxWidth = 24
  const photoBoxHeight = 24
  const photoBoxX = pageWidth - margin - photoBoxWidth
  const photoBoxY = currentY

  // Shield on Left
  if (escudoImg) {
    const origW = escudoImg.naturalWidth || escudoImg.width || 80
    const origH = escudoImg.naturalHeight || escudoImg.height || 100
    const sHeight = Math.min(26, 24 * (origH / origW))
    doc.addImage(escudoImg, 'PNG', margin, photoBoxY, 24, sHeight)
  }

  // Label to the left of the Photo QR box
  doc.setFont('times', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...purplePrimary)
  doc.text('FOTOGRAFÍA\nPERSONAL:', photoBoxX - 4, photoBoxY + 8, { align: 'right' })
  if (post.foto_perfil_path) {
    doc.setFont('times', 'italic')
    doc.setFontSize(7.5)
    doc.text('Escanear QR →', photoBoxX - 4, photoBoxY + 16, { align: 'right' })
  }

  // Photo QR Box
  doc.setDrawColor(...purplePrimary)
  doc.setLineWidth(0.35)
  doc.setFillColor(255, 255, 255)
  doc.rect(photoBoxX, photoBoxY, photoBoxWidth, photoBoxHeight, 'FD')

  if (fotoQrUrl) {
    doc.addImage(fotoQrUrl, 'PNG', photoBoxX + 1.5, photoBoxY + 1.5, photoBoxWidth - 3, photoBoxHeight - 3)
  } else {
    doc.setFont('times', 'italic')
    doc.setFontSize(6.5)
    doc.setTextColor(...textMuted)
    doc.text('Sin fotografía\nregistrada', photoBoxX + photoBoxWidth / 2, photoBoxY + 10, { align: 'center' })
  }

  currentY = photoBoxY + photoBoxHeight + 6

  // -------------------------------------------------------------
  // SECTION I: DATOS PERSONALES
  // -------------------------------------------------------------
  doc.setFont('times', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...textDark)
  doc.text('I. DATOS PERSONALES', margin, currentY)
  currentY += 4

  const personalRows = [
    [
      { content: 'NOMBRE COMPLETO:', styles: { halign: 'right' } },
      { content: fullName, styles: { fontStyle: 'bold', fontSize: 10, textColor: purplePrimary } }
    ],
    [
      {
        content: (postulacion.tipo === 'staff' || postulacion.rol_id) ? 'CARGO INSTITUCIONAL:' : 'CARGO AL QUE POSTULA:',
        styles: { halign: 'right' }
      },
      {
        content: `${cargoName} (${sedeName})`,
        styles: { fontStyle: 'bold', textColor: textDark }
      }
    ],
    [
      { content: 'Nº DE CÉDULA DE IDENTIDAD:', styles: { halign: 'right' } },
      ciFull || '---'
    ],
    [
      { content: 'CÉDULA DE IDENTIDAD:', styles: { halign: 'right' } },
      ciQrUrl
        ? { content: '', _qrImage: ciQrUrl, styles: { minCellHeight: 18, halign: 'center', valign: 'middle' } }
        : { content: '—', styles: { textColor: textMuted, fontStyle: 'italic', halign: 'center' } }
    ],
    [
      { content: 'NACIONALIDAD:', styles: { halign: 'right' } },
      (post.nacionalidad || 'BOLIVIANA').toUpperCase()
    ],
    [
      { content: 'DIRECCIÓN DE DOMICILIO:', styles: { halign: 'right' } },
      (post.direccion_domicilio || '---').toUpperCase()
    ],
    [
      { content: 'Nº DE TELÉFONO DE CONTACTO:', styles: { halign: 'right' } },
      post.celular || '---'
    ],
    [
      { content: 'CORREO PERSONAL:', styles: { halign: 'right' } },
      { content: post.email || '---', styles: { textColor: [30, 64, 175] } }
    ]
  ]

  if (post.email_institucional || postulacion.email) {
    personalRows.push([
      { content: 'CORREO INSTITUCIONAL:', styles: { halign: 'right' } },
      { content: post.email_institucional || postulacion.email, styles: { fontStyle: 'bold', textColor: purplePrimary } }
    ])
  }

  if (post.carta_postulacion_path || postulacion.carta_postulacion_path) {
    personalRows.push([
      { content: 'CARTA DE POSTULACIÓN:', styles: { halign: 'right' } },
      cartaQrUrl
        ? { content: '', _qrImage: cartaQrUrl, styles: { minCellHeight: 18, halign: 'center', valign: 'middle' } }
        : { content: '—', styles: { textColor: textMuted, fontStyle: 'italic', halign: 'center' } }
    ])
  }

  if (post.cv_pdf_path) {
    personalRows.push([
      { content: 'CURRICULUM VITAE:', styles: { halign: 'right' } },
      cvQrUrl
        ? { content: '', _qrImage: cvQrUrl, styles: { minCellHeight: 18, halign: 'center', valign: 'middle' } }
        : { content: '—', styles: { textColor: textMuted, fontStyle: 'italic', halign: 'center' } }
    ])
  }

  personalRows.push([
    { content: 'REFERENCIA PERSONAL:', styles: { halign: 'right' } },
    `Telf: ${post.ref_personal_celular || '---'} - Relación: ${post.ref_personal_parentesco || '---'}`
  ])

  personalRows.push([
    { content: 'REFERENCIA LABORAL:', styles: { halign: 'right' } },
    `Telf: ${post.ref_laboral_celular || '---'} - Institución / Detalle: ${post.ref_laboral_detalle || '---'}`
  ])

  if (pretension && !postulacion.rol_id) {
    personalRows.push([
      { content: 'PRETENSIÓN SALARIAL:', styles: { halign: 'right' } },
      { content: pretension, styles: { fontStyle: 'bold', textColor: purplePrimary } }
    ])
  }

  if (postulacion.porque_cargo && !postulacion.rol_id) {
    personalRows.push([
      { content: 'POR QUÉ EL CARGO:', styles: { halign: 'right' } },
      { content: String(postulacion.porque_cargo), styles: { fontStyle: 'italic' } }
    ])
  }

  autoTable(doc, {
    startY: currentY,
    body: personalRows,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 8.5,
      cellPadding: 1.8,
      lineColor: purplePrimary,
      lineWidth: 0.25,
      textColor: textDark,
      valign: 'middle'
    },
    columnStyles: {
      0: {
        cellWidth: 65,
        fillColor: purpleLight,
        textColor: purplePrimary,
        fontStyle: 'bold',
        halign: 'right'
      },
      1: {
        cellWidth: printableWidth - 65,
        fillColor: [255, 255, 255]
      }
    },
    margin: { left: margin, right: margin, bottom: 22 },
    didDrawCell: (data) => {
      if (data.cell.raw && data.cell.raw._qrImage) {
        const qrDim = 14
        const x = data.cell.x + (data.cell.width - qrDim) / 2
        const y = data.cell.y + (data.cell.height - qrDim) / 2
        doc.addImage(data.cell.raw._qrImage, 'PNG', x, y, qrDim, qrDim)
      }
    }
  })

  let nextY = doc.lastAutoTable.finalY + 8

  // -------------------------------------------------------------
  // DYNAMIC MERIT SECTIONS (II, III, IV...)
  // -------------------------------------------------------------
  for (let idx = 0; idx < filteredMeritos.length; idx++) {
    const group = filteredMeritos[idx]
    const secRoman = romanize(idx + 2)
    const secTitle = `${secRoman}. ${group.tipo?.nombre || 'MÉRITO'}`.toUpperCase()
    const campos = group.tipo?.campos || []
    const configArchs = group.tipo?.config_archivos || []
    const items = group.items || []

    // Build column headers with correct placement of config_archivos
    const cols = []
    campos.forEach((campo) => {
      cols.push({
        type: 'campo',
        key: campo.key,
        label: (campo.label || campo.key).toUpperCase()
      })
      configArchs
        .filter((a) => a.after_campo && a.after_campo === campo.key)
        .forEach((arch) => {
          cols.push({
            type: 'archivo',
            id: arch.id,
            label: (arch.label || 'RESPALDO').toUpperCase()
          })
        })
    })

    configArchs
      .filter((a) => !a.after_campo || a.after_campo === '')
      .forEach((arch) => {
        cols.push({
          type: 'archivo',
          id: arch.id,
          label: (arch.label || 'RESPALDO').toUpperCase()
        })
      })

    // Check if remaining page height is too small for section title + table header
    if (nextY > pageHeight - 50) {
      doc.addPage()
      nextY = 22
    }

    // Section title
    doc.setFont('times', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...textDark)
    doc.text(secTitle, margin, nextY)
    nextY += 4.5

    // Section description (if available)
    if (group.tipo?.descripcion) {
      doc.setFont('times', 'italic')
      doc.setFontSize(7.5)
      doc.setTextColor(...textMuted)
      doc.text(`(${String(group.tipo.descripcion).toUpperCase()})`, margin + 3, nextY)
      nextY += 4
    }

    if (cols.length === 0 || items.length === 0) {
      doc.setFont('times', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(...textMuted)
      doc.text('No se registraron ítems en esta sección.', margin + 3, nextY + 2)
      nextY += 8
      continue
    }

    const headRow = cols.map((c) => c.label)

    // Calculate column widths
    const tableColStyles = {}
    const qrColCount = cols.filter((c) => c.type === 'archivo').length
    const textColCount = cols.length - qrColCount
    const qrColWidth = 24
    const totalQrWidth = qrColCount * qrColWidth
    const remainingWidth = printableWidth - totalQrWidth
    const textColWidth = textColCount > 0 ? remainingWidth / textColCount : 30

    cols.forEach((col, cIdx) => {
      if (col.type === 'archivo') {
        tableColStyles[cIdx] = { cellWidth: qrColWidth, halign: 'center', valign: 'middle' }
      } else {
        tableColStyles[cIdx] = { cellWidth: textColWidth, halign: 'center', valign: 'middle' }
      }
    })

    const bodyRows = []
    for (const merito of items) {
      const rowCells = []
      for (const col of cols) {
        if (col.type === 'campo') {
          const val = merito.respuestas?.[col.key] || '---'
          rowCells.push({
            content: formatCellValue(val),
            styles: { fontStyle: 'bold', fontSize: 7.5 }
          })
        } else {
          const filePath = getMeritoFile(merito, col.id)
          const qrUrl = filePath ? await getQrDataUrl(getFileUrl(filePath)) : null
          if (qrUrl) {
            rowCells.push({
              content: '',
              _qrImage: qrUrl,
              styles: { minCellHeight: 18, halign: 'center', valign: 'middle' }
            })
          } else {
            rowCells.push({
              content: '—',
              styles: { textColor: textMuted, fontStyle: 'italic', halign: 'center' }
            })
          }
        }
      }
      bodyRows.push(rowCells)
    }

    autoTable(doc, {
      startY: nextY,
      head: [headRow],
      body: bodyRows,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 7.5,
        cellPadding: 1.5,
        lineColor: purplePrimary,
        lineWidth: 0.25,
        textColor: textDark,
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: purpleLight,
        textColor: purplePrimary,
        fontStyle: 'bold',
        fontSize: 7.5,
        lineColor: purplePrimary,
        lineWidth: 0.35,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: tableColStyles,
      margin: { left: margin, right: margin, bottom: 22 },
      didDrawCell: (data) => {
        if (data.cell.raw && data.cell.raw._qrImage) {
          const qrDim = 14
          const x = data.cell.x + (data.cell.width - qrDim) / 2
          const y = data.cell.y + (data.cell.height - qrDim) / 2
          doc.addImage(data.cell.raw._qrImage, 'PNG', x, y, qrDim, qrDim)
        }
      }
    })

    nextY = doc.lastAutoTable.finalY + 8
  }

  // -------------------------------------------------------------
  // DECLARACIÓN JURADA Y FIRMAS (Conformidad)
  // -------------------------------------------------------------
  if (nextY > pageHeight - 65) {
    doc.addPage()
    nextY = 25
  }

  doc.setFillColor(...purpleLight)
  doc.setDrawColor(...purplePrimary)
  doc.setLineWidth(0.3)
  doc.rect(margin, nextY, printableWidth, 14, 'FD')

  doc.setFont('times', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...purplePrimary)
  doc.text('DECLARACIÓN JURADA DE VERACIDAD DE INFORMACIÓN Y DOCUMENTOS:', margin + 4, nextY + 4.5)

  doc.setFont('times', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(50, 50, 50)
  doc.text(
    'Declaro bajo juramento que todos los datos y respaldos documentales presentados en esta postulación son auténticos y fidedignos.',
    margin + 4,
    nextY + 8
  )
  doc.text(
    'Autorizo expresamente a la Universidad Técnica Privada Cosmos a verificar y contrastar la veracidad de la información consignada.',
    margin + 4,
    nextY + 11.5
  )

  const sigY = nextY + 34
  const colW = printableWidth / 2

  // Firma Postulante
  doc.setDrawColor(...purplePrimary)
  doc.setLineWidth(0.3)
  doc.line(margin + 15, sigY, margin + colW - 15, sigY)

  doc.setFont('times', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...textDark)
  doc.text('FIRMA DEL POSTULANTE', margin + colW / 2, sigY + 4.5, { align: 'center' })

  doc.setFont('times', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...textMuted)
  doc.text(fullName, margin + colW / 2, sigY + 8, { align: 'center' })
  doc.text(`C.I. ${ciFull}`, margin + colW / 2, sigY + 11.5, { align: 'center' })

  // Firma Dirección Talento Humano
  const recX = margin + colW
  doc.line(recX + 15, sigY, recX + colW - 15, sigY)

  doc.setFont('times', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...textDark)
  doc.text('DIRECCIÓN DE TALENTO HUMANO', recX + colW / 2, sigY + 4.5, { align: 'center' })

  doc.setFont('times', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...textMuted)
  doc.text('RECEPCIÓN Y REVISIÓN DOCUMENTAL', recX + colW / 2, sigY + 8, { align: 'center' })
  doc.text('UNITEPC - SISPO', recX + colW / 2, sigY + 11.5, { align: 'center' })

  // -------------------------------------------------------------
  // INSTITUTIONAL FOOTER ON EVERY PAGE
  // -------------------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages()
  const now = new Date()
  const d = now.getDate().toString().padStart(2, '0')
  const m = (now.getMonth() + 1).toString().padStart(2, '0')
  const y = now.getFullYear()
  const hh = now.getHours().toString().padStart(2, '0')
  const mm = now.getMinutes().toString().padStart(2, '0')
  const dateStr = `${d}-${m}-${y} ${hh}:${mm}`

  for (let pIdx = 1; pIdx <= totalPages; pIdx++) {
    doc.setPage(pIdx)

    doc.setDrawColor(...purplePrimary)
    doc.setLineWidth(0.4)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

    doc.setFont('times', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...purplePrimary)
    doc.text('SISTEMA DE GESTIÓN DE CONVOCATORIAS UNITEPC', pageWidth / 2, pageHeight - 10, { align: 'center' })

    doc.setFont('times', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...textMuted)
    const footerInfo = `Expediente #${postulacion.id || ''} | Página ${pIdx} de ${totalPages} | Generado: ${dateStr}`
    doc.text(footerInfo, pageWidth / 2, pageHeight - 6, { align: 'center' })
  }

  // Canonical file names
  const nombreClean = String(post.nombres || 'Postulante').replace(/[^a-zA-Z]/g, '')
  const ciClean = String(post.ci || '0').replace(/[^0-9]/g, '')
  const baseFilename = `HojaDeVida_${nombreClean}_${ciClean}.pdf`
  const fullFilename = `Expediente_${nombreClean}_${ciClean}.pdf`

  // Mode: CV only (Instant ~200KB, 100% vector)
  if (!includeAttachments) {
    doc.save(baseFilename)
    return true
  }

  // Mode: Full Expediente with merged backing documents (pdf-lib)
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib/dist/pdf-lib.esm.js')
    const { saveAs } = await import('file-saver')

    const attachments = []
    if (post.ci_archivo_path) {
      attachments.push({ label: 'CÉDULA DE IDENTIDAD (C.I.)', path: post.ci_archivo_path })
    }
    if (postulacion.carta_postulacion_path || post.carta_postulacion_path) {
      attachments.push({
        label: 'CARTA DE POSTULACIÓN',
        path: postulacion.carta_postulacion_path || post.carta_postulacion_path
      })
    }
    if (post.cv_pdf_path) {
      attachments.push({ label: 'CURRICULUM VITAE ADJUNTO', path: post.cv_pdf_path })
    }

    if (Array.isArray(filteredMeritos)) {
      filteredMeritos.forEach((group) => {
        const secName = (group.tipo?.nombre || 'MÉRITO').toUpperCase()
        if (Array.isArray(group.items)) {
          group.items.forEach((item, itemIdx) => {
            const itemDesc =
              item.respuestas?.titulo ||
              item.respuestas?.carrera ||
              item.respuestas?.profesion ||
              item.respuestas?.institucion ||
              `Ítem ${itemIdx + 1}`
            if (Array.isArray(item.archivos)) {
              item.archivos.forEach((arch) => {
                if (arch.archivo_path) {
                  const configArch = group.tipo?.config_archivos?.find((a) => a.id === arch.config_archivo_id)
                  const archLabel = configArch?.label || 'Respaldo'
                  attachments.push({
                    label: `${secName}: ${archLabel.toUpperCase()} (${String(itemDesc).toUpperCase()})`,
                    path: arch.archivo_path
                  })
                }
              })
            }
          })
        }
      })
    }

    if (attachments.length === 0) {
      doc.save(baseFilename)
      return true
    }

    const cvBytes = doc.output('arraybuffer')
    const mergedPdf = await PDFDocument.load(cvBytes)
    const helveticaFont = await mergedPdf.embedFont(StandardFonts.HelveticaBold)
    const helveticaNormal = await mergedPdf.embedFont(StandardFonts.Helvetica)

    // Separator page in Bolivian Oficio (612 x 935 pt)
    const sepPage = mergedPdf.addPage([612, 935])
    const { width: sW, height: sH } = sepPage.getSize()

    // Purple banner box
    sepPage.drawRectangle({
      x: 40,
      y: sH - 120,
      width: sW - 80,
      height: 65,
      color: rgb(0.4, 0.2, 0.6) // #663399
    })

    sepPage.drawText('DOCUMENTOS DE RESPALDO Y ANEXOS', {
      x: 55,
      y: sH - 85,
      size: 16,
      font: helveticaFont,
      color: rgb(1, 1, 1)
    })

    sepPage.drawText(`POSTULANTE: ${fullName}`, {
      x: 55,
      y: sH - 105,
      size: 10,
      font: helveticaNormal,
      color: rgb(0.95, 0.95, 0.95)
    })

    let listY = sH - 155
    sepPage.drawText('ÍNDICE DE RESPALDOS ADJUNTOS EN ESTE EXPEDIENTE:', {
      x: 45,
      y: listY,
      size: 11,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2)
    })
    listY -= 24

    attachments.forEach((att, aIdx) => {
      if (listY > 60) {
        sepPage.drawText(`${aIdx + 1}. ${att.label.substring(0, 85)}`, {
          x: 55,
          y: listY,
          size: 9,
          font: helveticaNormal,
          color: rgb(0.3, 0.3, 0.3)
        })
        listY -= 18
      }
    })

    // Parallel concurrent download of backing files
    const downloadPromises = attachments.map(async (att, index) => {
      if (!att.path) return null
      const cleanPath = att.path.replace(/^\/+/, '').replace(/^storage\//, '')
      let fileBytes = null
      let contentType = ''
      try {
        const res = await api.get(`/files/stream?path=${encodeURIComponent(cleanPath)}`, {
          responseType: 'arraybuffer'
        })
        fileBytes = new Uint8Array(res.data)
        contentType = String(res.headers['content-type'] || '').toLowerCase()
      } catch {
        try {
          const fallbackUrl = getFileUrl(att.path)
          const res2 = await fetch(fallbackUrl)
          if (res2.ok) {
            fileBytes = new Uint8Array(await res2.arrayBuffer())
            contentType = String(res2.headers.get('content-type') || '').toLowerCase()
          }
        } catch (fetchErr) {
          console.warn('Fallback fetch failed:', fetchErr)
        }
      }
      if (!fileBytes || fileBytes.length === 0) return null
      return { att, index, fileBytes, contentType, cleanPath }
    })

    const downloadedItems = await Promise.all(downloadPromises)

    for (const item of downloadedItems) {
      if (!item) continue
      const { att, index: i, fileBytes, contentType, cleanPath } = item
      const isPdfFile = cleanPath.toLowerCase().endsWith('.pdf') || contentType.includes('pdf')

      if (isPdfFile) {
        try {
          const donorPdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
          const pageIndices = donorPdf.getPageIndices()
          const copiedPages = await mergedPdf.copyPages(donorPdf, pageIndices)

          copiedPages.forEach((page, pIdx) => {
            const { width: pW, height: pH } = page.getSize()
            page.drawRectangle({
              x: 0,
              y: pH - 20,
              width: pW,
              height: 20,
              color: rgb(0.4, 0.2, 0.6)
            })
            page.drawText(
              `RESPALDO ${i + 1}: ${att.label.substring(0, 75)} (Pág. ${pIdx + 1}/${copiedPages.length})`,
              {
                x: 14,
                y: pH - 14,
                size: 8,
                font: helveticaFont,
                color: rgb(1, 1, 1)
              }
            )
            mergedPdf.addPage(page)
          })
        } catch (pdfErr) {
          console.warn('Could not merge backing PDF:', pdfErr)
        }
      } else {
        // Image attachment
        try {
          let embeddedImg = null
          try {
            embeddedImg = await mergedPdf.embedJpg(fileBytes)
          } catch {
            try {
              embeddedImg = await mergedPdf.embedPng(fileBytes)
            } catch (pngErr) {
              console.warn('Could not embed png image:', pngErr)
            }
          }

          if (embeddedImg) {
            const imgPage = mergedPdf.addPage([612, 935])
            const { width: ipW, height: ipH } = imgPage.getSize()

            imgPage.drawRectangle({
              x: 0,
              y: ipH - 30,
              width: ipW,
              height: 30,
              color: rgb(0.4, 0.2, 0.6)
            })
            imgPage.drawText(`RESPALDO ${i + 1}: ${att.label.substring(0, 75)}`, {
              x: 16,
              y: ipH - 16,
              size: 8.5,
              font: helveticaFont,
              color: rgb(1, 1, 1)
            })
            imgPage.drawText(`UNITEPC • Postulante: ${fullName} • C.I. ${ciFull}`, {
              x: 16,
              y: ipH - 26,
              size: 6.5,
              font: helveticaNormal,
              color: rgb(0.9, 0.9, 0.9)
            })

            const maxW = ipW - 32
            const maxH = ipH - 52
            const { width: drawW, height: drawH } = embeddedImg.scaleToFit(maxW, maxH)

            imgPage.drawImage(embeddedImg, {
              x: (ipW - drawW) / 2,
              y: (maxH - drawH) / 2 + 10,
              width: drawW,
              height: drawH
            })
          }
        } catch (imgErr) {
          console.warn('Could not embed backing image:', imgErr)
        }
      }
    }

    const mergedBytes = await mergedPdf.save()
    const blob = new Blob([mergedBytes], { type: 'application/pdf' })
    saveAs(blob, fullFilename)
    return true
  } catch (mergeErr) {
    console.warn('Fallback to light Hoja de Vida due to merge error:', mergeErr)
    doc.save(baseFilename)
    return true
  }
}

