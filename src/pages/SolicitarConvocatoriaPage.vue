<template>
  <q-page class="bg-gray-50/50 min-h-screen py-10 px-4 sm:px-8">
    <div class="max-w-5xl mx-auto">
      
      <!-- HEADER PRINCIPAL INSTITUCIONAL -->
      <div class="bg-gradient-to-r from-[#4a2371] via-[#2c4e91] to-[#009b9b] rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div class="flex items-center gap-2 text-teal-300 font-black text-xs uppercase tracking-widest mb-2">
              <q-icon name="apartment" size="18px" />
              <span>UNITEPC • Dirección de Talento Humano</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
              Requerimiento de Convocatoria
            </h1>
            <p class="text-white/80 text-xs sm:text-sm mt-2 max-w-2xl font-medium leading-relaxed">
              Formulario oficial para Directores de Carrera, Decanos y Jefaturas de Departamento para solicitar la apertura de una nueva convocatoria docente o institucional.
            </p>
          </div>

          <!-- BOTÓN CONSULTAR O VOLVER -->
          <div class="flex flex-col sm:flex-row gap-3">
            <q-btn
              flat
              rounded
              dense
              no-caps
              icon="search"
              label="Consultar Solicitud"
              class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 font-bold text-xs border border-white/20"
              @click="showConsultDialog = true"
            />
            <q-btn
              to="/"
              flat
              rounded
              dense
              no-caps
              icon="arrow_back"
              label="Volver al Portal"
              class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 font-bold text-xs border border-white/20"
            />
          </div>
        </div>
      </div>

      <!-- ESTADO DE RECEPCIÓN CERRADA / DESACTIVADA -->
      <div v-if="!loadingStatus && !recepcionHabilitada" class="bg-white rounded-3xl p-10 sm:p-16 text-center border border-gray-150 shadow-sm animate-fade-in max-w-2xl mx-auto space-y-6">
        <div class="w-20 h-20 bg-rose-50 text-rose-700 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
          <q-icon name="lock_clock" size="44px" />
        </div>
        <div>
          <span class="text-xs font-black uppercase text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Recepción Temporalmente Cerrada
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-gray-800 uppercase tracking-tight mt-3">
            Enlace No Disponible
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-lg mx-auto mt-2">
            {{ mensajeCierre || 'El periodo de recepción de requerimientos de convocatoria se encuentra actualmente cerrado por disposición de Talento Humano.' }}
          </p>
        </div>

        <div class="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-3">
          <q-btn
            flat
            rounded
            dense
            no-caps
            icon="search"
            label="Consultar Estado de una Solicitud Anterior"
            class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 font-bold text-xs"
            @click="showConsultDialog = true"
          />
          <q-btn
            to="/"
            color="primary"
            unelevated
            rounded
            dense
            no-caps
            icon="home"
            label="Ir al Inicio"
            class="px-6 py-2.5 font-black text-xs"
          />
        </div>
      </div>

      <!-- FORMULARIO PRINCIPAL CARD -->
      <div v-else-if="!loadingStatus" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <!-- STEPPER HEADER -->
        <div class="bg-gray-50 border-b border-gray-100 p-4 sm:p-6 flex justify-between items-center gap-2">
          <div
            v-for="(stepName, idx) in ['1. Solicitante', '2. Cargo y Sedes', '3. Requisitos y Respaldo']"
            :key="idx"
            @click="currentStep = idx + 1"
            :class="[
              'flex-1 text-center py-2.5 px-2 rounded-2xl cursor-pointer transition-all select-none text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2',
              currentStep === idx + 1
                ? 'bg-[#4a2371] text-white shadow-md'
                : 'text-gray-400 hover:text-gray-700 bg-white border border-gray-100'
            ]"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="currentStep === idx + 1 ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'">
              {{ idx + 1 }}
            </span>
            <span class="hidden sm:inline">{{ stepName }}</span>
          </div>
        </div>

        <q-form @submit="handleSubmit" class="p-6 sm:p-10 space-y-8">
          
          <!-- ============================================== -->
          <!-- PASO 1: DATOS DE LA UNIDAD Y SOLICITANTE       -->
          <!-- ============================================== -->
          <div v-show="currentStep === 1" class="space-y-6 animate-fade-in">
            <div class="border-b border-gray-100 pb-3">
              <h2 class="text-base font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <q-icon name="person" color="primary" size="20px" />
                1. Identificación del Solicitante
              </h2>
              <p class="text-xs text-gray-400 font-medium mt-1">
                Indique sus datos institucionales como responsable de la solicitud.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <q-input
                v-model="form.solicitante_nombre"
                label="Nombre Completo del Solicitante *"
                placeholder="Ej. Dr. Carlos Roberto Mendoza"
                outlined
                rounded
                dense
                bg-color="white"
                :rules="[val => !!val || 'El nombre es obligatorio']"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="primary" size="18px" />
                </template>
              </q-input>

              <q-input
                v-model="form.solicitante_cargo"
                label="Cargo Institucional *"
                placeholder="Ej. Director de Carrera / Decano / Jefe de Unidad"
                outlined
                rounded
                dense
                bg-color="white"
                :rules="[val => !!val || 'El cargo es obligatorio']"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="primary" size="18px" />
                </template>
              </q-input>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <q-input
                v-model="form.solicitante_carrera"
                label="Carrera / Departamento / Unidad *"
                placeholder="Ej. Medicina / Bioquímica / Sistemas"
                outlined
                rounded
                dense
                bg-color="white"
                :rules="[val => !!val || 'La carrera o departamento es obligatorio']"
              >
                <template v-slot:prepend>
                  <q-icon name="school" color="primary" size="18px" />
                </template>
              </q-input>

              <q-input
                v-model="form.solicitante_email"
                label="Correo Institucional *"
                placeholder="ejemplo@unitepc.edu.bo"
                type="email"
                outlined
                rounded
                dense
                bg-color="white"
                :rules="[val => !!val || 'El correo es obligatorio', val => /.+@.+\..+/.test(val) || 'Correo no válido']"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" size="18px" />
                </template>
              </q-input>

              <q-input
                v-model="form.solicitante_telefono"
                label="Teléfono / Celular de Contacto *"
                placeholder="Ej. 76451234"
                outlined
                rounded
                dense
                bg-color="white"
                :rules="[val => !!val || 'El teléfono es obligatorio']"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" color="primary" size="18px" />
                </template>
              </q-input>
            </div>

            <!-- TIPO DE PERFIL DE CONVOCATORIA (PRESET UNITEPC) -->
            <div class="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
              <div class="text-xs font-black text-[#4a2371] uppercase tracking-wider mb-3 flex items-center gap-2">
                <q-icon name="tune" color="primary" /> Tipo de Perfil Requerido:
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  v-for="p in tiposPerfil"
                  :key="p.value"
                  @click="form.tipo_perfil = p.value"
                  :class="[
                    'p-3.5 rounded-xl cursor-pointer transition-all border text-center flex flex-col items-center justify-center gap-1.5 select-none',
                    form.tipo_perfil === p.value
                      ? 'bg-[#4a2371] text-white border-[#4a2371] shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  <q-icon :name="p.icon" size="22px" />
                  <span class="text-xs font-black uppercase">{{ p.label }}</span>
                  <span class="text-[9px] opacity-80 leading-none">{{ p.desc }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <q-btn
                label="Siguiente: Cargo y Sedes"
                icon-right="arrow_forward"
                color="primary"
                unelevated
                rounded
                class="font-black px-6"
                @click="goToStep(2)"
              />
            </div>
          </div>

          <!-- ============================================== -->
          <!-- PASO 2: SEDES Y CARGOS (FLUJO UNITEPC SIN VACANTES) -->
          <!-- ============================================== -->
          <div v-show="currentStep === 2" class="space-y-6 animate-fade-in">
            <div class="border-b border-gray-100 pb-3">
              <h2 class="text-base font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <q-icon name="domain" color="primary" size="20px" />
                2. Cargo a Convocar y Sedes Académicas
              </h2>
              <p class="text-xs text-gray-400 font-medium mt-1">
                Defina el título del requerimiento y seleccione las sedes y cargos correspondientes.
              </p>
            </div>

            <!-- TÍTULO DE LA CONVOCATORIA -->
            <q-input
              v-model="form.titulo_sugerido"
              label="Título de la Convocatoria / Asignatura o Área *"
              placeholder="Ej. DOCENTE EN EL ÁREA DE FARMACOLOGÍA CLÍNICA I Y II"
              outlined
              rounded
              dense
              class="text-uppercase"
              bg-color="white"
              :rules="[val => !!val || 'El título o área es obligatorio']"
            >
              <template v-slot:prepend>
                <q-icon name="campaign" color="primary" size="18px" />
              </template>
            </q-input>

            <!-- JUSTIFICACIÓN -->
            <q-input
              v-model="form.descripcion_motivo"
              label="Justificación / Motivo del Requerimiento"
              placeholder="Explique brevemente por qué se requiere la apertura de esta convocatoria (ej. Apertura de paralelos en semestre II-2026, reemplazo por renuncia, etc.)"
              type="textarea"
              outlined
              rounded
              dense
              rows="3"
              bg-color="white"
            />

            <!-- SELECTOR DE SEDES ACADÉMICAS -->
            <div class="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <q-icon name="place" color="primary" /> Sedes Académicas donde se Ofertará *
                </span>
                <span class="text-[10px] text-gray-400 font-bold">({{ form.sedes_ids.length }} seleccionadas)</span>
              </div>
              <q-select
                v-model="form.sedes_ids"
                :options="catalogoSedes"
                option-label="nombre"
                option-value="id"
                multiple
                use-chips
                emit-value
                map-options
                outlined
                rounded
                dense
                bg-color="white"
                placeholder="Seleccione una o varias sedes..."
                :rules="[val => (val && val.length > 0) || 'Debe seleccionar al menos una sede']"
              />
            </div>

            <!-- SELECTOR DE CARGOS -->
            <div class="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <q-icon name="badge" color="primary" /> Cargos Solicitados * (Sin número de vacantes)
                </span>
                <span class="text-[10px] text-gray-400 font-bold">({{ form.cargos_ids.length }} seleccionados)</span>
              </div>
              <q-select
                v-model="form.cargos_ids"
                :options="catalogoCargos"
                option-label="nombre"
                option-value="id"
                multiple
                use-chips
                emit-value
                map-options
                outlined
                rounded
                dense
                bg-color="white"
                placeholder="Seleccione los cargos docentes o administrativos..."
                :rules="[val => (val && val.length > 0) || 'Debe seleccionar al menos un cargo']"
              />
            </div>

            <div class="flex justify-between pt-4">
              <q-btn
                label="Atrás"
                icon="arrow_back"
                flat
                rounded
                class="font-black px-4 text-gray-600"
                @click="currentStep = 1"
              />
              <q-btn
                label="Siguiente: Requisitos"
                icon-right="arrow_forward"
                color="primary"
                unelevated
                rounded
                class="font-black px-6"
                @click="goToStep(3)"
              />
            </div>
          </div>

          <!-- ============================================== -->
          <!-- PASO 3: REQUISITOS DE LA CARRERA & RESPALDO     -->
          <!-- ============================================== -->
          <div v-show="currentStep === 3" class="space-y-6 animate-fade-in">
            <div class="border-b border-gray-100 pb-3">
              <h2 class="text-base font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <q-icon name="fact_check" color="primary" size="20px" />
                3. Requisitos Solicitados por la Carrera
              </h2>
              <p class="text-xs text-gray-400 font-medium mt-1">
                Especifique los requisitos que deberá cumplir el profesional para ser publicado en el afiche oficial.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Formación Requerida -->
              <q-input
                v-model="form.requisito_formacion"
                label="Formación Académica Requerida *"
                placeholder="Ej. Licenciatura en Medicina con Título en Provisión Nacional"
                type="textarea"
                rows="2"
                outlined
                rounded
                dense
                bg-color="white"
                :rules="[val => !!val || 'La formación requerida es obligatoria']"
              >
                <template v-slot:prepend>
                  <q-icon name="school" color="teal-8" size="18px" />
                </template>
              </q-input>

              <!-- Posgrados Requeridos -->
              <q-input
                v-model="form.requisito_posgrado"
                label="Posgrados / Especialidades Requeridas"
                placeholder="Ej. Diplomado en Educación Superior (Excluyente), Especialidad afín"
                type="textarea"
                rows="2"
                outlined
                rounded
                dense
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="workspace_premium" color="indigo-8" size="18px" />
                </template>
              </q-input>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Experiencia Profesional -->
              <q-input
                v-model="form.requisito_experiencia_profesional"
                label="Experiencia Profesional Mínima"
                placeholder="Ej. Mínimo 3 años continuos de ejercicio en la especialidad"
                outlined
                rounded
                dense
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="history_edu" color="orange-8" size="18px" />
                </template>
              </q-input>

              <!-- Experiencia Docente -->
              <q-input
                v-model="form.requisito_experiencia_docente"
                label="Experiencia Docente Universitaria"
                placeholder="Ej. Mínimo 1 año como catedrático universitario"
                outlined
                rounded
                dense
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="menu_book" color="purple-8" size="18px" />
                </template>
              </q-input>
            </div>

            <!-- Otros Requisitos -->
            <q-input
              v-model="form.otros_requisitos"
              label="Otros Requisitos / Habilidades Deseables"
              placeholder="Ej. Disponibilidad horaria en turno mañana/tarde, manejo de plataformas virtuales"
              type="textarea"
              rows="2"
              outlined
              rounded
              dense
              bg-color="white"
            />

            <!-- ARCHIVO DE RESPALDO (NOTA / OFICIO PDF OPCIONAL) -->
            <div class="bg-gray-50/70 p-5 rounded-2xl border border-dashed border-gray-300">
              <div class="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <q-icon name="attach_file" color="primary" /> Carta de Requerimiento u Oficio Firmado (Opcional)
              </div>
              <q-file
                v-model="form.archivo_adjunto"
                label="Seleccionar documento (PDF, Word, Imagen - Máx. 10MB)"
                outlined
                rounded
                dense
                bg-color="white"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" color="primary" />
                </template>
              </q-file>
            </div>

            <!-- BOTONES FINALES -->
            <div class="flex justify-between items-center pt-6 border-t border-gray-100">
              <q-btn
                label="Atrás"
                icon="arrow_back"
                flat
                rounded
                class="font-black px-4 text-gray-600"
                @click="currentStep = 2"
              />
              <q-btn
                label="Enviar Solicitud a Talento Humano"
                icon="send"
                type="submit"
                color="teal-8"
                unelevated
                rounded
                class="font-black px-8 py-3 text-sm shadow-lg shadow-teal-700/20"
                :loading="submitting"
              />
            </div>
          </div>

        </q-form>
      </div>

    </div>

    <!-- DIÁLOGO: CONFIRMACIÓN Y CÓDIGO DE SEGUIMIENTO -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card class="p-8 rounded-3xl max-w-md w-full text-center">
        <div class="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100">
          <q-icon name="check_circle" size="36px" />
        </div>
        <div class="text-xs font-black text-teal-700 uppercase tracking-widest mb-1">Solicitud Registrada</div>
        <h3 class="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">¡Enviado con Éxito!</h3>
        <p class="text-xs text-gray-500 font-medium leading-relaxed mb-6">
          Su requerimiento fue enviado directamente a la Dirección de Talento Humano para su evaluación y visto bueno.
        </p>

        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Código de Seguimiento</div>
          <div class="text-xl font-black text-[#4a2371] tracking-wider select-all">
            {{ generatedCode }}
          </div>
          <div class="text-[10px] text-gray-400 mt-1">Guarde este código para consultar el estado del trámite</div>
        </div>

        <div class="flex gap-2">
          <q-btn
            label="Nueva Solicitud"
            flat
            rounded
            class="flex-1 font-bold text-xs"
            color="primary"
            @click="resetForm"
          />
          <q-btn
            to="/"
            label="Ir al Portal"
            color="primary"
            unelevated
            rounded
            class="flex-1 font-black text-xs"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO: CONSULTA PÚBLICA DE ESTADO POR CÓDIGO -->
    <q-dialog v-model="showConsultDialog">
      <q-card class="p-6 rounded-3xl max-w-lg w-full">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <q-icon name="search" color="primary" /> Consultar Estado de Solicitud
          </div>
          <q-btn flat round dense icon="close" size="sm" v-close-popup />
        </div>

        <div class="space-y-4">
          <div class="flex gap-2">
            <q-input
              v-model="searchCode"
              placeholder="Ej. SOL-2026-001"
              outlined
              rounded
              dense
              class="flex-1 text-uppercase"
              @keyup.enter="consultarSolicitud"
            />
            <q-btn
              label="Buscar"
              color="primary"
              unelevated
              rounded
              class="font-black px-4"
              :loading="consulting"
              @click="consultarSolicitud"
            />
          </div>

          <div v-if="consultResult" class="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 animate-fade-in">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {{ consultResult.solicitud.codigo_solicitud }}
                </span>
                <div class="text-sm font-black text-gray-800 uppercase mt-1">{{ consultResult.solicitud.titulo_sugerido }}</div>
                <div class="text-[10px] text-gray-500 font-bold uppercase">{{ consultResult.solicitud.solicitante_carrera }} • {{ consultResult.solicitud.solicitante_nombre }}</div>
              </div>
              <q-badge
                :color="getEstadoBadgeColor(consultResult.solicitud.estado)"
                class="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg"
              >
                {{ consultResult.solicitud.estado }}
              </q-badge>
            </div>

            <!-- OBSERVACIONES DE RRHH SI LAS HUBIERA -->
            <div v-if="consultResult.solicitud.observaciones_rrhh" class="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
              <div class="font-black uppercase text-[10px] flex items-center gap-1 mb-0.5">
                <q-icon name="comment" size="14px" /> Mensaje de Talento Humano:
              </div>
              <div>{{ consultResult.solicitud.observaciones_rrhh }}</div>
            </div>

            <!-- SI YA FUE APROBADA -->
            <div v-if="consultResult.solicitud.estado === 'aprobada'" class="bg-teal-50 border border-teal-200 p-3 rounded-xl text-xs text-teal-900">
              <div class="font-black uppercase text-[10px] flex items-center gap-1 mb-0.5">
                <q-icon name="check_circle" size="14px" /> Convocatoria Aprobada:
              </div>
              <div>La convocatoria ya cuenta con visto bueno y se encuentra en programación oficial de fechas de publicación.</div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const currentStep = ref(1)
const submitting = ref(false)
const showSuccessDialog = ref(false)
const generatedCode = ref('')

const showConsultDialog = ref(false)
const searchCode = ref('')
const consulting = ref(false)
const consultResult = ref(null)

const catalogoSedes = ref([])
const catalogoCargos = ref([])

// ESTADO DE RECEPCIÓN
const recepcionHabilitada = ref(true)
const mensajeCierre = ref('')
const loadingStatus = ref(true)

const tiposPerfil = [
  { value: 'docente', label: 'Docente', icon: 'school', desc: 'Cátedra y Materias' },
  { value: 'adm', label: 'Administrativo', icon: 'work', desc: 'Gestión y Jefaturas' },
  { value: 'tecnico', label: 'Técnico', icon: 'build', desc: 'Laboratorios y Soporte' },
  { value: 'invest', label: 'Investigación', icon: 'biotech', desc: 'Proyectos I+D' }
]

const form = ref({
  solicitante_nombre: '',
  solicitante_cargo: '',
  solicitante_carrera: '',
  solicitante_email: '',
  solicitante_telefono: '',
  tipo_perfil: 'docente',
  titulo_sugerido: '',
  descripcion_motivo: '',
  sedes_ids: [],
  cargos_ids: [],
  requisito_formacion: '',
  requisito_posgrado: '',
  requisito_experiencia_profesional: '',
  requisito_experiencia_docente: '',
  otros_requisitos: '',
  archivo_adjunto: null
})

const checkRecepcionStatus = async () => {
  try {
    const { data } = await api.get('/portal/recepcion-solicitudes-status')
    recepcionHabilitada.value = data.habilitada
    mensajeCierre.value = data.mensaje_cierre
  } catch {
    recepcionHabilitada.value = true
  } finally {
    loadingStatus.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    checkRecepcionStatus(),
    loadCatalogos()
  ])
})

