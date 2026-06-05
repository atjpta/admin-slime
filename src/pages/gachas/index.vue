<script setup lang="ts">
import { h, ref, reactive, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { SquarePenIcon, EyeIcon, PlusIcon } from '@lucide/vue'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VGachaStatusBadge from '@/components/ui/badge/v-gacha-status-badge.vue'
import GachaEditModal from './components/gacha-edit-modal.vue'
import GachaCreateModal from './components/gacha-create-modal.vue'
import { gachaService } from '@/services/api/gacha.service'
import { GachaStatus } from '@/enums/gacha.enum'
import type { Gacha, GachaFilter } from '@/interfaces/gacha.interface'
import { formatDate } from '@/utils/format'
import { RouteName } from '@/router'

const { t } = useI18n()
const router = useRouter()

const items = ref<Gacha[]>([])
const total = ref(0)
const editingItem = ref<Gacha | null>(null)
const showCreateModal = ref(false)

const filter = reactive({ status: '' as GachaStatus | '' })

const columns = computed<ColumnDef<Gacha>[]>(() => [
  {
    accessorKey: 'code',
    header: t('gacha.columns.code'),
    cell: ({ row }) => row.getValue('code') ?? '-',
    meta: { minWidth: 'w-48' },
  },
  {
    accessorKey: 'type',
    header: t('gacha.columns.type'),
    cell: ({ row }) =>
      h('span', { class: 'badge badge-outline' }, t(`gacha.type.${row.getValue('type')}`)),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'status',
    header: t('gacha.columns.status'),
    cell: ({ row }) => h(VGachaStatusBadge, { value: row.getValue<GachaStatus>('status') }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'sortOrder',
    header: t('gacha.columns.sortOrder'),
    cell: ({ row }) => row.getValue<number>('sortOrder') ?? 0,
    meta: { align: 'center', minWidth: 'w-24' },
  },
  {
    accessorKey: 'startAt',
    header: t('gacha.columns.startAt'),
    cell: ({ row }) => formatDate(row.getValue('startAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    accessorKey: 'endAt',
    header: t('gacha.columns.endAt'),
    cell: ({ row }) => formatDate(row.getValue('endAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    accessorKey: 'createdAt',
    header: t('gacha.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-1' }, [
        h(VButton, {
          icon: EyeIcon,
          class: 'btn-ghost text-info',
          onClick: () => router.push({ name: RouteName.GachaDetail, params: { id: row.original._id } }),
        }),
        h(VButton, {
          icon: SquarePenIcon,
          class: 'btn-ghost text-primary',
          onClick: () => (editingItem.value = row.original),
        }),
      ]),
  },
])

async function fetchItems() {
  const params: GachaFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
  }
  const res = await gachaService.index(params)
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  filters: { status: toRef(filter, 'status') },
  onFetch: fetchItems,
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('gacha.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('gacha.subtitle') }}</p>
      </div>
      <VButton :icon="PlusIcon" class="btn-primary btn-sm" @click="showCreateModal = true">
        <span class="hidden sm:inline">{{ t('common.create') }}</span>
      </VButton>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar v-model="search">
          <template #filters>
            <VSelectFilter
              v-model="filter.status"
              :label="t('gacha.columns.status')"
              :enum-values="GachaStatus"
              i18n-key="gacha.status"
            />
          </template>
        </VTableToolbar>
        <VTable :table="table" :loading="loading" />
        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <GachaEditModal :gacha="editingItem" @close="editingItem = null" @updated="fetchItems" />
  <GachaCreateModal :open="showCreateModal" @close="showCreateModal = false" @created="fetchItems" />
</template>
