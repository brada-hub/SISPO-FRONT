<template>
  <q-page class="consult-page bg-white min-h-screen">
    <!-- BACKGROUND PATTERN -->
    <div class="portal-bg-pattern"></div>

    <!-- HEADER SECTION (Full Width, No Corners) -->
    <header class="portal-header shadow-lg relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#4a2371] via-[#2c4e91] to-[#009b9b]"></div>

      <!-- DECORATIVE ELEMENTS -->
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent"></div>
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 py-12 px-8 w-full">
        <div class="flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="text-center md:text-left">
            <div class="flex items-center gap-3 mb-4 justify-center md:justify-start">
               <q-icon name="search" color="teal-3" size="sm" class="opacity-80" />
               <span class="text-white/60 text-[10px] font-black uppercase tracking-[.3em]">Consulta Pública</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2 leading-none">
              Seguimiento de <span class="text-teal-300">Postulación</span>
            </h1>
            <p class="text-white/70 font-bold max-w-2xl text-sm leading-relaxed">
              Verifica el progreso de tus aplicaciones introduciendo tu número de carnet de identidad.
            </p>
          </div>

          <q-btn
            to="/"
            flat
            text-color="white"
            label="VOLVER AL INICIO"
            icon="arrow_back"
            class="rounded-2xl border border-white/20 backdrop-blur-md px-6 py-3 font-black text-xs tracking-widest"
          />
        </div>
      </div>
    </header>

    <!-- MAIN CONTENT AREA (Full width, integrated) -->
    <main class="relative z-10 w-full bg-white min-h-[calc(100vh-250px)] pb-20 border-t border-gray-100">
      <!-- SEARCH BAR SECTION -->
      <div class="bg-gray-50/50 py-12 px-8 border-b border-gray-100">
        <div class="max-w-3xl">
          <div class="text-[10px] font-black text-primary uppercase tracking-[.3em] mb-4">Validación de Identidad</div>
          <q-form @submit="buscar" class="flex flex-col md:flex-row gap-4">
            <q-input
              v-model="ci"
              label="NÚMERO DE CARNET (CI)"
              placeholder="Ej: 1234567"
              outlined
              stack-label
              bg-color="white"
              class="ci-input h-16 flex-grow"
              mask="############"
              :rules="[val => !!val || 'El CI es obligatorio']"
              @keyup.enter="buscar"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-input>

            <q-btn
              label="INICIAR BÚSQUEDA"
              color="primary"
              unelevated
              class="rounded-xl font-black h-14 md:h-16 px-10 shadow-xl shadow-primary/20"
              :loading="loading"
              type="submit"
            />
          </q-form>
        </div>
      </div>

      <!-- RESULTS SECTION -->
      <div v-if="resultado" class="p-8 md:p-12 animate-fade-in content-container">
        <div class="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
          <div class="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <q-avatar color="primary" text-color="white" icon="person" size="md" />
          </div>
          <div>
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 text-bold">Candidato Registrado</div>
            <div class="text-2xl font-black text-gray-900 uppercase tracking-tighter">
              {{ resultado.postulante.nombres }} {{ resultado.postulante.apellidos }}
            </div>
          </div>
        </div>

        <!-- RESPONSIVE GRID 3/2/1 -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div
                  v-for="p in resultado.postulaciones"
                  :key="p.id"
                  class="postulacion-card bg-white rounded-3xl border border-gray-100 p-8 transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
                >
                  <!-- TOP DECORATION ACCENT -->
                  <div :class="`absolute top-0 left-0 w-full h-1 bg-${getStatusColor(p.estado)}`"></div>

                  <div class="flex flex-col h-full relative z-10">
                    <div class="flex justify-between items-start mb-6">
                      <div class="p-3 bg-gray-50 rounded-2xl text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <q-icon name="work" size="md" />
                      </div>
                      <!-- BADGE WITH VISIBLE TEXT AND COLOR -->
                      <q-badge
                        :color="getStatusColor(p.estado)"
                        class="rounded-lg px-4 py-2 font-black uppercase text-[10px] tracking-widest shadow-md"
                      >
                        {{ statusLabels[p.estado] || 'POSTULADO' }}
                      </q-badge>
                    </div>

                    <div class="flex-grow">
                      <h3 class="text-lg font-black text-gray-800 uppercase tracking-tight leading-tight mb-3 group-hover:text-primary transition-colors">
                        {{ p.cargo }}
                      </h3>
                      <div class="flex items-center gap-2 text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl">
                        <q-icon name="place" color="primary" size="xs" />
                        <span class="text-[10px] font-black uppercase tracking-[.2em]">{{ p.sede }}</span>
                      </div>
                    </div>

                    <div class="pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fecha de Postulación</div>
                      <div class="text-[11px] text-gray-700 font-black">{{ formatDate(p.fecha) }}</div>
                    </div>
                  </div>
                </div>
              </div>
      </div>

      <!-- NOT FOUND STATE -->
      <div v-if="notFound" class="p-12 text-center animate-bounce-in max-w-4xl mx-auto">
        <div class="bg-red-50 p-12 rounded-[40px] border border-red-100 shadow-inner">
          <div class="inline-flex p-6 bg-white rounded-full shadow-lg mb-6">
            <q-icon name="search_off" size="5rem" color="red-4" />
          </div>
          <h2 class="text-3xl font-black text-red-9 uppercase tracking-tighter mb-4">Sin Coincidencias</h2>
          <p class="text-red-7/70 font-bold text-lg max-w-lg mx-auto leading-relaxed"> No logramos encontrar registros asociados al carnet: <br><span class="text-red-8 bg-white px-4 py-1 rounded-full mt-2 inline-block shadow-sm">{{ ci }}</span></p>
        </div>
      </div>
    </main>

    <footer class="text-center py-12 border-t border-gray-100 bg-gray-50/30">
      <div class="text-[10px] font-black uppercase tracking-[.5em] text-gray-400">
        &copy; 2026 UNITEPC • SISTEMA SISPO • GESTIÓN DE TALENTO HUMANO
      </div>
    </footer>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { date } from 'quasar'

