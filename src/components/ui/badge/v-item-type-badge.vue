<script setup lang="ts">
import { ItemType } from '@/enums/item.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: ItemType }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="item.type"
    :class="[
      value === ItemType.EQUIPMENT && 'border-indigo-500 bg-indigo-500 text-white',
      value === ItemType.CONSUMABLE && 'border-emerald-500 bg-emerald-500 text-white',
      value === ItemType.MATERIAL && 'border-amber-600 bg-amber-600 text-white',
    ]"
  />
</template>
