<template>
  <q-page class="portal-root min-h-screen">
    <div class="portal-bg-pattern"></div>

    <header class="portal-header shadow-lg relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#4a2371] via-[#2c4e91] to-[#009b9b]"></div>
      <div class="relative z-10 py-10 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h1 class="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
          Registro <span class="text-teal-300">Hoja de Vida</span>
        </h1>
        <p class="text-white/70 font-bold max-w-xl text-sm leading-relaxed">
          Portal de Actualización de Expediente Digital (Solo Personal UNITEPC)
        </p>
      </div>
    </header>

    <main class="relative z-10 max-w-5xl mx-auto q-pa-md -mt-8">
      <q-card class="rounded-3xl shadow-2xl overflow-hidden border-none">

        <!-- STEP 0: VERIFICATION -->
        <q-banner v-if="!verified" class="bg-indigo-50 text-indigo-900 q-pa-lg">
           <template v-slot:avatar>
              <q-icon name="fingerprint" color="indigo" size="md" />
           </template>
           <div class="text-h6 font-black uppercase tracking-tight">Verificación de Identidad</div>
           <div class="text-caption">Ingresa tu CI para comenzar. Si ya registraste tus documentos antes, te pediremos tu correo para actualizar tu expediente.</div>

           <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-5">
                 <div class="row no-wrap q-col-gutter-sm">
                   <q-input
                    v-model="form.ci"
                    label="Cédula de Identidad"
                    outlined bg-color="white"
                    @blur="checkIdentity"
                    :loading="verifying"
                    placeholder="Ej: 1234567"
                    class="col-8"
                   >
                      <template v-slot:prepend><q-icon name="badge" /></template>
                   </q-input>
                   <q-select
                    v-model="form.ci_expedido"
                    :options="['LP','OR','PT','CB','CH','TJ','SC','BE','PND']"
                    label="Exp."
                    outlined bg-color="white"
                    class="col-4"
                   />
                 </div>
              </div>
              <div class="col-12 col-md-5" v-if="postulanteExists">
                 <q-input
                  v-model="form.email_verification"
                  label="Confirmar Correo Electrónico"
                  outlined bg-color="white"
                  placeholder="El correo que usaste al registrarte"
                 >
                    <template v-slot:prepend><q-icon name="email" /></template>
                 </q-input>
              </div>
              <div class="col-12 col-md-2 flex items-center">
                 <q-btn
                  unelevated
                  :label="postulanteExists ? 'Acceder' : 'Comenzar'"
                  color="indigo"
                  class="full-width h-[56px] font-bold"
                  @click="postulanteExists ? verifyFullIdentity() : startNew()"
                  :loading="verifying"
                 />
              </div>
           </div>
        </q-banner>

        <!-- FORM CONTENT -->
        <div v-if="verified" class="q-pa-xl">

           <!-- TABS -->
           <q-tabs v-model="activeTab" class="text-primary q-mb-xl" align="justify" active-color="primary" indicator-color="primary" dense>
              <q-tab name="personal" icon="person" label="Mis Datos" />
              <q-tab name="documentos" icon="folder_shared" label="Respaldos y Méritos" />
           </q-tabs>

           <q-tab-panels v-model="activeTab" animated class="bg-transparent">

              <!-- PERSONAL DATA -->
              <q-tab-panel name="personal" class="q-pa-none">
                 <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-6">
                       <q-input v-model="form.nombres" label="Nombres" outlined class="uppercase-input" />
                    </div>
                    <div class="col-12 col-md-6">
                       <q-input v-model="form.apellidos" label="Apellidos" outlined class="uppercase-input" />
                    </div>
                    <div class="col-12 col-md-6">
                       <q-input v-model="form.email" label="Correo Electrónico" outlined type="email" hint="Úsalo para volver a entrar en el futuro" />
                    </div>
                    <div class="col-12 col-md-3">
                       <q-input v-model="form.celular" label="Celular / WhatsApp" outlined />
                    </div>
                     <div class="col-12 col-md-3">
                        <q-select
                         v-model="form.sede_id"
                         :options="sedesOptions"
                         label="Sede de Trabajo"
                         outlined
                         emit-value
                         map-options
                         option-value="id"
                         option-label="nombre"
                        >
                           <template v-slot:prepend><q-icon name="location_on" /></template>
                        </q-select>
                     </div>
                     <div class="col-12 col-md-3">
                        <q-select
                         v-model="form.clasificacion"
                         :options="['ADMINISTRATIVO', 'DOCENTE', 'SERVICIO', 'PERSONAL EXTERNO']"
                         label="Tipo de Personal"
                         outlined
                         hint="Selecciona tu área principal"
                        >
                           <template v-slot:prepend><q-icon name="work" /></template>
                        </q-select>
                     </div>

                    <div class="col-12 col-md-6">
                       <q-input v-model="form.direccion_domicilio" label="Dirección de Domicilio" outlined class="uppercase-input" hint="Calle, Número, Zona/Barrio" />
                    </div>
                    <div class="col-12 col-md-3">
                       <q-input v-model="form.nacionalidad" label="Nacionalidad" outlined class="uppercase-input" />
                    </div>
                    <div class="col-12 col-md-3">
                       <q-input v-model="form.email_institucional" label="Correo Institucional" outlined type="email" hint="Si no tiene, dejar en blanco" />
                    </div>

                    <div class="col-12"><q-separator class="q-my-sm" /></div>
                    <div class="col-12 text-subtitle2 text-indigo font-black uppercase tracking-widest text-[10px]">Referencia de Contacto (Personal)</div>

                    <div class="col-12 col-md-6">
                       <q-input v-model="form.ref_personal_parentesco" label="Nombre o Relación / Parentesco" outlined hint="Ej: Juan Perez (Hermano)" />
                    </div>
                    <div class="col-12 col-md-6">
                       <q-input v-model="form.ref_personal_celular" label="Celular de la Referencia" outlined />
                    </div>

                    <div class="col-12"><q-separator class="q-my-md" /></div>

                    <div class="col-12 text-subtitle2 text-primary font-black uppercase tracking-widest text-[10px]">Documentos Obligatorios</div>

                    <div class="col-12 col-md-4">
                       <div class="text-[10px] font-black text-gray-400 uppercase mb-2">Currículum Vitae (PDF)</div>
                       <div v-if="existingFiles.cv_pdf" class="q-mb-sm flex items-center gap-2 bg-green-50 p-2 rounded-xl border border-green-100">
                          <q-icon name="check_circle" color="green" />
                          <span class="text-[10px] font-bold text-green-700">CV YA CARGADO</span>
                          <q-btn flat round dense size="xs" color="primary" icon="visibility" :href="getFileUrl(existingFiles.cv_pdf)" target="_blank" />
                       </div>
                       <q-file v-model="files.cv_pdf" :label="existingFiles.cv_pdf ? 'Actualizar CV' : 'Subir CV'" outlined dense accept=".pdf" max-file-size="2097152" @rejected="onRejected">
                          <template v-slot:prepend><q-icon name="picture_as_pdf" /></template>
                       </q-file>
                    </div>
                    <div class="col-12 col-md-4">
                       <div class="text-[10px] font-black text-gray-400 uppercase mb-2">Cédula de Identidad (Digital)</div>
                       <div v-if="existingFiles.ci_archivo" class="q-mb-sm flex items-center gap-2 bg-green-50 p-2 rounded-xl border border-green-100">
                          <q-icon name="check_circle" color="green" />
                          <span class="text-[10px] font-bold text-green-700">CI YA CARGADA</span>
                          <q-btn flat round dense size="xs" color="primary" icon="visibility" :href="getFileUrl(existingFiles.ci_archivo)" target="_blank" />
                       </div>
                       <q-file v-model="files.ci_archivo" :label="existingFiles.ci_archivo ? 'Actualizar CI' : 'Subir CI'" outlined dense accept=".pdf,image/*" max-file-size="2097152" @rejected="onRejected">
                          <template v-slot:prepend><q-icon name="assignment_ind" /></template>
                       </q-file>
                    </div>
                    <div class="col-12 col-md-4">
                       <div class="text-[10px] font-black text-gray-400 uppercase mb-2">Foto de Perfil</div>
                       <div v-if="existingFiles.foto_perfil" class="q-mb-sm flex items-center gap-2 bg-green-50 p-2 rounded-xl border border-green-100">
                          <q-avatar size="24px"><img :src="getFileUrl(existingFiles.foto_perfil)" /></q-avatar>
                          <span class="text-[10px] font-bold text-green-700">FOTO CARGADA</span>
                          <q-btn flat round dense size="xs" color="primary" icon="visibility" :href="getFileUrl(existingFiles.foto_perfil)" target="_blank" />
                       </div>
                       <q-file v-model="files.foto_perfil" :label="existingFiles.foto_perfil ? 'Actualizar Foto' : 'Subir Foto'" outlined dense accept="image/*" max-file-size="2097152" @rejected="onRejected">
                          <template v-slot:prepend><q-icon name="photo_camera" /></template>
                       </q-file>
                    </div>
                 </div>

                 <div class="flex justify-end q-mt-xl">
                    <q-btn label="Siguiente: Cargar Méritos" color="primary" unelevated class="px-8 py-3 rounded-xl font-bold" @click="activeTab = 'documentos'" />
                 </div>
              </q-tab-panel>

              <!-- MERITS / DOCUMENTS -->
              <q-tab-panel name="documentos" class="q-pa-none">
                 <div class="text-caption text-grey-7 q-mb-lg flex items-center gap-2">
                    <q-icon name="info" color="primary" />
                    <span>Organiza tus títulos y certificados. Puedes añadir varios registros en cada categoría.</span>
                 </div>

                 <!-- MERIT SELECTOR (Like he said "un selector") -->
                 <div class="q-mb-lg bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300 flex items-center justify-between">
                    <div class="text-xs font-black text-gray-500 uppercase tracking-widest">¿Qué deseas añadir a tu expediente?</div>
                    <q-btn-dropdown color="indigo" label="Seleccionar Categoría" unelevated rounded icon="add">
                       <q-list style="min-width: 250px">
                          <q-item v-for="tipo in tiposDocumento" :key="tipo.id" clickable v-close-popup @click="addMerito(tipo)">
                             <q-item-section avatar>
                                <q-icon name="folder" color="primary" />
                             </q-item-section>
                             <q-item-section>
                                <q-item-label>{{ tipo.nombre }}</q-item-label>
                             </q-item-section>
                          </q-item>
                       </q-list>
                    </q-btn-dropdown>
                 </div>

                 <!-- LIST OF ADDED MERITS -->
                 <div v-for="tipo in visibleTipos" :key="tipo.id" class="q-mb-md border rounded-2xl overflow-hidden shadow-sm bg-white">
                    <q-expansion-item
                      group="meritos"
                      header-class="bg-indigo-50 q-pa-md text-indigo-900 font-black text-xs uppercase tracking-wider"
                      :label="tipo.nombre"
                      :caption="getMeritosByType(tipo.id).length + ' registros'"
                      default-opened
                    >
                      <div class="q-pa-md">
                        <div v-for="(merito, mIdx) in getMeritosByType(tipo.id)" :key="mIdx" class="q-mb-lg border border-purple-100 rounded-2xl q-pa-md relative bg-gray-50/20">
                          <div class="flex items-center justify-between q-mb-md">
                            <div class="text-[10px] font-black text-purple-800 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full">
                              Registro #{{ mIdx + 1 }}
                            </div>
                            <q-btn flat round dense color="negative" icon="delete" size="xs" @click="removeMerito(mIdx, tipo.id)">
                              <q-tooltip>Remover este bloque</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="row q-col-gutter-md">
                            <div v-for="campo in getNormalizedCampos(tipo.campos)" :key="campo.key" class="col-12 col-md-6">
                              <q-select v-if="campo.tipo === 'select'" v-model="merito.respuestas[campo.key]" :label="campo.label" :options="campo.opciones" outlined dense emit-value map-options bg-color="white" />
                              <q-input v-else-if="campo.tipo === 'date'" v-model="merito.respuestas[campo.key]" :label="campo.label" type="date" outlined dense stack-label bg-color="white" />
                              <q-input v-else v-model="merito.respuestas[campo.key]" :label="campo.label" outlined dense bg-color="white" class="uppercase-input" />
                            </div>

                            <div class="col-12 q-mt-md">
                              <div class="text-[9px] font-black text-teal-700 uppercase mb-2 tracking-widest text-center">Archivos de Respaldo</div>
                              <div class="row q-col-gutter-sm justify-center">
                                <div v-for="arc in getNormalizedArchivos(tipo.config_archivos)" :key="arc.key" class="col-12 col-md-6">
                                  <div class="flex items-center gap-2 mb-1 justify-center">
                                    <span class="text-[10px] text-teal-900 font-bold uppercase truncate">{{ arc.label }}</span>
                                    <q-icon v-if="getExistingFile(merito, arc.key)" name="check_circle" color="green" size="xs" />
                                  </div>
                                  <q-file v-model="merito.newFiles[arc.key]" :label="merito.newFiles[arc.key] ? '' : 'Subir ' + arc.label" outlined dense bg-color="white" accept=".pdf,image/*" max-file-size="2097152" @rejected="onRejected">
                                    <template v-slot:prepend><q-icon name="upload_file" size="xs" /></template>
                                  </q-file>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="flex justify-center q-mt-md">
                          <q-btn outline color="primary" icon="add" label="Añadir otro registro en esta categoría" class="rounded-xl px-6" @click="addMerito(tipo)" />
                        </div>
                      </div>
                    </q-expansion-item>
                 </div>

                 <div v-if="visibleTipos.length === 0" class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <q-icon name="post_add" size="80px" color="grey-3" />
                    <div class="text-grey-5 font-black uppercase tracking-tighter q-mt-md">Pulsa el selector de arriba para añadir méritos</div>
                 </div>

                 <div class="flex justify-between q-mt-xl">
                    <q-btn flat label="Volver a Mis Datos" color="grey-7" @click="activeTab = 'personal'" />
                    <q-btn label="Finalizar y Guardar Todo" color="teal-7" unelevated class="px-10 py-3 rounded-xl font-black text-white shadow-lg shadow-teal-200" @click="handleSubmit" :loading="saving" />
                 </div>
              </q-tab-panel>
           </q-tab-panels>
        </div>
      </q-card>
    </main>

    <q-inner-loading :showing="saving" style="background: rgba(255,255,255,0.8); z-index: 9999">
       <q-spinner-tail size="80px" color="teal" />
       <div class="text-teal font-black mt-4 uppercase tracking-widest animate-pulse text-lg">Guardando Expediente Digital...</div>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const verified = ref(false)
