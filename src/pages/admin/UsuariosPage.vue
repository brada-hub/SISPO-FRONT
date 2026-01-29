<template>
  <q-page class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
      <q-btn label="Nuevo Usuario" icon="person_add" style="background-color: #009999; color: white;" @click="openDialog()" rounded unelevated class="shadow-2" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      class="rounded-2xl shadow-lg overflow-hidden"
    >
      <template v-slot:header="props">
        <q-tr :props="props" class="bg-primary text-white">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bolder uppercase tracking-wider">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-nombre_completo="props">
        <q-td :props="props">
          <div class="font-bold">{{ props.row.nombres }} {{ props.row.apellidos }}</div>
          <div class="text-xs text-gray-500">CI: {{ props.row.ci }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-rol="props">
        <q-td :props="props">
          <q-chip outline color="primary" icon="security" size="sm">
            {{ props.row.rol?.nombre || 'S/R' }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-sede="props">
        <q-td :props="props">
          <q-chip outline color="secondary" icon="apartment" size="sm" v-if="props.row.sede">
            {{ props.row.sede?.nombre }}
          </q-chip>
          <span v-else class="text-gray-400 italic">NACIONAL / TODAS</span>
        </q-td>
      </template>

      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-chip :color="props.row.activo ? 'positive' : 'negative'" text-color="white" size="sm">
            {{ props.row.activo ? 'Activo' : 'Inactivo' }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="flex gap-2 justify-end">
          <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)" />
          <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Modal Form -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="min-w-[500px] rounded-2xl overflow-hidden">
        <q-card-section style="background-color: #663399; color: white;">
          <div class="text-h6">{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
            <q-form ref="userForm" @submit="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <q-input
                v-model="form.nombres"
                label="Nombres"
                outlined
                :rules="[val => !!val || 'Requerido']"
              />
              <q-input
                v-model="form.apellidos"
                label="Apellidos"
                outlined
                :rules="[val => !!val || 'Requerido']"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <q-input
                v-model="form.ci"
                label="CI (Cédula Identidad)"
                outlined
                :rules="[val => !!val || 'Requerido']"
              />
              <q-select
                v-model="form.rol_id"
                :options="rolesOptions"
                option-value="id"
                option-label="nombre"
                label="Rol de Usuario"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Requerido']"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <q-select
                v-model="form.sede_id"
                :options="sedesOptions"
                option-value="id"
                option-label="nombre"
                label="Sede Asignada"
                outlined
                emit-value
                map-options
                clearable
                hint="Dejar vacío para acceso nacional"
              />
              <div class="flex items-center">
                 <q-toggle v-if="isEdit" v-model="form.activo" label="Usuario Activo" />
              </div>
            </div>

            <!-- Panel de Permisos -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
               <div class="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <q-icon name="rule" color="primary" /> Permisos de Acceso / Secciones Específicas
               </div>
               <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <q-checkbox v-model="form.permisos" val="dashboard" label="Dashboard" dense class="text-caption" />
                  <q-checkbox v-model="form.permisos" val="convocatorias" label="Convocatorias" dense class="text-caption" />
                  <q-checkbox v-model="form.permisos" val="postulaciones" label="Postulaciones" dense class="text-caption" />
                  <q-checkbox v-model="form.permisos" val="evaluaciones" label="Evaluación Méritos" dense class="text-caption" />
                  <q-checkbox v-model="form.permisos" val="sedes" label="Sedes" dense class="text-caption" />
                  <q-checkbox v-model="form.permisos" val="cargos" label="Cargos" dense class="text-caption" />
                  <q-checkbox v-model="form.permisos" val="requisitos" label="Tipos Documento" dense class="text-caption" />
                  <q-checkbox v-model="form.permisos" val="usuarios" label="Usuarios" dense class="text-caption" />
                  <q-checkbox v-model="form.permisos" val="roles" label="Roles" dense class="text-caption" />
               </div>
               <div class="text-[10px] text-gray-400 mt-2 italic">
                  * Si no se marca ninguno, se usarán los permisos por defecto del rol.
               </div>
            </div>

            <div v-if="!isEdit" class="text-caption text-gray-500 italic q-mt-sm">
                La contraseña inicial será el número de CI por defecto.
            </div>

          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="text-primary q-pb-md q-px-md">
          <q-btn flat label="Cancelar" v-close-popup rounded />
          <q-btn label="Guardar Usuario" color="primary" @click="save" :loading="saving" rounded unelevated class="q-px-lg shadow-2" />
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
const rolesOptions = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const userForm = ref(null)

const form = ref({
  id: null,
  rol_id: null,
  sede_id: null,
  nombres: '',
  apellidos: '',
  ci: '',
  password: '',
  activo: true,
  must_change_password: false,
  permisos: []
})

const columns = [
  { name: 'nombre_completo', label: 'Funcionario / Usuario', align: 'left' },
  { name: 'rol', label: 'Rol Asignado', align: 'left' },
  { name: 'sede', label: 'Sede', align: 'left' },
  { name: 'activo', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

const sedesOptions = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const [userRes, rolesRes, sedesRes] = await Promise.all([
      api.get('/usuarios'),
      api.get('/roles'),
      api.get('/sedes')
    ])
    rows.value = userRes.data
    rolesOptions.value = rolesRes.data
    sedesOptions.value = sedesRes.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  if (item) {
    isEdit.value = true
    form.value = {
      ...item,
      password: '',
      permisos: item.permisos || []
    }
  } else {
    isEdit.value = false
    form.value = {
      id: null,
      rol_id: null,
      sede_id: null,
      nombres: '',
      apellidos: '',
      ci: '',
      password: '',
      activo: true,
      must_change_password: false,
      permisos: []
    }
  }
  dialog.value = true
}

const save = async () => {
  const valid = await userForm.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const dataToSend = {
        rol_id: form.value.rol_id,
        sede_id: form.value.sede_id,
        nombres: form.value.nombres,
        apellidos: form.value.apellidos,
        ci: form.value.ci,
        activo: form.value.activo,
        permisos: form.value.permisos
    }

    if (isEdit.value) {
      await api.put(`/usuarios/${form.value.id}`, dataToSend)
      $q.notify({ type: 'positive', message: 'Usuario actualizado correctamente' })
    } else {
      await api.post('/usuarios', dataToSend)
      $q.notify({ type: 'positive', message: 'Usuario creado correctamente' })
    }
    dialog.value = false
    loadData()
  } catch (error) {
    console.error(error)
    const msg = error.response?.data?.message || 'Error al guardar datos'
    $q.notify({
        type: 'negative',
        message: msg,
        caption: error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : ''
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Estás seguro de eliminar al usuario ${item.nombres}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/usuarios/${item.id}`)
      $q.notify({ type: 'positive', message: 'Usuario eliminado' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
    }
  })
}

onMounted(loadData)
</script>
