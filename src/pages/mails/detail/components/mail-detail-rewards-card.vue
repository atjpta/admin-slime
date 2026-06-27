<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { CoinsIcon, PackageIcon } from '@lucide/vue'
import { ItemRarity } from '@/enums/item.enum'

import VItemDetailModal, { type ItemForDetail, type RarityStat } from '@/components/ui/modal/v-item-detail-modal.vue'
import type { MailDetail, PopulatedItemReward } from '@/interfaces/mail.interface'

defineProps<{ mail: MailDetail }>()
const { t } = useI18n()

const itemDetailModal = useTemplateRef<{ open: (item: ItemForDetail, stats?: RarityStat[] | null) => void }>('itemDetailModal')

const rarityClass: Record<string, string> = {
  [ItemRarity.COMMON]: 'badge-ghost',
  [ItemRarity.RARE]: 'badge-info',
  [ItemRarity.EPIC]: 'badge-secondary',
  [ItemRarity.LEGENDARY]: 'badge-warning',
}

function getRarityStats(metadata: Record<string, unknown>): RarityStat[] {
  return (metadata?.rarityStats as RarityStat[]) ?? []
}

function openRewardDetail(reward: PopulatedItemReward) {
  itemDetailModal.value?.open(reward.item, getRarityStats(reward.metadata ?? {}))
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p
      v-if="!mail.rewards.currency.length && !mail.rewards.items.length"
      class="text-base-content/40 text-sm"
    >
      {{ t('mail.detail.noRewards') }}
    </p>

    <template v-else>
      <!-- Currency -->
      <div v-if="mail.rewards.currency.length">
        <div
          class="text-base-content/50 mb-2 flex items-center gap-1.5 text-xs font-medium uppercase"
        >
          <CoinsIcon class="size-3.5" />
          {{ t('mail.detail.rewardsCurrency') }}
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(cur, i) in mail.rewards.currency"
            :key="i"
            class="bg-base-200 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <span class="font-semibold">{{ t(`gacha.currency.${cur.type}`) }}</span>
            <span class="badge badge-sm badge-outline">×{{ cur.value }}</span>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div v-if="mail.rewards.items.length">
        <div
          class="text-base-content/50 mb-2 flex items-center gap-1.5 text-xs font-medium uppercase"
        >
          <PackageIcon class="size-3.5" />
          {{ t('mail.detail.rewardsItems') }}
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="(reward, i) in mail.rewards.items" :key="i" class="bg-base-200/70 rounded-lg">
            <div
              class="hover:bg-base-200 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
              @click="openRewardDetail(reward)"
            >
              <div class="bg-base-300 flex size-8 shrink-0 items-center justify-center rounded-md">
                <PackageIcon class="text-base-content/50 size-4" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold">{{ reward.item.code }}</p>
                <div class="mt-0.5 flex items-center gap-1.5">
                  <span class="text-base-content/50 text-xs">
                    {{ t(`item.type.${reward.item.type}`) }}
                  </span>
                  <span class="text-base-content/30 text-xs">·</span>
                  <span
                    class="badge badge-xs"
                    :class="rarityClass[reward.item.rarity] ?? 'badge-ghost'"
                  >
                    {{ t(`item.rarity.${reward.item.rarity}`) }}
                  </span>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-sm font-bold">×{{ reward.quantity }}</p>
                <p class="text-base-content/50 text-xs">{{ t(`item.source.${reward.source}`) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <VItemDetailModal ref="itemDetailModal" />
</template>