const verifying = ref(false)
const postulanteExists = ref(false)
const saving = ref(false)
const activeTab = ref('personal')

const form = ref({
  ci: '',
  email_verification: '',
  nombres: '',
  apellidos: '',
  email: '',
  email_institucional: '',
  celular: '',
  sede_id: null,
  nacionalidad: 'Boliviana',
  direccion_domicilio: '',
  clasificacion: 'ADMINISTRATIVO',
  ci_expedido: 'CB',
  ref_personal_celular: '',
  ref_personal_parentesco: ''
})

const files = ref({
  cv_pdf: null,
  ci_archivo: null,
  foto_perfil: null
})

const existingFiles = ref({
  cv_pdf: null,
  ci_archivo: null,
  foto_perfil: null
})

const meritos = ref([])
const tiposDocumento = ref([])
const sedesOptions = ref([])
const baseUrl = process.env.VUE_APP_API_URL || 'http://localhost:8000'

const getFileUrl = (path) => {
   if (!path) return ''
   if (path.startsWith('http')) return path
   return `${baseUrl}/storage/${path}`
}

onMounted(async () => {
   const [resDocs, resSedes] = await Promise.all([
      api.get('/portal/tipos-documento'),
      api.get('/portal/sedes')
   ])
   // Normalize types
   tiposDocumento.value = resDocs.data.map(t => ({
      ...t,
      campos: typeof t.campos === 'string' ? JSON.parse(t.campos) : t.campos,
      config_archivos: typeof t.config_archivos === 'string' ? JSON.parse(t.config_archivos) : t.config_archivos
   }))
   sedesOptions.value = resSedes.data
})

