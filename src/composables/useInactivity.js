import { onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export function useInactivity(timeoutMs = 600000) { // Default 10 minutos
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
    console.log('Inactividad detectada. Cerrando sesión...')
    await authStore.logout()

    $q.notify({
      type: 'warning',
      message: 'Sesión cerrada por inactividad',
      position: 'top',
      timeout: 5000
    })

    router.push('/login')
  }

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

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
