import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Safety check for user in localStorage
    let storedUser = null;
    try {
        const rawUser = localStorage.getItem('sispo_user');
        if (rawUser && rawUser !== 'undefined') {
            storedUser = JSON.parse(rawUser);
            // Si el usuario no tiene rol cargado, invalidar sesión para obligar relogin y traer datos nuevos
            if (storedUser && !storedUser.rol) {
                console.warn('Usuario almacenado incompleto (falta rol), reseteando sesión SISPO.');
                storedUser = null;
                localStorage.removeItem('sispo_user');
                localStorage.removeItem('sispo_token');
            }
        } else {
            // Clean up bad data
            localStorage.removeItem('sispo_user');
        }
    } catch (e) {
        console.warn('Error parsing stored user, logging out SISPO', e);
        localStorage.removeItem('sispo_user');
        localStorage.removeItem('sispo_token');
    }

    return {
      token: localStorage.getItem('sispo_token') || null,
      user: storedUser,
      currentSystem: localStorage.getItem('sispo_currentSystem') || 'SISTEMA DE POSTULACION', // Por defecto el sistema de postulaciones
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

            this.setToken(token)
            this.setUser(user)

            // Si el usuario tiene acceso a sistemas, establecer uno por defecto
            if (user.systems && user.systems.length > 0) {
              const defaultSystem = user.systems[0] // Ahora es un string directo
              this.setSystem(defaultSystem)
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
      localStorage.removeItem('sispo_token')
      localStorage.removeItem('sispo_user')
      localStorage.removeItem('sispo_currentSystem')
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
        this.setToken(token)
        this.setUser(user)

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
      localStorage.setItem('sispo_currentSystem', systemName)
    },

    setToken(token) {
        this.token = token
        localStorage.setItem('sispo_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    setUser(user) {
        if (!user) {
            this.user = null
            localStorage.removeItem('sispo_user')
            return
        }

        // === NORMALIZACIÓN COMPLETA PARA SISPO ===
        const accessMetadata = user.access_metadata || {}
        const sispoAccess = accessMetadata['sispo'] || accessMetadata['SISPO'] || { roles: [], permissions: [] }
        
        // Inyectar o asegurar campos que SISPO usa persistentemente
        user.permisos = Array.from(new Set([
            ...(user.permisos || []),
            ...(sispoAccess.permissions || [])
        ]))
        
        if (sispoAccess.roles?.length > 0) {
            user.rol = { nombres: sispoAccess.roles[0], ...user.rol }
        } else if (!user.rol && user.roles?.length > 0) {
            user.rol = { nombres: user.roles[0].nombres || user.roles[0] }
        }

        this.user = user
        localStorage.setItem('sispo_user', JSON.stringify(user))
    }
  }
})
