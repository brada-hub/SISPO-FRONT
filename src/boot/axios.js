import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

const BACK_URL = String(import.meta.env.VITE_SISPO_BACK_URL || '').replace(/\/+$/, '')
const API_BASE = import.meta.env.VITE_API_BASE || `${BACK_URL}/api`
const SSO_FRONT_URL = String(import.meta.env.VITE_SSO_FRONT_URL || 'http://127.0.0.1:9000').replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Accept': 'application/json'
  }
})

let isRedirectingToSso = false

const resetAuthLoopGuard = () => {
  localStorage.removeItem('sispo_last_401')
  localStorage.removeItem('sispo_401_count')
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sispo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

api.interceptors.response.use(
  response => {
    if (localStorage.getItem('sispo_token')) {
      resetAuthLoopGuard()
    }
    return response
  },
  error => {
    const status = error.response?.status

    // 401: No autenticado o token expirado
    if (status === 401) {
      console.warn('Sesión SISPO expirada o no autorizada.')

      const hadToken = !!localStorage.getItem('sispo_token')
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')

      // Limpiar credenciales locales
      localStorage.removeItem('sispo_token')
      localStorage.removeItem('sispo_user')

      if ((hadToken || isAdminRoute) && !isRedirectingToSso) {
        isRedirectingToSso = true

        const now = Date.now()
        const lastRedirect = parseInt(localStorage.getItem('sispo_last_401') || '0', 10)
        const redirectCount = parseInt(localStorage.getItem('sispo_401_count') || '0', 10)

        // Prevenir bucles infinitos de redirección
        if (now - lastRedirect < 10000 && redirectCount >= 3) {
          console.error('API 401: Detectado bucle de redirección hacia SSO.')
          Notify.create({
            type: 'negative',
            message: 'Error de autenticación: Se ha detectado un bucle. Limpia la caché y vuelve a ingresar.',
            position: 'top',
            timeout: 5000
          })
          isRedirectingToSso = false
          return Promise.reject(error)
        }

        localStorage.setItem('sispo_last_401', now.toString())
        localStorage.setItem('sispo_401_count', (redirectCount + 1).toString())

        Notify.create({
          type: 'warning',
          message: 'Tu sesión ha expirado. Redirigiendo al portal de acceso central (SIGETH)...',
          position: 'top',
          icon: 'lock_clock',
          timeout: 2500
        })

        const currentUrl = window.location.href
        const redirectParam = encodeURIComponent(currentUrl)

        setTimeout(() => {
          window.location.href = `${SSO_FRONT_URL}/login?redirect=${redirectParam}&system=sispo`
        }, 800)
      }
    }

    // 403: Permisos insuficientes (RBAC)
    if (status === 403) {
      const serverMsg = error.response?.data?.message || 'Acceso Denegado: No tienes permisos suficientes para realizar esta acción.'
      console.warn('Permiso denegado:', serverMsg)

      Notify.create({
        type: 'negative',
        message: serverMsg,
        position: 'top',
        icon: 'security',
        timeout: 4000
      })
    }

    return Promise.reject(error)
  }
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api, SSO_FRONT_URL }
