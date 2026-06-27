<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import { RankMode } from '@/enums/rank.enum'
import { rankConfigService } from '@/services/api/rank-config.service'
import type { RankConfig } from '@/interfaces/rank.interface'
import { useZodForm } from '@/composables/useZodForm'

const emit = defineEmits<{ close: []; saved: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()

const sourceId = ref('')

const rankModeOptions = Object.values(RankMode).map((v) => ({
  value: v,
  label: t(`rankConfig.rankMode.${v}`),
}))

const form = useForm({
  defaultValues: { code: '', rankMode: RankMode.RANK },
  onSubmit: async ({ value }) => {
    await rankConfigService.clone(sourceId.value, { code: value.code, rankMode: value.rankMode })
    toast.success(t('rankConfig.clone.success'))
    emit('saved')
    close()
  },
})

defineExpose({ open })

function open(item: RankConfig) {
  sourceId.value = item._id
  form.reset({ code: '', rankMode: item.rankMode })
  dialogRef.value?.showModal()
}

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
      <h3 class="mb-4 text-lg font-semibold">{{ t('rankConfig.clone.title') }}</h3>

      <form id="clone-rank-config-form" @submit.prevent="form.handleSubmit">
        <div class="flex flex-col gap-4">
          <form.Field name="code" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
            <template #default="{ field }">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('rankConfig.fields.code') }}</legend>
                <input
                  :value="field.state.value"
                  type="text"
                  class="input input-bordered w-full"
                  :placeholder="t('rankConfig.clone.codePlaceholder')"
                  @input="field.handleChange(($event.target as HTMLInputElement).value)"
                  @blur="field.handleBlur()"
                />
                <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                  {{ field.state.meta.errors[0] }}
                </p>
              </fieldset>
            </template>
          </form.Field>

          <form.Field name="rankMode" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
            <template #default="{ field }">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('rankConfig.fields.rankMode') }}</legend>
                <select
                  :value="field.state.value"
                  class="select select-bordered w-full"
                  @change="field.handleChange(($event.target as HTMLSelectElement).value as RankMode)"
                >
                  <option v-for="opt in rankModeOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </fieldset>
            </template>
          </form.Field>
        </div>
      </form>

      <div class="modal-action">
        <VButton type="button" form="clone-rank-config-form" class="btn-ghost" @click="close">
          {{ t('common.cancel') }}
        </VButton>
        <VButton
          type="submit"
          form="clone-rank-config-form"
          class="btn-primary"
          :loading="form.state.isSubmitting"
        >
          {{ t('rankConfig.clone.submit') }}
        </VButton>
      </div>
    </div>
  </dialog>
</template>
