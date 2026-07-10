<template>
  <div class="skeleton-container q-pa-lg bg-white rounded-borders shadow-1">
    
    <div class="flex items-center q-mb-lg">
      <q-spinner-cube color="primary" size="2em" class="q-mr-md" />
      <div>
        <div class="text-h6 text-primary">La Inteligencia Artificial está procesando...</div>
        <div class="text-caption text-grey-7">{{ currentMessage }}</div>
      </div>
    </div>

    <!-- Progreso simulado -->
    <q-linear-progress 
      :value="progress" 
      color="primary" 
      class="q-mb-xl rounded-borders" 
      size="8px"
    />

    <!-- Mockup de la UI cargando -->
    <div class="row q-col-gutter-md">
      <!-- Radar Placeholder -->
      <div class="col-12 col-md-6 flex flex-center">
        <q-skeleton type="QAvatar" size="200px" />
      </div>
      
      <!-- Datos Placeholder -->
      <div class="col-12 col-md-6">
        <q-skeleton type="text" class="text-h4 q-mb-md" width="40%" />
        <q-skeleton type="text" class="text-subtitle1 q-mb-sm" width="80%" />
        <q-skeleton type="text" class="text-subtitle1 q-mb-sm" width="70%" />
        <q-skeleton type="text" class="text-subtitle1 q-mb-lg" width="90%" />
        
        <div class="row q-gutter-sm">
          <q-skeleton type="QBadge" width="80px" height="24px" />
          <q-skeleton type="QBadge" width="100px" height="24px" />
          <q-skeleton type="QBadge" width="90px" height="24px" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(0.1)
const currentMessage = ref('Analizando estructura del documento PDF...')

const messages = [
  'Extrayendo entidades semánticas...',
  'Evaluando formación académica y trayectoria...',
  'Cruzando habilidades con requerimientos del cargo...',
  'Generando matriz de compatibilidad...',
  'Redactando observaciones ejecutivas...',
  'Finalizando cálculos de score...'
]

let timer = null
let msgTimer = null

onMounted(() => {
  // Simular progreso de 0 a 95%
  timer = setInterval(() => {
    if (progress.value < 0.95) {
      // Avanzar de a poco para simular carga real (aprox 10-15 segs)
      progress.value += (Math.random() * 0.1)
    }
  }, 1500)

  // Cambiar mensajes
  let msgIndex = 0
  msgTimer = setInterval(() => {
    if (msgIndex < messages.length) {
      currentMessage.value = messages[msgIndex]
      msgIndex++
    }
  }, 2500)
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(msgTimer)
})
</script>

<style scoped>
.skeleton-container {
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.2); /* Borde sutil índigo */
  background: linear-gradient(to bottom right, #ffffff, #f8fafc);
}
</style>
