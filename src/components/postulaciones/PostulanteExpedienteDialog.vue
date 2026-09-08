<template>
  <q-dialog
    v-model="isOpen"
    maximized
    persistent
    transition-show="slide-left"
    transition-hide="slide-right"
    @keyup.escape="handleEscape"
  >
    <q-card class="bg-grey-2 flex flex-col no-wrap h-screen overflow-hidden">
      <!-- COMPACT TOP BAR -->
      <div class="flex items-center gap-3 bg-white border-b border-gray-200 px-4 no-print shrink-0" style="height: 52px; z-index: 10;">
        <q-btn flat round dense icon="close" size="sm" @click="closeDialog" title="Cerrar (ESC)" />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-black tracking-tight uppercase leading-none text-gray-800 truncate">
            {{ nameLabel }}
          </div>
          <div class="text-[10px] text-gray-400 font-medium">
            Expediente #{{ postulacionId }} • {{ cargoLabel }}
          </div>
        </div>

        <!-- Quick Score Badge -->
        <div v-if="scoreTotal !== null" class="flex items-center gap-2">
          <div class="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1 text-center">
            <div class="text-sm font-black text-indigo-700 leading-none">{{ scoreTotal }}</div>
            <div class="text-[8px] font-bold text-indigo-400 uppercase">Score</div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Nav buttons -->
          <q-btn
            v-if="hasPrev"
            flat round dense icon="arrow_back" size="sm" color="grey-7"
            @click="$emit('navigate', -1)" title="Anterior (← / K)"
          />
          <q-btn
            v-if="hasNext"
            flat round dense icon="arrow_forward" size="sm" color="grey-7"
            @click="$emit('navigate', 1)" title="Siguiente (→ / J)"
          />
          <q-separator vertical class="mx-1" />
          <q-btn-dropdown
            flat dense icon="picture_as_pdf" size="sm" color="deep-purple"
            label="PDF" no-caps
            :loading="generatingPDF"
          >
            <q-list style="min-width: 250px;">
              <q-item clickable v-close-popup @click="downloadPDF('cv')">
                <q-item-section avatar>
                  <q-icon name="description" color="deep-purple" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Hoja de Vida (Rápido)</q-item-label>
                  <q-item-label caption>CV oficial sin respaldos (~350 KB)</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="downloadPDF('full')">
                <q-item-section avatar>
                  <q-icon name="attach_file" color="teal" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Expediente Completo</q-item-label>
                  <q-item-label caption>Con todos los anexos fusionados</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

      <!-- MAIN 2-COLUMN LAYOUT -->
      <div class="flex-1 overflow-hidden relative">
        <ExpedienteDetail
          v-if="postulacionId"
          ref="detailComp"
          :postulacion-id="postulacionId"
        />
      </div>

      <!-- FASE 3 & 4: PERSISTENT STICKY ACTION BAR AT BOTTOM -->
      <div class="bg-white border-t border-gray-200 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between shrink-0 shadow-lg no-print z-50 gap-4">
        <!-- Keyboard shortcuts helper -->
        <div class="text-[10px] text-gray-400 font-black uppercase flex items-center gap-2 select-none">
          <span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">🎹 SHORTCUTS DISPONIBLES</span>
          <span class="hidden lg:inline">• <span class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-black">J (↓)</span> Siguiente</span>
          <span class="hidden lg:inline">• <span class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-black">K (↑)</span> Anterior</span>
          <span class="hidden lg:inline">• <span class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-black">A</span> Aprobar</span>
          <span class="hidden lg:inline">• <span class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-black">R</span> Rechazar</span>
          <span class="hidden lg:inline">• <span class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-black">E</span> Recalcular</span>
          <span class="hidden lg:inline">• <span class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-black">ESC</span> Cerrar</span>
        </div>

        <!-- Action triggers -->
        <div class="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <q-btn
            label="Aprobar"
            icon="check_circle"
            color="positive"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="$emit('decision', { id: postulacionId, action: 'aprobar', next: false })"
          />
          <q-btn
            label="Rechazar"
            icon="cancel"
            color="negative"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="$emit('decision', { id: postulacionId, action: 'rechazar', next: false })"
          />
          <q-btn
            label="Observar"
            icon="warning"
            color="warning"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="$emit('decision', { id: postulacionId, action: 'observar', next: false })"
          />
          <q-btn
            label="Recalcular"
            icon="refresh"
            color="info"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="$emit('evaluate', postulacionId)"
          />
          
          <q-separator vertical class="mx-1 hidden md:block" />

          <!-- Continuous decision workflows -->
          <q-btn
            label="Aprobar y Siguiente"
            icon="skip_next"
            color="teal-8"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="$emit('decision', { id: postulacionId, action: 'aprobar', next: true })"
          />
          <q-btn
            label="Rechazar y Siguiente"
            icon="skip_next"
            color="red-8"
            unelevated
            rounded
            size="sm"
            class="font-black px-4"
            @click="$emit('decision', { id: postulacionId, action: 'rechazar', next: true })"
          />
        </div>
      </div>

      <!-- HIDDEN PDF GENERATOR COMPONENT -->
      <ExpedientePDF
        ref="pdfExporter"
        :postulacion="postulacionData"
        :filtered-meritos="meritosData"
      />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import ExpedientePDF from 'components/ExpedientePDF.vue'
import ExpedienteDetail from 'components/admin/ExpedienteDetail.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  postulacionId: {
    type: [Number, String],
    default: null
  },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close', 'navigate', 'evaluate', 'decision'])

const $q = useQuasar()
const pdfExporter = ref(null)
const generatingPDF = ref(false)
const detailComp = ref(null)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const nameLabel = computed(() => {
  const p = postulacionData.value?.postulante
  if (p) return `${p.nombres} ${p.apellidos}`
  return 'Cargando...'
})

const cargoLabel = computed(() => {
  const o = postulacionData.value?.oferta
  if (o) return `${o.cargo?.nombre || ''} — ${o.sede?.nombre || ''}`
  return ''
})

const scoreTotal = computed(() => {
  const ev = postulacionData.value?.evaluacion
  if (ev?.score_total !== undefined) return Number(ev.score_total).toFixed(1)
  return null
})

const postulacionData = computed(() => detailComp.value?.postulacion || null)
const meritosData = computed(() => detailComp.value?.filteredMeritos || [])

const closeDialog = () => {
  emit('close')
}

const handleEscape = () => {
  closeDialog()
}

const downloadPDF = async (mode = 'cv') => {
  if (!pdfExporter.value) return
  generatingPDF.value = true
  try {
    await pdfExporter.value.generatePDF(mode)
    $q.notify({
      type: 'positive',
      message: mode === 'cv' ? 'Hoja de vida generada con éxito' : 'Expediente completo generado con éxito'
    })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar el PDF' })
  } finally {
    generatingPDF.value = false
  }
}

// FASE 8: KEYBOARD SHORTCUTS HANDLER
const handleKeyDown = (e) => {
  if (!isOpen.value) return

  // Skip keyboard shortcuts when recruiter is typing comments/observations
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return

  const key = e.key.toLowerCase()
  if (key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault()
    emit('navigate', 1)
  } else if (key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault()
    emit('navigate', -1)
  } else if (key === 'a') {
    e.preventDefault()
    emit('decision', { id: props.postulacionId, action: 'aprobar', next: true })
  } else if (key === 'r') {
    e.preventDefault()
    emit('decision', { id: props.postulacionId, action: 'rechazar', next: true })
  } else if (key === 'e') {
    e.preventDefault()
    emit('evaluate', props.postulacionId)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.shrink-0 {
  flex-shrink: 0;
}
</style>
