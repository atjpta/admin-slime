<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import { UserStatus } from '@/enums/user.enum'
import { userService } from '@/services/api/user.service'
import type { User } from '@/interfaces/user.interface'

interface Props {
  user: User | null
}

const { user } = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: []
}>()

const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const status = ref<UserStatus | ''>('')
const loading = ref(false)

watch(
  () => user,
  (u) => {
    if (u) dialogRef.value?.showModal()
    status.value = u?.status ?? ''
  },
  { immediate: true }
)

const statusOptions = Object.values(UserStatus).map((value) => ({
  value,
  label: t(`user.status.${value}`),
}))

function close() {
  emit('close')
  dialogRef.value?.close()
}

async function submit() {
  if (!user || !status.value) return
  loading.value = true
  await userService.update(user._id, { status: status.value })
  toast.success(t('user.edit.success'))
  emit('updated')
  close()
  loading.value = false
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('user.edit.title') }}</h3>

      <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <span class="text-base-content/50 text-sm">{{ t('user.columns.email') }}</span>
            <span class="font-medium">{{ user?.email }}</span>
          </div>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('user.columns.status') }}</legend>
            <select v-model="status" class="select select-bordered w-full">
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </fieldset>
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
