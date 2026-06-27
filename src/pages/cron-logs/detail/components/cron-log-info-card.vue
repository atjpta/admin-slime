<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RefreshCwIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VCronStatusBadge from '@/components/ui/badge/v-cron-status-badge.vue'
import VCronTriggerBadge from '@/components/ui/badge/v-cron-trigger-badge.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import { cronLogService } from '@/services/api/cron-log.service'
import { formatDate } from '@/utils/format'
import { toast } from '@/utils/toast'
import type { CronLog } from '@/interfaces/cron-log.interface'

const props = defineProps<{ log: CronLog }>()
const emit = defineEmits<{ retried: [] }>()
const { t } = useI18n()

const showConfirm = ref(false)
const retrying = ref(false)

async function handleRetry() {
  showConfirm.value = false
  retrying.value = true
  await cronLogService.retry(props.log._id)
  toast.success(t('cronLog.retry.success'))
  retrying.value = false
  emit('retried')
}

function getParentLogId(parentLogId: CronLog['parentLogId']): string | null {
  if (!parentLogId) return null
  if (typeof parentLogId === 'string') return parentLogId
  return (parentLogId as CronLog)._id
}
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-5">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h1 class="text-xl font-semibold font-mono">{{ log.jobName }}</h1>
          <p class="text-base-content/50 font-mono text-sm">{{ log._id }}</p>
        </div>
        <VButton :icon="RefreshCwIcon" class="btn-warning btn-sm" :loading="retrying" @click="showConfirm = true">
          <span class="hidden sm:inline">{{ t('cronLog.retry.btn') }}</span>
        </VButton>
      </div>

      <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('cronLog.columns.status') }}</span>
          <VCronStatusBadge :value="log.status" class="w-fit" />
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('cronLog.columns.triggeredBy') }}</span>
          <VCronTriggerBadge :value="log.triggeredBy" class="w-fit" />
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('cronLog.detail.startedAt') }}</span>
          <span class="font-medium">{{ formatDate(log.startedAt) }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('cronLog.detail.finishedAt') }}</span>
          <span class="font-medium">{{ log.finishedAt ? formatDate(log.finishedAt) : '-' }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('cronLog.detail.duration') }}</span>
          <span class="font-medium">{{ log.durationMs != null ? `${log.durationMs.toLocaleString()} ms` : '-' }}</span>
        </div>
        <div v-if="getParentLogId(log.parentLogId)" class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('cronLog.detail.parentLog') }}</span>
          <span class="font-mono text-xs">{{ getParentLogId(log.parentLogId) }}</span>
        </div>
      </div>
    </div>
  </div>

  <VConfirmModal
    :open="showConfirm"
    :title="t('cronLog.retry.btn')"
    :message="t('cronLog.retry.confirm', { jobName: log.jobName })"
    :loading="retrying"
    @confirm="handleRetry"
    @cancel="showConfirm = false"
    @close="showConfirm = false"
  />
</template>
