<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
    <div
      @click="$emit('select-filter', null)"
      :class="[
        'p-3 rounded-2xl shadow-sm border transition-all cursor-pointer select-none flex items-center gap-3 hover:scale-[1.02]',
        filterEstado === null ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-400/30' : 'bg-white border-gray-100 hover:border-gray-200'
      ]"
      title="Mostrar todos los postulantes del cargo"
    >
      <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
        👥
      </div>
      <div>
        <div class="text-xs font-bold text-gray-400 leading-none">Postulantes</div>
        <div class="text-base font-black text-gray-800 mt-1">{{ kpi.total || 0 }}</div>
      </div>
    </div>

    <div
      @click="$emit('select-filter', 'evaluados')"
      :class="[
        'p-3 rounded-2xl shadow-sm border transition-all cursor-pointer select-none flex items-center gap-3 hover:scale-[1.02]',
        filterEstado === 'evaluados' ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-400/30' : 'bg-white border-gray-100 hover:border-gray-200'
      ]"
      title="Filtrar evaluados con score"
    >
      <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black">
        ✓
      </div>
      <div>
        <div class="text-xs font-bold text-gray-400 leading-none">Evaluados</div>
        <div class="text-base font-black text-gray-800 mt-1">{{ kpi.evaluados || 0 }}</div>
      </div>
    </div>

    <div
      @click="$emit('select-filter', 'sin_evaluar')"
      :class="[
        'p-3 rounded-2xl shadow-sm border transition-all cursor-pointer select-none flex items-center gap-3 hover:scale-[1.02]',
        filterEstado === 'sin_evaluar' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30' : 'bg-white border-gray-100 hover:border-gray-200'
      ]"
      title="Filtrar pendientes sin evaluar"
    >
      <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
        ⏳
      </div>
      <div>
        <div class="text-xs font-bold text-gray-400 leading-none">Sin Evaluar</div>
        <div class="text-base font-black text-amber-700 mt-1">{{ kpi.sinEvaluar || 0 }}</div>
      </div>
    </div>

    <div
      @click="$emit('select-filter', 'validada')"
      :class="[
        'p-3 rounded-2xl shadow-sm border transition-all cursor-pointer select-none flex items-center gap-3 hover:scale-[1.02]',
        filterEstado === 'validada' || filterEstado === 'seleccionado' ? 'bg-green-50/70 border-green-300 ring-2 ring-green-400/30' : 'bg-white border-gray-100 hover:border-gray-200'
      ]"
      title="Filtrar preseleccionados"
    >
      <div class="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-black">
        ★
      </div>
      <div>
        <div class="text-xs font-bold text-gray-400 leading-none">Preseleccionados</div>
        <div class="text-base font-black text-green-700 mt-1">{{ kpi.preseleccionados || 0 }}</div>
      </div>
    </div>

    <div
      @click="$emit('select-view', 'auditoria')"
      :class="[
        'p-3 rounded-2xl shadow-sm border transition-all cursor-pointer select-none flex items-center gap-3 hover:scale-[1.02]',
        viewMode === 'auditoria' ? 'bg-orange-50/70 border-orange-300 ring-2 ring-orange-400/30' : 'bg-white border-gray-100 hover:border-gray-200'
      ]"
      title="Ver casos observados en auditoría"
    >
      <div class="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-black">
        🔍
      </div>
      <div>
        <div class="text-xs font-bold text-gray-400 leading-none">Auditoría</div>
        <div class="text-base font-black text-orange-700 mt-1">{{ kpi.auditoria || 0 }}</div>
      </div>
    </div>

    <div
      @click="$emit('select-filter', 'riesgo')"
      :class="[
        'p-3 rounded-2xl shadow-sm border transition-all cursor-pointer select-none flex items-center gap-3 hover:scale-[1.02]',
        filterEstado === 'riesgo' ? 'bg-red-50/70 border-red-300 ring-2 ring-red-400/30' : 'bg-white border-gray-100 hover:border-gray-200'
      ]"
      title="Filtrar riesgo alto o crítico"
    >
      <div class="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-black">
        ⚠
      </div>
      <div>
        <div class="text-xs font-bold text-gray-400 leading-none">Riesgo Alto</div>
        <div class="text-base font-black text-red-700 mt-1">{{ kpi.riesgo || 0 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  kpi: {
    type: Object,
    default: () => ({
      total: 0,
      evaluados: 0,
      sinEvaluar: 0,
      preseleccionados: 0,
      auditoria: 0,
      riesgo: 0
    })
  },
  filterEstado: {
    type: String,
    default: null
  },
  viewMode: {
    type: String,
    default: 'ranking'
  }
})

defineEmits(['select-filter', 'select-view'])
</script>
