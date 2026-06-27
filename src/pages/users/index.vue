<script setup lang="ts">
import { h, ref, reactive, toRef, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { RouteName } from '@/router'
import type { ColumnDef } from '@tanstack/vue-table'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import { userService } from '@/services/api/user.service'
import { UserStatus } from '@/enums/user.enum'
import type { User, UserFilter } from '@/interfaces/user.interface'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VUserStatusBadge from '@/components/ui/badge/v-user-status-badge.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { SquarePenIcon, ExternalLink } from '@lucide/vue'
import UserEditModal from './components/user-edit-modal.vue'
import { formatDate } from '@/utils/format'

const { t } = useI18n()
const router = useRouter()

const users = ref<User[]>([])
const total = ref(0)
const editModal = useTemplateRef<{ open: (u: User) => void }>('editModal')
const filter = reactive({ status: '' as UserStatus | '' })

const columns = computed<ColumnDef<User>[]>(() => [
  {
    accessorKey: 'email',
    header: t('user.columns.email'),
    cell: ({ row }) => row.getValue('email') ?? '-',
    meta: { minWidth: 'w-52' },
  },
  {
    accessorKey: 'status',
    header: t('user.columns.status'),
    cell: ({ row }) => h(VUserStatusBadge, { value: row.getValue<UserStatus>('status') }),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    meta: { align: 'center', minWidth: 'w-40' },
    accessorKey: 'createdAt',
    header: t('user.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  {
    meta: { align: 'center', minWidth: 'w-40' },
    accessorKey: 'updatedAt',
    header: t('user.columns.updatedAt'),
    cell: ({ row }) => formatDate(row.getValue('updatedAt')),
  },
  {
    id: 'players',
    header: t('user.columns.players'),
    meta: { align: 'center', minWidth: 'w-32' },
    cell: ({ row }) =>
      h(
        VButton,
        {
          icon: ExternalLink,
          iconRight: true,
          class: 'btn-ghost btn-sm text-secondary',
          onClick: () =>
            router.push({ name: RouteName.Players, query: { search: row.original.email } }),
        },
        () => t('user.viewPlayers')
      ),
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-16' },
    cell: ({ row }) =>
      h(VButton, {
        icon: SquarePenIcon,
        class: 'btn-ghost text-primary',
        onClick: () => editModal.value?.open(row.original),
      }),
  },
])

async function fetchUsers() {
  const params: UserFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
  }
  const res = await userService.index(params)
  users.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: users,
  total,
  filters: { status: toRef(filter, 'status') },
  onFetch: fetchUsers,
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('user.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('user.subtitle') }}</p>
      </div>
    </div>

    <!-- Card -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar
          v-model="search"
          :active-filters="!!filter.status"
          @reset="filter.status = ''"
        >
          <template #filters>
            <VSelectFilter
              v-model="filter.status"
              :label="t('user.columns.status')"
              :enum-values="UserStatus"
              i18n-key="user.status"
            />
          </template>
        </VTableToolbar>

        <VTable :table="table" :loading="loading" />

        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <UserEditModal ref="editModal" @updated="fetchUsers" />
</template>
