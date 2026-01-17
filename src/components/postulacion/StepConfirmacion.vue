<template>
  <div class="px-6 py-8">
    <div class="flex flex-col items-center mb-10">
      <div class="p-2 bg-teal-50 rounded-full mb-3">
        <q-icon name="verified" color="teal" size="lg" />
      </div>
      <h2 class="text-3xl font-black text-gray-800 tracking-tighter uppercase">Revisión Final</h2>
      <p class="text-gray-500 mt-1 font-medium">Verifica cuidadosamente tu información antes del envío oficial</p>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">

      <!-- CARGOS SELECTED -->
      <div class="rounded-3xl shadow-xl overflow-hidden bg-white border border-gray-100 group">
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

        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="cargo in cargosSeleccionados" :key="cargo.oferta_id" class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
             <div class="p-2 bg-white rounded-xl shadow-sm">
                <q-icon name="check_circle" color="teal" />
             </div>
             <div>
               <div class="font-black text-gray-800 uppercase text-xs truncate">{{ cargo.cargo_nombre }}</div>
               <div class="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Sede: {{ cargo.sede_nombre }}</div>
             </div>
          </div>
        </div>
      </div>

      <!-- PERSONAL & REFERENCES -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- PERSONAL -->
        <section class="bg-white rounded-3xl border border-gray-100 shadow-lg p-8">
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
      <div v-if="meritos.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-lg p-8">
        <div class="flex items-center justify-between mb-8">
           <div class="flex items-center gap-3">
              <div class="p-2 bg-orange-50 rounded-lg text-orange-700">
                 <q-icon name="folder_zip" size="sm" />
              </div>
              <div class="text-sm font-black text-gray-800 uppercase tracking-tight">Expediente de Méritos</div>
           </div>
           <q-btn flat round icon="edit" color="primary" size="sm" @click="goToStep(3)" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            class="rounded-2xl px-12 h-16 font-black shadow-2xl shadow-primary/30 flex-grow md:flex-grow-0"
            :loading="store.submitting"
            :disable="!acceptTerms"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'

const emit = defineEmits(['back', 'submit'])
const store = usePostulacionStore()

const acceptTerms = ref(false)

const cargosSeleccionados = computed(() => store.cargosSeleccionados)
const datos = computed(() => store.datosPersonales)
const meritos = computed(() => store.meritos)

const goToStep = (step) => {
  store.currentStep = step
}

const handleSubmit = () => {
  emit('submit')
}
</script>
