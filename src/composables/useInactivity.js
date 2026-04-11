import { onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { sessionTimeoutManager } from 'src/shared/sessionTimeoutManager'

const LAST_ACTIVITY_KEY = 'sispo_last_activity'
const LOGOUT_BROADCAST_KEY = 'sispo_logout_broadcast'
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000
const WARNING_MS = 14 * 60 * 1000
const ACTIVITY_EVENTS = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']

export function useInactivity() {
  const authStore = useAuthStore()
  const router = useRouter()
  const $q = useQuasar()
  let intervalId = null
  let warningShown = false
  let logoutInProgress = false

  const isPublicRoute = () => {
    const path = router.currentRoute.value.path || ''
    return path === '/' || path === '/login' || path.startsWith('/postular') || path.startsWith('/convocatoria') || path.startsWith('/seguimiento') || path.startsWith('/hoja-de-vida-directa')
  }

  const touchActivity = () => {
    if (!authStore.isLoggedIn || isPublicRoute()) return

    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
    warningShown = false
    sessionTimeoutManager.hideWarning()
  }

  const forceLogout = async (message, broadcast = true) => {
    if (logoutInProgress || !authStore.isLoggedIn) return

    logoutInProgress = true

    if (broadcast) {
      localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()))
    }

    try {
      await authStore.logout()
    } catch (error) {
      console.error('Error al cerrar sesión automáticamente:', error)
    } finally {
      sessionTimeoutManager.hideWarning()
      $q.notify({
        type: 'warning',
        message,
        position: 'top',
        timeout: 5000,
      })

      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }

      logoutInProgress = false
    }
  }

  const checkInactivity = async () => {
    if (!authStore.isLoggedIn || isPublicRoute()) return

    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now())
    const elapsed = Date.now() - lastActivity

    if (elapsed >= INACTIVITY_LIMIT_MS) {
      await forceLogout('La sesión se cerró por 15 minutos de inactividad.')
      return
    }

    if (elapsed >= WARNING_MS && !warningShown) {
      warningShown = true
      sessionTimeoutManager.showWarning(Math.max(1, Math.ceil((INACTIVITY_LIMIT_MS - elapsed) / 1000)))
    }

    if (warningShown) {
      sessionTimeoutManager.updateCountdown(Math.max(1, Math.ceil((INACTIVITY_LIMIT_MS - elapsed) / 1000)))
    }
  }

  sessionTimeoutManager.configure({
    onContinue: async () => {
      touchActivity()
      $q.notify({
        type: 'positive',
        message: 'La sesión continúa activa.',
        position: 'top',
        timeout: 2500,
      })
    },
    onLogout: async () => {
      await forceLogout('La sesión fue cerrada por seguridad.')
    },
  })

  const handleStorage = (event) => {
    if (event.key === LOGOUT_BROADCAST_KEY && authStore.isLoggedIn) {
      void forceLogout('La sesión se cerró desde otra pestaña.', false)
      return
    }

    if (event.key === LAST_ACTIVITY_KEY) {
      warningShown = false
    }
  }

  onMounted(() => {
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, touchActivity, { passive: true })
    })

    window.addEventListener('storage', handleStorage)

    if (authStore.isLoggedIn && !isPublicRoute()) {
      touchActivity()
    }

    intervalId = window.setInterval(() => {
      void checkInactivity()
    }, 30000)
  })

  onUnmounted(() => {
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, touchActivity)
    })

    window.removeEventListener('storage', handleStorage)

    if (intervalId) {
      window.clearInterval(intervalId)
    }
  })

  watch(() => authStore.isLoggedIn, (isLoggedIn) => {
    if (isLoggedIn && !isPublicRoute()) {
      touchActivity()
      return
    }

    sessionTimeoutManager.hideWarning()
    warningShown = false
  })
}
