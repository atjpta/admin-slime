<script setup lang="ts">
import { h, ref, reactive, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemStatusBadge from '@/components/ui/badge/v-item-status-badge.vue'
import VJsonView from '@/components/ui/json/v-json-view.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import ItemEquipmentModal from './components/item-equipment-modal.vue'
import ItemInfoEditModal from './components/item-info-edit-modal.vue'
import { itemService } from '@/services/api/item.service'
import { ItemType, ItemRarity, ItemStatus } from '@/enums/item.enum'
import type { Item, ItemFilter } from '@/interfaces/item.interface'
import { formatDate } from '@/utils/format'
import { CheckIcon, MinusIcon, InfoIcon, SquarePenIcon } from '@lucide/vue'

const { t } = useI18n()

const items = ref<Item[]>([])
const total = ref(0)
const selectedEquipment = ref<Item | null>(null)
const itemEquipmentModalRef = ref<InstanceType<typeof ItemEquipmentModal>>()
const selectedItem = ref<Item | null>(null)
const infoEditModalRef = ref<InstanceType<typeof ItemInfoEditModal>>()

function openEquipmentModal(item: Item) {
  selectedEquipment.value = item
  itemEquipmentModalRef.value?.open()
}

function openInfoEditModal(item: Item) {
  selectedItem.value = item
  infoEditModalRef.value?.open()
}

async function onEquipmentUpdated() {
  await fetchItems()
  selectedEquipment.value =
    items.value.find((i) => i._id === selectedEquipment.value?._id) ?? selectedEquipment.value
}

const filter = reactive({
  type: '' as ItemType | '',
  rarity: '' as ItemRarity | '',
  status: '' as ItemStatus | '',
})

const columns = computed<ColumnDef<Item>[]>(() => [
  {
    accessorKey: 'code',
    header: t('item.columns.code'),
    cell: ({ row }) => row.getValue('code') ?? '-',
    meta: { minWidth: 'w-52' },
  },
  {
    accessorKey: 'type',
    header: t('item.columns.type'),
    cell: ({ row }) => h(VItemTypeBadge, { value: row.getValue<ItemType>('type') }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'rarity',
    header: t('item.columns.rarity'),
    cell: ({ row }) => h(VItemRarityBadge, { value: row.getValue<ItemRarity>('rarity') }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'status',
    header: t('item.columns.status'),
    cell: ({ row }) => h(VItemStatusBadge, { value: row.getValue<ItemStatus>('status') }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'sellPrice',
    header: t('item.columns.sellPrice'),
    cell: ({ row }) => row.getValue<number>('sellPrice')?.toLocaleString() ?? '-',
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    accessorKey: 'stackable',
    header: t('item.columns.stackable'),
    cell: ({ row }) =>
      row.getValue('stackable')
        ? h(CheckIcon, { class: 'text-success mx-auto size-4' })
        : h(MinusIcon, { class: 'text-base-content/30 mx-auto size-4' }),
    meta: { align: 'center', minWidth: 'w-24' },
  },
  {
    accessorKey: 'metadata',
    header: t('item.columns.metadata'),
    cell: ({ row }) => {
      const item = row.original
      if (item.type === ItemType.EQUIPMENT) {
        return h('div', { class: 'flex justify-center gap-1' }, [
          h(VButton, {
            icon: InfoIcon,
            class: 'btn-ghost btn-sm text-info',
            title: t('item.equipment.tabs.stats'),
            onClick: () => openEquipmentModal(item),
          }),
        ])
      }
      return h(VJsonView, {
        value: row.getValue('metadata'),
        title: t('item.columns.metadata'),
      })
    },
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    accessorKey: 'createdAt',
    header: t('item.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    accessorKey: 'updatedAt',
    header: t('item.columns.updatedAt'),
    cell: ({ row }) => formatDate(row.getValue('updatedAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-16' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-1' }, [
        h(VButton, {
          icon: SquarePenIcon,
          class: 'btn-ghost text-primary',
          onClick: () => openInfoEditModal(row.original),
        }),
      ]),
  },
])

async function fetchItems() {
  const params: ItemFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    type: filter.type || undefined,
    rarity: filter.rarity || undefined,
    status: filter.status || undefined,
  }
  const res = await itemService.index(params)
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  filters: {
    type: toRef(filter, 'type'),
    rarity: toRef(filter, 'rarity'),
    status: toRef(filter, 'status'),
  },
  onFetch: fetchItems,
})

const activeFilters = computed(() => !!(filter.type || filter.rarity || filter.status))

function resetFilters() {
  filter.type = ''
  filter.rarity = ''
  filter.status = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('item.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('item.subtitle') }}</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar v-model="search" :active-filters="activeFilters" @reset="resetFilters">
          <template #filters>
            <VSelectFilter
              v-model="filter.type"
              :label="t('item.columns.type')"
              :enum-values="ItemType"
              i18n-key="item.type"
            />
            <VSelectFilter
              v-model="filter.rarity"
              :label="t('item.columns.rarity')"
              :enum-values="ItemRarity"
              i18n-key="item.rarity"
            />
            <VSelectFilter
              v-model="filter.status"
              :label="t('item.columns.status')"
              :enum-values="ItemStatus"
              i18n-key="item.status"
            />
          </template>
        </VTableToolbar>

        <VTable :table="table" :loading="loading" />

        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <ItemEquipmentModal
    ref="itemEquipmentModalRef"
    :item="selectedEquipment"
    @updated="onEquipmentUpdated"
  />
  <ItemInfoEditModal ref="infoEditModalRef" :item="selectedItem" @saved="fetchItems" />
</template>
