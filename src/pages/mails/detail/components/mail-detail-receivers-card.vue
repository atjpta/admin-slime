<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchIcon } from '@lucide/vue'
import type { MailDetail } from '@/interfaces/mail.interface'

const props = defineProps<{ mail: MailDetail }>()
const { t } = useI18n()

const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.mail.receivers
  return props.mail.receivers.filter(
    (r) => r.name.toLowerCase().includes(q) || r._id.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <label class="input input-sm input-bordered flex items-center gap-2">
        <SearchIcon class="text-base-content/40 size-4 shrink-0" />
        <input
          v-model="search"
          type="text"
          class="grow"
          :placeholder="t('common.search')"
        />
      </label>

    <div class="max-h-64 overflow-y-auto">
      <p v-if="!filtered.length" class="text-base-content/40 py-4 text-center text-sm">
        {{ t('common.noResults') }}
      </p>
      <table v-else class="table-sm table w-full">
        <tbody>
          <tr v-for="r in filtered" :key="r._id" class="hover">
            <td class="font-medium">{{ r.name }}</td>
            <td class="text-base-content/40 font-mono text-xs">{{ r._id }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
