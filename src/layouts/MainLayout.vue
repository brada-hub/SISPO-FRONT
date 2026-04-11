<template>
  <q-layout view="lHh LpR lFf">
    <q-header class="bg-gradient-to-r from-primary to-secondary text-white" height-hint="60">
      <q-toolbar class="h-16 px-6">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="mr-4" />

        <q-toolbar-title class="flex items-center gap-4 cursor-pointer" @click="handleHomeClick">
          <div class="flex flex-col leading-tight ml-2">
            <span class="font-bold text-lg tracking-wide uppercase">Convocatorias</span>
            <span class="text-[10px] opacity-90 font-light tracking-widest">Universidad Tecnica Privada Cosmos</span>
          </div>
        </q-toolbar-title>

        <div class="flex items-center gap-4">
          <div class="hidden sm:flex flex-col items-end mr-2">
            <span class="text-sm font-bold">{{ today }}</span>
            <span class="text-xs opacity-80">Cochabamba, Bolivia</span>
          </div>

          <q-btn flat round dense icon="public" @click="$router.push('/')" class="bg-white/10 hover:bg-white/20 transition-all">
            <q-tooltip class="bg-black/80 text-white">Ver portal publico</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!authStore.isLoggedIn"
            to="/admin"
            flat
            label="Soy administrador"
            no-caps
            class="bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="260"
      bordered
      class="bg-white"
      v-if="authStore.isLoggedIn"
    >
      <div class="column no-wrap h-full">
        <div class="p-6 flex flex-col gap-1">
          <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
            <img src="~assets/logo_unitepc.png" class="h-10" alt="UNITEPC" />
          </div>
          <div class="text-sm text-gray-400">Sistema de Gestión de Talento Humano</div>
        </div>

        <div class="col px-4 space-y-2 overflow-y-auto mt-2">
          <div
            @click="$router.push('/')"
            class="flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer mb-6 bg-gray-50 hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white border border-gray-100 group"
          >
            <q-icon name="public" size="22px" class="text-gray-600 group-hover:text-white group-hover:scale-110 transition-all" />
            <span class="font-bold text-gray-700 group-hover:text-white">Ver portal publico</span>
          </div>

          <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4 mb-2">Menú principal (SISPO)</div>

          <template v-if="authStore.isLoggedIn">
            <div
              v-for="item in adminMenuItems"
              :key="item.label"
              @click="setAdminSection(item.to)"
              :class="[
                'flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer mb-1 group',
                route.path === item.to
                  ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-md scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary font-medium hover:translate-x-1',
              ]"
            >
              <q-icon :name="item.icon" size="22px" :class="route.path === item.to ? 'text-white' : 'text-gray-400 group-hover:text-primary'" />
              <span>{{ item.label }}</span>
            </div>
          </template>
        </div>

        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <div class="row items-center no-wrap gap-3 mb-4">
            <q-avatar
              size="34px"
              class="shadow-sm border border-primary/20 shrink-0"
              color="primary"
              text-color="white"
              :key="`${authStore.userPhoto || 'no-photo'}-${authStore.fullName}`"
            >
              <q-img v-if="authStore.userPhoto" :src="authStore.userPhoto" fit="cover" />
              <span v-else>{{ (authStore.fullName || 'A').charAt(0).toUpperCase() }}</span>
            </q-avatar>
            <div class="column leading-tight overflow-hidden">
              <div class="font-bold text-gray-900 text-[11px] uppercase truncate">
                {{ authStore.fullName }}
              </div>
              <div class="text-[10px] text-gray-500 truncate">
                {{ authStore.currentUser?.rol?.nombre || authStore.currentUser?.rol?.name || 'Usuario' }}
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button
              @click="volverAlPortal"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white hover:border-transparent transition-all group"
            >
              <q-icon name="home" size="18px" class="group-hover:scale-110 transition-all" />
              <span class="font-bold text-sm">Volver al portal</span>
            </button>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="sessionTimeoutState.warningVisible" persistent>
      <q-card style="width: 440px; max-width: 92vw; border-radius: 20px;">
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="row items-center no-wrap">
            <q-icon name="schedule" size="md" class="q-mr-md" />
            <div class="column">
              <div class="text-h6 text-weight-bold">Sesión por expirar</div>
              <div class="text-caption opacity-80">Detectamos inactividad. Puedes continuar o cerrar tu sesión.</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="text-body1 text-grey-8 q-mb-md">
            Tu sesión se cerrará en
            <span class="text-primary text-weight-bolder">{{ sessionTimeoutState.countdownSeconds }}</span>
            segundos.
          </div>
          <div class="text-caption text-grey-6">
            Si sigues trabajando, presiona <strong>Seguir en linea</strong>.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-xl q-pb-xl q-gutter-sm">
          <q-btn flat no-caps color="negative" label="Cerrar sesión ahora" @click="handleSessionLogoutNow" />
          <q-btn no-caps color="primary" unelevated label="Seguir en línea" @click="handleSessionContinue" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'
