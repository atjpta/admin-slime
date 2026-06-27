<script setup lang="ts">
import { CronTriggerSource } from '@/enums/cron-log.enum'
import VBadge from '@/components/ui/badge/v-badge.vue'

defineProps<{ value: CronTriggerSource }>()
</script>

<template>
  <VBadge
    :value="value"
    i18n-key="cronLog.triggeredBy"
    :class="[
      value === CronTriggerSource.SCHEDULER && 'badge-neutral',
      value === CronTriggerSource.MANUAL && 'badge-primary',
      value === CronTriggerSource.RETRY && 'badge-warning',
    ]"
  />
</template>
