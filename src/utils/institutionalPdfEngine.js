import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
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

      // LOGO INSTITUCIONAL (CENTER-RIGHT)
      if (logoImg) {
        doc.addImage(logoImg, 'PNG', badgeX - 34, 13, 30, 16)
      }

      // INFO BADGE (RIGHT SIDE)
      const badgeX = printableWidth - 85
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
 * Generate an official UNITEPC Expediente / Hoja de Vida PDF in Portrait A4 (210x297mm)
 */
export const generateInstitutionalExpedientePDF = async ({
  postulacion = {},
  filteredMeritos = []
}) => {
  if (!postulacion || !postulacion.postulante) {
    throw new Error('No se encontraron datos del postulante para generar el expediente.')
  }

  const [escudoImg, logoImg] = await Promise.all([
    loadImg(escudoUnitepcUrl),
    loadImg(logoUnitepcUrl)
  ])

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 12
  const printableWidth = pageWidth - margin * 2 // 186mm

  // Colors
  const purplePrimary = [74, 21, 75]    // #4A154B
  const purpleSoft = [92, 45, 145]     // #5C2D91
  const goldAccent = [197, 160, 89]     // #C5A059
  const emeraldAccent = [15, 118, 110]  // #0F766E
  const slateDark = [30, 41, 59]        // #1E293B
  const grayBorder = [226, 232, 240]

  const post = postulacion.postulante || {}
  const fullName = `${post.nombres || ''} ${post.apellidos || ''}`.trim().toUpperCase()
  const cargoName = (postulacion.oferta?.cargo?.nombre || postulacion.rol?.nombre || 'POSTULANTE').toUpperCase()
  const sedeName = (postulacion.oferta?.sede?.nombre || postulacion.sede?.nombre || 'SEDE GENERAL').toUpperCase()
  const convoTitle = (postulacion.oferta?.convocatoria?.titulo || 'CONVOCATORIA INSTITUCIONAL').toUpperCase()
  const convoCode = (postulacion.oferta?.convocatoria?.codigo_interno || `CONV-${postulacion.oferta?.convocatoria?.id || 'UNITEPC'}`).toUpperCase()
  const ciFull = `${post.ci || ''} ${post.ci_expedido || ''}`.trim()
  const pretension = postulacion.pretension_salarial
    ? `Bs. ${Math.round(Number(postulacion.pretension_salarial)).toLocaleString('de-DE')}`
    : 'No especificada'

  const drawHeaderAndFooter = (data) => {
    // 1. Top gold accent line
    doc.setFillColor(...goldAccent)
    doc.rect(margin, 8, printableWidth, 1.2, 'F')

    // 2. Header frame
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(margin, 9.5, printableWidth, 26, 2, 2, 'F')
    doc.setDrawColor(...grayBorder)
    doc.setLineWidth(0.2)
    doc.roundedRect(margin, 9.5, printableWidth, 26, 2, 2, 'S')

    // 3. Escudo & Logo
    if (escudoImg) {
      doc.addImage(escudoImg, 'PNG', margin + 3, 11, 15, 22)
    }
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', pageWidth - margin - 35, 12, 32, 18)
    }

    // 4. University Header Text
    const textStartX = margin + (escudoImg ? 22 : 4)
    doc.setTextColor(...purplePrimary)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS', textStartX, 15)

    doc.setTextColor(...goldAccent)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.text('VICERRECTORADO ACADÉMICO  •  DIRECCIÓN DE TALENTO HUMANO', textStartX, 19)

    doc.setTextColor(...slateDark)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('EXPEDIENTE Y HOJA DE VIDA DIGITAL', textStartX, 24)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${convoCode}  •  ${convoTitle.substring(0, 65)}`, textStartX, 28.5)

    // 5. Footer on each page
    const footerY = pageHeight - 10
    doc.setDrawColor(...grayBorder)
    doc.setLineWidth(0.2)
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3)

    doc.setFontSize(6)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'Documento Institucional Oficial • Sistema de Selección y Postulación (SISPO) • UNITEPC',
      margin,
      footerY + 1
    )
    doc.text(
      `Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`,
      pageWidth - margin,
      footerY + 1,
      { align: 'right' }
    )
  }

  // 1. CANDIDATE HERO BANNER
  doc.setFillColor(248, 245, 255)
  doc.roundedRect(margin, 38, printableWidth, 24, 2, 2, 'F')
  doc.setDrawColor(216, 180, 254)
  doc.setLineWidth(0.2)
  doc.roundedRect(margin, 38, printableWidth, 24, 2, 2, 'S')

  doc.setTextColor(...purplePrimary)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(fullName, margin + 5, 45)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...emeraldAccent)
  doc.text(`POSTULACIÓN A: ${cargoName} — ${sedeName}`, margin + 5, 50.5)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...slateDark)
  doc.text(`C.I.: ${ciFull || 'No registrado'}    |    Nacionalidad: ${(post.nacionalidad || 'Boliviana').toUpperCase()}    |    Pretensión: ${pretension}`, margin + 5, 55.5)
  doc.text(`Contacto: ${post.celular || '-'}    |    Email: ${post.email || '-'}    |    Domicilio: ${(post.direccion_domicilio || '-').substring(0, 50)}`, margin + 5, 59.5)

  // 2. SECTION I: DATOS PERSONALES
  const personalTableData = [
    [{ content: 'NOMBRE COMPLETO', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, fullName],
    [{ content: 'CÉDULA DE IDENTIDAD', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, ciFull],
    [{ content: 'CARGO POSTULADO', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, `${cargoName} (${sedeName})`],
    [{ content: 'NACIONALIDAD', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, (post.nacionalidad || 'Boliviana').toUpperCase()],
    [{ content: 'DIRECCIÓN DOMICILIO', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, (post.direccion_domicilio || 'No especificada').toUpperCase()],
    [{ content: 'TELÉFONO / CELULAR', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, post.celular || 'No registrado'],
    [{ content: 'CORREO ELECTRÓNICO', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, post.email || 'No registrado'],
    [{ content: 'CORREO INSTITUCIONAL', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, post.email_institucional || postulacion.email || 'Pendiente de asignación'],
    [{ content: 'PRETENSIÓN SALARIAL', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, pretension],
    [{ content: 'REFERENCIA PERSONAL', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, `${post.ref_personal_celular || 'Sin cel.'} - Relación: ${post.ref_personal_parentesco || 'No especificada'}`],
    [{ content: 'MOTIVACIÓN / POR QUÉ EL CARGO', styles: { fontStyle: 'bold', textColor: purplePrimary, fillColor: [248, 245, 255] } }, postulacion.porque_cargo || 'Declarado en formulario de méritos']
  ]

  autoTable(doc, {
    startY: 65,
    head: [[{ content: 'I. ANTECEDENTES Y DATOS PERSONALES DEL POSTULANTE', colSpan: 2, styles: { fillColor: purplePrimary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5, halign: 'left' } }]],
    body: personalTableData,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      lineColor: grayBorder,
      lineWidth: 0.15
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: printableWidth - 55 }
    },
    margin: { left: margin, right: margin, bottom: 20 },
    didDrawPage: drawHeaderAndFooter
  })

  // 3. DYNAMIC MERIT SECTIONS
  let startY = doc.lastAutoTable.finalY + 8

  const romanNumerals = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

  filteredMeritos.forEach((group, idx) => {
    const secRoman = romanNumerals[idx] || `${idx + 2}`
    const secTitle = `${secRoman}. ${group.tipo?.nombre || 'MÉRITOS Y EXPERIENCIA'}`.toUpperCase()
    const campos = group.tipo?.campos || []
    const items = group.items || []

    // If too close to page bottom, add page
    if (startY > pageHeight - 45) {
      doc.addPage()
      startY = 40
    }

    if (campos.length > 0 && items.length > 0) {
      const headers = ['#', ...campos.map(c => (c.label || c.name || c.key || '').toUpperCase())]
      const rows = items.map((item, iIdx) => [
        iIdx + 1,
        ...campos.map(c => {
          const val = item.respuestas?.[c.key] ?? item.respuestas?.[c.name] ?? '-'
          return String(val || '-').toUpperCase()
        })
      ])

      autoTable(doc, {
        startY,
        head: [
          [{ content: secTitle, colSpan: headers.length, styles: { fillColor: idx % 2 === 0 ? purpleSoft : emeraldAccent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'left' } }],
          headers.map(h => ({ content: h, styles: { fillColor: [248, 250, 252], textColor: slateDark, fontStyle: 'bold', fontSize: 6.5, halign: 'center' } }))
        ],
        body: rows,
        theme: 'grid',
        styles: {
          fontSize: 6.5,
          cellPadding: 1.5,
          halign: 'center',
          valign: 'middle',
          lineColor: grayBorder,
          lineWidth: 0.15
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' }
        },
        margin: { left: margin, right: margin, bottom: 20 },
        didDrawPage: drawHeaderAndFooter
      })

      startY = doc.lastAutoTable.finalY + 8
    }
  })

  // 4. DECLARACIÓN JURADA Y FIRMAS (Always on bottom or new page if needed)
  if (startY > pageHeight - 55) {
    doc.addPage()
    startY = 40
  }

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, startY, printableWidth, 14, 1.5, 1.5, 'F')
  doc.setDrawColor(...grayBorder)
  doc.setLineWidth(0.2)
  doc.roundedRect(margin, startY, printableWidth, 14, 1.5, 1.5, 'S')

  doc.setFontSize(6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...purplePrimary)
  doc.text('DECLARACIÓN JURADA DE VERACIDAD DE INFORMACIÓN Y DOCUMENTOS:', margin + 4, startY + 4.5)

  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(
    'Declaro bajo juramento que todos los datos y respaldos documentales presentados en esta postulación son auténticos y fidedignos.',
    margin + 4,
    startY + 8
  )
  doc.text(
    'Autorizo expresamente a la Universidad Técnica Privada Cosmos a verificar y contrastar la veracidad de la información consignada.',
    margin + 4,
    startY + 11.5
  )

  // Signatures
  const sigY = startY + 32
  const colW = printableWidth / 2

  // Postulante signature line
  doc.setDrawColor(100, 116, 139)
  doc.setLineWidth(0.2)
  doc.line(margin + 15, sigY, margin + colW - 15, sigY)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...slateDark)
  doc.text('FIRMA DEL POSTULANTE', margin + colW / 2, sigY + 4, { align: 'center' })
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text(fullName, margin + colW / 2, sigY + 7.5, { align: 'center' })
  doc.text(`C.I. ${ciFull}`, margin + colW / 2, sigY + 10.5, { align: 'center' })

  // Reception signature line
  const recX = margin + colW
  doc.line(recX + 15, sigY, recX + colW - 15, sigY)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...slateDark)
  doc.text('DIRECCIÓN DE TALENTO HUMANO', recX + colW / 2, sigY + 4, { align: 'center' })
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('RECEPCIÓN Y REVISIÓN DOCUMENTAL', recX + colW / 2, sigY + 7.5, { align: 'center' })
  doc.text('UNITEPC - SISPO', recX + colW / 2, sigY + 10.5, { align: 'center' })

  const cleanName = fullName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)
  const filename = `EXPEDIENTE_${cleanName}_${ciFull.replace(/[^0-9]/g, '')}.pdf`
  doc.save(filename)
}
