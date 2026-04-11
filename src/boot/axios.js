import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: `${import.meta.env.VITE_SISPO_BACK_URL}/api`,
  headers: {
    'Accept': 'application/json'
  }
})

const resetAuthLoopGuard = () => {
  localStorage.removeItem('sispo_last_401')
  localStorage.removeItem('sispo_401_count')
}

// Request Interceptor to add Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sispo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Response Interceptor to handle expired tokens (401)
api.interceptors.response.use(
  response => {
    if (localStorage.getItem('sispo_token')) {
      resetAuthLoopGuard()
    }

    return response
  },
  error => {
    if (error.response?.status === 401) {
      console.error('Sesión SISPO expirada o no autorizada. Revisando bucle de redirección...')

      // --- GUARDRAIL: Evitar bucle infinito de redirección 401 ---
      const now = Date.now()
      const lastRedirect = parseInt(localStorage.getItem('sispo_last_401') || '0')
      const redirectCount = parseInt(localStorage.getItem('sispo_401_count') || '0')
      
      if (now - lastRedirect < 10000 && redirectCount >= 3) {
          console.error('API 401: Detectado bucle de redirección. Deteniendo para evitar crasheo.')
          alert('Error de autenticación SISPO: Se ha detectado un bucle. Limpia la caché y vuelve a entrar.')
          return Promise.reject(error)
      }

      localStorage.setItem('sispo_last_401', now.toString())
      localStorage.setItem('sispo_401_count', (redirectCount + 1).toString())

      // Limpiar datos locales
      localStorage.removeItem('sispo_token')
      localStorage.removeItem('sispo_user')

      // Redirigir al login de SISPO (el cual redirigirá al SSO con force=true para romper el bucle)
      if (!window.location.hash.includes('/login')) {
         window.location.href = '#/login?force=true'
         setTimeout(() => {
             window.location.reload()
         }, 100)
      }
    }
    return Promise.reject(error)
  }
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
