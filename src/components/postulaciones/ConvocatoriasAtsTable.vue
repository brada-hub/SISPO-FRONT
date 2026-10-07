<template>
  <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
    <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
      <div class="text-sm font-black text-gray-700 uppercase tracking-wider">
        Convocatorias en Proceso
      </div>
      <q-input
        v-model="search"
        placeholder="Buscar convocatoria por código o título..."
        dense
        outlined
        rounded
        bg-color="white"
        class="min-w-[300px]"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-16">#</th>
            <th class="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-28">Código</th>
            <th class="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3">Convocatoria</th>
            <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-28">Gestión</th>
            <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-40">Periodo</th>
            <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-24">Postulantes</th>
            <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-32">Estado</th>
            <th class="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 w-56">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(conv, idx) in filteredList"
            :key="conv.id"
            class="border-b border-gray-50 hover:bg-indigo-50/20 cursor-pointer transition-colors group"
            @click="$emit('select', conv)"
          >
            <td class="px-4 py-4 text-center font-bold text-gray-400 text-xs">{{ idx + 1 }}</td>
            <td class="px-4 py-4">
              <span class="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-wider">
                {{ conv.codigo_interno || `CONV-${conv.id}` }}
              </span>
            </td>
            <td class="px-4 py-4">
              <div class="font-black text-gray-800 uppercase text-xs truncate max-w-sm group-hover:text-primary transition-colors">
                {{ conv.titulo }}
              </div>
            </td>
            <td class="px-4 py-4 text-center">
              <span class="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                {{ conv.gestion }}
              </span>
            </td>
            <td class="px-4 py-4 text-center">
              <div class="text-[10px] font-bold text-gray-500">I: {{ formatDate(conv.fecha_inicio) }}</div>
              <div class="text-[10px] font-bold text-red-500">C: {{ formatDate(conv.fecha_cierre) }}</div>
            </td>
            <td class="px-4 py-4 text-center">
              <q-badge :color="conv.postulaciones_count > 0 ? 'primary' : 'grey-4'" :text-color="conv.postulaciones_count > 0 ? 'white' : 'grey-6'" class="rounded-md font-black px-2">
                {{ conv.postulaciones_count }}
              </q-badge>
            </td>
            <td class="px-4 py-4 text-center">
              <q-badge
                :color="getConvStatus(conv).color"
                text-color="white"
                class="rounded-md text-[9px] font-black px-2 uppercase tracking-wide"
              >{{ getConvStatus(conv).label }}</q-badge>
            </td>
            <td class="px-4 py-4 text-center" @click.stop>
              <div class="flex items-center justify-center gap-1">
                <q-btn
                  flat rounded dense icon="people" size="sm" color="primary"
                  @click="$emit('select', conv)" title="Gestionar Postulantes"
                />
                <q-btn
                  flat rounded dense icon="emoji_events" size="sm" color="indigo"
                  @click="$emit('select-mode', { conv, mode: 'ranking' })" title="Ver Ranking"
                />
                <q-btn
                  flat rounded dense icon="edit_note" size="sm" color="teal"
                  @click="$emit('select-mode', { conv, mode: 'matriz' })" title="Evaluar Pendientes"
                />
                <q-btn
                  flat rounded dense icon="download" size="sm" color="green-8"
                  @click="$emit('export', conv)" title="Exportar Reporte"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="convocatorias.length === 0 && !loading" class="p-20 text-center text-gray-300">
      <q-icon name="folder_open" size="64px" class="mb-4 opacity-30" />
      <div class="text-sm font-black uppercase tracking-wider text-gray-400">Sin convocatorias disponibles</div>
      <p class="text-xs text-gray-400 mt-2">No se cargaron registros en el sistema</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  convocatorias: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'select-mode', 'export'])

const search = ref('')

const formatDate = (val) => {
  if (!val) return '-'
  return date.formatDate(val, 'DD-MM-YYYY')
}

const getConvStatus = (conv) => {
  const hoy = new Date().toISOString().split('T')[0]
  const inicio = (conv.fecha_inicio || '').split('T')[0]
  const cierre = (conv.fecha_cierre || '').split('T')[0]
  if (hoy < inicio) return { label: 'PROGRAMADA', color: 'blue' }
  if (hoy > cierre) return { label: 'CERRADA', color: 'red' }
  return { label: 'ABIERTA', color: 'positive' }
}

const filteredList = computed(() => {
  if (!search.value) return props.convocatorias
  const q = search.value.toLowerCase().trim()
  return props.convocatorias.filter(c =>
    (c.titulo && c.titulo.toLowerCase().includes(q)) ||
    (c.codigo_interno && c.codigo_interno.toLowerCase().includes(q)) ||
    (c.gestion && String(c.gestion).toLowerCase().includes(q))
  )
})
</script>
