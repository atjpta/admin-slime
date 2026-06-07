<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import VSection from '@/components/ui/section/v-section.vue'
import { StatSource, StatType } from '@/enums/stat.enum'
import type { PlayerStatsSummary, PlayerStat } from '@/interfaces/player.interface'

const props = defineProps<{
  stats: PlayerStatsSummary
  statsDetail: PlayerStat[]
}>()
const { t } = useI18n()

const STAT_COLS = [
  ['hp', 'attack'],
  ['magic', 'defense'],
] as const
const SOURCES = [StatSource.BASE, StatSource.EQUIPMENT] as const
const TYPES = [StatType.FLAT, StatType.PERCENT] as const

function groupedDetail(key: string) {
  return SOURCES.map((source) => ({
    source,
    types: TYPES.map((type) => {
      const entries = props.statsDetail.filter(
        (s) => s.stat === key && s.source === source && s.type === type
      )
      const total = entries.reduce((sum, s) => sum + s.value, 0)
      const display = type === StatType.PERCENT ? +(total * 100).toFixed(2) : total
      return { type, total: display, hasData: entries.length > 0 }
    }).filter((g) => g.hasData),
  })).filter((g) => g.types.length > 0)
}
</script>

<template>
  <VSection :title="t('player.detail.statsSummary')">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div v-for="col in STAT_COLS" :key="col[0]" class="flex flex-1 flex-col gap-3">
        <div
          v-for="key in col"
          :key="key"
          class="collapse collapse-arrow rounded-box border border-base-200"
        >
          <input type="checkbox" />
          <div class="collapse-title flex items-center justify-between pr-10">
            <span class="font-medium">{{ t(`stat.key.${key}`) }}</span>
            <span class="text-primary font-bold tabular-nums">
              {{ stats[key].toLocaleString() }}
            </span>
          </div>
          <div class="collapse-content">
            <div v-if="groupedDetail(key).length" class="flex flex-col gap-4 pt-2">
              <div v-for="sourceGroup in groupedDetail(key)" :key="sourceGroup.source">
                <div class="mb-2 flex items-center gap-2">
                  <span
                    class="badge badge-sm"
                    :class="sourceGroup.source === StatSource.EQUIPMENT ? 'badge-info' : 'badge-ghost'"
                  >
                    {{ t(`stat.source.${sourceGroup.source}`) }}
                  </span>
                  <span class="bg-base-200 h-px flex-1"></span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <div
                    v-for="typeGroup in sourceGroup.types"
                    :key="typeGroup.type"
                    class="odd:bg-base-200 flex items-center justify-between rounded px-2 py-1 text-sm"
                  >
                    <span class="text-base-content/60 text-xs">{{ t(`stat.type.${typeGroup.type}`) }}</span>
                    <span class="font-medium tabular-nums">
                      +{{ typeGroup.total }}{{ typeGroup.type === StatType.PERCENT ? '%' : '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-base-content/40 pt-1 text-sm">{{ t('table.empty') }}</p>
          </div>
        </div>
      </div>
    </div>
  </VSection>
</template>
