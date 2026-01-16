<template>
  <div class="bolivia-map-container">
    <!-- Opción Nacional (Banner Superior) -->
    <div
      class="nacional-banner cursor-pointer transition-all q-pa-sm rounded-lg flex items-center justify-center gap-3 q-mb-md"
      :class="(store.sedeActiva?.toLowerCase().includes('central') || store.sedeActiva?.toLowerCase().includes('nacional') || store.sedeActiva?.toLowerCase().includes('bolivia')) ? 'selected bg-teal-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      @click="selectNacional"
    >
      <q-icon name="public" size="sm" />
      <div class="text-weight-bold">CONVOCATORIA NACIONAL / CENTRAL</div>
      <q-badge v-if="nacionalOffersCount > 0" color="orange" floating>{{ nacionalOffersCount }}</q-badge>
    </div>

    <!-- Mapa Interactivo SVG (GeoJSON) -->
    <div class="relative-position">
      <div v-if="loadingMap" class="text-center py-xl q-my-xl">
        <q-spinner-dots color="primary" size="4em" />
        <div class="text-gray-400 q-mt-sm">Cargando mapa geográfico...</div>
      </div>

      <svg
        v-else
        :viewBox="`0 0 ${width} ${height}`"
        class="bolivia-map"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g class="regions">
          <path
            v-for="feature in mapPaths"
            :key="feature.properties.id"
            :d="feature.path"
            :class="getSedeClass(feature.properties.name)"
            @click="selectSede(feature.properties.name)"
            @mouseenter="hoveredSede = feature.properties.name"
            @mouseleave="hoveredSede = null"
          >
            <title>{{ feature.properties.name }}</title>
          </path>
        </g>

        <!-- Labels (Calculated from centroids) -->
        <g class="labels" pointer-events="none">
          <text
            v-for="feature in mapPaths"
            :key="'label-' + feature.properties.id"
            :x="feature.centroid[0]"
            :y="feature.centroid[1]"
            class="map-label"
            text-anchor="middle"
          >
            {{ formatDisplayName(feature.properties.name) }}
          </text>
        </g>
      </svg>

      <!-- Tooltip / Info Overlay -->
      <div v-if="hoveredSede" class="map-tooltip shadow-5 rounded-borders">
        {{ formatDisplayName(hoveredSede) }}
      </div>
    </div>

    <!-- Legend -->
    <div class="map-legend q-mt-md">
      <div class="legend-item">
        <span class="legend-dot active"></span>
        <span>Con ofertas</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot inactive"></span>
        <span>Sin ofertas</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot selected"></span>
        <span>Seleccionada</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import * as d3 from 'd3-geo'
import boliviaData from 'src/assets/bo.js'

const emit = defineEmits(['select-sede'])
const store = usePostulacionStore()

// SVG Dimensions
const width = 400
const height = 450

const boliviaGeoJSON = ref(boliviaData)
const loadingMap = ref(false)
const hoveredSede = ref(null)

// D3 Logic (Fidelity Total request: geoIdentity + reflectY)
const projection = d3.geoIdentity().reflectY(true).fitSize([width, height], boliviaData)
const pathGenerator = d3.geoPath().projection(projection)

onMounted(() => {
  // Ya está ajustado en el setup para evitar problemas de reactividad con computeds
})

const normalizeDept = (name) => {
  if (!name) return ''
  let n = name.toLowerCase().trim()
  if (n === 'el beni') return 'beni'
  return n
}

const formatDisplayName = (name) => {
  if (!name) return ''
  return name.replace('El Beni', 'Beni')
}

// Processed paths for rendering
const mapPaths = computed(() => {
  if (!boliviaGeoJSON.value) return []
  return boliviaGeoJSON.value.features.map((feature) => {
    return {
      properties: feature.properties,
      path: pathGenerator(feature),
      centroid: pathGenerator.centroid(feature),
    }
  })
})

const sedesConOfertas = computed(() => {
  return store.ofertasActivas
    .map((s) => normalizeDept(s.departamento))
    .filter(d => d && d !== 'nacional')
})

const nacionalOffersCount = computed(() => {
  const central = store.ofertasActivas.find((s) =>
    s.departamento === 'Nacional'
  )
  return central?.cargos?.length || 0
})

const getSedeClass = (name) => {
  if (!name) return 'map-region'
  const n = normalizeDept(name)

  // Check if any active sede has this department assigned
  const hasOffers = sedesConOfertas.value.includes(n)

  // Compare with active department in store
  const isSelected = normalizeDept(store.sedeActiva) === n

  return {
    'map-region': true,
    'has-offers': hasOffers,
    'no-offers': !hasOffers,
    'is-selected': isSelected,
  }
}

const selectSede = (name) => {
  const n = normalizeDept(name)
  const hasOffers = sedesConOfertas.value.includes(n)

  if (hasOffers) {
    // We set the name as it comes for display/filter consistency
    const displayName = formatDisplayName(name)
    store.setSedeActiva(displayName)
    emit('select-sede', displayName)
  }
}

const selectNacional = () => {
  const hasNacionalOffers = store.ofertasActivas.some(s => s.departamento === 'Nacional')
  if (hasNacionalOffers) {
    store.setSedeActiva('Nacional')
    emit('select-sede', 'Nacional')
  }
}
</script>

<style scoped>
.bolivia-map-container {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
}

.nacional-banner {
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nacional-banner.selected {
  border-color: #14b8a6;
  transform: translateY(-2px);
}

.bolivia-map {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
}

.map-region {
  fill: #e5e7eb;
  stroke: #ffffff;
  stroke-width: 1;
  transition: all 0.4s ease;
  cursor: default;
}

.map-region.has-offers {
  fill: #7c3aed; /* Purple-600 */
  cursor: pointer;
  fill-opacity: 0.8;
}

.map-region.has-offers:hover {
  fill: #6d28d9;
  fill-opacity: 1;
  transform: scale(1.01);
  filter: url(#glow);
}

.map-region.no-offers {
  fill: #9ca3af;
  fill-opacity: 0.3;
}

.map-region.is-selected {
  fill: #14b8a6 !important; /* Teal-500 */
  fill-opacity: 1;
  stroke-width: 2;
  stroke: #ffffff;
}

.map-label {
  font-size: 10px;
  font-weight: 700;
  fill: #374151;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  pointer-events: none;
  user-select: none;
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4b5563;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.legend-dot.active { background: #7c3aed; }
.legend-dot.inactive { background: #9ca3af; opacity: 0.5; }
.legend-dot.selected { background: #14b8a6; }

/* Responsive adjustments */
@media (max-width: 600px) {
  .map-label {
    font-size: 8px;
  }
}
</style>