const ci = ref('')
const loading = ref(false)
const resultado = ref(null)
const notFound = ref(false)

const statusLabels = {
  enviada: 'Postulado',
  en_revision: 'En Evaluación',
  validada: 'Pre-seleccionado',
  observada: 'Con Observación',
  rechazada: 'No Seleccionado'
}

const buscar = async () => {
  if (!ci.value) return

  loading.value = true
  resultado.value = null
  notFound.value = false

  try {
    const { data } = await api.get(`/portal/consultar/${ci.value}`)
    resultado.value = data
  } catch (error) {
    console.error('Error consultando estado:', error)
    if (error.response?.status === 404) {
      notFound.value = true
    }
  } finally {
    loading.value = false
  }
}

const getStatusColor = (estado) => {
  const e = String(estado || '').toLowerCase()
  if (e === 'enviada') return 'indigo-7'
  if (e === 'en_revision') return 'orange-8'
  if (e === 'validada') return 'teal-7'
  if (e === 'observada') return 'red-9'
  if (e === 'rechazada') return 'grey-9'
  return 'primary'
}

const formatDate = (d) => {
  return date.formatDate(d, 'DD [de] MMMM, YYYY', {
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  })
}
</script>

<style scoped>
.consult-page {
  background-image: radial-gradient(circle at top right, rgba(102, 51, 153, 0.02), transparent);
}

.portal-header {
  min-height: 280px;
}

.portal-bg-pattern {
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.01) 1px, transparent 0);
  background-size: 32px 32px;
  pointer-events: none;
}

.ci-input :deep(.q-field__control) {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.postulacion-card {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
