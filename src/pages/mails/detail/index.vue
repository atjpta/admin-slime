<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RouteName } from '@/router'
import VButton from '@/components/ui/btn/v-button.vue'
import VDetailSkeleton from '@/components/ui/skeleton/v-detail-skeleton.vue'
import { useDetailLoading } from '@/composables/useDetailLoading'
import { mailService } from '@/services/api/mail.service'
import MailDetailInfoCard from './components/mail-detail-info-card.vue'
import MailDetailContentCard from './components/mail-detail-content-card.vue'
import MailDetailRewardsCard from './components/mail-detail-rewards-card.vue'
import MailDetailReceiversCard from './components/mail-detail-receivers-card.vue'
import type { MailDetail } from '@/interfaces/mail.interface'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const id = route.params.id as string
const mail = ref<MailDetail | null>(null)
const { loading, withLoading } = useDetailLoading()

// Tabs
type Tab = 'content' | 'rewards' | 'receivers'
const activeTab = ref<Tab>('content')
const tabs = computed(() => [
  { key: 'content' as Tab, label: t('mail.detail.content') },
  { key: 'rewards' as Tab, label: t('mail.detail.rewards') },
  {
    key: 'receivers' as Tab,
    label: t('mail.detail.receivers'),
    count: mail.value?.receivers.length ?? 0,
  },
])
function sectionOrder(tab: Tab) {
  return activeTab.value === tab ? 'order-first' : 'order-last'
}

onMounted(() =>
  withLoading(async () => {
    try {
      mail.value = await mailService.getById(id)
    } catch {
      router.replace({ name: RouteName.Mails })
    }
  })
)

function onInfoUpdated(sendToNewPlayers: boolean) {
  if (mail.value) mail.value.sendToNewPlayers = sendToNewPlayers
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <VDetailSkeleton v-if="loading" />

    <template v-else-if="mail">
      <MailDetailInfoCard :mail="mail" :mail-id="id" @updated="onInfoUpdated" />

      <!-- Tabbed sections -->
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
            <div :class="sectionOrder('content')" class="rounded-box border-base-200 border p-4">
              <MailDetailContentCard :mail="mail" />
            </div>
            <div :class="sectionOrder('rewards')" class="rounded-box border-base-200 border p-4">
              <MailDetailRewardsCard :mail="mail" />
            </div>
            <div :class="sectionOrder('receivers')" class="rounded-box border-base-200 border p-4">
              <MailDetailReceiversCard :mail="mail" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
