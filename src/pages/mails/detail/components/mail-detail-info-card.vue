<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from '@/utils/toast'
import { CalendarIcon, CalendarOffIcon, UsersIcon, MailCheckIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VBadge from '@/components/ui/badge/v-badge.vue'
import { mailService } from '@/services/api/mail.service'
import { formatDate } from '@/utils/format'
import type { MailDetail } from '@/interfaces/mail.interface'

const props = defineProps<{ mail: MailDetail; mailId: string }>()
const emit = defineEmits<{ updated: [sendToNewPlayers: boolean] }>()
const { t } = useI18n()

const saving = ref(false)
const sendToNewPlayers = ref(props.mail.sendToNewPlayers)

watch(
  () => props.mail.sendToNewPlayers,
  (v) => {
    sendToNewPlayers.value = v
  }
)

async function save() {
  saving.value = true
  await mailService.update(props.mailId, { sendToNewPlayers: sendToNewPlayers.value })
  emit('updated', sendToNewPlayers.value)
  toast.success(t('mail.detail.edit.success'))
  saving.value = false
}
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-5">
      <!-- Title + ID -->
      <div class="mb-4">
        <h1 class="text-xl font-semibold">{{ mail.title.vi || mail.title.en }}</h1>
        <p class="text-base-content/50 font-mono text-sm">{{ mail._id }}</p>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <!-- Info grid -->
        <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
          <div class="flex flex-col gap-0.5">
            <span class="text-base-content/50 flex items-center gap-1 text-xs">
              <CalendarIcon class="size-3" />{{ t('mail.columns.createdAt') }}
            </span>
            <span class="font-medium">{{ formatDate(mail.createdAt) }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-base-content/50 flex items-center gap-1 text-xs">
              <CalendarOffIcon class="size-3" />{{ t('mail.columns.expiredAt') }}
            </span>
            <span class="font-medium">{{
              formatDate(mail.expiredAt) ?? t('common.noExpiry')
            }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-base-content/50 flex items-center gap-1 text-xs">
              <UsersIcon class="size-3" />{{ t('mail.columns.receivers') }}
            </span>
            <span class="font-medium">{{
              t('mail.receiversCount', { n: mail.receivers.length })
            }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-base-content/50 flex items-center gap-1 text-xs">
              <MailCheckIcon class="size-3" />{{ t('mail.columns.source') }}
            </span>
            <VBadge :value="mail.source" i18n-key="mail.source" />
          </div>
        </div>

        <!-- sendToNewPlayers edit -->
        <div class="sm:border-base-200 flex shrink-0 items-center gap-3 sm:border-l sm:pl-6">
          <label class="flex cursor-pointer items-center gap-2">
            <input
              v-model="sendToNewPlayers"
              type="checkbox"
              class="checkbox checkbox-primary checkbox-sm"
            />
            <span class="text-sm">{{ t('mail.fields.sendToNewPlayers') }}</span>
          </label>
          <VButton class="btn-primary btn-sm" :loading="saving" @click="save">
            {{ t('common.save') }}
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>
