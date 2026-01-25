<template>
  <q-dialog v-model="show" :persistent="mandatory">
    <q-card class="min-w-[400px] shadow-2xl" style="border-radius: 28px; overflow: hidden;">
      <q-card-section class="bg-primary text-white p-8">
        <div class="flex items-center gap-4">
          <div class="bg-white/20 p-3 rounded-2xl">
            <q-icon :name="mandatory ? 'lock_reset' : 'shield_lock'" size="36px" />
          </div>
          <div>
            <div class="text-h5 font-bold leading-tight mb-1">
              {{ mandatory ? 'Cambio Obligatorio' : 'Actualizar Contraseña' }}
            </div>
            <div class="text-sm opacity-80 font-medium">
              {{ mandatory
                ? 'Por seguridad, debe actualizar su contraseña inicial.'
                : 'Mantenga su cuenta segura con una contraseña nueva.'
              }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="p-8 space-y-6">
        <q-banner v-if="mandatory" dense class="bg-amber-50 text-amber-900 rounded-2xl mb-4 p-4 border border-amber-100">
          <template v-slot:avatar>
            <q-icon name="info" color="amber-9" size="24px" />
          </template>
          <span class="text-sm font-medium">Su contraseña actual es temporal. Elija una nueva contraseña segura para continuar.</span>
        </q-banner>

        <!-- Current Password (Only if NOT mandatory) -->
        <q-input
          v-if="!mandatory"
          v-model="form.password_current"
          label="Contraseña Actual"
          :type="isPwdCur ? 'password' : 'text'"
          outlined
          rounded
          class="text-lg"
          :rules="[(val) => !!val || 'Requerido']"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwdCur ? 'visibility_off' : 'visibility'"
              class="cursor-pointer hover:text-primary transition-colors"
              @click="isPwdCur = !isPwdCur"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          label="Nueva Contraseña"
          :type="isPwd ? 'password' : 'text'"
          outlined
          rounded
          class="text-lg"
          :rules="[(val) => !!val || 'Requerido', (val) => val.length >= 6 || 'Min 6 caracteres']"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer hover:text-primary transition-colors"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.password_confirmation"
          label="Repetir Nueva Contraseña"
          :type="isPwdConf ? 'password' : 'text'"
          outlined
          rounded
          class="text-lg"
          :rules="[
            (val) => !!val || 'Requerido',
            (val) => val === form.password || 'Las contraseñas no coinciden',
          ]"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwdConf ? 'visibility_off' : 'visibility'"
              class="cursor-pointer hover:text-primary transition-colors"
              @click="isPwdConf = !isPwdConf"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="center" class="p-8 bg-gray-50/50">
        <q-btn
          :label="mandatory ? 'Actualizar y Continuar' : 'Actualizar Contraseña Ahora'"
          color="primary"
          @click="handleSubmit"
          :loading="loading"
          unelevated
          rounded
          no-caps
          class="q-px-xl py-3 text-weight-bold shadow-lg hover:scale-105 transition-all w-full sm:w-auto"
        />
        <q-btn
          v-if="!mandatory"
          label="Cancelar"
          flat
          rounded
          no-caps
          color="grey-7"
          class="q-ml-sm"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'

const props = defineProps({
  modelValue: Boolean,
  mandatory: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const $q = useQuasar()
const authStore = useAuthStore()

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const isPwdCur = ref(true)
const isPwd = ref(true)
const isPwdConf = ref(true)

const form = ref({
  password_current: '',
  password: '',
  password_confirmation: '',
})

const handleSubmit = async () => {
  // Basic validation
  if (!form.value.password || form.value.password !== form.value.password_confirmation) return
  if (!props.mandatory && !form.value.password_current) {
    $q.notify({ type: 'negative', message: 'Debe ingresar su contraseña actual' })
    return
  }

  loading.value = true
  try {
    const { data } = await api.post('/usuarios/cambiar-password', {
      ...form.value,
      mandatory: props.mandatory
    })

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

      emit('success')
      show.value = false

      // Reset form
      form.value = {
        password_current: '',
        password: '',
        password_confirmation: '',
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al cambiar contraseña',
    })
  } finally {
    loading.value = false
  }
}
</script>
