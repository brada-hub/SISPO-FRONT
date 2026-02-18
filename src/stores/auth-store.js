import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Safety check for user in localStorage
    let storedUser = null;
    try {
        const rawUser = localStorage.getItem('user');
        if (rawUser && rawUser !== 'undefined') {
            storedUser = JSON.parse(rawUser);
            // Si el usuario no tiene rol cargado, invalidar sesión para obligar relogin y traer datos nuevos
            if (storedUser && !storedUser.rol) {
                console.warn('Usuario almacenado incompleto (falta rol), reseteando sesión.');
                storedUser = null;
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        } else {
            // Clean up bad data
            localStorage.removeItem('user');
        }
    } catch (e) {
        console.warn('Error parsing stored user, logging out', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    return {
      token: localStorage.getItem('token') || null,
      user: storedUser,
      currentSystem: localStorage.getItem('currentSystem') || 'SISTEMA DE POSTULACION', // Por defecto el sistema de postulaciones
      returnUrl: null
    };
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
    can: (state) => (permission) => state.user?.permisos?.includes(permission)
  },

  actions: {
    async login(loginInput, password) {
        // Directo al endpoint creado en AuthController
        console.log('Sending login payload:', { login_input: loginInput, password })
        const response = await api.post('/login', { login_input: loginInput, password })

        if (response.data.success) {
            console.log('LOGIN SUCCESS! FULL RESPONSE:', response.data)
            const token = response.data.data.token
            const user = response.data.data.user
            console.log('USER RECEIVED:', user)
            console.log('USER ROL:', user.rol)

            this.token = token
            this.user = user

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            // Si el usuario tiene acceso a sistemas, establecer uno por defecto
            if (user.systems && user.systems.length > 0) {
              const defaultSystem = user.systems[0] // Ahora es un string directo
              this.currentSystem = defaultSystem
              localStorage.setItem('currentSystem', defaultSystem)
            }

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
      this.currentSystem = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('currentSystem')
      delete api.defaults.headers.common['Authorization']

      try {
        if (token) {
           await api.post('/logout')
        }
      } catch (e) {
        console.warn('Servidor ya había invalidado la sesión o error de red:', e.message)
      }
    },

    async loginWithGoogle(user, token) {
        this.token = token
        this.user = user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        // Set default auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        return true
    },

    init() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    },

    setSystem(systemName) {
      this.currentSystem = systemName
      localStorage.setItem('currentSystem', systemName)
    }
  }
})
