const routes = [
  // Public Routes (Portal, Login, Postulación) with CLEAN Layout
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'portal',
        component: () => import('pages/PortalPage.vue'),
      },
      {
        path: 'postular/:id?',
        name: 'postular',
        component: () => import('pages/PortalPostulacion.vue'),
      },
      {
        path: 'postular-legacy',
        name: 'postular_legacy',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'seguimiento',
        name: 'seguimiento',
        component: () => import('pages/ConsultaEstado.vue'),
      },
      {
        path: 'convocatoria/:id',
        name: 'convocatoria_detalle',
        component: () => import('pages/ConvocatoriaDetallePage.vue'),
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },

  // Admin Routes with MainLayout (Sidebar/Header)
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin_dashboard',
        component: () => import('pages/admin/DashboardHome.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN', 'ADMINISTRADOR'] }
      },
      {
        path: 'sedes',
        component: () => import('pages/admin/SedesPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN'], permissions: ['sedes'] }
      },
      {
        path: 'cargos',
        component: () => import('pages/admin/CargosPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN'], permissions: ['cargos'] }
      },
      {
        path: 'requisitos',
        component: () => import('pages/admin/TiposDocumentoPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN'], permissions: ['requisitos'] }
      },
      {
        path: 'convocatorias',
        component: () => import('pages/admin/ConvocatoriasPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN'], permissions: ['convocatorias'] }
      },
      {
        path: 'postulaciones',
        component: () => import('pages/admin/PostulacionesPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN', 'USUARIO'], permissions: ['postulaciones'] }
      },
      {
        path: 'expediente/:id',
        component: () => import('pages/admin/ExpedientePage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN', 'ADMINISTRADOR', 'USUARIO'] }
      },
      {
        path: 'evaluaciones',
        component: () => import('pages/admin/EvaluacionesListPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN', 'USUARIO'], permissions: ['evaluaciones'] }
      },
      {
        path: 'evaluacion-tabla',
        component: () => import('pages/admin/EvaluacionTablaPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN', 'ADMINISTRADOR', 'USUARIO'] }
      },
      {
        path: 'usuarios',
        component: () => import('pages/admin/UsuariosPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN'], permissions: ['usuarios'] }
      },
      {
        path: 'roles',
        component: () => import('pages/admin/RolesPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMIN'], permissions: ['roles'] }
      },
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
