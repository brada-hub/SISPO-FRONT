<template>
  <div class="px-2 py-6 md:px-6">
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 w-full mx-auto overflow-hidden">
      <!-- HEADER INDICATOR -->
      <div class="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-100 flex items-center justify-between">
         <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expediente de Méritos</div>
         <div class="flex gap-1">
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
            <div class="w-10 h-1 bg-primary rounded-full"></div>
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
         </div>
      </div>

      <q-form ref="myForm" @submit.prevent="handleNext" scroll-to-first-error @validation-error="onValidationError" class="p-8">

        <!-- SUMMARY OF SELECTED CARGOS -->
        <div class="mb-10 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
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

        <div v-else-if="meritos.length === 0" class="text-center py-24 w-full bg-white rounded-3xl border border-gray-100">
          <div class="p-6 bg-gray-50 rounded-full inline-block mb-6">
             <q-icon name="folder_off" size="80px" class="text-gray-300" />
          </div>
          <div class="text-2xl font-black text-gray-400 uppercase tracking-tighter">Sin requisitos adicionales</div>
          <p class="text-gray-400 mt-2 px-10">Tus convocatorias seleccionadas no exigen documentación de méritos adicionales.</p>
          <q-btn label="CONTINUAR A CONFIRMACIÓN" color="primary" unelevated class="mt-10 rounded-xl px-10 h-14 font-black" @click="$emit('next')" />
        </div>

        <div v-else class="space-y-12">
          <!-- SHARED REQUIREMENTS SECTION -->
          <div v-if="requisitosCompartidos.length > 0">
            <!-- SECTION DIVIDER -->
            <div class="section-breaker mt-4 mb-8">
              <div class="line"></div>
              <div class="content">
                <q-icon name="hub" size="xs" />
                <span>Bloque 1: Documentación General</span>
              </div>
              <div class="line"></div>
            </div>

            <div class="grid grid-cols-1 gap-8">
              <q-expansion-item
                v-for="merito in requisitosCompartidos"
                :key="merito.tipo_documento_id"
                header-class="merit-header-shared rounded-2xl bg-[#f0f9f9] border border-teal-100 shadow-sm transition-all"
                :expand-icon="merito.opcional ? 'add' : 'keyboard_arrow_down'"
                :expand-icon-class="merito.opcional ? 'text-teal scale-150' : 'text-teal'"
                :default-opened="!merito.opcional"
                class="rounded-2xl overflow-hidden shadow-md mb-4"
              >
                <template v-slot:header>
                  <q-item-section avatar>
                    <div class="p-2 bg-teal-100 rounded-lg text-teal-800 shadow-inner">
                       <q-icon :name="merito.opcional ? 'add_box' : 'folder_shared'" />
                    </div>
                  </q-item-section>
                  <q-item-section>
                    <div class="flex items-center gap-3">
                      <q-item-label class="font-black text-gray-800 uppercase tracking-tight text-lg">{{ merito.nombre }}</q-item-label>
                      <q-badge v-if="merito.opcional" color="teal-1" text-color="teal-7" label="OPCIONAL" class="font-black px-2 shadow-sm border border-teal-200" />
                      <q-badge v-else color="red" label="OBLIGATORIO" class="font-black px-2 shadow-sm" />
                    </div>
                    <q-item-label v-if="merito.descripcion" caption class="text-[10px] uppercase font-bold text-teal-600 italic leading-none mt-1">
                      {{ merito.descripcion }}
                    </q-item-label>
                  </q-item-section>
                </template>
                <q-card class="bg-white border-x border-b border-teal-50">
                  <q-card-section class="p-8">
                    <DynamicFormFields :merito="merito" />
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>

          <!-- UNIQUE REQUIREMENTS SECTION -->
          <div v-if="requisitosUnicos.length > 0">
            <!-- SECTION DIVIDER -->
            <div class="section-breaker mt-14 mb-8">
              <div class="line"></div>
              <div class="content text-indigo-700">
                <q-icon name="assignment_turned_in" size="xs" />
                <span>Bloque 2: Requisitos Específicos por Cargo</span>
              </div>
              <div class="line"></div>
            </div>

            <div class="grid grid-cols-1 gap-8">
              <q-expansion-item
                v-for="merito in requisitosUnicos"
                :key="merito.tipo_documento_id"
                header-class="merit-header-unique rounded-2xl bg-[#f5f3ff] border border-indigo-100 shadow-sm transition-all"
                :expand-icon="merito.opcional ? 'add' : 'keyboard_arrow_down'"
                :expand-icon-class="merito.opcional ? 'text-primary scale-150 rotate-0' : 'text-primary'"
                :default-opened="!merito.opcional"
                class="rounded-2xl overflow-hidden shadow-md mb-4"
              >
                <template v-slot:header>
                  <q-item-section avatar>
                    <div class="p-2 bg-indigo-100 rounded-lg text-primary shadow-inner">
                       <q-icon :name="merito.opcional ? 'add_circle_outline' : 'star_border'" />
                    </div>
                  </q-item-section>
                  <q-item-section>
                    <div class="flex items-center gap-3">
                      <q-item-label class="font-black text-gray-800 uppercase tracking-tight text-lg">{{ merito.nombre }}</q-item-label>
                      <q-badge v-if="merito.opcional" color="indigo-1" text-color="indigo-7" label="OPCIONAL" class="font-black px-2 shadow-sm border border-indigo-200" />
                      <q-badge v-else color="red" label="OBLIGATORIO" class="font-black px-2 shadow-sm" />
                    </div>
                    <q-item-label v-if="merito.descripcion" caption class="text-[10px] uppercase font-bold text-indigo-400 italic leading-none mt-1">
                      {{ merito.descripcion }}
                    </q-item-label>
                  </q-item-section>
                </template>
                <q-card class="bg-white border-x border-b border-indigo-50">
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
              label="GUARDAR Y CONTINUAR"
              type="submit"
              color="primary"
              unelevated
              class="rounded-xl px-10 h-14 font-black w-full md:w-auto"
            />
          </div>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import DynamicFormFields from './DynamicFormFields.vue'

