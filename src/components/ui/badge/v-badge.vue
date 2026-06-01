<script setup lang="ts">
import { useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })
defineProps<{ value: string; i18nKey: string }>()

const attrs = useAttrs()
const { t } = useI18n()
</script>

<template>
  <span v-bind="attrs" class="badge badge-sm badge-neutral whitespace-nowrap">
    {{ t(`${i18nKey}.${value}`) }}
  </span>
</template>
