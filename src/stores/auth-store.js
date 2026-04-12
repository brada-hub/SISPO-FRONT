import { defineStore } from 'pinia'
import { api } from 'boot/axios'

const LAST_ACTIVITY_KEY = 'sispo_last_activity'
const LOGOUT_BROADCAST_KEY = 'sispo_logout_broadcast'
const BACK_URL = String(import.meta.env.VITE_SISPO_BACK_URL || '').replace(/\/+$/, '')
const SHARED_ASSET_URL = String(import.meta.env.VITE_SHARED_ASSET_URL || '').replace(/\/+$/, '')

const resolveSharedAssetBase = () => {
  if (SHARED_ASSET_URL) return SHARED_ASSET_URL

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}`
  }

  return ''
}

const normalizePhotoUrl = (photo) => {
  if (!photo) return null

  if (String(photo).startsWith('http://') || String(photo).startsWith('https://')) {
    return photo
  }

  if (String(photo).startsWith('/')) {
    const base = String(photo).startsWith('/storage/')
      ? resolveSharedAssetBase()
      : BACK_URL

    return base ? `${base}${photo}` : photo
  }

  const normalizedPhoto = String(photo).replace(/^\/+/, '')
  const base = normalizedPhoto.startsWith('storage/')
    ? resolveSharedAssetBase()
    : BACK_URL

  return base ? `${base}/${normalizedPhoto}` : photo
}

const normalizePersona = (persona) => {
  if (!persona) return null

  return {
    ...persona,
    apellido_paterno: persona.apellido_paterno || persona.primer_apellido || null,
    apellido_materno: persona.apellido_materno || persona.segundo_apellido || null,
    foto: normalizePhotoUrl(persona.foto || persona.foto_url || null),
    foto_url: normalizePhotoUrl(persona.foto_url || persona.foto || null),
  }
}

const resolveRoleBySystem = (user, targetSystemId) => {
  const matchingRole = (user?.roles || []).find((role) =>
    (role?.permissions || []).some((permission) => Number(permission?.sistema_id) === targetSystemId)
  )

  if (!matchingRole) return null

  return {
    name: matchingRole.name || matchingRole.nombre || 'Usuario',
    nombre: matchingRole.nombre || matchingRole.name || 'Usuario'
  }
}

const buildFullName = (user) => {
  if (!user) return 'Usuario'

  const persona = normalizePersona(user.persona)
  const personaFullName = [
    persona?.nombres,
    persona?.apellido_paterno,
    persona?.apellido_materno,
  ].filter(Boolean).join(' ').trim()

  if (personaFullName.split(' ').filter(Boolean).length >= 2) {
    return personaFullName
  }

  const userFullName = [
    user.nombres,
    user.apellido_paterno,
    user.apellido_materno,
  ].filter(Boolean).join(' ').trim()

  return userFullName || user.nombre_completo || user.apellidos || user.username || 'Usuario'
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    let storedUser = null

    try {
      const rawUser = localStorage.getItem('sispo_user')
      if (rawUser && rawUser !== 'undefined') {
        storedUser = JSON.parse(rawUser)
      } else {
        localStorage.removeItem('sispo_user')
      }
    } catch (e) {
      console.warn('Error parsing stored user, logging out SISPO', e)
      localStorage.removeItem('sispo_user')
      localStorage.removeItem('sispo_token')
    }

    return {
      token: localStorage.getItem('sispo_token') || null,
      user: storedUser,
      currentSystem: localStorage.getItem('sispo_currentSystem') || 'SISTEMA DE POSTULACION',
      returnUrl: null
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
    can: (state) => (permission) => state.user?.permisos?.includes(permission),
    fullName: (state) => buildFullName(state.user),
    userPhoto: (state) => normalizePhotoUrl(
      state.user?.persona?.foto_url
      || state.user?.persona?.foto
      || state.user?.persona?.avatar_url
      || state.user?.persona?.avatar
      || state.user?.persona?.image_url
      || state.user?.persona?.profile_photo_url
      || state.user?.foto_url
      || state.user?.foto
      || state.user?.avatar_url
      || state.user?.avatar
      || state.user?.image_url
      || state.user?.profile_photo_url
      || null
    ),
  },

  actions: {
    async login(loginInput, password) {
      const response = await api.post('/login', { login_input: loginInput, password })

      if (response.data.success) {
        const token = response.data.data.token
        const user = response.data.data.user

        this.setToken(token)
        this.setUser(user)

        if (user.systems && user.systems.length > 0) {
          this.setSystem(user.systems[0])
        }

        api.defaults.headers.common.Authorization = `Bearer ${token}`
        return true
      }

      throw new Error(response.data.message || 'Error de autenticacion')
    },

    async logout() {
      const token = this.token

      this.token = null
      this.user = null
      this.currentSystem = null
      localStorage.removeItem('sispo_token')
      localStorage.removeItem('sispo_user')
      localStorage.removeItem('sispo_currentSystem')
      delete api.defaults.headers.common.Authorization

      try {
        if (token) {
          await api.post('/logout')
        }
      } catch (e) {
        console.warn('Servidor ya habia invalidado la sesion o hubo error de red:', e.message)
      }
    },

    async loginWithGoogle(user, token) {
      this.setToken(token)
      this.setUser(user)
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      return true
    },

    async init() {
      if (!this.token) return

      api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      try {
        const response = await api.get('/me')
        const payload = response.data?.user || response.data?.data || response.data
        if (payload) {
          this.setUser(payload)
        }
      } catch (error) {
        console.warn('No se pudo refrescar el usuario actual de SISPO, se mantiene la sesion local.', error?.message || error)
      }
    },

    setSystem(systemName) {
      this.currentSystem = systemName
      localStorage.setItem('sispo_currentSystem', systemName)
    },

    setToken(token) {
      this.token = token
      localStorage.setItem('sispo_token', token)
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
      localStorage.removeItem(LOGOUT_BROADCAST_KEY)
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    },

    setUser(user) {
      if (!user) {
        this.user = null
        localStorage.removeItem('sispo_user')
        return
      }

      const accessMetadata = user.access_metadata || {}
      const sispoAccess = accessMetadata.sispo || accessMetadata.SISPO || { roles: [], permissions: [] }
      const permissionsFromRoles = (user.roles || [])
        .flatMap((role) => role?.permissions || [])
        .map((permission) => permission?.nombres || permission?.name || permission)
        .filter(Boolean)

      const normalizedPersona = normalizePersona(user.persona)

      user.permisos = Array.from(new Set([
        ...(user.permisos || []),
        ...(sispoAccess.permissions || []),
        ...permissionsFromRoles,
      ]))

      if (sispoAccess.roles?.length > 0) {
        user.rol = { name: sispoAccess.roles[0], nombre: sispoAccess.roles[0], ...user.rol }
      } else {
        const systemRole = resolveRoleBySystem(user, 2)
        if (systemRole) {
          user.rol = { ...systemRole, ...user.rol }
        } else if (!user.rol && user.roles?.length > 0) {
          user.rol = {
            name: user.roles[0].name || user.roles[0].nombre || user.roles[0],
            nombre: user.roles[0].nombre || user.roles[0].name || user.roles[0]
          }
        }
      }

      if (normalizedPersona) {
        user.persona = normalizedPersona
        user.nombres = normalizedPersona.nombres || user.nombres
        user.apellido_paterno = normalizedPersona.apellido_paterno || user.apellido_paterno || user.primer_apellido
        user.apellido_materno = normalizedPersona.apellido_materno || user.apellido_materno || user.segundo_apellido
        user.apellidos = [user.apellido_paterno, user.apellido_materno].filter(Boolean).join(' ')
      }

      user.nombre_completo = buildFullName(user)
      user.foto_url = normalizePhotoUrl(
        user.persona?.foto_url
        || user.persona?.foto
        || user.foto_url
        || user.foto
        || user.avatar_url
        || user.avatar
        || null
      )

      this.user = user
      localStorage.setItem('sispo_user', JSON.stringify(user))
    }
  }
})
