<script setup lang="ts">
import { DrawType } from '@/enums/gacha.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: DrawType }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="gacha.drawType"
    :class="[
      value === DrawType.DRAW_1 && 'border-sky-500 bg-sky-500 text-white',
      value === DrawType.DRAW_10 && 'border-violet-500 bg-violet-500 text-white',
    ]"
  />
</template>
