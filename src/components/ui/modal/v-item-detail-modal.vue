<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemStatusBadge from '@/components/ui/badge/v-item-status-badge.vue'
import { ItemType } from '@/enums/item.enum'
import { StatType } from '@/enums/stat.enum'
import type { ItemEquipmentMetadata } from '@/interfaces/item.interface'
import type { ItemType as ItemTypeEnum, ItemRarity, ItemStatus } from '@/enums/item.enum'

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

const props = defineProps<{
  item: ItemForDetail | null
  rarityStats?: RarityStat[] | null
}>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

const equipMeta = computed<ItemEquipmentMetadata | null>(() => {
  if (props.item?.type !== ItemType.EQUIPMENT) return null
  const m = props.item.metadata as ItemEquipmentMetadata
  return m?.slot ? m : null
})

function displayValue(value: number, type: string): string {
  if (type === StatType.PERCENT) return `+${+(value * 100).toFixed(2)}%`
  return `+${value.toLocaleString()}`
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': !!item }">
    <div class="modal-box max-w-md">
      <VButton
        class="btn btn-ghost btn-sm btn-circle absolute top-3 right-3"
        @click="emit('close')"
      >
        ✕
      </VButton>

      <template v-if="item">
        <!-- Header -->
        <div class="mb-4">
          <p class="font-mono text-lg font-bold">{{ item.code }}</p>
          <div class="mt-1.5 flex flex-wrap items-center gap-2">
            <VItemTypeBadge :value="item.type" />
            <VItemRarityBadge :value="item.rarity" />
            <VItemStatusBadge :value="item.status" />
          </div>
        </div>

        <!-- Info grid (sellPrice / stackable) -->
        <div
          v-if="item.sellPrice !== undefined || item.stackable !== undefined"
          class="bg-base-200 mb-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg p-3 text-sm"
        >
          <div v-if="item.sellPrice !== undefined">
            <p class="text-base-content/50 text-xs">{{ t('item.columns.sellPrice') }}</p>
            <p class="font-medium">{{ item.sellPrice.toLocaleString() }}</p>
          </div>
          <div v-if="item.stackable !== undefined">
            <p class="text-base-content/50 text-xs">{{ t('item.columns.stackable') }}</p>
            <p class="font-medium">{{ item.stackable ? t('common.yes') : t('common.no') }}</p>
          </div>
        </div>

        <!-- Equipment metadata -->
        <template v-if="equipMeta">
          <div class="flex flex-col gap-4">
            <!-- Slot -->
            <div class="bg-base-200 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
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
                  displayValue(s.value, s.type)
                }}</span>
              </div>
            </div>

            <!-- Rarity stats (instance-specific) -->
            <div v-if="rarityStats?.length" class="flex flex-col gap-2">
              <p class="text-base-content/50 text-xs font-medium tracking-wider uppercase">
                {{ t('player.detail.rarityStats') }}
              </p>
              <div
                v-for="(s, i) in rarityStats"
                :key="i"
                class="bg-base-200 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
              >
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ t(`stat.key.${s.stat}`) }}</span>
                  <span class="badge badge-ghost badge-xs">{{ t(`stat.type.${s.type}`) }}</span>
                </div>
                <span class="text-info font-bold tabular-nums">{{
                  displayValue(s.value, s.type)
                }}</span>
              </div>
            </div>
          </div>
        </template>

        <p v-else class="text-base-content/40 text-sm">{{ t('common.noData') }}</p>
      </template>
    </div>
  </dialog>
</template>
