<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import { itemService } from '@/services/api/item.service'
import { ItemSource, ItemStatus, ItemType } from '@/enums/item.enum'
import type { Item } from '@/interfaces/item.interface'

export interface SelectedItem {
  itemId: string
  itemCode: string
  quantity: number
  source: string
}

const emit = defineEmits<{ select: [SelectedItem] }>()
const { t } = useI18n()

const searchCode = ref('')
const results = ref<Item[]>([])
const loading = ref(false)
const searched = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(searchCode, (val) => {
  if (timer) clearTimeout(timer)
  if (!val.trim()) {
    results.value = []
    searched.value = false
    return
  }
  timer = setTimeout(doSearch, 400)
})

async function doSearch() {
  loading.value = true
  searched.value = false
  const params = { search: searchCode.value.trim(), page: 1, limit: 20, status: ItemStatus.ACTIVE }
  const [consumable, material] = await Promise.all([
    itemService.index({ ...params, type: ItemType.CONSUMABLE }),
    itemService.index({ ...params, type: ItemType.MATERIAL }),
  ])
  const seen = new Set<string>()
  results.value = [...consumable.items, ...material.items].filter((i) => {
    if (seen.has(i._id)) return false
    seen.add(i._id)
    return true
  })
  searched.value = true
  loading.value = false
}

function selectItem(item: Item) {
  emit('select', {
    itemId: item._id,
    itemCode: item.code,
    quantity: 1,
    source: ItemSource.SYSTEM,
  })
  searchCode.value = ''
  results.value = []
  searched.value = false
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <input
      v-model="searchCode"
      type="text"
      class="input input-bordered input-xs w-full font-mono"
      :placeholder="t('gacha.rewards.searchPlaceholder')"
    />
    <div v-if="loading" class="flex justify-center py-2">
      <span class="loading loading-spinner loading-xs"></span>
    </div>
    <template v-else-if="searched">
      <div v-if="results.length" class="border-base-300 rounded-box max-h-40 overflow-y-auto border">
        <div
          v-for="item in results"
          :key="item._id"
          class="hover:bg-base-200 flex cursor-pointer items-center gap-2 px-2 py-1.5"
          @click="selectItem(item)"
        >
          <span class="min-w-0 flex-1 font-mono text-xs">{{ item.code }}</span>
          <VItemTypeBadge :value="item.type" class="badge-xs" />
          <VItemRarityBadge :value="item.rarity" class="badge-xs" />
        </div>
      </div>
      <p v-else class="text-base-content/40 py-1 text-center text-xs">{{ t('table.empty') }}</p>
    </template>
    <p v-else-if="!searchCode" class="text-base-content/30 py-1 text-center text-xs">
      {{ t('gacha.rewards.searchHint') }}
    </p>
  </div>
</template>
