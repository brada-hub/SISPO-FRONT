<template>
  <q-page class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Tipos de Documento</h1>
      <q-btn label="Nuevo Documento" icon="add" style="background-color: #009999; color: white;" @click="openDialog()" rounded unelevated class="shadow-2" />
    </div>

    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <q-card v-for="row in rows" :key="row.id" flat bordered class="rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border-gray-200">
        <q-card-section class="bg-gray-50 border-b p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="text-caption text-primary font-bold uppercase tracking-wider mb-1">{{ row.categoria || 'Sin Categoría' }}</div>
              <div class="text-lg font-black text-gray-800 leading-tight">{{ row.nombre }}</div>
            </div>
            <div class="flex gap-1">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(row)">
                <q-tooltip>Editar Estructura</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="flex-1 p-4">
          <div v-if="row.campos?.length > 0" class="mb-4">
            <div class="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
              <q-icon name="list" size="14px" /> Información Solicitada
            </div>
            <div class="flex flex-wrap gap-2">
              <q-chip v-for="(f, i) in row.campos" :key="i" dense size="sm" color="indigo-1" text-color="indigo-9" class="font-bold px-2">
                {{ f.label }}
              </q-chip>
            </div>
          </div>

          <div v-if="row.config_archivos?.length > 0">
            <div class="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
              <q-icon name="attach_file" size="14px" /> Archivos de Respaldo
            </div>
            <div class="flex flex-wrap gap-2">
              <q-chip v-for="(a, i) in row.config_archivos" :key="i" dense size="sm" color="teal-1" text-color="teal-9" icon="description" class="font-bold px-2">
                {{ a.label }}
              </q-chip>
            </div>
          </div>

          <div v-if="!row.campos?.length && !row.config_archivos?.length" class="text-center py-4 text-gray-300 italic text-sm">
            Sin campos configurados
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="p-3 bg-white rounded-b-2xl">
           <div class="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
             <q-icon :name="row.permite_multiples ? 'library_add' : 'looks_one'" color="orange-8" size="xs" />
             {{ row.permite_multiples ? 'Permite múltiples registros (Ej: Varios cursos)' : 'Solo un registro (Ej: Título único)' }}
           </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="flex justify-center py-20">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- Modal Form Refactored with Visual Builder -->
    <q-dialog v-model="dialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-gray-50">
        <q-toolbar style="background-color: #663399; color: white;">
          <q-toolbar-title>{{ isEdit ? 'Editar Tipo Documento' : 'Nuevo Tipo Documento' }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="row q-col-gutter-lg h-full overflow-hidden" style="height: calc(100vh - 50px)">
          <!-- LEFT: VISUAL BUILDER -->
          <div class="col-12 col-md-7 h-full flex flex-col">
            <q-scroll-area class="flex-1">
              <div class="bg-white p-6 rounded-lg shadow-sm mb-4">
                <div class="text-subtitle1 font-bold text-gray-700 mb-4 border-b pb-2">Información General</div>
                <div class="grid grid-cols-2 gap-4">
                  <q-input v-model="form.nombre" label="Nombre del Tipo de Documento" outlined dense :rules="[val => !!val || 'Requerido']" />
                  <q-input v-model="form.categoria" label="Categoría" outlined dense placeholder="Eje: Formación, Experiencia..." />
                </div>
                <q-input v-model="form.descripcion" label="Instrucciones para el postulante" type="textarea" outlined dense rows="2" class="mt-4" />
                <q-checkbox v-model="form.permite_multiples" label="Permitir que el postulante suba varios registros de este tipo" class="mt-2" />
              </div>

              <!-- BUILDER: CAMPOS DINÁMICOS -->
              <div class="bg-white p-6 rounded-lg shadow-sm mb-4">
                <div class="flex justify-between items-center mb-4 border-b pb-2">
                  <div class="text-subtitle1 font-bold text-gray-700">Constructor de Formulario (JSON)</div>
                  <q-btn label="Añadir Campo" icon="add_circle" flat color="primary" @click="addField" />
                </div>

                <div v-if="form.campos.length === 0" class="text-center py-8 text-gray-400 italic">
                  No hay campos definidos. El postulante solo verá los archivos.
                </div>

                <div v-for="(field, index) in form.campos" :key="index" class="bg-gray-50 p-4 rounded-md mb-3 border border-gray-200">
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-12 col-md-5">
                      <q-input v-model="field.label" label="Etiqueta / Pregunta" outlined dense bg-color="white" />
                    </div>
                    <div class="col-12 col-md-3">
                      <q-select v-model="field.tipo" :options="fieldTypeOptions" label="Tipo de dato" outlined dense bg-color="white" emit-value map-options />
                    </div>
                    <div class="col-12 col-md-2">
                       <q-checkbox v-model="field.required" label="Oblig." dense />
                    </div>
                    <div class="col-12 col-md-2 text-right">
                      <q-btn icon="delete" color="negative" flat round size="sm" @click="removeField(index)" />
                    </div>
                  </div>
                  <!-- Special options for select -->
                  <div v-if="field.tipo === 'select'" class="mt-3 bg-white p-3 rounded border border-gray-100">
                    <div class="text-caption font-bold text-gray-600 mb-2">Configurar opciones de la lista:</div>
                    <div class="space-y-2">
                      <div v-for="(opt, optIndex) in field.options" :key="optIndex" class="flex items-center gap-2">
                        <q-input
                          v-model="field.options[optIndex]"
                          dense
                          outlined
                          placeholder="Nombre de la opción"
                          class="flex-1"
                        />
                        <q-btn
                          icon="delete"
                          flat
                          round
                          color="negative"
                          size="xs"
                          @click="field.options.splice(optIndex, 1)"
                          v-if="field.options.length > 1"
                        />
                      </div>
                      <q-btn
                        label="Añadir opción"
                        icon="add"
                        flat
                        color="primary"
                        size="sm"
                        class="mt-2"
                        @click="field.options.push('')"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- BUILDER: CONFIG ARCHIVOS -->
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4 border-b pb-2">
                  <div class="text-subtitle1 font-bold text-gray-700">Requerimientos de Archivos</div>
                  <q-btn label="Añadir Archivo" icon="upload_file" flat color="primary" @click="addFile" />
                </div>

                <div v-if="form.config_archivos.length === 0" class="text-center py-8 text-gray-400 italic">
                  No se requieren archivos para este documento.
                </div>

                <div v-for="(file, index) in form.config_archivos" :key="index" class="bg-gray-50 p-4 rounded-md mb-3 border border-gray-200">
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-12 col-md-8">
                       <q-input v-model="file.label" label="Nombre del Archivo (Eje: Escaneo de Título)" outlined dense bg-color="white" />
                    </div>
                    <div class="col-12 col-md-2">
                       <q-checkbox v-model="file.required" label="Oblig." dense />
                    </div>
                    <div class="col-12 col-md-2 text-right">
                      <q-btn icon="delete" color="negative" flat round size="sm" @click="removeFile(index)" />
                    </div>
                  </div>
                </div>
              </div>
            </q-scroll-area>

            <div class="bg-white p-4 border-t flex justify-end gap-3 rounded-b-lg mt-2">
              <q-btn label="Cancelar" color="gray" flat v-close-popup rounded />
              <q-btn label="Guardar Requisito" style="background-color: #009999; color: white;" icon="save" :loading="saving" @click="save" rounded unelevated class="q-px-lg shadow-2" />
            </div>
          </div>

          <!-- RIGHT: LIVE PREVIEW -->
          <div class="col-12 col-md-5 h-full">
            <div class="bg-white rounded-lg shadow-sm h-full flex flex-col border border-gray-200">
              <div class="p-4 border-b bg-gray-50 rounded-t-lg flex items-center gap-2">
                <q-icon name="visibility" color="primary" size="sm" />
                <div class="text-subtitle2 font-bold text-gray-600">PREVISUALIZACIÓN EN TIEMPO REAL</div>
              </div>

              <q-scroll-area class="flex-1 p-6">
                 <!-- Simulation of the Postulante View -->
                 <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div class="text-h6 text-primary mb-1">{{ form.nombre || 'Nombre del Requisito' }}</div>
                    <div class="text-caption text-gray-500 mb-6">{{ form.descripcion || 'Aquí aparecerá la descripción del requisito para orientar al postulante.' }}</div>

                    <q-form class="space-y-6">
                      <!-- Render Dynamic Fields -->
                      <div v-for="(field, index) in form.campos" :key="index">
                        <label class="block text-sm font-bold text-gray-700 mb-1">
                          {{ field.label || 'Campo sin nombre' }}
                          <span v-if="field.required" class="text-red-500">*</span>
                        </label>

                        <q-input v-if="field.tipo === 'text'" outlined dense bg-color="white" placeholder="Escriba aquí..." readonly />
                        <q-input v-if="field.tipo === 'number'" type="number" outlined dense bg-color="white" readonly />
                        <q-input v-if="field.tipo === 'date'" type="date" outlined dense bg-color="white" readonly />
                        <q-input v-if="field.tipo === 'textarea'" type="textarea" outlined dense bg-color="white" rows="2" readonly />
                        <q-select v-if="field.tipo === 'select'" :options="field.options || []" outlined dense bg-color="white" readonly />
                      </div>

                      <!-- Render File Fields -->
                      <div v-if="form.config_archivos.length > 0" class="space-y-4 pt-4 border-t border-gray-200">
                        <div v-for="(file, index) in form.config_archivos" :key="index">
                           <label class="block text-sm font-bold text-gray-700 mb-1">
                            {{ file.label || 'Archivo sin nombre' }}
                            <span v-if="file.required" class="text-red-500">*</span>
                          </label>
                          <q-file outlined dense bg-color="white" placeholder="Subir archivo..." readonly>
                            <template v-slot:prepend>
                              <q-icon name="attach_file" />
                            </template>
                          </q-file>
                        </div>
                      </div>

                      <div v-if="form.campos.length === 0 && form.config_archivos.length === 0" class="py-12 text-center text-gray-300">
                        <q-icon name="design_services" size="xl" class="mb-2" />
                        <div>Añade elementos para ver la vista previa</div>
                      </div>
                    </q-form>
                 </div>
              </q-scroll-area>
            </div>
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

const fieldTypeOptions = [
  { label: 'Texto Corto', value: 'text' },
  { label: 'Número', value: 'number' },
  { label: 'Fecha', value: 'date' },
  { label: 'Texto Largo (Párrafo)', value: 'textarea' },
  { label: 'Lista de Selección', value: 'select' }
]

const form = ref({
  id: null,
  nombre: '',
  descripcion: '',
  categoria: '',
  permite_multiples: false,
  campos: [],
  config_archivos: []
})

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/tipos-documento')
    rows.value = data
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  if (item) {
    isEdit.value = true
    // Deep clone it to avoid mutating original list
    const clone = JSON.parse(JSON.stringify(item))

    // Asegurar que campos y config_archivos existan
    form.value = {
      ...clone,
      campos: (clone.campos || []).map(c => ({
        ...c,
        options: c.options || (c.tipo === 'select' ? ['Opción 1'] : [])
      })),
      config_archivos: clone.config_archivos || []
    }
  } else {
    isEdit.value = false
    form.value = {
      id: null,
      nombre: '',
      descripcion: '',
      categoria: '',
      permite_multiples: false,
      campos: [],
      config_archivos: []
    }
  }
  dialog.value = true
}

