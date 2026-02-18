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
                    console.log('User recovered via API:', response.data.data)
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

    // SSO Check: Enforce Redirect if NO SISPO access but HAS SIGVA access
    if (token && user && requiresAuth) {
        const systems = user.systems || []
        const hasAccessToSISPO = systems.some(s => s.name === 'SISPO')
        const hasAccessToSIGVA = systems.some(s => s.name === 'SIGVA')
        // Check permissions explicitly as fallback if systems array is empty but permissions exist
        const hasSispoPerms = user.permisos?.some(p => ['postulaciones', 'evaluaciones', 'dashboard', 'convocatorias'].includes(p))

        // El usuario es valido si tiene acceso a sistemas O si es SUPERA ADMIN/ADMINISTRADOR
        const isAdmin = ['ADMINISTRADOR', 'SUPER ADMIN', 'ADMIN'].includes(userRole)

        if (!hasAccessToSISPO && !hasSispoPerms && !isAdmin) {
            if (hasAccessToSIGVA) {
                console.log('GlobalGuard: Acceso solo a SIGVA detectado. Redirigiendo...')
                const sigvaUrl = process.env.DEV ? 'http://localhost:5173' : 'https://sigva.xpertiaplus.com'
                window.location.href = `${sigvaUrl}/admin/dashboard?token=${token}`
                return
            } else {
                // CASO SIN SALIDA: Ni SISPO ni SIGVA
                console.warn('GlobalGuard: Usuario sin sistemas asignados. Cerrando sesión.')
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                // Usamos window.location para asegurar limpieza total
                window.location.href = '/#/login?error=Usuario%20sin%20sistemas%20asignados'
                return
            }
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

    // 3. Permission-based Access Control
    // Find if any matched record has specific permission requirements
    const requiredPermissions = to.matched.reduce((acc, record) => {
      if (record.meta.permissions) acc = record.meta.permissions
      return acc
    }, null)

    const userPermissions = user?.permisos || []

    let accessGranted = true

    // Only check if specific permissions are defined
    if (requiredPermissions) {
       // Must have at least one of the required permissions
       const hasPermission = requiredPermissions.some(p => userPermissions.includes(p))
       if (!hasPermission) {
           accessGranted = false
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
          const sigvaUrl = process.env.DEV ? 'http://localhost:5173' : 'https://sigva.xpertiaplus.com'
          // Evitar bucle si ya estamos intentando ir a SIGVA desde una URL que ya falló allí
          if (!window.location.href.includes('sigva.xpertiaplus.com')) {
              window.location.href = `${sigvaUrl}/admin/dashboard?token=${token}`
              return
          }
      }

      // 3. Logout (Fallback total si llegamos aquí es porque no tiene permisos para su ruta actual ni para las de su rol)
      console.warn('GlobalGuard: Fallback total. Cerrando sesión.')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return next('/login?error=Permiso_denegado')
    }

    next()
  })

  return Router
})
