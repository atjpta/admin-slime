<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import { UserStatus } from '@/enums/user.enum'
import { userService } from '@/services/api/user.service'
import type { User } from '@/interfaces/user.interface'
import { useZodForm } from '@/composables/useZodForm'

const emit = defineEmits<{ close: []; updated: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()
const currentUser = ref<User | null>(null)

const statusOptions = Object.values(UserStatus).map((value) => ({
  value,
  label: t(`user.status.${value}`),
}))

const form = useForm({
  defaultValues: { status: '' as UserStatus | '' },
  onSubmit: async ({ value }) => {
    if (!currentUser.value || !value.status) return
    await userService.update(currentUser.value._id, { status: value.status })
    toast.success(t('user.edit.success'))
    emit('updated')
    close()
  },
})

defineExpose({ open })

function open(user: User) {
  currentUser.value = user
  form.reset({ status: user.status })
  dialogRef.value?.showModal()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box">
      <div class="absolute top-3 right-3">
        <VButton type="button" class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('user.edit.title') }}</h3>

      <form @submit.prevent="form.handleSubmit">
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-base-content/50 text-sm">{{ t('user.columns.email') }}</span>
              <span class="font-medium">{{ currentUser?.email }}</span>
            </div>

            <form.Field
              name="status"
              :validators="{ onChange: fieldValidator(z.string().min(1)) }"
            >
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('user.columns.status') }}</legend>
                  <select
                    :value="field.state.value"
                    class="select select-bordered w-full"
                    @change="field.handleChange(($event.target as HTMLSelectElement).value as UserStatus)"
                    @blur="field.handleBlur()"
                  >
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
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
