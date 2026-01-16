<template>
  <q-page class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Gestión de Cargos</h1>
      <q-btn label="Nuevo Cargo" icon="add" style="background-color: #009999; color: white;" @click="openDialog()" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
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
          <div class="text-h6">{{ isEdit ? 'Editar Cargo' : 'Nuevo Cargo' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="save" class="space-y-4">
            <q-input
              v-model="form.nombre"
              label="Nombre del Cargo"
              outlined
              :rules="[val => !!val || 'El nombre es requerido']"
            />
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
const form = ref({ id: null, nombre: '' })

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/cargos')
    rows.value = data
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar cargos' })
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
    form.value = { id: null, nombre: '' }
  }
  dialog.value = true
}

const save = async () => {
  if (!form.value.nombre) return

  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/cargos/${form.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Cargo actualizado correctamente' })
    } else {
      await api.post('/cargos', form.value)
      $q.notify({ type: 'positive', message: 'Cargo creado correctamente' })
    }
    dialog.value = false
    loadData()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al guardar los datos' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de eliminar este cargo?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/cargos/${item.id}`)
      $q.notify({ type: 'positive', message: 'Cargo eliminado' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
    }
  })
}

onMounted(loadData)
</script>
