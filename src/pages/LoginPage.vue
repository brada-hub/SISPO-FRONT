<template>
  <q-page class="window-height window-width flex flex-center bg-grey-2">
    <div class="text-center">
      <template v-if="authError">
        <template v-if="isExplicitError">
            <q-icon name="error" color="negative" size="4em" />
            <div class="text-h6 q-mt-md text-negative" style="font-weight: bold;">Acceso Denegado / Sesión Expirada</div>
            <p class="text-grey-8 q-mt-sm" style="max-width: 400px; margin: 0 auto;">
              No tienes los permisos necesarios o tu sesión ha caducado. Vuelve al portal central para iniciar sesión nuevamente.
            </p>
        </template>
        <template v-else>
            <q-icon name="account_circle" color="primary" size="4em" />
            <div class="text-h6 q-mt-md text-primary" style="font-weight: bold;">Acceso al Sistema SISPO</div>
            <p class="text-grey-8 q-mt-sm" style="max-width: 400px; margin: 0 auto;">
              Haz clic en el botón de abajo para identificarte a través del Portal Central de la institución.
            </p>
        </template>
        <q-btn color="primary" class="q-mt-lg" label="Ingresar vía SSO" @click="goToSSO" />
      </template>
      <template v-else>
        <q-spinner-dots color="primary" size="4em" />
        <div class="text-h6 q-mt-md text-primary" style="font-weight: bold;">Redirigiendo al Portal Central de Autenticación...</div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const authError = ref(false)
const isExplicitError = ref(false)

const currentUrl = window.location.origin + window.location.pathname
const ssoUrl = `${import.meta.env.VITE_SSO_FRONT_URL}/#/login`
const returnToUrl = encodeURIComponent(`${currentUrl}#/admin`)

const goToSSO = () => {
    window.location.href = `${ssoUrl}?returnTo=${returnToUrl}`
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);

  if (urlParams.get('sesion_exp') === 'true' || urlParams.get('error') !== null) {
      authError.value = true;
      isExplicitError.value = true;
      return; // Stop the redirect loop!
  }

  const token = urlParams.get('token');
  const userBase64 = urlParams.get('user');

  if (token && userBase64) {
    try {
      const user = JSON.parse(decodeURIComponent(escape(atob(userBase64))));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Limpiar la URL y entrar
      window.location.href = '#/admin';
      return;
    } catch (e) {
      console.error('Error al procesar datos del SSO', e);
    }
  }

  // 2. Si no hay datos en la URL, mostrar el botón de ingreso
  // En lugar de redirigir forzosamente, detenemos el spinner y mostramos un error para evitar el bucle.
  authError.value = true;
})
</script>
