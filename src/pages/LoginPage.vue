<template>
  <q-page class="window-height window-width flex flex-center bg-grey-2">
    <div class="text-center">
      <q-spinner-dots color="primary" size="4em" />
      <div class="text-h6 q-mt-md text-primary" style="font-weight: bold;">Verificando sesión central...</div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'

const authStore = useAuthStore()
const ssoBaseUrl = String(import.meta.env.VITE_SSO_FRONT_URL || 'https://sigeth.xpertiaplus.com').replace(/\/+$/, '')
const adminBaseUrl = `${window.location.origin}/admin`

const goToSSO = () => {
  const returnToUrl = encodeURIComponent(adminBaseUrl)
  window.location.href = `${ssoBaseUrl}/login?returnTo=${returnToUrl}`
}

onMounted(() => {
  // Si el Router ya procesó el token, el authStore ya tendrá datos.
  // Esperar un momento breve para asegurar que el store esté listo.
  setTimeout(() => {
    if (authStore.token || localStorage.getItem('sispo_token')) {
      console.log('LoginPage: Sesión detectada, redirigiendo a /admin')
      window.location.href = '/admin'
      return
    }

    // Si no hay nada de nada, ir al SSO
    console.log('LoginPage: No se detectó sesión ni token. Redirigiendo al SSO...')
    goToSSO()
  }, 500)
})
</script>
