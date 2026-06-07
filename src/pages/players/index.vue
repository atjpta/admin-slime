<script setup lang="ts">
import { h, ref, reactive, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { RouteName } from '@/router'
import type { ColumnDef } from '@tanstack/vue-table'
import { EyeIcon } from '@lucide/vue'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VPlayerStatusBadge from '@/components/ui/badge/v-player-status-badge.vue'
import VPlayerRoleBadge from '@/components/ui/badge/v-player-role-badge.vue'
import { playerService } from '@/services/api/player.service'
import { PlayerStatus, PlayerRole } from '@/enums/player.enum'
import type { Player, PlayerFilter } from '@/interfaces/player.interface'
import { formatDate } from '@/utils/format'

const { t } = useI18n()
const router = useRouter()

const players = ref<Player[]>([])
const total = ref(0)
const filter = reactive({ status: '' as PlayerStatus | '', role: '' as PlayerRole | '' })

const columns = computed<ColumnDef<Player>[]>(() => [
  {
    accessorKey: 'name',
    header: t('player.columns.name'),
    cell: ({ row }) => row.getValue('name') ?? '-',
    meta: { minWidth: 'w-36' },
  },
  {
    id: 'email',
    accessorFn: (row) => row.user?.email ?? '-',
    header: t('player.columns.email'),
    cell: ({ row }) => {
      const email = row.getValue<string>('email')
      if (!email || email === '-') return '-'
      return h(
        'button',
        {
          class: 'text-primary hover:underline cursor-pointer text-sm',
          onClick: () => router.push({ name: RouteName.Users, query: { search: email } }),
        },
        email
      )
    },
    meta: { minWidth: 'w-52' },
  },
  {
    accessorKey: 'role',
    header: t('player.columns.role'),
    cell: ({ row }) => h(VPlayerRoleBadge, { value: row.getValue<PlayerRole>('role') }),
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    accessorKey: 'status',
    header: t('player.columns.status'),
    cell: ({ row }) => h(VPlayerStatusBadge, { value: row.getValue<PlayerStatus>('status') }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'createdAt',
    header: t('player.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    accessorKey: 'updatedAt',
    header: t('player.columns.updatedAt'),
    cell: ({ row }) => formatDate(row.getValue('updatedAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-16' },
    cell: ({ row }) =>
      h(VButton, {
        icon: EyeIcon,
        class: 'btn-ghost text-info',
        onClick: () =>
          router.push({ name: RouteName.PlayerDetail, params: { id: row.original._id } }),
      }),
  },
])

function resetFilters() {
  filter.status = ''
  filter.role = ''
}

async function fetchPlayers() {
  const params: PlayerFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
    role: filter.role || undefined,
  }
  const res = await playerService.index(params)
  players.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: players,
  total,
  filters: {
    status: toRef(filter, 'status'),
    role: toRef(filter, 'role'),
  },
  onFetch: fetchPlayers,
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('player.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('player.subtitle') }}</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar
          v-model="search"
          :active-filters="!!(filter.status || filter.role)"
          @reset="resetFilters"
        >
          <template #filters>
            <VSelectFilter
              v-model="filter.status"
              :label="t('player.columns.status')"
              :enum-values="PlayerStatus"
              i18n-key="player.status"
            />
            <VSelectFilter
              v-model="filter.role"
              :label="t('player.columns.role')"
              :enum-values="PlayerRole"
              i18n-key="player.role"
            />
          </template>
        </VTableToolbar>

        <VTable :table="table" :loading="loading" />

        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>
</template>