const addField = () => {
  form.value.campos.push({
    label: '',
    tipo: 'text',
    required: true,
    name: 'campo_' + Date.now(),
    options: []
  })
}

const removeField = (index) => {
  form.value.campos.splice(index, 1)
}

// Eliminada función updateSelectOptions al usar campos individuales

const addFile = () => {
  form.value.config_archivos.push({
    id: 'file_' + Date.now(),
    label: '',
    required: true,
    mimes: 'pdf,jpg,png,doc,docx'
  })
}

const removeFile = (index) => {
  form.value.config_archivos.splice(index, 1)
}

const save = async () => {
  if (!form.value.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' })
    return
  }

  saving.value = true
  try {
    // Ya no necesitamos limpiar helper properties como options_str
    const payload = JSON.parse(JSON.stringify(form.value))

    if (isEdit.value) {
      await api.put(`/tipos-documento/${form.value.id}`, payload)
      $q.notify({ type: 'positive', message: 'Actualizado correctamente' })
    } else {
      await api.post('/tipos-documento', payload)
      $q.notify({ type: 'positive', message: 'Requisito creado correctamente' })
    }
    dialog.value = false
    loadData()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al guardar el requisito' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${item.nombre}"? Esto afectará a las convocatorias que lo usen.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/tipos-documento/${item.id}`)
      $q.notify({ type: 'positive', message: 'Eliminado correctamente' })
      loadData()
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'No se pudo eliminar por restricciones de integridad' })
    }
  })
}

onMounted(loadData)
</script>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
