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
            <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#663399] to-[#009999] m-0 leading-none tracking-tighter">TALENTO HUMANO</h2>
            <div class="text-[9px] text-gray-400 font-black tracking-[0.2em] mt-2 uppercase">
              GESTIÓN INTEGRAL • UNITEPC
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
                v-model="loginInput"
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
                label="INICIAR SESIÓN"
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
            © {{ new Date().getFullYear() }} • UNITEPC • PLATAFORMA INTEGRAL
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginInput = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

// Handle Google Redirect and Session Cleanup
onMounted(async () => {
    // Check for query params
    const token = route.query.token
    const userEncoded = route.query.user
    const error = route.query.error

    if (error) {
        $q.notify({ type: 'negative', message: 'Error de Google: ' + decodeURIComponent(error) })
        router.replace('/login')
        return
    }

    // Si no venimos de un login exitoso (con token en URL de Google/SSO),
    // nos aseguramos de que no haya sesiones viejas colgando que causen bucles
    if (!token) {
        console.log('LoginPage: No token in URL, forcing session cleanup to avoid loops.')
        authStore.logout()
        localStorage.clear()
    }

    if (token && userEncoded) {
        try {
            const user = JSON.parse(atob(userEncoded))
            await authStore.loginWithGoogle(user, token)
            $q.notify({ type: 'positive', message: 'Bienvenido ' + (user.nombres || user.name) })

            const hasAdminPerms = user.permisos?.some(p => ['dashboard', 'usuarios', 'roles'].includes(p))
            if (user.permisos?.includes('postulaciones') && !hasAdminPerms) {
                router.push('/admin/postulaciones')
            } else {
                router.push('/admin')
            }
        } catch (e) {
            console.error('Error parsing token', e)
            $q.notify({ type: 'negative', message: 'Datos de sesión inválidos' })
        }
    }
})

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true
  try {
    await authStore.login(loginInput.value, password.value)

    $q.notify({ type: 'positive', message: 'Bienvenido al Sistema' })

    // Redirección Inteligente basada en Permisos
    const user = authStore.user || authStore.currentUser || {}
    const perms = user.permisos || []

    // 1. Administrative Personnel (Access to sensitive management)
    const isAdmin = perms.includes('usuarios') || perms.includes('roles') || perms.includes('dashboard')

    if (isAdmin) {
        router.push('/admin')
        return
    }

    // 2. Specialized Personnel: Check where they have real access
    const systems = user.systems || []

    // If they have "SISTEMA DE POSTULACION" access or specific SISPO permissions
    const hasSispo = systems.includes('SISTEMA DE POSTULACION') || perms.includes('postulaciones') || perms.includes('evaluaciones')

    if (hasSispo) {
        if (perms.includes('postulaciones')) {
            router.push('/admin/postulaciones')
        } else if (perms.includes('evaluaciones')) {
            router.push('/admin/evaluaciones')
        } else {
            router.push('/admin') // Fallback to admin home
        }
    } else {
        // 3. SIGVA Fallback
        const hasSigva = systems.includes('SISTEMA DE GESTIÓN DE VACACIONES') || perms.some(p => ['solicitudes', 'vacaciones_dashboard'].includes(p))

        if (hasSigva) {
            const sigvaUrl = import.meta.env.PROD
                ? 'https://sigva.xpertiaplus.com/admin/dashboard'
                : 'http://localhost:5173/admin/dashboard'
            window.location.href = `${sigvaUrl}?token=${authStore.token}`
        } else {
            console.error('User has no relevant permissions:', { perms, systems })
            $q.notify({ type: 'warning', message: 'No tienes permisos asignados para acceder a este sistema.' })
            router.push('/login')
        }
    }
  } catch (error) {
    console.error(error)
    // Feedback visual para el usuario
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Usuario o contraseña incorrectos',
      position: 'top',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>
