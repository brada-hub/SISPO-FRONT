<template>
  <div class="flex-1 row no-wrap overflow-hidden h-full">
    <!-- LEFT: EXPEDIENTE VIEW -->
    <div class="col-12 col-md-7 h-full scroll flex justify-center bg-grey-4 p-10 border-r shadow-inner overflow-y-auto">
      <div v-if="loading" class="flex flex-center h-full">
        <q-spinner color="primary" size="3em" />
        <div class="q-ml-sm text-grey-7">Cargando expediente...</div>
      </div>

      <div v-else-if="postulacion" class="h-full flex flex-col no-wrap w-full overflow-hidden">
        <q-tabs
          v-model="activeTab"
          dense
          class="bg-white text-grey-7 shadow-2 no-print shrink-0"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="tradicional" icon="description" label="Ficha Tradicional" />
          <q-tab name="ia" icon="fact_check" label="Evaluación Sistema" class="text-primary" />
        </q-tabs>

        <q-tab-panels v-model="activeTab" animated class="flex-1 bg-transparent overflow-y-auto">
          <q-tab-panel name="tradicional" class="q-pa-md flex justify-center">
            <div id="expediente-carta" class="reporte-container print-content shadow-2">
        <!-- HEADER -->
        <div class="seccion-reporte text-center mb-6">
          <h1 class="header-title">UNITEPC</h1>
          <h2 class="header-subtitle">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</h2>
          <h3 class="header-cv">CURRICULUM VITAE</h3>
          <h4 class="header-selection">{{ postulacion?.oferta?.convocatoria?.titulo || 'HOJA DE VIDA INSTITUCIONAL' }}</h4>
        </div>

        <!-- PHOTO & LOGO -->
        <div class="seccion-reporte row items-center no-wrap mb-4 px-10">
          <div class="col-4 flex flex-start">
            <img src="~assets/unitepc_escudo.png" style="height: 90px; width: auto;" @error="(e) => e.target.style.display = 'none'" />
          </div>
          <div class="col-8 flex items-center justify-end">
            <div class="flex items-center gap-4">
              <div class="text-right">
                  <div class="text-[11px] font-bold text-[#663399]">FOTOGRAFÍA<br/>PERSONAL:</div>
              </div>
              <div class="photo-box-header">
                <img
                  v-if="postulacion?.postulante?.foto_perfil_path"
                  :src="getFileUrl(postulacion.postulante.foto_perfil_path)"
                  class="photo-img"
                  @error="(e) => e.target.style.display = 'none'"
                />
                <div v-else class="text-[9px] text-grey-6 text-center italic p-1">
                  Sin fotografía registrada
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION I: DATOS PERSONALES -->
        <div class="seccion-reporte mb-6">
          <div class="section-header">I. DATOS PERSONALES</div>
          <table class="data-table">
            <tr>
              <td class="label">NOMBRE COMPLETO:</td>
              <td class="value font-bold text-lg text-[#663399]">{{ postulacion?.postulante?.nombres }} {{ postulacion?.postulante?.apellidos }}</td>
            </tr>
            <tr>
              <td class="label">{{ (postulacion?.tipo === 'staff' || postulacion?.rol_id) ? 'CARGO INSTITUCIONAL:' : 'CARGO AL QUE POSTULA:' }}</td>
              <td class="value uppercase font-bold">
                {{ postulacion?.oferta?.cargo?.nombre || postulacion?.rol?.nombre || 'Personal / Postulante' }}
                <span class="text-[#663399] ml-2 font-normal">({{ postulacion?.oferta?.sede?.nombre || postulacion?.sede?.nombre || '---' }})</span>
              </td>
            </tr>
            <tr>
              <td class="label">Nº DE CÉDULA DE IDENTIDAD:</td>
              <td class="value">{{ postulacion?.postulante?.ci }} {{ postulacion?.postulante?.ci_expedido }}</td>
            </tr>
            <tr>
              <td class="label">CÉDULA DE IDENTIDAD:</td>
              <td class="value">
                <div class="row no-wrap items-center gap-4">
                  <a v-if="postulacion?.postulante?.ci_archivo_path" @click="previewFile(postulacion.postulante.ci_archivo_path)" class="text-xs text-blue-8 underline cursor-pointer flex-1 font-bold uppercase">
                    VER AQUÍ
                  </a>
                  <div class="qr-box-small">
                    <QrcodeVue v-if="postulacion?.postulante?.ci_archivo_path" :value="getFileUrl(postulacion.postulante.ci_archivo_path)" :size="60" level="M" render-as="svg" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="label">NACIONALIDAD:</td>
              <td class="value uppercase">{{ postulacion?.postulante?.nacionalidad }}</td>
            </tr>
            <tr>
              <td class="label">DIRECCIÓN DE DOMICILIO:</td>
              <td class="value">{{ postulacion?.postulante?.direccion_domicilio }}</td>
            </tr>
            <tr>
              <td class="label">Nº DE TELÉFONO DE CONTACTO:</td>
              <td class="value">{{ postulacion?.postulante?.celular }}</td>
            </tr>
            <tr>
              <td class="label">CORREO PERSONAL:</td>
              <td class="value text-blue-8 underline">{{ postulacion?.postulante?.email }}</td>
            </tr>
            <tr v-if="postulacion?.email || postulacion?.postulante?.email_institucional">
              <td class="label">CORREO INSTITUCIONAL:</td>
              <td class="value text-[#663399] font-bold">
                {{ postulacion?.email || postulacion?.postulante?.email_institucional }}
              </td>
            </tr>
            <tr v-if="postulacion?.postulante?.carta_postulacion_path && !postulacion?.rol_id">
              <td class="label">CARTA DE POSTULACIÓN:</td>
              <td class="value">
                <div class="row no-wrap items-center gap-4">
                  <a v-if="postulacion?.postulante?.carta_postulacion_path" @click="previewFile(postulacion.postulante.carta_postulacion_path)" class="text-xs text-blue-8 underline cursor-pointer flex-1 font-bold uppercase">
                    VER AQUÍ
                  </a>
                  <div class="qr-box-small">
                    <QrcodeVue v-if="postulacion?.postulante?.carta_postulacion_path" :value="getFileUrl(postulacion.postulante.carta_postulacion_path)" :size="60" level="M" render-as="svg" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="label">CURRICULUM VITAE:</td>
              <td class="value">
                <div class="row no-wrap items-center gap-4">
                  <a v-if="postulacion?.postulante?.cv_pdf_path" @click="previewFile(postulacion.postulante.cv_pdf_path)" class="text-xs text-blue-8 underline cursor-pointer flex-1 font-bold uppercase">
                    VER AQUÍ
                  </a>
                  <div class="qr-box-small">
                    <QrcodeVue v-if="postulacion?.postulante?.cv_pdf_path" :value="getFileUrl(postulacion.postulante.cv_pdf_path)" :size="60" level="M" render-as="svg" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="label">REFERENCIA PERSONAL:</td>
              <td class="value">
                Telf: {{ postulacion?.postulante?.ref_personal_celular || '---' }} -
                Relación: {{ postulacion?.postulante?.ref_personal_parentesco || '---' }}
              </td>
            </tr>
            <tr>
              <td class="label">REFERENCIA LABORAL:</td>
              <td class="value">
                Telf: {{ postulacion?.postulante?.ref_laboral_celular || '---' }} -
                Institución / Detalle: {{ postulacion?.postulante?.ref_laboral_detalle || '---' }}
              </td>
            </tr>
            <tr v-if="postulacion?.pretension_salarial && !postulacion?.rol_id">
              <td class="label">PRETENSIÓN SALARIAL:</td>
              <td class="value font-bold text-teal-8">
                {{ postulacion?.pretension_salarial ? `${Math.round(Number(postulacion.pretension_salarial)).toLocaleString('de-DE')} Bs.` : '---' }}
              </td>
            </tr>
            <tr v-if="postulacion?.porque_cargo && !postulacion?.rol_id">
              <td class="label">POR QUÉ EL CARGO:</td>
              <td class="value italic">
                {{ postulacion?.porque_cargo }}
              </td>
            </tr>
          </table>
        </div>

        <!-- DYNAMIC SECTIONS (II, III, IV...) -->
        <div v-for="(group, idx) in filteredMeritos" :key="group.tipo?.id" class="seccion-reporte mb-6">
          <div class="section-header">
            {{ romanize(idx + 2) }}. {{ group.tipo?.nombre }}
          </div>
          <div v-if="group.tipo?.descripcion" class="text-[10px] text-grey-7 italic mb-1 uppercase text-left font-bold pl-4">
            ({{ group.tipo?.descripcion }})
          </div>

          <table class="merit-table">
            <thead>
              <tr>
                <template v-for="campo in group.tipo?.campos" :key="campo.key">
                  <th>{{ campo.label }}</th>
                  <template v-for="configArch in group.tipo?.config_archivos?.filter(a => a.after_campo === campo.key)" :key="configArch.id">
                    <th class="w-[30mm]">{{ configArch.label }}</th>
                  </template>
                </template>
                <template v-for="configArch in group.tipo?.config_archivos?.filter(a => !a.after_campo)" :key="configArch.id">
                  <th class="w-[30mm]">{{ configArch.label }}</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="merito in group.items" :key="merito.id">
                <template v-for="campo in group.tipo?.campos" :key="campo.key">
                  <td class="text-center font-bold uppercase text-[10px]">
                    {{ formatCellValue(merito.respuestas[campo.key]) }}
                  </td>
                  <template v-for="configArch in group.tipo?.config_archivos?.filter(a => a.after_campo === campo.key)" :key="configArch.id">
                    <td class="text-center">
                      <div v-if="getMeritoFile(merito, configArch.id)" class="flex flex-col items-center justify-center">
                        <div class="no-print mb-1">
                          <a @click="previewFile(getMeritoFile(merito, configArch.id))" class="text-[9px] text-blue-7 underline cursor-pointer font-bold uppercase tracking-tighter">
                            VER AQUÍ
                          </a>
                        </div>
                        <div class="qr-box-small no-border">
                          <QrcodeVue :value="getFileUrl(getMeritoFile(merito, configArch.id))" :size="75" level="M" render-as="svg" />
                        </div>
                      </div>
                      <div v-else>—</div>
                    </td>
                  </template>
                </template>
                <template v-for="configArch in group.tipo?.config_archivos?.filter(a => !a.after_campo)" :key="configArch.id">
                  <td class="text-center">
                    <div v-if="getMeritoFile(merito, configArch.id)" class="flex flex-col items-center justify-center">
                      <div class="no-print mb-1">
                        <a @click="previewFile(getMeritoFile(merito, configArch.id))" class="text-[9px] text-blue-7 underline cursor-pointer font-bold uppercase tracking-tighter">
                          VER AQUÍ
                        </a>
                      </div>
                      <div class="qr-box-small no-border">
                        <QrcodeVue :value="getFileUrl(getMeritoFile(merito, configArch.id))" :size="75" level="M" render-as="svg" />
                      </div>
                    </div>
                    <div v-else>—</div>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- FOOTER -->
        <div class="seccion-reporte mt-10 pt-4 border-t-2 border-[#663399] text-center">
          <div class="text-[10px] text-[#663399] font-black uppercase tracking-widest">
            SISTEMA DE GESTIÓN DE CONVOCATORIAS UNITEPC
          </div>
          <div class="text-[9px] text-gray-500 mt-1">
            Documento generado digitalmente por el panel administrativo. ID #{{ postulacion?.id }} - {{ new Date().getDate().toString().padStart(2, '0') }}-{{ (new Date().getMonth() + 1).toString().padStart(2, '0') }}-{{ new Date().getFullYear() }} {{ new Date().getHours().toString().padStart(2, '0') }}:{{ new Date().getMinutes().toString().padStart(2, '0') }}
          </div>
        </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="ia" class="q-pa-md">
            <AiPanel :postulacion-id="postulacionId" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- RIGHT: DOCUMENT PREVIEWER -->
    <div class="col-12 col-md-5 h-full bg-[#1e1e1e] flex flex-col no-wrap no-print overflow-hidden shadow-2xl">
      <div class="bg-black/60 p-4 text-white flex justify-between items-center border-b border-white/10">
          <div class="flex items-center gap-2">
             <q-icon name="visibility" color="amber-5" />
             <span class="font-bold text-xs uppercase tracking-widest text-[#ddd]">PREVISUALIZACIÓN DE ARCHIVO</span>
          </div>
          <q-btn v-if="currentFile" flat round icon="open_in_new" color="white" size="sm" @click="openFileNewTab" />
      </div>

      <div class="flex-1 overflow-hidden flex flex-center relative">
         <iframe
           v-if="currentFile && isPdf(currentFile)"
           :src="currentFileUrl"
           class="full-width full-height border-none"
         ></iframe>

         <div v-else-if="currentFile && !isPdf(currentFile)" class="full-width full-height flex flex-center overflow-auto p-4">
            <img :src="currentFileUrl" class="max-w-full max-h-full shadow-2xl rounded" />
         </div>

         <div v-else class="text-center text-white/20 q-pa-xl">
           <q-icon name="description" size="8rem" class="opacity-10 mb-4" />
           <div class="text-lg font-bold uppercase tracking-[0.2em]">Visor de Evidencias</div>
           <p class="text-xs opacity-50">Haga clic en cualquier enlace al lado izquierdo para cargar el documento aquí.</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'boot/axios'
