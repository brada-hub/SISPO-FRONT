<template>
  <q-page class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Convocatorias Externas</h1>
      <q-btn label="Nueva Convocatoria" icon="campaign" style="background-color: #009999; color: white;" @click="openDialog()" />
    </div>

    <!-- Table of existing convocatorias -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
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
          <q-btn flat round color="green-8" icon="assessment" size="sm" @click="downloadReport(props.row)">
             <q-tooltip>Descargar Reporte de Postulantes (Excel)</q-tooltip>
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
        <q-toolbar style="background-color: #663399; color: white;" class="q-py-md">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold">
            {{ isViewMode ? 'VISTA DE AFICHE' : (isEdit ? 'EDITANDO CONVOCATORIA' : 'NUEVA CONVOCATORIA DE PERSONAL') }}
          </q-toolbar-title>

          <div class="flex gap-2">
            <q-btn v-if="isViewMode || isEdit" label="Imagen (HD)" color="teal" unelevated icon="image" @click="downloadImage" />
            <q-btn v-if="isViewMode || isEdit" label="PDF" color="deep-orange" unelevated icon="picture_as_pdf" @click="downloadPDF" />
            <q-btn v-if="!isViewMode" label="Publicar / Guardar" color="white" text-color="primary" unelevated icon="rocket_launch" :loading="saving" @click="save" class="q-px-lg shadow-2" />
          </div>
        </q-toolbar>

        <!-- MAIN SCROLLABLE SECTION -->
        <q-card-section class="flex-1 scroll p-4 row q-col-gutter-md">
          <!-- LEFT: CONFIG PANEL -->
          <div v-if="!isViewMode" class="col-12 col-md-7 pr-2">
            <div class="space-y-4 pb-12">
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div class="text-h6 text-gray-700 mb-4 flex items-center gap-2">
                  <q-icon name="info" color="primary" /> Información de Encabezado
                </div>
                <q-input v-model="form.titulo" label="Título (Eje: MARKETING Y VENTAS)" outlined dense class="mb-4 text-uppercase" placeholder="MARKETING Y VENTAS" />
                <q-input v-model="form.descripcion" label="Descripción / Invitación" type="textarea" outlined dense rows="3" placeholder="La Universidad Técnica Privada Cosmos invita a profesionales..." />

                <div class="grid grid-cols-2 gap-4 mt-4">
                  <q-input v-model="form.fecha_inicio" label="Inicia recepción" type="date" outlined dense stack-label />
                  <q-input v-model="form.fecha_cierre" label="Plazo de postulación" type="date" outlined dense stack-label />
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                  <div class="text-h6 text-gray-700 flex items-center gap-2">
                    <q-icon name="apartment" color="primary" /> Constructor de Ofertas
                  </div>
                  <q-btn-toggle v-model="builderMode" toggle-color="primary" flat dense :options="[{label: 'Por Sede', value: 'sede', icon: 'location_on'},{label: 'Por Cargo', value: 'cargo', icon: 'badge'}]" />
                </div>

                <div class="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
                  <div class="row q-col-gutter-md items-end">
                    <template v-if="builderMode === 'sede'">
                      <div class="col-12 col-md-5">
                        <q-select v-model="buildOne" :options="catalogSedes" option-label="nombre" label="Sede Destino" outlined dense emit-value map-options option-value="id" bg-color="white" />
                      </div>
                      <div class="col-12 col-md-5">
                        <q-select v-model="buildMany" :options="catalogCargos" option-label="nombre" label="Cargos para esta Sede" outlined dense multiple use-chips emit-value map-options option-value="id" bg-color="white" />
                      </div>
                    </template>
                    <template v-else>
                      <div class="col-12 col-md-5">
                        <q-select v-model="buildOne" :options="catalogCargos" option-label="nombre" label="Cargo a Publicar" outlined dense emit-value map-options option-value="id" bg-color="white" />
                      </div>
                      <div class="col-12 col-md-5">
                        <q-select v-model="buildMany" :options="catalogSedes" option-label="nombre" label="Sedes Disponibles" outlined dense multiple use-chips emit-value map-options option-value="id" bg-color="white" />
                      </div>
                    </template>
                    <div class="col-12 col-md-2">
                      <q-btn icon="add_circle" color="primary" class="full-width" label="Añadir" unelevated @click="addOffersFromBuilder" size="md" />
                    </div>
                  </div>
                </div>

                <div class="mt-6">
                  <div class="text-subtitle2 text-gray-500 mb-3 flex items-center gap-2">
                    <q-icon name="fact_check" /> Ofertas seleccionadas:
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="(o, idx) in form.ofertas" :key="idx" class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-xs">
                      <div class="text-sm">
                        <div class="font-bold text-gray-700 uppercase">{{ getCargoName(o.cargo_id) }}</div>
                        <div class="text-primary font-medium">{{ getSedeName(o.sede_id) }}</div>
                      </div>
                      <q-btn icon="cancel" size="sm" flat round color="negative" @click="form.ofertas.splice(idx, 1)" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div class="text-h6 text-gray-700 mb-4 flex items-center gap-2">
                  <q-icon name="list_alt" color="primary" /> Documentación Requerida
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div v-for="req in catalogRequisitos" :key="req.id" class="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer" @click="toggleReq(req.id)">
                    <q-checkbox :model-value="form.config_requisitos_ids.includes(req.id)" @update:model-value="toggleReq(req.id)" :label="req.nombre" color="primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: OFFICIAL POSTER PREVIEW (AFICHE) -->
          <div :class="isViewMode ? 'col-12 flex justify-center' : 'col-12 col-md-5 h-full'">
            <div class="bg-white rounded-lg shadow-2xl overflow-hidden border-4 border-white max-w-[794px] w-full" :class="isViewMode ? '' : 'sticky top-0'">
              <div v-if="!isViewMode" class="bg-teal-600 p-2 flex items-center justify-between text-white">
                 <div class="flex items-center gap-2">
                    <q-icon name="visibility" size="xs" />
                    <span class="font-bold text-xs uppercase">Vista Previa Afiche</span>
                 </div>
                 <q-badge color="white" text-color="teal-9" class="q-px-sm">SISPO LIVE</q-badge>
              </div>

              <div class="bg-white overflow-hidden" id="afiche-capture">
                <!-- AFICHE CONTENT -->
                <div class="p-8 relative bg-white" style="height: 1027px; display: flex; flex-direction: column;">

                  <!-- HEADER: LOGO CENTERED -->
                  <div class="flex justify-center mb-6">
                    <img src="~assets/logo_unitepc.png" style="width: 280px; height: auto;" />
                  </div>

                  <!-- TITLE -->
                  <div class="text-center mb-6">
                    <div class="text-h6 font-black text-gray-900 uppercase leading-none mb-1">REQUERIMIENTO DE PERSONAL</div>
                    <div class="text-h4 font-black text-gray-900 uppercase leading-none mb-2">PARA {{ form.titulo || '[ÁREA]' }}</div>

                    <div v-if="Object.keys(groupedOfertas).length === 1" class="text-subtitle1 font-bold text-teal-600 uppercase border-y-2 border-teal-600 inline-block px-6 py-1 mt-1">
                      SEDE {{ getSedeName(Object.keys(groupedOfertas)[0]) }}
                    </div>
                  </div>

                  <!-- DESCRIPTION -->
                  <div class="text-gray-700 mb-6 text-md text-justify leading-snug font-semibold px-2">
                    {{ form.descripcion || 'La Universidad Técnica Privada Cosmos invita a profesionales con formación en el área a postular para el puesto respectivo en nuestras nuevas oficinas.' }}
                  </div>

                  <!-- CARGOS -->
                  <div class="mb-6 px-2">
                    <div class="text-md font-black text-gray-900 mb-2 flex items-center gap-2">
                       <span class="bg-primary text-white px-2 py-0.5 rounded">I.</span> CARGOS:
                    </div>

                    <div class="pl-2">
                      <div v-for="(sedes, sedeId) in groupedOfertas" :key="sedeId" class="mb-4">
                        <div v-if="Object.keys(groupedOfertas).length > 1" class="text-teal-600 font-black text-md uppercase mb-1 border-l-4 border-teal-600 pl-3">
                           SEDE {{ getSedeName(sedeId) }}
                        </div>
                        <div class="space-y-1 pl-6">
                           <div v-for="of in sedes" :key="of.cargo_id" class="text-gray-900 font-extrabold text-lg uppercase flex items-center gap-2">
                             <div class="w-2 h-2 rounded-full bg-primary shadow-sm"></div>
                             {{ getCargoName(of.cargo_id) }}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- DOCUMENTACION -->
                  <div v-if="form.config_requisitos_ids.length > 0" class="mb-6 px-2">
                    <div class="text-md font-black text-gray-900 mb-2 flex items-center gap-2">
                       <span class="bg-primary text-white px-2 py-0.5 rounded">II.</span> DOCUMENTACIÓN REQUERIDA:
                    </div>
                    <div class="pl-10 space-y-1 italic font-bold text-md text-gray-700">
                      <div v-for="rid in form.config_requisitos_ids" :key="rid" class="flex gap-2">
                        <q-icon name="done_all" color="teal" size="xs" class="mt-1" />
                        <span>{{ getReqName(rid) }} completo</span>
                      </div>
                      <div class="flex gap-2">
                        <q-icon name="done_all" color="teal" size="xs" class="mt-1" />
                        <span>Respaldo en formato digital PDF</span>
                      </div>
                    </div>
                  </div>

                  <!-- RECEPCION & DEADLINE ROW (Side by Side with QR) -->
                  <div class="px-2 mb-2 mt-auto">
                    <div class="flex no-wrap gap-4 items-center bg-white p-4 border-l-[10px] border-primary">
                      <div class="flex-1">
                        <div class="text-md font-black text-primary mb-1 uppercase tracking-tight">REQUERIMIENTO DE PERSONAL</div>
                        <p class="text-gray-700 text-sm mb-2 font-medium leading-tight">Postulación exclusivamente a través de la plataforma <span class="text-black font-black">SISPO</span> de la UNITEPC.</p>
                        <div class="text-md font-black text-primary uppercase leading-tight">
                          PLAZO DE POSTULACIÓN: <span class="underline decoration-primary decoration-2 text-black text-weight-bolder">{{ formatDate(form.fecha_cierre) || '.../../....' }} a horas 18:00</span>
                        </div>
                      </div>
                      <div class="text-center bg-gray-50 p-2 border rounded-xl">
                        <qrcode-vue :value="qrValue" :size="110" level="H" />
                        <div class="text-[8px] font-bold text-gray-400 mt-1 uppercase">Escanear para postular</div>
                      </div>
                    </div>
                  </div>

                  <!-- SOCIAL FOOTER WITH OFFICIAL IMAGE (EDGE TO EDGE) -->
                  <div class="relative w-[794px] -ml-8 -mb-8 h-[90px] overflow-hidden">
                     <img src="~assets/borde_unitepc.png" class="absolute bottom-0 left-0 w-full h-full object-fill" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas'
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

