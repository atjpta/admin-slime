<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { XIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { playerService } from '@/services/api/player.service'
import type { Player } from '@/interfaces/player.interface'

const props = defineProps<{
  mode: 'all' | 'custom'
  modelValue: Player[]
}>()

const emit = defineEmits<{
  'update:mode': ['all' | 'custom']
  'update:modelValue': [Player[]]
}>()

const { t } = useI18n()
const searchText = ref('')
const searchResults = ref<Player[]>([])
const searching = ref(false)
const searched = ref(false)
let debounce: ReturnType<typeof setTimeout> | null = null

watch(searchText, (val) => {
  if (debounce) clearTimeout(debounce)
  if (!val.trim()) {
    searchResults.value = []
    searched.value = false
    return
  }
  debounce = setTimeout(doSearch, 400)
})

async function doSearch() {
  searching.value = true
  searched.value = false
  const res = await playerService.index({ search: searchText.value.trim(), page: 1, limit: 20 })
  searchResults.value = res.items
  searched.value = true
  searching.value = false
}

function selectPlayer(p: Player) {
  if (props.modelValue.some((s) => s._id === p._id)) return
  emit('update:modelValue', [...props.modelValue, p])
}

function removePlayer(id: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((p) => p._id !== id)
  )
}
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">{{ t('mail.fields.receivers') }}</legend>

    <div class="mb-3 flex gap-4">
      <label class="label cursor-pointer gap-2">
        <input
          :checked="mode === 'all'"
          type="radio"
          class="radio radio-sm radio-primary"
          @change="emit('update:mode', 'all')"
        />
        <span class="label-text">{{ t('mail.fields.receiversAll') }}</span>
      </label>
      <label class="label cursor-pointer gap-2">
        <input
          :checked="mode === 'custom'"
          type="radio"
          class="radio radio-sm radio-primary"
          @change="emit('update:mode', 'custom')"
        />
        <span class="label-text">{{ t('mail.fields.receiversCustom') }}</span>
      </label>
    </div>

    <template v-if="mode === 'custom'">
      <div v-if="modelValue.length" class="mb-3 flex flex-wrap gap-2">
        <div v-for="p in modelValue" :key="p._id" class="badge badge-neutral gap-1 pr-1">
          <span class="text-xs">{{ p.name }}</span>
          <button type="button" class="btn btn-ghost btn-xs btn-circle size-4" @click="removePlayer(p._id)">
            <XIcon class="size-3" />
          </button>
        </div>
      </div>

      <input
        v-model="searchText"
        type="text"
        class="input input-bordered input-sm w-full"
        :placeholder="t('player.columns.name') + '...'"
      />

      <div class="mt-1 min-h-20">
        <div v-if="searching" class="flex justify-center py-4">
          <span class="loading loading-spinner loading-sm"></span>
        </div>
        <template v-else-if="searched">
          <div v-if="searchResults.length" class="max-h-44 overflow-y-auto">
            <table class="table-sm table">
              <tbody>
                <tr
                  v-for="p in searchResults"
                  :key="p._id"
                  class="hover cursor-pointer"
                  :class="{
                    'pointer-events-none opacity-40': modelValue.some((s) => s._id === p._id),
                  }"
                  @click="selectPlayer(p)"
                >
                  <td class="font-medium">{{ p.name }}</td>
                  <td class="text-base-content/50 text-xs">{{ p.user?.email }}</td>
                  <td>
                    <VButton type="button" class="btn-primary btn-xs" @click.stop="selectPlayer(p)">
                      {{ t('common.select') }}
                    </VButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-base-content/40 py-4 text-center text-sm">{{ t('table.empty') }}</p>
        </template>
        <p v-else class="text-base-content/30 py-4 text-center text-sm">
          {{ t('gacha.rewards.searchHint') }}
        </p>
      </div>

      <p v-if="modelValue.length" class="text-base-content/50 mt-1 text-xs">
        {{ t('mail.receiversCount', { n: modelValue.length }) }}
      </p>
    </template>
  </fieldset>
</template>
