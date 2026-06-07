<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemStatusBadge from '@/components/ui/badge/v-item-status-badge.vue'
import { StatType } from '@/enums/stat.enum'
import type {
  InventoryItemDef,
  EquipmentItemMetadata,
  EquipmentInstanceMetadata,
  ItemMetadataStat,
} from '@/interfaces/player.interface'

interface Props {
  open: boolean
  item: InventoryItemDef | null
  instanceMeta?: EquipmentInstanceMetadata | null
}

defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

function formatStat(s: ItemMetadataStat) {
  const val = s.type === StatType.PERCENT ? +(s.value * 100).toFixed(2) : s.value
  return `+${val}${s.type === StatType.PERCENT ? '%' : ''}`
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }" @click.self="emit('close')">
    <div class="modal-box max-w-md">
      <button class="btn btn-circle btn-ghost btn-sm absolute top-3 right-3" @click="emit('close')">
        ✕
      </button>

      <template v-if="item">
        <!-- Header -->
        <div class="mb-4">
          <p class="font-mono text-lg font-bold">{{ item.code }}</p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <VItemTypeBadge :value="item.type" />
            <VItemRarityBadge :value="item.rarity" />
            <VItemStatusBadge :value="item.status" />
          </div>
        </div>

        <!-- Base info -->
        <div class="bg-base-200 mb-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg p-3 text-sm">
          <div>
            <p class="text-base-content/50 text-xs">{{ t('item.columns.sellPrice') }}</p>
            <p class="font-medium">{{ item.sellPrice.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-base-content/50 text-xs">{{ t('item.columns.stackable') }}</p>
            <p class="font-medium">{{ item.stackable ? t('common.yes') : t('common.no') }}</p>
          </div>
        </div>

        <!-- Base stats from item definition -->
        <template v-if="(item.metadata as EquipmentItemMetadata)?.stats?.length">
          <p class="text-base-content/60 mb-2 text-xs font-semibold tracking-wider uppercase">
            {{ t('player.detail.baseStats') }}
          </p>
          <div class="mb-4 flex flex-col gap-1">
            <div
              v-for="(s, i) in (item.metadata as EquipmentItemMetadata).stats"
              :key="i"
              class="odd:bg-base-200 flex items-center justify-between rounded px-2 py-1 text-sm"
            >
              <span class="text-base-content/70">{{ t(`stat.key.${s.stat}`) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-success font-medium">{{ formatStat(s) }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Rarity/instance stats -->
        <template v-if="instanceMeta?.rarityStats?.length">
          <p class="text-base-content/60 mb-2 text-xs font-semibold tracking-wider uppercase">
            {{ t('player.detail.rarityStats') }}
          </p>
          <div class="flex flex-col gap-1">
            <div
              v-for="(s, i) in instanceMeta.rarityStats"
              :key="i"
              class="odd:bg-base-200 flex items-center justify-between rounded px-2 py-1 text-sm"
            >
              <span class="text-base-content/70">{{ t(`stat.key.${s.stat}`) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-info font-medium">{{ formatStat(s) }}</span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </dialog>
</template>
