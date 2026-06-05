<script setup lang="ts">
import { GachaStatus } from '@/enums/gacha.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: GachaStatus }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="gacha.status"
    :class="[
      value === GachaStatus.ACTIVE && 'border-emerald-500 bg-emerald-500 text-white',
      value === GachaStatus.INACTIVE && 'border-slate-400 bg-slate-400 text-white',
    ]"
  />
</template>
