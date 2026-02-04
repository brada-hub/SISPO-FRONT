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
      :filter="filter"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar convocatoria...">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props" class="bg-gradient-to-r from-primary to-secondary text-white">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-uppercase font-bold tracking-wider">
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

      <template v-slot:body-cell-fecha_inicio="props">
        <q-td :props="props" class="text-center font-bold text-xs uppercase">
          {{ formatDate(props.row.fecha_inicio) }}
        </q-td>
      </template>

      <template v-slot:body-cell-fecha_cierre="props">
        <q-td :props="props" class="text-center font-bold text-xs text-negative uppercase">
          {{ formatDate(props.row.fecha_cierre) }}
        </q-td>
      </template>

      <template v-slot:body-cell-hora_limite="props">
        <q-td :props="props" class="text-center">
          <q-badge outline color="grey-8" class="font-bold">
            {{ props.row.hora_limite || '23:59' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="getStatus(props.row).color"
            text-color="white"
            size="sm"
            class="text-weight-bolder"
            :icon="getStatus(props.row).icon"
          >
            {{ getStatus(props.row).label }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <div class="flex no-wrap items-center justify-center gap-1">
            <q-btn flat round color="teal" icon="visibility" size="sm" @click="viewAfiche(props.row)">
               <q-tooltip>Ver Afiche</q-tooltip>
            </q-btn>
            <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
               <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
               <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- NEW RICH BUILDER DIALOG -->
    <q-dialog v-model="dialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-gray-100 flex flex-col no-wrap">
        <!-- HEADER FIXED -->
        <q-toolbar class="bg-gradient-to-r from-primary to-secondary text-white q-py-lg shadow-lg z-50 sticky top-0" :class="$q.screen.lt.md ? 'flex-col items-center gap-4' : ''">
          <div class="flex items-center gap-3">
            <q-btn flat round dense icon="arrow_back" v-close-popup class="hover:bg-white/10 transition-colors" />
            <div class="flex flex-col">
              <q-toolbar-title class="text-weight-bolder text-xl tracking-tight leading-none">
                {{ isViewMode ? 'VISTA PREVIA' : (isEdit ? 'EDITAR CONVOCATORIA' : 'NUEVA CONVOCATORIA') }}
              </q-toolbar-title>
              <div class="text-[10px] opacity-80 font-medium tracking-widest uppercase mt-1">Gestión de Talento Humano • UNITEPC</div>
            </div>
          </div>

          <q-space v-if="!$q.screen.lt.md" />

          <div class="flex items-center gap-3" :class="$q.screen.lt.md ? 'w-full justify-around' : ''">
             <template v-if="isViewMode || isEdit">
                <q-btn outline :label="$q.screen.lt.sm ? '' : 'Descargar Imagen'" icon="image" @click="downloadImage" class="bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-xl" no-caps />
                <q-btn outline :label="$q.screen.lt.sm ? '' : 'Exportar PDF'" icon="picture_as_pdf" @click="downloadPDF" class="bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-xl" no-caps />
            </template>

            <q-btn v-if="!isViewMode"
                :label="isEdit ? 'Guardar Cambios' : 'Publicar Convocatoria'"
                class="bg-white text-primary font-bold px-8 py-2 rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                unelevated
                :icon="isEdit ? 'save' : 'rocket_launch'"
                :loading="saving"
                @click="save"
                no-caps
            />
          </div>
        </q-toolbar>

        <!-- MAIN SCROLLABLE SECTION -->
        <q-card-section class="flex-1 scroll p-4 row q-col-gutter-md">
          <!-- LEFT: CONFIG PANEL (MODERN ACCORDION) -->
          <div v-if="!isViewMode" class="col-12 col-md-4 pr-2">
            <q-list bordered class="rounded-2xl shadow-sm bg-white overflow-hidden">
              <!-- SECTION 1: BASIC INFO -->
              <q-expansion-item
                v-model="expandBasic"
                icon="info"
                label="1. Información Básica"
                caption="Título, descripción y fechas"
                header-class="bg-grey-1 font-bold text-primary"
                expand-icon-class="text-primary"
              >
                <q-card>
                  <q-card-section class="space-y-4 py-4">
                    <q-input
                      v-model="form.titulo"
                      label="Título (Eje: MARKETING Y VENTAS)"
                      outlined
                      dense
                      class="text-uppercase"
                      placeholder="MARKETING Y VENTAS"
                      :rules="[val => !!val || 'El título es obligatorio']"
                      hint="Puedes editarlo directamente en el afiche a la derecha"
                    />
                    <q-input v-model="form.descripcion" label="Descripción / Invitación" type="textarea" outlined dense rows="3" placeholder="La Universidad Técnica Privada Cosmos invita a profesionales..." :rules="[val => !!val || 'La descripción es obligatoria']" />

                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-input v-model="form.fecha_inicio" label="Inicia recepción" type="date" outlined dense stack-label :rules="[val => !!val || 'Fecha obligatoria']" />
                      </div>
                      <div class="col-6">
                        <q-input v-model="form.fecha_cierre" label="Plazo de postulación" type="date" outlined dense stack-label :rules="[val => !!val || 'Fecha obligatoria']" />
                      </div>
                      <div class="col-12">
                        <q-input v-model="form.hora_limite" label="Hora de Cierre" type="time" outlined dense stack-label hint="Hora límite de recepción" :rules="[val => !!val || 'Hora obligatoria']" />
                      </div>
                    </div>

                    <q-input
                      v-model="form.codigo_interno"
                      label="Código de Control Interno"
                      outlined
                      dense
                      class="mt-2 text-weight-bold"
                      color="primary"
                      hint="Se autogenera según sedes/cargos."
                      @update:model-value="manualCodigoInterno = true"
                    >
                      <template v-slot:prepend>
                        <q-icon name="pin" />
                      </template>
                    </q-input>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <q-separator />

              <!-- SECTION 2: OFFERS -->
              <q-expansion-item
                v-model="expandOffers"
                icon="apartment"
                label="2. Sedes y Cargos"
                caption="Defina dónde y qué puestos"
                header-class="bg-grey-1 font-bold text-primary"
              >
                <q-card>
                  <q-card-section class="space-y-4 py-4">
                    <div class="bg-gray-50 p-2 rounded-xl mb-3">
                      <q-btn-toggle
                        v-model="builderMode"
                        toggle-color="primary"
                        flat
                        dense
                        spread
                        :options="[
                          {label: 'Por Sede', value: 'sede', icon: 'location_on', slot: 'sede'},
                          {label: 'Por Cargo', value: 'cargo', icon: 'badge', slot: 'cargo'}
                        ]"
                        class="bg-white rounded-lg border border-gray-100"
                      />
                    </div>

                    <div class="space-y-4">
                      <!-- Mode: By Sede (Select 1 Sede -> N Cargos) -->
                      <template v-if="builderMode === 'sede'">
                        <q-select
                          v-model="buildOne"
                          :options="catalogSedes"
                          option-label="nombre"
                          option-value="id"
                          label="Fijar Sede"
                          outlined
                          dense
                          emit-value
                          map-options
                          bg-color="white"
                        >
                          <template v-slot:append>
                            <q-btn icon="add" color="teal" flat round dense @click="showQuickSede = true" />
                          </template>
                        </q-select>

                        <div v-if="buildOne" class="animate-fade-in">
                          <q-select
                            v-model="buildMany"
                            :options="catalogCargos"
                            option-label="nombre"
                            option-value="id"
                            multiple
                            use-chips
                            outlined
                            dense
                            emit-value
                            map-options
                            label="Marcar Cargos"
                            bg-color="white"
                            @update:model-value="syncOffers"
                          >
                            <template v-slot:append>
                              <q-btn icon="add" color="teal" flat round dense @click="showQuickCargo = true" />
                            </template>
                          </q-select>
                        </div>
                      </template>

                      <!-- Mode: By Cargo (Select 1 Cargo -> N Sedes) -->
                      <template v-else>
                        <q-select
                          v-model="buildOne"
                          :options="catalogCargos"
                          option-label="nombre"
                          option-value="id"
                          label="Fijar Cargo"
                          outlined
                          dense
                          emit-value
                          map-options
                          bg-color="white"
                        >
                          <template v-slot:append>
                            <q-btn icon="add" color="teal" flat round dense @click="showQuickCargo = true" />
                          </template>
                        </q-select>

                        <div v-if="buildOne" class="animate-fade-in">
                          <q-select
                            v-model="buildMany"
                            :options="catalogSedes"
                            option-label="nombre"
                            option-value="id"
                            multiple
                            use-chips
                            outlined
                            dense
                            emit-value
                            map-options
                            label="Marcar Sedes"
                            bg-color="white"
                            @update:model-value="syncOffers"
                          >
                            <template v-slot:append>
                              <q-btn icon="add" color="teal" flat round dense @click="showQuickSede = true" />
                            </template>
                          </q-select>
                        </div>
                      </template>


                      <div class="mt-4 border-t pt-4">
                        <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                          <q-icon name="list" /> Resumen de Ofertas ({{ form.ofertas.length }})
                        </div>
                        <div class="row q-gutter-xs">
                           <q-chip
                            v-for="(o, idx) in form.ofertas"
                            :key="idx"
                            removable
                            @remove="form.ofertas.splice(idx, 1)"
                            size="sm"
                            outline
                            color="primary"
                            class="font-bold text-[10px] uppercase"
                           >
                            {{ getSedeName(o.sede_id) }}: {{ getCargoName(o.cargo_id) }}
                           </q-chip>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <q-separator />

              <!-- SECTION 3: REQUIREMENTS -->
              <q-expansion-item
                v-model="expandReqs"
                icon="list_alt"
                label="3. Requisitos del Perfil"
                caption="Documentos y méritos"
                header-class="bg-grey-1 font-bold text-primary"
              >
                <q-card>
                  <q-card-section class="py-4">
                    <!-- PRESETS AREA -->
                    <div class="bg-indigo-50 p-3 rounded-xl mb-4 border border-indigo-100">
                      <div class="text-[10px] font-black text-indigo-800 uppercase mb-2">Packs Rápidos:</div>
                      <div class="row q-gutter-sm">
                        <q-btn label="Docente" icon="school" size="xs" color="indigo-7" unelevated rounded no-caps @click="applyPreset('docente')" />
                        <q-btn label="Administrativo" icon="work" size="xs" color="indigo-7" unelevated rounded no-caps @click="applyPreset('adm')" />
                        <q-btn label="Limpiar" icon="clear" size="xs" color="grey-7" flat rounded no-caps @click="form.config_requisitos_ids = []; form.requisitos_afiche = {}" />
                      </div>
                    </div>

                    <div class="text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">Seleccione requisitos:</div>
                    <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      <div v-for="req in catalogRequisitos" :key="req.id"
                           class="border rounded-xl p-3 hover:bg-grey-1 transition-all flex flex-col gap-2"
                           :class="form.config_requisitos_ids.includes(req.id) ? 'border-primary bg-primary/5' : 'border-gray-100'"
                      >
                        <div class="flex items-center gap-2 cursor-pointer" @click="toggleReq(req.id)">
                          <q-checkbox :model-value="form.config_requisitos_ids.includes(req.id)" dense color="primary" />
                          <div class="text-[11px] font-bold uppercase text-gray-700 flex-1">{{ req.nombre }}</div>
                        </div>

                        <div v-if="form.config_requisitos_ids.includes(req.id)" class="ml-7 animate-fade-in flex flex-col gap-2">
                          <q-input
                            v-model="form.requisitos_afiche[req.id]"
                            dense
                            outlined
                            autogrow
                            type="textarea"
                            rows="1"
                            class="full-width"
                            placeholder="Detalle (Eje: Título Provisión Nacional)"
                            input-class="text-[10px]"
                            bg-color="white"
                          />
                          <div class="flex items-center justify-between bg-white p-2 rounded-lg border border-dashed">
                             <div class="flex items-center gap-1">
                                <q-toggle
                                  :model-value="!form.requisitos_opcionales.includes(req.id)"
                                  @update:model-value="toggleOptional(req.id)"
                                  size="sm"
                                  color="primary"
                                  dense
                                />
                                <span class="text-[10px] font-black" :class="!form.requisitos_opcionales.includes(req.id)?'text-primary':'text-orange-9'">
                                  {{ !form.requisitos_opcionales.includes(req.id) ? 'OBLIGATORIO' : 'OPCIONAL' }}
                                </span>
                             </div>

                             <q-btn
                                :icon="form.requisitos_afiche[req.id] === 'OCULTAR' ? 'visibility_off' : 'visibility'"
                                flat
                                round
                                size="xs"
                                :color="form.requisitos_afiche[req.id] === 'OCULTAR' ? 'grey-4' : 'teal'"
                                @click="form.requisitos_afiche[req.id] === 'OCULTAR' ? form.requisitos_afiche[req.id] = '' : form.requisitos_afiche[req.id] = 'OCULTAR'"
                              >
                                <q-tooltip>{{ form.requisitos_afiche[req.id] === 'OCULTAR' ? 'Oculto en Afiche' : 'Visible en Afiche' }}</q-tooltip>
                              </q-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <q-separator />

              <!-- SECTION 4: CONTENIDO DETALLADO (LANDING PAGE) -->
              <q-expansion-item
                v-model="expandContent"
                icon="article"
                label="4. Página de Detalle"
                caption="Contenido completo para la página pública"
                header-class="bg-grey-1 font-bold text-primary"
              >
                <q-card>
                  <q-card-section class="py-4">
                    <div class="bg-teal-50 p-3 rounded-xl mb-4 border border-teal-100">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="text-xs font-bold text-teal-800">Link de la Convocatoria:</div>
                          <div class="text-[11px] text-teal-600 font-mono">{{ publicPageUrl }}</div>
                        </div>
                        <q-btn
                          :icon="copied ? 'check' : 'content_copy'"
                          :color="copied ? 'positive' : 'teal'"
                          flat
                          round
                          @click="copyPublicLink"
                        >
                          <q-tooltip>{{ copied ? 'Copiado!' : 'Copiar Link' }}</q-tooltip>
                        </q-btn>
                      </div>
                    </div>

                    <div class="text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">
                      Contenido detallado (opcional):
                    </div>
                    <div class="text-[10px] text-gray-400 mb-3 ml-1">
                      Aquí puedes pegar toda la información de la convocatoria: formación requerida, experiencia, competencias, etc.
                    </div>

                    <q-editor
                      v-model="form.contenido_detalle"
                      :toolbar="[
                        ['bold', 'italic', 'underline', 'strike'],
                        ['unordered', 'ordered'],
                        ['outdent', 'indent'],
                        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'] }],
                        ['link'],
                        ['undo', 'redo'],
                        ['viewsource']
                      ]"
                      min-height="300px"
                      class="rounded-xl border-2 border-gray-200"
                      placeholder="Pega aquí el contenido completo de la convocatoria..."
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </div>

          <!-- RIGHT: OFFICIAL POSTER PREVIEW (AFICHE) -->
          <div :class="isViewMode ? 'col-12 flex flex-col items-center bg-gray-800' : 'col-12 col-md-8 flex flex-col'"
               :style="isViewMode ? 'min-height: calc(100vh - 80px)' : ''">
              <!-- HELP BANNER -->
              <div v-if="!isViewMode" class="bg-amber-1 text-amber-9 border border-amber-200 p-2 rounded-xl mb-3 text-center text-xs font-bold animate-pulse mx-4">
                <q-icon name="edit" /> TIP: HAZ CLIC DIRECTAMENTE EN EL TEXTO DEL AFICHE PARA EDITAR EL TÍTULO O DESCRIPCIÓN
              </div>

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
                    :editable="!isViewMode"
                    @update:titulo="val => form.titulo = val"
                    @update:descripcion="val => form.descripcion = val"
                    @update:requisito-afiche="({ id, value }) => form.requisitos_afiche[id] = value"
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
const filter = ref('')
const previewContainer = ref(null)
const containerWidth = ref(800)

// Accordion Expand States
const expandBasic = ref(true)
const expandOffers = ref(false)
const expandReqs = ref(false)
const expandContent = ref(false)
const copied = ref(false)

// Multiselect logic for Section 2
const builderMode = ref('sede') // 'sede' or 'cargo'
const buildOne = ref(null) // selected Sede (if mode=sede) or Cargo (if mode=cargo)
const buildMany = ref([]) // selected list

const previewStyle = computed(() => {
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

// Quick Add States
const showQuickSede = ref(false)
const showQuickCargo = ref(false)
const quickSaving = ref(false)
const quickSede = ref({ nombre: '', sigla: '', departamento: '' })
const quickCargo = ref({ nombre: '', sigla: '' })
const manualSiglaSede = ref(false)
const manualSiglaCargo = ref(false)
const manualCodigoInterno = ref(false)

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

const form = ref({ id: null, titulo: '', codigo_interno: '', descripcion: '', contenido_detalle: '', fecha_inicio: '', fecha_cierre: '', hora_limite: '23:59', ofertas: [], config_requisitos_ids: [], requisitos_opcionales: [], requisitos_afiche: {} })

const syncOffers = (newMany) => {
  if (!buildOne.value) return
  if (builderMode.value === 'sede') {
    const sId = buildOne.value
    form.value.ofertas = form.value.ofertas.filter(o => o.sede_id !== sId || newMany.includes(o.cargo_id))
    newMany.forEach(cId => {
      if (!form.value.ofertas.find(o => o.sede_id === sId && o.cargo_id === cId)) {
        form.value.ofertas.push({ sede_id: sId, cargo_id: cId, vacantes: 1 })
      }
    })
  } else {
    const cId = buildOne.value
    form.value.ofertas = form.value.ofertas.filter(o => o.cargo_id !== cId || newMany.includes(o.sede_id))
    newMany.forEach(sId => {
      if (!form.value.ofertas.find(o => o.sede_id === sId && o.cargo_id === cId)) {
        form.value.ofertas.push({ sede_id: sId, cargo_id: cId, vacantes: 1 })
      }
    })
  }
}

watch([buildOne, builderMode], () => {
  if (!buildOne.value) { buildMany.value = []; return }
  if (builderMode.value === 'sede') {
    buildMany.value = form.value.ofertas.filter(o => o.sede_id === buildOne.value).map(o => o.cargo_id)
  } else {
    buildMany.value = form.value.ofertas.filter(o => o.cargo_id === buildOne.value).map(o => o.sede_id)
  }
})


const applyPreset = (type) => {
  if (type === 'docente') {
    const docReqs = catalogRequisitos.value.filter(r =>
      ['FORMACIÓN PROFESIONAL', 'PERFECCIONAMIENTO PROFESIONAL', 'EXPERIENCIA ACADÉMICA'].some(k => r.nombre.includes(k))
    ).map(r => r.id)
    form.value.config_requisitos_ids = [...new Set([...form.value.config_requisitos_ids, ...docReqs])]
    $q.notify({ message: 'Pack Docente aplicado', color: 'indigo-8' })
  } else if (type === 'adm') {
    const admReqs = catalogRequisitos.value.filter(r =>
      ['FORMACIÓN PROFESIONAL', 'CURRICULUM VITAE'].some(k => r.nombre.includes(k))
    ).map(r => r.id)
    form.value.config_requisitos_ids = [...new Set([...form.value.config_requisitos_ids, ...admReqs])]
    $q.notify({ message: 'Pack Administrativo aplicado', color: 'indigo-8' })
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0]
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr
}

const getStatus = (row) => {
  const hoy = new Date().toISOString().split('T')[0]
  const inicio = row.fecha_inicio.split('T')[0]
  const cierre = row.fecha_cierre.split('T')[0]
  if (hoy < inicio) return { label: 'PROGRAMADA', color: 'blue', icon: 'schedule' }
  if (hoy > cierre) return { label: 'CERRADA', color: 'red', icon: 'block' }
  return { label: 'ABIERTA', color: 'positive', icon: 'check_circle' }
}

const qrValue = computed(() => {
  const origin = window.location.origin
  return form.value.id ? `${origin}/#/postular/${form.value.id}` : `${origin}/#/postular`
})

const publicPageUrl = computed(() => {
  if (!form.value.id) return 'Se generará al guardar'
  const origin = window.location.origin
  return `${origin}/#/convocatoria/${form.value.id}`
})

const copyPublicLink = async () => {
  if (!form.value.id) {
    $q.notify({ type: 'warning', message: 'Guarda la convocatoria primero para obtener el link' })
    return
  }
  try {
    await navigator.clipboard.writeText(publicPageUrl.value)
    copied.value = true
    $q.notify({ type: 'positive', message: 'Link copiado al portapapeles' })
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    $q.notify({ type: 'negative', message: 'Error al copiar' })
  }
}

const columns = [
  { name: 'codigo_interno', label: 'Código Interno', field: 'codigo_interno', sortable: true, align: 'left' },
  { name: 'titulo', label: 'Descripción de Convocatoria', field: 'titulo', sortable: true, align: 'left' },
  { name: 'ofertas', label: 'Cargos / Sedes', align: 'left' },
  { name: 'fecha_inicio', label: 'Inicio', field: 'fecha_inicio', sortable: true, align: 'center' },
  { name: 'fecha_cierre', label: 'Fin', field: 'fecha_cierre', sortable: true, align: 'center' },
  { name: 'hora_limite', label: 'Cierre', field: 'hora_limite', align: 'center' },
  { name: 'status', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center', style: 'width: 140px' }
]

watch(() => form.value.ofertas, (newOffers) => {
  if (isEdit.value && form.value.codigo_interno) return
  if (manualCodigoInterno.value) return
  if (!newOffers || newOffers.length === 0) {
    form.value.codigo_interno = ''
    return
  }
  const uniqueCargoIds = [...new Set(newOffers.map(o => o.cargo_id))]
  const uniqueSedeIds = [...new Set(newOffers.map(o => o.sede_id))]
  const year = new Date().getFullYear()
  let sSigla = 'NAC'
  if (uniqueSedeIds.length === 1) {
    const sedeEncontrada = catalogSedes.value.find(s => s.id == uniqueSedeIds[0])
    sSigla = sedeEncontrada?.sigla || 'SEDE'
  }
  let cSigla = 'MULT'
  if (uniqueCargoIds.length === 1) {
    const cargo = catalogCargos.value.find(c => c.id === uniqueCargoIds[0])
    cSigla = cargo?.sigla || 'CARGO'
  }
  form.value.codigo_interno = `CONV-${year}-${cSigla}-${sSigla}`.toUpperCase()
}, { deep: true, immediate: true })

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
  isViewMode.value = false; buildOne.value = null; buildMany.value = []
  expandBasic.value = true; expandOffers.value = false; expandReqs.value = false
  if (item) {
    isEdit.value = true
    form.value = {
      ...item,
      fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
      fecha_cierre: item.fecha_cierre ? item.fecha_cierre.split('T')[0] : '',
      contenido_detalle: item.contenido_detalle || '',
      config_requisitos_ids: Array.isArray(item.config_requisitos_ids) ? item.config_requisitos_ids : [],
      requisitos_opcionales: Array.isArray(item.requisitos_opcionales) ? item.requisitos_opcionales : [],
      requisitos_afiche: item.requisitos_afiche || {},
      ofertas: item.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || []
    }
  } else {
    isEdit.value = false
    form.value = { id: null, titulo: '', codigo_interno: '', descripcion: '', contenido_detalle: '', fecha_inicio: '', fecha_cierre: '', hora_limite: '23:59', ofertas: [], config_requisitos_ids: [], requisitos_opcionales: [], requisitos_afiche: {} }
  }
  manualCodigoInterno.value = false; dialog.value = true
}

const viewAfiche = (item) => {
  isViewMode.value = true
  form.value = {
    ...item,
    fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
    fecha_cierre: item.fecha_cierre ? item.fecha_cierre.split('T')[0] : '',
    config_requisitos_ids: Array.isArray(item.config_requisitos_ids) ? item.config_requisitos_ids : [],
    requisitos_opcionales: Array.isArray(item.requisitos_opcionales) ? item.requisitos_opcionales : [],
    requisitos_afiche: item.requisitos_afiche || {},
    ofertas: item.ofertas?.map(o => ({ sede_id: o.sede_id, cargo_id: o.cargo_id, vacantes: o.vacantes })) || []
  }
  dialog.value = true
}

const saveQuickSede = async () => {
  if (!quickSede.value.nombre || !quickSede.value.sigla) return
  quickSaving.value = true
  try {
    const { data } = await api.post('/sedes', quickSede.value)
    catalogSedes.value.push(data)
    if (builderMode.value === 'sede') buildOne.value = data.id
    else { buildMany.value.push(data.id); syncOffers(buildMany.value) }
    showQuickSede.value = false
    quickSede.value = { nombre: '', sigla: '', departamento: '' }
    manualSiglaSede.value = false
    $q.notify({ type: 'positive', message: 'Sede creada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error' })
  } finally { quickSaving.value = false }
}

const saveQuickCargo = async () => {
  if (!quickCargo.value.nombre || !quickCargo.value.sigla) return
  quickSaving.value = true
  try {
    const { data } = await api.post('/cargos', quickCargo.value)
    catalogCargos.value.push(data)
    if (builderMode.value === 'cargo') buildOne.value = data.id
    else { buildMany.value.push(data.id); syncOffers(buildMany.value) }
    showQuickCargo.value = false
    quickCargo.value = { nombre: '', sigla: '' }
    manualSiglaCargo.value = false
    $q.notify({ type: 'positive', message: 'Cargo creado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error' })
  } finally { quickSaving.value = false }
}

const toggleReq = (id) => {
  const idx = form.value.config_requisitos_ids.indexOf(id)
  if (idx > -1) {
    form.value.config_requisitos_ids.splice(idx, 1)
    // También quitar de opcionales si estaba ahí
    const oidx = form.value.requisitos_opcionales.indexOf(id)
    if (oidx > -1) form.value.requisitos_opcionales.splice(oidx, 1)
  } else {
    form.value.config_requisitos_ids.push(id)
  }
}

const toggleOptional = (id) => {
  const idx = form.value.requisitos_opcionales.indexOf(id)
  if (idx > -1) form.value.requisitos_opcionales.splice(idx, 1)
  else form.value.requisitos_opcionales.push(id)
}

const getSedeName = (id) => catalogSedes.value.find(s => s.id == id)?.nombre || 'Sede'
const getCargoName = (id) => catalogCargos.value.find(c => c.id == id)?.nombre || 'Cargo'

const aficheFontScale = computed(() => {
  let count = form.value.ofertas.length + form.value.config_requisitos_ids.length
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
  $q.loading.show({ message: 'Renderizando PDF...' })
  try {
    await document.fonts.ready
    await new Promise(resolve => setTimeout(resolve, 1000))
    el.style.display = 'flex'; el.style.visibility = 'visible'
    const scale = 3
    const param = {
        height: el.scrollHeight * scale,
        width: 794 * scale,
        style: { transform: `scale(${scale})`, transformOrigin: 'top left', width: '794px', height: `${el.scrollHeight}px`, opacity: '1' },
        quality: 1, backgroundColor: '#ffffff', cacheBust: true
    }
    const dataUrl = await htmlToImage.toPng(el, param)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const imgProps = pdf.getImageProperties(dataUrl)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Afiche_${form.value.titulo}.pdf`)
  } catch (error) {
    console.error(error); $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  } finally {
    const el = document.getElementById('afiche-perfect-capture')
    if (el) el.style.visibility = 'hidden'
    $q.loading.hide()
  }
}

const downloadImage = async () => {
  const el = document.getElementById('afiche-perfect-capture')
  if (!el) return
  $q.loading.show({ message: 'Generando Imagen...' })
  try {
    await document.fonts.ready
    await new Promise(resolve => setTimeout(resolve, 1000))
    el.style.display = 'flex'; el.style.visibility = 'visible'
    const scale = 3
    const param = {
        height: el.scrollHeight * scale, width: 794 * scale,
        style: { transform: `scale(${scale})`, transformOrigin: 'top left', width: '794px', height: `${el.scrollHeight}px`, opacity: '1' },
        quality: 1, backgroundColor: '#ffffff', cacheBust: true
    }
    const dataUrl = await htmlToImage.toPng(el, param)
    const link = document.createElement('a')
    link.download = `Afiche_${form.value.titulo}.png`; link.href = dataUrl; link.click()
  } catch (error) {
    console.error(error); $q.notify({ type: 'negative', message: 'Error al generar imagen' })
  } finally {
    const el = document.getElementById('afiche-perfect-capture')
    if (el) el.style.visibility = 'hidden'
    $q.loading.hide()
  }
}

const save = async () => {
  if (!form.value.titulo || !form.value.descripcion || !form.value.fecha_inicio || !form.value.fecha_cierre || form.value.ofertas.length === 0) {
    $q.notify({ type: 'negative', message: 'Faltan campos' }); return
  }
  saving.value = true
  try {
    if (isEdit.value) { await api.put(`/convocatorias/${form.value.id}`, form.value) }
    else { await api.post('/convocatorias', form.value) }
    $q.notify({ type: 'positive', message: 'Guardado' }); dialog.value = false; loadData()
  } catch (error) {
    console.error(error); $q.notify({ type: 'negative', message: 'Error' })
  } finally { saving.value = false }
}

const confirmDelete = (item) => {
  $q.dialog({ title: 'Eliminar', message: `¿Eliminar "${item.titulo}"?`, cancel: true }).onOk(async () => {
    try { await api.delete(`/convocatorias/${item.id}`); loadData() } catch { $q.notify({ type: 'negative', message: 'Error' }) }
  })
}

onMounted(() => {
  window.addEventListener('resize', updateWidth); loadData()
})
</script>

<style scoped>
.afiche-preview-wrapper {
  transform-origin: top center;
  width: 100%;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
