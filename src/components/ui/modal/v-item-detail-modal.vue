<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemStatusBadge from '@/components/ui/badge/v-item-status-badge.vue'
import { ItemType } from '@/enums/item.enum'
import { displayStatValue } from '@/utils/format'
import type { ItemEquipmentMetadata } from '@/interfaces/item.interface'
import type { ItemType as ItemTypeEnum, ItemRarity, ItemStatus } from '@/enums/item.enum'
import VButton from '@/components/ui/btn/v-button.vue'

export interface ItemForDetail {
  code: string
  type: ItemTypeEnum
  rarity: ItemRarity
  status: ItemStatus
  sellPrice?: number
  stackable?: boolean
  metadata: ItemEquipmentMetadata | Record<string, unknown>
}

export interface RarityStat {
  stat: string
  type: string
  value: number
}

const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const currentItem = ref<ItemForDetail | null>(null)
const currentRarityStats = ref<RarityStat[] | null>(null)

defineExpose({ open })

function open(item: ItemForDetail, rarityStats?: RarityStat[] | null) {
  currentItem.value = item
  currentRarityStats.value = rarityStats ?? null
  dialogRef.value?.showModal()
}

const equipMeta = computed<ItemEquipmentMetadata | null>(() => {
  if (currentItem.value?.type !== ItemType.EQUIPMENT) return null
  const m = currentItem.value.metadata as ItemEquipmentMetadata
  return m?.slot ? m : null
})

function closeModal() {
  dialogRef.value?.close()
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-md">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="closeModal"> ✕ </VButton>
      </div>
      <template v-if="currentItem">
        <!-- Header -->
        <div class="mb-4">
          <p class="font-mono text-lg font-bold">{{ currentItem.code }}</p>
          <div class="mt-1.5 flex flex-wrap items-center gap-2">
            <VItemTypeBadge :value="currentItem.type" />
            <VItemRarityBadge :value="currentItem.rarity" />
            <VItemStatusBadge :value="currentItem.status" />
          </div>
        </div>

        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <!-- Info grid (sellPrice / stackable) -->
          <div
            v-if="currentItem.sellPrice !== undefined || currentItem.stackable !== undefined"
            class="bg-base-200 mb-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg p-3 text-sm"
          >
            <div v-if="currentItem.sellPrice !== undefined">
              <p class="text-base-content/50 text-xs">{{ t('item.columns.sellPrice') }}</p>
              <p class="font-medium">{{ currentItem.sellPrice.toLocaleString() }}</p>
            </div>
            <div v-if="currentItem.stackable !== undefined">
              <p class="text-base-content/50 text-xs">{{ t('item.columns.stackable') }}</p>
              <p class="font-medium">{{ currentItem.stackable ? t('common.yes') : t('common.no') }}</p>
            </div>
          </div>

          <!-- Equipment metadata -->
          <template v-if="equipMeta">
            <div class="flex flex-col gap-4">
              <!-- Slot -->
              <div
                class="bg-base-200 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
              >
                <span class="text-base-content/50">{{ t('item.columns.metadata') }}</span>
                <span class="font-semibold">{{ t(`item.slot.${equipMeta.slot}`) }}</span>
              </div>

              <!-- Base stats -->
              <div v-if="equipMeta.stats?.length" class="flex flex-col gap-2">
                <p class="text-base-content/50 text-xs font-medium tracking-wider uppercase">
                  {{ t('player.detail.baseStats') }}
                </p>
                <div
                  v-for="(s, i) in equipMeta.stats"
                  :key="i"
                  class="bg-base-200 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ t(`stat.key.${s.stat}`) }}</span>
                    <span class="badge badge-ghost badge-xs">{{ t(`stat.type.${s.type}`) }}</span>
                  </div>
                  <span class="text-success font-bold tabular-nums">{{
                    displayStatValue(s.value, s.type)
                  }}</span>
                </div>
              </div>

              <!-- Rarity stats (instance-specific) -->
              <div v-if="currentRarityStats?.length" class="flex flex-col gap-2">
                <p class="text-base-content/50 text-xs font-medium tracking-wider uppercase">
                  {{ t('player.detail.rarityStats') }}
                </p>
                <div
                  v-for="(s, i) in currentRarityStats"
                  :key="i"
                  class="bg-base-200 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ t(`stat.key.${s.stat}`) }}</span>
                    <span class="badge badge-ghost badge-xs">{{ t(`stat.type.${s.type}`) }}</span>
                  </div>
                  <span class="text-info font-bold tabular-nums">{{
                    displayStatValue(s.value, s.type)
                  }}</span>
                </div>
              </div>
            </div>
          </template>

          <p v-else class="text-base-content/40 text-sm">{{ t('common.noData') }}</p>
        </div>
      </template>
    </div>
  </dialog>
</template>
