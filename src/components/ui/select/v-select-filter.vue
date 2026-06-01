<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface SelectFilterOption {
  value: string
  label: string
}

interface Props {
  label: string
  /** Truyền enum object + i18nKey để tự map options */
  enumValues?: Record<string, string>
  i18nKey?: string
  /** Hoặc truyền thẳng options thủ công */
  options?: SelectFilterOption[]
  allLabel?: string
}

const { label, enumValues, i18nKey, options, allLabel } = defineProps<Props>()
const model = defineModel<string>({ default: '' })
const { t } = useI18n()

const resolvedOptions = computed<SelectFilterOption[]>(() => {
  if (enumValues && i18nKey) {
    return Object.values(enumValues).map(value => ({ value, label: t(`${i18nKey}.${value}`) }))
  }
  return options ?? []
})
</script>

<template>
  <label class="select select-sm w-fit">
    <span class="label">{{ label }}</span>
    <select v-model="model">
      <option value="">{{ allLabel ?? t('common.all') }}</option>
      <option v-for="opt in resolvedOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </label>
</template>
