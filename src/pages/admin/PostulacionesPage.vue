<template>
  <q-page class="p-6 bg-gray-50/50">
    <!-- Header -->
    <div class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Gestión de Postulaciones</h1>
        <p class="text-gray-500 font-medium">
          Seleccione una convocatoria y filtre por sede y cargo para gestionar los postulantes.
        </p>
      </div>
      <div v-if="canManageAll" class="flex gap-3">
        <q-btn
          label="Importar desde Excel"
          icon="upload_file"
          color="deep-purple-8"
          unelevated
          rounded
          class="shadow-md hover:shadow-lg transition-all"
          @click="showImportDialog = true"
        />
      </div>
    </div>

    <!-- 1. Grid of Convocatorias (Visual Cards) -->
    <div v-if="!selectedConvocatoria" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
      <q-card
        v-for="conv in convocatorias"
        :key="conv.id"
        class="conv-card group cursor-pointer hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden border-none"
        @click="selectConvocatoria(conv)"
      >
        <div class="h-40 bg-gradient-to-br from-primary to-secondary relative flex items-center p-8 overflow-hidden">
           <!-- Decorative Icon -->
           <q-icon name="campaign" class="absolute -right-4 -bottom-4 text-white/10 text-[180px] rotate-12 group-hover:rotate-0 transition-transform duration-500" />

           <div class="relative z-10 w-full">
             <div class="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-white text-[10px] font-black w-fit mb-3 uppercase tracking-tighter">
               Gestión {{ conv.gestion || 2026 }}
             </div>
             <h3 class="text-white text-xl font-black leading-tight uppercase group-hover:translate-x-1 transition-transform">
               {{ conv.titulo }}
             </h3>
             <div class="text-white/80 text-xs font-bold mt-2 flex items-center gap-1">
               <q-icon name="tag" size="14px" /> {{ conv.codigo_interno || 'S/C' }}
             </div>
           </div>
        </div>

        <q-card-section class="p-6 bg-white">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
               <div class="text-[9px] uppercase font-bold text-gray-400 mb-1">Inicio</div>
               <div class="text-sm font-black text-gray-700 tracking-tight">{{ formatDate(conv.fecha_inicio) }}</div>
            </div>
            <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
               <div class="text-[9px] uppercase font-bold text-gray-400 mb-1">Cierre</div>
               <div class="text-sm font-black text-red-600 tracking-tight transition-colors">{{ formatDate(conv.fecha_cierre) }}</div>
            </div>
          </div>

          <div class="flex items-center justify-between py-2 border-b border-gray-100 mb-4">
             <span class="text-xs font-bold text-gray-500">Postulantes Registrados</span>
             <q-badge color="primary" class="rounded-lg p-1 px-3 font-black">{{ conv.postulaciones_count }}</q-badge>
          </div>

          <q-btn
            label="Gestionar Postulantes"
            flat
            color="primary"
            class="w-full rounded-xl font-black text-sm uppercase group-hover:bg-primary/5 transition-colors h-12"
            icon-right="arrow_forward"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- 2. Hierarchical View (When Convocatoria is Selected) -->
    <div v-else class="animate-fade-in-up">
      <!-- Top Navigation / Breadcrumbs -->
      <div class="flex items-center gap-4 mb-8">
        <q-btn
          icon="arrow_back"
          flat
          round
          color="gray-7"
          @click="resetSelection"
          class="bg-white shadow-sm"
        />
        <div>
          <h2 class="text-2xl font-black text-primary uppercase leading-tight">{{ selectedConvocatoria.titulo }}</h2>
          <div class="flex items-center gap-2 mt-1">
             <q-badge outline color="secondary" class="font-bold">CONV-{{ selectedConvocatoria.id }}</q-badge>
             <span class="text-xs text-gray-400 font-bold uppercase">{{ formatDate(selectedConvocatoria.fecha_inicio) }} - {{ formatDate(selectedConvocatoria.fecha_cierre) }}</span>
          </div>
        </div>
        <q-space />
        <q-btn
          label="Exportar Excel"
          icon="download"
          color="green-8"
          unelevated
          @click="exportGeneralReport"
          rounded
          class="shadow-md font-bold"
        />
      </div>

      <!-- SELECTION STEPS -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        <!-- Step 1: Select Sede (Left Panel) -->
        <div class="lg:col-span-3">
          <div class="text-[11px] font-black text-primary uppercase tracking-[2px] mb-4 flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center">1</div>
            Seleccione Sede
          </div>
          <q-select
            v-model="filterSede"
            :options="availableSedes"
            outlined
            rounded
            bg-color="white"
            class="shadow-sm border-none"
            placeholder="Seleccione una Sede..."
            emit-value
            map-options
            @update:model-value="filterCargo = null"
          >
            <template v-slot:prepend>
              <q-icon name="apartment" color="primary" />
            </template>
          </q-select>
        </div>

        <!-- Step 2: Select Cargo (Right Panel - Multi-cards) -->
        <div class="lg:col-span-9" v-if="filterSede">
          <div class="text-[11px] font-black text-primary uppercase tracking-[2px] mb-4 flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center">2</div>
            Seleccione Carrera / Cargo
          </div>
          <div class="flex gap-4 flex-wrap">
             <div
               v-for="cargo in availableCargos"
               :key="cargo.nombre"
               @click="filterCargo = cargo.nombre"
               :class="[
                 'cargo-pill w-full sm:w-80 p-5 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between border-2',
                 filterCargo === cargo.nombre
                   ? 'bg-primary border-primary text-white shadow-xl scale-105'
                   : 'bg-white border-gray-100 text-gray-700 hover:border-primary/50 hover:bg-primary/5'
               ]"
             >
                <div class="text-xs font-black uppercase tracking-tight line-clamp-2 pr-10 mb-2">
                  {{ cargo.nombre }}
                </div>
                <div :class="['text-[11px] font-bold mt-auto', filterCargo === cargo.nombre ? 'text-white/80' : 'text-gray-400']">
                  {{ cargo.count }} postulantes
                </div>
                <q-icon
                  :name="filterCargo === cargo.nombre ? 'check_circle' : 'work_outline'"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-20"
                />
             </div>
          </div>
        </div>
      </div>

      <!-- 3. Final Table (Visible after selection) -->
      <div v-if="filterSede && filterCargo" class="animate-fade-in">
        <!-- Table Header Info -->
        <div class="bg-teal-700 text-white p-6 rounded-t-3xl flex justify-between items-center shadow-lg">
           <div class="flex items-center gap-4">
              <div class="bg-white/20 p-3 rounded-2xl">
                 <q-icon name="groups" size="24px" />
              </div>
              <div>
                 <div class="text-xs font-black uppercase tracking-widest opacity-80">Viendo Postulantes de:</div>
                 <div class="text-lg font-black uppercase">{{ filterCargo }} - {{ filterSede }}</div>
              </div>
           </div>
           <div class="flex items-center gap-6">
              <div class="text-right">
                 <div class="text-[10px] font-black uppercase opacity-70">Total Filtrados</div>
                 <div class="text-2xl font-black">{{ filteredRows.length }}</div>
              </div>
              <q-input
                v-model="filterSearch"
                placeholder="Buscar por nombre o CI..."
                dense
                dark
                outlined
                rounded
                class="min-w-[250px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
           </div>
        </div>

        <q-table
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          class="rounded-b-3xl shadow-2xl overflow-hidden border-none bg-white"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-postulante="props">
            <q-td :props="props">
              <div class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center font-black">
                   {{ props.row.postulante?.nombres?.[0] }}
                 </div>
                 <div>
                    <div class="font-black text-gray-900 uppercase text-sm">
                      {{ props.row.postulante?.nombres }} {{ props.row.postulante?.apellidos }}
                    </div>
                    <div class="text-[10px] text-primary font-bold tracking-widest uppercase">
                      CI: {{ props.row.postulante?.ci }}
                    </div>
                 </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-fecha_postulacion="props">
            <q-td :props="props">
              <div class="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                {{ formatDate(props.row.fecha_postulacion) }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-pretension_salarial="props">
            <q-td :props="props" class="text-center">
              <div class="text-sm font-black text-teal-900 bg-teal-50 px-3 py-1 rounded-xl inline-block border border-teal-100">
                {{
                  props.row.pretension_salarial
                    ? 'Bs. ' + Math.round(Number(props.row.pretension_salarial)).toLocaleString('de-DE')
                    : '-'
                }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-puntaje_tecnico="props">
            <q-td :props="props" class="text-center font-bold">
              <q-chip v-if="props.row.evaluacion" color="deep-orange-9" text-color="white" class="font-black" size="sm">
                {{ props.row.evaluacion.puntaje_total }} pts
              </q-chip>
              <span v-else class="text-grey-3">S/E</span>
            </q-td>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props" class="text-center">
              <q-select
                v-model="props.row.estado"
                :options="statusOptions"
                dense
                borderless
                emit-value
                map-options
                @update:model-value="updateStatus(props.row)"
                class="status-select-modern"
                :bg-color="getStatusColor(props.row.estado)"
                dark
                rounded
                standout
              >
                <template v-slot:selected>
                  <div class="text-[10px] font-black uppercase text-white px-2">
                    {{ statusLabels[props.row.estado] || props.row.estado }}
                  </div>
                </template>
              </q-select>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="flex gap-2 justify-end py-4">
              <q-btn
                label="Ver Expediente"
                icon="account_circle"
                size="sm"
                color="primary"
                unelevated
                class="rounded-xl shadow-md font-bold text-[10px]"
                @click="viewExpediente(props.row)"
                rounded
                push
              />
              <q-btn
                v-if="canManageAll"
                icon="delete"
                size="sm"
                color="red-2"
                text-color="red-8"
                unelevated
                @click="deletePostulante(props.row)"
                class="rounded-xl"
              />
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Empty State for Step 3 -->
      <div v-else-if="filterSede" class="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
         <q-icon name="mouse" size="64px" class="mb-4 opacity-20" />
         <div class="text-lg font-black uppercase tracking-widest opacity-30">Paso 2: Elija un Cargo</div>
      </div>
    </div>

    <!-- Modals -->
    <EvaluacionMeritosModal
      v-model="showEvalModal"
      :postulation="selectedPostulacionForEval"
      @saved="refreshData"
    />

    <!-- Import Dialog -->
    <q-dialog v-model="showImportDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px; max-width: 90vw; border-radius: 2rem" class="overflow-hidden">
        <q-card-section class="bg-gradient-to-r from-deep-purple-8 to-indigo-9 text-white p-8">
          <div class="text-2xl font-black">Importar Excel</div>
          <div class="text-white/70 text-sm mt-1">Sincronización masiva de postulantes</div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="bg-indigo-50 p-5 rounded-2xl mb-6 border border-indigo-100">
             <div class="text-sm font-black text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-2">
               <q-icon name="help" size="18px" /> Recomendaciones
             </div>
             <p class="text-xs text-indigo-700/80 leading-relaxed q-ma-none">
               Asegúrese de que el archivo tenga el formato correcto para ser procesado por la inteligencia de migración del sistema.
             </p>
          </div>

          <q-file
            v-model="importFile"
            label="Archivo de Postulantes (.xlsx, .csv)"
            outlined
            bg-color="white"
            icon="attach_file"
            rounded
            use-chips
            accept=".xlsx, .xls, .csv"
          >
            <template v-slot:prepend>
              <q-icon name="upload_file" color="primary" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-xl px-12">
          <q-btn label="Cancelar" flat color="grey-7" v-close-popup rounded class="q-px-lg" />
          <q-btn
            label="Procesar Archivo"
            color="primary"
            unelevated
            rounded
            :loading="importing"
            :disable="!importFile"
            @click="processImport"
            class="q-px-xl font-black shadow-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'
import { useRouter } from 'vue-router'



import { useAuthStore } from 'src/stores/auth-store'
import EvaluacionMeritosModal from 'src/components/admin/EvaluacionMeritosModal.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const rows = ref([])
const convocatorias = ref([])
const selectedConvocatoria = ref(null)
const loading = ref(false)

const canManageAll = computed(() => authStore.can('usuarios') || authStore.can('roles'))


// Modals state
const showEvalModal = ref(false)
const selectedPostulacionForEval = ref(null)

// Import state
const showImportDialog = ref(false)
const importFile = ref(null)
const importing = ref(false)

// Removed unused eval modal logic

const refreshData = () => {
  if (selectedConvocatoria.value) {
    selectConvocatoria(selectedConvocatoria.value)
  }
}
const statusLabels = {
  enviada: 'Postulado',
  en_revision: 'En Evaluación',
  validada: 'Pre-seleccionado',
  observada: 'Con Observación',
  rechazada: 'No Seleccionado',
}
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  label,
  value,
}))

