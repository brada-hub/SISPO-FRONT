<template>
  <div class="space-y-10 relative">

    <!-- ITERATE OVER RECORDS (Instances) -->
    <div
      v-for="(reg, rIdx) in merito.registros"
      :key="rIdx"
      class="record-card bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden relative mb-10 last:mb-0"
    >
      <!-- RECORD HEADER / ACTIONS -->
      <div class="flex items-center justify-between px-6 py-4 bg-purple-50/30 border-b border-purple-100/50">
         <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#663399] to-[#009999] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-purple-200/50">
              {{ rIdx + 1 }}
            </div>
            <div>
              <div class="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#663399] to-[#009999] uppercase tracking-[0.2em] leading-none mb-1">Registro</div>
              <div class="text-sm font-black text-purple-900 uppercase tracking-tight">
                 Información del Mérito
              </div>
            </div>
         </div>

         <div class="flex items-center gap-2">
            <!-- DUPLICATE BUTTON -->
            <q-btn
              v-if="merito.permite_multiples"
              flat round dense color="teal" icon="content_copy" size="sm"
              @click="store.duplicarRegistroMerito(merito.tipo_documento_id, rIdx)"
            >
              <q-tooltip>Duplicar datos de este registro</q-tooltip>
            </q-btn>

            <!-- DELETE BUTTON -->
            <q-btn
              v-if="merito.registros.length > 1"
              flat round dense color="negative" icon="delete_sweep" size="sm"
              @click="store.eliminarRegistroMerito(merito.tipo_documento_id, rIdx)"
            >
              <q-tooltip>Eliminar este bloque</q-tooltip>
            </q-btn>
         </div>
      </div>

      <div class="p-8 space-y-8">
        <!-- 1. DYNAMIC TEXT FIELDS -->
        <div v-if="normalizedCampos.length > 0">
          <div class="text-[11px] font-black text-purple-700 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <q-icon name="history_edu" size="xs" color="purple" /> Información Requerida
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <div v-for="(campo, cIdx) in normalizedCampos" :key="cIdx" class="relative">
              <!-- REMAINS CLEAN WITHOUT REPETITIVE BADGES -->

              <!-- SELECT -->
              <q-select
                v-if="campo.tipo === 'select'"
                v-model="reg.respuestas[campo.key]"
                :label="campo.label + (campo.required ? ' *' : '')"
                :options="campo.opciones || []"
                outlined dense emit-value map-options
                :placeholder="campo.required ? 'Obligatorio' : ''"
                class="custom-field transition-all"
                :bg-color="reg.respuestas[campo.key] ? 'teal-50' : 'white'"
                :color="reg.respuestas[campo.key] ? 'teal' : 'primary'"
                :rules="campo.required ? [val => !!val || 'Este campo es obligatorio'] : []"
                lazy-rules
              >
                <template v-slot:append v-if="reg.respuestas[campo.key]">
                  <q-icon name="verified" color="teal" size="xs" />
                </template>
              </q-select>

              <!-- DATE -->
              <q-input
                v-else-if="campo.tipo === 'date'"
                v-model="reg.respuestas[campo.key]"
                :label="campo.label + (campo.required ? ' *' : '')"
                type="date" outlined dense stack-label
                class="custom-field transition-all"
                :bg-color="reg.respuestas[campo.key] ? 'teal-50' : 'white'"
                :color="reg.respuestas[campo.key] ? 'teal' : 'primary'"
                :rules="campo.required ? [val => !!val || 'Fecha requerida'] : []"
                lazy-rules
              >
                <template v-slot:append v-if="reg.respuestas[campo.key]">
                  <q-icon name="verified" color="teal" size="xs" />
                </template>
              </q-input>

              <!-- TEXTAREA -->
              <q-input
                v-else-if="campo.tipo === 'textarea'"
                v-model="reg.respuestas[campo.key]"
                :label="campo.label + (campo.required ? ' *' : '')"
                type="textarea" rows="3" outlined dense class="md:col-span-2 custom-field transition-all"
                :bg-color="reg.respuestas[campo.key] ? 'teal-50' : 'white'"
                :color="reg.respuestas[campo.key] ? 'teal' : 'primary'"
                style="text-transform: uppercase"
                @update:model-value="val => reg.respuestas[campo.key] = val.toUpperCase()"
                :rules="campo.required ? [val => !!val || 'Detalle obligatorio'] : []"
                lazy-rules
              >
                <template v-slot:append v-if="reg.respuestas[campo.key]">
                  <q-icon name="verified" color="teal" size="xs" />
                </template>
              </q-input>

              <!-- DEFAULT (TEXT/NUMBER) -->
              <q-input
                v-else
                v-model="reg.respuestas[campo.key]"
                :label="campo.label + (campo.required ? ' *' : '')"
                :type="campo.tipo === 'number' ? 'number' : 'text'"
                outlined dense
                class="custom-field transition-all"
                :bg-color="reg.respuestas[campo.key] ? 'teal-50' : 'white'"
                :color="reg.respuestas[campo.key] ? 'teal' : 'primary'"
                style="text-transform: uppercase"
                @update:model-value="val => reg.respuestas[campo.key] = val.toUpperCase()"
                :rules="campo.required ? [val => !!val || 'Campo obligatorio'] : []"
                lazy-rules
              >
                <template v-slot:append v-if="reg.respuestas[campo.key]">
                  <q-icon name="verified" color="teal" size="xs" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- 2. DYNAMIC FILE FIELDS -->
        <div v-if="normalizedArchivos.length > 0">
          <div class="text-[11px] font-black text-teal-700 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <q-icon name="auto_awesome_motion" size="xs" /> Documentos de Respaldo
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="(archivo, aIdx) in normalizedArchivos" :key="aIdx" class="file-dropzone p-5 rounded-2xl border-2 border-dashed border-teal-100 bg-teal-50/20">
              <div class="text-[10px] font-black text-teal-800 mb-3 flex justify-between uppercase tracking-wider">
                {{ archivo.label }}
              </div>
              <q-file
                v-model="reg.archivos[archivo.key]"
                :label="'Subir ' + archivo.label + (archivo.required ? ' *' : '')"
                outlined dense
                accept=".pdf,.jpg,.jpeg,.png"
                max-file-size="2097152"
                @rejected="onRejected"
                class="rounded-xl shadow-sm transition-all"
                :color="reg.archivos[archivo.key] ? 'teal' : 'primary'"
                :bg-color="reg.archivos[archivo.key] ? 'teal-50' : 'white'"
                :rules="archivo.required ? [val => !!val || 'El archivo es obligatorio'] : []"
                lazy-rules
              >
                <template v-slot:prepend>
                  <q-icon :name="reg.archivos[archivo.key] ? 'verified' : 'file_upload'" :color="reg.archivos[archivo.key] ? 'teal-7' : 'teal-7'" />
                </template>
                <template v-slot:file="{ file }">
                  <div class="text-teal-900 text-[11px] font-black italic truncate">{{ file.name }}</div>
                </template>
              </q-file>
              <div class="text-[9px] text-teal-400 mt-2 font-bold uppercase tracking-tighter">Formato: PDF/JPG/PNG • Máximo: 2MB</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD ANOTHER BUTTON (MINIMALIST) -->
    <div v-if="merito.permite_multiples" class="flex justify-center pt-4">
       <q-btn
         unelevated
         rounded
         icon="add"
         label="Añadir otro Registro"
         class="btn-gradient shadow-lg shadow-teal-200/50 px-10 py-3"
         @click="store.agregarRegistroMerito(merito.tipo_documento_id)"
       />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import { useQuasar } from 'quasar'