const loadCatalogos = async () => {
  try {
    const { data } = await api.get('/portal/catalogos-solicitud')
    catalogoSedes.value = data.sedes || []
    catalogoCargos.value = data.cargos || []
  } catch (error) {
    console.error('Error al cargar catálogos:', error)
  }
}

const goToStep = (step) => {
  if (step === 2) {
    if (!form.value.solicitante_nombre || !form.value.solicitante_cargo || !form.value.solicitante_carrera || !form.value.solicitante_email) {
      $q.notify({ type: 'warning', message: 'Por favor complete todos los campos obligatorios del solicitante' })
      return
    }
  }
  if (step === 3) {
    if (!form.value.titulo_sugerido || form.value.sedes_ids.length === 0 || form.value.cargos_ids.length === 0) {
      $q.notify({ type: 'warning', message: 'Por favor ingrese el título y seleccione al menos una sede y un cargo' })
      return
    }
  }
  currentStep.value = step
}

const handleSubmit = async () => {
  if (!form.value.requisito_formacion) {
    $q.notify({ type: 'warning', message: 'Por favor indique la formación académica requerida' })
    return
  }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('solicitante_nombre', form.value.solicitante_nombre)
    formData.append('solicitante_cargo', form.value.solicitante_cargo)
    formData.append('solicitante_carrera', form.value.solicitante_carrera)
    formData.append('solicitante_email', form.value.solicitante_email)
    formData.append('solicitante_telefono', form.value.solicitante_telefono)
    formData.append('tipo_perfil', form.value.tipo_perfil)
    formData.append('titulo_sugerido', form.value.titulo_sugerido)
    if (form.value.descripcion_motivo) formData.append('descripcion_motivo', form.value.descripcion_motivo)
    
    form.value.sedes_ids.forEach((id, idx) => formData.append(`sedes_ids[${idx}]`, id))
    form.value.cargos_ids.forEach((id, idx) => formData.append(`cargos_ids[${idx}]`, id))

    if (form.value.requisito_formacion) formData.append('requisito_formacion', form.value.requisito_formacion)
    if (form.value.requisito_posgrado) formData.append('requisito_posgrado', form.value.requisito_posgrado)
    if (form.value.requisito_experiencia_profesional) formData.append('requisito_experiencia_profesional', form.value.requisito_experiencia_profesional)
    if (form.value.requisito_experiencia_docente) formData.append('requisito_experiencia_docente', form.value.requisito_experiencia_docente)
    if (form.value.otros_requisitos) formData.append('otros_requisitos', form.value.otros_requisitos)

    if (form.value.archivo_adjunto) {
      formData.append('archivo_adjunto', form.value.archivo_adjunto)
    }

    const { data } = await api.post('/portal/solicitar-convocatoria', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    generatedCode.value = data.codigo_solicitud
    showSuccessDialog.value = true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al enviar la solicitud' })
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  showSuccessDialog.value = false
  currentStep.value = 1
  form.value = {
    solicitante_nombre: '',
    solicitante_cargo: '',
    solicitante_carrera: '',
    solicitante_email: '',
    solicitante_telefono: '',
    tipo_perfil: 'docente',
    titulo_sugerido: '',
    descripcion_motivo: '',
    sedes_ids: [],
    cargos_ids: [],
    requisito_formacion: '',
    requisito_posgrado: '',
    requisito_experiencia_profesional: '',
    requisito_experiencia_docente: '',
    otros_requisitos: '',
    archivo_adjunto: null
  }
}

const consultarSolicitud = async () => {
  if (!searchCode.value) return
  consulting.value = true
  consultResult.value = null
  try {
    const { data } = await api.get(`/portal/consultar-solicitud/${searchCode.value.trim().toUpperCase()}`)
    consultResult.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'No se encontró ninguna solicitud con ese código' })
  } finally {
    consulting.value = false
  }
}

const getEstadoBadgeColor = (estado) => {
  const map = {
    pendiente: 'orange-8',
    observada: 'deep-orange-7',
    aprobada: 'positive',
    rechazada: 'negative'
  }
  return map[estado] || 'grey-7'
}
</script>
