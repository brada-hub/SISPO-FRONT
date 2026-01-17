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
        nombre: req.nombre,
        descripcion: req.descripcion,
        campos: req.campos || [],
        config_archivos: req.config_archivos || [],
        compartido: req.compartido,
        usadoPor: req.usadoPor,
        permite_multiples: req.permite_multiples || false,
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
   * Submit the complete application for ALL selected cargos
   */
  async function submitPostulacion() {
    submitting.value = true

    try {
      const formData = new FormData()

      // Add ALL selected offer IDs
      cargosSeleccionados.value.forEach((cargo, idx) => {
        formData.append(`oferta_ids[${idx}]`, cargo.oferta_id)
      })

      // Add personal data
      Object.keys(datosPersonales.value).forEach(key => {
        const value = datosPersonales.value[key]
        if (value !== null && value !== '') {
          if (value instanceof File) {
            formData.append(key, value)
          } else {
            formData.append(key, value)
          }
        }
      })

      // Add merits (Step 3) - Flattening records
      if (meritos.value && Array.isArray(meritos.value)) {
        let globalIndex = 0
        meritos.value.forEach((merito) => {
          merito.registros.forEach((reg) => {
            formData.append(`meritos[${globalIndex}][tipo_documento_id]`, merito.tipo_documento_id)

            // Add responses
            if (reg.respuestas && typeof reg.respuestas === 'object') {
              Object.entries(reg.respuestas).forEach(([key, val]) => {
                if (val !== null && val !== undefined && val !== '') {
                  formData.append(`meritos[${globalIndex}][respuestas][${key}]`, val)
                }
              })
            }

            // Add merit files
            if (reg.archivos && typeof reg.archivos === 'object') {
              Object.entries(reg.archivos).forEach(([configId, file]) => {
                if (file instanceof File) {
                  formData.append(`meritos[${globalIndex}][archivos][${configId}]`, file)
                }
              })
            }
            globalIndex++
          })
        })
      }

      const { data } = await api.post('/portal/postular', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return data
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.error('Validation errors:', error.response.data.errors)
      }
      console.error('Error submitting postulacion:', error)
      throw error
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
    submitPostulacion,
    resetPostulacion,
    setSedeActiva,
    getCargosForSede,
    agregarRegistroMerito,
    duplicarRegistroMerito,
    eliminarRegistroMerito,
  }
})
