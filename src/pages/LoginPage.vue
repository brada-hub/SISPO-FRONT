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
    const returnToUrl = encodeURIComponent(`${currentOrigin}#/admin`)
    window.location.href = `${ssoBaseUrl}/#/login?returnTo=${returnToUrl}`
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);

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

  // Sin sesión → redirigir INMEDIATAMENTE al SSO
  goToSSO()
})
</script>

