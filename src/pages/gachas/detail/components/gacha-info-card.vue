<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SquarePenIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VGachaStatusBadge from '@/components/ui/badge/v-gacha-status-badge.vue'
import { formatOnlyDate } from '@/utils/format'
import type { Gacha } from '@/interfaces/gacha.interface'

defineProps<{ gacha: Gacha }>()
const emit = defineEmits<{ edit: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-5">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h1 class="text-xl font-semibold">{{ gacha.code }}</h1>
          <p class="text-base-content/50 font-mono text-sm">{{ gacha._id }}</p>
        </div>
        <VButton :icon="SquarePenIcon" class="btn-primary btn-sm" @click="emit('edit')">
          <span class="hidden sm:inline">{{ t('common.edit') }}</span>
        </VButton>
      </div>

      <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('gacha.columns.code') }}</span>
          <span class="font-mono font-medium">{{ gacha.code }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('gacha.columns.type') }}</span>
          <span class="badge badge-outline w-fit">{{ t(`gacha.type.${gacha.type}`) }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('gacha.columns.status') }}</span>
          <VGachaStatusBadge :value="gacha.status" />
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('gacha.columns.sortOrder') }}</span>
          <span class="font-medium">{{ gacha.sortOrder }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('gacha.columns.startAt') }}</span>
          <span class="font-medium">{{ formatOnlyDate(gacha.startDate) || '-' }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('gacha.columns.endAt') }}</span>
          <span class="font-medium">{{ formatOnlyDate(gacha.endDate) || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