// Filters
const filterSearch = ref('')
const filterEstado = ref(null)
const filterSede = ref(null)
const filterCargo = ref(null)
const filterSalarioMin = ref(null)
const filterSalarioMax = ref(null)

// Watcher to auto-select first cargo when sede changes
watch(filterSede, (newSede) => {
  if (newSede) {
    // We use a small timeout to ensure availableCargos has computed correctly
    setTimeout(() => {
      if (availableCargos.value.length > 0 && !filterCargo.value) {
        filterCargo.value = availableCargos.value[0].nombre
      }
    }, 50)
  } else {
    filterCargo.value = null
  }
})

const clearFilters = () => {
  filterSearch.value = ''
  filterEstado.value = null
  filterSede.value = null
  filterCargo.value = null
  filterSalarioMin.value = null
  filterSalarioMax.value = null
}

const resetSelection = () => {
  selectedConvocatoria.value = null
  rows.value = []
  clearFilters()
}

const availableSedes = computed(() => {
  const sedes = rows.value.map((r) => r.oferta?.sede?.nombre).filter(Boolean)
  return [...new Set(sedes)].sort()
})

const availableCargos = computed(() => {
  if (!filterSede.value) return []

  // Filter by currently selected sede
  const rowsInSede = rows.value.filter(r => r.oferta?.sede?.nombre === filterSede.value)

  // Group by cargo name and count
  const groups = {}
  rowsInSede.forEach(r => {
    const name = r.oferta?.cargo?.nombre || 'Sin Nombre'
    if (!groups[name]) groups[name] = 0
    groups[name]++
  })

  return Object.entries(groups).map(([nombre, count]) => ({
    nombre,
    count
  })).sort((a, b) => a.nombre.localeCompare(b.nombre))
})

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    // Search filter
    if (filterSearch.value) {
      const search = filterSearch.value.toLowerCase()
      const fullName = `${row.postulante?.nombres} ${row.postulante?.apellidos}`.toLowerCase()
      const ci = String(row.postulante?.ci || '').toLowerCase()
      if (!fullName.includes(search) && !ci.includes(search)) return false
    }

    // Status filter
    if (filterEstado.value && row.estado !== filterEstado.value) return false

    // Sede filter (MANDATORY IN NEW UI)
    if (filterSede.value && row.oferta?.sede?.nombre !== filterSede.value) return false

    // Cargo filter (MANDATORY IN NEW UI)
    if (filterCargo.value && row.oferta?.cargo?.nombre !== filterCargo.value) return false

    // Salary Min filter
    if (
      filterSalarioMin.value !== null &&
      filterSalarioMin.value !== '' &&
      (row.pretension_salarial || 0) < filterSalarioMin.value
    )
      return false

    // Salary Max filter
    if (
      filterSalarioMax.value !== null &&
      filterSalarioMax.value !== '' &&
      (row.pretension_salarial || 0) > filterSalarioMax.value
    )
      return false

    return true
  })
})

