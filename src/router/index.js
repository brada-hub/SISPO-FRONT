import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
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
    // Check if route requires auth
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    // Check if we are checking for 'guest' mode (e.g. login page shouldn't be accessible if logged in)
    // const isGuest = to.matched.some(record => record.meta.guest)

    // We need to access the store somehow. Since this is outside a component setup,
    // we need to import useAuthStore and use it inside the guard.
    // However, Pinia needs to be installed. In Quasar, Pinia is usually installed before Router.
    // But inside this function, we can import it dynamically or just import at top if possible.
    // Standard way in Quasar: import { useAuthStore } from 'stores/auth-store'
    // But we need to make sure Pinia instance is active. It is active when Router is instantiated usually.

    // Simplest way: Check localStorage token directly if store access is tricky,
    // but better to use the store.
    // Note: 'import { useAuthStore } from ...' at top of file works if Pinia is initialized
    // in boot file or main.js before router.

    const token = localStorage.getItem('token') // Direct check for simplicity/speed in this context

    if (requiresAuth && !token) {
      next('/login')
    } else if (to.path === '/login' && token) {
       // If trying to access login while authenticated, go to admin
       next('/admin')
    } else {
      next()
    }
  })

  return Router
})
