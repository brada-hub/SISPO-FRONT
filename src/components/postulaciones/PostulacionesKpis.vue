<template>
  <div
    class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fade-in"
  >
    <div>
      <h1 class="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase flex items-center gap-2">
        Gestión de Postulaciones <span class="text-[10px] bg-primary text-white px-2 py-0.5 rounded font-black tracking-widest">UNITEPC</span>
      </h1>
      <p class="text-xs text-gray-400 mt-2 font-medium">
        Seleccione una convocatoria para evaluar méritos, revisar postulantes y emitir actas oficiales
      </p>
    </div>

    <!-- Compact Global KPIs -->
    <div class="flex flex-wrap gap-4">
      <div class="bg-indigo-50/60 px-4 py-3 rounded-2xl border border-indigo-100/50 text-center min-w-[90px] shadow-sm">
        <div class="text-xl font-black text-indigo-700 leading-none">{{ convocatoriasCount }}</div>
        <div class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">Convocatorias</div>
      </div>
      <div class="bg-teal-50/60 px-4 py-3 rounded-2xl border border-teal-100/50 text-center min-w-[90px] shadow-sm">
        <div class="text-xl font-black text-teal-700 leading-none">{{ totalPostulantes }}</div>
        <div class="text-[9px] font-black text-teal-400 uppercase tracking-widest mt-1">Postulantes</div>
      </div>
      <div class="bg-amber-50/60 px-4 py-3 rounded-2xl border border-amber-100/50 text-center min-w-[90px] shadow-sm">
        <div class="text-xl font-black text-amber-700 leading-none">{{ convAbiertas }}</div>
        <div class="text-[9px] font-black text-amber-400 uppercase tracking-widest mt-1">Vigentes</div>
      </div>
      <div class="bg-red-50/60 px-4 py-3 rounded-2xl border border-red-100/50 text-center min-w-[90px] shadow-sm">
        <div class="text-xl font-black text-red-700 leading-none">{{ totalPendientesGlobal }}</div>
        <div class="text-[9px] font-black text-red-400 uppercase tracking-widest mt-1">Pendientes</div>
      </div>
    </div>

    <div class="flex gap-2">
      <q-btn
        v-if="canManageAll"
        label="Importar Excel"
        icon="upload_file"
        color="deep-purple-8"
        unelevated
        size="sm"
        rounded
        class="shadow-sm font-bold px-4 py-2"
        @click="$emit('import-click')"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  convocatoriasCount: {
    type: Number,
    default: 0
  },
  totalPostulantes: {
    type: Number,
    default: 0
  },
  convAbiertas: {
    type: Number,
    default: 0
  },
  totalPendientesGlobal: {
    type: Number,
    default: 0
  },
  canManageAll: {
    type: Boolean,
    default: false
  }
})

defineEmits(['import-click'])
</script>
