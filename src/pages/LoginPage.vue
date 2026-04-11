<template>
  <q-page class="window-height window-width flex flex-center bg-grey-2">
    <!-- This page should almost never be visible - it auto-redirects -->
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'

const ssoBaseUrl = import.meta.env.VITE_SSO_FRONT_URL
const currentOrigin = window.location.origin + window.location.pathname

const goToSSO = () => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const force = urlParams.get('force') === 'true';
    const returnToUrl = encodeURIComponent(`${currentOrigin}#/admin`)
    window.location.href = `${ssoBaseUrl}/#/login?returnTo=${returnToUrl}${force ? '&force=true' : ''}`
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);

  // Si viene con token del SSO, procesarlo
  const token = urlParams.get('token');
  const userBase64 = urlParams.get('user');

  if (token && userBase64) {
    try {
      const normalizedToken = decodeURIComponent(String(token));
      const normalizedUser = decodeURIComponent(String(userBase64));
      const user = JSON.parse(decodeURIComponent(escape(atob(normalizedUser))));
      localStorage.setItem('sispo_token', normalizedToken);
      localStorage.setItem('sispo_user', JSON.stringify(user));
      localStorage.removeItem('sispo_last_401');
      localStorage.removeItem('sispo_401_count');
      window.location.href = '#/admin';
      return;
    } catch (e) {
      console.error('Error al procesar datos del SSO', e);
    }
  }

  // Si ya tiene token en localStorage, ir al admin
  const existingToken = localStorage.getItem('sispo_token')
  if (existingToken) {
    window.location.href = '#/admin';
    return;
  }

  // Sin sesión → redirigir INMEDIATAMENTE al SSO
  goToSSO()
})
</script>

