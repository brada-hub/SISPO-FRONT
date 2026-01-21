import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    returnUrl: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(ci, password) {
        // Directo al endpoint creado en AuthController
        const response = await api.post('/login', { ci, password })

        if (response.data.success) {
            const token = response.data.token
            const user = response.data.user

            this.token = token
            this.user = user

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            // Set default auth header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            return true
        } else {
            throw new Error(response.data.message || 'Error de autenticación')
        }
    },

    async logout() {
      // Guardamos el token para la petición antes de borrarlo
      const token = this.token

      // Limpiar estado local inmediatamente
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']

      try {
        if (token) {
           await api.post('/logout')
        }
      } catch (e) {
        console.warn('Servidor ya había invalidado la sesión o error de red:', e.message)
      }
    },

    init() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    }
  }
})
