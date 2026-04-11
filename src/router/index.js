import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth-store'

const normalizePermissionName = (permission) =>
  String(permission?.nombres || permission?.name || permission || '').trim().toLowerCase()

const collectUserPermissions = (user) => {
  const accessMetadata = user?.access_metadata || {}
  const sispoAccess = accessMetadata.sispo || accessMetadata.SISPO || { permissions: [] }

  return Array.from(new Set([
    ...(user?.permisos || []).map(normalizePermissionName),
    ...(sispoAccess.permissions || []).map(normalizePermissionName),
    ...((user?.roles || []).flatMap((role) => role?.permissions || []).map(normalizePermissionName)),
  ].filter(Boolean)))
}

const collectUserRoles = (user) => {
  const accessMetadata = user?.access_metadata || {}
  const sispoAccess = accessMetadata.sispo || accessMetadata.SISPO || { roles: [] }

  return Array.from(new Set([
    ...(sispoAccess.roles || []).map((role) => String(role || '').trim().toUpperCase()),
    ...((user?.roles || []).map((role) => String(role?.nombres || role?.nombre || role?.name || role || '').trim().toUpperCase())),
    String(user?.rol?.nombres || user?.rol?.nombre || user?.rol?.name || '').trim().toUpperCase(),
  ].filter(Boolean)))
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Global Navigation Guard
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore(store)

    // --- Global Logout: Si venimos de otro sistema pidiendo cerrar sesión ---
    if (to.query.logout === 'true') {
        console.log('GlobalLogout: Clearing SISPO session requested via URL.')
        localStorage.removeItem('sispo_token')
        localStorage.removeItem('sispo_user')
        authStore.token = null
        authStore.user = null
        // Limpiar la URL y seguir al login
        return next({ path: '/login', replace: true })
    }

    // --- SSO: Procesar token de la URL (cuando volvemos del Portal SSO) ---
    const urlToken = to.query.token
    const userEncoded = to.query.user
    if (urlToken && userEncoded) {
        console.log('SSO: Token detected in URL. Authenticating in SISPO...')
        authStore.token = urlToken
        localStorage.setItem('sispo_token', urlToken)
        try {
            // Decodificación segura de base64
            const decodedStr = decodeURIComponent(escape(atob(userEncoded)))
            const userData = JSON.parse(decodedStr)

            if (userData.persona) {
              userData.nombres = userData.persona.nombres || userData.nombres
              userData.apellido_paterno = userData.persona.apellido_paterno || userData.persona.primer_apellido || userData.apellido_paterno
              userData.apellido_materno = userData.persona.apellido_materno || userData.persona.segundo_apellido || userData.apellido_materno
            }

            authStore.setToken(urlToken)
            authStore.setUser(userData)
            
            // ¡CLAVE! Redirigir a /admin DIRECTAMENTE, no quedarse en /login
            console.log('SSO: Authentication successful. Redirecting to admin...')
            return next({ path: '/admin', replace: true })
        } catch (e) {
            console.error('SSO: Token/User processing failed', e)
        }
    }

    const token = localStorage.getItem('sispo_token')

    // Restore session from localStorage if needed
    if (!authStore.user && token) {
        const storedUser = localStorage.getItem('sispo_user')
        if (storedUser && storedUser !== 'undefined') {
            try {
                authStore.setUser(JSON.parse(storedUser))
            } catch (error) {
                console.warn('Failed to parse stored user, clearing session', error)
                localStorage.removeItem('sispo_token')
                localStorage.removeItem('sispo_user')
                return next('/login')
            }
        } else {
            console.warn('Token present but no user in storage, forcing re-login.')
            localStorage.removeItem('sispo_token')
            return next('/login')
        }
    }

    const user = authStore.user
    const accessMetadata = user?.access_metadata || {}
    const userPermissions = collectUserPermissions(user)
    const allRoles = collectUserRoles(user)

    const isAdmin = allRoles.some(role => 
        ['ADMINISTRADOR DEL SISTEMA', 'ADMINISTRADOR', 'SUPER ADMIN', 'ADMIN', 'DIRECTOR'].includes(role)
    )

    const hasSispoPerms = userPermissions.some(p => ['postulaciones', 'evaluaciones', 'dashboard', 'convocatorias', 'all', 'admin'].includes(p))

    // 1. Check if route requires auth
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    // SSO Check: Enforce Redirect if NO SISPO access but HAS SIGVA access
    if (token && user && requiresAuth && !isAdmin) {
        const hasAccessToSISPO = !!accessMetadata['sispo'] || !!accessMetadata['SISPO'] || hasSispoPerms
        const hasAccessToSIGVA = !!accessMetadata['sigva'] || !!accessMetadata['SIGVA']

        console.log('GlobalGuard: Systems check -', { hasAccessToSISPO, hasAccessToSIGVA, hasSispoPerms, isAdmin })

        if (!hasAccessToSISPO && !hasSispoPerms) {
            if (hasAccessToSIGVA) {
                console.log('GlobalGuard: User only has SIGVA access. Redirecting.')
                const sigvaUrl = import.meta.env.VITE_SIGVA_FRONT_URL
                // Avoid infinite redirect if we are already coming from a failed auth
                if (!to.query.token) {
                    const userEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(user))))
                    window.location.href = `${sigvaUrl}/admin/dashboard?token=${token}&user=${userEncoded}`
                    return next(false)
                }
            } else {
                console.warn('GlobalGuard: User has no assigned systems. Logging out SISPO.')
                localStorage.removeItem('sispo_token')
                localStorage.removeItem('sispo_user')
                return next('/login?error=Usuario%20sin%20sistemas%20asignados')
            }
        }
    }

    if (requiresAuth && !token) {
      return next('/login')
    }

    // 2. Logic for already authenticated users trying to access login
    if (to.path === '/login' && token) {
      if (isAdmin || hasSispoPerms || userPermissions.includes('all')) {
        return next('/admin')
      }
    }

    // 3. Permission-based Access Control
    // Find if any matched record has specific permission requirements
    const requiredPermissions = to.matched.reduce((acc, record) => {
      if (record.meta.permissions) acc = record.meta.permissions
      return acc
    }, null)

    let accessGranted = true

    // Only check if specific permissions are defined and user is not admin
    if (requiredPermissions && !isAdmin) {
       if (userPermissions.includes('all')) {
           accessGranted = true;
       } else {
           // Must have at least one of the required permissions
           const hasPermission = requiredPermissions.some(p => userPermissions.includes(normalizePermissionName(p)))
           if (!hasPermission) {
               accessGranted = false
           }
       }
    }

    if (!accessGranted) {
      console.warn(`Access restricted to ${to.path} - Missing required permissions: ${requiredPermissions}`)

      const perms = userPermissions || []

      // 1. SISPO: Buscar ruta válida específica
      if (perms.includes('dashboard')) {
          if (to.path !== '/admin' && to.path !== '/admin/') return next('/admin')
      }
      if (perms.includes('postulaciones') && to.path !== '/admin/postulaciones') return next('/admin/postulaciones')
      if (perms.includes('convocatorias') && to.path !== '/admin/convocatorias') return next('/admin/convocatorias')
      if (perms.includes('sedes') && to.path !== '/admin/sedes') return next('/admin/sedes')
      if (perms.includes('cargos') && to.path !== '/admin/cargos') return next('/admin/cargos')
      if (perms.includes('requisitos') && to.path !== '/admin/requisitos') return next('/admin/requisitos')
      if (perms.includes('evaluaciones') && to.path !== '/admin/evaluaciones') return next('/admin/evaluaciones')
      if (perms.includes('usuarios') && to.path !== '/admin/usuarios') return next('/admin/usuarios')
      if (perms.includes('roles') && to.path !== '/admin/roles') return next('/admin/roles')

      // 2. SIGVA Redirección
      const sigvaPerms = ['solicitudes', 'vacaciones_dashboard', 'calendario', 'reportes', 'documentacion', 'feriados', 'empleados']
      if (perms.some(p => sigvaPerms.includes(p))) {
          const sigvaUrl = import.meta.env.VITE_SIGVA_FRONT_URL
          // Evitar bucle si ya estamos intentando ir a SIGVA desde una URL que ya falló allí
          if (!window.location.href.includes('sigva.xpertiaplus.com')) {
              window.location.href = `${sigvaUrl}/admin/dashboard?token=${token}`
              return next(false)
          }
      }

      if (userPermissions.includes('all')) {
           return next('/admin')
      }

      // 3. Logout (Fallback total si llegamos aquí es porque no tiene permisos para su ruta actual ni para las de su rol)
      console.warn('GlobalGuard: Fallback total. Cerrando sesión SISPO.')
      localStorage.removeItem('sispo_token')
      localStorage.removeItem('sispo_user')
      return next('/login?error=Permiso_denegado')
    }

    next()
  })

  return Router
})

