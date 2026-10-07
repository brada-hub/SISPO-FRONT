<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-gray-50 flex flex-col no-wrap h-screen overflow-hidden">
      <!-- HEADER DEL MODAL -->
      <div class="bg-white px-6 py-4 border-b border-gray-150 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100 font-bold">
            <q-icon name="inbox" size="22px" />
          </div>
          <div>
            <h2 class="text-base font-black text-gray-900 uppercase tracking-tight leading-none">
              Bandeja de Requerimientos de Carrera
            </h2>
            <p class="text-[11px] text-gray-400 font-medium mt-1 leading-none">
              Solicitudes de nuevas convocatorias enviadas por Directores de Carrera y Jefaturas para visto bueno de Talento Humano.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <!-- SWITCH DE ACTIVACIÓN DEL ENLACE PÚBLICO -->
          <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-2xl">
            <q-toggle
              v-model="recepcionHabilitada"
              :color="recepcionHabilitada ? 'positive' : 'grey-5'"
              dense
              :loading="togglingRecepcion"
              @update:model-value="handleToggleRecepcion"
            />
            <div class="text-left">
              <div class="text-[10px] font-black uppercase tracking-wider leading-none" :class="recepcionHabilitada ? 'text-positive' : 'text-grey-7'">
                {{ recepcionHabilitada ? 'Enlace Activo' : 'Enlace Cerrado' }}
              </div>
              <div class="text-[9px] text-gray-400 font-medium leading-none mt-0.5">
                {{ recepcionHabilitada ? 'Recepción habilitada' : 'Recepción bloqueada' }}
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              size="xs"
              icon="edit_note"
              color="primary"
              @click="promptEditarMensajeCierre"
            >
              <q-tooltip>Personalizar mensaje de cierre</q-tooltip>
            </q-btn>
          </div>

          <q-btn
            icon="refresh"
            flat
            round
            dense
            color="primary"
            :loading="loading"
            @click="loadSolicitudes"
          >
            <q-tooltip>Actualizar solicitudes</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" color="gray-6" v-close-popup />
        </div>
      </div>

      <!-- WORKSPACE DE 2 COLUMNAS -->
      <div class="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        <!-- COLUMNA IZQUIERDA: LISTA DE SOLICITUDES Y FILTROS (lg:col-span-5) -->
        <div class="lg:col-span-5 bg-white border-r border-gray-150 flex flex-col h-full overflow-hidden">
          <!-- Filtros de Estado & Buscador -->
          <div class="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50 shrink-0">
            <q-input
              v-model="search"
              placeholder="Buscar por código, carrera, director..."
              dense
              outlined
              rounded
              bg-color="white"
              clearable
              class="text-xs"
              @update:model-value="filterSolicitudes"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="16px" color="primary" />
              </template>
            </q-input>

            <div class="flex bg-gray-200/60 p-1 rounded-xl gap-1">
              <div
                v-for="st in ['todas', 'pendiente', 'observada', 'aprobada', 'rechazada']"
                :key="st"
                @click="filterEstado = st; filterSolicitudes()"
                :class="[
                  'flex-1 text-center py-1.5 rounded-lg cursor-pointer text-[10px] font-black uppercase transition-all select-none',
                  filterEstado === st
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                ]"
              >
                {{ st }}
              </div>
            </div>
          </div>

          <!-- LISTA CON SCROLL -->
          <div class="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
            <div
              v-for="s in filteredList"
              :key="s.id"
              @click="selectedSolicitud = s"
              :class="[
                'p-4 rounded-2xl cursor-pointer transition-all border text-left',
                selectedSolicitud?.id === s.id
                  ? 'bg-indigo-50/40 border-primary/50 shadow-sm'
                  : 'bg-white border-transparent hover:bg-gray-50'
              ]"
            >
              <div class="flex justify-between items-start gap-2 mb-1.5">
                <span class="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                  {{ s.codigo_solicitud }}
                </span>
                <q-badge
                  :color="getEstadoColor(s.estado)"
                  class="font-black text-[9px] uppercase px-2 py-0.5 rounded-md"
                >
                  {{ s.estado }}
                </q-badge>
              </div>

              <div class="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1 mb-1">
                {{ s.titulo_sugerido }}
              </div>

              <div class="text-[11px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                <q-icon name="school" size="14px" color="teal-8" />
                <span>{{ s.solicitante_carrera }}</span>
                <span class="text-gray-300">•</span>
                <span class="text-gray-400 font-medium truncate">{{ s.solicitante_nombre }}</span>
              </div>

              <div class="text-[10px] text-gray-400 mt-2 flex items-center justify-between">
                <span>{{ formatDate(s.created_at) }}</span>
                <span class="font-bold text-[#4a2371]">{{ s.tipo_perfil?.toUpperCase() }}</span>
              </div>
            </div>

            <div v-if="filteredList.length === 0 && !loading" class="p-12 text-center text-gray-400 text-xs">
              No se encontraron solicitudes con los filtros actuales.
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: EXPEDIENTE DETALLADO DEL REQUERIMIENTO (lg:col-span-7) -->
        <div class="lg:col-span-7 bg-gray-50/30 flex flex-col h-full overflow-hidden">
          
          <div v-if="selectedSolicitud" class="flex-1 flex flex-col h-full overflow-hidden">
            
            <!-- CONTENIDO DETALLE CON SCROLL -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              
              <!-- TARJETA CABECERA DETALLE -->
              <div class="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-3">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                        {{ selectedSolicitud.codigo_solicitud }}
                      </span>
                      <span class="text-[10px] text-gray-400 font-bold uppercase">
                        Fecha: {{ formatDate(selectedSolicitud.created_at) }}
                      </span>
                    </div>
                    <h3 class="text-lg font-black text-gray-900 uppercase tracking-tight leading-snug">
                      {{ selectedSolicitud.titulo_sugerido }}
                    </h3>
                  </div>

                  <q-badge
                    :color="getEstadoColor(selectedSolicitud.estado)"
                    class="text-xs font-black uppercase px-3 py-1 rounded-xl shadow-sm"
                  >
                    {{ selectedSolicitud.estado }}
                  </q-badge>
                </div>

                <div v-if="selectedSolicitud.descripcion_motivo" class="bg-gray-50 p-3.5 rounded-2xl text-xs text-gray-600 border border-gray-100">
                  <span class="font-black text-gray-700 uppercase text-[10px] block mb-1">Justificación de la Carrera:</span>
                  {{ selectedSolicitud.descripcion_motivo }}
                </div>
              </div>

              <!-- DATOS DEL SOLICITANTE -->
              <div class="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-3">
                <div class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <q-icon name="person" /> Datos del Solicitante
                </div>
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase block">Nombre Completo:</span>
                    <span class="font-black text-gray-800 uppercase">{{ selectedSolicitud.solicitante_nombre }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase block">Cargo:</span>
                    <span class="font-black text-gray-800 uppercase">{{ selectedSolicitud.solicitante_cargo }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase block">Carrera / Unidad:</span>
                    <span class="font-black text-gray-800 uppercase">{{ selectedSolicitud.solicitante_carrera }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase block">Contacto:</span>
                    <span class="font-bold text-gray-700">{{ selectedSolicitud.solicitante_telefono }} • {{ selectedSolicitud.solicitante_email }}</span>
                  </div>
                </div>
              </div>

              <!-- SEDES Y CARGOS SOLICITADOS -->
              <div class="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                <div class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <q-icon name="apartment" /> Sedes Académicas y Cargos Ofertados
                </div>

                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Sedes Solicitadas:</span>
                  <div class="flex flex-wrap gap-1.5">
                    <q-chip
                      v-for="sede in selectedSolicitud.sedes_nombres"
                      :key="sede"
                      color="indigo-50"
                      text-color="indigo-9"
                      class="font-black text-xs uppercase rounded-lg border border-indigo-100"
                    >
                      <q-icon name="place" size="14px" class="q-mr-xs" />
                      {{ sede }}
                    </q-chip>
                  </div>
                </div>

                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Cargos Solicitados (Sin límite de vacantes):</span>
                  <div class="flex flex-wrap gap-1.5">
                    <q-chip
                      v-for="cargo in selectedSolicitud.cargos_nombres"
                      :key="cargo"
                      color="teal-50"
                      text-color="teal-9"
                      class="font-black text-xs uppercase rounded-lg border border-teal-100"
                    >
                      <q-icon name="badge" size="14px" class="q-mr-xs" />
                      {{ cargo }}
                    </q-chip>
                  </div>
                </div>
              </div>

              <!-- REQUISITOS PROPUESTOS POR LA CARRERA -->
              <div class="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                <div class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <q-icon name="fact_check" /> Requisitos Solicitados para el Afiche
                </div>

                <div class="space-y-3 text-xs">
                  <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <span class="text-[10px] font-black text-gray-500 uppercase block mb-0.5">Formación Académica Mínima:</span>
                    <span class="font-bold text-gray-800">{{ selectedSolicitud.requisito_formacion || 'No especificado' }}</span>
                  </div>

                  <div v-if="selectedSolicitud.requisito_posgrado" class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <span class="text-[10px] font-black text-gray-500 uppercase block mb-0.5">Posgrados / Especialidades:</span>
                    <span class="font-bold text-gray-800">{{ selectedSolicitud.requisito_posgrado }}</span>
                  </div>

                  <div v-if="selectedSolicitud.requisito_experiencia_profesional" class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <span class="text-[10px] font-black text-gray-500 uppercase block mb-0.5">Experiencia Profesional:</span>
                    <span class="font-bold text-gray-800">{{ selectedSolicitud.requisito_experiencia_profesional }}</span>
                  </div>

                  <div v-if="selectedSolicitud.requisito_experiencia_docente" class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <span class="text-[10px] font-black text-gray-500 uppercase block mb-0.5">Experiencia Docente:</span>
                    <span class="font-bold text-gray-800">{{ selectedSolicitud.requisito_experiencia_docente }}</span>
                  </div>

                  <div v-if="selectedSolicitud.otros_requisitos" class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <span class="text-[10px] font-black text-gray-500 uppercase block mb-0.5">Otros Requisitos:</span>
                    <span class="font-bold text-gray-800">{{ selectedSolicitud.otros_requisitos }}</span>
                  </div>
                </div>

                <!-- ARCHIVO DE RESPALDO SI FUE ADJUNTADO -->
                <div v-if="selectedSolicitud.archivo_adjunto_path" class="pt-2">
                  <q-btn
                    label="Ver Documento / Carta de Respaldo"
                    icon="attach_file"
                    color="primary"
                    outline
                    rounded
                    dense
                    class="font-black text-xs px-4 py-2"
                    @click="openRespaldo(selectedSolicitud.archivo_adjunto_path)"
                  />
                </div>
              </div>

              <!-- NOTAS / OBSERVACIONES DE RRHH -->
              <div v-if="selectedSolicitud.observaciones_rrhh" class="bg-amber-50 border border-amber-200 p-4 rounded-3xl text-xs text-amber-950">
                <div class="font-black uppercase text-[10px] flex items-center gap-1.5 mb-1">
                  <q-icon name="feedback" color="warning" size="16px" /> Observaciones de Talento Humano:
                </div>
                <div>{{ selectedSolicitud.observaciones_rrhh }}</div>
              </div>

              <!-- SI YA FUE APROBADA -->
              <div v-if="selectedSolicitud.estado === 'aprobada'" class="bg-teal-50 border border-teal-200 p-4 rounded-3xl text-xs text-teal-950 flex items-center justify-between">
                <div>
                  <div class="font-black uppercase text-xs flex items-center gap-1.5 text-teal-800">
                    <q-icon name="check_circle" size="18px" /> Solicitud con Visto Bueno Aprobado
                  </div>
                  <div class="text-[11px] text-teal-700 mt-1">
                    Convocatoria vinculada #{{ selectedSolicitud.convocatoria_creada_id }}.
                  </div>
                </div>
              </div>

            </div>

            <!-- BARRA DE ACCIONES INFERIOR (STICKY ACTION BAR) -->
            <div class="bg-white p-4 border-t border-gray-150 flex items-center justify-between shrink-0 shadow-lg z-10">
              <div class="flex gap-2">
                <q-btn
                  v-if="selectedSolicitud.estado !== 'aprobada'"
                  label="Observar"
                  icon="rate_review"
                  color="orange-9"
                  flat
                  rounded
                  dense
                  class="font-black px-4 text-xs"
                  @click="promptObservar"
                />
                <q-btn
                  v-if="selectedSolicitud.estado !== 'aprobada' && selectedSolicitud.estado !== 'rechazada'"
                  label="Rechazar"
                  icon="cancel"
                  color="red-7"
                  flat
                  rounded
                  dense
                  class="font-black px-4 text-xs"
                  @click="confirmRechazar"
                />
              </div>

              <div class="flex items-center gap-3">
                <q-btn
                  v-if="selectedSolicitud.estado !== 'aprobada'"
                  label="✅ Visto Bueno y Crear Convocatoria"
                  icon="add_task"
                  color="teal-8"
                  unelevated
                  rounded
                  class="font-black px-6 py-2.5 text-xs shadow-md"
                  :loading="approving"
                  @click="handleAprobar"
                />
                <span v-else class="text-xs font-black text-teal-800 uppercase flex items-center gap-1">
                  <q-icon name="task_alt" color="teal-8" size="18px" /> Aprobada & Generada
                </span>
              </div>
            </div>

          </div>

          <!-- ESTADO VACÍO CUANDO NO HAY SELECCIONADO -->
          <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
            <q-icon name="touch_app" size="56px" class="opacity-20 mb-3" />
            <div class="text-sm font-black uppercase tracking-wider text-gray-500">Seleccione una Solicitud</div>
            <p class="text-xs text-gray-400 mt-1">Haga clic en una de las solicitudes de la izquierda para revisar su detalle y otorgar el visto bueno.</p>
          </div>

        </div>

      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:model-value', 'convocatoria-creada'])

const $q = useQuasar()
const loading = ref(false)
const approving = ref(false)
const solicitudes = ref([])
const filteredList = ref([])
const selectedSolicitud = ref(null)

const search = ref('')
const filterEstado = ref('pendiente')

// ESTADO DE RECEPCIÓN DEL ENLACE PÚBLICO
const recepcionHabilitada = ref(true)
const mensajeCierre = ref('')
const togglingRecepcion = ref(false)

const loadRecepcionStatus = async () => {
  try {
    const { data } = await api.get('/portal/recepcion-solicitudes-status')
    recepcionHabilitada.value = data.habilitada
    mensajeCierre.value = data.mensaje_cierre
  } catch {
    // ignore
  }
}

const handleToggleRecepcion = async (val) => {
  togglingRecepcion.value = true
  try {
    await api.post('/solicitudes-convocatorias/toggle-recepcion', {
      habilitada: val,
      mensaje_cierre: mensajeCierre.value
    })
    $q.notify({
      type: val ? 'positive' : 'warning',
      message: val ? 'Recepción de solicitudes HABILITADA en el portal' : 'Recepción de solicitudes DESACTIVADA en el portal',
      position: 'top'
    })
  } catch {
    recepcionHabilitada.value = !val
    $q.notify({ type: 'negative', message: 'Error al cambiar estado de recepción' })
  } finally {
    togglingRecepcion.value = false
  }
}

const promptEditarMensajeCierre = () => {
  $q.dialog({
    title: 'Mensaje de Cierre para las Carreras',
    message: 'Este mensaje se mostrará a los directores cuando la recepción esté desactivada:',
    prompt: {
      model: mensajeCierre.value,
      type: 'textarea',
      placeholder: 'Ej. El periodo de recepción ha concluido...'
    },
    ok: { label: 'Guardar Mensaje', color: 'primary', unelevated: true, rounded: true },
    cancel: { label: 'Cancelar', flat: true, rounded: true }
  }).onOk(async (nuevoMsg) => {
    mensajeCierre.value = nuevoMsg
    try {
      await api.post('/solicitudes-convocatorias/toggle-recepcion', {
        habilitada: recepcionHabilitada.value,
        mensaje_cierre: nuevoMsg
      })
      $q.notify({ type: 'positive', message: 'Mensaje de cierre actualizado exitosamente' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al actualizar mensaje' })
    }
  })
}

watch(() => props.modelValue, (val) => {
  if (val) {
    loadSolicitudes()
    loadRecepcionStatus()
  }
})

onMounted(() => {
  if (props.modelValue) {
    loadSolicitudes()
    loadRecepcionStatus()
  }
})

const loadSolicitudes = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/solicitudes-convocatorias')
    solicitudes.value = data || []
    filterSolicitudes()
    if (solicitudes.value.length > 0 && !selectedSolicitud.value) {
      selectedSolicitud.value = filteredList.value[0] || solicitudes.value[0]
    }
  } catch (error) {
    console.error('Error al cargar solicitudes:', error)
  } finally {
    loading.value = false
  }
}

const filterSolicitudes = () => {
  let list = [...solicitudes.value]
  if (filterEstado.value !== 'todas') {
    list = list.filter(s => s.estado === filterEstado.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase().trim()
    list = list.filter(s =>
      s.codigo_solicitud?.toLowerCase().includes(q) ||
      s.solicitante_carrera?.toLowerCase().includes(q) ||
      s.solicitante_nombre?.toLowerCase().includes(q) ||
      s.titulo_sugerido?.toLowerCase().includes(q)
    )
  }
  filteredList.value = list
}

const formatDate = (val) => {
  if (!val) return '-'
  return date.formatDate(val, 'DD/MM/YYYY HH:mm')
}

const getEstadoColor = (estado) => {
  const map = {
    pendiente: 'orange-8',
    observada: 'deep-orange-7',
    aprobada: 'positive',
    rechazada: 'negative'
  }
  return map[estado] || 'grey-7'
}

const openRespaldo = (path) => {
  if (!path) return
  const base = process.env.API_URL || 'http://localhost:8000'
  window.open(`${base}/storage/${path}`, '_blank')
}

const promptObservar = () => {
  if (!selectedSolicitud.value) return
  $q.dialog({
    title: 'Observar Requerimiento de Carrera',
    message: 'Escriba las observaciones o motivos para que la carrera ajuste el requerimiento:',
    prompt: {
      model: selectedSolicitud.value.observaciones_rrhh || '',
      type: 'textarea',
      placeholder: 'Ej. Indicar mayor detalle en la formación requerida o ajustar perfil...'
    },
    ok: { label: 'Enviar Observación', color: 'orange-9', unelevated: true, rounded: true },
    cancel: { label: 'Cancelar', flat: true, rounded: true }
  }).onOk(async (nota) => {
    try {
      await api.put(`/solicitudes-convocatorias/${selectedSolicitud.value.id}/estado`, {
        estado: 'observada',
        observaciones_rrhh: nota
      })
      selectedSolicitud.value.estado = 'observada'
      selectedSolicitud.value.observaciones_rrhh = nota
      $q.notify({ type: 'info', message: 'Solicitud marcada como observada' })
      loadSolicitudes()
    } catch {
      $q.notify({ type: 'negative', message: 'Error al actualizar estado' })
    }
  })
}

const confirmRechazar = () => {
  if (!selectedSolicitud.value) return
  $q.dialog({
    title: 'Rechazar Solicitud',
    message: `¿Está seguro de rechazar la solicitud ${selectedSolicitud.value.codigo_solicitud}?`,
    prompt: {
      model: '',
      type: 'textarea',
      placeholder: 'Motivo del rechazo (opcional)...'
    },
    ok: { label: 'Confirmar Rechazo', color: 'negative', unelevated: true, rounded: true },
    cancel: { label: 'Cancelar', flat: true, rounded: true }
  }).onOk(async (nota) => {
    try {
      await api.put(`/solicitudes-convocatorias/${selectedSolicitud.value.id}/estado`, {
        estado: 'rechazada',
        observaciones_rrhh: nota
      })
      selectedSolicitud.value.estado = 'rechazada'
      $q.notify({ type: 'warning', message: 'Solicitud rechazada' })
      loadSolicitudes()
    } catch {
      $q.notify({ type: 'negative', message: 'Error al rechazar solicitud' })
    }
  })
}

const handleAprobar = async () => {
  if (!selectedSolicitud.value) return
  approving.value = true
  try {
    const { data } = await api.post(`/solicitudes-convocatorias/${selectedSolicitud.value.id}/aprobar`)
    $q.notify({
      type: 'positive',
      message: '¡Visto Bueno Otorgado! Abriendo Convocatoria en el Wizard...',
      position: 'top',
      timeout: 2500
    })

    // Emitir al padre para que abra el wizard con la convocatoria recién creada
    emit('convocatoria-creada', data.convocatoria)
    emit('update:model-value', false)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al aprobar la solicitud'
    })
  } finally {
    approving.value = false
  }
}
</script>
