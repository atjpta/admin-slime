<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { SquarePenIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import ItemStatsEditModal from './item-stats-edit-modal.vue'
import ItemRollConfigEditModal from './item-roll-config-edit-modal.vue'
import { ItemType } from '@/enums/item.enum'
import type { Item, ItemEquipmentMetadata } from '@/interfaces/item.interface'
import { displayStatValue } from '@/utils/format'

const props = defineProps<{ item: Item | null }>()
const emit = defineEmits<{ close: []; updated: [] }>()
const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const statsEditModalRef = useTemplateRef<InstanceType<typeof ItemStatsEditModal>>('statsEditModal')
const rollConfigEditModalRef =
  useTemplateRef<InstanceType<typeof ItemRollConfigEditModal>>('rollConfigEditModal')

defineExpose({ open })

function open() {
  dialogRef.value?.showModal()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}

const equipMeta = computed<ItemEquipmentMetadata | null>(() => {
  if (props.item?.type !== ItemType.EQUIPMENT) return null
  const m = props.item.metadata as ItemEquipmentMetadata
  return m?.slot ? m : null
})
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-lg">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>

      <template v-if="item">
        <!-- Header -->
        <div class="mb-4">
          <p class="font-mono text-lg font-bold">{{ item.code }}</p>
          <div class="mt-1.5 flex flex-wrap items-center gap-2">
            <VItemTypeBadge :value="item.type" />
            <VItemRarityBadge :value="item.rarity" />
          </div>
        </div>
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <template v-if="equipMeta">
            <div class="flex flex-col gap-6">
              <!-- Stats -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <p class="text-base-content/50 text-xs font-medium tracking-wider uppercase">
                    {{ t('item.equipment.tabs.stats') }}
                  </p>
                  <VButton
                    :icon="SquarePenIcon"
                    class="btn-ghost btn-xs text-primary"
                    @click="statsEditModalRef?.open()"
                  />
                </div>

                <div v-if="equipMeta.stats?.length" class="flex flex-col gap-2">
                  <div
                    v-for="(s, i) in equipMeta.stats"
                    :key="i"
                    class="bg-base-200 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                  >
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ t(`stat.key.${s.stat}`) }}</span>
                      <span class="badge badge-ghost badge-xs">{{ t(`stat.type.${s.type}`) }}</span>
                    </div>
                    <span class="text-success font-bold tabular-nums">
                      {{ displayStatValue(s.value, s.type) }}
                    </span>
                  </div>
                </div>
                <p v-else class="text-base-content/40 py-2 text-center text-sm">
                  {{ t('common.noData') }}
                </p>
              </div>

              <!-- Roll Config -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <p class="text-base-content/50 text-xs font-medium tracking-wider uppercase">
                    {{ t('item.equipment.tabs.rollConfig') }}
                  </p>
                  <VButton
                    :icon="SquarePenIcon"
                    class="btn-ghost btn-xs text-primary"
                    @click="rollConfigEditModalRef?.open()"
                  />
                </div>

                <template v-if="equipMeta.rollConfig">
                  <div
                    class="bg-base-200 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                  >
                    <span class="text-base-content/50">{{
                      t('item.equipment.rollConfig.slots')
                    }}</span>
                    <span class="font-bold">{{ equipMeta.rollConfig.slots }}</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div
                      v-for="(s, i) in equipMeta.rollConfig.stats"
                      :key="i"
                      class="bg-base-200 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    >
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{{ t(`stat.key.${s.stat}`) }}</span>
                        <span class="badge badge-ghost badge-xs">{{
                          t(`stat.type.${s.type}`)
                        }}</span>
                      </div>
                      <span class="font-mono text-xs">
                        {{ displayStatValue(s.min, s.type, '') }} –
                        {{ displayStatValue(s.max, s.type, '') }}
                      </span>
                    </div>
                  </div>
                </template>
                <p v-else class="text-base-content/40 py-2 text-center text-sm">
                  {{ t('common.noData') }}
                </p>
              </div>
            </div>
          </template>
          <p v-else class="text-base-content/40 py-4 text-center text-sm">
            {{ t('common.noData') }}
          </p>
        </div>
      </template>
    </div>
  </dialog>

  <ItemStatsEditModal ref="statsEditModal" :item="item" @saved="emit('updated')" />
  <ItemRollConfigEditModal ref="rollConfigEditModal" :item="item" @saved="emit('updated')" />
</template>
