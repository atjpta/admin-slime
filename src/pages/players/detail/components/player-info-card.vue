<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import VPlayerStatusBadge from '@/components/ui/badge/v-player-status-badge.vue'
import VPlayerRoleBadge from '@/components/ui/badge/v-player-role-badge.vue'
import { formatDate } from '@/utils/format'
import type { PlayerDetail } from '@/interfaces/player.interface'

defineProps<{ detail: PlayerDetail }>()
const { t } = useI18n()
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <p class="text-base-content/50 mb-0.5">{{ t('player.columns.name') }}</p>
          <p class="font-medium">{{ detail.name }}</p>
        </div>
        <div>
          <p class="text-base-content/50 mb-0.5">{{ t('player.columns.email') }}</p>
          <p class="font-medium">{{ detail.user?.email ?? '-' }}</p>
        </div>
        <div>
          <p class="text-base-content/50 mb-0.5">{{ t('player.columns.role') }}</p>
          <VPlayerRoleBadge :value="detail.role" />
        </div>
        <div>
          <p class="text-base-content/50 mb-0.5">{{ t('player.columns.status') }}</p>
          <VPlayerStatusBadge :value="detail.status" />
        </div>
        <div>
          <p class="text-base-content/50 mb-0.5">{{ t('player.columns.createdAt') }}</p>
          <p class="font-medium">{{ formatDate(detail.createdAt) }}</p>
        </div>
        <div>
          <p class="text-base-content/50 mb-0.5">{{ t('player.columns.updatedAt') }}</p>
          <p class="font-medium">{{ formatDate(detail.updatedAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