// Tipos que ya tienen algún mérito agregado para mostrar en la lista
const visibleTipos = computed(() => {
   return tiposDocumento.value.filter(t =>
      meritos.value.some(m => m.tipo_documento_id === t.id)
   )
})

const getNormalizedCampos = (campos) => {
   if (!Array.isArray(campos)) return []
   return campos.map((c, i) => ({
      ...c,
      key: c.key || c.id || c.name || `campo_${i}`,
      label: c.label || c.nombre || c.name || `Campo ${i + 1}`,
      tipo: c.tipo || c.type || 'text',
      opciones: c.opciones || c.options || []
   }))
}

const getNormalizedArchivos = (archivos) => {
   if (!Array.isArray(archivos)) return []
   return archivos.map((a, i) => ({
      ...a,
      key: a.id || a.key || `file_${i}`,
      label: a.label || a.nombre || a.name || `Archivo ${i + 1}`
   }))
}

const getExistingFile = (merito, configKey) => {
   if (!merito.archivos) return null
   return merito.archivos.find(a => a.config_archivo_id == configKey)?.archivo_path
}

const checkIdentity = async () => {
   if (!form.value.ci) return
   verifying.value = true
   try {
      const { data } = await api.post('/portal/verificar', { ci: form.value.ci })
      postulanteExists.value = data.exists
   } catch (error) {
      console.error(error)
   } finally {
      verifying.value = false
   }
}

