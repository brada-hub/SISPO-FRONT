<template>
  <q-page class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Plantillas de Evaluación</h1>
      <q-btn
        label="Nueva Plantilla"
        icon="add"
        color="primary"
        @click="openDialog()"
        rounded
        unelevated
        class="q-px-md shadow-2"
      />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      bordered
      class="rounded-2xl shadow-lg overflow-hidden"
      :filter="filter"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar plantilla...">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props" class="bg-gradient-to-r from-primary to-secondary text-white">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-uppercase font-bold tracking-wider">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-secciones="props">
        <q-td :props="props" class="text-center font-bold">
          <q-badge color="teal" outline>
            {{ props.row.matriz ? props.row.matriz.length : 0 }} Secciones
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <div class="flex no-wrap items-center justify-center gap-1">
            <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
               <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
               <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog for Template CRUD -->
    <q-dialog v-model="dialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-gray-100 flex flex-col no-wrap">
        <q-toolbar class="bg-gradient-to-r from-primary to-secondary text-white q-py-lg shadow-lg z-50 sticky top-0">
          <div class="flex items-center gap-3">
            <q-btn flat round dense icon="arrow_back" v-close-popup class="hover:bg-white/10 transition-colors" />
            <div class="flex flex-col">
              <q-toolbar-title class="text-weight-bolder text-xl tracking-tight leading-none">
                {{ isEdit ? 'EDITAR PLANTILLA' : 'NUEVA PLANTILLA' }}
              </q-toolbar-title>
              <div class="text-[10px] opacity-80 font-medium tracking-widest uppercase mt-1">Gestión de Talento Humano • UNITEPC</div>
            </div>
          </div>
          <q-space />
          <q-btn
              label="Guardar Plantilla"
              class="bg-white text-primary font-bold px-8 py-2 rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              unelevated
              icon="save"
              :loading="saving"
              @click="save"
              no-caps
          />
        </q-toolbar>

        <q-card-section class="flex-1 scroll p-4 row justify-center">
          <div class="col-12 col-md-10 col-lg-8">
            <q-card class="rounded-2xl shadow-sm mb-6">
              <q-card-section class="space-y-4">
                <div class="text-[11px] font-bold text-gray-500 uppercase mb-2">Información de la Plantilla</div>
                <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                        <q-input v-model="form.nombre" label="Nombre (Ej: Matriz Activos Fijos)" outlined dense :rules="[val => !!val || 'Requerido']" />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input v-model="form.descripcion" label="Descripción (Opcional)" outlined dense />
                    </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card class="rounded-2xl shadow-sm border-t-4 border-t-primary">
              <q-card-section class="py-4 space-y-3">
                <div class="flex items-center justify-between">
                   <div class="text-[11px] font-bold text-gray-500 uppercase">Configuración de Matriz</div>
                   <q-btn outline color="primary" label="Añadir Sección" icon="add" size="sm" @click="addSeccion" />
                </div>

                <div v-for="(sec, sIdx) in form.matriz" :key="sIdx" class="border border-gray-200 rounded-xl p-4 bg-gray-50/50 relative shadow-sm mb-4">
                   <q-btn round flat icon="close" size="xs" color="negative" class="absolute top-2 right-2" @click="removeSeccion(sIdx)" />
                   
                   <q-input v-model="sec.seccion" label="Nombre de Sección (Ej: FORMACIÓN PROFESIONAL)" outlined dense class="mb-3 w-11/12 text-weight-bold" bg-color="white" :rules="[val => !!val || '*']" />
                   
                   <div class="text-[10px] font-bold text-gray-400 mb-2 uppercase">Criterios de Evaluación:</div>
                   <div class="space-y-2">
                      <div v-for="(crit, cIdx) in sec.criterios" :key="cIdx" class="row q-col-gutter-sm items-start">
                         <div class="col-4">
                            <q-input v-model="crit.nombre" label="Criterio" dense outlined bg-color="white" placeholder="Ej: Título Académico" :rules="[val => !!val || '*']"/>
                         </div>
                         <div class="col-2">
                            <q-input v-model.number="crit.puntaje" label="Pts Máx" type="number" dense outlined bg-color="white" />
                         </div>
                         <div class="col-5">
                            <q-input v-model="crit.descripcion" label="Descripción / Base" dense outlined bg-color="white" />
                         </div>
                         <div class="col-1 flex flex-center">
                            <q-btn icon="delete" flat round color="negative" size="sm" @click="removeCriterio(sIdx, cIdx)" />
                         </div>
                      </div>
                   </div>
                   
                   <q-btn flat color="teal" label="Añadir Criterio" icon="add" size="sm" class="mt-2" @click="addCriterio(sIdx)" />
                   
                   <div class="text-right text-xs font-bold text-primary mt-2">
                      Subtotal: {{ sec.criterios.reduce((acc, c) => acc + (Number(c.puntaje) || 0), 0) }} pts
                   </div>
                </div>
                
                <div v-if="form.matriz && form.matriz.length > 0" class="bg-primary/10 text-primary p-3 rounded-lg text-center font-bold text-lg mt-4 shadow-inner">
                   PUNTAJE TOTAL MATRIZ: {{ form.matriz.reduce((acc, sec) => acc + sec.criterios.reduce((a, c) => a + (Number(c.puntaje) || 0), 0), 0) }} PTS
                </div>
                <div v-else class="text-center text-gray-400 text-xs py-4 italic border-dashed border-2 rounded-xl mt-4">
                   No se ha definido ninguna sección para esta matriz.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
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
const filter = ref('')

const form = ref({ id: null, nombre: '', descripcion: '', matriz: [] })

const columns = [
  { name: 'nombre', label: 'Nombre Plantilla', field: 'nombre', sortable: true, align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'secciones', label: 'Secciones', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center', style: 'width: 120px' }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.get('/plantillas-matrices')
    rows.value = res.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar plantillas' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  if (item) {
    isEdit.value = true
    form.value = { ...item, matriz: Array.isArray(item.matriz) ? JSON.parse(JSON.stringify(item.matriz)) : [] }
  } else {
    isEdit.value = false
    form.value = { id: null, nombre: '', descripcion: '', matriz: [] }
  }
  dialog.value = true
}

const addSeccion = () => {
  if (!form.value.matriz) form.value.matriz = []
  form.value.matriz.push({ seccion: '', criterios: [ { nombre: '', puntaje: 0, descripcion: '' } ] })
}
const removeSeccion = (i) => { form.value.matriz.splice(i, 1) }
const addCriterio = (sIdx) => { form.value.matriz[sIdx].criterios.push({ nombre: '', puntaje: 0, descripcion: '' }) }
const removeCriterio = (sIdx, cIdx) => { form.value.matriz[sIdx].criterios.splice(cIdx, 1) }

const save = async () => {
  if (!form.value.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' })
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/plantillas-matrices/${form.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Plantilla actualizada' })
    } else {
      await api.post('/plantillas-matrices', form.value)
      $q.notify({ type: 'positive', message: 'Plantilla creada' })
    }
    dialog.value = false
    loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar plantilla' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de eliminar la plantilla ${row.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/plantillas-matrices/${row.id}`)
      $q.notify({ type: 'positive', message: 'Eliminada correctamente' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

onMounted(() => {
  loadData()
})
</script>
