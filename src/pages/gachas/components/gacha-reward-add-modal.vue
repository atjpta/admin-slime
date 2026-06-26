<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import VButton from '@/components/ui/btn/v-button.vue'
import VItemTypeBadge from '@/components/ui/badge/v-item-type-badge.vue'
import VItemRarityBadge from '@/components/ui/badge/v-item-rarity-badge.vue'
import { itemService } from '@/services/api/item.service'
import { ItemStatus } from '@/enums/item.enum'
import type { Item } from '@/interfaces/item.interface'
import type { GachaRewardItem } from '@/interfaces/gacha.interface'

interface Props {
  open: boolean
  existingIds: string[]
}

const { open, existingIds } = defineProps<Props>()
const emit = defineEmits<{
  close: []
  add: [item: GachaRewardItem]
}>()

const { t } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

const searchCode = ref('')
const results = ref<Item[]>([])
const searching = ref(false)
const searched = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => open,
  (v) => {
    if (v) {
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
      searchCode.value = ''
      results.value = []
      searched.value = false
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }
)

watch(searchCode, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    results.value = []
    searched.value = false
    return
  }
  debounceTimer = setTimeout(search, 400)
})

async function search() {
  searching.value = true
  searched.value = false
  const res = await itemService.index({
    search: searchCode.value.trim(),
    page: 1,
    limit: 20,
    status: ItemStatus.ACTIVE,
  })
  results.value = res.items
  searched.value = true
  searching.value = false
}

function close() {
  emit('close')
  dialogRef.value?.close()
}

function select(item: Item) {
  emit('add', item)
  close()
}

function isAdded(code: string) {
  return existingIds.includes(code)
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-2xl">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('gacha.rewards.addTitle') }}</h3>

      <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
        <input
          v-model="searchCode"
          type="text"
          :placeholder="t('gacha.rewards.searchPlaceholder')"
          class="input input-bordered mb-4 w-full"
        />

        <div class="min-h-32">
          <div v-if="searching" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-md"></span>
          </div>

          <template v-else-if="searched">
            <div v-if="results.length" class="overflow-y-auto">
              <table class="table-sm table">
                <thead>
                  <tr>
                    <th>{{ t('item.columns.code') }}</th>
                    <th>{{ t('item.columns.type') }}</th>
                    <th>{{ t('item.columns.rarity') }}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in results" :key="item._id" class="hover">
                    <td class="font-mono text-sm">{{ item.code }}</td>
                    <td><VItemTypeBadge :value="item.type" /></td>
                    <td><VItemRarityBadge :value="item.rarity" /></td>
                    <td>
                      <VButton
                        v-if="!isAdded(item.code)"
                        class="btn-primary btn-xs"
                        @click="select(item)"
                      >
                        {{ t('gacha.rewards.addBtn') }}
                      </VButton>
                      <span v-else class="text-base-content/40 text-xs">
                        {{ t('gacha.rewards.alreadyAdded') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-base-content/40 py-8 text-center text-sm">
              {{ t('table.empty') }}
            </p>
          </template>

          <p v-else class="text-base-content/30 py-8 text-center text-sm">
            {{ t('gacha.rewards.searchHint') }}
          </p>
        </div>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="close">{{ t('common.close') }}</VButton>
      </div>
    </div>
  </dialog>
</template>
