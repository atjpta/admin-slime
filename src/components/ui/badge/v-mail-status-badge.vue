<script setup lang="ts">
import { MailStatus } from '@/enums/mail.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: MailStatus }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="player.mailStatus"
    :class="[
      value === MailStatus.UNREAD && 'badge-warning',
      value === MailStatus.READ && 'badge-info',
      value === MailStatus.CLAIMED && 'badge-success',
      value === MailStatus.DELETED && 'badge-ghost',
    ]"
  />
</template>
