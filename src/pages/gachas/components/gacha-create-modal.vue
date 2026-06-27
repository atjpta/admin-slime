<script setup lang="ts">
import { watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import VDatePicker from '@/components/ui/datepicker/v-date-picker.vue'
import { GachaRewardType } from '@/enums/gacha.enum'
import { gachaService } from '@/services/api/gacha.service'
import { useZodForm } from '@/composables/useZodForm'

interface Props {
  open: boolean
}

const { open } = defineProps<Props>()
const emit = defineEmits<{ close: []; created: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()

const typeOptions = Object.values(GachaRewardType)

const form = useForm({
  defaultValues: {
    code: '',
    type: GachaRewardType.EQUIPMENT as GachaRewardType,
    sortOrder: 0,
    startDate: '',
    endDate: '',
  },
  onSubmit: async ({ value }) => {
    await gachaService.create({
      code: value.code,
      type: value.type,
      sortOrder: value.sortOrder,
      startDate: value.startDate || undefined,
      endDate: value.endDate || undefined,
    })
    toast.success(t('gacha.create.success'))
    emit('created')
    close()
  },
})

watch(
  () => open,
  (v) => {
    if (v) {
      dialogRef.value?.showModal()
      form.reset({ code: '', type: GachaRewardType.EQUIPMENT, sortOrder: 0, startDate: '', endDate: '' })
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
    <div class="modal-box max-w-lg">
      <div class="absolute top-3 right-3">
        <VButton type="button" class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.create.title') }}</h3>

      <form @submit.prevent="form.handleSubmit">
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <div class="flex flex-col gap-4">
            <form.Field name="code" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('gacha.columns.code') }}</legend>
                  <input
                    :value="field.state.value"
                    type="text"
                    class="input input-bordered w-full font-mono"
                    :placeholder="t('gacha.create.codePlaceholder')"
                    @input="field.handleChange(($event.target as HTMLInputElement).value)"
                    @blur="field.handleBlur()"
                  />
                  <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                    {{ field.state.meta.errors[0] }}
                  </p>
                </fieldset>
              </template>
            </form.Field>

            <form.Field name="type">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('gacha.columns.type') }}</legend>
                  <select
                    :value="field.state.value"
                    class="select select-bordered w-full"
                    @change="field.handleChange(($event.target as HTMLSelectElement).value as GachaRewardType)"
                  >
                    <option v-for="v in typeOptions" :key="v" :value="v">
                      {{ t(`gacha.type.${v}`) }}
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
            {{ t('common.create') }}
          </VButton>
        </div>
      </form>
    </div>
  </dialog>
</template>
