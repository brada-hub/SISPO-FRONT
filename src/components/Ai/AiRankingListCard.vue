<template>
  <q-card class="ranking-card q-mb-sm no-shadow" :class="{'is-top-3': ranking <= 3}">
    <q-card-section class="q-pa-sm row items-center no-wrap">
      
      <!-- Posición -->
      <div class="col-auto q-px-md text-center" style="min-width: 60px;">
        <div class="text-h6 text-weight-bold" :class="rankingColorClass">
          #{{ ranking }}
        </div>
      </div>

      <!-- Avatar y Nombre -->
      <div class="col-3 row items-center no-wrap">
        <q-avatar size="40px" class="q-mr-sm" :color="avatarColor" text-color="white">
          <img v-if="candidato.foto" :src="candidato.foto" />
          <span v-else>{{ candidato.iniciales }}</span>
        </q-avatar>
        <div>
          <div class="text-subtitle2 text-weight-medium ellipsis" style="max-width: 180px;">
            {{ candidato.nombreCompleto }}
          </div>
          <div class="text-caption text-grey-6 ellipsis" style="max-width: 180px;">
            {{ candidato.profesion || 'Perfil en revisión' }}
          </div>
        </div>
      </div>

      <!-- Score Bar -->
      <div class="col-4 q-px-md">
        <div class="row justify-between q-mb-xs">
          <span class="text-caption text-grey-8">Compatibilidad SISPO</span>
          <span v-if="evaluated" class="text-caption text-weight-bold" :class="scoreColorText">{{ parsedScore }}%</span>
          <span v-else class="text-caption text-weight-bold text-grey-6">—</span>
        </div>
        <q-linear-progress 
          :value="evaluated ? (parsedScore / 100) : 0" 
          :color="evaluated ? scoreColor : 'grey-3'" 
          track-color="grey-2"
          size="8px" 
          rounded 
        />
      </div>

      <!-- Badge Clasificación -->
      <div class="col-2 text-center">
        <AiScoreBadge :clasificacion="evaluated ? clasificacion : 'pendiente'" />
      </div>

      <!-- Acciones -->
      <div class="col-auto q-pl-md row items-center no-wrap gap-sm">
        <q-btn 
          v-if="!evaluated"
          unelevated
          color="indigo-7" 
          label="Evaluar" 
          icon="calculate" 
          size="sm"
          class="rounded-borders font-bold"
          @click="$emit('evaluate', postulacionId)"
        />
        <q-btn 
          outline 
          color="primary" 
          label="Revisar" 
          icon-right="arrow_forward" 
          size="sm"
          class="rounded-borders"
          @click="$emit('view', postulacionId)"
        />
      </div>

    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import AiScoreBadge from './AiScoreBadge.vue'

const props = defineProps({
  postulacionId: { type: [Number, String], required: true },
  ranking: { type: Number, required: true },
  score: { type: [Number, String], default: null },
  clasificacion: { type: String, default: 'pendiente' },
  evaluated: { type: Boolean, default: true },
  candidato: {
    type: Object,
    required: true,
    // Expects: nombreCompleto, iniciales, profesion, foto (optional)
  }
})

defineEmits(['view', 'evaluate'])

const parsedScore = computed(() => {
  if (props.score === null || props.score === undefined) return 0
  const n = Number(props.score)
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0
})

const rankingColorClass = computed(() => {
  if (props.ranking === 1) return 'text-amber-6' // Oro
  if (props.ranking === 2) return 'text-grey-5'  // Plata
  if (props.ranking === 3) return 'text-brown-4' // Bronce
  return 'text-grey-7'
})

const avatarColor = computed(() => {
  const colors = ['primary', 'teal', 'indigo', 'purple', 'cyan']
  return colors[props.ranking % colors.length]
})

const scoreColor = computed(() => {
  const s = parsedScore.value
  if (s >= 75) return 'positive'
  if (s >= 50) return 'warning'
  return 'negative'
})

const scoreColorText = computed(() => {
  const s = parsedScore.value
  if (s >= 75) return 'text-positive'
  if (s >= 50) return 'text-warning'
  return 'text-negative'
})
</script>

<style scoped>
.ranking-card {
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
  transition: all 0.2s ease;
}
.ranking-card:hover {
  transform: translateX(4px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
}

.is-top-3 {
  background: linear-gradient(to right, #f8fafc, #ffffff);
  border-left: 3px solid #6366f1;
}

.gap-sm {
  gap: 8px;
}
</style>
