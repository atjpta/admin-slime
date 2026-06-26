<script setup lang="ts">
import { useTemplateRef, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import { PlusIcon, Trash2Icon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { StatKey, StatType } from '@/enums/stat.enum'
import type { Item, EquipmentStat, ItemEquipmentMetadata } from '@/interfaces/item.interface'
import { itemService } from '@/services/api/item.service'
import { useZodForm } from '@/composables/useZodForm'

const props = defineProps<{ item: Item | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const listEl = useTemplateRef<HTMLElement>('listEl')
const { fieldValidator } = useZodForm()

const form = useForm({
  defaultValues: { stats: [] as EquipmentStat[] },
  onSubmit: async ({ value }) => {
    if (!props.item || !value.stats.length) return
    await itemService.updateStats(props.item._id, { stats: value.stats })
    toast.success(t('item.equipment.stats.updateSuccess'))
    emit('saved')
    close()
  },
})

defineExpose({ open })

watch(
  () => props.item,
  (item) => {
    if (!item) return
    const meta = item.metadata as ItemEquipmentMetadata | undefined
    form.setFieldValue(
      'stats',
      (meta?.stats ?? []).map((s) => ({ ...s }))
    )
  }
)

function open() {
  dialogRef.value?.showModal()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}

async function addStat() {
  form.pushFieldValue('stats', { stat: StatKey.ATTACK, type: StatType.FLAT, value: 1 })
  await nextTick()
  if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
}

const statKeyOptions = Object.values(StatKey)
const statTypeOptions = Object.values(StatType)
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-lg">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('item.equipment.tabs.stats') }}</h3>

      <form
        id="item-stats-edit-modal-form"
        ref="listEl"
        @submit.prevent="form.handleSubmit"
        class="-mx-6 max-h-[50dvh] overflow-y-auto px-6"
      >
        <div class="flex flex-col gap-2">
          <form.Field name="stats" mode="array">
            <template #default="{ field: statsField }">
              <div
                v-for="(_, i) in statsField.state.value"
                :key="i"
                class="bg-base-200 grid grid-cols-[1fr_1fr_80px_32px] items-center gap-2 rounded-lg p-2"
              >
                <form.Field :name="`stats[${i}].stat`">
                  <template #default="{ field }">
                    <select
                      :value="field.state.value"
                      class="select select-bordered select-sm w-full"
                      @change="
                        field.handleChange(($event.target as HTMLSelectElement).value as StatKey)
                      "
                    >
                      <option v-for="k in statKeyOptions" :key="k" :value="k">
                        {{ t(`stat.key.${k}`) }}
                      </option>
                    </select>
                  </template>
                </form.Field>

                <form.Field :name="`stats[${i}].type`">
                  <template #default="{ field }">
                    <select
                      :value="field.state.value"
                      class="select select-bordered select-sm w-full"
                      @change="
                        field.handleChange(($event.target as HTMLSelectElement).value as StatType)
                      "
                    >
                      <option v-for="tp in statTypeOptions" :key="tp" :value="tp">
                        {{ t(`stat.type.${tp}`) }}
                      </option>
                    </select>
                  </template>
                </form.Field>

                <form.Field
                  :name="`stats[${i}].value`"
                  :validators="{ onChange: fieldValidator(z.number().min(0.01)) }"
                >
                  <template #default="{ field }">
                    <input
                      type="number"
                      class="input input-bordered input-sm w-full"
                      :value="field.state.value"
                      :step="statsField.state.value[i]?.type === StatType.PERCENT ? 0.01 : 1"
                      :min="statsField.state.value[i]?.type === StatType.PERCENT ? 0.01 : 1"
                      @input="field.handleChange(+($event.target as HTMLInputElement).value)"
                      @blur="field.handleBlur()"
                    />
                  </template>
                </form.Field>

                <VButton
                  type="button"
                  :icon="Trash2Icon"
                  class="btn-ghost btn-sm text-error"
                  @click="statsField.removeValue(i)"
                />
              </div>

              <VButton
                type="button"
                :icon="PlusIcon"
                class="btn-ghost btn-sm self-start"
                @click="addStat()"
              >
                {{ t('common.add') }}
              </VButton>
            </template>
          </form.Field>
        </div>
      </form>
      <div class="modal-action">
        <VButton
          type="button"
          form="item-stats-edit-modal-form"
          class="btn-ghost"
          :disabled="form.state.isSubmitting"
          @click="close"
        >
          {{ t('common.cancel') }}
        </VButton>
        <VButton
          type="submit"
          form="item-stats-edit-modal-form"
          class="btn-primary"
          :loading="form.state.isSubmitting"
        >
          {{ t('common.save') }}
        </VButton>
      </div>
    </div>
  </dialog>
</template>
