<template>
  <q-page class="window-height window-width flex flex-center bg-grey-2">
    <div class="text-center">
      <template v-if="showExpiredMessage">
        <q-icon name="error" color="negative" size="4em" />
        <div class="text-h6 q-mt-md text-negative" style="font-weight: bold;">Acceso Denegado / Sesión Expirada</div>
        <p class="text-grey-8 q-mt-sm" style="max-width: 400px; margin: 0 auto;">
          No tienes los permisos necesarios o tu sesión ha caducado.
        </p>
        <q-btn color="primary" class="q-mt-lg" label="Iniciar Sesión" @click="goToSSO" />
      </template>
      <template v-else>
        <q-spinner-dots color="primary" size="4em" />
        <div class="text-h6 q-mt-md text-primary" style="font-weight: bold;">Redirigiendo al Portal Central...</div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const showExpiredMessage = ref(false)

const ssoBaseUrl = import.meta.env.VITE_SSO_FRONT_URL
const currentOrigin = window.location.origin + window.location.pathname

const goToSSO = () => {
    const returnToUrl = encodeURIComponent(`${currentOrigin}#/admin`)
    window.location.href = `${ssoBaseUrl}/#/login?returnTo=${returnToUrl}`
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);

  // Si hay error explícito o sesión expirada, mostrar mensaje
  if (urlParams.get('sesion_exp') === 'true' || urlParams.get('error') !== null) {
      showExpiredMessage.value = true;
      return;
  }

  // Si viene con token del SSO, procesarlo
  const token = urlParams.get('token');
  const userBase64 = urlParams.get('user');

  if (token && userBase64) {
    try {
      const user = JSON.parse(decodeURIComponent(escape(atob(userBase64))));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '#/admin';
      return;
    } catch (e) {
      console.error('Error al procesar datos del SSO', e);
    }
  }

  // Si ya tiene token en localStorage, ir al admin
  const existingToken = localStorage.getItem('token')
  if (existingToken) {
    window.location.href = '#/admin';
    return;
  }

  // Sin token ni datos → redirigir AUTOMÁTICAMENTE al SSO (sin mostrar página intermedia)
  console.log('SISPO: No session found. Auto-redirecting to SSO...')
  goToSSO()
})
</script>

