<script setup lang="ts">
import { h, ref, reactive, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VDrawTypeBadge from '@/components/ui/badge/v-draw-type-badge.vue'
import GachaHistoryRewardsModal from './components/gacha-history-rewards-modal.vue'
import { gachaService } from '@/services/api/gacha.service'
import { DrawType } from '@/enums/gacha.enum'
import type { GachaHistory, GachaHistoryFilter } from '@/interfaces/gacha.interface'
import { formatDate } from '@/utils/format'
import { RouteName } from '@/router'

const { t } = useI18n()
const router = useRouter()

const items = ref<GachaHistory[]>([])
const total = ref(0)
const selectedHistory = ref<GachaHistory | null>(null)

const filter = reactive({ drawType: '' as DrawType | '' })

const columns = computed<ColumnDef<GachaHistory>[]>(() => [
  {
    id: 'player',
    header: t('gacha.history.columns.player'),
    cell: ({ row }) =>
      h(
        'button',
        {
          class: 'link link-hover font-medium',
          onClick: () =>
            router.push({
              name: RouteName.PlayerDetail,
              params: { id: row.original.player._id },
            }),
        },
        row.original.player.name
      ),
    meta: { minWidth: 'w-36' },
  },
  {
    id: 'gacha',
    header: t('gacha.history.columns.gacha'),
    cell: ({ row }) =>
      h('span', { class: 'badge badge-outline font-mono' }, row.original.gacha.code),
    meta: { minWidth: 'w-40' },
  },
  {
    accessorKey: 'drawType',
    header: t('gacha.history.columns.drawType'),
    cell: ({ row }) => h(VDrawTypeBadge, { value: row.getValue<DrawType>('drawType') }),
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    id: 'cost',
    header: t('gacha.history.columns.cost'),
    cell: ({ row }) => {
      const { costAmount, currencyCode } = row.original
      return h(
        'span',
        { class: 'font-mono' },
        `${costAmount} ${t(`gacha.currency.${currencyCode}`)}`
      )
    },
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    id: 'rewards',
    header: t('gacha.history.columns.rewards'),
    cell: ({ row }) => {
      const count = row.original.rewards.length
      return h(
        VButton,
        {
          class: 'btn-ghost btn-sm text-primary',
          onClick: () => (selectedHistory.value = row.original),
        },
        () => t('gacha.history.rewardCount', { n: count })
      )
    },
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    accessorKey: 'createdAt',
    header: t('gacha.history.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
])

async function fetchItems() {
  const params: GachaHistoryFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    drawType: filter.drawType || undefined,
  }
  const res = await gachaService.listHistories(params)
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  filters: { drawType: toRef(filter, 'drawType') },
  onFetch: fetchItems,
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('gacha.history.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('gacha.history.subtitle') }}</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar v-model="search">
          <template #filters>
            <VSelectFilter
              v-model="filter.drawType"
              :label="t('gacha.history.columns.drawType')"
              :enum-values="DrawType"
              i18n-key="gacha.drawType"
            />
          </template>
        </VTableToolbar>
        <VTable :table="table" :loading="loading" />
        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <GachaHistoryRewardsModal :history="selectedHistory" @close="selectedHistory = null" />
</template>
