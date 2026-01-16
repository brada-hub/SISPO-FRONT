<template>
  <div class="px-6 py-8">
    <div class="flex flex-col items-center mb-10">
      <div class="p-2 bg-primary/10 rounded-full mb-3">
        <q-icon name="assignment_ind" color="primary" size="lg" />
      </div>
      <h2 class="text-3xl font-black text-gray-800 tracking-tighter uppercase">Tu Perfil Particular</h2>
      <p class="text-gray-500 mt-1 font-medium">Ingresa tus datos base para el expediente oficial</p>
    </div>

    <div class="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto overflow-hidden">
      <!-- HEADER INDICATOR -->
      <div class="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-100 flex items-center justify-between">
         <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Información Requerida</div>
         <div class="flex gap-1">
            <div class="w-10 h-1 bg-primary rounded-full"></div>
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
         </div>
      </div>

      <q-form @submit.prevent="handleNext" class="p-8 space-y-10">

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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div class="col-12 flex justify-center mb-4">
              <div class="text-center">
                <q-avatar size="120px" font-size="52px" color="teal-1" text-color="teal-7" icon="person" class="shadow-lg border-4 border-white">
                   <img v-if="fotoPreview" :src="fotoPreview" />
                </q-avatar>
                <div class="mt-3">
                  <q-file
                    v-model="form.foto_perfil"
                    label="FOTOGRAFÍA PERSONAL *"
                    outlined
                    dense
                    stack-label
                    accept="image/*"
                    @update:model-value="onFotoChange"
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
              placeholder="Juan"
              outlined
              stack-label
              bg-color="gray-1"
              :rules="[val => !!val || 'El nombre es obligatorio']"
            />
            <q-input
              v-model="form.apellidos"
              label="APELLIDOS *"
              placeholder="Pérez García"
              outlined
              stack-label
              bg-color="gray-1"
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
              class="modern-file-input"
              :rules="[val => !!val || 'Adjunto requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" color="primary" />
              </template>
            </q-file>

            <q-input v-model="form.nacionalidad" label="NACIONALIDAD" outlined stack-label placeholder="Boliviana" />
            <q-input v-model="form.direccion_domicilio" label="DIRECCIÓN DE DOMICILIO" outlined stack-label placeholder="Calle, Av, Zona..." />

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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-gray-50/50 p-6 rounded-3xl border border-dashed border-gray-200 space-y-4">
              <div class="flex items-center gap-2 mb-2">
                 <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                 <div class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Referencia Personal</div>
              </div>
              <q-input v-model="form.ref_personal_celular" label="NÚMERO CELULAR" outlined dense stack-label bg-color="white" />
              <q-input v-model="form.ref_personal_parentesco" label="PARENTESCO" outlined dense stack-label bg-color="white" placeholder="Ej: Hermano, Amigo..." />
            </div>

            <div class="bg-gray-50/50 p-6 rounded-3xl border border-dashed border-gray-200 space-y-4">
              <div class="flex items-center gap-2 mb-2">
                 <div class="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                 <div class="text-[10px] font-black text-teal-500 uppercase tracking-widest">Referencia Laboral</div>
              </div>
              <q-input v-model="form.ref_laboral_celular" label="NÚMERO CELULAR" outlined dense stack-label bg-color="white" />
              <q-input
                v-model="form.ref_laboral_detalle"
                label="EMPRESA / RELACIÓN"
                placeholder="Ej: Ex-Jefe en Banco Unión"
                type="textarea"
                rows="2"
                outlined
                dense
                stack-label
                bg-color="white"
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="modern-upload-group">
              <q-file
                v-model="form.cv_pdf"
                label="CURRICULUM VITAE (PDF) *"
                outlined
                stack-label
                accept=".pdf"
                class="现代-file"
                :rules="[val => !!val || 'El CV es obligatorio']"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="primary" />
                </template>
              </q-file>
              <div class="text-[10px] text-gray-400 font-bold mt-2 uppercase">Formato PDF • Máx 10 MB</div>
            </div>

            <div class="modern-upload-group">
              <q-file
                v-model="form.carta_postulacion"
                label="CARTA DE POSTULACIÓN (PDF) *"
                outlined
                stack-label
                accept=".pdf"
                :rules="[val => !!val || 'La carta es obligatoria']"
              >
                <template v-slot:prepend>
                  <q-icon name="mail" color="primary" />
                </template>
              </q-file>
              <div class="text-[10px] text-gray-400 font-bold mt-2 uppercase">Formato PDF • Máx 5 MB</div>
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

const handleNext = () => {
  store.updateDatosPersonales(form)
  emit('next')
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
