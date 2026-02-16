<template>
  <q-page class="p-6 bg-gray-50/50">
    <!-- Header -->
    <div class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Gestión de Sedes</h1>
        <p class="text-gray-500 font-medium">Administra las ubicaciones y campus universitarios</p>
      </div>
      <div class="flex gap-3">
        <q-btn
          unelevated
          color="deep-purple-8"
          icon="add"
          label="Nueva Sede"
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
        <template v-slot:body-cell-departamento="props">
          <q-td :props="props">
            <template v-if="isNacional(props.row)">
              <div class="flex gap-1 flex-wrap">
                <q-chip
                  v-for="dep in departamentosRegistrados"
                  :key="dep"
                  dense
                  color="primary"
                  text-color="white"
                  size="sm"
                  class="q-px-sm"
                >
                  {{ dep }}
                </q-chip>
              </div>
            </template>
            <span v-else>{{ props.row.departamento }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props" align="center">
            <q-badge :color="props.row.activo ? 'positive' : 'grey'" class="q-px-md q-py-xs rounded-full">
              {{ props.row.activo ? 'Activa' : 'Inactiva' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" align="center">
            <div class="flex gap-2 justify-center">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
                <q-tooltip>Editar Sede</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
                <q-tooltip>Eliminar Sede</q-tooltip>
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
            <q-icon :name="isEdit ? 'edit' : 'add_business'" />
            {{ isEdit ? 'Editar Sede' : 'Nueva Sede' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg q-px-lg">
          <q-form @submit="save" class="q-gutter-y-md">
            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase">Nombre de la Sede</label>
              <q-input
                v-model="form.nombre"
                outlined
                dense
                placeholder="Ej: Cochabamba - Central"
                :rules="[val => !!val || 'El nombre es requerido']"
              />
            </div>

            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase">Departamento / Ubicación</label>
              <q-select
                v-model="form.departamento"
                :options="departamentos"
                outlined
                dense
                emit-value
                map-options
                placeholder="Seleccione departamento"
                :rules="[val => !!val || 'El departamento es requerido']"
              />
            </div>

            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase">Sigla (Identificador)</label>
              <q-input
                v-model="form.sigla"
                outlined
                dense
                maxlength="10"
                hint="Se usará para generar el código de convocatoria"
                @update:model-value="manualSigla = true"
              />
            </div>

            <div class="flex items-center q-mt-md">
              <q-toggle v-model="form.activo" label="Sede Activa" color="positive" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup rounded no-caps />
          <q-btn
            label="Guardar Sede"
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const manualSigla = ref(false)

const form = ref({ id: null, nombre: '', departamento: '', sigla: '', activo: true })

const departamentos = ['Cochabamba', 'La Paz', 'Santa Cruz', 'El Alto', 'Beni', 'Pando', 'Oruro', 'Potosí', 'Tarija']

const isNacional = (sede) => {
  return sede.sigla?.toUpperCase() === 'NAC' || sede.nombre?.toUpperCase() === 'NACIONAL'
}

const departamentosRegistrados = computed(() => {
  const deps = rows.value
    .filter(s => !isNacional(s) && s.departamento)
    .map(s => s.departamento)
  return [...new Set(deps)].sort()
})

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
  { name: 'sigla', label: 'Sigla', field: 'sigla', sortable: true, align: 'left' },
  { name: 'departamento', label: 'Departamento / Ubicación', field: 'departamento', sortable: true, align: 'left' },
  { name: 'activo', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const helperGenerarSigla = (val) => {
  if (!val) return ''
  const words = val.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3)
  if (words.length === 0) return val.substring(0, 3).toUpperCase()
  if (words.length === 1) return words[0].substring(0, 3)
  return words.slice(0, 3).map(w => w.substring(0, 3)).join('-')
}

watch(() => form.value.nombre, (newVal) => {
  if (!manualSigla.value && !isEdit.value) form.value.sigla = helperGenerarSigla(newVal)
})

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/sedes')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar sedes' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  if (item) {
    isEdit.value = true
    form.value = { ...item, activo: item.activo === undefined ? true : item.activo }
  } else {
    isEdit.value = false
    form.value = { id: null, nombre: '', departamento: '', sigla: '', activo: true }
  }
  dialog.value = true
  manualSigla.value = false
}

const save = async () => {
  if (!form.value.nombre) return

  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/sedes/${form.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Sede actualizada correctamente' })
    } else {
      await api.post('/sedes', form.value)
      $q.notify({ type: 'positive', message: 'Sede creada correctamente' })
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
    message: `¿Estás seguro de eliminar la sede "${item.nombre}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/sedes/${item.id}`)
      $q.notify({ type: 'positive', message: 'Sede eliminada' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
    }
  })
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
