<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import { PlusIcon, Trash2Icon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { mailService } from '@/services/api/mail.service'
import { mailTemplateService } from '@/services/api/mail-template.service'
import { CurrencyCode } from '@/enums/gacha.enum'
import MailReceiverPicker from './mail-receiver-picker.vue'
import MailItemRewardEditor from './mail-item-reward-editor.vue'
import type { ItemRewardRow } from './mail-item-reward-editor.vue'
import type { Player } from '@/interfaces/player.interface'
import type { MailTemplate, CurrencyReward } from '@/interfaces/mail.interface'
import { useZodForm } from '@/composables/useZodForm'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; sent: [] }>()
const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()

watch(
  () => props.open,
  (v) => {
    if (v) dialogRef.value?.showModal()
    else dialogRef.value?.close()
  }
)

const templates = ref<MailTemplate[]>([])

async function loadTemplates() {
  try {
    const res = await mailTemplateService.index({ page: 1, limit: 100 })
    templates.value = res.items
  } catch {
    /* ignore */
  }
}
loadTemplates()

// Dynamic state (outside TanStack Form)
const useTemplate = ref(false)
const templateId = ref('')
const receiversMode = ref<'all' | 'custom'>('all')
const selectedPlayers = ref<Player[]>([])
const sendToNewPlayers = ref(false)
const saveAsTemplate = ref(false)
const templateName = ref('')
const currencies = ref<CurrencyReward[]>([])
const itemRows = ref<ItemRewardRow[]>([])

watch(useTemplate, (v) => {
  if (!v) templateId.value = ''
})

watch(templateId, (id) => {
  const tpl = templates.value.find((t) => t._id === id)
  if (!tpl) return
  form.setFieldValue('titleVi', tpl.title.vi)
  form.setFieldValue('titleEn', tpl.title.en)
  form.setFieldValue('contentVi', tpl.content.vi)
  form.setFieldValue('contentEn', tpl.content.en)
  form.setFieldValue('expirationDuration', tpl.expirationDuration)
})

const currencyOptions = Object.values(CurrencyCode).map((v) => ({
  value: v,
  label: t(`gacha.currency.${v}`),
}))

function addCurrency() {
  currencies.value.push({ type: CurrencyCode.GOLD, value: 1 })
}

const form = useForm({
  defaultValues: {
    titleVi: '',
    titleEn: '',
    contentVi: '',
    contentEn: '',
    expirationDuration: 30,
  },
  onSubmit: async ({ value }) => {
    const receivers = receiversMode.value === 'all' ? 'all' : selectedPlayers.value.map((p) => p._id)
    const hasRewards = currencies.value.length > 0 || itemRows.value.length > 0

    const dto: Parameters<typeof mailService.send>[0] = {
      receivers,
      sendToNewPlayers: sendToNewPlayers.value,
      rewards: hasRewards
        ? {
            currency: currencies.value,
            items: itemRows.value.map((r) => ({
              item: r.item._id,
              quantity: r.quantity,
              source: r.source,
              metadata: r.metadata,
            })),
          }
        : undefined,
    }

    if (useTemplate.value && templateId.value) {
      dto.templateId = templateId.value
    } else {
      dto.title = { vi: value.titleVi, en: value.titleEn }
      dto.content = { vi: value.contentVi, en: value.contentEn }
      dto.expirationDuration = value.expirationDuration
      if (saveAsTemplate.value && templateName.value)
        dto.saveAsTemplate = { name: templateName.value }
    }

    await mailService.send(dto)
    toast.success(t('mail.send.success'))
    resetForm()
    emit('sent')
    close()
  },
})

function resetForm() {
  useTemplate.value = false
  templateId.value = ''
  receiversMode.value = 'all'
  selectedPlayers.value = []
  sendToNewPlayers.value = false
  saveAsTemplate.value = false
  templateName.value = ''
  currencies.value = []
  itemRows.value = []
  form.reset()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}

