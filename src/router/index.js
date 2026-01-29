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
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore(store)
    const token = localStorage.getItem('token')
    const user = authStore.user || JSON.parse(localStorage.getItem('user'))
    const userRole = user?.rol?.nombre

    // 1. Check if route requires auth
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    if (requiresAuth && !token) {
      return next('/login')
    }

    // 2. Logic for already authenticated users trying to access login
    if (to.path === '/login' && token) {
      if (userRole === 'ADMINISTRADOR') return next('/admin')
      return next('/admin/postulaciones')
    }

    // 3. Role-based Access Control
    // Find if any matched record has role restrictions
    const requiredRoles = to.matched.reduce((acc, record) => {
      if (record.meta.roles) acc = record.meta.roles
      return acc
    }, null)

    if (requiredRoles && !requiredRoles.includes(userRole)) {
      console.warn(`Acces restricted for role ${userRole} to ${to.path}`)
      // Redirect to a safe default page for the user role
      if (userRole === 'ADMINISTRADOR') return next('/admin')
      return next('/admin/postulaciones')
    }

    next()
  })

  return Router
})
