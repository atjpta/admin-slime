<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PlusIcon } from '@lucide/vue'
import { playerService } from '@/services/api/player.service'
import { RouteName } from '@/router'
import VButton from '@/components/ui/btn/v-button.vue'
import VSection from '@/components/ui/section/v-section.vue'
import VDetailSkeleton from '@/components/ui/skeleton/v-detail-skeleton.vue'
import { useDetailLoading } from '@/composables/useDetailLoading'
import PlayerInfoCard from './components/player-info-card.vue'
import PlayerStatsSummary from './components/player-stats-summary.vue'
import PlayerStatTable from './components/player-stat-table.vue'
import PlayerEquipmentTable from './components/player-equipment-table.vue'
import PlayerInventoryTable from './components/player-inventory-table.vue'
import PlayerAddInventoryModal from './components/player-add-inventory-modal.vue'
import PlayerMailTab from './components/player-mail-tab.vue'
import type {
  PlayerDetail,
  PlayerInventory,
  PlayerEquipment,
  PlayerStatsResult,
} from '@/interfaces/player.interface'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const id = route.params.id as string

const { loading, withLoading } = useDetailLoading()
const showAddInventoryModal = ref(false)

async function refreshInventory() {
  inventory.value = await playerService.getInventory(id)
}

async function refreshEquipment() {
  equipment.value = await playerService.getEquipment(id)
}

async function refreshStats() {
  statsResult.value = await playerService.getStats(id)
}

async function onEquipmentUpdated() {
  await Promise.all([refreshEquipment(), refreshInventory(), refreshStats()])
}
const detail = ref<PlayerDetail | null>(null)
const inventory = ref<PlayerInventory | null>(null)
const equipment = ref<PlayerEquipment | null>(null)
const statsResult = ref<PlayerStatsResult | null>(null)

type Tab = 'stats-summary' | 'stats' | 'equipment' | 'inventory' | 'mails'
const activeTab = ref<Tab>('stats-summary')

const tabs = computed(() => [
  { key: 'stats-summary' as Tab, label: t('player.detail.statsSummary') },
  { key: 'stats' as Tab, label: t('player.detail.stats'), count: detail.value?.stats.length ?? 0 },
  {
    key: 'equipment' as Tab,
    label: t('player.detail.equipment'),
    count: equipment.value?.slots.length ?? 0,
  },
  {
    key: 'inventory' as Tab,
    label: t('player.detail.inventory'),
    count: inventory.value?.items.length ?? 0,
  },
  { key: 'mails' as Tab, label: t('player.mails') },
])

function sectionOrder(tab: Tab) {
  return activeTab.value === tab ? 'order-first' : 'order-last'
}

onMounted(() =>
  withLoading(async () => {
    try {
      ;[detail.value, inventory.value, equipment.value, statsResult.value] = await Promise.all([
        playerService.getById(id),
        playerService.getInventory(id),
        playerService.getEquipment(id),
        playerService.getStats(id),
      ])
    } catch {
      router.replace({ name: RouteName.Players })
    }
  })
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <VDetailSkeleton v-if="loading" />

    <template v-else-if="detail">
      <!-- Info -->
      <PlayerInfoCard :detail="detail" />

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
            <div
              :class="sectionOrder('stats-summary')"
              class="rounded-box border-base-200 border p-4"
            >
              <PlayerStatsSummary
                v-if="statsResult"
                :stats="statsResult.stats"
                :stats-detail="statsResult.statsDetail"
              />
            </div>

            <div :class="sectionOrder('stats')" class="rounded-box border-base-200 border p-4">
              <VSection :title="t('player.detail.stats')">
                <div class="overflow-x-auto">
                  <PlayerStatTable :stats="detail.stats" />
                </div>
              </VSection>
            </div>

            <div :class="sectionOrder('equipment')" class="rounded-box border-base-200 border p-4">
              <VSection :title="t('player.detail.equipment')">
                <div class="overflow-x-auto">
                  <PlayerEquipmentTable
                    :equipment="equipment"
                    :inventory="inventory"
                    :player-id="id"
                    @updated="onEquipmentUpdated"
                  />
                </div>
              </VSection>
            </div>

            <div :class="sectionOrder('inventory')" class="rounded-box border-base-200 border p-4">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-base-content/70 text-sm font-semibold">
                  {{ t('player.detail.inventory') }}
                </p>
                <VButton
                  :icon="PlusIcon"
                  class="btn-primary btn-sm"
                  @click="showAddInventoryModal = true"
                >
                  <span class="hidden sm:inline">{{ t('player.addItem.title') }}</span>
                </VButton>
              </div>
              <PlayerInventoryTable
                :inventory="inventory"
                :player-id="id"
                @removed="refreshInventory"
              />
            </div>

            <div :class="sectionOrder('mails')" class="rounded-box border-base-200 border p-4">
              <p class="text-base-content/70 mb-3 text-sm font-semibold">{{ t('player.mails') }}</p>
              <PlayerMailTab :player-id="id" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <PlayerAddInventoryModal
    :open="showAddInventoryModal"
    :player-id="id"
    @close="showAddInventoryModal = false"
    @added="refreshInventory"
  />
</template>
