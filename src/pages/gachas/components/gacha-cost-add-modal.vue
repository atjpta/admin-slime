<script setup lang="ts">
import { watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import VButton from '@/components/ui/btn/v-button.vue'
import { CurrencyCode, DrawType } from '@/enums/gacha.enum'
import type { GachaCost } from '@/interfaces/gacha.interface'
import { useZodForm } from '@/composables/useZodForm'

interface Props {
  open: boolean
}

const { open } = defineProps<Props>()
const emit = defineEmits<{ close: []; add: [cost: GachaCost] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()

const drawTypeOptions = Object.values(DrawType)
const currencyOptions = Object.values(CurrencyCode)

const form = useForm({
  defaultValues: {
    drawType: DrawType.DRAW_1 as DrawType,
    currencyCode: CurrencyCode.GOLD as CurrencyCode,
    amount: 0,
  },
  onSubmit: ({ value }) => {
    emit('add', { ...value, amount: Number(value.amount) })
    close()
  },
})

watch(
  () => open,
  (v) => {
    if (v) {
      dialogRef.value?.showModal()
      form.reset({ drawType: DrawType.DRAW_1, currencyCode: CurrencyCode.GOLD, amount: 0 })
    } else {
      dialogRef.value?.close()
    }
  }
)

function close() {
  emit('close')
  dialogRef.value?.close()
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-sm">
      <div class="absolute top-3 right-3">
        <VButton type="button" class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.costs.addTitle') }}</h3>

      <form @submit.prevent="form.handleSubmit">
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <div class="flex flex-col gap-4">
            <form.Field name="drawType">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('gacha.costs.drawType') }}</legend>
                  <select
                    :value="field.state.value"
                    class="select select-bordered w-full"
                    @change="field.handleChange(($event.target as HTMLSelectElement).value as DrawType)"
                  >
                    <option v-for="dt in drawTypeOptions" :key="dt" :value="dt">
                      {{ t(`gacha.drawType.${dt}`) }}
                    </option>
                  </select>
                </fieldset>
              </template>
            </form.Field>

            <form.Field name="currencyCode">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('gacha.costs.currencyCode') }}</legend>
                  <select
                    :value="field.state.value"
                    class="select select-bordered w-full"
                    @change="field.handleChange(($event.target as HTMLSelectElement).value as CurrencyCode)"
                  >
                    <option v-for="cc in currencyOptions" :key="cc" :value="cc">
                      {{ t(`gacha.currency.${cc}`) }}
                    </option>
                  </select>
                </fieldset>
              </template>
            </form.Field>

            <form.Field name="amount" :validators="{ onChange: fieldValidator(z.number().min(1)) }">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('gacha.costs.amount') }}</legend>
                  <input
                    :value="field.state.value"
                    type="number"
                    min="1"
                    class="input input-bordered w-full"
                    @input="field.handleChange(+($event.target as HTMLInputElement).value)"
                    @blur="field.handleBlur()"
                  />
                  <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                    {{ field.state.meta.errors[0] }}
                  </p>
                </fieldset>
              </template>
            </form.Field>
          </div>
        </div>

        <div class="modal-action">
          <VButton type="button" class="btn-ghost" @click="close">{{ t('common.cancel') }}</VButton>
          <VButton type="submit" class="btn-primary">{{ t('common.save') }}</VButton>
        </div>
      </form>
    </div>
  </dialog>
</template>
