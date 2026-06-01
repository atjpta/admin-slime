<script setup lang="ts">
import VBadge from '@/components/ui/badge/v-badge.vue'
import { PlayerRole } from '@/enums/player.enum'
defineProps<{ value: PlayerRole }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="player.role"
    :class="[
      value === PlayerRole.PLAYER && 'badge-primary',
      value === PlayerRole.BOT && 'badge-secondary',
    ]"
  />
</template>
