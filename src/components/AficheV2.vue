<template>
  <div
    class="afiche-container shadow-2xl"
    :id="id"
    :style="aficheStyles"
  >
    <!-- 1. HEADER (FIXED TOP) -->
    <div class="afiche-header">
      <img src="~assets/logo_unitepc.png" class="afiche-logo" />
      <div class="text-center w-full">
        <h2 class="main-title text-uppercase">REQUERIMIENTO DE PERSONAL</h2>
        <h3 class="area-title text-uppercase" :style="titleScaleStyle">
          PARA {{ titulo || '[ÁREA]' }}
        </h3>
        <!-- SEDE BANNER -->
        <div v-if="singleSede" class="sede-banner-container animate-fade-in">
          <div class="sede-banner-line"></div>
          <div class="sede-banner-text">SEDE {{ singleSede }}</div>
          <div class="sede-banner-line"></div>
        </div>
      </div>
    </div>

    <!-- 2. CONTENT (FLEX FLOW) -->
    <div class="afiche-body">
      <!-- INVITATION TEXT -->
      <p class="invitation-text">
        {{ truncateDesc(descripcion) || 'La Universidad Técnica Privada Cosmos invita a profesionales con formación en el área a postular para el puesto respectivo en nuestras nuevas oficinas.' }}
      </p>

      <!-- SECTION: CARGO -->
      <div class="section-container" v-if="hasCargos">
        <div class="section-label">
          <span class="label-box">I.</span> CARGO:
        </div>

        <div class="cargos-list docs-list" :class="{ 'multi-column': useGridForCargos }">
          <div v-for="(sedes, sedeId) in groupedOfertas" :key="sedeId" class="sede-group">
            <div v-if="Object.keys(groupedOfertas).length > 1" class="sede-group-title text-uppercase">
               {{ getSedeName(sedeId) }}
            </div>
            <div class="cargos-items">
              <div v-for="of in sedes" :key="of.cargo_id" class="cargo-item doc-item">
                <span class="bullet"></span>
                <span class="item-main-text">{{ getCargoName(of.cargo_id) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION: REQUISITOS MINIMOS -->
      <div v-if="requisitosIds.length > 0" class="section-container animate-fade-in">
        <div class="section-label">
          <span class="label-box">II.</span> REQUISITOS MÍNIMOS:
        </div>
        <div class="docs-list" :class="{ 'multi-column': useGridForReqs }">
          <div v-for="rid in requisitosIds" :key="rid" class="doc-item">
            <span class="bullet"></span>
            <div class="doc-text">
              <span class="item-main-text text-uppercase">{{ getReqName(rid) }}:</span>
              <span v-if="requisitosAfiche[rid]" class="item-sub-text">
                {{ requisitosAfiche[rid] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION: DOCUMENTACION REQUERIDA -->
      <div class="section-container">
        <div class="section-label">
          <span class="label-box">III.</span> DOCUMENTACIÓN REQUERIDA:
        </div>
        <div class="docs-list standard-docs">
          <div class="doc-item">
            <span class="bullet"></span>
            <span class="item-main-text">Carta de postulación dirigida a Jefatura de Talento Humano.</span>
          </div>
          <div class="doc-item">
            <span class="bullet"></span>
            <span class="item-main-text">Currículum Vitae actualizado con respaldos digitales.</span>
          </div>
          <div class="doc-item">
            <span class="bullet"></span>
            <span class="item-main-text">Copia de Cédula de Identidad y Títulos Académicos.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. FOOTER (FIXED BOTTOM) -->
    <div class="afiche-footer">
      <div class="footer-info-bar">
        <div class="footer-text">
          <div class="footer-title">RECEPCIÓN DE POSTULACIONES</div>
          <p class="footer-desc">
            Postulación únicamente vía plataforma <strong>SISPO</strong> UNITEPC.
          </p>
          <div v-if="fechaCierre" class="deadline-literal">
            <strong>Plazo:</strong> {{ formatDateLiteral(fechaCierre) }} - {{ horaLimite || '18:00' }}
          </div>
        </div>
        <div class="footer-qr">
          <qrcode-vue :value="qrValue" :size="85" level="H" class="qr-code" />
          <div class="qr-hint text-uppercase">Escanea para postular</div>
        </div>
      </div>
      <div class="footer-social-img">
        <img src="~assets/borde_unitepc.png" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  id: { type: String, default: 'afiche-render' },
  titulo: String,
  descripcion: String,
  ofertas: { type: Array, default: () => [] },
  requisitosIds: { type: Array, default: () => [] },
  requisitosAfiche: { type: Object, default: () => ({}) },
  fechaCierre: String,
  horaLimite: String,
  catalogSedes: { type: Array, default: () => [] },
  catalogCargos: { type: Array, default: () => [] },
  catalogRequisitos: { type: Array, default: () => [] },
  fontSizeScale: { type: Number, default: 1 },
  qrValue: { type: String, default: 'https://sispo.unitepc.edu.bo' }
})

const hasCargos = computed(() => props.ofertas.length > 0)

const groupedOfertas = computed(() => {
  const groups = {}
  props.ofertas.forEach(o => {
    if (!groups[o.sede_id]) groups[o.sede_id] = []
    groups[o.sede_id].push(o)
  })
  return groups
})

const singleSede = computed(() => {
  const ids = Object.keys(groupedOfertas.value)
  if (ids.length === 1) return getSedeName(ids[0])
  return null
})

// LOGIC: Use 2 columns if list is too long
const totalCargoItems = computed(() => props.ofertas.length + Object.keys(groupedOfertas.value).length)
const useGridForCargos = computed(() => totalCargoItems.value > 8)
const useGridForReqs = computed(() => props.requisitosIds.length > 6)

// LOGIC: Dynamic Scaling for spacing
const totalContentScore = computed(() => {
  return totalCargoItems.value + props.requisitosIds.length + (props.descripcion?.length / 100 || 0)
})

const aficheStyles = computed(() => {
  const gap = totalContentScore.value > 20 ? '10px' : '20px'
  return {
    '--afiche-scale': props.fontSizeScale,
    '--section-gap': gap
  }
})

const titleScaleStyle = computed(() => {
  const len = props.titulo?.length || 0
  if (len > 35) return { fontSize: 'calc(1.6 * var(--base-fs))' }
  if (len > 20) return { fontSize: 'calc(1.9 * var(--base-fs))' }
  return {}
})

function getSedeName (id) {
  return props.catalogSedes.find(s => s.id === parseInt(id))?.nombre || ''
}

function getCargoName (id) {
  return props.catalogCargos.find(c => c.id === parseInt(id))?.nombre || ''
}

function getReqName (id) {
  return props.catalogRequisitos.find(r => r.id === parseInt(id))?.nombre || ''
}

function truncateDesc (val) {
  if (!val) return ''
  if (val.length > 450) return val.substring(0, 447) + '...'
  return val
}

function formatDateLiteral (dateStr) {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '...'

  try {
    const safeDate = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`
    const date = new Date(safeDate)

    if (isNaN(date.getTime())) return '...'

    const day = date.getDate()
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    if (!day || !month || !year) return '...'

    return `${day} de ${month} de ${year}`
  } catch {
    return '...'
  }
}
</script>

<style scoped>
.afiche-container {
  background: white;
  width: 794px; /* A4/Carta proportion */
  min-height: 1123px;
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  --base-fs: calc(16.5px * var(--afiche-scale, 1));
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  font-variant-ligatures: none;
  flex-shrink: 0;
  backface-visibility: hidden;
}

.afiche-container * {
  box-sizing: border-box;
}

.afiche-header {
  padding: 40px 50px 10px 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.afiche-logo {
  width: 320px;
  margin-bottom: 20px;
}

.main-title {
  font-size: calc(1.4 * var(--base-fs));
  font-weight: 900;
  color: #1a202c;
  margin: 0;
  line-height: 1.1;
  text-align: center;
  font-family: 'Outfit', sans-serif;
}

.area-title {
  font-size: calc(2.2 * var(--base-fs));
  font-weight: 950;
  color: #1a202c;
  margin: 8px 0 15px 0;
  line-height: 1.05;
  text-align: center;
  padding: 0 40px;
  font-family: 'Outfit', sans-serif;
  transition: font-size 0.3s ease;
  overflow-wrap: break-word;
  word-wrap: break-word;
  max-width: 100%;
}

.sede-banner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 5px;
  width: 100%;
  justify-content: center;
}

.sede-banner-line {
  width: 280px;
  height: 2px;
  background-color: #008080;
}

.sede-banner-text {
  color: #008080;
  font-weight: 900;
  padding: 5px 0;
  font-size: calc(1.2 * var(--base-fs));
  font-family: 'Outfit', sans-serif;
}

.afiche-body {
  flex-grow: 1;
  padding: 0 65px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.afiche-body > * {
  margin-bottom: var(--section-gap, 20px);
}

.afiche-body > *:last-child {
  margin-bottom: 0;
}

.invitation-text {
  font-size: calc(0.95 * var(--base-fs));
  color: #4a5568;
  text-align: justify;
  line-height: 1.35;
  font-weight: 600;
  margin-top: 5px;
  margin-bottom: 5px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.section-container {
  margin-bottom: 2px;
}

.section-label {
  font-size: calc(1.1 * var(--base-fs));
  font-weight: 900;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-family: 'Outfit', sans-serif;
}

.label-box {
  background: #663399;
  color: white;
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 0.9em;
}

/* STABLE MULTI COLUMN LOGIC (Flex-based for perfect capture) */
.multi-column {
  display: flex !important;
  flex-wrap: wrap;
  column-gap: 30px;
  row-gap: 10px;
}

.multi-column > * {
  width: calc(50% - 15px);
  break-inside: avoid;
}

.sede-group-title {
  color: #008080;
  font-weight: 900;
  font-size: calc(0.85 * var(--base-fs));
  border-left: 5px solid #008080;
  padding-left: 12px;
  margin: 10px 0 6px 0;
}

.cargo-item {
  line-height: 1.25;
  margin-bottom: 8px; /* Standardize with doc-item */
}

.bullet {
  width: 8px;
  height: 8px;
  background: #663399;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: calc(0.3 * var(--base-fs)); /* Dynamic alignment based on font size */
}

.docs-list {
  padding-left: 20px;
  font-size: calc(1 * var(--base-fs));
  color: #1a202c;
  line-height: 1.3;
}

.doc-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word; /* To handle strings like ssssssssss */
}

.doc-text {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}

.item-main-text {
  font-weight: 800;
  font-size: calc(1 * var(--base-fs));
  color: #1a202c;
}

.item-sub-text {
  font-weight: 600;
  font-size: calc(0.95 * var(--base-fs));
  color: #4a5568;
  display: inline;
  white-space: pre-wrap;
}

.afiche-footer {
  height: auto;
  padding-top: 25px;
  padding-bottom: 110px;
  flex-shrink: 0;
  position: relative;
}

.footer-info-bar {
  display: flex;
  align-items: center;
  padding: 0 45px;
  gap: 40px;
  position: relative;
  z-index: 20;
}

.footer-text {
  flex-grow: 1;
  border-left: 12px solid #663399;
  padding-left: 25px;
}

.footer-title {
  color: #663399;
  font-weight: 950;
  font-size: calc(1.15 * var(--base-fs));
  font-family: 'Outfit', sans-serif;
}

.footer-desc {
  font-size: calc(0.85 * var(--base-fs));
  color: #4a5568;
  margin: 3px 0;
  font-weight: 600;
}

.deadline-literal {
  color: #1a202c;
  font-size: calc(0.9 * var(--base-fs));
  margin-top: 8px;
}

.footer-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  min-width: 120px;
}

.qr-hint {
  font-size: 8px;
  font-weight: 950;
  color: #718096;
  margin-top: 8px;
  letter-spacing: 0.5px;
}

.footer-social-img {
  width: 100%;
  height: 110px;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
}

.footer-social-img img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

/* MICRO ANIMATIONS */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
</style>
