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
// Helper functions to format applicant merits for Excel export
const formatFormaciones = (p) => {
  if (!p) return '-'
  const list = []
  const fArray = p.formaciones_academicas || p.formacionesAcademicas || []
  if (Array.isArray(fArray) && fArray.length > 0) {
    fArray.forEach((f) => {
      const nivel = f.academicLevel?.name || f.nivel_academico_normalizado || f.nivel_academico_raw || 'LICENCIATURA'
      const carrera = f.career?.name || f.carrera_raw || f.carrera || 'CARRERA NO ESPECIFICADA'
      const univ = f.universidad || 'UNIVERSIDAD NO ESPECIFICADA'
      const anio = formatDate(f.fecha_titulo || f.fecha_diploma)
      list.push(`${nivel}: ${carrera}  |  ${univ}  |  Año: ${anio}`)
    })
  }

  if (Array.isArray(p.meritos)) {
    p.meritos.forEach((m) => {
      const nom = (m.tipoDocumento?.nombre || m.tipo_documento?.nombre || '').toUpperCase()
      const cat = (m.tipoDocumento?.categoria || m.tipo_documento?.categoria || '').toUpperCase()
      if (m.tipo_documento_id === 1 || nom.includes('FORMACIÓN ACADÉMICA') || cat.includes('FORMACIÓN') || nom.includes('PREGRADO')) {
        const r = m.respuestas || {}
        const nivel = r.nivel || 'PREGRADO'
        const carrera = r.profesion || r.carrera || r.titulo || ''
        const univ = r.universidad || r.institucion || ''
        const anio = r.fecha_titulo || r.fecha_diploma || r.anio || ''
        if (carrera || univ) {
          const entry = `${nivel}: ${carrera || 'PROFESIÓN'}  |  ${univ}  |  Año: ${formatDate(anio)}`
          if (!list.includes(entry)) list.push(entry)
        }
      }
    })
  }

  return list.length > 0 ? list.map((item, i) => `[${i + 1}] ${item}`).join('\n') : '-'
}

const formatPostgrados = (p) => {
  if (!p) return '-'
  const list = []
  const pArray = p.postgrados || p.formaciones_postgrado || p.formacionesPostgrado || []
  if (Array.isArray(pArray) && pArray.length > 0) {
    pArray.forEach((f) => {
      const tipo = f.tipo_posgrado || 'POSGRADO'
      const prog = f.nombre_programa || 'PROGRAMA'
      const inst = f.institucion || 'INSTITUCIÓN'
      const anio = formatDate(f.fecha_certificacion)
      list.push(`${tipo}: ${prog}  |  ${inst}  |  Año: ${anio}`)
    })
  }

  if (Array.isArray(p.meritos)) {
    p.meritos.forEach((m) => {
      const nom = (m.tipoDocumento?.nombre || m.tipo_documento?.nombre || '').toUpperCase()
      if (m.tipo_documento_id === 2 || nom.includes('POSGRADO') || nom.includes('POSTGRADO')) {
        const r = m.respuestas || {}
        const tipo = r.tipo_posgrado || 'POSGRADO'
        const prog = r.nombre_programa || r.programa || r.titulo || ''
        const inst = r.institucion || r.universidad || ''
        const anio = r.fecha_certificacion || r.fecha || r.anio || ''
        if (prog || inst) {
          const entry = `${tipo}: ${prog}  |  ${inst}  |  Año: ${formatDate(anio)}`
          if (!list.includes(entry)) list.push(entry)
        }
      }
    })
  }

  return list.length > 0 ? list.map((item, i) => `[${i + 1}] ${item}`).join('\n') : '-'
}

