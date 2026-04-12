<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="max-w-7xl mx-auto">
      <!-- HEADER -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <h1 class="text-h4 text-weight-bold text-primary q-my-none">Mi Hoja de Vida</h1>
          <p class="text-subtitle1 text-grey-7 q-my-none">
            Gestiona tu información personal, académica y documentos de respaldo
          </p>
        </div>
        <q-btn
          color="primary"
          icon="save"
          label="Guardar Cambios"
          @click="saveChanges"
          :loading="saving"
          unelevated
          rounded
        />
      </div>

      <!-- MAIN CONTENT -->
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-dots size="50px" color="primary" />
      </div>

      <div v-else class="row q-col-gutter-lg">
        <!-- LEFT COLUMN: PROFILE CARD -->
        <div class="col-12 col-md-4">
          <q-card class="my-card q-mb-md relative-position overflow-hidden">
            <div class="bg-primary h-24 absolute-top w-full"></div>
            <q-card-section class="flex flex-center flex-col q-pt-xl relative-position z-10">
              <q-avatar size="100px" class="bg-white shadow-3 q-mb-md">
                <img :src="profileImage" style="object-fit: cover" />
                <q-btn
                  fab-mini
                  color="secondary"
                  icon="edit"
                  class="absolute-bottom-right transform translate-x-1 translate-y-1"
                  @click="$refs.fileInputFoto.click()"
                />
              </q-avatar>
              <input
                type="file"
                ref="fileInputFoto"
                class="hidden"
                accept="image/*"
                @change="handleFileChange($event, 'foto_perfil')"
              />

              <div class="text-h6 text-weight-bold text-center">
                {{ form.nombres }} {{ form.apellidos }}
              </div>
              <div class="text-caption text-grey-7 text-uppercase">{{ userRole }}</div>

              <q-chip outline color="primary" class="q-mt-sm" icon="badge">
                {{ form.ci }} {{ form.ci_expedido }}
              </q-chip>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="text-subtitle2 q-mb-sm text-grey-8">Documentos Básicos</div>

              <q-item clickable v-ripple class="bg-grey-1 rounded-borders q-mb-sm">
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-xs font-black text-gray-600 uppercase tracking-widest">Currículum Vitae</q-item-label>
                  <q-item-label caption v-if="existingFiles.cv_pdf_path" class="text-green-6 font-bold flex items-center gap-1">
                    <q-icon name="check_circle" size="xs" /> Cargado
                    <q-btn flat round dense color="primary" icon="visibility" size="xs" :href="getFileUrl(existingFiles.cv_pdf_path)" target="_blank" @click.stop />
                  </q-item-label>
                  <q-item-label caption v-else :class="pendingUploads.cv_pdf ? 'text-teal-6' : 'text-grey-5'">
                    {{ pendingUploads.cv_pdf ? 'Seleccionado: ' + pendingUploads.cv_pdf.name : 'Pendiente de carga' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                   <q-file
                    v-model="pendingUploads.cv_pdf"
                    outlined dense
                    accept=".pdf"
                    max-file-size="1048576"
                    @rejected="onRejected"
                    class="w-[45px] overflow-hidden"
                    borderless
                  >
                    <template v-slot:prepend>
                      <q-btn round flat color="primary" icon="upload" size="sm">
                        <q-tooltip>Actualizar CV (Máx 1MB)</q-tooltip>
                      </q-btn>
                    </template>
                    <template v-slot:file><span></span></template>
                  </q-file>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple class="bg-grey-1 rounded-borders">
                <q-item-section avatar>
                  <q-icon name="contact_mail" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-xs font-black text-gray-600 uppercase tracking-widest">Cédula de Identidad</q-item-label>
                  <q-item-label caption v-if="existingFiles.ci_archivo_path" class="text-green-6 font-bold flex items-center gap-1">
                    <q-icon name="check_circle" size="xs" /> Cargado
                    <q-btn flat round dense color="primary" icon="visibility" size="xs" :href="getFileUrl(existingFiles.ci_archivo_path)" target="_blank" @click.stop />
                  </q-item-label>
                  <q-item-label caption v-else :class="pendingUploads.ci_archivo ? 'text-teal-6' : 'text-grey-5'">
                    {{ pendingUploads.ci_archivo ? 'Seleccionado: ' + pendingUploads.ci_archivo.name : 'Pendiente de carga (Anverso/Reverso)' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                   <q-file
                    v-model="pendingUploads.ci_archivo"
                    outlined dense
                    accept=".pdf,image/*"
                    max-file-size="1048576"
                    @rejected="onRejected"
                    class="w-[45px] overflow-hidden"
                  >
                    <template v-slot:prepend>
                      <q-btn round flat color="primary" icon="upload" size="sm">
                        <q-tooltip>Actualizar CI (Máx 1MB)</q-tooltip>
                      </q-btn>
                    </template>
                    <template v-slot:file><span></span></template>
                  </q-file>
                </q-item-section>
              </q-item>
            </q-card-section>
          </q-card>
        </div>

        <!-- RIGHT COLUMN: DETAILS -->
        <div class="col-12 col-md-8">
          <q-card class="shadow-1">
            <q-tabs
              v-model="tab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="personal" label="Datos Personales" icon="person" />
              <q-tab name="contacto" label="Contacto & Referencias" icon="contacts" />
              <q-tab name="academico" label="Formación y Méritos" icon="school" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated>
              <!-- TAB 1 & 2 REMAIN THE SAME, FOCUSING ON MERITS TAB -->
              <q-tab-panel name="personal" class="q-pa-lg">
                <div class="row q-col-gutter-md">
                   <!-- ... (Manteniendo contenido anterior) ... -->
                   <div class="col-12 col-md-6"><q-input outlined v-model="form.nombres" label="Nombres" readonly bg-color="grey-2" hint="Modificable por RRHH" /></div>
                   <div class="col-12 col-md-6"><q-input outlined v-model="form.apellidos" label="Apellidos" readonly bg-color="grey-2" hint="Modificable por RRHH" /></div>
                   <div class="col-12 col-md-6"><q-input outlined v-model="form.ci" label="Cédula de Identidad" readonly bg-color="grey-2" /></div>
                   <div class="col-12 col-md-6"><q-input outlined v-model="form.nacionalidad" label="Nacionalidad" /></div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="contacto" class="q-pa-lg">
                 <div class="row q-col-gutter-md">
                     <!-- ... (Manteniendo contenido anterior) ... -->
                    <div class="col-12"><q-input outlined v-model="form.direccion_domicilio" label="Dirección de Domicilio" type="textarea" rows="2" /></div>
                    <div class="col-12 col-md-6"><q-input outlined v-model="form.email" label="Correo Electrónico" type="email" /></div>
                    <div class="col-12 col-md-6"><q-input outlined v-model="form.celular" label="Número de WhatsApp/Celular" mask="########" /></div>
                    <div class="col-12 q-mt-md text-subtitle2 text-primary">Referencia Personal</div>
                    <div class="col-12 col-md-6"><q-input outlined v-model="form.ref_personal_celular" label="Celular Referencia" mask="########" /></div>
                    <div class="col-12 col-md-6"><q-input outlined v-model="form.ref_personal_parentesco" label="Parentesco" /></div>
                    <div class="col-12 q-mt-md text-subtitle2 text-primary">Referencia Laboral</div>
                    <div class="col-12 col-md-6"><q-input outlined v-model="form.ref_laboral_celular" label="Celular Jefe/RRHH Ant." mask="########" /></div>
                    <div class="col-12 col-md-6"><q-input outlined v-model="form.ref_laboral_detalle" label="Empresa/Cargo" /></div>
                 </div>
              </q-tab-panel>

              <!-- TAB 3: DYNAMIC MERITS -->
              <q-tab-panel name="academico" class="q-pa-lg">
                <div class="text-caption text-grey-7 q-mb-md">
                  Aquí puedes cargar tus títulos académicos, certificados de trabajo y otros documentos de respaldo.
                </div>

                <div v-for="tipo in tiposDocumento" :key="tipo.id" class="q-mb-md border rounded-xl overflow-hidden shadow-sm">
                   <!-- TYPE HEADER -->
                   <div class="bg-blue-grey-1 q-pa-md flex items-center justify-between">
                      <div class="font-bold text-blue-grey-9 text-subtitle1">{{ tipo.nombre }}</div>
                      <q-btn size="sm" color="primary" unelevated icon="add" label="Agregar Registro" @click="addMerito(tipo)" />
                   </div>

                   <div class="q-pa-md">
                      <!-- EMPTY STATE -->
                      <div v-if="getMeritosByType(tipo.id).length === 0" class="text-center text-grey italic q-py-md">
                         <q-icon name="post_add" size="sm" />
                         No has agregado registros para {{ tipo.nombre }}
                      </div>

                      <!-- LIST RECORDS -->
                      <div v-for="(merito, mIdx) in getMeritosByType(tipo.id)" :key="mIdx" class="record-card bg-white border border-purple-100 rounded-xl overflow-hidden q-mb-lg shadow-sm">
                         <!-- HEADER -->
                         <div class="flex items-center justify-between px-4 py-3 bg-purple-50/50 border-b border-purple-100">
                            <div class="flex items-center gap-2">
                               <div class="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center font-black text-xs">
                                  {{ mIdx + 1 }}
                               </div>
                               <div class="text-xs font-black text-purple-900 uppercase">Registro #{{ mIdx + 1 }}</div>
                            </div>
                            <q-btn flat round dense color="negative" icon="delete" size="sm" @click="removeMerito(mIdx, tipo.id)">
                               <q-tooltip>Eliminar registro</q-tooltip>
                            </q-btn>
                         </div>

                         <div class="q-pa-md">
                            <!-- DYNAMIC FIELDS -->
                            <div class="row q-col-gutter-md">
                               <div
                                  v-for="(campo, cIdx) in getNormalizedCampos(tipo.campos)"
                                  :key="cIdx"
                                  :class="isWideField(campo.label) ? 'col-12' : 'col-12 col-md-6'"
                               >
                                  <!-- SELECT -->
                                  <q-select
                                    v-if="campo.tipo === 'select'"
                                    v-model="merito.respuestas[campo.key]"
                                    :label="campo.label"
                                    :options="campo.opciones"
                                    outlined dense emit-value map-options
                                    class="bg-white"
                                  />

                                  <!-- DATE -->
                                  <q-input
                                    v-else-if="campo.tipo === 'date'"
                                    v-model="merito.respuestas[campo.key]"
                                    :label="campo.label"
                                    type="date" outlined dense stack-label
                                    class="bg-white"
                                  />

                                  <!-- TEXTAREA -->
                                  <q-input
                                    v-else-if="campo.tipo === 'textarea'"
                                    v-model="merito.respuestas[campo.key]"
                                    :label="campo.label"
                                    type="textarea" rows="2" outlined dense
                                    class="bg-white"
                                  />

                                  <!-- DEFAULT -->
                                  <q-input
                                    v-else
                                    v-model="merito.respuestas[campo.key]"
                                    :label="campo.label"
                                    outlined dense
                                    class="bg-white uppercase-input"
                                  />
                               </div>
                            </div>

                            <!-- FILES WRAPPER -->
                            <div class="q-mt-lg">
                               <div class="text-[10px] font-black text-teal-700 uppercase mb-3 flex items-center gap-2 tracking-widest">
                                  <q-icon name="collections" /> Archivos de respaldo (Máx 1MB)
                               </div>
                               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div
                                     v-for="(archivoConfig, aIndex) in getNormalizedArchivos(tipo.config_archivos)"
                                     :key="aIndex"
                                     class="file-dropzone p-3 rounded-xl border border-dashed border-teal-200 bg-teal-50/20"
                                  >
                                     <div class="flex items-center justify-between mb-2">
                                        <span class="text-[10px] font-black text-teal-900 uppercase truncate max-w-[150px]">{{ archivoConfig.label }}</span>
                                        <div v-if="getExistingFile(merito, archivoConfig.key)" class="flex items-center gap-1">
                                           <span class="text-[9px] text-green-700 font-bold bg-green-100 px-1.5 rounded-full">OK</span>
                                           <q-btn flat round dense color="primary" icon="visibility" size="xs" :href="getFileUrl(getExistingFile(merito, archivoConfig.key))" target="_blank" />
                                        </div>
                                     </div>

                                     <q-file
                                        v-model="merito.newFiles[archivoConfig.key]"
                                        outlined dense
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        max-file-size="1048576"
                                        @rejected="onRejected"
                                        bg-color="white"
                                     >
                                        <template v-slot:prepend>
                                           <q-icon :name="merito.newFiles[archivoConfig.key] ? 'check_circle' : 'file_upload'" :color="merito.newFiles[archivoConfig.key] ? 'teal' : 'grey-6'" size="xs" />
                                        </template>
                                        <template v-slot:file="{ file }">
                                           <div class="text-[10px] text-teal-900 font-bold truncate">{{ file.name }}</div>
                                        </template>
                                     </q-file>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div v-if="tiposDocumento.length === 0" class="flex flex-center q-pa-lg text-grey">
                   <q-spinner v-if="loadingDocs" color="primary" size="2em" />
                   <span v-else>No hay tipos de documentos configurados.</span>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const tab = ref('personal')
const loading = ref(true)
const saving = ref(false)
const loadingDocs = ref(false)
const userRole = ref('')
const baseUrl = String(import.meta.env.VITE_SISPO_BACK_URL || '').replace(/\/+$/, '')

// Data models
const form = ref({})
const existingFiles = ref({})
const meritos = ref([])
const tiposDocumento = ref([])

// Profile image preview logic
const profileImage = computed(() => {
  if (form.value.foto_url_temp) return form.value.foto_url_temp
  if (existingFiles.value.foto_perfil_path) return getFileUrl(existingFiles.value.foto_perfil_path)
  return 'https://cdn.quasar.dev/img/boy-avatar.png'
})

// File inputs logic
const pendingUploads = ref({
  foto_perfil: null,
  cv_pdf: null,
  ci_archivo: null,
})

onMounted(async () => {
  await fetchUserData()
  await fetchTiposDocumento()
})

const getFileUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${baseUrl}/storage/${path}`
}

const isWideField = (fieldName) => {
   if (!fieldName || typeof fieldName !== 'string') return false
   // Helper logic to decide if field should be full width
   const wideKeywords = ['universidad', 'institución', 'carrera', 'descripción', 'motivo', 'empresa']
   return wideKeywords.some(w => fieldName.toLowerCase().includes(w))
}

const fetchUserData = async () => {
  try {
    loading.value = true
    const response = await api.get('/mi-legajo')
    if (response.data.success) {
      const data = response.data.data
      form.value = { ...data }
      existingFiles.value = {
        foto_perfil_path: data.foto_perfil_path,
        cv_pdf_path: data.cv_pdf_path,
        ci_archivo_path: data.ci_archivo_path,
      }

      // Load meritos
      if (data.meritos && Array.isArray(data.meritos)) {
        meritos.value = data.meritos.map((m) => ({
          ...m,
          // Ensure respuestas exists
          respuestas: typeof m.respuestas === 'string' ? JSON.parse(m.respuestas) : (m.respuestas || {}),
          newFiles: {} // Keyed by config_id
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching legajo:', error)
    $q.notify({ type: 'negative', message: 'Error cargando información del legajo' })
  } finally {
    loading.value = false
  }
}

const onRejected = (rejectedEntries) => {
  rejectedEntries.forEach(entry => {
    if (entry.failedPropValidation === 'max-file-size') {
      $q.notify({
        type: 'negative',
        icon: 'warning',
        message: 'Archivo demasiado grande',
        caption: `El archivo ${entry.file.name} supera el límite de 1MB permitido.`,
        position: 'top',
        timeout: 5000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'El archivo no cumple con los requisitos del sistema.',
        position: 'top'
      })
    }
  })
}

const fetchTiposDocumento = async () => {
  try {
    loadingDocs.value = true
    const response = await api.get('/tipos-documento')
    // Parse JSON fields if they come as strings
    const rawData = response.data.data || response.data
    tiposDocumento.value = rawData.map(t => ({
       ...t,
       campos: typeof t.campos === 'string' ? JSON.parse(t.campos) : t.campos,
       config_archivos: typeof t.config_archivos === 'string' ? JSON.parse(t.config_archivos) : t.config_archivos
    }))
  } catch (error) {
    console.error('Error types:', error)
  } finally {
    loadingDocs.value = false
  }
}

const handleFileChange = (event, type) => {
  const file = event.target.files[0]
  if (file) {
    pendingUploads.value[type] = file
    if (type === 'foto_perfil') {
      form.value.foto_url_temp = URL.createObjectURL(file)
    }
    $q.notify({ type: 'info', message: 'Archivo seleccionado', timeout: 1000 })
  }
}

const getMeritosByType = (typeId) => {
  return meritos.value.filter((m) => m.tipo_documento_id === typeId)
}

const addMerito = (tipo) => {
  // Pre-fill fields based on schema
  const initialRespuestas = {}
  const normalized = getNormalizedCampos(tipo.campos)
  if (normalized.length > 0) {
     normalized.forEach(c => initialRespuestas[c.key] = '')
  }

  meritos.value.push({
    id: null,
    tipo_documento_id: tipo.id,
    respuestas: initialRespuestas,
    newFiles: {}, // Keyed by config_id
    tempKey: Date.now() // For frontend identification
  })
}

const removeMerito = (index, typeId) => {
   // Find actual index in main array
   const subset = getMeritosByType(typeId)
   const itemToRemove = subset[index]
   const mainIndex = meritos.value.indexOf(itemToRemove)
   if (mainIndex > -1) {
      meritos.value.splice(mainIndex, 1)
   }
}

const getExistingFile = (merito, configId) => {
   if (!merito.archivos) return null
   // Look for an archivo that matches this configId (we need to send config_id from backend or use ordering)
   // Assuming backend saves 'config_id' in MeritoArchivo
   return merito.archivos.find(a => a.config_id == configId || a.config_key == configId)?.archivo_path
}

const getNormalizedCampos = (campos) => {
  if (Array.isArray(campos)) {
    return campos.map((c, i) => ({
      ...c,
      key: c.key || c.id || c.name || c.nombre || `campo_${i}`,
      label: c.label || c.nombre || c.name || `Campo ${i + 1}`,
      tipo: c.tipo || c.type || 'text',
      opciones: c.opciones || c.options || []
    }))
  }
  return []
}

const getNormalizedArchivos = (archivos) => {
  if (Array.isArray(archivos)) {
    return archivos.map((a, i) => {
      // Priorizar id original o key definida, sino usar prefijo con indice
      const stableKey = a.id || a.key || `file_${i}`
      return {
        ...a,
        key: stableKey,
        label: a.label || a.nombre || a.name || `Archivo ${i + 1}`
      }
    })
  }
  return []
}

const saveChanges = async () => {
  try {
    saving.value = true
    const formData = new FormData()

    // 1. Datos Personales Base (solo campos simples)
    const excludeKeys = ['meritos', 'foto_perfil_path', 'cv_pdf_path', 'ci_archivo_path', 'foto_url_temp', 'user', 'archivos']
    Object.keys(form.value).forEach((key) => {
      const val = form.value[key]
      if (val !== null && val !== undefined && !excludeKeys.includes(key) && typeof val !== 'object') {
        formData.append(key, val)
      }
    })

    // 2. Archivos Base (de los inputs ocultos de la izquierda)
    Object.keys(pendingUploads.value).forEach((key) => {
      if (pendingUploads.value[key] instanceof File) {
        formData.append(key, pendingUploads.value[key])
      }
    })

    // 3. MERITOS COMPLEX LOGIC
    let meritsCount = 0
    let filesCount = 0
    meritos.value.forEach((m, index) => {
      meritsCount++
      if (m.id) formData.append(`meritos[${index}][id]`, m.id)
      formData.append(`meritos[${index}][tipo_documento_id]`, m.tipo_documento_id)

      // Respuestas como JSON String
      formData.append(`meritos[${index}][respuestas]`, JSON.stringify(m.respuestas))

      // Archivos Nuevos
      if (m.newFiles) {
         Object.keys(m.newFiles).forEach(configKey => {
            const file = m.newFiles[configKey]
            if (file instanceof File) {
               filesCount++
               // Enviar el archivo con la clave de configuración
               formData.append(`meritos[${index}][archivos][${configKey}]`, file)
            }
         })
      }
    })

    if (filesCount > 0 || Object.keys(pendingUploads.value).some(k => pendingUploads.value[k])) {
       $q.notify({
         type: 'ongoing',
         message: `Subiendo ${filesCount} archivos de respaldo en ${meritsCount} registros...`,
         timeout: 2000
       })
    }

    const uploadProgress = ref(0)
    const response = await api.post('/mi-legajo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        if (uploadProgress.value < 100) {
           $q.loading.show({
             message: `Subiendo archivos: ${uploadProgress.value}%`
           })
        } else {
           $q.loading.show({ message: 'Procesando en el servidor...' })
        }
      }
    })

    $q.loading.hide()

    if (response.data.success) {
      $q.notify({ type: 'positive', message: 'Legajo actualizado correctamente' })
      await fetchUserData()
      pendingUploads.value = { foto_perfil: null, cv_pdf: null, ci_archivo: null }
      form.value.foto_url_temp = null
    }
  } catch (error) {
    console.error('Save error:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar cambios',
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.my-card {
  border-radius: 16px;
}

.file-dropzone {
  transition: all 0.3s ease;
  background-color: rgba(102, 51, 153, 0.02);
}

.file-dropzone:hover {
  background-color: rgba(102, 51, 153, 0.05);
  border-color: rgba(102, 51, 153, 0.3) !important;
}

.btn-gradient {
  background: linear-gradient(135deg, #663399 0%, #009999 100%);
  color: white;
  font-weight: 800;
  border-radius: 12px;
}

.text-gradient {
  background: linear-gradient(135deg, #663399 0%, #009999 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
