/**
 * Recruitment Decision Workspace - API Data Adapter
 * Estándar determinístico y null-safe para mapear postulaciones y sus evaluaciones
 */

export function adaptPostulacion(item) {
  if (!item) return null;

  const evaluation = item.evaluacion || {};
  const postulante = item.postulante || {};
  const experiences = postulante.experiencias_profesionales || [];
  const formaciones = postulante.formaciones_academicas || [];
  
  // Find highest academic level
  let highestLevel = 'LICENCIATURA';
  if (formaciones.length > 0) {
    const sorted = [...formaciones].sort((a, b) => {
      const levelA = a.academic_level?.id || 0;
      const levelB = b.academic_level?.id || 0;
      return levelB - levelA; // Highest level first
    });
    highestLevel = sorted[0].academic_level?.nombre || sorted[0].carrera_raw || 'LICENCIATURA';
  }

  // Parse review_flags_json
  let parsedFlags = [];
  if (evaluation.review_flags_json) {
    if (typeof evaluation.review_flags_json === 'string') {
      try {
        parsedFlags = JSON.parse(evaluation.review_flags_json);
      } catch {
        parsedFlags = [];
      }
    } else if (Array.isArray(evaluation.review_flags_json)) {
      parsedFlags = evaluation.review_flags_json;
    }
  }

  // Parse score_breakdown_json
  let parsedBreakdown = {};
  if (evaluation.score_breakdown_json) {
    if (typeof evaluation.score_breakdown_json === 'string') {
      try {
        parsedBreakdown = JSON.parse(evaluation.score_breakdown_json);
      } catch {
        parsedBreakdown = {};
      }
    } else if (typeof evaluation.score_breakdown_json === 'object') {
      parsedBreakdown = evaluation.score_breakdown_json;
    }
  }

  return {
    id: item.id,
    postulanteId: postulante.id || null,
    nombres: postulante.nombres || 'Postulante',
    apellidos: postulante.apellidos || 'Sin Apellido',
    ci: postulante.ci || 'N/A',
    celular: postulante.celular || 'N/A',
    email: postulante.email || 'N/A',
    highestLevel: highestLevel.toUpperCase(),
    convocatoriaTitle: item.oferta?.convocatoria?.titulo || 'General',
    convocatoriaId: item.oferta?.convocatoria_id || 'ALL',
    cargoName: item.oferta?.cargo?.nombre || 'General',
    sedeName: item.oferta?.sede?.nombre || 'General',
    
    // Evaluation metrics
    evaluationId: evaluation.id || null,
    scoreTotal: evaluation.score_total !== undefined ? Number(evaluation.score_total) : 0,
    classification: evaluation.classification || 'NO APTO',
    riskLevel: evaluation.review_risk_level || 'low',
    riskScore: evaluation.review_risk_score !== undefined ? Number(evaluation.review_risk_score) : 0,
    evaluationStatus: evaluation.evaluation_status || 'evaluated',
    flags: parsedFlags,
    reasonSummary: evaluation.review_reason_summary || 'Evaluación conforme.',
    breakdown: parsedBreakdown,

    // Summaries
    experienceSummary: postulante.experience_summary || {
      accumulated_months: 0,
      unique_months: 0,
      overlap_months_estimated: 0,
      accumulated_months_last_5_years: 0,
      overlap_detected: false
    },
    trainingSummary: postulante.training_summary || {
      accumulated_hours_last_5_years: 0,
      total_courses_count: 0
    },
    experiences: experiences.map(exp => ({
      id: exp.id,
      cargo_raw: exp.cargo_raw || 'Cargo no definido',
      institucion_raw: exp.institución_raw || exp.institucion_raw || 'Empresa/Institución',
      fecha_inicio: exp.fecha_inicio || null,
      fecha_fin: exp.fecha_fin || null,
      es_vigente: !!exp.es_vigente,
      meses_experiencia: exp.meses_experiencia || 0
    }))
  };
}

export function adaptPostulacionesList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(adaptPostulacion).filter(Boolean);
}
