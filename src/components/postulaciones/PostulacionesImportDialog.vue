<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 520px; max-width: 90vw; border-radius: 2rem" class="overflow-hidden shadow-2xl">
      <q-card-section class="bg-gradient-to-r from-deep-purple-8 to-indigo-9 text-white p-6 sm:p-8">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-bold uppercase tracking-widest text-teal-300">Migración & Sincronización</div>
            <div class="text-2xl font-black mt-1">Importar Excel</div>
            <div class="text-white/70 text-xs mt-1">Carga masiva institucional de postulantes</div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup :disable="importing" />
        </div>
      </q-card-section>

      <q-card-section class="p-6 sm:p-8">
        <div class="bg-indigo-50/80 p-5 rounded-2xl mb-6 border border-indigo-100">
          <div class="text-xs font-black text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-2">
            <q-icon name="help" size="18px" color="primary" /> Formato Requerido
          </div>
          <p class="text-xs text-indigo-700/90 leading-relaxed q-ma-none">
            Asegúrese de que el archivo contenga las columnas de datos personales y convocatoria para ser procesado por el motor de migración institucional.
          </p>
        </div>

        <q-file
          v-model="importFile"
          label="Archivo de Postulantes (.xlsx, .csv)"
          outlined
          bg-color="white"
          rounded
          use-chips
          accept=".xlsx, .xls, .csv"
          :disable="importing"
        >
          <template v-slot:prepend>
            <q-icon name="upload_file" color="primary" />
          </template>
          <template v-slot:append>
            <q-icon v-if="importFile" name="close" @click.stop.prevent="importFile = null" class="cursor-pointer" />
          </template>
        </q-file>
      </q-card-section>

      <q-card-actions align="right" class="px-6 sm:px-8 pb-6 pt-0 gap-3">
        <q-btn
          label="Cancelar"
          flat
          color="grey-7"
          rounded
          no-caps
          v-close-popup
          :disable="importing"
          class="px-5 font-bold"
        />
        <q-btn
          label="Procesar Archivo"
          icon="upload"
          color="primary"
          unelevated
          rounded
          no-caps
          :loading="importing"
          :disable="!importFile"
          @click="processImport"
          class="px-6 font-black shadow-md shadow-primary/20"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'imported'])

const $q = useQuasar()
const importFile = ref(null)
const importing = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const processImport = async () => {
  if (!importFile.value) return
  importing.value = true
  const formData = new FormData()
  formData.append('file', importFile.value)

  try {
    const { data } = await api.post('/importar-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    $q.notify({
      type: 'positive',
      message: `Importación completada: ${data.imported || 0} registros procesados.`,
      position: 'top',
    })
    isOpen.value = false
    importFile.value = null
    emit('imported', data)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al importar los datos',
      position: 'top'
    })
  } finally {
    importing.value = false
  }
}
</script>
