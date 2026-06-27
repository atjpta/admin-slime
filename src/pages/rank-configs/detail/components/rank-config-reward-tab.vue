<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { TierReward } from '@/interfaces/rank.interface'

defineProps<{ rewards: TierReward[] }>()
const { t } = useI18n()

function getTierLabel(tier: TierReward['tier']) {
  if (typeof tier === 'object' && tier !== null) return tier.code
  return tier
}

function getItemCode(item: any) {
  if (typeof item === 'object' && item !== null) return item.code ?? item._id
  return item
}
</script>

<template>
  <div v-if="rewards.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div
      v-for="(r, i) in rewards"
      :key="i"
      class="bg-base-100 rounded-box border-base-200 flex flex-col gap-2 border p-3 text-sm"
    >
      <p class="font-mono font-semibold">{{ getTierLabel(r.tier) }}</p>
      <div v-if="r.reward?.currency?.length" class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span v-for="(c, ci) in r.reward.currency" :key="ci" class="text-base-content/60">
          {{ t(`gacha.currency.${c.type}`) }}:
          <strong class="text-base-content">{{ c.value.toLocaleString() }}</strong>
        </span>
      </div>
      <div v-if="r.reward?.items?.length" class="flex flex-wrap gap-1.5 text-xs">
        <span
          v-for="(it, ii) in r.reward.items"
          :key="ii"
          class="bg-base-200 rounded-md px-2 py-0.5 font-mono"
        >
          {{ getItemCode(it.item) }} <span class="text-base-content/50">×{{ it.quantity }}</span>
        </span>
      </div>
      <p v-if="!r.reward?.currency?.length && !r.reward?.items?.length" class="text-base-content/30 text-xs">
        —
      </p>
    </div>
  </div>
  <p v-else class="text-base-content/40 text-sm">—</p>
</template>
