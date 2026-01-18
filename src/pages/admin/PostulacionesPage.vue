<template>
  <q-page class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Postulaciones</h1>
        <p class="text-gray-500">Seleccione una convocatoria para ver y gestionar sus postulantes.</p>
      </div>
    </div>

    <!-- Convocatorias Table (Always Visible) -->
    <q-table
      :rows="convocatorias"
      :columns="convocatoriaColumns"
      row-key="id"
      :loading="loading && !selectedConvocatoria"
      flat
      bordered
      class="rounded-2xl shadow-lg overflow-hidden mb-8"
      :pagination="{ rowsPerPage: 5 }"
    >
      <template v-slot:header="props">
        <q-tr :props="props" class="bg-primary text-white">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bolder uppercase tracking-wider">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-fecha_inicio="props">
        <q-td :props="props">
          {{ formatDate(props.row.fecha_inicio) }}
        </q-td>
      </template>

      <template v-slot:body-cell-fecha_cierre="props">
        <q-td :props="props">
          {{ formatDate(props.row.fecha_cierre) }}
        </q-td>
      </template>

      <template v-slot:body-cell-postulaciones_count="props">
        <q-td :props="props" class="text-center">
          <q-badge color="primary" class="p-2 text-sm">
            {{ props.row.postulaciones_count }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="text-right">
          <q-btn
            :label="selectedConvocatoria?.id === props.row.id ? 'Viendo Postulantes' : 'Ver Postulantes'"
            :icon="selectedConvocatoria?.id === props.row.id ? 'check_circle' : 'groups'"
            :color="selectedConvocatoria?.id === props.row.id ? 'green-7' : 'indigo-7'"
            unelevated
            size="sm"
            @click="selectConvocatoria(props.row)"
            rounded
            class="q-px-md"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Postulantes Section (Dynamic) -->
    <div v-if="selectedConvocatoria" class="animate-fade-in">
      <q-separator class="q-my-lg" />

      <div class="flex justify-between items-end mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <q-icon name="people" color="teal-7" />
            Postulantes: <span class="text-teal-7">{{ selectedConvocatoria.titulo }}</span>
          </h2>
          <p class="text-gray-500 text-sm">Use los filtros para buscar postulantes específicos en esta lista.</p>
        </div>

        <q-btn
          label="Descargar Reporte (Excel)"
          icon="download"
          color="green-8"
          unelevated
          @click="exportGeneralReport"
          rounded
          class="shadow-2"
        />
      </div>

      <!-- Postulantes Filter Bar -->
      <q-card class="mb-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 row q-col-gutter-md items-center">
        <!-- Search -->
        <div class="col-12 col-sm-3">
          <q-input
            v-model="filterSearch"
            placeholder="Buscar por nombre o CI..."
            dense
            outlined
            rounded
            bg-color="white"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Filter Status -->
        <div class="col-12 col-sm-2">
          <q-select
            v-model="filterEstado"
            :options="statusOptions"
            label="Estado"
            dense
            outlined
            rounded
            clearable
            bg-color="white"
            emit-value
            map-options
            stack-label
            class="text-uppercase filter-select"
          />
        </div>

        <!-- Filter Sede -->
        <div class="col-12 col-sm-2">
          <q-select
            v-model="filterSede"
            :options="uniqueSedes"
            label="Sede"
            dense
            outlined
            rounded
            clearable
            stack-label
            bg-color="white"
            class="filter-select"
          />
        </div>

        <!-- Filter Cargo -->
        <div class="col-12 col-sm-2">
          <q-select
            v-model="filterCargo"
            :options="uniqueCargos"
            label="Cargo"
            dense
            outlined
            rounded
            clearable
            stack-label
            bg-color="white"
            class="filter-select"
          />
        </div>

        <!-- Filter Salary Range -->
        <div class="col-12 col-sm-3 flex items-center gap-2">
          <q-input
            v-model.number="filterSalarioMin"
            label="Sueldo Mín."
            type="number"
            dense
            outlined
            rounded
            bg-color="white"
            stack-label
            class="filter-select flex-1"
          />
          <q-input
            v-model.number="filterSalarioMax"
            label="Sueldo Máx."
            type="number"
            dense
            outlined
            rounded
            bg-color="white"
            stack-label
            class="filter-select flex-1"
          />
        </div>

        <!-- Reset -->
        <div class="col-12 col-sm-2 text-right">
          <q-btn
            icon="filter_list_off"
            label="Limpiar"
            flat
            color="grey-7"
            @click="clearFilters"
            rounded
            dense
          />
        </div>
      </div>
    </q-card>

      <!-- Postulantes Table -->
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        bordered
        class="rounded-2xl shadow-lg overflow-hidden pb-10"
      >
      <template v-slot:header="props">
        <q-tr :props="props" class="bg-teal-7 text-white">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bolder uppercase tracking-wider">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-postulante="props">
        <q-td :props="props">
          <div class="font-bold uppercase">{{ props.row.postulante?.nombres }} {{ props.row.postulante?.apellidos }}</div>
          <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CI: {{ props.row.postulante?.ci }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-cargo="props">
        <q-td :props="props">
          <div class="text-xs font-bold text-primary uppercase">{{ props.row.oferta?.cargo?.nombre || 'N/A' }}</div>
          <div class="text-[10px] text-gray-500 uppercase font-medium">{{ props.row.oferta?.sede?.nombre || '' }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-fecha_postulacion="props">
        <q-td :props="props">
          <div class="text-xs font-medium">{{ formatDate(props.row.fecha_postulacion) }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-pretension_salarial="props">
        <q-td :props="props" class="text-center font-bold text-teal-9">
          {{ props.row.pretension_salarial ? 'Bs. ' + Number(props.row.pretension_salarial).toLocaleString('es-BO', { minimumFractionDigits: 2 }) : '-' }}
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
              class="status-select"
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
        <q-td :props="props" class="flex gap-2 justify-end">
          <q-btn
            label="Ver Expediente"
            icon="visibility"
            size="sm"
            style="background-color: #009999; color: white;"
            unelevated
            class="rounded-xl shadow-lg q-px-md"
            @click="viewExpediente(props.row)"
            rounded
          />
        </q-td>
      </template>
    </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const rows = ref([])
const convocatorias = ref([])
const selectedConvocatoria = ref(null)
const loading = ref(false)
const statusLabels = {
  enviada: 'Postulado',
  en_revision: 'En Evaluación',
  validada: 'Pre-seleccionado',
  observada: 'Con Observación',
  rechazada: 'No Seleccionado'
}
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  label,
  value
}))

// Filters
const filterSearch = ref('')
const filterEstado = ref(null)
const filterSede = ref(null)
const filterCargo = ref(null)
const filterSalarioMin = ref(null)
const filterSalarioMax = ref(null)

const clearFilters = () => {
  filterSearch.value = ''
  filterEstado.value = null
  filterSede.value = null
  filterCargo.value = null
  filterSalarioMin.value = null
  filterSalarioMax.value = null
}

const uniqueSedes = computed(() => {
  const sedes = rows.value.map(r => r.oferta?.sede?.nombre).filter(Boolean)
  return [...new Set(sedes)].sort()
})

const uniqueCargos = computed(() => {
  const cargos = rows.value.map(r => r.oferta?.cargo?.nombre).filter(Boolean)
  return [...new Set(cargos)].sort()
})

const filteredRows = computed(() => {
  return rows.value.filter(row => {
    // Search filter
    if (filterSearch.value) {
      const search = filterSearch.value.toLowerCase()
      const fullName = `${row.postulante?.nombres} ${row.postulante?.apellidos}`.toLowerCase()
      const ci = String(row.postulante?.ci || '').toLowerCase()
      if (!fullName.includes(search) && !ci.includes(search)) return false
    }

    // Status filter
    if (filterEstado.value && row.estado !== filterEstado.value) return false

    // Sede filter
    if (filterSede.value && row.oferta?.sede?.nombre !== filterSede.value) return false

    // Cargo filter
    if (filterCargo.value && row.oferta?.cargo?.nombre !== filterCargo.value) return false

    // Salary Min filter
    if (filterSalarioMin.value !== null && filterSalarioMin.value !== '' && (row.pretension_salarial || 0) < filterSalarioMin.value) return false

    // Salary Max filter
    if (filterSalarioMax.value !== null && filterSalarioMax.value !== '' && (row.pretension_salarial || 0) > filterSalarioMax.value) return false

    return true
  })
})

const convocatoriaColumns = [
  { name: 'titulo', label: 'Nombre de la Convocatoria', field: 'titulo', sortable: true, align: 'left' },
  { name: 'fecha_inicio', label: 'Fecha Inicio', field: 'fecha_inicio', sortable: true, align: 'left' },
  { name: 'fecha_cierre', label: 'Fecha Cierre', field: 'fecha_cierre', sortable: true, align: 'left' },
  { name: 'postulaciones_count', label: 'Total Postulantes', field: 'postulaciones_count', sortable: true, align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

const columns = [
  { name: 'postulante', label: 'Postulante', field: row => row.postulante?.nombres, sortable: true, align: 'left' },
  { name: 'cargo', label: 'Cargo / Sede', field: row => row.oferta?.cargo?.nombre, sortable: true, align: 'left' },
  { name: 'fecha_postulacion', label: 'Fecha', field: 'fecha_postulacion', sortable: true, align: 'left' },
  { name: 'pretension_salarial', label: 'Pretensión (Bs)', field: 'pretension_salarial', sortable: true, align: 'center' },
  { name: 'estado', label: 'Estado Actual', field: 'estado', sortable: true, align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

const formatDate = (val) => {
  return date.formatDate(val, 'DD-MM-YYYY')
}

const getStatusColor = (status) => {
  switch(status) {
    case 'enviada': return 'indigo-7';
    case 'en_revision': return 'orange-7';
    case 'validada': return 'teal-7';
    case 'observada': return 'deep-orange-7';
    case 'rechazada': return 'red-7';
    default: return 'grey-7';
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

const exportGeneralReport = async () => {
  try {
    const endpoint = selectedConvocatoria.value
      ? `/postulaciones/export/${selectedConvocatoria.value.id}`
      : '/postulaciones/export'

    const response = await api.get(endpoint, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const fileName = selectedConvocatoria.value ? `Reporte_Postulantes_${selectedConvocatoria.value.titulo}.xlsx` : 'postulaciones_general.xlsx'
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al descargar reporte' })
  }
}

onMounted(loadConvocatorias)
</script>

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
