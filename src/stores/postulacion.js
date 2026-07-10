import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

export const usePostulacionStore = defineStore('postulacion', () => {
  // =====================
  // STATE
  // =====================

  // Step 1: Multi-offer selection (CARRITO)
  const cargosSeleccionados = ref([]) // Array of { oferta_id, convocatoria_id, cargo_nombre, sede_id, sede_nombre, ... }

  // Step 2: Personal data
  const datosPersonales = ref({
    ci: '',
    ci_expedido: '',
    ci_archivo: null,
    nombres: '',
    apellidos: '',
    nacionalidad: 'Boliviana',
    direccion_domicilio: '',
    email: '',
    celular: '',
    foto_perfil: null,
    cv_pdf: null,
    carta_postulacion: null,
    // References
    ref_personal_celular: '',
    ref_personal_parentesco: '',
    ref_laboral_celular: '',
    ref_laboral_detalle: '',
  })

  // Step 3: Dynamic merits (filled based on combined requirements)
  const meritos = ref([]) // Array of { tipo_documento_id, respuestas: {}, archivos: {} }
  const requisitosUnificados = ref([]) // Merged requirements from all convocatorias

  // Catalog data
  const ofertasActivas = ref([])

  // UI State
  const loading = ref(false)
  const currentStep = ref(1)
  const submitting = ref(false)
  const sedeActiva = ref(null) // For map interaction
  const uploadingFiles = ref(false)
  const uploadProgress = ref({
    current: 0,
    total: 0,
    label: '',
  })
  const archivoTokens = ref({
    personales: {},
    meritos: {},
  })

  // =====================
  // GETTERS
  // =====================
  const hayCargosSeleccionados = computed(() => cargosSeleccionados.value.length > 0)

  const resumenCargos = computed(() => {
    return cargosSeleccionados.value.map(c => ({
      oferta_id: c.oferta_id,
      cargo: c.cargo_nombre,
      sede: c.sede_nombre,
    }))
  })

  const convocatoriaIdsUnicas = computed(() => {
    const ids = new Set()
    cargosSeleccionados.value.forEach(c => ids.add(c.convocatoria_id))
    return Array.from(ids)
  })

  // =====================
  // ACTIONS
  // =====================

  /**
   * Fetch active offers grouped by Sede
   */
  async function fetchOfertasActivas() {
    loading.value = true
    try {
      const { data } = await api.get('/portal/ofertas-activas')

      // Automatically map known sedes to their departments if missing
      const mapSedeToDepartamento = (nombre) => {
        if (!nombre) return ''
        const n = nombre.toLowerCase().trim()
        if (n.includes('cobija')) return 'Pando'
        if (n.includes('guayaramerin') || n.includes('guayaramerín')) return 'Beni'
        if (n.includes('riberalta')) return 'Beni'
        if (n.includes('santa cruz') || n.includes('quijarro')) return 'Santa Cruz'
        if (n.includes('cochabamba') || n.includes('ivirgarzama') || n.includes('trópico') || n.includes('tropico')) return 'Cochabamba'
        if (n.includes('la paz') || n.includes('el alto')) return 'La Paz'
        if (n.includes('sucre') || n.includes('chuquisaca')) return 'Chuquisaca'
        if (n.includes('tarija') || n.includes('yacuiba')) return 'Tarija'
        if (n.includes('oruro')) return 'Oruro'
        if (n.includes('potosi') || n.includes('potosí')) return 'Potosí'
        if (n.includes('beni') || n.includes('trinidad')) return 'Beni'
        if (n.includes('pando')) return 'Pando'
        return nombre
      }

      data.forEach(sede => {
        // Always try to map the department name to a standard one
        // first check the 'departamento' field, then the 'nombre' field
        const rawName = sede.departamento || sede.nombre || ''
        sede.departamento = mapSedeToDepartamento(rawName)
      })

      ofertasActivas.value = data
      return data
    } catch (error) {
      console.error('Error fetching ofertas activas:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Toggle a cargo in the cart
   */
  function toggleCargo(cargo, sede) {
    const index = cargosSeleccionados.value.findIndex(c => c.oferta_id === cargo.oferta_id)

    if (index > -1) {
      // Remove if already selected
      cargosSeleccionados.value.splice(index, 1)
    } else {
      // Add to cart
      cargosSeleccionados.value.push({
        oferta_id: cargo.oferta_id,
        convocatoria_id: cargo.convocatoria_id,
        cargo_id: cargo.cargo_id,
        cargo_nombre: cargo.cargo_nombre,
        sede_id: sede.id,
        sede_nombre: sede.nombre,
        vacantes: cargo.vacantes,
        fecha_cierre: cargo.convocatoria?.fecha_cierre || '',
        pretension_salarial: null,
        porque_cargo: '',
      })
    }
  }

  /**
   * Check if a cargo is selected
   */
  function isCargoSelected(ofertaId) {
    return cargosSeleccionados.value.some(c => c.oferta_id === ofertaId)
  }

  /**
   * Remove a cargo from cart
   */
  function removeCargo(ofertaId) {
    const index = cargosSeleccionados.value.findIndex(c => c.oferta_id === ofertaId)
    if (index > -1) {
      cargosSeleccionados.value.splice(index, 1)
    }
  }

  /**
   * Fetch and merge requirements from all selected convocatorias
   * Avoids duplicates (same tipo_documento_id)
   */
  async function fetchRequisitosUnificados() {
    if (convocatoriaIdsUnicas.value.length === 0) {
      requisitosUnificados.value = []
      meritos.value = []
      return
    }

    loading.value = true
    try {
      // Fetch requirements for each convocatoria
      const promises = convocatoriaIdsUnicas.value.map(id =>
        api.get(`/portal/requisitos/${id}`)
      )
      const responses = await Promise.all(promises)

      // Merge and deduplicate by tipo_documento_id
      const requisitosMap = new Map()

      responses.forEach((res, idx) => {
        const convocatoriaId = convocatoriaIdsUnicas.value[idx]
        const cargo = cargosSeleccionados.value.find(c => c.convocatoria_id === convocatoriaId)

        res.data.forEach(req => {
          if (!requisitosMap.has(req.id)) {
            // First time seeing this requirement
            requisitosMap.set(req.id, {
              ...req,
              compartido: false,
              usadoPor: [cargo?.cargo_nombre || 'Cargo'],
            })
          } else {
            // Duplicate - mark as shared
            const existing = requisitosMap.get(req.id)
            existing.compartido = true
            existing.usadoPor.push(cargo?.cargo_nombre || 'Cargo')
          }
        })
      })

      requisitosUnificados.value = Array.from(requisitosMap.values())

      // Initialize meritos for each unique requirement
      meritos.value = requisitosUnificados.value.map(req => ({
        tipo_documento_id: req.id,
        nombre: req.nombre || req.label,
        descripcion: req.descripcion || req.description || '',
        campos: req.campos || req.fields || [],
        config_archivos: req.config_archivos || req.required_documents || [],
        compartido: req.compartido,
        usadoPor: req.usadoPor,
        opcional: req.opcional || false, // CAPTURE OPTIONAL STATUS
        permite_multiples: req.permite_multiples || req.supports_multiple || false,
        registros: [
          { respuestas: {}, archivos: {} }
        ]
      }))

      return requisitosUnificados.value
    } catch (error) {
      console.error('Error fetching requisitos:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Update personal data (Step 2)
   */
  function updateDatosPersonales(data) {
    datosPersonales.value = { ...datosPersonales.value, ...data }
  }

  /**
   * Helper to compress images on the client side using Canvas
   */
  async function compressImage(file, maxWidth = 1200, quality = 0.7) {
    if (!file || !file.type.startsWith('image/')) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', quality);
        };
      };
    });
  }

  function collectArchivoSnapshot() {
    const personales = {}

    Object.entries(datosPersonales.value).forEach(([key, value]) => {
      if (value instanceof File) {
        personales[key] = value
      }
    })

    const meritosArchivos = []
    if (meritos.value && Array.isArray(meritos.value)) {
      let globalIndex = 0
      meritos.value.forEach((merito) => {
        merito.registros.forEach((reg) => {
          meritosArchivos[globalIndex] = {
            nombre: merito.nombre,
            archivos: { ...(reg.archivos || {}) },
          }
          globalIndex++
        })
      })
    }

    return { personales, meritosArchivos }
  }

  function fileSignature(file) {
    if (!(file instanceof File)) return null
    return `${file.name}:${file.size}:${file.lastModified}`
  }

  function snapshotHasFiles(archivosSnapshot) {
    if (Object.keys(archivosSnapshot.personales).length > 0) return true

    return archivosSnapshot.meritosArchivos.some((merito) => {
      return Object.values(merito?.archivos || {}).some((file) => file instanceof File)
    })
  }

  async function uploadArchivoTemporal(file, scope, field) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    let fileToUpload = file

    if (file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file)
    }

    if (fileToUpload.size > MAX_FILE_SIZE) {
      throw new Error(`El archivo ${file.name} excede el limite de 5MB.`)
    }

    const formData = new FormData()
    formData.append('scope', scope)
    formData.append('field', field)
    formData.append('file', fileToUpload)

    const start = performance.now()
    const { data } = await api.post('/portal/archivo-temporal', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    })
    const totalMs = Math.round(performance.now() - start)
    const serverMs = data.server_elapsed_ms ?? 'n/a'
    console.info(
      `[SISPO] Archivo temporal ${field} subido en ${totalMs}ms ` +
        `(servidor: ${serverMs}ms, tamano: ${fileToUpload.size} bytes)`
    )

    return data.token
  }

  async function runUploadQueue(entries, concurrency, uploadOne) {
    let nextIndex = 0
    let completed = 0

    const workers = Array.from({ length: Math.min(concurrency, entries.length) }, async () => {
      while (nextIndex < entries.length) {
        const entry = entries[nextIndex++]
        uploadProgress.value.label = entry.label
        await uploadOne(entry)
        completed++
        uploadProgress.value.current = completed
      }
    })

    await Promise.all(workers)
  }

  async function prepareArchivoPersonal(key, label, file) {
    if (!(file instanceof File)) return

    const signature = fileSignature(file)
    const current = archivoTokens.value.personales[key]
    if (current?.signature === signature && current?.token) return

    const token = await uploadArchivoTemporal(file, 'personal', key)
    archivoTokens.value.personales[key] = { token, signature }
  }

  async function prepararArchivosPersonales() {
    const personales = collectArchivoSnapshot().personales
    const entries = [
      ['foto_perfil', 'Fotografia personal'],
      ['ci_archivo', 'Documento CI'],
      ['cv_pdf', 'Curriculum vitae'],
      ['carta_postulacion', 'Carta de postulacion'],
    ].filter(([key]) => personales[key] instanceof File)

    if (entries.length === 0) return

    uploadingFiles.value = true
    uploadProgress.value = { current: 0, total: entries.length, label: '' }
    try {
      await runUploadQueue(
        entries.map(([key, label]) => ({ key, label, file: personales[key] })),
        4,
        (entry) => prepareArchivoPersonal(entry.key, entry.label, entry.file)
      )
    } finally {
      uploadingFiles.value = false
    }
  }

  async function prepararArchivosMeritos() {
    const { meritosArchivos } = collectArchivoSnapshot()
    const entries = []

    meritosArchivos.forEach((snapshot, index) => {
      Object.entries(snapshot?.archivos || {}).forEach(([configId, file]) => {
        if (file instanceof File) {
          entries.push({ index, configId, file, label: snapshot.nombre || 'Merito' })
        }
      })
    })

    if (entries.length === 0) return

    uploadingFiles.value = true
    uploadProgress.value = { current: 0, total: entries.length, label: '' }
    try {
      await runUploadQueue(entries, 3, async (entry) => {
        const key = `${entry.index}:${entry.configId}`
        const signature = fileSignature(entry.file)
        const current = archivoTokens.value.meritos[key]
        if (current?.signature === signature && current?.token) return

        uploadProgress.value.label = entry.label
        const token = await uploadArchivoTemporal(entry.file, 'merito', key)
        archivoTokens.value.meritos[key] = { token, signature }
      })
    } finally {
      uploadingFiles.value = false
    }
  }

  /**
   * Submit the complete application for ALL selected cargos
   */
  async function submitPostulacion() {
    submitting.value = true

    try {
      const formData = new FormData()
      const archivosSnapshot = collectArchivoSnapshot()

      await prepararArchivosPersonales()
      await prepararArchivosMeritos()

      // Add ALL selected offer IDs
      cargosSeleccionados.value.forEach((cargo, idx) => {
        formData.append(`oferta_ids[${idx}]`, cargo.oferta_id)
      })
      formData.append('has_archivos', snapshotHasFiles(archivosSnapshot) ? '1' : '0')

      // Add personal data only; files are uploaded after the DB save succeeds.
      for (const key of Object.keys(datosPersonales.value)) {
        const value = datosPersonales.value[key]
        if (value !== null && value !== '' && !(value instanceof File)) {
          formData.append(key, value)
        }
      }

      Object.entries(archivoTokens.value.personales).forEach(([key, info]) => {
        if (info?.token) {
          formData.append(`archivo_tokens[${key}]`, info.token)
        }
      })

      // Add per-cargo details
      cargosSeleccionados.value.forEach((cargo, idx) => {
        formData.append(`ofertas_detalle[${idx}][oferta_id]`, cargo.oferta_id)
        formData.append(`ofertas_detalle[${idx}][pretension_salarial]`, cargo.pretension_salarial || 0)
        formData.append(`ofertas_detalle[${idx}][porque_cargo]`, cargo.porque_cargo || '')
      })

      // Add merits (Step 3) - Flattening records
      if (meritos.value && Array.isArray(meritos.value)) {
        let globalIndex = 0
        for (const merito of meritos.value) {
          for (const reg of merito.registros) {
            formData.append(`meritos[${globalIndex}][tipo_documento_id]`, merito.tipo_documento_id)

            // Add responses
            if (reg.respuestas && typeof reg.respuestas === 'object') {
              Object.entries(reg.respuestas).forEach(([key, val]) => {
                if (val !== null && val !== undefined && val !== '') {
                  formData.append(`meritos[${globalIndex}][respuestas][${key}]`, val)
                }
              })
            }

            Object.entries(reg.archivos || {}).forEach(([configId, file]) => {
              if (!(file instanceof File)) return
              const tokenInfo = archivoTokens.value.meritos[`${globalIndex}:${configId}`]
              if (tokenInfo?.token) {
                formData.append(`meritos[${globalIndex}][archivo_tokens][${configId}]`, tokenInfo.token)
              }
            })

            globalIndex++
          }
        }
      }

      const { data } = await api.post('/portal/postular', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000, // Increased to 3 minutes for peace of mind
      })

      return data
    } catch (error) {
      // Manejo estructurado de errores
      let customError = {
        message: 'Error desconocido al procesar la postulación.',
        details: null,
        type: 'error'
      }

      if (error.response) {
        // El servidor respondió con un error (4xx, 5xx)
        if (error.response.status === 422) {
          customError.message = 'Existen errores de validación en su información.'
          customError.details = error.response.data.errors
          customError.type = 'validation'
        } else if (error.response.status === 413) {
          customError.message = 'Los archivos seleccionados son demasiado pesados para el servidor.'
        } else if (error.response.data && error.response.data.message) {
          customError.message = error.response.data.message
        }
      } else if (error.message) {
        // Error local (como el de tamaño de archivo lanzado arriba) o de red
        customError.message = error.message
      }

      throw customError
    } finally {
      submitting.value = false
    }
  }

  /**
   * Reset the entire postulation state
   */
  function resetPostulacion() {
    cargosSeleccionados.value = []
    datosPersonales.value = {
      ci: '',
      ci_expedido: '',
      ci_archivo: null,
      nombres: '',
      apellidos: '',
      nacionalidad: 'Boliviana',
      direccion_domicilio: '',
      email: '',
      celular: '',
      foto_perfil: null,
      cv_pdf: null,
      carta_postulacion: null,
      ref_personal_celular: '',
      ref_personal_parentesco: '',
      ref_laboral_celular: '',
      ref_laboral_detalle: '',
    }
    meritos.value = []
    requisitosUnificados.value = []
    currentStep.value = 1
    sedeActiva.value = null
    archivoTokens.value = {
      personales: {},
      meritos: {},
    }
    uploadProgress.value = {
      current: 0,
      total: 0,
      label: '',
    }
  }

  /**
   * Set the active sede (for map interaction)
   */
  function setSedeActiva(sedeId) {
    sedeActiva.value = sedeId
  }

  /**
   * Add a new empty record to a merit type
   */
  function agregarRegistroMerito(tipoDocumentoId) {
    const merito = meritos.value.find(m => m.tipo_documento_id == tipoDocumentoId)
    if (merito && merito.permite_multiples) {
      merito.registros.push({ respuestas: {}, archivos: {} })
    }
  }

  /**
   * Duplicate a record with its text data (not files)
   */
  function duplicarRegistroMerito(tipoDocumentoId, index) {
    const merito = meritos.value.find(m => m.tipo_documento_id == tipoDocumentoId)
    if (merito && merito.permite_multiples) {
      const original = merito.registros[index]
      merito.registros.push({
        respuestas: { ...original.respuestas },
        archivos: {} // Files cannot be duplicated easily for security/logic
      })
    }
  }

  /**
   * Remove a record from a merit type
   */
  function eliminarRegistroMerito(tipoDocumentoId, index) {
    const merito = meritos.value.find(m => m.tipo_documento_id == tipoDocumentoId)
    if (merito && merito.registros.length > 1) {
      merito.registros.splice(index, 1)
    }
  }

  /**
   * Get cargos for specific sede
   */
  function getCargosForSede(sedeId) {
    const sede = ofertasActivas.value.find(s => s.id === sedeId)
    return sede?.cargos || []
  }

  /**
   * Selects all active offers that belong to a convocatoria and loads them into the cart.
   */
  function autoSelectConvocatoria(convocatoriaId) {
    const normalizedId = Number(convocatoriaId)
    cargosSeleccionados.value = []

    if (!normalizedId) {
      sedeActiva.value = null
      return 0
    }

    const sedesConSeleccion = []

    ofertasActivas.value.forEach((sede) => {
      const cargos = Array.isArray(sede.cargos) ? sede.cargos : []

      cargos.forEach((cargo) => {
        if (Number(cargo.convocatoria_id) !== normalizedId) return

        cargosSeleccionados.value.push({
          oferta_id: cargo.oferta_id,
          convocatoria_id: cargo.convocatoria_id,
          cargo_id: cargo.cargo_id,
          cargo_nombre: cargo.cargo_nombre,
          sede_id: sede.id,
          sede_nombre: sede.nombre,
          vacantes: cargo.vacantes,
          fecha_cierre: cargo.convocatoria?.fecha_cierre || '',
          pretension_salarial: null,
          porque_cargo: '',
        })

        sedesConSeleccion.push(sede)
      })
    })

    const primeraSede = sedesConSeleccion[0]
    sedeActiva.value = primeraSede ? (primeraSede.departamento || primeraSede.nombre || null) : null

    return cargosSeleccionados.value.length
  }

  return {
    // State
    cargosSeleccionados,
    datosPersonales,
    meritos,
    ofertasActivas,
    requisitosUnificados,
    loading,
    currentStep,
    submitting,
    sedeActiva,
    uploadingFiles,
    uploadProgress,

    // Getters
    hayCargosSeleccionados,
    resumenCargos,
    convocatoriaIdsUnicas,

    // Actions
    fetchOfertasActivas,
    toggleCargo,
    isCargoSelected,
    removeCargo,
    fetchRequisitosUnificados,
    updateDatosPersonales,
    prepararArchivosPersonales,
    prepararArchivosMeritos,
    submitPostulacion,
    resetPostulacion,
    setSedeActiva,
    getCargosForSede,
    agregarRegistroMerito,
    duplicarRegistroMerito,
    eliminarRegistroMerito,
    autoSelectConvocatoria,
  }
})
