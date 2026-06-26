<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import { GachaStatus } from '@/enums/gacha.enum'
import { gachaService } from '@/services/api/gacha.service'
import type { Gacha, UpdateGachaDto } from '@/interfaces/gacha.interface'

interface Props {
  gacha: Gacha | null
}

const { gacha } = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: []
}>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const loading = ref(false)

const form = ref({
  status: GachaStatus.INACTIVE as GachaStatus,
  startAt: '',
  endAt: '',
  sortOrder: 0,
})

watch(
  () => gacha,
  (g) => {
    if (!g) return
    dialogRef.value?.showModal()
    form.value = {
      status: g.status,
      startAt: g.startAt ? toDatetimeLocal(g.startAt) : '',
      endAt: g.endAt ? toDatetimeLocal(g.endAt) : '',
      sortOrder: g.sortOrder,
    }
  },
  { immediate: true }
)

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 16)
}

const statusOptions = Object.values(GachaStatus).map((v) => ({
  value: v,
  label: t(`gacha.status.${v}`),
}))

function close() {
  emit('close')
  dialogRef.value?.close()
}

async function submit() {
  if (!gacha) return
  loading.value = true
  const dto: UpdateGachaDto = {
    status: form.value.status,
    sortOrder: Number(form.value.sortOrder),
    startAt: form.value.startAt ? new Date(form.value.startAt).toISOString() : undefined,
    endAt: form.value.endAt ? new Date(form.value.endAt).toISOString() : undefined,
  }
  await gachaService.update(gacha._id, dto)
  toast.success(t('gacha.edit.success'))
  emit('updated')
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
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.edit.title') }}</h3>

      <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
        <div class="flex flex-col gap-4">
          <div class="bg-base-200 grid grid-cols-2 gap-3 rounded-xl p-3 text-sm">
            <div>
              <span class="text-base-content/50">{{ t('gacha.columns.code') }}</span>
              <p class="font-mono font-medium">{{ gacha?.code }}</p>
            </div>
            <div>
              <span class="text-base-content/50">{{ t('gacha.columns.type') }}</span>
              <p class="font-medium">{{ gacha ? t(`gacha.type.${gacha.type}`) : '' }}</p>
            </div>
          </div>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('gacha.columns.status') }}</legend>
            <select v-model="form.status" class="select select-bordered w-full">
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
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
                v-model="form.startAt"
                type="datetime-local"
                class="input input-bordered w-full"
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('gacha.columns.endAt') }}</legend>
              <input
                v-model="form.endAt"
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
          {{ t('common.save') }}
        </VButton>
      </div>
    </div>
  </dialog>
</template>
