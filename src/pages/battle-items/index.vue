<script setup lang="ts">
import { h, ref, reactive, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VBattleItemStatusBadge from '@/components/ui/badge/v-battle-item-status-badge.vue'
import VBattleItemTypeBadge from '@/components/ui/badge/v-battle-item-type-badge.vue'
import VJsonView from '@/components/ui/json/v-json-view.vue'
import { battleItemService } from '@/services/api/battle-item.service'
import { BattleItemType, BattleItemStatus } from '@/enums/battle-item.enum'
import type { BattleItem, BattleItemFilter } from '@/interfaces/battle-item.interface'
import { formatDate } from '@/utils/format'

const { t } = useI18n()

const items = ref<BattleItem[]>([])
const total = ref(0)

const filter = reactive({
  type: '' as BattleItemType | '',
  status: '' as BattleItemStatus | '',
})

const columns = computed<ColumnDef<BattleItem>[]>(() => [
  {
    accessorKey: 'code',
    header: t('battleItem.columns.code'),
    cell: ({ row }) => row.getValue('code') ?? '-',
    meta: { minWidth: 'w-52' },
  },
  {
    accessorKey: 'type',
    header: t('battleItem.columns.type'),
    cell: ({ row }) => h(VBattleItemTypeBadge, { value: row.getValue<BattleItemType>('type') }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'status',
    header: t('battleItem.columns.status'),
    cell: ({ row }) =>
      h(VBattleItemStatusBadge, { value: row.getValue<BattleItemStatus>('status') }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'rule',
    header: t('battleItem.columns.rule'),
    cell: ({ row }) =>
      h(VJsonView, {
        value: row.getValue('rule'),
        title: t('battleItem.columns.rule'),
      }),
    meta: { align: 'center', minWidth: 'w-24' },
  },
  {
    accessorKey: 'weight',
    header: t('battleItem.columns.weight'),
    cell: ({ row }) => row.getValue<number>('weight') ?? '-',
    meta: { align: 'center', minWidth: 'w-24' },
  },
  {
    accessorKey: 'note',
    header: t('battleItem.columns.note'),
    cell: ({ row }) =>
      h(VJsonView, {
        value: row.getValue('note'),
        title: t('battleItem.columns.note'),
      }),
    meta: { align: 'center', minWidth: 'w-24' },
  },
  {
    accessorKey: 'createdAt',
    header: t('battleItem.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    accessorKey: 'updatedAt',
    header: t('battleItem.columns.updatedAt'),
    cell: ({ row }) => formatDate(row.getValue('updatedAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
])

async function fetchBattleItems() {
  const params: BattleItemFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    type: filter.type || undefined,
    status: filter.status || undefined,
  }
  const res = await battleItemService.index(params)
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  filters: {
    type: toRef(filter, 'type'),
    status: toRef(filter, 'status'),
  },
  onFetch: fetchBattleItems,
})

const activeFilters = computed(() => !!(filter.type || filter.status))

function resetFilters() {
  filter.type = ''
  filter.status = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('battleItem.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('battleItem.subtitle') }}</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar v-model="search" :active-filters="activeFilters" @reset="resetFilters">
          <template #filters>
            <VSelectFilter
              v-model="filter.type"
              :label="t('battleItem.columns.type')"
              :enum-values="BattleItemType"
              i18n-key="battleItem.type"
            />
            <VSelectFilter
              v-model="filter.status"
              :label="t('battleItem.columns.status')"
              :enum-values="BattleItemStatus"
              i18n-key="battleItem.status"
            />
          </template>
        </VTableToolbar>

        <VTable :table="table" :loading="loading" />

        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>
</template>
