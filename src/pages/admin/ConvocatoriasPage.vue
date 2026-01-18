<template>
  <q-page class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Convocatorias Externas</h1>
      <q-btn
        label="Nueva Convocatoria"
        icon="campaign"
        style="background-color: #009999; color: white;"
        @click="openDialog()"
        rounded
        unelevated
        class="q-px-md shadow-2"
      />
    </div>

    <!-- Table of existing convocatorias -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      bordered
      class="rounded-2xl shadow-lg overflow-hidden"
    >
      <template v-slot:header="props">
        <q-tr :props="props" style="background-color: #663399; color: white;">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-ofertas="props">
        <q-td :props="props">
          <div class="text-xs">
            <q-chip v-for="(o, i) in props.row.ofertas?.slice(0, 3)" :key="i" size="xs" outline color="primary">
              {{ o.cargo?.nombre }} ({{ o.sede?.nombre }})
            </q-chip>
            <span v-if="props.row.ofertas?.length > 3" class="text-gray-400"> +{{ props.row.ofertas.length - 3 }} más</span>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-fecha="props">
        <q-td :props="props" class="text-center">
          <div class="font-bold text-xs">{{ formatDate(props.row.fecha_inicio) }}</div>
          <div class="text-red-600 font-bold text-xs">al {{ formatDate(props.row.fecha_cierre) }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="flex gap-1 justify-end">
          <q-btn flat round color="teal" icon="visibility" size="sm" @click="viewAfiche(props.row)">
             <q-tooltip>Ver Afiche</q-tooltip>
          </q-btn>
          <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
             <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
             <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- NEW RICH BUILDER DIALOG -->
    <q-dialog v-model="dialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-gray-100 flex flex-col no-wrap">
        <!-- HEADER FIXED -->
        <q-toolbar style="background-color: #663399; color: white;" class="q-py-md shadow-2 relative" :class="$q.screen.lt.md ? 'flex-col items-center gap-4' : ''">
          <div class="flex items-center gap-2">
            <q-btn flat round dense icon="close" v-close-popup />
            <q-toolbar-title class="text-weight-bold text-subtitle1">
              {{ isViewMode ? 'VISTA DE AFICHE' : (isEdit ? 'EDITANDO CONVOCATORIA' : 'NUEVA CONVOCATORIA') }}
            </q-toolbar-title>
          </div>

          <q-space v-if="!$q.screen.lt.md" />

          <div class="flex gap-2" :class="$q.screen.lt.md ? 'w-full justify-around' : ''">
            <q-btn v-if="isViewMode || isEdit" :label="$q.screen.lt.sm ? '' : 'Imagen (HD)'" color="teal" unelevated icon="image" @click="downloadImage" rounded />
            <q-btn v-if="isViewMode || isEdit" :label="$q.screen.lt.sm ? '' : 'PDF'" color="deep-orange" unelevated icon="picture_as_pdf" @click="downloadPDF" rounded />
            <q-btn v-if="!isViewMode" label="Publicar" color="white" text-color="primary" unelevated icon="rocket_launch" :loading="saving" @click="save" rounded />
          </div>
        </q-toolbar>

        <!-- MAIN SCROLLABLE SECTION -->
        <q-card-section class="flex-1 scroll p-4 row q-col-gutter-md">
          <!-- LEFT: CONFIG PANEL -->
          <div v-if="!isViewMode" class="col-12 col-md-4 pr-2">
            <div class="space-y-4 pb-12">
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div class="text-h6 text-gray-700 mb-4 flex items-center gap-2">
                  <q-icon name="info" color="primary" /> Información de Encabezado
                </div>
                <q-input v-model="form.titulo" label="Título (Eje: MARKETING Y VENTAS)" outlined dense class="mb-4 text-uppercase" placeholder="MARKETING Y VENTAS" />
                <q-input v-model="form.descripcion" label="Descripción / Invitación" type="textarea" outlined dense rows="3" placeholder="La Universidad Técnica Privada Cosmos invita a profesionales..." />

                <div class="grid grid-cols-1 gap-3 mt-4">
                  <q-input v-model="form.fecha_inicio" label="Inicia recepción" type="date" outlined dense stack-label />
                  <q-input v-model="form.fecha_cierre" label="Plazo de postulación" type="date" outlined dense stack-label />
                  <q-input v-model="form.hora_limite" label="Hora de Cierre" type="time" outlined dense stack-label hint="Hora límite de recepción" />
                </div>

                <q-input
                  v-model="form.codigo_interno"
                  label="Código de Control Interno"
                  outlined
                  dense
                  class="mt-4 text-weight-bold"
                  bg-color="blue-1"
                  color="primary"
                  hint="Se autogenera según los cargos seleccionados."
                >
                  <template v-slot:prepend>
                    <q-icon name="pin" />
                  </template>
                </q-input>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div class="flex flex-col gap-3 mb-4">
                  <div class="text-h6 text-gray-700 flex items-center gap-2">
                    <q-icon name="apartment" color="primary" /> Ofertas
                  </div>
                  <q-btn-toggle v-model="builderMode" toggle-color="primary" flat dense spread :options="[{label: 'Sede', value: 'sede', icon: 'location_on'},{label: 'Cargo', value: 'cargo', icon: 'badge'}]" />
                </div>

                <div class="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                  <div class="flex flex-col gap-3">
                    <template v-if="builderMode === 'sede'">
                      <div class="flex items-center gap-2">
                        <q-select v-model="buildOne" :options="catalogSedes" option-label="nombre" label="Sede" outlined dense emit-value map-options option-value="id" bg-color="white" class="flex-1" />
                        <q-btn icon="add" color="teal" flat round dense @click="showQuickSede = true" />
                      </div>
                      <div class="flex items-center gap-2">
                        <q-select v-model="buildMany" :options="catalogCargos" option-label="nombre" label="Cargos" outlined dense multiple use-chips emit-value map-options option-value="id" bg-color="white" class="flex-1" />
                        <q-btn icon="add" color="teal" flat round dense @click="showQuickCargo = true" />
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex items-center gap-2">
                        <q-select v-model="buildOne" :options="catalogCargos" option-label="nombre" label="Cargo" outlined dense emit-value map-options option-value="id" bg-color="white" class="flex-1" />
                        <q-btn icon="add" color="teal" flat round dense @click="showQuickCargo = true" />
                      </div>
                      <div class="flex items-center gap-2">
                        <q-select v-model="buildMany" :options="catalogSedes" option-label="nombre" label="Sedes" outlined dense multiple use-chips emit-value map-options option-value="id" bg-color="white" class="flex-1" />
                        <q-btn icon="add" color="teal" flat round dense @click="showQuickSede = true" />
                      </div>
                    </template>
                    <q-btn icon="add_circle" color="primary" class="full-width" label="Añadir a lista" unelevated @click="addOffersFromBuilder" rounded />
                  </div>
                </div>

                <div class="mt-6">
                  <div class="text-subtitle2 text-gray-500 mb-2 font-black uppercase text-[10px]">Lista de Cargos:</div>
                  <div class="space-y-2">
                    <div v-for="(o, idx) in form.ofertas" :key="idx" class="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="text-[10px] uppercase font-black">
                        <div class="text-gray-800">{{ getCargoName(o.cargo_id) }}</div>
                        <div class="text-primary">{{ getSedeName(o.sede_id) }}</div>
                      </div>
                      <q-btn icon="close" size="xs" flat round color="negative" @click="form.ofertas.splice(idx, 1)" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div class="text-h6 text-gray-700 mb-4 flex items-center gap-2">
                  <q-icon name="list_alt" color="primary" /> Requisitos
                </div>
                <div class="space-y-3">
                  <div v-for="req in catalogRequisitos" :key="req.id" class="border rounded-2xl p-3 bg-gray-50/50 hover:bg-gray-50 transition-all border-gray-100 flex flex-col gap-2 shadow-sm">
                    <div class="flex items-center gap-2 cursor-pointer" @click="toggleReq(req.id)">
                      <q-checkbox :model-value="form.config_requisitos_ids.includes(req.id)" dense color="primary" />
                      <div class="text-[11px] font-black uppercase text-gray-700 flex-1">{{ req.nombre }}</div>

                      <q-btn flat round dense icon="info" color="grey-5" size="xs" @click.stop="() => {}">
                          <q-menu anchor="top middle" self="bottom middle" class="shadow-2xl rounded-2xl border border-gray-100">
                             <div class="p-4 bg-gray-50 border-b">
                                <div class="text-xs font-black text-primary uppercase">Estructura del Documento</div>
                                <div class="text-sm font-bold text-gray-800">{{ req.nombre }}</div>
                             </div>
                             <div class="p-4 space-y-3 min-w-[250px]">
                                <div v-if="req.campos?.length > 0">
                                   <div class="text-[10px] font-bold text-gray-400 uppercase mb-1">Cuestionario</div>
                                   <div class="space-y-1">
                                      <div v-for="(f, fi) in req.campos" :key="fi" class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded flex items-center gap-2">
                                         <q-icon name="edit_note" size="14px" /> {{ f.label }}
                                      </div>
                                   </div>
                                </div>
                                <div v-if="req.config_archivos?.length > 0">
                                   <div class="text-[10px] font-bold text-gray-400 uppercase mb-1">Archivos Requeridos</div>
                                   <div class="space-y-1">
                                      <div v-for="(a, ai) in req.config_archivos" :key="ai" class="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded flex items-center gap-2">
                                         <q-icon name="file_present" size="14px" /> {{ a.label }}
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </q-menu>
                      </q-btn>
                    </div>

                    <div v-if="form.config_requisitos_ids.includes(req.id)" class="ml-7 animate-fade-in">
                       <q-input
                          v-model="form.requisitos_afiche[req.id]"
                          placeholder="Ejem: en Ciencias de la Ingeniería..."
                          dense
                          outlined
                          type="textarea"
                          autogrow
                          bg-color="white"
                          class="rounded-lg shadow-inner"
                          input-class="text-[10px] font-bold text-primary"
                        >
                          <template v-slot:prepend>
                             <q-icon name="edit" size="xs" color="grey-4" />
                          </template>
                       </q-input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: OFFICIAL POSTER PREVIEW (AFICHE) -->
          <div :class="isViewMode ? 'col-12 flex flex-col items-center bg-gray-800' : 'col-12 col-md-8 flex flex-col'"
               :style="isViewMode ? 'min-height: calc(100vh - 80px)' : ''">
              <div
                ref="previewContainer"
                class="afiche-preview-wrapper p-4 md:p-10"
                :class="isViewMode ? 'w-full flex justify-center' : 'sticky top-0'"
              >
                <!-- Scaling wrap -->
                <div :style="previewStyle">
                  <AficheV2
                    id="afiche-capture"
                    :titulo="form.titulo"
                    :descripcion="form.descripcion"
                    :ofertas="form.ofertas"
                    :requisitos-ids="form.config_requisitos_ids"
                    :requisitos-afiche="form.requisitos_afiche"
                    :fecha-cierre="form.fecha_cierre"
                    :hora-limite="form.hora_limite"
                    :catalog-sedes="catalogSedes"
                    :catalog-cargos="catalogCargos"
                    :catalog-requisitos="catalogRequisitos"
                    :font-size-scale="aficheFontScale"
                    :qr-value="qrValue"
                  />
                </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- HIDDEN CONTAINER FOR PERFECT CAPTURE (Avoiding UI transforms) -->
    <div style="position: fixed; top: 0; left: 0; width: 794px; height: 1123px; z-index: -1000; opacity: 0; pointer-events: none; overflow: hidden;">
      <AficheV2
        id="afiche-perfect-capture"
        :titulo="form.titulo"
        :descripcion="form.descripcion"
        :ofertas="form.ofertas"
        :requisitos-ids="form.config_requisitos_ids"
        :requisitos-afiche="form.requisitos_afiche"
        :fecha-cierre="form.fecha_cierre"
        :hora-limite="form.hora_limite"
        :catalog-sedes="catalogSedes"
        :catalog-cargos="catalogCargos"
        :catalog-requisitos="catalogRequisitos"
        :font-size-scale="aficheFontScale"
        :qr-value="qrValue"
      />
    </div>

    <!-- Quick Add Sede Dialog -->
    <q-dialog v-model="showQuickSede" persistent>
      <q-card style="min-width: 350px" class="rounded-2xl p-4">
        <div class="text-h6 text-primary mb-4">Nueva Sede Rápida</div>
        <div class="space-y-4">
          <q-input v-model="quickSede.nombre" label="Nombre Sede" outlined dense />
          <q-input
            v-model="quickSede.sigla"
            label="Sigla (Ej: CBBA, LPZ)"
            outlined
            dense
            class="text-uppercase"
            @update:model-value="manualSiglaSede = true"
          />
          <q-select v-model="quickSede.departamento" :options="['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando']" label="Departamento" outlined dense />
        </div>
        <q-card-actions align="right" class="mt-4">
          <q-btn flat label="Cancelar" v-close-popup rounded />
          <q-btn label="Guardar" color="primary" @click="saveQuickSede" :loading="quickSaving" rounded unelevated />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Quick Add Cargo Dialog -->
    <q-dialog v-model="showQuickCargo" persistent>
      <q-card style="min-width: 350px" class="rounded-2xl p-4">
        <div class="text-h6 text-primary mb-4">Nuevo Cargo Rápido</div>
        <div class="space-y-4">
          <q-input v-model="quickCargo.nombre" label="Nombre del Cargo" outlined dense />
          <q-input
            v-model="quickCargo.sigla"
            label="Sigla (Ej: DOC, DIR, ADM)"
            outlined
            dense
            class="text-uppercase"
            @update:model-value="manualSiglaCargo = true"
          />
        </div>
        <q-card-actions align="right" class="mt-4">
          <q-btn flat label="Cancelar" v-close-popup rounded />
          <q-btn label="Guardar" color="primary" @click="saveQuickCargo" :loading="quickSaving" rounded unelevated />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import AficheV2 from 'components/AficheV2.vue'
import * as htmlToImage from 'html-to-image'
import { jsPDF } from 'jspdf'

const $q = useQuasar()
const rows = ref([])
const catalogSedes = ref([])
const catalogCargos = ref([])
const catalogRequisitos = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const isViewMode = ref(false)
const previewContainer = ref(null)
const containerWidth = ref(800)

const previewStyle = computed(() => {
  // 794 is the base width of AficheV2
  // We add some margin and padding in our calculation (target ~850px)
  const scale = containerWidth.value < 850 ? (containerWidth.value / 850) : 1
  return {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    width: '794px',
    margin: '0 auto',
    height: 'auto'
  }
})

const updateWidth = () => {
  if (previewContainer.value) {
    containerWidth.value = previewContainer.value.offsetWidth
  }
}

watch(dialog, (val) => {
  if (val) setTimeout(updateWidth, 100)
})

const builderMode = ref('sede')
const buildOne = ref(null)
const buildMany = ref([])

// Quick Add States
const showQuickSede = ref(false)
const showQuickCargo = ref(false)
const quickSaving = ref(false)
const quickSede = ref({ nombre: '', sigla: '', departamento: '' })
const quickCargo = ref({ nombre: '', sigla: '' })
const manualSiglaSede = ref(false)
const manualSiglaCargo = ref(false)

const helperGenerarSigla = (val) => {
  if (!val) return ''
  const words = val.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3)

  if (words.length === 0) return val.substring(0, 3).toUpperCase()
  if (words.length === 1) return words[0].substring(0, 3)

  return words.slice(0, 3).map(w => w.substring(0, 3)).join('-')
}

