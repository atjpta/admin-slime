<script setup lang="ts">
import { h, ref, reactive, toRef, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { EyeIcon } from '@lucide/vue'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VMailStatusBadge from '@/components/ui/badge/v-mail-status-badge.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { playerService } from '@/services/api/player.service'
import { MailStatus } from '@/enums/mail.enum'
import { formatDate } from '@/utils/format'
import type { PlayerMailAdminItem } from '@/interfaces/player.interface'
import PlayerMailDetailModal from './player-mail-detail-modal.vue'

const props = defineProps<{ playerId: string }>()
const { t } = useI18n()

const mailTypeOptions = computed(() => [
  { value: 'received', label: t('player.mailReceived') },
  { value: 'sent', label: t('player.mailSent') },
])

const items = ref<PlayerMailAdminItem[]>([])
const total = ref(0)
const filter = reactive({
  status: '' as MailStatus | '',
  type: '' as 'sent' | 'received' | '',
})
const mailDetailModal = useTemplateRef<{ open: (item: PlayerMailAdminItem) => void }>('mailDetailModal')

const columns = computed<ColumnDef<PlayerMailAdminItem>[]>(() => [
  {
    id: 'title',
    header: t('mail.columns.title'),
    cell: ({ row }) => row.original.mail?.title?.vi || '-',
    meta: { minWidth: 'w-48' },
  },
  {
    id: 'sender',
    header: t('player.mailFrom'),
    cell: ({ row }) => row.original.sender?.name ?? t('mail.source.system'),
    meta: { minWidth: 'w-28' },
  },
  {
    id: 'receiver',
    header: t('player.mailTo'),
    cell: ({ row }) => row.original.receiver?.name ?? '-',
    meta: { minWidth: 'w-28' },
  },
  {
    accessorKey: 'status',
    header: t('mail.columns.status'),
    cell: ({ row }) => h(VMailStatusBadge, { value: row.getValue<MailStatus>('status') }),
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    accessorKey: 'claimedAt',
    header: t('player.detail.claimedAt'),
    cell: ({ row }) => formatDate(row.getValue('claimedAt')),
    meta: { align: 'center', minWidth: 'w-36' },
  },
  {
    accessorKey: 'createdAt',
    header: t('mail.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-36' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-12' },
    cell: ({ row }) =>
      h(VButton, {
        icon: EyeIcon,
        class: 'btn-ghost text-primary',
        onClick: () => mailDetailModal.value?.open(row.original),
      }),
  },
])

async function fetchMails() {
  const res = await playerService.getMails(props.playerId, {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
    type: filter.type || undefined,
  })
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  filters: {
    status: toRef(filter, 'status'),
    type: toRef(filter, 'type'),
  },
  onFetch: fetchMails,
})

const hasActiveFilters = computed(() => !!filter.status || !!filter.type)

function resetFilters() {
  filter.status = ''
  filter.type = ''
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <VTableToolbar v-model="search" :active-filters="hasActiveFilters" @reset="resetFilters">
      <template #filters>
        <VSelectFilter
          v-model="filter.type"
          :label="t('mail.columns.source')"
          :options="mailTypeOptions"
        />
        <VSelectFilter
          v-model="filter.status"
          :label="t('mail.columns.status')"
          :enum-values="MailStatus"
          i18n-key="player.mailStatus"
        />
      </template>
    </VTableToolbar>
    <VTable :table="table" :loading="loading" />
    <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
  </div>

  <PlayerMailDetailModal ref="mailDetailModal" />
</template>
