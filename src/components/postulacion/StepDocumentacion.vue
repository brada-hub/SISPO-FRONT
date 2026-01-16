<template>
  <div class="px-6 py-8">
    <div class="flex flex-col items-center mb-10">
      <div class="p-2 bg-primary/10 rounded-full mb-3">
        <q-icon name="folder_special" color="primary" size="lg" />
      </div>
      <h2 class="text-3xl font-black text-gray-800 tracking-tighter uppercase">Expediente de Méritos</h2>
      <p class="text-gray-500 mt-1 font-medium">Adjunta la documentación necesaria según tus cargos seleccionados</p>
    </div>

    <!-- SUMMARY OF SELECTED CARGOS -->
    <div class="max-w-4xl mx-auto mb-10 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
       <div class="flex items-center gap-4">
          <div class="p-3 bg-indigo-50 rounded-xl text-primary">
             <q-icon name="shopping_basket" size="md" />
          </div>
          <div>
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Cargos en esta postulación</div>
            <div class="flex flex-wrap gap-2">
              <q-badge
                v-for="cargo in cargosSeleccionados"
                :key="cargo.oferta_id"
                color="indigo-1"
                text-color="primary"
                class="px-3 py-1 font-bold rounded-lg border border-indigo-100"
              >
                {{ cargo.cargo_nombre }}
              </q-badge>
            </div>
          </div>
       </div>
       <div class="h-10 w-[1px] bg-gray-100 hidden md:block"></div>
       <div class="text-right">
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Méritos</div>
          <div class="text-2xl font-black text-gray-800">{{ meritos.length }}</div>
       </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <q-spinner-dots size="80px" color="primary" />
      <div class="mt-4 text-primary font-black uppercase tracking-widest animate-pulse">Analizando Requisitos...</div>
    </div>

    <div v-else-if="meritos.length === 0" class="text-center py-24 max-w-xl mx-auto glass-stepper-container bg-white rounded-3xl border border-gray-100">
      <div class="p-6 bg-gray-50 rounded-full inline-block mb-6">
         <q-icon name="folder_off" size="80px" class="text-gray-300" />
      </div>
      <div class="text-2xl font-black text-gray-400 uppercase tracking-tighter">Sin requisitos adicionales</div>
      <p class="text-gray-400 mt-2 px-10">Tus convocatorias seleccionadas no exigen documentación de méritos adicionales.</p>
      <q-btn label="CONTINUAR A CONFIRMACIÓN" color="primary" unelevated class="mt-10 rounded-xl px-10 h-14 font-black" @click="$emit('next')" />
    </div>

    <div v-else class="space-y-12 max-w-4xl mx-auto">

      <!-- SHARED REQUIREMENTS SECTION -->
      <div v-if="requisitosCompartidos.length > 0">
        <div class="flex items-center justify-between mb-6 pb-2 border-b">
           <div class="flex items-center gap-3">
              <div class="p-2 bg-teal-50 rounded-lg">
                <q-icon name="share" color="teal-7" />
              </div>
              <div>
                <div class="text-lg font-black text-gray-800 uppercase tracking-tight">Méritos Comunes</div>
                <div class="text-xs text-teal-600 font-bold uppercase">Se solicitan una sola vez</div>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <q-expansion-item
            v-for="merito in requisitosCompartidos"
            :key="merito.tipo_documento_id"
            header-class="merit-header-shared rounded-2xl bg-white border border-gray-100 shadow-sm transition-all"
            expand-icon-class="text-teal"
            default-opened
            class="rounded-2xl overflow-hidden shadow-sm"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <div class="p-2 bg-teal-50 rounded-lg text-teal-700">
                   <q-icon name="folder_shared" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-black text-gray-800 uppercase tracking-tight">{{ merito.nombre }}</q-item-label>
                <q-item-label caption class="text-[9px] uppercase font-bold text-gray-400">Requerido por: {{ merito.usadoPor.join(', ') }}</q-item-label>
              </q-item-section>
            </template>
            <q-card class="bg-gray-50/50">
              <q-card-section class="p-8">
                <DynamicFormFields :merito="merito" />
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>

      <!-- UNIQUE REQUIREMENTS SECTION -->
      <div v-if="requisitosUnicos.length > 0">
        <div class="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
           <div class="flex items-center gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <q-icon name="assignment" color="primary" />
              </div>
              <div>
                <div class="text-lg font-black text-gray-800 uppercase tracking-tight">Méritos Específicos</div>
                <div class="text-xs text-primary font-bold uppercase">Por cada cargo seleccionado</div>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <q-expansion-item
            v-for="merito in requisitosUnicos"
            :key="merito.tipo_documento_id"
            header-class="merit-header-unique rounded-2xl bg-white border border-gray-100 shadow-sm"
            expand-icon-class="text-primary"
            default-opened
            class="rounded-2xl overflow-hidden shadow-sm"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <div class="p-2 bg-indigo-50 rounded-lg text-primary">
                   <q-icon name="folder" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-black text-gray-800 uppercase tracking-tight">{{ merito.nombre }}</q-item-label>
                <q-item-label caption class="text-[9px] uppercase font-bold text-gray-400">Exigido para: {{ merito.usadoPor[0] }}</q-item-label>
              </q-item-section>
            </template>
            <q-card class="bg-gray-50/50">
              <q-card-section class="p-8">
                <DynamicFormFields :merito="merito" />
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>

      <!-- NAVIGATION -->
      <div class="flex justify-between items-center pt-10 mt-10 border-t">
        <q-btn flat label="ATRÁS" icon="arrow_back" color="grey-7" class="rounded-xl px-4" @click="$emit('back')" />
        <q-btn
           label="REVISAR POSTULACIÓN"
           icon-right="arrow_forward"
           color="primary"
           unelevated
           class="rounded-2xl px-10 h-14 font-black shadow-xl shadow-primary/20"
           @click="$emit('next')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import DynamicFormFields from './DynamicFormFields.vue'

defineEmits(['next', 'back'])
const store = usePostulacionStore()

const loading = computed(() => store.loading)
const meritos = computed(() => store.meritos)
const cargosSeleccionados = computed(() => store.cargosSeleccionados)

// Separate shared vs unique requirements
const requisitosCompartidos = computed(() =>
  meritos.value.filter(m => m.compartido)
)

const requisitosUnicos = computed(() =>
  meritos.value.filter(m => !m.compartido)
)
</script>

<style scoped>
:deep(.merit-header-shared) {
  min-height: 80px;
  border-left: 6px solid #009999 !important;
}

:deep(.merit-header-unique) {
  min-height: 80px;
  border-left: 6px solid #663399 !important;
}

:deep(.q-expansion-item__container) {
  border-radius: 16px;
}
</style>

