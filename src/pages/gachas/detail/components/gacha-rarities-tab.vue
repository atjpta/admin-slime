<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import { gachaService } from '@/services/api/gacha.service'
import { ItemRarity } from '@/enums/item.enum'
import type { Gacha, GachaRarity } from '@/interfaces/gacha.interface'

const props = defineProps<{ gacha: Gacha }>()
const emit = defineEmits<{ saved: [] }>()
const { t } = useI18n()

const ALL_RARITIES = [
  ItemRarity.COMMON,
  ItemRarity.RARE,
  ItemRarity.EPIC,
  ItemRarity.LEGENDARY,
] as const
const rarities = ref<GachaRarity[]>([])
const saving = ref(false)

watch(
  () => props.gacha,
  (g) => {
    rarities.value = ALL_RARITIES.map((r) => {
      const found = g.rarities.find((x) => x.rarity === r)
      return { rarity: r, rate: found?.rate ?? 0 }
    })
  },
  { immediate: true }
)

async function save() {
  saving.value = true
  await gachaService.updateRarities(props.gacha._id, rarities.value)
  toast.success(t('gacha.rarities.updateSuccess'))
  emit('saved')
  saving.value = false
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-end">
      <VButton class="btn-primary btn-sm" :loading="saving" @click="save">
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
</template>
