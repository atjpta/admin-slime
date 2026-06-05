<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import VButton from '@/components/ui/btn/v-button.vue'
import { GachaRewardType } from '@/enums/gacha.enum'
import { gachaService } from '@/services/api/gacha.service'
import { parseApiError } from '@/utils/api-error'
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
      form.value = defaultForm()
      startAtLocal.value = ''
      endAtLocal.value = ''
    }
  },
)

const typeOptions = Object.values(GachaRewardType)

async function submit() {
  loading.value = true
  try {
    const dto: CreateGachaDto = {
      ...form.value,
      startAt: startAtLocal.value ? new Date(startAtLocal.value).toISOString() : undefined,
      endAt: endAtLocal.value ? new Date(endAtLocal.value).toISOString() : undefined,
    }
    await gachaService.create(dto)
    toast.success(t('gacha.create.success'))
    emit('created')
    emit('close')
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-lg">
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.create.title') }}</h3>

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
          <input v-model.number="form.sortOrder" type="number" min="0" class="input input-bordered w-full" />
        </fieldset>

        <div class="grid grid-cols-2 gap-3">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('gacha.columns.startAt') }}</legend>
            <input v-model="startAtLocal" type="datetime-local" class="input input-bordered w-full" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('gacha.columns.endAt') }}</legend>
            <input v-model="endAtLocal" type="datetime-local" class="input input-bordered w-full" />
          </fieldset>
        </div>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="emit('close')">{{ t('common.cancel') }}</VButton>
        <VButton class="btn-primary" :loading="loading" @click="submit">
          {{ t('common.create') }}
        </VButton>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @submit.prevent="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
