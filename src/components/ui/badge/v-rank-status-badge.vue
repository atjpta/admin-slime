<script setup lang="ts">
import { RankConfigStatus, RankSessionStatus } from '@/enums/rank.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'

defineProps<{ value: RankConfigStatus | RankSessionStatus; i18nKey: string }>()
</script>

<template>
  <VBadge
    :value="value"
    :i18n-key="i18nKey"
    :class="[
      value === RankConfigStatus.ACTIVE && 'badge-success',
      value === RankSessionStatus.ENDED && 'badge-warning',
      (value === RankConfigStatus.DELETED || value === RankSessionStatus.DELETED) && 'badge-error',
      value === RankConfigStatus.INACTIVE && 'badge-neutral',
    ]"
  />
</template>
