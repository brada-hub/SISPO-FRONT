<template>
  <div class="px-2 py-6 md:px-6">
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 w-full mx-auto overflow-hidden">
      <!-- HEADER INDICATOR -->
      <div class="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-100 flex items-center justify-between">
         <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revisión y Envío Final</div>
         <div class="flex gap-1">
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
            <div class="w-10 h-1 bg-primary rounded-full"></div>
         </div>
      </div>

      <div class="p-8 space-y-10">
        <!-- CARGOS SELECTED & PER-CARGO DETAILS -->
        <q-form ref="confirmForm" @submit.prevent="handleSubmit" @validation-error="onValidationError" class="space-y-8">
          <div class="rounded-3xl shadow-sm overflow-hidden bg-white border border-gray-100 group">
            <div class="bg-gradient-to-r from-[#4a2371] to-[#663399] px-8 py-6 text-white flex items-center justify-between">
               <div class="flex items-center gap-4">
                  <div class="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                     <q-icon name="work" size="md" />
                  </div>
                  <div>
                    <div class="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Cargos Seleccionados</div>
                    <div class="text-xl font-black uppercase tracking-tighter">{{ cargosSeleccionados.length }} Posiciones</div>
                  </div>
               </div>
               <q-btn flat round icon="edit" color="white" class="bg-white/5" @click="goToStep(1)" />
            </div>

            <div class="p-8 space-y-6">
              <div v-for="cargo in cargosSeleccionados" :key="cargo.oferta_id"
                class="p-6 bg-gray-50/50 rounded-[32px] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:border-primary/20 group/item"
              >
                <div class="flex flex-col lg:flex-row gap-8">
                  <!-- Cargo Basic Info -->
                  <div class="lg:w-1/3">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                        <q-icon name="check" size="xs" />
                      </div>
                      <div>
                        <div class="font-black text-gray-900 uppercase text-sm leading-tight">{{ cargo.cargo_nombre }}</div>
                        <div class="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Sede: {{ cargo.sede_nombre }}</div>
                      </div>
                    </div>
                    <p class="text-[11px] text-gray-400 font-medium leading-relaxed italic">
                      Por favor, especifica tus expectativas para esta posición en particular.
                    </p>
                  </div>

                  <!-- Per-Cargo Inputs -->
                  <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    <q-input
                      v-model.number="cargo.pretension_salarial"
                      label="PRETENSIÓN SALARIAL (Bs.) *"
                      type="number"
                      outlined
                      stack-label
                      bg-color="white"
                      class="custom-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      @keydown="e => ['-','+','e','E'].includes(e.key) && e.preventDefault()"
                      :rules="[
                        val => (val !== null && val !== undefined && val !== '') || 'Requerido',
                        val => val >= 0 || 'Inválido'
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="payments" color="primary" />
                      </template>
                      <template v-slot:hint v-if="cargo.pretension_salarial > 0">
                        <span class="text-primary font-bold">{{ formatMoney(cargo.pretension_salarial) }}</span>
                      </template>
                    </q-input>

                    <q-input
                      v-model="cargo.porque_cargo"
                      label="¿POR QUÉ ESTE CARGO? *"
                      placeholder="Cuentanos tu motivación específica..."
                      outlined
                      stack-label
                      bg-color="white"
                      class="custom-input"
                      type="textarea"
                      rows="2"
                      maxlength="1000"
                      counter
                      :rules="[val => !!val || 'Requerido']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="psychology" color="primary" size="xs" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PERSONAL & REFERENCES -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- PERSONAL -->
            <section class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div class="flex items-center justify-between mb-8">
                 <div class="flex items-center gap-3">
                    <div class="p-2 bg-indigo-50 rounded-lg text-indigo-700">
                       <q-icon name="person_outline" size="sm" />
                    </div>
                    <div class="text-sm font-black text-gray-800 uppercase tracking-tight">Datos Generales</div>
                 </div>
                 <q-btn flat round icon="edit" color="primary" size="sm" @click="goToStep(2)" />
              </div>

              <div class="space-y-4">
                 <div class="flex flex-col">
                    <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</span>
                    <span class="font-bold text-gray-800">{{ datos.nombres }} {{ datos.apellidos }}</span>
                 </div>
                 <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                       <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Documento</span>
                       <span class="font-bold text-gray-800">{{ datos.ci }} {{ datos.ci_expedido }}</span>
                    </div>
                    <div class="flex flex-col">
                       <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nacionalidad</span>
                       <span class="font-bold text-gray-800">{{ datos.nacionalidad }}</span>
                    </div>
                 </div>
                 <div class="flex flex-col">
                    <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email</span>
                    <span class="font-bold text-gray-800">{{ datos.email || '—' }}</span>
                 </div>
                 <div class="flex flex-col">
                    <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Teléfono</span>
                    <span class="font-bold text-gray-800">{{ datos.celular }}</span>
                 </div>
              </div>

              <div class="mt-8 pt-6 border-t border-dashed flex flex-wrap gap-2">
                 <q-chip v-if="datos.ci_archivo" icon="badge" color="indigo-6" text-color="white" size="sm">Digital CI</q-chip>
                 <q-chip v-if="datos.cv_pdf" icon="description" color="primary" text-color="white" size="sm">Curriculum</q-chip>
                 <q-chip v-if="datos.carta_postulacion" icon="mail" color="primary" text-color="white" size="sm">Carta</q-chip>
              </div>
            </section>

            <!-- REFERENCES -->
            <section class="bg-gray-50/50 rounded-3xl border border-dashed border-gray-300 p-8">
              <div class="flex items-center gap-3 mb-8">
                 <div class="p-2 bg-teal-50 rounded-lg text-teal-700">
                    <q-icon name="contacts" size="sm" />
                 </div>
                 <div class="text-sm font-black text-gray-800 uppercase tracking-tight">Referencias</div>
              </div>

              <div class="space-y-8">
                 <div>
                    <div class="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">Referencia Personal</div>
                    <div class="font-bold text-gray-800">{{ datos.ref_personal_celular }}</div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase">{{ datos.ref_personal_parentesco }}</div>
                 </div>
                 <div>
                    <div class="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">Referencia Laboral</div>
                    <div class="font-bold text-gray-800">{{ datos.ref_laboral_celular }}</div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase italic">{{ datos.ref_laboral_detalle }}</div>
                 </div>
              </div>
            </section>
          </div>

          <!-- MERITOS SUMMARY -->
          <div v-if="meritos.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div class="flex items-center justify-between mb-8">
               <div class="flex items-center gap-3">
                  <div class="p-2 bg-orange-50 rounded-lg text-orange-700">
                     <q-icon name="folder_zip" size="sm" />
                  </div>
                  <div class="text-sm font-black text-gray-800 uppercase tracking-tight">Expediente de Méritos</div>
               </div>
               <q-btn flat round icon="edit" color="primary" size="sm" @click="goToStep(3)" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="merito in meritos" :key="merito.tipo_documento_id" class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                 <div class="flex items-center gap-3">
                    <q-icon name="task_alt" color="teal" />
                    <div>
                       <div class="text-[11px] font-bold text-gray-800 uppercase leading-none">{{ merito.nombre }}</div>
                       <div class="text-[9px] text-gray-400 font-bold uppercase mt-1">
                         {{ merito.registros.length }} Registro(s) cargados
                       </div>
                    </div>
                 </div>
                 <span class="text-[10px] bg-white px-3 py-1 rounded-full border text-teal-600 font-black">LISTO</span>
              </div>
            </div>
          </div>

          <!-- DECLARATION & ACTION -->
          <div class="mt-12 space-y-8">
            <div class="bg-[#663399]/5 border border-[#663399]/10 p-6 rounded-3xl flex items-start gap-4">
               <q-checkbox v-model="acceptTerms" color="primary" class="q-pa-none" />
               <div class="text-xs text-gray-600 font-medium leading-relaxed">
                 Declaro bajo juramento que toda la información y documentación proporcionada es verídica y fidedigna.
                 Autorizo a <strong>UNITEPC</strong> para realizar las verificaciones necesarias en el marco de este proceso de selección.
               </div>
            </div>

            <div class="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t">
              <q-btn flat label="ATRÁS" icon="arrow_back" color="grey-7" class="rounded-xl px-4" @click="$emit('back')" />
              <q-btn
                :label="`ENVIAR POSTULACIÓN (${cargosSeleccionados.length})`"
                icon-right="send"
                color="primary"
                unelevated
                class="rounded-xl px-12 h-16 font-black shadow-lg flex-grow md:flex-grow-0"
                :loading="store.submitting"
                type="submit"
              />
            </div>
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const emit = defineEmits(['back', 'submit'])
const store = usePostulacionStore()
const confirmForm = ref(null)

const acceptTerms = ref(false)

const cargosSeleccionados = computed(() => store.cargosSeleccionados)
const datos = computed(() => store.datosPersonales)
const meritos = computed(() => store.meritos)

const formatMoney = (val) => {
  if (!val) return 'Bs. 0.00'
  return 'Bs. ' + Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const goToStep = (step) => {
  store.currentStep = step
}

const handleSubmit = () => {
  if (!acceptTerms.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe aceptar la declaración jurada para continuar',
      position: 'top',
      icon: 'gavel'
    })
    return
  }
  emit('submit')
}

const onValidationError = () => {
  $q.notify({
    type: 'negative',
    message: 'Por favor, complete los sueldos pretendidos y motivos de postulación para cada cargo',
    position: 'top',
    icon: 'error_outline'
  })

  // Pequeño delay para que Quasar renderice los estados de error y luego scroll
  setTimeout(() => {
    const el = document.querySelector('.q-field--error')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}
</script>

<style scoped>
/* Estilos adicionales si fueran necesarios */
</style>
