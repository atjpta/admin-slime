<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { InfoIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemDetailModal from '@/components/ui/modal/v-item-detail-modal.vue'
import { playerService } from '@/services/api/player.service'
import { ItemType } from '@/enums/item.enum'
import type { EquipmentSlot } from '@/enums/item.enum'
import type {
  PlayerInventory,
  InventoryItem,
  EquipmentItemMetadata,
  EquipmentInstanceMetadata,
} from '@/interfaces/player.interface'

const props = defineProps<{
  open: boolean
  slot: EquipmentSlot | null
  playerId: string
  inventory: PlayerInventory | null
}>()

const emit = defineEmits<{ close: []; equipped: [] }>()
const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

watch(
  () => props.open,
  (v) => {
    if (v) dialogRef.value?.showModal()
    else dialogRef.value?.close()
  }
)

const search = ref('')
const equippingId = ref<string | null>(null)
const detailItem = ref<InventoryItem | null>(null)

const matchingItems = computed<InventoryItem[]>(() => {
  if (!props.slot || !props.inventory) return []
  const q = search.value.trim().toLowerCase()
  return props.inventory.items.filter((inv) => {
    if (inv.item.type !== ItemType.EQUIPMENT) return false
    const meta = inv.item.metadata as EquipmentItemMetadata | undefined
    if (meta?.slot && meta.slot !== props.slot) return false
    if (q && !inv.item.code.toLowerCase().includes(q)) return false
    return true
  })
})

async function equip(inv: InventoryItem) {
  if (!props.slot) return
  equippingId.value = inv._id
  await playerService.equipItem(props.playerId, { slot: props.slot, inventoryItemId: inv._id })
  emit('equipped')
  close()
  equippingId.value = null
}

function close() {
  search.value = ''
  emit('close')
  dialogRef.value?.close()
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-lg">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-1 text-lg font-bold">{{ t('player.detail.equipTitle') }}</h3>
      <p v-if="slot" class="text-base-content/50 mb-4 text-sm">
        {{ t(`item.slot.${slot}`) }}
      </p>

      <input
        v-model="search"
        type="text"
        class="input input-bordered input-sm mb-4 w-full"
        :placeholder="t('table.search')"
      />

      <div class="max-h-80 overflow-y-auto">
        <table v-if="matchingItems.length" class="table-sm table">
          <thead>
            <tr>
              <th>{{ t('item.columns.code') }}</th>
              <th>{{ t('item.columns.rarity') }}</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in matchingItems" :key="inv._id" class="hover">
              <td class="font-mono text-sm">{{ inv.item.code }}</td>
              <td><VItemRarityBadge :value="inv.item.rarity" /></td>
              <td>
                <VButton
                  :icon="InfoIcon"
                  class="btn-ghost btn-xs text-info"
                  @click="detailItem = inv"
                />
              </td>
              <td>
                <VButton
                  class="btn-primary btn-xs"
                  :loading="equippingId === inv._id"
                  @click="equip(inv)"
                >
                  {{ t('player.detail.equip') }}
                </VButton>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-base-content/40 py-8 text-center text-sm">{{ t('table.empty') }}</p>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="close">{{ t('common.close') }}</VButton>
      </div>
    </div>
  </dialog>

  <VItemDetailModal
    :item="detailItem?.item ?? null"
    :rarity-stats="(detailItem?.metadata as EquipmentInstanceMetadata)?.rarityStats ?? null"
    @close="detailItem = null"
  />
</template>
