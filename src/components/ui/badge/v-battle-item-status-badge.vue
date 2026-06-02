<script setup lang="ts">
import { BattleItemStatus } from '@/enums/battle-item.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: BattleItemStatus }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="battleItem.status"
    :class="[
      value === BattleItemStatus.ACTIVE && 'border-emerald-500 bg-emerald-500 text-white',
      value === BattleItemStatus.INACTIVE && 'border-slate-400 bg-slate-400 text-white',
    ]"
  />
</template>