function handleClose() {
  resetForm()
  close()
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box m-4 max-w-2xl">
      <div class="absolute top-3 right-3">
        <VButton type="button" class="btn-ghost btn-circle" @click="handleClose"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('mail.send.title') }}</h3>

      <form @submit.prevent="form.handleSubmit">
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <!-- Toggle template -->
          <label class="label cursor-pointer justify-start gap-3">
            <input v-model="useTemplate" type="checkbox" class="toggle toggle-sm toggle-primary" />
            <span class="label-text">{{ t('mail.fields.useTemplate') }}</span>
          </label>

          <!-- Template select -->
          <fieldset v-if="useTemplate" class="fieldset">
            <legend class="fieldset-legend">{{ t('mail.fields.templateId') }}</legend>
            <select v-model="templateId" class="select select-bordered w-full">
              <option value="">{{ t('common.select') }}...</option>
              <option v-for="tpl in templates" :key="tpl._id" :value="tpl._id">{{ tpl.name }}</option>
            </select>
          </fieldset>

          <!-- Manual content -->
          <template v-if="!useTemplate">
            <div class="grid grid-cols-2 gap-3">
              <form.Field name="titleVi" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
                <template #default="{ field }">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">{{ t('mail.fields.title') }} (VI)</legend>
                    <input
                      :value="field.state.value"
                      type="text"
                      class="input input-bordered w-full"
                      @input="field.handleChange(($event.target as HTMLInputElement).value)"
                      @blur="field.handleBlur()"
                    />
                    <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                      {{ field.state.meta.errors[0] }}
                    </p>
                  </fieldset>
                </template>
              </form.Field>
              <form.Field name="titleEn" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
                <template #default="{ field }">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">{{ t('mail.fields.title') }} (EN)</legend>
                    <input
                      :value="field.state.value"
                      type="text"
                      class="input input-bordered w-full"
                      @input="field.handleChange(($event.target as HTMLInputElement).value)"
                      @blur="field.handleBlur()"
                    />
                    <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                      {{ field.state.meta.errors[0] }}
                    </p>
                  </fieldset>
                </template>
              </form.Field>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <form.Field name="contentVi" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
                <template #default="{ field }">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">{{ t('mail.fields.content') }} (VI)</legend>
                    <textarea
                      :value="field.state.value"
                      class="textarea textarea-bordered w-full"
                      rows="3"
                      @input="field.handleChange(($event.target as HTMLTextAreaElement).value)"
                      @blur="field.handleBlur()"
                    />
                    <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                      {{ field.state.meta.errors[0] }}
                    </p>
                  </fieldset>
                </template>
              </form.Field>
              <form.Field name="contentEn" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
                <template #default="{ field }">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">{{ t('mail.fields.content') }} (EN)</legend>
                    <textarea
                      :value="field.state.value"
                      class="textarea textarea-bordered w-full"
                      rows="3"
                      @input="field.handleChange(($event.target as HTMLTextAreaElement).value)"
                      @blur="field.handleBlur()"
                    />
                    <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                      {{ field.state.meta.errors[0] }}
                    </p>
                  </fieldset>
                </template>
              </form.Field>
            </div>
            <form.Field
              name="expirationDuration"
              :validators="{ onChange: fieldValidator(z.number().min(1)) }"
            >
              <template #default="{ field }">
                <fieldset class="fieldset w-40">
                  <legend class="fieldset-legend">{{ t('mail.fields.expirationDuration') }}</legend>
                  <input
                    :value="field.state.value"
                    type="number"
                    min="1"
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
          </template>

          <!-- Template preview (read-only) -->
          <div v-if="useTemplate && templateId" class="grid grid-cols-2 gap-3">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mail.fields.title') }} (VI)</legend>
              <input :value="form.getFieldValue('titleVi')" type="text" class="input input-bordered w-full" disabled />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mail.fields.title') }} (EN)</legend>
              <input :value="form.getFieldValue('titleEn')" type="text" class="input input-bordered w-full" disabled />
            </fieldset>
          </div>

          <!-- Receivers -->
          <MailReceiverPicker
            v-model="selectedPlayers"
            :mode="receiversMode"
            @update:mode="receiversMode = $event"
          />

          <!-- Send to new players -->
          <label class="label cursor-pointer justify-start gap-3">
            <input
              v-model="sendToNewPlayers"
              type="checkbox"
              class="checkbox checkbox-sm checkbox-primary"
            />
            <span class="label-text">{{ t('mail.fields.sendToNewPlayers') }}</span>
          </label>

          <!-- Rewards -->
          <div class="flex flex-col gap-3">
            <span class="text-sm font-medium">{{ t('mail.fields.rewards') }}</span>

            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-base-content/60 text-xs tracking-wide uppercase">
                  {{ t('mail.fields.currencyType') }}
                </span>
                <VButton type="button" :icon="PlusIcon" class="btn-ghost btn-xs" @click="addCurrency">
                  {{ t('mail.fields.addCurrency') }}
                </VButton>
              </div>
              <div v-for="(cur, idx) in currencies" :key="idx" class="flex items-center gap-2">
                <select v-model="cur.type" class="select select-bordered select-sm w-28">
                  <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <input
                  v-model.number="cur.value"
                  type="number"
                  min="1"
                  class="input input-bordered input-sm w-24"
                />
                <VButton
                  type="button"
                  :icon="Trash2Icon"
                  class="btn-ghost btn-sm text-error"
                  @click="currencies.splice(idx, 1)"
                />
              </div>
            </div>

            <MailItemRewardEditor v-model="itemRows" />
          </div>

          <!-- Save as template -->
          <template v-if="!useTemplate">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                v-model="saveAsTemplate"
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
              />
              <span class="label-text">{{ t('mail.fields.saveAsTemplate') }}</span>
            </label>
            <fieldset v-if="saveAsTemplate" class="fieldset">
              <legend class="fieldset-legend">{{ t('mail.fields.templateName') }}</legend>
              <input v-model="templateName" type="text" class="input input-bordered w-full" />
            </fieldset>
          </template>
        </div>

        <div class="modal-action">
          <VButton type="button" class="btn-ghost" @click="handleClose">{{ t('common.cancel') }}</VButton>
          <VButton type="submit" class="btn-primary" :loading="form.state.isSubmitting">
            {{ t('common.confirm') }}
          </VButton>
        </div>
      </form>
    </div>
  </dialog>
</template>
