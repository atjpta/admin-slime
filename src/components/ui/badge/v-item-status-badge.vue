<script setup lang="ts">
import { ItemStatus } from '@/enums/item.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: ItemStatus }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="item.status"
    :class="[
      value === ItemStatus.ACTIVE && 'border-emerald-500 bg-emerald-500 text-white',
      value === ItemStatus.INACTIVE && 'border-slate-400 bg-slate-400 text-white',
    ]"
  />
</template>
