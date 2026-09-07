import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * Convert 1-based column index to Excel column name (1 -> A, 27 -> AA)
 */
export const toExcelColumnName = (colIndex) => {
  let temp = colIndex
  let letter = ''
  while (temp > 0) {
    const mod = (temp - 1) % 26
    letter = String.fromCharCode(65 + mod) + letter
    temp = Math.floor((temp - mod) / 26)
  }
  return letter
}

/**
 * Format date string to DD/MM/YYYY
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

// Brand Palette (ARGB for ExcelJS)
const COLORS = {
  purplePrimary: 'FF4A154B', // UNITEPC Imperial Purple
  purpleSoft: 'FF5C2D91',    // UNITEPC Purple Medium
  goldAccent: 'FFC5A059',    // UNITEPC Academic Gold
  emeraldAccent: 'FF0F766E', // Institutional Teal/Emerald
  navyAccent: 'FF1E3A8A',    // Classic Navy
  slateDark: 'FF1E293B',     // Charcoal Text
  slateLight: 'FFF8FAFC',    // Soft row fill
  headerFill: 'FFF1F5F9',    // Light gray header
  borderLight: 'FFCBD5E1',   // Clean border
  borderSoft: 'FFE2E8F0',
  white: 'FFFFFFFF',
  approvedFill: 'FFDCFCE7',  // Soft green
  approvedText: 'FF166534',
  failedFill: 'FFFEE2E2',    // Soft red
  failedText: 'FF991B1B'
}

/**
 * Export Institutional Evaluation Matrix in Excel with UNITEPC branding
 */
