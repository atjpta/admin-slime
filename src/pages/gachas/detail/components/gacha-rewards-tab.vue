<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { PlusIcon, TrashIcon, ZapIcon, CheckIcon, MinusIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemStatusBadge from '@/components/ui/badge/v-item-status-badge.vue'
import VJsonView from '@/components/ui/json/v-json-view.vue'
import GachaRewardAddModal from '../../components/gacha-reward-add-modal.vue'
import GachaRewardQuickAddModal from '../../components/gacha-reward-quick-add-modal.vue'
import { gachaService } from '@/services/api/gacha.service'
import { ItemRarity, ItemType } from '@/enums/item.enum'
import { parseApiError } from '@/utils/api-error'
import type { Gacha, GachaRewardItem } from '@/interfaces/gacha.interface'

const props = defineProps<{ gacha: Gacha }>()
const emit = defineEmits<{ saved: [] }>()
const { t } = useI18n()

const pendingRewards = ref<GachaRewardItem[]>([])
const saving = ref(false)
const showAddModal = ref(false)
const showQuickAddModal = ref(false)
const filterSearch = ref('')
const filterType = ref('' as ItemType | '')
const filterRarity = ref('' as ItemRarity | '')

watch(() => props.gacha, (g) => { pendingRewards.value = g.listReward.map((r) => ({ ...r })) }, { immediate: true })

const pendingCodes = computed(() => pendingRewards.value.map((r) => r.code))

const filtered = computed(() => {
  let list = pendingRewards.value
  if (filterSearch.value) list = list.filter((r) => r.code.toLowerCase().includes(filterSearch.value.toLowerCase()))
  if (filterType.value) list = list.filter((r) => r.type === filterType.value)
  if (filterRarity.value) list = list.filter((r) => r.rarity === filterRarity.value)
  return list
})

function addReward(item: GachaRewardItem) { pendingRewards.value.push(item) }
function removeReward(index: number) { pendingRewards.value.splice(index, 1) }

async function save() {
  saving.value = true
  try {
    await gachaService.updateRewards(props.gacha._id, { itemCodes: pendingCodes.value })
    toast.success(t('gacha.rewards.updateSuccess'))
    emit('saved')
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    saving.value = false
  }
}

async function quickAdd(types: ItemType[], rarityList: ItemRarity[]) {
  showQuickAddModal.value = false
  saving.value = true
  try {
    await gachaService.updateRewards(props.gacha._id, {
      itemCodes: pendingCodes.value,
      types: types.length ? types : undefined,
      rarities: rarityList.length ? rarityList : undefined,
    })
    toast.success(t('gacha.rewards.updateSuccess'))
    emit('saved')
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    saving.value = false
  }
}

function resetFilter() {
  filterType.value = ''
  filterRarity.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-end gap-2">
      <VButton :icon="ZapIcon" class="btn-ghost btn-sm" @click="showQuickAddModal = true">
        {{ t('gacha.rewards.quickAdd.btn') }}
      </VButton>
      <VButton :icon="PlusIcon" class="btn-ghost btn-sm" @click="showAddModal = true">
        {{ t('gacha.rewards.addRow') }}
      </VButton>
      <VButton class="btn-primary btn-sm" :loading="saving" @click="save">
        {{ t('common.save') }}
      </VButton>
    </div>

    <VTableToolbar
      v-model="filterSearch"
      :active-filters="!!(filterType || filterRarity)"
      @reset="resetFilter"
    >
      <template #filters>
        <VSelectFilter v-model="filterType" :label="t('item.columns.type')" :enum-values="ItemType" i18n-key="item.type" />
        <VSelectFilter v-model="filterRarity" :label="t('item.columns.rarity')" :enum-values="ItemRarity" i18n-key="item.rarity" />
      </template>
    </VTableToolbar>

    <div class="overflow-x-auto">
      <table class="table-sm table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t('item.columns.code') }}</th>
            <th>{{ t('item.columns.type') }}</th>
            <th>{{ t('item.columns.rarity') }}</th>
            <th>{{ t('item.columns.status') }}</th>
            <th>{{ t('item.columns.sellPrice') }}</th>
            <th>{{ t('item.columns.stackable') }}</th>
            <th>{{ t('item.columns.metadata') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filtered" :key="item._id">
            <td class="text-base-content/40">{{ pendingRewards.indexOf(item) + 1 }}</td>
            <td class="font-mono text-sm">{{ item.code }}</td>
            <td><VItemTypeBadge :value="item.type" /></td>
            <td><VItemRarityBadge :value="item.rarity" /></td>
            <td><VItemStatusBadge :value="item.status" /></td>
            <td class="text-center">{{ item.sellPrice?.toLocaleString() ?? '-' }}</td>
            <td class="text-center">
              <CheckIcon v-if="item.stackable" class="text-success mx-auto size-4" />
              <MinusIcon v-else class="text-base-content/30 mx-auto size-4" />
            </td>
            <td class="text-center">
              <VJsonView :value="item.metadata" :title="t('item.columns.metadata')" />
            </td>
            <td>
              <VButton :icon="TrashIcon" class="btn-ghost btn-sm text-error" @click="removeReward(pendingRewards.indexOf(item))" />
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="9" class="text-base-content/40 py-4 text-center text-sm">{{ t('table.empty') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <GachaRewardAddModal :open="showAddModal" :existing-ids="pendingCodes" @close="showAddModal = false" @add="addReward" />
  <GachaRewardQuickAddModal :open="showQuickAddModal" @close="showQuickAddModal = false" @add="quickAdd" />
</template>
