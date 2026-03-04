<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="max-w-7xl mx-auto">
      <!-- HEADER -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <h1 class="text-h4 text-weight-bold text-primary q-my-none">Expedientes de Personal</h1>
          <p class="text-subtitle1 text-grey-7 q-my-none">Gestión centralizada de hojas de vida</p>
        </div>
      </div>

      <!-- SEARCH & FILTERS -->
      <q-card class="q-mb-md shadow-1 rounded-borders">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="search"
                dense outlined
                placeholder="Buscar por nombre, CI o correo..."
                debounce="300"
                @update:model-value="fetchExpedientes"
              >
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
               <q-select dense outlined v-model="filterSede" :options="sedesOptions" label="Sede" option-value="id" option-label="nombre" emit-value map-options clearable @update:model-value="fetchExpedientes" />
            </div>
            <div class="col-12 col-md-3">
               <q-select dense outlined v-model="filterStatus" :options="['Todos', 'Completo', 'Pendiente']" label="Estado Legajo" @update:model-value="fetchExpedientes" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE -->
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        @request="onRequest"
        flat bordered
        class="bg-white rounded-borders shadow-1"
      >
        <template v-slot:body-cell-funcionario="props">
          <q-td :props="props">
            <div class="flex items-center gap-3">
              <q-avatar color="primary" text-color="white" size="sm">
                {{ props.row.nombres.charAt(0) }}
              </q-avatar>
              <div>
                <div class="text-weight-bold">{{ props.row.nombres }} {{ props.row.apellidos }}</div>
                <div class="text-caption text-grey">{{ props.row.email }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip
              size="sm"
              :color="getStatusColor(props.row.estado_legajo)"
              text-color="white"
              :icon="getStatusIcon(props.row.estado_legajo)"
            >
              {{ props.row.estado_legajo.toUpperCase() }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
             <q-btn flat round color="primary" icon="visibility" @click="openExpediente(props.row)">
               <q-tooltip>Ver Expediente Completo</q-tooltip>
             </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const filterStatus = ref('Todos')
const filterSede = ref(null)
const sedesOptions = ref([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0
})

const rows = ref([])
const columns = [
  { name: 'funcionario', label: 'Funcionario', align: 'left', field: row => row.nombres },
  { name: 'ci', label: 'C.I.', align: 'left', field: 'ci' },
  { name: 'rol', label: 'Rol', align: 'left', field: 'rol' },
  { name: 'sede', label: 'Sede', align: 'left', field: 'sede' },
  { name: 'estado', label: 'Estado Legajo', align: 'center', field: 'estado_legajo' },
  { name: 'actions', label: 'Acciones', align: 'right' }
]



onMounted(async () => {
  fetchExpedientes()
  // Load Sedes for filter
  try {
     const { data } = await api.get('/portal/sedes')
     sedesOptions.value = data
  } catch (error) {
     console.error('Error loading sedes:', error)
  }
})

const fetchExpedientes = async (props) => {
  loading.value = true
  const { page, rowsPerPage } = props?.pagination || pagination.value

  try {
    const params = {
      page: page,
      per_page: rowsPerPage,
      search: search.value,
      sede_id: filterSede.value,
      estado_legajo: filterStatus.value !== 'Todos' ? filterStatus.value.toLowerCase() : null
    }

    const response = await api.get('/expedientes', { params })
    if (response.data.success) {
       rows.value = response.data.data.data
       pagination.value.page = response.data.data.current_page
       pagination.value.rowsNumber = response.data.data.total
       pagination.value.rowsPerPage = response.data.data.per_page
    }
  } catch (error) {
    console.error('Error fetching expedientes:', error)
  } finally {
    loading.value = false
  }
}

const onRequest = (props) => {
  fetchExpedientes(props)
}

const getStatusColor = (status) => {
  if (status === 'completo') return 'green'
  if (status === 'parcial') return 'orange'
  return 'grey'
}

const getStatusIcon = (status) => {
  if (status === 'completo') return 'check_circle'
  if (status === 'parcial') return 'warning'
  return 'hourglass_empty'
}

const openExpediente = (person) => {
  router.push(`/admin/expediente/${person.id}`)
}

</script>

<style scoped>
/* Estilos profesionales */
</style>