import { useInactivity } from 'src/composables/useInactivity'
import { sessionTimeoutManager, sessionTimeoutState } from 'src/shared/sessionTimeoutManager'

const authStore = useAuthStore()
useInactivity()

onMounted(() => {
  authStore.init()
})

if (authStore.currentSystem !== 'SISTEMA DE POSTULACION') {
  authStore.setSystem('SISTEMA DE POSTULACION')
}

const leftDrawerOpen = ref(false)
const route = useRoute()
const router = useRouter()

const handleHomeClick = () => {
  if (!authStore.isLoggedIn) {
    router.push('/')
    return
  }

  if (authStore.can('usuarios') || authStore.can('dashboard')) {
    router.push('/admin')
  } else if (authStore.can('postulaciones')) {
    router.push('/admin/postulaciones')
  } else if (authStore.can('evaluaciones')) {
    router.push('/admin/evaluaciones')
  } else if (authStore.can('convocatorias')) {
    router.push('/admin/convocatorias')
  } else {
    router.push('/admin')
  }
}

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const today = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const adminMenuItems = computed(() => {
  const user = authStore.currentUser
  const userPermisos = user?.permisos || []

  const sispoItems = [
    { permission: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/admin' },
    { permission: 'convocatorias', label: 'Convocatorias', icon: 'campaign', to: '/admin/convocatorias' },
    { permission: 'convocatorias', label: 'Plantillas de Evaluación', icon: 'library_books', to: '/admin/plantillas-matrices' },
    { permission: 'postulaciones', label: 'Postulaciones', icon: 'people_alt', to: '/admin/postulaciones' },
    { permission: 'evaluaciones', label: 'Evaluación de méritos', icon: 'fact_check', to: '/admin/evaluaciones' },
    { permission: 'cargos', label: 'Cargos', icon: 'badge', to: '/admin/cargos' },
    { permission: 'requisitos', label: 'Tipos de documento', icon: 'folder_special', to: '/admin/requisitos' },
    { permission: 'usuarios', label: 'Usuarios SISPO', icon: 'manage_accounts', to: '/admin/usuarios' },
  ]

  const roleNames = [
    String(user?.rol?.name || user?.rol?.nombre || '').toUpperCase(),
    ...((user?.roles || []).map(role => String(role?.name || role?.nombre || role).toUpperCase())),
  ].filter(Boolean)

  const isGlobalAdmin = roleNames.some(role => ['ADMINISTRADOR', 'SUPER ADMIN', 'SUPERADMIN', 'ADMIN'].includes(role))

  if (isGlobalAdmin) {
    return sispoItems
  }

  return sispoItems.filter(item => userPermisos.includes(item.permission))
})

const setAdminSection = (path) => {
  router.push(path)
  leftDrawerOpen.value = false
}

const volverAlPortal = () => {
  const ssoUrl = import.meta.env.VITE_SSO_FRONT_URL
  window.location.href = ssoUrl
}

const handleSessionContinue = async () => {
  await sessionTimeoutManager.continueSession()
}

const handleSessionLogoutNow = async () => {
  await sessionTimeoutManager.logoutNow()
}
</script>
