<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { PlusIcon, Trash2Icon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { mailService } from '@/services/api/mail.service'
import { mailTemplateService } from '@/services/api/mail-template.service'
import { parseApiError } from '@/utils/api-error'
import { CurrencyCode } from '@/enums/gacha.enum'
import MailReceiverPicker from './mail-receiver-picker.vue'
import MailItemRewardEditor from './mail-item-reward-editor.vue'
import type { ItemRewardRow } from './mail-item-reward-editor.vue'
import type { Player } from '@/interfaces/player.interface'
import type { MailTemplate, CurrencyReward } from '@/interfaces/mail.interface'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; sent: [] }>()
const { t } = useI18n()

const loading = ref(false)
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

// Form state
const useTemplate = ref(false)
const templateId = ref('')
const title = ref('')
const content = ref('')
const expirationDuration = ref(30)
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
  title.value = tpl.title.vi
  title.value = tpl.title.en
  content.value = tpl.content.vi
  content.value = tpl.content.en
  expirationDuration.value = tpl.expirationDuration
})

const currencyOptions = Object.values(CurrencyCode).map((v) => ({
  value: v,
  label: t(`gacha.currency.${v}`),
}))

function addCurrency() {
  currencies.value.push({ type: CurrencyCode.GOLD, value: 1 })
}

function resetForm() {
  useTemplate.value = false
  templateId.value = ''
  title.value = ''
  title.value = ''
  content.value = ''
  content.value = ''
  expirationDuration.value = 30
  receiversMode.value = 'all'
  selectedPlayers.value = []
  sendToNewPlayers.value = false
  saveAsTemplate.value = false
  templateName.value = ''
  currencies.value = []
  itemRows.value = []
}

async function submit() {
  loading.value = true
  try {
    const receivers =
      receiversMode.value === 'all' ? 'all' : selectedPlayers.value.map((p) => p._id)
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
      dto.title = { vi: title.value, en: title.value }
      dto.content = { vi: content.value, en: content.value }
      dto.expirationDuration = expirationDuration.value
      if (saveAsTemplate.value && templateName.value)
        dto.saveAsTemplate = { name: templateName.value }
    }

    await mailService.send(dto)
    toast.success(t('mail.send.success'))
    resetForm()
    emit('sent')
    emit('close')
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    loading.value = false
  }
}

function handleClose() {
  resetForm()
  emit('close')
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box m-4 max-w-2xl">
      <h3 class="mb-4 text-lg font-semibold">{{ t('mail.send.title') }}</h3>

      <div class="flex max-h-[65vh] flex-col gap-4 overflow-y-auto px-1">
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
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mail.fields.title') }}</legend>
              <input v-model="title" type="text" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mail.fields.title') }}</legend>
              <input v-model="title" type="text" class="input input-bordered w-full" />
            </fieldset>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mail.fields.content') }}</legend>
              <textarea v-model="content" class="textarea textarea-bordered w-full" rows="3" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mail.fields.content') }}</legend>
              <textarea v-model="content" class="textarea textarea-bordered w-full" rows="3" />
            </fieldset>
          </div>
          <fieldset class="fieldset w-40">
            <legend class="fieldset-legend">{{ t('mail.fields.expirationDuration') }}</legend>
            <input
              v-model.number="expirationDuration"
              type="number"
              min="1"
              class="input input-bordered w-full"
            />
          </fieldset>
        </template>

        <!-- Template preview (read-only titles) -->
        <div v-if="useTemplate && templateId" class="grid grid-cols-2 gap-3">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('mail.fields.title') }}</legend>
            <input :value="title" type="text" class="input input-bordered w-full" disabled />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('mail.fields.title') }}</legend>
            <input :value="title" type="text" class="input input-bordered w-full" disabled />
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

          <!-- Currency -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-base-content/60 text-xs tracking-wide uppercase">{{
                t('mail.fields.currencyType')
              }}</span>
              <VButton :icon="PlusIcon" class="btn-ghost btn-xs" @click="addCurrency">
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
                :icon="Trash2Icon"
                class="btn-ghost btn-sm text-error"
                @click="currencies.splice(idx, 1)"
              />
            </div>
          </div>

          <!-- Items -->
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
        <VButton class="btn-ghost" @click="handleClose">{{ t('common.cancel') }}</VButton>
        <VButton class="btn-primary" :loading="loading" @click="submit">{{
          t('common.confirm')
        }}</VButton>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @submit.prevent="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>
