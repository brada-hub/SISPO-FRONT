<template>
  <q-layout view="lHh LpR lFf">
    <!-- HEADER -->
    <q-header class="bg-gradient-to-r from-primary to-secondary text-white" height-hint="60">
      <q-toolbar class="h-16 px-6">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="mr-4"
        />

        <q-toolbar-title
          class="flex items-center gap-4 cursor-pointer"
          @click="handleHomeClick"
        >
          <div class="flex flex-col leading-tight ml-2">
            <span class="font-bold text-lg tracking-wide uppercase">Convocatorias</span>
            <span class="text-[10px] opacity-90 font-light tracking-widest"
              >Universidad Técnica Privada Cosmos</span
            >
          </div>
        </q-toolbar-title>

        <div class="flex items-center gap-4">
          <div class="hidden sm:flex flex-col items-end mr-2">
            <span class="text-sm font-bold">{{ today }}</span>
            <span class="text-xs opacity-80">Cochabamba, Bolivia</span>
          </div>

          <!-- Public Portal Button in Header -->
          <q-btn
            flat
            round
            dense
            icon="public"
            @click="$router.push('/')"
            class="bg-white/10 hover:bg-white/20 transition-all"
          >
            <q-tooltip class="bg-black/80 text-white">Ver Portal Público</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!authStore.isLoggedIn"
            to="/admin"
            flat
            label="Soy Administrador"
            no-caps
            class="bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR (Drawer) - Only show if Logged In / Admin -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="260"
      bordered
      class="bg-white"
      v-if="authStore.isLoggedIn"
    >
      <div class="column no-wrap h-full" style="height: 100vh;">
        <!-- Brand Area - CLEAN STYLE -->
        <div class="p-6 flex flex-col gap-1">
          <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
             <img src="~assets/logo_unitepc.png" class="h-10" alt="UNITEPC" />
          </div>
          <div class="text-sm text-gray-400">Sistema de Gestión de Talento Humano</div>
        </div>

        <!-- Menu items -->
        <div class="col px-4 space-y-2 overflow-y-auto mt-2">
          <!-- Back to Public Button -->
          <div
            @click="$router.push('/')"
            class="flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer mb-6 bg-gray-50 hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white border border-gray-100 group"
          >
            <q-icon name="public" size="22px" class="text-gray-600 group-hover:text-white group-hover:scale-110 transition-all" />
            <span class="font-bold text-gray-700 group-hover:text-white">Ver Portal Público</span>
          </div>

          <!-- System Selector -->
          <div v-if="authStore.user?.systems?.length > 1" class="px-4 mb-4">
            <q-select
              filled
              dense
              options-dense
              v-model="authStore.currentSystem"
              :options="systemOptions"
              label="Cambiar Sistema"
              class="bg-gray-50 rounded-lg"
              @update:model-value="onSystemChange"
            >
              <template v-slot:prepend>
                <q-icon name="apps" color="primary" />
              </template>
            </q-select>
          </div>

          <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4 mb-2">Menú Principal ({{ authStore.currentSystem }})</div>

          <!-- Admin Routes -->
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
              <q-badge v-if="item.badge" color="red" rounded floating transparent>{{
                item.badge
              }}</q-badge>
            </div>
          </template>
        </div>

    <!-- Footer - SIMPLE STYLE -->
        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <div class="row items-center no-wrap gap-3 mb-4">
            <div
              class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-sm border border-primary/20 shrink-0"
            >
              {{ authStore.currentUser?.nombres?.[0] || 'A' }}
            </div>
            <div class="column leading-tight overflow-hidden">
              <div class="font-bold text-gray-900 text-[11px] uppercase truncate">
                {{ authStore.currentUser?.nombres || 'Usuario' }}
                {{ authStore.currentUser?.apellidos || '' }}
              </div>
              <div class="text-[10px] text-gray-500 truncate">
                {{ authStore.currentUser?.rol?.name || authStore.currentUser?.rol?.nombre || 'Administrador' }}
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button
              @click="openManualPasswordChange"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <q-icon name="lock" size="18px" class="text-gray-400 group-hover:text-primary group-hover:rotate-12 transition-all" />
              <span class="font-bold text-sm">Cambiar Contraseña</span>
            </button>

            <button
              @click="logout"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all group"
            >
              <q-icon name="logout" size="18px" class="rotate-180 group-hover:-translate-x-1 transition-all" />
              <span class="font-bold text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Standalone Password Change Modal -->
    <change-password-modal
      v-model="pwdModal.show"
      :mandatory="pwdModal.mandatory"
    />
  </q-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'
import { useInactivity } from 'src/composables/useInactivity'
import ChangePasswordModal from 'src/components/auth/ChangePasswordModal.vue'

const authStore = useAuthStore()
useInactivity() // Ahora usa el default de 30 minutos definido en el composable

// El sistema se mantiene siempre en el de postulación (estamos en su frontend)
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

  // Redirect based on administrative permissions instead of role names
  if (authStore.can('usuarios') || authStore.can('roles') || authStore.can('dashboard')) {
    router.push('/admin')
  } else {
    router.push('/admin/postulaciones')
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

const systemOptions = computed(() => {
  return authStore.user?.systems || []
})

const onSystemChange = (val) => {
  if (val) {
    if (val === 'SISTEMA DE GESTIÓN DE VACACIONES' || val === 'SIGVA') {
      // Redirigir con token para SSO
      const token = localStorage.getItem('token')
      const sigvaUrl = process.env.DEV ? 'http://localhost:5173' : 'https://sigva.xpertiaplus.com'
      window.location.href = `${sigvaUrl}/admin/dashboard?token=${token}`
    } else {
      authStore.setSystem('SISTEMA DE POSTULACION')
      router.push('/admin') // Ir al dashboard de SISPO
    }
  }
}

const adminMenuItems = computed(() => {
  const user = authStore.currentUser
  const userPermisos = user?.permisos || []

  // --- MENU ITEMS FOR SISPO (Strict RBAC) ---
  const sispoItems = [
    { permission: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/admin' },
    { permission: 'convocatorias', label: 'Convocatorias', icon: 'campaign', to: '/admin/convocatorias' },
    { permission: 'postulaciones', label: 'Postulaciones', icon: 'people_alt', to: '/admin/postulaciones' },
    { permission: 'evaluaciones', label: 'Evaluación Méritos', icon: 'fact_check', to: '/admin/evaluaciones' },
    { permission: 'sedes', label: 'Sedes', icon: 'apartment', to: '/admin/sedes' },
    { permission: 'cargos', label: 'Cargos', icon: 'badge', to: '/admin/cargos' },
    { permission: 'requisitos', label: 'Tipos Documento', icon: 'folder_special', to: '/admin/requisitos' },
    { permission: 'usuarios', label: 'Usuarios', icon: 'manage_accounts', to: '/admin/usuarios' },
    { permission: 'roles', label: 'Roles', icon: 'security', to: '/admin/roles' },
  ]

  // Filter items based on user permissions
  // NO BYPASS FOR ADMINS - They must have the permission assigned effectively in DB (which they do via Seeder)
  return sispoItems.filter(item => userPermisos.includes(item.permission))
})

const setAdminSection = (path) => {
  router.push(path)
  leftDrawerOpen.value = false
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Password Change Logic
const pwdModal = ref({
  show: false,
  mandatory: false
})

const openManualPasswordChange = () => {
  pwdModal.value = { show: true, mandatory: false }
}

watch(
  () => authStore.user,
  (newUser) => {
    if (newUser?.must_change_password) {
      pwdModal.value = { show: true, mandatory: true }
    }
  },
  { immediate: true, deep: true },
)
</script>