const builderMode = ref('sede')
const buildOne = ref(null)
const buildMany = ref([])

watch(builderMode, () => {
  buildOne.value = null
  buildMany.value = []
})

const form = ref({ id: null, titulo: '', descripcion: '', fecha_inicio: '', fecha_cierre: '', hora_limite: '23:59', ofertas: [], config_requisitos_ids: [] })

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0]
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr
}

const qrValue = computed(() => form.value.id ? `https://unitepc.edu.bo/sispo/convocatoria/${form.value.id}` : 'https://unitepc.edu.bo/sispo')

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'titulo', label: 'Descripción', field: 'titulo', sortable: true, align: 'left' },
  { name: 'ofertas', label: 'Cargos / Sedes', align: 'left' },
  { name: 'fecha', label: 'Plazo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

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
    form.value = { ...item, config_requisitos_ids: Array.isArray(item.config_requisitos_ids) ? item.config_requisitos_ids : [], ofertas: item.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || [] }
  } else {
    isEdit.value = false
    form.value = { id: null, titulo: '', descripcion: '', fecha_inicio: '', fecha_cierre: '', hora_limite: '23:59', ofertas: [], config_requisitos_ids: [] }
  }
  buildOne.value = null; buildMany.value = []; dialog.value = true
}

const viewAfiche = (item) => {
  isViewMode.value = true
  form.value = { ...item, config_requisitos_ids: Array.isArray(item.config_requisitos_ids) ? item.config_requisitos_ids : [], ofertas: item.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || [] }
  dialog.value = true
}

