<template>
  <div class="animate-fade-in">
    <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 flex items-start gap-3">
      <q-icon name="warning" color="warning" size="24px" class="flex-shrink-0" />
      <div>
        <div class="text-sm font-black text-amber-900 uppercase">⚠ Cola de Auditoría Humana</div>
        <p class="text-xs text-amber-700 q-ma-none leading-relaxed mt-1">
          Mostrando únicamente perfiles con riesgo crítico, alto, clasificados en Auditoría Humana, con duplicados severos o con documentación faltante crítica.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        v-for="row in rows"
        :key="row.id"
        class="flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-amber-50/20 cursor-pointer transition-all duration-150"
        @click="$emit('view-expediente', row)"
      >
        <!-- Alert Dot -->
        <div class="w-3 h-3 rounded-full bg-red-600 animate-ping flex-shrink-0" />

        <!-- Avatar -->
        <q-avatar size="36px" color="orange" text-color="white" class="font-black text-xs shadow-sm flex-shrink-0">
          {{ row.postulante?.nombres?.[0] }}{{ row.postulante?.apellidos?.[0] }}
        </q-avatar>

        <!-- Name & CI -->
        <div class="flex-1 min-w-0">
          <div class="text-xs font-black text-gray-800 uppercase truncate">
            {{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}
          </div>
          <div class="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
            CI: {{ row.postulante?.ci }}
          </div>
        </div>

        <!-- Risk Indicator Detail -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="text-[9px] font-black uppercase bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded">
            Riesgo: {{ row.evaluacion?.nivel_riesgo || 'alto' }}
          </span>
          <span v-if="row.evaluacion?.requires_human_review" class="text-[9px] font-black uppercase bg-orange-100 text-orange-900 border border-orange-200 px-2 py-0.5 rounded">
            Falta Firma/Firma
          </span>
          <span v-if="row.evaluacion?.missing_required_document" class="text-[9px] font-black uppercase bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded">
            Doc. Faltante
          </span>
        </div>

        <!-- Score Badge -->
        <div class="text-right flex-shrink-0 w-28">
          <div v-if="row.evaluacion?.score_total !== undefined" class="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1 inline-block">
            {{ Number(row.evaluacion.score_total).toFixed(1) }} pts
          </div>
          <div v-else class="text-[10px] text-gray-300 font-bold uppercase">Sin Evaluar</div>
        </div>

        <!-- Actions -->
        <q-btn
          label="Auditar"
          icon="gavel"
          size="xs"
          color="orange-9"
          unelevated
          rounded
          class="font-black px-3 py-1"
          @click.stop="$emit('view-expediente', row)"
        />
      </div>

      <div v-if="rows.length === 0" class="p-16 text-center text-gray-400 text-xs">
        🎉 ¡Excelente! No hay candidatos pendientes en la Cola de Auditoría Humana.
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-expediente'])
</script>