const props = defineProps({
  merito: {
    type: Object,
    required: true,
  }
})

const store = usePostulacionStore()
const $q = useQuasar()

const onRejected = (rejectedEntries) => {
  rejectedEntries.forEach(entry => {
    if (entry.failedPropValidation === 'max-file-size') {
      $q.notify({
        type: 'negative',
        message: 'El archivo de mérito excede el límite de 2MB.',
        caption: `Archivo: ${entry.file.name}`,
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

// Normalize campos to handle different data structures
const normalizedCampos = computed(() => {
  const campos = props.merito.campos || []
  if (Array.isArray(campos)) {
    return campos.map((c, i) => ({
      key: c.key || c.id || c.name || `campo_${i}`,
      label: c.label || c.nombre || c.name || `Campo ${i + 1}`,
      tipo: c.tipo || c.type || 'text',
      required: !props.merito.opcional && c.required !== false && c.requerido !== false && c.obligatorio !== false,
      opciones: c.opciones || c.options || [],
    }))
  }
  return []
})

// Normalize archivos to handle multiple file inputs per merit
const normalizedArchivos = computed(() => {
  const archivos = props.merito.config_archivos || []
  if (Array.isArray(archivos)) {
    return archivos.map((a, i) => ({
      key: a.id || a.key || `archivo_${i}`,
      label: a.label || a.nombre || a.name || `Archivo ${i + 1}`,
      required: !props.merito.opcional && !!(
        a.requerido || a.obligatorio || a.required || a.es_obligatorio ||
        a.config?.required || a.config?.requerido || a.config?.obligatorio ||
        a.requerido == 1 || a.requerido == '1' ||
        a.obligatorio == 1 || a.obligatorio == '1'
      ),
    }))
  }
  return []
})
</script>

<style scoped>
.record-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.record-card:hover {
  border-color: #66339944;
  box-shadow: 0 20px 40px -15px rgba(102, 51, 153, 0.08);
}

.custom-field :deep(.q-field__inner) {
  border-radius: 14px;
}

.file-dropzone {
  transition: all 0.3s ease;
}
.file-dropzone:hover {
  background: rgba(0, 153, 153, 0.08);
  border-color: #00999944;
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}

.btn-gradient {
  background: linear-gradient(135deg, #009999 0%, #663399 100%);
  color: white;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  transition: all 0.3s ease;
  border: none;
}
.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0, 153, 153, 0.4);
  filter: brightness(1.1);
}
</style>
