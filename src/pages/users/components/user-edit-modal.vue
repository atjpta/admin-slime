<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import VButton from '@/components/ui/btn/v-button.vue'
import { UserStatus } from '@/enums/user.enum'
import { userService } from '@/services/api/user.service'
import { parseApiError } from '@/utils/api-error'
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

const status = ref<UserStatus | ''>('')
const loading = ref(false)

watch(
  () => user,
  (u) => {
    status.value = u?.status ?? ''
  },
  { immediate: true }
)

const statusOptions = Object.values(UserStatus).map((value) => ({
  value,
  label: t(`user.status.${value}`),
}))

async function submit() {
  if (!user || !status.value) return
  loading.value = true
  try {
    await userService.update(user._id, { status: status.value })
    toast.success(t('user.edit.success'))
    emit('updated')
    emit('close')
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': !!user }">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-semibold">{{ t('user.edit.title') }}</h3>

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

      <div class="modal-action">
        <VButton class="btn-ghost" @click="emit('close')">{{ t('common.cancel') }}</VButton>
        <VButton class="btn-primary" :loading="loading" @click="submit">
          {{ t('common.save') }}
        </VButton>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @submit.prevent="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
