<script setup lang="ts">
import { BattleItemType } from '@/enums/battle-item.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: BattleItemType }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="battleItem.type"
    :class="[
      value === BattleItemType.BUFF && 'border-emerald-500 bg-emerald-500 text-white',
      value === BattleItemType.INFO && 'border-sky-500 bg-sky-500 text-white',
      value === BattleItemType.BLUFF && 'border-violet-500 bg-violet-500 text-white',
      value === BattleItemType.TEMPO && 'border-amber-500 bg-amber-500 text-white',
      value === BattleItemType.CHAOS && 'border-rose-500 bg-rose-500 text-white',
    ]"
  />
</template>
