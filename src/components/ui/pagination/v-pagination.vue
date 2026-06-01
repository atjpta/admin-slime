<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { paginationListLimit } from '@/constants/pagination.constants'

interface Props {
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
}

const { page, pageSize, total, pageSizes = paginationListLimit } = defineProps<Props>()
const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()

const { t } = useI18n()

const totalPages = computed(() => Math.max(1, Math.ceil(total / pageSize)))
const from = computed(() => (total === 0 ? 0 : (page - 1) * pageSize + 1))
const to = computed(() => Math.min(page * pageSize, total))

const pageNumbers = computed(() => {
  const tp = totalPages.value
  const pages: (number | '...')[] = []

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (page > 3) pages.push('...')
  for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) {
    pages.push(i)
  }
  if (page < tp - 2) pages.push('...')
  pages.push(tp)
  return pages
})

function onPageSizeChange(e: Event) {
  emit('update:pageSize', Number((e.target as HTMLSelectElement).value))
  emit('update:page', 1)
}
</script>

<template>
  <div class="flex items-end justify-between gap-3">
    <div class="text-base-content/60 flex items-center gap-2 text-sm">
      <select class="select select-sm select-bordered" :value="pageSize" @change="onPageSizeChange">
        <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
      </select>
    </div>
    <div>
      <div class="text-base-content/50 text-right text-xs italic">
        {{ t('table.showing', { from, to, total }) }}
      </div>

      <div class="join">
        <button
          class="join-item btn btn-sm"
          :disabled="page <= 1"
          @click="emit('update:page', page - 1)"
        >
          «
        </button>

        <template v-for="p in pageNumbers" :key="String(p) + '_' + pageNumbers.indexOf(p)">
          <button
            v-if="p !== '...'"
            class="join-item btn btn-sm"
            :class="{ 'btn-active': p === page }"
            @click="emit('update:page', p as number)"
          >
            {{ p }}
          </button>
          <button v-else class="join-item btn btn-sm btn-disabled pointer-events-none">…</button>
        </template>

        <button
          class="join-item btn btn-sm"
          :disabled="page >= totalPages"
          @click="emit('update:page', page + 1)"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>
