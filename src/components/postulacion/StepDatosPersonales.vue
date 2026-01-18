<template>
  <div class="px-2 py-6 md:px-6">
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 w-full mx-auto overflow-hidden">
      <!-- HEADER INDICATOR (Visual simple para separar secciones) -->
      <div class="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-100 flex items-center justify-between">
         <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Información del Postulante</div>
         <div class="flex gap-1">
            <div class="w-10 h-1 bg-primary rounded-full"></div>
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
         </div>
      </div>

      <q-form
        ref="myForm"
        @submit.prevent="handleNext"
        @validation-error="onValidationError"
        scroll-to-first-error
        class="p-8 space-y-10"
      >

        <!-- 1. IDENTIFICACIÓN -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-indigo-50 rounded-xl">
               <q-icon name="badge" color="indigo-7" size="md" />
            </div>
            <div>
              <div class="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none">Identificación Oficial</div>
              <div class="text-xs text-gray-400 font-bold uppercase mt-1">Nombre y Documentos</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div class="md:col-span-2 lg:col-span-3 flex justify-center mb-4">
              <div class="text-center">
                <q-avatar size="140px" font-size="52px" color="teal-1" text-color="teal-7" class="shadow-xl border-4 border-white overflow-hidden">
                   <img v-if="fotoPreview" :src="fotoPreview" style="object-fit: cover; width: 100%; height: 100%;" />
                   <q-icon v-else name="person" />
                </q-avatar>
                <div class="mt-4 w-full max-w-xs mx-auto">
                  <q-file
                    v-model="form.foto_perfil"
                    label="FOTOGRAFÍA PERSONAL *"
                    outlined
                    dense
                    stack-label
                    accept="image/*"
                    @update:model-value="onFotoChange"
                    class="rounded-xl shadow-sm"
                    :rules="[val => !!val || 'Foto requerida']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="photo_camera" color="primary" />
                    </template>
                  </q-file>
                </div>
              </div>
            </div>

            <q-input
              v-model="form.nombres"
              label="NOMBRES *"
              placeholder="JUAN"
              outlined
              stack-label
              bg-color="gray-1"
              style="text-transform: uppercase"
              @update:model-value="val => form.nombres = val.toUpperCase()"
              :rules="[val => !!val || 'El nombre es obligatorio']"
            />
            <q-input
              v-model="form.apellidos"
              label="APELLIDOS *"
              placeholder="PÉREZ GARCÍA"
              outlined
              stack-label
              bg-color="gray-1"
              style="text-transform: uppercase"
              @update:model-value="val => form.apellidos = val.toUpperCase()"
              :rules="[val => !!val || 'Los apellidos son obligatorios']"
            />

            <div class="grid grid-cols-3 gap-0 border rounded-lg overflow-hidden border-gray-200">
               <q-input
                 v-model="form.ci"
                 label="NÚMERO CI *"
                 placeholder="0000000"
                 borderless
                 stack-label
                 class="col-span-2 px-3 border-r"
                 style="text-transform: uppercase"
                 @update:model-value="val => form.ci = val.toUpperCase()"
                 :rules="[val => !!val || 'CI requerido']"
               />
               <q-select
                 v-model="form.ci_expedido"
                 :options="expedidoOptions"
                 label="DEP."
                 borderless
                 stack-label
                 emit-value
                 map-options
                 class="px-2"
               />
            </div>

            <q-file
              v-model="form.ci_archivo"
              label="ARCHIVO CI (PDF/JPG) *"
              outlined
              stack-label
              accept=".pdf,image/*"
              max-file-size="2097152"
              class="modern-file-input"
              :rules="[
                val => !!val || 'Adjunto requerido',
                val => !val || val.size <= 2097152 || 'El archivo no debe exceder los 2MB'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" color="primary" />
              </template>
            </q-file>

            <q-input v-model="form.nacionalidad" label="NACIONALIDAD" outlined stack-label placeholder="BOLIVIANA" style="text-transform: uppercase" @update:model-value="val => form.nacionalidad = val.toUpperCase()" />
            <q-input v-model="form.direccion_domicilio" label="DIRECCIÓN DE DOMICILIO" outlined stack-label placeholder="CALLE, AV, ZONA..." style="text-transform: uppercase" @update:model-value="val => form.direccion_domicilio = val.toUpperCase()" />

            <q-input
               v-model="form.celular"
               label="TELÉFONO DE CONTACTO *"
               outlined
               stack-label
               placeholder="70000000"
               mask="########"
               :rules="[val => !!val || 'Contacto requerido']"
            />
            <q-input v-model="form.email" label="CORREO ELECTRÓNICO" type="email" outlined stack-label placeholder="usuario@ejemplo.com" />
          </div>
        </section>

        <!-- 2. REFERENCIAS -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-teal-50 rounded-xl">
               <q-icon name="people" color="teal-7" size="md" />
            </div>
            <div>
              <div class="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none">Contactos de Referencia</div>
              <div class="text-xs text-gray-400 font-bold uppercase mt-1">Validación de Perfil</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-gray-50/50 p-6 rounded-3xl border border-dashed border-gray-200 space-y-4">
              <div class="flex items-center gap-2 mb-2">
                 <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                 <div class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Referencia Personal</div>
              </div>
              <q-input
                v-model="form.ref_personal_celular"
                label="NÚMERO CELULAR *"
                mask="########"
                unmasked-value
                outlined dense stack-label bg-color="white"
                :rules="[val => !!val || 'Celular requerido', val => val.length >= 7 || 'Mínimo 7 dígitos']"
              />
              <q-input v-model="form.ref_personal_parentesco" label="PARENTESCO" outlined dense stack-label bg-color="white" placeholder="EJ: HERMANO, AMIGO..." style="text-transform: uppercase" @update:model-value="val => form.ref_personal_parentesco = val.toUpperCase()" />
            </div>

            <div class="bg-gray-50/50 p-6 rounded-3xl border border-dashed border-gray-200 space-y-4">
              <div class="flex items-center gap-2 mb-2">
                 <div class="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                 <div class="text-[10px] font-black text-teal-500 uppercase tracking-widest">Referencia Laboral</div>
              </div>
              <q-input
                v-model="form.ref_laboral_celular"
                label="NÚMERO CELULAR *"
                mask="########"
                unmasked-value
                outlined dense stack-label bg-color="white"
                :rules="[val => !!val || 'Celular requerido', val => val.length >= 7 || 'Mínimo 7 dígitos']"
              />
              <q-input
                v-model="form.ref_laboral_detalle"
                label="EMPRESA / RELACIÓN"
                placeholder="EJ: EX-JEFE EN BANCO UNIÓN"
                type="textarea"
                rows="2"
                outlined
                dense
                stack-label
                bg-color="white"
                style="text-transform: uppercase"
                @update:model-value="val => form.ref_laboral_detalle = val.toUpperCase()"
              />
            </div>
          </div>
        </section>

        <!-- 3. DOCUMENTOS BASE -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-warning/10 rounded-xl">
               <q-icon name="folder_zip" color="orange-8" size="md" />
            </div>
            <div>
              <div class="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none">Documentación Base</div>
              <div class="text-xs text-gray-400 font-bold uppercase mt-1">Archivos Imprescindibles</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="modern-upload-group">
              <q-file
                v-model="form.cv_pdf"
                label="CURRICULUM VITAE (PDF) *"
                outlined
                stack-label
                accept=".pdf"
                max-file-size="2097152"
                class="现代-file"
                :rules="[
                  val => !!val || 'El CV es obligatorio',
                  val => !val || val.size <= 2097152 || 'El archivo no debe exceder los 2MB'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="primary" />
                </template>
              </q-file>
              <div class="text-[10px] text-gray-400 font-bold mt-2 uppercase">Formato PDF • Máx 2 MB</div>
            </div>

            <div class="modern-upload-group">
              <q-file
                v-model="form.carta_postulacion"
                label="CARTA DE POSTULACIÓN (PDF) *"
                outlined
                stack-label
                accept=".pdf"
                max-file-size="2097152"
                :rules="[
                  val => !!val || 'La carta es obligatoria',
                  val => !val || val.size <= 2097152 || 'El archivo no debe exceder los 2MB'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="mail" color="primary" />
                </template>
              </q-file>
              <div class="text-[10px] text-gray-400 font-bold mt-2 uppercase">Formato PDF • Máx 2 MB</div>
            </div>
          </div>
        </section>

        <!-- NAVIGATION -->
        <div class="flex justify-between items-center pt-10 border-t">
          <q-btn flat label="ATRÁS" icon="arrow_back" color="grey-7" class="rounded-xl px-4" @click="$emit('back')" />
          <q-btn
             type="submit"
             label="GUARDAR Y CONTINUAR"
             icon-right="arrow_forward"
             color="primary"
             unelevated
             class="rounded-2xl px-10 h-14 font-black shadow-xl shadow-primary/20"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import { useQuasar } from 'quasar'