export const exportInstitutionalMatrixExcel = async ({
  convocatoria = {},
  sede = 'TODAS LAS SEDES',
  cargo = 'TODOS LOS CARGOS',
  items = [],
  currentMatriz = null,
  dynamicColumns = [],
  calculateTotal = () => 0
}) => {
  if (!items || items.length === 0) {
    throw new Error('No hay postulantes para exportar en este filtro.')
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'UNITEPC - SISPO'
  workbook.lastModifiedBy = 'SISPO Automatización'
  workbook.created = new Date()

  const sedeStr = (sede || 'SEDE GENERAL').toUpperCase()
  const cargoStr = (cargo || 'TODOS LOS CARGOS').toUpperCase()
  const convoTitle = (convocatoria.titulo || 'CONVOCATORIA PÚBLICA DE MÉRITOS').toUpperCase()
  const convoCode = (convocatoria.codigo_interno || `CONV-${convocatoria.id || 'UNITEPC'}`).toUpperCase()
  const convoGestion = convocatoria.gestion || new Date().getFullYear()
  const convoPeriodo = `${formatDate(convocatoria.fecha_inicio)} al ${formatDate(convocatoria.fecha_cierre)}`
  const nowStr = new Date().toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })

  const sheetName = `${sedeStr.substring(0, 10)}_${cargoStr.substring(0, 15)}`
    .replace(/[\\/*?:[\]]/g, '')
    .substring(0, 31)

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  })

  // 1. Core Header Setup
  const header1 = ['NO.', 'NOMBRES Y APELLIDOS', 'ÁREA FORMACIÓN', 'AÑO TÍTULO', 'PRETENSIÓN SALARIAL (BS)']
  const header2 = ['', '', '', '', '']
  const headerRowIdx1 = 6
  const headerRowIdx2 = 7
  const merges = [
    `A${headerRowIdx1}:A${headerRowIdx2}`,
    `B${headerRowIdx1}:B${headerRowIdx2}`,
    `C${headerRowIdx1}:C${headerRowIdx2}`,
    `D${headerRowIdx1}:D${headerRowIdx2}`,
    `E${headerRowIdx1}:E${headerRowIdx2}`
  ]

  let currentColumn = 6
  const sectionColumnRanges = []

  if (currentMatriz && currentMatriz.length > 0) {
    currentMatriz.forEach((section, sIdx) => {
      const startColumn = currentColumn
      const sectionPts = section.criterios.reduce((sum, crit) => sum + (Number(crit.puntaje) || 0), 0)
      header1.push(`${section.seccion.toUpperCase()} (${sectionPts} PTS)`)
      header2.push(...section.criterios.map((crit) => `${crit.nombre}\n(${crit.puntaje})`))

      for (let i = 1; i < section.criterios.length; i++) header1.push('')
      const endColumn = startColumn + section.criterios.length - 1
      if (endColumn > startColumn) {
        merges.push(`${toExcelColumnName(startColumn)}${headerRowIdx1}:${toExcelColumnName(endColumn)}${headerRowIdx1}`)
      }
      sectionColumnRanges.push({
        start: startColumn,
        end: endColumn,
        color: sIdx % 2 === 0 ? COLORS.purpleSoft : COLORS.emeraldAccent
      })
      currentColumn = endColumn + 1
    })
  } else {
    // Default 4-section format
    header1.push(
      'I. FORMACIÓN PROFESIONAL (20 PTS)', '', '', '',
      'II. PERFECCIONAMIENTO PROFESIONAL (20 PTS)', '', '', '',
      'III. EXPERIENCIA ACADÉMICA Y LABORAL (50 PTS)', '', '', '', '',
      'IV. OTROS MÉRITOS Y PRODUCCIÓN (10 PTS)', '', ''
    )
    header2.push(
      'DIPLOMADO\n(3)', 'ESPECIALIZ.\n(4)', 'MAESTRÍA\n(6)', 'DOCTORADO\n(7)',
      'CURSOS >120\n(MAX 9)', 'CURSILLOS >20\n(MAX 5)', 'DISERTANTE\n(MAX 3)', 'PEDAGÓGICO\n(MAX 3)',
      'EJERCICIO PROF.\n(MAX 15)', 'DOCENCIA\n(MAX 10)', 'TUTORÍA\n(MAX 5)', 'POSTGRADO\n(MAX 5)', 'CARGOS SIMIL.\n(MAX 15)',
      'REVISTAS\n(MAX 3)', 'LIBROS\n(MAX 3)', 'DISTINCIONES\n(MAX 4)'
    )
    merges.push(
      `F${headerRowIdx1}:I${headerRowIdx1}`,
      `J${headerRowIdx1}:M${headerRowIdx1}`,
      `N${headerRowIdx1}:R${headerRowIdx1}`,
      `S${headerRowIdx1}:U${headerRowIdx1}`
    )
    sectionColumnRanges.push(
      { start: 6, end: 9, color: COLORS.purplePrimary },
      { start: 10, end: 13, color: COLORS.emeraldAccent },
      { start: 14, end: 18, color: COLORS.navyAccent },
      { start: 19, end: 21, color: COLORS.purpleSoft }
    )
    currentColumn = 22
  }

  const finalScoreCol = currentColumn
  const obsCol = currentColumn + 1
  header1.push('PUNTAJE FINAL', 'OBSERVACIONES Y DICTAMEN')
  header2.push('', '')
  merges.push(
    `${toExcelColumnName(finalScoreCol)}${headerRowIdx1}:${toExcelColumnName(finalScoreCol)}${headerRowIdx2}`,
    `${toExcelColumnName(obsCol)}${headerRowIdx1}:${toExcelColumnName(obsCol)}${headerRowIdx2}`
  )

  const lastColLetter = toExcelColumnName(obsCol)

  // 2. INSTITUTIONAL BANNER (Rows 1-4)
  // Row 1: University Name & SISPO
  worksheet.mergeCells(`A1:${lastColLetter}1`)
  const row1 = worksheet.getCell('A1')
  row1.value = 'UNIVERSIDAD TÉCNICA PRIVADA COSMOS  •  SISTEMA DE SELECCIÓN Y POSTULACIÓN (SISPO)'
  row1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: COLORS.white } }
  row1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.purplePrimary } }
  row1.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(1).height = 32

  // Row 2: Sub-banner Gold
  worksheet.mergeCells(`A2:${lastColLetter}2`)
  const row2 = worksheet.getCell('A2')
  row2.value = 'VICERRECTORADO ACADÉMICO  •  DIRECCIÓN DE TALENTO HUMANO  •  ACTA OFICIAL DE EVALUACIÓN Y CALIFICACIÓN DE MÉRITOS'
  row2.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: COLORS.slateDark } }
  row2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldAccent } }
  row2.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(2).height = 20

  // Row 3: Convocatoria Title & Code
  worksheet.mergeCells(`A3:${lastColLetter}3`)
  const row3 = worksheet.getCell('A3')
  row3.value = `CONVOCATORIA: [${convoCode}] ${convoTitle}  |  GESTIÓN: ${convoGestion}  |  PERIODO: ${convoPeriodo}`
  row3.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.purplePrimary } }
  row3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3EFF7' } }
  row3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  worksheet.getRow(3).height = 20

  // Row 4: Sede, Cargo, Emisión
  worksheet.mergeCells(`A4:${lastColLetter}4`)
  const row4 = worksheet.getCell('A4')
  row4.value = `SEDE: ${sedeStr}    |    CARGO: ${cargoStr}    |    POSTULANTES EVALUADOS: ${items.length}    |    EMISIÓN: ${nowStr}`
  row4.font = { name: 'Calibri', size: 8.5, color: { argb: COLORS.slateDark } }
  row4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
  row4.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  worksheet.getRow(4).height = 18

  // Row 5: Spacer
  worksheet.getRow(5).height = 8

  // 3. TABLE HEADERS (Rows 6 & 7)
  worksheet.addRow(header1)
  worksheet.addRow(header2)
  worksheet.getRow(headerRowIdx1).height = 22
  worksheet.getRow(headerRowIdx2).height = 30

  // Apply header merges
  merges.forEach((m) => worksheet.mergeCells(m))

  // Style Header Cells
  for (let c = 1; c <= obsCol; c++) {
    const colLetter = toExcelColumnName(c)
    const cellA = worksheet.getCell(`${colLetter}${headerRowIdx1}`)
    const cellB = worksheet.getCell(`${colLetter}${headerRowIdx2}`)

    // Default borders
    const borderStyle = {
      top: { style: 'thin', color: { argb: COLORS.borderLight } },
      left: { style: 'thin', color: { argb: COLORS.borderLight } },
      bottom: { style: 'thin', color: { argb: COLORS.borderLight } },
      right: { style: 'thin', color: { argb: COLORS.borderLight } }
    }
    cellA.border = borderStyle
    cellB.border = borderStyle

    // Default alignment
    cellA.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cellB.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }

    // Core columns (A-E)
    if (c <= 5) {
      cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerFill } }
      cellA.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.slateDark } }
    }

    // Final score column
    if (c === finalScoreCol) {
      cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.purplePrimary } }
      cellA.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: COLORS.white } }
    }

    // Observations column
    if (c === obsCol) {
      cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerFill } }
      cellA.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.slateDark } }
    }
  }

  // Section sub-headers
  sectionColumnRanges.forEach((range) => {
    const startL = toExcelColumnName(range.start)
    const topCell = worksheet.getCell(`${startL}${headerRowIdx1}`)
    topCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: range.color } }
    topCell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.white } }

    for (let col = range.start; col <= range.end; col++) {
      const subCell = worksheet.getCell(`${toExcelColumnName(col)}${headerRowIdx2}`)
      subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerFill } }
      subCell.font = { name: 'Calibri', size: 7.5, bold: true, color: { argb: COLORS.slateDark } }
    }
  })

  // 4. DATA ROWS
  items.forEach((row, index) => {
    const detailValues = currentMatriz
      ? dynamicColumns.map((col) => Number(row.evalData?.[col.id] ?? 0))
      : [
          Number(row.evalData?.a1_diplomado || 0),
          Number(row.evalData?.a1_especialidad || 0),
          Number(row.evalData?.a1_maestria || 0),
          Number(row.evalData?.a1_doctorado || 0),
          Number(row.evalData?.a2_cursos_120 || 0),
          Number(row.evalData?.a2_cursos_20 || 0),
          Number(row.evalData?.a2_disertante || 0),
          Number(row.evalData?.a2_pedagogico || 0),
          Number(row.evalData?.a3_ejercicio_prof || 0),
          Number(row.evalData?.a3_docencia || 0),
          Number(row.evalData?.a3_tutorias || 0),
          Number(row.evalData?.a3_docente_post || 0),
          Number(row.evalData?.a3_cargos_sim || 0),
          Number(row.evalData?.a4_revistas || 0),
          Number(row.evalData?.a4_libros || 0),
          Number(row.evalData?.a4_distinciones || 0)
        ]

    const total = calculateTotal(row)
    const isApproved = total >= 51
    const totalLabel = `${total} PTS ${isApproved ? '(APROBADO)' : '(NO ALCANZA)'}`

    const addedRow = worksheet.addRow([
      index + 1,
      `${row.postulante?.nombres || ''} ${row.postulante?.apellidos || ''}`.trim().toUpperCase(),
      (row.extraInfo?.area || '-').toUpperCase(),
      row.extraInfo?.anio || '-',
      Math.round(row.pretension_salarial || 0),
      ...detailValues,
      totalLabel,
      (row.evalData?.observaciones || '').toUpperCase()
    ])

    addedRow.height = 22
    const isEven = index % 2 === 1
    const rowBg = isEven ? COLORS.slateLight : COLORS.white

    for (let c = 1; c <= obsCol; c++) {
      const cell = addedRow.getCell(c)
      cell.border = {
        top: { style: 'thin', color: { argb: COLORS.borderSoft } },
        left: { style: 'thin', color: { argb: COLORS.borderSoft } },
        bottom: { style: 'thin', color: { argb: COLORS.borderSoft } },
        right: { style: 'thin', color: { argb: COLORS.borderSoft } }
      }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.font = { name: 'Calibri', size: 8 }

      // Candidate name column (left-aligned, bold)
      if (c === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
        cell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.slateDark } }
      }

      // Salary Pretension (numeric currency format)
      if (c === 5) {
        cell.numFmt = '"Bs." #,##0'
        cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 }
      }

      // Final score column styling
      if (c === finalScoreCol) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isApproved ? COLORS.approvedFill : COLORS.failedFill } }
        cell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: isApproved ? COLORS.approvedText : COLORS.failedText } }
      }

      // Observations column (left-aligned)
      if (c === obsCol) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
        cell.font = { name: 'Calibri', size: 7.5 }
      }
    }
  })

  // 5. COLUMN WIDTHS
  worksheet.getColumn(1).width = 6   // No.
  worksheet.getColumn(2).width = 34  // Nombre
  worksheet.getColumn(3).width = 18  // Área
  worksheet.getColumn(4).width = 11  // Año
  worksheet.getColumn(5).width = 17  // Pretensión

  for (let c = 6; c < finalScoreCol; c++) {
    worksheet.getColumn(c).width = 12 // Criteria
  }
  worksheet.getColumn(finalScoreCol).width = 20 // Puntaje Final
  worksheet.getColumn(obsCol).width = 35        // Observaciones

  // 6. SIGNATURE BLOCK AT BOTTOM
  const currentLastRow = worksheet.rowCount
  worksheet.addRow([])
  worksheet.addRow([])

  const sigStartRow = currentLastRow + 3
  worksheet.mergeCells(`A${sigStartRow}:${lastColLetter}${sigStartRow}`)
  const sigTitleCell = worksheet.getCell(`A${sigStartRow}`)
  sigTitleCell.value = 'CONFORMIDAD DE LA COMISIÓN EVALUADORA DE MÉRITOS'
  sigTitleCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.purplePrimary } }
  sigTitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  worksheet.getRow(sigStartRow).height = 20

  worksheet.addRow([])
  worksheet.addRow([])
  worksheet.addRow([]) // Space for physical signature

  const lineRowIdx = sigStartRow + 4
  const textRowIdx = lineRowIdx + 1
  const subTextRowIdx = lineRowIdx + 2

  // 3 Signatures spaced across the sheet
  const sigCols = [
    { start: 2, end: 5, title: 'PRESIDENTE COMISIÓN EVALUADORA', sub: 'Decanatura / Vicerrectorado Académico' },
    { start: 8, end: 12, title: 'VOCAL 1 - ESPECIALISTA DE ÁREA', sub: 'Dirección de Carrera / Comité Técnico' },
    { start: 15, end: 19, title: 'VOCAL 2 - TALENTO HUMANO', sub: 'Dirección de Talento Humano' }
  ]

  sigCols.forEach((sig) => {
    if (sig.end <= obsCol) {
      const startL = toExcelColumnName(sig.start)
      const endL = toExcelColumnName(sig.end)

      worksheet.mergeCells(`${startL}${lineRowIdx}:${endL}${lineRowIdx}`)
      const lineCell = worksheet.getCell(`${startL}${lineRowIdx}`)
      lineCell.border = { bottom: { style: 'thin', color: { argb: COLORS.slateDark } } }

      worksheet.mergeCells(`${startL}${textRowIdx}:${endL}${textRowIdx}`)
      const titleCell = worksheet.getCell(`${startL}${textRowIdx}`)
      titleCell.value = sig.title
      titleCell.font = { name: 'Calibri', size: 8, bold: true, color: { argb: COLORS.slateDark } }
      titleCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells(`${startL}${subTextRowIdx}:${endL}${subTextRowIdx}`)
      const subCell = worksheet.getCell(`${startL}${subTextRowIdx}`)
      subCell.value = sig.sub
      subCell.font = { name: 'Calibri', size: 7, color: { argb: 'FF64748B' } }
      subCell.alignment = { horizontal: 'center' }
    }
  })

  worksheet.getRow(lineRowIdx).height = 16
  worksheet.getRow(textRowIdx).height = 16
  worksheet.getRow(subTextRowIdx).height = 14

  // 7. EXPORT BUFFER
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const cleanCargo = cargoStr.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25)
  const cleanSede = sedeStr.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 15)
  const filename = `MATRIZ_EVALUACION_${cleanCargo}_${cleanSede}_${convoGestion}.xlsx`
  saveAs(blob, filename)
}

/**
 * Export General Candidates Report in Excel with UNITEPC branding
 */
export const exportInstitutionalGeneralExcel = async ({
  convocatoria = {},
  items = [],
  filterSede = 'TODAS LAS SEDES',
  filterCargo = 'TODOS LOS CARGOS'
}) => {
  if (!items || items.length === 0) {
    throw new Error('No hay postulantes para exportar en este reporte.')
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'UNITEPC - SISPO'
  workbook.created = new Date()

  const convoTitle = (convocatoria.titulo || 'CONVOCATORIA PÚBLICA DE MÉRITOS').toUpperCase()
  const convoCode = (convocatoria.codigo_interno || `CONV-${convocatoria.id || 'UNITEPC'}`).toUpperCase()
  const convoGestion = convocatoria.gestion || new Date().getFullYear()
  const nowStr = new Date().toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })

  const worksheet = workbook.addWorksheet('Postulantes', {
    views: [{ showGridLines: true }]
  })

  // 1. BANNER ROWS
  const lastColLetter = 'L' // 12 columns

  worksheet.mergeCells(`A1:${lastColLetter}1`)
  const row1 = worksheet.getCell('A1')
  row1.value = 'UNIVERSIDAD TÉCNICA PRIVADA COSMOS  •  REPORTE GENERAL DE POSTULANTES'
  row1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: COLORS.white } }
  row1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.purplePrimary } }
  row1.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(1).height = 32

  worksheet.mergeCells(`A2:${lastColLetter}2`)
  const row2 = worksheet.getCell('A2')
  row2.value = 'DIRECCIÓN DE TALENTO HUMANO  •  SISTEMA DE SELECCIÓN Y POSTULACIÓN (SISPO)'
  row2.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: COLORS.slateDark } }
  row2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldAccent } }
  row2.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(2).height = 20

  worksheet.mergeCells(`A3:${lastColLetter}3`)
  const row3 = worksheet.getCell('A3')
  row3.value = `CONVOCATORIA: [${convoCode}] ${convoTitle}  |  GESTIÓN: ${convoGestion}  |  TOTAL REGISTRADOS: ${items.length}  |  FECHA EMISIÓN: ${nowStr}`
  row3.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.purplePrimary } }
  row3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3EFF7' } }
  row3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  worksheet.getRow(3).height = 20

  worksheet.getRow(4).height = 8 // Spacer

  // 2. HEADERS (Row 5)
  const headers = [
    'NO.',
    'SEDE',
    'CARGO INSTITUCIONAL',
    'NOMBRES Y APELLIDOS',
    'CÉDULA IDENTIDAD',
    'CORREO ELECTRÓNICO',
    'CELULAR',
    'PRETENSIÓN (BS)',
    'ESTADO POSTULACIÓN',
    'PUNTAJE TOTAL',
    'NIVEL RIESGO',
    'FECHA POSTULACIÓN'
  ]

  worksheet.addRow(headers)
  const headerRow = worksheet.getRow(5)
  headerRow.height = 26

  for (let c = 1; c <= headers.length; c++) {
    const cell = headerRow.getCell(c)
    cell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.white } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.purplePrimary } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin', color: { argb: COLORS.borderLight } },
      left: { style: 'thin', color: { argb: COLORS.borderLight } },
      bottom: { style: 'thin', color: { argb: COLORS.borderLight } },
      right: { style: 'thin', color: { argb: COLORS.borderLight } }
    }
  }

  // 3. DATA ROWS
  items.forEach((r, idx) => {
    const isEven = idx % 2 === 1
    const rowBg = isEven ? COLORS.slateLight : COLORS.white
    const scoreVal = r.evaluacion?.score_total ? Number(r.evaluacion.score_total) : (r.score_total ? Number(r.score_total) : null)
    const scoreStr = scoreVal !== null ? `${scoreVal.toFixed(1)} pts` : 'Sin evaluar'

    const dataRow = worksheet.addRow([
      idx + 1,
      (r.oferta?.sede?.nombre || filterSede || '-').toUpperCase(),
      (r.oferta?.cargo?.nombre || filterCargo || '-').toUpperCase(),
      `${r.postulante?.nombres || ''} ${r.postulante?.apellidos || ''}`.trim().toUpperCase(),
      `${r.postulante?.ci || ''} ${r.postulante?.ci_expedido || ''}`.trim(),
      (r.postulante?.email || '-').toLowerCase(),
      r.postulante?.celular || '-',
      Number(r.pretension_salarial || 0),
      (r.estado || 'PENDIENTE').toUpperCase(),
      scoreStr,
      (r.evaluacion?.nivel_riesgo || '-').toUpperCase(),
      formatDate(r.fecha_postulacion || r.created_at)
    ])

    dataRow.height = 20

    for (let c = 1; c <= headers.length; c++) {
      const cell = dataRow.getCell(c)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } }
      cell.border = {
        top: { style: 'thin', color: { argb: COLORS.borderSoft } },
        left: { style: 'thin', color: { argb: COLORS.borderSoft } },
        bottom: { style: 'thin', color: { argb: COLORS.borderSoft } },
        right: { style: 'thin', color: { argb: COLORS.borderSoft } }
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.font = { name: 'Calibri', size: 8 }

      // Name & Email left-aligned
      if (c === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
        cell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.slateDark } }
      }
      if (c === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
      }

      // Salary Pretension
      if (c === 8) {
        cell.numFmt = '"Bs." #,##0'
        cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 }
      }

      // Score styling
      if (c === 10 && scoreVal !== null) {
        const isApproved = scoreVal >= 51
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isApproved ? COLORS.approvedFill : COLORS.failedFill } }
        cell.font = { name: 'Calibri', size: 8, bold: true, color: { argb: isApproved ? COLORS.approvedText : COLORS.failedText } }
      }
    }
  })

  // 4. COLUMN WIDTHS
  worksheet.columns = [
    { width: 6 },  // No.
    { width: 16 }, // Sede
    { width: 28 }, // Cargo
    { width: 34 }, // Postulante
    { width: 15 }, // CI
    { width: 28 }, // Email
    { width: 15 }, // Celular
    { width: 17 }, // Pretensión
    { width: 16 }, // Estado
    { width: 15 }, // Score
    { width: 14 }, // Riesgo
    { width: 16 }  // Fecha
  ]

  // 5. SAVE
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `REPORTE_GENERAL_${convoCode}_${convoGestion}.xlsx`)
}
