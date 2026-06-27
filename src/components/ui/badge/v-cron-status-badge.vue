<script setup lang="ts">
import { CronJobStatus } from '@/enums/cron-log.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'

defineProps<{ value: CronJobStatus }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="cronLog.status"
    :class="[
      value === CronJobStatus.SUCCESS && 'badge-success',
      value === CronJobStatus.FAILED && 'badge-error',
      value === CronJobStatus.RUNNING && 'badge-info',
      value === CronJobStatus.PENDING && 'badge-neutral',
    ]"
  />
</template>
