<template>
  <q-card class="observations-card no-shadow">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold text-primary q-mb-md flex items-center">
        <q-icon name="fact_check" size="sm" class="q-mr-sm" color="primary" />
        Evaluación Cualitativa (Generada por SISPO Score Engine)
      </div>

      <!-- Observación General -->
      <div class="executive-summary q-pa-md q-mb-md">
        <div class="text-body1 text-grey-9" style="line-height: 1.6;">
          "{{ observaciones || 'El sistema no generó observaciones descriptivas.' }}"
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Fortalezas -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 text-positive q-mb-sm flex items-center">
            <q-icon name="trending_up" class="q-mr-xs" /> Fortalezas Detectadas
          </div>
          <q-list dense>
            <q-item v-if="!fortalezas || fortalezas.length === 0">
              <q-item-section class="text-grey-6 text-italic">Ninguna destacada.</q-item-section>
            </q-item>
            <q-item v-for="(item, index) in fortalezas" :key="'f'+index" class="q-px-none">
              <q-item-section avatar style="min-width: 32px">
                <q-icon name="check" color="positive" size="xs" />
              </q-item-section>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Debilidades / Gaps -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 text-negative q-mb-sm flex items-center">
            <q-icon name="trending_down" class="q-mr-xs" /> Brechas (Gaps) Identificadas
          </div>
          <q-list dense>
            <q-item v-if="!debilidades || debilidades.length === 0">
              <q-item-section class="text-grey-6 text-italic">Ninguna destacada.</q-item-section>
            </q-item>
            <q-item v-for="(item, index) in debilidades" :key="'d'+index" class="q-px-none">
              <q-item-section avatar style="min-width: 32px">
                <q-icon name="close" color="negative" size="xs" />
              </q-item-section>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  observaciones: {
    type: String,
    default: ''
  },
  fortalezas: {
    type: Array,
    default: () => []
  },
  debilidades: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.observations-card {
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  background: white;
}

.executive-summary {
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
  border-left: 4px solid #8b5cf6; /* AI Purple accent */
  border-radius: 4px 8px 8px 4px;
}
</style>
