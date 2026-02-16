import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth-store'

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
        console.log('GlobalLogout: Clearing session requested via URL.')
        localStorage.clear()
        authStore.token = null
        authStore.user = null
        // Limpiar la URL y seguir al login
        return next({ path: '/login', replace: true })
    }

    // --- SSO: Procesar token de la URL (cuando volvemos de SIGVA) ---
    const urlToken = to.query.token
    if (urlToken) {
        console.log('SSO: Token detected in URL. Authenticating in SISPO...')
        localStorage.setItem('token', urlToken)
        authStore.token = urlToken // Asegurar que el store tenga el token para la petición

        // Intentar cargar el usuario de inmediato para evitar fallos en validaciones de roles
        try {
            const { api } = await import('boot/axios')
            api.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`
            const response = await api.get('/me')
            if (response.data?.success) {
                const userData = response.data.data
                authStore.user = userData
                localStorage.setItem('user', JSON.stringify(userData))
            }
        } catch (e) {
            console.error('SSO: Failed to fetch user data in SISPO', e)
        }

        // Redirigir limpiando el token de la URL
        const cleanQuery = { ...to.query }
        delete cleanQuery.token
        return next({ path: to.path, query: cleanQuery, replace: true })
    }

    const token = localStorage.getItem('token')

    // Si hay token pero no hay usuario en el store, intentar recuperarlo de localStorage o API
    if (token && !authStore.user) {
        const storedUser = localStorage.getItem('user')
        if (storedUser && storedUser !== 'undefined') {
            authStore.user = JSON.parse(storedUser)
        } else {
            // Último recurso: Pedir al servidor
            try {
                const { api } = await import('boot/axios')
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                const response = await api.get('/me')
                if (response.data?.success) {
                    authStore.user = response.data.data
                    localStorage.setItem('user', JSON.stringify(authStore.user))
                }
            } catch (e) {
                console.warn('Failed to recover user session', e)
                localStorage.removeItem('token')
                return next('/login')
            }
        }
    }

    const user = authStore.user
    const userRole = (user?.rol?.name || user?.rol?.nombre)?.toUpperCase()

    // 1. Check if route requires auth
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    // SSO Check: If user is authenticated but doesn't have SISPO access, send to SIGVA
    // Only do this if they are trying to access a protected (/admin) route
    if (token && user && requiresAuth) {
        const systems = user.systems || []
        const hasAccessToSISPO = systems.some(s => s.name === 'SISPO')
        const hasAccessToSIGVA = systems.some(s => s.name === 'SIGVA')

        if (!hasAccessToSISPO && hasAccessToSIGVA) {
            console.log('GlobalGuard: Redirecting to SIGVA (No SISPO access to this protected route)')
            const sigvaUrl = 'http://localhost:5173'
            window.location.href = `${sigvaUrl}/admin/dashboard?token=${token}`
            return
        }
    }

    if (requiresAuth && !token) {
      return next('/login')
    }

    // 2. Logic for already authenticated users trying to access login
    if (to.path === '/login' && token) {
      const systems = user?.systems || []
      const hasAccessToSISPO = systems.some(s => s.name === 'SISPO')

      if (hasAccessToSISPO) {
        if (userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'ADMINISTRADOR') return next('/admin')
        return next('/admin/postulaciones')
      }
      // If no SISPO access, we stay at /login to allow the component to clear the session
    }

    // 3. Role-based AND Permission-based Access Control
    // Find if any matched record has restrictions
    const requiredRoles = to.matched.reduce((acc, record) => {
      if (record.meta.roles) acc = record.meta.roles
      return acc
    }, null)

    const requiredPermissions = to.matched.reduce((acc, record) => {
      if (record.meta.permissions) acc = record.meta.permissions
      return acc
    }, null)

    const userPermissions = user?.permisos || []

    let accessGranted = true

    // Only check if specific restrictions are defined
    if (requiredRoles || requiredPermissions) {
      const hasRole = requiredRoles ? requiredRoles.includes(userRole) : false
      const hasPermission = requiredPermissions
        ? requiredPermissions.some(p => userPermissions.includes(p))
        : false

      // Grant access if either Role OR Permission matches
      if (!hasRole && !hasPermission) {
        accessGranted = false
      }
    }

    if (!accessGranted) {
      console.warn(`Access restricted for role ${userRole} to ${to.path}`)

      // EMERGENCY BREAK: Infinite Loop Protection
      // If we are already being redirected to a default page and it still fails,
      // it means the default page itself is restricted or the user has NO valid role.
      if (to.path === '/admin/postulaciones' || to.path === '/admin') {
          console.error('Infinite redirect detected (Default page denied). Forcing Logout.')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          return next('/login')
      }

      // Redirect to a safe default page for the user role
      if (userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'ADMINISTRADOR') return next('/admin')
      return next('/admin/postulaciones')
    }

    next()
  })

  return Router
})
