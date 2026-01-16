<template>
  <q-page class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ selectedConvocatoria ? 'Postulantes: ' + selectedConvocatoria.titulo : 'Postulaciones por Convocatoria' }}
        </h1>
        <p v-if="selectedConvocatoria" class="text-gray-500">
           Gestión de postulantes para esta convocatoria específica.
        </p>
      </div>

      <div class="flex gap-2">
        <q-btn
          v-if="selectedConvocatoria"
          label="Volver a Convocatorias"
          icon="arrow_back"
          flat
          color="primary"
          @click="selectedConvocatoria = null"
        />
        <q-btn
          label="Descargar Reporte General"
          icon="download"
          color="green-8"
          unelevated
          @click="exportGeneralReport"
        />
      </div>
    </div>

    <!-- Convocatorias Table (Initial View) -->
    <q-table
      v-if="!selectedConvocatoria"
      :rows="convocatorias"
      :columns="convocatoriaColumns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:header="props">
        <q-tr :props="props" style="background-color: #663399; color: white;">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
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
            label="Ver Postulantes"
            icon="groups"
            color="indigo-7"
            unelevated
            size="sm"
            @click="selectConvocatoria(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Postulantes Table (Detailed View) -->
    <q-table
      v-else
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:header="props">
        <q-tr :props="props" style="background-color: #009999; color: white;">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
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

      <template v-slot:body-cell-estado="props">
         <q-td :props="props" class="text-center">
            <q-select
              v-model="props.row.estado"
              :options="['enviada', 'en_revision', 'validada', 'observada', 'rechazada']"
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
                  {{ props.row.estado }}
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
            class="rounded-lg shadow-sm"
            @click="viewExpediente(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const rows = ref([])
const convocatorias = ref([])
const selectedConvocatoria = ref(null)
const loading = ref(false)

const convocatoriaColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'titulo', label: 'Convocatoria', field: 'titulo', sortable: true, align: 'left' },
  { name: 'fecha_inicio', label: 'Fecha Inicio', field: 'fecha_inicio', sortable: true, align: 'left' },
  { name: 'fecha_cierre', label: 'Fecha Cierre', field: 'fecha_cierre', sortable: true, align: 'left' },
  { name: 'postulaciones_count', label: 'Total Postulantes', field: 'postulaciones_count', sortable: true, align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'postulante', label: 'Postulante', field: row => row.postulante?.nombres, sortable: true, align: 'left' },
  { name: 'cargo', label: 'Cargo / Sede', field: row => row.oferta?.cargo?.nombre, sortable: true, align: 'left' },
  { name: 'fecha_postulacion', label: 'Fecha', field: 'fecha_postulacion', sortable: true, align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', sortable: true, align: 'center' },
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
    const fileName = selectedConvocatoria.value ? `postulantes_${selectedConvocatoria.value.id}.csv` : 'postulaciones_general.csv'
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
:deep(.q-field__control) {
  height: 28px !important;
  min-height: 28px !important;
}
</style>
