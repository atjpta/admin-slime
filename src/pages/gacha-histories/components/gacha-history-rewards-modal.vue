<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import VButton from '@/components/ui/btn/v-button.vue'
import VDrawTypeBadge from '@/components/ui/badge/v-draw-type-badge.vue'
import VItemDetailModal, { type ItemForDetail } from '@/components/ui/modal/v-item-detail-modal.vue'
import { ItemRarity } from '@/enums/item.enum'
import type { GachaHistory, GachaRewardLog } from '@/interfaces/gacha.interface'
import { itemService } from '@/services/api/item.service'

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const itemDetailModal = useTemplateRef<{ open: (item: ItemForDetail) => void }>('itemDetailModal')

const currentHistory = ref<GachaHistory | null>(null)
const loadingItemCode = ref<string | null>(null)

defineExpose({ open })

function open(history: GachaHistory) {
  currentHistory.value = history
  dialogRef.value?.showModal()
}

const rarityClass: Record<ItemRarity, string> = {
  [ItemRarity.COMMON]: 'border-slate-400 bg-slate-400 text-white',
  [ItemRarity.RARE]: 'border-blue-500 bg-blue-500 text-white',
  [ItemRarity.EPIC]: 'border-purple-500 bg-purple-500 text-white',
  [ItemRarity.LEGENDARY]: 'border-amber-500 bg-amber-500 text-white',
}

function badgeClass(reward: GachaRewardLog) {
  return rarityClass[reward.rarity as ItemRarity] ?? ''
}

function close() {
  emit('close')
  dialogRef.value?.close()
}

async function openItemDetail(reward: GachaRewardLog) {
  loadingItemCode.value = reward.itemId
  const item = await itemService.getByCode(reward.code)
  loadingItemCode.value = null
  if (item) itemDetailModal.value?.open(item)
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-md">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-1 text-lg font-bold">{{ t('gacha.history.rewardsModal.title') }}</h3>

      <template v-if="currentHistory">
        <div class="text-base-content/60 mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span
            >{{ t('gacha.history.columns.player') }}:
            <strong>{{ currentHistory.player.name }}</strong></span
          >
          <span
            >{{ t('gacha.history.columns.gacha') }}:
            <code class="font-mono">{{ currentHistory.gacha.code }}</code></span
          >
          <span class="flex items-center gap-1"
            >{{ t('gacha.history.columns.drawType') }}: <VDrawTypeBadge :value="currentHistory.drawType"
          /></span>
        </div>

        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <div class="flex flex-col gap-2">
            <button
              v-for="(reward, i) in currentHistory.rewards"
              :key="reward.itemId"
              class="bg-base-200 hover:bg-base-300 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors"
              :disabled="loadingItemCode === reward.itemId"
              @click="openItemDetail(reward)"
            >
              <div class="flex items-center gap-2">
                <span class="text-base-content/40 w-5 text-right text-xs">{{ i + 1 }}</span>
                <span
                  v-if="loadingItemCode === reward.itemId"
                  class="loading loading-spinner loading-xs"
                />
                <span class="font-mono text-sm font-medium">{{ reward.code }}</span>
              </div>
              <span class="badge badge-sm" :class="badgeClass(reward)">
                {{ t(`item.rarity.${reward.rarity}`) }}
              </span>
            </button>
            <p v-if="!currentHistory.rewards.length" class="text-base-content/40 py-4 text-center text-sm">
              {{ t('common.noData') }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </dialog>

  <VItemDetailModal ref="itemDetailModal" />
</template>
