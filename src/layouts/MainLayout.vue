<template>
  <q-layout view="lHh LpR lFf">
    <!-- HEADER -->
    <q-header class="bg-primary text-white" height-hint="60">
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
          @click="isAdminRoute ? $router.push('/admin') : $router.push('/')"
        >
          <!-- Logo UNITEPC - White for contrast -->
          <img
            src="~assets/logo_unitepc.png"
            alt="UNITEPC Logo"
            class="h-10 bg-white rounded-lg p-1.5 shadow-sm"
          />

          <div class="flex flex-col leading-tight">
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
      <div class="flex flex-col h-full">
        <!-- Brand Area - CLEAN STYLE -->
        <div class="p-6 flex flex-col gap-1">
          <div class="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <span class="text-2xl">UNITEPC</span>
          </div>
          <div class="text-sm text-gray-400">Sistema Convocatorias</div>
        </div>

        <!-- Menu items -->
        <div class="flex-1 px-4 space-y-2 overflow-y-auto mt-2">
          <!-- Admin Routes -->
          <template v-if="authStore.isLoggedIn">
            <div
              v-for="item in adminMenuItems"
              :key="item.label"
              @click="setAdminSection(item.to)"
              :class="[
                'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer mb-1',
                route.path === item.to
                  ? 'bg-primary text-white font-medium shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 font-medium',
              ]"
            >
              <q-icon :name="item.icon" size="22px" />
              <span>{{ item.label }}</span>
              <q-badge v-if="item.badge" color="red" rounded floating transparent>{{
                item.badge
              }}</q-badge>
            </div>
          </template>
        </div>

        <!-- Footer - SIMPLE STYLE -->
        <div class="p-6 border-t border-gray-100 mt-auto">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm"
            >
              {{ authStore.currentUser?.nombres?.[0] || 'A' }}
            </div>
            <div class="leading-tight">
              <div class="font-bold text-gray-900 text-sm uppercase">
                {{ authStore.currentUser?.nombres || 'Usuario' }}
                {{ authStore.currentUser?.apellidos || '' }}
              </div>
              <div class="text-xs text-gray-400">
                {{ authStore.currentUser?.rol?.nombre || 'Administrador' }}
              </div>
            </div>
          </div>

          <button
            @click="logout"
            class="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors pl-1"
          >
            <q-icon name="logout" size="20px" class="rotate-180" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- MANDATORY PASSWORD CHANGE MODAL -->
    <q-dialog v-model="showPasswordChange" persistent>
      <q-card class="min-w-[400px] rounded-2xl shadow-2xl overflow-hidden">
        <q-card-section class="bg-primary text-white p-6">
          <div class="flex items-center gap-3">
            <q-icon name="lock_reset" size="32px" />
            <div>
              <div class="text-h6 font-bold leading-none mb-1">Cambio Obligatorio</div>
              <div class="text-xs opacity-80">
                Por seguridad, debe actualizar su contraseña inicial.
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="p-6 space-y-4">
          <q-banner dense class="bg-amber-50 text-amber-900 rounded-lg mb-4">
            <template v-slot:avatar>
              <q-icon name="warning" color="amber-9" />
            </template>
            Su contraseña actual es temporal. Elija una nueva contraseña segura.
          </q-banner>

          <q-input
            v-model="pwdForm.password"
            label="Nueva Contraseña"
            type="password"
            outlined
            rounded
            dense
            :rules="[(val) => !!val || 'Requerido', (val) => val.length >= 6 || 'Min 6 caracteres']"
          />

          <q-input
            v-model="pwdForm.password_confirmation"
            label="Repetir Nueva Contraseña"
            type="password"
            outlined
            rounded
            dense
            :rules="[
              (val) => !!val || 'Requerido',
              (val) => val === pwdForm.password || 'Las contraseñas no coinciden',
            ]"
          />
        </q-card-section>

        <q-card-actions align="right" class="p-4 bg-gray-50">
          <q-btn
            label="Actualizar Contraseña"
            color="primary"
            @click="handlePasswordChange"
            :loading="pwdLoading"
            unelevated
            rounded
            class="q-px-lg shadow-2"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'
import { useInactivity } from 'src/composables/useInactivity'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const authStore = useAuthStore()
useInactivity(600000) // 10 minutos de inactividad

const leftDrawerOpen = ref(false)
const route = useRoute()
const router = useRouter()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
// Eliminada variable no utilizada currentAdminSection

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const today = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const adminMenuItems = computed(() => {
  const items = [
    { label: 'Dashboard', icon: 'dashboard', to: '/admin' },
    { label: 'Convocatorias', icon: 'campaign', to: '/admin/convocatorias' },
    { label: 'Postulaciones', icon: 'people_alt', to: '/admin/postulaciones' },
    { label: 'Sedes', icon: 'apartment', to: '/admin/sedes' },
    { label: 'Cargos', icon: 'badge', to: '/admin/cargos' },
    { label: 'Tipos Documento', icon: 'folder_special', to: '/admin/requisitos' },
  ]

  // Solo Administradores ven Usuarios y Roles
  const rolName = authStore.currentUser?.rol?.nombre?.toLowerCase() || ''
  if (rolName === 'administrador' || rolName === 'super admin') {
    items.push({ label: 'Usuarios', icon: 'manage_accounts', to: '/admin/usuarios' })
    items.push({ label: 'Roles', icon: 'security', to: '/admin/roles' })
  }

  return items
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
const pwdLoading = ref(false)
const showPasswordChange = ref(false)
const pwdForm = ref({
  password: '',
  password_confirmation: '',
})

watch(
  () => authStore.user,
  (newUser) => {
    if (newUser?.must_change_password) {
      showPasswordChange.value = true
    } else {
      showPasswordChange.value = false
    }
  },
  { immediate: true, deep: true },
)

const handlePasswordChange = async () => {
  if (!pwdForm.value.password || pwdForm.value.password !== pwdForm.value.password_confirmation)
    return

  pwdLoading.value = true
  try {
    const { data } = await api.post('/usuarios/cambiar-password', pwdForm.value)
    if (data.success) {
      $q.notify({
        type: 'positive',
        message: 'Contraseña actualizada con éxito',
        position: 'top',
      })

      // Update local storage and store state
      const updatedUser = { ...authStore.user, must_change_password: false }
      authStore.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      showPasswordChange.value = false
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al cambiar contraseña',
    })
  } finally {
    pwdLoading.value = false
  }
}
</script>