import QrcodeVue from 'qrcode.vue'
import AiPanel from '../Ai/AiPanel.vue'

const activeTab = ref('tradicional')

const props = defineProps({
  postulacionId: {
    type: [Number, String],
    required: true
  }
})

const postulacion = ref(null)
const currentFile = ref(null)
const loading = ref(false)

const loadExpediente = async () => {
  if (!props.postulacionId) return
  loading.value = true
  try {
    // If ID contains 'u' or 'p', it's a general expediente. Otherwise it's a postulación ID.
    const endpoint = (String(props.postulacionId).includes('u') || String(props.postulacionId).includes('p'))
       ? `/expedientes/${props.postulacionId}`
       : `/postulaciones/${props.postulacionId}/expediente`

    const { data } = await api.get(endpoint)
    postulacion.value = data.data || data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

watch(() => props.postulacionId, loadExpediente, { immediate: true })

const filteredMeritos = computed(() => {
  const p = postulacion.value?.postulante
  if (!p) return []

  const configRequisitos = postulacion.value?.oferta?.convocatoria?.config_requisitos_ids
  const allowedIds = configRequisitos && Array.isArray(configRequisitos)
     ? configRequisitos.map(id => Number(id))
     : null

  // Check if normalized tables exist in the payload
  const hasNormalized = p.formaciones_academicas || p.postgrados || p.experiencias_profesionales || p.experiencias_docencia || p.capacitaciones || p.producciones || p.reconocimientos

  if (hasNormalized) {
     const groups = []

     // 1. Formación Académica
     if (!allowedIds || allowedIds.includes(1)) {
        const items = (p.formaciones_academicas || []).map(row => ({
           id: row.id,
           tipo_documento_id: 1,
           respuestas: {
              nivel: row.nivel_academico,
              universidad: row.universidad,
              profesion: row.carrera,
              fecha_diploma: row.fecha_diploma,
              fecha_titulo: row.fecha_titulo
           },
           archivos: [
              ...(row.diploma_archivo_path ? [{ config_archivo_id: 'diploma', archivo_path: row.diploma_archivo_path }] : []),
              ...(row.titulo_archivo_path ? [{ config_archivo_id: 'titulo', archivo_path: row.titulo_archivo_path }] : [])
           ]
        }))
        if (items.length > 0) {
           groups.push({
              tipo: {
                 id: 1,
                 nombre: 'FORMACIÓN ACADÉMICA',
                 orden: 1,
                 campos: [
                    { key: 'nivel', label: 'NIVEL' },
                    { key: 'universidad', label: 'UNIVERSIDAD' },
                    { key: 'profesion', label: 'PROFESIÓN' },
                    { key: 'fecha_diploma', label: 'FECHA DIPLOMA' },
                    { key: 'fecha_titulo', label: 'FECHA TÍTULO' }
                 ],
                 config_archivos: [
                    { id: 'diploma', after_campo: 'profesion' },
                    { id: 'titulo', after_campo: 'fecha_titulo' }
                 ]
              },
              items
           })
        }
     }

     // 2. Formación Postgrado
     if (!allowedIds || allowedIds.includes(2)) {
        const items = (p.postgrados || []).map(row => ({
           id: row.id,
           tipo_documento_id: 2,
           respuestas: {
              tipo_posgrado: row.tipo_posgrado,
              nombre_programa: row.nombre_programa,
              fecha_certificacion: row.fecha_certificacion,
              institucion: row.institucion
           },
           archivos: [
              ...(row.certificado_archivo_path ? [{ config_archivo_id: 'certificado', archivo_path: row.certificado_archivo_path }] : [])
           ]
        }))
        if (items.length > 0) {
           groups.push({
              tipo: {
                 id: 2,
                 nombre: 'FORMACIÓN DE POSTGRADO',
                 orden: 2,
                 campos: [
                    { key: 'tipo_posgrado', label: 'TIPO POSGRADO' },
                    { key: 'nombre_programa', label: 'PROGRAMA' },
                    { key: 'fecha_certificacion', label: 'FECHA CERTIFICACIÓN' },
                    { key: 'institucion', label: 'INSTITUCIÓN' }
                 ],
                 config_archivos: [
                    { id: 'certificado' }
                 ]
              },
              items
           })
        }
     }

     // 3. Experiencia Docencia
     if (!allowedIds || allowedIds.includes(3)) {
        const items = (p.experiencias_docencia || []).map(row => ({
           id: row.id,
           tipo_documento_id: 3,
           respuestas: {
              universidad: row.universidad,
              carrera: row.carrera,
              asignaturas: row.asignaturas,
              gestion_periodo: row.gestion_periodo
           },
           archivos: [
              ...(row.respaldo_archivo_path ? [{ config_archivo_id: 'respaldo', archivo_path: row.respaldo_archivo_path }] : [])
           ]
        }))
        if (items.length > 0) {
           groups.push({
              tipo: {
                 id: 3,
                 nombre: 'EXPERIENCIA EN DOCENCIA',
                 orden: 3,
                 campos: [
                    { key: 'universidad', label: 'UNIVERSIDAD' },
                    { key: 'carrera', label: 'CARRERA' },
                    { key: 'asignaturas', label: 'ASIGNATURAS' },
                    { key: 'gestion_periodo', label: 'GESTIÓN/PERIODO' }
                 ],
                 config_archivos: [
                    { id: 'respaldo' }
                 ]
              },
              items
           })
        }
     }

     // 4. Experiencia Profesional
     if (!allowedIds || allowedIds.includes(4)) {
        const items = (p.experiencias_profesionales || []).map(row => ({
           id: row.id,
           tipo_documento_id: 4,
           respuestas: {
              cargo: row.cargo,
              empresa: row.empresa,
              fecha_inicio: row.fecha_inicio,
              fecha_fin: row.fecha_fin
           },
           archivos: [
              ...(row.certificado_archivo_path ? [{ config_archivo_id: 'certificado', archivo_path: row.certificado_archivo_path }] : [])
           ]
        }))
        if (items.length > 0) {
           groups.push({
              tipo: {
                 id: 4,
                 nombre: 'EXPERIENCIA PROFESIONAL',
                 orden: 4,
                 campos: [
                    { key: 'cargo', label: 'CARGO' },
                    { key: 'empresa', label: 'EMPRESA' },
                    { key: 'fecha_inicio', label: 'FECHA INICIO' },
                    { key: 'fecha_fin', label: 'FECHA FIN' }
                 ],
                 config_archivos: [
                    { id: 'certificado' }
                 ]
              },
              items
           })
        }
     }

     // 5. Capacitaciones
     if (!allowedIds || allowedIds.includes(5)) {
        const items = (p.capacitaciones || []).map(row => ({
           id: row.id,
           tipo_documento_id: 5,
           respuestas: {
              nombre: row.nombre_curso,
              fecha: row.fecha,
              institucion: row.institucion_organizadora,
              horas: row.carga_horaria
           },
           archivos: [
              ...(row.certificado_archivo_path ? [{ config_archivo_id: 'certificado', archivo_path: row.certificado_archivo_path }] : [])
           ]
        }))
        if (items.length > 0) {
           groups.push({
              tipo: {
                 id: 5,
                 nombre: 'CAPACITACIÓN Y CURSOS',
                 orden: 5,
                 campos: [
                    { key: 'nombre', label: 'NOMBRE CURSO' },
                    { key: 'fecha', label: 'FECHA' },
                    { key: 'institucion', label: 'INSTITUCIÓN' },
                    { key: 'horas', label: 'HORAS' }
                 ],
                 config_archivos: [
                    { id: 'certificado' }
                 ]
              },
              items
           })
        }
     }

     // 6. Producciones Intelectuales
     if (!allowedIds || allowedIds.includes(6)) {
        const items = (p.producciones || []).map(row => ({
           id: row.id,
           tipo_documento_id: 6,
           respuestas: {
              tipo: row.tipo_produccion,
              titulo: row.titulo,
              fecha: row.fecha_publicacion,
              editorial: row.editorial_revista,
              lugar: row.lugar
           },
           archivos: [
              ...(row.evidencia_archivo_path ? [{ config_archivo_id: 'evidencia', archivo_path: row.evidencia_archivo_path }] : [])
           ]
        }))
        if (items.length > 0) {
           groups.push({
              tipo: {
                 id: 6,
                 nombre: 'PRODUCCIÓN INTELECTUAL Y PUBLICACIONES',
                 orden: 6,
                 campos: [
                    { key: 'tipo', label: 'TIPO' },
                    { key: 'titulo', label: 'TÍTULO' },
                    { key: 'fecha', label: 'FECHA' },
                    { key: 'editorial', label: 'EDITORIAL/REVISTA' },
                    { key: 'lugar', label: 'LUGAR' }
                 ],
                 config_archivos: [
                    { id: 'evidencia' }
                 ]
              },
              items
           })
        }
     }

     // 7. Reconocimientos
     if (!allowedIds || allowedIds.includes(7)) {
        const items = (p.reconocimientos || []).map(row => ({
           id: row.id,
           tipo_documento_id: 7,
           respuestas: {
              titulo: row.titulo_reconocimiento,
              fecha: row.fecha,
              institucion: row.institucion_otorgante,
              lugar: row.lugar
           },
           archivos: [
              ...(row.reconocimiento_archivo_path ? [{ config_archivo_id: 'reconocimiento', archivo_path: row.reconocimiento_archivo_path }] : [])
           ]
        }))
        if (items.length > 0) {
           groups.push({
              tipo: {
                 id: 7,
                 nombre: 'RECONOCIMIENTOS Y DISTINCIONES',
                 orden: 7,
                 campos: [
                    { key: 'titulo', label: 'TÍTULO RECONOCIMIENTO' },
                    { key: 'fecha', label: 'FECHA' },
                    { key: 'institucion', label: 'INSTITUCIÓN' },
                    { key: 'lugar', label: 'LUGAR' }
                 ],
                 config_archivos: [
                    { id: 'reconocimiento' }
                 ]
              },
              items
           })
        }
     }

     return groups.sort((a, b) => (a.tipo?.orden || 0) - (b.tipo?.orden || 0))
  }

  return []
})

const getFileUrl = (path) => {
  if (!path) return ''
  const baseUrl = api.defaults.baseURL.replace(/\/api$/, '')
  return `${baseUrl}/storage/${path}`
}

const currentFileUrl = computed(() => currentFile.value ? getFileUrl(currentFile.value) : null)

const previewFile = (path) => {
  currentFile.value = path
}

const getMeritoFile = (merito, configId) => {
  if (!merito.archivos) return null
  const arch = merito.archivos.find(a => a.config_archivo_id === configId)
  return arch ? arch.archivo_path : null
}

const isPdf = (path) => path.toLowerCase().endsWith('.pdf')

const openFileNewTab = () => { if (currentFileUrl.value) window.open(currentFileUrl.value, '_blank') }

const formatCellValue = (val) => {
  if (val === null || val === undefined || val === '') return '---'
  const str = String(val).trim()
  if (!str) return '---'
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return `${d}/${m}/${y}`
  }
  const slashMatch = str.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
  if (slashMatch) {
    const [, y, m, d] = slashMatch
    return `${d}/${m}/${y}`
  }
  return str.toUpperCase()
}

const romanize = (num) => {
  const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let roman = ''; for (let i in lookup) { while (num >= lookup[i]) { roman += i; num -= lookup[i] } }
  return roman
}

defineExpose({
    postulacion,
    filteredMeritos // Expose for PDF generation in parent
})
</script>

<style scoped>
.reporte-container {
  background: white;
  width: 259mm;
  padding: 15mm;
  margin: 0 auto;
  font-family: 'Times New Roman', Times, serif;
  color: #000;
}
.seccion-reporte { width: 100%; }
.header-title { font-size: 42px; font-weight: 800; margin: 0; line-height: 1; }
.header-subtitle { font-size: 24px; font-weight: 700; margin: 0; }
.header-cv { font-size: 18px; font-weight: 700; margin: 10px 0 0 0; }
.header-selection { font-size: 18px; font-weight: 700; color: #663399; margin: 0; }
.section-header { background: transparent; color: #000; font-size: 16px; font-weight: 900; border-bottom: none; padding: 5px 0; text-transform: uppercase; }
.data-table, .merit-table { width: 100%; border-collapse: collapse; border: 2px solid #663399; }
.data-table td, .merit-table td { padding: 6px 12px; border: 1px solid #663399; font-size: 12px; }
.merit-table th { background-color: #f3efff; color: #663399; font-weight: 900; font-size: 10px; padding: 8px 4px; border: 1px solid #663399; text-transform: uppercase; }
.data-table .label { width: 35%; font-weight: 900; color: #663399; text-align: right; background-color: #f3efff; }
.photo-box-header { border: 1.5px solid #663399; padding: 2px; background: white; width: 75px; height: 95px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.photo-img { width: 100%; height: 100%; object-fit: cover; }
.qr-box-header { border: 1px solid #663399; padding: 2px; background: white; }
.qr-box-small { border: 1px solid #663399; padding: 2px; background: white; width: auto; display: inline-block; }
.qr-box-small.no-border { border: none; }

@media print {
  .no-print { display: none !important; }
  .reporte-container { width: 259mm !important; padding: 10mm !important; margin: 0 !important; }
}
.scroll::-webkit-scrollbar { width: 8px; }
.scroll::-webkit-scrollbar-track { background: #f1f1f1; }
.scroll::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
.scroll::-webkit-scrollbar-thumb:hover { background: #555; }
</style>
