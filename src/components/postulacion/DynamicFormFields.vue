<template>
  <div class="space-y-10 relative">
    <div v-if="merito.descripcion" class="text-xs text-gray-500 bg-blue-50/50 p-4 rounded-2xl italic border border-blue-100 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <q-icon name="help_outline" color="blue" />
        <span>{{ merito.descripcion }}</span>
      </div>
      <q-badge v-if="merito.permite_multiples" color="indigo-1" text-color="indigo-9" class="q-pa-sm rounded-lg border border-indigo-200 shrink-0">
        <q-icon name="layers" class="mr-1" /> Múltiplos Permitidos
      </q-badge>
    </div>

    <!-- Si no hay descripción pero sí permite múltiples, mostramos solo el badge elegantemente -->
    <div v-else-if="merito.permite_multiples" class="flex justify-end">
       <q-badge color="indigo-1" text-color="indigo-9" class="q-pa-sm rounded-lg border border-indigo-200">
         <q-icon name="layers" class="mr-1" /> Múltiplos Permitidos
       </q-badge>
    </div>

    <!-- ITERATE OVER RECORDS (Instances) -->
    <div
      v-for="(reg, rIdx) in merito.registros"
      :key="rIdx"
      class="record-card bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden relative"
    >
      <!-- RECORD HEADER / ACTIONS -->
      <div class="flex items-center justify-between px-6 py-4 bg-gray-50/80 border-b border-gray-100">
         <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg">
              {{ rIdx + 1 }}
            </div>
            <div class="text-xs font-black text-gray-600 uppercase tracking-widest">
               Instancia de Mérito
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
          <div class="text-[11px] font-black text-indigo-700 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <q-icon name="history_edu" size="xs" /> Información Requerida
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <div v-for="(campo, cIdx) in normalizedCampos" :key="cIdx">
              <!-- SELECT -->
              <q-select
                v-if="campo.tipo === 'select'"
                v-model="reg.respuestas[campo.key]"
                :label="campo.label"
                :options="campo.opciones || []"
                outlined dense bg-color="white" emit-value map-options
                :placeholder="campo.required ? 'Obligatorio' : ''"
                class="custom-field"
              />
              <!-- DATE -->
              <q-input
                v-else-if="campo.tipo === 'date'"
                v-model="reg.respuestas[campo.key]"
                :label="campo.label"
                type="date" outlined dense stack-label bg-color="white"
                class="custom-field"
              />
              <!-- TEXTAREA -->
              <q-input
                v-else-if="campo.tipo === 'textarea'"
                v-model="reg.respuestas[campo.key]"
                :label="campo.label"
                type="textarea" rows="3" outlined dense bg-color="white" class="md:col-span-2 custom-field"
                style="text-transform: uppercase"
                @update:model-value="val => reg.respuestas[campo.key] = val.toUpperCase()"
              />
              <!-- DEFAULT (TEXT/NUMBER) -->
              <q-input
                v-else
                v-model="reg.respuestas[campo.key]"
                :label="campo.label"
                :type="campo.tipo === 'number' ? 'number' : 'text'"
                outlined dense bg-color="white"
                class="custom-field"
                style="text-transform: uppercase"
                @update:model-value="val => reg.respuestas[campo.key] = val.toUpperCase()"
              />
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
                <q-badge v-if="archivo.required" color="red" class="q-px-sm" label="EXIGIDO" />
              </div>
              <q-file
                v-model="reg.archivos[archivo.key]"
                :label="'Pinche para subir ' + archivo.label"
                outlined dense bg-color="white"
                accept=".pdf,.jpg,.jpeg,.png"
                max-file-size="10485760"
                class="bg-white rounded-xl shadow-sm"
              >
                <template v-slot:prepend>
                  <q-icon name="file_upload" color="teal-7" />
                </template>
                <template v-slot:file="{ file }">
                  <div class="text-teal-900 text-[11px] font-black italic truncate">{{ file.name }}</div>
                </template>
              </q-file>
              <div class="text-[9px] text-teal-400 mt-2 font-bold uppercase tracking-tighter">Formato: PDF/JPG/PNG • Máximo: 10MB</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD ANOTHER BUTTON (PROMINENT) -->
    <div v-if="merito.permite_multiples" class="flex flex-col items-center gap-3 pt-6">
       <q-btn
         unelevated
         color="indigo-7"
         icon="add_circle"
         label="AÑADIR OTRO REGISTRO"
         size="lg"
         class="rounded-2xl px-12 font-black shadow-xl shadow-indigo-200 animate-bounce-slow"
         @click="store.agregarRegistroMerito(merito.tipo_documento_id)"
       />
       <div class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest italic">
         Puedes añadir cuántos registros sean necesarios para este mérito.
       </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'

const props = defineProps({
  merito: {
    type: Object,
    required: true,
  }
})

const store = usePostulacionStore()

// Normalize campos to handle different data structures
const normalizedCampos = computed(() => {
  const campos = props.merito.campos || []
  if (Array.isArray(campos)) {
    return campos.map((c, i) => ({
      key: c.key || c.id || c.name || `campo_${i}`,
      label: c.label || c.nombre || c.name || `Campo ${i + 1}`,
      tipo: c.tipo || c.type || 'text',
      required: c.requerido || c.required || false,
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
      required: a.requerido || a.obligatorio || a.required || false,
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
  border-color: #66339922;
  box-shadow: 0 20px 40px -15px rgba(102, 51, 153, 0.1);
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
</style>
