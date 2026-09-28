import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth-store'

export default route(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore(store)

    // 1. Manejo de Logout Global
    if (to.query.logout === 'true') {
      localStorage.removeItem('sispo_token')
      localStorage.removeItem('sispo_user')
      authStore.token = null
      authStore.user = null
      return next({ path: '/login', replace: true })
    }

    // 2. Procesar Token de SSO (Prioridad Máxima)
    let urlToken = to.query.token
    let userEncoded = to.query.user

    if (!urlToken || !userEncoded) {
      const searchParams = new URLSearchParams(window.location.search)
      urlToken = searchParams.get('token')
      userEncoded = searchParams.get('user')
    }

    if (urlToken && userEncoded) {
      try {
        const tokenValue = decodeURIComponent(String(urlToken))
        authStore.setToken(tokenValue)
        localStorage.setItem('sispo_token', tokenValue)
        
        let userData = null
        try {
          const cleanB64 = decodeURIComponent(String(userEncoded)).replace(/ /g, '+')
          const binary = atob(cleanB64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          const decodedStr = new TextDecoder().decode(bytes)
          userData = JSON.parse(decodedStr)
        } catch {
          const fallbackStr = decodeURIComponent(escape(atob(decodeURIComponent(String(userEncoded)).replace(/ /g, '+'))))
          userData = JSON.parse(fallbackStr)
        }

        // === VERIFICACIÓN DE ACCESO A SISPO (STRICT RBAC) ===
        const accessMetadata = userData.access_metadata || {}
        const sispoAccess = accessMetadata['sispo'] || accessMetadata['SISPO'] || null
        const isGlobalAdmin = !!userData.is_global_admin || (userData.roles || []).some(r => {
          const sysId = Number(r?.sistema_id ?? 0)
          const rName = String(r?.nombres || r?.name || r?.nombre || '').toUpperCase()
          return sysId === 1 && ['ADMINISTRADOR', 'ADMIN', 'SUPER ADMIN', 'SUPERADMIN', 'DIRECTOR (ENCARGADO)'].includes(rName)
        })
        const sispoRole = (userData.roles || []).find(r => Number(r?.sistema_id) === 2)
        const hasSispoAccess = isGlobalAdmin || !!sispoRole || (sispoAccess && ((sispoAccess.roles && sispoAccess.roles.length > 0) || (sispoAccess.permissions && sispoAccess.permissions.length > 0)))

        if (!hasSispoAccess) {
          console.warn('SSO: Usuario sin permisos para SISPO')
          alert('Acceso no autorizado: No tienes permisos asignados para el sistema SISPO.')
          authStore.logout()
          const ssoBaseUrl = String(import.meta.env.VITE_SSO_FRONT_URL || 'http://localhost:9000').replace(/\/+$/, '')
          window.location.href = ssoBaseUrl
          return
        }

        if (userData && userData.persona) {
          userData.nombres = userData.persona.nombres || userData.nombres
          userData.apellido_paterno = userData.persona.apellido_paterno || userData.persona.primer_apellido || userData.apellido_paterno
          userData.apellido_materno = userData.persona.apellido_materno || userData.persona.segundo_apellido || userData.apellido_materno
        }

        if (userData) {
          authStore.setUser(userData)
          localStorage.setItem('sispo_user', JSON.stringify(userData))
        }
        
        // Redirigir a admin limpio
        window.history.replaceState({}, '', '/admin')
        return next({ path: '/admin', replace: true })
      } catch (e) {
        console.error('Error procesando SSO en Router SISPO:', e)
      }
    }

    // 3. Restaurar sesión desde LocalStorage si no está en Store
    const token = localStorage.getItem('sispo_token')
    if (!authStore.user && token) {
      const storedUser = localStorage.getItem('sispo_user')
      if (storedUser && storedUser !== 'undefined') {
        try {
          authStore.setUser(JSON.parse(storedUser))
          authStore.setToken(token)
        } catch {
          localStorage.removeItem('sispo_token')
          localStorage.removeItem('sispo_user')
        }
      }
    }

    // 4. Guardas de Protección
    const isAuthenticated = !!(authStore.token || localStorage.getItem('sispo_token'))
    const isAdminRoute = to.path.startsWith('/admin')

    if (isAdminRoute) {
      if (!isAuthenticated) {
        const ssoBaseUrl = String(import.meta.env.VITE_SSO_FRONT_URL || 'http://localhost:9000').replace(/\/+$/, '')
        const returnTo = encodeURIComponent(`${window.location.origin}/admin`)
        window.location.href = `${ssoBaseUrl}/login?returnTo=${returnTo}`
        return
      }

      // Verificar que el usuario tenga acceso a SISPO
      const currentUser = authStore.user
      if (currentUser) {
        const cMeta = currentUser.access_metadata || {}
        const cSispo = cMeta['sispo'] || cMeta['SISPO']
        const cIsGlobal = !!currentUser.is_global_admin || (currentUser.roles || []).some(r => {
          const sysId = Number(r?.sistema_id ?? 0)
          const rName = String(r?.nombres || r?.name || r?.nombre || '').toUpperCase()
          return sysId === 1 && ['ADMINISTRADOR', 'ADMIN', 'SUPER ADMIN', 'SUPERADMIN', 'DIRECTOR (ENCARGADO)'].includes(rName)
        })
        const cHasRole = (currentUser.roles || []).some(r => Number(r?.sistema_id) === 2)
        const cAllowed = cIsGlobal || cHasRole || (cSispo && ((cSispo.roles && cSispo.roles.length > 0) || (cSispo.permissions && cSispo.permissions.length > 0)))

        if (!cAllowed) {
          alert('Acceso no autorizado: No tienes permisos asignados para el sistema SISPO.')
          authStore.logout()
          const ssoBaseUrl = String(import.meta.env.VITE_SSO_FRONT_URL || 'http://localhost:9000').replace(/\/+$/, '')
          window.location.href = ssoBaseUrl
          return
        }
      }
    }

    if (isAuthenticated && to.path === '/login') {
      return next('/admin')
    }

    return next()
  })

  return Router
})
