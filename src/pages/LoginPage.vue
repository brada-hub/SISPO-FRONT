<template>
    <q-page class="flex items-center justify-center bg-gradient-to-br from-[#5b2586] to-[#0e4d92]">
        <div class="w-full max-w-[400px] p-4 animate-fade">
            <q-card class="w-full rounded-2xl shadow-2xl overflow-hidden">
                <q-card-section class="flex flex-col items-center pt-8 pb-4">
                    <!-- Logo -->
                    <img src="~assets/logo_unitepc.png" alt="UNITEPC Logo" class="h-16 mb-2 object-contain" />

                    <div class="text-center">
                        <h2 class="text-2xl font-bold text-[#5b2586] m-0 leading-none">CONVOCATORIAS</h2>
                        <div class="text-[10px] text-gray-500 font-medium tracking-widest mt-1 uppercase">Universidad
                            Técnica Privada Cosmos</div>
                    </div>
                </q-card-section>

                <q-card-section class="px-8 py-2">
                    <div class="text-center mb-6 text-gray-500 text-sm">
                        Ingrese sus credenciales para acceder
                    </div>

                    <q-form @submit="handleLogin" class="space-y-4">
                        <div>
                            <label
                                class="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Usuario
                                / CI</label>
                            <q-input v-model="ci" outlined dense placeholder="Ingrese su Usuario o CI"
                                bg-color="white" :rules="[val => !!val || 'Requerido']"
                                autocomplete="username">
                                <template v-slot:prepend>
                                    <q-icon name="person_outline" color="purple-8" size="20px" />
                                </template>
                            </q-input>
                        </div>

                        <div>
                            <label
                                class="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Contraseña</label>
                            <q-input v-model="password" :type="showPassword ? 'text' : 'password'" outlined dense
                                placeholder="Ingrese su contraseña" bg-color="white"
                                :rules="[val => !!val || 'Requerido']"
                                autocomplete="current-password">
                                <template v-slot:prepend>
                                    <q-icon name="lock_outline" color="purple-8" size="20px" />
                                </template>
                                <template v-slot:append>
                                    <q-icon :name="showPassword ? 'visibility' : 'visibility_off'"
                                        class="cursor-pointer" color="gray" @click="showPassword = !showPassword" />
                                </template>
                            </q-input>
                        </div>

                        <div class="pt-2">
                            <q-btn type="submit" label="Iniciar Sesión" color="primary"
                                class="w-full py-2.5 font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                                :loading="loading" unelevated />
                        </div>
                    </q-form>
                </q-card-section>

                <q-card-section class="pb-6 pt-2 text-center">
                    <div class="text-[10px] text-gray-400">
                        © {{ new Date().getFullYear() }} Universidad Técnica Privada Cosmos
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

        // Check if user must change password
        if (authStore.user?.must_change_password) {
            router.push('/change-password')
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
