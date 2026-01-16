<template>
  <div class="space-y-4">
    <!-- DYNAMIC FIELDS -->
    <div v-if="hasCampos" class="mb-6">
      <div class="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
        <q-icon name="edit_note" size="xs" /> Información a Completar
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <template v-for="(campo, idx) in normalizedCampos" :key="idx">
          <!-- TEXT -->
          <q-input
            v-if="campo.tipo === 'text' || campo.tipo === 'string'"
            :model-value="getRespuesta(campo.key)"
            @update:model-value="updateRespuesta(campo.key, $event)"
            :label="campo.label + (campo.required ? ' *' : '')"
            outlined
            dense
            bg-color="white"
          />

          <!-- NUMBER -->
          <q-input
            v-else-if="campo.tipo === 'number'"
            :model-value="getRespuesta(campo.key)"
            @update:model-value="updateRespuesta(campo.key, $event)"
            :label="campo.label + (campo.required ? ' *' : '')"
            type="number"
            outlined
            dense
            bg-color="white"
          />

          <!-- DATE -->
          <q-input
            v-else-if="campo.tipo === 'date'"
            :model-value="getRespuesta(campo.key)"
            @update:model-value="updateRespuesta(campo.key, $event)"
            :label="campo.label + (campo.required ? ' *' : '')"
            type="date"
            outlined
            dense
            stack-label
            bg-color="white"
          />

          <!-- TEXTAREA -->
          <q-input
            v-else-if="campo.tipo === 'textarea'"
            :model-value="getRespuesta(campo.key)"
            @update:model-value="updateRespuesta(campo.key, $event)"
            :label="campo.label + (campo.required ? ' *' : '')"
            type="textarea"
            rows="3"
            outlined
            dense
            bg-color="white"
            class="md:col-span-2"
          />

          <!-- SELECT -->
          <q-select
            v-else-if="campo.tipo === 'select'"
            :model-value="getRespuesta(campo.key)"
            @update:model-value="updateRespuesta(campo.key, $event)"
            :label="campo.label + (campo.required ? ' *' : '')"
            :options="campo.opciones || []"
            outlined
            dense
            bg-color="white"
            emit-value
            map-options
          />

          <!-- DEFAULT: TEXT (fallback) -->
          <q-input
            v-else
            :model-value="getRespuesta(campo.key)"
            @update:model-value="updateRespuesta(campo.key, $event)"
            :label="campo.label + (campo.required ? ' *' : '')"
            outlined
            dense
            bg-color="white"
          />
        </template>
      </div>
    </div>

    <!-- FILE UPLOADS -->
    <div v-if="hasArchivos">
      <div class="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
        <q-icon name="attach_file" size="xs" /> Archivos de Respaldo
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(archivo, idx) in normalizedArchivos" :key="idx" class="bg-white p-4 rounded-lg border">
          <div class="text-sm font-medium text-gray-700 mb-2">
            {{ archivo.label }}
            <q-badge v-if="archivo.required" color="red" class="ml-2">Obligatorio</q-badge>
          </div>
          <q-file
            :model-value="getArchivo(archivo.key)"
            @update:model-value="updateArchivo(archivo.key, $event)"
            :label="'Subir ' + archivo.label"
            outlined
            dense
            accept=".pdf,.jpg,.jpeg,.png"
            max-file-size="10485760"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
          <div class="text-xs text-gray-400 mt-1">PDF, JPG o PNG. Máx 10MB</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!hasCampos && !hasArchivos" class="text-center py-8 text-gray-400">
      <q-icon name="check_circle" size="lg" color="green" />
      <div class="mt-2">Este requisito no requiere información adicional.</div>
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
  const campos = props.merito.campos
  if (!campos) return []

  // If it's an array
  if (Array.isArray(campos)) {
    return campos.map((c, i) => ({
      key: c.key || c.label || c.nombre || c.name || c.id || `campo_${i}`,
      label: c.label || c.nombre || c.name || `Campo ${i + 1}`,
      tipo: c.tipo || c.type || 'text',
      required: c.requerido || c.required || false,
      opciones: c.opciones || c.options || [],
    }))
  }

  // If it's an object, convert to array
  if (typeof campos === 'object') {
    return Object.keys(campos).map(key => ({
      key: key,
      label: campos[key].label || campos[key].nombre || key,
      tipo: campos[key].tipo || campos[key].type || 'text',
      required: campos[key].requerido || campos[key].required || false,
      opciones: campos[key].opciones || campos[key].options || [],
    }))
  }

  return []
})

// Normalize archivos to handle different data structures
const normalizedArchivos = computed(() => {
  const archivos = props.merito.config_archivos
  if (!archivos) return []

  // If it's an array
  if (Array.isArray(archivos)) {
    return archivos.map((a, i) => ({
      key: a.id || a.nombre || a.name || `archivo_${i}`,
      label: a.nombre || a.label || a.name || `Archivo ${i + 1}`,
      required: a.obligatorio || a.required || false,
    }))
  }

  // If it's an object, convert to array
  if (typeof archivos === 'object') {
    return Object.keys(archivos).map(key => ({
      key: key,
      label: archivos[key].nombre || archivos[key].label || key,
      required: archivos[key].obligatorio || archivos[key].required || false,
    }))
  }

  return []
})

const hasCampos = computed(() => normalizedCampos.value.length > 0)
const hasArchivos = computed(() => normalizedArchivos.value.length > 0)

// Get respuesta value
const getRespuesta = (key) => {
  return props.merito.respuestas?.[key] || ''
}

// Get archivo value
const getArchivo = (key) => {
  return props.merito.archivos?.[key] || null
}

// Update respuesta via store mutation
const updateRespuesta = (key, value) => {
  const meritoInStore = store.meritos.find(m => m.tipo_documento_id === props.merito.tipo_documento_id)
  if (meritoInStore) {
    meritoInStore.respuestas[key] = value
  }
}

// Update archivo via store mutation
const updateArchivo = (key, file) => {
  const meritoInStore = store.meritos.find(m => m.tipo_documento_id === props.merito.tipo_documento_id)
  if (meritoInStore) {
    meritoInStore.archivos[key] = file
  }
}
</script>