const addOffersFromBuilder = () => {
  if (!buildOne.value || !buildMany.value || buildMany.value.length === 0) { $q.notify({ message: 'Completa la selección', color: 'orange' }); return }
  let countAdded = 0
  buildMany.value.forEach(id => {
    let sId = builderMode.value === 'sede' ? buildOne.value : id
    let cId = builderMode.value === 'sede' ? id : buildOne.value
    if (!form.value.ofertas.find(o => o.sede_id === sId && o.cargo_id === cId)) {
      form.value.ofertas.push({ sede_id: sId, cargo_id: cId, vacantes: 1 }); countAdded++
    }
  })
  if (countAdded > 0) $q.notify({ message: `Se añadieron ${countAdded} combinaciones`, color: 'positive' })
  buildOne.value = null; buildMany.value = []
}

const toggleReq = (id) => {
  const idx = form.value.config_requisitos_ids.indexOf(id)
  if (idx > -1) form.value.config_requisitos_ids.splice(idx, 1); else form.value.config_requisitos_ids.push(id)
}

const getSedeName = (id) => catalogSedes.value.find(s => s.id == id)?.nombre || 'Sede'
const getCargoName = (id) => catalogCargos.value.find(c => c.id == id)?.nombre || 'Cargo'
const getReqName = (id) => catalogRequisitos.value.find(r => r.id == id)?.nombre || 'Requisito'

