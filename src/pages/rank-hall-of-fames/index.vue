<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import { rankHallOfFameService } from '@/services/api/rank-hall-of-fame.service'
import type { RankHallOfFame, RankSession } from '@/interfaces/rank.interface'
import { formatDate } from '@/utils/format'

const { t } = useI18n()

const items = ref<RankHallOfFame[]>([])
const total = ref(0)

function getSessionCode(session: RankHallOfFame['rankSession']) {
  if (typeof session === 'object' && session !== null) {
    return (session as RankSession).code ?? '-'
  }
  return typeof session === 'string' ? h('span', { class: 'font-mono text-xs' }, session) : '-'
}

function getPlayerName(rank: string | null) {
  if (!rank) return '-'
  return h('span', { class: 'font-mono text-xs text-base-content/70' }, rank)
}

const columns = computed<ColumnDef<RankHallOfFame>[]>(() => [
  {
    accessorKey: 'rankSession',
    header: t('rankHallOfFame.columns.rankSession'),
    cell: ({ row }) => getSessionCode(row.getValue('rankSession')),
    meta: { minWidth: 'w-48' },
  },
  {
    accessorKey: 'rank1',
    header: t('rankHallOfFame.columns.rank1'),
    cell: ({ row }) => getPlayerName(row.getValue('rank1')),
    meta: { align: 'center', minWidth: 'w-36' },
  },
  {
    accessorKey: 'rank2',
    header: t('rankHallOfFame.columns.rank2'),
    cell: ({ row }) => getPlayerName(row.getValue('rank2')),
    meta: { align: 'center', minWidth: 'w-36' },
  },
  {
    accessorKey: 'rank3',
    header: t('rankHallOfFame.columns.rank3'),
    cell: ({ row }) => getPlayerName(row.getValue('rank3')),
    meta: { align: 'center', minWidth: 'w-36' },
  },
  {
    accessorKey: 'createdAt',
    header: t('rankHallOfFame.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
])

async function fetchItems() {
  const res = await rankHallOfFameService.index({
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
  })
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  onFetch: fetchItems,
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('rankHallOfFame.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('rankHallOfFame.subtitle') }}</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar v-model="search" />
        <VTable :table="table" :loading="loading" />
        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>
</template>
