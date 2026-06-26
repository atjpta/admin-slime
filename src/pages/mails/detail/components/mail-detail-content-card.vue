<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { MailDetail } from '@/interfaces/mail.interface'

defineProps<{ mail: MailDetail }>()
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="bg-base-200/50 rounded-lg p-4">
        <p class="text-primary mb-3 text-xs font-semibold tracking-wider uppercase">
          {{ t('common.langVi') }}
        </p>
        <p class="mb-1 font-semibold">{{ mail.title.vi }}</p>
        <p class="text-base-content/70 text-sm leading-relaxed whitespace-pre-wrap">
          {{ mail.content.vi }}
        </p>
      </div>
      <div class="bg-base-200/50 rounded-lg p-4">
        <p class="text-primary mb-3 text-xs font-semibold tracking-wider uppercase">
          {{ t('common.langEn') }}
        </p>
        <p class="mb-1 font-semibold">{{ mail.title.en }}</p>
        <p class="text-base-content/70 text-sm leading-relaxed whitespace-pre-wrap">
          {{ mail.content.en }}
        </p>
      </div>
    </div>
  </div>
</template>
