<template>
  <div class="px-6 py-8">
    <div class="flex flex-col items-center mb-10">
      <div class="p-2 bg-primary/10 rounded-full mb-3">
        <q-icon name="map" color="primary" size="lg" />
      </div>
      <h2 class="text-3xl font-black text-gray-800 tracking-tighter uppercase">Selecciona tu Ubicación</h2>
      <p class="text-gray-500 mt-1 font-medium">Explora las sedes disponibles en el mapa interactivo</p>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <q-spinner-puff size="80px" color="primary" />
      <div class="mt-6 text-primary font-black uppercase tracking-widest animate-pulse">Cargando Convocatorias...</div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- LEFT: MAP CONTAINER -->
      <div class="lg:col-span-4">
        <div class="modern-card p-6 h-full border border-gray-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-6 bg-primary rounded-full"></div>
            <div class="text-lg font-black text-gray-700 uppercase tracking-tight">Mapa de Bolivia</div>
          </div>
          <BoliviaMap @select-sede="handleSedeClick" />

          <div class="mt-8 flex flex-col gap-2">
             <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div class="w-4 h-4 rounded-md bg-[#663399]"></div>
                <span class="text-xs font-bold text-gray-600 uppercase">Sedes con ofertas</span>
             </div>
             <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div class="w-4 h-4 rounded-md bg-[#009999]"></div>
                <span class="text-xs font-bold text-gray-600 uppercase">Seleccionada</span>
             </div>
          </div>
        </div>
      </div>

      <!-- CENTER: CARGOS LIST -->
      <div class="lg:col-span-5">
        <div class="modern-card p-6 min-h-[500px] border border-gray-100">
          <div v-if="!departamentoActivo" class="flex flex-col items-center justify-center h-full py-20 opacity-40">
            <div class="p-6 bg-gray-100 rounded-full mb-4">
               <q-icon name="touch_app" size="64px" color="gray-5" />
            </div>
            <div class="text-xl font-black text-gray-400 uppercase tracking-widest">Selecciona una Sede</div>
            <p class="text-sm">Interactúa con el mapa para ver los puestos</p>
          </div>

          <div v-else>
            <div class="flex items-center justify-between mb-8 pb-4 border-b">
              <div class="flex items-center gap-3">
                 <div class="p-2 bg-primary/10 rounded-lg">
                    <q-icon name="location_on" color="primary" />
                 </div>
                 <div class="text-xl font-black text-gray-800 uppercase tracking-tighter">{{ departamentoActivo }}</div>
              </div>
              <q-badge color="teal-7" class="px-3 py-1 font-bold rounded-lg">
                {{ totalCargosVisibles }} CARGOS
              </q-badge>
            </div>

            <div v-for="sede in sedesDelDepartamento" :key="sede.id" class="mb-8">
              <div v-if="sedesDelDepartamento.length > 1" class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span>UBICACIÓN: {{ sede.nombre }}</span>
                <div class="h-[1px] bg-primary/20 flex-grow"></div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div
                  v-for="cargo in sede.cargos"
                  :key="cargo.oferta_id"
                  class="cargo-item-card transition-all"
                  :class="isSelected(cargo.oferta_id) ? 'is-selected' : ''"
                  @click="toggleCargo(cargo, sede)"
                >
                  <div class="flex items-center gap-4">
                    <div class="cargo-check-indicator">
                       <q-icon :name="isSelected(cargo.oferta_id) ? 'check_circle' : 'circle'" :color="isSelected(cargo.oferta_id) ? 'teal' : 'grey-4'" size="sm" />
                    </div>
                    <div class="flex-grow">
                      <div class="font-black text-gray-800 uppercase leading-none mb-1">{{ cargo.cargo_nombre }}</div>
                      <div class="text-[11px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-2">
                        <q-icon name="group" size="xs" /> {{ cargo.vacantes }} vacante(s)
                      </div>
                    </div>
                    <q-btn flat round color="primary" icon="chevron_right" dense />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: SUMMARY CART -->
      <div class="lg:col-span-3">
        <div class="summary-card sticky top-4 overflow-hidden border border-white/20">
          <div class="summary-header p-6 bg-gradient-to-br from-[#4a2371] to-[#663399] text-white">
            <div class="flex items-center gap-3 mb-2">
              <q-icon name="shopping_basket" size="md" />
              <div class="text-lg font-black uppercase tracking-tighter">Tu Postulación</div>
            </div>
            <div class="text-xs text-white/60 font-medium">Resumen de cargos seleccionados</div>
          </div>

          <div class="p-6">
            <div v-if="cargosSeleccionados.length === 0" class="flex flex-col items-center justify-center py-10 opacity-30">
              <q-icon name="add_shopping_cart" size="64px" class="mb-4" />
              <div class="text-sm font-bold uppercase">Carrito Vacío</div>
            </div>

            <div v-else class="space-y-3">
              <TransitionGroup name="list">
                <div
                  v-for="cargo in cargosSeleccionados"
                  :key="cargo.oferta_id"
                  class="selected-item p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div class="overflow-hidden">
                    <div class="font-black text-[11px] text-gray-800 uppercase truncate">{{ cargo.cargo_nombre }}</div>
                    <div class="text-[9px] text-gray-400 font-bold uppercase">{{ cargo.sede_nombre }}</div>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="remove_circle_outline"
                    color="red-4"
                    size="sm"
                    @click.stop="removeCargo(cargo.oferta_id)"
                  />
                </div>
              </TransitionGroup>

              <div class="mt-8 pt-6 border-t border-dashed">
                <div class="flex justify-between items-end mb-6">
                  <div class="text-[10px] text-gray-400 font-bold uppercase">Total Postulaciones</div>
                  <div class="text-3xl font-black text-gray-800 leading-none">{{ cargosSeleccionados.length }}</div>
                </div>

                <q-btn
                  label="CONTINUAR"
                  icon-right="arrow_forward"
                  color="warning"
                  text-color="dark"
                  class="full-width rounded-xl font-black py-4 shadow-lg shadow-orange-500/20"
                  unelevated
                  @click="$emit('next')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePostulacionStore } from 'stores/postulacion'
