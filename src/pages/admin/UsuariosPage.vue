<template>
  <q-page class="p-6 bg-gray-50/50">
    <div class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Usuarios con Acceso a SISPO</h1>
        <p class="text-gray-500 font-medium">Aqu� solo gestionas a qu� convocatorias espec�ficas puede entrar cada usuario del sistema.</p>
      </div>
    </div>

    <q-banner rounded class="bg-indigo-50 text-indigo-10 q-mb-lg">
      Los usuarios, roles y permisos base se administran en el SSO/SIGETH. En SISPO solo se restringe el alcance interno por convocatoria.
    </q-banner>

    <q-card class="table-card">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:body-cell-usuario="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-avatar size="42px" color="primary" text-color="white">
                <q-img v-if="getUserPhoto(props.row)" :src="getUserPhoto(props.row)" />
                <span v-else>{{ getDisplayFullName(props.row).charAt(0) }}</span>
              </q-avatar>
              <div class="column">
                <span class="text-weight-bold text-primary">{{ getDisplayFullName(props.row) }}</span>
                <span class="text-caption text-grey-7">CI: {{ getDisplayCi(props.row) }}</span>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-convocatorias="props">
          <q-td :props="props">
            <div v-if="(props.row.convocatoria_scope || []).length" class="column q-gutter-xs">
              <q-chip
                v-for="convocatoriaId in props.row.convocatoria_scope"
                :key="convocatoriaId"
                dense
                outline
                color="deep-purple"
              >
                {{ convocatoriaMap.get(convocatoriaId) || `Convocatoria #${convocatoriaId}` }}
              </q-chip>
            </div>
            <q-badge v-else color="grey-3" text-color="grey-8" label="Sin restricci�n espec�fica" class="q-px-sm" />
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props" align="center">
            <q-badge :color="props.row.activo ? 'positive' : 'grey'" class="q-px-md q-py-xs rounded-full">
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" align="center">
            <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
              <q-tooltip>Gestionar alcance por convocatoria</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 760px; max-width: 95vw; border-radius: 20px;">
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="text-h6 text-weight-bold flex items-center gap-3">
            <q-icon name="manage_accounts" size="md" />
            Gestionar Alcance de Convocatorias
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl q-gutter-y-lg">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-8">
              <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Usuario</label>
              <q-input :model-value="selectedUser ? getDisplayFullName(selectedUser) : ''" outlined dense readonly />
            </div>
            <div class="col-12 col-md-4">
              <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">CI</label>
              <q-input :model-value="selectedUser ? getDisplayCi(selectedUser) : ''" outlined dense readonly />
            </div>
          </div>

          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Estado</label>
              <q-toggle v-model="form.activo" label="Usuario habilitado" color="positive" />
            </div>
            <div class="col-12 col-md-6">
              <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Rol heredado del SSO</label>
              <q-input :model-value="selectedUser?.rol?.nombre || selectedUser?.rol?.name || 'Sin rol visible'" outlined dense readonly />
            </div>
          </div>

          <div>
            <label class="text-caption text-weight-bold text-deep-purple uppercase tracking-widest q-mb-xs block">Convocatorias espec�ficas</label>
            <q-select
              v-model="form.convocatoria_scope"
              :options="convocatoriasOptions"
              option-value="id"
              :option-label="formatConvocatoriaLabel"
              multiple
              use-chips
              outlined
              dense
              emit-value
              map-options
              clearable
              bg-color="deep-purple-1"
              hint="Si seleccionas convocatorias, el usuario solo ver� esas convocatorias y sus postulaciones relacionadas. Si queda vac�o, ver� las convocatorias permitidas por su acceso base."
            >
              <template v-slot:prepend><q-icon name="campaign" color="deep-purple" /></template>
            </q-select>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg border-t">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup rounded no-caps class="q-px-md" />
          <q-btn label="Guardar alcance" color="primary" @click="save" :loading="saving" rounded unelevated no-caps class="q-px-xl text-weight-bold" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const SHARED_ASSET_URL = String(import.meta.env.VITE_SHARED_ASSET_URL || '').replace(/\/+$/, '')
const rows = ref([])
const convocatoriasOptions = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const selectedUser = ref(null)

const form = ref({
  id: null,
  activo: true,
  convocatoria_scope: [],
})

const columns = [
  { name: 'usuario', label: 'Usuario SISPO', field: 'nombres', align: 'left' },
  { name: 'convocatorias', label: 'Convocatorias permitidas', field: 'convocatoria_scope', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const convocatoriaMap = computed(() => new Map(
  convocatoriasOptions.value.map(item => [item.id, formatConvocatoriaLabel(item)])
))

const resolveSharedAssetBase = () => {
  if (SHARED_ASSET_URL) return SHARED_ASSET_URL
  return `${window.location.protocol}//${window.location.hostname}`
}

const normalizePhotoUrl = (photo) => {
  if (!photo) return null

  if (String(photo).startsWith('http://') || String(photo).startsWith('https://')) {
    return photo
  }

  if (String(photo).startsWith('/')) {
    return `${resolveSharedAssetBase()}${photo}`
  }

  return `${resolveSharedAssetBase()}/${String(photo).replace(/^\/+/, '')}`
}

const formatConvocatoriaLabel = (opt) => {
  if (!opt) return '---'
  const codigo = opt.codigo_interno ? ` (${opt.codigo_interno})` : ''
  return `${opt.titulo || 'Convocatoria'}${codigo}`
}

const getDisplayFullName = (row) => {
  return [
    row?.persona?.nombres,
    row?.persona?.apellido_paterno,
    row?.persona?.apellido_materno,
    row?.nombres,
    row?.apellido_paterno,
    row?.apellido_materno,
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() || 'Usuario'
}

const getDisplayCi = (row) => row?.persona?.ci || row?.ci || row?.username || 'S/D'
const getUserPhoto = (row) => normalizePhotoUrl(row?.persona?.foto_url || row?.persona?.foto || null)

const getUserId = (row) => row?.id || row?.id_user

const loadData = async () => {
  loading.value = true
  try {
    const [userRes, convocatoriasRes] = await Promise.all([
      api.get('/usuarios'),
      api.get('/convocatorias')
    ])
    rows.value = userRes.data || []
    convocatoriasOptions.value = convocatoriasRes.data || []
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar usuarios de SISPO' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item) => {
  selectedUser.value = item
  form.value = {
    id: getUserId(item),
    activo: !!item.activo,
    convocatoria_scope: item.convocatoria_scope || [],
  }
  dialog.value = true
}

const save = async () => {
  saving.value = true
  try {
    await api.put(`/usuarios/${form.value.id}`, {
      activo: form.value.activo,
      convocatoria_scope: form.value.convocatoria_scope,
    })

    $q.notify({ type: 'positive', message: 'Alcance por convocatoria actualizado correctamente' })
    dialog.value = false
    await loadData()
  } catch (error) {
    console.error(error)
    const msg = error.response?.data?.message || 'No se pudo guardar el alcance del usuario'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.table-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(.q-table__card) {
  box-shadow: none;
}

:deep(.q-table thead tr) {
  background: #f1f5f9;
}

:deep(.q-table th) {
  font-weight: 700;
  text-transform: uppercase;
  color: #475569;
  letter-spacing: 0.5px;
}
</style>
