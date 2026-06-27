<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { RefreshCwIcon } from '@lucide/vue'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import VCronStatusBadge from '@/components/ui/badge/v-cron-status-badge.vue'
import VBadge from '@/components/ui/badge/v-badge.vue'
import VJsonView from '@/components/ui/json/v-json-view.vue'
import { cronLogService } from '@/services/api/cron-log.service'
import type { CronLog } from '@/interfaces/cron-log.interface'
import { formatDate } from '@/utils/format'

const emit = defineEmits<{ close: []; retried: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const currentLog = ref<CronLog | null>(null)
const retrying = ref(false)

defineExpose({ open })

function open(log: CronLog) {
  currentLog.value = log
  dialogRef.value?.showModal()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}

async function handleRetry() {
  if (!currentLog.value) return
  retrying.value = true
  await cronLogService.retry(currentLog.value._id)
  toast.success(t('cronLog.retry.success'))
  retrying.value = false
  emit('retried')
  close()
}

function getParentLogId(parentLogId: CronLog['parentLogId']): string | null {
  if (!parentLogId) return null
  if (typeof parentLogId === 'string') return parentLogId
  return (parentLogId as CronLog)._id
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-2xl">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('cronLog.detail.title') }}</h3>

      <div class="-mx-6 max-h-[65dvh] overflow-y-auto px-6">
        <div class="flex flex-col gap-4" v-if="currentLog">
          <!-- Meta info -->
          <div class="bg-base-200 grid grid-cols-2 gap-3 rounded-xl p-3 text-sm sm:grid-cols-3">
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('cronLog.columns.jobName') }}</span>
              <span class="font-mono font-medium">{{ currentLog.jobName }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('cronLog.columns.status') }}</span>
              <VCronStatusBadge :value="currentLog.status" class="w-fit" />
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('cronLog.columns.triggeredBy') }}</span>
              <VBadge :value="currentLog.triggeredBy" i18n-key="cronLog.triggeredBy" class="w-fit" />
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('cronLog.detail.startedAt') }}</span>
              <span>{{ formatDate(currentLog.startedAt) }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('cronLog.detail.finishedAt') }}</span>
              <span>{{ currentLog.finishedAt ? formatDate(currentLog.finishedAt) : '-' }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('cronLog.detail.duration') }}</span>
              <span>{{ currentLog.durationMs != null ? `${currentLog.durationMs.toLocaleString()} ms` : '-' }}</span>
            </div>
          </div>

          <!-- parentLogId -->
          <div v-if="getParentLogId(currentLog.parentLogId)" class="flex flex-col gap-0.5 text-sm">
            <span class="text-base-content/50 text-xs">{{ t('cronLog.detail.parentLog') }}</span>
            <span class="font-mono text-xs">{{ getParentLogId(currentLog.parentLogId) }}</span>
          </div>

          <!-- params -->
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium">{{ t('cronLog.detail.params') }}</span>
            <VJsonView :value="currentLog.params" :title="t('cronLog.detail.params')" />
          </div>

          <!-- result -->
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium">{{ t('cronLog.detail.result') }}</span>
            <VJsonView :value="currentLog.result" :title="t('cronLog.detail.result')" />
          </div>

          <!-- error -->
          <div v-if="currentLog.error" class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-error">{{ t('cronLog.detail.error') }}</span>
            <pre class="bg-error/10 text-error rounded-lg p-3 text-xs whitespace-pre-wrap break-all">{{ currentLog.error }}</pre>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="close">{{ t('common.close') }}</VButton>
        <VButton :icon="RefreshCwIcon" class="btn-warning" :loading="retrying" @click="handleRetry">
          {{ t('cronLog.retry.btn') }}
        </VButton>
      </div>
    </div>
  </dialog>
</template>
