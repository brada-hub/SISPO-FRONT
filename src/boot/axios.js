import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: process.env.DEV
    ? 'http://127.0.0.1:8000/api'
    : 'https://api.sipost.xpertiaplus.com/api'
})

// Request Interceptor to add Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Response Interceptor to handle expired tokens (401)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error('Sesión expirada o no autorizada. Redirigiendo al login...')

      // Limpiar datos locales
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Redirigir al login y recargar para limpiar estado de Pinia
      if (!window.location.hash.includes('/login')) {
         window.location.href = '#/login'
         window.location.reload()
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
