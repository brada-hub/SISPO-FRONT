<template>
  <q-page class="convocatoria-detalle-page">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <q-spinner color="primary" size="80px" />
    </div>

    <!-- Content -->
    <div v-else-if="convocatoria" class="max-w-4xl mx-auto py-8 px-4">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Volver al Portal"
        class="mb-4"
        no-caps
        to="/"
      />

      <!-- Header Card -->
      <q-card class="header-card mb-6 rounded-2xl overflow-hidden shadow-lg border-none">
        <div class="header-gradient p-8 text-center text-white">
          <div class="text-sm font-medium opacity-80 mb-2">{{ convocatoria.codigo_interno }}</div>
          <h1 class="text-3xl font-bold mb-4">{{ convocatoria.titulo }}</h1>

          <!-- Sedes -->
          <div class="flex flex-wrap justify-center gap-2 mb-4">
            <q-chip
              v-for="sede in uniqueSedes"
              :key="sede"
              color="white"
              text-color="primary"
              icon="location_on"
              size="sm"
            >
              {{ sede }}
            </q-chip>
          </div>

          <!-- Fecha límite -->
          <div class="bg-white/20 inline-block px-6 py-3 rounded-xl mt-2">
            <div class="text-sm opacity-80">Fecha límite de postulación</div>
            <div class="text-xl font-bold">
              {{ formatDate(convocatoria.fecha_cierre) }}
              <span v-if="convocatoria.hora_limite" class="text-base opacity-90">
                a hrs {{ convocatoria.hora_limite }}
              </span>
            </div>
          </div>
        </div>
      </q-card>

      <!-- Descripción breve si existe -->
      <q-card v-if="convocatoria.descripcion && !convocatoria.contenido_detalle" class="mb-6 rounded-2xl p-6 shadow-lg">
        <p class="text-gray-700 text-lg leading-relaxed">{{ convocatoria.descripcion }}</p>
      </q-card>

      <!-- Contenido Detallado (HTML) -->
      <q-card v-if="convocatoria.contenido_detalle" class="mb-6 rounded-2xl shadow-lg">
        <q-card-section>
          <div class="contenido-detalle prose max-w-none" v-html="convocatoria.contenido_detalle"></div>
        </q-card-section>
      </q-card>

      <!-- Cargos disponibles -->
      <q-card class="mb-6 rounded-2xl shadow-lg">
        <q-card-section>
          <h2 class="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <q-icon name="work" />
            Cargos Disponibles
          </h2>
          <div class="grid gap-3">
            <div
              v-for="grupo in groupedCargos"
              :key="grupo.nombre"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div>
                <div class="font-bold text-gray-800">{{ grupo.nombre }}</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <q-badge v-for="s in grupo.sedes" :key="s" outline color="grey-7" size="xs">
                    {{ s }}
                  </q-badge>
                </div>
              </div>
              <q-chip color="secondary" text-color="white" size="sm">
                {{ grupo.vacantes }} vacante(s)
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Botón Postular -->
      <div class="text-center">
        <q-btn
          label="Postular Ahora"
          color="primary"
          size="xl"
          rounded
          unelevated
          icon="send"
          class="px-12 py-2 shadow-lg"
          @click="goToPostulacion"
        />
        <p class="text-gray-500 text-sm mt-3">
          Serás redirigido al formulario de postulación
        </p>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="flex flex-col justify-center items-center min-h-screen text-center">
      <q-icon name="search_off" size="80px" color="grey-5" />
      <h2 class="text-2xl font-bold text-gray-600 mt-4">Convocatoria no encontrada</h2>
      <p class="text-gray-500 mt-2">La convocatoria que buscas no existe o ya no está disponible.</p>
      <q-btn label="Volver al Portal" color="primary" rounded class="mt-6" to="/" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const convocatoria = ref(null)

// Intelligent grouping for the public page
const uniqueSedes = computed(() => {
  if (!convocatoria.value?.ofertas) return []
  const names = convocatoria.value.ofertas.map(o => o.sede?.nombre).filter(n => n)
  return [...new Set(names)]
})

const groupedCargos = computed(() => {
  if (!convocatoria.value?.ofertas) return []
  const groups = {}
  convocatoria.value.ofertas.forEach(o => {
    const cargoName = o.cargo?.nombre
    if (!groups[cargoName]) {
      groups[cargoName] = {
        nombre: cargoName,
        sedes: [],
        vacantes: 0
      }
    }
    groups[cargoName].sedes.push(o.sede?.nombre)
    groups[cargoName].vacantes += (o.vacantes || 1)
  })
  return Object.values(groups)
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  // Si la fecha ya viene con T (formato ISO), nos quedamos solo con la parte de la fecha
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  const date = new Date(cleanDate + 'T12:00:00')

  if (isNaN(date.getTime())) return dateStr // Fallback si sigue fallando

  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goToPostulacion = () => {
  router.push(`/postular?convocatoria=${convocatoria.value.id}`)
}

const loadConvocatoria = async () => {
  loading.value = true
  try {
    const res = await api.get(`/convocatorias/${route.params.id}/detalle`)
    convocatoria.value = res.data
  } catch (error) {
    console.error('Error loading convocatoria:', error)
    convocatoria.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadConvocatoria)
</script>

<style scoped>
.convocatoria-detalle-page {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.header-gradient {
  background: linear-gradient(135deg, #663399 0%, #009999 100%);
}

.contenido-detalle {
  font-size: 1rem;
  line-height: 1.8;
  color: #374151;
}

.contenido-detalle :deep(h1),
.contenido-detalle :deep(h2),
.contenido-detalle :deep(h3) {
  color: #663399;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.contenido-detalle :deep(h1) { font-size: 1.75rem; }
.contenido-detalle :deep(h2) { font-size: 1.5rem; }
.contenido-detalle :deep(h3) { font-size: 1.25rem; }

.contenido-detalle :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.contenido-detalle :deep(ol) {
  list-style-type: decimal;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.contenido-detalle :deep(li) {
  margin-bottom: 0.5rem;
}

.contenido-detalle :deep(p) {
  margin-bottom: 1rem;
}

.contenido-detalle :deep(strong) {
  color: #1f2937;
}
</style>
