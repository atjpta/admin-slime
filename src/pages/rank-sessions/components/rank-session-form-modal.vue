<script setup lang="ts">
import { ref, computed, useTemplateRef, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import VButton from '@/components/ui/btn/v-button.vue'
import VDatePicker from '@/components/ui/datepicker/v-date-picker.vue'
import RankTierRewardEditor, {
  type TierRewardForm,
} from '@/components/rank/rank-tier-reward-editor.vue'
import { RankSessionStatus } from '@/enums/rank.enum'
import { rankSessionService } from '@/services/api/rank-session.service'
import { rankConfigService } from '@/services/api/rank-config.service'
import type {
  RankSession,
  RankConfig,
  TierReward,
  TierRewardDto,
} from '@/interfaces/rank.interface'
import { ItemSource } from '@/enums/item.enum'
import { useZodForm } from '@/composables/useZodForm'

const emit = defineEmits<{ close: []; saved: [] }>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()

type Tab = 'basic' | 'daily' | 'session'
const activeTab = ref<Tab>('basic')
const currentItem = ref<RankSession | null>(null)
const isEdit = computed(() => !!currentItem.value)
const rankConfigs = ref<RankConfig[]>([])

const rewardDaily = ref<TierRewardForm[]>([])
const rewardSession = ref<TierRewardForm[]>([])

const statusOptions = Object.values(RankSessionStatus).map((v) => ({
  value: v,
  label: t(`rankSession.status.${v}`),
}))

function toDateOnly(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

function parseTierRewards(rewards: TierReward[]): TierRewardForm[] {
  return (rewards ?? []).map((r) => ({
    tierId: typeof r.tier === 'string' ? r.tier : r.tier._id,
    currency: (r.reward?.currency ?? []).map((c) => ({ type: c.type, value: c.value })),
    items: (r.reward?.items ?? []).map((it) => ({
      itemId: typeof it.item === 'string' ? it.item : (it.item as any)._id,
      itemCode: typeof it.item === 'string' ? it.item : ((it.item as any).code ?? it.item),
      quantity: it.quantity,
      source: it.source || ItemSource.SYSTEM,
    })),
  }))
}

function toTierRewardDtos(forms: TierRewardForm[]): TierRewardDto[] {
  return forms
    .filter((f) => f.tierId)
    .map((f) => ({
      tier: f.tierId,
      reward: {
        currency: f.currency.filter((c) => c.value > 0),
        items: f.items.map((it) => ({
          item: it.itemId,
          quantity: it.quantity,
          rarity: '',
          source: it.source,
          metadata: {},
        })),
      },
    }))
}

onMounted(async () => {
  const res = await rankConfigService.index({ page: 1, limit: 100 })
  rankConfigs.value = res.items
})

const defaultFormValues = {
  rankConfigId: '',
  status: RankSessionStatus.ACTIVE as RankSessionStatus,
  startDate: '',
  endDate: '',
  applyToConfig: false,
}

const form = useForm({
  defaultValues: defaultFormValues,
  onSubmit: async ({ value }) => {
    const rewardDailyDto = toTierRewardDtos(rewardDaily.value)
    const rewardSessionDto = toTierRewardDtos(rewardSession.value)

    if (isEdit.value && currentItem.value) {
      await rankSessionService.update(currentItem.value._id, {
        status: value.status,
        startDate: value.startDate || undefined,
        endDate: value.endDate || undefined,
        applyToConfig: value.applyToConfig,
        rewardDaily: rewardDailyDto,
        rewardSession: rewardSessionDto,
      })
      toast.success(t('rankSession.edit.success'))
    } else {
      await rankSessionService.create({
        rankConfigId: value.rankConfigId,
        startDate: value.startDate,
        endDate: value.endDate,
        status: value.status,
      })
      toast.success(t('rankSession.create.success'))
    }
    emit('saved')
    close()
  },
})

defineExpose({ open })

function open(item?: RankSession) {
  currentItem.value = item ?? null
  activeTab.value = 'basic'
  if (item) {
    form.reset({
      rankConfigId: item.rankConfigId,
      status: item.status,
      startDate: item.startDate ? toDateOnly(item.startDate) : '',
      endDate: item.endDate ? toDateOnly(item.endDate) : '',
      applyToConfig: false,
    })
    rewardDaily.value = parseTierRewards(item.rewardDaily)
    rewardSession.value = parseTierRewards(item.rewardSession)
  } else {
    form.reset(defaultFormValues)
    rewardDaily.value = []
    rewardSession.value = []
  }
  dialogRef.value?.showModal()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-xl">
      <div class="absolute top-3 right-3">
        <VButton type="button" class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-3 text-lg font-semibold">
        {{ isEdit ? t('rankSession.edit.title') : t('rankSession.create.title') }}
      </h3>

      <form @submit.prevent="form.handleSubmit">
        <!-- Tabs (edit only) -->
        <template v-if="isEdit">
          <div role="tablist" class="tabs tabs-border mb-3">
            <button
              type="button"
              role="tab"
              class="tab"
              :class="{ 'tab-active': activeTab === 'basic' }"
              @click="activeTab = 'basic'"
            >
              {{ t('rankConfig.rewards.tabBasic') }}
            </button>
            <button
              type="button"
              role="tab"
              class="tab"
              :class="{ 'tab-active': activeTab === 'daily' }"
              @click="activeTab = 'daily'"
            >
              {{ t('rankConfig.rewards.rewardDaily') }}
              <span v-if="rewardDaily.length" class="badge badge-sm ml-1.5">{{
                rewardDaily.length
              }}</span>
            </button>
            <button
              type="button"
              role="tab"
              class="tab"
              :class="{ 'tab-active': activeTab === 'session' }"
              @click="activeTab = 'session'"
            >
              {{ t('rankConfig.rewards.rewardSession') }}
              <span v-if="rewardSession.length" class="badge badge-sm ml-1.5">{{
                rewardSession.length
              }}</span>
            </button>
          </div>
        </template>

        <div class="-mx-6 max-h-[60dvh] overflow-y-auto px-6">
          <!-- Basic -->
          <div v-show="activeTab === 'basic'" class="flex flex-col gap-4">
            <form.Field
              v-if="!isEdit"
              name="rankConfigId"
              :validators="{ onChange: fieldValidator(z.string().min(1)) }"
            >
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">
                    {{ t('rankSession.fields.rankConfigId') }}
                  </legend>
                  <select
                    :value="field.state.value"
                    class="select select-bordered w-full"
                    @change="field.handleChange(($event.target as HTMLSelectElement).value)"
                    @blur="field.handleBlur()"
                  >
                    <option value="" disabled>{{ t('common.select') }}...</option>
                    <option v-for="cfg in rankConfigs" :key="cfg._id" :value="cfg._id">
                      {{ cfg.code }} ({{ t(`rankConfig.rankMode.${cfg.rankMode}`) }})
                    </option>
                  </select>
                  <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                    {{ field.state.meta.errors[0] }}
                  </p>
                </fieldset>
              </template>
            </form.Field>

            <form.Field name="status">
              <template #default="{ field }">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ t('rankSession.fields.status') }}</legend>
                  <select
                    :value="field.state.value"
                    class="select select-bordered w-full"
                    @change="
                      field.handleChange(
                        ($event.target as HTMLSelectElement).value as RankSessionStatus
                      )
                    "
                  >
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </fieldset>
              </template>
            </form.Field>

            <div class="grid grid-cols-2 gap-3">
              <form.Field
                name="startDate"
                :validators="{ onChange: fieldValidator(z.string().min(1)) }"
              >
                <template #default="{ field }">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">{{ t('rankSession.fields.startDate') }}</legend>
                    <VDatePicker
                      :model-value="field.state.value"
                      :placeholder="t('common.select')"
                      @update:model-value="field.handleChange"
                    />
                    <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                      {{ field.state.meta.errors[0] }}
                    </p>
                  </fieldset>
                </template>
              </form.Field>
              <form.Field
                name="endDate"
                :validators="{ onChange: fieldValidator(z.string().min(1)) }"
              >
                <template #default="{ field }">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">{{ t('rankSession.fields.endDate') }}</legend>
                    <VDatePicker
                      :model-value="field.state.value"
                      :placeholder="t('common.select')"
                      @update:model-value="field.handleChange"
                    />
                    <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                      {{ field.state.meta.errors[0] }}
                    </p>
                  </fieldset>
                </template>
              </form.Field>
            </div>

            <form.Field v-if="isEdit" name="applyToConfig">
              <template #default="{ field }">
                <label class="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    :checked="field.state.value"
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    @change="field.handleChange(($event.target as HTMLInputElement).checked)"
                  />
                  {{ t('rankSession.fields.applyToConfig') }}
                </label>
              </template>
            </form.Field>
          </div>

          <!-- rewardDaily (edit only) -->
          <div v-if="isEdit" v-show="activeTab === 'daily'">
            <RankTierRewardEditor v-model="rewardDaily" />
          </div>

          <!-- rewardSession (edit only) -->
          <div v-if="isEdit" v-show="activeTab === 'session'">
            <RankTierRewardEditor v-model="rewardSession" />
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