import BoliviaMap from './BoliviaMap.vue'

defineEmits(['next'])
const store = usePostulacionStore()

const loading = computed(() => store.loading)
const departamentoActivo = computed(() => store.sedeActiva)
const cargosSeleccionados = computed(() => store.cargosSeleccionados)

const sedesDelDepartamento = computed(() => {
  if (!departamentoActivo.value) return []
  return store.ofertasActivas.filter(s =>
    s.departamento?.toLowerCase() === departamentoActivo.value.toLowerCase()
  )
})

const totalCargosVisibles = computed(() => {
  return sedesDelDepartamento.value.reduce((acc, s) => acc + (s.cargos?.length || 0), 0)
})

const handleSedeClick = () => {
  // Store handles state
}

const isSelected = (ofertaId) => {
  return store.isCargoSelected(ofertaId)
}

const toggleCargo = (cargo, sede) => {
  store.toggleCargo(cargo, sede)
}

const removeCargo = (ofertaId) => {
  store.removeCargo(ofertaId)
}
</script>

<style scoped>
.modern-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.cargo-item-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 18px;
  padding: 16px;
  cursor: pointer;
  border-left: 4px solid #f1f5f9;
}

.cargo-item-card:hover {
  border-color: #66339933;
  background: #f8fafc;
  transform: translateX(5px);
}

.cargo-item-card.is-selected {
  border-color: #009999;
  background: #f0fdfa;
  border-left-width: 8px;
}

.cargo-check-indicator {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
}

.is-selected .cargo-check-indicator {
  background: #ccf2f2;
}

.summary-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
