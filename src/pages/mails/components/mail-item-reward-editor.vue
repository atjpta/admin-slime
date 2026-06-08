<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2Icon, XIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import { itemService } from '@/services/api/item.service'
import { ItemSource, ItemStatus } from '@/enums/item.enum'
import { StatType } from '@/enums/stat.enum'
import type { Item, RollConfig } from '@/interfaces/item.interface'

export interface ItemRewardRow {
  item: Item
  quantity: number
  source: ItemSource
  metadata: Record<string, unknown>
}

const props = defineProps<{ modelValue: ItemRewardRow[] }>()
const emit = defineEmits<{ 'update:modelValue': [ItemRewardRow[]] }>()
const { t } = useI18n()

// Search
const searchCode = ref('')
const searchResults = ref<Item[]>([])
const searching = ref(false)
const searched = ref(false)
let debounce: ReturnType<typeof setTimeout> | null = null

watch(searchCode, (val) => {
  if (debounce) clearTimeout(debounce)
  if (!val.trim()) { searchResults.value = []; searched.value = false; return }
  debounce = setTimeout(doSearch, 400)
})

async function doSearch() {
  searching.value = true
  searched.value = false
  try {
    const res = await itemService.index({ search: searchCode.value.trim(), page: 1, limit: 20, status: ItemStatus.ACTIVE })
    searchResults.value = res.items
    searched.value = true
  } finally {
    searching.value = false
  }
}

// Pending config
interface SelectedEntry {
  id: number
  stat: string
  type: string
  min: number
  max: number
  valueMode: 'random' | 'manual' | 'max'
  manualValue: string
}

let nextEntryId = 0
const pendingItem = ref<Item | null>(null)
const pendingQty = ref(1)
const pendingSource = ref<ItemSource>(ItemSource.SYSTEM)
const pendingRarityMode = ref<'random' | 'custom'>('random')
const pendingEntries = ref<SelectedEntry[]>([])

const rollConfig = computed<RollConfig | null>(() => (pendingItem.value?.metadata as any)?.rollConfig ?? null)
const statOptions = computed(() => {
  if (!rollConfig.value) return []
  const seen = new Set<string>()
  return rollConfig.value.stats.reduce<{ stat: string; type: string; min: number; max: number }[]>((acc, s) => {
    const key = `${s.stat}__${s.type}`
    if (!seen.has(key)) { seen.add(key); acc.push(s) }
    return acc
  }, [])
})
const slotsMax = computed(() => rollConfig.value?.slots ?? 0)
const atLimit = computed(() => pendingEntries.value.length >= slotsMax.value)

function selectItem(item: Item) {
  pendingItem.value = item
  pendingQty.value = 1
  pendingSource.value = ItemSource.SYSTEM
  pendingRarityMode.value = 'random'
  pendingEntries.value = []
}

function addEntry(opt: { stat: string; type: string; min: number; max: number }) {
  if (atLimit.value) return
  pendingEntries.value.push({ id: nextEntryId++, ...opt, valueMode: 'random', manualValue: '' })
}

function removeEntry(id: number) {
  pendingEntries.value = pendingEntries.value.filter((e) => e.id !== id)
}

function resolveValue(e: SelectedEntry): number {
  if (e.valueMode === 'max') return e.max
  if (e.valueMode === 'random') {
    const raw = e.min + Math.random() * (e.max - e.min)
    return e.type === StatType.PERCENT ? +raw.toFixed(2) : Math.round(raw)
  }
  return parseFloat(e.manualValue) || e.min
}

