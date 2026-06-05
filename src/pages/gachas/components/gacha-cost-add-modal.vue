<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VButton from '@/components/ui/btn/v-button.vue'
import { CurrencyCode, DrawType } from '@/enums/gacha.enum'
import type { GachaCost } from '@/interfaces/gacha.interface'

interface Props {
  open: boolean
}

const { open } = defineProps<Props>()
const emit = defineEmits<{
  close: []
  add: [cost: GachaCost]
}>()

const { t } = useI18n()

const form = ref<GachaCost>({
  drawType: DrawType.DRAW_1,
  currencyCode: CurrencyCode.GOLD,
  amount: 0,
})

watch(
  () => open,
  (v) => {
    if (v) {
      form.value = { drawType: DrawType.DRAW_1, currencyCode: CurrencyCode.GOLD, amount: 0 }
    }
  }
)

const drawTypeOptions = Object.values(DrawType)
const currencyOptions = Object.values(CurrencyCode)

function submit() {
  emit('add', { ...form.value, amount: Number(form.value.amount) })
  emit('close')
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-sm">
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.costs.addTitle') }}</h3>

      <div class="flex flex-col gap-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('gacha.costs.drawType') }}</legend>
          <select v-model="form.drawType" class="select select-bordered w-full">
            <option v-for="dt in drawTypeOptions" :key="dt" :value="dt">
              {{ t(`gacha.drawType.${dt}`) }}
            </option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('gacha.costs.currencyCode') }}</legend>
          <select v-model="form.currencyCode" class="select select-bordered w-full">
            <option v-for="cc in currencyOptions" :key="cc" :value="cc">
              {{ t(`gacha.currency.${cc}`) }}
            </option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('gacha.costs.amount') }}</legend>
          <input
            v-model.number="form.amount"
            type="number"
            min="0"
            class="input input-bordered w-full"
          />
        </fieldset>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="emit('close')">{{ t('common.cancel') }}</VButton>
        <VButton class="btn-primary" @click="submit">{{ t('common.save') }}</VButton>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @submit.prevent="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