import { useQuasar } from 'quasar'

const $q = useQuasar()
const emit = defineEmits(['next', 'back'])
const store = usePostulacionStore()
const myForm = ref(null)

const handleNext = async () => {
  const success = await myForm.value.validate()

  if (!success) {
    onValidationError()
    return
  }

  // Validación manual de seguridad extra
  const faltyMerit = store.meritos.find(m => {
    // Si es opcional, verificar si se ha empezado a llenar
    if (m.opcional) {
      const hasAnyContent = m.registros.some(r => {
        const hasTextValue = Object.values(r.respuestas).some(v => v && String(v).trim() !== '')
        const hasFileValue = Object.values(r.archivos).some(v => v)
        return hasTextValue || hasFileValue
      })

      // Si es opcional y no tiene nada lleno, se ignora la validación para este mérito
      if (!hasAnyContent) return false
    }

    // Para exigidos o para opcionales con contenido, validar campos obligatorios
    return m.registros.some(r => {
      const isFieldRequired = (c) => c.required !== false && c.requerido !== false && c.obligatorio !== false && c.config?.required !== false && c.config?.requerido !== false

      const camposFaltantes = (m.campos || []).filter(isFieldRequired)
        .some((c, i) => {
           const key = c.key || c.id || c.name || `campo_${i}`
           const val = r.respuestas[key]
           return !val || (typeof val === 'string' && val.trim() === '')
        })

      const archivosFaltantes = (m.config_archivos || []).filter(isFieldRequired)
        .some((a, i) => {
           const key = a.id || a.key || `archivo_${i}`
           return !r.archivos[key]
        })

      return camposFaltantes || archivosFaltantes
    })
  })

  if (faltyMerit) {
    $q.notify({
      type: 'negative',
      message: `Debe completar la "Información Requerida" y los "Documentos de Respaldo" para: ${faltyMerit.nombre}`,
      position: 'top',
      icon: 'warning'
    })
    return
  }

  emit('next')
}

const onValidationError = () => {
  $q.notify({
    type: 'negative',
    message: 'Algunos méritos requieren su atención o archivos adjuntos',
    position: 'top'
  })

  setTimeout(() => {
    const el = document.querySelector('.q-field--error')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

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
.section-breaker {
  display: flex;
  align-items: center;
  gap: 20px;
}

.section-breaker .line {
  height: 2px;
  flex-grow: 1;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
}

.section-breaker .content {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 16px;
  border-radius: 99px;
  border: 1px solid #e2e8f0;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0d9488; /* teal-600 */
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

:deep(.merit-header-shared) {
  min-height: 90px;
  border-left: 10px solid #009999 !important;
}

:deep(.merit-header-unique) {
  min-height: 90px;
  border-left: 10px solid #663399 !important;
}

:deep(.q-expansion-item__container) {
  border-radius: 16px;
}
</style>
