<script setup lang="ts">
import { h, ref, reactive, toRef, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { SquarePenIcon, PlusIcon, Trash2Icon, EyeIcon, CopyIcon } from '@lucide/vue'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VRankStatusBadge from '@/components/ui/badge/v-rank-status-badge.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import RankConfigFormModal from './components/rank-config-form-modal.vue'
import RankConfigCloneModal from './components/rank-config-clone-modal.vue'
import { rankConfigService } from '@/services/api/rank-config.service'
import { RankConfigStatus, RankMode } from '@/enums/rank.enum'
import type { RankConfig, RankConfigFilter } from '@/interfaces/rank.interface'
import { formatDate } from '@/utils/format'
import { toast } from '@/utils/toast'
import { RouteName } from '@/router'

const { t } = useI18n()
const router = useRouter()

const items = ref<RankConfig[]>([])
const total = ref(0)
const formModal = useTemplateRef<{ open: (item?: RankConfig) => void }>('formModal')
const cloneModal = useTemplateRef<{ open: (item: RankConfig) => void }>('cloneModal')
const deletingItem = ref<RankConfig | null>(null)
const deleteLoading = ref(false)

const filter = reactive({
  status: '' as RankConfigStatus | '',
  rankMode: '' as RankMode | '',
})

const columns = computed<ColumnDef<RankConfig>[]>(() => [
  {
    accessorKey: 'code',
    header: t('rankConfig.columns.code'),
    cell: ({ row }) => h('span', { class: 'font-mono text-sm' }, row.getValue('code')),
    meta: { minWidth: 'w-36' },
  },
  {
    accessorKey: 'rankMode',
    header: t('rankConfig.columns.rankMode'),
    cell: ({ row }) => t(`rankConfig.rankMode.${row.getValue('rankMode')}`),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'status',
    header: t('rankConfig.columns.status'),
    cell: ({ row }) =>
      h(VRankStatusBadge, {
        value: row.getValue<RankConfigStatus>('status'),
        i18nKey: 'rankConfig.status',
      }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    id: 'ruleSet',
    header: t('rankConfig.columns.initialPoint'),
    accessorFn: (row) => row.ruleSet?.initialPoint ?? '-',
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    id: 'winPoint',
    header: t('rankConfig.columns.winPoint'),
    accessorFn: (row) => row.ruleSet?.winPoint ?? '-',
    meta: { align: 'center', minWidth: 'w-24' },
  },
  {
    id: 'losePoint',
    header: t('rankConfig.columns.losePoint'),
    accessorFn: (row) => row.ruleSet?.losePoint ?? '-',
    meta: { align: 'center', minWidth: 'w-24' },
  },
  {
    id: 'autoGenerate',
    header: t('rankConfig.columns.autoGenerate'),
    accessorFn: (row) => (row.autoGenerate?.enable ? t('common.yes') : t('common.no')),
    meta: { align: 'center', minWidth: 'w-24' },
  },
  {
    accessorKey: 'createdAt',
    header: t('rankConfig.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-36' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-1' }, [
        h(VButton, {
          icon: EyeIcon,
          class: 'btn-ghost text-info',
          onClick: () => router.push({ name: RouteName.RankConfigDetail, params: { id: row.original._id } }),
        }),
        h(VButton, {
          icon: SquarePenIcon,
          class: 'btn-ghost text-primary',
          onClick: () => formModal.value?.open(row.original),
        }),
        h(VButton, {
          icon: CopyIcon,
          class: 'btn-ghost text-secondary',
          onClick: () => cloneModal.value?.open(row.original),
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
  const params: RankConfigFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
    rankMode: filter.rankMode || undefined,
  }
  const res = await rankConfigService.index(params)
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
  await rankConfigService.remove(deletingItem.value._id)
  toast.success(t('rankConfig.delete.success'))
  deletingItem.value = null
  deleteLoading.value = false
  await fetchItems()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('rankConfig.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('rankConfig.subtitle') }}</p>
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
              :label="t('rankConfig.columns.status')"
              :enum-values="RankConfigStatus"
              i18n-key="rankConfig.status"
            />
            <VSelectFilter
              v-model="filter.rankMode"
              :label="t('rankConfig.columns.rankMode')"
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

  <RankConfigFormModal ref="formModal" @saved="fetchItems" />

  <RankConfigCloneModal ref="cloneModal" @saved="fetchItems" />

  <VConfirmModal
    :open="!!deletingItem"
    :title="t('rankConfig.delete.title')"
    :message="t('rankConfig.delete.message', { code: deletingItem?.code ?? '' })"
    :loading="deleteLoading"
    @confirm="handleDelete"
    @cancel="deletingItem = null"
    @close="deletingItem = null"
  />
</template>
