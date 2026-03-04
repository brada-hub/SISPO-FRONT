<template>
  <q-page class="window-height window-width flex flex-center bg-grey-2">
    <div class="text-center">
      <q-spinner-dots color="primary" size="4em" />
      <div class="text-h6 q-mt-md text-primary" style="font-weight: bold;">Redirigiendo al Portal Central de Autenticación...</div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const currentUrl = window.location.origin + window.location.pathname
  const ssoUrl = import.meta.env.DEV ? 'http://localhost:9000/#/login' : 'https://sigeth.xpertiaplus.com/#/login'

  // ReturnTo parameter set to the admin dashboard of SISPO
  const returnToUrl = encodeURIComponent(`${currentUrl}#/admin`)

  window.location.href = `${ssoUrl}?returnTo=${returnToUrl}`
})
</script>
