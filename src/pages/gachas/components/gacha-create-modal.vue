<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import { GachaRewardType } from '@/enums/gacha.enum'
import { gachaService } from '@/services/api/gacha.service'
import type { CreateGachaDto } from '@/interfaces/gacha.interface'

interface Props {
  open: boolean
}

const { open } = defineProps<Props>()
const emit = defineEmits<{
  close: []
  created: []
}>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const loading = ref(false)

const defaultForm = (): CreateGachaDto => ({
  code: '',
  type: GachaRewardType.EQUIPMENT,
  sortOrder: 0,
  startAt: undefined,
  endAt: undefined,
})

const form = ref(defaultForm())
const startAtLocal = ref('')
const endAtLocal = ref('')

watch(
  () => open,
  (v) => {
    if (v) {
      dialogRef.value?.showModal()
      form.value = defaultForm()
      startAtLocal.value = ''
      endAtLocal.value = ''
    } else {
      dialogRef.value?.close()
    }
  }
)

const typeOptions = Object.values(GachaRewardType)

function close() {
  emit('close')
  dialogRef.value?.close()
}

async function submit() {
  loading.value = true
  const dto: CreateGachaDto = {
    ...form.value,
    startAt: startAtLocal.value ? new Date(startAtLocal.value).toISOString() : undefined,
    endAt: endAtLocal.value ? new Date(endAtLocal.value).toISOString() : undefined,
  }
  await gachaService.create(dto)
  toast.success(t('gacha.create.success'))
  emit('created')
  close()
  loading.value = false
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-lg">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.create.title') }}</h3>

      <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
        <div class="flex flex-col gap-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('gacha.columns.code') }}</legend>
            <input
              v-model="form.code"
              type="text"
              class="input input-bordered w-full font-mono"
              :placeholder="t('gacha.create.codePlaceholder')"
            />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('gacha.columns.type') }}</legend>
            <select v-model="form.type" class="select select-bordered w-full">
              <option v-for="v in typeOptions" :key="v" :value="v">
                {{ t(`gacha.type.${v}`) }}
              </option>
            </select>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('gacha.columns.sortOrder') }}</legend>
            <input
              v-model.number="form.sortOrder"
              type="number"
              min="0"
              class="input input-bordered w-full"
            />
          </fieldset>

          <div class="grid grid-cols-2 gap-3">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('gacha.columns.startAt') }}</legend>
              <input
                v-model="startAtLocal"
                type="datetime-local"
                class="input input-bordered w-full"
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('gacha.columns.endAt') }}</legend>
              <input
                v-model="endAtLocal"
                type="datetime-local"
                class="input input-bordered w-full"
              />
            </fieldset>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="close">{{ t('common.cancel') }}</VButton>
        <VButton class="btn-primary" :loading="loading" @click="submit">
          {{ t('common.create') }}
        </VButton>
      </div>
    </div>
  </dialog>
</template>
