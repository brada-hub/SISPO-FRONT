<template>
  <q-page class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Gestión de Roles</h1>
      <q-btn label="Nuevo Rol" icon="add" style="background-color: #009999; color: white;" @click="openDialog()" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      class="rounded-2xl shadow-sm overflow-hidden"
    >
      <template v-slot:header="props">
        <q-tr :props="props" class="bg-primary text-white">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bolder uppercase tracking-wider">
            {{ col.label }}
          </q-th>
        </q-tr>
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
    <q-dialog v-model="dialog">
      <q-card class="min-w-[400px]">
        <q-card-section style="background-color: #663399; color: white;">
          <div class="text-h6">{{ isEdit ? 'Editar Rol' : 'Nuevo Rol' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="save" class="space-y-4">
            <q-input
              v-model="form.nombre"
              label="Nombre del Rol"
              outlined
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            <q-input
              v-model="form.descripcion"
              label="Descripción"
              type="textarea"
              outlined
              rows="3"
            />
            <q-toggle v-model="form.activo" label="Activo" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Guardar" @click="save" :loading="saving" />
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

const columns = [
  { name: 'nombre', label: 'Nombre del Rol', field: 'nombre', sortable: true, align: 'left' },
  { name: 'descripcion', label: 'Descripción de Acceso', field: 'descripcion', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
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
    title: 'Confirmar',
    message: '¿Estás seguro de eliminar este rol?',
    cancel: true,
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

onMounted(loadData)
</script>