function confirmAdd() {
  if (!pendingItem.value) return
  if (props.modelValue.some((r) => r.item._id === pendingItem.value!._id)) {
    pendingItem.value = null
    return
  }
  const metadata: Record<string, unknown> =
    pendingRarityMode.value === 'custom' && pendingEntries.value.length
      ? { rarityStats: pendingEntries.value.map((e) => ({ stat: e.stat, type: e.type, value: resolveValue(e) })) }
      : {}
  emit('update:modelValue', [
    ...props.modelValue,
    { item: pendingItem.value, quantity: pendingQty.value, source: pendingSource.value, metadata },
  ])
  pendingItem.value = null
  searchCode.value = ''
  searchResults.value = []
  searched.value = false
}

function removeRow(index: number) {
  const rows = [...props.modelValue]
  rows.splice(index, 1)
  emit('update:modelValue', rows)
}

const sourceOptions = Object.values(ItemSource).map((v) => ({ value: v, label: t(`item.source.${v}`) }))
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-base-content/60 text-xs tracking-wide uppercase">
      {{ t('mail.fields.addItem') }}
    </span>

    <!-- Added rows -->
    <div
      v-for="(row, idx) in modelValue"
      :key="row.item._id"
      class="bg-base-200 flex items-center gap-2 rounded-lg px-3 py-2"
    >
      <div class="min-w-0 flex-1">
        <span class="font-mono text-sm font-medium">{{ row.item.code }}</span>
        <span class="text-base-content/50 ml-2 text-xs">
          {{ t(`item.rarity.${row.item.rarity}`) }} · {{ t(`item.type.${row.item.type}`) }}
        </span>
      </div>
      <input v-model.number="row.quantity" type="number" min="1" class="input input-bordered input-xs w-16 text-center" />
      <VButton :icon="Trash2Icon" class="btn-ghost btn-xs text-error" @click="removeRow(idx)" />
    </div>

    <!-- Pending config -->
    <template v-if="pendingItem">
      <div class="rounded-box border-base-300 border p-3">
        <div class="bg-base-200 mb-3 flex items-center gap-3 rounded-lg p-2 text-sm">
          <span class="font-mono font-bold">{{ pendingItem.code }}</span>
          <VItemTypeBadge :value="pendingItem.type" />
          <VItemRarityBadge :value="pendingItem.rarity" />
          <VButton class="btn-ghost btn-xs ml-auto" @click="pendingItem = null">{{ t('common.edit') }}</VButton>
        </div>

        <div class="mb-3 flex gap-3">
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">{{ t('mail.fields.itemQuantity') }}</legend>
            <input v-model.number="pendingQty" type="number" min="1" class="input input-bordered input-sm w-full" />
          </fieldset>
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">{{ t('mail.fields.itemSource') }}</legend>
            <select v-model="pendingSource" class="select select-bordered select-sm w-full">
              <option v-for="opt in sourceOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </fieldset>
        </div>

        <!-- Rarity stats (equipment only) -->
        <template v-if="rollConfig">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-sm font-semibold">{{ t('player.addItem.rarityStats') }}</p>
            <span class="text-base-content/50 text-xs">{{ pendingEntries.length }} / {{ slotsMax }}</span>
          </div>
          <div class="mb-3 flex gap-2">
            <button
              v-for="mode in ['random', 'custom'] as const"
              :key="mode"
              class="btn btn-sm flex-1"
              :class="pendingRarityMode === mode ? 'btn-neutral' : 'btn-ghost'"
              @click="pendingRarityMode = mode"
            >
              {{ t(`player.addItem.mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`) }}
            </button>
          </div>

          <template v-if="pendingRarityMode === 'custom'">
            <p class="text-base-content/50 mb-2 text-xs">{{ t('player.addItem.availableStats') }}</p>
            <div class="mb-3 flex flex-wrap gap-2">
              <button
                v-for="opt in statOptions"
                :key="`${opt.stat}__${opt.type}`"
                class="btn btn-xs"
                :class="atLimit ? 'btn-disabled' : 'btn-outline'"
                :disabled="atLimit"
                @click="addEntry(opt)"
              >
                {{ t(`stat.key.${opt.stat}`) }} · {{ t(`stat.type.${opt.type}`) }}
              </button>
            </div>
            <div v-if="pendingEntries.length" class="flex flex-col gap-2">
              <div
                v-for="(entry, i) in pendingEntries"
                :key="entry.id"
                class="rounded-box border-base-200 flex gap-3 border p-3"
              >
                <div class="text-base-content/30 w-5 pt-0.5 text-xs">{{ i + 1 }}</div>
                <div class="flex flex-1 flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <span class="badge badge-outline font-mono text-xs">{{ t(`stat.key.${entry.stat}`) }}</span>
                    <span class="badge badge-ghost badge-xs">{{ t(`stat.type.${entry.type}`) }}</span>
                  </div>
                  <div class="flex gap-1">
                    <button
                      v-for="mode in ['random', 'manual', 'max'] as const"
                      :key="mode"
                      class="btn btn-xs flex-1"
                      :class="entry.valueMode === mode ? 'btn-neutral' : 'btn-ghost'"
                      @click="entry.valueMode = mode"
                    >
                      {{ t(`player.addItem.value_${mode}`) }}
                    </button>
                  </div>
                  <input
                    v-if="entry.valueMode === 'manual'"
                    v-model="entry.manualValue"
                    type="number"
                    class="input input-bordered input-xs w-full"
                    :placeholder="`${t('player.addItem.range')}: ${entry.min} – ${entry.max}`"
                  />
                  <p v-else-if="entry.valueMode === 'max'" class="text-base-content/50 text-xs">max = {{ entry.max }}</p>
                  <p v-else class="text-base-content/50 text-xs">
                    {{ t('player.addItem.randomRange', { min: entry.min, max: entry.max }) }}
                  </p>
                </div>
                <button class="btn btn-ghost btn-xs btn-square self-start" @click="removeEntry(entry.id)">
                  <XIcon class="size-3.5" />
                </button>
              </div>
            </div>
            <p v-else class="text-base-content/30 py-2 text-center text-xs">
              {{ t('player.addItem.noStatsSelected') }}
            </p>
          </template>
        </template>

        <div class="mt-3 flex justify-end">
          <VButton class="btn-primary btn-sm" @click="confirmAdd">{{ t('common.confirm') }}</VButton>
        </div>
      </div>
    </template>

    <!-- Search (hidden when configuring) -->
    <template v-else>
      <input
        v-model="searchCode"
        type="text"
        class="input input-bordered input-sm w-full"
        :placeholder="t('gacha.rewards.searchPlaceholder')"
      />
      <div class="min-h-24">
        <div v-if="searching" class="flex justify-center py-6">
          <span class="loading loading-spinner loading-sm"></span>
        </div>
        <template v-else-if="searched">
          <div v-if="searchResults.length" class="max-h-52 overflow-y-auto">
            <table class="table-sm table">
              <thead>
                <tr>
                  <th>{{ t('item.columns.code') }}</th>
                  <th>{{ t('item.columns.type') }}</th>
                  <th>{{ t('item.columns.rarity') }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in searchResults"
                  :key="item._id"
                  class="hover cursor-pointer"
                  :class="{ 'pointer-events-none opacity-40': modelValue.some((r) => r.item._id === item._id) }"
                  @click="selectItem(item)"
                >
                  <td class="font-mono text-sm">{{ item.code }}</td>
                  <td><VItemTypeBadge :value="item.type" /></td>
                  <td><VItemRarityBadge :value="item.rarity" /></td>
                  <td>
                    <VButton class="btn-primary btn-xs" @click.stop="selectItem(item)">
                      {{ t('common.select') }}
                    </VButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-base-content/40 py-6 text-center text-sm">{{ t('table.empty') }}</p>
        </template>
        <p v-else class="text-base-content/30 py-6 text-center text-sm">
          {{ t('gacha.rewards.searchHint') }}
        </p>
      </div>
    </template>
  </div>
</template>
