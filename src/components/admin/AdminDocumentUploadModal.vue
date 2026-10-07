<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 480px; max-width: 90vw; border-radius: 24px;" class="overflow-hidden shadow-2xl">
      <!-- HEADER -->
      <q-card-section class="bg-gradient-to-r from-[#4a2371] to-[#2c4e91] text-white p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <q-avatar color="white" text-color="primary" icon="cloud_upload" size="md" />
            <div>
              <div class="text-xs font-bold uppercase tracking-widest text-teal-300">Gestión de Expediente (Admin)</div>
              <div class="text-lg font-black tracking-tight uppercase leading-tight">
                Adjuntar {{ documentTitle || 'Documento' }}
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup :disable="uploading" />
        </div>
      </q-card-section>

      <!-- BODY -->
      <q-card-section class="p-6">
        <div class="text-xs text-gray-500 mb-4 leading-relaxed font-medium">
          Selecciona o arrastra el documento del postulante. Se guardará de inmediato en el expediente oficial y estará disponible para revisión y descarga.
        </div>

        <q-file
          v-model="file"
          label="Seleccionar archivo (PDF o Imagen)"
          outlined
          dense
          bottom-slots
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          max-file-size="10485760"
          :disable="uploading"
          class="mb-2"
          @rejected="onRejected"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" color="primary" />
          </template>
          <template v-slot:append>
            <q-icon v-if="file" name="close" @click.stop.prevent="file = null" class="cursor-pointer" />
          </template>
          <template v-slot:hint>
            Formatos válidos: PDF, JPG, PNG, WEBP (Máx. 10 MB)
          </template>
        </q-file>

        <!-- FILE SUMMARY CARD -->
        <div v-if="file" class="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mt-3 flex items-center gap-3 animate-fade-in">
          <q-icon :name="file.type.includes('pdf') ? 'picture_as_pdf' : 'image'" color="primary" size="md" />
          <div class="flex-1 min-w-0">
            <div class="text-xs font-black text-gray-800 truncate">{{ file.name }}</div>
            <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {{ (file.size / 1024 / 1024).toFixed(2) }} MB • Listo para subir
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- PROGRESS BAR -->
      <q-linear-progress v-if="uploading" indeterminate color="primary" />

      <!-- ACTIONS -->
      <q-card-actions align="right" class="p-6 bg-gray-50 border-t border-gray-100 gap-3">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          rounded
          no-caps
          v-close-popup
          :disable="uploading"
          class="px-5 font-bold"
        />
        <q-btn
          label="Subir y Adjuntar"
          icon="upload"
          color="primary"
          unelevated
          rounded
          no-caps
          :loading="uploading"
          :disable="!file"
          class="px-6 font-black shadow-md shadow-primary/20"
          @click="uploadDocument"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  postulacionId: {
    type: [Number, String],
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  documentTitle: {
    type: String,
    default: 'Documento'
  },
  recordId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

const $q = useQuasar()
const file = ref(null)
const uploading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

watch(() => props.modelValue, (val) => {
  if (val) {
    file.value = null
  }
})

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: 'El archivo supera el límite de 10 MB o el formato no es válido.',
    position: 'top'
  })
}

const uploadDocument = async () => {
  if (!file.value || !props.postulacionId) return

  uploading.value = true
  const formData = new FormData()
  formData.append('archivo', file.value)
  formData.append('tipo', props.documentType)
  if (props.recordId) {
    formData.append('record_id', props.recordId)
  }

  try {
    const { data } = await api.post(`/postulaciones/${props.postulacionId}/adjuntar-documento`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (data.success) {
      $q.notify({
        type: 'positive',
        message: data.message || 'Documento adjuntado exitosamente.',
        position: 'top'
      })
      emit('uploaded', {
        tipo: props.documentType,
        path: data.path,
        recordId: props.recordId,
        postulante: data.postulante
      })
      isOpen.value = false
    }
  } catch (error) {
    console.error(error)
    const errorMsg = error.response?.data?.message || 'Error al subir el documento.'
    $q.notify({
      type: 'negative',
      message: errorMsg,
      position: 'top'
    })
  } finally {
    uploading.value = false
  }
}
</script>
