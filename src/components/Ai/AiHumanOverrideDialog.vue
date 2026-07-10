<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 450px; border-radius: 12px;">
      <q-card-section class="bg-primary text-white row items-center">
        <div class="text-h6 flex items-center">
          <q-icon name="admin_panel_settings" size="sm" class="q-mr-sm" />
          Override Humano (Auditoría)
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div class="text-body2 text-grey-8 q-mb-md">
          Estás a punto de modificar la clasificación calculada por el sistema determinístico.
          Esta acción quedará registrada en el log de auditoría del sistema con tu usuario.
        </div>

        <div class="row items-center q-mb-lg bg-grey-1 q-pa-sm rounded-borders">
          <div class="col-5 text-right text-weight-bold text-grey-7 q-pr-md">Clasificación Sistema:</div>
          <div class="col-7">
             <q-badge color="grey-4" text-color="grey-9" class="q-pa-xs">{{ oldClasificacionLabel }}</q-badge>
          </div>
        </div>

        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-select
            v-model="formData.clasificacion"
            :options="opciones"
            label="Nueva Clasificación Final *"
            outlined
            emit-value
            map-options
            options-dense
            color="primary"
            :rules="[val => !!val || 'Debes seleccionar una clasificación']"
          >
            <template v-slot:prepend>
              <q-icon name="gavel" />
            </template>
          </q-select>

          <q-input
            v-model="formData.justificacion"
            type="textarea"
            label="Justificación Ética / Técnica *"
            outlined
            color="primary"
            placeholder="Ej: El candidato cuenta con experiencia equivalente comprobable que el sistema no consideró..."
            :rules="[
              val => !!val || 'La justificación es obligatoria para auditoría',
              val => val.length >= 10 || 'Mínimo 10 caracteres'
            ]"
            rows="4"
          />

          <div class="row justify-end q-mt-lg">
            <q-btn label="Cancelar" color="grey-7" flat v-close-popup class="q-mr-sm" />
            <q-btn label="Guardar Decisión" type="submit" color="primary" :loading="loading" unelevated />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  currentClasificacion: String,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'submit'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formData = ref({
  clasificacion: null,
  justificacion: ''
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // reset when opening
    formData.value = {
      clasificacion: props.currentClasificacion,
      justificacion: ''
    }
  }
})

const oldClasificacionLabel = computed(() => {
  const map = {
    'apto': 'Apto',
    'parcialmente_apto': 'Parcialmente Apto',
    'no_apto': 'No Apto'
  }
  return map[props.currentClasificacion] || props.currentClasificacion
})

const opciones = [
  { label: 'Apto', value: 'apto' },
  { label: 'Parcialmente Apto', value: 'parcialmente_apto' },
  { label: 'No Apto', value: 'no_apto' }
]

const onSubmit = () => {
  emit('submit', { ...formData.value })
}
</script>
