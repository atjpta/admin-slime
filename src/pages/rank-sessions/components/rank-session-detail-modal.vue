<script setup lang="ts">
import { ref, useTemplateRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VButton from '@/components/ui/btn/v-button.vue'
import VRankStatusBadge from '@/components/ui/badge/v-rank-status-badge.vue'
import type { RankSession, TierReward } from '@/interfaces/rank.interface'
import { formatDate } from '@/utils/format'

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const currentItem = ref<RankSession | null>(null)
type Tab = 'daily' | 'session'
const activeTab = ref<Tab>('daily')

const dailyCount = computed(() => currentItem.value?.rewardDaily?.length ?? 0)
const sessionCount = computed(() => currentItem.value?.rewardSession?.length ?? 0)

defineExpose({ open })

function open(item: RankSession) {
  currentItem.value = item
  dialogRef.value?.showModal()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}

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
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-2xl">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('rankSession.detail.title') }}</h3>

      <div class="-mx-6 max-h-[70dvh] overflow-y-auto px-6" v-if="currentItem">
        <div class="flex flex-col gap-5">
          <!-- Info grid -->
          <div class="bg-base-200 grid grid-cols-2 gap-x-8 gap-y-3 rounded-xl p-4 text-sm sm:grid-cols-3">
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.code') }}</span>
              <span class="font-mono font-medium">{{ currentItem.code }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.session') }}</span>
              <span class="font-medium">#{{ currentItem.session }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.rankMode') }}</span>
              <span class="font-medium">{{ t(`rankConfig.rankMode.${currentItem.rankMode}`) }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.status') }}</span>
              <VRankStatusBadge :value="currentItem.status" i18n-key="rankSession.status" class="w-fit" />
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.startDate') }}</span>
              <span>{{ formatDate(currentItem.startDate) }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.endDate') }}</span>
              <span>{{ formatDate(currentItem.endDate) }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankConfig.fields.initialPoint') }}</span>
              <span class="font-medium">{{ currentItem.ruleSet?.initialPoint?.toLocaleString() ?? '-' }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankConfig.fields.winPoint') }}</span>
              <span class="font-medium text-success">+{{ currentItem.ruleSet?.winPoint ?? '-' }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 text-xs">{{ t('rankConfig.fields.losePoint') }}</span>
              <span class="font-medium text-error">-{{ currentItem.ruleSet?.losePoint ?? '-' }}</span>
            </div>
          </div>

          <!-- Reward tabs -->
          <div>
            <div role="tablist" class="tabs tabs-border mb-3">
              <button
                type="button"
                role="tab"
                class="tab"
                :class="{ 'tab-active': activeTab === 'daily' }"
                @click="activeTab = 'daily'"
              >
                {{ t('rankConfig.rewards.rewardDaily') }}
                <span v-if="dailyCount" class="badge badge-sm ml-1.5">{{ dailyCount }}</span>
              </button>
              <button
                type="button"
                role="tab"
                class="tab"
                :class="{ 'tab-active': activeTab === 'session' }"
                @click="activeTab = 'session'"
              >
                {{ t('rankConfig.rewards.rewardSession') }}
                <span v-if="sessionCount" class="badge badge-sm ml-1.5">{{ sessionCount }}</span>
              </button>
            </div>

            <!-- daily -->
            <div v-show="activeTab === 'daily'">
              <div v-if="currentItem.rewardDaily?.length" class="flex flex-col gap-2">
                <div
                  v-for="(r, i) in currentItem.rewardDaily"
                  :key="i"
                  class="rounded-box border-base-200 border p-3 text-sm"
                >
                  <p class="mb-1.5 font-mono font-medium">{{ getTierLabel(r.tier) }}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span v-for="(c, ci) in r.reward?.currency" :key="ci" class="text-base-content/70">
                      {{ t(`gacha.currency.${c.type}`) }}: <strong>{{ c.value.toLocaleString() }}</strong>
                    </span>
                  </div>
                  <div v-if="r.reward?.items?.length" class="mt-1.5 flex flex-wrap gap-2 text-xs">
                    <span
                      v-for="(it, ii) in r.reward.items"
                      :key="ii"
                      class="bg-base-200 rounded px-1.5 py-0.5 font-mono"
                    >
                      {{ getItemCode(it.item) }} ×{{ it.quantity }}
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="text-base-content/40 text-sm">—</p>
            </div>

            <!-- session -->
            <div v-show="activeTab === 'session'">
              <div v-if="currentItem.rewardSession?.length" class="flex flex-col gap-2">
                <div
                  v-for="(r, i) in currentItem.rewardSession"
                  :key="i"
                  class="rounded-box border-base-200 border p-3 text-sm"
                >
                  <p class="mb-1.5 font-mono font-medium">{{ getTierLabel(r.tier) }}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span v-for="(c, ci) in r.reward?.currency" :key="ci" class="text-base-content/70">
                      {{ t(`gacha.currency.${c.type}`) }}: <strong>{{ c.value.toLocaleString() }}</strong>
                    </span>
                  </div>
                  <div v-if="r.reward?.items?.length" class="mt-1.5 flex flex-wrap gap-2 text-xs">
                    <span
                      v-for="(it, ii) in r.reward.items"
                      :key="ii"
                      class="bg-base-200 rounded px-1.5 py-0.5 font-mono"
                    >
                      {{ getItemCode(it.item) }} ×{{ it.quantity }}
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="text-base-content/40 text-sm">—</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="close">{{ t('common.close') }}</VButton>
      </div>
    </div>
  </dialog>
</template>
