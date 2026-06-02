<script setup lang="ts" generic="TData">
import { ref, watch, onUnmounted } from 'vue'
import { FlexRender } from '@tanstack/vue-table'
import type { Table, Row } from '@tanstack/vue-table'
import { useI18n } from 'vue-i18n'
import { AlertCircleIcon } from '@lucide/vue'

interface Props {
  table: Table<TData>
  loading?: boolean
  skeletonRows?: number
  skeletonDelay?: number
  showIndex?: boolean
}

const {
  table,
  loading,
  skeletonRows = 5,
  skeletonDelay = 300,
  showIndex = true,
} = defineProps<Props>()

function rowNumber(rowIndex: number) {
  const { pageIndex, pageSize } = table.getState().pagination
  return pageIndex * pageSize + rowIndex + 1
}
const { t } = useI18n()

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }
function cellAlign(align?: 'left' | 'center' | 'right') {
  return alignClass[align ?? 'left']
}

// Row có status = 'inactive' → tô nền đỏ nhạt (theo convention status chung của các resource)
function isInactive(row: Row<TData>) {
  return (row.original as { status?: string })?.status === 'inactive'
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
  <div class="overflow-x-auto">
    <!--
      table-fixed: width column do header quyết định, không bị content hay
      skeleton làm lệch → header không bị nhảy vị trí
    -->
    <table
      class="table-zebra [&_tbody_tr:nth-child(even)]:bg-base-200 table w-full min-w-160 table-fixed"
    >
      <thead>
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-if="showIndex"
            class="text-base-content/50 w-12 text-center text-xs font-semibold tracking-wide uppercase"
          >
            #
          </th>
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colspan="header.colSpan"
            :class="[
              'text-base-content/50 text-xs font-semibold tracking-wide whitespace-nowrap uppercase',
              cellAlign(header.column.columnDef.meta?.align),
              header.column.columnDef.meta?.minWidth,
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
            <td v-if="showIndex" class="text-center">
              <div class="skeleton mx-auto h-4 w-6 rounded" />
            </td>
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

        <!-- Data rows  -->
        <template v-else-if="table.getRowModel().rows.length">
          <tr
            v-for="(row, rowIndex) in table.getRowModel().rows"
            :key="row.id"
            class="hover:bg-primary/5! hover:[&>td:first-child]:border-l-primary transition-colors [&>td:first-child]:border-l-2 [&>td:first-child]:border-l-transparent"
            :class="[
              { 'pointer-events-none opacity-50': loading },
              isInactive(row) && 'bg-error/5! [&>td:first-child]:border-l-error',
            ]"
          >
            <td v-if="showIndex" class="text-base-content/40 w-12 text-center text-sm">
              {{ rowNumber(rowIndex) }}
            </td>
            <td
              class="whitespace-nowrap"
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
          <td
            :colspan="table.getAllColumns().length + (showIndex ? 1 : 0)"
            class="py-20 text-center"
          >
            <AlertCircleIcon class="text-warning mx-auto mb-3 size-12" />
            <p class="text-base-content/40 text-sm">{{ t('table.empty') }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
