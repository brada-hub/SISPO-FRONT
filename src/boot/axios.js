import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const BACK_URL = String(import.meta.env.VITE_SISPO_BACK_URL || '').replace(/\/+$/, '')
const API_BASE = import.meta.env.VITE_API_BASE || `${BACK_URL}/api`
const SSO_FRONT_URL = String(import.meta.env.VITE_SSO_FRONT_URL || 'http://127.0.0.1:9000').replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Accept': 'application/json'
  }
})

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
    if (error.response?.status === 401) {
      console.error('Sesion SISPO expirada o no autorizada.')

      const now = Date.now()
      const lastRedirect = parseInt(localStorage.getItem('sispo_last_401') || '0')
      const redirectCount = parseInt(localStorage.getItem('sispo_401_count') || '0')

      if (now - lastRedirect < 10000 && redirectCount >= 3) {
        console.error('API 401: Detectado bucle de redireccion. Deteniendo para evitar crasheo.')
        alert('Error de autenticacion SISPO: Se ha detectado un bucle. Limpia la cache y vuelve a entrar.')
        return Promise.reject(error)
      }

      localStorage.setItem('sispo_last_401', now.toString())
      localStorage.setItem('sispo_401_count', (redirectCount + 1).toString())
      localStorage.removeItem('sispo_token')
      localStorage.removeItem('sispo_user')
      window.location.href = `${SSO_FRONT_URL}/login?force=true`
    }

    return Promise.reject(error)
  }
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
