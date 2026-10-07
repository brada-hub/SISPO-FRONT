<template>
  <div class="animate-fade-in overflow-x-auto">
    <div class="flex gap-4 pb-4 min-w-[1200px]">
      <!-- Column Builder -->
      <div
        v-for="col in pipelineColumns"
        :key="col.estado"
        class="flex-1 bg-gray-100/60 p-4 rounded-2xl border border-gray-200/50 min-h-[500px]"
      >
        <div class="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
          <span class="text-xs font-black text-gray-700 uppercase tracking-wider">{{ col.label }}</span>
          <q-badge color="indigo-7" class="rounded-full font-black">{{ col.items.length }}</q-badge>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="row in col.items"
            :key="row.id"
            class="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            @click="$emit('view-expediente', row)"
          >
            <div class="text-[9px] font-black text-primary uppercase">CI: {{ row.postulante?.ci }}</div>
            <div class="text-xs font-black text-gray-800 uppercase mt-1 leading-snug">
              {{ row.postulante?.nombres }} {{ row.postulante?.apellidos }}
            </div>

            <!-- Score badge inside card -->
            <div class="flex items-center justify-between mt-3">
              <span class="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100/50 rounded px-1.5 py-0.5">
                {{ row.evaluacion?.score_total !== undefined ? Number(row.evaluacion.score_total).toFixed(1) + ' pts' : 'SIN EVALUAR' }}
              </span>

              <!-- Move Controls -->
              <div class="flex gap-1" @click.stop>
                <q-btn
                  icon="arrow_back"
                  size="xs"
                  flat
                  round
                  dense
                  color="grey-6"
                  @click="$emit('move-pipeline', { row, direction: -1 })"
                  title="Mover atrás"
                />
                <q-btn
                  icon="arrow_forward"
                  size="xs"
                  flat
                  round
                  dense
                  color="grey-6"
                  @click="$emit('move-pipeline', { row, direction: 1 })"
                  title="Mover adelante"
                />
              </div>
            </div>
          </div>

          <div v-if="col.items.length === 0" class="text-center py-12 text-gray-300 text-[10px] font-bold uppercase">
            Valla Vacía
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pipelineColumns: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-expediente', 'move-pipeline'])
</script>