const groupedOfertas = computed(() => {
  const groups = {}
  form.value.ofertas.forEach(o => { if (!groups[o.sede_id]) groups[o.sede_id] = []; groups[o.sede_id].push(o) })
  return groups
})

const downloadPDF = async () => {
  const el = document.getElementById('afiche-capture')
  if (!el) return
  $q.loading.show({ message: 'Generando PDF...' })
  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
    pdf.save(`Afiche_SISPO_${form.value.titulo}.pdf`)
  } catch (error) { console.error(error) } finally { $q.loading.hide() }
}

const downloadImage = async () => {
  const el = document.getElementById('afiche-capture')
  if (!el) return
  $q.loading.show({ message: 'Generando imagen HD...' })
  try {
    const canvas = await html2canvas(el, { scale: 4, useCORS: true, logging: false, backgroundColor: '#ffffff' })
    const link = document.createElement('a')
    link.download = `Afiche_SISPO_${form.value.titulo}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) { console.error(error) } finally { $q.loading.hide() }
}

const save = async () => {
  if (!form.value.titulo || form.value.ofertas.length === 0 || !form.value.fecha_cierre) { $q.notify({ message: 'Completa todos los campos', color: 'negative' }); return }
  saving.value = true
  try {
    if (isEdit.value) await api.put(`/convocatorias/${form.value.id}`, form.value); else await api.post('/convocatorias', form.value)
    $q.notify({ type: 'positive', message: 'Guardado con éxito' }); dialog.value = false; loadData()
  } catch (error) { console.error(error) } finally { saving.value = false }
}

const downloadReport = async (item) => {
  try {
    const response = await api.get(`/postulaciones/export/${item.id}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Postulantes_${item.titulo}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al descargar reporte' })
  }
}

const confirmDelete = (item) => {
  $q.dialog({ title: 'Eliminar', message: `¿Estás seguro de eliminar "${item.titulo}"?`, cancel: true }).onOk(async () => {
    try { await api.delete(`/convocatorias/${item.id}`); loadData() } catch { $q.notify({ type: 'negative', message: 'Error' }) }
  })
}

onMounted(loadData)
</script>

<style scoped>
#afiche-capture {
  font-family: 'Inter', sans-serif;
  width: 794px; /* A4 Width strictly */
}
.text-lg, .text-xl, .text-h4, .text-h5 { font-family: 'Outfit', sans-serif; letter-spacing: -0.5px; }
</style>
