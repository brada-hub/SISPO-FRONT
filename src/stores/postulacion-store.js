import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const usePostulacionStore = defineStore('postulacion', {
  state: () => ({
    // Estado del proceso
    step: 1,
    loading: false,
    error: null,

    // Datos del postulante
    ci: '',
    postulante: {
      nombres: '',
      apellidos: '',
      email: '',
      celular: '',
      foto_perfil: null,
      nacionalidad: '',
      direccion: '',
      ci_expedido: '',
      ci_documento: null,
      carta_postulacion: null,
      curriculum_vitae: null,
    },
    esPostulanteExistente: false,
    tieneExpediente: false,

    // Convocatorias y ofertas
    convocatorias: [],
    convocatoriaActual: null,
    convocatoriaSeleccionadaId: null, // ID de la convocatoria elegida por el usuario
    ofertasSeleccionadas: [],

    // Documentos requeridos por la convocatoria (dinámico)
    documentosRequeridos: [], // Array de { id, nombre, descripcion, icono, obligatorio, campos, categoria, permite_multiples }
    documentos: {}, // Objeto { [tipo_documento_id]: [{ archivo: File, metadatos: {} }] }

    // Expediente (Tablas originales, se mantienen por compatibilidad pero se prioriza documentos dinámicos)
    formaciones: [],
    experiencias: [],
    capacitaciones: [],
    producciones: [],
    reconocimientos: [],

    // Resultado de postulación
    resultado: null,
  }),

  getters: {
    nombreCompleto: (state) =>
      `${state.postulante.nombres} ${state.postulante.apellidos}`.trim(),

    totalOfertasSeleccionadas: (state) =>
      state.ofertasSeleccionadas.length,

    expedienteCompleto: (state) =>
      state.formaciones.length > 0,

    // Convocatoria actualmente seleccionada
    convocatoriaSeleccionada: (state) => {
      if (!state.convocatoriaSeleccionadaId) return null
      return state.convocatorias.find(c => c.id === state.convocatoriaSeleccionadaId)
    },

    // Ofertas de la convocatoria seleccionada agrupadas por sede
    ofertasDeConvocatoriaActual: (state) => {
      const conv = state.convocatorias.find(c => c.id === state.convocatoriaSeleccionadaId)
      if (!conv) return []

      const sedesMap = {}
      conv.ofertas.forEach(oferta => {
        const sedeId = oferta.sede.id
        if (!sedesMap[sedeId]) {
          sedesMap[sedeId] = {
            sede: oferta.sede,
            cargos: []
          }
        }
        sedesMap[sedeId].cargos.push({
          id: oferta.id,
          cargo: oferta.cargo
        })
      })
      return Object.values(sedesMap)
    },

    ofertasAgrupadasPorSede: (state) => {
      if (!state.convocatoriaActual?.ofertas_por_sede) return []
      return state.convocatoriaActual.ofertas_por_sede
    },

    // Verificar si todos los documentos obligatorios están cargados
    documentosObligatoriosCompletos: (state) => {
      const obligatorios = state.documentosRequeridos.filter(d => d.obligatorio)
      return obligatorios.every(doc => state.documentos[doc.id] instanceof File)
    },

    // Obtener documentos faltantes
    documentosFaltantes: (state) => {
      return state.documentosRequeridos
        .filter(d => d.obligatorio && !(state.documentos[d.id] instanceof File))
        .map(d => d.nombre)
    }
  },

  actions: {
    // Resetear todo el estado
    reset() {
      this.step = 1
      this.ci = ''
      this.postulante = {
        nombres: '',
        apellidos: '',
        email: '',
        celular: '',
        foto_perfil: null,
        nacionalidad: '',
        direccion: '',
        ci_expedido: '',
        ci_documento: null,
        carta_postulacion: null,
        curriculum_vitae: null,
      }
      this.esPostulanteExistente = false
      this.tieneExpediente = false
      this.convocatoriaSeleccionadaId = null
      this.ofertasSeleccionadas = []
      this.documentosRequeridos = []
      this.documentos = {}
      this.formaciones = []
      this.experiencias = []
      this.capacitaciones = []
      this.producciones = []
      this.reconocimientos = []
      this.resultado = null
    },

    // Seleccionar una convocatoria y cargar sus documentos requeridos
    seleccionarConvocatoria(convocatoriaId) {
      this.convocatoriaSeleccionadaId = convocatoriaId
      this.ofertasSeleccionadas = []

      const conv = this.convocatorias.find(c => c.id === convocatoriaId)
      const docs = conv?.documentos_requeridos || conv?.documentosRequeridos || []

      if (docs.length > 0) {
        // Deduplicar por ID para evitar campos repetidos
        const uniqueDocs = []
        const seenIds = new Set()

        docs.forEach(doc => {
            if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id)
                uniqueDocs.push(doc)
            }
        })

        this.documentosRequeridos = uniqueDocs.map(doc => ({
          id: doc.id,
          nombre: doc.nombre,
          descripcion: doc.descripcion,
          icono: doc.icono,
          categoria: doc.categoria,
          permite_multiples: doc.permite_multiples == 1 || doc.permite_multiples === true,
          campos: typeof doc.campos === 'string' ? JSON.parse(doc.campos) : doc.campos,
          obligatorio: doc.pivot?.obligatorio == 1 || doc.pivot?.obligatorio === true,
          orden: doc.pivot?.orden ?? 0
        }))

        // Inicializar objeto de documentos como arreglos
        this.documentos = {}
        this.documentosRequeridos.forEach(doc => {
          this.documentos[doc.id] = []
        })
      } else {
        this.documentosRequeridos = []
        this.documentos = {}
      }
    },

    // Agregar un nuevo registro para un tipo de documento dinámico
    agregarDocumentoDinamico(tipoId) {
      if (!this.documentos[tipoId]) {
        this.documentos[tipoId] = []
      }
      this.documentos[tipoId].push({
        archivo: null,
        metadatos: {}
      })
    },

    // Eliminar un registro de documento dinámico
    eliminarDocumentoDinamico(tipoId, index) {
      if (this.documentos[tipoId]) {
        this.documentos[tipoId].splice(index, 1)
      }
    },

    setDocumento(tipoId, index, archivo) {
      if (!this.documentos[tipoId]) this.documentos[tipoId] = []
      if (!this.documentos[tipoId][index]) {
        this.documentos[tipoId][index] = { archivo: null, metadatos: {} }
      }
      this.documentos[tipoId][index].archivo = archivo
    },

    setMetadato(tipoId, index, campo, valor) {
      if (!this.documentos[tipoId]) this.documentos[tipoId] = []
      if (!this.documentos[tipoId][index]) {
        this.documentos[tipoId][index] = { archivo: null, metadatos: {} }
      }
      if (!this.documentos[tipoId][index].metadatos) {
        this.documentos[tipoId][index].metadatos = {}
      }
      this.documentos[tipoId][index].metadatos[campo] = valor
    },

    // Cargar convocatorias abiertas
    async cargarConvocatorias() {
      this.loading = true
      try {
        const { data } = await api.get('/convocatorias/abiertas')
        this.convocatorias = data
      } catch (error) {
        this.error = 'Error al cargar convocatorias'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cargar convocatoria específica (slug)
    async cargarConvocatoria(slug) {
      this.loading = true
      try {
        const { data } = await api.get(`/convocatorias/${slug}`)
        this.convocatoriaActual = data

        if (data.documentos_requeridos || data.documentosRequeridos) {
           const docs = data.documentos_requeridos || data.documentosRequeridos
           // Deduplicar
           const uniqueDocs = []
           const seenIds = new Set()
           docs.forEach(doc => {
               if (!seenIds.has(doc.id)) {
                   seenIds.add(doc.id)
                   uniqueDocs.push(doc)
               }
           })

           this.documentosRequeridos = uniqueDocs.map(doc => ({
             ...doc,
             campos: typeof doc.campos === 'string' ? JSON.parse(doc.campos) : doc.campos,
             permite_multiples: doc.permite_multiples == 1 || doc.permite_multiples === true,
             obligatorio: doc.pivot?.obligatorio == 1 || doc.pivot?.obligatorio === true
           }))

           this.documentos = {}
           this.documentosRequeridos.forEach(doc => {
             this.documentos[doc.id] = []
           })
        }
        return data
      } catch (error) {
        this.error = 'Convocatoria no encontrada'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Verificar CI
    async verificarCI(ci) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.post('/check-ci', { ci })
        this.ci = ci

        if (data.status === 'existente') {
          this.esPostulanteExistente = true
          this.tieneExpediente = data.tiene_expediente

          // Cargar datos existentes
          const p = data.postulante
          this.postulante = {
            nombres: p.nombres,
            apellidos: p.apellidos,
            email: p.email || '',
            celular: p.celular,
            foto_perfil: p.foto_perfil,
            ci_expedido: p.ci_expedido || '',
            nacionalidad: p.nacionalidad || '',
            direccion: p.direccion || '',
            // Guardamos las rutas de archivos existentes
            carta_postulacion: p.carta_postulacion_pdf || null,
            curriculum_vitae: p.curriculum_vitae_pdf || null,
            ci_documento: p.ci_documento_pdf || null,
          }

          // Cargar expediente existente
          this.formaciones = p.formaciones || []
          this.experiencias = p.experiencias || []
          this.capacitaciones = p.capacitaciones || []
          this.producciones = p.producciones || []
          this.reconocimientos = p.reconocimientos || []

          // Cargar documentos dinámicos existentes (si coinciden con los requeridos)
          // Cargar documentos dinámicos existentes (si coinciden con los requeridos)
          if (p.documentos && p.documentos.length > 0) {
            // 1. Agrupar por tipo y quedarse con el MÁS RECIENTE (mayor ID)
            const docsMap = {}
            p.documentos.forEach(doc => {
                const cur = docsMap[doc.tipo_documento_id]
                if (!cur || doc.id > cur.id) {
                    docsMap[doc.tipo_documento_id] = doc
                }
            })

            // 2. Asignar al estado (LIMPIANDO duplicados previos para asegurar solo uno)
            Object.values(docsMap).forEach(doc => {
              const tipoId = doc.tipo_documento_id
              // Solo si este tipo de documento es requerido en la convocatoria actual
              if (this.documentos[tipoId]) {
                this.documentos[tipoId] = [{ // Reemplazamos el array completo
                  id: doc.id,
                  archivo: doc.archivo_pdf,
                  metadatos: typeof doc.metadatos === 'string' ? JSON.parse(doc.metadatos) : (doc.metadatos || {})
                }]
              }
            })
          }
        } else {
          this.esPostulanteExistente = false
          this.tieneExpediente = false
        }

        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al verificar CI'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Seleccionar/deseleccionar oferta
    toggleOferta(ofertaId) {
      const index = this.ofertasSeleccionadas.indexOf(ofertaId)
      if (index === -1) {
        this.ofertasSeleccionadas.push(ofertaId)
      } else {
        this.ofertasSeleccionadas.splice(index, 1)
      }
    },

    // Agregar registro a una sección
    agregarRegistro(seccion, datos) {
      this[seccion].push({ ...datos, _nuevo: true })
    },

    // Eliminar registro de una sección
    eliminarRegistro(seccion, index) {
      this[seccion].splice(index, 1)
    },

    // Enviar postulación completa
    async enviarPostulacion() {
      this.loading = true
      this.error = null

      try {
        // Construir FormData para archivos
        const formData = new FormData()

        // Datos básicos
        formData.append('ci', this.ci)
        formData.append('nombres', this.postulante.nombres)
        formData.append('apellidos', this.postulante.apellidos)
        formData.append('email', this.postulante.email || '')
        formData.append('celular', this.postulante.celular)
        formData.append('nacionalidad', this.postulante.nacionalidad || '')
        formData.append('direccion', this.postulante.direccion || '')
        formData.append('ci_expedido', this.postulante.ci_expedido || '')

        // Los archivos estáticos (legacy) se llenarán automáticamente desde los dinámicos si coinciden los nombres
        // Esto mantiene compatibilidad con la tabla 'postulantes' del backend

        // Foto de perfil
        if (this.postulante.foto_perfil instanceof File) {
          formData.append('foto_perfil', this.postulante.foto_perfil)
        }

        // Ofertas seleccionadas
        this.ofertasSeleccionadas.forEach((id, i) => {
          formData.append(`ofertas[${i}]`, id)
        })

        // Documentos requeridos (dinámicos)
        let docIndex = 0
        for (const [tipoId, items] of Object.entries(this.documentos)) {
          if (!Array.isArray(items)) continue

          // Buscar info del tipo de documento para mapeo legacy
          const tipoInfo = this.documentosRequeridos.find(d => d.id == tipoId)
          const nombreNormalizado = tipoInfo?.nombre?.toLowerCase()?.trim()

          items.forEach(item => {
            if (item.archivo instanceof File) {
              formData.append(`documentos[${docIndex}][tipo_documento_id]`, tipoId)
              formData.append(`documentos[${docIndex}][archivo]`, item.archivo)

              // --- MAPEO LEGACY ---
              // Si el nombre coincide con los clásicos, también enviarlos en los campos raíz
              if (nombreNormalizado?.includes('carta de postulacion')) {
                formData.append('carta_postulacion', item.archivo)
              } else if (nombreNormalizado?.includes('curriculum vitae') || nombreNormalizado?.includes('cv')) {
                formData.append('curriculum_vitae', item.archivo)
              } else if (nombreNormalizado?.includes('cedula') || nombreNormalizado?.includes('ci')) {
                formData.append('ci_documento', item.archivo)
              }

              // Agregar metadatos
              if (item.metadatos && Object.keys(item.metadatos).length > 0) {
                formData.append(`documentos[${docIndex}][metadatos]`, JSON.stringify(item.metadatos))
              }
              docIndex++
            }
          })
        }

        // Formaciones
        this.formaciones.forEach((item, i) => {
          formData.append(`formaciones[${i}][nivel]`, item.nivel)
          formData.append(`formaciones[${i}][titulo_profesion]`, item.titulo_profesion)
          formData.append(`formaciones[${i}][universidad]`, item.universidad)
          formData.append(`formaciones[${i}][anio_emision]`, item.anio_emision)
          if (item.archivo instanceof File) {
            formData.append(`formaciones[${i}][archivo]`, item.archivo)
          }
        })

        // Experiencias
        this.experiencias.forEach((item, i) => {
          formData.append(`experiencias[${i}][cargo_desempenado]`, item.cargo_desempenado)
          formData.append(`experiencias[${i}][empresa_institucion]`, item.empresa_institucion)
          formData.append(`experiencias[${i}][anio_inicio]`, item.anio_inicio)
          formData.append(`experiencias[${i}][anio_fin]`, item.anio_fin || '')
          formData.append(`experiencias[${i}][funciones]`, item.funciones || '')
          if (item.archivo instanceof File) {
            formData.append(`experiencias[${i}][archivo]`, item.archivo)
          }
        })

        // Capacitaciones (Solo las que tengan nombre)
        const capsFiltradas = this.capacitaciones.filter(c => c.nombre_curso && c.nombre_curso.trim() !== '')
        capsFiltradas.forEach((item, i) => {
          formData.append(`capacitaciones[${i}][nombre_curso]`, item.nombre_curso)
          formData.append(`capacitaciones[${i}][institucion_emisora]`, item.institucion_emisora || '')
          formData.append(`capacitaciones[${i}][carga_horaria]`, item.carga_horaria || '')
          formData.append(`capacitaciones[${i}][anio]`, item.anio)
          if (item.archivo instanceof File) {
            formData.append(`capacitaciones[${i}][archivo]`, item.archivo)
          }
        })

        // Producciones (Solo las que tengan título)
        const prodsFiltradas = this.producciones.filter(p => p.titulo && p.titulo.trim() !== '')
        prodsFiltradas.forEach((item, i) => {
          formData.append(`producciones[${i}][tipo]`, item.tipo)
          formData.append(`producciones[${i}][titulo]`, item.titulo)
          formData.append(`producciones[${i}][descripcion]`, item.descripcion || '')
          formData.append(`producciones[${i}][anio]`, item.anio)
          if (item.archivo instanceof File) {
            formData.append(`producciones[${i}][archivo]`, item.archivo)
          }
        })

        // Reconocimientos (Solo los que tengan título o tipo)
        const recsFiltrados = this.reconocimientos.filter(r => (r.titulo && r.titulo.trim() !== '') || (r.tipo_reconocimiento && r.tipo_reconocimiento.trim() !== ''))
        recsFiltrados.forEach((item, i) => {
          formData.append(`reconocimientos[${i}][tipo_reconocimiento]`, item.tipo_reconocimiento || '')
          formData.append(`reconocimientos[${i}][titulo]`, item.titulo || '')
          formData.append(`reconocimientos[${i}][otorgado_por]`, item.otorgado_por || '')
          formData.append(`reconocimientos[${i}][anio]`, item.anio)
          if (item.archivo instanceof File) {
            formData.append(`reconocimientos[${i}][archivo]`, item.archivo)
          }
        })

        const { data } = await api.post('/postulante/proceso-completo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        this.resultado = data
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al enviar postulación'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Consultar estado de postulaciones
    async consultarEstado(ci) {
      try {
        const { data } = await api.post('/consultar-estado', { ci })
        return data
      } finally {
        this.loading = false
      }
    },
  },
})

