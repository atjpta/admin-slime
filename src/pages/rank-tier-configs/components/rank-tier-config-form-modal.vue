<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import { rankTierConfigService } from '@/services/api/rank-tier-config.service'
import type { RankTierConfig } from '@/interfaces/rank.interface'
import { useZodForm } from '@/composables/useZodForm'

const emit = defineEmits<{ close: []; saved: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()
const currentItem = ref<RankTierConfig | null>(null)
const isEdit = computed(() => !!currentItem.value)

const form = useForm({
  defaultValues: { code: '', minPoint: 0 },
  onSubmit: async ({ value }) => {
    if (isEdit.value && currentItem.value) {
      await rankTierConfigService.update(currentItem.value._id, {
        code: value.code,
        minPoint: Number(value.minPoint),
      })
      toast.success(t('rankTierConfig.edit.success'))
    } else {
      await rankTierConfigService.create({
        code: value.code,
        minPoint: Number(value.minPoint),
      })
      toast.success(t('rankTierConfig.create.success'))
    }
    emit('saved')
    close()
  },
})

defineExpose({ open })

function open(item?: RankTierConfig) {
  currentItem.value = item ?? null
  if (item) form.reset({ code: item.code, minPoint: item.minPoint })
  else form.reset({ code: '', minPoint: 0 })
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
      <h3 class="mb-4 text-lg font-semibold">
        {{ isEdit ? t('rankTierConfig.edit.title') : t('rankTierConfig.create.title') }}
      </h3>

      <form @submit.prevent="form.handleSubmit">
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <div class="flex flex-col gap-4">
            <form.Field name="code" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('rankTierConfig.fields.code') }}</legend>
                  <input
                    :value="field.state.value"
                    type="text"
                    class="input input-bordered w-full font-mono"
                    :placeholder="t('rankTierConfig.fields.code')"
                    @input="field.handleChange(($event.target as HTMLInputElement).value)"
                    @blur="field.handleBlur()"
                  />
                  <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                    {{ field.state.meta.errors[0] }}
                  </p>
                </fieldset>
              </template>
            </form.Field>

            <form.Field name="minPoint" :validators="{ onChange: fieldValidator(z.number().min(0)) }">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('rankTierConfig.fields.minPoint') }}</legend>
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
