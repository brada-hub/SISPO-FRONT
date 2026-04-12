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
        
        const b64 = String(userEncoded).replace(/ /g, '+')
        const decodedStr = decodeURIComponent(escape(atob(decodeURIComponent(b64))))
        const userData = JSON.parse(decodedStr)

        if (userData.persona) {
          userData.nombres = userData.persona.nombres || userData.nombres
          userData.apellido_paterno = userData.persona.apellido_paterno || userData.persona.primer_apellido || userData.apellido_paterno
          userData.apellido_materno = userData.persona.apellido_materno || userData.persona.segundo_apellido || userData.apellido_materno
        }

        authStore.setUser(userData)
        localStorage.setItem('sispo_user', JSON.stringify(userData))
        
        // Redirigir a admin limpio
      } catch {
        console.error('Error procesando SSO en Router')
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
    const isPublicRoute = to.path === '/login' || to.path === '/'
    
    // Si la ruta empieza con /admin, protegerla
    const isAdminRoute = to.path.startsWith('/admin')

    if (isAdminRoute && !isAuthenticated) {
      return next('/login')
    }

    if (isAuthenticated && isPublicRoute) {
      return next('/admin')
    }

    // 5. Validación de Permisos SISPO (Ultra-tolerante)
    if (isAdminRoute && authStore.user) {
      const metadata = authStore.user.access_metadata || {}
      const perms = authStore.user.permisos || []
      
      // Chequear si tiene algo relacionado con SISPO o Postulaciones
      const hasSispo = Object.keys(metadata).some(k => k.toLowerCase().includes('sispo')) || 
                       perms.some((p) => p.includes('postulaciones') || p.includes('dashboard')) ||
                       authStore.user.role === 'admin'

      if (!hasSispo) {
        // Si no tiene permiso de SISPO, pero tiene de SIGVA, avisar (pero no redirigir agresivamente todavía)
        console.warn('Usuario sin permisos específicos de SISPO detectado.')
      }
    }

    return next()
  })

  return Router
})
