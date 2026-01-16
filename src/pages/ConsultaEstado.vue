<template>
  <q-page class="consult-page bg-grey-2 flex flex-center">
    <!-- DECORATIVE BACKGROUND -->
    <div class="absolute-top full-width portal-header shadow-2">
      <div class="portal-bg-pattern"></div>
    </div>

    <div class="container-content q-pa-md" style="z-index: 1; max-width: 600px; width: 100%;">
      <!-- CARD PRINCIPAL -->
      <q-card class="glass-card q-pa-xl rounded-2xl shadow-24">
        <div class="text-center q-mb-xl">
          <div class="flex flex-center q-mb-md">
            <div class="icon-pulse bg-primary/10 rounded-full q-pa-md">
              <q-icon name="manage_search" size="4rem" color="primary" />
            </div>
          </div>
          <h1 class="text-h3 font-black text-gray-800 tracking-tighter uppercase q-my-none">Seguimiento</h1>
          <p class="text-subtitle1 text-grey-6 font-medium q-mt-sm">Consulta el estado de tu postulación</p>
        </div>

        <q-form @submit="buscar" class="q-gutter-y-lg">
          <q-input
            v-model="ci"
            label="NÚMERO DE CARNET (CI)"
            placeholder="Introduce tu CI..."
            outlined
            stack-label
            bg-color="white"
            class="ci-input"
            mask="############"
            :rules="[val => !!val || 'El CI es obligatorio para consultar']"
            @keyup.enter="buscar"
          >
            <template v-slot:prepend>
              <q-icon name="badge" color="primary" />
            </template>
          </q-input>

          <q-btn
            label="CONSULTAR ESTADO"
            color="primary"
            unelevated
            class="full-width rounded-xl font-black h-14 shadow-lg shadow-primary/20"
            :loading="loading"
            type="submit"
          />
        </q-form>

        <q-separator class="q-my-xl" v-if="resultado" />

        <!-- RESULTADOS -->
        <div v-if="resultado" class="results animate-fade-in">
          <div class="flex items-center gap-3 q-mb-lg">
            <q-avatar color="primary" text-color="white" icon="person" size="md" />
            <div>
              <div class="text-[10px] font-black text-grey-5 font-bold uppercase tracking-widest leading-none mb-1">Candidato</div>
              <div class="text-h6 font-black text-grey-9 uppercase tracking-tighter">
                {{ resultado.postulante.nombres }} {{ resultado.postulante.apellidos }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div
              v-for="p in resultado.postulaciones"
              :key="p.id"
              class="postulacion-item bg-grey-1 rounded-2xl border border-grey-3 p-4 transition-all"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="text-caption font-black text-primary uppercase tracking-widest">{{ p.cargo }}</div>
                  <div class="text-[10px] text-grey-6 font-bold uppercase mb-2">{{ p.sede }}</div>
                  <div class="text-[10px] text-grey-4 text-medium">{{ formatDate(p.fecha) }}</div>
                </div>
                <q-badge
                  :color="getStatusColor(p.estado)"
                  class="rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest shadow-sm"
                >
                  {{ p.estado }}
                </q-badge>
              </div>
            </div>
          </div>
        </div>

        <div v-if="notFound" class="text-center q-mt-lg animate-bounce-in">
          <q-banner class="bg-red-1 text-red-8 rounded-2xl border border-red-2 border-dashed">
            <template v-slot:avatar>
              <q-icon name="error_outline" color="red-8" />
            </template>
            <div class="font-bold uppercase tracking-tighter">No se encontraron registros</div>
            <div class="text-caption opacity-80">Verifica que el CI sea el correcto e intenta nuevamente.</div>
          </q-banner>
        </div>
      </q-card>

      <div class="text-center q-mt-xl text-grey-5 font-bold uppercase tracking-widest text-[10px]">
        &copy; 2026 UNITEPC • Sistema SISPO
      </div>
    </div>
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
  const colors = {
    'enviada': 'indigo-7',
    'en_revision': 'orange-7',
    'validada': 'teal-7',
    'observada': 'deep-orange-7',
    'rechazada': 'red-7'
  }
  return colors[estado.toLowerCase().replace(' ', '_')] || 'grey-7'
}

const formatDate = (d) => {
  return date.formatDate(d, 'DD/MM/YYYY HH:mm')
}
</script>

<style scoped>
.consult-page {
  min-height: 100vh;
}

.portal-header {
  height: 280px;
  background: linear-gradient(135deg, #4a2371 0%, #663399 100%);
  position: absolute;
  top: 0;
  left: 0;
}

.portal-bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
  background-size: 24px 24px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.ci-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f8fafc;
}

.icon-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 51, 153, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(102, 51, 153, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 51, 153, 0); }
}

.postulacion-item:hover {
  transform: translateX(5px);
  border-color: #663399;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.animate-fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