watch(() => quickSede.value.nombre, (newVal) => {
  if (!manualSiglaSede.value) quickSede.value.sigla = helperGenerarSigla(newVal)
})

watch(() => quickCargo.value.nombre, (newVal) => {
  if (!manualSiglaCargo.value) quickCargo.value.sigla = helperGenerarSigla(newVal)
})

watch(builderMode, () => {
  buildOne.value = null
  buildMany.value = []
})

const form = ref({ id: null, titulo: '', codigo_interno: '', descripcion: '', fecha_inicio: '', fecha_cierre: '', hora_limite: '23:59', ofertas: [], config_requisitos_ids: [], requisitos_afiche: {} })

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0]
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr
}


const qrValue = computed(() => form.value.id ? `https://postulacionesunitepc.xpertiaplus.com/#/postular/${form.value.id}` : 'https://postulacionesunitepc.xpertiaplus.com/#/postular')

const columns = [
  { name: 'codigo_interno', label: 'Código Interno', field: 'codigo_interno', sortable: true, align: 'left' },
  { name: 'titulo', label: 'Descripción de Convocatoria', field: 'titulo', sortable: true, align: 'left' },
  { name: 'ofertas', label: 'Cargos / Sedes', align: 'left' },
  { name: 'fecha', label: 'Plazo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

// Logic for automatic internal code generation
watch(() => form.value.ofertas, (newOffers) => {
  if (isEdit.value && form.value.codigo_interno) return // Don't overwrite on edit if it already has one

  if (!newOffers || newOffers.length === 0) {
    form.value.codigo_interno = ''
    return
  }

  const uniqueCargoIds = [...new Set(newOffers.map(o => o.cargo_id))]
  const uniqueSedeIds = [...new Set(newOffers.map(o => o.sede_id))]
  const year = new Date().getFullYear()

  let suffix = 'MULT'

  if (uniqueSedeIds.length === 1 && uniqueCargoIds.length > 1) {
    // Caso: Una sede, varios cargos -> Salir con Sigla de Sede
    const sede = catalogSedes.value.find(s => s.id === uniqueSedeIds[0])
    suffix = sede?.sigla || 'SEDE'
  } else if (uniqueCargoIds.length === 1) {
    // Caso: Un cargo (una o varias sedes) -> Salir con Sigla de Cargo
    const cargo = catalogCargos.value.find(c => c.id === uniqueCargoIds[0])
    suffix = cargo?.sigla || 'CARGO'
  }

  form.value.codigo_interno = `CONV-${year}-${suffix}`.toUpperCase()
}, { deep: true, immediate: true }) // Added immediate to generate on open if already has offers

const loadData = async () => {
  loading.value = true
  try {
    const [convRes, sedeRes, cargoRes, reqRes] = await Promise.all([api.get('/convocatorias'), api.get('/sedes'), api.get('/cargos'), api.get('/tipos-documento')])
    rows.value = convRes.data
    catalogSedes.value = sedeRes.data
    catalogCargos.value = cargoRes.data
    catalogRequisitos.value = reqRes.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando catálogos' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  isViewMode.value = false
  if (item) {
    isEdit.value = true
    form.value = {
      ...item,
      config_requisitos_ids: Array.isArray(item.config_requisitos_ids) ? item.config_requisitos_ids : [],
      requisitos_afiche: item.requisitos_afiche || {},
      ofertas: item.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || []
    }
  } else {
    isEdit.value = false
    form.value = { id: null, titulo: '', codigo_interno: '', descripcion: '', fecha_inicio: '', fecha_cierre: '', hora_limite: '23:59', ofertas: [], config_requisitos_ids: [], requisitos_afiche: {} }
  }
  buildOne.value = null; buildMany.value = []; dialog.value = true
}

const viewAfiche = (item) => {
  isViewMode.value = true
  form.value = {
    ...item,
    config_requisitos_ids: Array.isArray(item.config_requisitos_ids) ? item.config_requisitos_ids : [],
    requisitos_afiche: item.requisitos_afiche || {},
    ofertas: item.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || []
  }
  dialog.value = true
}

const addOffersFromBuilder = () => {
  if (!buildOne.value || (Array.isArray(buildMany.value) ? buildMany.value.length === 0 : !buildMany.value)) { $q.notify({ message: 'Completa la selección', color: 'orange' }); return }
  let countAdded = 0

  const many = Array.isArray(buildMany.value) ? buildMany.value : [buildMany.value]

  many.forEach(id => {
    let sId = builderMode.value === 'sede' ? buildOne.value : id
    let cId = builderMode.value === 'sede' ? id : buildOne.value
    if (!form.value.ofertas.find(o => o.sede_id === sId && o.cargo_id === cId)) {
      form.value.ofertas.push({ sede_id: sId, cargo_id: cId, vacantes: 1 }); countAdded++
    }
  })
  if (countAdded > 0) $q.notify({ message: `Se añadieron ${countAdded} combinaciones`, color: 'positive' })
  buildOne.value = null; buildMany.value = []
}

const saveQuickSede = async () => {
  if (!quickSede.value.nombre || !quickSede.value.sigla) return
  quickSaving.value = true
  try {
    const { data } = await api.post('/sedes', quickSede.value)
    catalogSedes.value.push(data)

    // Auto-select after creation
    if (builderMode.value === 'sede') {
      buildOne.value = data.id
    } else {
      if (!buildMany.value) buildMany.value = []
      buildMany.value.push(data.id)
    }

    showQuickSede.value = false
    quickSede.value = { nombre: '', sigla: '', departamento: '' }
    manualSiglaSede.value = false
    $q.notify({ type: 'positive', message: 'Sede creada y seleccionada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear sede' })
  } finally { quickSaving.value = false }
}

const saveQuickCargo = async () => {
  if (!quickCargo.value.nombre || !quickCargo.value.sigla) return
  quickSaving.value = true
  try {
    const { data } = await api.post('/cargos', quickCargo.value)
    catalogCargos.value.push(data)

    // Auto-select after creation
    if (builderMode.value === 'cargo') {
      buildOne.value = data.id
    } else {
      if (!buildMany.value) buildMany.value = []
      buildMany.value.push(data.id)
    }

    showQuickCargo.value = false
    quickCargo.value = { nombre: '', sigla: '' }
    manualSiglaCargo.value = false
    $q.notify({ type: 'positive', message: 'Cargo creado y seleccionado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear cargo' })
  } finally { quickSaving.value = false }
}

const toggleReq = (id) => {
  const idx = form.value.config_requisitos_ids.indexOf(id)
  if (idx > -1) {
    form.value.config_requisitos_ids.splice(idx, 1)
    if (form.value.requisitos_afiche[id]) delete form.value.requisitos_afiche[id]
  } else {
    form.value.config_requisitos_ids.push(id)
    if (!form.value.requisitos_afiche) form.value.requisitos_afiche = {}
  }
}

const getSedeName = (id) => catalogSedes.value.find(s => s.id == id)?.nombre || 'Sede'
const getCargoName = (id) => catalogCargos.value.find(c => c.id == id)?.nombre || 'Cargo'

const groupedOfertas = computed(() => {
  const groups = {}
  form.value.ofertas.forEach(o => { if (!groups[o.sede_id]) groups[o.sede_id] = []; groups[o.sede_id].push(o) })
  return groups
})

// DYNAMIC FONT SCALING LOGIC (Aggressive)
const aficheFontScale = computed(() => {
  let count = 0
  Object.values(groupedOfertas.value).forEach(list => {
    count += 1 // Sede Title
    count += list.length // Cargos
  })
  count += form.value.config_requisitos_ids.length // Requisitos

  if (count > 35) return 0.5
  if (count > 25) return 0.6
  if (count > 18) return 0.75
  if (count > 12) return 0.85
  if (count > 8) return 0.92
  return 1.0
})

const downloadPDF = async () => {
  const el = document.getElementById('afiche-perfect-capture')
  if (!el) return
  $q.loading.show({ message: 'Renderizando PDF Pro...' })
  try {
    await document.fonts.ready
    await new Promise(resolve => setTimeout(resolve, 800))

    const scale = 3
    const param = {
      height: 1123 * scale,
      width: 794 * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: '794px',
        height: '1123px',
        opacity: '1'
      },
      quality: 1,
      backgroundColor: '#ffffff',
      cacheBust: true
    }

    const dataUrl = await htmlToImage.toPng(el, param)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297)
    pdf.save(`Afiche_SISPO_${form.value.titulo || 'Convocatoria'}.pdf`)
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  } finally {
    $q.loading.hide()
  }
}

const downloadImage = async () => {
  const el = document.getElementById('afiche-perfect-capture')
  if (!el) return
  $q.loading.show({ message: 'Generando Imagen Ultra-HD...' })
  try {
    await document.fonts.ready
    await new Promise(resolve => setTimeout(resolve, 800))

    const scale = 3
    const param = {
      height: 1123 * scale,
      width: 794 * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: '794px',
        height: '1123px',
        opacity: '1'
      },
      quality: 1,
      backgroundColor: '#ffffff',
      cacheBust: true
    }

    const dataUrl = await htmlToImage.toPng(el, param)

    const link = document.createElement('a')
    link.download = `Afiche_SISPO_${form.value.titulo || 'Convocatoria'}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar imagen UHD' })
  } finally {
    $q.loading.hide()
  }
}

const save = async () => {
  if (!form.value.titulo || form.value.ofertas.length === 0 || !form.value.fecha_cierre || !form.value.fecha_inicio) {
    $q.notify({ message: 'Completa todos los campos obligatorios (Título, Ofertas, Inicio y Cierre)', color: 'negative' })
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/convocatorias/${form.value.id}`, form.value)
    } else {
      await api.post('/convocatorias', form.value)
    }
    $q.notify({ type: 'positive', message: '¡Convocatoria publicada con éxito!' })
    dialog.value = false
    loadData()
  } catch (error) {
    console.error(error)
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errors = error.response.data.errors
      const messages = Object.values(errors).flat().join('<br>')
      $q.notify({ type: 'negative', message: messages, html: true, multiLine: true })
    } else {
      $q.notify({ type: 'negative', message: 'Error al procesar la solicitud. Verifica los datos.' })
    }
  } finally {
    saving.value = false
  }
}


