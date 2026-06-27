<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { JsonViewer, type JsonValue } from '@anilkumarthakur/vue3-json-viewer'
import '@anilkumarthakur/vue3-json-viewer/styles.css'
import VButton from '@/components/ui/btn/v-button.vue'
import VDetailSkeleton from '@/components/ui/skeleton/v-detail-skeleton.vue'
import { useDetailLoading } from '@/composables/useDetailLoading'
import { useDarkMode } from '@/composables/useDarkMode'
import CronLogInfoCard from './components/cron-log-info-card.vue'
import { cronLogService } from '@/services/api/cron-log.service'
import { RouteName } from '@/router'
import type { CronLog } from '@/interfaces/cron-log.interface'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const isDark = useDarkMode()

const id = route.params.id as string
const detail = ref<CronLog | null>(null)
const { loading, withLoading } = useDetailLoading()

type Tab = 'params' | 'result'
const activeTab = ref<Tab>('params')

const tabs = computed(() => [
  { key: 'params' as Tab, label: t('cronLog.detail.params') },
  { key: 'result' as Tab, label: t('cronLog.detail.result') },
])

function sectionOrder(tab: Tab) {
  return activeTab.value === tab ? 'order-first' : 'order-last'
}

async function fetchDetail() {
  await withLoading(async () => {
    try {
      detail.value = await cronLogService.getById(id)
    } catch {
      router.replace({ name: RouteName.CronLogs })
    }
  })
}

onMounted(() => fetchDetail())
</script>

<template>
  <div class="flex flex-col gap-6">
    <VDetailSkeleton v-if="loading" />

    <template v-else-if="detail">
      <CronLogInfoCard :log="detail" @retried="fetchDetail" />

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div role="tablist" class="tabs tabs-border mb-4">
            <VButton
              v-for="tab in tabs"
              :key="tab.key"
              role="tab"
              class="tab border-0 bg-transparent"
              :class="{ 'tab-active': activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </VButton>
          </div>
          <div class="flex flex-col gap-4">
            <div :class="sectionOrder('params')" class="rounded-box border-base-200 border p-4">
              <p class="text-base-content/70 mb-3 text-sm font-semibold">{{ t('cronLog.detail.params') }}</p>
              <JsonViewer
                v-if="detail.params && Object.keys(detail.params).length"
                :data="detail.params as JsonValue"
                :dark-mode="isDark"
                :expanded="true"
              />
              <p v-else class="text-base-content/40 text-sm">—</p>
            </div>
            <div :class="sectionOrder('result')" class="rounded-box border-base-200 border p-4">
              <p class="text-base-content/70 mb-3 text-sm font-semibold">{{ t('cronLog.detail.result') }}</p>
              <JsonViewer
                v-if="detail.result && Object.keys(detail.result).length"
                :data="detail.result as JsonValue"
                :dark-mode="isDark"
                :expanded="true"
              />
              <p v-else class="text-base-content/40 text-sm">—</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="detail.error" class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="mb-2 text-sm font-semibold text-error">{{ t('cronLog.detail.error') }}</p>
          <pre class="bg-error/10 text-error rounded-lg p-3 text-xs whitespace-pre-wrap break-all">{{ detail.error }}</pre>
        </div>
      </div>
    </template>
  </div>
</template>
