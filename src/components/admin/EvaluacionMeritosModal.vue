<template>
  <q-dialog v-model="show" persistent full-width>
    <q-card class="column full-height" style="max-width: 1200px; margin: auto">
      <q-card-section class="row items-center q-pb-none bg-primary text-white">
        <div class="text-h6">
          Evaluación de Méritos (Matriz técnica) - {{ postulation?.postulante?.nombres }}
          {{ postulation?.postulante?.apellidos }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="col scroll q-pa-lg bg-grey-2">
        <div class="row q-col-gutter-lg">
          <!-- Area 1: Formación -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="rounded-xl shadow-sm">
              <q-card-section
                class="bg-primary text-white row justify-between items-center q-py-sm"
              >
                <div class="text-subtitle1 text-weight-bold">ÁREA 1: FORMACIÓN ACADÉMICA</div>
                <div class="text-h6">{{ totalArea1 }} / 20</div>
              </q-card-section>
              <q-card-section class="q-gutter-y-md">
                <div class="row items-center">
                  <div class="col-8">Diplomado (3 pts)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a1_diplomado"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Especialidad (4 pts)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a1_especialidad"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Maestría (6 pts)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a1_maestria"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Doctorado (7 pts)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a1_doctorado"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Area 2: Perfeccionamiento -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="rounded-xl shadow-sm">
              <q-card-section class="bg-secondary text-white row justify-between items-center q-py-sm">
                <div class="text-subtitle1 text-weight-bold">ÁREA 2: PERFECCIONAMIENTO</div>
                <div class="text-h6">{{ totalArea2 }} / 20</div>
              </q-card-section>
              <q-card-section class="q-gutter-y-md">
                <div class="row items-center">
                  <div class="col-8">Cursos > 120h (3 pts c/u, máx 9)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a2_cursos_120"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Cursos > 20h (1 pto c/u, máx 5)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a2_cursos_20"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Disertante (1 pto c/u, máx 3)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a2_disertante"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Formación pedagógica (1 pto c/u, máx 3)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a2_pedagogico"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Area 3: Experiencia -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="rounded-xl shadow-sm">
              <q-card-section
                class="bg-primary text-white row justify-between items-center q-py-sm"
              >
                <div class="text-subtitle1 text-weight-bold">ÁREA 3: EXPERIENCIA</div>
                <div class="text-h6">{{ totalArea3 }} / 50</div>
              </q-card-section>
              <q-card-section class="q-gutter-y-md">
                <div class="row items-center">
                  <div class="col-8">Ejercicio profesión (1 pto/año, máx 15)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a3_ejercicio_prof"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Docencia (1 pto/semestre, máx 10)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a3_docencia"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Tutoría tesis (1 pto c/u, máx 5)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a3_tutorias"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Docente Postgrado (1 pto c/u, máx 5)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a3_docente_post"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Cargos similares (máx 15)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a3_cargos_sim"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Area 4: Otros -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="rounded-xl shadow-sm">
              <q-card-section
                class="bg-secondary text-white row justify-between items-center q-py-sm"
              >
                <div class="text-subtitle1 text-weight-bold">ÁREA 4: OTROS MÉRITOS</div>
                <div class="text-h6">{{ totalArea4 }} / 10</div>
              </q-card-section>
              <q-card-section class="q-gutter-y-md">
                <div class="row items-center">
                  <div class="col-8">Revistas indexadas (1 pto c/u, máx 3)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a4_revistas"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Libros/Textos (1 pto c/u, máx 3)</div>
                  <div class="col-4">
                    <q-input v-model.number="form.a4_libros" type="number" dense outlined min="0" />
                  </div>
                </div>
                <div class="row items-center">
                  <div class="col-8">Distinciones (1 pto c/u, máx 4)</div>
                  <div class="col-4">
                    <q-input
                      v-model.number="form.a4_distinciones"
                      type="number"
                      dense
                      outlined
                      min="0"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="rounded-xl shadow-sm q-mt-md">
              <q-card-section class="bg-grey-9 text-white q-py-xs">
                <div class="text-subtitle2 font-bold">Observaciones Generales</div>
              </q-card-section>
              <q-card-section>
                <q-input
                  v-model="form.observaciones"
                  type="textarea"
                  dense
                  outlined
                  rows="3"
                  placeholder="Escriba aquí cualquier observación técnica..."
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-section
        class="bg-white border-top flex justify-between items-center q-pa-md shadow-2"
      >
        <div class="row items-center gap-4">
          <div class="text-h5 text-weight-bolder text-primary">
            PUNTAJE TOTAL: <span class="text-secondary">{{ totalPuntaje }} / 100</span>
          </div>
        </div>
        <div class="row gap-4">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup class="rounded-xl" />
          <q-btn
            unelevated
            label="Guardar Evaluación Técnica"
            color="primary"
            icon="save"
            class="rounded-xl q-px-lg shadow-1"
            :loading="saving"
            @click="saveEvaluation"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  postulation: Object,
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const saving = ref(false)

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const form = ref({
  // Area 1
  a1_diplomado: 0,
  a1_especialidad: 0,
  a1_maestria: 0,
  a1_doctorado: 0,
  // Area 2
  a2_cursos_120: 0,
  a2_cursos_20: 0,
  a2_disertante: 0,
  a2_pedagogico: 0,
  // Area 3
  a3_ejercicio_prof: 0,
  a3_docencia: 0,
  a3_tutorias: 0,
  a3_docente_post: 0,
  a3_cargos_sim: 0,
  // Area 4
  a4_revistas: 0,
  a4_libros: 0,
  a4_distinciones: 0,
  // Others
  observaciones: '',
})

// Cálculos de Áreas con Topes
const totalArea1 = computed(() => {
  const sum =
    (form.value.a1_diplomado || 0) +
    (form.value.a1_especialidad || 0) +
    (form.value.a1_maestria || 0) +
    (form.value.a1_doctorado || 0)
  return Math.min(sum, 20)
})

const totalArea2 = computed(() => {
  const sum =
    (form.value.a2_cursos_120 || 0) +
    (form.value.a2_cursos_20 || 0) +
    (form.value.a2_disertante || 0) +
    (form.value.a2_pedagogico || 0)
  return Math.min(sum, 20)
})

const totalArea3 = computed(() => {
  const sum =
    (form.value.a3_ejercicio_prof || 0) +
    (form.value.a3_docencia || 0) +
    (form.value.a3_tutorias || 0) +
    (form.value.a3_docente_post || 0) +
    (form.value.a3_cargos_sim || 0)
  return Math.min(sum, 50)
})

const totalArea4 = computed(() => {
  const sum =
    (form.value.a4_revistas || 0) +
    (form.value.a4_libros || 0) +
    (form.value.a4_distinciones || 0)
  return Math.min(sum, 10)
})

const totalPuntaje = computed(() => {
  return totalArea1.value + totalArea2.value + totalArea3.value + totalArea4.value
})

const loadExistingEvaluation = async () => {
  if (!props.postulation) return
  try {
    const { data } = await api.get(`/evaluaciones-meritos/postulacion/${props.postulation.id}`)
    if (data && data.detalle_evaluacion) {
      Object.assign(form.value, data.detalle_evaluacion)
      form.value.observaciones = data.observaciones || ''
    } else {
      resetForm()
    }
  } catch (error) {
    console.error('Error loading evaluation:', error)
  }
}

const resetForm = () => {
  Object.keys(form.value).forEach((key) => {
    if (key === 'observaciones') form.value[key] = ''
    else form.value[key] = 0
  })
}

const saveEvaluation = async () => {
  saving.value = true
  try {
    const payload = {
      postulacion_id: props.postulation.id,
      puntaje_formacion: totalArea1.value,
      puntaje_perfeccionamiento: totalArea2.value,
      puntaje_experiencia: totalArea3.value,
      puntaje_otros: totalArea4.value,
      puntaje_total: totalPuntaje.value,
      detalle_evaluacion: form.value,
      observaciones: form.value.observaciones,
    }

    await api.post('/evaluaciones-meritos', payload)

    $q.notify({
      type: 'positive',
      message: 'Evaluación técnica guardada con éxito',
      position: 'top',
    })
    emit('saved')
    show.value = false
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la evaluación',
    })
  } finally {
    saving.value = false
  }
}

watch(
  () => props.postulation,
  (newVal) => {
    if (newVal) loadExistingEvaluation()
  },
  { immediate: true },
)
</script>

<style scoped>
.rounded-xl {
  border-radius: 16px;
}
.shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.border-top {
  border-top: 1px solid #e0e0e0;
}
</style>