const formatDocencia = (p) => {
  if (!p) return '-'
  const list = []
  const dArray = p.experiencias_docencia || p.experienciasDocencia || []
  if (Array.isArray(dArray) && dArray.length > 0) {
    dArray.forEach((d) => {
      const univ = d.universidad || 'UNIVERSIDAD'
      const carr = d.carrera || 'CARRERA'
      const asig = d.asignaturas || 'ASIGNATURAS'
      const per = d.gestion_periodo || 'PERIODO'
      list.push(`${univ} (${carr})  |  Materias: ${asig}  |  Gestión: ${per}`)
    })
  }

  if (Array.isArray(p.meritos)) {
    p.meritos.forEach((m) => {
      const nom = (m.tipoDocumento?.nombre || m.tipo_documento?.nombre || '').toUpperCase()
      if (m.tipo_documento_id === 3 || nom.includes('DOCENCIA')) {
        const r = m.respuestas || {}
        const univ = r.universidad || r.institucion || ''
        const carr = r.carrera || ''
        const asig = r.asignaturas || r.materias || ''
        const per = r.gestion_periodo || r.gestion || r.periodo || ''
        if (univ || asig) {
          const entry = `${univ} ${carr ? '(' + carr + ')' : ''}  |  Materias: ${asig}  |  Gestión: ${per}`
          if (!list.includes(entry)) list.push(entry)
        }
      }
    })
  }

  return list.length > 0 ? list.map((item, i) => `[${i + 1}] ${item}`).join('\n') : '-'
}

const formatExperienciaLaboral = (p) => {
  if (!p) return '-'
  const list = []
  const expArray = p.experiencias_profesionales || p.experienciasProfesionales || []
  if (Array.isArray(expArray) && expArray.length > 0) {
    expArray.forEach((e) => {
      const cargo = e.cargo || 'CARGO'
      const emp = e.empresa || e.institucion || 'EMPRESA/INSTITUCIÓN'
      const ini = formatDate(e.fecha_inicio)
      const fin = e.fecha_fin ? formatDate(e.fecha_fin) : 'Actualidad'
      const func = e.funciones ? `  |  Funciones: ${e.funciones}` : ''
      list.push(`${cargo} en ${emp} (${ini} a ${fin})${func}`)
    })
  }

  if (Array.isArray(p.meritos)) {
    p.meritos.forEach((m) => {
      const nom = (m.tipoDocumento?.nombre || m.tipo_documento?.nombre || '').toUpperCase()
      if (m.tipo_documento_id === 4 || (nom.includes('EXPERIENCIA') && !nom.includes('DOCENCIA'))) {
        const r = m.respuestas || {}
        const cargo = r.cargo || ''
        const emp = r.empresa || r.institucion || ''
        const ini = formatDate(r.fecha_inicio)
        const fin = r.fecha_fin ? formatDate(r.fecha_fin) : 'Actualidad'
        if (cargo || emp) {
          const entry = `${cargo} en ${emp} (${ini} a ${fin})`
          if (!list.includes(entry)) list.push(entry)
        }
      }
    })
  }

  return list.length > 0 ? list.map((item, i) => `[${i + 1}] ${item}`).join('\n') : '-'
}

const formatCapacitaciones = (p) => {
  if (!p) return '-'
  const list = []
  const cArray = p.capacitaciones || []
  if (Array.isArray(cArray) && cArray.length > 0) {
    cArray.forEach((c) => {
      const nom = c.nombre_curso || c.nombre || 'CURSO'
      const inst = c.institucion || 'INSTITUCIÓN'
      const hrs = c.horas_academicas || c.horas ? `${c.horas_academicas || c.horas} hrs` : ''
      const fecha = formatDate(c.fecha)
      list.push(`${nom}  |  ${inst}  |  ${hrs}  |  ${fecha}`)
    })
  }

  if (Array.isArray(p.meritos)) {
    p.meritos.forEach((m) => {
      const nom = (m.tipoDocumento?.nombre || m.tipo_documento?.nombre || '').toUpperCase()
      if (m.tipo_documento_id === 5 || nom.includes('CAPACITACI') || nom.includes('CURSO')) {
        const r = m.respuestas || {}
        const cNom = r.nombre || r.curso || ''
        const inst = r.institucion || ''
        const hrs = r.horas ? `${r.horas} hrs` : ''
        const fecha = formatDate(r.fecha)
        if (cNom || inst) {
          const entry = `${cNom}  |  ${inst}  |  ${hrs}  |  ${fecha}`
          if (!list.includes(entry)) list.push(entry)
        }
      }
    })
  }

  return list.length > 0 ? list.map((item, i) => `[${i + 1}] ${item}`).join('\n') : '-'
}

