import { onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

export function useInactivity(timeoutMs = 1800000) { // Default 30 minutos
  const authStore = useAuthStore()
  const router = useRouter()
  const $q = useQuasar()
  let timer = null

  const resetTimer = () => {
    if (timer) clearTimeout(timer)

    // Solo configurar el timer si el usuario está logueado
    if (authStore.isLoggedIn) {
      timer = setTimeout(() => {
        logoutUser()
      }, timeoutMs)
    }
  }

  const logoutUser = async () => {
    // Si ya no está logueado, no hacer nada
    if (!authStore.isLoggedIn) return

    console.log('Inactividad detectada. Cerrando sesión...')

    // Limpiar localmente primero para que sea instantáneo
    authStore.token = null
    authStore.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    $q.notify({
      type: 'warning',
      message: 'Su sesión ha expirado por inactividad',
      position: 'top',
      timeout: 5000
    })

    // Intentar cerrar sesión en el servidor pero no esperar por ello si falla
    // (Ya limpiamos localmente)
    try {
      api.post('/logout').catch(() => {
        /* silenciamos error server */
      })
    } catch (err) {
      console.warn('Silent logout error:', err)
    }

    router.push('/login')
  }

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'visibilitychange']

  onMounted(() => {
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true })
    })

    // Iniciar el timer si ya está logueado al montar
    if (authStore.isLoggedIn) {
      resetTimer()
    }
  })

  onUnmounted(() => {
    events.forEach(event => {
      window.removeEventListener(event, resetTimer)
    })
    if (timer) clearTimeout(timer)
  })

  // Observar cambios en el estado de login para activar/desactivar el timer
  watch(() => authStore.isLoggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
      resetTimer()
    } else {
      if (timer) clearTimeout(timer)
    }
  })
}
