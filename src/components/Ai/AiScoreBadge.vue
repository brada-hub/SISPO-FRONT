<template>
  <q-badge
    :color="badgeConfig.color"
    :text-color="badgeConfig.textColor"
    class="q-pa-sm text-subtitle2 ai-badge shadow-2"
  >
    <q-icon :name="badgeConfig.icon" size="sm" class="q-mr-xs" />
    {{ badgeConfig.label }}
  </q-badge>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  clasificacion: {
    type: String,
    required: true,
    validator: (value) => ['apto', 'parcialmente_apto', 'no_apto', 'pendiente'].includes(value)
  }
})

const badgeConfig = computed(() => {
  switch (props.clasificacion) {
    case 'apto':
      return {
        color: 'green-1',
        textColor: 'green-9',
        icon: 'check_circle',
        label: 'Apto'
      }
    case 'parcialmente_apto':
      return {
        color: 'orange-1',
        textColor: 'orange-9',
        icon: 'warning',
        label: 'Parcialmente Apto'
      }
    case 'no_apto':
      return {
        color: 'red-1',
        textColor: 'red-9',
        icon: 'cancel',
        label: 'No Apto'
      }
    default:
      return {
        color: 'grey-2',
        textColor: 'grey-8',
        icon: 'help_outline',
        label: 'Sin Evaluar'
      }
  }
})
</script>

<style scoped>
.ai-badge {
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.3px;
  border: 1px solid rgba(0,0,0,0.05);
}
</style>