const columns = [
  {
    name: 'postulante',
    label: 'Postulante',
    field: (row) => row.postulante?.nombres,
    sortable: true,
    align: 'left',
  },
  {
    name: 'fecha_postulacion',
    label: 'Fecha Postulación',
    field: 'fecha_postulacion',
    sortable: true,
    align: 'left',
  },
  {
    name: 'pretension_salarial',
    label: 'Pretensión Salarial',
    field: 'pretension_salarial',
    sortable: true,
    align: 'center',
  },
  {
    name: 'puntaje_tecnico',
    label: 'Puntaje Meritos',
    field: (row) => row.evaluacion?.puntaje_total || '-',
    sortable: true,
    align: 'center',
  },
  { name: 'estado', label: 'Estado Actual', field: 'estado', sortable: true, align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' },
]

const formatDate = (val) => {
  if (!val) return '-'
  return date.formatDate(val, 'DD-MM-YYYY')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'enviada':
      return 'indigo-7'
    case 'en_revision':
      return 'orange-7'
    case 'validada':
      return 'teal-7'
    case 'observada':
      return 'deep-orange-7'
    case 'rechazada':
      return 'red-7'
    default:
      return 'grey-7'
  }
}

const loadConvocatorias = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/convocatorias-con-postulantes')
    convocatorias.value = data
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar las convocatorias' })
  } finally {
    loading.value = false
  }
}