const verifyFullIdentity = async () => {
   if (!form.value.email_verification) {
      $q.notify({ type: 'warning', message: 'Ingresa tu correo para verificar tu identidad' })
      return
   }
   verifying.value = true
   try {
      const { data } = await api.post('/portal/verificar', { ci: form.value.ci, email: form.value.email_verification })
      verified.value = true
      $q.notify({ type: 'positive', message: 'Bienvenido de nuevo' })

      const p = data.data
      form.value.nombres = p.nombres
      form.value.apellidos = p.apellidos
      form.value.email = p.email
      form.value.email_institucional = p.email_institucional
      form.value.celular = p.celular
      form.value.sede_id = p.sede_id
      form.value.nacionalidad = p.nacionalidad || 'Boliviana'
      form.value.direccion_domicilio = p.direccion_domicilio || ''
      form.value.clasificacion = p.clasificacion || 'ADMINISTRATIVO'
      form.value.ci_expedido = p.ci_expedido || 'CB'
      form.value.ref_personal_celular = p.ref_personal_celular || ''
      form.value.ref_personal_parentesco = p.ref_personal_parentesco || ''

      // Load existing main files
      existingFiles.value.cv_pdf = p.cv_pdf_path
      existingFiles.value.ci_archivo = p.ci_archivo_path
      existingFiles.value.foto_perfil = p.foto_perfil_path

      if (p.meritos) {
         meritos.value = p.meritos.map(m => ({
            id: m.id,
            tipo_documento_id: m.tipo_documento_id,
            respuestas: typeof m.respuestas === 'string' ? JSON.parse(m.respuestas) : (m.respuestas || {}),
            newFiles: {},
            archivos: m.archivos || []
         }))
      }
   } catch (err) {
      $q.notify({ type: 'negative', message: err.response?.data?.message || 'Error de verificación' })
   } finally {
      verifying.value = false
   }
}

