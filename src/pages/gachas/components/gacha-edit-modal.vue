<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import VDatePicker from '@/components/ui/datepicker/v-date-picker.vue'
import { GachaStatus } from '@/enums/gacha.enum'
import { gachaService } from '@/services/api/gacha.service'
import type { Gacha } from '@/interfaces/gacha.interface'
import { useZodForm } from '@/composables/useZodForm'

const emit = defineEmits<{ close: []; updated: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()
const currentGacha = ref<Gacha | null>(null)

const statusOptions = Object.values(GachaStatus).map((v) => ({
  value: v,
  label: t(`gacha.status.${v}`),
}))

function toDateOnly(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

const form = useForm({
  defaultValues: {
    status: GachaStatus.INACTIVE as GachaStatus,
    sortOrder: 0,
    startDate: '',
    endDate: '',
  },
  onSubmit: async ({ value }) => {
    if (!currentGacha.value) return
    await gachaService.update(currentGacha.value._id, {
      status: value.status,
      sortOrder: Number(value.sortOrder),
      startDate: value.startDate || undefined,
      endDate: value.endDate || undefined,
    })
    toast.success(t('gacha.edit.success'))
    emit('updated')
    close()
  },
})

defineExpose({ open })

function open(gacha: Gacha) {
  currentGacha.value = gacha
  form.reset({
    status: gacha.status,
    sortOrder: gacha.sortOrder,
    startDate: gacha.startDate ? toDateOnly(gacha.startDate) : '',
    endDate: gacha.endDate ? toDateOnly(gacha.endDate) : '',
  })
  dialogRef.value?.showModal()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-lg">
      <div class="absolute top-3 right-3">
        <VButton type="button" class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.edit.title') }}</h3>

      <form @submit.prevent="form.handleSubmit">
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <div class="flex flex-col gap-4">
            <div class="bg-base-200 grid grid-cols-2 gap-3 rounded-xl p-3 text-sm">
              <div>
                <span class="text-base-content/50">{{ t('gacha.columns.code') }}</span>
                <p class="font-mono font-medium">{{ currentGacha?.code }}</p>
              </div>
              <div>
                <span class="text-base-content/50">{{ t('gacha.columns.type') }}</span>
                <p class="font-medium">{{ currentGacha ? t(`gacha.type.${currentGacha.type}`) : '' }}</p>
              </div>
            </div>

            <form.Field name="status">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('gacha.columns.status') }}</legend>
                  <select
                    :value="field.state.value"
                    class="select select-bordered w-full"
                    @change="field.handleChange(($event.target as HTMLSelectElement).value as GachaStatus)"
                  >
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </fieldset>
              </template>
            </form.Field>

            <form.Field name="sortOrder" :validators="{ onChange: fieldValidator(z.number().min(0)) }">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('gacha.columns.sortOrder') }}</legend>
                  <input
                    :value="field.state.value"
                    type="number"
                    min="0"
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

            <div class="grid grid-cols-2 gap-3">
              <form.Field name="startDate">
                <template #default="{ field }">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">{{ t('gacha.columns.startAt') }}</legend>
                    <VDatePicker
                      :model-value="field.state.value"
                      :placeholder="t('common.select')"
                      @update:model-value="field.handleChange"
                    />
                  </fieldset>
                </template>
              </form.Field>

              <form.Field name="endDate">
                <template #default="{ field }">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">{{ t('gacha.columns.endAt') }}</legend>
                    <VDatePicker
                      :model-value="field.state.value"
                      :placeholder="t('common.select')"
                      @update:model-value="field.handleChange"
                    />
                  </fieldset>
                </template>
              </form.Field>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <VButton type="button" class="btn-ghost" @click="close">{{ t('common.cancel') }}</VButton>
          <VButton type="submit" class="btn-primary" :loading="form.state.isSubmitting">
            {{ t('common.save') }}
          </VButton>
        </div>
      </form>
    </div>
  </dialog>
</template>
