<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UserIcon, CalendarIcon, RefreshCwIcon, HashIcon } from '@lucide/vue'
import VPlayerStatusBadge from '@/components/ui/badge/v-player-status-badge.vue'
import VPlayerRoleBadge from '@/components/ui/badge/v-player-role-badge.vue'
import { formatDate } from '@/utils/format'
import type { PlayerDetail } from '@/interfaces/player.interface'

defineProps<{ detail: PlayerDetail }>()
const { t } = useI18n()
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-5">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
        <!-- Avatar -->
        <div
          class="bg-primary/10 text-primary flex size-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold"
        >
          {{ detail.name.charAt(0).toUpperCase() }}
        </div>

        <!-- Main info -->
        <div class="flex flex-1 flex-col gap-4">
          <!-- Name + badges -->
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-lg font-bold">{{ detail.name }}</h2>
            <VPlayerRoleBadge :value="detail.role" />
            <VPlayerStatusBadge :value="detail.status" />
          </div>

          <!-- Grid of fields -->
          <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm lg:grid-cols-4">
            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 flex items-center gap-1 text-xs">
                <HashIcon class="size-3" />{{ t('player.columns.name') }}
              </span>
              <span class="text-opacity-60 font-mono text-xs">{{ detail._id }}</span>
            </div>

            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 flex items-center gap-1 text-xs">
                <UserIcon class="size-3" />{{ t('player.columns.email') }}
              </span>
              <span class="font-medium">{{ detail.user?.email ?? '-' }}</span>
            </div>

            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 flex items-center gap-1 text-xs">
                <CalendarIcon class="size-3" />{{ t('player.columns.createdAt') }}
              </span>
              <span class="font-medium">{{ formatDate(detail.createdAt) }}</span>
            </div>

            <div class="flex flex-col gap-0.5">
              <span class="text-base-content/50 flex items-center gap-1 text-xs">
                <RefreshCwIcon class="size-3" />{{ t('player.columns.updatedAt') }}
              </span>
              <span class="font-medium">{{ formatDate(detail.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
