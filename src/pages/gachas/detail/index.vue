<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { PlusIcon, TrashIcon, SquarePenIcon, ChevronDownIcon, ZapIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VGachaStatusBadge from '@/components/ui/badge/v-gacha-status-badge.vue'
import GachaEditModal from '../components/gacha-edit-modal.vue'
import GachaRewardAddModal from '../components/gacha-reward-add-modal.vue'
import GachaRewardQuickAddModal from '../components/gacha-reward-quick-add-modal.vue'
import GachaCostAddModal from '../components/gacha-cost-add-modal.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import VItemStatusBadge from '@/components/ui/badge/v-item-status-badge.vue'
import VJsonView from '@/components/ui/json/v-json-view.vue'
import { gachaService } from '@/services/api/gacha.service'
import { CurrencyCode, DrawType } from '@/enums/gacha.enum'
import { ItemRarity, ItemType } from '@/enums/item.enum'
import { CheckIcon, MinusIcon } from '@lucide/vue'
import { parseApiError } from '@/utils/api-error'
import { formatDate } from '@/utils/format'
import { RouteName } from '@/router'
import type { Gacha, GachaCost, GachaRarity, GachaRewardItem } from '@/interfaces/gacha.interface'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const id = route.params.id as string

const detail = ref<Gacha | null>(null)
const loading = ref(false)
const editingGacha = ref<Gacha | null>(null)

const collapsed = reactive({ costs: false, rarities: false, rewards: false })

// costs
const costs = ref<GachaCost[]>([])
const savingCosts = ref(false)
const showAddCostModal = ref(false)

// rarities
const rarities = ref<GachaRarity[]>([])
const savingRarities = ref(false)

// rewards
const pendingRewards = ref<GachaRewardItem[]>([])
const savingRewards = ref(false)
const showAddRewardModal = ref(false)
const showQuickAddRewardModal = ref(false)

const rewardFilter = ref({ search: '', type: '' as ItemType | '', rarity: '' as ItemRarity | '' })
const filteredRewards = computed(() => {
  let list = pendingRewards.value
  const { search, type, rarity } = rewardFilter.value
  if (search) list = list.filter((r) => r.code.toLowerCase().includes(search.toLowerCase()))
  if (type) list = list.filter((r) => r.type === type)
  if (rarity) list = list.filter((r) => r.rarity === rarity)
  return list
})


const ALL_RARITIES = [
  ItemRarity.COMMON,
  ItemRarity.RARE,
  ItemRarity.EPIC,
  ItemRarity.LEGENDARY,
] as const

const currencyOptions = Object.values(CurrencyCode)
const drawTypeOptions = Object.values(DrawType)

async function fetchDetail(silent = false) {
  if (!silent) loading.value = true
  try {
    detail.value = await gachaService.getById(id)
    syncFromDetail()
  } catch {
    router.replace({ name: RouteName.Gachas })
  } finally {
    if (!silent) loading.value = false
  }
}

function syncFromDetail() {
  if (!detail.value) return
  costs.value = detail.value.costs.map((c) => ({ ...c }))
  rarities.value = ALL_RARITIES.map((r) => {
    const found = detail.value!.rarities.find((x) => x.rarity === r)
    return { rarity: r, rate: found?.rate ?? 0 }
  })
  pendingRewards.value = detail.value.listReward.map((item) => ({ ...item }))
}

onMounted(fetchDetail)

// costs
function addCost(cost: GachaCost) {
  costs.value.push(cost)
}

function removeCostRow(index: number) {
  costs.value.splice(index, 1)
}

async function saveCosts() {
  if (!detail.value) return
  savingCosts.value = true
  try {
    await gachaService.updateCosts(detail.value._id, costs.value)
    await fetchDetail(true)
    toast.success(t('gacha.costs.updateSuccess'))
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    savingCosts.value = false
  }
}

// rarities
async function saveRarities() {
  if (!detail.value) return
  savingRarities.value = true
  try {
    await gachaService.updateRarities(detail.value._id, rarities.value)
    await fetchDetail(true)
    toast.success(t('gacha.rarities.updateSuccess'))
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    savingRarities.value = false
  }
}

// rewards
const pendingRewardCodes = computed(() => pendingRewards.value.map((r) => r.code))

function addReward(item: GachaRewardItem) {
  pendingRewards.value.push(item)
}

function removeReward(index: number) {
  pendingRewards.value.splice(index, 1)
}

async function saveRewards() {
  if (!detail.value) return
  savingRewards.value = true
  try {
    await gachaService.updateRewards(detail.value._id, {
      itemCodes: pendingRewardCodes.value,
    })
    await fetchDetail(true)
    toast.success(t('gacha.rewards.updateSuccess'))
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    savingRewards.value = false
  }
}

async function quickAddRewards(types: ItemType[], rarities: ItemRarity[]) {
  if (!detail.value) return
  savingRewards.value = true
  try {
    await gachaService.updateRewards(detail.value._id, {
      itemCodes: pendingRewardCodes.value,
      types: types.length ? types : undefined,
      rarities: rarities.length ? rarities : undefined,
    })
    await fetchDetail(true)
    toast.success(t('gacha.rewards.updateSuccess'))
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    savingRewards.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <template v-else-if="detail">
      <!-- Page header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-xl font-semibold">{{ t('gacha.detail.title') }}</h1>
          <p class="text-base-content/50 font-mono text-sm">{{ detail.code }}</p>
        </div>
        <VButton :icon="SquarePenIcon" class="btn-primary btn-sm" @click="editingGacha = detail">
          <span class="hidden sm:inline">{{ t('common.edit') }}</span>
        </VButton>
      </div>

      <!-- Info card -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <p class="text-base-content/50 mb-0.5">{{ t('gacha.columns.code') }}</p>
              <p class="font-mono font-medium">{{ detail.code }}</p>
            </div>
            <div>
              <p class="text-base-content/50 mb-0.5">{{ t('gacha.columns.type') }}</p>
              <span class="badge badge-outline">{{ t(`gacha.type.${detail.type}`) }}</span>
            </div>
            <div>
              <p class="text-base-content/50 mb-0.5">{{ t('gacha.columns.status') }}</p>
              <VGachaStatusBadge :value="detail.status" />
            </div>
            <div>
              <p class="text-base-content/50 mb-0.5">{{ t('gacha.columns.sortOrder') }}</p>
              <p class="font-medium">{{ detail.sortOrder }}</p>
            </div>
            <div>
              <p class="text-base-content/50 mb-0.5">{{ t('gacha.columns.startAt') }}</p>
              <p class="font-medium">{{ formatDate(detail.startAt) }}</p>
            </div>
            <div>
              <p class="text-base-content/50 mb-0.5">{{ t('gacha.columns.endAt') }}</p>
              <p class="font-medium">{{ formatDate(detail.endAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Costs -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <button
            class="flex w-full items-center justify-between"
            @click="collapsed.costs = !collapsed.costs"
          >
            <div class="flex items-center gap-2">
              <span class="font-semibold">{{ t('gacha.tabs.costs') }}</span>
              <span class="badge badge-sm">{{ costs.length }}</span>
            </div>
            <ChevronDownIcon
              class="text-base-content/50 size-4 transition-transform duration-200"
              :class="{ 'rotate-180': collapsed.costs }"
            />
          </button>

          <div v-if="!collapsed.costs" class="mt-3 flex flex-col gap-3">
            <div class="flex items-center justify-end gap-2">
              <VButton :icon="PlusIcon" class="btn-ghost btn-sm" @click="showAddCostModal = true">
                {{ t('gacha.costs.addRow') }}
              </VButton>
              <VButton class="btn-primary btn-sm" :loading="savingCosts" @click="saveCosts">
                {{ t('common.save') }}
              </VButton>
            </div>
            <div class="overflow-x-auto">
              <table class="table-sm table">
                <thead>
                  <tr>
                    <th>{{ t('gacha.costs.drawType') }}</th>
                    <th>{{ t('gacha.costs.currencyCode') }}</th>
                    <th>{{ t('gacha.costs.amount') }}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(cost, i) in costs" :key="i">
                    <td>
                      <select v-model="cost.drawType" class="select select-bordered select-sm w-36">
                        <option v-for="dt in drawTypeOptions" :key="dt" :value="dt">
                          {{ t(`gacha.drawType.${dt}`) }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <select
                        v-model="cost.currencyCode"
                        class="select select-bordered select-sm w-28"
                      >
                        <option v-for="cc in currencyOptions" :key="cc" :value="cc">
                          {{ t(`gacha.currency.${cc}`) }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <input
                        v-model.number="cost.amount"
                        type="number"
                        min="0"
                        class="input input-bordered input-sm w-28"
                      />
                    </td>
                    <td>
                      <VButton
                        :icon="TrashIcon"
                        class="btn-ghost btn-sm text-error"
                        @click="removeCostRow(i)"
                      />
                    </td>
                  </tr>
                  <tr v-if="!costs.length">
                    <td colspan="4" class="text-base-content/40 py-4 text-center text-sm">
                      {{ t('table.empty') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Rarities -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <button
            class="flex w-full items-center justify-between"
            @click="collapsed.rarities = !collapsed.rarities"
          >
            <span class="font-semibold">{{ t('gacha.tabs.rarities') }}</span>
            <ChevronDownIcon
              class="text-base-content/50 size-4 transition-transform duration-200"
              :class="{ 'rotate-180': collapsed.rarities }"
            />
          </button>

          <div v-if="!collapsed.rarities" class="mt-3 flex flex-col gap-3">
            <div class="flex items-center justify-end">
              <VButton class="btn-primary btn-sm" :loading="savingRarities" @click="saveRarities">
                {{ t('common.save') }}
              </VButton>
            </div>
            <div class="overflow-x-auto">
              <table class="table-sm table">
                <thead>
                  <tr>
                    <th>{{ t('gacha.rarities.rarity') }}</th>
                    <th>{{ t('gacha.rarities.rate') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in rarities" :key="r.rarity">
                    <td><VItemRarityBadge :value="r.rarity" /></td>
                    <td>
                      <div class="flex items-center gap-2">
                        <input
                          v-model.number="r.rate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          class="input input-bordered input-sm w-28"
                        />
                        <span class="text-base-content/50 text-sm">%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Rewards -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <button
            class="flex w-full items-center justify-between"
            @click="collapsed.rewards = !collapsed.rewards"
          >
            <div class="flex items-center gap-2">
              <span class="font-semibold">{{ t('gacha.tabs.rewards') }}</span>
              <span class="badge badge-sm">{{ pendingRewards.length }}</span>
            </div>
            <ChevronDownIcon
              class="text-base-content/50 size-4 transition-transform duration-200"
              :class="{ 'rotate-180': collapsed.rewards }"
            />
          </button>

          <div v-if="!collapsed.rewards" class="mt-3 flex flex-col gap-3">
            <div class="flex items-center justify-end gap-2">
              <VButton :icon="ZapIcon" class="btn-ghost btn-sm" @click="showQuickAddRewardModal = true">
                {{ t('gacha.rewards.quickAdd.btn') }}
              </VButton>
              <VButton :icon="PlusIcon" class="btn-ghost btn-sm" @click="showAddRewardModal = true">
                {{ t('gacha.rewards.addRow') }}
              </VButton>
              <VButton class="btn-primary btn-sm" :loading="savingRewards" @click="saveRewards">
                {{ t('common.save') }}
              </VButton>
            </div>

            <VTableToolbar
              v-model="rewardFilter.search"
              :active-filters="!!(rewardFilter.type || rewardFilter.rarity)"
              @reset="rewardFilter.type = ''; rewardFilter.rarity = ''"
            >
              <template #filters>
                <VSelectFilter v-model="rewardFilter.type" :label="t('item.columns.type')" :enum-values="ItemType" i18n-key="item.type" />
                <VSelectFilter v-model="rewardFilter.rarity" :label="t('item.columns.rarity')" :enum-values="ItemRarity" i18n-key="item.rarity" />
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
                  <tr v-for="item in filteredRewards" :key="item._id">
                    <td class="text-base-content/40">
                      {{ pendingRewards.indexOf(item) + 1 }}
                    </td>
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
                      <VButton
                        :icon="TrashIcon"
                        class="btn-ghost btn-sm text-error"
                        @click="removeReward(pendingRewards.indexOf(item))"
                      />
                    </td>
                  </tr>
                  <tr v-if="!filteredRewards.length">
                    <td colspan="9" class="text-base-content/40 py-4 text-center text-sm">
                      {{ t('table.empty') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <GachaEditModal :gacha="editingGacha" @close="editingGacha = null" @updated="fetchDetail" />

  <GachaRewardAddModal
    :open="showAddRewardModal"
    :existing-ids="pendingRewardCodes"
    @close="showAddRewardModal = false"
    @add="addReward"
  />
  <GachaRewardQuickAddModal
    :open="showQuickAddRewardModal"
    @close="showQuickAddRewardModal = false"
    @add="(types, rarities) => { showQuickAddRewardModal = false; quickAddRewards(types, rarities) }"
  />

  <GachaCostAddModal :open="showAddCostModal" @close="showAddCostModal = false" @add="addCost" />
</template>
