<script setup lang="ts">
import { computed, h, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVueTable, getCoreRowModel } from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { InfoIcon } from '@lucide/vue'
import VTable from '@/components/ui/table/v-table.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import VItemDetailModal, { type ItemForDetail, type RarityStat } from '@/components/ui/modal/v-item-detail-modal.vue'
import PlayerEquipModal from './player-equip-modal.vue'
import { playerService } from '@/services/api/player.service'
import { EquipmentSlot } from '@/enums/item.enum'
import type {
  PlayerEquipment,
  PlayerInventory,
  EquipmentSlotData,
  EquipmentInstanceMetadata,
} from '@/interfaces/player.interface'

interface EquipmentRow {
  slot: EquipmentSlot
  data: EquipmentSlotData | null
}

const props = defineProps<{
  equipment: PlayerEquipment | null
  inventory: PlayerInventory | null
  playerId: string
}>()

const emit = defineEmits<{ updated: [] }>()
const { t } = useI18n()

// --- Modals ---
const itemDetailModal = useTemplateRef<{ open: (item: ItemForDetail, stats?: RarityStat[] | null) => void }>('itemDetailModal')
const equipSlot = ref<EquipmentSlot | null>(null)
const unequipTarget = ref<EquipmentSlot | null>(null)
const unEquipping = ref(false)

function openItemDetail(data: EquipmentSlotData) {
  const meta = data.metadata as EquipmentInstanceMetadata
  itemDetailModal.value?.open(data.item, meta?.rarityStats ?? null)
}

async function confirmUnequip() {
  if (!unequipTarget.value) return
  const slot = unequipTarget.value
  unequipTarget.value = null
  unEquipping.value = true
  await playerService.unequipItem(props.playerId, slot)
  emit('updated')
  unEquipping.value = false
}

// --- Table ---
const rows = computed<EquipmentRow[]>(() =>
  Object.values(EquipmentSlot).map((slot) => ({
    slot,
    data: props.equipment?.slots.find((s) => s.slot === slot) ?? null,
  }))
)

const columns = computed<ColumnDef<EquipmentRow>[]>(() => [
  {
    accessorKey: 'slot',
    header: t('player.detail.slot'),
    cell: ({ getValue }) =>
      h(
        'span',
        { class: 'badge badge-outline font-mono text-xs' },
        t(`item.slot.${getValue<string>()}`)
      ),
  },
  {
    id: 'code',
    header: t('item.columns.code'),
    cell: ({ row }) =>
      row.original.data
        ? h('span', { class: 'font-mono text-sm' }, row.original.data.item.code)
        : h('span', { class: 'text-base-content/30 text-sm italic' }, t('player.detail.emptySlot')),
  },
  {
    id: 'rarity',
    header: t('item.columns.rarity'),
    cell: ({ row }) =>
      row.original.data ? h(VItemRarityBadge, { value: row.original.data.item.rarity }) : '-',
    meta: { align: 'center' },
  },
  {
    id: 'source',
    header: t('player.detail.source'),
    cell: ({ row }) =>
      row.original.data
        ? h(
            'span',
            { class: 'text-base-content/60 text-sm' },
            t(`item.source.${row.original.data.source}`)
          )
        : '-',
  },
  {
    id: 'metadata',
    header: t('item.columns.metadata'),
    cell: ({ row }) => {
      if (!row.original.data) return '-'
      return h(VButton, {
        icon: InfoIcon,
        class: 'btn-ghost btn-sm text-info',
        onClick: () => openItemDetail(row.original.data!),
      })
    },
    meta: { align: 'center' },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const { slot, data } = row.original
      if (data) {
        return h('div', { class: 'flex justify-center gap-1' }, [
          h(
            VButton,
            {
              class: 'btn-ghost btn-xs',
              onClick: () => (equipSlot.value = slot),
            },
            () => t('player.detail.changeEquip')
          ),
          h(
            VButton,
            {
              class: 'btn-ghost btn-xs text-error',
              loading: unEquipping.value && unequipTarget.value === null,
              onClick: () => (unequipTarget.value = slot),
            },
            () => t('player.detail.unequip')
          ),
        ])
      }
      return h(
        VButton,
        {
          class: 'btn-ghost btn-xs btn-primary',
          onClick: () => (equipSlot.value = slot),
        },
        () => t('player.detail.equip')
      )
    },
    meta: { align: 'center', minWidth: 'w-32' },
  },
])

const table = useVueTable({
  get data() {
    return rows.value
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <VTable :table="table" />

  <VItemDetailModal ref="itemDetailModal" />

  <PlayerEquipModal
    :open="!!equipSlot"
    :slot="equipSlot"
    :player-id="playerId"
    :inventory="inventory"
    @close="equipSlot = null"
    @equipped="emit('updated')"
  />

  <VConfirmModal
    :open="!!unequipTarget"
    :title="t('player.detail.unequip')"
    :message="unequipTarget ? t(`item.slot.${unequipTarget}`) : ''"
    :loading="unEquipping"
    @confirm="confirmUnequip"
    @cancel="unequipTarget = null"
  />
</template>
