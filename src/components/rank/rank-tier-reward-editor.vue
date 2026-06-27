<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon, Trash2Icon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import RankItemAdder, { type SelectedItem } from './rank-item-adder.vue'
import { rankTierConfigService } from '@/services/api/rank-tier-config.service'
import { CurrencyCode } from '@/enums/gacha.enum'
import type { RankTierConfig } from '@/interfaces/rank.interface'

export interface CurrencyRow {
  type: string
  value: number
}

export interface ItemRow {
  itemId: string
  itemCode: string
  quantity: number
  source: string
}

export interface TierRewardForm {
  tierId: string
  currency: CurrencyRow[]
  items: ItemRow[]
}

const props = defineProps<{ modelValue: TierRewardForm[] }>()
const emit = defineEmits<{ 'update:modelValue': [TierRewardForm[]] }>()

const { t } = useI18n()
const tiers = ref<RankTierConfig[]>([])
const currencyOptions = Object.values(CurrencyCode).map((v) => ({
  value: v,
  label: t(`gacha.currency.${v}`),
}))

onMounted(async () => {
  const res = await rankTierConfigService.index({ page: 1, limit: 100 })
  tiers.value = res.items
})

function update(rows: TierRewardForm[]) {
  emit('update:modelValue', rows)
}

function addTier() {
  update([...props.modelValue, { tierId: '', currency: [], items: [] }])
}

function removeTier(idx: number) {
  const rows = [...props.modelValue]
  rows.splice(idx, 1)
  update(rows)
}

function setTierId(idx: number, val: string) {
  update(props.modelValue.map((r, i) => (i === idx ? { ...r, tierId: val } : r)))
}

function addCurrency(tierIdx: number) {
  update(
    props.modelValue.map((r, i) =>
      i !== tierIdx ? r : { ...r, currency: [...r.currency, { type: CurrencyCode.GOLD, value: 0 }] }
    )
  )
}

function removeCurrency(tierIdx: number, curIdx: number) {
  update(
    props.modelValue.map((r, i) =>
      i !== tierIdx ? r : { ...r, currency: r.currency.filter((_, ci) => ci !== curIdx) }
    )
  )
}

function setCurrencyType(tierIdx: number, curIdx: number, val: string) {
  update(
    props.modelValue.map((r, i) =>
      i !== tierIdx
        ? r
        : { ...r, currency: r.currency.map((c, ci) => (ci === curIdx ? { ...c, type: val } : c)) }
    )
  )
}

function setCurrencyValue(tierIdx: number, curIdx: number, val: number) {
  update(
    props.modelValue.map((r, i) =>
      i !== tierIdx
        ? r
        : { ...r, currency: r.currency.map((c, ci) => (ci === curIdx ? { ...c, value: val } : c)) }
    )
  )
}

function onItemSelected(tierIdx: number, selected: SelectedItem) {
  const already = props.modelValue[tierIdx]?.items.some((it) => it.itemId === selected.itemId)
  if (already) return
  update(
    props.modelValue.map((r, i) => (i !== tierIdx ? r : { ...r, items: [...r.items, selected] }))
  )
}

function removeItem(tierIdx: number, itemIdx: number) {
  update(
    props.modelValue.map((r, i) =>
      i !== tierIdx ? r : { ...r, items: r.items.filter((_, ii) => ii !== itemIdx) }
    )
  )
}

function setItemQuantity(tierIdx: number, itemIdx: number, val: number) {
  update(
    props.modelValue.map((r, i) =>
      i !== tierIdx
        ? r
        : { ...r, items: r.items.map((it, ii) => (ii === itemIdx ? { ...it, quantity: val } : it)) }
    )
  )
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="(row, tierIdx) in modelValue"
      :key="tierIdx"
      class="rounded-box border-base-300 border p-3"
    >
      <!-- Tier selector -->
      <div class="mb-3 flex items-center gap-2">
        <select
          :value="row.tierId"
          class="select select-bordered select-sm flex-1"
          @change="setTierId(tierIdx, ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>{{ t('rankConfig.rewards.selectTier') }}...</option>
          <option v-for="tier in tiers" :key="tier._id" :value="tier._id">
            {{ tier.code }} (≥ {{ tier.minPoint.toLocaleString() }})
          </option>
        </select>
        <VButton
          type="button"
          :icon="Trash2Icon"
          class="btn-ghost btn-sm text-error"
          @click="removeTier(tierIdx)"
        />
      </div>

      <!-- Currency -->
      <div class="mb-3">
        <div class="mb-1.5 flex items-center justify-between">
          <span class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
            {{ t('mail.fields.addCurrency') }}
          </span>
          <VButton
            type="button"
            :icon="PlusIcon"
            class="btn-ghost btn-xs"
            @click="addCurrency(tierIdx)"
          >
            {{ t('common.add') }}
          </VButton>
        </div>
        <div class="flex flex-col gap-1.5">
          <div v-for="(cur, curIdx) in row.currency" :key="curIdx" class="flex items-center gap-2">
            <select
              :value="cur.type"
              class="select select-bordered select-xs w-28"
              @change="setCurrencyType(tierIdx, curIdx, ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <input
              :value="cur.value"
              type="number"
              min="1"
              class="input input-bordered input-xs flex-1"
              @input="setCurrencyValue(tierIdx, curIdx, +($event.target as HTMLInputElement).value)"
            />
            <VButton
              type="button"
              :icon="Trash2Icon"
              class="btn-ghost btn-xs text-error"
              @click="removeCurrency(tierIdx, curIdx)"
            />
          </div>
          <p v-if="!row.currency.length" class="text-base-content/30 text-xs">—</p>
        </div>
      </div>

      <!-- Items -->
      <div>
        <span class="text-base-content/60 mb-1.5 block text-xs font-medium tracking-wide uppercase">
          {{ t('mail.fields.addItem') }}
        </span>
        <div class="flex flex-col gap-1.5">
          <div
            v-for="(item, itemIdx) in row.items"
            :key="item.itemId"
            class="flex items-center gap-2"
          >
            <span class="min-w-0 flex-1 font-mono text-sm">{{ item.itemCode }}</span>
            <label class="input input-bordered input-xs w-40">
              <span class="label">{{ t('player.detail.quantity') }}</span>
              <input
                :value="item.quantity"
                type="number"
                min="1"
                class="text-center"
                @input="
                  setItemQuantity(tierIdx, itemIdx, +($event.target as HTMLInputElement).value)
                "
              />
            </label>
            <VButton
              type="button"
              :icon="Trash2Icon"
              class="btn-ghost btn-xs text-error"
              @click="removeItem(tierIdx, itemIdx)"
            />
          </div>
          <!-- auto-search adder -->
          <RankItemAdder @select="onItemSelected(tierIdx, $event)" />
        </div>
      </div>
    </div>

    <VButton type="button" :icon="PlusIcon" class="btn-outline btn-sm w-full" @click="addTier">
      {{ t('rankConfig.rewards.addTier') }}
    </VButton>
  </div>
</template>
