import { saveAs } from 'file-saver'

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

/**
 * Export Institutional Evaluation Matrix in Word (.doc) with UNITEPC branding and Landscape orientation
 */
export const exportInstitutionalMatrixWord = async ({
  convocatoria = {},
  sede = 'TODAS LAS SEDES',
  cargo = 'TODOS LOS CARGOS',
  items = [],
  currentMatriz = null,
  dynamicColumns = [],
  calculateTotal = () => 0
}) => {
  if (!items || items.length === 0) {
    throw new Error('No hay postulantes para exportar en esta matriz.')
  }

  const sedeStr = (sede || 'SEDE GENERAL').toUpperCase()
  const cargoStr = (cargo || 'TODOS LOS CARGOS').toUpperCase()
  const convoTitle = (convocatoria.titulo || 'CONVOCATORIA PÚBLICA DE MÉRITOS').toUpperCase()
  const convoCode = (convocatoria.codigo_interno || `CONV-${convocatoria.id || 'UNITEPC'}`).toUpperCase()
  const convoGestion = convocatoria.gestion || new Date().getFullYear()
  const convoPeriodo = `${formatDate(convocatoria.fecha_inicio)} al ${formatDate(convocatoria.fecha_cierre)}`
  const nowStr = new Date().toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })

  // Build Sections and Columns
  let sectionHeadersHtml = ''
  let subHeadersHtml = ''

  if (currentMatriz && currentMatriz.length > 0) {
    currentMatriz.forEach((sec, sIdx) => {
      const secPts = sec.criterios.reduce((acc, c) => acc + (Number(c.puntaje) || 0), 0)
      const bgCol = sIdx % 2 === 0 ? '#4a154b' : '#0f766e'
      sectionHeadersHtml += `<th colspan="${sec.criterios.length}" style="background-color: ${bgCol}; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold; padding: 6px;">${sec.seccion.toUpperCase()} (${secPts} PTS)</th>`
      sec.criterios.forEach((crit) => {
        subHeadersHtml += `<th style="background-color: #f1f5f9; color: #1e293b; text-align: center; font-size: 6.5pt; font-weight: bold; padding: 4px; min-width: 32px;">${crit.nombre}<br><span style="color: #64748b;">(${crit.puntaje})</span></th>`
      })
    })
  } else {
    sectionHeadersHtml += `
      <th colspan="4" style="background-color: #4a154b; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold; padding: 6px;">I. FORMACIÓN PROFESIONAL (20 PTS)</th>
      <th colspan="4" style="background-color: #0f766e; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold; padding: 6px;">II. PERFECCIONAMIENTO PROFESIONAL (20 PTS)</th>
      <th colspan="5" style="background-color: #1e3a8a; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold; padding: 6px;">III. EXPERIENCIA ACADÉMICA Y LABORAL (50 PTS)</th>
      <th colspan="3" style="background-color: #5c2d91; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold; padding: 6px;">IV. OTROS MÉRITOS Y PRODUCCIÓN (10 PTS)</th>
    `
    const defSub = [
      'DIPLOMADO<br>(3)', 'ESPECIALIZ.<br>(4)', 'MAESTRÍA<br>(6)', 'DOCTORADO<br>(7)',
      'CURSOS >120<br>(MAX 9)', 'CURSILLOS >20<br>(MAX 5)', 'DISERTANTE<br>(MAX 3)', 'PEDAGÓGICO<br>(MAX 3)',
      'EJERCICIO PROF.<br>(MAX 15)', 'DOCENCIA<br>(MAX 10)', 'TUTORÍA<br>(MAX 5)', 'POSTGRADO<br>(MAX 5)', 'CARGOS SIMIL.<br>(MAX 15)',
      'REVISTAS<br>(MAX 3)', 'LIBROS<br>(MAX 3)', 'DISTINCIONES<br>(MAX 4)'
    ]
    defSub.forEach((s) => {
      subHeadersHtml += `<th style="background-color: #f1f5f9; color: #1e293b; text-align: center; font-size: 6.5pt; font-weight: bold; padding: 4px; min-width: 32px;">${s}</th>`
    })
  }

  // Rows HTML
  let rowsHtml = ''
  items.forEach((row, idx) => {
    const total = calculateTotal(row)
    const isApproved = total >= 51
    const bgRow = idx % 2 === 1 ? '#f8fafc' : '#ffffff'

    let detailCells = ''
    if (currentMatriz && currentMatriz.length > 0) {
      dynamicColumns.forEach((col) => {
        const val = Number(row.evalData?.[col.id] ?? 0)
        const colColor = col.sectionIndex % 2 === 0 ? '#4a154b' : '#0f766e'
        detailCells += `<td style="text-align: center; font-size: 8pt; font-weight: bold; color: ${colColor};">${val}</td>`
      })
    } else {
      const d = row.evalData || {}
      const vals = [
        d.a1_diplomado || 0, d.a1_especialidad || 0, d.a1_maestria || 0, d.a1_doctorado || 0,
        d.a2_cursos_120 || 0, d.a2_cursos_20 || 0, d.a2_disertante || 0, d.a2_pedagogico || 0,
        d.a3_ejercicio_prof || 0, d.a3_docencia || 0, d.a3_tutorias || 0, d.a3_docente_post || 0, d.a3_cargos_sim || 0,
        d.a4_revistas || 0, d.a4_libros || 0, d.a4_distinciones || 0
      ]
      vals.forEach((v, vIdx) => {
        const colColor = vIdx < 4 ? '#4a154b' : vIdx < 8 ? '#0f766e' : vIdx < 13 ? '#1e3a8a' : '#5c2d91'
        detailCells += `<td style="text-align: center; font-size: 8pt; font-weight: bold; color: ${colColor};">${v}</td>`
      })
    }

    const candidateName = `${row.postulante?.nombres || ''} ${row.postulante?.apellidos || ''}`.trim().toUpperCase()
    const areaFormacion = (row.extraInfo?.area || '-').toUpperCase()
    const anioTitulo = row.extraInfo?.anio || '-'
    const pretension = Math.round(row.pretension_salarial || 0)
    const totalBg = isApproved ? '#dcfce7' : '#fee2e2'
    const totalColor = isApproved ? '#166534' : '#991b1b'
    const statusText = isApproved ? '✓ APROBADO' : '✗ NO ALCANZA'
    const obs = (row.evalData?.observaciones || '').toUpperCase()

    rowsHtml += `
      <tr style="background-color: ${bgRow};">
        <td style="text-align: center; font-size: 8pt; font-weight: bold; color: #475569;">${idx + 1}</td>
        <td style="font-size: 8pt; font-weight: bold; color: #0f172a; text-align: left; padding: 4px 6px;">${candidateName}</td>
        <td style="font-size: 7pt; font-weight: bold; color: #334155; text-align: center; padding: 4px;">${areaFormacion}</td>
        <td style="font-size: 7.5pt; font-weight: bold; text-align: center; color: #475569;">${anioTitulo}</td>
        <td style="font-size: 7.5pt; font-weight: bold; text-align: right; color: #0f766e; padding: 4px 6px;">Bs. ${pretension.toLocaleString('de-DE')}</td>
        ${detailCells}
        <td style="text-align: center; font-size: 8.5pt; font-weight: bold; background-color: ${totalBg}; color: ${totalColor}; padding: 4px;">
          ${total} PTS<br><span style="font-size: 6.5pt;">${statusText}</span>
        </td>
        <td style="font-size: 7pt; text-align: left; color: #475569; padding: 4px 6px;">${obs || '-'}</td>
      </tr>
    `
  })

  // Complete Word HTML Template
  const wordContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Acta de Evaluación de Méritos - UNITEPC</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>90</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 14.0in 8.5in;
          mso-page-orientation: landscape;
          margin: 0.4in 0.4in 0.4in 0.4in;
          mso-header-margin: 0.2in;
          mso-footer-margin: 0.2in;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          font-size: 8pt;
          color: #1e293b;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
        }
        .header-box {
          border-bottom: 2pt solid #c5a059;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .inst-title {
          font-size: 13pt;
          font-weight: 900;
          color: #4a154b;
          letter-spacing: 0.5pt;
          margin: 0;
        }
        .inst-sub {
          font-size: 8pt;
          font-weight: bold;
          color: #64748b;
          text-transform: uppercase;
          margin: 2px 0 0 0;
        }
        .doc-title {
          font-size: 11pt;
          font-weight: 900;
          color: #0f172a;
          text-align: center;
          margin: 6px 0 2px 0;
          text-transform: uppercase;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          margin-bottom: 10px;
          font-size: 8pt;
        }
        .info-table td {
          padding: 3px 6px;
          border: 0.5pt solid #e2e8f0;
          background-color: #f8fafc;
        }
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
        }
        .matrix-table th, .matrix-table td {
          border: 0.5pt solid #cbd5e1;
          padding: 4px;
        }
        .signatures-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 30px;
          page-break-inside: avoid;
        }
        .signatures-table td {
          border: none;
          text-align: center;
          padding: 10px;
        }
        .sig-line {
          border-top: 1pt solid #475569;
          width: 80%;
          margin: 0 auto 4px auto;
        }
        .sig-title {
          font-size: 8pt;
          font-weight: bold;
          color: #1e293b;
        }
        .sig-sub {
          font-size: 7pt;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- HEADER -->
        <div class="header-box">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="border: none; vertical-align: middle;">
                <div class="inst-title">UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC</div>
                <div class="inst-sub">Vicerrectorado Académico • Dirección de Talento Humano • SISPO</div>
              </td>
              <td style="border: none; text-align: right; vertical-align: middle;">
                <div style="font-size: 7.5pt; font-weight: bold; color: #4a154b;">DOCUMENTO OFICIAL DE EVALUACIÓN</div>
                <div style="font-size: 7pt; color: #64748b;">Emisión: ${nowStr}</div>
              </td>
            </tr>
          </table>
          <div class="doc-title">ACTA OFICIAL DE EVALUACIÓN DE MÉRITOS DOCENTES</div>
        </div>

        <!-- CONVOCATORIA INFO -->
        <table class="info-table">
          <tr>
            <td><strong>CONVOCATORIA:</strong> ${convoTitle}</td>
            <td><strong>CÓDIGO:</strong> ${convoCode}</td>
            <td><strong>GESTIÓN:</strong> ${convoGestion}</td>
          </tr>
          <tr>
            <td><strong>CARGO CONCURSADO:</strong> ${cargoStr}</td>
            <td><strong>SEDE ACADÉMICA:</strong> ${sedeStr}</td>
            <td><strong>PERIODO:</strong> ${convoPeriodo}</td>
          </tr>
        </table>

        <!-- MATRIX TABLE -->
        <table class="matrix-table">
          <thead>
            <tr>
              <th rowspan="2" style="background-color: #4a154b; color: #ffffff; text-align: center; font-size: 7.5pt; font-weight: bold; width: 28px;">NO.</th>
              <th rowspan="2" style="background-color: #4a154b; color: #ffffff; text-align: left; font-size: 7.5pt; font-weight: bold; min-width: 160px; padding: 6px;">NOMBRES Y APELLIDOS</th>
              <th rowspan="2" style="background-color: #f1f5f9; color: #1e293b; text-align: center; font-size: 7pt; font-weight: bold; min-width: 110px;">ÁREA FORMACIÓN</th>
              <th rowspan="2" style="background-color: #f1f5f9; color: #1e293b; text-align: center; font-size: 7pt; font-weight: bold; width: 45px;">AÑO TÍT.</th>
              <th rowspan="2" style="background-color: #f1f5f9; color: #1e293b; text-align: center; font-size: 7pt; font-weight: bold; width: 75px;">PRETENSIÓN (BS)</th>
              ${sectionHeadersHtml}
              <th rowspan="2" style="background-color: #4a154b; color: #ffffff; text-align: center; font-size: 7.5pt; font-weight: bold; width: 70px;">PUNTAJE FINAL</th>
              <th rowspan="2" style="background-color: #f1f5f9; color: #1e293b; text-align: left; font-size: 7pt; font-weight: bold; min-width: 120px;">OBSERVACIONES</th>
            </tr>
            <tr>
              ${subHeadersHtml}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- SIGNATURES -->
        <table class="signatures-table">
          <tr>
            <td style="width: 33.3%;">
              <div class="sig-line"></div>
              <div class="sig-title">VOCAL 1 - ESPECIALISTA DE ÁREA</div>
              <div class="sig-sub">Dirección de Carrera / Comité Técnico</div>
            </td>
            <td style="width: 33.3%;">
              <div class="sig-line"></div>
              <div class="sig-title">VOCAL 2 - DELEGADO ACADÉMICO</div>
              <div class="sig-sub">Vicerrectorado / Decanatura</div>
            </td>
            <td style="width: 33.3%;">
              <div class="sig-line"></div>
              <div class="sig-title">PRESIDENTE DE COMISIÓN</div>
              <div class="sig-sub">Comisión Evaluadora Institucional</div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword;charset=utf-8'
  })

  const safeName = `Acta_Evaluacion_${sedeStr}_${cargoStr}`.replace(/[\s/\\?%*:|"<>]/g, '_')
  saveAs(blob, `${safeName}.doc`)
}