const emit = defineEmits(['next', 'back'])
const store = usePostulacionStore()

const expedidoOptions = [
  { label: 'LP', value: 'LP' },
  { label: 'CB', value: 'CB' },
  { label: 'SC', value: 'SC' },
  { label: 'OR', value: 'OR' },
  { label: 'PT', value: 'PT' },
  { label: 'CH', value: 'CH' },
  { label: 'TJ', value: 'TJ' },
  { label: 'BE', value: 'BE' },
  { label: 'PA', value: 'PA' },
]

const form = reactive({ ...store.datosPersonales })
const fotoPreview = ref(null)

const onFotoChange = (val) => {
  if (val) {
    fotoPreview.value = URL.createObjectURL(val)
  } else {
    fotoPreview.value = null
  }
}

// Initialize preview if store already has a file (unlikely to have URL, but for safety)
if (form.foto_perfil instanceof File) {
  fotoPreview.value = URL.createObjectURL(form.foto_perfil)
}

// Sync form with store on changes
watch(form, (newVal) => {
  store.updateDatosPersonales(newVal)
}, { deep: true })

const $q = useQuasar()
const myForm = ref(null)

const handleNext = () => {
  // El evento submit solo se dispara si la validación de Quasar pasa
  store.updateDatosPersonales(form)
  emit('next')
}

const onValidationError = () => {
  $q.notify({
    type: 'negative',
    message: 'Por favor, revise los campos marcados en rojo',
    position: 'top'
  })

  setTimeout(() => {
    const el = document.querySelector('.q-field--error')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}
</script>

<style scoped>
:deep(.q-field--outlined .q-field__control) {
  border-radius: 12px;
  background: #f8fafc;
}

:deep(.q-field--focused .q-field__control) {
  background: white;
  box-shadow: 0 4px 12px rgba(102, 51, 153, 0.08);
}

:deep(.q-field__label) {
  font-weight: 800;
  letter-spacing: 0.05em;
  font-size: 11px;
  color: #94a3b8;
}

.modern-file-input :deep(.q-field__control) {
  border-style: solid;
}
</style>
