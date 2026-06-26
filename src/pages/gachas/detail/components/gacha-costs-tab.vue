<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from '@/utils/toast'
import { PlusIcon, TrashIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import GachaCostAddModal from '../../components/gacha-cost-add-modal.vue'
import { gachaService } from '@/services/api/gacha.service'
import { CurrencyCode, DrawType } from '@/enums/gacha.enum'
import type { Gacha, GachaCost } from '@/interfaces/gacha.interface'

const props = defineProps<{ gacha: Gacha }>()
const emit = defineEmits<{ saved: [] }>()
const { t } = useI18n()

const costs = ref<GachaCost[]>([])
const saving = ref(false)
const showAddModal = ref(false)

watch(
  () => props.gacha,
  (g) => {
    costs.value = g.costs.map((c) => ({ ...c }))
  },
  { immediate: true }
)

const currencyOptions = Object.values(CurrencyCode)
const drawTypeOptions = Object.values(DrawType)

function addCost(cost: GachaCost) {
  costs.value.push(cost)
}
function removeCost(index: number) {
  costs.value.splice(index, 1)
}

async function save() {
  saving.value = true
  await gachaService.updateCosts(props.gacha._id, costs.value)
  toast.success(t('gacha.costs.updateSuccess'))
  emit('saved')
  saving.value = false
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-end gap-2">
      <VButton :icon="PlusIcon" class="btn-ghost btn-sm" @click="showAddModal = true">
        {{ t('gacha.costs.addRow') }}
      </VButton>
      <VButton class="btn-primary btn-sm" :loading="saving" @click="save">
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
              <select v-model="cost.currencyCode" class="select select-bordered select-sm w-28">
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
                @click="removeCost(i)"
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

  <GachaCostAddModal :open="showAddModal" @close="showAddModal = false" @add="addCost" />
</template>
