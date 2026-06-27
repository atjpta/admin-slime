<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SquarePenIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VRankStatusBadge from '@/components/ui/badge/v-rank-status-badge.vue'
import { formatDate, formatOnlyDate } from '@/utils/format'
import type { RankSession } from '@/interfaces/rank.interface'

defineProps<{ session: RankSession }>()
const emit = defineEmits<{ edit: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-5">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h1 class="text-xl font-semibold">{{ session.code }}</h1>
          <p class="text-base-content/50 font-mono text-sm">{{ session._id }}</p>
        </div>
        <VButton :icon="SquarePenIcon" class="btn-primary btn-sm" @click="emit('edit')">
          <span class="hidden sm:inline">{{ t('common.edit') }}</span>
        </VButton>
      </div>

      <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.session') }}</span>
          <span class="font-medium">#{{ session.session }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.rankMode') }}</span>
          <span class="font-medium">{{ t(`rankConfig.rankMode.${session.rankMode}`) }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.status') }}</span>
          <VRankStatusBadge :value="session.status" i18n-key="rankSession.status" class="w-fit" />
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.startDate') }}</span>
          <span class="font-medium">{{ formatOnlyDate(session.startDate) }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.endDate') }}</span>
          <span class="font-medium">{{ formatOnlyDate(session.endDate) }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankConfig.fields.initialPoint') }}</span>
          <span class="font-medium">{{ session.ruleSet?.initialPoint?.toLocaleString() ?? '-' }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankConfig.fields.winPoint') }}</span>
          <span class="font-medium text-success">+{{ session.ruleSet?.winPoint ?? '-' }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankConfig.fields.losePoint') }}</span>
          <span class="font-medium text-error">-{{ session.ruleSet?.losePoint ?? '-' }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('rankSession.columns.createdAt') }}</span>
          <span class="font-medium">{{ formatDate(session.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
