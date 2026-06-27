<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import VButton from '@/components/ui/btn/v-button.vue'
import VDetailSkeleton from '@/components/ui/skeleton/v-detail-skeleton.vue'
import { useDetailLoading } from '@/composables/useDetailLoading'
import RankSessionFormModal from '../components/rank-session-form-modal.vue'
import RankSessionInfoCard from './components/rank-session-info-card.vue'
import RankConfigRewardTab from '@/pages/rank-configs/detail/components/rank-config-reward-tab.vue'
import { rankSessionService } from '@/services/api/rank-session.service'
import { RouteName } from '@/router'
import type { RankSession } from '@/interfaces/rank.interface'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const id = route.params.id as string
const detail = ref<RankSession | null>(null)
const { loading, withLoading } = useDetailLoading()
const editModal = useTemplateRef<{ open: (item: RankSession) => void }>('editModal')

type Tab = 'daily' | 'session'
const activeTab = ref<Tab>('daily')

const tabs = computed(() => [
  {
    key: 'daily' as Tab,
    label: t('rankConfig.rewards.rewardDaily'),
    count: detail.value?.rewardDaily?.length ?? 0,
  },
  {
    key: 'session' as Tab,
    label: t('rankConfig.rewards.rewardSession'),
    count: detail.value?.rewardSession?.length ?? 0,
  },
])

function sectionOrder(tab: Tab) {
  return activeTab.value === tab ? 'order-first' : 'order-last'
}

async function fetchDetail() {
  await withLoading(async () => {
    try {
      detail.value = await rankSessionService.getById(id)
    } catch {
      router.replace({ name: RouteName.RankSessions })
    }
  })
}

function openEditModal() {
  if (detail.value) editModal.value?.open(detail.value)
}

onMounted(() => fetchDetail())
</script>

<template>
  <div class="flex flex-col gap-6">
    <VDetailSkeleton v-if="loading" />

    <template v-else-if="detail">
      <RankSessionInfoCard :session="detail" @edit="openEditModal" />

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
              <span v-if="tab.count" class="badge badge-sm ml-1.5">{{ tab.count }}</span>
            </VButton>
          </div>
          <div class="flex flex-col gap-4">
            <div :class="sectionOrder('daily')" class="rounded-box border-base-200 border p-4">
              <p class="text-base-content/70 mb-3 text-sm font-semibold">{{ t('rankConfig.rewards.rewardDaily') }}</p>
              <RankConfigRewardTab :rewards="detail.rewardDaily ?? []" />
            </div>
            <div :class="sectionOrder('session')" class="rounded-box border-base-200 border p-4">
              <p class="text-base-content/70 mb-3 text-sm font-semibold">{{ t('rankConfig.rewards.rewardSession') }}</p>
              <RankConfigRewardTab :rewards="detail.rewardSession ?? []" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <RankSessionFormModal ref="editModal" @saved="fetchDetail" />
</template>
