<template>
   <q-page class="bg-gray-100 min-h-screen">
      <!-- Header Decorativo -->
      <div class="header-gradient">
         <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
         <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
         <div class="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

         <div class="relative z-10 container mx-auto px-4 py-8 text-white">
            <!-- Botón regresar al inicio -->
            <router-link to="/"
               class="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm">
               <q-icon name="arrow_back" size="20px" />
               <span>Volver al Portal</span>
            </router-link>

            <div class="flex items-center gap-2 text-blue-100 mb-1 text-sm font-medium uppercase tracking-wider">
               <q-icon name="verified" size="xs" />
               Proceso Oficial
            </div>
            <h1 class="text-3xl md:text-4xl font-bold">Formulario de Postulación</h1>
            <p class="text-lg text-blue-100 max-w-xl mt-2">
               Complete la información requerida para participar en nuestras convocatorias vigentes.
            </p>
         </div>
      </div>

      <!-- Stepper Container -->
      <div class="container mx-auto px-4 py-8">
         <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <StepperPostulacion />
         </div>
      </div>

   </q-page>
</template>

<script setup>
import StepperPostulacion from 'components/StepperPostulacion.vue'
</script>

<style scoped>
.header-gradient {
   background: linear-gradient(135deg, #663399 0%, #009999 100%);
   position: relative;
   overflow: hidden;
}
</style>
