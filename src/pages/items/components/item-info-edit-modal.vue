<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import { ItemType, ItemRarity, ItemStatus } from '@/enums/item.enum'
import type { Item } from '@/interfaces/item.interface'
import { itemService } from '@/services/api/item.service'
import { useZodForm } from '@/composables/useZodForm'

const props = defineProps<{ item: Item | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()

const form = useForm({
  defaultValues: {
    type: '' as ItemType,
    rarity: '' as ItemRarity,
    status: '' as ItemStatus,
    sellPrice: 0,
    stackable: false,
  },
  onSubmit: async ({ value }) => {
    if (!props.item) return
    await itemService.updateInfo(props.item._id, value)
    toast.success(t('item.equipment.info.updateSuccess'))
    emit('saved')
    close()
  },
})

defineExpose({ open })

watch(
  () => props.item,
  (item) => {
    if (!item) return
    form.reset({
      type: item.type,
      rarity: item.rarity,
      status: item.status,
      sellPrice: item.sellPrice ?? 0,
      stackable: item.stackable ?? false,
    })
  }
)

function open() {
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
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('item.equipment.info.editTitle') }}</h3>
      <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
        <form id="item-info-edit-modal-form" class="flex flex-col gap-3" @submit.prevent="form.handleSubmit">
          <form.Field name="type">
            <template #default="{ field }">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('item.columns.type') }}</legend>
                <select
                  :value="field.state.value"
                  class="select select-bordered w-full"
                  @change="
                    field.handleChange(($event.target as HTMLSelectElement).value as ItemType)
                  "
                  @blur="field.handleBlur()"
                >
                  <option v-for="v in ItemType" :key="v" :value="v">
                    {{ t(`item.type.${v}`) }}
                  </option>
                </select>
              </fieldset>
            </template>
          </form.Field>

          <form.Field name="rarity">
            <template #default="{ field }">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('item.columns.rarity') }}</legend>
                <select
                  :value="field.state.value"
                  class="select select-bordered w-full"
                  @change="
                    field.handleChange(($event.target as HTMLSelectElement).value as ItemRarity)
                  "
                  @blur="field.handleBlur()"
                >
                  <option v-for="v in ItemRarity" :key="v" :value="v">
                    {{ t(`item.rarity.${v}`) }}
                  </option>
                </select>
              </fieldset>
            </template>
          </form.Field>

          <form.Field name="status">
            <template #default="{ field }">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('item.columns.status') }}</legend>
                <select
                  :value="field.state.value"
                  class="select select-bordered w-full"
                  @change="
                    field.handleChange(($event.target as HTMLSelectElement).value as ItemStatus)
                  "
                  @blur="field.handleBlur()"
                >
                  <option v-for="v in ItemStatus" :key="v" :value="v">
                    {{ t(`item.status.${v}`) }}
                  </option>
                </select>
              </fieldset>
            </template>
          </form.Field>

          <form.Field
            name="sellPrice"
            :validators="{ onChange: fieldValidator(z.number().min(0)) }"
          >
            <template #default="{ field }">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('item.columns.sellPrice') }}</legend>
                <input
                  type="number"
                  min="0"
                  class="input input-bordered w-full"
                  :value="field.state.value"
                  @input="field.handleChange(+($event.target as HTMLInputElement).value)"
                  @blur="field.handleBlur()"
                />
                <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                  {{ field.state.meta.errors[0] }}
                </p>
              </fieldset>
            </template>
          </form.Field>

          <form.Field name="stackable">
            <template #default="{ field }">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm checkbox-primary"
                  :checked="field.state.value"
                  @change="field.handleChange(($event.target as HTMLInputElement).checked)"
                  @blur="field.handleBlur()"
                />
                <span class="label-text">{{ t('item.columns.stackable') }}</span>
              </label>
            </template>
          </form.Field>
        </form>
      </div>
      <div class="modal-action">
        <VButton type="button" form="item-info-edit-modal-form" class="btn-ghost" :disabled="form.state.isSubmitting" @click="close">
          {{ t('common.cancel') }}
        </VButton>
        <VButton type="submit" form="item-info-edit-modal-form" class="btn-primary" :loading="form.state.isSubmitting">
          {{ t('common.save') }}
        </VButton>
      </div>
    </div>
  </dialog>
</template>