const startNew = () => {
   verified.value = true
}

const getMeritosByType = (id) => meritos.value.filter(m => m.tipo_documento_id === id)

const addMerito = (tipo) => {
   meritos.value.push({
      id: null,
      tipo_documento_id: tipo.id,
      respuestas: {},
      newFiles: {}
   })
   activeTab.value = 'documentos'
   $q.notify({
      type: 'info',
      message: `Se añadió sección: ${tipo.nombre}`,
      position: 'bottom-right',
      timeout: 1000
   })
}

const removeMerito = (index, typeId) => {
   const subset = getMeritosByType(typeId)
   const item = subset[index]
   const mainIdx = meritos.value.indexOf(item)
   if (mainIdx > -1) meritos.value.splice(mainIdx, 1)
}

const handleSubmit = async () => {
   saving.value = true
   try {
      const fd = new FormData()
      Object.keys(form.value).forEach(k => fd.append(k, form.value[k] || ''))
      Object.keys(files.value).forEach(k => {
         if (files.value[k]) fd.append(k, files.value[k])
      })

      meritos.value.forEach((m, idx) => {
         if (m.id) fd.append(`meritos[${idx}][id]`, m.id)
         fd.append(`meritos[${idx}][tipo_documento_id]`, m.tipo_documento_id)
         fd.append(`meritos[${idx}][respuestas]`, JSON.stringify(m.respuestas))

         Object.keys(m.newFiles).forEach(fKey => {
            if (m.newFiles[fKey] instanceof File) {
               fd.append(`meritos[${idx}][archivos][${fKey}]`, m.newFiles[fKey])
            }
         })
      })

      const { data } = await api.post('/portal/registrar-directo', fd, {
         headers: { 'Content-Type': 'multipart/form-data' }
      })

      $q.notify({
         type: 'positive',
         message: '¡Hoja de Vida Guardada Exitosamente!',
         position: 'top'
      })

      const p = data.postulante

      // Refresh main files state
      existingFiles.value.cv_pdf = p.cv_pdf_path
      existingFiles.value.ci_archivo = p.ci_archivo_path
      existingFiles.value.foto_perfil = p.foto_perfil_path

      if (p.meritos) {
         meritos.value = p.meritos.map(m => ({
            id: m.id,
            tipo_documento_id: m.tipo_documento_id,
            respuestas: typeof m.respuestas === 'string' ? JSON.parse(m.respuestas) : (m.respuestas || {}),
            newFiles: {},
            archivos: m.archivos || []
         }))
      }
   } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Error al guardar los datos' })
   } finally {
      saving.value = false
   }
}

const onRejected = (entries) => {
   entries.forEach(e => {
      if (e.failedPropValidation === 'max-file-size') {
         $q.notify({ type: 'negative', message: `El archivo ${e.file.name} excede el límite de 2MB` })
      }
   })
}
</script>

<style scoped>
.portal-root { background-color: #f8fafc; }
.portal-bg-pattern {
  position: fixed; inset: 0; opacity: 0.05;
  background-image: radial-gradient(#4a2371 1px, transparent 1px);
  background-size: 25px 25px;
}
.portal-header { border-radius: 0 0 40px 40px; }
.uppercase-input :deep(input) { text-transform: uppercase; }
</style>
