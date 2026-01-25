<template>
  <q-page class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-8">
      <div class="text-h4 font-black text-gray-800 tracking-tight uppercase mb-2">Evaluación de Méritos</div>
      <div class="text-gray-500 font-medium">Seleccione una convocatoria para iniciar el proceso de evaluación.</div>
    </div>

    <!-- Filters -->
    <div class="flex justify-end mb-6">
      <q-input
        v-model="filter"
        outlined
        dense
        placeholder="Buscar Convocatoria..."
        class="bg-white rounded-lg shadow-sm"
        style="width: 300px"
      >
        <template v-slot:append>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredConvocatorias.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <q-icon name="folder_off" size="80px" color="grey-3" />
      <div class="text-xl font-bold text-gray-400 mt-4">No se encontraron convocatorias</div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="conv in filteredConvocatorias"
        :key="conv.id"
        class="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group flex flex-col"
      >
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-primary to-secondary p-6 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
             <q-icon name="campaign" size="100px" color="white" />
          </div>

          <div class="relative z-10 text-white">
             <div class="text-xs font-bold bg-white/20 inline-block px-2 py-1 rounded-md mb-2 backdrop-blur-sm">
                {{ conv.gestion || '2026' }}
             </div>
             <div class="text-xl font-black leading-tight uppercase tracking-tight line-clamp-2 h-14">
                {{ conv.titulo }}
             </div>
             <div class="mt-4 flex items-center gap-2 text-xs font-bold opacity-90">
                <q-icon name="tag" size="14px" />
                <span>{{ conv.codigo_interno || 'S/N' }}</span>
             </div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-6 flex-1 flex flex-col">
           <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <div class="text-[10px] font-black text-gray-400 uppercase">Inicio</div>
                 <div class="text-sm font-bold text-gray-800">{{ formatDate(conv.fecha_inicio) }}</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <div class="text-[10px] font-black text-gray-400 uppercase">Cierre</div>
                 <div class="text-sm font-bold text-red-600">{{ formatDate(conv.fecha_cierre) }}</div>
              </div>
           </div>

           <div class="flex flex-col gap-2 mb-6 flex-1">
              <div class="flex items-center justify-between text-xs font-medium text-gray-500">
                 <span>Ofertas (Cargos/Sedes)</span>
                 <span class="font-bold text-gray-800">{{ conv.ofertas?.length || 0 }}</span>
              </div>
              <q-separator />
              <!-- Status Chips -->
               <div class="flex gap-2 mt-2">
                 <q-chip
                   :color="getStatus(conv).color"
                   text-color="white"
                   size="sm"
                   class="font-bold"
                 >
                   {{ getStatus(conv).label }}
                 </q-chip>
               </div>
           </div>

           <!-- Action Button -->
           <q-btn
             label="Evaluar Méritos"
             icon-right="arrow_forward"
             color="primary"
             unelevated
             rounded
             class="w-full py-3 font-bold shadow-md group-hover:shadow-lg transition-all"
             @click="goToEvaluation(conv)"
           />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const convocatorias = ref([])
const loading = ref(false)
const filter = ref('')

const loadConvocatorias = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/convocatorias')
    // Sort by most recent first
    convocatorias.value = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error cargando convocatorias' })
  } finally {
    loading.value = false
  }
}

const filteredConvocatorias = computed(() => {
  if (!filter.value) return convocatorias.value
  const term = filter.value.toLowerCase()
  return convocatorias.value.filter(c =>
    c.titulo?.toLowerCase().includes(term) ||
    c.codigo_interno?.toLowerCase().includes(term)
  )
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0]
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
}

const getStatus = (row) => {
  const hoy = new Date().toISOString().split('T')[0]
  const inicio = row.fecha_inicio ? row.fecha_inicio.split('T')[0] : ''
  const cierre = row.fecha_cierre ? row.fecha_cierre.split('T')[0] : ''

  if (!inicio || !cierre) return { label: 'PENDIENTE', color: 'grey' }
  if (hoy < inicio) return { label: 'PROGRAMADA', color: 'blue' }
  if (hoy > cierre) return { label: 'CERRADA', color: 'red' }
  return { label: 'VIGENTE', color: 'positive' }
}

const goToEvaluation = (conv) => {
  router.push({ path: '/admin/evaluacion-tabla', query: { convocatoria_id: conv.id } })
}

onMounted(loadConvocatorias)
</script>