const formatProduccion = (p) => {
  if (!p) return '-'
  const list = []
  const prodArray = p.producciones || p.producciones_intelectuales || p.produccionesIntelectuales || []
  if (Array.isArray(prodArray) && prodArray.length > 0) {
    prodArray.forEach((pr) => {
      const tipo = pr.tipo_produccion || pr.tipo || 'PUBLICACIÓN'
      const tit = pr.titulo_obra || pr.titulo || 'TÍTULO'
      const ed = pr.editorial_revista || pr.editorial || ''
      const fecha = formatDate(pr.fecha_publicacion || pr.fecha)
      list.push(`${tipo}: ${tit}  |  ${ed}  |  ${fecha}`)
    })
  }

  if (Array.isArray(p.meritos)) {
    p.meritos.forEach((m) => {
      const nom = (m.tipoDocumento?.nombre || m.tipo_documento?.nombre || '').toUpperCase()
      if (m.tipo_documento_id === 6 || nom.includes('PRODUCCI') || nom.includes('LIBRO') || nom.includes('ARTÍCULO')) {
        const r = m.respuestas || {}
        const tipo = r.tipo || 'PUBLICACIÓN'
        const tit = r.titulo || ''
        const ed = r.editorial || ''
        const fecha = formatDate(r.fecha)
        if (tit) {
          const entry = `${tipo}: ${tit}  |  ${ed}  |  ${fecha}`
          if (!list.includes(entry)) list.push(entry)
        }
      }
    })
  }

  return list.length > 0 ? list.map((item, i) => `[${i + 1}] ${item}`).join('\n') : '-'
}

const formatReconocimientos = (p) => {
  if (!p) return '-'
  const list = []
  const recArray = p.reconocimientos || []
  if (Array.isArray(recArray) && recArray.length > 0) {
    recArray.forEach((r) => {
      const desc = r.descripcion_reconocimiento || r.titulo || 'DISTINCIÓN'
      const inst = r.institucion_otorgante || r.institucion || ''
      const fecha = formatDate(r.fecha)
      list.push(`${desc}  |  ${inst}  |  ${fecha}`)
    })
  }

  if (Array.isArray(p.meritos)) {
    p.meritos.forEach((m) => {
      const nom = (m.tipoDocumento?.nombre || m.tipo_documento?.nombre || '').toUpperCase()
      if (m.tipo_documento_id === 7 || nom.includes('RECONOCIMIENTO') || nom.includes('DISTINCI')) {
        const r = m.respuestas || {}
        const tit = r.titulo || ''
        const inst = r.institucion || ''
        const fecha = formatDate(r.fecha)
        if (tit) {
          const entry = `${tit}  |  ${inst}  |  ${fecha}`
          if (!list.includes(entry)) list.push(entry)
        }
      }
    })
  }

  return list.length > 0 ? list.map((item, i) => `[${i + 1}] ${item}`).join('\n') : '-'
}

const formatReferencias = (p) => {
  if (!p) return '-'
  const refs = []
  if (p.ref_personal_celular) {
    refs.push(`Personal: ${p.ref_personal_parentesco ? '(' + p.ref_personal_parentesco + ')' : ''} Cel: ${p.ref_personal_celular}`)
  }
  if (p.ref_laboral_celular || p.ref_laboral_detalle) {
    refs.push(`Laboral: ${p.ref_laboral_detalle || ''} Cel: ${p.ref_laboral_celular || '-'}`)
  }
  return refs.length > 0 ? refs.join('\n') : '-'
}

/**
 * Export General Candidates Report in Excel with UNITEPC branding and ALL MERIT DETAILS
 */
