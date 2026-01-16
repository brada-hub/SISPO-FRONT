<template>
  <div class="q-pa-md max-w-7xl mx-auto">

    <q-stepper
      v-model="store.step"
      ref="stepper"
      color="primary"
      animated
      header-nav
      class="bg-transparent shadow-none"
      active-icon="edit"
      done-icon="check_circle"
      error-icon="warning"
    >
      <!-- PASO 1: SELECCIÓN -->
      <q-step
        :name="1"
        title="Convocatoria"
        icon="campaign"
        :done="store.step > 1"
        class="bg-white rounded-2xl shadow-sm q-pa-lg"
      >
        <div class="text-h5 text-[#663399] font-bold q-mb-md">Selecciona una Convocatoria</div>

        <!-- Cards Convocatorias -->
        <div v-if="!store.convocatoriaSeleccionadaId" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="conv in store.convocatorias" :key="conv.id"
               class="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-l-8 border-[#663399]"
               @click="store.seleccionarConvocatoria(conv.id)">
            <div class="text-xl font-bold text-gray-800 mb-2">{{ conv.titulo }}</div>
            <div class="text-sm text-gray-400 mb-4">{{ conv.codigo }}</div>
            <q-badge color="teal" :label="conv.tipo || 'Pública'" />
            <div class="mt-4 text-right text-[#663399] font-bold">Postular -></div>
          </div>
          <div v-if="store.convocatorias.length === 0" class="col-span-3 text-center text-gray-500 py-10">
            No hay convocatorias abiertas en este momento.
          </div>
        </div>

        <!-- Selección de Ofertas (Una vez seleccionada la convocatoria) -->
        <div v-else>
          <div class="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-xl">
             <div>
               <div class="font-bold text-lg">{{ store.convocatoriaActual?.titulo }}</div>
               <div class="text-xs text-gray-500">Código: {{ store.convocatoriaActual?.codigo }}</div>
             </div>
             <q-btn flat color="negative" label="Cambiar" @click="store.convocatoriaSeleccionadaId = null" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             <!-- Ofertas Disponibles -->
             <div class="bg-white p-4 rounded-xl border border-gray-200">
                <div class="text-subtitle1 font-bold mb-3 text-[#009999]">Ofertas Disponibles</div>

                <q-list separator>
                   <template v-for="(ofertas, sede) in store.ofertasAgrupadas" :key="sede">
                      <q-item-label header class="font-bold text-gray-700 bg-gray-100 rounded q-my-sm">{{ sede }}</q-item-label>
                      <q-item v-for="oferta in ofertas" :key="oferta.id" tag="label" v-ripple>
                        <q-item-section side top>
                          <q-checkbox v-model="store.ofertasSeleccionadas" :val="oferta.id" color="teal" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ oferta.cargo.nombre || oferta.cargo }}</q-item-label>
                          <q-item-label caption v-if="oferta.descripcion">{{ oferta.descripcion }}</q-item-label>
                        </q-item-section>
                      </q-item>
                   </template>
                </q-list>
             </div>

             <!-- Resumen Selección -->
             <div class="bg-[#f0f9ff] p-6 rounded-xl border border-blue-100">
                <div class="text-h6 text-blue-900 mb-2">Resumen de Postulación</div>
                <div class="text-sm text-blue-800 mb-4">Has seleccionado {{ store.ofertasSeleccionadas.length }} cargos.</div>

                <q-btn
                  color="primary"
                  class="w-full rounded-xl py-3 text-bold shadow-lg bg-[#663399]"
                  label="Continuar a Datos Personales"
                  @click="$refs.stepper.next()"
                  :disable="store.ofertasSeleccionadas.length === 0"
                />
             </div>
          </div>
        </div>
      </q-step>

      <!-- PASO 2: DATOS PERSONALES -->
      <q-step
        :name="2"
        title="Datos Personales"
        icon="person"
        :done="store.step > 2"
        class="bg-white rounded-2xl shadow-sm q-pa-lg"
      >
        <q-form @submit="$refs.stepper.next()">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- CI -->
            <q-input v-model="store.ci" label="Cédula de Identidad" outlined color="primary">
               <template v-slot:append>
                  <q-btn round dense flat icon="search" @click="checkCI" color="primary" />
               </template>
            </q-input>
             <q-input v-model="store.postulante.ci_expedido" label="Expedido" outlined color="primary"/>
             <q-input v-model="store.postulante.nombres" label="Nombres" outlined color="primary" :rules="[val => !!val || 'Requerido']"/>
             <q-input v-model="store.postulante.apellidos" label="Apellidos" outlined color="primary" :rules="[val => !!val || 'Requerido']"/>
             <q-input v-model="store.postulante.celular" label="Celular" outlined color="primary"/>
             <q-input v-model="store.postulante.email" label="Email" type="email" outlined color="primary"/>
             <q-input v-model="store.postulante.nacimiento" label="Fecha Nacimiento" type="date" outlined color="primary" stack-label/>
             <q-input v-model="store.postulante.nacionalidad" label="Nacionalidad" outlined color="primary"/>
             <q-input v-model="store.postulante.direccion" label="Dirección" outlined color="primary" class="md:col-span-2"/>
          </div>

          <div class="text-h6 text-[#009999] q-mb-md border-b pb-2">Documentación Personal Base</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <q-file v-model="store.postulante.foto_perfil" label="Foto Perfil (Rostro)" outlined counter>
                <template v-slot:prepend><q-icon name="face" /></template>
             </q-file>
             <q-file v-model="store.postulante.curriculum_vitae" label="Curriculum Vitae (PDF)" outlined counter accept=".pdf">
                <template v-slot:prepend><q-icon name="description" /></template>
             </q-file>
              <q-file v-model="store.postulante.carta_postulacion" label="Carta de Postulación (PDF)" outlined counter accept=".pdf">
                <template v-slot:prepend><q-icon name="mail" /></template>
             </q-file>
          </div>

          <div class="flex justify-between">
            <q-btn flat label="Atrás" @click="$refs.stepper.previous()" color="grey" />
            <q-btn type="submit" label="Siguiente: Méritos" color="primary" class="bg-[#663399]" />
          </div>
        </q-form>
      </q-step>

      <!-- PASO 3: EXPEDIENTE ACADÉMICO (DINÁMICO) -->
      <q-step
        :name="3"
        title="Méritos"
        icon="school"
        :done="store.step > 3"
        class="bg-white rounded-2xl shadow-sm q-pa-lg"
      >
        <div class="text-h6 q-mb-lg text-gray-700">Carga de Documentos y Méritos</div>

        <div v-if="store.tiposDocumento.length === 0" class="text-center py-10 bg-gray-50 rounded text-gray-500">
           Esta convocatoria no requiere documentos adicionales.
        </div>

        <!-- Renderizar FormMerito por cada Tipo de Documento Requerido -->
        <template v-for="tipo in store.tiposDocumento" :key="tipo.id">
           <FormMerito
              :tipo-documento="tipo"
              :model-value="store.documentos[tipo.id] || []"
              @add="store.agregarDocumento(tipo.id)"
              @remove="(idx) => store.eliminarDocumento(tipo.id, idx)"
           />
        </template>

        <div class="flex justify-between mt-8">
            <q-btn flat label="Atrás" @click="$refs.stepper.previous()" color="grey" />
            <q-btn label="Finalizar y Revisar" color="primary" @click="$refs.stepper.next()" class="bg-[#663399]" />
        </div>
      </q-step>

      <!-- PASO 4: CONFIRMACIÓN -->
      <q-step
        :name="4"
        title="Confirmación"
        icon="send"
        class="bg-white rounded-2xl shadow-sm q-pa-lg"
      >
         <div class="text-center q-mb-lg">
            <q-icon name="verified" size="80px" color="teal" />
            <div class="text-2xl font-bold mt-4 text-gray-800">Confirmar Postulación</div>
            <div class="text-gray-500">Por favor revisa tus datos antes de enviar.</div>
         </div>

         <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <div class="grid grid-cols-2 gap-4">
               <div><strong>Postulante:</strong> {{ store.postulante.nombres }} {{ store.postulante.apellidos }}</div>
               <div><strong>CI:</strong> {{ store.ci }}</div>
               <div><strong>Cargos Seleccionados:</strong> {{ store.ofertasSeleccionadas.length }}</div>
               <div><strong>Documentos Adjuntos:</strong> {{ totalAdjuntos }}</div>
            </div>
         </div>

         <div class="flex justify-center gap-4">
            <q-btn flat label="Corregir Datos" @click="$refs.stepper.previous()" color="grey" />
            <q-btn
              push
              label="ENVIAR POSTULACIÓN"
              color="positive"
              size="lg"
              icon="send"
              :loading="store.loading"
              @click="submit"
            />
         </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import { useQuasar } from 'quasar'
import FormMerito from 'components/FormMerito.vue'

const store = usePostulacionStore()
const $q = useQuasar()

onMounted(() => {
  store.cargarConvocatorias()
})

const checkCI = async () => {
    // Implementar lógica de verificación si es necesario,
    // por ahora solo avanza o valida formato.
    if(store.ci.length > 4) {
       $q.notify({ type:'positive', message: 'CI Validado' })
    }
}

const totalAdjuntos = computed(() => {
   let count = 0
   Object.values(store.documentos).forEach(arr => count += arr.length)
   return count
})

const submit = async () => {
   try {
      await store.enviarPostulacion()
      $q.dialog({
        title: 'Éxito',
        message: 'Tu postulación ha sido enviada correctamente.',
        ok: { color: 'primary' }
      }).onOk(() => {
         location.reload() // O redirigir
      })
   } catch {
      $q.notify({ type: 'negative', message: 'Error al enviar postulación.' })
   }
}
</script>

<style scoped>
.q-stepper {
  border-radius: 16px;
}
</style>
