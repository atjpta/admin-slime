<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { XIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import { itemService } from '@/services/api/item.service'
import { playerService } from '@/services/api/player.service'
import { ItemStatus } from '@/enums/item.enum'
import { StatType } from '@/enums/stat.enum'
import type { Item, RollConfig } from '@/interfaces/item.interface'

interface Props {
  open: boolean
  playerId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: []; added: [] }>()
const { t } = useI18n()

// --- Search ---
const searchCode = ref('')
const searchResults = ref<Item[]>([])
const searching = ref(false)
const searched = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.open,
  (v) => {
    if (!v) resetAll()
  }
)

watch(searchCode, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    searchResults.value = []
    searched.value = false
    return
  }
  debounceTimer = setTimeout(doSearch, 400)
})

async function doSearch() {
  searching.value = true
  searched.value = false
  try {
    const res = await itemService.index({
      search: searchCode.value.trim(),
      page: 1,
      limit: 20,
      status: ItemStatus.ACTIVE,
    })
    searchResults.value = res.items
    searched.value = true
  } finally {
    searching.value = false
  }
}

// --- Selected item ---
const fetchedItem = ref<Item | null>(null)
const rarityStatsMode = ref<'random' | 'custom'>('random')

function selectItem(item: Item) {
  fetchedItem.value = item
}

const rollConfig = computed<RollConfig | null>(
  () => (fetchedItem.value?.metadata as any)?.rollConfig ?? null
)

// --- Stat options ---
interface StatOption {
  stat: string
  type: string
  min: number
  max: number
}

const statOptions = computed<StatOption[]>(() => {
  if (!rollConfig.value) return []
  const seen = new Set<string>()
  return rollConfig.value.stats.reduce<StatOption[]>((acc, s) => {
    const key = `${s.stat}__${s.type}`
    if (!seen.has(key)) {
      seen.add(key)
      acc.push({ stat: s.stat, type: s.type, min: s.min, max: s.max })
    }
    return acc
  }, [])
})

// --- Selected entries (can have duplicates, limited by slotsMax) ---
interface SelectedEntry {
  id: number
  stat: string
  type: string
  min: number
  max: number
  valueMode: 'manual' | 'random' | 'max'
  manualValue: string
}

let nextId = 0
const selectedEntries = ref<SelectedEntry[]>([])
const slotsMax = computed(() => rollConfig.value?.slots ?? 0)
const atLimit = computed(() => selectedEntries.value.length >= slotsMax.value)

watch(
  () => rollConfig.value,
  () => {
    selectedEntries.value = []
  }
)

function addEntry(opt: StatOption) {
  if (atLimit.value) return
  selectedEntries.value.push({ id: nextId++, ...opt, valueMode: 'random', manualValue: '' })
}

function removeEntry(id: number) {
  selectedEntries.value = selectedEntries.value.filter((e) => e.id !== id)
}

function resolvedValue(e: SelectedEntry): number {
  if (e.valueMode === 'max') return e.max
  if (e.valueMode === 'random') {
    const raw = e.min + Math.random() * (e.max - e.min)
    return e.type === StatType.PERCENT ? +raw.toFixed(2) : Math.round(raw)
  }
  return parseFloat(e.manualValue) || e.min
}

// --- Submit ---
const submitLoading = ref(false)

