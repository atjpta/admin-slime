<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVueTable, getCoreRowModel } from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { InfoIcon, Trash2Icon } from '@lucide/vue'
import VTable from '@/components/ui/table/v-table.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemDetailModal from '@/components/ui/modal/v-item-detail-modal.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import { ItemType, ItemRarity, ItemSource } from '@/enums/item.enum'
import { playerService } from '@/services/api/player.service'
import type {
  InventoryItem,
  PlayerInventory,
  InventoryItemDef,
  EquipmentInstanceMetadata,
} from '@/interfaces/player.interface'

interface ModalState {
  item: InventoryItemDef
  instanceMeta: EquipmentInstanceMetadata | null
}

const props = defineProps<{ inventory: PlayerInventory | null; playerId: string }>()
const emit = defineEmits<{ removed: [] }>()
const { t } = useI18n()

const modal = ref<ModalState | null>(null)
const confirmTarget = ref<InventoryItem | null>(null)
const removingId = ref<string | null>(null)

async function confirmRemove() {
  const inv = confirmTarget.value
  if (!inv) return
  confirmTarget.value = null
  removingId.value = inv._id
  await playerService.removeInventoryItem(props.playerId, inv._id)
  emit('removed')
  removingId.value = null
}

// --- Filters ---
const search = ref('')
const filterType = ref<ItemType | ''>('')
const filterRarity = ref<ItemRarity | ''>('')
const filterSource = ref<ItemSource | ''>('')
const page = ref(1)
const pageSize = ref(20)

watch([search, filterType, filterRarity, filterSource], () => {
  page.value = 1
})

const filteredItems = computed(() => {
  const items = props.inventory?.items ?? []
  const q = search.value.trim().toLowerCase()
  return items.filter((inv) => {
    if (q && !inv.item.code.toLowerCase().includes(q)) return false
    if (filterType.value && inv.item.type !== filterType.value) return false
    if (filterRarity.value && inv.item.rarity !== filterRarity.value) return false
    if (filterSource.value && inv.source !== filterSource.value) return false
    return true
  })
})

const total = computed(() => filteredItems.value.length)

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredItems.value.slice(start, start + pageSize.value)
})

// --- Columns ---
const columns = computed<ColumnDef<InventoryItem>[]>(() => [
  {
    accessorKey: 'orderIndex',
    header: t('player.detail.orderIndex'),
    cell: ({ getValue }) =>
      h('span', { class: 'text-base-content/50 tabular-nums' }, getValue<number>()),
    meta: { align: 'center', minWidth: 'w-14' },
  },
  {
    id: 'code',
    header: t('item.columns.code'),
    cell: ({ row }) => h('span', { class: 'font-mono text-sm' }, row.original.item.code),
  },
  {
    id: 'type',
    header: t('item.columns.type'),
    cell: ({ row }) => h(VItemTypeBadge, { value: row.original.item.type }),
  },
  {
    id: 'rarity',
    header: t('item.columns.rarity'),
    cell: ({ row }) => h(VItemRarityBadge, { value: row.original.item.rarity }),
  },
  {
    accessorKey: 'quantity',
    header: t('player.detail.quantity'),
    cell: ({ getValue }) => h('span', { class: 'font-medium' }, getValue<number>()),
    meta: { align: 'center' },
  },
  {
    accessorKey: 'source',
    header: t('player.detail.source'),
    cell: ({ getValue }) =>
      h('span', { class: 'text-base-content/60 text-sm' }, t(`item.source.${getValue<string>()}`)),
  },
  {
    id: 'metadata',
    header: t('item.columns.metadata'),
    cell: ({ row }) =>
      h(VButton, {
        icon: InfoIcon,
        class: 'btn-ghost btn-sm text-info',
        onClick: () => {
          modal.value = {
            item: row.original.item,
            instanceMeta: row.original.metadata as EquipmentInstanceMetadata,
          }
        },
      }),
    meta: { align: 'center' },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h(VButton, {
        icon: Trash2Icon,
        class: 'btn-ghost btn-sm text-error',
        loading: removingId.value === row.original._id,
        onClick: () => (confirmTarget.value = row.original),
      }),
    meta: { align: 'center', minWidth: 'w-16' },
  },
])

const table = useVueTable({
  get data() {
    return pagedItems.value
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <VTableToolbar
    v-model="search"
    class="mb-3"
    :active-filters="!!filterType || !!filterRarity || !!filterSource"
    @reset="
      () => {
        filterType = ''
        filterRarity = ''
        filterSource = ''
      }
    "
  >
    <template #filters>
      <VSelectFilter
        v-model="filterType"
        :label="t('item.columns.type')"
        :enum-values="ItemType"
        i18n-key="item.type"
      />
      <VSelectFilter
        v-model="filterRarity"
        :label="t('item.columns.rarity')"
        :enum-values="ItemRarity"
        i18n-key="item.rarity"
      />
      <VSelectFilter
        v-model="filterSource"
        :label="t('player.detail.source')"
        :enum-values="ItemSource"
        i18n-key="item.source"
      />
    </template>
  </VTableToolbar>

  <VTable :table="table" />
  <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" class="mt-3" />

  <VItemDetailModal
    :item="modal?.item ?? null"
    :rarity-stats="modal?.instanceMeta?.rarityStats ?? null"
    @close="modal = null"
  />
  <VConfirmModal
    :open="!!confirmTarget"
    :title="t('player.detail.removeConfirm')"
    :message="confirmTarget ? `&quot;${confirmTarget.item.code}&quot;` : ''"
    :loading="!!removingId"
    @confirm="confirmRemove"
    @cancel="confirmTarget = null"
  />
</template>
