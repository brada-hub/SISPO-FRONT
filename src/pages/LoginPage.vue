<template>
  <q-page class="flex items-center justify-center bg-gradient-to-br from-[#663399] to-[#009999]">
    <div class="w-full max-w-[380px] p-4 animate-fade">
      <q-card class="w-full rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20">
        <q-card-section class="flex flex-col items-center pt-8 pb-2">
          <!-- Logo -->
          <div class="bg-gray-50/80 p-3 rounded-2xl mb-4 shadow-inner inline-block">
            <img src="~assets/logo_unitepc.png" alt="UNITEPC Logo" class="h-12 object-contain" />
          </div>

          <div class="text-center">
            <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#663399] to-[#009999] m-0 leading-none tracking-tighter">CONVOCATORIAS</h2>
            <div class="text-[9px] text-gray-400 font-black tracking-[0.2em] mt-2 uppercase">
              Talento Humano • UNITEPC
            </div>
          </div>
        </q-card-section>

        <q-card-section class="px-8 pt-4 pb-2">
          <div class="text-center mb-6 text-gray-500 font-medium text-xs">
            Acceso administrativo al sistema
          </div>

          <q-form @submit="handleLogin" class="space-y-4">
            <div class="relative">
              <label class="text-[9px] font-black text-[#663399]/70 uppercase tracking-widest mb-1.5 block ml-1"
                >Usuario / CI</label
              >
              <q-input
                v-model="ci"
                outlined
                rounded
                dense
                placeholder="Número de Carnet"
                bg-color="white"
                class="shadow-sm"
                :rules="[(val) => !!val || 'El CI es obligatorio']"
                autocomplete="username"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" size="xs" />
                </template>
              </q-input>
            </div>

            <div class="relative">
              <label class="text-[9px] font-black text-[#663399]/70 uppercase tracking-widest mb-1.5 block ml-1"
                >Contraseña</label
              >
              <q-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                outlined
                rounded
                dense
                placeholder="••••••••"
                bg-color="white"
                class="shadow-sm"
                :rules="[(val) => !!val || 'La contraseña es obligatoria']"
                autocomplete="current-password"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" size="xs" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    color="grey-6"
                    size="xs"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>

            <div class="pt-2">
              <q-btn
                type="submit"
                label="ENTRAR AL SISTEMA"
                class="w-full py-3 font-black rounded-xl shadow-lg shadow-purple-200/40 hover:translate-y-[-1px] transition-all bg-gradient-to-r from-[#663399] to-[#5b2586] text-white"
                :loading="loading"
                unelevated
                no-caps
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-section class="pb-6 pt-0 text-center">
          <div class="text-[8px] text-gray-300 font-bold uppercase tracking-widest">
            © {{ new Date().getFullYear() }} • UNITEPC • SISTEMA DE SELECCIÓN
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const ci = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true
  try {
    await authStore.login(ci.value, password.value)

    $q.notify({ type: 'positive', message: 'Bienvenido al Sistema' })

    // Redirect based on role
    const rol = authStore.currentUser?.rol?.nombre?.toUpperCase()
    if (rol === 'USUARIO') {
        router.push('/admin/postulaciones')
    } else {
        router.push('/admin')
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error de conexión' })
  } finally {
    loading.value = false
  }
}
</script>
