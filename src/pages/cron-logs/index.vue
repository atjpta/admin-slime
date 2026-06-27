<script setup lang="ts">
import { h, ref, reactive, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { EyeIcon, RefreshCwIcon } from '@lucide/vue'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VCronStatusBadge from '@/components/ui/badge/v-cron-status-badge.vue'
import VCronTriggerBadge from '@/components/ui/badge/v-cron-trigger-badge.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import { cronLogService } from '@/services/api/cron-log.service'
import { CronJobStatus, CronTriggerSource } from '@/enums/cron-log.enum'
import type { CronLog, CronLogFilter } from '@/interfaces/cron-log.interface'
import { formatDate } from '@/utils/format'
import { toast } from '@/utils/toast'
import { RouteName } from '@/router'

const router = useRouter()
const { t } = useI18n()

const items = ref<CronLog[]>([])
const total = ref(0)
const retryingId = ref<string | null>(null)
const confirmRetryLog = ref<CronLog | null>(null)

const filter = reactive({
  status: '' as CronJobStatus | '',
  triggeredBy: '' as CronTriggerSource | '',
})

const columns = computed<ColumnDef<CronLog>[]>(() => [
  {
    accessorKey: 'jobName',
    header: t('cronLog.columns.jobName'),
    cell: ({ row }) => h('span', { class: 'font-mono text-sm' }, row.getValue('jobName')),
    meta: { minWidth: 'w-52' },
  },
  {
    accessorKey: 'status',
    header: t('cronLog.columns.status'),
    cell: ({ row }) => h(VCronStatusBadge, { value: row.getValue<CronJobStatus>('status') }),
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    accessorKey: 'triggeredBy',
    header: t('cronLog.columns.triggeredBy'),
    cell: ({ row }) => h(VCronTriggerBadge, { value: row.getValue<CronTriggerSource>('triggeredBy') }),
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    accessorKey: 'startedAt',
    header: t('cronLog.columns.startedAt'),
    cell: ({ row }) => formatDate(row.getValue('startedAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    accessorKey: 'durationMs',
    header: t('cronLog.columns.durationMs'),
    cell: ({ row }) => {
      const ms = row.getValue<number | null>('durationMs')
      return ms != null ? `${ms.toLocaleString()} ms` : '-'
    },
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    accessorKey: 'createdAt',
    header: t('cronLog.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-24' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-1' }, [
        h(VButton, {
          icon: EyeIcon,
          class: 'btn-ghost text-info',
          onClick: () => router.push({ name: RouteName.CronLogDetail, params: { id: row.original._id } }),
        }),
        h(VButton, {
          icon: RefreshCwIcon,
          class: 'btn-ghost text-warning',
          loading: retryingId.value === row.original._id,
          onClick: () => (confirmRetryLog.value = row.original),
        }),
      ]),
  },
])

async function handleRetry() {
  if (!confirmRetryLog.value) return
  const id = confirmRetryLog.value._id
  retryingId.value = id
  confirmRetryLog.value = null
  await cronLogService.retry(id)
  toast.success(t('cronLog.retry.success'))
  retryingId.value = null
  await fetchItems()
}

function resetFilters() {
  filter.status = ''
  filter.triggeredBy = ''
}

async function fetchItems() {
  const params: CronLogFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
    triggeredBy: filter.triggeredBy || undefined,
  }
  const res = await cronLogService.index(params)
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  filters: {
    status: toRef(filter, 'status'),
    triggeredBy: toRef(filter, 'triggeredBy'),
  },
  onFetch: fetchItems,
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('cronLog.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('cronLog.subtitle') }}</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar
          v-model="search"
          :active-filters="!!(filter.status || filter.triggeredBy)"
          @reset="resetFilters"
        >
          <template #filters>
            <VSelectFilter
              v-model="filter.status"
              :label="t('cronLog.columns.status')"
              :enum-values="CronJobStatus"
              i18n-key="cronLog.status"
            />
            <VSelectFilter
              v-model="filter.triggeredBy"
              :label="t('cronLog.columns.triggeredBy')"
              :enum-values="CronTriggerSource"
              i18n-key="cronLog.triggeredBy"
            />
          </template>
        </VTableToolbar>
        <VTable :table="table" :loading="loading" />
        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <VConfirmModal
    :open="!!confirmRetryLog"
    :title="t('cronLog.retry.btn')"
    :message="t('cronLog.retry.confirm', { jobName: confirmRetryLog?.jobName ?? '' })"
    :loading="!!retryingId"
    @confirm="handleRetry"
    @cancel="confirmRetryLog = null"
    @close="confirmRetryLog = null"
  />
</template>
