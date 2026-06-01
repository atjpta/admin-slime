<script setup lang="ts" generic="TData">
import { ref, watch, onUnmounted } from 'vue'
import { FlexRender } from '@tanstack/vue-table'
import type { Table } from '@tanstack/vue-table'
import { useI18n } from 'vue-i18n'
import { AlertCircle, AlertCircleIcon, InboxIcon } from '@lucide/vue'

interface Props {
  table: Table<TData>
  loading?: boolean
  skeletonRows?: number
  skeletonDelay?: number
}

const { table, loading, skeletonRows = 5, skeletonDelay = 300 } = defineProps<Props>()
const { t } = useI18n()

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }
function cellAlign(align?: 'left' | 'center' | 'right') {
  return alignClass[align ?? 'left']
}

// Chỉ show skeleton sau skeletonDelay ms để tránh flash khi load nhanh
const showSkeleton = ref(false)
let skeletonTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => loading && !table.getRowModel().rows.length,
  (shouldShow) => {
    clearTimeout(skeletonTimer)
    if (shouldShow) {
      skeletonTimer = setTimeout(() => {
        showSkeleton.value = true
      }, skeletonDelay)
    } else {
      showSkeleton.value = false
    }
  },
  { immediate: true }
)

onUnmounted(() => clearTimeout(skeletonTimer))
</script>

<template>
  <div class="overflow-hidden">
    <!--
      table-fixed: width column do header quyết định, không bị content hay
      skeleton làm lệch → header không bị nhảy vị trí
    -->
    <table class="table-zebra [&_tbody_tr:nth-child(even)]:bg-primary/5 table w-full table-fixed">
      <thead>
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colspan="header.colSpan"
            :class="[
              'text-base-content/50 text-xs font-semibold tracking-wide uppercase',
              cellAlign(header.column.columnDef.meta?.align),
            ]"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- Skeleton: chỉ lần đầu chưa có data, hiện sau delay để tránh flash -->
        <template v-if="loading">
          <tr
            v-for="i in skeletonRows"
            :key="i"
            class="[&>td:first-child]:border-l-2 [&>td:first-child]:border-l-transparent"
          >
            <td v-for="(header, idx) in table.getHeaderGroups()[0]?.headers" :key="header.id">
              <div
                class="skeleton h-4 rounded"
                :class="[
                  idx % 3 === 0 ? 'w-3/4' : idx % 3 === 1 ? 'w-full' : 'w-1/2',
                  cellAlign(header.column.columnDef.meta?.align) === 'text-center' ? 'mx-auto' : '',
                ]"
              />
            </td>
          </tr>
        </template>

        <!-- Data rows — giữ nguyên khi refresh, chỉ dim nhẹ -->
        <template v-else-if="table.getRowModel().rows.length">
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="hover:bg-base-200/40 hover:[&>td:first-child]:border-l-primary transition-colors [&>td:first-child]:border-l-2 [&>td:first-child]:border-l-transparent"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="cellAlign(cell.column.columnDef.meta?.align)"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </template>

        <!-- Empty state -->
        <tr v-else-if="!loading">
          <td :colspan="table.getAllColumns().length" class="py-20 text-center">
            <AlertCircleIcon class="text-warning mx-auto mb-3 size-12" />
            <p class="text-base-content/40 text-sm">{{ t('table.empty') }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