async function submit() {
  if (!fetchedItem.value) return
  submitLoading.value = true
  try {
    const rarityStats =
      rarityStatsMode.value === 'custom' && rollConfig.value
        ? selectedEntries.value.map((e) => ({
            stat: e.stat,
            type: e.type,
            value: resolvedValue(e),
          }))
        : undefined
    await playerService.addInventoryItem(props.playerId, {
      itemCode: fetchedItem.value.code,
      rarityStats,
    })
    emit('added')
    close()
  } catch {
    // handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

function resetAll() {
  searchCode.value = ''
  searchResults.value = []
  searched.value = false
  fetchedItem.value = null
  rarityStatsMode.value = 'random'
  selectedEntries.value = []
}

function close() {
  emit('close')
  resetAll()
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }" @click.self="close">
    <div class="modal-box max-w-xl">
      <button class="btn btn-circle btn-ghost btn-sm absolute top-3 right-3" @click="close">
        ✕
      </button>
      <h3 class="mb-4 text-lg font-bold">{{ t('player.addItem.title') }}</h3>

      <template v-if="!fetchedItem">
        <input
          v-model="searchCode"
          type="text"
          :placeholder="t('gacha.rewards.searchPlaceholder')"
          class="input input-bordered mb-4 w-full"
        />

        <div class="min-h-32">
          <div v-if="searching" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-md"></span>
          </div>
          <template v-else-if="searched">
            <div v-if="searchResults.length" class="max-h-72 overflow-y-auto">
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
            <p v-else class="text-base-content/40 py-8 text-center text-sm">
              {{ t('table.empty') }}
            </p>
          </template>
          <p v-else class="text-base-content/30 py-8 text-center text-sm">
            {{ t('gacha.rewards.searchHint') }}
          </p>
        </div>

        <div class="modal-action">
          <VButton class="btn-ghost" @click="close">{{ t('common.close') }}</VButton>
        </div>
      </template>

      <template v-else>
        <!-- Selected item info -->
        <div class="bg-base-200 mb-4 flex items-center gap-3 rounded-lg p-3 text-sm">
          <span class="font-mono font-bold">{{ fetchedItem.code }}</span>
          <VItemTypeBadge :value="fetchedItem.type" />
          <VItemRarityBadge :value="fetchedItem.rarity" />
          <button class="btn btn-ghost btn-xs ml-auto" @click="fetchedItem = null">
            {{ t('common.edit') }}
          </button>
        </div>

        <!-- rarityStats section -->
        <template v-if="rollConfig">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-semibold">{{ t('player.addItem.rarityStats') }}</p>
            <span class="text-base-content/50 text-xs"
              >{{ selectedEntries.length }} / {{ slotsMax }}</span
            >
          </div>

          <!-- Mode toggle -->
          <div class="mb-4 flex gap-2">
            <button
              class="btn btn-sm flex-1"
              :class="rarityStatsMode === 'random' ? 'btn-neutral' : 'btn-ghost'"
              @click="rarityStatsMode = 'random'"
            >
              {{ t('player.addItem.modeRandom') }}
            </button>
            <button
              class="btn btn-sm flex-1"
              :class="rarityStatsMode === 'custom' ? 'btn-neutral' : 'btn-ghost'"
              @click="rarityStatsMode = 'custom'"
            >
              {{ t('player.addItem.modeCustom') }}
            </button>
          </div>

          <template v-if="rarityStatsMode === 'custom'">
            <!-- Options pool -->
            <p class="text-base-content/50 mb-2 text-xs">
              {{ t('player.addItem.availableStats') }}
            </p>
            <div class="mb-4 flex flex-wrap gap-2">
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

            <!-- Selected entries -->
            <div v-if="selectedEntries.length" class="flex flex-col gap-2">
              <div
                v-for="(entry, i) in selectedEntries"
                :key="entry.id"
                class="rounded-box border-base-200 flex gap-3 border p-3"
              >
                <!-- Index + label -->
                <div class="text-base-content/30 w-5 pt-0.5 text-xs">{{ i + 1 }}</div>
                <div class="flex flex-1 flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <span class="badge badge-outline font-mono text-xs">{{
                      t(`stat.key.${entry.stat}`)
                    }}</span>
                    <span class="badge badge-ghost badge-xs">{{
                      t(`stat.type.${entry.type}`)
                    }}</span>
                  </div>
                  <!-- Value mode -->
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
                  <p v-else-if="entry.valueMode === 'max'" class="text-base-content/50 text-xs">
                    max = {{ entry.max }}
                  </p>
                  <p v-else class="text-base-content/50 text-xs">
                    {{ t('player.addItem.randomRange', { min: entry.min, max: entry.max }) }}
                  </p>
                </div>
                <!-- Remove -->
                <button
                  class="btn btn-ghost btn-xs btn-square self-start"
                  @click="removeEntry(entry.id)"
                >
                  <XIcon class="size-3.5" />
                </button>
              </div>
            </div>
            <p v-else class="text-base-content/30 py-4 text-center text-xs">
              {{ t('player.addItem.noStatsSelected') }}
            </p>
          </template>
        </template>

        <div class="modal-action mt-4">
          <button class="btn btn-ghost" @click="close">{{ t('common.cancel') }}</button>
          <VButton class="btn-primary" :loading="submitLoading" @click="submit">
            {{ t('common.save') }}
          </VButton>
        </div>
      </template>
    </div>
  </dialog>
</template>
