<script setup lang="ts">
import { h, ref, reactive, toRef, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { SquarePenIcon, PlusIcon, Trash2Icon, EyeIcon } from '@lucide/vue'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VRankStatusBadge from '@/components/ui/badge/v-rank-status-badge.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import RankSessionFormModal from './components/rank-session-form-modal.vue'
import { rankSessionService } from '@/services/api/rank-session.service'
import { RankSessionStatus, RankMode } from '@/enums/rank.enum'
import type { RankSession, RankSessionFilter } from '@/interfaces/rank.interface'
import { formatDate, formatOnlyDate } from '@/utils/format'
import { toast } from '@/utils/toast'
import { RouteName } from '@/router'

const router = useRouter()
const { t } = useI18n()

const items = ref<RankSession[]>([])
const total = ref(0)
const formModal = useTemplateRef<{ open: (item?: RankSession) => void }>('formModal')
const deletingItem = ref<RankSession | null>(null)
const deleteLoading = ref(false)

const filter = reactive({
  status: '' as RankSessionStatus | '',
  rankMode: '' as RankMode | '',
})

const columns = computed<ColumnDef<RankSession>[]>(() => [
  {
    accessorKey: 'code',
    header: t('rankSession.columns.code'),
    cell: ({ row }) => h('span', { class: 'font-mono text-sm' }, row.getValue('code')),
    meta: { minWidth: 'w-40' },
  },
  {
    accessorKey: 'session',
    header: t('rankSession.columns.session'),
    meta: { align: 'center', minWidth: 'w-20' },
  },
  {
    accessorKey: 'rankMode',
    header: t('rankSession.columns.rankMode'),
    cell: ({ row }) => t(`rankConfig.rankMode.${row.getValue('rankMode')}`),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'status',
    header: t('rankSession.columns.status'),
    cell: ({ row }) =>
      h(VRankStatusBadge, {
        value: row.getValue<RankSessionStatus>('status'),
        i18nKey: 'rankSession.status',
      }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'startDate',
    header: t('rankSession.columns.startDate'),
    cell: ({ row }) => formatOnlyDate(row.getValue('startDate')),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'endDate',
    header: t('rankSession.columns.endDate'),
    cell: ({ row }) => formatOnlyDate(row.getValue('endDate')),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'createdAt',
    header: t('rankSession.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-28' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-1' }, [
        h(VButton, {
          icon: EyeIcon,
          class: 'btn-ghost text-info',
          onClick: () => router.push({ name: RouteName.RankSessionDetail, params: { id: row.original._id } }),
        }),
        h(VButton, {
          icon: SquarePenIcon,
          class: 'btn-ghost text-primary',
          onClick: () => formModal.value?.open(row.original),
        }),
        h(VButton, {
          icon: Trash2Icon,
          class: 'btn-ghost text-error',
          onClick: () => (deletingItem.value = row.original),
        }),
      ]),
  },
])

function resetFilters() {
  filter.status = ''
  filter.rankMode = ''
}

async function fetchItems() {
  const params: RankSessionFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
    rankMode: filter.rankMode || undefined,
  }
  const res = await rankSessionService.index(params)
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  filters: {
    status: toRef(filter, 'status'),
    rankMode: toRef(filter, 'rankMode'),
  },
  onFetch: fetchItems,
})

async function handleDelete() {
  if (!deletingItem.value) return
  deleteLoading.value = true
  await rankSessionService.remove(deletingItem.value._id)
  toast.success(t('rankSession.delete.success'))
  deletingItem.value = null
  deleteLoading.value = false
  await fetchItems()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('rankSession.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('rankSession.subtitle') }}</p>
      </div>
      <VButton :icon="PlusIcon" class="btn-primary" @click="formModal?.open()">
        <span class="hidden sm:inline">{{ t('common.create') }}</span>
      </VButton>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar
          v-model="search"
          :active-filters="!!(filter.status || filter.rankMode)"
          @reset="resetFilters"
        >
          <template #filters>
            <VSelectFilter
              v-model="filter.status"
              :label="t('rankSession.columns.status')"
              :enum-values="RankSessionStatus"
              i18n-key="rankSession.status"
            />
            <VSelectFilter
              v-model="filter.rankMode"
              :label="t('rankSession.columns.rankMode')"
              :enum-values="RankMode"
              i18n-key="rankConfig.rankMode"
            />
          </template>
        </VTableToolbar>
        <VTable :table="table" :loading="loading" />
        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <RankSessionFormModal ref="formModal" @saved="fetchItems" />

  <VConfirmModal
    :open="!!deletingItem"
    :title="t('rankSession.delete.title')"
    :message="t('rankSession.delete.message', { code: deletingItem?.code ?? '' })"
    :loading="deleteLoading"
    @confirm="handleDelete"
    @cancel="deletingItem = null"
    @close="deletingItem = null"
  />
</template>