const confirmDelete = (item) => {
  $q.dialog({ title: 'Eliminar', message: `¿Estás seguro de eliminar "${item.titulo}"?`, cancel: true }).onOk(async () => {
    try { await api.delete(`/convocatorias/${item.id}`); loadData() } catch { $q.notify({ type: 'negative', message: 'Error' }) }
  })
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
  loadData()
})
</script>

<style scoped>
.afiche-preview-wrapper {
  transform-origin: top center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* CONTAINER WITH LETTER ASPECT RATIO (8.5 x 11) */
.afiche-container {
  background: white;
  width: 794px; /* Reference width (~93 DPI) */
  min-height: 1027px; /* Ensure at least full page, but can grow */
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  user-select: none;
  /* Font size is controlled by the scale multiplier */
  --base-fs: calc(16px * var(--afiche-scale, 1));
}

.afiche-container * {
  box-sizing: border-box;
}

/* COMPACT HEADER */
.afiche-header {
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 30px 50px 10px 50px; /* Reduced padding */
  flex-shrink: 0;
}

.afiche-logo {
  width: 320px;
  margin-bottom: 15px;
}

.main-title {
  font-size: calc(1.4 * var(--base-fs));
  font-weight: 900;
  color: #1a202c;
  margin: 0;
  line-height: 1.1;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.area-title {
  font-size: calc(2.2 * var(--base-fs));
  font-weight: 900;
  color: #1a202c;
  margin: 5px 0 10px 0;
  line-height: 1.1;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  overflow-wrap: anywhere;
  word-break: break-word;
  padding: 0 40px;
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
  width: 250px;
  height: 2px;
  background-color: #008080;
}

.sede-banner-text {
  color: #008080;
  font-weight: 900;
  padding: 4px 0;
  font-size: calc(1.15 * var(--base-fs));
  text-align: center;
}

/* SCALABLE BODY */
/* COMPACT BODY */
.afiche-body {
  flex-grow: 1;
  padding: 0 60px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Correct correlative flow */
}

.invitation-text {
  font-size: calc(1 * var(--base-fs));
  color: #4a5568;
  text-align: justify;
  line-height: 1.3;
  font-weight: 600;
  margin-bottom: calc(12px * var(--afiche-scale, 1)); /* Reduced margin */
  overflow-wrap: anywhere;
  word-break: break-all;
  max-width: 100%;
}

.section-container {
  margin-bottom: calc(10px * var(--afiche-scale, 1));
}

.section-label {
  font-size: calc(1.1 * var(--base-fs));
  font-weight: 900;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: calc(6px * var(--afiche-scale, 1));
}

.label-box {
  background: #663399;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
}

.sede-group-title {
  color: #008080;
  font-weight: 900;
  font-size: calc(0.9 * var(--base-fs));
  border-left: 5px solid #008080;
  padding-left: 12px;
  margin: 8px 0 6px 0;
}

.cargo-item {
  font-size: calc(1.1 * var(--base-fs)); /* Standardized around 14pt-equiv */
  font-weight: 800;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 12px;
  line-height: 1.2;
  margin-bottom: calc(4px * var(--afiche-scale, 1));
}

.bullet {
  width: 8px;
  height: 8px;
  background: #663399;
  border-radius: 50%;
  flex-shrink: 0;
}

.docs-list {
  padding-left: 20px;
  font-weight: 700;
  font-size: calc(0.9 * var(--base-fs));
  color: #1a202c;
  line-height: 1.3;
}

.doc-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 3px;
}

.bullet-small {
  width: 5px;
  height: 5px;
  background: #1a202c;
  border-radius: 50%;
  margin-top: 7px;
  flex-shrink: 0;
}

/* CORRELATIVE FOOTER */
.afiche-footer {
  height: auto;
  padding-top: 10px;
  padding-bottom: 95px; /* Space for background waves */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
}

.footer-info-bar {
  display: flex;
  align-items: center;
  padding: 0 40px 60px 40px; /* Space for the background wave */
  gap: 30px;
  position: relative;
  z-index: 20;
}

.footer-text {
  flex-grow: 1;
  border-left: 10px solid #663399;
  padding-left: 20px;
}

.footer-title {
  color: #663399;
  font-weight: 900;
  font-size: calc(1.1 * var(--base-fs));
}

.footer-desc {
  font-size: calc(0.85 * var(--base-fs));
  color: #4a5568;
  margin: 2px 0;
  font-weight: 500;
}

.deadline-literal {
  color: #1a202c;
  font-size: calc(0.9 * var(--base-fs));
  margin-top: 5px;
  line-height: 1.2;
}

.deadline-literal strong {
  font-weight: 900;
}

.footer-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #f7fafc;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  min-width: 120px;
}

.qr-code {
  display: block;
  margin: 0 auto;
}

.qr-hint {
  font-size: 8px;
  font-weight: 900;
  color: #a0aec0;
  margin-top: 4px;
}

.footer-social-img {
  width: 100%;
  height: 90px;
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

/* RESPONSIVE SCALE FOR SCREEN PREVIEW */
@media (min-width: 1600px) {
  .afiche-preview-wrapper {
    transform: scale(0.9);
    margin-top: -50px;
    margin-bottom: -50px;
  }
}

@media (max-width: 1599px) {
  .afiche-preview-wrapper {
    transform: scale(0.85);
    margin-top: -70px;
    margin-bottom: -70px;
  }
}

@media (max-width: 1400px) {
  .afiche-preview-wrapper {
    transform: scale(0.75);
    margin-top: -120px;
    margin-bottom: -120px;
  }
}
</style>
