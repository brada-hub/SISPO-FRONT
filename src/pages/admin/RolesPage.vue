<template>
  <q-page class="p-6 bg-gray-50/50">
    <!-- Header -->
    <div class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Gestión de Roles</h1>
        <p class="text-gray-500 font-medium">Administra los roles y permisos del sistema</p>
      </div>
      <div class="flex gap-3">
        <q-btn
          unelevated
          color="deep-purple-8"
          icon="add"
          label="Nuevo Rol"
          no-caps
          rounded
          class="shadow-md hover:shadow-lg transition-all"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="table-card">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:body-cell-activo="props">
          <q-td :props="props" align="center">
            <q-badge :color="props.row.activo ? 'positive' : 'grey'" class="q-px-md q-py-xs rounded-full">
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" align="center">
            <div class="flex gap-2 justify-center">
              <q-btn flat round color="orange" icon="lock" size="sm" @click="openPermissionsDialog(props.row)">
                <q-tooltip>Gestionar Permisos</q-tooltip>
              </q-btn>
              <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
                <q-tooltip>Editar Rol</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
                <q-tooltip>Eliminar Rol</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal Form -->
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 450px; border-radius: 16px;">
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="text-h6 text-weight-bold flex items-center gap-2">
            <q-icon :name="isEdit ? 'edit' : 'add_moderator'" />
            {{ isEdit ? 'Editar Rol' : 'Nuevo Rol' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg q-px-lg">
          <q-form @submit="save" class="q-gutter-y-md">
            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider">Nombre del Rol</label>
              <q-input
                v-model="form.nombre"
                outlined
                dense
                placeholder="Ej: Administrador, Usuario..."
                :rules="[val => !!val || 'El nombre es requerido']"
              />
            </div>

            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider">Descripción (Opcional)</label>
              <q-input
                v-model="form.descripcion"
                outlined
                dense
                type="textarea"
                rows="3"
                placeholder="Breve descripción del acceso"
              />
            </div>

            <div class="flex items-center q-mt-md">
              <q-toggle v-model="form.activo" label="Rol Activo" color="positive" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup rounded no-caps />
          <q-btn
            label="Guardar Rol"
            color="primary"
            @click="save"
            :loading="saving"
            rounded
            unelevated
            no-caps
            class="q-px-xl text-weight-bold"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Permissions Dialog -->
    <q-dialog v-model="permDialog" persistent full-width>
      <q-card class="column full-height" style="border-radius: 20px; overflow: hidden;">
        <q-card-section class="bg-primary text-white row items-center q-pa-lg shadow-5">
          <div class="row items-center gap-4">
            <div class="q-pa-sm bg-white/20 rounded-lg">
              <q-icon name="security" size="md" />
            </div>
            <div class="column">
              <div class="text-h5 text-weight-bolder">Configuración de Permisos</div>
              <div class="text-subtitle2 opacity-80">Rol: {{ selectedRole?.nombre }}</div>
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="text-white" />
        </q-card-section>

        <q-card-section class="col scroll q-pa-xl bg-grey-1">
          <div v-if="permLoading" class="flex flex-center q-pa-xl">
            <q-spinner-tail color="primary" size="64px" />
          </div>

          <div v-else>
            <div class="text-body2 text-grey-8 mb-8 bg-blue-50 q-pa-md rounded-xl border border-blue-100 flex items-center gap-3 shadow-sm">
              <q-icon name="info" color="blue" size="md" />
              <span>Los permisos seleccionados se aplicarán a todos los usuarios que tengan asignado este rol.</span>
            </div>

            <div v-for="(perms, system) in groupedPermissions" :key="system" class="mb-10 animate-fade">
              <div class="text-subtitle1 font-bold text-primary flex items-center gap-3 q-mb-md uppercase tracking-widest border-b-2 border-primary/10 pb-2">
                <q-icon name="apps" size="sm" />
                SISTEMA: {{ system }}
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="perm in perms" :key="perm.id"
                  class="p-4 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1"
                  :class="rolePermIds.includes(perm.id) ? 'bg-indigo-50 border-primary/40 shadow-md' : 'bg-white border-transparent shadow-sm'"
                >
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="text-weight-bold" :class="rolePermIds.includes(perm.id) ? 'text-primary' : 'text-grey-9'">
                        {{ perm.name }}
                      </div>
                      <div class="text-caption text-grey-8">{{ perm.description }}</div>
                    </div>
                    <q-toggle
                      v-model="rolePermIds"
                      :val="perm.id"
                      color="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg bg-white border-t">
          <q-btn flat label="Cerrar sin guardar" color="grey-8" v-close-popup rounded no-caps class="q-px-md" />
          <q-btn
            unelevated
            label="Finalizar y Guardar Permisos"
            color="primary"
            class="q-px-xl rounded-full text-weight-bold"
            :loading="savingPerms"
            @click="saveRolePermissions"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const form = ref({ id: null, nombre: '', descripcion: '', activo: true })

// Permissions state
const permDialog = ref(false)
const permLoading = ref(false)
const savingPerms = ref(false)
const selectedRole = ref(null)
const rolePermIds = ref([])
const groupedPermissions = ref({})

const columns = [
  { name: 'nombre', label: 'Nombre del Rol', field: 'nombre', sortable: true, align: 'left' },
  { name: 'descripcion', label: 'Descripción de Acceso', field: 'descripcion', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/roles')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar roles' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  if (item) {
    isEdit.value = true
    form.value = { ...item }
  } else {
    isEdit.value = false
    form.value = { id: null, nombre: '', descripcion: '', activo: true }
  }
  dialog.value = true
}

const save = async () => {
  if (!form.value.nombre) return

  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/roles/${form.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Rol actualizado correctamente' })
    } else {
      await api.post('/roles', form.value)
      $q.notify({ type: 'positive', message: 'Rol creado correctamente' })
    }
    dialog.value = false
    loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar los datos' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de eliminar el rol "${item.nombre}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/roles/${item.id}`)
      $q.notify({ type: 'positive', message: 'Rol eliminado' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
    }
  })
}

const openPermissionsDialog = async (role) => {
  selectedRole.value = role
  permDialog.value = true
  permLoading.value = true
  try {
    const res = await api.get(`/roles/${role.id}/permissions`)
    rolePermIds.value = res.data.role_permission_ids

    // Group by system
    const groups = {}
    res.data.all_permissions.forEach(p => {
      const systemName = p.systems?.display_name || 'Global'
      if (!groups[systemName]) groups[systemName] = []
      groups[systemName].push(p)
    })
    groupedPermissions.value = groups
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar permisos' })
    permDialog.value = false
  } finally {
    permLoading.value = false
  }
}

const saveRolePermissions = async () => {
  savingPerms.value = true
  try {
    await api.post(`/roles/${selectedRole.value.id}/permissions`, {
      permissions: rolePermIds.value
    })
    $q.notify({ type: 'positive', message: 'Permisos del rol guardados' })
    permDialog.value = false
    loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar permisos' })
  } finally {
    savingPerms.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
/* Table Card */
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
