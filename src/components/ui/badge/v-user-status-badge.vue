<script setup lang="ts">
import { UserStatus } from '@/enums/user.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'
defineProps<{ value: UserStatus }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="user.status"
    :class="[
      value === UserStatus.ACTIVE && 'badge-success',
      value === UserStatus.INACTIVE && 'badge-secondary',
    ]"
  />
</template>