export const exportInstitutionalGeneralExcel = async ({
  convocatoria = {},
  items = [],
  filterSede = 'TODAS LAS SEDES',
  filterCargo = 'TODOS LOS CARGOS',
  filterEstado = null
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

  const estadoLabel = filterEstado ? `ESTADO: ${String(filterEstado).toUpperCase()}` : 'TODOS LOS ESTADOS'

  const worksheet = workbook.addWorksheet('Postulantes y Méritos', {
    views: [{ showGridLines: true }]
  })

  // 1. BANNER ROWS (24 Columns: A to X)
  const lastColLetter = 'X'

  worksheet.mergeCells(`A1:${lastColLetter}1`)
  const row1 = worksheet.getCell('A1')
  row1.value = 'UNIVERSIDAD TÉCNICA PRIVADA COSMOS  •  REPORTE INTEGRAL DE POSTULANTES Y MÉRITOS'
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
  row3.value = `CONVOCATORIA: [${convoCode}] ${convoTitle}  |  SEDE: ${filterSede.toUpperCase()}  |  CARGO: ${filterCargo.toUpperCase()}  |  ${estadoLabel}  |  TOTAL: ${items.length}  |  EMISIÓN: ${nowStr}`
  row3.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.purplePrimary } }
  row3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3EFF7' } }
  row3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  worksheet.getRow(3).height = 22

  worksheet.getRow(4).height = 8 // Spacer

  // 2. HEADERS (Row 5) - 24 Full Columns
  const headers = [
    'NO.',
    'SEDE ACADÉMICA',
    'CARGO CONCURSADO',
    'ESTADO POSTULACIÓN',
    'NOMBRES Y APELLIDOS',
    'CÉDULA IDENTIDAD',
    'CELULAR',
    'CORREO ELECTRÓNICO',
    'NACIONALIDAD',
    'DIRECCIÓN DOMICILIO',
    'PRETENSIÓN (BS)',
    'FECHA POSTULACIÓN',
    'PUNTAJE EVALUACIÓN',
    'CLASIFICACIÓN ATS',
    'NIVEL RIESGO',
    'OBSERVACIONES EVALUACIÓN',
    'FORMACIÓN ACADÉMICA (TÍTULOS PREGRADO)',
    'FORMACIÓN EN POSGRADO (DIPLOMADOS / MAESTRÍAS / DOCTORADOS)',
    'EXPERIENCIA DOCENTE UNIVERSITARIA',
    'EXPERIENCIA LABORAL / PROFESIONAL',
    'CURSOS, TALLERES Y CAPACITACIONES',
    'PRODUCCIÓN INTELECTUAL (LIBROS / ARTÍCULOS)',
    'DISTINCIONES Y RECONOCIMIENTOS',
    'REFERENCIAS (PERSONALES Y LABORALES)'
  ]

  worksheet.addRow(headers)
  const headerRow = worksheet.getRow(5)
  headerRow.height = 28

  for (let c = 1; c <= headers.length; c++) {
    const cell = headerRow.getCell(c)
    cell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.white } }
    // Columns 17-24 have slightly distinct header color for clarity
    const bgHeader = c >= 17 ? COLORS.purpleSoft : COLORS.purplePrimary
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHeader } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
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
    const p = r.postulante || {}
    const ev = r.evaluacion || {}
    const scoreVal = ev.score_total !== undefined && ev.score_total !== null
      ? Number(ev.score_total)
      : (r.score_total ? Number(r.score_total) : null)
    const scoreStr = scoreVal !== null ? `${scoreVal.toFixed(1)} pts` : 'Sin evaluar'

    const formacionesStr = formatFormaciones(p)
    const postgradosStr = formatPostgrados(p)
    const docenciaStr = formatDocencia(p)
    const laboralStr = formatExperienciaLaboral(p)
    const capacitacionesStr = formatCapacitaciones(p)
    const produccionStr = formatProduccion(p)
    const reconocimientosStr = formatReconocimientos(p)
    const referenciasStr = formatReferencias(p)
    const obsStr = ev.observaciones || ev.review_reason_summary || '-'

    const dataRow = worksheet.addRow([
      idx + 1,
      (r.oferta?.sede?.nombre || filterSede || '-').toUpperCase(),
      (r.oferta?.cargo?.nombre || filterCargo || '-').toUpperCase(),
      (r.estado || 'PENDIENTE').toUpperCase(),
      `${p.nombres || ''} ${p.apellidos || ''}`.trim().toUpperCase(),
      `${p.ci || ''} ${p.ci_expedido || ''}`.trim(),
      p.celular || '-',
      (p.email || '-').toLowerCase(),
      (p.nacionalidad || 'BOLIVIANA').toUpperCase(),
      p.direccion_domicilio || '-',
      Number(r.pretension_salarial || 0),
      formatDate(r.fecha_postulacion || r.created_at),
      scoreStr,
      (ev.clasificacion || ev.clasificacion_ia || '-').toUpperCase(),
      (ev.nivel_riesgo || '-').toUpperCase(),
      obsStr,
      formacionesStr,
      postgradosStr,
      docenciaStr,
      laboralStr,
      capacitacionesStr,
      produccionStr,
      reconocimientosStr,
      referenciasStr
    ])

    // Dynamic row height based on content
    const maxLines = Math.max(
      formacionesStr.split('\n').length,
      postgradosStr.split('\n').length,
      docenciaStr.split('\n').length,
      laboralStr.split('\n').length,
      capacitacionesStr.split('\n').length,
      1
    )
    dataRow.height = Math.min(Math.max(22, maxLines * 16), 140)

    for (let c = 1; c <= headers.length; c++) {
      const cell = dataRow.getCell(c)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } }
      cell.border = {
        top: { style: 'thin', color: { argb: COLORS.borderSoft } },
        left: { style: 'thin', color: { argb: COLORS.borderSoft } },
        bottom: { style: 'thin', color: { argb: COLORS.borderSoft } },
        right: { style: 'thin', color: { argb: COLORS.borderSoft } }
      }
      cell.font = { name: 'Calibri', size: 8 }
      cell.alignment = { vertical: 'top', horizontal: 'center' }

      // Names & Emails
      if (c === 5 || c === 8 || c === 10) {
        cell.alignment = { vertical: 'top', horizontal: 'left', indent: 1 }
        if (c === 5) cell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.slateDark } }
      }

      // Salary Pretension
      if (c === 11) {
        cell.numFmt = '"Bs." #,##0'
        cell.alignment = { vertical: 'top', horizontal: 'right', indent: 1 }
        cell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.emeraldAccent } }
      }

      // Score styling
      if (c === 13 && scoreVal !== null) {
        const isApproved = scoreVal >= 51
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isApproved ? COLORS.approvedFill : COLORS.failedFill } }
        cell.font = { name: 'Calibri', size: 8, bold: true, color: { argb: isApproved ? COLORS.approvedText : COLORS.failedText } }
      }

      // Observations and Merit columns (16 to 24): left align and wrap text
      if (c >= 16) {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
      }
    }
  })

  // 4. COLUMN WIDTHS (24 Columns)
  worksheet.columns = [
    { width: 6 },  // 1: No.
    { width: 16 }, // 2: Sede
    { width: 28 }, // 3: Cargo
    { width: 16 }, // 4: Estado
    { width: 34 }, // 5: Postulante
    { width: 15 }, // 6: CI
    { width: 15 }, // 7: Celular
    { width: 28 }, // 8: Email
    { width: 14 }, // 9: Nacionalidad
    { width: 22 }, // 10: Dirección
    { width: 16 }, // 11: Pretensión
    { width: 15 }, // 12: Fecha
    { width: 15 }, // 13: Score
    { width: 18 }, // 14: Clasificación
    { width: 14 }, // 15: Riesgo
    { width: 30 }, // 16: Observaciones
    { width: 45 }, // 17: Formación Académica
    { width: 45 }, // 18: Posgrados
    { width: 45 }, // 19: Docencia
    { width: 45 }, // 20: Experiencia Laboral
    { width: 40 }, // 21: Capacitaciones
    { width: 35 }, // 22: Producción Intelectual
    { width: 30 }, // 23: Reconocimientos
    { width: 30 }  // 24: Referencias
  ]

  // 5. SAVE
  const cleanSede = filterSede.replace(/[\\/*?:[\]]/g, '_').substring(0, 15)
  const cleanCargo = filterCargo.replace(/[\\/*?:[\]]/g, '_').substring(0, 20)
  const cleanEstado = filterEstado ? `_${String(filterEstado).toUpperCase()}` : ''
  const fileName = `REPORTE_POSTULANTES_${convoCode}_${cleanSede}_${cleanCargo}${cleanEstado}_${convoGestion}.xlsx`.replace(/\s+/g, '_')

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, fileName)
}