const selectConvocatoria = async (convocatoria) => {
  selectedConvocatoria.value = convocatoria
  loading.value = true
  try {
    const { data } = await api.get(`/postulaciones?convocatoria_id=${convocatoria.id}`)
    rows.value = data
    // Si solo hay una sede, seleccionarla automáticamente
    const sedes = [...new Set(data.map(r => r.oferta?.sede?.nombre).filter(Boolean))]
    if (sedes.length === 1) {
      filterSede.value = sedes[0]
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar postulantes' })
  } finally {
    loading.value = false
  }
}

const updateStatus = async (row) => {
  try {
    await api.put(`/postulaciones/${row.id}/estado`, { estado: row.estado })
    $q.notify({ type: 'positive', message: 'Estado actualizado', position: 'top' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al actualizar estado' })
  }
}

const viewExpediente = (row) => {
  router.push(`/admin/expediente/${row.id}`)
}

const deletePostulante = (row) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar a ${row.postulante.nombres} ${row.postulante.apellidos}? Esta acción no se puede deshacer.`,
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
      unelevated: true,
      rounded: true
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7',
      rounded: true
    }
  }).onOk(async () => {
    try {
      await api.delete(`/postulaciones/${row.id}`)
      $q.notify({
        type: 'positive',
        message: 'Postulante eliminado correctamente',
        position: 'top'
      })
      // Refresh both lists
      loadConvocatorias()
      if (selectedConvocatoria.value) {
        selectConvocatoria(selectedConvocatoria.value)
      }
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar postulante'
      })
    }
  })
}

const exportGeneralReport = async () => {
  try {
    if (!selectedConvocatoria.value) return

    // Build query params from current filters
    const params = new URLSearchParams()
    if (filterSearch.value) params.append('search', filterSearch.value)
    if (filterEstado.value) params.append('estado', filterEstado.value)
    if (filterSede.value) params.append('sede_nombre', filterSede.value)
    if (filterCargo.value) params.append('cargo_nombre', filterCargo.value)
    if (filterSalarioMin.value) params.append('salario_min', filterSalarioMin.value)
    if (filterSalarioMax.value) params.append('salario_max', filterSalarioMax.value)

    const endpoint = `/postulaciones/export/${selectedConvocatoria.value.id}?${params.toString()}`

    $q.loading.show({ message: 'Preparando reporte Excel...' })
    const response = await api.get(endpoint, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const fileName = `Reporte_Postulantes_${selectedConvocatoria.value.titulo.replace(/\s+/g, '_')}.xlsx`
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al descargar reporte' })
  } finally {
    $q.loading.hide()
  }
}

const processImport = async () => {
  if (!importFile.value) return

  importing.value = true
  const formData = new FormData()
  formData.append('file', importFile.value)

  try {
    const { data } = await api.post('/importar-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    $q.notify({
      type: 'positive',
      message: `¡Importación completada! ${data.imported} registros procesados.`,
      position: 'top',
    })

    showImportDialog.value = false
    importFile.value = null
    loadConvocatorias() // Refresh convocatorias list
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al importar los datos',
    })
  } finally {
    importing.value = false
  }
}

onMounted(loadConvocatorias)
</script>

<style scoped>
.conv-card {
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 10px 30px -15px rgba(0,0,0,0.1);
}
.conv-card:hover {
  transform: translateY(-5px);
}
.cargo-pill {
  box-shadow: 0 4px 15px -5px rgba(0,0,0,0.05);
}
.animate-fade-in {
  animation: fadeIn 0.5s ease;
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.status-select-modern {
  border-radius: 9999px;
  min-width: 140px;
  height: 32px;
  font-size: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}
.status-select-modern:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}
</style>

<style scoped>
.status-select {
  width: 140px;
  margin: 0 auto;
}
.filter-select {
  font-size: 13px;
}
:deep(.status-select .q-field__control) {
  height: 32px !important;
  min-height: 32px !important;
}
:deep(.filter-select .q-field__native),
:deep(.filter-select .q-field__prefix),
:deep(.filter-select .q-field__suffix),
:deep(.filter-select .q-field__input) {
  font-weight: 500;
}
</style>
