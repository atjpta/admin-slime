<script setup lang="ts">
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVueTable, getCoreRowModel } from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import VTable from '@/components/ui/table/v-table.vue'
import { StatSource, StatType } from '@/enums/stat.enum'
import type { PlayerStat } from '@/interfaces/player.interface'

const props = defineProps<{ stats: PlayerStat[] }>()
const { t } = useI18n()

const columns = computed<ColumnDef<PlayerStat>[]>(() => [
  {
    accessorKey: 'stat',
    header: t('player.detail.stat'),
    cell: ({ getValue }) =>
      h('span', { class: 'badge badge-outline font-mono text-xs' }, t(`stat.key.${getValue<string>()}`)),
  },
  {
    accessorKey: 'type',
    header: t('player.detail.statType'),
    cell: ({ getValue }) =>
      h('span', { class: 'text-base-content/60 text-sm' }, t(`stat.type.${getValue<string>()}`)),
  },
  {
    id: 'value',
    header: t('player.detail.statValue'),
    cell: ({ row }) =>
      `${row.original.value}${row.original.type === StatType.PERCENT ? '%' : ''}`,
    meta: { align: 'center' },
  },
  {
    accessorKey: 'source',
    header: t('player.detail.statSource'),
    cell: ({ getValue }) => {
      const v = getValue<string>()
      return h(
        'span',
        { class: ['badge badge-sm', v === StatSource.EQUIPMENT ? 'badge-info' : 'badge-ghost'] },
        t(`stat.source.${v}`),
      )
    },
  },
])

const table = useVueTable({
  get data() { return props.stats },
  get columns() { return columns.value },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <VTable :table="table" />
</template>
