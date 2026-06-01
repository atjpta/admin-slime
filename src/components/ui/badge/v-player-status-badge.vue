<script setup lang="ts">
import { PlayerStatus } from '@/enums/player.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: PlayerStatus }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="player.status"
    :class="[
      value === PlayerStatus.ACTIVE && 'badge-success',
      value === PlayerStatus.INACTIVE && 'badge-error',
    ]"
  />
</template>
