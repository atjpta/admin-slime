<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import VButton from '@/components/ui/btn/v-button.vue'
import VDetailSkeleton from '@/components/ui/skeleton/v-detail-skeleton.vue'
import { useDetailLoading } from '@/composables/useDetailLoading'
import GachaEditModal from '../components/gacha-edit-modal.vue'
import GachaInfoCard from './components/gacha-info-card.vue'
import GachaCostsTab from './components/gacha-costs-tab.vue'
import GachaRaritiesTab from './components/gacha-rarities-tab.vue'
import GachaRewardsTab from './components/gacha-rewards-tab.vue'
import { gachaService } from '@/services/api/gacha.service'
import { RouteName } from '@/router'
import type { Gacha } from '@/interfaces/gacha.interface'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const id = route.params.id as string
const detail = ref<Gacha | null>(null)
const { loading, withLoading } = useDetailLoading()
const editingGacha = ref<Gacha | null>(null)

// Tabs
type Tab = 'costs' | 'rarities' | 'rewards'
const activeTab = ref<Tab>('costs')
const tabs = computed(() => [
  { key: 'costs' as Tab, label: t('gacha.tabs.costs'), count: detail.value?.costs.length ?? 0 },
  { key: 'rarities' as Tab, label: t('gacha.tabs.rarities') },
  {
    key: 'rewards' as Tab,
    label: t('gacha.tabs.rewards'),
    count: detail.value?.listReward.length ?? 0,
  },
])
function sectionOrder(tab: Tab) {
  return activeTab.value === tab ? 'order-first' : 'order-last'
}

async function fetchDetail(silent = false) {
  if (silent) {
    try {
      detail.value = await gachaService.getById(id)
    } catch {
      router.replace({ name: RouteName.Gachas })
    }
    return
  }
  await withLoading(async () => {
    try {
      detail.value = await gachaService.getById(id)
    } catch {
      router.replace({ name: RouteName.Gachas })
    }
  })
}

onMounted(() => fetchDetail())
</script>

<template>
  <div class="flex flex-col gap-6">
    <VDetailSkeleton v-if="loading" />

    <template v-else-if="detail">
      <GachaInfoCard :gacha="detail" @edit="editingGacha = detail" />

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
              <span v-if="'count' in tab" class="badge badge-sm ml-1.5">{{ tab.count }}</span>
            </VButton>
          </div>

          <div class="flex flex-col gap-4">
            <div :class="sectionOrder('costs')" class="rounded-box border-base-200 border p-4">
              <GachaCostsTab :gacha="detail" @saved="fetchDetail(true)" />
            </div>
            <div :class="sectionOrder('rarities')" class="rounded-box border-base-200 border p-4">
              <GachaRaritiesTab :gacha="detail" @saved="fetchDetail(true)" />
            </div>
            <div :class="sectionOrder('rewards')" class="rounded-box border-base-200 border p-4">
              <GachaRewardsTab :gacha="detail" @saved="fetchDetail(true)" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <GachaEditModal :gacha="editingGacha" @close="editingGacha = null" @updated="fetchDetail" />
</template>
