<script setup lang="ts">
import { ItemRarity } from '@/enums/item.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: ItemRarity }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="item.rarity"
    :class="[
      value === ItemRarity.COMMON && 'border-slate-400 bg-slate-400 text-white',
      value === ItemRarity.RARE && 'border-blue-500 bg-blue-500 text-white',
      value === ItemRarity.EPIC && 'border-purple-500 bg-purple-500 text-white',
      value === ItemRarity.LEGENDARY && 'border-amber-500 bg-amber-500 text-white',
    ]"
  />
</template>
