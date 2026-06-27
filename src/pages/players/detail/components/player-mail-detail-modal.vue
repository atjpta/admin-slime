<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { CoinsIcon, PackageIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VMailStatusBadge from '@/components/ui/badge/v-mail-status-badge.vue'
import VItemDetailModal, { type ItemForDetail, type RarityStat } from '@/components/ui/modal/v-item-detail-modal.vue'
import { ItemRarity } from '@/enums/item.enum'
import { MailSource } from '@/enums/mail.enum'
import { formatDate } from '@/utils/format'
import { mailService } from '@/services/api/mail.service'
import type { PlayerMailAdminItem } from '@/interfaces/player.interface'
import type { MailDetail, PopulatedItemReward } from '@/interfaces/mail.interface'

const emit = defineEmits<{ close: [] }>()

const { t, locale } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const itemDetailModal = useTemplateRef<{ open: (item: ItemForDetail, stats?: RarityStat[] | null) => void }>('itemDetailModal')
const currentItem = ref<PlayerMailAdminItem | null>(null)
const mailDetail = ref<MailDetail | null>(null)
const loadingDetail = ref(false)

defineExpose({ open })

async function open(item: PlayerMailAdminItem) {
  currentItem.value = item
  mailDetail.value = null
  dialogRef.value?.showModal()
  loadingDetail.value = true
  mailDetail.value = await mailService.getById(item.mail._id)
  loadingDetail.value = false
}

function close() {
  emit('close')
  dialogRef.value?.close()
}

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
  <dialog ref="dialog" class="modal">
    <div v-if="currentItem" class="modal-box max-w-lg">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <!-- Header -->
      <div class="mb-4 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="truncate text-lg font-semibold">
            {{ currentItem.mail.title[locale as 'vi' | 'en'] || currentItem.mail.title.vi || currentItem.mail.title.en }}
          </h3>
          <p class="text-base-content/40 font-mono text-xs">{{ currentItem.mail._id }}</p>
        </div>
        <VMailStatusBadge :value="currentItem.status" class="shrink-0" />
      </div>

      <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
        <!-- Meta -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div class="flex flex-col gap-0.5">
            <span class="text-base-content/50 text-xs">{{ t('mail.columns.source') }}</span>
            <span class="font-medium">
              {{
                currentItem.mail.source === MailSource.SYSTEM
                  ? t('mail.source.system')
                  : t('mail.source.player')
              }}
            </span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-base-content/50 text-xs">{{ t('mail.columns.expiredAt') }}</span>
            <span class="font-medium">{{ formatDate(currentItem.expiredAt) }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-base-content/50 text-xs">{{ t('player.detail.claimedAt') }}</span>
            <span class="font-medium">{{ formatDate(currentItem.claimedAt) }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-base-content/50 text-xs">{{ t('mail.columns.createdAt') }}</span>
            <span class="font-medium">{{ formatDate(currentItem.createdAt) }}</span>
          </div>
        </div>

        <div class="divider my-0"></div>

        <!-- Content (both locales) -->
        <div class="flex flex-col gap-3">
          <div v-for="lang in ['vi', 'en'] as const" :key="lang" class="flex flex-col gap-1">
            <span class="text-base-content/40 text-xs tracking-wide uppercase">
              {{ lang === 'vi' ? t('common.langVi') : t('common.langEn') }}
            </span>
            <p class="text-sm font-semibold">{{ currentItem.mail.title[lang] || '-' }}</p>
            <p class="text-base-content/70 text-sm whitespace-pre-wrap">
              {{ currentItem.mail.content[lang] || '-' }}
            </p>
          </div>
        </div>

        <div class="divider my-0"></div>

        <!-- Rewards -->
        <div class="flex flex-col gap-3">
          <p class="text-sm font-medium">{{ t('mail.detail.rewards') }}</p>

          <!-- Loading -->
          <div v-if="loadingDetail" class="flex justify-center py-4">
            <span class="loading loading-spinner loading-sm"></span>
          </div>

          <template v-else-if="mailDetail">
            <p
              v-if="!mailDetail.rewards.currency.length && !mailDetail.rewards.items.length"
              class="text-base-content/40 text-sm"
            >
              {{ t('mail.detail.noRewards') }}
            </p>

            <template v-else>
              <!-- Currency -->
              <div v-if="mailDetail.rewards.currency.length">
                <div
                  class="text-base-content/50 mb-2 flex items-center gap-1.5 text-xs font-medium uppercase"
                >
                  <CoinsIcon class="size-3.5" />
                  {{ t('mail.detail.rewardsCurrency') }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="(cur, i) in mailDetail.rewards.currency"
                    :key="i"
                    class="bg-base-200 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  >
                    <span class="font-semibold">{{ t(`gacha.currency.${cur.type}`) }}</span>
                    <span class="badge badge-sm badge-outline">×{{ cur.value }}</span>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div v-if="mailDetail.rewards.items.length">
                <div
                  class="text-base-content/50 mb-2 flex items-center gap-1.5 text-xs font-medium uppercase"
                >
                  <PackageIcon class="size-3.5" />
                  {{ t('mail.detail.rewardsItems') }}
                </div>
                <div class="flex flex-col gap-2">
                  <div
                    v-for="(reward, i) in mailDetail.rewards.items"
                    :key="i"
                    class="bg-base-200/70 rounded-lg"
                  >
                    <div
                      class="hover:bg-base-200 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
                      @click="openRewardDetail(reward)"
                    >
                      <div
                        class="bg-base-300 flex size-8 shrink-0 items-center justify-center rounded-md"
                      >
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
                        <p class="text-base-content/50 text-xs">
                          {{ t(`item.source.${reward.source}`) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="close">{{ t('common.close') }}</VButton>
      </div>
    </div>
  </dialog>

  <VItemDetailModal ref="itemDetailModal" />
</template>
