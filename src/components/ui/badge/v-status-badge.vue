<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  value: string
  i18nKey: string
  /** Map value → DaisyUI badge color (neutral | primary | secondary | accent | info | success | warning | error) */
  colors?: Record<string, string>
}

const { value, i18nKey, colors = {} } = defineProps<Props>()
const { t } = useI18n()

const colorClass = computed(() => {
  const color = colors[value]
  return color ? `badge-${color}` : 'badge-neutral'
})
</script>

<template>
  <span class="badge badge-sm" :class="colorClass">
    {{ t(`${i18nKey}.${value}`) }}
  </span>
</template>
