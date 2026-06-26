<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import VButton from '@/components/ui/btn/v-button.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import { ItemType, ItemRarity } from '@/enums/item.enum'

interface Props {
  open: boolean
}

const { open } = defineProps<Props>()
const emit = defineEmits<{
  close: []
  add: [types: ItemType[], rarities: ItemRarity[]]
}>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

const ALL_TYPES = Object.values(ItemType)
const ALL_RARITIES = [ItemRarity.COMMON, ItemRarity.RARE, ItemRarity.EPIC, ItemRarity.LEGENDARY]

const selectedTypes = ref<ItemType[]>([])
const selectedRarities = ref<ItemRarity[]>([])

watch(
  () => open,
  (v) => {
    if (v) dialogRef.value?.showModal()
    else dialogRef.value?.close()
  }
)

function toggleType(v: ItemType) {
  const i = selectedTypes.value.indexOf(v)
  if (i === -1) selectedTypes.value.push(v)
  else selectedTypes.value.splice(i, 1)
}

function toggleRarity(v: ItemRarity) {
  const i = selectedRarities.value.indexOf(v)
  if (i === -1) selectedRarities.value.push(v)
  else selectedRarities.value.splice(i, 1)
}

function submit() {
  emit('add', selectedTypes.value, selectedRarities.value)
}

function close() {
  selectedTypes.value = []
  selectedRarities.value = []
  emit('close')
  dialogRef.value?.close()
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-md">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.rewards.quickAdd.title') }}</h3>

      <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
        <div class="flex flex-col gap-4">
          <div>
            <p class="text-base-content/60 mb-2 text-sm font-medium">
              {{ t('item.columns.type') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="v in ALL_TYPES"
                :key="v"
                class="btn btn-sm"
                :class="
                  selectedTypes.includes(v) ? 'btn-primary' : 'btn-ghost border-base-300 border'
                "
                @click="toggleType(v)"
              >
                <VItemTypeBadge :value="v" />
              </button>
            </div>
            <p v-if="!selectedTypes.length" class="text-base-content/40 mt-1 text-xs">
              {{ t('gacha.rewards.quickAdd.allTypes') }}
            </p>
          </div>

          <div>
            <p class="text-base-content/60 mb-2 text-sm font-medium">
              {{ t('item.columns.rarity') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="v in ALL_RARITIES"
                :key="v"
                class="btn btn-sm"
                :class="
                  selectedRarities.includes(v) ? 'btn-primary' : 'btn-ghost border-base-300 border'
                "
                @click="toggleRarity(v)"
              >
                <VItemRarityBadge :value="v" />
              </button>
            </div>
            <p v-if="!selectedRarities.length" class="text-base-content/40 mt-1 text-xs">
              {{ t('gacha.rewards.quickAdd.allRarities') }}
            </p>
          </div>

          <div
            v-if="!selectedTypes.length && !selectedRarities.length"
            class="alert alert-warning py-2 text-sm"
          >
            {{ t('gacha.rewards.quickAdd.noFilterWarning') }}
          </div>
        </div>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="close">{{ t('common.cancel') }}</VButton>
        <VButton class="btn-primary" @click="submit">
          {{ t('gacha.rewards.quickAdd.addBtn') }}
        </VButton>
      </div>
    </div>
  </dialog>
</template>
