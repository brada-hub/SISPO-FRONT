<template>
  <div class="form-merito-container q-mb-xl p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div class="flex items-center gap-3 q-mb-md">
      <q-icon name="folder_open" color="primary" size="sm" />
      <div class="text-lg font-bold text-[#663399]">{{ tipoDocumento.nombre }}</div>
    </div>

    <div v-if="tipoDocumento.descripcion" class="text-sm text-gray-500 q-mb-lg bg-gray-50 p-3 rounded-lg">
      {{ tipoDocumento.descripcion }}
    </div>

    <!-- Lista de registros (Iteramos sobre el modelo) -->
    <div v-for="(registro, index) in modelValue" :key="index"
         class="relative q-pa-md bg-white rounded-xl q-mb-md border border-gray-200 shadow-sm transition-all hover:shadow-md">

      <!-- Botón eliminar (solo si permite múltiples o es un registro extra) -->
      <div v-if="permiteMultiples && modelValue.length > 0" class="absolute top-2 right-2 z-10">
        <q-btn round flat dense color="negative" icon="close" @click="eliminarRegistro(index)" size="sm">
          <q-tooltip>Eliminar este registro</q-tooltip>
        </q-btn>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Campos Dinámicos -->
        <template v-for="(campo, cIndex) in camposParseds" :key="cIndex">

          <!-- TEXT / NUMBER / DATE -->
          <div v-if="['text', 'number', 'date', 'email'].includes(campo.type)">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              {{ campo.label }} <span v-if="campo.required" class="text-red-500">*</span>
            </label>
            <q-input
              v-model="registro.metadatos[campo.name]"
              :type="campo.type"
              outlined
              dense
              class="bg-white"
              :placeholder="campo.placeholder"
              :rules="campo.required ? [val => !!val || 'Requerido'] : []"
              hide-bottom-space
            />
          </div>

          <!-- SELECT -->
          <div v-else-if="campo.type === 'select'">
             <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              {{ campo.label }} <span v-if="campo.required" class="text-red-500">*</span>
            </label>
            <q-select
              v-model="registro.metadatos[campo.name]"
              :options="campo.options"
              outlined
              dense
              class="bg-white"
              emit-value
              map-options
              :rules="campo.required ? [val => !!val || 'Requerido'] : []"
              hide-bottom-space
            />
          </div>

          <!-- TEXTAREA -->
          <div v-else-if="campo.type === 'textarea'" class="md:col-span-2">
             <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              {{ campo.label }}
            </label>
            <q-input
              v-model="registro.metadatos[campo.name]"
              type="textarea"
              outlined
              dense
              class="bg-white"
              rows="3"
            />
          </div>
        </template>
      </div>

      <!-- Sección de Archivo -->
      <div class="mt-6 pt-4 border-t border-gray-100">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div class="flex-grow w-full">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Documento de Respaldo <span class="text-red-500">*</span>
            </label>
            <!-- File Input -->
             <q-file
              v-model="registro.archivo"
              outlined
              dense
              clearable
              counter
              :accept="fileAccept"
              :max-file-size="fileMaxSize"
              color="teal"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" color="teal" />
              </template>
              <template v-slot:file="{ file }">
                <div class="text-teal-800 text-sm font-medium trunc-text">
                  {{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)
                </div>
              </template>
            </q-file>
            <div class="text-xs text-gray-400 mt-1">
              {{ configArchivosParsed.descripcion || 'Subir archivo PDF o Imagen legible.' }}
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Agregar otro registro -->
    <div v-if="permiteMultiples" class="flex justify-center mt-4">
      <q-btn
        outline
        color="secondary"
        icon="add_circle_outline"
        label="Agregar otro registro"
        class="rounded-full px-6"
        @click="agregarRegistro"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tipoDocumento: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Array, // Array de objetos { archivo: File, metadatos: {} }
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'add', 'remove'])

// Computed Helpers
const camposParseds = computed(() => {
  const campos = props.tipoDocumento.campos
  if (typeof campos === 'string') {
    try { return JSON.parse(campos) } catch { return [] }
  }
  return campos || []
})

const configArchivosParsed = computed(() => {
  const config = props.tipoDocumento.config_archivos
   if (typeof config === 'string') {
    try { return JSON.parse(config) } catch { return {} }
  }
  return config || {}
})

const fileAccept = computed(() => {
  const exts = configArchivosParsed.value.extensiones || ['pdf', 'jpg', 'jpeg', 'png']
  return exts.map(e => `.${e}`).join(',')
})

const fileMaxSize = computed(() => {
  // Convert MB to bytes, default 5MB
  return (configArchivosParsed.value.max_size || 5) * 1024 * 1024
})

const permiteMultiples = computed(() => {
  return props.tipoDocumento.permite_multiples
})

// Acciones
const agregarRegistro = () => {
  emit('add')
}

const eliminarRegistro = (index) => {
  emit('remove', index)
}

</script>

<style scoped>
.trunc-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
