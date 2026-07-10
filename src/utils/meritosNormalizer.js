export function buildMeritosFromNormalized(data) {
  const list = []

  // 1. Formación Académica
  if (data.formaciones_academicas) {
     data.formaciones_academicas.forEach(row => {
        list.push({
           id: `vfa_${row.id}`,
           tipo_documento_id: 1,
           respuestas: {
              nivel: row.nivel_academico,
              universidad: row.universidad,
              profesion: row.carrera,
              fecha_diploma: row.fecha_diploma,
              fecha_titulo: row.fecha_titulo
           },
           newFiles: {},
           archivos: [
              ...(row.diploma_archivo_path ? [{ config_id: 'diploma', config_key: 'diploma', archivo_path: row.diploma_archivo_path }] : []),
              ...(row.titulo_archivo_path ? [{ config_id: 'titulo', config_key: 'titulo', archivo_path: row.titulo_archivo_path }] : [])
           ]
        })
     })
  }

  // 2. Postgrados
  if (data.postgrados) {
     data.postgrados.forEach(row => {
        list.push({
           id: `vfp_${row.id}`,
           tipo_documento_id: 2,
           respuestas: {
              tipo_posgrado: row.tipo_posgrado,
              nombre_programa: row.nombre_programa,
              fecha_certificacion: row.fecha_certificacion,
              institucion: row.institucion
           },
           newFiles: {},
           archivos: [
              ...(row.certificado_archivo_path ? [{ config_id: 'certificado', config_key: 'certificado', archivo_path: row.certificado_archivo_path }] : [])
           ]
        })
     })
  }

  // 3. Experiencia Docencia
  if (data.experiencias_docencia) {
     data.experiencias_docencia.forEach(row => {
        list.push({
           id: `vfd_${row.id}`,
           tipo_documento_id: 3,
           respuestas: {
              universidad: row.universidad,
              carrera: row.carrera,
              asignaturas: row.asignaturas,
              gestion_periodo: row.gestion_periodo
           },
           newFiles: {},
           archivos: [
              ...(row.respaldo_archivo_path ? [{ config_id: 'respaldo', config_key: 'respaldo', archivo_path: row.respaldo_archivo_path }] : [])
           ]
        })
     })
  }

  // 4. Experiencia Profesional
  if (data.experiencias_profesionales) {
     data.experiencias_profesionales.forEach(row => {
        list.push({
           id: `vfe_${row.id}`,
           tipo_documento_id: 4,
           respuestas: {
              cargo: row.cargo,
              empresa: row.empresa,
              fecha_inicio: row.fecha_inicio,
              fecha_fin: row.fecha_fin
           },
           newFiles: {},
           archivos: [
              ...(row.certificado_archivo_path ? [{ config_id: 'certificado', config_key: 'certificado', archivo_path: row.certificado_archivo_path }] : [])
           ]
        })
     })
  }

  // 5. Capacitaciones
  if (data.capacitaciones) {
     data.capacitaciones.forEach(row => {
        list.push({
           id: `vfc_${row.id}`,
           tipo_documento_id: 5,
           respuestas: {
              nombre: row.nombre_curso,
              fecha: row.fecha,
              institucion: row.institucion_organizadora,
              horas: row.carga_horaria
           },
           newFiles: {},
           archivos: [
              ...(row.certificado_archivo_path ? [{ config_id: 'certificado', config_key: 'certificado', archivo_path: row.certificado_archivo_path }] : [])
           ]
        })
     })
  }

  // 6. Producción Intelectual
  if (data.producciones) {
     data.producciones.forEach(row => {
        list.push({
           id: `vfi_${row.id}`,
           tipo_documento_id: 6,
           respuestas: {
              tipo: row.tipo_produccion,
              titulo: row.titulo,
              fecha: row.fecha_publicacion,
              editorial: row.editorial_revista,
              lugar: row.lugar
           },
           newFiles: {},
           archivos: [
              ...(row.evidencia_archivo_path ? [{ config_id: 'evidencia', config_key: 'evidencia', archivo_path: row.evidencia_archivo_path }] : [])
           ]
        })
     })
  }

  // 7. Reconocimientos
  if (data.reconocimientos) {
     data.reconocimientos.forEach(row => {
        list.push({
           id: `vfr_${row.id}`,
           tipo_documento_id: 7,
           respuestas: {
              titulo: row.titulo_reconocimiento,
              fecha: row.fecha,
              institucion: row.institucion_otorgante,
              lugar: row.lugar
           },
           newFiles: {},
           archivos: [
              ...(row.reconocimiento_archivo_path ? [{ config_id: 'reconocimiento', config_key: 'reconocimiento', archivo_path: row.reconocimiento_archivo_path }] : [])
           ]
        })
     })
  }

  return list
}
